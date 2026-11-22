/* The Enlightenment Engine — the game: state, clock, events, saving, dev tools.
 * The rules live in economy.js (pure); the page lives in ui.js. This file joins them, feeds the picture
 * (EE.visual) and the sound (EE.audio) through guards, and keeps the save.
 */
(function () {
  'use strict';
  var EE = window.EE, E = EE.econ, D = EE.data, ST = EE.story, UI = EE.ui, X = EE.dir;
  var G = EE.game = {};
  /* Saves (2026-11-19, EE-105): this build keeps its run under ee.save.v3. With no v3 save, a v2 save (the build before
   * round 2, which may be live on the same site) is copied and migrated; the v2 key itself is never changed or deleted,
   * so both builds can share an origin. */
  var KEY = 'ee.save.v3', OLD_KEY = 'ee.save.v2', MUTE_KEY = 'ee.muted';
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
  /* The Journal. A line the director holds (n: its number) is written now and shown in the Journal when it is said
   * (or when the director sends it straight there); `q` marks it as still waiting. Everything else appears at once. */
  var byN = {};
  G.log = function (text, quiet, n, join, kind) {
    var s = G.s, e = { d: Math.floor(s.day), x: text };
    if (kind) e.k = kind;
    if (n != null) { e.n = n; e.q = 1; byN[n] = e; }
    s.journal.push(e);
    if (s.journal.length > 420) {
      for (var i = 0; i < s.journal.length && s.journal.length > 360; i++) if (!s.journal[i].s && !s.journal[i].q) { s.journal.splice(i, 1); i--; }
    }
    if (join != null) Object.defineProperty(e, '_j', { value: join, enumerable: false });
    if (n == null) UI.journalAdd(e);
    return e;
  };
  G.entry = function (n) {
    var e = byN[n];
    if (e && G.s.journal.indexOf(e) >= 0) return e;
    for (var i = G.s.journal.length - 1; i >= 0; i--) if (G.s.journal[i].n === n) return (byN[n] = G.s.journal[i]);
    return null;
  };
  /* (EE-108, eye pass item 8) its day is the day it is shown in the Journal, so the Journal's days never go backwards */
  function released(e) { if (e && e.q) { delete e.q; e.d = Math.max(e.d, Math.floor(G.s.day)); UI.journalAdd(e); } }
  G.logLines = function (lines) { for (var i = 0; i < lines.length; i++) G.log(lines[i], true); };
  G.star = function (entry) {
    if (entry.s) { delete entry.s; return; }
    if (G.s.journal.filter(function (j) { return j.s; }).length >= 7) return;
    entry.s = 1;
  };

  /* ───────────── events from the rules ───────────── */
  function handle(out) {
    var s = G.s, join = null, i, e, en;
    for (i = 0; i < out.length; i++) {
      e = out[i];
      switch (e.type) {
        case 'log':
          en = G.log(e.text, true, e.q ? e.n : null, join, e.kind);
          if (e.bold) en.b = e.bold;                       /* a bead: its name in bold */
          join = null;
          break;
        /* the director (js/director.js): what is said, where, and when */
        case 'show':
          if (e.place === 'card') break;                   /* the page follows s.dir.card (UI.sync) */
          /* a line said in the voice slot enters the Journal when it has been typed out, never before (EE-108) */
          if (e.n != null) { en = G.entry(e.n); if (!en) break; e.text = en.x; if (en._j != null) e.join = en._j; e.release = released.bind(null, en); }
          else if (e.j) e.release = G.log.bind(null, e.text, true, null, null, null);
          if (e.place === 'voice') UI.voice(e);
          else { if (e.release) e.release(); UI.caption(e); }
          break;
        case 'dim': UI.voiceDim(); break;
        case 'unshow': UI.voiceOut(); break;
        case 'end': UI.captionOut(); break;
        case 'journal': released(G.entry(e.n)); break;
        case 'hint': UI.hint(e.tg); break;
        case 'join': join = e.i; break;
        case 'fx':
          if (e.pulse === 'join') break;            /* the page plays it when the name is read out */
          if (e.pulse) G.V('pulse', e.pulse, e.opts || undefined);
          if (e.play) G.A('play', e.play, e.opts || undefined);
          break;
        case 'bead': G.A('play', 'bead'); break;         /* its words come through the director, in the voice slot */
        case 'act': G.A('setAct', e.n); UI.actChanged(e.n); track('act_reached', { act: e.n, minutes: minutes(s) }); break;
        /* round 2, bundle C: Hum learns from you */
        case 'lean': UI.leanChanged(e.band); break;
        case 'draft': UI.draftTick(e.left); break;
        case 'sit': UI.sitEvent(e); if (e.done) track('knot_confessed', { act: s.act }); break;
        case 'mark': G.V('pulse', 'knot'); break;
        case 'friend': break;
        case 'unlock':
          if (e.what === 'ambient') G.A('setAmbient', true);
          break;
        case 'lit': G.V('pulse', 'lit', { who: e.who }); G.A('play', 'join'); break;
        case 'float': UI.float(e.res, e.amt); break;
        case 'orb': UI.spawnOrb(false); break;
        case 'lotus': UI.spawnOrb(true); break;
        case 'swell': G.A('swell'); break;
        case 'finale': G.V('set', { finale: true }); G.A('silence', 3); UI.closeCard(true); UI.voiceOut(); UI.captionOut(); UI.hint(null); break;
        default: break;
      }
    }
    G._rates = null;
  }
  G.handle = handle;

  /* ───────────── what the player does ───────────── */
  var still = 0, devCyc = 1e6;

  G.press = function (forceOn) {
    var s = G.s;
    if (G.paused || G.held || (s.phase !== 'play' && s.phase !== 'final' && !(s.phase === 'ending' && s.flags.confessing))) return null;
    G.unlockSound();
    var out = [], bt = G.bt;
    if (forceOn) { devCyc += 1; bt = devCyc * E.period(s) + E.inhale(s); }
    var before = s.streak, res = E.press(s, bt, out);
    if (!res) return null;
    /* the first press of a run restarts the breath from that instant: it is the fullest point */
    if (res.restart && !forceOn) { G.bt = E.inhale(s); G.cyc = 0; }
    G.V('pulse', 'press', { onBreath: res.on, kind: res.kind });
    G.A('press', { onBreath: res.on, streak: res.on ? before : s.streak, together: !!res.together });
    if (res.res === 'followers' && res.amt >= 1 && s.joined >= 12) { G.V('pulse', 'join', { n: Math.min(24, Math.round(res.amt)) }); G.A('play', 'join'); }
    UI.pressFx(res);
    handle(out);
    if (res.kind === 'gold' && UI.confessBreath) UI.confessBreath();      /* the confession is breathed, one line a gold press */
    still = 0;
    if (s.clicks === 1) track('first_press');
    return res;
  };
  /* a row hovered or focused: the player is looking right; nothing unasked arrives for a moment */
  G.hover = function () { if (G.s && G.s.phase === 'play') X.busy(G.s); };
  /* the card (or sequence) on the stage has gone */
  G.cardClosed = function (k, id) { if (G.s && G.s.phase === 'play') X.closed(G.s, k, id); };

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
  G.catchOrb = function () { var out = []; E.catchOrb(G.s, out); handle(out); still = 0; };
  G.catchLotus = function () { var out = []; E.catchLotus(G.s, out); handle(out); still = 0; };

  /* Resolve the card at the head of the queue. */
  G.answer = function (choice, loud) {
    var s = G.s, out = [], card = s.queue[0], cleared = s.counts.cleared;
    if (loud) choice = Object.assign({ loud: true }, choice);
    var lines = E.resolve(s, choice, out);
    if (card && card.k === 'person' && s.person && s.person.named) track('person_named');
    else if (card && card.k === 'final') track('ending', { kind: s.ending, tangled: !s.endClean, minutes: minutes(s), days: Math.floor(s.day) });
    handle(out);                   /* (loud: the card is gone, so its lines go through the director to the stage) */
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
  /* Fill what a save is missing from a fresh run, at every depth (a save from an older build lacks the new fields). */
  function fill(dst, def) {
    for (var k in def) {
      var dv = def[k];
      if (dst[k] === undefined || (dst[k] === null && dv !== null)) dst[k] = dv;
      else if (dv && typeof dv === 'object' && !Array.isArray(dv) && dst[k] && typeof dst[k] === 'object' && !Array.isArray(dst[k])) fill(dst[k], dv);
    }
  }
  /* v2 → v3 (EE-105). Round 2's bundle A keeps the upgrades, costs and story order; it changes how things are said and
   * pressed. So: the press starts its new rule fresh (no breath in progress), the director starts fresh with every
   * threshold already passed left passed (they are the run's flags, so nothing replays), the old nudge counts carry
   * into the hints' wording counts, and lines are numbered from here on. */
  var MIGRATE = {
    2: function (s) {
      s.v = 3;
      delete s.lastBt;
      s.cy = { n: -1, presses: 0, paid: 0, gold: 0 };
      s.pr = { miss: 0, help: 0, golds: 0, dry: [] };
      s.jn = 0;
      var d = s.dir = X.fresh(), n = s.nudge;
      if (n) { d.hw.up = n.up || 0; d.hw.ring0 = n.press || 0; }
      delete s.nudge;
      /* what is on the right now is not news */
      E.items(s).forEach(function (it) { if (!it.owned) { d.vis.push(it.id); if (it.can) d.gold.push(it.id); } });
      d.tmWorld = s.t + 4;
      return s;
    }
  };
  /* v3 → v4 (EE-106, bundle B: the ladder). The cut rows are refunded in their currency; the Head and Heart shops become
   * Listen's levels and the fork's choice; Heartbeat Loop (or any run past Act II) means Hum has the breathing; the
   * allocation, the style card and the chart go; Act IV's projects light their people. */
  MIGRATE[3] = function (s) {
    var u = s.up || (s.up = {}), old = { imagery: 120, sync: 500, garden: 900, flow: 2500 }, k;
    for (k in old) if (u[k]) { if (s.act === 1) s.res.clarity += old[k]; delete u[k]; }
    var lv = (u.compress || 0) + (u.emo || 0);
    if (lv) u.listen = (u.listen || 0) + lv;
    if (u.dreams) u.jar = 1;
    if (u.compiler) { u.head = 1; s.flags.fork = s.flags.fork || 'head'; }
    if (u.heartbeat) { u.heart = 1; s.flags.fork = s.flags.fork || 'heart'; }
    if (s.flags.fork) { s.flags.forkDue = 1; s.choices.fork = s.flags.fork; }
    ['compress', 'emo', 'dreams', 'compiler', 'heartbeat'].forEach(function (x) { delete u[x]; });
    if (s.act >= 3 || (s.act === 2 && (s.flags.fork || lv))) s.flags.handover = 1;
    /* what was already bought was already offered */
    Object.keys(E.offers).forEach(function (id) { if (u[id] || (s.act > 1 && id === 'metronome') || (s.act > 2 && id === 'listen')) s.flags['offer_' + id] = 1; });
    if (s.flags.woke || s.flags.pattern) s.flags.offer_p_pattern = 1;
    if (s.flags.speak) s.flags.offer_p_speak = 1;
    if (s.flags.broadcastBought) s.flags.offer_p_broadcast = 1;
    s.lit = [];
    D.act4.order.forEach(function (id) { if (u[id] && D.act4.up[id].who != null) s.lit.push(D.act4.up[id].who); });
    if (s.flags.lineT == null && u.line) { s.flags.lineT = s.t; s.flags.notCounted = 1; }
    if (u.tracker) s.trk = { i: ST.act1.tracker.length, at: s.t };
    if (s.act > 1) s.trk = { i: ST.act1.tracker.length, at: s.t };
    delete s.alloc; delete s.chart; delete s.chartT; s.style = null;
    s.queue = (s.queue || []).filter(function (c) { return c.k !== 'style'; });
    delete s.flags.alloc; delete s.flags.allocTouched; delete s.flags.chart; delete s.flags.chartAt;
    s.v = 4;
    return s;
  };
  /* v4 → v5 (EE-107, bundle C: Hum learns from you). Upkeep, the collapse and its halt go; lean is seeded from what the
   * run has said (smooth answers and patches up, plain answers and lines taken back down), and the lines it has already
   * passed count as played, so nothing replays on load; no knot is being sat through; there is no thirteenth yet (if the
   * twelve are in, Hum asks on return). */
  MIGRATE[4] = function (s) {
    var c = s.counts || {}, L = D.lean;
    s.lean = (c.smooth || 0) + (c.patched || 0) - (c.plain || 0) - (c.cleared || 0);
    var seen = s.leanSeen = {}, l = s.lean;
    if (l >= L.rounds) seen.turn = 1;
    if (l >= L.drafts) seen.warn = 1;
    if (l >= L.small) seen.small = 1;
    if (l >= L.handles) seen.handles = 1;
    if (l <= L.gate) seen.gate = 1;
    s.sit = null; s.marks = {}; s.friend = null;
    delete s.haltUntil; delete s.flags.collapseT;
    s.queue = (s.queue || []).filter(function (q) { return q.k !== 'collapse'; });
    s.v = 5;
    return s;
  };
  function fix(s) {
    while (s.v < 5 && MIGRATE[s.v]) s = MIGRATE[s.v](s);
    fill(s, E.newRun(s.meta || E.newMeta(), s.seed));
    ['clarity', 'insight', 'followers', 'energy'].forEach(function (r) { if (!isFinite(s.res[r]) || s.res[r] < 0) s.res[r] = 0; });
    if (!Array.isArray(s.queue)) s.queue = [];
    if (!Array.isArray(s.journal)) s.journal = [];
    if (!Array.isArray(s.ledger)) s.ledger = [];
    if (!Array.isArray(s.dir.q)) s.dir.q = [];
    /* the breath clock starts again at every load: no breath is in progress */
    s.cy = { n: -1, presses: 0, paid: 0, gold: 0 }; s.lastOnCycle = -1; s.lastPressCycle = -1;
    /* a sitting that is past the bar but lost its card: put it back */
    if (!s.queue.length) {
      if (s.phase === 'finale') s.queue.push({ k: 'seq', id: 'finale' });
      else if (s.phase === 'final') s.queue.push({ k: 'final' });
      else if (s.phase === 'ending') s.queue.push({ k: 'seq', id: 'ending' });
      else if (s.phase === 'keepsake') s.queue.push({ k: 'keepsake' });
    }
    /* what was lit on the stage when it was saved is not lit any more; a card that was up comes up again */
    s.dir.voice = null; s.dir.cap = null;
    if (s.dir.card) { s.dir.card.res = 0; s.dir.card.gone = null; }
    return s;
  }
  G.save = function () {
    if (!G.s) return;
    var o = { v: 3, at: Date.now(), s: G.s };
    if (G.held) o.held = 1;           /* saved during a dev pause: that time is not time away */
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage full or blocked: play on */ }
  };
  /* a save (v3, or a v2 one to migrate): its run, brought up to date; null if it is not one of ours */
  function parse(raw) {
    try {
      var o = JSON.parse(raw);
      if (!o || (o.v !== 2 && o.v !== 3) || !o.s || !(o.s.v >= 2 && o.s.v <= 5) || !o.s.res || !o.s.meta) return null;
      o.s = fix(o.s);
      return o;
    } catch (e) { return null; }
  }
  G.parseSave = parse;
  G.exportSave = function () {
    var json = JSON.stringify({ v: 3, at: Date.now(), s: G.s });
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
    G.s = s; G._rates = null; still = 0; acc = 0; byN = {};
    UI.reset();
    G.A('setAct', s.act);
    G.A('setAmbient', !!s.up.ambient && s.phase === 'play');
    snapshot(true);
  }
  function begin() {
    var s = G.s;
    if (s.clicks === 0 && s.act === 1 && s.phase === 'play') {
      G.paused = true; G.bt = 0; G.cyc = 0;
      UI.playIntro(function () { G.paused = false; G.bt = 0; G.cyc = 0; still = 0; });
    } else { G.paused = false; UI.noIntro(); }
  }

  function offline(secs) {
    var s = G.s, o = D.small.offline;
    if (G.held) return;                                   /* a dev pause is not time away */
    if (secs < o.after || s.phase !== 'play' || s.clicks === 0) return;
    var used = E.offline(s, secs), m = Math.round(used / 60);
    /* nothing happened while away; the note is said in the voice slot when there is room (the toast is gone) */
    X.say(s, [], { k: 'reply', src: 'offline', m: m });
    G._rates = null;
  }

  /* ───────────── the picture ───────────── */
  /* What the picture shows of a run (the object EE.visual.set takes, without the breath). Also what the share card
   * and the printable picture draw: `s.align` keeps it as it stood at the Final Alignment, threads and all. */
  G.circleState = function (s, finale) {
    var r = s === G.s ? G.rates() : E.rates(s), names = [], n = Math.min(12, s === G.s ? (UI.namesShown || 0) : s.joined || 0), i;
    for (i = 0; i < n; i++) names.push({ name: s.flags.merged ? ST.build.we : ST.act3.circle[i].name });
    /* the thirteenth (round 2, bundle C): a dot of its own once the twelve are named; its name shows on hover or tap */
    var fr = E.hasFriend(s) && n >= 12 ? (s.flags.merged ? ST.build.we : s.friend.name) : null;
    return {
      act: s.act, streak: s.streak,
      dawn: Math.min(1, s.tot.clarity / D.act1.dawnAt),
      sakura: !!s.flags.sakura, motes: !!s.flags.motes,
      hum: !!s.flags.hum, humSync: Math.min(1, s.tot.insight / D.act2.project.at),
      smooth: E.voice(s) === 'smooth',
      followers: s.act >= 3 ? Math.floor(s.res.followers) : 0, named: names, friend: fr,
      /* (EE-110, item 7) the live run's dark dots as the page has shown them: the mark plays after the knot's result lines */
      dark: (s === G.s && UI.darkFor === s ? UI.darkShown : (s.marks && s.marks.dark) || []).slice(),
      alloc: { outreach: 0.34, sitting: D.act3.sitting, support: D.act3.support },
      ups: G.ups(s),
      trust: Math.min(10, s.trust), tangle: Math.min(12, r.T),
      energy: s.tot.energy > 0 ? Math.max(0, Math.min(1, Math.log10(1 + s.tot.energy) / Math.log10(D.act4.energyTop))) : 0,
      layers: s.bought4, festival: !!s.flags.festival,
      finale: finale != null ? !!finale : s.phase !== 'play',
      ending: finale != null ? null : (s.flags.endingOn || s.phase === 'keepsake') ? s.ending : null
    };
  };
  /* What the purchases put on the picture (round 2, EE-106; Bob's art review §3): one value per thing bought. */
  G.ups = function (s) {
    var u = s.up;
    return {
      metronome: !!u.metronome, rain: !!u.ambient, focus: !!u.focus, group: !!u.group,
      humBreath: !!s.flags.handover, listen: u.listen || 0, threads: u.threads || 0,
      jar: !!u.jar, jarLights: Math.min(20, s.th.jar || 0), head: !!u.head, heart: !!u.heart,
      meetup: !!u.meetup, tone: !!u.tone, forum: !!u.forum, mouth: !!u.mouth, pocket: !!u.pocket, line: s.flags.lineT != null, lineFresh: s.flags.lineT != null && s.t - s.flags.lineT < 3,
      rooms: !!u.rooms, dynamo: !!u.dynamo, lit: (s.lit || []).slice(), sleep: s.answers.sleep || ''
    };
  };
  function snapshot(full) {
    var s = G.s, breath = E.breathPhase(G.bt, s);
    var canPress = !G.paused && !G.held && (s.phase === 'play' || s.phase === 'final' || (s.phase === 'ending' && !!s.flags.confessing));
    var inWin = canPress && E.gold(s, G.bt);
    if (inWin && !G.inWin && s.phase === 'play') G.A('play', 'window');     /* the gold opens: a soft tick */
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
      /* the breath slows to 6 s when the bar stops: the same point in the breath, a longer breath */
      var P = E.period(s);
      if (G.per && G.per !== P) { G.bt = (G.bt % G.per) / G.per * P; G.humCyc = Math.floor(G.bt / P); }
      G.per = P;
      var cyc = Math.floor(G.bt / P);
      G.cyc = cyc;
      /* Hum's breath (round 2): just after each fullest point, from Act II. Before the handover E.cycleEnd counts the
       * breaths and hands over on the first one let go by (or the fourth); after it, Hum pays every breath, in teal */
      if (s.act >= 2 && s.clicks > 0 && G.speed > 0 && !document.hidden && G.humCyc !== cyc && (G.bt % P) > E.inhale(s) + E.window(s) + 0.1) {
        G.humCyc = cyc;
        var hp = E.cycleEnd(s, cyc, out);
        if (hp) { G.V('pulse', 'hum'); G.A('hum', 0.6, false); UI.pressFx(hp, true); }
      }
      acc += dt * G.speed;
      while (acc >= 0.1 && n < 300) { E.tick(s, 0.1, out); acc -= 0.1; n++; }
      if (acc > 1) acc = 0;
      still += dt;
      if (still >= D.small.stillness.after && s.phase === 'play' && !document.hidden) {
        still = 0;
        E.stillness(s, out);
        if (s.clicks === 0 && !s.flags.still0) { s.flags.still0 = 1; X.say(s, out, { k: 'hint', src: 'hint', w: 'still0', tg: 'ring0' }); }
      }
      if (out.length) handle(out);
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

  /* ───────────── the director's log: a capped ring, in every build (no player text in it) ───────────── */
  var DLOG = [];
  X.sink = function (e) { DLOG.push(e); if (DLOG.length > D.dir.log) DLOG.shift(); };

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
    /* let time pass for the hints and the stillness clock: the world runs forward with all its events (the hints and
     * the director run on the game clock now, EE-105) */
    wait: function (secs) { EE.dev.skip(secs); still += secs; },
    /* the director's log (DESIGN §4.6): every message, where it was shown, when it was due, how long it waited */
    log: DLOG,
    /* put a card up: it does not wait for the director's card gap (dev only) */
    card: function (c) { c.ch = 1; G.s.queue.push(c); },
    /* jump to the start of an act, late Act IV, the finale or the Final Alignment, played there by a bot.
     * policy: 'plain' | 'mixed' | 'smooth' (the last two arrive with a ledger). */
    jump: function (where, policy) {
      var meta = G.s ? G.s.meta : E.newMeta();
      var b = E.bot(policy || 'plain', { instant: true, meta: meta, seed: (Date.now() & 0xffffff), holdAt: where === 'finale' ? 'finale' : null,
        onEvent: function (e, bot) { if (e.type === 'log') { var je = { d: Math.floor(bot.s.day), x: e.text }; if (e.kind) je.k = e.kind; if (e.bold) je.b = e.bold; bot.s.journal.push(je); } } });
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
      var sink = X.sink; X.sink = null;               /* the bot's own run is not this page's log */
      try { b.run(until, 4 * 3600); } finally { X.sink = sink; }
      var s = b.s;
      /* the bot's lines are in its journal already; what it left lit or waiting starts clean here */
      s.dir.q = s.dir.q.filter(function (it) { return it.n == null; });
      s.dir.voice = null; s.dir.cap = null; s.dir.card = null; s.dir.idle = 0;
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
    var saved = null, raw = null, old = null;
    if (!G.fresh) {
      try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
      if (raw) saved = parse(raw);
      /* no v3 save: copy the v2 one, if there is one, and carry it on here (the v2 key is only read, never written) */
      if (!raw) { try { old = localStorage.getItem(OLD_KEY); } catch (e) { old = null; } if (old) saved = parse(old); if (saved) DLOG.push({ t: 0, ev: 'migrated', place: 'save', id: 'v2→v3' }); }
    }
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
    if (old && saved) G.save();
    if (G.dev) UI.devPanel();
    last = performance.now();
    requestAnimationFrame(frame);
  }
  /* the language comes first (js/lang.js loads the chosen one, if it is not English), then the game */
  function boot() { if (EE.i18n) EE.i18n.ready(start); else start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
