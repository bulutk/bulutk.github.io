/* The Enlightenment Engine — the game: state, clock, events, saving, dev tools.
 * The rules live in economy.js (pure); the page lives in ui.js. This file joins them, feeds the picture
 * (EE.visual) and the sound (EE.audio) through guards, and keeps the save.
 */
(function () {
  'use strict';
  var EE = window.EE, E = EE.econ, D = EE.data, ST = EE.story, UI = EE.ui;
  var G = EE.game = {};
  var KEY = 'ee.save.v2', MUTE_KEY = 'ee.muted';
  var params = new URLSearchParams(location.search);
  G.dev = params.get('dev') === '1';
  G.fresh = params.get('fresh') === '1';
  G.speed = 1; G.fastText = false; G.paused = false; G.bt = 0; G.cyc = 0; G.muted = false; G.s = null;

  /* ───────────── guards for the picture and the sound ───────────── */
  var warned = {};
  function guard(mod, name, args) {
    var m = EE[mod];
    if (!m || typeof m[name] !== 'function') return undefined;
    try { return m[name].apply(m, args); }
    catch (e) { if (!warned[mod + name]) { warned[mod + name] = 1; if (window.console) console.warn('EE.' + mod + '.' + name + ' threw', e); } return undefined; }
  }
  G.V = function (name) { return guard('visual', name, Array.prototype.slice.call(arguments, 1)); };
  G.A = function (name) { return guard('audio', name, Array.prototype.slice.call(arguments, 1)); };

  /* Reading speed: text keeps a human pace even when the dev clock runs fast. */
  G.pace = function () { return G.fastText ? 40 : Math.min(8, Math.max(1, G.speed)); };
  G.rates = function () { return G._rates || (G._rates = E.rates(G.s)); };

  /* analytics (js/track.js): nothing happens unless the website build turned it on; never player text */
  function track(name, params) { if (EE.track) EE.track(name, params); }
  function minutes(s) { return s.t / 60; }        /* minutes of play: the world clock, which stops while the tab is away */

  G.humSpeak = function (text) {
    G.V('pulse', 'hum');
    G.A('hum', 1 + text.length / 40, E.voice(G.s) === 'smooth');
  };

  /* ───────────── journal ───────────── */
  G.log = function (text, quiet, delay, join, kind) {
    var s = G.s, e = { d: Math.floor(s.day), x: text };
    if (kind) e.k = kind;
    s.journal.push(e);
    if (s.journal.length > 420) {
      for (var i = 0; i < s.journal.length && s.journal.length > 360; i++) if (!s.journal[i].s) { s.journal.splice(i, 1); i--; }
    }
    if (join != null) Object.defineProperty(e, '_j', { value: join, enumerable: false });
    if (delay) setTimeout(function () { if (G.s === s) UI.journalAdd(e, quiet); }, delay);
    else UI.journalAdd(e, quiet);
  };
  G.logLines = function (lines) { for (var i = 0; i < lines.length; i++) G.log(lines[i], true); };
  G.star = function (entry) {
    if (entry.s) { delete entry.s; return; }
    if (G.s.journal.filter(function (j) { return j.s; }).length >= 7) return;
    entry.s = 1;
  };

  /* ───────────── events from the rules ───────────── */
  function handle(out, quiet) {
    var s = G.s, afterAct = false, join = null, i, e;
    for (i = 0; i < out.length; i++) {
      e = out[i];
      switch (e.type) {
        case 'log':
          G.log(e.text, (quiet && !afterAct) || !!e.kind, afterAct && !e.kind ? 3000 / G.pace() : 0, join, e.kind);
          join = null;
          break;
        case 'join': join = e.i; break;
        case 'fx':
          if (e.pulse === 'join') break;            /* the page plays it when the name is read out */
          if (e.pulse) G.V('pulse', e.pulse, e.opts || undefined);
          if (e.play) G.A('play', e.play, e.opts || undefined);
          break;
        case 'bead': G.A('play', 'bead'); UI.beadToast(e.id); break;
        case 'act': afterAct = true; G.A('setAct', e.n); UI.actChanged(e.n); track('act_reached', { act: e.n, minutes: minutes(s) }); break;
        case 'collapse': track('collapse', { act: s.act }); break;
        case 'unlock':
          if (e.what === 'ambient') G.A('setAmbient', true);
          break;
        case 'float': UI.float(e.res, e.amt); break;
        case 'orb': UI.spawnOrb(false); break;
        case 'lotus': UI.spawnOrb(true); break;
        case 'swell': G.A('swell'); break;
        case 'finale': G.V('set', { finale: true }); G.A('silence', 3); UI.closeCard(true); break;
        default: break;
      }
    }
    G._rates = null;
  }
  G.handle = handle;

  /* ───────────── what the player does ───────────── */
  var pressTimes = [], still = 0, devCyc = 1e6;

  G.press = function (forceOn) {
    var s = G.s;
    if (G.paused || G.held || (s.phase !== 'play' && s.phase !== 'final')) return null;
    G.unlockSound();
    var out = [], bt = G.bt;
    if (forceOn) { devCyc += 1; bt = devCyc * D.breath.period + D.breath.inhale; }
    var before = s.streak, res = E.press(s, bt, out);
    if (!res) return null;
    G.V('pulse', 'press', { onBreath: res.on });
    G.A('press', { onBreath: res.on, streak: res.on ? before : s.streak });
    if (res.res === 'followers' && res.amt >= 1 && s.joined >= 12) { G.V('pulse', 'join', { n: Math.min(24, Math.round(res.amt)) }); G.A('play', 'join'); }
    UI.pressFx(res);
    handle(out);
    still = 0;
    if (s.clicks === 1) { UI.clearNudges(); track('first_press'); }
    var t = performance.now();
    pressTimes.push(t);
    while (pressTimes.length && t - pressTimes[0] > 3000) pressTimes.shift();
    if (pressTimes.length > 18 && !s.flags.restless) { out = []; E.restless(s, out); handle(out); }
    return res;
  };

  G.buy = function (id) {
    var out = [];
    if (!E.buy(G.s, id, out)) return false;
    G.unlockSound();
    handle(out);
    UI.sync(true);
    return true;
  };
  G.buyMax = function (id) {
    var out = [], n = E.buyMax(G.s, id, out);
    if (n) { handle(out); UI.sync(true); }
    return n;
  };
  G.setAlloc = function (k, v) { E.setAlloc(G.s, k, v); G.s.flags.allocTouched = 1; G._rates = null; };
  G.confess = function () { var out = []; if (E.confessAll(G.s, out)) { track('tell_everything', { act: G.s.act }); handle(out); } };
  G.catchOrb = function () { var out = []; E.catchOrb(G.s, out); handle(out); still = 0; };
  G.catchLotus = function () { var out = []; E.catchLotus(G.s, out); handle(out); still = 0; };

  /* Resolve the card at the head of the queue. */
  G.answer = function (choice, loud) {
    var s = G.s, out = [], card = s.queue[0], cleared = s.counts.cleared;
    var lines = E.resolve(s, choice, out);
    if (card && card.k === 'person' && s.person && s.person.named) track('person_named');
    else if (card && card.k === 'knot' && s.counts.cleared > cleared) track('knot_confessed', { act: s.act });
    else if (card && card.k === 'final') track('ending', { kind: s.ending, tangled: !s.endClean, minutes: minutes(s), days: Math.floor(s.day) });
    handle(out, !loud);            /* loud: the card is gone, so its lines are read out on the stage instead */
    still = 0;
    G.save();
    return { lines: lines, card: card };
  };

  /* A card has just come up on the page. */
  G.cardShown = function (card) {
    var out = [];
    if (card.k === 'thought') G.A('play', 'thought');
    else G.A('play', 'card');
    if (card.k === 'decision' && card.id === 'h_ministry') { G.V('pulse', 'alert'); G.A('play', 'alert'); }
    if (card.k === 'knot') { G.V('pulse', 'knot'); G.A('play', 'knot'); E.seeLedger(G.s, out); handle(out); }
  };
  G.seqStart = function (card) {
    var s = G.s;
    if (card.id === 'ending') {
      s.flags.endingOn = 1;
      G.V('set', { ending: s.ending });
      G.A('ending', s.ending);
    }
    if (card.id === 'confession') { G.A('play', 'card'); }
  };

  var lastTick = [];
  G.tickerLine = function () {
    var s = G.s, pool = ST.act3.ticker.slice();
    if (s.flags.art) pool = pool.concat(ST.act4.art);
    UI.tickerN = (UI.tickerN || 0) + 1;
    if (E.voice(s) === 'smooth' && UI.tickerN % 3 === 0) pool = ST.act3.tickerSmooth.slice();
    var free = pool.filter(function (l) { return lastTick.indexOf(l) < 0; });
    if (!free.length) free = pool;
    var line = free[Math.floor(Math.random() * free.length)];
    lastTick.push(line);
    if (lastTick.length > 8) lastTick.shift();
    return E.text(s, line);
  };

  /* ───────────── sound ───────────── */
  var unlocked = false;
  G.unlockSound = function () {
    if (unlocked) return;
    unlocked = true;
    G.A('setMuted', G.muted);
    G.A('unlock');
    G.A('setAct', G.s.act);
    if (G.s.up.ambient && G.s.phase === 'play') G.A('setAmbient', true);
  };
  G.toggleSound = function () {
    G.muted = !G.muted;
    try { localStorage.setItem(MUTE_KEY, G.muted ? '1' : '0'); } catch (e) { /* private mode */ }
    G.A('setMuted', G.muted);
  };

  /* ───────────── saving ───────────── */
  function fix(s) {
    var d = E.newRun(s.meta || E.newMeta(), s.seed), k, j;
    for (k in d) {
      if (s[k] === undefined || s[k] === null && d[k] !== null) s[k] = d[k];
      else if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]) && typeof s[k] === 'object') for (j in d[k]) if (s[k][j] === undefined) s[k][j] = d[k][j];
    }
    ['clarity', 'insight', 'followers', 'energy'].forEach(function (r) { if (!isFinite(s.res[r]) || s.res[r] < 0) s.res[r] = 0; });
    if (!Array.isArray(s.queue)) s.queue = [];
    if (!Array.isArray(s.journal)) s.journal = [];
    if (!Array.isArray(s.ledger)) s.ledger = [];
    /* a sitting that is past the bar but lost its card: put it back */
    if (!s.queue.length) {
      if (s.phase === 'finale') s.queue.push({ k: 'seq', id: 'finale' });
      else if (s.phase === 'final') s.queue.push({ k: 'final' });
      else if (s.phase === 'ending') s.queue.push({ k: 'seq', id: 'ending' });
      else if (s.phase === 'keepsake') s.queue.push({ k: 'keepsake' });
    }
    return s;
  }
  G.save = function () {
    if (!G.s) return;
    var o = { v: 2, at: Date.now(), s: G.s };
    if (G.held) o.held = 1;           /* saved during a dev pause: that time is not time away */
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage full or blocked: play on */ }
  };
  function parse(raw) {
    try {
      var o = JSON.parse(raw);
      if (!o || o.v !== 2 || !o.s || o.s.v !== 2 || !o.s.res || !o.s.meta) return null;
      o.s = fix(o.s);
      return o;
    } catch (e) { return null; }
  }
  G.exportSave = function () {
    var json = JSON.stringify({ v: 2, at: Date.now(), s: G.s });
    return btoa(unescape(encodeURIComponent(json)));
  };
  G.importSave = function (text) {
    var o = null;
    try { o = parse(decodeURIComponent(escape(atob(String(text).trim())))); } catch (e) { o = null; }
    if (!o) return false;
    adopt(o.s);
    begin();
    G.save();
    return true;
  };
  G.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* fine */ }
    adopt(E.newRun(E.newMeta(), Date.now() >>> 0));
    begin();
    G.save();
  };
  G.sitAgain = function () {
    track('sit_again');
    adopt(E.sitAgain(G.s));
    begin();
    G.save();
  };

  /* Take a state as the current one and bring the page, picture and sound into line. */
  function adopt(s) {
    G.s = s; G._rates = null; still = 0; acc = 0; lastTick = [];
    NUDGE.ring = 0; NUDGE.aff = { id: null, t: 0 }; NUDGE.alloc = 0;
    UI.reset();
    G.A('setAct', s.act);
    G.A('setAmbient', !!s.up.ambient && s.phase === 'play');
    snapshot(true);
  }
  function begin() {
    var s = G.s;
    if (s.clicks === 0 && s.act === 1 && s.phase === 'play') {
      G.paused = true; G.bt = 0; G.cyc = 0;
      UI.playIntro(function () { G.paused = false; G.bt = 0; G.cyc = 0; still = 0; NUDGE.ring = 0; });
    } else { G.paused = false; UI.noIntro(); }
  }

  function offline(secs) {
    var s = G.s, o = D.small.offline;
    if (G.held) return;                                   /* a dev pause is not time away */
    if (secs < o.after || s.phase !== 'play' || s.clicks === 0) return;
    var used = E.offline(s, secs), m = Math.round(used / 60);
    var n = m >= 90 ? ST.build.hours.replace('{n}', String(Math.round(m / 60))) : ST.build.mins.replace('{n}', String(Math.max(1, m)));
    var p = document.createElement('span');
    p.textContent = ST.ui.offline.replace('{n}', n);
    UI.toast([p], 6000);
    G._rates = null;
  }

  /* ───────────── nudges: only for a player who has not found something yet (text: story.nudges) ───────────── */
  var NUDGE = { ring: 0, aff: { id: null, t: 0 }, alloc: 0 };
  function nudgeState(s) { return s.nudge || (s.nudge = { press: 0, still: 0, timing: 0, up: 0, ids: {}, panel: {} }); }
  function whereText(line) { return line.replace('{where}', ST.nudges.where[UI.wide ? 'wide' : 'narrow']); }
  function nudgeTick(dt) {
    var s = G.s, n = nudgeState(s), N = ST.nudges, C = D.small.nudge;
    if (G.paused || s.phase !== 'play' || document.hidden) return;
    /* 1. the ring has never been pressed */
    if (s.clicks === 0 && s.act === 1) {
      NUDGE.ring += dt;
      while (n.press < N.press.length && NUDGE.ring >= N.press[n.press].after) { UI.nudge(N.press[n.press].line); n.press += 1; }
      return;
    }
    if (UI.card || UI.reader) return;                 /* busy with something else: no nudging, and the clocks wait */
    /* 2. plenty of presses, none of them on the breath */
    if (!n.timing && s.clicks >= C.timingAfter && s.breaths === 0) {
      n.timing = 1;
      UI.nudge(N.timing);
      UI.guideUntil = performance.now() + C.guideCycles * D.breath.period * 1000;
    }
    /* 3 and 4. something affordable has been left alone */
    var items = E.items(s).filter(function (it) { return it.can && !it.owned; });
    var target = null, kind = null, g = D.act2.gens;
    function first(grps) { for (var i = 0; i < items.length; i++) if (grps.indexOf(items[i].grp) >= 0) return items[i]; return null; }
    if (s.act === 1) { kind = 'up'; target = first(['practice']); }
    else if (s.act === 2 && !n.panel.hum && !Object.keys(g).some(function (id) { return s.up[id]; })) { kind = 'hum'; target = first(['head', 'heart']); }
    else if (s.act === 3 && !n.panel.circle && !s.up.meetup) { kind = 'circle'; target = first(['circle']); }
    else if (s.act === 4 && !n.panel.engine && s.bought4 === 0) { kind = 'engine'; target = first(['engine']); }
    if (target && NUDGE.aff.id === target.id) NUDGE.aff.t += dt;
    else NUDGE.aff = { id: target ? target.id : null, t: 0 };
    if (target && kind === 'up') {
      if (n.up < N.upgrade.length && !n.ids[target.id] && NUDGE.aff.t >= C.upgrade) {
        n.ids[target.id] = 1;
        UI.nudge(whereText(N.upgrade[n.up]));
        n.up += 1;
        UI.pointAt('[data-id="' + target.id + '"]');
      }
    } else if (target && NUDGE.aff.t >= C.panel) {
      n.panel[kind] = 1;
      UI.nudge(whereText(N.panel));
      UI.pointAt('[data-id="' + target.id + '"]');
    }
    if (s.flags.alloc && !s.flags.allocTouched && !n.panel.alloc && s.act === 3) {
      NUDGE.alloc += dt;
      if (NUDGE.alloc >= C.alloc) { n.panel.alloc = 1; UI.nudge(whereText(N.panel)); UI.pointAt('.alloc'); }
    }
  }

  /* ───────────── the picture ───────────── */
  /* What the picture shows of a run (the object EE.visual.set takes, without the breath). Also what the share card
   * and the printable picture draw: `s.align` keeps it as it stood at the Final Alignment, threads and all. */
  G.circleState = function (s, finale) {
    var r = s === G.s ? G.rates() : E.rates(s), names = [], n = Math.min(12, s === G.s ? (UI.namesShown || 0) : s.joined || 0), i;
    for (i = 0; i < n; i++) names.push({ name: s.flags.merged ? ST.build.we : ST.act3.circle[i].name });
    return {
      act: s.act, streak: s.streak,
      dawn: Math.min(1, s.tot.clarity / D.act1.dawnAt),
      sakura: !!s.flags.sakura, motes: !!s.flags.motes,
      hum: !!s.flags.hum, humSync: Math.min(1, s.tot.insight / D.act2.project.at),
      smooth: E.voice(s) === 'smooth',
      followers: s.act >= 3 ? Math.floor(s.res.followers) : 0, named: names,
      alloc: { outreach: s.alloc.outreach, sitting: s.alloc.sitting, support: s.alloc.support },
      trust: Math.min(10, s.trust), tangle: Math.min(12, r.T),
      energy: s.tot.energy > 0 ? Math.max(0, Math.min(1, Math.log10(1 + s.tot.energy) / Math.log10(D.act4.energyTop))) : 0,
      layers: s.bought4, festival: !!s.flags.festival,
      finale: finale != null ? !!finale : s.phase !== 'play',
      ending: finale != null ? null : (s.flags.endingOn || s.phase === 'keepsake') ? s.ending : null
    };
  };
  function snapshot(full) {
    var s = G.s, P = D.breath.period, breath = E.breathPhase(G.bt);
    var canPress = !G.paused && !G.held && (s.phase === 'play' || s.phase === 'final');
    var inWin = canPress && E.inWindow(s, G.bt) && s.lastOnCycle !== Math.floor(G.bt / P);
    G.breath = breath; G.inWin = inWin;
    if (!full) { G.V('set', { breath: breath, inWindow: inWin, streak: s.streak }); return; }
    var v = G.circleState(s);
    v.breath = breath; v.inWindow = inWin;
    /* the Circle as it stood at the Final Alignment, kept for the card and the picture */
    if (s.phase === 'final' && !s.align) { s.align = G.circleState(s, true); }
    G.V('set', v);
  }

  /* ───────────── the clock ───────────── */
  var last = 0, acc = 0, snapAcc = 0, saveAcc = 0;
  G.held = false;
  function frame(t) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.5, (t - last) / 1000);
    last = t;
    if (!(dt > 0)) return;
    G._rates = null;
    var s = G.s, out = [], n = 0;
    if (!G.paused && !G.held) {
      G.bt += dt;
      var P = D.breath.period, cyc = Math.floor(G.bt / P);
      G.cyc = cyc;
      /* Heartbeat Loop: if the fullest point goes by untouched, Hum takes the breath, just after it */
      if (s.up.heartbeat && s.clicks > 0 && G.humCyc !== cyc && (G.bt % P) > D.breath.inhale + E.window(s) + 0.1) {
        G.humCyc = cyc;
        var hp = E.cycleEnd(s, cyc, out);
        if (hp) { G.V('pulse', 'press', { onBreath: true }); G.A('press', { onBreath: true, streak: s.streak }); UI.pressFx(hp, true); }
      }
      acc += dt * G.speed;
      while (acc >= 0.1 && n < 300) { E.tick(s, 0.1, out); acc -= 0.1; n++; }
      if (acc > 1) acc = 0;
      still += dt;
      if (still >= D.small.stillness.after && s.phase === 'play' && !document.hidden) {
        still = 0;
        E.stillness(s, out);
        handle(out); out = [];
        var ns = nudgeState(s);
        if (s.clicks === 0 && !ns.still) { ns.still = 1; UI.nudge(ST.nudges.pressAfterStill); }
      }
      if (out.length) handle(out);
      nudgeTick(dt);
    }
    snapAcc += dt;
    if (snapAcc >= 0.1) { snapAcc = 0; snapshot(true); } else snapshot(false);
    UI.frame(dt, G.breath, G.inWin);
    saveAcc += dt;
    if (saveAcc >= 5) { saveAcc = 0; G.save(); }
  }

  var hiddenAt = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { hiddenAt = Date.now(); G.save(); }
    else if (hiddenAt) { var away = (Date.now() - hiddenAt) / 1000; hiddenAt = 0; last = performance.now(); offline(away); }
  });
  window.addEventListener('pagehide', function () { G.save(); });
  document.addEventListener('pointerdown', function () { if (G.s && G.s.clicks > 0) G.unlockSound(); }, true);

  /* ───────────── dev tools (?dev=1, mirrored as EE.dev) ───────────── */
  EE.dev = {
    speed: function (n) { n = +n; G.speed = isFinite(n) && n >= 0 ? n : 1; return G.speed; },
    fast: function (b) { G.fastText = !!b; return G.fastText; },
    state: function () { return G.s; },
    press: function (onBreath) { return G.press(onBreath !== false); },
    grant: function (res, amt) {
      var s = G.s;
      if (!(res in s.res)) return false;
      s.res[res] = Math.min(res === 'followers' ? D.K * 0.99 : Infinity, s.res[res] + amt);
      if (res in s.tot) s.tot[res] += amt;
      G._rates = null;
      return s.res[res];
    },
    /* run the world forward with all its events */
    skip: function (secs) { var out = []; for (var i = 0; i < secs * 10; i++) E.tick(G.s, 0.1, out); handle(out); },
    /* let real time pass for the nudge and stillness clocks only (the world stands still) */
    wait: function (secs) { for (var i = 0; i < secs; i++) nudgeTick(1); still += secs; },
    card: function (c) { G.s.queue.push(c); },
    /* jump to the start of an act, late Act IV, the finale or the Final Alignment, played there by a bot.
     * policy: 'plain' | 'mixed' | 'smooth' (the last two arrive with a ledger). */
    jump: function (where, policy) {
      var meta = G.s ? G.s.meta : E.newMeta();
      var b = E.bot(policy || 'plain', { instant: true, meta: meta, seed: (Date.now() & 0xffffff), holdAt: where === 'finale' ? 'finale' : null,
        onEvent: function (e, bot) { if (e.type === 'log') bot.s.journal.push({ d: Math.floor(bot.s.day), x: e.text }); } });
      var until = {
        act1: function () { return true; },
        act2: function (x) { return x.s.act >= 2; },
        act3: function (x) { return x.s.act >= 3; },
        act3b: function (x) { return x.s.act >= 3 && x.s.joined >= 12; },      /* Act III once the first twelve are in */
        act4: function (x) { return x.s.act >= 4; },
        late4: function (x) { return x.s.act >= 4 && x.s.res.followers > D.K * 0.97 && x.s.bought4 >= 7; },
        finale: function (x) { return x.s.phase !== 'play'; },
        'final': function (x) { return x.s.phase === 'final'; }
      }[where];
      if (!until) return false;
      b.run(until, 4 * 3600);
      var s = b.s;
      if (s.journal.length > 300) s.journal = s.journal.slice(-300);
      s.queue = s.queue.filter(function (c) { return c.k !== 'thought'; });
      adopt(s);
      begin();
      G.save();
      return where;
    },
    save: function () { G.save(); return true; },
    /* ?dev=1 only: hold the whole game clock (production, the breath, the day, every timer on the page) and let it go
     * again at the speed it had. There is no pause of any kind without ?dev=1. */
    pause: function () {
      if (!G.dev || G.held) return !!G.held;
      G.held = true; G.heldAt = performance.now();
      if (UI.clock) UI.clock.pause();
      G.save();
      if (UI.devPanel) UI.devPanel();
      return true;
    },
    resume: function () {
      if (!G.held) return false;
      var away = performance.now() - G.heldAt;
      G.held = false;
      if (UI.clock) UI.clock.resume(away);
      last = performance.now();
      G.save();
      if (UI.devPanel) UI.devPanel();
      return true;
    },
    paused: function () { return !!G.held; }
  };

  /* ───────────── start ───────────── */
  function start() {
    UI.init(G);
    try { G.muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { G.muted = false; }
    UI.syncSound();
    var saved = null, raw = null;
    if (!G.fresh) { try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; } if (raw) saved = parse(raw); }
    G.s = saved ? saved.s : E.newRun(E.newMeta(), Date.now() >>> 0);
    /* returning: this browser has played before (a run in progress, or one finished); only that yes/no is sent */
    track('game_start', { lang: EE.i18n ? EE.i18n.code : 'en', returning: !!(saved && (saved.s.clicks > 0 || saved.s.meta.runs > 0 || saved.s.meta.lastRun)) });

    if (EE.visual && typeof EE.visual.init === 'function') {
      try { EE.visual.init(document.getElementById('cv')); } catch (e) { UI.useFallback = true; if (window.console) console.warn('EE.visual.init threw', e); }
    } else UI.useFallback = true;

    G.A('setMuted', G.muted);
    adopt(G.s);
    begin();
    if (saved && saved.at && !saved.held) offline((Date.now() - saved.at) / 1000);
    if (G.dev) UI.devPanel();
    last = performance.now();
    requestAnimationFrame(frame);
  }
  /* the language comes first (js/lang.js loads the chosen one, if it is not English), then the game */
  function boot() { if (EE.i18n) EE.i18n.ready(start); else start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
