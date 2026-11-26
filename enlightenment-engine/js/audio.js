/*
 * The Enlightenment Engine - audio.js
 *
 * All sound is synthesised live with the Web Audio API. No files, no libraries, no network.
 * Classic script: works from file://. Defines window.EE.audio (API in docs/audio-spec.md).
 *
 *   EE.audio.unlock()            EE.audio.setMuted(bool) / isMuted()     EE.audio.setVolume(0..1)
 *   EE.audio.setAct(1..4)        EE.audio.setAmbient(bool)
 *   EE.audio.press({onBreath, streak})            EE.audio.play(name, opts)
 *   EE.audio.hum(seconds, smooth)                 EE.audio.swell()
 *   EE.audio.ending('coexist' | 'merge' | 'sit')  EE.audio.silence(seconds)
 *
 * Everything is a silent no-op before unlock() and never throws. (setAct/setAmbient/setMuted/setVolume given
 * before unlock() are remembered and take effect at unlock().)
 *
 * After an ending() the world stays hushed: press/play/hum/swell/ending/silence do nothing until setAct() is
 * called again (setVolume/setMuted still work; setAmbient is remembered and applied by that setAct()).
 * silence(s) fades everything out, bed included; presses and one-shots sound again as soon as the fade is over,
 * the bed returns on the next setAct() or setAmbient(true).
 *
 * Underscore members (_debug) are for the review page and tests only; the game must not use them.
 *
 * Signal flow
 *   voices -> fxBus --------\
 *   bed layers -> bedBus ----+-> gate -> master -> compressor -> soft safety clip -> out
 *   voices -> send -> reverb /
 *
 * Housekeeping: every sound is a "voice" (a bag of nodes with a known end time). Voices are stopped and
 * disconnected by a sweep after they end, so nothing accumulates over a long session. No sound relies on
 * wall-clock timers to start or stop; timing is Web Audio automation (a 250 ms timer only runs the sweep and
 * schedules ambient drips / pad chords a little ahead).
 */
