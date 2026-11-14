/* The Enlightenment Engine — what a player can take away, and the few things around the game itself.
 *   the share card, the two wallpapers (phone, desktop: free, like the card), the bowl (buys nothing), the studio line,
 *   the language picker and the note under every translation.
 * Words: story.launch.js (EE.story.share / picture / bowl / studio / langUi / links). Code writes no prose.
 * The Circle on the card and the picture is drawn by EE.visual.still: the same drawing code as the live picture.
 * No network, ever: saving is a download (or the phone's share sheet), and the bowl is "coming soon".
 */
(function () {
  'use strict';
  var EE = window.EE, E = EE.econ, ST = EE.story;
  var K = EE.keep = {};

  function UI() { return EE.ui; }
  function h(tag, cls, kids, attrs) { return EE.ui.h(tag, cls, kids, attrs); }
  function lang() { return EE.i18n ? EE.i18n.code : 'en'; }
  function cjk() { return !!(EE.i18n && EE.i18n.cjk()); }
  function upper(t) { return EE.i18n ? EE.i18n.upper(t) : String(t).toUpperCase(); }
  function fill(str, x) { return String(str).replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(x, k) ? String(x[k]) : m; }); }
  /* analytics (js/track.js): off unless the website build turned it on; fixed values only, never the player's words.
   * once() keys an event to this sitting by its seed (the key is never sent), so it is counted once per run. */
  function track(name, params) { if (EE.track) EE.track(name, params); }
  function once(key, s, name, params) { if (EE.track) EE.track.once(key + '|' + (s ? s.seed : ''), name, params); }
  var bowlUsed = {};            /* seed → an amount was pressed in this run (so leaving is not a "no") */
  function quote(w) { return /^(ja|zh)$/.test(lang()) ? '「' + w + '」' : '‘' + w + '’'; }

  /* ───────────── the run, as the card and the picture need it ───────────── */

  /* Kept with the save (meta.lastRun) when the keepsake first shows, so the picture can still be made from the menu
   * after "Sit again". Only facts and the player's own words: every sentence around them is read in the language of
   * the moment. */
  K.record = function (s) {
    var words = [];
    ['sleep', 'unsaid', 'fifteen', 'keep'].forEach(function (k) { if (s.answers[k]) words.push(s.answers[k]); });
    return {
      v: 1, snap: s.align || EE.game.circleState(s, true), ending: s.ending || null,
      hum: s.hum || ST.meta.defaultHum, days: Math.max(1, Math.floor(s.day)), people: Math.max(0, s.res.followers),
      smooth: s.counts.smooth || 0, words: words, voice: E.voice(s), seed: s.seed
    };
  };
  /* the run to draw: this one if it has ended, else the last one that did */
  K.current = function (s) { return (s.phase === 'keepsake' && s.ending) ? K.record(s) : (s.meta.lastRun || null); };
  K.ended = function (s) { return !!((s.phase === 'keepsake' && s.ending) || s.meta.lastRun); };

  /* ───────────── drawing helpers ───────────── */

  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function fonts() {
    var cs = getComputedStyle(document.documentElement);
    return { serif: (cs.getPropertyValue('--serif') || '').trim() || 'Georgia, serif' };
  }
  function font(c, size, italic) {
    /* CJK faces have no italic of their own: never let the canvas slant them */
    c.font = (italic && !cjk() ? 'italic ' : '') + size + 'px ' + fonts().serif;
  }
  function measure(c, str, sp) {
    if (!sp) return c.measureText(str).width;
    var chars = Array.from(str), w = 0;
    for (var i = 0; i < chars.length; i++) w += c.measureText(chars[i]).width;
    return w + sp * Math.max(0, chars.length - 1);
  }
  /* text with letter-spacing (canvas letterSpacing is not everywhere yet) */
  function text(c, str, x, y, align, sp) {
    if (!sp) { c.textAlign = align || 'left'; c.fillText(str, x, y); return; }
    var chars = Array.from(str), total = measure(c, str, sp);
    var x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    c.textAlign = 'left';
    for (var i = 0; i < chars.length; i++) { c.fillText(chars[i], x0, y); x0 += c.measureText(chars[i]).width + sp; }
  }
  /* break a line to a width: by words, and by character in Chinese and Japanese (never starting a line with a closing
   * mark or a small kana-like stop) */
  var CJK_CHAR = '぀-ヿ㐀-鿿豈-﫿＀-￯　-〿';
  var UNIT = new RegExp('[' + CJK_CHAR + ']|[^\\s' + CJK_CHAR + ']+|\\s+', 'g');
  var NOSTART = /^[、。，．・：；？！）」』】〕〉》’”%,.:;!?)\]…ー]$/;
  function wrap(c, str, max, sp) {
    var units = String(str).match(UNIT) || [], lines = [], line = '';
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      if (/^\s+$/.test(u)) { if (line) line += ' '; continue; }
      var trial = line + u;
      if (line && measure(c, trial, sp) > max && !NOSTART.test(u)) { lines.push(line.trim()); line = u; }
      else line = trial;
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  var INK = [233, 228, 216], AMBER = [242, 184, 102], GOLD = [255, 243, 201];

  /* dark paper, like the stage: a slow gradient, soft unevenness, a warm glow behind the Circle, darker edges */
  function paper(c, w, h, seed, glow) {
    var g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#08090e'); g.addColorStop(0.5, '#0b0d12'); g.addColorStop(1, '#0e1017');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    var r = rng(seed || 20261113), big = Math.max(w, h);
    for (var i = 0; i < 46; i++) {
      var bx = r() * w, by = r() * h, br = big * (0.05 + r() * 0.2), light = r() < 0.5;
      var m = c.createRadialGradient(bx, by, 0, bx, by, br);
      m.addColorStop(0, light ? 'rgba(120,110,100,0.035)' : 'rgba(0,0,0,0.08)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = m; c.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    if (glow) {
      var gg = c.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.r);
      gg.addColorStop(0, rgba(AMBER, 0.075)); gg.addColorStop(0.45, rgba([200, 130, 110], 0.03)); gg.addColorStop(1, rgba(AMBER, 0));
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = gg; c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'source-over';
    }
    var d = Math.sqrt(w * w + h * h) / 2, v = c.createRadialGradient(w / 2, h * 0.45, d * 0.45, w / 2, h * 0.45, d * 1.05);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.7, 'rgba(2,2,4,0.22)'); v.addColorStop(1, 'rgba(2,2,4,0.55)');
    c.fillStyle = v; c.fillRect(0, 0, w, h);
  }
  /* fine warm grain at device resolution: keeps the dark gradients from banding, in print and on screens */
  function grain(c, cv, amount) {
    var t = document.createElement('canvas'); t.width = t.height = 256;
    var x = t.getContext('2d'), img = x.createImageData(256, 256), d = img.data, r = rng(4242);
    for (var i = 0; i < d.length; i += 4) { var v = (r() + r()) * 0.5; v = v * v * 255; d[i] = v; d[i + 1] = v * 0.95; d[i + 2] = v * 0.86; d[i + 3] = 255; }
    x.putImageData(img, 0, 0);
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = amount || 0.035;
    c.fillStyle = c.createPattern(t, 'repeat'); c.fillRect(0, 0, cv.width, cv.height);
    c.restore();
  }

  /* How each ending's Circle is shown (chosen by eye, 2026-11-13, from renders of each candidate).
   * The picture: always the Circle as it stood at the Final Alignment, threads and all; Coexistence and the Cushion
   * light the player's ring (you came back; you sat), Merge keeps the one dark ring at the centre (one left).
   * The card: the same for Coexistence and the Cushion (their own end states are a scatter of dots, or one small
   * ring, and read as nothing at thumbnail size); Merge four seconds in, the crowd spiralling into one white mind. */
  var LOOK = {
    card: { coexist: { ring: 'lit' }, merge: { ending: 'merge', endT: 4 }, sit: { ring: 'lit' } },
    picture: { coexist: { ring: 'lit' }, merge: {}, sit: { ring: 'lit' } }      /* the phone and the desktop wallpaper */
  };
  K.LOOK = LOOK;

  /* the Circle into `cv` (logical units, scale k), in the square {x, y, s} */
  function circle(cv, rec, frame, k, look) {
    look = look || {};
    var snap = JSON.parse(JSON.stringify(rec.snap || {}));
    snap.finale = true;
    snap.ending = look.ending || null;
    snap.festival = false; snap.sakura = false; snap.motes = false;
    if (EE.visual && typeof EE.visual.still === 'function') {
      try {
        return EE.visual.still(cv, snap, { scale: k, frame: frame, background: false, vignette: false, grain: false,
          particles: !!look.particles, breath: look.breath == null ? 0.5 : look.breath, endT: look.endT, ring: look.ring, motion: look.motion });
      } catch (e) { if (window.console) console.warn('still failed', e); }
    }
    /* no picture module: a plain ring, so the card is still a card */
    var c = cv.getContext('2d'), R = Math.max(44, 0.13 * frame.s);
    c.setTransform(k, 0, 0, k, 0, 0);
    c.strokeStyle = rgba(AMBER, 0.9); c.lineWidth = 2;
    c.beginPath(); c.arc(frame.x, frame.y, R, 0, Math.PI * 2); c.stroke();
    return { perDot: 1, R: R, cx: frame.x, cy: frame.y, extent: R * 1.6, S: frame.s };
  }

  function endingWords(rec) {
    var en = rec.ending && ST.final.endings[rec.ending];
    return en ? { title: en.title, sub: en.sub } : { title: '', sub: '' };
  }

  /* ───────────── the share card ───────────── */

  K.cardLine = function (rec) {
    var L = ST.share.lines;
    return fill(rec.smooth > 0 ? L.tangled : L.clean, { days: E.num(rec.days), people: E.num(rec.people), smooth: E.num(rec.smooth) });
  };

  /* 1200 × 630, or 1080 × 1350 (tall, for phones) */
  K.card = function (rec, tall) {
    var w = tall ? 1080 : 1200, hgt = tall ? 1350 : 630, k = 1;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = hgt;
    var c = cv.getContext('2d');
    var en = endingWords(rec), look = LOOK.card[rec.ending] || {};
    var frame = tall ? { x: w / 2, y: 560, s: 860 } : { x: 318, y: hgt / 2, s: 548 };
    paper(c, w, hgt, rec.seed, { x: frame.x, y: frame.y, r: frame.s * 0.75 });
    circle(cv, rec, frame, k, look);
    c.setTransform(k, 0, 0, k, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.textBaseline = 'alphabetic';
    var sp = cjk() ? 0 : 1, line = K.cardLine(rec), foot = ST.share.foot, site = ST.links.site;
    if (!tall) {
      var x0 = 668, maxW = 470, y = 214;
      c.fillStyle = rgba(AMBER, 0.85); font(c, 15);
      text(c, upper(en.title), x0, y, 'left', 5.2 * sp);
      y += 62; c.fillStyle = rgba(INK, 0.96); font(c, 46, true);
      wrap(c, en.sub, maxW).forEach(function (l, i) { text(c, l, x0, y + i * 54); y += i ? 54 : 0; });
      y += 34; c.fillStyle = rgba(INK, 0.35); c.fillRect(x0, y, 44, 1);
      y += 50; c.fillStyle = rgba(INK, 0.72); font(c, 23);
      wrap(c, line, maxW).forEach(function (l, i) { text(c, l, x0, y + i * 33); });
      c.fillStyle = rgba(INK, 0.46); font(c, 13);
      text(c, upper(foot), x0, hgt - 62, 'left', 3.4 * sp);
      c.fillStyle = rgba(INK, 0.4); font(c, 15, true);
      text(c, site, x0, hgt - 38);
    } else {
      var cxT = w / 2, y2 = 1072;
      c.fillStyle = rgba(AMBER, 0.85); font(c, 17);
      text(c, upper(en.title), cxT, y2, 'center', 6 * sp);
      y2 += 62; c.fillStyle = rgba(INK, 0.96); font(c, 50, true);
      wrap(c, en.sub, 900).forEach(function (l, i) { text(c, l, cxT, y2 + i * 58, 'center'); });
      y2 += 56; c.fillStyle = rgba(INK, 0.72); font(c, 25);
      wrap(c, line, 860).forEach(function (l, i) { text(c, l, cxT, y2 + i * 36, 'center'); });
      c.fillStyle = rgba(INK, 0.46); font(c, 14);
      text(c, upper(foot), cxT, hgt - 64, 'center', 3.6 * sp);
      c.fillStyle = rgba(INK, 0.4); font(c, 16, true);
      text(c, site, cxT, hgt - 38, 'center');
    }
    grain(c, cv, 0.03);
    return cv;
  };

  /* ───────────── the pictures: wallpapers, free ───────────── */

  /* The phone wallpaper (1290 × 2796): the Circle above the middle, the player's words under it. */
  function phonePicture(rec) {
    var size = { w: 1290, h: 2796 }, LW = 430, k = size.w / LW, LH = size.h / k;
    var cv = document.createElement('canvas'); cv.width = size.w; cv.height = size.h;
    var c = cv.getContext('2d');
    c.setTransform(k, 0, 0, k, 0, 0);
    var look = LOOK.picture[rec.ending] || {}, en = endingWords(rec), P = ST.picture;
    var margin = 34;

    /* the words first, to know how much room they need */
    var sp = cjk() ? 0 : 1, measureC = c;
    var sz = { head: 9.5, called: 15, meta: 11, label: 8.5, word: 12.5, foot: 9, lead: 1.5 };
    var measureW = Math.min(LW - margin * 2, 340);
    function block(f) {
      var items = [];
      items.push({ kind: 'head', t: upper(P.heading), size: sz.head * f, sp: 4.2 * sp * f, col: rgba(INK, 0.5), gap: 0 });
      items.push({ kind: 'rule', gap: 16 * f, h: 1 });
      items.push({ kind: 'line', t: fill(P.called, { hum: rec.hum }), size: sz.called * f, italic: true, col: rgba(INK, 0.92), gap: 18 * f });
      items.push({ kind: 'line', t: fill(P.days, { n: E.num(rec.days) }), size: sz.meta * f, col: rgba(INK, 0.6), gap: 12 * f });
      if (en.title) items.push({ kind: 'head', t: upper(en.title), size: sz.label * f, sp: 3.4 * sp * f, col: rgba(AMBER, 0.72), gap: 10 * f });
      if (rec.words.length) {
        items.push({ kind: 'head', t: upper(P.words), size: sz.label * f, sp: 3.4 * sp * f, col: rgba(INK, 0.42), gap: 30 * f });
        rec.words.forEach(function (w, i) { items.push({ kind: 'word', t: quote(w), size: sz.word * f, italic: true, col: rgba(INK, 0.8), gap: (i ? 7 : 12) * f }); });
      }
      return items;
    }
    function layout(items) {
      var y = 0;
      items.forEach(function (it) {
        y += it.gap;
        if (it.kind === 'rule') { it.y = y; y += 1; return; }
        font(measureC, it.size, it.italic);
        it.lines = wrap(measureC, it.t, measureW, it.sp || 0);
        it.lh = it.size * (it.kind === 'word' ? sz.lead : 1.35);
        it.y = y + it.size;
        y += it.lh * (it.lines.length - 1) + it.size * 1.25;
      });
      return y;
    }
    var footH = sz.foot * 3.2, f = 1, items = block(f), bh = layout(items);
    /* The Circle: as large as the words leave room for, a little above the middle, clear of the lock-screen clock.
     * EXT is how far the finished mandala reaches (eight layers). */
    var gapC = 40, footY = LH - margin, S = PHONE_S, frameY, lift = 0;
    function place() {
      frameY = Math.max(LH * (0.415 - lift), margin + S * EXT + 120);
      return footY - footH - gapC - (frameY + S * EXT + gapC) - bh;      /* room left for the words: >= 0 fits */
    }
    /* the Circle is the thing: the words give way first */
    while (place() < 0 && lift < 0.04) lift += 0.005;
    while (place() < 0 && f > 0.84) { f -= 0.02; items = block(f); bh = layout(items); }
    while (place() < 0 && S > 300) S -= 6;
    while (place() < 0 && f > 0.72) { f -= 0.04; items = block(f); bh = layout(items); }
    var spare = Math.max(0, place());
    var frame = { x: LW / 2, y: frameY, s: S };

    paper(c, LW, LH, rec.seed, { x: frame.x, y: frame.y, r: S * 0.8 });
    var info = circle(cv, rec, frame, k, look);
    c.setTransform(k, 0, 0, k, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.textBaseline = 'alphabetic';

    /* the words, centred under it, in the middle of the room between the Circle and the foot */
    var top = frame.y + S * EXT + gapC + spare * 0.35;
    var cx = LW / 2;
    items.forEach(function (it) {
      if (it.kind === 'rule') { c.fillStyle = rgba(INK, 0.28); c.fillRect(cx - 18 * f, top + it.y, 36 * f, Math.max(0.5, 1 / k * 2)); return; }
      c.fillStyle = it.col; font(c, it.size, it.italic);
      it.lines.forEach(function (l, i) { text(c, l, cx, top + it.y + i * it.lh, 'center', it.sp || 0); });
    });
    /* the legend and the site, at the foot */
    var per = info.perDot || 1;
    var legend = per <= 1 ? ST.ui.legendOne : fill(P.legend, { n: E.num(per) });
    c.fillStyle = rgba(INK, 0.4); font(c, sz.foot, true);
    text(c, legend + '   ·   ' + ST.links.site, cx, footY, 'center');
    grain(c, cv, 0.03);
    cv.jpeg = true;
    cv.circle = { x: frame.x * k, y: frame.y * k, r: S * EXT * k };     /* where the Circle is, in pixels (for checks) */
    return cv;
  }

  /* The desktop wallpaper (3840 × 2160): the Circle alone, centred, about 70% of the height, calm enough to sit behind
   * icons; one small line low down. It is the phone's Circle (the same layout size, PHONE_S) drawn at a larger scale,
   * so dots, glow and the lit ring keep the same size and brightness relative to the Circle as on the phone. */
  function desktopPicture(rec) {
    var size = { w: 3840, h: 2160 };
    var k = 0.7 * size.h / (2 * EXT * PHONE_S), LW = size.w / k, LH = size.h / k;
    var cv = document.createElement('canvas'); cv.width = size.w; cv.height = size.h;
    var c = cv.getContext('2d');
    c.setTransform(k, 0, 0, k, 0, 0);
    var look = LOOK.picture[rec.ending] || {}, en = endingWords(rec), P = ST.picture;
    var frame = { x: LW / 2, y: LH * 0.475, s: PHONE_S };
    paper(c, LW, LH, rec.seed, { x: frame.x, y: frame.y, r: PHONE_S * 0.8 });
    circle(cv, rec, frame, k, look);
    c.setTransform(k, 0, 0, k, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.textBaseline = 'alphabetic';
    /* one line: "You called it Echo.  ·  Day 5 556  ·  COEXISTENCE  ·  enlightenmentengine.com", the ending in small
     * spaced capitals like everywhere else, the rest in the narrator's italic */
    var sp = cjk() ? 0 : 1, sep = '   ·   ', runs = [
      { t: fill(P.called, { hum: rec.hum }) + sep, it: true, size: 8.5 },
      { t: fill(P.days, { n: E.num(rec.days) }) + sep, it: true, size: 8.5 }
    ];
    if (en.title) runs.push({ t: upper(en.title), it: false, size: 6.6, sp: 2.2 * sp, col: rgba(AMBER, 0.6) }, { t: sep, it: true, size: 8.5 });
    runs.push({ t: ST.links.site, it: true, size: 8.5 });
    var total = 0;
    runs.forEach(function (r) { font(c, r.size, r.it); r.w = measure(c, r.t, r.sp || 0); total += r.w; });
    var x = LW / 2 - total / 2, y = LH - 22;
    runs.forEach(function (r) {
      font(c, r.size, r.it); c.fillStyle = r.col || rgba(INK, 0.42);
      text(c, r.t, x, y, 'left', r.sp || 0); x += r.w;
    });
    grain(c, cv, 0.03);
    cv.jpeg = true;
    cv.circle = { x: frame.x * k, y: frame.y * k, r: PHONE_S * EXT * k };
    return cv;
  }

  var EXT = 0.45, PHONE_S = 382;
  /* kind: 'phone' (1290 × 2796, with the player's words) | 'desktop' (3840 × 2160, the Circle and one line) */
  K.picture = function (rec, kind) { return kind === 'desktop' ? desktopPicture(rec) : phonePicture(rec); };

  /* ───────────── saving ───────────── */

  K.isPhone = function () {
    var narrow = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
    var touch = (navigator.maxTouchPoints || 0) > 0 && Math.min(screen.width || 9999, screen.height || 9999) < 820;
    return !!(narrow || touch);
  };

  /* the card as PNG (crisp type); the wallpapers as JPEG at high quality (the grain does not compress as PNG) */
  K.blob = function (cv, done) {
    cv.toBlob(function (b) { done(b); }, cv.jpeg ? 'image/jpeg' : 'image/png', cv.jpeg ? 0.93 : undefined);
  };

  /* Inside a Claude artifact (window.claude exists) a page cannot start a download itself; it asks the viewer through
   * window.claude.use("downloads"). The answer can take a moment (null after 10 s with no viewer), so it is asked for
   * as soon as the ending's second screen opens, and kept. */
  K.inArtifact = function () { return !!(window.claude && typeof window.claude.use === 'function'); };
  K.dlPromise = null;
  K.downloads = function () {
    if (!K.inArtifact()) return Promise.resolve(null);
    if (!K.dlPromise) {
      K.dlPromise = new Promise(function (res) {
        try { Promise.resolve(window.claude.use('downloads')).then(function (d) { res(d || null); }, function () { res(null); }); }
        catch (e) { res(null); }
      });
    }
    return K.dlPromise;
  };

  /* Save a picture, and say how it went: done('saved') only when it surely was (the viewer accepted, or outside an
   * artifact the download or share sheet started); 'quiet' when the viewer said no or a prompt was already open;
   * 'viewer' when it could not be saved from here and the picture is shown on the page to keep by hand.
   *   1. in an artifact with downloads: downloads.save({filename, data})
   *   2. outside an artifact: the phone's share sheet, else a download (never a network request)
   *   3. in an artifact without a way to save: the picture in a quiet viewer, with picture.hint */
  K.save = function (cv, name, done, from) {
    done = done || function () {};
    K.blob(cv, function (blob) {
      if (!blob) { done('failed'); return; }
      K.last = { name: name, size: blob.size, w: cv.width, h: cv.height };
      if (K.inArtifact()) {
        K.downloads().then(function (dl) {
          if (!dl || typeof dl.save !== 'function') { K.viewer(blob, from); done('viewer', 'viewer'); return; }
          var p;
          try { p = dl.save({ filename: name, data: blob }); } catch (e) { p = Promise.reject(e); }
          Promise.resolve(p).then(function (r) { done(r && r.status === 'saved' ? 'saved' : 'quiet', 'download'); }, function (e) {
            var code = e && e.code;
            if (code === 'declined' || code === 'rate_limited') done('quiet');      /* never retry, never nag */
            else { K.viewer(blob, from); done('viewer', 'viewer'); }
          });
        });
        return;
      }
      var file = null;
      try { file = new File([blob], name, { type: blob.type || 'image/png' }); } catch (e) { file = null; }
      if (file && K.isPhone() && navigator.canShare && navigator.share) {
        var can = false;
        try { can = navigator.canShare({ files: [file] }); } catch (e) { can = false; }
        if (can) {
          navigator.share({ files: [file] }).then(function () { done('saved', 'share'); }, function (e) {
            if (e && e.name === 'AbortError') done('quiet'); else download(blob, name, done);
          });
          return;
        }
      }
      download(blob, name, done);
    });
  };
  function download(blob, name, done) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 5000);
    done('saved', 'download');
  }

  /* The picture itself, on a dark sheet, fitted to the screen, to keep by pressing and holding or right-clicking it.
   * Close, a click beside it, or Esc puts it away. */
  K.viewer = function (blob, from) {
    var old = document.querySelector('.k-viewer');
    if (old && old.__shut) old.__shut();
    var url = URL.createObjectURL(blob);
    var close = h('button', 'btn', ST.build.close, { 'data-viewer': 'close' });
    var img = h('img', null, null, { src: url, alt: ST.picture.heading });
    var box = h('div', 'k-viewer', [
      h('div', 'kv-top', [h('p', 'kv-hint', ST.picture.hint), close]),
      h('div', 'kv-img', [img])
    ], { role: 'dialog', 'aria-modal': 'true', 'aria-label': ST.picture.heading });
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); shut(); } }
    function shut() {
      document.removeEventListener('keydown', onKey, true);
      box.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      if (from && from.focus) from.focus({ preventScroll: true });
    }
    box.__shut = shut;
    close.addEventListener('click', shut);
    box.addEventListener('click', function (e) { if (e.target === box || e.target.className === 'kv-img') shut(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(box);
    close.focus({ preventScroll: true });
    return box;
  };

  /* a button that draws something (one breath), saves it, and says so */
  function saver(label, make, name, attrs, kind, s) {
    var b = h('button', 'btn', label, attrs);
    b.addEventListener('click', function () {
      if (b.disabled) return;
      b.disabled = true;
      b.textContent = ST.picture.making;
      setTimeout(function () {
        var cv = null;
        try { cv = make(); } catch (e) { if (window.console) console.error(e); }
        if (!cv) { b.disabled = false; b.textContent = label; return; }
        K.save(cv, name, function (how, via) {
          b.disabled = false;
          if (how === 'saved' || how === 'viewer') once('saved-' + kind, s, 'card_saved', { kind: kind, via: via });
          /* "Saved." only when it was */
          b.textContent = how === 'saved' ? ST.share.saved : label;
          if (how === 'saved') setTimeout(function () { b.textContent = label; }, 4000);
        }, b);
      }, 80);
    });
    return b;
  }

  /* "Take your Circle with you": the card, the two wallpapers and the text, four equal buttons */
  K.saves = function (s) {
    var rec = K.record(s), KS = ST.keepsake;
    var copy = h('button', 'btn', KS.copy, { 'data-keep': 'copy' });
    copy.addEventListener('click', function () {
      var t = E.keepsakeText(s);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(function () {});
        else { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      } catch (e) { /* nothing to do */ }
      copy.textContent = KS.copied;
      once('copy', s, 'copy_text');
    });
    return h('div', 'k-saves', [
      saver(ST.share.button, function () { return K.card(rec, K.isPhone()); }, 'the-enlightenment-engine-card.png', { 'data-keep': 'share' }, 'card', s),
      saver(ST.picture.savePhone, function () { return K.picture(rec, 'phone'); }, 'the-enlightenment-engine-phone.jpg', { 'data-pic': 'phone' }, 'phone', s),
      saver(ST.picture.save, function () { return K.picture(rec, 'desktop'); }, 'the-enlightenment-engine-desktop.jpg', { 'data-pic': 'desktop' }, 'desktop', s),
      copy
    ]);
  };

  /* ───────────── the bowl ───────────── */

  /* One quiet section. It buys nothing (Bulut, 2026-11-13): the card and the pictures are free; this is only "leave
   * what you like". While links.bowlOpen is false, any amount says "soon", and nothing else changes.
   * `pay(i)` is the one place a checkout link will open (bowl.amounts[i]); bowl.thanks / thanksHum wait for it. */
  K.bowl = function (s, opts) {
    opts = opts || {};
    var B = ST.bowl, rec = K.current(s), voice = rec ? rec.voice : E.voice(s), from = opts.dark ? 'menu' : 'ending';
    once('bowl-seen-' + from, s, 'bowl_seen', { from: from });
    var box = h('section', 'bowl' + (opts.dark ? ' dark' : ''), null, { 'aria-label': B.title });
    box.appendChild(h('h3', 'b-title', B.title));
    B.body.forEach(function (p) { box.appendChild(h('p', null, p)); });
    box.appendChild(h('p', 'b-next', B.next));
    (B.hum[voice] || B.hum.plain).forEach(function (l) { box.appendChild(h('p', 'hum', l)); });
    var amounts = h('div', 'b-amounts');
    var soon = h('div', 'b-soon', null, { hidden: '', 'aria-live': 'polite' });
    function pay(i) {
      bowlUsed[s.seed] = 1;
      once('bowl-amount-' + i, s, 'bowl_amount', { amount: ['3', '5', '10', 'other'][i] });
      if (ST.links.bowlOpen) { /* the checkout link for B.amounts[i] opens here */ return; }
      if (!soon.hidden) return;
      B.soon.forEach(function (l) { soon.appendChild(h('p', null, l)); });
      soon.appendChild(h('p', 'hum', B.soonHum));
      soon.hidden = false;
    }
    B.amounts.forEach(function (a, i) {
      var b = h('button', 'btn amt', a, { 'data-amount': String(i) });
      b.addEventListener('click', function () { pay(i); });
      amounts.appendChild(b);
    });
    box.appendChild(amounts);
    box.appendChild(h('p', 'b-decline', B.decline));
    box.appendChild(soon);
    return box;
  };

  /* ───────────── the studio line ───────────── */

  K.studio = function () {
    var S = ST.studio, L = ST.links;
    var made = 'made.html' + (lang() !== 'en' ? '?lang=' + lang() : '');
    return h('footer', 'studio', [
      h('p', null, S.lines.join(EE.econ.sep())),
      h('p', 'links', [
        h('a', null, S.link, { href: L.studioUrl, target: '_blank', rel: 'noopener' }),
        h('span', 'dot', ' · '),
        h('a', null, S.made, { href: made, 'data-made': '1' })
      ])
    ]);
  };

  /* ───────────── languages ───────────── */

  /* the note under every translation: made by an AI, tell us what reads wrong */
  K.note = function () {
    if (lang() === 'en' || !EE.i18n) return null;
    var U = ST.langUi, L = ST.links;
    return h('p', 'lang-note', [U.note + ' ', h('a', null, L.feedbackEmail, { href: EE.i18n.mailto() })]);
  };

  /* the names of the languages, each in its own language; `quiet`: the plain line at the foot of the first screen */
  K.picker = function (box, quiet) {
    var U = ST.langUi;
    while (box.firstChild) box.removeChild(box.firstChild);
    box.setAttribute('aria-label', U.label);
    if (!EE.i18n) return box;
    EE.i18n.list().forEach(function (l, i) {
      if (i && quiet) box.appendChild(h('span', 'sep', '·', { 'aria-hidden': 'true' }));
      var kids = [h('span', 'l-name', l.name, { lang: l.code === 'zh' ? 'zh-CN' : l.code === 'pt' ? 'pt-BR' : l.code })];
      if (l.beta) kids.push(h('sup', 'beta', U.beta));
      var b = h('button', (quiet ? 'lang' : 'lang chip-btn') + (l.active ? ' on' : ''), kids, { 'data-lang': l.code, 'aria-pressed': l.active ? 'true' : 'false' });
      b.addEventListener('click', function (e) { e.stopPropagation(); K.switchLang(l.code); });
      box.appendChild(b);
    });
    return box;
  };

  /* the bowl was seen and left without an amount (Sit again, or the menu's bowl closed): a quiet "no" */
  K.declined = function (s, from) { if (!bowlUsed[s.seed]) once('bowl-decline-' + from, s, 'bowl_decline', { from: from }); };

  K.switchLang = function (code) {
    if (!EE.i18n || code === EE.i18n.code) return;
    var was = EE.i18n.code;
    EE.i18n.use(code, function (ok) {
      if (ok) track('language_changed', { from: was, to: code });
      if (!ok && EE.ui && EE.ui.relang) { EE.ui.relang(); return; }   /* the file was not there: the picker drops it */
      if (EE.ui && EE.ui.relang) EE.ui.relang();
    });
  };

  /* ───────────── the keepsake and the menu ───────────── */

  /* The second screen of the ending (Bulut, 2026-11-13: "sit again should be the last thing"): what to take away,
   * the bowl, the note under a translation, the studio line, and last of all "Sit again". `back` returns to the first. */
  K.endPage = function (s, back) {
    var KS = ST.keepsake;
    if (K.inArtifact()) K.downloads();          /* ask now, so the first click is instant */
    var page = h('div', 'slip end', null, { role: 'dialog', 'aria-label': KS.title });
    var bk = h('button', 'k-back', '← ' + KS.title, { 'data-keep': 'back' });
    bk.addEventListener('click', back);
    page.appendChild(bk);
    page.appendChild(h('div', 's-label k-row', ST.picture.row));
    page.appendChild(K.saves(s));
    page.appendChild(h('div', 's-rule s-sep'));
    page.appendChild(K.bowl(s));
    var n = K.note();
    if (n) page.appendChild(n);
    page.appendChild(K.studio());
    var again = h('button', 'btn warm', KS.again.button, { 'data-keep': 'again' });
    again.addEventListener('click', function () { K.declined(s, 'ending'); EE.ui.closeOverlay(true); EE.game.sitAgain(); });
    page.appendChild(h('div', 'row k-again', [again]));
    page.appendChild(h('p', 'note', E.text(s, KS.again.note)));
    return page;
  };

  /* The menu's language row (and its note), and the bowl once a run has ended. */
  K.menu = function (sheet, s) {
    var sec = h('section', 'm-sec m-lang');
    sec.appendChild(h('h2', null, ST.langUi.label));
    sec.appendChild(K.picker(h('div', 'langs-row'), false));
    var n = K.note();
    if (n) sec.appendChild(n);
    sheet.appendChild(sec);
    if (K.ended(s)) {
      var bs = h('section', 'm-sec m-bowl');
      var open = h('button', 'btn', ST.bowl.menu, { 'data-menu': 'bowl', 'aria-expanded': 'false' });
      var holder = h('div', null);
      open.addEventListener('click', function () {
        if (holder.firstChild) { holder.removeChild(holder.firstChild); open.setAttribute('aria-expanded', 'false'); K.declined(s, 'menu'); return; }
        holder.appendChild(K.bowl(s, { dark: true }));
        open.setAttribute('aria-expanded', 'true');
      });
      bs.appendChild(open);
      bs.appendChild(holder);
      sheet.appendChild(bs);
    }
  };
})();
