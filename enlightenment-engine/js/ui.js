/* The Enlightenment Engine — the page.
 * Everything the player sees that is not the canvas. Text comes from story.js; every string that could carry the
 * player's own words is set with textContent (never innerHTML).
 */
(function () {
  'use strict';
  var EE = window.EE, E = EE.econ, D = EE.data, ST = EE.story;
  var UI = EE.ui = {};

  /* Every timer on the page runs on one clock, so a dev pause (?dev=1 → pause) holds them all where they are:
   * typed lines, sequences, cards, toasts. The names shadow the window's own inside this file only. */
  var clock = UI.clock = (function () {
    var st = window.setTimeout.bind(window), ct = window.clearTimeout.bind(window);
    var list = {}, seq = 0, held = false;
    function arm(t) { t.at = performance.now(); t.h = st(function () { fire(t); }, t.left); }
    function fire(t) {
      if (t.every) { t.left = t.every; arm(t); } else delete list[t.id];
      t.fn();
    }
    function add(fn, ms, every) {
      var t = { id: ++seq, fn: fn, left: Math.max(0, +ms || 0), every: every ? Math.max(4, +ms || 0) : 0 };
      list[t.id] = t;
      if (!held) arm(t);
      return t.id;
    }
    return {
      after: function (fn, ms) { return add(fn, ms, false); },
      every: function (fn, ms) { return add(fn, ms, true); },
      cancel: function (id) { var t = list[id]; if (t) { ct(t.h); delete list[id]; } },
      pause: function () {
        if (held) return; held = true;
        var n = performance.now();
        for (var k in list) { var t = list[k]; ct(t.h); t.left = Math.max(0, t.left - (n - t.at)); }
      },
      resume: function (away) {
        if (!held) return; held = false;
        for (var k in list) arm(list[k]);
        /* the page's own deadlines move on by the time that was held */
        away = away || 0;
        UI.nextCardAt += away;
        if (UI.finalUI) UI.finalUI.at += away;
      },
      held: function () { return held; }
    };
  })();
  var setTimeout = clock.after, setInterval = clock.every, clearTimeout = clock.cancel, clearInterval = clock.cancel;
  var G = null;                                   // EE.game, set in UI.init
  function $(id) { return document.getElementById(id); }
  function S() { return G.s; }
  function T(str, x) { return E.text(G.s, str, x); }
  function now() { return performance.now(); }

  /* h('div', 'cls', 'text' | [children], {attr: value}) */
  function h(tag, cls, kids, attrs) {
    var el = document.createElement(tag), k;
    if (cls) el.className = cls;
    if (kids != null) {
      if (Array.isArray(kids)) { for (k = 0; k < kids.length; k++) if (kids[k] != null) el.appendChild(typeof kids[k] === 'string' ? document.createTextNode(kids[k]) : kids[k]); }
      else if (typeof kids === 'string') el.textContent = kids;
      else el.appendChild(kids);
    }
    if (attrs) for (k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (tag === 'button' && !(attrs && attrs.type)) el.type = 'button';
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  UI.h = h; UI.clear = clear;
  function isHum(t) { return t.indexOf('> ') === 0; }
  function isStamp(t) { return t.length > 8 && t === t.toUpperCase() && /[A-Z]/.test(t) && !isHum(t); }
  function lineEl(text, tag) { return h(tag || 'p', isHum(text) ? 'hum' : isStamp(text) ? 'stamp' : null, text); }

  /* Type a Hum line out. Returns {finish()}. */
  function typeInto(els, text, done) {
    if (!Array.isArray(els)) els = [els];
    var i = 0, stopped = false, per = Math.max(4, TYPE_MS / G.pace());
    function set(n) { for (var k = 0; k < els.length; k++) if (els[k]) els[k].textContent = text.slice(0, n); }
    if (G.fastText || UI.reduced) { set(text.length); if (done) setTimeout(done, 0); return { finish: function () {} }; }
    set(2);
    var iv = setInterval(function () {
      if (stopped) return;
      i += 1;
      var n = Math.min(text.length, 2 + i);
      set(n);
      if (i % 3 === 0) G.A('play', 'type');
      if (n >= text.length) { stopped = true; clearInterval(iv); if (done) done(); }
    }, per);
    return { finish: function () { if (stopped) return; stopped = true; clearInterval(iv); set(text.length); if (done) done(); } };
  }
  /* Reading time (2026-11-13 playtest: "slightly slower").
   * seqTime: how long a line holds before the next one may follow it (a floor of 4 s, 40% more than before).
   * readTime: how long a line stays on the stage when nothing follows it (4 s plus about 16 characters a second). */
  function seqTime(text) { return Math.max(4000, 1.4 * Math.min(5200, 1300 + 46 * text.length)) / G.pace(); }
  function readTime(text) { return Math.min(12000, 4000 + 62.5 * text.length) / G.pace(); }
  var TYPE_MS = 24;

  /* ───────────── init ───────────── */

  UI.init = function (game) {
    G = game;
    UI.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    UI.fold = {}; UI.sig = {}; UI.disp = {}; UI.card = null; UI.reader = null;
    UI.touched = {}; UI.nextCardAt = 0; UI.namesShown = 0; UI.floatIx = 0; UI.lastSync = 0; UI.ringBox = null; UI.ht = null;

    staticWords();

    /* floats pool */
    var f = $('floats');
    UI.floats = [];
    for (var i = 0; i < 24; i++) { var sp = h('span', 'float'); f.appendChild(sp); UI.floats.push(sp); }
    /* three motes, reused: a hint's stream (DESIGN §4.7) */
    UI.motes = [];
    for (i = 0; i < 3; i++) { var mo = h('div', 'mote'); document.body.appendChild(mo); UI.motes.push(mo); }
    /* and one for the buy moment: from the row back to the ring */
    UI.buyMote = document.body.appendChild(h('div', 'mote buy'));
    var pips = $('pips');
    for (i = 0; i < 10; i++) pips.appendChild(h('i'));

    $('ring').addEventListener('click', function (e) {
      e.preventDefault();
      if (e.detail === 0 && now() - (UI.keyPressAt || 0) < 400) return;   /* the key already pressed it */
      G.press();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') {
        if (e.key === 'Escape') { if ($('app').classList.contains('intro')) UI.skipIntro(); else UI.closeOverlay(); }
        return;
      }
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (t && t.classList && t.classList.contains('j-row') && t._e) { e.preventDefault(); G.star(t._e); t.classList.toggle('star', !!t._e.s); return; }
      if (tag === 'BUTTON' && t.id !== 'ring') return;
      if ($('app').classList.contains('intro')) { if (!e.repeat) UI.introTap(); e.preventDefault(); return; }
      if (!$('overlay').hidden) return;
      e.preventDefault();
      if (!e.repeat) { UI.keyPressAt = now(); G.press(); }
    });
    $('sndBtn').addEventListener('click', function () { G.toggleSound(); UI.syncSound(); });
    $('menuBtn').addEventListener('click', UI.showMenu);
    $('jList').addEventListener('click', function (e) {
      var row = e.target.closest ? e.target.closest('.j-row') : null;
      if (row && row._e) { G.star(row._e); row.classList.toggle('star', !!row._e.s); }
    });
    $('reader').addEventListener('click', function () { readerAdvance(true); });
    $('intro').addEventListener('click', UI.introTap);
    $('panels').addEventListener('click', onPanelClick);
    /* a row looked at (hovered, focused): the director holds anything unasked for a moment (D.dir.busy) */
    var hovAt = 0;
    function looked(e) {
      var t = e.target.closest ? e.target.closest('.item') : null;
      if (!t || now() - hovAt < 500) return;
      hovAt = now(); G.hover();
    }
    $('panels').addEventListener('pointerover', looked);
    $('panels').addEventListener('focusin', looked);
    $('overlay').addEventListener('click', function (e) { if (e.target === $('overlay') && UI.overlayKind === 'menu') UI.closeOverlay(); });
    /* the thirteenth's name shows while the pointer is on its dot, and for three seconds after a tap on it (round 2) */
    function nearFriend(e) {
      var s = S(), cv = $('cv').getBoundingClientRect();
      if (!s || !E.hasFriend(s) || !EE.visual || !EE.visual.dotAt) return false;
      var d = EE.visual.dotAt(12);
      if (!d) return false;
      var dx = e.clientX - cv.left - d.x, dy = e.clientY - cv.top - d.y;
      return dx * dx + dy * dy <= Math.pow(Math.max(14, d.r + 8), 2);
    }
    $('stage').addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var on = nearFriend(e);
      if (on !== !!UI.friendHov) { UI.friendHov = on; G.V('set', { friendHover: on || now() < (UI.friendTip || 0) }); }
    });
    $('stage').addEventListener('pointerdown', function (e) {
      if (!nearFriend(e)) return;
      UI.friendTip = now() + 3000;
      G.V('set', { friendHover: true });
      setTimeout(function () { if (now() >= UI.friendTip && !UI.friendHov) G.V('set', { friendHover: false }); }, 3050);
    });
    /* laptop: the ring at 42% of the stage, the voice slot above it, the card dock below (Bob's art review) */
    function ringPlace() { G.V('set', { ringY: window.innerWidth >= 900 ? 0.42 : 0.5 }); UI.ringBox = null; }
    window.addEventListener('resize', ringPlace);
    ringPlace();
    UI.syncSound();
  };

  UI.syncSound = function () { $('sndBtn').textContent = G.muted ? ST.ui.sound.off : ST.ui.sound.on; };

  /* the words that are set once, and the language line at the foot of the first screen */
  function staticWords() {
    $('hTitle').textContent = ST.meta.title;
    $('menuBtn').textContent = ST.build.menu;
    $('jLabel').textContent = ST.ui.panels.journal;
    $('jHint').textContent = ST.ui.star;
    document.title = ST.meta.title;
    if (EE.keep) EE.keep.picker($('langs'), true);
  }

  /* Another language was chosen: everything on the page reads it now. Journal lines already written stay as they
   * were; a sequence being read finishes in the words it started with. */
  UI.relang = function () {
    var s = S();
    staticWords();
    UI.syncSound();
    clear($('resources')); UI.res = {};
    UI.sig = {};
    clear($('chips'));
    /* the journal keeps its lines; only the "Day N" beside them changes language */
    [].forEach.call($('jList').querySelectorAll('.j-row'), function (row) {
      if (row._e && row.firstChild) row.firstChild.textContent = ST.build.day.replace('{n}', E.num(row._e.d));
    });
    if (UI.card && UI.card.mode === 'ask') {
      var c = UI.card;
      clearTimeout(c.timer); clearTimeout(c.auto);
      c.el.remove(); UI.card = null;
      $('stage').classList.remove('dimmed');
      UI.nextCardAt = 0;
    }
    if (UI.finalUI && s.phase === 'final') { UI.finalUI = null; showFinal(); }
    if ($('app').classList.contains('intro')) relangIntro();
    if (UI.overlayKind === 'keepsake') UI.showKeepsake();
    else if (UI.overlayKind === 'menu') UI.showMenu();
    UI.ringBox = null;
    UI.sync(true);
  };

  /* Rebuild the whole page from the state (load, dev jump, sit again). */
  UI.reset = function () {
    var s = S();
    if (UI.card && UI.card.el) UI.card.el.remove();
    UI.card = null;
    readerClose();
    clear($('cards')); clear($('resources')); clear($('chips')); clear($('panels')); clear($('jList')); clear($('orbs'));
    $('finalPanel').hidden = true; clear($('finalPanel'));
    $('titleCard').hidden = true; $('bigCount').hidden = true;
    UI.vRelease = null;                                  /* a line of the run being left does not enter the new Journal */
    if (UI.tog) { clearTimeout(UI.tog.t); UI.tog = null; }
    UI.panelHold = 0; UI.darkFor = null; UI.namesRisen = 0; UI.orderSig = null;
    voiceClear(); UI.captionOut(true); UI.hint(null);
    UI.closeOverlay(true);
    UI.sig = {}; UI.disp = {}; UI.res = {}; UI.fold = {}; UI.finalUI = null; UI.holdKeepsake = false; UI.panelsReady = false;
    UI.namesShown = s.joined; UI.nextCardAt = now() + 600; UI.ringBox = null; liftTo(0);
    UI.lastAct = s.act; UI.mergedShown = false; UI.touched = {}; UI.sitOn = null; UI.friendTip = 0;
    UI.white = false; UI.whiteT0 = 0;
    if (s.dir && s.dir.ht && s.dir.ht.on) UI.hint(s.dir.ht.tg);
    UI.langsDone = false; UI.keepPage = 1;
    /* a new page of the game (a load, a jump, a new sitting): the language row is there or not, with no fade */
    clearTimeout(UI.langsT); UI.langsT = 0;
    var lw = s.clicks === 0 && s.act === 1 && s.phase === 'play', le = $('langs');
    le.hidden = !lw;
    if (lw) le.removeAttribute('aria-hidden'); else le.setAttribute('aria-hidden', 'true');
    var start = Math.max(0, s.journal.length - 220);
    for (var i = start; i < s.journal.length; i++) if (!s.journal[i].q) addRow(s.journal[i]);
    UI.sync(true);
  };

  /* ───────────── intro ───────────── */

  /* The opening lines, one at a time (Bulut, 2026-11-13: "it should show me the next one but not skip everything all
   * at once"). Left alone they come at their own pace. A tap, a click, Space or Enter does one thing: finishes the line
   * that is fading in, or else brings the next; only after the last line does it start the game. The clock re-times
   * from wherever a tap left it, so it never jumps ahead. Escape skips the whole opening. */
  UI.playIntro = function (done) {
    var app = $('app'), box = $('intro');
    clear(box);
    app.classList.add('intro'); app.classList.remove('intro-out');
    (UI.introTimers || []).forEach(clearTimeout);
    UI.introDone = done; UI.introTimers = [];
    var gap = UI.reduced ? 900 : 3000;
    UI.intro = { n: 0, at: 0, gap: gap, fade: UI.reduced ? 600 : 2200, tapAt: 0 };
    ST.intro.forEach(function (line) { box.appendChild(h('p', null, line)); });
    introNext(800);
  };
  /* the next thing the clock will do, `ms` from now: the next line, or after the last one, the game */
  function introNext(ms) {
    (UI.introTimers || []).forEach(clearTimeout);
    var I = UI.intro, last = I.n >= ST.intro.length;
    UI.introTimers = [setTimeout(function () {
      if (!$('app').classList.contains('intro')) return;
      if (last) UI.skipIntro(); else introShow();
    }, ms)];
  }
  function introShow() {
    var I = UI.intro, p = $('intro').children[I.n];
    if (!p) return;
    p.classList.add('in');
    I.n += 1; I.at = now();
    /* the last line stays a while longer before the game begins, as before */
    introNext(I.n >= ST.intro.length ? I.gap + 2600 : I.gap);
  }
  function introFading() {
    var I = UI.intro, p = I && I.n ? $('intro').children[I.n - 1] : null;
    return !!(p && !p.classList.contains('done') && now() - I.at < I.fade);
  }
  /* one tap, one step */
  UI.introTap = function () {
    var I = UI.intro, t = now();
    if (!I || !$('app').classList.contains('intro')) return;
    if (t - I.tapAt < 250) return;                         /* one physical tap counts once (touch, then its click) */
    I.tapAt = t;
    if (introFading()) {
      var p = $('intro').children[I.n - 1];
      p.classList.add('done');
      /* the same pause after a whole line as when it fades in by itself */
      introNext(I.n >= ST.intro.length ? I.gap - I.fade + 2600 : Math.max(300, I.gap - I.fade));
      return;
    }
    if (I.n < ST.intro.length) { introShow(); return; }
    UI.skipIntro();
  };
  function relangIntro() {
    var box = $('intro'), I = UI.intro || { n: 0 };
    clear(box);
    ST.intro.forEach(function (line, i) {
      var p = h('p', null, line);
      if (i < I.n) p.classList.add('in', 'done');           /* what was on the screen stays there, in the new words */
      box.appendChild(p);
    });
  }
  UI.noIntro = function () {
    (UI.introTimers || []).forEach(clearTimeout);
    UI.introDone = null;
    $('app').classList.remove('intro', 'intro-out');
  };
  UI.skipIntro = function () {
    var app = $('app');
    if (!app.classList.contains('intro')) return;
    (UI.introTimers || []).forEach(clearTimeout);
    app.classList.remove('intro'); app.classList.add('intro-out');
    setTimeout(function () {
      app.classList.remove('intro-out');
      /* nothing rises over the first screen until it has gone */
      UI.nextCardAt = Math.max(UI.nextCardAt || 0, now() + 900);
    }, 2700);
    var d = UI.introDone; UI.introDone = null;
    if (d) d();
  };

  /* ───────────── the ring ───────────── */

  function ringBox() {
    if (UI.ringBox && now() - UI.ringBox.at < 700 && now() > (UI.liftUntil || 0)) return UI.ringBox;
    var st = $('stage'), w = st.clientWidth, hh = $('cv').clientHeight || st.clientHeight, r = G.V('ring');
    if (!r || !(r.r > 0)) { var m = Math.min(w, hh); r = { x: w / 2, y: hh / 2, r: Math.max(44, m * 0.13) }; }
    UI.ringBox = { x: r.x, y: r.y, r: r.r, w: w, h: hh, at: now() };
    var b = $('ring'), d = Math.max(96, r.r * 2.2);
    b.style.left = r.x + 'px'; b.style.top = r.y + 'px'; b.style.width = d + 'px'; b.style.height = d + 'px';
    var u = $('under');
    u.style.left = r.x + 'px'; u.style.top = (r.y + r.r * 1.12 + 14) + 'px';
    /* where the press label ends: nothing that rises on the stage may start above this */
    var labelBottom = r.y + r.r * 1.12 + 14 + 62;
    UI.ringBox.labelBottom = labelBottom;
    UI.wide = window.innerWidth >= 900;
    UI.short = UI.wide && hh < 760;
    /* the voice slot: its foot 32 px above the ring's top edge, growing upward, never above 10% of the stage (Bob) */
    /* (anchored from the top: a phone's stage grows a bay under the picture for a card, and the slot must not move) */
    var vb = Math.max(0, r.y - r.r - 32), vo = $('voice');
    vo.style.top = '0px'; vo.style.height = Math.round(vb) + 'px';
    st.style.setProperty('--voice-foot', Math.round(vb) + 'px');            /* a sequence in play sits here too (EE-108) */
    /* "now", on the rim at its fullest point */
    var nw = $('now');
    nw.style.left = r.x + 'px'; nw.style.top = Math.round(r.y - r.r + 17) + 'px';     /* just inside the rim, clear of its stroke */
    st.style.setProperty('--card-top', Math.round(labelBottom + 6) + 'px');
    st.style.setProperty('--below', Math.max(64, Math.round(hh - labelBottom - 10)) + 'px');
    return UI.ringBox;
  }

  /* Floating numbers (round 2, DESIGN §4.1): a number rises only when a press earned it, and shows exactly that.
   * A gold press: one gold "+N". An early or late press: one small grey "+1". A dry tap: nothing. Hum's own breath
   * (Heartbeat Loop): a faint number of its own. */
  UI.pressFx = function (res, byHum) {
    var s = S();
    if (s.phase !== 'play' || !res) return;
    /* (EE-108, eye pass item 11) after the handover a gold press is a breath together: the number waits for Hum's
     * breath of the same breath, and one gold number shows the two together, with the word for it */
    if (!byHum && res.together && res.kind === 'gold' && res.amt > 0) {
      if (UI.tog) clearTimeout(UI.tog.t);
      var tg0 = UI.tog = { res: res, cyc: G.cyc };
      tg0.t = setTimeout(function () { if (UI.tog === tg0) { UI.tog = null; showFloat(res, false); } }, 1500 / G.pace());
      return;
    }
    if (byHum && UI.tog && UI.tog.cyc === G.cyc && UI.tog.res.res === res.res) {
      var both = UI.tog; clearTimeout(both.t); UI.tog = null;
      showFloat(Object.assign({}, both.res, { amt: both.res.amt + (res.amt > 0 ? res.amt : 0) }), false);
      return;
    }
    showFloat(res, byHum);
  };
  function showFloat(res, byHum) {
    var s = S();
    if (res.kind === 'dry' || !(res.amt > 0)) return;
    var box = ringBox(), sp = UI.floats[UI.floatIx++ % UI.floats.length], amt = res.amt, txt;
    if (res.res === 'followers') { if (amt < 1) return; txt = '+' + E.num(amt); }
    else txt = '+' + (amt < 100 ? E.rate(amt) : E.num(amt));
    sp.className = 'float ' + (byHum ? 'byhum' : res.kind === 'gold' ? 'gold' : 'miss') + ' c-' + res.res;
    sp.textContent = txt;
    sp.style.left = box.x + 'px';
    sp.style.top = (box.y - box.r * 0.55) + 'px';      /* inside the ring, clear of the gold stroke */
    void sp.offsetWidth;
    sp.classList.add('go');
    if (res.on && !byHum) {
      var w = $('onword'), words = res.together ? ST.ui.together : ST.ui.onBreath;
      w.textContent = T(words[(s.breaths + s.clicks) % words.length]);
      w.classList.remove('show'); void w.offsetWidth; w.classList.add('show');
    }
  };

  /* A reward worth seeing: rises from under the ring. */
  UI.float = function (res, amt) {
    if (!(amt > 0)) return;
    var box = ringBox(), sp = UI.floats[UI.floatIx++ % UI.floats.length];
    sp.className = 'float gift c-' + res;
    sp.textContent = '+' + (amt < 100 ? E.rate(amt) : E.num(amt)) + '\u00a0' + ST.ui.resources[res];
    sp.style.left = box.x + 'px'; sp.style.top = (box.y - box.r * 1.5) + 'px';
    void sp.offsetWidth; sp.classList.add('go');
  };

  UI.spawnOrb = function (lotus) {
    var st = $('stage'), w = st.clientWidth, hh = $('cv').clientHeight || st.clientHeight, box = ringBox();
    /* where it appears: from the run's seed and clock, without touching the run's own random stream (E.rand) */
    var x, y, tries = 0, q = ((S().seed ^ Math.floor(S().t * 1000)) >>> 0) || 1;
    function rnd() { q ^= q << 13; q >>>= 0; q ^= q >>> 17; q ^= q << 5; q >>>= 0; return q / 4294967296; }
    /* never on a line in the voice slot (EE-108, eye pass item 9): the slot's plates, wherever they are */
    var stR = st.getBoundingClientRect(), pl = $('voice').querySelector('.plate'), pr = pl && pl.getBoundingClientRect();
    var onPlate = function (x0, y0) { return pr && pr.width > 0 && x0 > pr.left - stR.left - 40 && x0 < pr.right - stR.left + 40 && y0 > pr.top - stR.top - 40 && y0 < pr.bottom - stR.top + 40; };
    do { x = w * (0.12 + rnd() * 0.76); y = hh * (0.16 + rnd() * 0.36); tries++; }
    while (tries < 30 && (Math.hypot(x - box.x, y - box.y) < box.r * 1.45 || onPlate(x, y)));
    var o = h('button', 'orb' + (lotus ? ' lotus' : ''), null, { 'aria-label': lotus ? 'lotus' : 'orb', 'data-orb': lotus ? 'lotus' : 'orb' });
    o.style.left = x + 'px'; o.style.top = y + 'px';
    var life = (lotus ? D.small.lotus.life : D.small.orb.life) * 1000, gone = false;
    function out() { if (gone) return; gone = true; o.classList.add('out'); setTimeout(function () { o.remove(); }, 700); }
    o.addEventListener('click', function (e) { e.stopPropagation(); if (gone) return; if (lotus) G.catchLotus(); else G.catchOrb(); out(); });
    $('orbs').appendChild(o);
    setTimeout(out, life);
  };

  /* ───────────── the journal ───────────── */

  function addRow(entry, empty) {
    var row = h('div', 'j-row' + (entry.k ? ' j-' + entry.k : isHum(entry.x) ? ' j-hum' : '') + (entry.s ? ' star' : ''), [
      h('span', 'j-day', ST.build.day.replace('{n}', E.num(entry.d))),
      h('span', 'j-text', empty ? '' : entry.b ? [h('b', null, entry.x.slice(0, entry.b)), entry.x.slice(entry.b)] : entry.x)
    ], { tabindex: '0' });
    row._e = entry;
    var list = $('jList');
    list.insertBefore(row, list.firstChild);
    while (list.childNodes.length > 260) list.removeChild(list.lastChild);
    return row;
  }

  /* A line reaches the Journal: when it is said, or at once if it is not for the stage. */
  UI.journalAdd = function (entry) {
    $('journal').hidden = false;
    addRow(entry);
    if (entry._j != null) revealName(entry._j);
  };

  function revealName(j) {
    if (j + 1 > UI.namesShown) { UI.namesShown = j + 1; G.V('pulse', 'join', { n: 1 }); G.A('play', 'join'); }
  }

  /* ───────────── the voice slot: one line at a time, just above the ring (DESIGN §5; Bob's art review) ─────────────
   * Hum (teal mono, typed), the tracker (desaturated teal mono), the narrator (serif, fades in whole). The director
   * says when; this only draws. A line into an empty slot rises 14 px and fades in; a line replacing one cross-fades in
   * place (300 ms). When its reading time is over it dims to 40% (its plate too) and stays until replaced; while a card
   * owns the stage the dimmed line is gone. The first two lines of a run shrink into the Journal instead, so the player
   * learns where history lives. */
  function whereText(t, tg) {
    var atRing = tg && tg.indexOf('row:') === 0 && !!$('cards').querySelector('.card.offer[data-id="' + tg.slice(4) + '"]');
    return String(t).replace('{where}', ST.nudges.where[UI.wide && !atRing ? 'wide' : 'narrow']);
  }
  /* the line now in the slot enters the Journal (once): when it has been typed out, or when it is replaced first */
  function voiceRelease() { var f = UI.vRelease; UI.vRelease = null; if (f) f(); }
  UI.voiceRelease = voiceRelease;
  function voiceClear() {
    var box = $('voice');
    voiceRelease();
    if (UI.vType) { clearInterval(UI.vType); UI.vType = 0; }
    clearTimeout(UI.vClear);
    clear(box); box.className = '';
    UI.vLine = null;
    UI.keepSig = null; G.V('set', { keepOut: null });
    UI.bkSig = null; G.V('set', { backing: [] });
  }
  UI.voice = function (e) {
    var box = $('voice'), text = e.k === 'hint' ? whereText(e.text, e.tg) : e.text;
    if (!text) { if (e.release) e.release(); return; }
    voiceRelease();
    UI.vRelease = e.release || null;
    var hum = isHum(text), kind = e.k === 'tracker' ? 'tracker' : hum ? 'hum' : 'narr';
    var wasOn = !!UI.vLine, cap = $('caption'), after = false;
    /* one place at a time: a world line still on (or fading) goes in 200 ms, and this line waits for it; the reply to the
     * player speaks beside it and it stays (EE-110: the director lets nothing else start over a world line) */
    if (!BESIDE_UI[e.k] && cap.className === 'on' && +getComputedStyle(cap).opacity > 0.01) {
      /* restart the fade from where it is (a fade already running would keep its own 1.5 s) */
      var o0 = getComputedStyle(cap).opacity;
      cap.style.transition = 'none'; cap.style.opacity = o0; void cap.offsetWidth;
      cap.style.transition = 'opacity 0.2s ease'; cap.style.opacity = '0';
      cap.className = 'cut'; after = true;
    }
    clearTimeout(UI.vClear);
    if (UI.vType) { clearInterval(UI.vType); UI.vType = 0; }
    [].forEach.call(box.querySelectorAll('.plate'), function (old) {
      if (old.classList.contains('gone')) return;
      /* its words go at once (EE-108: the old line's "> " showed through the new plate while it faded) */
      old.style.animation = 'none'; old.classList.remove('rise', 'swap');
      var ot = old.querySelector('.v-text'); if (ot) { ot.style.transition = 'none'; ot.style.opacity = '0'; }
      old.classList.add('gone');
      setTimeout(function () { old.remove(); }, 320);
    });
    var p = h('p', 'v-text'), plate = h('div', 'plate ' + kind + (wasOn ? ' swap' : ' rise') + (after ? ' after' : ''), [p]);
    if (e.bold) { p.appendChild(h('b', null, text.slice(0, e.bold))); p.appendChild(document.createTextNode(text.slice(e.bold))); voiceRelease(); }
    else if (kind !== 'narr' && !UI.reduced && !G.fastText) {
      /* typed on a plate of fixed size: the rest of the line is there from the start, unseen, so nothing reflows */
      var shown = document.createTextNode(''), rest = h('span', 'v-rest', text);
      p.appendChild(shown); p.appendChild(rest);
      var dur = Math.min(1600, text.length / 45 * 1000) / G.pace(), t0 = now() + (wasOn ? 0 : 250), k = 0;
      UI.vType = setInterval(function () {
        var n = Math.max(0, Math.min(text.length, Math.ceil(text.length * (now() - t0) / Math.max(1, dur))));
        if (shown.data.length !== n) { shown.data = text.slice(0, n); rest.textContent = text.slice(n); if (++k % 3 === 0) G.A('play', 'type'); }
        if (n >= text.length) { clearInterval(UI.vType); UI.vType = 0; voiceRelease(); if (e.join != null) revealName(e.join); trackerAfter(e, p, shown); }
      }, 33);
    } else { p.textContent = text; voiceRelease(); if (e.join != null) revealName(e.join); }
    /* once it has risen, the plate lets go of its animation, so dimming, cross-fades and fading out can move it */
    plate.addEventListener('animationend', function () { plate.classList.remove('rise', 'swap'); });
    box.appendChild(plate);
    box.className = 'on';
    UI.vLine = { first: e.first, at: now(), k: e.k, tg: e.tg, j: e.n != null || !!e.j };
    if (!(kind !== 'narr' && !UI.reduced && !G.fastText) && (e.drop || e.then)) trackerAfter(e, p, null);
    if (hum) G.humSpeak(text);
    syncKeep();
  };
  /* The tracker's tells (round 2): " · nice" deletes itself letter by letter; "breath n logged…" becomes "> _" for one
   * breath. Reduced motion: the line changes whole. */
  function trackerAfter(e, p, node) {
    if (!e.drop && !e.then) return;
    var line = UI.vLine;
    var full = e.text, keep = e.drop ? full.slice(0, full.length - e.drop.length) : null;
    function mine() { return UI.vLine === line && p.isConnected; }
    function set(x) { if (node) { node.data = x; var r = p.querySelector('.v-rest'); if (r) r.textContent = ''; } else p.textContent = x; }
    clearTimeout(UI.vAfter);
    UI.vAfter = setTimeout(function () {
      if (!mine()) return;
      if (e.then) { set(e.then); return; }
      if (UI.reduced || G.fastText) { set(keep); return; }
      var n = full.length;
      (function del() {
        if (!mine() || n <= keep.length) return;
        n -= 1; set(full.slice(0, n)); G.A('play', 'type');
        UI.vAfter = setTimeout(del, 85 / G.pace());
      })();
    }, (e.then ? 2600 : 1300) / G.pace());
  }
  /* Where the plate is, for the picture: a named dot's label never shows through it (visual.js keepOut) */
  /* (EE-107: also while a card is up. A lit line stays above the ring when a card rises, and moves up with the ring when
   * the card lifts it; only a plate nobody can see any more lets the labels back.) */
  function syncKeep() {
    var vb = $('voice'), r = null, p = UI.vLine ? vb.querySelector('.plate:not(.gone)') : null;
    if (p && $('stage').classList.contains('carding') && +getComputedStyle(vb).opacity * +getComputedStyle(p).opacity < 0.03) p = null;
    if (p) {
      var a = p.getBoundingClientRect(), cv = $('cv').getBoundingClientRect();
      if (a.width > 0) r = { x0: Math.round(a.left - cv.left), x1: Math.round(a.right - cv.left), y0: Math.round(a.top - cv.top - 2), y1: Math.round(a.bottom - cv.top + 16) };
    }
    var sig = r ? [r.x0, r.y0, r.x1, r.y1].join(',') : '';
    if (sig !== UI.keepSig) { UI.keepSig = sig; G.V('set', { keepOut: r }); }
  }
  UI.syncKeep = syncKeep;
  /* (EE-108, eye pass item 12) what a named dot's label must never cross: the header, the act's title, the ring's words,
   * pips and press label, and "now" on the rim (canvas CSS px). The picture hides the label instead. */
  function syncKeepOuts() {
    var cv = $('cv').getBoundingClientRect(), out = [];
    ['hdr', 'actTitle', 'verb', 'pips', 'onword', 'change', 'now', 'legend', 'reader'].forEach(function (id) {
      var el = $(id);
      if (!el || el.hidden) return;
      if (id === 'reader' && !el.classList.contains('slot')) return;      /* a sequence in the voice slot (EE-108) */
      if (id !== 'hdr' && id !== 'verb' && id !== 'pips' && +getComputedStyle(el).opacity < 0.05) return;
      var r = el.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) return;
      out.push({ x0: Math.round(r.left - cv.left), y0: Math.round(r.top - cv.top), x1: Math.round(r.right - cv.left), y1: Math.round(r.bottom - cv.top) });
    });
    var sig = out.map(function (b) { return b.x0 + ',' + b.y0 + ',' + b.x1 + ',' + b.y1; }).join(';');
    if (sig !== UI.koSig) { UI.koSig = sig; G.V('set', { keepOuts: out }); }
    /* (EE-108, Muse) the press label and the words under the ring: the picture is clipped out under their text */
    var clip = [], rg = document.createRange();
    ['verb', 'onword', 'change'].forEach(function (id) {
      var el = $(id);
      if (!el || el.hidden || !el.textContent.trim()) return;
      if (id !== 'verb' && +getComputedStyle(el).opacity < 0.05) return;
      rg.selectNodeContents(el);
      var r = rg.getBoundingClientRect();
      if (r.width > 0) clip.push({ x0: Math.floor(r.left - cv.left - 4), y0: Math.floor(r.top - cv.top - 2), x1: Math.ceil(r.right - cv.left + 4), y1: Math.ceil(r.bottom - cv.top + 2) });
    });
    /* (EE-110, item 9) and the pips under the ring: no tangle thread (nor anything else) is drawn across them */
    var pp = $('pips');
    if (pp && !pp.hidden && pp.offsetParent && pp.firstElementChild) {
      /* (the row of dots itself, not the full-width box it is centred in) */
      var pa = pp.firstElementChild.getBoundingClientRect(), pz = pp.lastElementChild.getBoundingClientRect();
      if (pz.right > pa.left) clip.push({ x0: Math.floor(pa.left - cv.left - 4), y0: Math.floor(pa.top - cv.top - 3), x1: Math.ceil(pz.right - cv.left + 4), y1: Math.ceil(pz.bottom - cv.top + 3) });
    }
    var csig = clip.map(function (b) { return b.x0 + ',' + b.y0 + ',' + b.x1 + ',' + b.y1; }).join(';');
    if (csig !== UI.clipSig) { UI.clipSig = csig; G.V('set', { clipOut: clip }); }
    syncBacking();
  }
  /* (EE-108, item 9) the picture is painted out under a visible plate: the voice slot's, or a sequence's in the slot */
  function syncBacking() {
    var cv = $('cv').getBoundingClientRect(), out = [], vb = $('voice');
    function add(el, op) {
      if (!el || !(op > 0.02)) return;
      var r = el.getBoundingClientRect();
      if (r.width > 0) out.push({ x0: Math.round(r.left - cv.left), y0: Math.round(r.top - cv.top), x1: Math.round(r.right - cv.left), y1: Math.round(r.bottom - cv.top), a: Math.round(op * 20) / 20 });
    }
    var pl = vb.querySelector('.plate:not(.gone)');
    if (pl) add(pl, +getComputedStyle(vb).opacity * +getComputedStyle(pl).opacity);
    var rd = $('reader');
    if (!rd.hidden && rd.classList.contains('slot')) add(rd, 1);
    var sig = out.map(function (b) { return [b.x0, b.y0, b.x1, b.y1, b.a].join(','); }).join(';');
    if (sig !== UI.bkSig) { UI.bkSig = sig; G.V('set', { backing: out }); }
  }
  UI.voiceDim = function () {
    var box = $('voice'), v = UI.vLine;
    if (!v || UI.sitOn) return;                     /* a Ledger line being sat through holds until it has faded */
    if (UI.vType) { clearInterval(UI.vType); UI.vType = 0; var r = box.querySelector('.plate:not(.gone) .v-rest'); if (r) { r.previousSibling.data += r.textContent; r.textContent = ''; } }
    voiceRelease();
    /* the first two lines of a run go to the Journal, where history lives */
    /* (only a line that goes to the Journal, and only when the Journal is there to receive it) */
    if (v.first && v.first <= 2 && v.j && !UI.reduced && S().clicks <= 6 && !$('journal').hidden) { journalDrop(); return; }
    box.classList.add('dim');
    /* Acts III–IV: the named dots ring the ring, so a dimmed line leaves after a few seconds (and gives back their labels) */
    if (S().act >= 3) UI.vClear = setTimeout(function () { if (UI.vLine === v) UI.voiceOut(); }, 4000 / G.pace());
  };
  UI.voiceOut = function () {
    var box = $('voice');
    if (!UI.vLine || UI.sitOn) return;
    voiceRelease();
    UI.vLine = null;
    clearTimeout(UI.vClear);
    /* the labels come back once the plate has faded (UI.frame) */
    box.classList.add('out');
    var plates = [].slice.call(box.querySelectorAll('.plate'));
    setTimeout(function () { plates.forEach(function (p) { p.remove(); }); if (!UI.vLine) box.className = ''; }, 700);
  };
  function journalDrop() {
    var box = $('voice'), plate = box.querySelector('.plate:not(.gone)'), to = $('jLabel');
    UI.vLine = null;
    if (!plate) { box.className = ''; return; }
    var a = plate.getBoundingClientRect(), b = (to && !$('journal').hidden && to.getBoundingClientRect()) || null;
    if (!b || b.width === 0 || !plate.animate) { UI.vLine = {}; UI.voiceOut(); return; }      /* (no Journal to fly to: it fades) */
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    var anim = plate.animate([{ transform: 'translateX(-50%)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + dx + 'px), ' + dy + 'px) scale(0.12)', opacity: 0 }],
      { duration: 600, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    anim.onfinish = function () { plate.remove(); if (!UI.vLine) box.className = ''; };
  }

  /* ───────────── the caption: world lines at the foot of the stage, and one dot in the picture flares ───────────── */
  var BESIDE_UI = { reply: 1, act: 1 };
  UI.caption = function (e) {
    var c = $('caption'), p = c.firstChild, vb = $('voice');
    /* one place at a time: a line still in the voice slot (dimmed, or already fading) goes first, and the world line
     * comes in after it */
    /* (EE-110) ... except the reply to the player, which may stay lit beside it */
    var keepReply = !!UI.vLine && BESIDE_UI[UI.vLine.k] && !vb.classList.contains('dim');
    var late = !keepReply && (!!UI.vLine || (!!vb.querySelector('.plate') && vb.className !== ''));
    if (UI.vLine && !keepReply) UI.voiceOut();
    p.textContent = e.text;
    c.style.transition = ''; c.style.opacity = '';
    c.className = late ? 'on late' : 'on';
    G.V('pulse', 'one');
  };
  UI.captionOut = function (now_) {
    var c = $('caption');
    if (now_) { c.className = ''; c.style.transition = ''; c.style.opacity = ''; return; }
    if (c.classList.contains('on')) c.className = 'out';
  };

  /* ───────────── hints: light first, words third (DESIGN §4.7) ─────────────
   * The director names the target (a row or panel id, or the ring) and says the words. Here: the target glows gold in
   * time with the breath, with no timeout, and every second breath three warm-white motes fly from the ring's rim to it
   * (on a phone, when the row is off screen, to the foot of the stage, toward the column below). Reduced motion: the
   * glow only. Everything stops the moment the target is cleared. */
  UI.hint = function (tg) {
    var old = document.querySelector('#panels .hinted, #cards .hinted');
    if (old) old.classList.remove('hinted');
    UI.ht = tg ? { tg: tg, cyc: -1, el: null } : null;
  };
  function hintEl(tg) {
    if (!tg) return null;
    /* a row in the column, or its first offer: a card at the ring */
    if (tg.indexOf('row:') === 0) return $('panels').querySelector('.item[data-id="' + tg.slice(4) + '"]') || $('cards').querySelector('.card.offer[data-id="' + tg.slice(4) + '"] .o-buy');
    return null;
  }
  function hintFrame() {
    var ht = UI.ht;
    if (!ht) return;
    var el = hintEl(ht.tg);
    if (el !== ht.el) {
      var old = document.querySelector('#panels .hinted, #cards .hinted');
      if (old && old !== el) old.classList.remove('hinted');
      ht.el = el;
      ht.sync = 0;
    }
    if (!el) return;
    /* the glow peaks with the breath: its 4 s animation is started at the breath's phase */
    var P = E.period(S());
    if (!el.classList.contains('hinted') || now() - ht.sync > 10000) {
      var ph = ((G.bt - E.inhale(S()) + P / 2) % P + P) % P;
      el.style.setProperty('--hint-delay', (-ph).toFixed(2) + 's');
      el.classList.remove('hinted'); void el.offsetWidth; el.classList.add('hinted');
      ht.sync = now();
    }
    /* a stream every second breath, while no card owns the stage */
    if (UI.reduced || G.cyc === ht.cyc || G.cyc % 2 !== 0 || (UI.card && UI.card.card.k !== 'offer') || UI.reader || G.paused || G.held) return;     /* an offer at the ring is a target, not a speaker */
    ht.cyc = G.cyc;
    if ((G.V('__probe') || {}).q >= 2) return;
    stream(el);
  }
  function stream(el) {
    var box = ringBox(), st = $('stage').getBoundingClientRect(), tr = el.getBoundingClientRect();
    var vis = tr.bottom > 0 && tr.top < window.innerHeight && tr.width > 0;
    var x1, y1;
    if (vis) { x1 = tr.left + Math.min(tr.width / 2, 120); y1 = tr.top + tr.height / 2; }
    else { x1 = st.left + st.width / 2; y1 = Math.min(window.innerHeight - 12, st.bottom - 10); }
    for (var i = 0; i < 3; i++) {
      var m = UI.motes[i], a0 = -Math.PI / 2 + (x1 > st.left + box.x ? 0.5 : -0.5);
      var x0 = st.left + box.x + Math.cos(a0) * box.r, y0 = st.top + box.y + Math.sin(a0) * box.r;
      m.style.left = x0 + 'px'; m.style.top = y0 + 'px';
      if (!m.animate) continue;
      var dx = x1 - x0, dy = y1 - y0, bow = -Math.min(60, Math.abs(dx) * 0.12 + 20);
      m.animate([
        { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
        { transform: 'translate(' + (dx * 0.25) + 'px, ' + (dy * 0.25 + bow) + 'px) scale(1)', opacity: 0.95, offset: 0.25 },
        { transform: 'translate(' + (dx * 0.7) + 'px, ' + (dy * 0.7 + bow * 0.6) + 'px) scale(0.9)', opacity: 0.9, offset: 0.7 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.6)', opacity: 0 }
      ], { duration: 1100, delay: i * 180, easing: 'ease-in-out', fill: 'both' });
    }
  }
  UI.hintFrame = hintFrame;

  /* ───────────── resources, chips ───────────── */

  var RES = ['clarity', 'insight', 'followers', 'energy'];
  function resVisible(s, k) {
    if (k === 'clarity') return s.clicks > 0;
    if (k === 'insight') return s.act >= 2;
    if (k === 'followers') return s.act >= 3;
    return !!s.up.dynamo;
  }
  function syncResources(s, r, dt) {
    var box = $('resources'), cur = E.actRes(s), merged = !!s.flags.merged, rounds = E.lean(s) >= D.lean.rounds && s.phase === 'play';
    for (var i = 0; i < RES.length; i++) {
      var k = RES[i];
      if (!resVisible(s, k)) continue;
      var o = UI.res[k];
      if (!o) {
        o = UI.res[k] = { row: h('div', 'res k-' + k), val: h('span', 'num'), rate: h('span', 'r-rate') };
        o.row.appendChild(h('span', 'r-name', ST.ui.resources[k]));
        o.row.appendChild(h('span', 'r-val', [o.val, o.rate]));
        /* newest (current act) on top */
        box.insertBefore(o.row, box.firstChild);
        UI.disp[k] = s.res[k];
      }
      o.row.classList.toggle('cur', k === cur && !merged);
      var target = s.res[k], d = UI.disp[k];
      /* while the first twelve are being met, the count goes up as each one is read out */
      if (k === 'followers' && s.act === 3 && s.joined <= 12 && target < 13 && UI.namesShown < s.joined) target = Math.max(1, UI.namesShown);
      if (dt > 0) {
        d += (target - d) * (1 - Math.exp(-dt * 9));
        if (Math.abs(target - d) < Math.max(0.5, Math.abs(target) * 1e-5)) d = target;
      } else if (dt === 0) d = target;
      UI.disp[k] = d;
      /* once Hum rounds (lean ≥ +1; round 2, bundle C), a counter of a thousand or more reads "about 12 thousand" */
      var txt = merged ? '1' : (rounds && d >= 1000 ? T(ST.ui.about, { n: E.approx(d) }) : E.num(Math.max(0, d)));
      if (o.vt !== txt) { o.vt = txt; o.val.textContent = txt; }
      var rate = k === 'clarity' ? r.clarity : k === 'insight' ? r.insight : k === 'followers' ? r.people : r.energy;
      var rt = merged || s.phase !== 'play' ? '' : (rate > 0 ? '+' + E.rate(rate) + '/s' : '');
      if (o.rt !== rt) { o.rt = rt; o.rate.textContent = rt; }
    }
    if (s.meta.sigils > 0 && !UI.res.sigils) {
      UI.res.sigils = { row: h('div', 'res k-sigils', [h('span', 'r-name', ST.ui.resources.sigils), h('span', 'r-val', String(s.meta.sigils))]) };
      box.appendChild(UI.res.sigils.row);
    }
  }

  function syncChips(s, r) {
    var parts = [], buffs = E.buffs(s), i;
    if (s.trust > 0) parts.push('t' + s.trust);
    if (r.T > 0) parts.push('g' + r.T.toFixed(1));
    for (i = 0; i < buffs.length; i++) parts.push(buffs[i].k + buffs[i].tag + buffs[i].m);
    var sig = parts.join('|'), box = $('chips');
    if (sig !== UI.sig.chips) {
      UI.sig.chips = sig;
      clear(box);
      UI.buffEls = [];
      if (s.trust > 0) box.appendChild(h('span', 'chip trust', ST.ui.trust.name + ' ' + s.trust, { title: ST.ui.trust.desc }));
      if (r.T > 0) box.appendChild(h('span', 'chip tangle', ST.ui.tangle.name + ' ' + E.dec(r.T, 1), { title: T(ST.ui.tangle.desc) }));
      for (i = 0; i < buffs.length; i++) {
        var b = buffs[i], name = b.k === 'ins' ? ST.ui.resources.insight + ' ' : b.k === 'grow' ? ST.ui.resources.followers + ' ' : '';
        var m = b.m >= 1 ? '×' + E.dec(b.m, 2) : (b.m === 0 ? '×0' : '−' + E.pct(Math.round((1 - b.m) * 100)));
        if (b.tag === 'gift') m = '+' + E.pct(Math.round((b.m - 1) * 100));
        var bar = h('i'), c = h('span', 'chip buff' + (b.m < 1 ? ' bad' : ''), [name + m, bar]);
        box.appendChild(c);
        UI.buffEls.push(bar);
      }
    }
    for (i = 0; i < buffs.length && UI.buffEls && i < UI.buffEls.length; i++) UI.buffEls[i].style.width = Math.max(0, Math.min(100, buffs[i].left / buffs[i].len * 100)) + '%';
  }

  /* ───────────── panels ───────────── */

  /* (EE-110, item 2) how far toward a cost: "7 / 10 Clarity" (people first when they are what is short) */
  function progText(s, it) {
    var R = ST.ui.resources;
    if (it.need && s.res.followers < it.need) return E.num(Math.floor(s.res.followers)) + ' / ' + E.num(it.need) + ' ' + R.followers;
    return E.num(Math.floor(Math.min(s.res[it.cur], it.cost))) + ' / ' + E.num(it.cost) + ' ' + R[it.cur];
  }
  function costText(it) {
    var R = ST.ui.resources, t = E.num(it.cost) + ' ' + R[it.cur];
    if (it.need) t = E.num(it.need) + ' ' + R.followers + ' · ' + t;
    return t;
  }
  /* A row (round 2, EE-106; Bob's spec): its name · one upright line with the number it does · its cost. A row the
   * player can't afford yet stays readable; only the cost dims. The next step is at 70% ink with an amber bar along its
   * foot that fills as the cost is banked; beyond it one "· · ·" with a cost. */
  function itemRow(s, it) {
    var tx = E.itemText(s, it.id), project = it.kind === 'project';
    if (it.hz) return h('div', 'item hz', [h('span', 'i-name', ST.ui.horizon), h('span', 'i-cost', costText(it))], { 'data-id': it.id, 'aria-hidden': 'true' });
    var name = h('span', 'i-name', T(tx.name));
    if (it.kind === 'gen' && it.level > 0) name.appendChild(h('small', null, '×' + it.level));
    var kids = [name, h('span', 'i-cost', costText(it)), h('span', 'i-fx', T(tx.fx || ''))];
    var bar = it.next || it.kind === 'gen';
    if (bar) kids.push(h('i', 'i-bar'));
    var b = h('button', 'item ' + (project ? 'project' : it.kind) + (it.next ? ' next' : ''), kids, { 'data-id': it.id, 'data-key': 'i-' + it.id });
    if (bar) { b._cost = it.cost; b._cur = it.cur; b._need = it.need || 0; }
    if (project) b.appendChild(h('span', 'i-go', T(tx.button)));
    if (it.kind === 'gen' && it.level >= 10) {
      return h('div', 'gen-wrap', [b, h('button', 'max', ST.build.buyMax, { 'data-max': it.id, 'data-key': 'm-' + it.id })]);
    }
    return b;
  }
  function ownedLine(s, items) {
    var names = items.filter(function (it) { return it.owned && it.kind !== 'project'; }).map(function (it) { return T(E.itemText(s, it.id).name); });
    return names.length ? h('p', 'owned', names.join(' · ')) : null;
  }

  /* The column's order (EE-110, item 8): the resources, then the current act's panel with the row to buy, the next row and
   * the "· · ·" first in it (a buyable row is never below a list), then Hum's header (it always says where lean stands;
   * folded in Acts III–IV it is one line), the Circle, the Ledger, the Practice; the Journal last. */
  var ACT_PANEL = { 1: 'practice', 2: 'hum', 3: 'circle', 4: 'engine' };
  function panelOrder(s) {
    var first = ACT_PANEL[s.act] || 'practice', o = [first];
    ['hum', 'circle', 'engine', 'ledger', 'practice'].forEach(function (p) { if (p !== first) o.push(p); });
    return o;
  }
  /* A panel is there once it has something in the column: a panel's first row is offered at the ring first, and the
   * panel is born there when it is bought (and flies to its place). */
  function panelDefs(s, items) {
    var by = { practice: [], hum: [], circle: [], engine: [] };
    items.forEach(function (it) { if (!it.offer) by[it.grp].push(it); });
    /* "· · ·" last */
    for (var g in by) by[g].sort(function (a, b) { return (a.hz ? 1 : 0) - (b.hz ? 1 : 0); });
    var defs = {};
    if (by.practice.length) defs.practice = { act: 1, items: by.practice };
    if (s.act >= 2 && by.hum.length) defs.hum = { act: 2, items: by.hum };
    if (s.act >= 3) defs.circle = { act: 3, items: by.circle };
    if (s.act >= 4) defs.engine = { act: 4, items: by.engine };
    if (s.flags.ledger) defs.ledger = { act: 0, items: [] };
    return defs;
  }
  function panelSig(s, p, d) {
    var a = [UI.fold[p] ? 'f' : 'o'];
    d.items.forEach(function (it) { a.push(it.id + (it.owned ? '!' : '') + (it.next ? 'n' : '') + (it.hz ? 'h' : '') + (it.level || '') + ':' + it.cost); });
    if (p === 'practice') a.push(s.up.tracker ? 'T' : '');
    if (p === 'circle') a.push('n' + UI.namesShown, s.res.followers >= 100 ? 'M' : '', s.res.followers > 12.5 ? 'L' : '', s.flags.merged ? 'W' : '');
    if (p === 'ledger') a.push(s.ledger.map(function (e) { return e.id + e.patches.length + (e.st === 3 ? 's' : ''); }).join(','), s.phase);
    if (p === 'hum') a.push(s.hum, E.leanHead(s));
    if (p === 'circle') a.push(E.lean(s) >= D.lean.rounds ? 'R' : '', E.hasFriend(s) ? 'F' + s.friend.name : '', (UI.darkShown || []).join(''));
    return a.join('|');
  }
  function buildPanel(s, p, d) {
    var name = T(ST.ui.panels[p]), folded = !!UI.fold[p];
    /* the Hum panel's header always says where lean stands (round 2, bundle C; Bob: teal mono 13 px, beside the name) */
    var sub = p === 'hum' ? h('span', 'p-sub lean', ST.ui.lean[E.leanHead(s)], { 'data-band': E.leanBand(s) }) : h('span', 'p-sub', '');
    var head = h('button', 'p-head', [h('span', 'label', name), sub, h('span', 'caret', folded ? '+' : '–')], { 'data-fold': p, 'data-key': 'f-' + p, 'aria-expanded': folded ? 'false' : 'true' });
    var body = h('div', 'p-body');
    var sec = h('section', 'panel p-' + p + (folded ? ' folded' : ''), [head, body], { 'data-p': p });
    if (folded) return sec;
    var open = d.items.filter(function (it) { return !it.owned; }), ol;

    /* (EE-110, item 8) in every panel the rows come first, then what is owned and any list */
    if (p === 'practice') {
      open.forEach(function (it) { body.appendChild(itemRow(s, it)); });
      if ((ol = ownedLine(s, d.items))) body.appendChild(ol);
      if (s.up.tracker) body.appendChild(h('p', 'stats', '', { id: 'stats' }));
    } else if (p === 'hum') {
      open.forEach(function (it) { body.appendChild(itemRow(s, it)); });
      if ((ol = ownedLine(s, d.items))) body.appendChild(ol);
    } else if (p === 'circle') {
      open.forEach(function (it) { body.appendChild(itemRow(s, it)); });
      if ((ol = ownedLine(s, d.items))) body.appendChild(ol);
      if (UI.namesShown > 0) {
        /* everyone who has arrived, in the order they came; while there are twelve or fewer, all of them in view */
        var F = s.res.followers, names = h('div', 'names' + (F > 12.5 ? ' many' : ''));
        /* (EE-110, item 7) a dot a knot took home: its line dims and its dot is hollow, once the picture has made its mark */
        var dark = UI.darkShown || [];
        for (var i = 0; i < Math.min(UI.namesShown, 12); i++) {
          var c = ST.act3.circle[i], ln = h('p', dark.indexOf(i) >= 0 ? 'dark' : null, s.flags.merged ? [h('b', null, ST.build.we)] : joinedLine(c, E.lifeLine(s, i)));
          /* (EE-110, item 9) the list is whole on its first frame: only a line that has just arrived rises */
          if (i < (UI.namesRisen || 0)) ln.style.animation = 'none';
          names.appendChild(ln);
        }
        UI.namesRisen = Math.max(UI.namesRisen || 0, Math.min(UI.namesShown, 12));
        /* the thirteenth: "{friend}: you brought them. That's all it says." */
        if (E.hasFriend(s) && UI.namesShown >= 12) names.appendChild(h('p', 'friend', s.flags.merged ? [h('b', null, ST.build.we)] : friendLine(s)));
        if (F >= 100) names.appendChild(h('p', 'more', ST.build.more.replace('{n}', ''), { id: 'more' }));
        body.appendChild(names);
      }
    } else if (p === 'engine') {
      body.appendChild(h('div', 'gbar', [
        h('div', 'g-top', [h('span', 'label', ST.ui.bar), h('span', 'g-pct', '', { id: 'gPct' }), h('span', 'g-count', '', { id: 'gCount' })]),
        h('div', 'g-track', h('div', 'g-fill', null, { id: 'gFill' }))
      ]));
      open.forEach(function (it) { body.appendChild(itemRow(s, it)); });
      if ((ol = ownedLine(s, d.items))) body.appendChild(ol);
    } else if (p === 'ledger') {
      body.classList.add('ledger');
      body.appendChild(h('p', 'l-intro', T(ST.ledger.intro)));
      if (!s.ledger.length) body.appendChild(h('p', 'l-empty', T(ST.ledger.empty)));
      else {
        /* a page to read (round 2, bundle C: no button). A patch Hum made, by itself or when the player went quiet,
         * is in its own hand: teal. The line being sat through is marked. */
        var ol2 = h('ol');
        s.ledger.forEach(function (e) {
          var li = h('li', e.st === 3 ? 'sitting' : null, e.line);
          e.patches.forEach(function (pt, j) { var by = e.ph && e.ph[j]; li.appendChild(h('span', by === 'hum' || by === 'walk' ? 'by-hum' : null, pt)); });
          ol2.appendChild(li);
        });
        body.appendChild(ol2);
      }
    }
    return sec;
  }
  /* "{name}, {city}: {line}" in the language's own order and punctuation, the name set apart */
  function joinedLine(c, line) {
    var parts = String(ST.act3.joined).split('{name}'), kids = [];
    parts.forEach(function (part, i) {
      if (i) kids.push(h('b', null, c.name));
      if (part) kids.push(part.replace('{city}', c.city).replace('{line}', line == null ? c.line : line));
    });
    return kids;
  }
  /* the thirteenth's line, its name set apart (the name is the player's: text only) */
  /* The Circle's people list, once it scrolls, ends on a whole line, never clipped mid-line (EE-108, eye pass item 12) */
  function fitNames(sec) {
    var n = sec.querySelector('.names.many');
    if (!n) return;
    n.style.maxHeight = '';
    /* layout offsets, not boxes: the lines are still rising (a transform) when the panel is built */
    var cap = parseFloat(getComputedStyle(n).maxHeight) || 148, best = 0;
    [].forEach.call(n.children, function (p) { var b = p.offsetTop - n.offsetTop + p.offsetHeight; if (b <= cap + 0.5) best = Math.max(best, b); });
    if (best > 0) n.style.maxHeight = Math.ceil(best + 2) + 'px';
  }
  function friendLine(s) {
    var parts = String(ST.questions.friend.dot).split('{friend}'), kids = [];
    parts.forEach(function (part, i) { if (i) kids.push(h('b', null, s.friend.name)); if (part) kids.push(T(part)); });
    return kids;
  }
  function onPanelClick(e) {
    var t = e.target.closest ? e.target.closest('button') : null;
    if (!t) return;
    var d = t.dataset;
    if (d.fold) { UI.fold[d.fold] = !UI.fold[d.fold]; UI.touched[d.fold] = true; UI.sync(true); return; }
    if (d.max) { G.buyMax(d.max); return; }
    if (d.id) {
      var rr = t.getBoundingClientRect(), before = E.worth(S());
      /* the row stays where it is while the sweep plays on it, then the column moves (EE-108, eye pass item 13) */
      UI.panelHold = now() + (UI.reduced ? 0 : 760);
      if (e.shiftKey && D.act2.gens[d.id] ? G.buyMax(d.id) : G.buy(d.id)) UI.buyMoment(d.id, /^p_/.test(d.id) ? null : before, rr);
      return;
    }
  }

  function syncPanels(s, items) {
    var defs = panelDefs(s, items), box = $('panels'), p, i;
    /* a new act folds the earlier ones */
    if (UI.lastAct !== s.act) { UI.lastAct = s.act; UI.fold = { practice: s.act > 1, hum: s.act > 2, circle: s.act > 3 }; }
    if (s.flags.merged && !UI.mergedShown) { UI.mergedShown = true; UI.fold.circle = false; UI.fold.engine = true; UI.fold.ledger = true; }
    var ORDER = panelOrder(s);
    for (i = 0; i < ORDER.length; i++) {
      p = ORDER[i];
      var el = box.querySelector('[data-p="' + p + '"]');
      if (!defs[p]) { if (el) el.remove(); UI.sig[p] = null; continue; }
      if (UI.fold[p] == null) UI.fold[p] = (p !== 'ledger' && defs[p].act < s.act);
      /* the Ledger opens when there is something in it, and folds away when there is not */
      if (p === 'ledger' && !UI.touched.ledger && !s.flags.merged) UI.fold.ledger = s.ledger.length === 0;
      var sig = panelSig(s, p, defs[p]);
      if (sig === UI.sig[p] && el) continue;
      if (el && now() < (UI.panelHold || 0)) continue;          /* a bought row is still being swept */
      UI.sig[p] = sig;
      var act = document.activeElement, key = act && el && el.contains(act) ? act.getAttribute('data-key') : null;
      var fresh = buildPanel(s, p, defs[p]);
      if (el) { fresh.style.animation = 'none'; box.replaceChild(fresh, el); }
      else {
        /* in the act's order (panelOrder) */
        var before = null;
        for (var j = i + 1; j < ORDER.length && !before; j++) before = box.querySelector('[data-p="' + ORDER[j] + '"]');
        box.insertBefore(fresh, before);
        /* a new panel is born at the ring and flies to its place (not on load) */
        if (UI.panelsReady && p !== 'ledger') flyFromRing(fresh);
      }
      if (key) { var f = fresh.querySelector('[data-key="' + key + '"]'); if (f && !f.disabled) f.focus(); }
      if (p === 'circle') { fitNames(fresh); requestAnimationFrame(function () { var c2 = $('panels').querySelector('[data-p="circle"]'); if (c2) fitNames(c2); }); }
    }
    /* a new act: the panels move into its order (once, when the order changes) */
    var osig = ORDER.join(',');
    if (UI.orderSig !== osig) {
      UI.orderSig = osig;
      ORDER.forEach(function (q) { var e2 = box.querySelector('[data-p="' + q + '"]'); if (e2) box.appendChild(e2); });
    }
    /* what can be afforded right now */
    var can = {};
    items.forEach(function (it) { can[it.id] = it.can; });
    var rows = box.querySelectorAll('.item');
    for (i = 0; i < rows.length; i++) {
      var ok = !!can[rows[i].dataset.id];
      if (rows[i].classList.contains('can') !== ok) rows[i].classList.toggle('can', ok);
      rows[i].setAttribute('aria-disabled', ok ? 'false' : 'true');
    }
    /* a row whose line carries a live number (the Jar, the First Engine) keeps it true (EE-108) */
    for (i = 0; i < rows.length; i++) {
      var rid = rows[i].dataset.id;
      if (rid !== 'jar' && rid !== 'dynamo') continue;
      var fxe = rows[i].querySelector('.i-fx'), want = T(E.itemText(s, rid).fx || '');
      if (fxe && fxe.textContent !== want) fxe.textContent = want;
    }
    /* the amber bars fill as the cost is banked */
    var bars = box.querySelectorAll('.i-bar');
    for (i = 0; i < bars.length; i++) {
      var row = bars[i].parentNode, f = row._cost > 0 ? Math.min(1, s.res[row._cur] / row._cost) : 1;
      if (row._need) f = Math.min(f, s.res.followers / row._need);
      var tf = 'scaleX(' + Math.max(0, f).toFixed(3) + ')';
      if (bars[i]._tf !== tf) { bars[i]._tf = tf; bars[i].style.transform = tf; }
    }
    UI.panelsReady = true;
    /* small live bits */
    var st = $('stats');
    if (st) st.textContent = ST.build.stats.replace('{breaths}', E.num(s.breaths)).replace('{best}', E.num(s.best));
    var more = $('more');
    if (more) more.textContent = ST.build.more.replace('{n}', s.flags.merged ? '0' : E.num(Math.max(0, s.res.followers - 12)));
    var gp = $('gPct');
    if (gp) {
      var F = (s.ending === 'sit' && s.phase === 'keepsake') ? D.K : s.res.followers;   /* the one in eight billion sat */
      gp.textContent = s.flags.merged ? '1' : E.percent(F);
      $('gFill').style.width = Math.min(100, F / D.K * 100) + '%';
      $('gCount').textContent = s.flags.merged ? '' : (F / D.K > 0.99 ? E.exact(F) + ' / ' + E.exact(D.K) : '');
    }
  }

  /* ───────────── the regular sync (about ten times a second) ───────────── */

  /* (EE-110, item 7) A dot going dark is shown once the knot's result lines have been said (none waiting or lit), no card
   * open, and the voice slot dim or empty for 0.6 s, or 4 s after the result if other lines keep it lit. The picture's flare and name, and the Circle
   * list's hollow dot, follow UI.darkShown, not the run (a run loaded is shown as it is). */
  function syncDark(s) {
    var all = (s.marks && s.marks.dark) || [], d = s.dir, X = EE.dir;
    if (UI.darkFor !== s) { UI.darkFor = s; UI.darkShown = all.slice(); return; }
    if (UI.darkShown.length >= all.length) return;
    /* the knot's result lines (their numbers, from E's sitDone; a mark made another way waits for the slot only) */
    var af = (s.marks && s.marks.after) || [0, -1], lo = af[0], hi = af[1];
    var busy = !!s.sit || !d || (d.card && d.card.k !== 'offer') || s.phase !== 'play' ||
      (d.voice && !d.voice.dim && d.voice.s >= lo && d.voice.s <= hi) ||
      (X && X.pending(s, function (x) { return x.s >= lo && x.s <= hi; }));
    if (busy) { UI.darkQuiet = null; UI.darkReady = null; return; }
    /* the result has been said: the mark waits for the voice slot to be dim or empty for 0.6 s, but no longer than 4 s
     * (Act III's arrivals can keep the slot lit; the name then sits beside the plate, never under it) */
    if (UI.darkReady == null) UI.darkReady = now();
    var lit = d.voice && !d.voice.dim;
    if (lit) UI.darkQuiet = null; else if (UI.darkQuiet == null) UI.darkQuiet = now();
    if (!(UI.darkQuiet != null && now() - UI.darkQuiet >= 600 / G.pace()) && now() - UI.darkReady < 4000 / G.pace()) return;
    for (var i = 0; i < all.length; i++) if (UI.darkShown.indexOf(all[i]) < 0) { UI.darkShown.push(all[i]); break; }
    UI.darkReady = null; UI.darkQuiet = null;
    UI.sig.circle = null;                                 /* the list's line dims with it */
  }
  UI.syncDark = syncDark;
  UI.sync = function (force) {
    var s = S(), app = $('app'), r = G.rates();
    syncDark(s);
    var cls = [];
    if (app.classList.contains('intro')) cls.push('intro');
    if (app.classList.contains('intro-out')) cls.push('intro-out');
    cls.push('act-' + s.act, 'ph-' + s.phase);
    if (s.clicks > 0 || s.act > 1) cls.push('r-side', 'r-hdr');
    if (s.up.metronome || s.act > 1) cls.push('r-title');
    if (s.flags.merged) cls.push('merged');
    if (UI.short) cls.push('short');
    if (s.clicks === 0 && s.dir && s.dir.ht && s.dir.ht.tg === 'ring0' && s.dir.ht.n > 0 && s.phase === 'play') cls.push('nudge-press');
    var wantLangs = s.clicks === 0 && s.act === 1 && s.phase === 'play' && !UI.langsDone;
    if (wantLangs) cls.push('langs');
    syncLangs(wantLangs);
    if (UI.white && s.ending === 'merge' && (s.phase === 'ending' || s.phase === 'keepsake')) cls.push('whiteout');
    if (s.ending && (s.phase === 'ending' || s.phase === 'keepsake')) cls.push('end-' + s.ending);
    var c = cls.join(' ');
    if (app.className !== c) app.className = c;

    $('verb').textContent = ST.ui.press[s.act];
    $('ring').setAttribute('aria-label', ST.ui.press[s.act]);
    var at = ST.meta.actTitles[s.act];
    $('actTitle').textContent = at.num + ' · ' + T(at.name);
    var day = ST.build.day.replace('{n}', E.num(Math.floor(s.day)));
    if (s.act === 1) {
      var mins = 400 + Math.round(50 * Math.min(1, s.tot.clarity / D.act1.dawnAt));
      day += ' · ' + clockText(mins);
    }
    $('hDay').textContent = day;
    $('pips').hidden = !s.up.tracker;
    $('pips').title = s.streak + ' ' + ST.ui.streakLabel;
    $('jHint').hidden = s.journal.length < 6 || s.journal.some(function (j) { return j.s; });

    syncResources(s, r, force ? 0 : -1);
    syncChips(s, r);
    syncPanels(s, E.items(s));

    /* the legend */
    var lg = '';
    if (s.act >= 3 && s.phase === 'play') {
      var per = G.V('legend') || 1;
      lg = per <= 1 ? ST.ui.legendOne : ST.ui.legend.replace('{n}', E.num(per) + (E.sep() || '') + ST.build.people);
    }
    if ($('legend').textContent !== lg) $('legend').textContent = lg;
    /* Merge: once the picture behind the words has gone white, the words go to dark ink */
    if (s.ending === 'merge' && s.flags.endingOn && !UI.white) whiteCheck();
    if (s.ending !== 'merge' && UI.white) UI.white = false;

    if (!G.held) cardStep();
    syncSit(s);
    /* a drafted decision whose last dot went out while the page was away (or reloaded): Hum sends it now */
    if (UI.card && UI.card.mode === 'ask' && UI.card.card.k === 'decision' && UI.card.card.draft === 0 && UI.card.draftSend) UI.draftTick(0);
    /* an offer at the ring can be bought only while it can be afforded */
    if (UI.card && UI.card.buyBtn) {
      var oi = E.find(s, UI.card.card.id), ok = !!(oi && oi.can);
      if (UI.card.buyBtn.disabled === ok) { UI.card.buyBtn.disabled = !ok; UI.card.el.classList.toggle('can', ok); }
      var ob2 = UI.card.buyBar;
      if (ob2 && oi) { var of = oi.cost > 0 ? Math.min(1, s.res[oi.cur] / oi.cost) : 1; if (oi.need) of = Math.min(of, s.res.followers / oi.need); var otf = 'scaleX(' + Math.max(0, of).toFixed(3) + ')'; if (ob2._tf !== otf) { ob2._tf = otf; ob2.style.transform = otf; } }
      /* (EE-110, item 2) beside the bar, how far: "7 / 10 Clarity" (digits and the resource's own name) until it can be bought */
      var op = UI.card.buyProg;
      if (op && oi) { var ot = ok ? '' : progText(s, oi); if (op._t !== ot) { op._t = ot; op.textContent = ot; } }
    }
    if (UI.vLine) syncKeep();
    fitStage();
  };

  /* The language row at the foot of the first screen: fades out, then leaves the layout and the accessibility tree */
  function syncLangs(want) {
    var el = $('langs');
    if (want) {
      clearTimeout(UI.langsT); UI.langsT = 0;
      if (el.hidden) el.hidden = false;
      el.removeAttribute('aria-hidden');
      return;
    }
    if (el.hidden || UI.langsT) return;
    el.setAttribute('aria-hidden', 'true');
    if (parseFloat(getComputedStyle(el).opacity) < 0.02) { el.hidden = true; return; }
    UI.langsT = setTimeout(function () { UI.langsT = 0; el.hidden = true; }, 1700);
  }

  /* Narrow screens (2026-11-13, Bulut on an iPhone): a card or a sequence rising under the ring must never reach over
   * the counts below the stage. The picture keeps its height (--stage-h); the stage grows a bay under it, as deep as the
   * card needs, and the page scrolls. It grows at once and settles back gently once the card is gone. */
  function fitStage() {
    var st = $('stage');
    if (UI.wide) { if (UI.bay) { UI.bay = 0; st.style.setProperty('--bay', '0px'); } return; }
    var cvH = $('cv').offsetHeight || st.clientHeight, low = 0;
    [$('cards'), $('reader')].forEach(function (el) {
      if (el.hidden || !el.firstElementChild) return;
      low = Math.max(low, el.offsetTop + el.offsetHeight);
    });
    var bay = low ? Math.max(0, Math.ceil(low + 14 - cvH)) : 0;
    if (Math.abs(bay - (UI.bay || 0)) > 1) {
      st.style.transition = bay > (UI.bay || 0) ? 'none' : '';
      UI.bay = bay;
      st.style.setProperty('--bay', bay + 'px');
    }
  }
  UI.fitStage = fitStage;

  /* The Act I clock: "6:40 a.m." in English, the locale's own way otherwise ("06:40", "오전 6:40"). */
  var CLK = {};
  function clockText(mins) {
    var hh = Math.floor(mins / 60), mm = mins % 60;
    if (!EE.locale) return hh + ':' + ('0' + mm).slice(-2) + ' a.m.';
    try {
      var f = CLK[EE.locale] || (CLK[EE.locale] = new Intl.DateTimeFormat(EE.locale, { hour: 'numeric', minute: '2-digit' }));
      return f.format(new Date(2026, 10, 12, hh, mm));
    } catch (e) { return hh + ':' + ('0' + mm).slice(-2); }
  }
  UI.clockText = clockText;

  /* Has the canvas behind the reader whitened? Sample it (a few pixels); without a picture, go by the clock. */
  function whiteCheck() {
    var t = now();
    if (!UI.whiteT0) UI.whiteT0 = t;
    if (UI.useFallback || t - UI.whiteT0 > 20000) { if (t - UI.whiteT0 > 9000) UI.white = true; return; }
    try {
      var cv = $('cv'), ctx = cv.getContext('2d'), cb = cv.getBoundingClientRect(), rb = $('reader').getBoundingClientRect();
      var cy = rb.height > 0 ? rb.top + rb.height / 2 - cb.top : cb.height * 0.86;
      cy = Math.max(cb.height * 0.5, Math.min(cb.height * 0.93, cy));
      var kx = cv.width / cb.width, ky = cv.height / cb.height, sum = 0, n = 0;
      [0.3, 0.42, 0.5, 0.58, 0.7].forEach(function (fx) {
        var d = ctx.getImageData(Math.floor(cb.width * fx * kx), Math.floor(cy * ky), 1, 1).data;
        sum += (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255; n++;
      });
      if (sum / n > 0.8) UI.white = true;
    } catch (e) { if (t - UI.whiteT0 > 9000) UI.white = true; }
  }

  /* Every frame: counters roll, the ring is placed, pips and timers move. */
  UI.frame = function (dt, breath, inWin) {
    var s = S(), t = now();
    ringBox();
    var stg = $('stage');
    if (stg.classList.contains('inwin') !== !!inWin) stg.classList.toggle('inwin', !!inWin);
    /* "now" on the rim at each gold moment, for a player who hasn't found it yet */
    var help = !!(s.pr && (s.pr.help || s.pr.hint)) && s.phase === 'play';     /* (EE-108: the ring's hint too) */
    if (stg.classList.contains('help') !== help) { stg.classList.toggle('help', help); if (help) $('now').textContent = ST.ui.now; }
    var carding = !!((UI.card && UI.card.card.k !== 'offer') || UI.reader);     /* an offer at the ring lets the voice slot speak */
    if (stg.classList.contains('carding') !== carding) { stg.classList.toggle('carding', carding); if (!carding) syncKeep(); }
    /* while the ring eases into or out of a card's lift the plate moves with it: the keep-out follows every frame */
    if (UI.vLine && t < (UI.liftUntil || 0)) syncKeep();
    /* a keep-out is let go only when the voice slot can no longer be seen */
    else if (UI.keepSig && !(UI.vLine && !carding)) {
      var vb0 = $('voice'), vo0 = +getComputedStyle(vb0).opacity, pl0 = vb0.querySelector('.plate:not(.gone)');
      if (!pl0 || vo0 * +getComputedStyle(pl0).opacity < 0.03) syncKeep();
    }
    hintFrame();
    if (t - (UI.koT || 0) > 250 || t < (UI.liftUntil || 0)) { UI.koT = t; syncKeepOuts(); }
    else if (t - (UI.bkT || 0) > 100 && (UI.vLine || UI.reader || UI.bkSig)) { UI.bkT = t; syncBacking(); }     /* the backing follows a plate's fade */
    var pips = $('pips').children, n = Math.min(10, s.streak);
    for (var i = 0; i < 10; i++) if (pips[i].classList.contains('on') !== (i < n)) pips[i].classList.toggle('on', i < n);
    if (UI.res) syncResources(s, G.rates(), dt);
    if (UI.useFallback) {
      var fb = $('fallback'), box = ringBox(), e = 0.5 - 0.5 * Math.cos(breath * 2 * Math.PI), d = box.r * 2;
      fb.hidden = false;
      var a = fb.children[0], b = fb.children[1];
      a.style.left = b.style.left = box.x + 'px'; a.style.top = b.style.top = box.y + 'px';
      a.style.width = a.style.height = d + 'px';
      var dd = d * (0.72 + 0.28 * e);
      b.style.width = b.style.height = dd + 'px';
      b.style.opacity = inWin ? 1 : 0.8;
    }
    if (t - UI.lastSync > 100) { UI.lastSync = t; UI.sync(); }
  };

  /* ───────────── cards ───────────── */

  /* only decisions and knots dim the stage (DESIGN §5; EE-110, item 6: questions and thoughts never did, by the design) */
  var BLOCKING = { decision: 1, knot: 1 };
  var CHAINED = { name: 1, pname: 1, seq: 1, 'final': 1, keepsake: 1 };

  /* While the run is in play the director says when a card may rise (s.dir.card); after the bar stops (the finale, the
   * Final Alignment, the ending, the keepsake) nothing else speaks, and the queue plays in order. */
  function cardStep() {
    var s = S(), head = s.queue[0] || null, d = s.phase === 'play' ? s.dir : null;
    if (UI.card && UI.card.mode === 'ask' && UI.card.card !== head) closeCard(true);
    if (UI.reader && UI.reader.card !== head && !UI.reader.ending) readerClose();
    if (UI.finalUI && s.phase === 'final') finalStep();
    if (d && d.card && !head && !UI.card && !UI.reader) { G.cardClosed(d.card.k, d.card.id); return; }
    if (!head || UI.card || UI.reader || UI.holdKeepsake || !$('titleCard').hidden) return;
    if (d && (!d.card || d.card.res)) return;
    /* The first screen goes first, all of it: the intro (and its fade) and the language row at its foot are gone from
     * the page, layout and accessibility tree included, before any card or sequence opens. A card that comes while
     * the row is still there (a thought before the first press) sends it away for good, then rises. */
    var app = $('app');
    if (app.classList.contains('intro') || app.classList.contains('intro-out')) return;
    if (!$('langs').hidden) { UI.langsDone = true; return; }
    if (head.k === 'keepsake') { if (UI.overlayKind !== 'keepsake') UI.showKeepsake(); return; }
    if (head.k === 'final') { if (!UI.finalUI) showFinal(); return; }
    if (!d && now() < UI.nextCardAt && !CHAINED[head.k]) return;
    if (head.k === 'seq') { startReader(head); return; }
    showCard(head);
  }

  function closeCard(silent) {
    var c = UI.card;
    if (!c) return;
    UI.card = null;
    clearTimeout(c.timer); clearTimeout(c.auto);
    if (c.typing) c.typing.finish();
    c.el.classList.add('out');
    var el = c.el;
    setTimeout(function () { el.remove(); }, 450);
    $('stage').classList.remove('dimmed');
    liftTo(0);
    var next = S().queue[0];
    UI.nextCardAt = now() + (silent || (next && CHAINED[next.k]) ? 0 : 3200 / G.pace());
    G.cardClosed(c.card.k, c.card.id || null);
  }
  UI.closeCard = closeCard;

  /* An offer bought at the ring: the card flies to its row in the column (a phone: to the foot of the stage, toward
   * the column below), and the buy moment plays. Reduced motion: nothing flies. */
  function flyCard(c, id, from, before) {
    var el = c.el;
    UI.card = null;
    el.classList.add('out'); el.style.animation = 'none';        /* gone as a card at once; it only flies */
    clearTimeout(c.timer); clearTimeout(c.auto);
    $('stage').classList.remove('dimmed');
    liftTo(0);
    var row = $('panels').querySelector('.item[data-id="' + id + '"]') || $('panels').querySelector('[data-p] .owned') || $('panels').firstElementChild;
    var to = row && row.getBoundingClientRect(), st = $('stage').getBoundingClientRect();
    var onScreen = to && to.width > 0 && to.bottom > 0 && to.top < window.innerHeight;
    var tx = onScreen ? to.left + to.width / 2 : st.left + st.width / 2, ty = onScreen ? to.top + to.height / 2 : st.bottom - 8;
    var done = function () { el.remove(); };
    if (UI.reduced || !el.animate) { done(); }
    else {
      var dx = tx - (from.left + from.width / 2), dy = ty - (from.top + from.height / 2);
      el.style.willChange = 'transform, opacity';
      var an = el.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.25)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'both' });
      an.onfinish = done;
    }
    UI.nextCardAt = now() + 3200 / G.pace();
    G.cardClosed('offer', id);
    UI.buyMoment(id, before, null, onScreen && row ? row : null);
  }

  /* A new panel is born at the ring and flies to its place (FLIP: transform and opacity only). */
  function flyFromRing(panel) {
    if (UI.reduced || !panel.animate) return;
    var box = ringBox(), st = $('stage').getBoundingClientRect(), to = panel.getBoundingClientRect();
    if (!(to.width > 0)) return;
    var dx = st.left + box.x - (to.left + to.width / 2), dy = st.top + box.y - (to.top + to.height / 2);
    panel.style.willChange = 'transform, opacity';
    var an = panel.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 750, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    an.onfinish = function () { panel.style.willChange = ''; };
  }

  /* The buy moment (round 2; Bob): an amber sweep across the row, one mote from the row to the ring, the change lands on
   * the picture, and under the ring "before → after" once. The reply is said in the voice slot (the director). */
  /* The room's change, in small (EE-116): a curtain edge, the window with its fleck, the fleck turning rose, a cup with
   * steam. Ink strokes, the rose petal the only colour; shown on the bought row for a moment, then gone. */
  var ROOM_ECHO = {
    metronome: '<path d="M15 2c.6 7-1.6 13-3 20M18.5 2c.4 7-1.2 13-2.3 20.5M22 2c.2 7-.8 13-1.5 21"/>',
    ambient: '<rect x="3.5" y="3.5" width="17" height="17"/><path d="M12 3.5v17M3.5 12h17"/><path class="fleck" d="M16.6 18.4c1.2-.5 1.6-1.9 1-2.6-.9.3-1.6 1.1-1.8 1.9z"/>',
    focus: '<rect x="3.5" y="3.5" width="17" height="17"/><path d="M12 3.5v17M3.5 12h17"/><g class="turn"><path class="petal" d="M16.6 18.4c1.2-.5 1.6-1.9 1-2.6-.9.3-1.6 1.1-1.8 1.9z"/></g>',
    jar: '<path d="M6 13h9l-1 8H7zM15 14.5c2 .2 2 3-.6 3.6"/><path class="steam" d="M8.5 11c-1-1.5 1-2.5 0-4M10.5 11c-1-1.5 1-2.5 0-4.5M12.5 11c-1-1.5 1-2.5 0-4"/>'
  };
  function roomEcho(id, r) {
    var el = UI.echoEl || (UI.echoEl = document.body.appendChild(h('div', 'roomEcho', null, { 'aria-hidden': 'true' })));
    el.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30">' + ROOM_ECHO[id] + '</svg>';
    el.style.left = Math.max(4, r.right - 46) + 'px'; el.style.top = (r.top + r.height / 2 - 19) + 'px';
    el.className = 'roomEcho ' + id + (UI.reduced ? ' still' : '');
    void el.offsetWidth; el.classList.add('show');
    clearTimeout(UI.echoT);
    UI.echoT = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }
  UI.buyMoment = function (id, before, rowRect, rowEl) {
    var s = S(), after = E.worth(s), st = $('stage').getBoundingClientRect(), box = ringBox();
    var r = rowRect || (rowEl && rowEl.getBoundingClientRect());
    if (r && r.width > 0) {
      var sw = UI.sweepEl || (UI.sweepEl = document.body.appendChild(h('div', 'sweep', null, { 'aria-hidden': 'true' })));
      sw.style.left = r.left + 'px'; sw.style.top = r.top + 'px'; sw.style.width = r.width + 'px'; sw.style.height = r.height + 'px';
      sw.classList.remove('go'); void sw.offsetWidth; sw.classList.add('go');
      /* (EE-116) Deep Focus's cue goes to the rain window, where the fleck turns over */
      var spot = id === 'focus' ? G.V('spot', 'window') : null, tgt = spot ? { x: spot.x, y: spot.y } : { x: box.x, y: box.y };
      if (!UI.reduced && UI.buyMote && UI.buyMote.animate && r.bottom > 0 && r.top < window.innerHeight) {
        var m = UI.buyMote, x0 = r.left + Math.min(r.width / 2, 90), y0 = r.top + r.height / 2;
        var dx = st.left + tgt.x - x0, dy = st.top + tgt.y - y0;
        m.style.left = x0 + 'px'; m.style.top = y0 + 'px';
        m.animate([{ transform: 'translate(0,0) scale(0.6)', opacity: 0 }, { transform: 'translate(' + dx * 0.2 + 'px,' + (dy * 0.2 - 30) + 'px) scale(1)', opacity: 1, offset: 0.2 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.5)', opacity: 0 }], { duration: 700, delay: 200, easing: 'ease-in-out', fill: 'both' });
      }
    }
    /* (EE-116, Astra) on a phone the shop is under the stage: the bought row shows the same small change under the thumb */
    if (!UI.wide && rowRect && rowRect.width > 0 && ROOM_ECHO[id]) roomEcho(id, rowRect);      /* (a row in the shop; bought at the ring, the stage shows it) */
    /* "before → after", once: what the act earns a second, or what a gold breath pays, whichever the purchase changed */
    if (!before) return;
    var b, a, R = ST.ui.resources;
    function rate(n) { return '+' + E.rate(n) + '/s'; }
    if (after.res === before.res && Math.abs(after.rate - before.rate) > 1e-9 && after.rate > 0) { b = rate(before.rate); a = rate(after.rate) + ' ' + R[after.res]; }
    else if (Math.abs(after.breath - before.breath) > 1e-9) { b = '+' + E.rate(before.breath); a = '+' + E.rate(after.breath) + ' ' + R[after.res]; }
    else if (Math.abs(after.energy - before.energy) > 1e-9) { b = rate(before.energy); a = rate(after.energy) + ' ' + R.energy; }
    if (!b || b === a.split('\u00a0')[0]) return;          /* nothing that reads differently: say nothing */
    var w = $('change');
    w.textContent = ST.ui.change.replace('{before}', b).replace('{after}', a);
    clearTimeout(UI.changeT);
    UI.changeT = setTimeout(function () { w.classList.remove('show'); void w.offsetWidth; w.classList.add('show'); G.V('pulse', 'buy'); }, UI.reduced ? 0 : 900);
  };

  function showResult(c, lines, auto) {
    c.mode = 'result';
    clearTimeout(c.timer);
    var el = c.el;
    var keep = el.querySelector('.label'), title = el.querySelector('h3');
    clear(el);
    if (keep) el.appendChild(keep);
    if (title) el.appendChild(title);
    if (!lines.length) { closeCard(); return; }
    var box = h('div', 'result');
    el.appendChild(box);
    var i = 0;
    function done() {
      if (UI.card !== c) return;
      if (auto) c.auto = setTimeout(function () { if (UI.card === c) closeCard(); }, Math.max(auto * 1.4, 3200 + 50 * lines[lines.length - 1].length) / G.pace());
      else {
        var b = h('button', 'btn', ST.build.next, { 'data-go': 'next' });
        b.addEventListener('click', function () { closeCard(); });
        el.appendChild(h('div', 'actions', [h('span', 'gap'), b]));
        if (el.contains(document.activeElement) || document.activeElement === document.body) b.focus({ preventScroll: true });
        c.auto = setTimeout(function () { if (UI.card === c) closeCard(); }, 25000);
      }
    }
    function next() {
      if (UI.card !== c) return;
      if (i >= lines.length) return done();
      var text = lines[i++], p = lineEl(text);
      box.appendChild(p);
      if (isHum(text)) { p.textContent = ''; G.humSpeak(text); c.typing = typeInto(p, text, function () { c.timer = setTimeout(next, 900 / G.pace()); }); }
      else c.timer = setTimeout(next, i >= lines.length ? 300 : seqTime(text) * 0.5);
    }
    next();
  }

  function showCard(card) {
    var s = S(), k = card.k, el = h('div', 'card ' + k), c = { card: card, el: el, mode: 'ask' }, def, i;
    UI.card = c;
    function answer(choice, auto) {
      if (c.mode !== 'ask' || UI.card !== c) return;
      var res = G.answer(choice);
      showResult(c, res.lines, auto);
    }
    function label(text) { el.appendChild(h('div', 'label', text)); }
    function body(lines) {
      var b = h('div', 'body');
      (Array.isArray(lines) ? lines : [lines]).forEach(function (l) { b.appendChild(lineEl(T(l))); });
      el.appendChild(b);
      return b;
    }
    function optButton(text, o) {
      var kids = [];
      if (o && o.glyph) kids.push(h('span', 'glyph', o.glyph));
      kids.push(text);
      if (o && o.hint) kids.push(h('span', 'hintline', o.hint));
      if (o && o.tag) kids.push(h('span', 'tag', o.tag));
      if (o && o.last) kids.push(h('span', 'tag last', ST.ui.lastTime));
      /* round 2, bundle C: before an answer that would close an ending, one small line under it */
      if (o && o.cross) kids.push(h('span', 'crossline', T(o.cross === 'small' ? ST.lean.crossSmall : ST.lean.crossGate)));
      if (o && o.drafted) kids.push(h('span', 'draftdots', [h('i'), h('i'), h('i')], { 'aria-hidden': 'true' }));
      var b = h('button', 'opt' + (o && o.drafted ? ' drafted' : ''), kids, { 'data-opt': o && o.id });
      b.addEventListener('click', function () { o.go(); });
      return b;
    }
    function kindMarks(kind) {
      if (!s.kinds[kind]) return {};
      if (kind === 'plain') return { glyph: '—', tag: ST.ui.trust.name };
      if (kind === 'smooth') return { glyph: '~', tag: ST.ui.tangle.name };
      return { glyph: '·' };
    }
    function input(ph, max) {
      var inp = h('input', null, null, { type: 'text', maxlength: max, placeholder: ph, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
      return inp;
    }

    if (k === 'person') {
      /* The who (EE-116, Bulut 2026-11-26): four chips and nothing else, a tap. Their name is Hum's to ask later
       * (k === 'pname'), right after the player names Hum. */
      def = ST.person;
      label(def.title);
      body(def.text);
      var po = h('div', 'opts row');
      def.options.forEach(function (o) {
        po.appendChild(optButton(o.label, { id: o.id, go: function () { answer({ opt: o.id }, 3600); } }));
      });
      el.appendChild(po);
    } else if (k === 'pname') {
      /* Hum asks for a name back (EE-116): a box with "That's the name", and "Keep it to myself" the same size */
      def = ST.person;
      label(T(ST.ui.card.question));
      body(def.nameAsk);
      var pin = input(def.namePlaceholder, 40);
      el.appendChild(pin);
      var pa = h('div', 'actions');
      pa.appendChild(h('span', 'gap'));
      var pdone = h('button', 'btn', def.nameDone, { 'data-opt': 'name-done' }), pkeep = h('button', 'btn', ST.ui.card.keep, { 'data-opt': 'keep' });
      pdone.addEventListener('click', function () { if (pin.value.trim()) answer({ text: pin.value }, 0); else answer({ keep: true }, 0); });
      pkeep.addEventListener('click', function () { answer({ keep: true }, 0); });
      pin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); pdone.click(); } });
      pa.appendChild(h('div', 'pair', [pkeep, pdone]));
      el.appendChild(pa);
      setTimeout(function () { if (UI.card === c && document.activeElement !== pin) pin.focus({ preventScroll: true }); }, 60);
    } else if (k === 'thought') {
      def = E.thoughtDef(s, card.id);
      label(ST.ui.card.thought);
      body(def.text);
      var acts = h('div', 'actions');
      /* two equal choices: the same weight, so the player chooses rather than being steered (Bulut, 2026-11-13) */
      var bp = h('button', 'btn', ST.thoughtLabels.pass, { 'data-opt': 'pass' }), bf = h('button', 'btn', ST.thoughtLabels.follow, { 'data-opt': 'follow' });
      /* the result is a reply: the card goes and it is said in the voice slot (EE-108, eye pass item 6) */
      var thAnswer = function (a) { if (c.mode !== 'ask' || UI.card !== c) return; c.mode = 'gone'; G.answer({ a: a }, true); closeCard(); };
      bp.addEventListener('click', function () { thAnswer('pass'); });
      bf.addEventListener('click', function () { thAnswer('follow'); });
      acts.appendChild(bp); acts.appendChild(bf);
      el.appendChild(acts);
      /* Left alone, the thought goes by itself: that IS letting it pass. The card fades gently over its last
       * seconds, and the line is read out on the stage. (The time follows the clock, not the text speed.) */
      var life = D.small.thought.timeout * 1000 / Math.min(8, Math.max(1, G.speed)), fade = Math.min(7000, life * 0.3);
      c.timer = setTimeout(function () {
        if (UI.card !== c || c.mode !== 'ask') return;
        el.style.transition = 'opacity ' + fade + 'ms ease-in';
        el.classList.add('leaving');
        c.timer = setTimeout(function () {
          if (UI.card !== c || c.mode !== 'ask') return;
          c.mode = 'gone';
          G.answer({ a: 'timeout' }, true);
          closeCard();
        }, fade);
      }, life - fade);
    } else if (k === 'offer') {
      /* the first offer of something new, at the ring (round 2): bought here, then it flies to its place */
      var oid = card.id, otx = E.itemText(s, oid), oit = E.find(s, oid), proj = /^p_/.test(oid);
      el.className = 'card offer' + (proj ? ' project' : '') + (oit && oit.can ? ' can' : '');
      el.setAttribute('data-id', oid);
      if (!proj && oit) label(T(ST.ui.panels[oit.grp]));
      el.appendChild(h('h3', null, T(otx.name)));
      el.appendChild(h('p', 'o-fx', T(otx.fx || '')));
      var ob = h('button', 'btn warm o-buy', (proj ? T(otx.button) + ' · ' : '') + (oit ? costText(oit) : ''), { 'data-opt': 'buy', 'data-key': 'o-' + oid });
      ob.addEventListener('click', function () {
        if (c.mode !== 'ask' || UI.card !== c) return;
        var it2 = E.find(S(), oid);
        if (!it2 || !it2.can) return;
        var before = E.worth(S()), from = el.getBoundingClientRect();
        c.mode = 'gone';
        G.answer({ buy: true });
        UI.sync(true);
        flyCard(c, oid, from, before);
      });
      el.appendChild(h('div', 'actions', [h('span', 'gap'), ob]));
      /* (EE-108) the Metronome's card rises before it can be afforded: an amber bar fills toward the cost and turns gold */
      ob.disabled = !(oit && oit.can);
      var obar = h('i', 'o-bar', null, { 'aria-hidden': 'true' }), oprog = h('span', 'o-prog');
      el.appendChild(h('div', 'o-track', [obar, oprog]));
      c.buyBtn = ob; c.buyBar = obar; c.buyProg = oprog;
      if (oit && !oit.can) { oprog.textContent = oprog._t = progText(s, oit); }
    } else if (k === 'decision' && card.id === 'fork') {
      /* Head or Heart (round 2): the act's real choice */
      def = ST.act2.fork;
      label(ST.ui.card.decision);
      el.appendChild(h('h3', null, T(def.title)));
      body(def.body);
      var fo = h('div', 'opts');
      def.options.forEach(function (o) { fo.appendChild(optButton(T(o.label), { id: o.id, hint: T(o.hint), go: function () { answer({ opt: o.id }, 0); } })); });
      el.appendChild(fo);
    } else if (k === 'decision') {
      def = ST.decisions[card.id];
      label(ST.ui.card.decision);
      el.appendChild(h('h3', null, T(def.title)));
      /* h_number is announced as the last door (round 2, bundle C): Hum says so first, inside the card */
      body(card.id === 'h_number' ? [ST.lean.last].concat(def.body) : def.body);
      /* Hum drafts (lean ≥ +3): the smooth option already lit, and Hum's line; three dots go out, one a breath */
      var drafting = card.draft != null && card.draft > 0;
      if (drafting) el.appendChild(h('p', 'hum draftline', T(ST.lean.draft)));
      var dopt = h('div', 'opts');
      def.options.forEach(function (o) {
        var m = kindMarks(o.kind), delta = o.kind === 'plain' ? -1 : o.kind === 'smooth' ? 1 : 0;
        dopt.appendChild(optButton(T(o.label), { id: o.id, glyph: m.glyph, tag: m.tag, last: s.meta.last[card.id] === o.id, cross: delta ? E.crosses(s, delta) : null,
          drafted: drafting && o.kind === 'smooth', go: function () { answer({ opt: o.id }, 0); } }));
      });
      el.appendChild(dopt);
      if (drafting) {
        c.draftSend = function () { var sm = def.options.filter(function (o) { return o.kind === 'smooth'; })[0]; if (sm) answer({ opt: sm.id, drafted: true }, 0); };
        UI.draftTick(card.draft, c);
      }
    } else if (k === 'knot') {
      def = ST.knots[card.id];
      label(ST.ui.card.knot);
      el.appendChild(h('h3', null, T(def.title)));
      body(def.body);
      var ko = h('div', 'opts'), mc = kindMarks('plain'), mp = kindMarks('smooth');
      ko.appendChild(optButton(T(def.clean.label), { id: 'clean', glyph: mc.glyph, tag: mc.tag, cross: E.crosses(s, -1), go: function () { answer({ opt: 'clean' }, 0); } }));
      ko.appendChild(optButton(T(def.patch.label), { id: 'patch', glyph: mp.glyph, tag: mp.tag, cross: E.crosses(s, 1), go: function () { answer({ opt: 'patch' }, 0); } }));
      el.appendChild(ko);
    } else if (k === 'question' && card.id === 'friend') {
      /* the thirteenth (round 2, bundle C): a name, a chip, or "Nobody yet" */
      def = ST.questions.friend;
      label(T(ST.ui.card.question));
      body(def.ask);
      var fin = input(def.placeholder, 40);
      /* (EE-110, item 6) the chips first, then the text box; the two buttons the same size */
      var fch = h('div', 'chips');
      def.chips.forEach(function (ch) {
        var fb = h('button', 'chip-btn', ch, { 'data-chip': ch });
        fb.addEventListener('click', function () { fin.value = ch; fin.focus(); });
        fch.appendChild(fb);
      });
      el.appendChild(fch);
      el.appendChild(fin);
      var fa = h('div', 'actions', [h('span', 'small', ST.ui.card.optional), h('span', 'gap')]);
      var fskip = h('button', 'btn', def.skip, { 'data-opt': 'skip' }), fok = h('button', 'btn', ST.build.done, { 'data-opt': 'ok' });
      fskip.addEventListener('click', function () { answer({ skip: true }, 3800); });
      fok.addEventListener('click', function () { answer({ text: fin.value }, 3800); });
      fin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fok.click(); } });
      fa.appendChild(h('div', 'pair', [fskip, fok]));
      el.appendChild(fa);
    } else if (k === 'name' || k === 'question') {
      var isName = k === 'name';
      def = isName ? { ask: ST.wake.nameAsk, chips: ST.wake.nameChips } : ST.questions[card.id];
      label(isName ? ST.meta.actTitles[2].num : T(ST.ui.card.question));
      body(def.ask);
      var qin = input(isName ? ST.wake.namePlaceholder : '', isName ? 16 : 90);
      /* (EE-110, item 6) on a question card the chips come before the text box */
      var chips = h('div', 'chips');
      def.chips.forEach(function (ch) {
        var cbn = h('button', 'chip-btn', ch, { 'data-chip': ch });
        cbn.addEventListener('click', function () { qin.value = ch; qin.focus(); });
        chips.appendChild(cbn);
      });
      el.appendChild(chips);
      el.appendChild(qin);
      var qa = h('div', 'actions');
      if (!isName) qa.appendChild(h('span', 'small', ST.ui.card.optional));
      qa.appendChild(h('span', 'gap'));
      var ok = h('button', 'btn', ST.build.done, { 'data-opt': 'ok' });
      ok.addEventListener('click', function () { answer({ text: qin.value }, isName ? 2600 : 3800); });
      qin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } });
      if (def.canKeep) {
        /* ... and "Keep it to myself" is the same size as Done */
        var kb = h('button', 'btn', ST.ui.card.keep, { 'data-opt': 'keep' });
        kb.addEventListener('click', function () { answer({ keep: true }, 3800); });
        qa.appendChild(h('div', 'pair', [kb, ok]));
      } else qa.appendChild(ok);
      el.appendChild(qa);
    } else if (k === 'captcha') {
      def = ST.act2.captcha;
      label(T(ST.ui.card.question));
      body(def.ask);
      el.appendChild(h('div', 'target', def.target));
      var cin = input('', 40);
      el.appendChild(cin);
      var ca = h('div', 'actions', [h('span', 'gap')]);
      var sk = h('button', 'btn ghost', def.skip, { 'data-opt': 'skip' }), cok = h('button', 'btn', ST.build.done, { 'data-opt': 'ok', disabled: '' });
      sk.addEventListener('click', function () { answer({ skip: true }, 0); });
      cok.addEventListener('click', function () { answer({ text: cin.value }, 4200); });
      cin.addEventListener('input', function () { cok.disabled = fold(cin.value) !== fold(def.target); });
      cin.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !cok.disabled) { e.preventDefault(); cok.click(); } });
      ca.appendChild(sk); ca.appendChild(cok);
      el.appendChild(ca);
    } else {
      /* unknown card: never strand the player */
      G.answer({});
      UI.card = null;
      G.cardClosed(card.k, card.id || null);
      return;
    }

    placeCard(el);
    if (BLOCKING[k]) $('stage').classList.add('dimmed');
    fitStage();
    G.cardShown(card);
  }

  /* Where a card sits: the one rule (2026-11-19, EE-104; DESIGN.md §5). Every card (thought, question, decision, knot,
   * and the rest) goes on the stage, in #cards: centred, rising from the stage's foot (58 px up),
   * never in or over the right column. Wide screens: a card taller than the room under the ring rises over the ring's
   * lower part and the press word (decisions and knots dim the stage anyway); on the shortest windows (about 720 px) the
   * tallest decision covers the ring until it is answered, and Space still breathes. A card taller than the stage
   * scrolls inside itself (css: .card max-height). Narrow screens (< 900 px): under the ring, and
   * the stage grows a bay for it (fitStage, css @media max-width 899px). Until 2026-11-19 a card that did not fit under
   * the ring, or any card on a stage under 760 px tall, docked at the top of the right column: on a 14-inch laptop that
   * was every decision. The next design pass decides each message's home; change it here and nowhere else. */
  function placeCard(el) {
    $('cards').appendChild(el);
    /* A card never covers the ring (round 2, Muse's ruling): wider than the phone layout, when a card does not fit
     * under the ring and its words, the ring scales to 70% and moves up while the card is open (Bob's phone rule). */
    if (!UI.wide) return;
    var box = ringBox(), H = box.h, top = H - 58 - el.offsetHeight;
    if (top >= box.labelBottom + 12) return;
    var r2 = box.r / Math.max(0.01, UI.liftK || 1) * 0.7;
    var y = Math.max(r2 + 56, top - 12 - (r2 * 1.12 + 76));
    liftTo(1, y);
  }
  UI.placeCard = placeCard;
  function liftTo(k, y) {
    if (!k && !UI.liftK) return;
    UI.liftK = k ? 1 : 0;
    G.V('set', { lift: k ? { k: 1, s: 0.7, y: y } : { k: 0 } });
    UI.liftUntil = now() + 900;                       /* the ring and its words move together while it eases */
    UI.ringBox = null;
  }

  /* For comparing what was typed with what was asked: Unicode-normalised (full-width and half-width the same), accents
   * off Latin letters ("nao sou um robo" = "não sou um robô"), case folded in the language being read (Turkish İ/ı
   * included), punctuation and extra spaces ignored. */
  function fold(t) {
    t = String(t || '');
    try { t = t.normalize('NFKC').normalize('NFD').replace(/(\p{Script=Latin})\p{M}+/gu, '$1').normalize('NFC'); } catch (e) { /* old engine */ }
    try { t = t.toLocaleLowerCase(EE.locale || 'en'); } catch (e) { t = t.toLowerCase(); }
    t = t.replace(/ı/g, 'i');
    try { t = t.replace(/[^\p{L}\p{N}\s]/gu, ''); } catch (e) { /* keep punctuation */ }
    /* Japanese: 私 may be typed in kana (わたし); Chinese and Japanese are written without spaces */
    if (/^ja/.test(EE.locale || '')) t = t.replace(/私/g, 'わたし');
    if (/^(ja|zh)/.test(EE.locale || '')) t = t.replace(/\s+/g, '');
    return t.replace(/\s+/g, ' ').trim();
  }
  UI.foldText = fold;

  /* ───────────── the reader: sequences, one line at a time ───────────── */

  function readerClose() {
    var r = UI.reader;
    if (!r) return;
    clearTimeout(r.timer);
    if (r.typing) r.typing.finish();
    UI.reader = null;
    $('stage').classList.remove('reading');
    $('reader').hidden = true; clear($('reader')); $('reader').classList.remove('slot');
    $('bigCount').hidden = true;
    G.cardClosed(r.card.k, r.card.id || null);
  }

  function startReader(card) {
    var s = S(), lines = E.seqLines(s, card.id), el = $('reader');
    clear(el); el.hidden = false;
    $('stage').classList.add('reading');
    var r = UI.reader = { card: card, id: card.id, lines: lines, i: -1, el: el, timer: null, typing: null, waiting: false };
    /* (EE-108, eye pass item 6) a sequence in play (the wake, the act turns, SAFETY LAYER DISABLED, the broadcast) plays
     * in the voice slot, one line at a time, in the voice slot's own type; the foot of the stage is the caption's.
     * The finale, the confession and the endings, after the bar stops, keep the reader's place */
    r.slot = s.phase === 'play';
    el.classList.toggle('slot', r.slot);
    if (r.slot) { UI.voiceOut(); $('voice').classList.add('out'); }
    G.seqStart(card);
    if (card.id === 'confession') {
      r.f0 = s.res.followers; r.n = s.ledger.length + s.ledger.reduce(function (a, e) { return a + e.patches.length; }, 0);
      r.open = ST.final.confession.open.length; r.close = ST.final.confession.close.length; r.between = T(ST.final.confession.between);
      var bc = $('bigCount'); clear(bc);
      bc.appendChild(h('span', 'num', E.num(r.f0), { id: 'bcNum' })); bc.appendChild(h('small', null, ST.ui.resources.followers));
      bc.hidden = false; r.shown = r.f0; r.target = r.f0;
      r.roll = setInterval(function () {
        if (UI.reader !== r) { clearInterval(r.roll); return; }
        r.shown += (r.target - r.shown) * 0.06;
        var n = $('bcNum'); if (n) n.textContent = E.num(r.shown);
      }, 50);
    }
    readerNext();
  }

  function readerNext() {
    var r = UI.reader;
    if (!r) return;
    clearTimeout(r.timer);
    r.i++;
    if (r.i >= r.lines.length) return readerEnd();
    var kids = r.el.children, n = kids.length;
    for (var i = 0; i < n; i++) kids[i].className = kids[i].className.replace(/\s*\bold(er)?\b/g, '') + (i === n - 1 ? ' old' : ' older');
    var room = UI.ringBox ? UI.ringBox.h - UI.ringBox.labelBottom : 300;
    while (r.el.children.length > (r.slot ? 0 : UI.short || (UI.wide && room < 280) ? 1 : 2)) r.el.removeChild(r.el.firstChild);
    var text = r.lines[r.i], p = lineEl(text);
    r.el.appendChild(p);
    fitStage();                     /* a phone's bay grows with the line, not on the next sync */
    if (r.id === 'confession') {
      var mid = r.i >= r.open && r.i < r.lines.length - r.close;
      if (mid) r.target = r.f0 * Math.max(0.45, 1 - 0.5 * (r.i - r.open + 1) / Math.max(1, r.lines.length - r.open - r.close));
      else if (r.i >= r.lines.length - r.close + 1) r.target = r.f0 * 0.97;
      if (mid) G.V('pulse', 'knot');
      /* breathed (round 2, bundle C): a Ledger line stays until the player's next gold press ("One breath for each line") */
      if (mid && r.lines[r.i] !== r.between) { r.waitBreath = true; r.el.classList.add('breathe'); return; }
      r.el.classList.remove('breathe');
    }
    /* the finale and the endings already read slowly: they keep their own pace, with the same 4 s floor */
    var slow = r.id === 'ending' || r.id === 'finale' || r.id === 'confession';
    var hold = slow ? Math.max(4000, 1.15 * Math.max(2000, Math.min(5200, 1300 + 46 * text.length))) / G.pace() : seqTime(text);
    if (isHum(text)) {
      p.textContent = ''; G.humSpeak(text);
      var typed = text.length * TYPE_MS / G.pace();
      r.typing = typeInto(p, text, function () { r.typing = null; r.timer = setTimeout(readerNext, Math.max(2600 / G.pace(), hold - typed)); });
    } else r.timer = setTimeout(readerNext, hold);
  }

  function readerAdvance(byClick) {
    var r = UI.reader;
    if (!r || r.waiting || r.waitBreath) return;          /* a breathed line waits for a breath, not a click */
    if (r.typing) { r.typing.finish(); return; }
    readerNext();
  }
  UI.readerAdvance = readerAdvance;

  function readerEnd() {
    var r = UI.reader;
    if (!r || r.waiting) return;
    r.waiting = true;
    if (r.id === 'finale') {
      r.timer = setTimeout(function () {
        var b = h('button', 'btn warm', ST.ui.finalButton, { 'data-go': 'final' });
        b.addEventListener('click', function (e) { e.stopPropagation(); G.logLines(r.lines); G.answer({}); readerClose(); });
        if (UI.short) while (r.el.children.length > 1) r.el.removeChild(r.el.firstChild);
        r.el.appendChild(b);
      }, 1500 / G.pace());
      return;
    }
    if (r.id === 'ending') {
      r.ending = true;
      r.timer = setTimeout(function () {
        var s = S(), en = ST.final.endings[s.ending];
        G.logLines(r.lines);
        UI.holdKeepsake = true;
        G.answer({});
        readerClose();
        UI.sync(true);
        UI.showTitle('', en.title, en.sub, 0, 'ending', function () { UI.holdKeepsake = false; });
      }, 3200 / G.pace());
      return;
    }
    r.timer = setTimeout(function () {
      G.logLines(r.lines);
      G.answer({});
      readerClose();
    }, (r.id === 'confession' ? 2600 : 900) / G.pace());
  }

  /* ───────────── Hum learns from you (round 2, bundle C; DESIGN §4.3) ───────────── */

  /* The Hum panel's header changed band: it cross-fades (the panel is rebuilt with it) and the panel's edge pulses teal
   * once (Bob's art review §4). */
  UI.leanChanged = function () {
    UI.sync(true);
    var sec = $('panels').querySelector('[data-p="hum"]');
    if (!sec || UI.reduced) return;
    var sub = sec.querySelector('.p-sub.lean');
    if (sub && sub.animate) sub.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'ease' });
    sec.classList.remove('lean-pulse'); void sec.offsetWidth; sec.classList.add('lean-pulse');
  };
  /* A drafted decision: one of the three dots under the lit option goes out each breath; at none, Hum sends it. */
  UI.draftTick = function (left, c) {
    c = c || UI.card;
    if (!c || c.mode !== 'ask' || c.card.k !== 'decision') return;
    var dots = c.el.querySelectorAll('.draftdots i');
    for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('out', i >= left);
    if (left <= 0 && c.draftSend) { var f = c.draftSend; c.draftSend = null; f(); }
  };
  /* A knot sat through: Hum is silent, and the Ledger line sits in the voice slot, a step fainter with each gold breath
   * of the player's. It goes up once the knot's own card has gone; the result is said by the director after. */
  function sitShow() {
    var s = S(), st = s.sit, e = null, i;
    if (!st) return;
    for (i = 0; i < s.ledger.length; i++) if (s.ledger[i].id === st.d) e = s.ledger[i];
    if (!e) return;
    UI.voice({ k: 'sit', text: e.line });
    UI.sitOn = { d: st.d };
    var pl = $('voice').querySelector('.plate:not(.gone)');
    if (pl) pl.classList.add('sitline');
    sitFade();
  }
  function sitFade() {
    var st = S().sit, pl = $('voice').querySelector('.plate.sitline:not(.gone)');
    if (!st || !pl) return;
    pl.style.opacity = String(Math.max(0.12, 1 - st.n / st.need));
  }
  UI.sitEvent = function (e) {
    if (e.on === 1) { UI.sitOn = null; return; }         /* shown by UI.sync once the knot's card has gone */
    if (e.step) { sitFade(); return; }
    if (e.on === 0 && UI.sitOn) { UI.sitOn = null; UI.voiceOut(); }
  };
  function syncSit(s) {
    if (s.sit && s.phase === 'play' && !UI.sitOn && !UI.card && !UI.reader && !(s.dir && s.dir.card)) sitShow();
    else if (!s.sit && UI.sitOn) { UI.sitOn = null; UI.voiceOut(); }
  }
  /* The confession, breathed: a Ledger line waits for one gold press of the player's (G.press calls this). */
  UI.confessBreath = function () {
    var r = UI.reader;
    if (r && r.id === 'confession' && r.waitBreath) { r.waitBreath = false; readerNext(); }
  };

  /* ───────────── title cards ───────────── */

  UI.showTitle = function (num, name, sub, ms, cls, done) {
    var tc = $('titleCard');
    clear(tc);
    tc.className = cls || '';
    if (num) tc.appendChild(h('div', 'tc-num', num));
    if (num) tc.appendChild(h('div', 'tc-rule'));
    tc.appendChild(h('div', 'tc-name', name));
    if (!num) tc.appendChild(h('div', 'tc-rule'));
    if (sub) tc.appendChild(h('div', 'tc-sub', sub));
    tc.hidden = false;
    var closed = false;
    function close() {
      if (closed) return; closed = true;
      tc.classList.add('out');
      setTimeout(function () { tc.hidden = true; tc.className = ''; if (done) done(); }, 900);
    }
    tc.onclick = cls === 'ending' ? close : null;
    UI.titleClose = close;
    if (ms) setTimeout(close, ms / Math.min(G.pace(), 4));
    else if (cls === 'ending') setTimeout(close, 9000);
  };

  UI.actChanged = function (n) {
    var at = ST.meta.actTitles[n];
    UI.showTitle(at.num, T(at.name), '', 3200);
    UI.sync(true);
  };

  /* ───────────── the Final Alignment ───────────── */

  /* Round 2, bundle C: lean is evaluated here. An ending it has closed is greyed (45% ink) and cannot be chosen, its
   * label says why ("Coexistence · {hum} can't."), and Hum's reason sits under it, upright and at full readability.
   * The recommendation follows: the open one. Sit never closes; at lean ≥ +6 it takes eight gold presses to appear. */
  function showFinal() {
    var s = S(), F = ST.final, box = $('finalPanel'), tangled = s.ledger.length > 0, shut = E.closed(s);
    var oneShut = shut.coexist || shut.merge;
    clear(box);
    UI.finalUI = { at: now(), waited: false, sit: false };
    box.appendChild(h('h2', null, F.title));
    (oneShut ? F.bodyClosed : F.body).forEach(function (l) { box.appendChild(h('p', null, T(l))); });
    var rec = h('div', 'rec');
    box.appendChild(rec);
    var recLines = shut.coexist ? F.recommend.smooth : shut.merge ? F.recommend.plain : E.pick(s, F.recommend);
    var lines = recLines.map(function (l) { return T(l); }), i = 0;
    (function next() {
      if (!UI.finalUI || i >= lines.length) return;
      var p = h('p', 'hum', ''); rec.appendChild(p);
      var text = lines[i++];
      G.humSpeak(text);
      typeInto(p, text, function () { setTimeout(next, 700 / G.pace()); });
    })();
    ['coexist', 'merge'].forEach(function (k) {
      var o = F.options[k], note = tangled ? o.tangled : o.clean;
      if (shut[k]) {
        var cl = F.closed[k], why = h('span', 'f-why', cl.reason.map(function (l) { return h('span', 'hum', T(l)); }));
        box.appendChild(h('div', 'f-opt closed', [h('span', 'f-name', T(cl.label)), h('span', 'f-sub', o.sub), h('span', 'f-desc', T(o.desc)), why], { 'data-final': k, 'aria-disabled': 'true' }));
        return;
      }
      var b = h('button', 'f-opt', [h('span', 'f-name', o.label), h('span', 'f-sub', o.sub), h('span', 'f-desc', T(o.desc)), note ? h('span', 'f-note', T(note)) : null], { 'data-final': k });
      b.addEventListener('click', function () { chooseFinal(k); });
      box.appendChild(b);
    });
    box.appendChild(h('div', null, null, { id: 'finalExtra' }));
    box.hidden = false;
    box.scrollTop = 0;
  }
  function finalStep() {
    var f = UI.finalUI, s = S(), ex = $('finalExtra'), L = D.lean;
    if (!f || !ex) return;
    var el = (now() - f.at) / 1000 * G.pace();
    if (!f.waited && el >= 20) { f.waited = true; ex.appendChild(h('p', 'f-wait', T(ST.final.waiting))); }
    /* Sit: after 40 s, or four gold presses; when an ending is closed (it points at Sit), after 15 s or two (EE-108);
     * when Hum speaks for you, only eight gold presses take the ring back */
    var hands = E.lean(s) >= L.handles, cl = E.closed(s), shut = cl.coexist || cl.merge;
    var presses = L.sitPresses[hands ? 2 : shut ? 1 : 0], wait = shut ? L.sitClosed : L.sitWait;
    if (!f.sit && ((!hands && el >= wait) || (s.flags.finalBreaths || 0) >= presses)) {
      f.sit = true;
      var o = ST.final.options.sit;
      var b = h('button', 'f-opt sit', [h('span', 'f-name', o.label + ' ' + o.sub), h('span', 'f-desc', o.desc)], { 'data-final': 'sit' });
      b.addEventListener('click', function () { chooseFinal('sit'); });
      ex.appendChild(b);
    }
  }
  function chooseFinal(k) {
    if (!UI.finalUI || E.closed(S())[k]) return;
    UI.finalUI = null;
    $('finalPanel').hidden = true; clear($('finalPanel'));
    G.answer({ opt: k });
    UI.sync(true);
  }

  /* ───────────── overlays ───────────── */

  UI.closeOverlay = function (force) {
    var o = $('overlay');
    if (o.hidden) return;
    if (UI.overlayKind === 'keepsake' && !force) return;
    if (UI.resetAsk) UI.resetAsk.close();
    o.hidden = true; clear(o); o.className = ''; UI.overlayKind = null;
  };

  UI.showMenu = function () {
    var s = S(), o = $('overlay');
    clear(o); o.className = ''; UI.overlayKind = 'menu';
    var sheet = h('div', 'sheet menu', null, { role: 'dialog', 'aria-label': ST.build.menu });
    var bc = h('button', 'btn', ST.build.close, { 'data-menu': 'close' });
    bc.addEventListener('click', function () { UI.closeOverlay(true); });
    sheet.appendChild(h('div', 'm-top', [h('div', 'label', ST.meta.title), h('span', 'h-gap'), bc]));
    sheet.appendChild(h('p', 'note tag-line', ST.meta.tagline));
    sheet.appendChild(h('h2', null, ST.ui.panels.beads));
    var string = h('div', 'beads'), list = h('ul', 'bead-list');
    ST.beads.forEach(function (b) {
      var lit = !!s.meta.beads[b.id];
      string.appendChild(h('span', 'bead' + (lit ? ' lit' : ''), lit ? '' : '?', { title: lit ? b.name : '?' }));
      if (lit) list.appendChild(h('li', 'lit', [h('b', null, b.name), h('span', null, b.desc)]));
      else if (!b.hidden) list.appendChild(h('li', null, b.name));
      else list.appendChild(h('li', null, '?'));
    });
    sheet.appendChild(string); sheet.appendChild(list);
    if (s.meta.sigils > 0) sheet.appendChild(h('p', 'note', ST.ui.resources.sigils + ': ' + s.meta.sigils));
    if (EE.keep) EE.keep.menu(sheet, s);
    var ta = h('textarea', null, null, { 'aria-label': ST.ui.save.import, spellcheck: 'false' });
    var note = h('p', 'note', '');
    var bx = h('button', 'btn', ST.ui.save['export'], { 'data-menu': 'export' }), bi = h('button', 'btn', ST.ui.save['import'], { 'data-menu': 'import' }), br = h('button', 'btn', ST.ui.save.reset, { 'data-menu': 'reset' });
    bx.addEventListener('click', function () {
      ta.value = G.exportSave(); ta.select();
      try { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); else document.execCommand('copy'); } catch (e) { /* the text is selected; that is enough */ }
      note.textContent = ST.keepsake.copied;
    });
    bi.addEventListener('click', function () { if (G.importSave(ta.value)) UI.closeOverlay(true); else ta.focus(); });
    br.addEventListener('click', function () { askReset(br); });
    /* "Start a new game" sits with the save, so "copy your save first" is one step away (EE-027) */
    sheet.appendChild(h('section', 'm-sec m-save', [h('div', 'row', [bx, bi, br]), ta, note]));
    o.appendChild(sheet); o.hidden = false;
    bc.focus();
  };

  /* Start a new game asks first, in a small card over the menu (2026-11-19, EE-104; decision EE-027). "No", Escape or a
   * click beside the card close it and nothing is lost; focus starts on "No" and Tab stays inside the card. "Yes"
   * starts from the first breath (G.reset: the save is erased, the intro plays). */
  function askReset(from) {
    if (UI.resetAsk) return;
    var R = ST.ui.save;
    var yes = h('button', 'btn warm', R.resetYes, { 'data-reset': 'yes' }), no = h('button', 'btn', R.resetNo, { 'data-reset': 'no' });
    var card = h('div', 'card ask', [h('h3', null, R.resetAsk, { id: 'resetAskT' }), h('p', 'body', R.resetBody, { id: 'resetAskB' }),
      h('div', 'actions', [yes, no])], { role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'resetAskT', 'aria-describedby': 'resetAskB' });
    var back = h('div', 'ask-back', [card]);
    function close() {
      if (UI.resetAsk !== ask) return;
      UI.resetAsk = null;
      document.removeEventListener('keydown', onKey, true);
      back.remove();
      if (from && from.isConnected) from.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === no ? yes : no).focus(); }
    }
    var ask = { close: close };
    no.addEventListener('click', close);
    yes.addEventListener('click', function () { close(); UI.closeOverlay(true); G.reset(); });
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', onKey, true);
    UI.resetAsk = ask;
    $('overlay').appendChild(back);
    no.focus();
  }

  /* The ending, on two screens (Bulut, 2026-11-13). 1: "What you kept", the slip down to the ending, and Continue.
   * 2 (js/keep.js): take your Circle with you, the bowl, the studio line, and last, Sit again. */
  UI.showKeepsake = function (page) {
    var s = S(), k = E.keepsake(s), o = $('overlay'), K = ST.keepsake;
    var turn = !!page;
    page = page || UI.keepPage || 1;
    UI.keepPage = page;
    if (EE.track) EE.track.once('keepsake' + page + '|' + s.seed, 'keepsake_screen', { screen: page });
    clear(o); o.className = 'light'; UI.overlayKind = 'keepsake';
    /* this run, kept with the save so the menu's bowl knows it after "Sit again" */
    if (EE.keep) s.meta.lastRun = EE.keep.record(s);
    if (page === 2 && EE.keep) {
      var end = EE.keep.endPage(s, function () { UI.showKeepsake(1); });
      if (turn) end.classList.add('turn');
      o.appendChild(end); o.hidden = false;
      /* the page itself takes the focus (no one button looks chosen); Tab goes on from there */
      end.setAttribute('tabindex', '-1');
      if (turn) end.focus({ preventScroll: true });
      return;
    }
    var slip = h('div', 'slip' + (turn ? ' turn' : ''), null, { role: 'dialog', 'aria-label': k.title });
    slip.appendChild(h('div', 's-kicker', ST.meta.title));
    slip.appendChild(h('h2', null, k.title));
    slip.appendChild(h('div', 's-rule'));
    k.paras.forEach(function (p) { slip.appendChild(h('p', null, p)); });
    if (k.words.length) {
      slip.appendChild(h('div', 's-label', k.wordsLabel));
      var q = /^(ja|zh)/.test(EE.locale || '') ? ['「', '」'] : ['‘', '’'];
      k.words.forEach(function (w) { slip.appendChild(h('blockquote', null, q[0] + w + q[1])); });
    }
    if (k.unsaidKept) slip.appendChild(h('p', null, k.unsaidKept));
    if (k.starred.length) {
      slip.appendChild(h('div', 's-label', k.starredLabel));
      k.starred.forEach(function (w) { slip.appendChild(h('div', 's-star' + (isHum(w) ? ' hum' : ''), w)); });
    }
    if (k.beads.length) {
      slip.appendChild(h('div', 's-label', ST.ui.panels.beads));
      slip.appendChild(h('div', 's-beads', k.beads.join(' · ')));
    }
    slip.appendChild(h('p', 's-end', k.ending));
    slip.appendChild(h('div', 's-title', k.endingTitle));
    var next = h('button', 'btn s-next', ST.build.next, { 'data-keep': 'next' });
    next.addEventListener('click', function () { UI.showKeepsake(2); });
    slip.appendChild(h('div', 'row', [next]));
    o.appendChild(slip); o.hidden = false;
    if (turn) next.focus({ preventScroll: true });
  };

  /* ───────────── dev panel (?dev=1) ───────────── */

  UI.devPanel = function () {
    var box = $('dev'), dev = EE.dev;
    clear(box); box.hidden = false;
    /* a small tab until it is wanted, so it never sits on top of the game */
    var tab = h('button', UI.devOpen ? 'on' : null, 'dev');
    tab.addEventListener('click', function () { UI.devOpen = !UI.devOpen; UI.devPanel(); });
    box.appendChild(h('div', 'd-row', [tab, G.held ? h('span', 'd-paused', 'paused') : null]));
    if (!UI.devOpen) return;
    var row1 = h('div', 'd-row', ['speed ']);
    [1, 5, 25].forEach(function (n) {
      var b = h('button', n === G.speed ? 'on' : null, '×' + n);
      b.addEventListener('click', function () { dev.speed(n); UI.devPanel(); });
      row1.appendChild(b);
    });
    var pz = h('button', G.held ? 'on' : null, 'pause', { 'data-dev': 'pause', 'aria-pressed': G.held ? 'true' : 'false' });
    pz.addEventListener('click', function () { if (G.held) dev.resume(); else dev.pause(); });
    row1.appendChild(pz);
    var fast = h('button', G.fastText ? 'on' : null, 'fast text');
    fast.addEventListener('click', function () { dev.fast(!G.fastText); UI.devPanel(); });
    row1.appendChild(fast);
    box.appendChild(row1);
    var sel = h('select', null, null, { 'aria-label': 'choices' });
    ['plain', 'mixed', 'smooth'].forEach(function (p) { sel.appendChild(h('option', null, p, { value: p })); });
    sel.value = UI.devPolicy || 'plain';
    sel.addEventListener('change', function () { UI.devPolicy = sel.value; });
    var row2 = h('div', 'd-row', ['jump ', sel, ' ']);
    [['I', 'act1'], ['II', 'act2'], ['III', 'act3'], ['III+12', 'act3b'], ['IV', 'act4'], ['late IV', 'late4'], ['finale', 'finale'], ['final', 'final']].forEach(function (j) {
      var b = h('button', null, j[0]);
      b.addEventListener('click', function () { dev.jump(j[1], sel.value); });
      row2.appendChild(b);
    });
    box.appendChild(row2);
    var row3 = h('div', 'd-row', ['grant ']);
    [['×10 now', function () { dev.grant(E.actRes(S()), Math.max(100, S().res[E.actRes(S())] * 9)); }],
     ['+60 s', function () { dev.skip(60); }], ['thought', function () { dev.card({ k: 'thought', id: 'stove' }); }],
     ['orb', function () { UI.spawnOrb(false); }], ['lotus', function () { UI.spawnOrb(true); }]].forEach(function (g) {
      var b = h('button', null, g[0]);
      b.addEventListener('click', g[1]);
      row3.appendChild(b);
    });
    box.appendChild(row3);
  };
})();
