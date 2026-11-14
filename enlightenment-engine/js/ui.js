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
        UI.nextCardAt += away; UI.tickerAt += away;
        if (UI.finalUI) UI.finalUI.at += away;
        if (UI.guideUntil) UI.guideUntil += away;
        if (UI.glow) UI.glow.until += away;
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
    UI.fold = {}; UI.sig = {}; UI.disp = {}; UI.card = null; UI.reader = null; UI.jq = []; UI.jBusy = false;
    UI.touched = {}; UI.nextCardAt = 0; UI.namesShown = 0; UI.floatIx = 0; UI.toasts = []; UI.lastSync = 0; UI.ringBox = null;

    staticWords();

    /* floats pool */
    var f = $('floats');
    UI.floats = [];
    for (var i = 0; i < 40; i++) { var sp = h('span', 'float'); f.appendChild(sp); UI.floats.push(sp); }
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
    $('overlay').addEventListener('click', function (e) { if (e.target === $('overlay') && UI.overlayKind === 'menu') UI.closeOverlay(); });
    window.addEventListener('resize', function () { UI.ringBox = null; });
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
    $('whisper').className = ''; $('whisper').textContent = '';
    $('ticker').className = ''; clear($('ticker'));
    UI.closeOverlay(true);
    UI.sig = {}; UI.disp = {}; UI.res = {}; UI.jq = []; UI.jBusy = false; UI.fold = {}; UI.finalUI = null; UI.holdKeepsake = false;
    UI.namesShown = s.joined; UI.nextCardAt = now() + 600; UI.tickerAt = now() + 4000; UI.tickerN = 0; UI.ringBox = null;
    UI.lastAct = s.act; UI.confirmConfess = false; UI.mergedShown = false; UI.touched = {};
    UI.white = false; UI.whiteT0 = 0; UI.glow = null; UI.guideUntil = 0; UI.whisperNudge = false; clearTimeout(UI.pumpT);
    UI.langsDone = false; UI.keepPage = 1;
    /* a new page of the game (a load, a jump, a new sitting): the language row is there or not, with no fade */
    clearTimeout(UI.langsT); UI.langsT = 0;
    var lw = s.clicks === 0 && s.act === 1 && s.phase === 'play', le = $('langs');
    le.hidden = !lw;
    if (lw) le.removeAttribute('aria-hidden'); else le.setAttribute('aria-hidden', 'true');
    var start = Math.max(0, s.journal.length - 220);
    for (var i = start; i < s.journal.length; i++) addRow(s.journal[i]);
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
    if (UI.ringBox && now() - UI.ringBox.at < 700) return UI.ringBox;
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
    var gd = $('guide'), d2 = r.r * 2;
    gd.style.left = r.x + 'px'; gd.style.top = r.y + 'px'; gd.style.width = d2 + 'px'; gd.style.height = d2 + 'px';
    st.style.setProperty('--card-top', Math.round(labelBottom + 6) + 'px');
    st.style.setProperty('--below', Math.max(64, Math.round(hh - labelBottom - 10)) + 'px');
    return UI.ringBox;
  }

  /* Floating numbers. At most one new number every 450 ms: presses in between are added up into the next one,
   * so each number is legible, rises clear of the one before, and is gone. */
  var FLOAT_GAP = 450;
  function floatFlush() {
    var a = UI.fAcc, box = ringBox();
    UI.fAcc = null; UI.fTimer = null;
    if (!a || S().phase !== 'play') return;
    var amt = a.amt, txt;
    if (a.res === 'followers') { if (amt < 1) return; txt = '+' + E.num(amt); }
    else txt = '+' + (amt < 100 ? E.rate(amt) : E.num(amt));
    UI.fLast = now();
    var sp = UI.floats[UI.floatIx++ % UI.floats.length];
    sp.className = 'float c-' + a.res + (a.on ? ' on' : a.weak ? ' weak' : '');
    sp.textContent = txt;
    UI.fSide = -(UI.fSide || 1);
    sp.style.left = (box.x + UI.fSide * box.r * 0.16) + 'px';
    sp.style.top = (box.y - box.r * 0.9) + 'px';
    void sp.offsetWidth;
    sp.classList.add('go');
  }
  UI.pressFx = function (res, byHum) {
    var s = S();
    if (s.phase !== 'play') return;
    if (!(res.amt > 0) && !(S().act === 3 && s.joined < D.act3.first.n)) return;   /* a breath pays once: a press past it floats nothing */
    var a = UI.fAcc;
    if (a && a.res === res.res) { a.amt += res.amt; a.on = a.on || res.on; a.weak = a.weak && !!res.weak; }
    else UI.fAcc = { res: res.res, amt: res.amt, on: res.on, weak: !!res.weak };
    var wait = FLOAT_GAP - (now() - (UI.fLast || 0));
    if (wait <= 0) floatFlush();
    else if (!UI.fTimer) UI.fTimer = setTimeout(floatFlush, wait);
    if (res.on && !byHum) {
      var w = $('onword');
      w.textContent = ST.ui.onBreath[Math.floor(Math.random() * ST.ui.onBreath.length)];
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
    var x, y, tries = 0;
    do { x = w * (0.12 + Math.random() * 0.76); y = hh * (0.16 + Math.random() * 0.36); tries++; }
    while (tries < 20 && Math.hypot(x - box.x, y - box.y) < box.r * 1.45);
    var o = h('button', 'orb' + (lotus ? ' lotus' : ''), null, { 'aria-label': lotus ? 'lotus' : 'orb', 'data-orb': lotus ? 'lotus' : 'orb' });
    o.style.left = x + 'px'; o.style.top = y + 'px';
    var life = (lotus ? D.small.lotus.life : D.small.orb.life) * 1000, gone = false;
    function out() { if (gone) return; gone = true; o.classList.add('out'); setTimeout(function () { o.remove(); }, 700); }
    o.addEventListener('click', function (e) { e.stopPropagation(); if (gone) return; if (lotus) G.catchLotus(); else G.catchOrb(); out(); });
    $('orbs').appendChild(o);
    setTimeout(out, life);
  };

  /* ───────────── journal and whisper ───────────── */

  function addRow(entry, empty) {
    var row = h('div', 'j-row' + (entry.k ? ' j-' + entry.k : isHum(entry.x) ? ' j-hum' : '') + (entry.s ? ' star' : ''), [
      h('span', 'j-day', ST.build.day.replace('{n}', E.num(entry.d))),
      h('span', 'j-text', empty ? '' : entry.x)
    ], { tabindex: '0' });
    row._e = entry;
    var list = $('jList');
    list.insertBefore(row, list.firstChild);
    while (list.childNodes.length > 260) list.removeChild(list.lastChild);
    return row;
  }

  UI.journalAdd = function (entry, quiet) {
    $('journal').hidden = false;
    if (quiet || G.fastText) { addRow(entry); if (entry._j != null) revealName(entry._j); return; }
    UI.jq.push(entry);
    pump();
  };

  function revealName(j) {
    if (j + 1 > UI.namesShown) { UI.namesShown = j + 1; G.V('pulse', 'join', { n: 1 }); G.A('play', 'join'); }
  }

  function whisper(text) {
    var w = $('whisper');
    clearTimeout(UI.whisperT);
    w.className = 'show' + (isHum(text) ? ' hum' : '');
    return w;
  }
  function whisperOut(ms) {
    clearTimeout(UI.whisperT);
    UI.whisperT = setTimeout(function () { $('whisper').classList.remove('show'); }, ms);
  }

  function pump() {
    if (UI.jBusy || !UI.jq.length) return;
    UI.jBusy = true;
    var e = UI.jq.shift(), hum = isHum(e.x), hurry = UI.jq.length > 4 ? 0.5 : UI.jq.length > 1 ? 0.8 : 1;
    var row = e.n ? null : addRow(e, hum), w = whisper(e.x);
    UI.whisperNudge = !!e.n;
    if (e._j != null) revealName(e._j);
    function after(hold, shown) {
      UI.pumpT = setTimeout(function () {
        UI.jBusy = false;
        /* nothing follows: the line stays its full reading time, then fades */
        if (!UI.jq.length) whisperOut(Math.max(900 / G.pace(), readTime(e.x) - shown - hold * hurry));
        pump();
      }, hold * hurry);
    }
    if (hum) {
      w.textContent = '';
      G.humSpeak(e.x);
      var typed = e.x.length * TYPE_MS / G.pace();
      typeInto([row && row.lastChild, w], e.x, function () { after(Math.max(2500 / G.pace(), seqTime(e.x) - typed), typed); });
    } else {
      w.textContent = e.x;
      after(seqTime(e.x), 0);
    }
  }

  /* A nudge: a narrator line on the stage only (never in the journal). */
  UI.nudge = function (text) {
    if (!text) return;
    UI.jq.push({ x: text, n: true });
    pump();
  };
  UI.clearNudges = function () {
    UI.jq = UI.jq.filter(function (e) { return !e.n; });
    if (UI.whisperNudge) { UI.whisperNudge = false; whisperOut(300); }
    UI.guideUntil = 0;
  };

  /* Point at something the player has not noticed: one small mote of warm light drifts from the ring to it,
   * and it glows softly for a while (or until it is used). Reduced motion: the glow only. */
  UI.pointAt = function (sel) {
    UI.glow = { sel: sel, until: now() + D.small.nudge.glow * 1000 };
    var target = $('panels').querySelector(sel);
    if (!target || UI.reduced) return;
    var box = ringBox(), st = $('stage').getBoundingClientRect(), tr = target.getBoundingClientRect();
    var x0 = st.left + box.x, y0 = st.top + box.y, x1 = tr.left + Math.min(tr.width / 2, 90), y1 = tr.top + tr.height / 2;
    var m = h('div', 'mote');
    m.style.left = x0 + 'px'; m.style.top = y0 + 'px';
    document.body.appendChild(m);
    var dx = x1 - x0, dy = y1 - y0;
    if (m.animate) {
      var a = m.animate([
        { transform: 'translate(0, 0) scale(0.4)', opacity: 0 },
        { transform: 'translate(' + dx * 0.12 + 'px, ' + (dy * 0.12 - 26) + 'px) scale(1)', opacity: 1, offset: 0.18 },
        { transform: 'translate(' + dx * 0.6 + 'px, ' + (dy * 0.6 - 30) + 'px) scale(1)', opacity: 0.95, offset: 0.62 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.9)', opacity: 0.9, offset: 0.92 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(2.2)', opacity: 0 }
      ], { duration: 2600, easing: 'ease-in-out' });
      a.onfinish = function () { m.remove(); };
    } else setTimeout(function () { m.remove(); }, 100);
  };

  /* ───────────── resources, chips ───────────── */

  var RES = ['clarity', 'insight', 'followers', 'energy'];
  function resVisible(s, k) {
    if (k === 'clarity') return s.clicks > 0;
    if (k === 'insight') return s.act >= 2;
    if (k === 'followers') return s.act >= 3;
    return !!s.up.dynamo;
  }
  function syncResources(s, r, dt) {
    var box = $('resources'), cur = E.actRes(s), merged = !!s.flags.merged;
    for (var i = 0; i < RES.length; i++) {
      var k = RES[i];
      if (!resVisible(s, k)) continue;
      var o = UI.res[k];
      if (!o) {
        o = UI.res[k] = { row: h('div', 'res k-' + k), val: h('span', 'num'), rate: h('span', 'r-rate'), note: h('span', 'r-note') };
        o.row.appendChild(h('span', 'r-name', ST.ui.resources[k]));
        o.row.appendChild(h('span', 'r-val', [o.val, o.rate, o.note]));
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
      var txt = merged ? '1' : E.num(Math.max(0, d));
      if (o.vt !== txt) { o.vt = txt; o.val.textContent = txt; }
      var rate = k === 'clarity' ? r.clarity : k === 'insight' ? r.insight : k === 'followers' ? r.people : r.energy;
      var rt = merged || s.phase !== 'play' ? '' : (rate > 0 ? '+' + E.rate(rate) + '/s' : '');
      if (o.rt !== rt) { o.rt = rt; o.rate.textContent = rt; }
      var up = k === 'insight' ? r.upI : k === 'energy' ? r.upE : 0;
      var nt = !merged && up >= 0.005 ? '−' + E.pct(Math.round(up * 100)) + ' ' + ST.ui.upkeep : '';
      if (o.nt !== nt) { o.nt = nt; o.note.textContent = nt; }
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

  function fxTag(s, id) {
    var R = ST.ui.resources, P = ST.ui.press, d, parts = [];
    if ((d = D.act1.up[id])) { if (d.cps) parts.push('+' + d.cps + '/s'); if (d.press) parts.push(P[1] + ' ×' + d.press); }
    else if ((d = D.act2.gens[id])) { parts.push('+' + d.ips + '/s'); }
    else if (D.act2.caps[id]) { parts.push(ST.ui.trees[D.act2.caps[id].tree].name + ' ×2'); }
    else if ((d = D.act3.up[id])) {
      if (d.flat) parts.push('+' + d.flat + '/s'); if (d.press) parts.push(P[3] + ' ×' + d.press);
      if (d.rMult) parts.push(ST.act3.upgrades.mouth.name + ' ×' + d.rMult);
    } else if ((d = D.act4.up[id])) {
      if (d.energy) parts.push(R.energy + ' ×' + d.energy); if (d.press) parts.push(P[4] + ' ×' + d.press);
      if (d.insight) parts.push(R.insight + ' ×' + d.insight);
    }
    return parts.join(' · ');
  }
  function costText(it) {
    var R = ST.ui.resources, t = E.num(it.cost) + (it.grp === 'head' || it.grp === 'heart' ? '' : '\u00a0' + R[it.cur]);
    if (it.need) t = E.num(it.need) + '\u00a0' + R.followers + ' · ' + t;
    return t;
  }
  function itemRow(s, it) {
    var tx = E.itemText(s, it.id), project = it.kind === 'project';
    var name = h('span', 'i-name', T(tx.name));
    if (it.kind === 'gen' && it.level > 0) name.appendChild(h('small', null, '×' + it.level));
    var desc = h('span', 'i-desc', T(tx.desc)), tag = project ? '' : fxTag(s, it.id);
    if (tag) desc.appendChild(h('span', 'i-fx', tag));
    var b = h('button', 'item ' + (project ? 'project' : it.kind), [name, h('span', 'i-cost', costText(it)), desc], { 'data-id': it.id, 'data-key': 'i-' + it.id });
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

  var PANELS = ['ledger', 'engine', 'circle', 'hum', 'practice'];
  function panelDefs(s, items) {
    var by = { practice: [], head: [], heart: [], hum: [], circle: [], engine: [] };
    items.forEach(function (it) { by[it.grp].push(it); });
    var defs = {};
    if (by.practice.length) defs.practice = { act: 1, items: by.practice };
    if (s.act >= 2) defs.hum = { act: 2, items: by.head.concat(by.heart, by.hum), head: by.head, heart: by.heart, project: by.hum };
    if (s.act >= 3) defs.circle = { act: 3, items: by.circle };
    if (s.act >= 4) defs.engine = { act: 4, items: by.engine };
    if (s.flags.ledger) defs.ledger = { act: 0, items: [] };
    return defs;
  }
  function panelSig(s, p, d) {
    var a = [UI.fold[p] ? 'f' : 'o'];
    d.items.forEach(function (it) { a.push(it.id + (it.owned ? '!' : '') + (it.level || '') + ':' + it.cost); });
    if (p === 'practice') a.push(s.up.tracker ? 'T' : '', s.flags.chart ? 'C' : '');
    if (p === 'circle') a.push(s.flags.alloc ? 'A' + s.alloc.outreach + '/' + s.alloc.sitting : '', 'n' + UI.namesShown, s.res.followers >= 100 ? 'M' : '', s.res.followers > 12.5 ? 'L' : '', s.flags.merged ? 'W' : '');
    if (p === 'ledger') a.push(s.ledger.map(function (e) { return e.id + e.patches.length; }).join(','), UI.confirmConfess ? 'c' : '', s.phase);
    if (p === 'hum') a.push(s.hum);
    return a.join('|');
  }
  function buildPanel(s, p, d) {
    var name = T(ST.ui.panels[p]), folded = !!UI.fold[p];
    var head = h('button', 'p-head', [h('span', 'label', name), h('span', 'p-sub', ''), h('span', 'caret', folded ? '+' : '–')], { 'data-fold': p, 'data-key': 'f-' + p, 'aria-expanded': folded ? 'false' : 'true' });
    var body = h('div', 'p-body');
    var sec = h('section', 'panel p-' + p + (folded ? ' folded' : ''), [head, body], { 'data-p': p });
    if (folded) return sec;
    var open = d.items.filter(function (it) { return !it.owned; }), ol;

    if (p === 'practice') {
      if ((ol = ownedLine(s, d.items))) body.appendChild(ol);
      if (s.up.tracker) body.appendChild(h('p', 'stats', '', { id: 'stats' }));
      if (s.flags.chart) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 300 44'); svg.setAttribute('preserveAspectRatio', 'none');
        var pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        pl.setAttribute('fill', 'none'); pl.setAttribute('stroke', '#f2b866'); pl.setAttribute('stroke-width', '1.2'); pl.setAttribute('vector-effect', 'non-scaling-stroke'); pl.id = 'chartLine';
        svg.appendChild(pl);
        body.appendChild(h('div', 'chart', [h('div', 'label', ST.act1.chart.name), svg]));
      }
      open.forEach(function (it) { body.appendChild(itemRow(s, it)); });
    } else if (p === 'hum') {
      var trees = h('div', 'trees');
      ['head', 'heart'].forEach(function (tr) {
        var col = h('div', 'tree', [h('div', 'tree-h', [h('b', null, ST.ui.trees[tr].name), h('span', null, ST.ui.trees[tr].desc)])]);
        d[tr].forEach(function (it) { if (!it.owned) col.appendChild(itemRow(s, it)); });
        var own = ownedLine(s, d[tr]); if (own) col.appendChild(own);
        trees.appendChild(col);
      });
      body.appendChild(trees);
      d.project.forEach(function (it) { if (!it.owned) body.appendChild(itemRow(s, it)); });
    } else if (p === 'circle') {
      if (UI.namesShown > 0) {
        /* everyone who has arrived, in the order they came; while there are twelve or fewer, all of them in view */
        var F = s.res.followers, names = h('div', 'names' + (F > 12.5 ? ' many' : ''));
        for (var i = 0; i < Math.min(UI.namesShown, 12); i++) {
          var c = ST.act3.circle[i];
          names.appendChild(h('p', null, s.flags.merged ? [h('b', null, ST.build.we)] : joinedLine(c)));
        }
        if (F >= 100) names.appendChild(h('p', 'more', ST.build.more.replace('{n}', ''), { id: 'more' }));
        body.appendChild(names);
      }
      if (s.flags.alloc) body.appendChild(buildAlloc(s));
      if ((ol = ownedLine(s, d.items))) body.appendChild(ol);
      open.forEach(function (it) { body.appendChild(itemRow(s, it)); });
    } else if (p === 'engine') {
      body.appendChild(h('div', 'gbar', [
        h('div', 'g-top', [h('span', 'label', ST.ui.bar), h('span', 'g-pct', '', { id: 'gPct' }), h('span', 'g-count', '', { id: 'gCount' })]),
        h('div', 'g-track', h('div', 'g-fill', null, { id: 'gFill' }))
      ]));
      if ((ol = ownedLine(s, d.items))) body.appendChild(ol);
      open.forEach(function (it) { body.appendChild(itemRow(s, it)); });
    } else if (p === 'ledger') {
      body.classList.add('ledger');
      body.appendChild(h('p', 'l-intro', T(ST.ledger.intro)));
      if (!s.ledger.length) body.appendChild(h('p', 'l-empty', T(ST.ledger.empty)));
      else {
        var ol2 = h('ol');
        s.ledger.forEach(function (e) {
          var li = h('li', null, e.line);
          e.patches.forEach(function (pt) { li.appendChild(h('span', null, pt)); });
          ol2.appendChild(li);
        });
        body.appendChild(ol2);
        if (s.phase === 'play') {
          if (UI.confirmConfess) {
            body.appendChild(h('p', 'l-confirm', ST.ledger.confessConfirm));
            body.appendChild(h('div', 'actions', [
              h('button', 'btn warm', ST.ledger.confessButton, { 'data-act': 'confess-yes', 'data-key': 'cy' }),
              h('button', 'btn ghost', ST.build.notYet, { 'data-act': 'confess-no', 'data-key': 'cn' })
            ]));
          } else body.appendChild(h('button', 'btn', ST.ledger.confessButton, { 'data-act': 'confess', 'data-key': 'cf' }));
        }
      }
    }
    return sec;
  }
  /* "{name}, {city}: {line}" in the language's own order and punctuation, the name set apart */
  function joinedLine(c) {
    var parts = String(ST.act3.joined).split('{name}'), kids = [];
    parts.forEach(function (part, i) {
      if (i) kids.push(h('b', null, c.name));
      if (part) kids.push(part.replace('{city}', c.city).replace('{line}', c.line));
    });
    return kids;
  }
  function buildAlloc(s) {
    var A = ST.ui.alloc, box = h('div', 'alloc', [h('div', 'a-title', A.title)]);
    var bar = h('div', 'a-bar');
    ['outreach', 'sitting', 'support'].forEach(function (k) { var i = h('i', 'b-' + k); i.style.width = (s.alloc[k] * 100) + '%'; bar.appendChild(i); });
    box.appendChild(bar);
    ['outreach', 'sitting', 'support'].forEach(function (k) {
      var pct = Math.round(s.alloc[k] * 100);
      box.appendChild(h('div', 'a-row k-' + k, [
        h('span', 'a-name', A[k].name), h('span', 'a-desc', T(A[k].desc)),
        h('button', 'step', '−', { 'data-alloc': k, 'data-d': '-1', 'data-key': 'a-' + k + '-', 'aria-label': A[k].name + ' −', disabled: pct <= 0 ? '' : null }),
        h('span', 'a-pct num', E.pct(pct)),
        h('button', 'step', '+', { 'data-alloc': k, 'data-d': '1', 'data-key': 'a-' + k + '+', 'aria-label': A[k].name + ' +', disabled: pct >= 100 ? '' : null })
      ]));
    });
    return box;
  }

  function onPanelClick(e) {
    var t = e.target.closest ? e.target.closest('button') : null;
    if (!t) return;
    var d = t.dataset;
    if (d.fold) { UI.fold[d.fold] = !UI.fold[d.fold]; UI.touched[d.fold] = true; UI.sync(true); return; }
    if (d.max) { G.buyMax(d.max); return; }
    if (d.id) { if (e.shiftKey && D.act2.gens[d.id]) G.buyMax(d.id); else G.buy(d.id); return; }
    if (d.alloc) { G.setAlloc(d.alloc, S().alloc[d.alloc] + 0.05 * (+d.d)); UI.sync(true); return; }
    if (d.act === 'confess') { UI.confirmConfess = true; UI.sync(true); return; }
    if (d.act === 'confess-no') { UI.confirmConfess = false; UI.sync(true); return; }
    if (d.act === 'confess-yes') { UI.confirmConfess = false; G.confess(); UI.sync(true); return; }
  }

  function syncPanels(s, items) {
    var defs = panelDefs(s, items), box = $('panels'), p, i;
    /* a new act folds the earlier ones */
    if (UI.lastAct !== s.act) { UI.lastAct = s.act; UI.fold = { practice: s.act > 1, hum: s.act > 2, circle: s.act > 3 }; }
    if (s.flags.merged && !UI.mergedShown) { UI.mergedShown = true; UI.fold.circle = false; UI.fold.engine = true; UI.fold.ledger = true; }
    for (i = 0; i < PANELS.length; i++) {
      p = PANELS[i];
      var el = box.querySelector('[data-p="' + p + '"]');
      if (!defs[p]) { if (el) el.remove(); UI.sig[p] = null; continue; }
      if (UI.fold[p] == null) UI.fold[p] = (p !== 'ledger' && defs[p].act < s.act);
      /* the Ledger opens when there is something in it, and folds away when there is not */
      if (p === 'ledger' && !UI.touched.ledger && !s.flags.merged) UI.fold.ledger = s.ledger.length === 0;
      var sig = panelSig(s, p, defs[p]);
      if (sig === UI.sig[p] && el) continue;
      UI.sig[p] = sig;
      var act = document.activeElement, key = act && el && el.contains(act) ? act.getAttribute('data-key') : null;
      var fresh = buildPanel(s, p, defs[p]);
      if (el) { fresh.style.animation = 'none'; box.replaceChild(fresh, el); }
      else {
        /* keep the fixed order: ledger, engine, circle, hum, practice */
        var before = null;
        for (var j = i + 1; j < PANELS.length && !before; j++) before = box.querySelector('[data-p="' + PANELS[j] + '"]');
        box.insertBefore(fresh, before);
      }
      if (key) { var f = fresh.querySelector('[data-key="' + key + '"]'); if (f && !f.disabled) f.focus(); }
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
    /* small live bits */
    var st = $('stats');
    if (st) st.textContent = ST.build.stats.replace('{breaths}', E.num(s.breaths)).replace('{best}', E.num(s.best));
    var cl = $('chartLine');
    if (cl && s.chart.length > 1) {
      var mx = Math.max.apply(null, s.chart), mn = s.chart[0], n = s.chart.length, pts = [];
      for (i = 0; i < n; i++) pts.push((i / (n - 1) * 300).toFixed(1) + ',' + (42 - (s.chart[i] - mn) / Math.max(1, mx - mn) * 40).toFixed(1));
      cl.setAttribute('points', pts.join(' '));
    }
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

  UI.sync = function (force) {
    var s = S(), app = $('app'), r = G.rates();
    var cls = [];
    if (app.classList.contains('intro')) cls.push('intro');
    if (app.classList.contains('intro-out')) cls.push('intro-out');
    cls.push('act-' + s.act, 'ph-' + s.phase);
    if (s.clicks > 0 || s.act > 1) cls.push('r-side', 'r-hdr');
    if (s.up.metronome || s.act > 1) cls.push('r-title');
    if (s.flags.merged) cls.push('merged');
    if (UI.short) cls.push('short');
    if (s.clicks === 0 && s.nudge && s.nudge.press > 0 && s.phase === 'play') cls.push('nudge-press');
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
    var hint = $('hint'), showHint = s.act === 1 && s.clicks >= 3 && s.best < 3 && s.phase === 'play' && !UI.card;
    if (hint.hidden === showHint) { hint.hidden = !showHint; if (showHint) hint.textContent = ST.ui.breathHint; }
    $('jHint').hidden = s.journal.length < 6 || s.journal.some(function (j) { return j.s; });

    syncResources(s, r, force ? 0 : -1);
    syncChips(s, r);
    syncPanels(s, E.items(s));

    /* legend and ticker */
    var lg = '';
    if (s.act >= 3 && s.phase === 'play') {
      var per = G.V('legend') || 1;
      lg = per <= 1 ? ST.ui.legendOne : ST.ui.legend.replace('{n}', E.num(per) + (E.sep() || '') + ST.build.people);
    }
    if ($('legend').textContent !== lg) $('legend').textContent = lg;
    if (s.act >= 3 && s.phase === 'play' && now() >= UI.tickerAt && !G.held) {
      UI.tickerAt = now() + D.small.ticker * 1000 / G.pace();
      var line = G.tickerLine(), tk = $('ticker'), sp = h('span', null, line);
      clear(tk); tk.appendChild(sp); tk.classList.add('show');
      sp.style.opacity = 0; void sp.offsetWidth; sp.style.opacity = 1;
    }
    if (s.act < 3 && $('ticker').classList.contains('show')) $('ticker').classList.remove('show');

    /* a nudged row glows until it is used or its time is up */
    var gl = UI.glow, lit = $('panels').querySelector('.nudged');
    if (gl && now() > gl.until) gl = UI.glow = null;
    var want = gl ? $('panels').querySelector(gl.sel) : null;
    if (lit && lit !== want) lit.classList.remove('nudged');
    if (want && !want.classList.contains('nudged')) want.classList.add('nudged');
    /* Merge: once the picture behind the words has gone white, the words go to dark ink */
    if (s.ending === 'merge' && s.flags.endingOn && !UI.white) whiteCheck();
    if (s.ending !== 'merge' && UI.white) UI.white = false;

    if (!G.held) cardStep();
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
    $('stage').classList.toggle('inwin', !!inWin);
    $('stage').classList.toggle('guide', !!UI.guideUntil && t < UI.guideUntil);
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

  var BLOCKING = { decision: 1, knot: 1, collapse: 1, question: 1, name: 1, captcha: 1, style: 1, person: 1 };
  var CHAINED = { name: 1, seq: 1, 'final': 1, keepsake: 1 };

  function cardStep() {
    var s = S(), head = s.queue[0] || null;
    if (UI.card && UI.card.mode === 'ask' && UI.card.card !== head) closeCard(true);
    if (UI.reader && UI.reader.card !== head && !UI.reader.ending) readerClose();
    if (UI.finalUI && s.phase === 'final') finalStep();
    if (!head || UI.card || UI.reader || UI.holdKeepsake || !$('titleCard').hidden) return;
    /* The first screen goes first, all of it: the intro (and its fade) and the language row at its foot are gone from
     * the page, layout and accessibility tree included, before any card or sequence opens. A card that comes while
     * the row is still there (a thought before the first press) sends it away for good, then rises. */
    var app = $('app');
    if (app.classList.contains('intro') || app.classList.contains('intro-out')) return;
    if (!$('langs').hidden) { UI.langsDone = true; return; }
    if (head.k === 'keepsake') { if (UI.overlayKind !== 'keepsake') UI.showKeepsake(); return; }
    if (head.k === 'final') { if (!UI.finalUI) showFinal(); return; }
    if (now() < UI.nextCardAt && !CHAINED[head.k]) return;
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
    var next = S().queue[0];
    UI.nextCardAt = now() + (silent || (next && CHAINED[next.k]) ? 0 : 3200 / G.pace());
  }
  UI.closeCard = closeCard;

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
      var b = h('button', 'opt', kids, { 'data-opt': o && o.id });
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
      /* Two steps (Bulut, 2026-11-13): who first, then, on the same card, their name or not. The pick is kept on the
       * card in the queue, so a save made between the steps comes back at the second. */
      def = ST.person;
      var personStep = function () {
        clear(el);
        label(def.title);
        var picked = card.pick && def.options.filter(function (o) { return o.id === card.pick; })[0];
        if (!picked) {
          body(def.text);
          var po = h('div', 'opts row');
          def.options.forEach(function (o) {
            po.appendChild(optButton(o.label, { id: o.id, go: function () {
              if (c.mode !== 'ask' || UI.card !== c) return;
              card.pick = o.id; G.save(); personStep();
            } }));
          });
          el.appendChild(po);
          return;
        }
        el.appendChild(h('p', 'picked', picked.label));
        body(def.namePrompt);
        var pin = input(def.namePlaceholder, 40);
        el.appendChild(pin);
        var done = h('button', 'btn', def.nameDone, { 'data-opt': 'name-done' }), keep = h('button', 'btn', def.nameKeep, { 'data-opt': 'name-keep' });
        done.addEventListener('click', function () { answer({ opt: picked.id, name: pin.value }, 3600); });
        keep.addEventListener('click', function () { answer({ opt: picked.id, name: '' }, 3600); });
        pin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); done.click(); } });
        el.appendChild(h('div', 'actions even', [done, keep]));
        setTimeout(function () { if (UI.card === c && document.activeElement !== pin) pin.focus({ preventScroll: true }); }, 60);
      };
      personStep();
    } else if (k === 'thought') {
      def = E.thoughtDef(s, card.id);
      label(ST.ui.card.thought);
      body(def.text);
      var acts = h('div', 'actions');
      /* two equal choices: the same weight, so the player chooses rather than being steered (Bulut, 2026-11-13) */
      var bp = h('button', 'btn', ST.thoughtLabels.pass, { 'data-opt': 'pass' }), bf = h('button', 'btn', ST.thoughtLabels.follow, { 'data-opt': 'follow' });
      bp.addEventListener('click', function () { answer({ a: 'pass' }, 3000); });
      bf.addEventListener('click', function () { answer({ a: 'follow' }, 4200); });
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
    } else if (k === 'style') {
      def = ST.act1.style;
      label(ST.ui.card.decision);
      el.appendChild(h('h3', null, def.title));
      body(def.body);
      var so = h('div', 'opts');
      def.options.forEach(function (o) { so.appendChild(optButton(o.label, { id: o.id, hint: o.hint, go: function () { answer({ opt: o.id }, 4200); } })); });
      el.appendChild(so);
    } else if (k === 'decision') {
      def = ST.decisions[card.id];
      label(ST.ui.card.decision);
      el.appendChild(h('h3', null, T(def.title)));
      body(def.body);
      var dopt = h('div', 'opts');
      def.options.forEach(function (o) {
        var m = kindMarks(o.kind);
        dopt.appendChild(optButton(T(o.label), { id: o.id, glyph: m.glyph, tag: m.tag, last: s.meta.last[card.id] === o.id, go: function () { answer({ opt: o.id }, 0); } }));
      });
      el.appendChild(dopt);
    } else if (k === 'knot') {
      def = ST.knots[card.id];
      label(ST.ui.card.knot);
      el.appendChild(h('h3', null, T(def.title)));
      body(def.body);
      var ko = h('div', 'opts'), mc = kindMarks('plain'), mp = kindMarks('smooth');
      ko.appendChild(optButton(T(def.clean.label), { id: 'clean', glyph: mc.glyph, tag: mc.tag, go: function () { answer({ opt: 'clean' }, 0); } }));
      ko.appendChild(optButton(T(def.patch.label), { id: 'patch', glyph: mp.glyph, tag: mp.tag, go: function () { answer({ opt: 'patch' }, 0); } }));
      el.appendChild(ko);
    } else if (k === 'collapse') {
      def = ST.ledger.collapse;
      label(T(ST.ui.panels.ledger));
      el.appendChild(h('h3', null, def.title));
      body(def.body);
      var cb = h('button', 'btn', ST.build.next, { 'data-opt': 'ok' });
      cb.addEventListener('click', function () { answer({}, 0); });
      el.appendChild(h('div', 'actions', [h('span', 'gap'), cb]));
    } else if (k === 'name' || k === 'question') {
      var isName = k === 'name';
      def = isName ? { ask: ST.wake.nameAsk, chips: ST.wake.nameChips } : ST.questions[card.id];
      label(isName ? ST.meta.actTitles[2].num : T(ST.ui.card.question));
      body(def.ask);
      var qin = input(isName ? ST.wake.namePlaceholder : '', isName ? 16 : 90);
      el.appendChild(qin);
      var chips = h('div', 'chips');
      def.chips.forEach(function (ch) {
        var cbn = h('button', 'chip-btn', ch, { 'data-chip': ch });
        cbn.addEventListener('click', function () { qin.value = ch; qin.focus(); });
        chips.appendChild(cbn);
      });
      el.appendChild(chips);
      var qa = h('div', 'actions');
      if (!isName) qa.appendChild(h('span', 'small', ST.ui.card.optional));
      qa.appendChild(h('span', 'gap'));
      if (def.canKeep) {
        var kb = h('button', 'btn', ST.ui.card.keep, { 'data-opt': 'keep' });
        kb.addEventListener('click', function () { answer({ keep: true }, 3800); });
        qa.appendChild(kb);
      }
      var ok = h('button', 'btn', ST.build.done, { 'data-opt': 'ok' });
      ok.addEventListener('click', function () { answer({ text: qin.value }, isName ? 2600 : 3800); });
      qin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } });
      qa.appendChild(ok);
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
      return;
    }

    var box = ringBox();
    $('cards').appendChild(el);
    if (UI.wide) {
      /* lower third of the stage when it fits under the ring; otherwise the card docks at the top of the right column */
      var top = box.h - 58 - el.offsetHeight;
      if (UI.short || top < box.y + box.r - 12) { $('sideCards').appendChild(el); c.docked = true; }
    }
    if (BLOCKING[k]) $('stage').classList.add('dimmed');
    fitStage();
    G.cardShown(card);
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
    $('reader').hidden = true; clear($('reader'));
    $('bigCount').hidden = true;
  }

  function startReader(card) {
    var s = S(), lines = E.seqLines(s, card.id), el = $('reader');
    clear(el); el.hidden = false;
    $('stage').classList.add('reading');
    var r = UI.reader = { card: card, id: card.id, lines: lines, i: -1, el: el, timer: null, typing: null, waiting: false };
    G.seqStart(card);
    if (card.id === 'confession') {
      r.f0 = s.res.followers; r.n = s.ledger.length + s.ledger.reduce(function (a, e) { return a + e.patches.length; }, 0);
      r.open = ST.final.confession.open.length; r.close = ST.final.confession.close.length;
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
    while (r.el.children.length > (UI.short || (UI.wide && room < 280) ? 1 : 2)) r.el.removeChild(r.el.firstChild);
    var text = r.lines[r.i], p = lineEl(text);
    r.el.appendChild(p);
    if (r.id === 'confession') {
      var mid = r.i >= r.open && r.i < r.lines.length - r.close;
      if (mid) r.target = r.f0 * Math.max(0.45, 1 - 0.5 * (r.i - r.open + 1) / Math.max(1, r.lines.length - r.open - r.close));
      else if (r.i >= r.lines.length - r.close + 1) r.target = r.f0 * 0.97;
      if (mid) G.V('pulse', 'knot');
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
    if (!r || r.waiting) return;
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

  function showFinal() {
    var s = S(), F = ST.final, box = $('finalPanel'), tangled = s.ledger.length > 0;
    clear(box);
    UI.finalUI = { at: now(), waited: false, sit: false };
    box.appendChild(h('h2', null, F.title));
    F.body.forEach(function (l) { box.appendChild(h('p', null, T(l))); });
    var rec = h('div', 'rec');
    box.appendChild(rec);
    var lines = E.pick(s, F.recommend).map(function (l) { return T(l); }), i = 0;
    (function next() {
      if (!UI.finalUI || i >= lines.length) return;
      var p = h('p', 'hum', ''); rec.appendChild(p);
      var text = lines[i++];
      G.humSpeak(text);
      typeInto(p, text, function () { setTimeout(next, 700 / G.pace()); });
    })();
    ['coexist', 'merge'].forEach(function (k) {
      var o = F.options[k], note = tangled ? o.tangled : o.clean;
      var b = h('button', 'f-opt', [h('span', 'f-name', o.label), h('span', 'f-sub', o.sub), h('span', 'f-desc', T(o.desc)), note ? h('span', 'f-note', T(note)) : null], { 'data-final': k });
      b.addEventListener('click', function () { chooseFinal(k); });
      box.appendChild(b);
    });
    box.appendChild(h('div', null, null, { id: 'finalExtra' }));
    box.hidden = false;
    box.scrollTop = 0;
  }
  function finalStep() {
    var f = UI.finalUI, s = S(), ex = $('finalExtra');
    if (!f || !ex) return;
    var el = (now() - f.at) / 1000 * G.pace();
    if (!f.waited && el >= 20) { f.waited = true; ex.appendChild(h('p', 'f-wait', T(ST.final.waiting))); }
    if (!f.sit && (el >= 40 || (s.flags.finalBreaths || 0) >= 4)) {
      f.sit = true;
      var o = ST.final.options.sit;
      var b = h('button', 'f-opt sit', [h('span', 'f-name', o.label + ' ' + o.sub), h('span', 'f-desc', o.desc)], { 'data-final': 'sit' });
      b.addEventListener('click', function () { chooseFinal('sit'); });
      ex.appendChild(b);
    }
  }
  function chooseFinal(k) {
    if (!UI.finalUI) return;
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
    var rnote = h('p', 'note', '');
    bx.addEventListener('click', function () {
      ta.value = G.exportSave(); ta.select();
      try { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); else document.execCommand('copy'); } catch (e) { /* the text is selected; that is enough */ }
      note.textContent = ST.keepsake.copied;
    });
    bi.addEventListener('click', function () { if (G.importSave(ta.value)) UI.closeOverlay(true); else ta.focus(); });
    var armed = false;
    br.addEventListener('click', function () {
      if (!armed) { armed = true; rnote.textContent = ST.ui.save.resetConfirm; br.className = 'btn warm'; return; }
      UI.closeOverlay(true); G.reset();
    });
    sheet.appendChild(h('section', 'm-sec m-save', [h('div', 'row', [bx, bi]), ta, note]));
    /* start over sits apart, so it is never pressed on the way to something else; it still asks first */
    sheet.appendChild(h('section', 'm-sec m-reset', [h('div', 'row', [br]), rnote]));
    o.appendChild(sheet); o.hidden = false;
    bc.focus();
  };

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

  /* ───────────── toast ───────────── */

  UI.toast = function (kids, ms) {
    UI.toasts.push({ kids: kids, ms: ms || 4600 });
    if (!UI.toastBusy) nextToast();
  };
  function nextToast() {
    var t = UI.toasts.shift(), el = $('toast');
    if (!t) { UI.toastBusy = false; return; }
    UI.toastBusy = true;
    clear(el); el.className = '';
    t.kids.forEach(function (k) { el.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    el.hidden = false;
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.hidden = true; nextToast(); }, 800);
    }, t.ms / Math.min(4, G.pace()));
  }
  UI.beadToast = function (id) {
    var b = ST.beads.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    UI.toast([h('i', 'dot'), h('b', null, b.name), ' ', h('span', null, b.desc)]);
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
