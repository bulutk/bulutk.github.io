/*
 * The Circle: EE.visual for The Enlightenment Engine.
 * One generative Canvas 2D picture. Classic script, no dependencies, works from file://.
 * Contract and intent: game/docs/visual-spec.md
 *
 *   EE.visual.init(canvas)          start (own requestAnimationFrame loop, DPR capped at 2, ResizeObserver)
 *   EE.visual.set(snapshot)         ~10x/s from the game; every value eases, nothing jumps
 *   EE.visual.pulse(kind, opts)     one-shot effects
 *   EE.visual.ring()                {x, y, r}: centre and MAX radius R of the player's ring, CSS px
 *   EE.visual.legend()              people per dot currently drawn (1, 10, 100, ...)
 *   EE.visual.onLegend = fn(perDot) optional; called when people-per-dot changes
 *   EE.visual.setReducedMotion(b)   true/false overrides prefers-reduced-motion; null follows the OS again
 *   EE.visual.still(canvas, snapshot, opts)   the same picture, drawn once at any size into any canvas (share card,
 *                                   printable picture); a separate instance, so the live one is never touched
 */
(function () {
  'use strict';

  var EE = window.EE = window.EE || {};
  if (EE.visual && EE.visual.__circle) return;

  /* One instance per picture: the live one (EE.visual) and, for each still, a throwaway one (STILL = true) with its own
   * state and caches. The body below is unchanged apart from the few lines marked "still". (2026-11-13, launch build) */
  function makeCircle(STILL) {

  // ---------------------------------------------------------------- palette and constants
  var TAU = Math.PI * 2;
  var GOLDEN = 137.508 * Math.PI / 180;
  var DOT_CAP = 1200;
  var MAXD = 1400;
  var SEG = 18;          // thread polyline segments
  var NTH = 40;          // thread pool size (tangle 12 shows 39)
  var SPRK = 12;         // sprite size / visible dot radius

  var C = {
    night: [11, 13, 18], ink: [233, 228, 216], amber: [242, 184, 102], peach: [246, 163, 122],
    teal: [99, 211, 198], rose: [240, 143, 169], gold: [255, 243, 201],
    thread: [200, 68, 60], threadDark: [122, 42, 42], white: [255, 249, 238]
  };
  var WARM_WHITE = [251, 245, 232];

  // ---------------------------------------------------------------- small helpers
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth01(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
  function easeInOut(t) { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { t = clamp01(t); return 1 - (1 - t) * (1 - t) * (1 - t); }
  function easeIn(t) { t = clamp01(t); return t * t * t; }
  function approach(v, target, dt, tau) { return tau <= 0 ? target : v + (target - v) * (1 - Math.exp(-dt / tau)); }
  function wrapHalf(d) { d = d - Math.floor(d); return d > 0.5 ? d - 1 : d; }
  function fullness(phase) { return 0.5 - 0.5 * Math.cos(TAU * phase); }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgba(c, a) {
    /* NaN, too: a colour string that cannot be parsed is ignored by the canvas, which then paints with the PREVIOUS
     * colour. And below 1/255 it is exactly 0: WebKit keeps gradients in 8-bit premultiplied colour, and a stop whose
     * alpha rounds to 1/255 can come back near-white when un-premultiplied; under 'lighter' that is a bright line. */
    a = a >= 1 / 255 ? (a > 1 ? 1 : a) : 0;
    return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (Math.round(a * 1000) / 1000) + ')';
  }

  // ---------------------------------------------------------------- a guarded 2D context (2026-11-13)
  // A canvas silently IGNORES a globalAlpha that is NaN or outside 0..1, a lineWidth that is not a positive number and
  // a colour it cannot parse, and keeps the PREVIOUS value: one bad number and the next shape is drawn with the last
  // style (a bright, wide, opaque line for one frame). And a negative or NaN radius in arc, ellipse or a gradient
  // throws, which ends the frame half-drawn. Every value that reaches this context goes through a guard: an alpha out of
  // range is clamped, anything unusable draws nothing. `fixes` counts what the guard had to change (dev: EE.visual.__fixes()).
  var FIXES = 0;
  var BADCOL = /NaN|Infinity|undefined|\de[-+]\d/;     /* JS writes tiny numbers as 1e-7: never valid in rgba() */
  function fin(v) { return typeof v === 'number' && isFinite(v); }
  function guardGradient(g) {
    if (!g || g.__guarded) return g;
    var add = g.addColorStop;
    g.addColorStop = function (o, col) {
      if (!fin(o)) { FIXES++; return; }
      if (o < 0 || o > 1) { FIXES++; o = o < 0 ? 0 : 1; }
      if (typeof col === 'string' && BADCOL.test(col)) { FIXES++; col = 'rgba(0,0,0,0)'; }
      add.call(g, o, col);
    };
    g.__guarded = true;
    return g;
  }
  function guard(c) {
    if (!c || c.__guarded) return c;
    function own(name, fix) {
      var pr = Object.getPrototypeOf(c), d = null;
      while (pr && !(d = Object.getOwnPropertyDescriptor(pr, name))) pr = Object.getPrototypeOf(pr);
      if (!d || !d.set) return;
      Object.defineProperty(c, name, { configurable: true, get: function () { return d.get.call(c); }, set: function (v) { d.set.call(c, fix(v)); } });
    }
    own('globalAlpha', function (v) {
      if (!fin(v) || v < 0) { FIXES++; return 0; }
      if (v > 1) { FIXES++; return 1; }
      return v;
    });
    own('lineWidth', function (v) { if (!fin(v) || v <= 0) { FIXES++; return 1e-4; } return v; });
    ['fillStyle', 'strokeStyle'].forEach(function (n) {
      own(n, function (v) { if (typeof v === 'string' && BADCOL.test(v)) { FIXES++; return 'rgba(0,0,0,0)'; } return v; });
    });
    var arc = c.arc, ell = c.ellipse, rg = c.createRadialGradient, lg = c.createLinearGradient;
    c.arc = function (x, y, r, a0, a1, ccw) {
      if (!fin(x) || !fin(y) || !fin(r) || r < 0 || !fin(a0) || !fin(a1)) { FIXES++; return; }
      return arc.call(c, x, y, r, a0, a1, ccw);
    };
    if (ell) c.ellipse = function (x, y, rx, ry, rot, a0, a1, ccw) {
      if (!fin(x) || !fin(y) || !fin(rx) || !fin(ry) || rx < 0 || ry < 0 || !fin(rot) || !fin(a0) || !fin(a1)) { FIXES++; return; }
      return ell.call(c, x, y, rx, ry, rot, a0, a1, ccw);
    };
    c.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
      if (!fin(x0) || !fin(y0) || !fin(x1) || !fin(y1) || !fin(r0) || !fin(r1) || r0 < 0 || r1 < 0) {
        FIXES++;
        x0 = fin(x0) ? x0 : 0; y0 = fin(y0) ? y0 : 0; x1 = fin(x1) ? x1 : x0; y1 = fin(y1) ? y1 : y0;
        r0 = fin(r0) && r0 > 0 ? r0 : 0; r1 = fin(r1) && r1 > 0 ? r1 : 0;
        var dead = rg.call(c, x0, y0, 0, x1, y1, 0.0001);        /* an invisible gradient: draws nothing */
        dead.addColorStop(0, 'rgba(0,0,0,0)'); dead.addColorStop(1, 'rgba(0,0,0,0)');
        dead.addColorStop = function () {};
        return dead;
      }
      return guardGradient(rg.call(c, x0, y0, r0, x1, y1, r1));
    };
    c.createLinearGradient = function (x0, y0, x1, y1) {
      if (!fin(x0) || !fin(y0) || !fin(x1) || !fin(y1)) { FIXES++; x0 = y0 = 0; x1 = y1 = 0.0001; }
      return guardGradient(lg.call(c, x0, y0, x1, y1));
    };
    c.__guarded = true;
    return c;
  }
  function angDiff(a, b) { var d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
  function wob(x, s) { return Math.sin(x + s) * 0.5 + Math.sin(x * 2.3 + s * 1.7 + 1.3) * 0.3 + Math.sin(x * 4.1 - s * 0.6 + 2.1) * 0.2; }
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function nowSec() { return (window.performance && performance.now ? performance.now() : Date.now()) / 1000; }

  // ---------------------------------------------------------------- state
  var cv = null, ctx = null, dpr = 1, W = 0, H = 0, S = 0, cx = 0, cy = 0, R = 44;
  var started = false, rafId = 0, lastTs = 0, T = 0, NOW = 0, sizeDirty = true, ro = null, errCount = 0;
  var reducedAuto = false, reducedForced = null;
  function RM() { return reducedForced === null ? reducedAuto : reducedForced; }

  var tg = {
    act: 1, inWindow: false, streak: 0, dawn: 0, sakura: false, motes: false, hum: false, humSync: 0,
    smooth: false, followers: 0, names: [], alloc: [0.5, 0.3, 0.2], trust: 5, tangle: 0, energy: 0,
    layers: 0, festival: false, finale: false, ending: null
  };
  var ez = {
    vis3: 0, vis4: 0, win: 0, streak: 0, dawn: 0, sakura: 0, motes: 0, hum: 0, humSync: 0, smooth: 0,
    lf: 0, alloc: [0.5, 0.3, 0.2], trust: 5, tangle: 0, energy: 0, layers: 0, festival: 0, finale: 0,
    labels: 1, motion: 1, tension: 0, lit: 1
  };

  // breath: a phase-locked follower of the game's ~10 Hz breath values
  var BR = { have: false, phase: 0, rate: 0, U: 0, lastV: 0, st: [], sv: [], auto: 0, hold: false, po: 0, pv: 0,
    disp: 0, dispV: 0, F: 0, Fd: 0 };
  var HN = 480, HSTEP = 1 / 60, hist = new Float32Array(HN), hHead = 0, hT = -1;

  var P = 1, bornCount = 0, fold = null, followersNow = 0, dotsN = 0;
  var fx = {
    flare: 0, buy: -99, wake: -99, humP: -99, alert: -99, flash: -99, milestone: -99, broadcast: -99,
    join: -99, relax: -99, cutHold: -99, finaleT0: -99, press: -99
  };
  var ripples = [];
  var knotP = null, filaments = [], knots = [], knotScanT = -99;
  var END = { kind: null, t0: 0, fell: false };
  var EO = {};
  /* A wave (a press, the broadcast) is not drawn in its last 5%, where it is at its widest and all but gone; it leaves
   * the list at the same moment, so drawing and removal agree (2026-11-13: Bulut saw a white flash there on his iPhone) */
  var WAVE_END = 0.95;
  var spiralRot = 0, humRot = 0, ornRot = [0, 0, 0, 0, 0, 0, 0, 0];
  var ORN_SPEED = [0.012, -0.018, 0.009, -0.007, 0.006, -0.011, 0.004, -0.005];
  var xf = null;

  // geometry of the spiral (recomputed per frame)
  var G = { r0: 60, rM: 200, cMax: 100, c: 100, rOut: 100, size: 3, spacing: 10 };

  // per-dot statics and state
  var ANG = new Float32Array(MAXD), HS = new Float32Array(MAXD), PH = new Float32Array(MAXD),
      FQ = new Float32Array(MAXD), IP = new Float32Array(MAXD), IPH = new Float32Array(MAXD),
      DX = new Float32Array(MAXD), DY = new Float32Array(MAXD), BIRTH = new Float32Array(MAXD),
      BSTR = new Float32Array(MAXD), FLASHT = new Float32Array(MAXD), WT = new Float32Array(MAXD * 3),
      SZV = new Float32Array(MAXD);
  var X = new Float32Array(MAXD), Y = new Float32Array(MAXD), DA = new Float32Array(MAXD), DS = new Float32Array(MAXD);
  var nDrawn = 0;

  // caches
  var SPR = {}, HALO = {}, bgCv = null, bgCtx = null, bgDawn = -1, vigCv = null, grainPat = null, grainCv = null,
      mottleCv = null, shaftCv = null;
  var TH = [], motes = [], petals = [], confetti = [], embers = [];
  var statics = false;

  // ---------------------------------------------------------------- statics
  var SPRPX = STILL ? 256 : 96;     // still: sprites big enough for print
  function makeSprite(rgb, kind) {
    var s = SPRPX, h = s / 2;
    var c = document.createElement('canvas'); c.width = c.height = s;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(h, h, 0, h, h, h);
    if (kind === 'core') {
      var hot = mix(rgb, [255, 252, 244], 0.72), warm = mix(rgb, [255, 252, 244], 0.3);
      g.addColorStop(0, rgba(hot, 1));
      g.addColorStop(0.075, rgba(warm, 0.96));
      g.addColorStop(0.145, rgba(rgb, 0.74));
      g.addColorStop(0.2, rgba(rgb, 0.3));
      g.addColorStop(0.3, rgba(rgb, 0.11));
      g.addColorStop(0.5, rgba(rgb, 0.04));
      g.addColorStop(0.75, rgba(rgb, 0.01));
      g.addColorStop(1, rgba(rgb, 0));
    } else {
      g.addColorStop(0, rgba(rgb, 0.5));
      g.addColorStop(0.2, rgba(rgb, 0.3));
      g.addColorStop(0.45, rgba(rgb, 0.09));
      g.addColorStop(0.75, rgba(rgb, 0.022));
      g.addColorStop(1, rgba(rgb, 0));
    }
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    return c;
  }

  function setupStatics() {
    if (statics) return;
    statics = true;
    var cols = {
      rose: mix(C.rose, C.ink, 0.12), amber: C.amber, teal: mix(C.teal, C.ink, 0.1), gold: C.gold,
      white: C.white, red: [226, 92, 70], peach: C.peach
    };
    for (var k in cols) { SPR[k] = makeSprite(cols[k], 'core'); HALO[k] = makeSprite(cols[k], 'halo'); }
    SPR.types = [SPR.rose, SPR.amber, SPR.teal];
    HALO.types = [HALO.rose, HALO.amber, HALO.teal];

    var r = rng(20261112), i;
    for (i = 0; i < MAXD; i++) {
      ANG[i] = (i * GOLDEN) % TAU;
      HS[i] = r(); PH[i] = r() * TAU; FQ[i] = 0.6 + r() * 0.9;
      IP[i] = 3.3 + r() * 2.3; IPH[i] = r(); SZV[i] = 0.82 + 0.36 * r() * r() + 0.08 * r();
      var a = r() * TAU, m = 0.35 + r() * 0.65;
      DX[i] = Math.cos(a) * m; DY[i] = Math.sin(a) * m;
      BIRTH[i] = -99; BSTR[i] = 0; FLASHT[i] = -99;
    }
    // grain: warm specks, drawn additively at low alpha (dither + paper)
    grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 128;
    var gx = grainCv.getContext('2d'), img = gx.createImageData(128, 128), d = img.data;
    for (i = 0; i < d.length; i += 4) {
      var v = r(); v = v * v * 255;
      d[i] = v; d[i + 1] = v * 0.95; d[i + 2] = v * 0.86; d[i + 3] = 255;
    }
    gx.putImageData(img, 0, 0);
    // mottle: large soft unevenness, like dark paper
    mottleCv = document.createElement('canvas'); mottleCv.width = 320; mottleCv.height = 200;
    var mx = mottleCv.getContext('2d');
    for (i = 0; i < 70; i++) {
      var bx = r() * 320, by = r() * 200, br = 16 + r() * 70, light = r() < 0.55;
      var g = mx.createRadialGradient(bx, by, 0, bx, by, br);
      var col = light ? [120, 110, 100] : [0, 0, 0];
      g.addColorStop(0, rgba(col, light ? 0.05 : 0.09)); g.addColorStop(1, rgba(col, 0));
      mx.fillStyle = g; mx.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    // threads: far-apart anchor pairs on the spiral (angle, area fraction)
    var tr = rng(9173);
    // the first ~26 (tangle <= 8) stay in the crowd and bow outward, keeping the player's ring readable;
    // the last ones are long and cross the centre: tangle 12 is a real snarl
    for (i = 0; i < NTH; i++) {
      var late = i >= 26;
      var ta = tr() * TAU, sep = (late ? 0.62 + tr() * 0.34 : 0.3 + tr() * 0.3) * Math.PI * (tr() < 0.5 ? 1 : -1);
      TH.push({
        ta: ta, tb: ta + sep, ra: (late ? 0.2 : 0.38) + tr() * (late ? 0.8 : 0.62), rb: (late ? 0.2 : 0.38) + tr() * (late ? 0.8 : 0.62),
        bend: 0.06 + tr() * 0.14, out: late ? (tr() < 0.5 ? 1 : -1) : (tr() < 0.85 ? 1 : -0.5),
        seed: tr() * 100, wr: 0.5 + tr(), pts: new Float32Array(2 * (SEG + 1)), v: 0, m: 0
      });
    }
    // particles (normalised coordinates)
    var pr = rng(4242);
    for (i = 0; i < 80; i++) {
      motes.push({ s: pr(), q: pr() * 2 - 1, sp: 0.006 + pr() * 0.012, tw: pr() * TAU, tf: 0.35 + pr() * 1.1,
        size: 0.5 + pr() * 1.2, free: pr() < 0.25, fx: pr(), fy: pr(), drift: pr() * TAU });
    }
    for (i = 0; i < 26; i++) petals.push(newPetal(pr, true));
    for (i = 0; i < 110; i++) confetti.push(newConfetto(pr, true));
    for (i = 0; i < 90; i++) embers.push({ x: 0, y: 0, vy: 0, life: 1, age: 2, size: 1, sw: 0, ph: 0 });
  }

  var prand = rng(777);
  function newPetal(r, anywhere) {
    var p = { x: 0, y: 0, vx: 0.016 + r() * 0.016, vy: 0.012 + r() * 0.012, rot: r() * TAU, vr: (r() - 0.5) * 1.4,
      flip: r() * TAU, vf: 0.6 + r() * 1.4, size: 0.6 + r() * 0.7, a: 0.5 + r() * 0.35, sa: 0.004 + r() * 0.01,
      sf: 0.3 + r() * 0.6, ph: r() * TAU };
    if (anywhere) { p.x = r(); p.y = r(); }
    else if (r() < 0.55) { p.x = -0.04; p.y = r() * 0.85; } else { p.x = r() * 0.9; p.y = -0.04; }
    return p;
  }
  function newConfetto(r, anywhere) {
    return { x: r(), y: anywhere ? r() : -0.03 - r() * 0.1, vy: 0.012 + r() * 0.022, sa: 0.004 + r() * 0.01,
      sf: 0.25 + r() * 0.6, ph: r() * TAU, col: (r() * 5) | 0, type: r() < 0.55 ? 0 : 1, rot: r() * TAU,
      vr: (r() - 0.5) * 2, size: 0.6 + r() * 1.0, tw: r() * TAU };
  }

  // ---------------------------------------------------------------- sizing and caches
  function resize() {
    sizeDirty = false;
    if (!cv) return;
    var w = Math.round(cv.clientWidth || 0), h = Math.round(cv.clientHeight || 0);
    if ((!w || !h) && cv.getBoundingClientRect) {
      var bb = cv.getBoundingClientRect(); w = Math.round(bb.width); h = Math.round(bb.height);
    }
    var d = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    /* the same size as before (iOS fires resize as its bars slide, the claude.ai frame on scroll): keep the backing
     * store and the caches; reallocating would clear the canvas for nothing (2026-11-13) */
    if (w === W && h === H && d === dpr && bgCv && cv.width === Math.max(1, Math.round(W * dpr))) return;
    dpr = d;
    W = w; H = h;
    if (W < 2 || H < 2) return;
    var bw = Math.max(1, Math.round(W * dpr)), bh = Math.max(1, Math.round(H * dpr));
    if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
    sizeCaches();
  }
  function sizeCaches() {
    baseGeometry();
    // Background and vignette are smooth, so they live at 1x on CPU-backed canvases (willReadFrequently): GPU
    // gradient dithering stacks into faint 2-px stripes across layered gradients; the software path does not.
    if (!bgCv) { bgCv = document.createElement('canvas'); bgCtx = bgCv.getContext('2d', { willReadFrequently: true }); }
    bgCv.width = W; bgCv.height = H; bgDawn = -1;
    vigCv = document.createElement('canvas'); vigCv.width = W; vigCv.height = H;
    var vx = vigCv.getContext('2d', { willReadFrequently: true });
    var big = Math.sqrt(W * W + H * H) / 2;
    var g = vx.createRadialGradient(cx, cy, big * 0.32, cx, cy, big * 1.02);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(2,2,4,0.12)');
    g.addColorStop(0.8, 'rgba(2,2,4,0.42)'); g.addColorStop(1, 'rgba(2,2,4,0.66)');
    vx.fillStyle = g; vx.fillRect(0, 0, W, H);
    shaftCv = null;
    xf = null;
  }

  var FRAME = null, SO = {};        // still: the square the Circle is laid out in, and the still's options
  function baseGeometry() {
    if (FRAME) { S = FRAME.s; R = Math.max(44, 0.13 * S); cx = FRAME.x; cy = FRAME.y; return; }
    S = Math.min(W, H); R = Math.max(44, 0.13 * S); cx = W / 2; cy = H / 2;
  }

  function geometry() {
    baseGeometry();
    G.r0 = R * 1.5;
    // the crowd makes room for the ornaments; the first one also buys a margin, so the outermost ornament
    // (rM + up to 0.108 S) stays about 3% of the smaller side clear of the stage edge at every layer count
    G.rM = Math.max(G.r0 + 24, S * (0.46 - (0.02 * Math.min(1, ez.layers) + 0.014 * ez.layers) * ez.vis4));
    var dMax = Math.max(16, 0.052 * S);
    G.cMax = dMax * dMax / Math.PI;
  }
  function cFor(n) { return Math.min(G.cMax, (G.rM * G.rM - G.r0 * G.r0) / Math.max(1, n)); }
  function sizeFor(c) { return clamp(Math.sqrt(Math.PI * c) * 0.152, 1.4, Math.max(3, S * 0.0052)); }
  function rOf(i, c) { return Math.sqrt(G.r0 * G.r0 + c * (i + 0.5)); }

  function renderBg(d) {
    bgDawn = d;
    var b = bgCtx;
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1;
    var g = b.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#08090e'); g.addColorStop(0.5, '#0b0d12'); g.addColorStop(1, '#0f111a');
    b.fillStyle = g; b.fillRect(0, 0, W, H);
    var ms = Math.max(W / 320, H / 200);   // cover, never stretch: blobs stay round in portrait
    b.drawImage(mottleCv, (W - 320 * ms) / 2, (H - 200 * ms) / 2, 320 * ms, 200 * ms);
    if (d > 0.001) {
      var e = smooth01(d), pre = smooth01(d * 1.7);
      g = b.createLinearGradient(0, H, 0, H * 0.28);
      g.addColorStop(0, rgba([74, 54, 96], 0.42 * pre));
      g.addColorStop(0.5, rgba([44, 36, 70], 0.22 * pre));
      g.addColorStop(1, rgba([20, 20, 36], 0));
      b.fillStyle = g; b.fillRect(0, 0, W, H);
      var top = H * (1 - (0.3 + 0.2 * e));
      g = b.createLinearGradient(0, H, 0, top);
      g.addColorStop(0, rgba(C.peach, 0.8 * e));
      g.addColorStop(0.2, rgba([244, 172, 112], 0.52 * e));
      g.addColorStop(0.46, rgba([222, 140, 112], 0.22 * e));
      g.addColorStop(0.75, rgba([120, 78, 100], 0.06 * e));
      g.addColorStop(1, rgba([60, 40, 70], 0));
      b.fillStyle = g; b.fillRect(0, 0, W, H);
      var sr = Math.max(W, H * 1.4) * 0.62;
      g = b.createRadialGradient(W * 0.5, H * 1.12, 0, W * 0.5, H * 1.12, sr);
      g.addColorStop(0, rgba(C.gold, 0.55 * e * e));
      g.addColorStop(0.22, rgba(C.amber, 0.34 * e * e));
      g.addColorStop(0.55, rgba(C.peach, 0.09 * e));
      g.addColorStop(1, rgba(C.peach, 0));
      b.globalCompositeOperation = 'lighter';
      b.fillStyle = g; b.fillRect(0, 0, W, H);
      b.globalCompositeOperation = 'source-over';
    }
  }

  // the slanted shaft of light for the motes (cached per size)
  function shaftGeom(s, q) {
    var ax = lerp(0.2 * W, 0.66 * W, s), ay = lerp(-0.03 * H, 1.03 * H, s);
    var dxA = 0.46 * W, dyA = 1.06 * H, L = Math.sqrt(dxA * dxA + dyA * dyA);
    var px = -dyA / L, py = dxA / L;
    var hw = lerp(0.07, 0.17, s) * W;
    return [ax + px * q * hw, ay + py * q * hw];
  }
  function buildShaft() {
    // thin slices along the shaft, each with its own across-gradient that reaches zero exactly at its edges:
    // a widening beam with soft sides everywhere (one gradient cannot widen)
    shaftCv = document.createElement('canvas'); shaftCv.width = Math.max(1, W); shaftCv.height = Math.max(1, H);
    var x = shaftCv.getContext('2d', { willReadFrequently: true });
    var N = 60;
    for (var i = 0; i < N; i++) {
      var s0 = i / N, s1 = (i + 1) / N, sm = (s0 + s1) / 2;
      var a = shaftGeom(s0, -1), b = shaftGeom(s0, 1), c2 = shaftGeom(s1, 1), d = shaftGeom(s1, -1);
      var m0 = shaftGeom(sm, -1), m1 = shaftGeom(sm, 1);
      var peak = 0.1 * Math.pow(1 - sm, 1.3) * (0.55 + 0.45 * smooth01(sm / 0.12));
      var g = x.createLinearGradient(m0[0], m0[1], m1[0], m1[1]);
      /* the same floor as rgba(): nothing between 0 and 1/255 (the shaft's far end fades to nearly nothing) */
      g.addColorStop(0, 'rgba(250,206,140,0)');
      g.addColorStop(0.22, rgba([250, 206, 140], peak * 0.3));
      g.addColorStop(0.5, rgba([255, 222, 165], peak));
      g.addColorStop(0.78, rgba([250, 206, 140], peak * 0.3));
      g.addColorStop(1, 'rgba(250,206,140,0)');
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c2[0], c2[1]); x.lineTo(d[0], d[1]); x.closePath();
      x.fillStyle = g; x.fill();
    }
  }

  function crossfade(dur) {
    if (!cv || W < 2) return;
    try {
      var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
      c.getContext('2d').drawImage(cv, 0, 0);
      xf = { cv: c, t0: NOW || nowSec(), dur: dur || 1 };
    } catch (e) { xf = null; }
  }

  // ---------------------------------------------------------------- breath
  // The game owns the breath and sends it ~10x/s. `phase` follows the game (snapped to each value, extrapolated
  // at the measured rate in between); `disp` is what is drawn: phase plus an offset that a critically damped
  // spring returns to zero. Every snap re-seeds the offset so the drawn breath keeps both its position and its
  // velocity: no jumps, no kicks, even when the game resets or retimes the breath.
  function feedBreath(v, now) {
    v = v - Math.floor(v);
    var first = !BR.have;
    if (first) { BR.have = true; BR.U = v; BR.lastV = v; BR.st = [now]; BR.sv = [v]; BR.rate = 0; }
    else {
      BR.U += wrapHalf(v - BR.lastV); BR.lastV = v;
      BR.st.push(now); BR.sv.push(BR.U);
      while (BR.st.length > 2 && now - BR.st[0] > 1.2) { BR.st.shift(); BR.sv.shift(); }
      var span = now - BR.st[0];
      if (span > 0.18) BR.rate = clamp((BR.U - BR.sv[0]) / span, -3, 3);
    }
    if (BR.hold && !first) return;        // an ending is breathing on its own: listen to the rate only
    BR.po = wrapHalf(BR.disp - v);
    BR.pv = BR.dispV - BR.rate * (1 - BR.auto) - freeRate(v) * BR.auto;
    BR.phase = v;
  }

  // breathing on its own (no game clock yet, or an ending): one breath is 6 s, 2.6 s swelling and 3.4 s settling
  function freeRate(p) { p -= Math.floor(p); return p < 0.5 ? 0.5 / 2.6 : 0.5 / 3.4; }

  function updateBreath(dt) {
    var wantAuto = !BR.have || ((END.kind === 'sit' || END.kind === 'coexist') && Math.abs(BR.rate) < 0.03);
    BR.hold = wantAuto && BR.have;
    BR.auto = approach(BR.auto, wantAuto ? 1 : 0, dt, 0.8);
    var rate = lerp(BR.rate, freeRate(BR.phase), BR.auto);
    BR.phase += rate * dt;
    BR.phase -= Math.floor(BR.phase);
    var w = lerp(7, 3.2, smooth01(Math.abs(BR.po) / 0.25));   // small offsets settle in ~0.6 s, big ones gently in ~1.3 s
    BR.pv += (-w * w * BR.po - 2 * w * BR.pv) * dt;
    BR.po += BR.pv * dt;
    if (Math.abs(BR.po) < 1e-6 && Math.abs(BR.pv) < 1e-5) { BR.po = 0; BR.pv = 0; }
    var d = BR.phase + BR.po;
    BR.disp = d - Math.floor(d);
    BR.dispV = rate + BR.pv;
    BR.F = BR.Fd = fullness(BR.disp);
  }

  function pushHist(now, v) {
    if (hT < 0 || now - hT > 0.5) { for (var i = 0; i < HN; i++) hist[i] = v; hT = now; hHead = 0; return; }
    while (now - hT >= HSTEP) { hT += HSTEP; hHead = (hHead + 1) % HN; hist[hHead] = v; }
  }
  // the ring's fullness `delay` seconds ago
  function histAt(delay) {
    var k = (delay - (NOW - hT)) / HSTEP;
    if (k <= 0) return BR.Fd;
    if (k > HN - 2) k = HN - 2;
    var i0 = k | 0, f = k - i0;
    var a = hist[(hHead - i0 + HN) % HN], b = hist[(hHead - i0 - 1 + HN) % HN];
    return a + (b - a) * f;
  }

  // ---------------------------------------------------------------- public: set / pulse
  function setSnapshot(s) {
    if (!s || typeof s !== 'object') return;
    var now = nowSec();
    if (isNum(s.act)) tg.act = clamp(Math.round(s.act), 1, 4);
    if (isNum(s.breath)) feedBreath(s.breath, now);
    if (s.inWindow !== undefined) tg.inWindow = !!s.inWindow;
    if (isNum(s.streak)) tg.streak = clamp(s.streak, 0, 999);
    if (isNum(s.dawn)) tg.dawn = clamp01(s.dawn);
    if (s.sakura !== undefined) tg.sakura = !!s.sakura;
    if (s.motes !== undefined) tg.motes = !!s.motes;
    if (s.hum !== undefined) tg.hum = !!s.hum;
    if (isNum(s.humSync)) tg.humSync = clamp01(s.humSync);
    if (s.smooth !== undefined) tg.smooth = !!s.smooth;
    if (isNum(s.followers)) tg.followers = clamp(s.followers, 0, 9e9);
    if (Array.isArray(s.named)) {
      var names = [];
      for (var i = 0; i < s.named.length && names.length < 12; i++) {
        var n = s.named[i];
        names.push(typeof n === 'string' ? n : (n && n.name != null ? String(n.name) : ''));
      }
      tg.names = names;
    }
    if (s.alloc && typeof s.alloc === 'object') {
      var o = isNum(s.alloc.outreach) ? Math.max(0, s.alloc.outreach) : tg.alloc[0];
      var si = isNum(s.alloc.sitting) ? Math.max(0, s.alloc.sitting) : tg.alloc[1];
      var su = isNum(s.alloc.support) ? Math.max(0, s.alloc.support) : tg.alloc[2];
      var sum = o + si + su;
      if (sum > 0) tg.alloc = [o / sum, si / sum, su / sum];
    }
    if (isNum(s.trust)) tg.trust = clamp(s.trust, 0, 10);
    if (isNum(s.tangle)) tg.tangle = clamp(s.tangle, 0, 12);
    if (isNum(s.energy)) tg.energy = clamp01(s.energy);
    if (isNum(s.layers)) tg.layers = clamp(s.layers, 0, 8);
    if (s.festival !== undefined) tg.festival = !!s.festival;
    if (s.finale !== undefined) {
      var fin = !!s.finale;
      if (fin && !tg.finale) fx.finaleT0 = now;
      tg.finale = fin;
    }
    if (s.ending !== undefined) {
      var e = (s.ending === 'coexist' || s.ending === 'merge' || s.ending === 'sit') ? s.ending : null;
      if (e !== tg.ending) startEnding(e, now);
    }
  }

  function startEnding(e, now) {
    tg.ending = e;
    if (END.kind) crossfade(1.4);      // leaving or restarting an ending: cross-fade, never pop
    END.kind = e; END.t0 = now; END.fell = false;
  }

  function pulse(kind, opts) {
    var now = nowSec();
    opts = opts || {};
    switch (kind) {
      case 'press':
        var on = !!opts.onBreath;
        if (ripples.length > 10) ripples.shift();
        ripples.push({ t0: now, kind: 'press', on: on, r0: R * (0.72 + 0.28 * BR.Fd) });
        fx.flare = Math.max(fx.flare, on ? 1 : 0.3);
        break;
      case 'buy': fx.buy = now; break;
      case 'wake': fx.wake = now; break;
      case 'hum': fx.humP = now; break;
      case 'join':
        fx.join = now;
        var cnt = Math.min(MAXD, Math.ceil(dotsN));
        if (cnt > 0 && (P > 1 || cnt >= bornCount)) FLASHT[cnt - 1] = now;
        break;
      case 'alert': fx.alert = now; break;
      case 'knot': startKnot(now); break;
      case 'cut': startCut(now, false); break;
      case 'broadcast':
        if (ripples.length > 10) ripples.shift();
        ripples.push({ t0: now, kind: 'broadcast' });
        fx.broadcast = now;
        break;
      case 'flash': fx.flash = now; break;
      case 'milestone': fx.milestone = now; break;
    }
  }

  // ---------------------------------------------------------------- endings (overrides per frame)
  function computeEnding(now) {
    EO.dots = 1; EO.hum = 1; EO.orn = 1; EO.radMul = 1; EO.dawnMin = 0; EO.dawnOv = -1; EO.ringLitMin = 0;
    EO.ringAlpha = 1; EO.breathAmp = 1; EO.indiv = 0; EO.drift = 0; EO.mergeT = -1; EO.vign = 1; EO.threads = 1;
    EO.parts = 1; EO.festival = 1; EO.echo = 1; EO.humMerge = 0; EO.ornShrink = 0; EO.win = 1; EO.bg = 1;
    if (!END.kind) return;
    var t = now - END.t0, fo;
    if (END.kind === 'coexist') {
      EO.radMul = lerp(1, 0.3, easeInOut(t / 5));
      EO.dawnMin = easeInOut((t - 3) / 9);
      EO.ringLitMin = easeInOut((t - 2.5) / 4);
      EO.indiv = easeInOut((t - 1) / 6);
      EO.drift = easeInOut((t - 1) / 8);
      EO.orn = lerp(1, 0.45, easeInOut(t / 6));
      EO.festival = 1 - easeInOut(t / 4);
      EO.parts = lerp(1, 0.3, easeInOut(t / 5));
      EO.threads = 0;
      if (!END.fell) { END.fell = true; startCut(now, true); }
    } else if (END.kind === 'merge') {
      EO.ringAlpha = 1 - easeInOut(t / 1.6);
      EO.breathAmp = 1 - easeInOut(t / 1.2);
      EO.mergeT = t;
      EO.humMerge = easeInOut((t - 1.2) / 3.8);
      EO.orn = 1 - easeInOut((t - 1) / 5);
      EO.ornShrink = easeInOut((t - 1) / 5.5);
      EO.threads = 1 - easeInOut(t / 2);
      EO.vign = 1 - easeInOut((t - 8) / 5);
      EO.parts = 1 - easeInOut(t / 2.5);
      EO.festival = EO.parts;
      EO.echo = 1 - easeInOut(t / 1.2);
      EO.win = EO.echo;
    } else if (END.kind === 'sit') {
      fo = easeInOut(t / 4.5);
      EO.dots = 1 - fo; EO.hum = 1 - fo; EO.orn = 1 - fo; EO.radMul = 1 - fo; EO.threads = 1 - fo;
      EO.parts = 1 - fo; EO.festival = 1 - fo; EO.echo = 1 - fo; EO.win = 1 - fo;
      EO.ringLitMin = easeInOut((t - 2) / 3.5);
      EO.dawnOv = t < 8 ? lerp(ez.dawn, 0, easeInOut(t / 4)) : easeInOut((t - 8) / 6.5);
    }
  }

  // ---------------------------------------------------------------- threads: knot, cut, fall
  function startKnot(now) {
    var vis = [];
    for (var k = 0; k < NTH; k++) if (TH[k].v > 0.85) vis.push(k);
    if (!vis.length) return;
    knotP = { k: vis[(prand() * vis.length) | 0], t0: now };
  }

  function startCut(now, fall) {
    var rm = RM();
    for (var k = 0; k < NTH; k++) {
      var th = TH[k];
      if (th.v < 0.04 || th.m < 1) continue;
      var m = Math.min(SEG, Math.floor(th.m)), pts = th.pts;
      var brk = fall ? m : clamp(Math.round(SEG * (0.33 + prand() * 0.34)), 1, Math.max(1, m - 1));
      if (brk > m) brk = m;
      var j, a = new Float32Array(2 * (brk + 1));
      for (j = 0; j <= brk; j++) { a[2 * j] = pts[2 * j]; a[2 * j + 1] = pts[2 * j + 1]; }
      filaments.push(makeFil(a, now, fall, rm));
      if (!fall && m > brk + 1) {
        var n = m - brk, b = new Float32Array(2 * (n + 1));
        for (j = 0; j <= n; j++) { b[2 * j] = pts[2 * (m - j)]; b[2 * j + 1] = pts[2 * (m - j) + 1]; }
        filaments.push(makeFil(b, now, false, rm));
      }
    }
    while (filaments.length > 90) filaments.shift();
    fx.cutHold = now + 1.6;
    ez.tangle = 0;
    if (!fall) fx.relax = now;
    knotP = null;
  }
  function makeFil(pts, now, fall, rm) {
    var ox = pts[0] - cx, oy = pts[1] - cy, ol = Math.sqrt(ox * ox + oy * oy) || 1;
    var out = fall ? 4 : 12 + prand() * 14;
    return {
      pts: pts, n: pts.length / 2, t0: now, dur: fall ? 4.5 : 3, fall: fall, rm: rm,
      curl: (prand() < 0.5 ? -1 : 1) * (0.9 + prand() * 1.2) * (fall ? 0.35 : 1),
      vx: rm ? 0 : ox / ol * out + (prand() - 0.5) * 6, vy: rm ? 0 : oy / ol * out + (fall ? 10 : 4),
      g: rm ? 0 : (fall ? 14 : 8), w: (0.9 + 0.2 * Math.max(4, ez.tangle)) * clamp(S / 820, 0.75, 1.4),
      spin: (prand() - 0.5) * 0.4
    };
  }

  // ---------------------------------------------------------------- update
  function update(dt, now) {
    var rm = RM(), k;
    T += dt;
    computeEnding(now);
    updateBreath(dt);
    pushHist(now, BR.Fd);

    ez.vis3 = approach(ez.vis3, tg.act >= 3 ? 1 : 0, dt, 1.0);
    ez.vis4 = approach(ez.vis4, tg.act >= 4 ? 1 : 0, dt, 1.2);
    ez.win = approach(ez.win, tg.inWindow ? 1 : 0, dt, tg.inWindow ? 0.07 : 0.22);
    ez.streak = approach(ez.streak, Math.min(10, tg.streak), dt, 0.35);
    ez.dawn = approach(ez.dawn, tg.dawn, dt, 1.4);
    ez.sakura = approach(ez.sakura, tg.sakura ? 1 : 0, dt, 1.5);
    ez.motes = approach(ez.motes, tg.motes ? 1 : 0, dt, 1.5);
    ez.hum = approach(ez.hum, tg.hum ? 1 : 0, dt, 0.9);
    ez.humSync = approach(ez.humSync, tg.humSync, dt, 0.7);
    ez.smooth = approach(ez.smooth, tg.smooth ? 1 : 0, dt, 0.9);
    var lt = Math.log(1 + tg.followers);
    ez.lf = Math.abs(ez.lf - lt) < 1e-5 ? lt : approach(ez.lf, lt, dt, 0.55);
    for (k = 0; k < 3; k++) ez.alloc[k] = approach(ez.alloc[k], tg.alloc[k], dt, 0.8);
    ez.trust = approach(ez.trust, tg.trust, dt, 1.0);
    ez.tangle = now < fx.cutHold || END.kind ? approach(ez.tangle, 0, dt, 0.3) : approach(ez.tangle, tg.tangle, dt, 0.9);
    ez.energy = approach(ez.energy, tg.energy, dt, 1.1);
    ez.layers = approach(ez.layers, tg.layers, dt, 1.6);
    ez.festival = approach(ez.festival, tg.festival ? 1 : 0, dt, 1.6);
    ez.finale = approach(ez.finale, tg.finale ? 1 : 0, dt, tg.finale ? 1.3 : 1.0);
    ez.tension = approach(ez.tension, ez.tangle / 12, dt, 0.7);
    ez.lit = approach(ez.lit, tg.finale ? 0 : 1, dt, tg.finale ? 1.0 : 1.4);

    var mt = 1;
    if (tg.finale && !END.kind) mt = (now - fx.finaleT0 < 6.5) ? 0 : 0.3;
    ez.motion = approach(ez.motion, mt, dt, mt < ez.motion ? 0.6 : 2.2);
    var mo = rm ? 0 : ez.motion;
    spiralRot += dt * 0.0055 * mo;
    humRot += dt * 0.021 * mo;
    for (k = 0; k < 8; k++) ornRot[k] += dt * ORN_SPEED[k] * mo;
    fx.flare = approach(fx.flare, 0, dt, 0.45);

    // followers -> people per dot (with hysteresis) -> fold animation
    geometry();
    var f = Math.exp(ez.lf) - 1;
    if (f < 0.001) f = 0;
    followersNow = f;
    var np = P;
    while (f / np > DOT_CAP && np < 1e12) np *= 10;
    while (np > 1 && f / np < DOT_CAP / 10 * 0.95) np /= 10;
    if (np !== P) {
      var old = P; P = np;
      startFold(old, np, f, now);
      if (typeof api.onLegend === 'function') { try { api.onLegend(P); } catch (e) { /* page's problem */ } }
    }
    dotsN = f / P;
    if (fold && now - fold.t0 >= fold.dur) { fold = null; settleDots(dotsN); }

    var tf = ez.labels;
    ez.labels = approach(tf, f < 100 ? 1 : 0, dt, 0.8);

    for (k = ripples.length - 1; k >= 0; k--) {
      var rp = ripples[k], dur = rp.kind === 'broadcast' ? 3.4 : (rp.on ? 1.9 : 1.2);
      if (now - rp.t0 >= dur * WAVE_END) ripples.splice(k, 1);
    }
    for (k = filaments.length - 1; k >= 0; k--) if (now - filaments[k].t0 > filaments[k].dur) filaments.splice(k, 1);
    if (knotP && now - knotP.t0 > 1.7) knotP = null;
    if (xf && now - xf.t0 > xf.dur) xf = null;
    if (fx.wake > 0 && now - fx.wake > 2.5 && now - fx.wake < 3.6) ez.hum = 1;
  }

  // ---------------------------------------------------------------- fold: ten dots become one (or back)
  function typeOf(i) {
    var h = HS[i], a = ez.alloc;
    return h < a[0] ? 0 : h < a[0] + a[1] ? 1 : 2;
  }
  function settleDots(n) {
    var cnt = Math.min(MAXD, Math.ceil(n));
    for (var i = 0; i < MAXD; i++) {
      if (i < cnt) BIRTH[i] = -99;
      var t = typeOf(i);
      WT[i * 3] = t === 0 ? 1 : 0; WT[i * 3 + 1] = t === 1 ? 1 : 0; WT[i * 3 + 2] = t === 2 ? 1 : 0;
    }
    bornCount = cnt;
  }

  function startFold(fromP, toP, f, now) {
    var vis = ez.vis3 * (END.kind === 'sit' ? 0 : 1);
    fold = null;
    var nNewF = f / toP;
    if (vis < 0.03 || RM()) {
      if (vis >= 0.03) crossfade(1.0);
      settleDots(nNewF);
      return;
    }
    var dir = toP > fromP ? 1 : -1;
    var nO = Math.min(MAXD, Math.max(1, Math.ceil(f / fromP)));
    var nN = Math.min(MAXD, Math.max(1, Math.ceil(nNewF)));
    var cO = cFor(f / fromP), cN = cFor(nNewF);
    var r02 = G.r0 * G.r0;
    var nSrc = dir > 0 ? nO : nN, nDst = dir > 0 ? nN : nO;
    var cS = dir > 0 ? cO : cN, cD = dir > 0 ? cN : cO;
    var spanS = cS * nSrc, spanD = cD * nDst;
    var dx = new Float32Array(nDst), dy = new Float32Array(nDst), i, j;
    for (j = 0; j < nDst; j++) { var rr = Math.sqrt(r02 + cD * (j + 0.5)); dx[j] = rr * Math.cos(ANG[j]); dy[j] = rr * Math.sin(ANG[j]); }
    var map = new Int32Array(nSrc), best = new Float32Array(nDst), rep = new Int32Array(nDst), af = new Float32Array(nSrc);
    for (j = 0; j < nDst; j++) { best[j] = 1e20; rep[j] = -1; }
    for (i = 0; i < nSrc; i++) {
      var a = (i + 0.5) * cS / spanS;
      af[i] = a;
      var r = Math.sqrt(r02 + a * spanD), px = r * Math.cos(ANG[i]), py = r * Math.sin(ANG[i]);
      var bj = 0, bd = 1e20;
      for (j = 0; j < nDst; j++) { var ex = dx[j] - px, ey = dy[j] - py, dd = ex * ex + ey * ey; if (dd < bd) { bd = dd; bj = j; } }
      map[i] = bj;
      if (bd < best[bj]) { best[bj] = bd; rep[bj] = i; }
    }
    fold = { t0: now, dur: 2.4, dir: dir, fromP: fromP, toP: toP, nSrc: nSrc, nDst: nDst, map: map, rep: rep, af: af };
    bornCount = Math.min(MAXD, Math.ceil(nNewF));
    for (i = 0; i < bornCount; i++) BIRTH[i] = -99;
  }

  // ---------------------------------------------------------------- per-frame derived values
  var F = {};   // frame values shared by the draw passes
  function frameValues(now) {
    var rm = RM();
    var rad = ez.vis4 * ez.energy;
    rad = lerp(rad, 1, ez.finale) * EO.radMul;
    F.rad = rad;
    F.lit = Math.max(ez.lit, EO.ringLitMin);
    F.trust = ez.trust / 10;
    F.dotAmp = ez.motion * (1 - 0.55 * ez.tension) * EO.breathAmp;
    var rs = 1 - 0.045 * ez.tension;
    var tr = now - fx.relax;
    if (tr >= 0 && tr < 3.2) rs *= 1 + 0.035 * Math.sin(Math.PI * clamp01(tr / 2.8)) * (rm ? 0 : 1);
    F.radial = rs;
    var ms = now - fx.milestone, sw = 0;
    if (ms >= 0 && ms < 2.6) sw = Math.sin(Math.PI * ms / 2.6); sw = sw * sw;
    F.swell = sw;
    F.scale = rm ? 1 : 1 + 0.03 * sw;
    var bri = 1 + 0.32 * sw;
    if (tr >= 0 && tr < 3) bri += 0.2 * Math.sin(Math.PI * tr / 3);
    var bc = now - fx.broadcast;
    if (bc >= 0 && bc < 3.4) bri += (rm ? 0.5 : 0.15) * Math.sin(Math.PI * bc / 3.4);
    F.bri = bri * (1 - 0.28 * ez.tension);
    // active ripples for dot lighting
    F.rip = [];
    for (var k = 0; k < ripples.length; k++) {
      var rp = ripples[k], t = now - rp.t0;
      if (rm) continue;
      if (rp.kind === 'press') {
        if (!rp.on) continue;
        var u = t / 1.9;
        if (u >= WAVE_END) continue;
        F.rip.push([rp.r0 + R * 2.2 * easeOut(u), R * 0.22, 0.9 * (1 - u) * (1 - u)]);
      } else {
        var ub = t / 3.4, diag = Math.sqrt(W * W + H * H) * 0.62;
        if (ub >= WAVE_END) continue;
        F.rip.push([diag * easeOut(ub), S * 0.07 + S * 0.08 * ub, 1.3 * Math.pow(1 - ub, 1.2)]);
      }
    }
  }

  // ---------------------------------------------------------------- dots
  var ripN = 0;
  function flickOf(i) {
    return 0.5 + 0.5 * Math.sin(T * 1.9 * FQ[i] + PH[i]) * Math.sin(T * 0.77 * FQ[i] + 3 * PH[i]);
  }
  // size is absolute (per-dot variation included); j2/eb blend the flicker toward a second dot during a fold
  function emitDot(c, i, r, th, alpha, size, w0, w1, w2, bloomOK, now, j2, eb) {
    var rm = RM();
    var u = (r - G.r0) / Math.max(1, G.rOut - G.r0);
    if (u < 0) u = 0; else if (u > 1.2) u = 1.2;
    var Fw = histAt(0.1 + 1.55 * u);
    if (EO.indiv > 0) Fw = lerp(Fw, 0.5 - 0.5 * Math.cos(TAU * (T / IP[i] + IPH[i])), EO.indiv);
    var Fd = 0.5 + (Fw - 0.5) * F.dotAmp;
    var rr = r * F.radial;
    if (!rm) rr *= 1 + 0.034 * (Fd - 0.5);
    var whiteW = 0;
    if (EO.mergeT >= 0) {
      var p = clamp01((EO.mergeT - (1.0 + 3.0 * Math.min(1, u))) / 3.2);
      var e = easeInOut(p);
      if (rm) { alpha *= 1 - smooth01(p * 1.6); }
      else {
        rr *= 1 - e;
        th += 1.9 * e * (0.55 + 0.45 * Math.min(1, u));
        alpha *= 1 - smooth01((e - 0.82) / 0.18);
      }
      whiteW = smooth01(e * 1.5);
    }
    var x = cx + rr * Math.cos(th), y = cy + rr * Math.sin(th);
    if (EO.drift > 0 && !rm) {
      var dd = EO.drift * G.spacing * 0.55;
      x += dd * (DX[i] + 0.45 * Math.sin(T * 0.13 * FQ[i] + PH[i]));
      y += dd * (DY[i] + 0.45 * Math.cos(T * 0.11 * FQ[i] + 2 * PH[i]));
    }
    var low = 1 - F.trust;
    var fk = flickOf(i);
    if (j2 !== undefined && j2 >= 0) fk = lerp(fk, flickOf(j2), eb);
    var flick = 1 - low * 0.42 * fk;
    var bri = (0.38 + 0.62 * Fd) * flick * F.bri * (0.85 + 0.15 * F.trust);
    bri = lerp(bri, 1.15, 0.6 * ez.finale * (1 - ez.motion));
    for (var k = 0; k < ripN; k++) {
      var q = F.rip[k], z = (rr - q[0]) / q[1];
      if (z > -3 && z < 3) bri += q[2] * Math.exp(-z * z);
    }
    var grow = 1, bloom = 0;
    if (bloomOK) {
      var age = now - BIRTH[i];
      if (age >= 0 && age < 2) {
        grow = rm ? 1 : clamp01(age / 0.45);
        grow = 1 - (1 - grow) * (1 - grow) * (1 - grow);
        bloom = BSTR[i] * Math.exp(-age / 0.5);
        if (rm) alpha *= clamp01(age / 0.6);
      }
      var fa = now - FLASHT[i];
      if (fa >= 0 && fa < 1.5) bloom = Math.max(bloom, 0.8 * Math.exp(-fa / 0.45));
    }
    var sz = size * (0.72 + 0.5 * Fd) * grow * (1 + 0.14 * F.rad) * (1 + 0.5 * bloom);
    var s = sz * SPRK;
    var A = alpha * F.dotVis;
    var ab = A * Math.min(1, bri);
    if (ab > 0.003) {
      var gw = F.goldW, bw = 1 - gw;
      var hs = s / 2;
      if (whiteW > 0) { bw *= 1 - whiteW; gw *= 1 - whiteW; }
      if (w0 * bw > 0.01) { c.globalAlpha = ab * w0 * bw; c.drawImage(SPR.rose, x - hs, y - hs, s, s); }
      if (w1 * bw > 0.01) { c.globalAlpha = ab * w1 * bw; c.drawImage(SPR.amber, x - hs, y - hs, s, s); }
      if (w2 * bw > 0.01) { c.globalAlpha = ab * w2 * bw; c.drawImage(SPR.teal, x - hs, y - hs, s, s); }
      if (gw > 0.01) { c.globalAlpha = ab * gw; c.drawImage(SPR.gold, x - hs, y - hs, s, s); }
      if (whiteW > 0.01) { c.globalAlpha = ab * whiteW; c.drawImage(SPR.white, x - hs, y - hs, s, s); }
      var extra = (bri > 1 ? (bri - 1) * 0.55 : 0) + bloom * 0.7 + F.rad * 0.12 + F.trust * 0.06;
      if (extra > 0.01) {
        var hz = s * (1.5 + 1.2 * bloom);
        c.globalAlpha = Math.min(1, A * extra);
        c.drawImage(whiteW > 0.5 ? HALO.white : (F.goldW > 0.5 ? HALO.gold : HALO.types[w0 >= w1 && w0 >= w2 ? 0 : (w1 >= w2 ? 1 : 2)]),
          x - hz / 2, y - hz / 2, hz, hz);
      }
    }
    X[nDrawn] = x; Y[nDrawn] = y; DA[nDrawn] = A; DS[nDrawn] = sz; nDrawn++;
  }

  function drawDots(c, now, dt) {
    nDrawn = 0;
    var vis = ez.vis3 * EO.dots;
    F.dotVis = vis;
    if (vis < 0.003 || dotsN <= 0) return;
    var n = dotsN, i, k, cnt = Math.min(MAXD, Math.ceil(n));
    var cNow = cFor(n);
    G.c = cNow;
    G.size = sizeFor(cNow);
    G.spacing = Math.sqrt(Math.PI * cNow);
    G.rOut = Math.max(G.r0 + 1, rOf(Math.max(0, n - 0.5), cNow));
    F.goldW = clamp01(0.88 * F.rad + 0.1 * F.trust * (1 - F.rad));
    ripN = F.rip.length;
    c.globalCompositeOperation = 'lighter';
    var joinBoost = now - fx.join < 1.4;

    if (!fold) {
      if (cnt > bornCount) {
        for (i = bornCount; i < cnt; i++) { BIRTH[i] = now; BSTR[i] = joinBoost ? 1 : 0.55; }
        bornCount = cnt;
      } else if (cnt < bornCount) bornCount = cnt;
      var nFull = Math.floor(n), fr = n - nFull;
      var ka = 1 - Math.exp(-dt / 0.7);
      for (i = 0; i < cnt; i++) {
        var t = typeOf(i), b3 = i * 3;
        WT[b3] += ((t === 0 ? 1 : 0) - WT[b3]) * ka;
        WT[b3 + 1] += ((t === 1 ? 1 : 0) - WT[b3 + 1]) * ka;
        WT[b3 + 2] += ((t === 2 ? 1 : 0) - WT[b3 + 2]) * ka;
        emitDot(c, i, rOf(i, cNow), ANG[i] + spiralRot, i < nFull ? 1 : fr, G.size * SZV[i], WT[b3], WT[b3 + 1], WT[b3 + 2], true, now);
      }
    } else {
      var fd = fold, u = clamp01((now - fd.t0) / fd.dur);
      var cOld = cFor(followersNow / fd.fromP), cNew = cNow;
      var sOld = sizeFor(cOld), sNew = G.size;
      G.rOut = Math.max(G.rOut, rOf(Math.max(0, followersNow / fd.fromP - 0.5), cOld) * (1 - u) + G.rOut * u);
      for (i = 0; i < fd.nSrc; i++) {
        var e = easeInOut(clamp01(u * 1.35 - 0.35 * fd.af[i]));
        var m = fd.map[i], isRep = fd.rep[m] === i;
        var rS, rE, aS, aE, al, sz, ts, td;
        if (fd.dir > 0) { rS = rOf(i, cOld); rE = rOf(m, cNew); aS = ANG[i]; aE = ANG[m];
          al = isRep ? 1 : Math.pow(1 - e, 1.4); sz = lerp(sOld * SZV[i], sNew * SZV[m], e) * (isRep ? 1 : lerp(1, 0.45, e));
          ts = typeOf(i); td = typeOf(m);
        } else { rS = rOf(m, cOld); rE = rOf(i, cNew); aS = ANG[m]; aE = ANG[i];
          al = isRep ? 1 : e; sz = lerp(sOld * SZV[m], sNew * SZV[i], e) * (isRep ? 1 : lerp(0.45, 1, e));
          ts = typeOf(m); td = typeOf(i);
        }
        var th = aS + spiralRot + angDiff(aS, aE) * e;
        var w0 = lerp(ts === 0 ? 1 : 0, td === 0 ? 1 : 0, e), w1 = lerp(ts === 1 ? 1 : 0, td === 1 ? 1 : 0, e),
            w2 = lerp(ts === 2 ? 1 : 0, td === 2 ? 1 : 0, e);
        if (fd.dir > 0) emitDot(c, i, lerp(rS, rE, e), th, al, sz, w0, w1, w2, false, now, m, e);
        else emitDot(c, m, lerp(rS, rE, e), th, al, sz, w0, w1, w2, false, now, i, e);
      }
      var eAll = easeInOut(u);
      if (fd.dir > 0) {
        for (k = 0; k < fd.nDst; k++) if (fd.rep[k] < 0) {
          var tk = typeOf(k);
          emitDot(c, k, rOf(k, cNew), ANG[k] + spiralRot, eAll, sNew * SZV[k], tk === 0 ? 1 : 0, tk === 1 ? 1 : 0, tk === 2 ? 1 : 0, false, now);
        }
        for (k = fd.nDst; k < cnt; k++) {
          if (k >= bornCount) { BIRTH[k] = now; BSTR[k] = 0.55; bornCount = k + 1; }
          var tq = typeOf(k);
          emitDot(c, k, rOf(k, cNew), ANG[k] + spiralRot, k < Math.floor(n) ? 1 : n - Math.floor(n), sNew * SZV[k], tq === 0 ? 1 : 0, tq === 1 ? 1 : 0, tq === 2 ? 1 : 0, true, now);
        }
      } else {
        for (k = 0; k < fd.nDst; k++) if (fd.rep[k] < 0) {
          var to = typeOf(k);
          emitDot(c, k, rOf(k, cOld), ANG[k] + spiralRot, 1 - eAll, sOld * SZV[k], to === 0 ? 1 : 0, to === 1 ? 1 : 0, to === 2 ? 1 : 0, false, now);
        }
        for (k = fd.nSrc; k < cnt; k++) {
          if (k >= bornCount) { BIRTH[k] = now; BSTR[k] = 0.55; bornCount = k + 1; }
          var tw = typeOf(k);
          emitDot(c, k, rOf(k, cNew), ANG[k] + spiralRot, 1, sNew * SZV[k], tw === 0 ? 1 : 0, tw === 1 ? 1 : 0, tw === 2 ? 1 : 0, true, now);
        }
      }
    }
    c.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- labels (the first named followers)
  function drawLabels(c) {
    var names = tg.names, la = ez.labels * F.dotVis;
    if (fold || la < 0.01 || !names.length || nDrawn === 0) return;
    c.globalCompositeOperation = 'source-over';
    var fs = clamp(Math.round(S * 0.0145), 11, 14);
    c.font = 'italic ' + fs + 'px ui-serif, Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';
    c.textBaseline = 'middle';
    for (var k = 0; k < names.length && k < nDrawn; k++) {
      if (!names[k]) continue;
      var a = la * DA[k];
      if (a < 0.01) continue;
      var dx = X[k] - cx, dy = Y[k] - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var off = DS[k] + 7;
      var lx = X[k] + dx / d * off, ly = Y[k] + dy / d * off;
      c.textAlign = dx >= 0 ? 'left' : 'right';
      c.fillStyle = rgba(C.night, 0.55 * a);
      c.fillText(names[k], lx + 0.5, ly + 0.8);
      c.fillStyle = rgba(C.ink, 0.7 * a);
      c.fillText(names[k], lx, ly);
    }
  }

  // ---------------------------------------------------------------- threads (the Tangle)
  var ancA = [0, 0], ancB = [0, 0];
  function anchorPos(theta, a, out) {
    var r = Math.sqrt(G.r0 * G.r0 + a * (G.rOut * G.rOut - G.r0 * G.r0));
    var u = (r - G.r0) / Math.max(1, G.rOut - G.r0);
    var Fd = 0.5 + (histAt(0.1 + 1.55 * u) - 0.5) * F.dotAmp;
    r *= F.radial * (RM() ? 1 : 1 + 0.034 * (Fd - 0.5));
    var th = theta + spiralRot;
    out[0] = cx + r * Math.cos(th); out[1] = cy + r * Math.sin(th);
  }

  function threadGeometry(now) {
    var rm = RM(), tang = ez.tangle;
    var pk = 0, kp = knotP ? knotP.k : -1;
    if (knotP) { var kt = now - knotP.t0; pk = kt < 0.3 ? easeOut(kt / 0.3) : 1 - easeInOut((kt - 0.3) / 1.4); }
    for (var k = 0; k < NTH; k++) {
      var th = TH[k];
      th.v = clamp01(tang * 3.25 - k);
      if (th.v <= 0 || nDrawn < 3) { th.v = 0; th.m = 0; continue; }
      anchorPos(th.ta, th.ra, ancA); anchorPos(th.tb, th.rb, ancB);
      var ax = ancA[0], ay = ancA[1], bx = ancB[0], by = ancB[1];
      var dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy) || 1;
      var px = -dy / L, py = dx / L;
      if (px * ((ax + bx) / 2 - cx) + py * ((ay + by) / 2 - cy) < 0) { px = -px; py = -py; }   // p points away from the centre
      var bend = th.bend * th.out * (k === kp && !rm ? 1 - 0.8 * pk : 1);
      var qx = (ax + bx) / 2 + px * bend * L, qy = (ay + by) / 2 + py * bend * L;
      var trem = rm || k === kp ? 0 : 0.35 + 0.5 * ez.tension;
      for (var j = 0; j <= SEG; j++) {
        var s = j / SEG, is = 1 - s;
        var x = is * is * ax + 2 * is * s * qx + s * s * bx;
        var y = is * is * ay + 2 * is * s * qy + s * s * by;
        var w = Math.sin(Math.PI * s) * (1.1 * Math.sin(s * 9 + th.seed + (rm ? 0 : T * 0.5 * th.wr)) +
          trem * Math.sin(T * 8.5 + th.seed * 3 + s * 21));
        th.pts[2 * j] = x + px * w; th.pts[2 * j + 1] = y + py * w;
      }
      th.m = th.v * SEG;
    }
    if (now - knotScanT > 0.3) { knotScanT = now; scanKnots(); }
  }

  function scanKnots() {
    knots.length = 0;
    for (var a = 0; a < NTH; a++) {
      var A = TH[a]; if (A.m < 1) continue;
      for (var b = a + 1; b < NTH; b++) {
        var B = TH[b]; if (B.m < 1) continue;
        var ma = Math.floor(A.m), mb = Math.floor(B.m);
        for (var i = 0; i < ma; i++) {
          var x1 = A.pts[2 * i], y1 = A.pts[2 * i + 1], x2 = A.pts[2 * i + 2], y2 = A.pts[2 * i + 3];
          for (var j = 0; j < mb; j++) {
            var x3 = B.pts[2 * j], y3 = B.pts[2 * j + 1], x4 = B.pts[2 * j + 2], y4 = B.pts[2 * j + 3];
            var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (den === 0) continue;
            var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
            var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
              knots.push({ a: a, s: i + t, b: b, sb: j + u, seed: (a * 31 + b * 17) % 7 });
              if (knots.length > 80) return;
            }
          }
        }
      }
    }
  }
  function ptOn(th, s, out) {
    var i = Math.floor(s); if (i >= SEG) { i = SEG - 1; }
    var f = s - i;
    out[0] = lerp(th.pts[2 * i], th.pts[2 * i + 2], f); out[1] = lerp(th.pts[2 * i + 1], th.pts[2 * i + 3], f);
  }
  function traceThread(c, th) {
    var m = th.m, mi = Math.floor(m), p = th.pts;
    c.moveTo(p[0], p[1]);
    for (var j = 1; j <= mi; j++) c.lineTo(p[2 * j], p[2 * j + 1]);
    if (m > mi && mi < SEG) { var f = m - mi; c.lineTo(lerp(p[2 * mi], p[2 * mi + 2], f), lerp(p[2 * mi + 1], p[2 * mi + 3], f)); }
  }

  var kpt = [0, 0];
  function drawThreads(c, now) {
    var alpha = F.dotVis * EO.threads;
    var any = false, k;
    for (k = 0; k < NTH; k++) if (TH[k].m > 0) { any = true; break; }
    if (!any || alpha < 0.01) return;
    var sc = clamp(S / 820, 0.75, 1.4);
    var w = (0.9 + 0.2 * ez.tangle) * sc;
    c.globalCompositeOperation = 'source-over';
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    for (k = 0; k < NTH; k++) if (TH[k].m > 0) traceThread(c, TH[k]);
    c.strokeStyle = rgba([8, 2, 4], 0.55 * alpha); c.lineWidth = w + 3 * sc; c.stroke();
    c.strokeStyle = rgba(C.threadDark, 0.96 * alpha); c.lineWidth = w; c.stroke();
    c.strokeStyle = rgba(C.thread, 0.34 * alpha); c.lineWidth = Math.max(0.5, w * 0.3); c.stroke();

    var pk = 0, kp = -1;
    if (knotP && TH[knotP.k].m > 0) {
      kp = knotP.k; var kt = now - knotP.t0;
      pk = kt < 0.3 ? easeOut(kt / 0.3) : 1 - easeInOut((kt - 0.3) / 1.4);
      c.globalCompositeOperation = 'lighter';
      c.beginPath(); traceThread(c, TH[kp]);
      c.strokeStyle = rgba([235, 90, 70], 0.42 * pk * alpha); c.lineWidth = w + 5 * sc; c.stroke();
      c.strokeStyle = rgba([255, 150, 120], 0.6 * pk * alpha); c.lineWidth = Math.max(0.8, w * 0.5); c.stroke();
      c.globalCompositeOperation = 'source-over';
    }
    // pins where threads are tied into the crowd
    var pr = (0.9 + 0.14 * ez.tangle) * sc;
    c.fillStyle = rgba(C.threadDark, 0.95 * alpha);
    c.beginPath();
    for (k = 0; k < NTH; k++) {
      var th = TH[k]; if (th.m <= 0) continue;
      c.moveTo(th.pts[0] + pr, th.pts[1]); c.arc(th.pts[0], th.pts[1], pr, 0, TAU);
      if (th.m >= SEG - 0.01) { c.moveTo(th.pts[2 * SEG] + pr, th.pts[2 * SEG + 1]); c.arc(th.pts[2 * SEG], th.pts[2 * SEG + 1], pr, 0, TAU); }
    }
    c.fill();
    // knots where threads cross
    var show = Math.min(knots.length, Math.floor(3 + 2.6 * ez.tangle));
    var kr = (1.8 + 0.2 * ez.tangle) * sc;
    var tightK = -1;
    for (k = 0; k < show; k++) {
      var kn = knots[k], A = TH[kn.a];
      if (A.m < kn.s || TH[kn.b].m < kn.sb) continue;
      ptOn(A, kn.s, kpt);
      var tight = (kn.a === kp || kn.b === kp) ? pk : 0;
      if (tight > 0 && tightK < 0) tightK = k;
      drawKnot(c, kpt[0], kpt[1], kr * (1 - 0.3 * tight), kn.seed, alpha, tight);
    }
    if (kp >= 0 && tightK < 0 && TH[kp].m > SEG * 0.5) {
      ptOn(TH[kp], SEG * 0.5, kpt);
      drawKnot(c, kpt[0], kpt[1], kr * (1 - 0.3 * pk), 3, alpha * pk, pk);
      tightK = 99;
    }
    if (kp >= 0 && tightK >= 0) {
      var t2 = now - knotP.t0;
      if (tightK !== 99) ptOn(TH[knots[tightK].a], knots[tightK].s, kpt);
      if (t2 < 1.1) {
        c.globalCompositeOperation = 'lighter';
        var rr = lerp(kr * 9, kr * 1.4, easeOut(t2 / 0.8));
        c.strokeStyle = rgba([235, 96, 76], 0.6 * (1 - t2 / 1.1) * alpha); c.lineWidth = 1.2;
        c.beginPath(); c.arc(kpt[0], kpt[1], rr, 0, TAU); c.stroke();
        var hz = kr * 14;
        c.globalAlpha = 0.65 * pk * alpha; c.drawImage(HALO.red, kpt[0] - hz / 2, kpt[1] - hz / 2, hz, hz); c.globalAlpha = 1;
        c.globalCompositeOperation = 'source-over';
      }
    }
  }
  function drawKnot(c, x, y, r, seed, alpha, tight) {
    c.fillStyle = rgba([12, 3, 4], 0.6 * alpha);
    c.beginPath(); c.arc(x, y, r + 1.2, 0, TAU); c.fill();
    c.fillStyle = rgba(mix(C.threadDark, [60, 14, 14], tight), 0.98 * alpha);
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = rgba(mix(C.thread, C.threadDark, 0.35), 0.8 * alpha); c.lineWidth = 0.9;
    c.beginPath(); c.ellipse(x, y, r * 1.7, r * 0.75, seed * 0.9, 0, TAU); c.stroke();
    c.beginPath(); c.ellipse(x + r * 0.2, y - r * 0.1, r * 1.1, r * 0.55, seed * 0.9 + 1.4, 0, TAU); c.stroke();
  }

  function drawFilaments(c, now) {
    if (!filaments.length) return;
    c.globalCompositeOperation = 'source-over';
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (var k = 0; k < filaments.length; k++) {
      var fl = filaments[k], t = now - fl.t0, u = t / fl.dur;
      if (u >= 1) continue;
      var e = easeOut(u), a = 0.9 * Math.pow(1 - u, 1.5);
      if (fl.rm) a = 0.9 * (1 - smooth01(u));
      var p = fl.pts, n = fl.n, ax = p[0], ay = p[1];
      var ox = fl.vx * t, oy = fl.vy * t + 0.5 * fl.g * t * t;
      c.beginPath();
      for (var j = 0; j < n; j++) {
        var s = n > 1 ? j / (n - 1) : 0;
        var rx = p[2 * j] - ax, ry = p[2 * j + 1] - ay;
        var ang = fl.rm ? 0 : fl.curl * e * s * s + fl.spin * e;
        var sc = fl.rm ? 1 : 1 - (fl.fall ? 0.1 : 0.45) * e * s;
        var ca = Math.cos(ang), sa = Math.sin(ang);
        var x = ax + (rx * ca - ry * sa) * sc + ox, y = ay + (rx * sa + ry * ca) * sc + oy;
        if (j === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      var w = fl.w * (1 - 0.6 * u);
      c.strokeStyle = rgba(C.threadDark, a); c.lineWidth = w; c.stroke();
      c.strokeStyle = rgba(C.thread, a * 0.4); c.lineWidth = Math.max(0.5, w * 0.32); c.stroke();
      if (!fl.fall && !fl.rm && t < 0.4) {
        var ex = p[2 * (n - 1)], ey = p[2 * (n - 1) + 1];
        c.globalCompositeOperation = 'lighter';
        var hz = 26 * (1 - t / 0.4) + 6;
        c.globalAlpha = 0.7 * (1 - t / 0.4); c.drawImage(HALO.red, ex - hz / 2, ey - hz / 2, hz, hz);
        c.globalAlpha = 0.5 * (1 - t / 0.4); c.drawImage(SPR.gold, ex - hz / 4, ey - hz / 4, hz / 2, hz / 2);
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      }
    }
  }

  // ---------------------------------------------------------------- glow band helper
  function band(c, r, gw, col, a, x0, y0) {
    if (a < 0.02 || r <= 0) return;               /* its faintest stops are a tenth of `a`: keep them clear of 1/255 */
    if (x0 === undefined) { x0 = cx; y0 = cy; }
    var r0 = Math.max(0, r - gw), r1 = r + gw;
    var g = c.createRadialGradient(x0, y0, r0, x0, y0, r1);
    var m = (r - r0) / (r1 - r0);
    g.addColorStop(0, rgba(col, 0));
    g.addColorStop(m * 0.45, rgba(col, a * 0.1));
    g.addColorStop(m * 0.8, rgba(col, a * 0.52));
    g.addColorStop(m, rgba(col, a));
    g.addColorStop(m + (1 - m) * 0.2, rgba(col, a * 0.52));
    g.addColorStop(m + (1 - m) * 0.55, rgba(col, a * 0.1));
    g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g;
    c.beginPath(); c.arc(x0, y0, r1, 0, TAU); c.fill();
  }

  // ---------------------------------------------------------------- the player's ring
  function brushRing(c, r, w, style) {
    var N = 120, i, a, rr, hw;
    c.beginPath();
    for (i = 0; i <= N; i++) {
      a = i / N * TAU;
      rr = r * (1 + 0.0035 * wob(a * 3, T * 0.07));
      hw = w * 0.5 * (0.62 + 0.38 * (0.5 + 0.5 * wob(a * 2 + 1.7, T * 0.05)));
      if (i === 0) c.moveTo(cx + (rr + hw) * Math.cos(a), cy + (rr + hw) * Math.sin(a));
      else c.lineTo(cx + (rr + hw) * Math.cos(a), cy + (rr + hw) * Math.sin(a));
    }
    for (i = N; i >= 0; i--) {
      a = i / N * TAU;
      rr = r * (1 + 0.0035 * wob(a * 3, T * 0.07));
      hw = w * 0.5 * (0.62 + 0.38 * (0.5 + 0.5 * wob(a * 2 + 1.7, T * 0.05)));
      c.lineTo(cx + (rr - hw) * Math.cos(a), cy + (rr - hw) * Math.sin(a));
    }
    c.closePath();
    c.fillStyle = style; c.fill();
  }

  function drawPlayer(c, now) {
    var A = EO.ringAlpha;
    if (A < 0.003) return;
    var lit = F.lit;
    var Fr = 0.5 + (BR.Fd - 0.5) * EO.breathAmp;
    var rB = R * (0.72 + 0.28 * Fr);
    var r = lerp(R, rB, lit);
    var win = ez.win * EO.win * lit;
    var bu = now - fx.buy, buy = bu >= 0 && bu < 1.4 ? Math.sin(Math.PI * Math.min(1, bu / 0.25) * 0.5) * Math.exp(-bu / 0.5) : 0;
    var flare = Math.min(1.4, fx.flare + buy);
    var la = lit * A;
    c.globalCompositeOperation = 'lighter';
    if (la > 0.003) {
      if ((0.05 + 0.05 * Fr + 0.05 * win) * la >= 0.02) {     /* clear of the 8-bit floor (see rgba) */
        var g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, rgba(C.amber, (0.05 + 0.05 * Fr + 0.05 * win) * la));
        g.addColorStop(0.72, rgba(C.amber, (0.022 + 0.022 * Fr + 0.02 * win) * la));
        g.addColorStop(1, rgba(C.amber, 0));
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
      }
      band(c, r, R * 0.68, mix(C.amber, C.peach, 0.3), (0.03 + 0.025 * Fr + 0.03 * win + 0.04 * flare) * la);
      band(c, r, R * (0.3 + 0.06 * win + 0.12 * flare), C.amber, (0.11 + 0.07 * Fr + 0.09 * win + 0.14 * flare) * la);
      band(c, r, R * (0.075 + 0.025 * win + 0.035 * flare), mix(C.amber, C.gold, 0.3), (0.36 + 0.14 * Fr + 0.25 * win + 0.3 * flare) * la);
      brushRing(c, r, Math.max(1.3, R * 0.017) * (1 + 0.3 * win + 0.2 * flare), rgba(mix(C.amber, C.gold, 0.22 + 0.3 * win), 0.88 * la));
      c.strokeStyle = rgba([255, 240, 214], (0.3 + 0.3 * win + 0.2 * flare) * la); c.lineWidth = 0.8;
      c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke();
      // streak echoes: rings within the ring, each following the breath a little later
      var es = ez.streak * EO.echo;
      for (var k = 1; k <= 10; k++) {
        var v = clamp01(es - (k - 1));
        if (v <= 0.003) break;
        var fk = 0.5 + (histAt(0.11 * k) - 0.5) * EO.breathAmp;
        var rk = R * (0.72 + 0.28 * fk) * (1 - 0.072 * k);
        c.strokeStyle = rgba(mix(C.amber, C.gold, 0.2), 0.2 * (1 - 0.055 * k) * v * la);
        c.lineWidth = 0.9;
        c.beginPath(); c.arc(cx, cy, rk, 0, TAU); c.stroke();
      }
      // the still line
      var sa = (0.14 + 0.5 * win) * la;
      if (win > 0.01) band(c, R, R * 0.05, C.amber, 0.28 * win * la);
      c.strokeStyle = rgba(mix(C.ink, C.amber, 0.35 + 0.4 * win), sa); c.lineWidth = 1;
      c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
    }
    // unlit: the one dark thing at the centre of the finale
    var d = (1 - lit) * A;
    if (d > 0.003) {
      c.globalCompositeOperation = 'source-over';
      var g2 = c.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1);
      g2.addColorStop(0, rgba(C.night, 0.72 * d)); g2.addColorStop(0.86, rgba(C.night, 0.66 * d));
      g2.addColorStop(1, rgba(C.night, 0));
      c.fillStyle = g2; c.beginPath(); c.arc(cx, cy, R * 1.1, 0, TAU); c.fill();
      var lw = Math.max(1.6, R * 0.016);
      c.globalCompositeOperation = 'lighter';
      band(c, R + lw * 2.2, lw * 2.6, C.amber, 0.13 * d * (0.4 + 0.6 * F.rad));
      c.globalCompositeOperation = 'source-over';
      c.strokeStyle = rgba([3, 3, 6], 0.95 * d); c.lineWidth = lw;
      c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
    }
  }

  // ---------------------------------------------------------------- Hum
  function drawHum(c, now) {
    var rm = RM();
    var wt = now - fx.wake, humA;
    if (fx.wake > 0 && wt >= 0 && wt < 2.5) humA = easeInOut((wt - 1.55) / 0.95);
    else humA = ez.hum;
    humA *= EO.hum * (1 - EO.humMerge * EO.humMerge);
    if (humA < 0.004) return;
    var sm = ez.smooth;
    var Fh = fullness(BR.disp - (1 - ez.humSync) * 0.5);
    if (sm < 1 && !rm) Fh += (1 - sm) * 0.035 * Math.sin(T * 0.83) * Math.sin(T * 0.31 + 1);
    if (EO.indiv > 0) Fh = lerp(Fh, fullness(T / 6.8 + 0.3), EO.indiv);
    Fh = 0.5 + (Fh - 0.5) * ez.motion * EO.breathAmp;
    var rh = R * (1.17 + 0.13 * Fh) * (1 - 0.95 * EO.humMerge);
    var col = mix(C.teal, C.gold, 0.32 * F.rad);
    var hot = mix(col, [235, 255, 250], 0.45);
    var N = 72, L = R * 0.085, i;
    var hp = fx.humP > 0 ? (now - fx.humP) / 1.7 : 9;
    var head = -Math.PI / 2 + TAU * easeInOut(hp);
    var sheen = T * 0.55;
    c.globalCompositeOperation = 'lighter';
    if (sm > 0.01) {
      band(c, rh, R * 0.06, col, 0.09 * sm * humA);
      c.strokeStyle = rgba(hot, 0.16 * sm * humA); c.lineWidth = 0.7;
      c.beginPath(); c.arc(cx, cy, rh, 0, TAU); c.stroke();
      c.strokeStyle = rgba(col, 0.07 * sm * humA);
      c.beginPath(); c.arc(cx, cy, rh - R * 0.07, 0, TAU); c.stroke();
    } else {
      band(c, rh, R * 0.05, col, 0.05 * humA);
    }
    var brightAll = rm && hp < 1 ? 0.6 * (1 - hp) : 0;
    for (i = 0; i < N; i++) {
      var h1 = HS[i * 7 + 3], h2 = HS[i * 5 + 11];
      var a = humRot + i * TAU / N + (1 - sm) * (h1 - 0.5) * 0.02;
      var rr = rh * (1 + (1 - sm) * 0.013 * wob(a * 3, rm ? 0 : T * 0.22));
      var len = L * (1 + (1 - sm) * 0.4 * (h2 - 0.5));
      var al = sm + (1 - sm) * (0.55 + 0.45 * h1 * (0.75 + 0.25 * Math.sin(T * 0.7 + i)));
      var bump = 0;
      if (hp < 1 && !rm) { var dd = angDiff(head, a); bump = Math.exp(-(dd * dd) / 0.12) * (1 - hp * 0.6); }
      var gl = sm > 0.01 ? sm * Math.exp(-Math.pow(angDiff(sheen, a), 2) / 0.09) : 0;
      len *= 1 + 1.2 * bump;
      rr += bump * R * 0.035;
      al = al * (0.72 + 0.28 * Fh) + bump + brightAll + 0.6 * gl;
      var ca = Math.cos(a), sa = Math.sin(a);
      var x1 = cx + (rr - len / 2) * ca, y1 = cy + (rr - len / 2) * sa, x2 = cx + (rr + len / 2) * ca, y2 = cy + (rr + len / 2) * sa;
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
      c.strokeStyle = rgba(col, 0.12 * al * humA); c.lineWidth = 4.2; c.stroke();
      c.strokeStyle = rgba(gl > 0.2 || bump > 0.2 ? hot : col, Math.min(1, 0.85 * al * humA)); c.lineWidth = 1.5; c.stroke();
    }
  }

  function drawWake(c, now) {
    var t = now - fx.wake;
    if (fx.wake < 0 || t < 0 || t > 2.6) return;
    var rm = RM();
    var rp = R * (0.72 + 0.28 * BR.Fd);
    var sep = easeOut(t / 0.5) * R * 0.07;
    var rg = lerp(rp + sep, R * 1.23, easeInOut((t - 0.5) / 1.6));
    var ga = smooth01(t / 0.3) * (1 - smooth01((t - 1.7) / 0.8));
    if (!rm && t > 0.3 && t < 1.9) ga *= 0.6 + 0.4 * (0.5 + 0.5 * (Math.sin(t * 41) * 0.6 + Math.sin(t * 67 + 1) * 0.4));
    var col = mix(C.amber, C.teal, smooth01((t - 0.2) / 1.3));
    var env = Math.sin(Math.PI * clamp01((t - 0.3) / 1.6));
    var jx = rm ? 0 : Math.sin(t * 23) * R * 0.012 * env;
    c.globalCompositeOperation = 'lighter';
    band(c, rg, R * 0.06, col, 0.32 * ga, cx + jx, cy);
    c.strokeStyle = rgba(mix(col, C.white, 0.3), 0.75 * ga); c.lineWidth = 1.3;
    c.beginPath(); c.arc(cx + jx, cy, rg, 0, TAU); c.stroke();
    if (!rm && env > 0.01) {
      c.save();
      c.beginPath(); c.arc(cx, cy, R * 1.55, 0, TAU); c.arc(cx, cy, R * 0.78, 0, TAU, true); c.clip();
      var by = cy - R * 1.7 + R * 3.4 * clamp01((t - 0.3) / 1.6);
      for (var y = cy - R * 1.55; y < cy + R * 1.55; y += 3) {
        var z = (y - by) / (R * 0.28);
        var a = env * (0.04 + 0.2 * Math.exp(-z * z)) * (0.6 + 0.4 * Math.sin(y * 0.9 + t * 30));
        c.fillStyle = rgba(C.teal, a);
        c.fillRect(cx - R * 1.55, y, R * 3.1, 1);
      }
      c.restore();
    }
  }

  // ---------------------------------------------------------------- ripples
  function drawRipples(c, now) {
    if (!ripples.length) return;
    var rm = RM();
    c.globalCompositeOperation = 'lighter';
    for (var k = 0; k < ripples.length; k++) {
      var rp = ripples[k], t = now - rp.t0, u, rr, a;
      if (rp.kind === 'press') {
        var dur = rp.on ? 1.9 : 1.2; u = t / dur;
        if (u >= WAVE_END) continue;
        if (rm) continue;   // reduced motion: the ring's flare is the whole response
        rr = rp.r0 + (rp.on ? R * 2.2 : R * 0.65) * easeOut(u);
        a = (rp.on ? 0.42 : 0.16) * Math.pow(1 - u, 1.6) * EO.ringAlpha;
        var col = rp.on ? mix(C.amber, C.gold, 0.4) : mix(C.ink, C.amber, 0.45);
        band(c, rr, R * (rp.on ? 0.1 : 0.06) * (1 - 0.4 * u), col, a);
        c.strokeStyle = rgba(col, a * (rp.on ? 0.7 : 0.5)); c.lineWidth = 0.8;
        c.beginPath(); c.arc(cx, cy, rr, 0, TAU); c.stroke();
      } else {
        u = t / 3.4; if (u >= WAVE_END) continue;
        var diag = Math.sqrt(W * W + H * H) * 0.62;
        if (rm) {
          c.fillStyle = rgba(C.gold, 0.12 * Math.sin(Math.PI * u));
          c.fillRect(0, 0, W, H);
          continue;
        }
        rr = diag * easeOut(u);
        a = 0.36 * Math.pow(1 - u, 1.2);
        band(c, rr, S * 0.07 + S * 0.08 * u, mix(C.gold, C.amber, 0.3), a);
        c.strokeStyle = rgba(C.gold, a * 0.8); c.lineWidth = 1.2;
        c.beginPath(); c.arc(cx, cy, rr, 0, TAU); c.stroke();
      }
    }
  }

  // ---------------------------------------------------------------- Act IV: ornaments
  function ornRadius(k) {
    var rM = G.rM, s = S, inner = G.r0 * G.r0;
    switch (k) {
      case 0: return rM + 0.014 * s;                                // lotus, just outside the crowd
      case 1: return R * 1.43;                                      // dotted band between Hum and the crowd
      case 2: return rM + 0.05 * s;                                 // arcs
      case 3: return Math.sqrt(inner + 0.42 * (rM * rM - inner));   // diamond chain through the crowd
      case 4: return rM + 0.064 * s;                                // zigzag band
      case 5: return Math.sqrt(inner + 0.8 * (rM * rM - inner));    // interlaced circles through the crowd
      case 6: return G.r0;                                          // long rays through the crowd
      default: return rM + 0.092 * s;                               // the outer frame
    }
  }
  function polarTo(c, r, a, move) { if (move) c.moveTo(r * Math.cos(a), r * Math.sin(a)); else c.lineTo(r * Math.cos(a), r * Math.sin(a)); }
  function polarCubic(c, r1, a1, r2, a2, r, a) {
    c.bezierCurveTo(r1 * Math.cos(a1), r1 * Math.sin(a1), r2 * Math.cos(a2), r2 * Math.sin(a2), r * Math.cos(a), r * Math.sin(a));
  }
  function polarQuad(c, rc, ac, r, a) { c.quadraticCurveTo(rc * Math.cos(ac), rc * Math.sin(ac), r * Math.cos(a), r * Math.sin(a)); }

  function drawOrnaments(c) {
    var L = ez.layers * ez.vis4;
    if (L < 0.003) return;
    var s = S, i, n, a;
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round'; c.lineJoin = 'round';
    var line = mix([255, 226, 160], C.gold, 0.4), glow = C.amber;
    for (var k = 0; k < 8; k++) {
      var v = smooth01(L - k);
      if (v <= 0.003) break;
      var alpha = v * EO.orn * (0.5 + 0.5 * Math.max(F.rad, 0.35));
      if (alpha < 0.003) continue;
      var rb = ornRadius(k) * (0.965 + 0.035 * v) * (1 - 0.6 * EO.ornShrink);
      var fr = clamp01((rb - G.r0) / Math.max(1, G.rM - G.r0));
      alpha *= 0.78 + 0.22 * (0.5 + (histAt(0.1 + 1.55 * Math.min(1.2, fr)) - 0.5) * F.dotAmp);
      var overlay = k === 3 ? 0.5 : k === 5 ? 0.24 : k === 6 ? 0.28 : 1;
      alpha *= overlay;
      c.save(); c.translate(cx, cy); c.rotate(ornRot[k]);
      c.beginPath();
      var fills = false;
      switch (k) {
        case 0: // lotus border: overlapping pointed petals, bulb at the base, fine tip
          n = 48; var len = 0.028 * s, hw = Math.PI / n * 1.5;
          for (i = 0; i < n; i++) {
            a = i * TAU / n;
            polarTo(c, rb, a - hw, true);
            polarCubic(c, rb + len * 0.42, a - hw, rb + len * 0.74, a - hw * 0.16, rb + len, a);
            polarCubic(c, rb + len * 0.74, a + hw * 0.16, rb + len * 0.42, a + hw, rb, a + hw);
          }
          c.moveTo(rb, 0); c.arc(0, 0, rb, 0, TAU);
          break;
        case 1: // dotted band
          n = 96; fills = true;
          for (i = 0; i < n; i++) {
            a = i * TAU / n; var dr = i % 8 === 0 ? 1.7 : 0.85;
            c.moveTo(rb * Math.cos(a) + dr, rb * Math.sin(a)); c.arc(rb * Math.cos(a), rb * Math.sin(a), dr, 0, TAU);
          }
          break;
        case 2: // a fine chain of arcs, a bead at every cusp
          n = 72; var bump = 0.0072 * s;
          for (i = 0; i < n; i++) {
            var a0 = i * TAU / n, a1 = (i + 1) * TAU / n;
            polarTo(c, rb, a0, true); polarQuad(c, rb + bump * 2, (a0 + a1) / 2, rb, a1);
          }
          c.moveTo(rb - 0.0035 * s, 0); c.arc(0, 0, rb - 0.0035 * s, 0, TAU);
          for (i = 0; i < n; i += 3) {
            a = i * TAU / n; var bx0 = (rb + 0.0016 * s) * Math.cos(a), by0 = (rb + 0.0016 * s) * Math.sin(a);
            c.moveTo(bx0 + 1.1, by0); c.arc(bx0, by0, 1.1, 0, TAU);
          }
          break;
        case 3: // diamond chain through the crowd
          n = 16; var dl = 0.013 * s, dw = 0.006 * s;
          c.moveTo(rb, 0); c.arc(0, 0, rb, 0, TAU);
          for (i = 0; i < n; i++) {
            a = i * TAU / n + Math.PI / n; var dwA = dw / rb;
            polarTo(c, rb - dl, a, true); polarTo(c, rb, a + dwA); polarTo(c, rb + dl, a); polarTo(c, rb, a - dwA); polarTo(c, rb - dl, a);
          }
          break;
        case 4: // zigzag band between two circles, a dot in every outward tooth
          n = 60; var zw = 0.013 * s;
          c.moveTo(rb, 0); c.arc(0, 0, rb, 0, TAU);
          c.moveTo(rb + zw, 0); c.arc(0, 0, rb + zw, 0, TAU);
          for (i = 0; i <= n; i++) { a = i * TAU / n; polarTo(c, i % 2 ? rb + zw : rb, a, i === 0); }
          for (i = 1; i < n; i += 2) {   // tooth tips at odd i touch the outer circle; the dot sits inside each tooth
            a = i * TAU / n;
            var zx = (rb + zw * 0.42) * Math.cos(a), zy = (rb + zw * 0.42) * Math.sin(a);
            c.moveTo(zx + 0.9, zy); c.arc(zx, zy, 0.9, 0, TAU);
          }
          break;
        case 5: // interlaced circles
          n = 20; var cr = rb * Math.sin(Math.PI / n) * 1.3;
          for (i = 0; i < n; i++) {
            a = i * TAU / n; var ccx = rb * Math.cos(a), ccy = rb * Math.sin(a);
            c.moveTo(ccx + cr, ccy); c.arc(ccx, ccy, cr, 0, TAU);
          }
          break;
        case 6: // long faint rays of light through the crowd
          n = 48; var rEnd = G.rM * 0.99;
          for (i = 0; i < n; i++) {
            a = i * TAU / n; var r1 = rb * 1.04 + (i % 2) * (rEnd - rb) * 0.18;
            polarTo(c, r1, a, true); polarTo(c, i % 3 === 0 ? rEnd : rEnd * 0.9, a);
          }
          break;
        default: // outer frame: double circle, sixteen bindus, eight small gates
          var r2 = rb + 0.005 * s;
          c.moveTo(rb, 0); c.arc(0, 0, rb, 0, TAU);
          c.moveTo(r2, 0); c.arc(0, 0, r2, 0, TAU);
          for (i = 0; i < 16; i++) {
            a = i * TAU / 16; var br = (i % 2 ? 0.0028 : 0.0045) * s, bx = (rb + 0.0025 * s) * Math.cos(a), by = (rb + 0.0025 * s) * Math.sin(a);
            c.moveTo(bx + br, by); c.arc(bx, by, br, 0, TAU);
          }
          for (i = 0; i < 8; i++) {
            var ag = i * TAU / 8 + TAU / 32, gw2 = 0.007 * s / r2;
            polarTo(c, r2, ag - gw2, true); polarTo(c, r2 + 0.011 * s, ag); polarTo(c, r2, ag + gw2);
          }
          break;
      }
      if (fills) {
        c.fillStyle = rgba(line, 0.75 * alpha); c.fill();
      } else {
        c.strokeStyle = rgba(glow, 0.12 * alpha); c.lineWidth = 3.4; c.stroke();
        c.strokeStyle = rgba(line, 0.55 * alpha); c.lineWidth = 0.9; c.stroke();
      }
      c.restore();
    }
  }

  // ---------------------------------------------------------------- particles
  function drawShaftAndMotes(c, dt) {
    var mv = ez.motes * (END.kind === 'coexist' ? 1 : EO.parts);
    if (mv < 0.004) return;
    if (!shaftCv) buildShaft();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = mv * (0.85 + 0.15 * Math.sin(T * 0.21));
    c.drawImage(shaftCv, 0, 0, W, H);
    c.globalAlpha = 1;
    if (RM()) return;
    var sp = SPR.gold, mo = ez.motion;
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i], x, y, a;
      if (!m.free) {
        m.s -= m.sp * dt * mo;
        m.q += Math.sin(T * 0.3 + m.drift) * 0.04 * dt;
        if (m.q > 1) m.q = 1; if (m.q < -1) m.q = -1;
        if (m.s < -0.02) { m.s = 1.02; m.q = prand() * 2 - 1; }
        var p = shaftGeom(m.s, m.q); x = p[0] + Math.sin(T * 0.4 + m.drift) * 3; y = p[1];
        a = (1 - m.q * m.q) * (0.25 + 0.75 * (1 - m.s)) * 0.75;
      } else {
        m.fy -= m.sp * 0.5 * dt * mo;
        if (m.fy < -0.02) { m.fy = 1.02; m.fx = prand(); }
        x = m.fx * W + Math.sin(T * 0.25 + m.drift) * 8; y = m.fy * H; a = 0.28;
      }
      a *= mv * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(T * m.tf + m.tw)));
      if (a < 0.01) continue;
      var s = m.size * 9;
      c.globalAlpha = a; c.drawImage(sp, x - s / 2, y - s / 2, s, s);
    }
    c.globalAlpha = 1;
  }

  var petalCol = mix(C.rose, C.ink, 0.42);
  function drawPetals(c, dt) {
    var pv = ez.sakura * EO.parts;
    if (pv < 0.004 || RM()) return;
    c.globalCompositeOperation = 'source-over';
    var base = Math.max(4.5, S * 0.0115), mo = Math.max(0.15, ez.motion);
    var lightC = mix(petalCol, C.peach, 0.25 * ez.dawn);
    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.x += p.vx * dt * mo * (900 / Math.max(300, W)); p.y += p.vy * dt * mo * (900 / Math.max(300, H));
      p.rot += p.vr * dt * mo; p.flip += p.vf * dt * mo;
      if (p.x > 1.05 || p.y > 1.05) petals[i] = p = newPetal(prand, false);
      var x = (p.x + Math.sin(T * p.sf + p.ph) * p.sa) * W, y = p.y * H;
      var sz = base * p.size;
      c.save(); c.translate(x, y); c.rotate(p.rot); c.scale(sz * (0.22 + 0.78 * Math.abs(Math.cos(p.flip))), sz);
      c.beginPath();
      c.moveTo(0, 0.95);
      c.bezierCurveTo(0.6, 0.62, 0.66, -0.55, 0.24, -0.95);
      c.lineTo(0, -0.7);
      c.lineTo(-0.24, -0.95);
      c.bezierCurveTo(-0.66, -0.55, -0.6, 0.62, 0, 0.95);
      c.fillStyle = rgba(lightC, p.a * pv);
      c.fill();
      c.beginPath(); c.ellipse(0, -0.2, 0.2, 0.45, 0, 0, TAU);
      c.fillStyle = rgba([255, 236, 240], 0.22 * p.a * pv); c.fill();
      c.restore();
    }
  }

  var confCols = null;
  function drawConfetti(c, dt) {
    var v = ez.festival * ez.vis4 * EO.festival;
    if (v < 0.004 || RM()) return;
    if (!confCols) confCols = [[SPR.gold, C.gold], [SPR.amber, C.amber], [SPR.rose, C.rose], [SPR.teal, C.teal], [SPR.peach, C.peach]];
    c.globalCompositeOperation = 'lighter';
    var mo = ez.motion, base = Math.max(2, S * 0.0042);
    for (var i = 0; i < confetti.length; i++) {
      var p = confetti[i];
      p.y += p.vy * dt * mo; p.rot += p.vr * dt * mo;
      if (p.y > 1.04) confetti[i] = p = newConfetto(prand, false);
      var x = (p.x + Math.sin(T * p.sf + p.ph) * p.sa) * W, y = p.y * H;
      var tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(T * 1.3 + p.tw));
      var a = v * tw * 0.8, cc = confCols[p.col];
      if (p.type === 0) {
        var s = base * p.size * 7;
        c.globalAlpha = a; c.drawImage(cc[0], x - s / 2, y - s / 2, s, s);
      } else {   // a soft four-point glint that swells and fades
        var gl = base * p.size * (1.2 + 2.2 * tw * tw), gs = base * p.size * 4;
        c.globalAlpha = a * 0.7; c.drawImage(cc[0], x - gs / 2, y - gs / 2, gs, gs);
        c.globalAlpha = 1;
        c.strokeStyle = rgba(mix(cc[1], C.white, 0.55), a * 0.55 * tw); c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(x - gl, y); c.lineTo(x + gl, y); c.moveTo(x, y - gl); c.lineTo(x, y + gl); c.stroke();
      }
    }
    c.globalAlpha = 1;
  }

  var emberAcc = 0;
  function drawEmbers(c, dt) {
    var rate = F.rad * ez.vis4 * EO.parts * EO.dots;
    if (RM()) return;
    var mo = ez.motion, i;
    if (rate > 0.01 && nDrawn > 0 && mo > 0.05) {
      emberAcc += dt * 16 * rate;
      while (emberAcc >= 1) {
        emberAcc -= 1;
        for (i = 0; i < embers.length; i++) if (embers[i].age >= embers[i].life) {
          var e = embers[i], j = (prand() * nDrawn) | 0;
          e.x = X[j]; e.y = Y[j]; e.vy = 10 + prand() * 18; e.life = 3 + prand() * 3; e.age = 0;
          e.size = 0.8 + prand() * 1.4; e.sw = prand() * TAU; e.ph = prand() * TAU;
          break;
        }
      }
    }
    c.globalCompositeOperation = 'lighter';
    var vis = EO.parts * EO.dots;
    for (i = 0; i < embers.length; i++) {
      var m = embers[i];
      if (m.age >= m.life) continue;
      m.age += dt * mo; m.y -= m.vy * dt * mo;
      var a = Math.sin(Math.PI * clamp01(m.age / m.life)) * 0.55 * vis;
      if (a < 0.01) continue;
      var s = m.size * 10, x = m.x + Math.sin(m.age * 0.9 + m.sw) * 4;
      c.globalAlpha = a; c.drawImage(SPR.gold, x - s / 2, m.y - s / 2, s, s);
    }
    c.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- backdrop glows
  function drawBackdrop(c) {
    c.globalCompositeOperation = 'lighter';
    var cv3 = F.dotVis;
    /* lighter-blended glows are drawn only while their brightest stop is clear of the 8-bit floor (see rgba) */
    if (cv3 > 0.01 && dotsN > 0 && 0.045 * Math.min(1, dotsN / 300) * cv3 >= 0.02) {
      var fill = Math.min(1, dotsN / 300), rO = G.rOut * 1.18;
      var g = c.createRadialGradient(cx, cy, G.r0 * 0.6, cx, cy, rO);
      var hz = mix(C.rose, C.amber, 0.5);
      g.addColorStop(0, rgba(hz, 0)); g.addColorStop(0.35, rgba(hz, 0.045 * fill * cv3 * (0.8 + 0.2 * BR.Fd)));
      g.addColorStop(1, rgba(hz, 0));
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rO, 0, TAU); c.fill();
    }
    var rad = F.rad * Math.max(EO.dots, 0);
    if (rad > 0.01 && 0.17 * rad >= 0.02) {
      // radiance lives in the crowd: brightest across the spiral, quieter at the centre
      var rr = G.rM * 1.5, q1 = G.r0 / rr, q2 = (G.r0 + G.rM) * 0.5 / rr, q3 = G.rM / rr;
      var g2 = c.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g2.addColorStop(0, rgba(C.gold, 0.05 * rad)); g2.addColorStop(q1 * 0.8, rgba(C.gold, 0.08 * rad));
      g2.addColorStop(q2, rgba(C.amber, 0.17 * rad)); g2.addColorStop(q3, rgba(C.amber, 0.1 * rad));
      g2.addColorStop(Math.min(0.97, q3 + 0.12), rgba(C.peach, 0.035 * rad)); g2.addColorStop(1, rgba(C.peach, 0));
      c.fillStyle = g2; c.beginPath(); c.arc(cx, cy, rr, 0, TAU); c.fill();
    }
  }

  // ---------------------------------------------------------------- endings: merge disc
  function drawMergeDisc(c) {
    var t = EO.mergeT;
    if (t < 0) return;
    var A = 0, inner = G.r0 * G.r0, rO = Math.max(G.rOut, G.r0 + 1);
    var hasDots = dotsN > 0 && ez.vis3 > 0.05;
    for (var k = 0; k < 12; k++) {
      var af = (k + 0.5) / 12, r = Math.sqrt(inner + af * (rO * rO - inner)), u = (r - G.r0) / (rO - G.r0);
      A += easeInOut(clamp01((t - (1.0 + 3.0 * u)) / 3.2));
    }
    A /= 12;
    if (!hasDots) A = easeInOut((t - 1) / 5);
    var grow = easeInOut((t - 7.4) / 5.6);
    var full = Math.sqrt(W * W + H * H) * 0.62;
    var rd = lerp(R * (0.05 + 0.85 * Math.sqrt(A)), full * 1.15, grow);
    var al = smooth01(A * 5 + grow);
    if (al < 0.003) return;
    var hr = rd * 2.6 + R;
    if (0.35 * al >= 0.02) {
      c.globalCompositeOperation = 'lighter';
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, hr);
      g.addColorStop(0, rgba([255, 236, 200], 0.35 * al)); g.addColorStop(0.4, rgba(C.amber, 0.12 * al)); g.addColorStop(1, rgba(C.amber, 0));
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, hr, 0, TAU); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    var g2 = c.createRadialGradient(cx, cy, 0, cx, cy, rd * 1.2);
    g2.addColorStop(0, rgba(WARM_WHITE, al)); g2.addColorStop(0.62, rgba(WARM_WHITE, 0.97 * al));
    g2.addColorStop(0.82, rgba([255, 240, 214], 0.55 * al)); g2.addColorStop(1, rgba([255, 236, 200], 0));
    c.fillStyle = g2; c.beginPath(); c.arc(cx, cy, rd * 1.2, 0, TAU); c.fill();
    if (t > 12) { c.fillStyle = rgba(WARM_WHITE, smooth01((t - 12) / 1.6)); c.fillRect(0, 0, W, H); }
  }

  // ---------------------------------------------------------------- overlays
  function drawOverlays(c, now) {
    var rm = RM();
    var ta = now - fx.alert;
    if (ta >= 0 && ta < 3) {
      var u = ta / 3, env = Math.sin(Math.PI * u);
      c.globalCompositeOperation = 'source-over';
      if (rm) {
        c.fillStyle = rgba(C.thread, 0.13 * env); c.fillRect(0, 0, W, H);
      } else {
        var dx = Math.cos(0.32), dy = Math.sin(0.32), Ld = Math.sqrt(W * W + H * H);
        var pos = lerp(-0.45, 1.45, easeInOut(u)) * Ld - Ld / 2;
        var bxc = cx + dx * pos, byc = cy + dy * pos, hw = Ld * 0.3;
        var g = c.createLinearGradient(bxc - dx * hw, byc - dy * hw, bxc + dx * hw, byc + dy * hw);
        g.addColorStop(0, rgba(C.thread, 0)); g.addColorStop(0.5, rgba(C.thread, 0.2 * (0.5 + 0.5 * env)));
        g.addColorStop(1, rgba(C.thread, 0));
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = rgba(C.threadDark, 0.06 * env); c.fillRect(0, 0, W, H);
      }
    }
    var tf = now - fx.flash;
    if (tf >= 0 && tf < 1.5) {
      var fa = tf < 0.14 ? tf / 0.14 : Math.pow(1 - (tf - 0.14) / 1.36, 2);
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = rgba([255, 246, 228], (rm ? 0.2 : 0.3) * fa); c.fillRect(0, 0, W, H);
    }
  }

  // ---------------------------------------------------------------- render
  function render(dt, now) {
    var c = ctx;
    frameValues(now);
    var dawn = ez.dawn;
    if (END.kind) { dawn = Math.max(dawn, EO.dawnMin); if (EO.dawnOv >= 0) dawn = EO.dawnOv; }
    if (Math.abs(dawn - bgDawn) > 0.004 || (dawn !== bgDawn && (dawn === 0 || dawn === 1))) renderBg(dawn);

    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    if (SO.background !== false) c.drawImage(bgCv, 0, 0, W, H);

    drawShaftAndMotes(c, dt);
    F.dotVis = ez.vis3 * EO.dots;
    if (dotsN > 0) {   // keep the spiral's extent current for backdrop and ornaments before the dots pass
      var cN = cFor(dotsN); G.rOut = Math.max(G.r0 + 1, rOf(Math.max(0, dotsN - 0.5), cN)); G.spacing = Math.sqrt(Math.PI * cN);
    }
    drawBackdrop(c);

    if (F.scale !== 1) { c.translate(cx, cy); c.scale(F.scale, F.scale); c.translate(-cx, -cy); }
    drawOrnaments(c);
    drawDots(c, now, dt);
    drawEmbers(c, dt);
    threadGeometry(now);
    drawThreads(c, now);
    drawFilaments(c, now);
    drawHum(c, now);
    drawWake(c, now);
    drawPlayer(c, now);
    drawRipples(c, now);
    drawLabels(c);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawPetals(c, dt);
    drawConfetti(c, dt);
    drawMergeDisc(c);
    drawOverlays(c, now);

    c.globalCompositeOperation = 'source-over';
    if (EO.vign > 0.003 && SO.vignette !== false) { c.globalAlpha = EO.vign; c.drawImage(vigCv, 0, 0, W, H); }
    c.globalAlpha = 1;
    if (SO.grain !== false) {
      if (!grainPat) grainPat = c.createPattern(grainCv, 'repeat');
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.03;
      c.fillStyle = grainPat; c.fillRect(0, 0, W, H);
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    if (xf) {
      var xu = (now - xf.t0) / xf.dur;
      if (xu < 1) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.globalAlpha = 1 - easeInOut(xu);
        c.drawImage(xf.cv, 0, 0);
        c.globalAlpha = 1;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
  }

  // ---------------------------------------------------------------- loop
  function frame(ts) {
    rafId = requestAnimationFrame(frame);
    var now = (typeof ts === 'number' ? ts : nowSec() * 1000) / 1000;
    var dt = lastTs ? now - lastTs : 1 / 60;
    lastTs = now;
    if (dt < 0) dt = 0; if (dt > 0.1) dt = 0.1;
    NOW = now;
    try {
      if (Math.min(2, Math.max(1, window.devicePixelRatio || 1)) !== dpr) sizeDirty = true;   // moved to another screen
      if (sizeDirty) resize();
      if (W < 2 || H < 2) return;
      update(dt, now);
      render(dt, now);
    } catch (e) {
      if (errCount++ < 3 && window.console) console.error('[EE.visual]', e);
    }
  }

  function onVisibility() {
    if (document.hidden) { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }
    else if (started && !rafId) { lastTs = 0; rafId = requestAnimationFrame(frame); }
  }

  function init(canvas) {
    if (!canvas || !canvas.getContext) return;
    if (cv === canvas && started) return;
    if (ro) { try { ro.disconnect(); } catch (e) { /* ignore */ } ro = null; }
    cv = canvas;
    ctx = guard(cv.getContext('2d', { alpha: false }) || cv.getContext('2d'));
    if (!ctx) return;
    setupStatics();
    // a canvas sized only by its width/height attributes would grow with every DPR resize: pin its CSS size once
    try {
      var w0 = cv.clientWidth, h0 = cv.clientHeight, ow = cv.width;
      cv.width = ow + 8;
      if (cv.clientWidth !== w0) { cv.style.width = w0 + 'px'; cv.style.height = h0 + 'px'; }
      cv.width = ow;
    } catch (e) { /* ignore */ }
    sizeDirty = true;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { sizeDirty = true; });
      ro.observe(cv);
    }
    if (!started) {
      window.addEventListener('resize', function () { sizeDirty = true; });
      document.addEventListener('visibilitychange', onVisibility);
      try {
        var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedAuto = !!mq.matches;
        var onMq = function (e) { reducedAuto = !!e.matches; };
        if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
      } catch (e) { /* ignore */ }
    }
    started = true;
    lastTs = 0;
    if (!rafId && !document.hidden) rafId = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- still (2026-11-13, launch build)
  // The Circle drawn once into `canvas` from a snapshot (the same object set() takes), as if it had been on screen for
  // a while: every eased value settled, the breath at `o.breath`, an ending `o.endT` seconds in. Deterministic: the
  // same snapshot and options draw the same picture. Options:
  //   scale       device pixels per CSS pixel (line widths and dot sizes are laid out in CSS pixels, as on screen)
  //   frame       {x, y, s}: centre and side of the square the Circle is laid out in, CSS px (default: the canvas)
  //   background  false: draw over what is already in the canvas (no stage paper); vignette, grain: false to skip
  //   particles   false: no petals, confetti, shaft of light
  //   breath      0..1, the breath phase (0.5 = fullest); endT: seconds into snapshot.ending (default 14)
  //   ring        'lit': the player's ring is lit even at the finale; motion: 0..1 overrides how much the crowd breathes
  // Returns {perDot, R, cx, cy, extent}: people per dot, the ring's radius and centre, and how far out the drawing goes.
  function still(canvas, snap, o) {
    o = o || {};
    SO = o;
    cv = canvas; ctx = guard(canvas.getContext('2d'));
    reducedForced = false;
    setupStatics();
    dpr = o.scale || 1;
    W = canvas.width / dpr; H = canvas.height / dpr;
    FRAME = o.frame || null;
    sizeCaches();
    var D = 8, dt = 1 / 60, t0 = 1000, t1 = t0 + D;
    setSnapshot(snap);
    if (o.particles === false) { tg.sakura = false; tg.motes = false; tg.festival = false; }
    if (isNum(o.dawn)) tg.dawn = clamp01(o.dawn);
    fx.finaleT0 = t0 - 60;
    if (END.kind) { END.t0 = t1 - (isNum(o.endT) ? o.endT : 14); END.fell = true; }
    xf = null;
    // everything eased is already where it is going
    ez.vis3 = tg.act >= 3 ? 1 : 0; ez.vis4 = tg.act >= 4 ? 1 : 0; ez.win = 0; ez.streak = Math.min(10, tg.streak);
    ez.dawn = tg.dawn; ez.sakura = tg.sakura ? 1 : 0; ez.motes = tg.motes ? 1 : 0; ez.hum = tg.hum ? 1 : 0;
    ez.humSync = tg.humSync; ez.smooth = tg.smooth ? 1 : 0; ez.lf = Math.log(1 + tg.followers);
    for (var k = 0; k < 3; k++) ez.alloc[k] = tg.alloc[k];
    ez.trust = tg.trust; ez.tangle = END.kind ? 0 : tg.tangle; ez.energy = tg.energy; ez.layers = tg.layers;
    ez.festival = tg.festival ? 1 : 0; ez.finale = tg.finale ? 1 : 0; ez.tension = ez.tangle / 12;
    ez.lit = tg.finale ? 0 : 1; ez.motion = tg.finale && !END.kind ? 0.3 : 1; ez.labels = tg.followers < 100 ? 1 : 0;
    // people per dot, as update() would arrive at it, with no fold in progress
    var f = Math.exp(ez.lf) - 1, np = 1;
    if (f < 0.001) f = 0;
    while (f / np > DOT_CAP && np < 1e12) np *= 10;
    while (np > 1 && f / np < DOT_CAP / 10 * 0.95) np /= 10;
    P = np; followersNow = f; dotsN = f / P; fold = null;
    geometry(); settleDots(dotsN);
    // the breath, run backwards from where it should end, so that D seconds later it is there
    var target = isNum(o.breath) ? o.breath : 0.5, p = target;
    for (var i = 0; i < D / dt; i++) { p -= freeRate(p) * dt; p -= Math.floor(p); }
    BR.have = false; BR.auto = 1; BR.rate = 0; BR.phase = p; BR.po = 0; BR.pv = 0; BR.disp = p;
    hT = -1;
    var lit = o.ring === 'lit';
    for (i = 0; i < D / dt; i++) {
      var now = t0 + (i + 1) * dt;
      NOW = now;
      update(dt, now);
      if (lit) ez.lit = 1;
      if (isNum(o.motion)) ez.motion = clamp01(o.motion);
    }
    knotScanT = -99;
    render(dt, t1);
    var ext = G.rOut * 1.18;
    if (ez.layers * ez.vis4 > 0.05 && EO.orn > 0.05) ext = Math.max(ext, ornRadius(Math.min(7, Math.ceil(ez.layers * ez.vis4) - 1)) + 0.03 * S);
    return { perDot: P, R: R, cx: cx, cy: cy, extent: ext * EO.radMul > 0 ? ext : R * 1.6, S: S };
  }

  function safe(fn, fallback) {
    return function () {
      try { return fn.apply(null, arguments); }
      catch (e) { if (errCount++ < 3 && window.console) console.error('[EE.visual]', e); return fallback; }
    };
  }

  var api = {
    __circle: true,
    init: safe(init),
    set: safe(setSnapshot),
    pulse: safe(pulse),
    ring: safe(function () {
      if (cv && (W < 2 || sizeDirty)) {
        var w = cv.clientWidth || 0, h = cv.clientHeight || 0;
        if (w > 1 && h > 1) { var s = Math.min(w, h); return { x: w / 2, y: h / 2, r: Math.max(44, 0.13 * s) }; }
      }
      return { x: cx, y: cy, r: R };
    }, { x: 0, y: 0, r: 44 }),
    legend: safe(function () { return P; }, 1),
    __fixes: function () { return FIXES; },      /* dev: how many values the guarded context had to change */
    onLegend: null,
    setReducedMotion: safe(function (b) {
      reducedForced = (b === null || b === undefined) ? null : !!b;
    })
  };
  if (STILL) api.__still = still;   // still
  return api;
  }   // makeCircle

  EE.visual = makeCircle(false);
  EE.visual.still = function (canvas, snapshot, opts) { return makeCircle(true).__still(canvas, snapshot, opts); };
})();