(function (global) {
  'use strict';

  var EE = global.EE = global.EE || {};
  var api = {};
  EE.audio = api;

  // ------------------------------------------------------------------------------------------ pitch

  var D4 = 293.6648;                       // the key of the game is D major pentatonic: D E F# A B
  var PENT = [0, 2, 4, 7, 9];

  // pentatonic index -> Hz. 0 = D4, 1 = E4, 2 = F#4, 3 = A4, 4 = B4, 5 = D5 ... -1 = B3, -2 = A3, -5 = D3
  function pent(i) {
    var o = Math.floor(i / 5), d = ((i % 5) + 5) % 5;
    return D4 * Math.pow(2, (12 * o + PENT[d]) / 12);
  }
  // semitones from D4 -> Hz
  function hz(s) { return D4 * Math.pow(2, s / 12); }

  // The on-breath melody: 16 notes, mostly steps, three leaps, ends on D4 so it loops forever.
  // (pentatonic indices; see pent())
  //   F#4 A4 F#4 E4 | D4 E4 F#4 B4 | A4 F#4 A4 D5 | B4 A4 E4 D4
  var PHRASE = [2, 3, 2, 1, 0, 1, 2, 4, 3, 2, 3, 5, 4, 3, 1, 0];
  var VEL    = [0.92, 0.80, 0.86, 0.74, 0.90, 0.80, 0.86, 0.96, 0.86, 0.76, 0.88, 1.00, 0.90, 0.80, 0.74, 0.92];

  // Measured loudness of the choir per melody pitch (the vowel formants favour some notes): evened out to within ~1 dB.
  var CHOIR_COMP = { 0: 1.13, 1: 1.35, 2: 0.92, 3: 0.81, 4: 0.85, 5: 1.06 };

  function melody(streak) {
    var i = (((streak | 0) % 16) + 16) % 16;
    return { f: pent(PHRASE[i]), vel: VEL[i], comp: CHOIR_COMP[PHRASE[i]] || 1 };
  }

  // ------------------------------------------------------------------------------------------ small utils

  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function num(x, d) { x = +x; return isFinite(x) ? x : d; }

  // ------------------------------------------------------------------------------------------ state

  var ctx = null, unlocked = false, failed = false;
  var N = {};                         // the shared graph
  var vol = 0.8, muted = false, act = 1, ambientOn = false, hushed = false;
  var voices = [];                    // every live voice
  var layers = {};                    // live ambient layers by name
  var sched = { drip: 0, padNext: 0, padIdx: 0, swellUntil: 0, hushedAt: -99 };
  var rate = { join: -99, type: -99 };
  var noiseWhite = null, noisePink = null, irBuf = null;
  var tickTimer = null, gestureBound = false;
  var lastError = null;

  function now() { return ctx.currentTime; }

  var DROP = { dropped: true };      // thrown inside a sound to abandon it quietly (too many voices at once)

  function safe(fn, fallback) {
    return function () {
      try { return fn.apply(this, arguments); }
      catch (e) { if (e !== DROP) lastError = e; return fallback; }
    };
  }

  // ------------------------------------------------------------------------------------------ node helpers

  // Everything a voice creates goes through mk() so the sweep can stop and disconnect it.
  function mk(v, kind) { var n = ctx[kind](); v.nodes.push(n); return n; }

  function G(v, val) { var n = mk(v, 'createGain'); n.gain.value = val; return n; }

  function BQ(v, type, f, q) {
    var n = mk(v, 'createBiquadFilter');
    n.type = type; n.frequency.value = f;
    if (q != null) n.Q.value = q;
    return n;
  }

  function OSC(v, type, f, t0, t1) {
    var o = mk(v, 'createOscillator');
    o.type = type; o.frequency.value = f;
    o.start(t0);
    if (t1 != null && isFinite(t1)) { o.stop(t1); if (t1 > v.end) v.end = t1; }
    else v.end = Infinity;
    return o;
  }

  function NOISE(v, buf, t0, t1) {
    var s = mk(v, 'createBufferSource');
    s.buffer = buf; s.loop = true;
    s.start(t0, Math.random() * buf.duration * 0.9);
    if (t1 != null && isFinite(t1)) { s.stop(t1); if (t1 > v.end) v.end = t1; }
    else v.end = Infinity;
    return s;
  }

  function PAN(v, dest, p) {
    if (!ctx.createStereoPanner) return dest;
    var n = mk(v, 'createStereoPanner');
    n.pan.value = clamp(p, -1, 1);
    n.connect(dest);
    return n;
  }

  // Sustained shape: soft exponential rise over atk, hold dur, fall over rel (audible tail ~ rel).
  function tone(v, dest, type, f, t0, level, atk, dur, rel, cents) {
    if (f > 15000) return null;
    var end = t0 + atk + dur + rel * 2.4;
    var o = OSC(v, type, f, t0, end);
    if (cents) o.detune.value = cents;
    var g = G(v, 0), p = g.gain;
    p.setValueAtTime(0, t0);
    p.setTargetAtTime(level, t0, atk / 3);
    p.setTargetAtTime(0, t0 + atk + dur, rel / 3);
    o.connect(g); g.connect(dest);
    return o;
  }

  // Struck shape: short linear attack, exponential decay (time constant tau).
  function pluck(v, dest, type, f, t0, level, atk, tau, cents) {
    if (f > 15000) return null;
    var end = t0 + atk + tau * 8;
    var o = OSC(v, type, f, t0, end);
    if (cents) o.detune.value = cents;
    var g = G(v, 0), p = g.gain;
    p.setValueAtTime(0, t0);
    p.linearRampToValueAtTime(level, t0 + atk);
    p.setTargetAtTime(0, t0 + atk, tau);
    o.connect(g); g.connect(dest);
    return o;
  }

  // Noise tick/burst through a band-pass.
  function noiseBurst(v, dest, t0, level, freq, q, atk, tau) {
    var end = t0 + atk + tau * 8;
    var s = NOISE(v, noiseWhite, t0, end);
    var bp = BQ(v, 'bandpass', freq, q);
    var g = G(v, 0), p = g.gain;
    p.setValueAtTime(0, t0);
    p.linearRampToValueAtTime(level, t0 + atk);
    p.setTargetAtTime(0, t0 + atk, tau);
    s.connect(bp); bp.connect(g); g.connect(dest);
    return bp;
  }

  // A bell/chime: sine + a slow-beating twin + two quiet inharmonic partials. This is the heart of the game.
  function chime(v, dest, t0, f, level, tau) {
    tau = tau || 0.7;
    pluck(v, dest, 'sine', f, t0, level, 0.013, tau);
    pluck(v, dest, 'sine', f * 1.0015, t0, level * 0.22, 0.02, tau * 0.9);   // ~0.5 Hz beating: a slow shimmer in the tail
    pluck(v, dest, 'sine', f * 2.756, t0, level * 0.14, 0.007, tau * 0.42);
    pluck(v, dest, 'sine', f * 5.404, t0, level * 0.05, 0.005, tau * 0.2);
  }

  // Octave-up shimmer that blooms slightly after the note.
  function shimmerTail(v, dest, t0, f, level) {
    pluck(v, dest, 'sine', f * 2, t0, level, 0.05, 0.85);
    pluck(v, dest, 'sine', f * 2 * 1.004, t0 + 0.03, level * 0.7, 0.06, 0.8);
  }

  // ------------------------------------------------------------------------------------------ choir voice

  var VOWELS = {
    ah: [[800, 5, 1.0], [1150, 6, 0.45], [2800, 8, 0.12]],
    oh: [[460, 5, 1.0], [850, 6, 0.35], [2700, 8, 0.08]],
    oo: [[330, 4, 1.0], [800, 6, 0.18], [2600, 8, 0.04]]
  };
  var CHOIR_K = 3.0;    // makes choir(level) peak roughly equal to `level`

  // Detuned saws through vowel formants plus a sine body, with a little vibrato. A soft, wordless group of singers.
  function choir(v, dest, t0, f, o) {
    var n = o.saws || 4, atk = o.atk || 0.3, dur = o.dur == null ? 0.5 : o.dur, rel = o.rel || 1.2;
    var level = o.level || 0.05, spread = o.spread == null ? 9 : o.spread;
    var end = t0 + atk + dur + rel * 2.4;

    var env = G(v, 0), p = env.gain;
    p.setValueAtTime(0, t0);
    p.setTargetAtTime(level, t0, atk / 3);
    p.setTargetAtTime(0, t0 + atk + dur, rel / 3);
    env.connect(dest);

    var mix = G(v, CHOIR_K / n);
    var vow = VOWELS[o.vowel || 'ah'], i;
    for (i = 0; i < vow.length; i++) {
      var bp = BQ(v, 'bandpass', vow[i][0], vow[i][1]);
      var fg = G(v, vow[i][2]);
      mix.connect(bp); bp.connect(fg); fg.connect(env);
    }

    var lfo = OSC(v, 'sine', rnd(4.8, 5.8), t0, end);
    var lg = G(v, o.vib == null ? 5 : o.vib);               // vibrato depth in cents
    lfo.connect(lg);
    for (i = 0; i < n; i++) {
      var s = OSC(v, 'sawtooth', f, t0, end);
      s.detune.value = (n > 1 ? ((i / (n - 1)) * 2 - 1) * spread : 0) + rnd(-2, 2);
      lg.connect(s.detune);
      s.connect(mix);
    }

    var body = OSC(v, 'sine', f, t0, end);                  // warm fundamental
    var bg = G(v, o.body == null ? 0.32 : o.body);
    body.connect(bg); bg.connect(env);

    if (o.noise) {                                          // breath of the group
      var ns = NOISE(v, noiseWhite, t0, end);
      var nb = BQ(v, 'bandpass', o.noiseFreq || 1300, 1.3);
      var ng = G(v, o.noise);
      ns.connect(nb); nb.connect(ng); ng.connect(env);
    }
  }

  // ------------------------------------------------------------------------------------------ buffers

  function makeLoopNoise(seconds, pink) {
    var sr = ctx.sampleRate, L = Math.floor(sr * seconds), xf = Math.floor(sr * 0.3), tot = L + xf;
    var raw = new Float32Array(tot), i;
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (i = 0; i < tot; i++) {
      var w = Math.random() * 2 - 1;
      if (pink) {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
        raw[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else raw[i] = w;
    }
    var buf = ctx.createBuffer(1, L, sr), d = buf.getChannelData(0);
    for (i = 0; i < L; i++) {
      if (i < xf) {                                       // equal-power loop-seam crossfade
        var a = (i / xf) * Math.PI / 2;
        d[i] = raw[i] * Math.sin(a) + raw[L + i] * Math.cos(a);
      } else d[i] = raw[i];
    }
    return buf;
  }

  function makeIR() {
    var sr = ctx.sampleRate, len = Math.floor(sr * 3.4), pre = Math.floor(sr * 0.018);
    var buf = ctx.createBuffer(2, len, sr);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch), lp = 0;
      for (var i = 0; i < len; i++) {
        var t = i / sr;
        var e = Math.exp(-6.9 * t / 3.0);                 // ~3 s to -60 dB
        var a = 0.35 + 0.6 * Math.min(1, t / 2.0);        // darker as it dies: the room swallows the highs
        lp = a * lp + (1 - a) * (Math.random() * 2 - 1);
        var s = i < pre ? 0 : (i < pre + 300 ? (i - pre) / 300 : 1);
        d[i] = lp * e * s;
      }
    }
    return buf;
  }

  function wireReverb() {
    var old = N.conv;
    if (old) { try { N.revHP.disconnect(old); } catch (e) {} try { old.disconnect(); } catch (e2) {} }
    N.conv = ctx.createConvolver();
    N.conv.normalize = true;
    N.conv.buffer = irBuf;
    N.revHP.connect(N.conv);
    N.conv.connect(N.revRet);
  }

  // ------------------------------------------------------------------------------------------ graph

  function build() {
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) throw new Error('no AudioContext');
    ctx = new AC();                                       // default latency: presses must answer at once

    var mkG = function (v) { var g = ctx.createGain(); g.gain.value = v; return g; };
    N.gate = mkG(1);
    N.master = mkG(0);
    N.fxBus = mkG(1);
    N.bedBus = mkG(1);
    N.revIn = mkG(1);
    N.revRet = mkG(0.9);
    N.revHP = ctx.createBiquadFilter(); N.revHP.type = 'highpass'; N.revHP.frequency.value = 160; N.revHP.Q.value = 0.5;
    N.comp = ctx.createDynamicsCompressor();
    N.comp.threshold.value = -20; N.comp.knee.value = 18; N.comp.ratio.value = 2.5;
    N.comp.attack.value = 0.012; N.comp.release.value = 0.32;
    N.shaper = ctx.createWaveShaper();                    // last-resort soft clip: linear below 0.6, never above ~0.98
    var curve = new Float32Array(2049);
    for (var i = 0; i < curve.length; i++) {
      var x = (i / 1024) - 1, ax = Math.abs(x);
      var y = ax <= 0.6 ? ax : 0.6 + 0.38 * Math.tanh((ax - 0.6) / 0.38);
      curve[i] = x < 0 ? -y : y;
    }
    N.shaper.curve = curve;
    try { N.shaper.oversample = '2x'; } catch (e2) {}

    N.fxBus.connect(N.gate);
    N.bedBus.connect(N.gate);
    N.revRet.connect(N.gate);
    N.revIn.connect(N.revHP);
    N.gate.connect(N.master);
    N.master.connect(N.comp);
    N.comp.connect(N.shaper);
    N.shaper.connect(ctx.destination);

    noiseWhite = makeLoopNoise(2, false);
    noisePink = makeLoopNoise(6, true);
    irBuf = makeIR();
    wireReverb();
    N.master.gain.value = masterTarget();
  }

  function masterTarget() { return muted ? 0 : 0.9 * vol * vol; }

  function glide(param, target, tc) {                    // from wherever it is, toward target
    var t = now();
    try { param.cancelScheduledValues(t); } catch (e) {}
    param.setValueAtTime(param.value, t);
    param.setTargetAtTime(target, t, Math.max(0.001, tc));
  }

  // ------------------------------------------------------------------------------------------ voices

  function newVoice(kind, o) {
    o = o || {};
    var v = { kind: kind, nodes: [], end: 0, released: false, ending: !!o.ending, layer: o.layer || null, pan: null };
    var out = v.out = G(v, o.gain == null ? 1 : o.gain);      // o.gain: the voice's place in the mix
    var tail = out;
    if (o.pan != null && ctx.createStereoPanner) {
      var p = mk(v, 'createStereoPanner');
      p.pan.value = clamp(o.pan, -1, 1);
      out.connect(p); tail = p; v.pan = p;
    }
    tail.connect(o.bus || N.fxBus);
    if (o.wet > 0) {
      var s = G(v, o.wet);
      tail.connect(s); s.connect(N.revIn);
    }
    voices.push(v);
    return v;
  }

  function stopVoice(v, t) {                              // only ever shortens a voice
    if (t >= v.end) return;
    v.end = t;
    for (var i = 0; i < v.nodes.length; i++) {
      var n = v.nodes[i];
      if (n.stop) { try { n.stop(t); } catch (e) {} }
    }
  }

  function release(v, sec) {                              // fade a voice out and end it
    if (v.released) return;
    v.released = true;
    var t = now(), p = v.out.gain;
    try {
      p.cancelScheduledValues(t);
      p.setValueAtTime(p.value, t);
      p.setTargetAtTime(0, t, Math.max(0.005, sec / 5));
    } catch (e) {}
    stopVoice(v, t + sec + 0.05);
  }

  function destroy(v) {
    for (var i = 0; i < v.nodes.length; i++) {
      var n = v.nodes[i];
      if (n.stop) { try { n.stop(); } catch (e) {} }
      try { n.disconnect(); } catch (e2) {}
    }
    v.nodes.length = 0;
  }

  function sweep() {
    var t = now();
    for (var i = voices.length - 1; i >= 0; i--) {
      var v = voices[i];
      if (v.end + 0.2 < t) { destroy(v); voices.splice(i, 1); }
    }
  }

  // Polyphony: at most ~12 press voices and ~28 sounding voices in all; the oldest is released first.
  function capVoices(kind) {
    var press = 0, total = 0, firstPress = null, first = null;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v.released || v.ending || v.kind === 'bed' || v.kind === 'drip' || v.kind === 'pad') continue;
      total++;
      if (!first) first = v;
      if (v.kind === 'press') { press++; if (!firstPress) firstPress = v; }
    }
    if (kind === 'press' && press >= 12 && firstPress) release(firstPress, 0.08);
    else if (total >= 28 && first) release(first, 0.08);
  }

  function voice(kind, o) {
    sweep();
    capVoices(kind);
    if (voices.length > 100) throw DROP;                  // a synchronous flood: drop the sound, never pile up nodes
    return newVoice(kind, o);
  }

  // ------------------------------------------------------------------------------------------ gate (global fades)

  function gateHold(t) {
    var p = N.gate.gain;
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
    return p;
  }

  // ------------------------------------------------------------------------------------------ main press

  var ACT_NOTE_LEVEL = 0.2;      // peak of an on-breath chime before the master

  function pressOn(streak, together) {
    var t = now() + 0.004, m = melody(streak), f = m.f, vel = m.vel;
    var shim = clamp((streak - 4) / 20, 0, 1);            // octave shimmer grows with the streak
    var v;

    if (act === 4) {
      v = voice('press', { wet: 0.55 });
      var L = PAN(v, v.out, -0.55), R = PAN(v, v.out, 0.55);
      choir(v, L, t, f, { saws: 4, spread: 11, atk: 0.32, dur: 0.5, rel: 1.9, level: 0.2 * vel * m.comp, vowel: 'ah' });
      choir(v, R, t + 0.035, f, { saws: 4, spread: 13, atk: 0.4, dur: 0.45, rel: 2.0, level: 0.17 * vel * m.comp, vowel: 'oh' });
      pluck(v, v.out, 'sine', f * 2, t + 0.12, 0.022 + 0.06 * shim, 0.12, 0.9);       // the octave shimmer, always a little
      pluck(v, v.out, 'sine', f * 2 * 1.003, t + 0.16, 0.016 + 0.045 * shim, 0.14, 0.85);
      return;
    }

    v = voice('press', { wet: 0.4, pan: rnd(-0.06, 0.06) });
    chime(v, v.out, t, f, ACT_NOTE_LEVEL * vel * (act === 2 ? 0.88 : 1), 0.7);
    if (shim > 0) shimmerTail(v, v.out, t + 0.07, f, 0.06 * shim * vel);

    if (act === 2 || (together && act === 3)) {          // Hum answers: a teal blip a fifth above, 120 ms later (a breath together)
      var a = PAN(v, v.out, 0.38);
      pluck(v, a, 'sine', f * 1.5, t + 0.12, 0.042 * vel, 0.014, 0.2);
      pluck(v, a, 'sine', f * 3.0, t + 0.12, 0.008 * vel, 0.01, 0.1);
      pluck(v, a, 'triangle', f * 1.5 * 1.002, t + 0.125, 0.011 * vel, 0.02, 0.16);
    } else if (act === 3) {                               // people answer: a soft many-voices "ahh"
      choir(v, v.out, t, f, { saws: 5, spread: 16, atk: 0.14, dur: 0.18, rel: 1.0, level: 0.1 * vel, vowel: 'ah',
                              noise: 0.03, vib: 7 });
    }
  }

  function pressOff() {
    var t = now() + 0.004, v, f, bp, g, s;
    if (act === 1) {                                      // wooden fish: a short hollow "tok"
      v = voice('press', { wet: 0.12, pan: rnd(-0.1, 0.1), gain: 0.55 });
      var k = rnd(0.94, 1.06);
      noiseBurst(v, v.out, t, 0.9, 1150 * k, 5, 0.001, 0.011);
      noiseBurst(v, v.out, t, 0.35, 2300 * k, 9, 0.001, 0.008);
      var o = OSC(v, 'sine', 215 * k, t, t + 0.4);
      o.frequency.setValueAtTime(215 * k, t);
      o.frequency.exponentialRampToValueAtTime(150 * k, t + 0.07);
      g = G(v, 0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.003); g.gain.setTargetAtTime(0, t + 0.003, 0.035);
      o.connect(g); g.connect(v.out);
    } else if (act === 2) {                               // a soft data blip
      v = voice('press', { wet: 0.18, pan: rnd(-0.3, 0.3) });
      f = pent(pick([7, 8, 9, 10]));
      var lp = BQ(v, 'lowpass', 3200, 0.5); lp.connect(v.out);
      var b = OSC(v, 'triangle', f, t, t + 0.35);
      b.frequency.setValueAtTime(f, t);
      b.frequency.exponentialRampToValueAtTime(f * 1.045, t + 0.045);
      g = G(v, 0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.045, t + 0.006); g.gain.setTargetAtTime(0, t + 0.006, 0.032);
      b.connect(g); g.connect(lp);
    } else if (act === 3) {                               // a muffled crowd "huh": a room breathing out
      v = voice('press', { wet: 0.3, pan: rnd(-0.2, 0.2), gain: 0.75 });
      s = NOISE(v, noiseWhite, t, t + 0.4);
      var c = 650 * rnd(0.88, 1.12);
      bp = BQ(v, 'bandpass', c * 1.2, 1.1);
      bp.frequency.setValueAtTime(c * 1.2, t);
      bp.frequency.exponentialRampToValueAtTime(c * 0.8, t + 0.16);
      var lp3 = BQ(v, 'lowpass', 1800, 0.5);
      g = G(v, 0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.055); g.gain.setTargetAtTime(0, t + 0.055, 0.04);
      s.connect(bp); bp.connect(lp3); lp3.connect(g); g.connect(v.out);
    } else {                                              // a calm, ethereal choir note
      v = voice('press', { wet: 0.5, pan: rnd(-0.3, 0.3) });
      f = pent(pick([0, 2, 3, 0, 2]));
      choir(v, v.out, t, f, { saws: 3, spread: 8, atk: 0.1, dur: 0.1, rel: 0.75, level: 0.1, vowel: 'oo' });
    }
  }

  // ------------------------------------------------------------------------------------------ one-shots

  function warm(v, dest, f, t, level, tau) {              // a soft, warm pluck: sine + triangle through a lowpass
    var lp = BQ(v, 'lowpass', Math.min(5000, f * 3.4), 0.5);
    lp.connect(dest);
    pluck(v, lp, 'sine', f, t, level, 0.008, tau);
    pluck(v, lp, 'triangle', f, t, level * 0.4, 0.008, tau * 0.8);
  }

  function glass(v, dest, f, t, level, tau) {             // glassy ping for arpeggios
    pluck(v, dest, 'sine', f, t, level, 0.006, tau);
    pluck(v, dest, 'sine', f * 2.41, t, level * 0.2, 0.004, tau * 0.45);
    pluck(v, dest, 'sine', f * 4.17, t, level * 0.07, 0.003, tau * 0.25);
  }

  function bell(v, dest, f, t, level, tau) {              // a larger bell with stretched partials
    var P = [[1, 1, 1], [2.0, 0.28, 0.6], [2.76, 0.2, 0.4], [4.07, 0.1, 0.25], [5.4, 0.05, 0.15]];
    for (var i = 0; i < P.length; i++) pluck(v, dest, 'sine', f * P[i][0], t, level * P[i][1], 0.012, tau * P[i][2]);
  }

  function thump(v, t, f, level) {
    var o = OSC(v, 'sine', f, t, t + 1.1);
    o.frequency.setValueAtTime(f * 1.4, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    var g = G(v, 0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + 0.014); g.gain.setTargetAtTime(0, t + 0.014, 0.09);
    o.connect(g); g.connect(v.out);
    pluck(v, v.out, 'triangle', f * 2, t, level * 0.45, 0.012, 0.06);
  }

  var SHOTS = {
    buy: function (t) {                                   // small warm two-note rise
      var v = voice('shot', { wet: 0.28, gain: 0.38 });
      warm(v, v.out, pent(0), t, 0.2, 0.28);
      warm(v, v.out, pent(3), t + 0.12, 0.23, 0.42);
    },

    unlock: function (t) {                                // a new thing appears: one soft bell
      var v = voice('shot', { wet: 0.55, gain: 0.63 });
      bell(v, v.out, pent(8), t, 0.2, 0.9);
    },

    thought: function (t) {                               // a stray thought: a small wobbling pluck, slightly comic
      var v = voice('shot', { wet: 0.22, pan: rnd(-0.4, 0.4) });
      var f = pent(3) * rnd(0.97, 1.03);
      var o = OSC(v, 'triangle', f, t, t + 1.2);
      o.frequency.setValueAtTime(f * 0.88, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      var lfo = OSC(v, 'sine', 9, t, t + 1.2), lg = G(v, 38);
      lfo.connect(lg); lg.connect(o.detune);
      var lp = BQ(v, 'lowpass', 3000, 1);
      lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.22);
      var g = G(v, 0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.006); g.gain.setTargetAtTime(0, t + 0.006, 0.09);
      o.connect(lp); lp.connect(g); g.connect(v.out);
    },

    pass: function (t) {                                  // a thought is let go: a soft upward two-note lift and a breath of air
      var v = voice('shot', { wet: 0.5, gain: 0.3, pan: rnd(-0.25, 0.25) });   // lighter than `buy`, nothing triumphant
      warm(v, v.out, pent(2), t, 0.11, 0.34);
      warm(v, v.out, pent(4), t + 0.17, 0.12, 0.62);
      var n = NOISE(v, noisePink, t, t + 1.5), bp = BQ(v, 'bandpass', 1500, 0.7), g = G(v, 0);
      bp.frequency.setValueAtTime(1100, t); bp.frequency.exponentialRampToValueAtTime(2300, t + 0.9);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.32); g.gain.setTargetAtTime(0, t + 0.36, 0.3);
      n.connect(bp); bp.connect(g); g.connect(v.out);
    },

    follow: function (t) {                                // a thought is followed: the pluck descending, dissolving
      var v = voice('shot', { wet: 0.6, pan: rnd(-0.4, 0.4) });
      var f = pent(3) * rnd(0.97, 1.03);
      var o = OSC(v, 'triangle', f, t, t + 2.6);
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.8);
      var lfo = OSC(v, 'sine', 6.5, t, t + 2.6), lg = G(v, 55);
      lfo.connect(lg); lg.connect(o.detune);
      var lp = BQ(v, 'lowpass', 2600, 1);
      lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(260, t + 1.2);
      var g = G(v, 0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.19, t + 0.01); g.gain.setTargetAtTime(0, t + 0.01, 0.26);
      o.connect(lp); lp.connect(g); g.connect(v.out);
    },

    orb: function (t) {                                   // an epiphany: a bright glassy arpeggio up the pentatonic
      var v = voice('shot', { wet: 0.5, gain: 0.65 });
      for (var i = 0; i < 6; i++) {
        var p = PAN(v, v.out, i % 2 ? 0.25 : -0.25);
        glass(v, p, pent(5 + i), t + i * 0.105, 0.1 + i * 0.012, i === 5 ? 0.9 : 0.3);
      }
    },

    lotus: function (t) {                                 // golden lotus: orb's bigger sister
      var v = voice('shot', { wet: 0.62, gain: 0.63 });
      var idx = [-5, -2, 0, 2, 3, 5, 7, 8, 10, 12];
      for (var i = 0; i < idx.length; i++) {
        var p = PAN(v, v.out, ((i % 3) - 1) * 0.3);
        glass(v, p, pent(idx[i]), t + i * 0.13, 0.11 + i * 0.006, i === idx.length - 1 ? 1.4 : 0.42);
      }
      var cv = voice('shot', { wet: 0.7, gain: 0.63 });
      choir(cv, cv.out, t + 0.3, pent(-5), { saws: 3, spread: 9, atk: 0.7, dur: 0.7, rel: 1.8, level: 0.09, vowel: 'ah' });
      choir(cv, cv.out, t + 0.3, pent(-2), { saws: 3, spread: 9, atk: 0.8, dur: 0.6, rel: 1.8, level: 0.07, vowel: 'oh' });
      bell(cv, cv.out, pent(10), t + 1.3, 0.12, 1.5);
    },

    bead: function (t) {                                  // achievement: one wooden bead click + a tiny chime
      var v = voice('shot', { wet: 0.3, pan: rnd(-0.15, 0.15) });
      noiseBurst(v, v.out, t, 0.6, 2600, 6, 0.001, 0.006);
      var o = OSC(v, 'sine', 1250, t, t + 0.2);
      o.frequency.setValueAtTime(1250, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
      var g = G(v, 0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.002); g.gain.setTargetAtTime(0, t + 0.002, 0.014);
      o.connect(g); g.connect(v.out);
      chime(v, v.out, t + 0.075, pent(11), 0.075, 0.28);
    },

    card: function (t) {                                  // a decision card opens: low soft gong, short
      var v = voice('shot', { wet: 0.35, gain: 0.37 });
      var lp = BQ(v, 'lowpass', 1800, 0.5); lp.connect(v.out);
      var f = pent(-5), P = [[1, 1, 0.5], [1.52, 0.5, 0.4], [2.07, 0.34, 0.3], [2.63, 0.2, 0.22], [3.3, 0.1, 0.16]];
      for (var i = 0; i < P.length; i++) pluck(v, lp, 'sine', f * P[i][0], t, 0.34 * P[i][1], 0.035, P[i][2]);
      pluck(v, lp, 'sine', f * 1.003, t, 0.12, 0.04, 0.45);
    },

    plain: function (t) {                                 // the truth told: a clear open fifth, bare, brave
      var v = voice('shot', { wet: 0.18, gain: 0.5 });
      tone(v, v.out, 'sine', pent(0), t, 0.22, 0.045, 0.55, 1.15);
      tone(v, v.out, 'sine', pent(3), t + 0.01, 0.2, 0.045, 0.5, 1.1);
    },

    smoothed: function (t) {                              // smoothed over: a sweet chord that is a little too sweet
      var v = voice('shot', { wet: 0.62, gain: 0.33 });
      var notes = [0, 4, 7, 11, 14];                      // D F# A C# E   (a rich major ninth)
      var vib = OSC(v, 'sine', 5.6, t, t + 5), vg = G(v, 7); vib.connect(vg);
      for (var i = 0; i < notes.length; i++) {
        var f = hz(notes[i]), lvl = 0.085 - i * 0.008;
        var a = tone(v, v.out, 'sine', f, t, lvl, 0.09, 0.75, 1.5, -6);
        var b = tone(v, v.out, 'sine', f, t + 0.004, lvl * 0.8, 0.09, 0.75, 1.5, 6);
        var c = tone(v, v.out, 'triangle', f, t, lvl * 0.28, 0.1, 0.7, 1.4, 0);
        if (a) vg.connect(a.detune); if (b) vg.connect(b.detune); if (c) vg.connect(c.detune);
      }
      var top = tone(v, v.out, 'sine', hz(24), t + 0.05, 0.03, 0.2, 0.7, 1.4, 0);      // glassy D6 on top, a bit much
      if (top) vg.connect(top.detune);
      // the faint detuned undertone, 300 ms late
      var lp = BQ(v, 'lowpass', 420, 0.5); lp.connect(v.out);
      tone(v, lp, 'triangle', hz(-12) * 0.986, t + 0.3, 0.07, 0.5, 0.9, 1.2, 0);
      tone(v, lp, 'sine', hz(-24) * 0.989, t + 0.32, 0.06, 0.6, 0.8, 1.2, 0);
    },

    knot: function (t) {                                  // a knot tightens: a low minor-second rub that swells and stops
      var v = voice('shot', { wet: 0.18, gain: 0.4 });
      var lp = BQ(v, 'lowpass', 520, 0.7);
      var g = G(v, 0), p = g.gain;
      p.setValueAtTime(0, t);
      p.setTargetAtTime(0.3, t, 0.38);
      p.setValueAtTime(0.3 * (1 - Math.exp(-1.1 / 0.38)), t + 1.1);
      p.linearRampToValueAtTime(0, t + 1.2);
      var a = OSC(v, 'triangle', hz(-24), t, t + 1.3);
      var b = OSC(v, 'triangle', hz(-23), t, t + 1.3);    // a minor second above
      var c = OSC(v, 'sine', hz(-12), t, t + 1.3), d = OSC(v, 'sine', hz(-11), t, t + 1.3);
      var cg = G(v, 0.25);
      a.connect(lp); b.connect(lp); c.connect(cg); d.connect(cg); cg.connect(lp);
      lp.connect(g); g.connect(v.out);
    },

    cut: function (t) {                                   // confession: three snapping strings, then an open clear tone
      var v = voice('shot', { wet: 0.4, gain: 0.42 });
      var tw = [[pent(8), 0], [pent(7), 0.3], [pent(5), 0.64]];
      for (var i = 0; i < tw.length; i++) {
        var tt = t + tw[i][1], f = tw[i][0];
        var lp = BQ(v, 'lowpass', 3000, 0.7); lp.connect(PAN(v, v.out, (i - 1) * 0.3));
        var o = OSC(v, 'sawtooth', f, tt, tt + 0.9);
        o.frequency.setValueAtTime(f * 1.07, tt);
        o.frequency.exponentialRampToValueAtTime(f, tt + 0.03);
        o.frequency.exponentialRampToValueAtTime(f * 0.97, tt + 0.5);
        var g = G(v, 0);
        g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.11, tt + 0.002); g.gain.setTargetAtTime(0, tt + 0.002, 0.085);
        o.connect(g); g.connect(lp);
        pluck(v, lp, 'sine', f * 2, tt, 0.06, 0.002, 0.07);
        noiseBurst(v, v.out, tt, 0.35, 4200, 2, 0.001, 0.006);
      }
      // then an open, clear tone: D A D, no vibrato, a little air
      var s = t + 1.05;
      tone(v, v.out, 'sine', pent(0), s, 0.17, 0.5, 0.7, 0.85);
      tone(v, v.out, 'sine', pent(3), s + 0.02, 0.15, 0.5, 0.7, 0.85);
      tone(v, v.out, 'sine', pent(5), s + 0.04, 0.12, 0.55, 0.65, 0.85);
      tone(v, v.out, 'sine', pent(0) * 0.5, s, 0.12, 0.6, 0.6, 0.85);
    },

    wake: function (t) {                                  // Hum wakes: the chime stutters like a skipping record, then hums
      var v = voice('shot', { wet: 0.2, gain: 0.5 });
      var f = pent(3), n = 8, per = 0.25;
      for (var k = 0; k < n; k++) {
        var tk = t + k * per, fk = f * (1 - 0.0045 * k);
        var gate = G(v, 0), p = gate.gain;                 // each repeat is cut short: the record sticks
        p.setValueAtTime(0, tk);
        p.linearRampToValueAtTime(1, tk + 0.004);
        p.setValueAtTime(1, tk + 0.17);
        p.linearRampToValueAtTime(0, tk + 0.19);
        gate.connect(v.out);
        chime(v, gate, tk, fk, 0.2 * (1 - 0.03 * k), 0.5);
        noiseBurst(v, v.out, tk, 0.05, 3000, 1.5, 0.001, 0.004);    // the needle's tick
      }
      humAt(t + 1.85, 2.6, false);
    },

    alert: function (t) {                                 // two low soft pulses, more heartbeat than siren
      var v = voice('shot', { wet: 0.1, gain: 0.55 });
      var lp = BQ(v, 'lowpass', 420, 0.6);
      lp.connect(v.out);
      var keep = v.out; v.out = lp;                        // thump() writes to v.out
      thump(v, t, 62, 0.34);
      thump(v, t + 0.34, 55, 0.27);
      v.out = keep;
    },

    join: function (t) {                                  // someone joins: a tiny soft tick (rate-limited)
      if (t - rate.join < 0.125) return;
      rate.join = t;
      var v = voice('shot', { wet: 0.25, pan: rnd(-0.7, 0.7) });
      noiseBurst(v, v.out, t, 0.12, rnd(1700, 3800), 4, 0.001, 0.003);
      pluck(v, v.out, 'sine', pent(pick([8, 9, 10, 11, 12])), t, 0.03, 0.002, 0.03);
    },

    broadcast: function (t) {                             // one enormous slow bell with a long tail
      var v = voice('shot', { wet: 0.72, gain: 0.36 });
      var lp = BQ(v, 'lowpass', 4200, 0.5); lp.connect(v.out);
      var f = pent(-5);                                    // D3
      var P = [[0.5, 0.55, 2.7], [1, 1, 2.6], [1.5, 0.42, 2.2], [2, 0.5, 1.8], [2.52, 0.2, 1.4],
               [3, 0.2, 1.2], [4, 0.14, 0.9], [5.04, 0.07, 0.6], [1.26, 0.26, 2.0]];
      for (var i = 0; i < P.length; i++) pluck(v, lp, 'sine', f * P[i][0], t, 0.22 * P[i][1], 0.045, P[i][2]);
      pluck(v, lp, 'sine', f * 1.0025, t, 0.18, 0.06, 2.4);   // slow beating
      pluck(v, lp, 'sine', f * 0.5 * 1.002, t, 0.1, 0.07, 2.6);
    },

    milestone: function (t) {                             // a gentle rising three-note figure
      var v = voice('shot', { wet: 0.45, gain: 0.4 });
      var n = [2, 3, 5];
      for (var i = 0; i < n.length; i++) chime(v, v.out, t + i * 0.17, pent(n[i]), 0.2, i === 2 ? 0.8 : 0.5);
    },

    window: function (t) {                                // the gold window opens on the rim: one soft tick (round 2)
      if (t - (rate.win || 0) < 1.5) return;
      rate.win = t;
      var v = voice('shot', { wet: 0.3, gain: 0.45 });
      noiseBurst(v, v.out, t, 0.05, 4200, 4, 0.001, 0.002);
      pluck(v, v.out, 'sine', pent(12), t, 0.014, 0.002, 0.12);
    },

    type: function (t) {                                  // Hum typing: a nearly inaudible tick (rate-limited)
      if (t - rate.type < 0.045) return;
      rate.type = t;
      var v = voice('shot', { wet: 0 });
      noiseBurst(v, v.out, t, 0.04, rnd(2800, 3600), 3, 0.001, 0.0025);
    }
  };

  // ------------------------------------------------------------------------------------------ hum

  function humAt(t, seconds, smooth) {
    seconds = clamp(num(seconds, 2), 0.2, 120);
    for (var i = 0; i < voices.length; i++) {              // one Hum at a time: the old one finishes quickly
      if (voices[i].kind === 'hum' && !voices[i].released && voices[i].t0 <= t) release(voices[i], 0.25);
    }
    var v = voice('hum', { wet: smooth ? 0.42 : 0.3, gain: 0.45 });
    v.t0 = t;
    var atk = Math.min(0.45, seconds * 0.3), rel = Math.min(0.75, seconds * 0.4);
    var dur = Math.max(0.05, seconds - atk - rel), end = t + atk + dur + rel * 2.4;
    var f0 = 123.47;                                       // B2

    // pitch modulators (cents)
    var mods = [];
    function mod(rate_, cents) { var l = OSC(v, 'sine', rate_, t, end), g = G(v, cents); l.connect(g); mods.push(g); }
    if (smooth) { mod(5.0, 3.5); }
    else { mod(4.5 + rnd(-0.2, 0.2), 11); mod(0.9, 6); mod(0.27, 14); }
    function det(o) { for (var j = 0; j < mods.length; j++) mods[j].connect(o.detune); }

    var lp = BQ(v, 'lowpass', smooth ? 2600 : 900, 0.6);
    var env = G(v, 0), p = env.gain;
    p.setValueAtTime(0, t);
    p.setTargetAtTime(0.34, t, atk / 3);
    p.setTargetAtTime(0, t + atk + dur, rel / 3);
    lp.connect(env); env.connect(v.out);

    var H = smooth ? [[1, 1], [2, 0.11], [3, 0.035]] : [[1, 1], [2, 0.3], [3, 0.12], [4, 0.04]];
    for (var h = 0; h < H.length; h++) {
      var o = OSC(v, 'sine', f0 * H[h][0], t, end); det(o);
      var g = G(v, H[h][1]); o.connect(g); g.connect(lp);
    }
    if (smooth) {                                          // the too-glossy part: a chorus-y fifth above, a faint octave
      var lateT = t + Math.min(0.6, atk);
      var fifth = f0 * 1.5;
      [-5, 5].forEach(function (c) {
        var q = OSC(v, 'sine', fifth, t, end); q.detune.value = c; det(q);
        var gg = G(v, 0); gg.gain.setValueAtTime(0, t); gg.gain.setTargetAtTime(0.3, lateT, 0.4);
        q.connect(gg); gg.connect(lp);
      });
      var gloss = OSC(v, 'sine', f0 * 4, t, end); det(gloss);
      var glg = G(v, 0.045); gloss.connect(glg); glg.connect(lp);
    }

    var ns = NOISE(v, noisePink, t, end);                  // the breath
    var nb = BQ(v, 'bandpass', smooth ? 1400 : 850, smooth ? 1.2 : 0.8);
    var ng = G(v, smooth ? 0.05 : 0.15);
    ns.connect(nb); nb.connect(ng); ng.connect(env);

    if (!smooth) {                                         // human: a faint amplitude waver
      var tl = OSC(v, 'sine', 0.6, t, end), tg = G(v, 0.04);
      tl.connect(tg); tg.connect(env.gain);
    }
  }

  // ------------------------------------------------------------------------------------------ swell

  var CHORDS = {
    D: [-12, -5, 0, 4], A: [-17, -10, -5, -1], Bm: [-15, -8, -3, 0], G: [-19, -12, -3, 0],
    wide: [-24, -17, -12, -5, 0, 4, 7, 12]
  };

  function doSwell(t) {
    var sv = voice('swell', { wet: 0.62, gain: 0.75 });
    var p = sv.out.gain;                                   // 10 s of shape: slow rise (x^1.8), hold, let go
    var n = 160, curve = new Float32Array(n), total = 10.6;
    for (var i = 0; i < n; i++) {
      var x = i / (n - 1) * total, y;
      if (x < 7.0) y = Math.pow(x / 7.0, 1.8);
      else if (x < 8.2) y = 1;
      else y = 0.5 * (1 + Math.cos(Math.PI * (x - 8.2) / (total - 8.2)));
      curve[i] = y;
    }
    p.setValueAtTime(0, t);
    p.setValueCurveAtTime(curve, t, total);
    var seq = [['D', 0, 'ah'], ['A', 1.7, 'oh'], ['Bm', 3.4, 'ah'], ['G', 5.1, 'oh'], ['wide', 6.2, 'ah']];
    for (var s = 0; s < seq.length; s++) {
      var name = seq[s][0], t0 = t + seq[s][1], notes = CHORDS[name], wide = name === 'wide';
      for (var k = 0; k < notes.length; k++) {
        var dest = PAN(sv, sv.out, wide ? (k / (notes.length - 1)) * 1.7 - 0.85 : (k / (notes.length - 1)) * 0.8 - 0.4);
        choir(sv, dest, t0, hz(notes[k]), {
          saws: 3, spread: 12, atk: wide ? 0.9 : 1.5, dur: wide ? 1.9 : 0.3, rel: wide ? 2.2 : 1.5,
          level: wide ? 0.11 : 0.14, vowel: (k % 2) ? 'oh' : seq[s][2], vib: 6
        });
      }
    }
    var bv = voice('swell', { wet: 0.7, gain: 0.8 });                 // bells on top; they ring on after the choir lets go
    var bells = [[5.7, 7], [6.5, 10], [7.1, 12], [7.8, 8], [8.5, 10], [9.1, 5]];
    for (var b = 0; b < bells.length; b++) {
      var bp = PAN(bv, bv.out, ((b % 3) - 1) * 0.45);
      bell(bv, bp, pent(bells[b][1]), t + bells[b][0], 0.16, 1.5);
    }
    var bp2 = N.bedBus.gain;                               // duck the bed under it
    bp2.cancelScheduledValues(t); bp2.setValueAtTime(bp2.value, t);
    bp2.setTargetAtTime(0.4, t, 1.6);
    bp2.setTargetAtTime(1, t + 9.5, 2.2);
    sched.swellUntil = t + 10.6;
  }

  // ------------------------------------------------------------------------------------------ ambient bed

  var LAYER_MAP = {          // multiplier per act (index 0 = Act I)
    rain:    [1, 1, 1, 0.8],
    drone:   [1, 1, 1, 0],
    pad:     [0, 0, 0, 1],
    shimmer: [0, 1, 1, 0.8],
    murmur:  [0, 0, 1, 0.8]
  };
  var LAYER_GAIN = { rain: 0.11, drone: 0.28, shimmer: 0.3, murmur: 0.32, pad: 0.17 };   // each layer's place under everything else
  var LAYER_WET = { rain: 0.1, drone: 0.2, pad: 0.45, shimmer: 0.75, murmur: 0.25 };
  var BED_TC = 1.2;          // time constant: ~4 s to cross-fade

  var BUILDERS = {
    rain: function (v) {
      var t = now();
      var n = NOISE(v, noisePink, t), hp = BQ(v, 'highpass', 520, 0.5), lp = BQ(v, 'lowpass', 3500, 0.5);
      var g = G(v, 0.5);
      n.connect(hp); hp.connect(lp); lp.connect(g); g.connect(v.out);
      var l1 = OSC(v, 'sine', 0.045, t), lg1 = G(v, 700); l1.connect(lg1); lg1.connect(lp.frequency);
      var n2 = NOISE(v, noiseWhite, t), bp = BQ(v, 'bandpass', 1900, 0.9), g2 = G(v, 0.1);
      n2.connect(bp); bp.connect(g2); g2.connect(v.out);
      var l2 = OSC(v, 'sine', 0.09, t), lg2 = G(v, 0.07); l2.connect(lg2); lg2.connect(g2.gain);
      sched.drip = t + 0.5;
    },

    drone: function (v) {
      var t = now();
      var lp = BQ(v, 'lowpass', 520, 0.5);
      var g = G(v, 0), l = OSC(v, 'sine', 0.037, t), lg = G(v, 0.25 * 0.04);
      g.gain.value = 0.04;
      l.connect(lg); lg.connect(g.gain);
      lp.connect(g); g.connect(v.out);
      var T = [[hz(-24), 1.0], [hz(-12), 0.62], [hz(-5), 0.12], [hz(0), 0.05]];
      for (var i = 0; i < T.length; i++) {
        var a = OSC(v, 'sine', T[i][0], t), b = OSC(v, 'sine', T[i][0], t);
        b.detune.value = 3 + i; a.detune.value = -2;
        var tg = G(v, T[i][1] * 0.5);
        a.connect(tg); b.connect(tg); tg.connect(lp);
      }
    },

    shimmer: function (v) {
      var t = now(), F = [pent(10), pent(12), pent(13), pent(14), pent(15)];   // D6 F#6 A6 B6 D7, drifting
      for (var i = 0; i < F.length; i++) {
        var base = 0.012;
        var o = OSC(v, 'sine', F[i], t);
        var dl = OSC(v, 'sine', rnd(0.02, 0.05), t), dg = G(v, 9);
        dl.connect(dg); dg.connect(o.detune);
        var g = G(v, base * 0.5);
        var al = OSC(v, 'sine', rnd(0.04, 0.11), t), ag = G(v, base * 0.5);
        al.connect(ag); ag.connect(g.gain);
        o.connect(g); g.connect(PAN(v, v.out, rnd(-0.8, 0.8)));
      }
    },

    murmur: function (v) {
      var t = now();
      var n1 = NOISE(v, noisePink, t), b1 = BQ(v, 'bandpass', 430, 0.8), g1 = G(v, 0.14);
      var n2 = NOISE(v, noisePink, t), b2 = BQ(v, 'bandpass', 1250, 1.4), g2 = G(v, 0.06);
      n1.connect(b1); b1.connect(g1); g1.connect(v.out);
      n2.connect(b2); b2.connect(g2); g2.connect(v.out);
      var br = OSC(v, 'sine', 1 / 6, t), bg1 = G(v, 0.14 * 0.85), bg2 = G(v, 0.06 * 0.85);  // slow breathing at the 6 s breath period
      br.connect(bg1); bg1.connect(g1.gain);
      br.connect(bg2); bg2.connect(g2.gain);
      var sy = OSC(v, 'sine', 3.7, t), sg = G(v, 0.02);                                      // faint syllabic flutter
      sy.connect(sg); sg.connect(g2.gain);
      var dr = OSC(v, 'sine', 0.07, t), dg = G(v, 160);
      dr.connect(dg); dg.connect(b1.frequency);
    },

    pad: function (v) {
      sched.padNext = now() + 0.05;
      sched.padIdx = 0;
    }
  };

  var PAD_CHORDS = [[-12, -5, 4], [-17, -10, -1], [-15, -8, 0], [-19, -12, -3]];    // D  A  Bm  G (low, warm)

  function padChord(L, t0, idx) {
    var notes = PAD_CHORDS[idx % 4], vowel = (idx % 2) ? 'ah' : 'oo';
    for (var k = 0; k < notes.length; k++) {
      var sv = newVoice('pad', { bus: L.v.out, pan: rnd(-0.55, 0.55), layer: L });
      choir(sv, sv.out, t0, hz(notes[k]), { saws: 3, spread: 12, atk: 3.6, dur: 3.2, rel: 3.6, level: 0.08, vowel: vowel, vib: 4 });
    }
    var sub = newVoice('pad', { bus: L.v.out, layer: L });
    tone(sub, sub.out, 'sine', hz(notes[0] - 12), t0, 0.07, 3.6, 3.2, 3.6);
  }

  function dripAt(L, t) {
    var v = newVoice('drip', { bus: L.v.out, pan: rnd(-0.85, 0.85), layer: L });
    var big = Math.random() < 0.18;
    var f = big ? rnd(700, 1300) : rnd(1500, 3800);
    var o = OSC(v, 'sine', f, t, t + 0.4);
    o.frequency.setValueAtTime(f * 0.88, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.02);
    var g = G(v, 0), tau = big ? 0.04 : 0.022, lvl = (big ? 0.06 : 0.04) * rnd(0.5, 1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.002); g.gain.setTargetAtTime(0, t + 0.002, tau);
    o.connect(g); g.connect(v.out);
  }

  function killLayer(name, fadeTc) {
    var L = layers[name];
    if (!L) return;
    delete layers[name];
    var t = now(), p = L.v.out.gain;
    try { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.setTargetAtTime(0, t, fadeTc); } catch (e) {}
    var stopAt = t + fadeTc * 6 + 0.1;
    stopVoice(L.v, stopAt);
    for (var i = 0; i < voices.length; i++) if (voices[i].layer === L) stopVoice(voices[i], stopAt);
  }

  function applyBed() {
    if (!unlocked) return;
    var t = now();
    for (var name in LAYER_MAP) {
      var target = (ambientOn && !hushed) ? LAYER_MAP[name][act - 1] * LAYER_GAIN[name] : 0;
      var L = layers[name];
      if (target > 0) {
        if (!L) {
          var v = newVoice('bed', { bus: N.bedBus, wet: LAYER_WET[name] });
          v.out.gain.value = 0;
          L = layers[name] = { name: name, v: v };
          BUILDERS[name](v);
          v.end = Infinity;
        }
        glide(L.v.out.gain, target, BED_TC);
      } else if (L) killLayer(name, BED_TC);
    }
  }

  // ------------------------------------------------------------------------------------------ endings

  function killAllNow(t, exceptEnding) {                   // schedule every non-ending voice to stop at t
    for (var name in layers) delete layers[name];
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (exceptEnding && v.ending) continue;
      stopVoice(v, t);
    }
  }

  function enterHush(t) {
    hushed = true;
    sched.hushedAt = t;
  }

  function endCoexist() {
    var t = now() + 0.05;
    // the bed thins away
    for (var nm in layers) killLayer(nm, 0.9);
    enterHush(t);
    var g = gateHold(t);
    g.linearRampToValueAtTime(1, t + 0.4);
    g.setValueAtTime(1, t + 12);
    g.setTargetAtTime(0, t + 12, 1.1);
    g.setValueAtTime(0, t + 17);

    // a single warm sustained D major third
    var v = newVoice('ending', { ending: true, wet: 0.5, gain: 0.4 });
    var lp = BQ(v, 'lowpass', 900, 0.5); lp.connect(v.out);
    var T = [[-12, 0.07], [-8, 0.055], [0, 0.028], [4, 0.02]];
    for (var i = 0; i < T.length; i++) {
      tone(v, lp, 'sine', hz(T[i][0]), t, T[i][1], 3.2, 8.8, 3.4, -3);
      tone(v, lp, 'triangle', hz(T[i][0]), t + 0.05, T[i][1] * 0.35, 3.4, 8.6, 3.4, 4);
    }
    // ordinary life over it: a few scattered, slightly out-of-time chimes, each person their own note
    var count = 15, pool = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (var c = 0; c < count; c++) {
      var tt = t + 0.9 + rnd(0, 10.4), cv = newVoice('ending', { ending: true, wet: 0.5, pan: rnd(-0.85, 0.85), gain: 0.7 });
      var f = pent(pick(pool)) * Math.pow(2, rnd(-6, 6) / 1200), lvl = rnd(0.045, 0.12);
      chime(cv, cv.out, tt, f, lvl, rnd(0.6, 1.0));
      if (Math.random() < 0.35) chime(cv, cv.out, tt + rnd(1.8, 2.7), f, lvl * 0.4, 0.7);
    }
  }

  function endMerge() {
    var t = now() + 0.05, T = 10;
    for (var nm in layers) killLayer(nm, 0.8);
    enterHush(t);
    var g = gateHold(t);
    g.linearRampToValueAtTime(1, t + 0.4);
    g.setValueAtTime(1, t + T - 0.02);
    g.linearRampToValueAtTime(0, t + T);                   // the cut: silence is the point
    var rg = N.revRet.gain;
    rg.cancelScheduledValues(t); rg.setValueAtTime(rg.value, t);

    var ends = [-12, -12, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12];
    for (var i = 0; i < ends.length; i++) {
      var v = newVoice('ending', { ending: true, wet: 0.5, pan: 0 });
      var fEnd = hz(ends[i]);
      var fStart = pent(pick([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7])) * (ends[i] === 12 ? 1 : (ends[i] === -12 ? 0.5 : 1));
      var delay = rnd(0, 1.6), glideT = rnd(5.0, 7.4), tEnd = t + T + 0.05;
      var sineLvl = 0.02, sawLvl = 0.03;

      var o = OSC(v, 'sine', fStart, t, tEnd);             // the voice glides to one unison D
      o.frequency.setValueAtTime(fStart, t);
      o.frequency.setValueAtTime(fStart, t + delay);
      o.frequency.exponentialRampToValueAtTime(fEnd, t + delay + glideT);
      var hair = rnd(-0.4, 0.4);                           // a unison that still breathes: voices end a hair apart (cents)
      o.detune.setValueAtTime(rnd(-30, 30), t);
      o.detune.linearRampToValueAtTime(hair, t + 8.5);
      var sg = G(v, 0);                                    // louder
      sg.gain.setValueAtTime(0.004, t);
      sg.gain.exponentialRampToValueAtTime(sineLvl, t + 8.5);
      o.connect(sg); sg.connect(v.out);

      var s = OSC(v, 'sawtooth', fStart, t, tEnd);         // purer: the buzz of separate voices fades out
      s.frequency.setValueAtTime(fStart, t);
      s.frequency.setValueAtTime(fStart, t + delay);
      s.frequency.exponentialRampToValueAtTime(fEnd, t + delay + glideT);
      s.detune.setValueAtTime(rnd(-30, 30), t);
      s.detune.linearRampToValueAtTime(0, t + 8.5);
      var fl = BQ(v, 'bandpass', 900, 2.5), sg2 = G(v, 0);
      sg2.gain.setValueAtTime(0, t);
      sg2.gain.linearRampToValueAtTime(sawLvl, t + 1.5);
      sg2.gain.linearRampToValueAtTime(0, t + 8.5);
      s.connect(fl); fl.connect(sg2); sg2.connect(v.out);

      if (v.pan) {                                         // wider
        var side = (i % 2 ? 1 : -1) * (0.15 + 0.8 * ((i >> 1) / 7));
        v.pan.pan.setValueAtTime(side * 0.25, t);
        v.pan.pan.linearRampToValueAtTime(clamp(side, -0.95, 0.95), t + 9);
      }
    }
    // the unison itself: pure, steady and wide, so the arrival is as loud as it should be whatever the glides' phases did
    var anchors = [[-12, 0, 0.05, 0], [0, -0.9, 0.04, 0.12], [0, 0.9, 0.04, -0.12], [12, -0.6, 0.014, 0.1], [12, 0.6, 0.014, -0.1]];
    for (var a = 0; a < anchors.length; a++) {
      var av = newVoice('ending', { ending: true, wet: 0.5, pan: anchors[a][1] });
      var ao = OSC(av, 'sine', hz(anchors[a][0]), t, t + T + 0.05);
      ao.detune.value = anchors[a][3];                     // a few hundredths of a cent apart: one note, alive
      var ag = G(av, 0);
      ag.gain.setValueAtTime(0.0005, t);
      ag.gain.setValueAtTime(0.0005, t + 1.5);
      ag.gain.exponentialRampToValueAtTime(anchors[a][2], t + 9.2);
      ao.connect(ag); ag.connect(av.out);
    }
    // every other voice is gone by the cut
    for (var j = 0; j < voices.length; j++) if (!voices[j].ending) stopVoice(voices[j], t + T + 0.05);
  }

  function endSit() {
    var t = now() + 0.02;
    killAllNow(t + 0.35, false);
    enterHush(t);
    var g = gateHold(t);                                   // everything stops...
    g.setTargetAtTime(0, t, 0.06);
    g.setValueAtTime(0, t + 0.3);
    g.setValueAtTime(1, t + 0.4);                          // ...then the world is empty and the gate is open again
    var rg = N.revRet.gain;                                // the old reverb tail must not ghost into the silence
    rg.cancelScheduledValues(t); rg.setValueAtTime(rg.value, t);
    rg.setTargetAtTime(0, t, 0.05); rg.setValueAtTime(0, t + 0.3);
    rg.setValueAtTime(0, t + 4.2); rg.linearRampToValueAtTime(0.9, t + 4.5);

    // one breath of noise: in, out
    var b0 = t + 1.2;
    var v = newVoice('ending', { ending: true, wet: 0 });
    var s = NOISE(v, noisePink, b0, b0 + 4.4);
    var bp = BQ(v, 'bandpass', 380, 0.9);
    bp.frequency.setValueAtTime(380, b0);
    bp.frequency.exponentialRampToValueAtTime(1000, b0 + 1.5);
    bp.frequency.setValueAtTime(1000, b0 + 1.65);
    bp.frequency.exponentialRampToValueAtTime(320, b0 + 3.6);
    var ng = G(v, 0), p = ng.gain;
    p.setValueAtTime(0, b0);
    p.linearRampToValueAtTime(0.2, b0 + 1.5);
    p.linearRampToValueAtTime(0.2, b0 + 1.65);
    p.linearRampToValueAtTime(0, b0 + 3.7);
    s.connect(bp); bp.connect(ng); ng.connect(v.out);

    // then a single chime: the very first sound of the game, with its full tail
    var cv = newVoice('ending', { ending: true, wet: 0.42 });
    chime(cv, cv.out, t + 5.4, melody(0).f, ACT_NOTE_LEVEL * 0.8, 0.9);
  }

  function leaveHush() {                                   // setAct() after an ending
    if (!hushed) return;
    hushed = false;
    var t = now();
    for (var i = 0; i < voices.length; i++) if (voices[i].ending) release(voices[i], 0.3);
    var g = N.gate.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(0, t); g.setTargetAtTime(1, t + 0.05, 0.4);
    var rg = N.revRet.gain;
    rg.cancelScheduledValues(t); rg.setValueAtTime(0.9, t);
    var bb = N.bedBus.gain;
    bb.cancelScheduledValues(t); bb.setValueAtTime(1, t);
    wireReverb();                                          // a fresh convolver: no ghost of the last tail
  }

  // ------------------------------------------------------------------------------------------ scheduler tick

  function tick(look) {
    if (!unlocked) return;
    sweep();
    var t = now(), la = look || 0.9, guard = 0;
    var rain = layers.rain;
    if (rain && !hushed) {
      if (sched.drip < t) sched.drip = t;
      while (sched.drip < t + la && guard++ < 400) {
        dripAt(rain, sched.drip);
        sched.drip += rnd(0.22, 1.6) * (act >= 3 ? 1.25 : 1);
      }
    }
    var pad = layers.pad;
    if (pad && !hushed) {
      if (sched.padNext < t - 8) sched.padNext = t + 0.05;
      var padLook = Math.max(12, la);
      while (sched.padNext < t + padLook && guard++ < 800) {
        padChord(pad, Math.max(sched.padNext, t), sched.padIdx++);
        sched.padNext += 8;
      }
    }
  }

  function startTick() {
    if (tickTimer || typeof setInterval === 'undefined') return;
    tickTimer = setInterval(safe(function () { tick(); }), 250);
    if (tickTimer && tickTimer.unref) { /* node: do not keep the process alive */ tickTimer.unref(); }
  }

  function nudge() {                                       // iOS/Safari may suspend or interrupt the context
    try {
      if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') {
        var p = ctx.resume(); if (p && p.catch) p.catch(function () {});
      }
    } catch (e) {}
  }

  // ------------------------------------------------------------------------------------------ public API

  api.unlock = safe(function () {
    if (failed) return;
    if (!ctx) {
      try { build(); } catch (e) { failed = true; ctx = null; lastError = e; return; }
    }
    nudge();
    if (!unlocked) {
      unlocked = true;
      startTick();
      if (typeof document !== 'undefined' && document.addEventListener && !gestureBound) {
        gestureBound = true;
        ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.addEventListener(ev, nudge, true); });
      }
      applyBed();
    }
  });

  api.setMuted = safe(function (b) {
    muted = !!b;
    if (unlocked) glide(N.master.gain, masterTarget(), 0.04);
  });

  api.isMuted = safe(function () { return muted; }, false);

  api.setVolume = safe(function (x) {
    vol = clamp(num(x, vol), 0, 1);
    if (unlocked) glide(N.master.gain, masterTarget(), 0.05);
  });

  api.setAct = safe(function (n) {
    act = clamp(Math.round(num(n, act)), 1, 4);
    if (!unlocked) return;
    leaveHush();
    applyBed();
  });

  api.setAmbient = safe(function (b) {
    ambientOn = !!b;
    if (unlocked) applyBed();
  });

  api.press = safe(function (opts) {
    if (!unlocked || hushed) return;
    var o = (opts && typeof opts === 'object') ? opts : {};
    if (o.onBreath) pressOn(Math.round(num(o.streak, 0)), !!o.together); else pressOff();
  });

  api.play = safe(function (name, opts) {
    if (!unlocked || hushed) return;
    if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(SHOTS, name)) return;
    SHOTS[name](now() + 0.004, (opts && typeof opts === 'object') ? opts : {});
  });

  api.hum = safe(function (seconds, smooth) {
    if (!unlocked || hushed) return;
    humAt(now() + 0.004, seconds, !!smooth);
  });

  api.swell = safe(function () {
    if (!unlocked || hushed) return;
    var t = now() + 0.01;
    if (t < sched.swellUntil) return;
    doSwell(t);
  });

  api.ending = safe(function (kind) {
    if (!unlocked || hushed) return;
    if (kind === 'coexist') endCoexist();
    else if (kind === 'merge') endMerge();
    else if (kind === 'sit') endSit();
  });

  api.silence = safe(function (seconds) {
    if (!unlocked || hushed) return;
    var sec = clamp(num(seconds, 2), 0.05, 60), t = now();
    // everything, bed included, fades to nothing and is stopped; the bed stays off until setAct() / setAmbient(true)
    for (var nm in layers) killLayer(nm, Math.max(0.05, sec / 4.5));
    for (var i = 0; i < voices.length; i++) release(voices[i], sec);
    var g = gateHold(t);
    g.setTargetAtTime(0, t, Math.max(0.01, sec / 4.5));
    g.setValueAtTime(0, t + sec);
    g.setValueAtTime(1, t + sec + 0.12);                   // sounds called after the fade are heard again
    var rg = N.revRet.gain;                                // keep the old reverb tail out of the new quiet
    rg.cancelScheduledValues(t); rg.setValueAtTime(rg.value, t);
    rg.setTargetAtTime(0, t, Math.max(0.01, sec / 4.5));
    rg.setValueAtTime(0, t + sec);
    rg.setValueAtTime(0, t + sec + 3.4); rg.linearRampToValueAtTime(0.9, t + sec + 3.9);
  });

  // review-page / test helpers (not part of the contract)
  api._debug = {
    tick: function (look) { try { tick(look); } catch (e) { lastError = e; } },
    voiceCount: function () { return voices.length; },
    activeCount: function () { var c = 0; for (var i = 0; i < voices.length; i++) { var v = voices[i]; if (!v.released && v.kind !== 'bed' && v.kind !== 'drip' && v.kind !== 'pad') c++; } return c; },
    clearError: function () { lastError = null; },
    nodeCount: function () { var c = 0; for (var i = 0; i < voices.length; i++) c += voices[i].nodes.length; return c; },
    layers: function () { return Object.keys(layers); },
    state: function () { return { unlocked: unlocked, ctx: ctx ? ctx.state : 'none', act: act, ambient: ambientOn, muted: muted, volume: vol, hushed: hushed }; },
    lastError: function () { return lastError; },
    context: function () { return ctx; }
  };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
