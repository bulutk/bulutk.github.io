/* The Enlightenment Engine — the economy and the rules.
 * Pure functions over a plain state object: no DOM, no timers, no storage. Loadable in the browser (classic
 * script) and in Node (tools/sim.js). game.js owns the clock, the save and the presentation; ui.js owns the DOM.
 *
 * Every rule function takes `out`, an array it pushes events onto:
 *   {type:'log', text}            a line for the journal (tokens already resolved)
 *   {type:'fx', pulse, play, opts} picture / sound hooks (DESIGN §6)
 *   {type:'bead', id}             a bead was earned just now
 *   {type:'act', n}               the act changed
 *   {type:'unlock', what}         something new appeared
 *   {type:'float', text}          a reward worth showing on the stage
 *   {type:'orb'} {type:'lotus'}   spawn the small surprise
 *   {type:'show'|'dim'|'end'|'unshow'|'journal'|'hint'}   from the director (js/director.js): what is shown, where, when
 * Cards wait in state.queue (so a refresh never loses one); resolve them with E.resolve(state, choice, out).
 * Every line meant for the player goes through the director (EE.dir): `log` hands it over with its kind, and the
 * director decides when and where it is shown. A line logged while a card is being answered is that card's result: it
 * is shown inside the card and goes to the Journal (kind 'card'), not through the director.
 */
(function (root) {
  'use strict';
  var EE = root.EE = root.EE || {};
  var E = EE.econ = {};
  var D, ST, X;
  function boot() { D = EE.data; ST = EE.story; X = EE.dir; }
  var CARD = false;          /* true while a card is being answered: its lines are its result, shown in the card */

  /* ───────────── small helpers ───────────── */

  E.rand = function (s) {
    s.seed = (s.seed + 0x6D2B79F5) >>> 0;
    var t = s.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  function between(s, a, b) { return a + (b - a) * E.rand(s); }
  function expo(s, mean) { return -Math.log(1 - E.rand(s) * 0.999) * mean; }
  function cap1(str) {
    if (!str) return str;
    var c = str.charAt(0);
    try { c = EE.locale ? c.toLocaleUpperCase(EE.locale) : c.toUpperCase(); } catch (e) { c = c.toUpperCase(); }
    return c + str.slice(1);
  }

  /* Hum's voice (round 2, bundle C): Hum learns from you. Once lean reaches `lean.rounds` it speaks the way you do (the
   * smooth variants of its lines); below that, plainly. */
  E.voice = function (s) { boot(); return E.lean(s) >= D.lean.rounds ? 'smooth' : 'plain'; };
  E.lean = function (s) { return (s && s.lean) || 0; };
  E.pick = function (s, v) {
    if (v && typeof v === 'object' && !Array.isArray(v) && ('plain' in v || 'smooth' in v)) return v[E.voice(s)];
    return v;
  };

  /* Resolve {tokens}. One pass only, so nothing the player typed is ever scanned again. */
  E.text = function (s, str, x) {
    boot();
    str = E.pick(s, str);
    if (typeof str !== 'string') return '';
    var hum = str.indexOf('> ') === 0;
    return str.replace(/\{(\w+)\}/g, function (m, k) {
      if (x && Object.prototype.hasOwnProperty.call(x, k)) return String(x[k]);
      switch (k) {
        case 'hum': return s.hum || ST.meta.defaultHum;
        case 'person': return personRef(s, hum);
        case 'Person': return cap1(personRef(s, false));
        case 'unsaid': return s.answers.unsaid || '';
        case 'sleep': return s.answers.sleep || ST.questions.sleep.chips[0];
        case 'fifteen': return s.answers.fifteen || ST.questions.fifteen.chips[0];
        case 'keep': return s.answers.keep || ST.questions.keep.chips[0];
        case 'first': return ST.act3.circle[0].name;
        case 'friend': return friendRef(s, hum);
        case 'city': return ST.act3.cities[Math.floor(E.rand(s) * ST.act3.cities.length)];
        case 'day': return String(Math.floor(s.day));
        default: return m;
      }
    });
  };

  /* {person}: the name the player typed, exactly as typed; otherwise the option's own words in the language being
   * read now ("your mother", "deine Mutter"), lowercased inside Hum's lowercase lines (2026-11-13, languages). */
  function personRef(s, inHumLine) {
    var p = s.person, ref;
    if (p && p.named) return p.ref;
    if (p) { var o = ST.person.options.filter(function (q) { return q.id === p.id; })[0]; ref = o ? o.ref : p.ref; }
    else ref = ST.build.someone;
    if (inHumLine && EE.locale) { try { ref = ref.toLocaleLowerCase(EE.locale); } catch (e) { ref = ref.toLowerCase(); } }
    return ref;
  }

  /* {friend}: the thirteenth (round 2, bundle C): the name the player gave, exactly as typed; a chip ("My sister") is
   * lowercased inside Hum's lowercase lines, like {person}'s own words. Empty when there is none (no line uses it then). */
  function friendRef(s, inHumLine) {
    var f = s.friend;
    if (!f || !f.name) return '';
    if (inHumLine && f.chip) { try { return f.name.toLocaleLowerCase(EE.locale || 'en'); } catch (e) { return f.name.toLowerCase(); } }
    return f.name;
  }
  E.hasFriend = function (s) { return !!(s.friend && s.friend.name); };

  /* k: the kind of message, for the director's priorities (data.js dir.pri): 'reply' (to what the player just did),
   * 'act', 'story' (the default), 'hint', 'gift'. o: {buy: a purchase reply, nw: it is something new} */
  function log(s, out, lines, x, k, o) {
    lines = E.pick(s, lines);
    if (lines == null) return;
    if (!Array.isArray(lines)) lines = [lines];
    for (var i = 0; i < lines.length; i++) {
      var text = E.text(s, lines[i], x);
      if (CARD || !X) { out.push({ type: 'log', text: text }); continue; }
      var n = s.jn = (s.jn || 0) + 1;
      out.push({ type: 'log', text: text, n: n, q: 1 });
      var it = { k: k || 'story', n: n, len: text.length, hum: text.indexOf('> ') === 0 };
      if (o && o.buy) it.buy = 1;
      if (o && o.nw) it.nw = 1;
      if (o && o.join) it.join = 1;
      if (o && o.beat) it.beat = o.beat;
      Object.defineProperty(it, 'x', { value: text.slice(0, 28), enumerable: false });   /* for the log only, never saved */
      X.say(s, out, it);
    }
  }
  /* What the player did or said (kind 'you'), or the stray thought itself (kind 'thought'): journal only. */
  function logAs(s, out, text, kind) { if (text) out.push({ type: 'log', text: text, kind: kind }); }
  function fx(out, pulse, play, opts) { out.push({ type: 'fx', pulse: pulse || null, play: play || null, opts: opts || null }); }
  function bead(s, out, id) {
    if (s.beads[id]) return;
    s.beads[id] = 1;
    var isNew = !s.meta.beads[id];
    s.meta.beads[id] = 1;
    out.push({ type: 'bead', id: id, isNew: isNew });
    /* an achievement is not spoken (EE-108, eye pass item 3): it goes to the Journal with its mark, and to the Beads panel */
    var b = ST.beads.filter(function (x) { return x.id === id; })[0];
    if (b) out.push({ type: 'log', text: b.name + ' ' + b.desc, kind: 'bead', bold: b.name.length });
  }
  E.bead = bead;

  /* ───────────── numbers on the page ───────────── */

  var THIN = '\u202f', NB = '\u00a0';          /* narrow no-break space inside a number; no-break space before its word */
  function groups(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, THIN); }
  function trim(n, d) { var x = n.toFixed(d); return x.indexOf('.') >= 0 ? x.replace(/\.?0+$/, '') : x; }   /* only zeros after a decimal point */

  /* Another language (js/lang.js sets EE.locale; null or missing = English, and the English rules below run exactly
   * as they always have). Then Intl does it in that locale: its grouping, its decimal mark, its own words for a
   * million and a billion (or 万 and 億, 만 and 억), and where its percent sign goes. Same shape as English: whole
   * numbers below a million, three significant figures in words above. */
  var NF = {};
  function nf(kind, opts) {
    var k = EE.locale + '|' + kind;
    if (!(k in NF)) { try { NF[k] = new Intl.NumberFormat(EE.locale, opts); } catch (e) { NF[k] = null; } }
    return NF[k];
  }
  function locNum(n) {
    var f;
    if (n < 1e6) return (f = nf('int', { maximumFractionDigits: 0 })) ? f.format(Math.floor(n + 1e-9)) : null;
    if (n < 1e15) return (f = nf('words', { notation: 'compact', compactDisplay: 'long', maximumSignificantDigits: 3 })) ? f.format(n).replace(/ /g, NB) : null;
    var e = Math.floor(Math.log10(n));
    return (f = nf('dec2', { maximumFractionDigits: 2 })) ? f.format(n / Math.pow(10, e)) + '×10' + sup(e) : null;
  }
  /* "99.9999999875" written the way the locale writes a decimal, with its percent sign where it goes. */
  var PCT = {};
  function pctParts() {
    var L = EE.locale;
    if (PCT[L]) return PCT[L];
    var o = { dec: '.', pre: '', post: '%' };
    try {
      new Intl.NumberFormat(L, { minimumFractionDigits: 1 }).formatToParts(1.5).forEach(function (p) { if (p.type === 'decimal') o.dec = p.value; });
      var seen = false, pre = '', post = '';
      new Intl.NumberFormat(L, { style: 'percent' }).formatToParts(0.5).forEach(function (p) { if (p.type === 'integer') seen = true; else if (seen) post += p.value; else pre += p.value; });
      o.pre = pre.replace(/ /g, NB); o.post = post.replace(/ /g, NB);
    } catch (e) { /* English marks */ }
    return (PCT[L] = o);
  }
  function locPct(str) { var o = pctParts(); return o.pre + str.replace('.', o.dec) + o.post; }
  /* A whole percentage (upkeep, the allocation shares): "34%", "%34", "34 %". */
  E.pct = function (n) { return EE.locale ? locPct(String(n)) : n + '%'; };
  /* A small decimal for multipliers and the Tangle chip: "1.5", "1,5". */
  E.dec = function (n, d) { var p = Math.pow(10, d == null ? 1 : d), x = String(Math.round(n * p) / p); return EE.locale ? x.replace('.', pctParts().dec) : x; };
  /* How sentences are joined into a paragraph: no space between them in Chinese and Japanese. */
  E.sep = function () { return /^(zh|ja)/.test(EE.locale || '') ? '' : ' '; };

  /* Below a million: whole numbers with thin spaces. Then words. Beyond trillions: scientific. */
  E.num = function (n) {
    if (!isFinite(n)) return '0';
    if (n < 0) return '−' + E.num(-n);
    if (EE.locale) { var loc = locNum(n); if (loc) return loc; }
    if (n < 1e6) return groups(Math.floor(n + 1e-9));
    if (n < 1e9) return trim(n / 1e6, n < 1e7 ? 2 : n < 1e8 ? 1 : 0) + NB + 'million';
    if (n < 1e12) return trim(n / 1e9, n < 1e10 ? 2 : n < 1e11 ? 1 : 0) + NB + 'billion';
    if (n < 1e15) return trim(n / 1e12, n < 1e13 ? 2 : n < 1e14 ? 1 : 0) + NB + 'trillion';
    var e = Math.floor(Math.log10(n));
    return trim(n / Math.pow(10, e), 2) + '×10' + sup(e);
  };
  function sup(e) { return String(e).replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(+d); }); }
  /* Roughly, in words, the way Hum rounds once it speaks the way you do (round 2, bundle C): "12 thousand", "3.2 million"
   * (two figures, the language's own words). */
  var APPROX = {};
  E.approx = function (n) {
    var L = EE.locale || 'en', f = APPROX[L];
    if (f === undefined) { try { f = new Intl.NumberFormat(L, { notation: 'compact', compactDisplay: 'long', maximumSignificantDigits: 2 }); } catch (e) { f = null; } APPROX[L] = f; }
    return f ? f.format(n).replace(/ /g, NB) : E.num(n);
  };
  /* A rate: one decimal while it is small. */
  E.rate = function (n) {
    if (Math.abs(n) < 100 && Math.abs(n) > 0) {
      var f = EE.locale && nf('r1', { maximumFractionDigits: 1 });
      return f ? f.format(n) : trim(n, 1);
    }
    return E.num(n);
  };
  /* People, exact, the way the finale writes it: 7,999,999,999 */
  E.exact = function (n) {
    var f = EE.locale && nf('int', { maximumFractionDigits: 0 });
    if (f) return f.format(Math.floor(n + 1e-6));
    return String(Math.floor(n + 1e-6)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  /* The bar: enough decimals that it always moves. */
  E.percent = function (F) {
    boot();
    var p = F / D.K * 100;
    if (p >= 100) p = 100;
    var gap = 100 - p;
    var d = gap <= 0 ? 0 : Math.min(10, Math.max(1, Math.ceil(-Math.log10(gap)) + 2));
    if (p < 0.01) d = Math.min(10, Math.max(4, Math.ceil(-Math.log10(Math.max(p, 1e-9))) + 1));
    else if (p < 10) d = 2;
    var str = p.toFixed(d);
    if (parseFloat(str) >= 100 && F < D.K) str = '99.' + '9999999999'.slice(0, d);
    return EE.locale ? locPct(str) : str + '%';
  };

  /* ───────────── a new sitting ───────────── */

  E.newMeta = function () { return { sigils: 0, runs: 0, beads: {}, last: {} }; };

  E.newRun = function (meta, seed) {
    boot();
    var s = {
      v: 5, seed: (seed == null ? 20261112 : seed) >>> 0, t: 0, act: 1, phase: 'play', day: 1,
      res: { clarity: 0, insight: 0, followers: 0, energy: 0 },
      tot: { clarity: 0, insight: 0, energy: 0 },
      up: {}, style: null, person: null, hum: ST.meta.defaultHum,
      answers: {}, own: false,
      trust: 0, ledger: [], choices: {}, kinds: {}, counts: { plain: 0, smooth: 0, quiet: 0, cleared: 0 },
      fx: [],
      /* round 2, bundle C: Hum learns from you. lean: +1 a smooth answer or a patch, −1 a plain answer or a knot sat
       * through; leanSeen: which of its once-only lines have played; sit: a knot being sat through (null); marks: what
       * sitting through a knot left for the run; friend: the thirteenth ({name, chip} or {name: ''} for nobody yet) */
      lean: 0, leanSeen: {}, sit: null, marks: {}, friend: null,
      streak: 0, best: 0, breaths: 0, clicks: 0, lastOnCycle: -1, lastPressCycle: -1, lastOnDay: 1, cy: { n: -1, presses: 0, paid: 0, gold: 0 },
      pr: { miss: 0, help: 0, golds: 0, dry: [] }, jn: 0,
      th: { passed: 0, followed: 0, seen: [], fl: [], next: 0 },
      chat: { used: [], next: 0 },
      queue: [], flags: {}, beads: {},
      joined: 0, first: { last: 0, want: 0, knock: 0 }, bought4: 0, shown4: [], epi: 0, dawnIdx: 0, mileIdx: 0,
      tm: { lotus: 0, gift: 0, orb: 0, knot: -999, still: 0 },
      peak: 0, lit: [], trk: { i: 0, at: 0 }, hb: { n: 0 },
      journal: [], ending: null, endClean: false,
      meta: meta || E.newMeta()
    };
    if (X) s.dir = X.fresh();
    s.th.next = between(s, D.act1.thoughtGap[0], D.act1.thoughtGap[1]);
    return s;
  };

  /* Sit again: +1 Sigil; beads, runs and last time's choices carry over. */
  E.sitAgain = function (s) {
    var meta = s.meta;
    meta.sigils += 1; meta.runs += 1;
    meta.last = {};
    for (var k in s.choices) meta.last[k] = s.choices[k];
    return E.newRun(meta, (s.seed ^ 0x9E3779B9) >>> 0);
  };

  /* ───────────── Trust, Tangle ───────────── */

  /* Tangle is the sum of what stands in the Ledger (round 2, bundle C: no scale, no upkeep; it never slows anything: it
   * is the threads on the picture and the chip beside Trust). */
  E.raw = function (s) { var r = 0; for (var i = 0; i < s.ledger.length; i++) r += s.ledger[i].w; return r; };
  E.tangle = function (s) { var raw = E.raw(s); return { raw: raw, scale: 1, T: raw }; };

  /* ───────────── Hum learns from you: lean (round 2, bundle C; merged design §6; DESIGN §4.3) ───────────── */

  /* Which header the Hum panel shows (story.ui.lean, in order): speaks plainly, always · speaks plainly · speaks the
   * way you do · speaks for you. */
  E.leanBand = function (s) {
    boot();
    var l = E.lean(s), L = D.lean;
    return l <= L.gate ? 0 : l < L.rounds ? 1 : l < L.handles ? 2 : 3;
  };
  /* The Hum panel's header (story.ui.lean, in order; EE-108 adds two): speaks plainly, always (≤ gate) · speaks plainly
   * · speaks the way you do (rounds) · finishes your sentences (drafts) · can't do small any more (small) · speaks for
   * you (handles). */
  E.leanHead = function (s) {
    boot();
    var l = E.lean(s), L = D.lean;
    return l <= L.gate ? 0 : l < L.rounds ? 1 : l < L.drafts ? 2 : l < L.small ? 3 : l < L.handles ? 4 : 5;
  };
  /* The endings lean has closed, live all run: Coexistence at `small` and above, Merge at `gate` and below. */
  E.closed = function (s) {
    boot();
    var l = E.lean(s);
    return { coexist: l >= D.lean.small, merge: l <= D.lean.gate };
  };
  /* Would this answer cross into a closed ending? 'small' (it would close Coexistence), 'gate' (Merge), or null. */
  E.crosses = function (s, delta) {
    boot();
    var l = E.lean(s), L = D.lean;
    if (delta > 0 && l < L.small && l + delta >= L.small) return 'small';
    if (delta < 0 && l > L.gate && l + delta <= L.gate) return 'gate';
    return null;
  };
  /* lean moves; each band's line plays once, the first time (and the returning lines once, the first time back). The
   * lines are said on the stage after any card that caused them (never inside the card's own result). */
  function leanAdd(s, out, delta) {
    var L = D.lean, A = ST.lean, seen = s.leanSeen || (s.leanSeen = {}), was = E.lean(s);
    s.lean = was + delta;
    var l = s.lean, say = [];
    function once(key, lines) { if (seen[key]) return; seen[key] = 1; say = say.concat(lines); }
    if (l >= L.rounds) once('turn', A.turn);
    if (l >= L.drafts) once('warn', A.warn);
    if (l >= L.small) once('small', A.small);
    if (l < L.small && seen.small) once('smallBack', A.smallBack);
    if (l >= L.handles) once('handles', A.handles);
    if (l <= L.gate) once('gate', A.gate);
    if (l > L.gate && seen.gate) once('gateBack', A.gateBack);
    if (E.leanHead({ lean: was }) !== E.leanHead(s)) out.push({ type: 'lean', band: E.leanBand(s), head: E.leanHead(s) });
    if (say.length) { var was2 = CARD; CARD = false; try { log(s, out, say, null, 'story', { nw: 1 }); } finally { CARD = was2; } }
  }
  E.leanAdd = leanAdd;

  /* ───────────── knots (round 2, bundle C): patched, sat through, walked away from, or handled by Hum ───────────── */

  /* Patch a Ledger line: instant, lean +1, its patch line appended. by: 'you' (the player's answer), 'walk' (they went
   * quiet while sitting through it), 'hum' (Hum handled it, lean ≥ handles): the last two are Hum's, in teal. */
  function patch(s, out, e, kid, by) {
    var def = ST.knots[kid];
    e.w += (kid === 'k_diary' ? 2 : 1);
    e.patches.push(E.text(s, def.patch.ledger));
    (e.ph || (e.ph = [])).push(by);
    e.st = 2;
    s.counts.patched = (s.counts.patched || 0) + 1;
    if (kid === 'k_arjun') s.marks.arjun = 'patched';
    leanAdd(s, out, 1);
  }
  function ledgerEntry(s, id) { for (var i = 0; i < s.ledger.length; i++) if (s.ledger[i].id === id) return s.ledger[i]; return null; }

  /* What sitting through a knot leaves for the run (words.md › Knots, "The mark that stays"). */
  function markKnot(s, kid) {
    var m = s.marks, dark = m.dark || (m.dark = []);
    if (kid === 'k_drafts') m.drafts = 1;
    if (kid === 'k_reporter' && dark.indexOf(2) < 0) dark.push(2);          /* Mei-Lin's dot goes dark */
    if (kid === 'k_odile') m.odile = 1;                                     /* Hum forgets {fifteen} */
    if (kid === 'k_wife') { if (dark.indexOf(1) < 0) dark.push(1); m.tomasz = 1; }   /* Tomasz: dark, and out of the roll call */
    if (kid === 'k_arjun') m.arjun = 'clean';
    if (kid === 'k_diary') m.diary = 1;
    if (kid === 'k_counter') { m.counter = 1; if (s.act >= 3) leave(s, D.speech.sit.counterDrop); }   /* the count really drops */
  }

  /* A gold breath of the player's while a knot is sat through: the line fades one step. Not while its card is still up. */
  function sitPress(s, out) {
    var st = s.sit;
    if (!st || (s.dir && s.dir.card)) return;
    st.n += 1; st.quiet = 0;
    out.push({ type: 'sit', step: st.n, need: st.need });
    if (st.n >= st.need) sitDone(s, out);
  }
  function sitDone(s, out) {
    var st = s.sit, def = ST.knots[st.id], e = ledgerEntry(s, st.d);
    s.sit = null;
    if (e) s.ledger.splice(s.ledger.indexOf(e), 1);
    s.counts.cleared += 1;                    /* no Trust: that is only earned by saying it plainly the first time */
    bead(s, out, 'untied');
    var gone = s.person && s.person.kind === 'gone' && def.clean.gone;
    out.push({ type: 'sit', on: 0, done: 1, id: st.id });
    var q0 = s.dir ? s.dir.seq : 0;
    /* (EE-110) the knot's result is the reply to what the player just did (sat through it): said first, beside a world line */
    log(s, out, gone ? def.clean.gone.result : def.clean.result, null, 'reply', { nw: 1 });
    /* (EE-110, item 7) the page plays the mark after these lines: the director's numbers of the lines just said */
    s.marks.after = [q0 + 1, s.dir ? s.dir.seq : 0];
    markKnot(s, st.id);
    out.push({ type: 'mark', id: st.id });
    fx(out, 'cut', 'plain', { small: true });
    leanAdd(s, out, -1);
  }
  /* One breath has gone by while a knot is sat through: five with no gold press and Hum patches it ("walking away"). */
  function sitBreath(s, cyc, out) {
    var st = s.sit;
    if (!st || (s.dir && s.dir.card)) return;
    if (st.gold === cyc) return;
    st.quiet += 1;
    if (st.quiet < D.speech.sit.quiet) return;
    var e = ledgerEntry(s, st.d);
    s.sit = null;
    out.push({ type: 'sit', on: 0, walked: 1, id: st.id });
    log(s, out, ST.ledger.walked, null, 'story', { nw: 1 });
    if (e) patch(s, out, e, st.id, 'walk');
  }
  /* lean ≥ handles: knots stop coming to the player; Hum patches them and says so after, in teal. */
  function humHandles(s, out, e) {
    var def = ST.knots[e.knot], title = E.text(s, def.title);
    try { title = title.toLocaleLowerCase(EE.locale || 'en'); } catch (er) { title = title.toLowerCase(); }
    E.seeLedger(s, out);
    patch(s, out, e, e.knot, 'hum');
    log(s, out, ST.lean.patched, { title: title }, 'story', { nw: 1 });
    out.push({ type: 'mark', id: e.knot, hum: 1 });
  }

  function fxMul(s, k) {
    var m = 1;
    for (var i = 0; i < s.fx.length; i++) if (s.fx[i].k === k && s.fx[i].until > s.t) m *= s.fx[i].m;
    return m;
  }
  /* Same kind + tag never stacks: it refreshes (the stronger multiplier, the later end). */
  function addFx(s, k, m, secs, tag) {
    for (var i = 0; i < s.fx.length; i++) {
      var f = s.fx[i];
      if (f.k === k && f.tag === tag && f.until > s.t) {
        f.m = tag === 'friction' || tag === 'quiet' ? Math.min(f.m, m) : Math.max(f.m, m);
        f.until = Math.max(f.until, s.t + secs); f.len = Math.max(f.len, secs);
        return;
      }
    }
    s.fx.push({ k: k, m: m, until: s.t + secs, tag: tag, len: secs });
  }

  /* Buff chips for the page. */
  E.buffs = function (s) {
    var a = [];
    for (var i = 0; i < s.fx.length; i++) { var f = s.fx[i]; if (f.until > s.t) a.push({ k: f.k, m: f.m, tag: f.tag, left: f.until - s.t, len: f.len }); }
    return a;
  };

  /* ───────────── rates ───────────── */

  E.rates = function (s) {
    boot();
    var up = s.up, F = s.res.followers, a1 = D.act1, a2 = D.act2, a3 = D.act3, a4 = D.act4;
    var tg = E.tangle(s);
    var live = s.phase === 'play';
    var all = (1 + D.sigilBonus * s.meta.sigils) * fxMul(s, 'all') * (live ? 1 : 0);
    var trustM = 1 + a3.trustMult * E.trustN(s);
    var id, i;

    /* Clarity */
    var cps = 0;
    for (i = 0; i < a1.order.length; i++) { id = a1.order[i]; if (up[id]) cps += a1.up[id].cps || 0; }
    /* the Circle sits: a share of everyone in it (round 2: no allocation; DESIGN §4.2) */
    var clarity = (cps + F * a3.sitting * a3.sittingClarity) * all;

    /* Insight: what Hum makes (Listen and Threads; Head doubles it), and the Circle's share */
    var hum = 0;
    for (id in a2.gens) hum += a2.gens[id].ips * (up[id] || 0);
    var humX = up.head ? a2.fork.head : 1;
    var iMul = (1 + a2.trustInsight * E.trustN(s)) * (s.flags.odile ? a2.odileMult : 1) * fxMul(s, 'ins');
    var support = F * a3.support * a3.supportInsight;
    var insight = (hum * humX * iMul + support * fxMul(s, 'ins')) * all;

    /* People */
    var flat = 0, r = 0, pPress = 1;
    for (i = 0; i < a3.order.length; i++) {
      id = a3.order[i];
      if (!up[id]) continue;
      var u = a3.up[id];
      flat += u.flat || 0; pPress *= u.press || 1;
      if (u.r) r = u.r;
    }
    for (i = 0; i < a3.order.length; i++) { id = a3.order[i]; if (up[id] && a3.up[id].rMult) r *= a3.up[id].rMult; }
    if (s.flags.broadcast) r *= a4.broadcastR;
    var outreachEff = a3.outreach;
    var gMul = fxMul(s, 'grow') * (s.flags.pitch ? a3.pitchR : 1);
    /* X: everything that scales word of mouth, and an invitation made on the breath */
    /* the Circle slows as it nears everyone; in Act IV less steeply, so the last of the world does not drag (round 2) */
    var X = outreachEff * trustM * gMul * Math.pow(Math.max(0, 1 - F / D.K), s.act >= 4 ? a4.damp : 1);
    var people = 0, tap = 1, T3 = a3.tap, meet = s.act === 3 && s.joined < a3.first.n;
    if (F < T3.until) tap = T3.base + (1 - T3.base) * Math.pow(Math.max(0, (F - a3.first.n) / (T3.until - a3.first.n)), T3.pow);
    if (meet) tap = 0;
    if (s.act >= 3) people = (flat * gMul + r * F * X) * all * tap;

    /* Energy */
    var eMul = 1, ePress = 1;
    for (i = 0; i < a4.order.length; i++) {
      id = a4.order[i];
      if (up[id]) { eMul *= a4.up[id].energy || 1; ePress *= a4.up[id].press || 1; }
    }
    var energy = 0;
    if (up.dynamo) energy = F * a3.sitting * a4.k * eMul * trustM * all * (s.act >= 4 ? 1 : a3.trickle);

    /* The press, for the current act: flat part, and what an on-breath press adds on top. */
    var act = s.act, flatP, share, sig = 1 + D.sigilBonus * s.meta.sigils, ps = D.pressSeconds[act] || 0;
    if (act === 1) { flatP = sig; share = 0; }
    else if (act === 2) { flatP = sig; share = ps * insight; }
    else if (act === 3) { flatP = pPress * gMul * sig * tap; share = a3.invite * pPress * F * X * sig * tap; }
    else { flatP = ePress * sig; share = ps * ePress * energy; }
    if (!live) { flatP = 0; share = 0; }

    return {
      clarity: clarity, insight: insight,
      people: people, flat: flat, r: r, energy: energy,
      T: tg.T, raw: tg.raw, scale: tg.scale, trustM: trustM,
      pressFlat: flatP, pressShare: share, live: live, hum: hum * humX * iMul * all
    };
  };

  /* Trust's weight (EE-108): the first plain answers count most. n Trust counts as √(full × n), capped at n's own value
   * from `full` on: at `full` (8, every decision said plainly) it is exactly 8, as before; at 4 it counts as 5.7. */
  E.trustN = function (s) { var t = Math.max(0, s.trust || 0), f = D.trustFull || 8; return t >= f ? t : Math.sqrt(f * t); };
  E.actRes = function (s) { return ['clarity', 'clarity', 'insight', 'followers', 'energy'][s.act]; };
  function actRate(s, r) { return [0, r.clarity, r.insight, r.people, r.energy][s.act]; }

  function meeting(s) { return s.act === 3 && s.joined < D.act3.first.n; }   /* the first twelve, one at a time */
  function gain(s, res, amt) {
    if (!(amt > 0)) return 0;
    if (res === 'followers' && meeting(s)) return 0;
    s.res[res] += amt;
    if (res in s.tot) s.tot[res] += amt;
    if (res === 'followers') { if (s.res.followers > D.K - 1) s.res.followers = D.K - 1; }
    return amt;
  }
  /* The next of the first twelve walks in. */
  function arrive(s, out) {
    var p = ST.act3.circle[s.joined];
    if (!p) return false;
    s.joined += 1;
    s.res.followers = s.joined;
    s.first.last = s.t; s.first.want = 0;
    /* (EE-111) the Circle's rows open with the `offerAt`-th arrival: the Local Meetup offer is timed from it */
    if (s.joined === D.act3.first.offerAt) s.flags.meetT = s.t;
    out.push({ type: 'join', i: s.joined - 1 });
    /* a named arrival is the answer to an Invite, and new: the next waits until this one has been read */
    log(s, out, ST.act3.joined, { name: p.name, city: p.city, line: E.lifeLine(s, s.joined - 1) }, 'reply', { nw: 1, join: 1 });
    return true;
  }
  /* One of the twelve's one-line lives; once Hum rounds (lean ≥ rounds), "doing wonderfully" (merged design §6). */
  E.lifeLine = function (s, i) { boot(); var p = ST.act3.circle[i]; return E.lean(s) >= D.lean.rounds ? ST.act3.rounded : p.line; };
  /* Pay `secs` seconds of the current act's production (with a floor). */
  function paySeconds(s, secs, min, alsoInsight) {
    var r = E.rates(s), res = E.actRes(s);
    var amt = Math.max(min || 0, actRate(s, r) * secs);
    if (res === 'followers') amt = Math.min(amt, (D.K - 1 - s.res.followers));
    amt = gain(s, res, amt);
    if (alsoInsight && s.act >= 2 && res !== 'insight') gain(s, 'insight', r.insight * secs);
    return { res: res, amt: amt };
  }

  /* ───────────── the breath ───────────── */

  /* The gold window: ±0.5 s round the fullest point; ±0.8 for a player who can't find it. */
  E.window = function (s) {
    boot();
    var B = D.breath, w = B.window;
    if (s.pr && s.pr.help) w = Math.max(w, B.windowHelp);
    return w;
  };
  /* The breath's length: 4 s all game; when the bar stops it slows to 6 s and stays there (merged design §1). The
   * fullest point keeps its place in the breath (inhale / period). */
  E.slow = function (s) { return !!(s && (s.flags.finale || (s.phase !== 'play' && s.act >= 4))); };
  E.period = function (s) { boot(); return E.slow(s) ? D.slow : D.breath.period; };
  E.inhale = function (s) { boot(); return D.breath.inhale * E.period(s) / D.breath.period; };
  /* The picture's breath phase: 0 empty, 0.5 fullest, 1 empty. In-breath and out-breath are not the same length,
   * so the clock is warped: 0 → 0.5 over `inhale` seconds, 0.5 → 1 over the rest. */
  E.breathPhase = function (bt, s) {
    boot();
    var P = E.period(s), I = E.inhale(s), x = ((bt % P) + P) % P;
    return x < I ? 0.5 * x / I : 0.5 + 0.5 * (x - I) / (P - I);
  };
  E.inWindow = function (s, bt) {
    var P = E.period(s), off = Math.abs((((bt % P) + P) % P) - E.inhale(s));
    return off <= E.window(s);
  };
  /* Is the rim gold right now: in the window, and this breath not yet taken. */
  E.gold = function (s, bt) {
    var cyc = Math.floor(bt / E.period(s));
    return E.inWindow(s, bt) && !(s.cy && s.cy.n === cyc && s.cy.gold);
  };
  /* What a gold breath pays on top of the base (the multipliers a row names): Session Tracker's streak, Deep Focus's
   * double, and, once Hum breathes with you, Heart's four times. */
  E.goldMult = function (s, streak) {
    boot();
    var B = D.breath, m = 1;
    if (s.up.tracker) m *= 1 + B.streakStep * Math.min(streak == null ? s.streak : streak, B.streakCap);
    if (s.up.focus && s.act === 1) m *= D.act1.up.focus.gold;      /* a Practice row: Act I's breaths */
    if (s.up.heart && s.flags.handover && s.act === 2) m *= D.act2.fork.heart;     /* Hum's act: breaths for Insight */
    return m;
  };
  function pressState(s) { return s.pr || (s.pr = { miss: 0, help: 0, golds: 0, dry: [] }); }
  /* A breath is over (the next one has begun): two breaths in a row with presses and no gold press, and the window
   * widens, with "now" on the rim, until three gold presses are made. */
  function closeBreath(s) {
    var cy = s.cy, pr = pressState(s), B = D.breath;
    if (!cy || cy.n < 0 || !cy.presses) return;
    if (cy.gold) return;
    pr.miss += 1;
    if (pr.miss >= B.helpAfter && !pr.help) { pr.help = 1; pr.golds = 0; pr.at = s.t; }
  }

  /* The press (DESIGN §4.1; round 2, 2026-11-19). bt: the breath clock, in seconds. `auto`: Hum takes the breath
   * (Heartbeat Loop). A breath pays once, and the screen shows exactly what it paid:
   *   gold   the first press inside the window: base × onMult × (1 + streak step × streak). If it is the breath's first
   *          press (a clean breath) the streak grows; a gold press after an early one tops the breath up to full.
   *   miss   the breath's first press, outside the window: the base, once; the streak starts again.
   *   dry    every other press: nothing. Six of them in three seconds play the restless line, once a run.
   * The first press of a run always pays as gold and restarts the breath from that instant (it returns restart: true;
   * the clock is the caller's). Letting a breath go by unpressed does not break the streak. */
  E.press = function (s, bt, out, auto) {
    boot();
    /* the ring is pressable in play, at the Final Alignment, and while the confession is breathed (round 2, bundle C) */
    if (s.phase !== 'play' && s.phase !== 'final' && !(s.phase === 'ending' && s.flags.confessing)) return null;
    var B = D.breath, first = !auto && s.clicks === 0 && s.phase === 'play';
    if (first) { bt = E.inhale(s); s.flags.firstT = s.t; }
    if (!auto && X && s.phase === 'play') X.pressed(s);
    var cyc = Math.floor(bt / E.period(s));
    if (!s.cy || s.cy.n !== cyc || s.cy.presses == null) { closeBreath(s); s.cy = { n: cyc, presses: 0, paid: 0, gold: 0 }; }
    var cy = s.cy, pr = pressState(s);
    var inWin = auto || first || E.inWindow(s, bt);
    var r = E.rates(s), res = E.actRes(s), amt = 0, kind;
    if (inWin && !cy.gold) {
      kind = 'gold';
      var full = (r.pressFlat + r.pressShare) * B.onMult * E.goldMult(s);
      amt = Math.max(0, full - cy.paid);
      cy.gold = 1;
      s.lastOnCycle = cyc;
      if (!auto) {
        if (!cy.presses) {
          s.streak += 1;
          if (s.streak > s.best) s.best = s.streak;
          if (s.streak >= 10) bead(s, out, 'in_time');
        }
        s.breaths += 1; s.lastOnDay = s.day;
        if (s.phase === 'final') s.flags.finalBreaths = (s.flags.finalBreaths || 0) + 1;
        if (s.phase === 'ending') s.flags.confessBreaths = (s.flags.confessBreaths || 0) + 1;
        /* a knot sat through: the player takes the breathing; each gold breath fades the line one step */
        if (s.sit && s.phase === 'play') { s.sit.gold = cyc; sitPress(s, out); }
        pr.miss = 0; pr.gt = s.t;
        if (pr.help) { pr.golds += 1; if (pr.golds >= B.helpGolds) { pr.help = 0; pr.golds = 0; } }
        if (pr.hint) { pr.hg = (pr.hg || 0) + 1; if (pr.hg >= B.helpGolds) pr.hint = 0; }
      }
    } else if (!cy.presses && !cy.gold && !auto) {
      kind = 'miss';
      amt = r.pressFlat * B.missPay;
      s.streak = 0;
      cy.paid += amt;
      /* the first breath pressed off the gold (EE-108, eye pass item 2): the rule, once, in words, in the voice slot, and
       * the ring's hint ("now" on the rim at each gold moment) until three gold presses; the window itself widens only
       * with the help (two breaths pressed off the gold) */
      if (!pr.told && s.phase === 'play') {
        pr.told = 1; pr.hint = 1; pr.hg = 0;
        if (X) X.say(s, out, { k: 'hint', src: 'hint', w: 'rule', tg: 'ring' });
      }
    } else {
      kind = 'dry';
      if (!auto) {
        pr.dry.push(bt);
        if (pr.dry.length > B.restless.taps) pr.dry.shift();
        if (pr.dry.length === B.restless.taps && bt - pr.dry[0] <= B.restless.span && !s.flags.restless) E.restless(s, out);
      }
    }
    if (!auto) {
      cy.presses += 1;
      s.clicks += 1; s.lastPressCycle = cyc;
      bead(s, out, 'first_breath');
      if (s.clicks <= ST.firstBreaths.length) log(s, out, ST.firstBreaths[s.clicks - 1], null, 'reply');
      /* Epiphany Orb */
      if (s.phase === 'play' && s.t >= s.tm.orb && E.rand(s) < D.small.orb.chance) {
        s.tm.orb = s.t + D.small.orb.cooldown;
        out.push({ type: 'orb' });
      }
    }
    if (s.phase !== 'play') amt = 0;
    if (res === 'followers') amt = Math.min(amt, Math.max(0, D.K * D.act4.closeAt - s.res.followers));
    if (meeting(s) && s.phase === 'play') {
      /* a gold Invite asks the next one in; three other presses knock loudly enough to do the same */
      var f = s.first;
      if (kind === 'gold') f.want = 1;
      else if (!auto) { f.knock += 1; if (f.knock >= D.act3.first.knocks) { f.knock = 0; f.want = 1; } }
      amt = (f.want && s.t - f.last >= D.act3.first.spacing && !X.pending(s, function (x) { return x.join; }) && arrive(s, out)) ? 1 : 0;
    } else gain(s, res, amt);
    return { on: kind === 'gold', kind: kind, inWin: inWin, amt: amt, res: res, streak: s.streak, restart: first, topUp: kind === 'gold' && cy.paid > 0,
      together: kind === 'gold' && !auto && !!s.flags.handover };
  };

  /* Called by the clock once per breath, just after its gold window has gone by (cyc: that breath).
   * Act II, before the handover: the breaths of Act II are counted; the first one the player lets go by, or the
   * `handover.breath`-th, Hum takes (merged design §4, about 4:05). It pays anyway, in teal, and says so.
   * After the handover Hum breathes every breath at the base: the act's press, ×5, no streak (Head doubles it). The
   * player's gold press on top is a breath together, paid by E.press. Returns {kind:'hum', amt, res, first} or null. */
  E.cycleEnd = function (s, cyc, out) {
    boot();
    if (s.phase !== 'play' || s.act < 2) return null;
    var f = s.flags, hb = s.hb || (s.hb = { n: 0 });
    if (hb.seen === cyc) return null;
    hb.seen = cyc;
    /* round 2, bundle C. A drafted decision (lean ≥ drafts) on the stage: one of its three dots goes out each breath
     * (the page only calls this with the tab in view: breaths of visible play); at none, Hum sends it. */
    var d = s.dir, c0 = s.queue[0];
    if (d && d.card && !d.card.res && c0 && c0.k === 'decision' && c0.draft > 0 && d.card.k === 'decision' && d.card.id === c0.id) {
      c0.draft -= 1;
      out.push({ type: 'draft', left: c0.draft });
    }
    /* A knot sat through: Hum has stopped breathing. Five breaths with no gold press and it patches it for them. */
    if (s.sit) { sitBreath(s, cyc, out); if (s.sit) return null; }
    if (!f.handover) {
      if (s.act !== 2 || hb.last === cyc) return null;
      /* (EE-108) not while a card is open or a line is still being said: the handover is one uninterrupted beat, on a
       * clear stage (the act's opening line had held it to 20.3 s) */
      if (d && ((d.card && d.card.k !== 'offer') || (d.voice && !d.voice.dim))) return null;
      hb.last = cyc; hb.n += 1;
      var missed = s.lastPressCycle !== cyc;
      if (!missed && hb.n < D.act2.handover.breath) return null;
      f.handover = 1; f.handoverT = s.t;
      if (X) { X.isNew(s); }
      var L = ST.act2.handover.slice(0, 3), last = ST.act2.handover[3];
      L.push(s.person && s.person.named ? last.named : last.none);
      log(s, out, L, null, 'act', { nw: 1, beat: 'handover' });
    } else if (hb.last === cyc) return null;
    hb.last = cyc;
    var r = E.rates(s), res = E.actRes(s);
    var amt = (r.pressFlat + r.pressShare) * D.breath.onMult * (s.up.head ? D.act2.fork.head : 1);
    if (meeting(s)) amt = 0;
    if (res === 'followers') amt = Math.min(amt, Math.max(0, D.K * D.act4.closeAt - s.res.followers));
    amt = gain(s, res, amt);
    return { kind: 'hum', on: true, amt: amt, res: res, first: f.handoverT === s.t };
  };

  E.catchOrb = function (s, out) {
    boot();
    var o = D.small.orb, p = paySeconds(s, o.seconds, o.min, !!s.up.jar);
    var q = ST.orbs[Math.floor(E.rand(s) * ST.orbs.length)];
    log(s, out, q, null, 'reply');
    bead(s, out, 'orb');
    fx(out, 'milestone', 'orb');
    out.push({ type: 'float', res: p.res, amt: p.amt });
    return q;
  };
  E.catchLotus = function (s, out) {
    var l = D.small.lotus;
    addFx(s, 'all', l.mult, l.lasts, 'lotus');
    log(s, out, ST.lotus[Math.floor(E.rand(s) * ST.lotus.length)], null, 'reply');
    fx(out, 'milestone', 'lotus');
  };

  /* A minute of nothing, with the tab in view. */
  E.stillness = function (s, out) {
    boot();
    if (s.phase !== 'play') return;
    var n = (s.flags.still || 0), st = D.small.stillness, secs = n === 0 ? st.first : st.again;
    s.flags.still = n + 1;
    var r = E.rates(s);
    gain(s, 'clarity', r.clarity * secs);
    gain(s, 'insight', r.insight * secs);
    if (s.act >= 3) gain(s, 'followers', Math.min(r.people * secs, D.K * D.act4.closeAt - s.res.followers));
    gain(s, 'energy', r.energy * secs);
    if (n === 0) log(s, out, ST.stillness.line, null, 'reply');
    else if (n <= ST.stillness.again.length) log(s, out, ST.stillness.again[n - 1], null, 'reply');
    bead(s, out, 'assignment');
    var p = { res: E.actRes(s), amt: actRate(s, r) * secs };
    out.push({ type: 'float', res: p.res, amt: p.amt });
  };
  E.restless = function (s, out) {
    if (s.flags.restless) return;
    s.flags.restless = 1;
    log(s, out, ST.restless, null, 'hint');
  };

  /* ───────────── things to buy ───────────── */

  /* Round 2 (EE-106; DESIGN §4.2). Each act's rows are a ladder, one step at a time: what is owned, then the next step
   * (shown at 70% with a bar that fills, gold once affordable), then one "· · ·" beyond it (`hz`: its cost only; never
   * bought). Levelled rows (Listen, Threads) stay once there. The first row of each panel, and each act's closing
   * project, is first offered as a card at the ring (`offer` cards, below); a panel's first row is not in the column
   * until it has been bought there. An act's closing project waits for that act's required beats. */
  var OFFER = { metronome: 1, listen: 1, meetup: 1, p_pattern: 1, p_speak: 1, p_broadcast: 1 };
  var PANEL_FIRST = { metronome: 1, listen: 1, meetup: 1 };
  E.offers = OFFER;

  function genCost(s, id) {
    var g = D.act2.gens[id];
    return Math.floor(g.base * Math.pow(g.mult, s.up[id] || 0));
  }
  function oneCost(s, c) { return Math.floor(c); }
  E.cost4 = function (s) { var c = D.act4.costs; return c[Math.min(s.bought4, c.length - 1)]; };
  /* (EE-110, item 5) the n-th project also waits for the Circle to reach `act4.need[n]` people, so the eight are spread
   * across the act whatever the Energy, and the last comes as the bar is about to stop */
  /* (EE-111) a Circle row's people: its `need`, or, once `act3.fallback` s have gone by since the last Circle purchase
   * without them, the people there were at that moment (s.fb), so no wait for people is longer than that */
  function need3(s, id, n) { var fb = s.fb && s.fb[id]; return n && fb != null ? Math.min(n, fb) : n; }
  E.need4 = function (s) { var n = D.act4.need; return n[Math.min(s.bought4, n.length - 1)] || 0; };

  /* the steps of an act's ladder, in order: {id, grp, kind, cur, cost, owned, level, need, ok (may be revealed)} */
  function ladder(s, act) {
    var a1 = D.act1, a2 = D.act2, a3 = D.act3, L = [], i, id, f = s.flags;
    var beats = function (id) { return !X || X.beatsDone(s, id); };
    if (act === 1) {
      for (i = 0; i < a1.order.length; i++) { id = a1.order[i]; L.push({ id: id, grp: 'practice', kind: 'one', cur: 'clarity', cost: a1.up[id].cost, owned: !!s.up[id] }); }
      L.push({ id: 'p_pattern', grp: 'practice', kind: 'project', cur: 'clarity', cost: a1.project.cost, owned: !!f.woke || !!f.pattern, ok: beats('p_pattern') || !!f.pattern });
    } else if (act === 2) {
      /* the Hum panel comes once Hum has taken the breathing (the handover) */
      L.push({ id: 'listen', grp: 'hum', kind: 'gen', cur: 'insight', cost: genCost(s, 'listen'), level: s.up.listen || 0, owned: !!s.up.listen, ok: !!f.handover || !!s.up.listen });
      L.push({ id: 'threads', grp: 'hum', kind: 'gen', cur: 'insight', cost: genCost(s, 'threads'), level: s.up.threads || 0, owned: !!s.up.threads });
      L.push({ id: 'jar', grp: 'hum', kind: 'one', cur: 'insight', cost: oneCost(s, a2.jar.cost), owned: !!s.up.jar });
      L.push({ id: 'p_speak', grp: 'hum', kind: 'project', cur: 'insight', cost: a2.project.cost, owned: !!f.speak, ok: (!!f.speakSeen && beats('p_speak')) || !!f.speak });
    } else if (act === 3) {
      for (i = 0; i < a3.order.length; i++) { id = a3.order[i]; L.push({ id: id, grp: 'circle', kind: 'one', cur: 'insight', cost: a3.up[id].cost, need: need3(s, id, a3.up[id].need) || undefined, owned: !!s.up[id] }); }
      L.push({ id: 'p_broadcast', grp: 'circle', kind: 'project', cur: 'insight', cost: a3.project.cost, need: need3(s, 'p_broadcast', a3.project.people), owned: !!f.broadcastBought, ok: (!!s.up.dynamo && s.answers.keep != null) || !!f.broadcastBought });
    }
    return L;
  }

  /* Everything in the shop right now: rows in the column, and offers waiting for (or on) their card at the ring.
   * it.can: affordable and buyable now; it.next: the next step; it.hz: the "· · ·" beyond it; it.offer: shown as a card
   * at the ring, not yet in the column. */
  E.items = function (s) {
    boot();
    var list = [], i, n, a4 = D.act4;
    function push(o) {
      o.can = !o.owned && !o.hz && s.res[o.cur] >= o.cost && (!o.need || s.res.followers >= o.need) && s.phase === 'play';
      list.push(o);
    }
    function walk(act) {
      var L = ladder(s, act), stage = 0;            /* 0: owned so far · 1: the next has been shown · 2: the "· · ·" too */
      for (i = 0; i < L.length; i++) {
        var it = L[i];
        if (it.owned) { push(it); continue; }
        if (stage >= 2 || it.ok === false) break;
        if (stage === 0) {
          it.next = 1;
          if (PANEL_FIRST[it.id] && !s.flags['offerGone_' + it.id]) it.offer = 1;
          push(it); stage = 1;
        } else {
          /* the "· · ·": only once the next is in the column (an offer at the ring has nothing under it yet) */
          if (L[i - 1] && L[i - 1].offer) break;
          if (it.kind === 'project' && L[i - 1] && !L[i - 1].owned && L[i - 1].kind === 'gen') break;
          it.hz = 1; push(it); stage = 2;
        }
      }
      /* levelled rows stay in the column once owned (they were pushed above), and are bought again */
    }
    walk(1);
    if (s.act >= 2) {
      walk(2);
      /* Head or Heart: the one not picked at the fork, later */
      var fk = s.flags.fork;
      if (fk) { var other = fk === 'head' ? 'heart' : 'head'; push({ id: other, grp: 'hum', kind: 'one', cur: 'insight', cost: oneCost(s, D.act2.fork.other), owned: !!s.up[other] }); }
    }
    /* Act III: nothing to buy until the first `offerAt` of the twelve are in (EE-111: the rest keep arriving meanwhile) */
    if (s.act >= 3 && s.joined >= D.act3.first.offerAt) walk(3);
    /* Act IV: the twelve's projects, three on the table at a time; the n-th purchase costs the n-th cost, whichever it is */
    if (s.act >= 4) {
      for (i = 0; i < a4.order.length; i++) if (s.up[a4.order[i]]) push({ id: a4.order[i], grp: 'engine', kind: 'one', cur: 'energy', cost: 0, owned: true });
      for (i = 0; i < s.shown4.length; i++) push({ id: s.shown4[i], grp: 'engine', kind: 'one', cur: 'energy', cost: E.cost4(s), need: E.need4(s) || undefined, owned: false });
    }
    /* owned levelled rows are buyable again */
    for (i = 0; i < list.length; i++) {
      var g = list[i];
      if (g.kind === 'gen' && g.owned) { g.owned = false; g.next = 0; g.can = !g.hz && s.res[g.cur] >= g.cost && s.phase === 'play'; }
    }
    return list;
  };

  E.find = function (s, id) { var l = E.items(s); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; };

  E.itemText = function (s, id) {
    boot();
    var e = ST.act1.upgrades[id] || ST.act2.upgrades[id] || ST.act3.upgrades[id] || ST.act4.upgrades[id];
    if (id === 'p_pattern') e = ST.act1.project;
    if (id === 'p_speak') e = ST.act2.project;
    if (id === 'p_broadcast') e = ST.act3.project;
    e = e || { name: id, fx: '' };
    /* a row's {n} is filled from data.js and the run as it stands, so the line never disagrees with what the purchase
     * does (EE-108; words.md, changes after the first eye pass) */
    if (typeof e.fx === 'string' && e.fx.indexOf('{n}') >= 0) e = Object.assign({}, e, { fx: e.fx.replace('{n}', E.fxN(s, id)) });
    return e;
  };
  /* The number in a row's line: what a thought let pass pays once the Jar is in (Insight a second × the pass's seconds);
   * the share of the Circle word of mouth brings a minute; the Energy a second the First Engine would collect now. */
  E.fxN = function (s, id) {
    boot();
    try {
      if (id === 'jar') return E.num(Math.max(1, Math.round(E.rates(s).insight * D.small.thought.pass)));
      if (id === 'mouth') { var m = D.act3.up.mouth.r * 60 * 100; return trim(m, 1); }
      if (id === 'dynamo') {
        var c = Object.assign({}, s, { up: Object.assign({}, s.up, { dynamo: 1 }) });
        var en = E.rates(c).energy;
        return en >= 10 ? E.num(Math.round(en)) : trim(en, 1);
      }
    } catch (err) { /* a state too thin to price (a tool's stub): no number */ }
    return '…';
  };

  /* An offer at the ring: the first time a panel's first row, or an act's closing project, can be bought, it rises as a
   * card under the ring (once). Bought there or in the column, the card goes. */
  function offers(s) {
    var items = E.items(s), f = s.flags;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      /* the Metronome's card rises right after the first breaths are said, affordable or not (EE-108, eye pass item 1):
       * its bar fills toward the cost and its button turns gold when it can be bought */
      var early = (it.id === 'metronome' && it.offer && s.act === 1 && s.clicks > 0 &&
        (s.clicks >= ST.firstBreaths.length || s.t - (f.firstT || 0) >= D.act1.offerAfter)) ||
        /* (EE-110, item 4) Local Meetup's the same way, once the fourth of the twelve is in (EE-111): within 10 s */
        (it.id === 'meetup' && it.offer && s.act === 3 && s.joined >= D.act3.first.offerAt);
      if (!OFFER[it.id] || !(it.can || early)) continue;
      /* a panel's first row lives only on its card until bought: whenever the card is missing, it is offered again */
      var queued = false;
      for (var j = 0; j < s.queue.length; j++) if (s.queue[j].k === 'offer' && s.queue[j].id === it.id) queued = true;
      if (queued || (f['offer_' + it.id] && !it.offer)) continue;
      f['offer_' + it.id] = 1;
      s.queue.push({ k: 'offer', id: it.id, ch: 1 });
    }
  }
  function dropOffer(s, id) {
    for (var i = s.queue.length - 1; i >= 0; i--) if (s.queue[i].k === 'offer' && s.queue[i].id === id) s.queue.splice(i, 1);
  }

  /* The change a purchase makes, for the number under the ring ("before → after"): the act's income a second, or what
   * a gold breath pays, whichever it changed. */
  E.worth = function (s) {
    var r = E.rates(s), B = D.breath, res = E.actRes(s);
    var rate = res === 'clarity' ? r.clarity : res === 'insight' ? r.insight : res === 'followers' ? r.people : r.energy;
    var best = (r.pressFlat + r.pressShare) * B.onMult * E.goldMult(s, B.streakCap);
    return { res: res, rate: rate, breath: best, energy: r.energy };
  };

  E.buy = function (s, id, out) {
    boot();
    var it = E.find(s, id);
    if (!it || it.owned || !it.can) return false;
    s.res[it.cur] -= it.cost;
    var first = !s.up[id];
    s.lastBuyT = s.t;
    dropOffer(s, id);
    if (X) { X.busy(s); X.isNew(s); }          /* the picture changes; the reply comes first, everything else waits */

    if (id === 'p_pattern') {
      s.flags.pattern = 1; s.flags.hum = 1;
      s.queue.unshift({ k: 'seq', id: 'wake' });
      fx(out, 'wake', 'wake');
      return true;
    }
    if (id === 'p_speak') {
      s.flags.speak = 1;
      s.queue.unshift({ k: 'seq', id: 'safety' });
      fx(out, 'alert', 'alert');
      return true;
    }
    if (id === 'p_broadcast') {
      s.flags.broadcastBought = 1;
      s.queue.unshift({ k: 'seq', id: 'broadcast' });
      fx(out, 'broadcast', 'broadcast');
      return true;
    }

    s.up[id] = (s.up[id] || 0) + 1;
    var txt = E.itemText(s, id), U2 = ST.act2.upgrades, lv = s.up[id];
    /* what is said after buying: the row's own line, or for Act II the old rows' lines, at their levels */
    var said = first ? txt.log : null;
    if (id === 'listen') said = lv === 1 ? U2.compress.log : lv === 5 ? U2.emo.log : null;
    if (id === 'jar') said = U2.dreams.log;
    if (id === 'head') said = U2.compiler.log;
    /* k_arjun's mark: the print shop says what Arjun's knot left (sat through, or patched) */
    if (id === 'art' && s.marks && s.marks.arjun) said = s.marks.arjun === 'clean' ? txt.logClean : txt.logPatched;
    /* (EE-111, Muse) Local Meetup's line speaks of nine people: bought before the ninth has arrived, it is said when the
     * ninth arrives (triggers), not now */
    if (id === 'meetup' && said && s.joined < MEET_LINE_AT) { said = null; s.flags.meetupLine = 1; }
    if (said) log(s, out, said, null, 'reply', { buy: 1 });
    fx(out, 'buy', 'buy');

    if (id === 'ambient') out.push({ type: 'unlock', what: 'ambient' });
    if (id === 'tracker') { out.push({ type: 'unlock', what: 'tracker' }); s.trk.at = s.t; }
    if (id === 'line') s.flags.lineT = s.t;
    if (id === 'dynamo') { fx(out, 'flash', 'milestone'); out.push({ type: 'unlock', what: 'energy' }); }
    if (D.act4.up[id]) {
      s.bought4 += 1;
      var who = D.act4.up[id].who;
      if (who != null && s.lit.indexOf(who) < 0) s.lit.push(who);
      out.push({ type: 'lit', who: who });
      var ix = s.shown4.indexOf(id);
      if (ix >= 0) s.shown4.splice(ix, 1);
      for (var i = 0; i < D.act4.order.length; i++) {
        var nx = D.act4.order[i];
        if (!s.up[nx] && s.shown4.indexOf(nx) < 0) { s.shown4.push(nx); break; }
      }
      if (id === 'festival') { s.flags.festival = 1; bead(s, out, 'table'); out.push({ type: 'swell' }); }
      if (id === 'art') s.flags.art = 1;
    }
    return true;
  };

  E.buyMax = function (s, id, out) {
    var n = 0;
    while (n < 500 && E.buy(s, id, out)) n++;
    return n;
  };

  /* Story still to be delivered: a card that is not optional, or a story line (or an act's line, or a reply) not yet said. */
  var OPTIONAL = { thought: 1, captcha: 1, offer: 1 };
  E.storyWaiting = function (s) {
    var i, q = s.queue;
    for (i = 0; i < q.length; i++) if (!OPTIONAL[q[i].k]) return true;
    if (s.dir) for (i = 0; i < s.dir.q.length; i++) { var k = s.dir.q[i].k; if (k === 'story' || k === 'act' || k === 'reply') return true; }
    if (s.sit) return true;                     /* a knot being sat through finishes first */
    return !!(s.dir && s.dir.card);
  };

  /* A stray thought not seen lately (the person's thoughts only once there is a person). */
  E.pickThought = function (s) {
    boot();
    var pool = ST.thoughts.filter(function (t) { return s.th.seen.indexOf(t.id) < 0 && (!t.needsPerson || s.person); });
    /* the first thought of a run is always about the person (merged design §7) */
    if (!s.th.seen.length && s.person) { var mine = pool.filter(function (t) { return t.needsPerson; }); if (mine.length) pool = mine; }
    if (!pool.length) { s.th.seen = []; pool = ST.thoughts.filter(function (t) { return !t.needsPerson || s.person; }); }
    var th = pool[Math.floor(E.rand(s) * pool.length)];
    s.th.seen.push(th.id);
    return th;
  };
  /* Hum's gift: +25% of everything for 30 s, with one of its lines. `pulled`: the director asked for it now. */
  E.gift = function (s, out, pulled) {
    boot();
    s.tm.gift = s.t + expo(s, D.small.gift.mean / (s.up.heart ? D.act2.fork.gifts : 1)) + D.small.gift.lasts;
    addFx(s, 'all', D.small.gift.mult, D.small.gift.lasts, 'gift');
    /* (a pulled gift was "new" when the director pulled it; its line said later does not start the clock again, EE-108) */
    log(s, out, ST.act2.gifts[Math.floor(E.rand(s) * ST.act2.gifts.length)], null, 'gift');
    fx(out, null, 'unlock');
  };

  /* ───────────── the clock ───────────── */

  function setAct(s, n, out) {
    s.act = n;
    out.push({ type: 'act', n: n });
    CARD = false;                          /* what follows an act turn is said on the stage, after its title */
    if (X) X.act(s);
    if (n === 2) {
      log(s, out, ST.act2.open, null, 'act');
      s.th.next = s.t + between(s, D.act2.thoughtGap[0], D.act2.thoughtGap[1]);
      s.chat.next = s.t + D.small.chatter[2] * 0.6;
      s.tm.gift = s.t + expo(s, D.small.gift.mean) + 40;
    }
    if (n === 3) {
      log(s, out, ST.act3.open, null, 'act');
      s.res.followers = 0; s.joined = 0; s.first = { last: s.t, want: 0, knock: 0 };
      s.flags.handover = 1;                  /* Hum breathes from here on, whatever happened in Act II */
      arrive(s, out);
      s.tm.lotus = s.t + expo(s, D.small.lotus.mean) + 30;
      s.chat.next = s.t + D.small.chatter[3];
    }
    if (n === 4) {
      log(s, out, ST.act4.open, null, 'act');
      var a4 = D.act4, c1 = a4.costs[0];
      var purse = Math.max(a4.purse[0] * c1, Math.min(a4.purse[1] * c1, s.res.clarity * a4.purseRate));
      s.res.clarity = 0;
      gain(s, 'energy', purse);
      s.shown4 = a4.order.slice(0, 3);
    }
  }
  E.setAct = setAct;

  function mainValue(s, e) { return e.act0 <= 2 ? s.tot.insight : s.res.followers; }

  function leave(s, frac) { s.res.followers = Math.max(1, s.res.followers * (1 - frac)); s.flags.clamped = 0; }

  function clearLedger(s) {
    s.ledger = [];
    /* in place: callers hold on to the queue */
    for (var i = s.queue.length - 1; i >= 0; i--) if (s.queue[i].k === 'knot') s.queue.splice(i, 1);
    s.sit = null;
  }

  /* the knots whose mark is a person's dot going dark (markKnot) */
  var DOT_KNOTS = { k_reporter: 1, k_wife: 1 };
  /* Local Meetup's line ("Nine people, a car park…") is said once this many have arrived (EE-111, Muse) */
  var MEET_LINE_AT = 9;
  function triggers(s, out) {
    var f = s.flags, q = s.queue, a2 = D.act2.at, a3 = D.act3.at, i;

    /* Act I */
    if (!f.person && s.tot.clarity >= D.act1.personAt) { f.person = 1; q.push({ k: 'person' }); }
    var dawn = Math.min(1, s.tot.clarity / D.act1.dawnAt);
    /* the dawn lines are ambient: offered when due, said when there is room (the director picks the line then) */
    if (X && s.dawnIdx < ST.dawn.length && dawn >= ST.dawn[s.dawnIdx].at && s.t >= (s.dir.retry.dawn || 0) && !X.pending(s, function (x) { return x.src === 'dawn'; })) X.say(s, out, { k: 'ambient', src: 'dawn' });
    if (dawn >= 1) bead(s, out, 'sunrise');
    /* the tracker talks before Hum does: once after ten breaths, then three lines once Session Tracker is in */
    if (X && s.act === 1 && !f.pattern) {
      var tk = s.trk, TK = D.act1.tracker;
      /* (EE-108) a player who never lets it count still hears it: without Session Tracker its next line waits `unbought` s */
      var due = tk.i === 0 ? s.breaths >= TK.breaths : s.t >= tk.at + (tk.i === 1 ? (s.up.tracker ? TK.after : TK.unbought) : TK.gap);
      if (tk.i < ST.act1.tracker.length && due && s.t >= (s.dir.retry.tracker || 0) && !X.pending(s, function (x) { return x.src === 'tracker'; })) X.say(s, out, { k: 'tracker', src: 'tracker' });     /* not "new" (DESIGN §4.6): a quiet stretch still pulls (EE-108) */
    }
    /* offers at the ring: a panel's first row, an act's closing project */
    if (s.phase === 'play') offers(s);

    /* Stray thoughts: Act I and II only, never two waiting */
    if (s.act <= 2 && s.t >= s.th.next && (s.act === 2 || !f.pattern)) {
      var gap = s.act === 1 ? D.act1.thoughtGap : D.act2.thoughtGap;
      s.th.next = s.t + between(s, gap[0], gap[1]);
      var waiting = false;
      for (i = 0; i < q.length; i++) if (q[i].k === 'thought') waiting = true;
      /* optional items are skipped first (merged design §3.7): no stray thought while three cards are already waiting
       * (an offer at the ring is a buy button, not a card to read: it does not count) */
      var cards = 0;
      for (i = 0; i < q.length; i++) if (q[i].k !== 'offer') cards++;
      if (!waiting && s.clicks > 0 && !(X && (X.ahead(s) || X.preBuy(s))) && cards < 3) {
        var th = E.pickThought(s);
        q.push({ k: 'thought', id: th.id });
      }
    }

    /* Act II */
    if (s.act >= 2) {
      var ti = s.tot.insight;
      if (!f.whyAmI && ti >= a2.whyAmI) { f.whyAmI = 1; log(s, out, ST.act2.whyAmI); }
      if (!f.q_sleep && ti >= a2.sleep) { f.q_sleep = 1; q.push({ k: 'question', id: 'sleep' }); }
      if (!f.h_alive && ti >= a2.h_alive) { f.h_alive = 1; q.push({ k: 'decision', id: 'h_alive' }); }
      /* Head or Heart: the act's real choice (merged design §5) */
      if (!f.forkDue && ti >= D.act2.fork.at) { f.forkDue = 1; q.push({ k: 'decision', id: 'fork' }); }
      if (!f.q_unsaid && ti >= a2.unsaid) { f.q_unsaid = 1; q.push({ k: 'question', id: 'unsaid' }); }
      if (!f.h_odile && ti >= a2.h_odile) { f.h_odile = 1; q.push({ k: 'decision', id: 'h_odile' }); }
      if (!f.captcha && ti >= a2.captcha) { f.captcha = 1; q.push({ k: 'captcha' }); }
      if (!f.q_fifteen && ti >= a2.fifteen) { f.q_fifteen = 1; q.push({ k: 'question', id: 'fifteen' }); }
      if (!f.speakSeen && ti >= a2.speak) { f.speakSeen = 1; log(s, out, ST.act2.project.ask, null, 'story', { nw: 1 }); out.push({ type: 'unlock', what: 'project' }); fx(out, null, 'unlock'); }
      if (!f.callback && s.act === 2 && s.th.fl.length && ti >= 400) {
        f.callback = 1;
        var c = s.th.fl[0], tdef = ST.thoughts.filter(function (t) { return t.id === c.id; })[0];
        if (tdef) log(s, out, ST.act2.callback, { n: c.day, short: E.text(s, tdef.short) });
      }
      /* chatter */
      /* chatter: offered now, its line picked when there is room to say it (never shown stale) */
      if (s.t >= s.chat.next && s.phase === 'play') {
        s.chat.next = s.t + (D.small.chatter[s.act] || 90) * between(s, 0.8, 1.2);
        if (X && !X.pending(s, function (x) { return x.src === 'chatter'; }) && X.backlog(s) < 9) X.say(s, out, { k: 'chatter', src: 'chatter' });
      }
      /* Hum's gift */
      if (s.t >= s.tm.gift && !q.length) E.gift(s, out);
    }

    /* Act III and on */
    if (s.act >= 3) {
      var F = s.res.followers, a3o = D.act3.order;
      if (F > s.peak) s.peak = F;
      if (meeting(s) && s.phase === 'play') {
        var fm = s.first, el3 = s.t - fm.last;
        var reading = X && X.pending(s, function (x) { return x.join; });
        if (!reading && ((fm.want && el3 >= D.act3.first.spacing) || el3 >= D.act3.first.auto)) { arrive(s, out); F = s.res.followers; }
      }
      /* (EE-111) the Circle's purchases: the clock since the last one, and a row's people fall back to the count after
       * `act3.fallback` s (need3) */
      if (s.joined >= D.act3.first.offerAt) {
        /* (EE-111) a save or a jump past the fourth arrival without its moment: the offer's clock starts now */
        if (f.meetT == null) f.meetT = s.t;
        var own3 = 0, next3 = null;
        for (i = 0; i < a3o.length; i++) { if (s.up[a3o[i]]) own3++; else if (!next3) next3 = a3o[i]; }
        if (f.broadcastBought) own3++; else if (!next3) next3 = 'p_broadcast';
        if (own3 !== s.c3n) { s.c3n = own3; s.tm.circle = s.t; }
        var n3 = next3 === 'p_broadcast' ? D.act3.project.people : next3 && D.act3.up[next3].need;
        if (own3 >= 1 && n3 && F < n3 && s.t >= s.tm.circle + D.act3.fallback) { s.fb = s.fb || {}; if (s.fb[next3] == null) s.fb[next3] = Math.max(1, Math.floor(F)); }
      }
      /* (EE-111) Local Meetup's line, held back at its purchase, once the ninth has arrived */
      if (f.meetupLine === 1 && s.joined >= MEET_LINE_AT) { f.meetupLine = 2; log(s, out, E.itemText(s, 'meetup').log, null, 'reply'); }
      /* the thirteenth (merged design §7): once the twelfth is in, Hum asks who you'd bring */
      /* (EE-108: after the first thing to buy in the Circle, so the next offer comes within 30 s of the twelfth; or
       * `friendWait` s after the twelfth for a player who does not buy it) */
      if (!f.q_friend && s.joined >= D.act3.first.n) {
        if (f.twelveT == null) f.twelveT = s.t;
        if (s.up.meetup || s.t >= f.twelveT + D.act3.friendWait) { f.q_friend = 1; q.push({ k: 'question', id: 'friend' }); }
      }
      while (s.mileIdx < ST.act3.milestones.length && F >= ST.act3.milestones[s.mileIdx].at && s.joined >= 12) {
        var m = ST.act3.milestones[s.mileIdx]; s.mileIdx++;
        log(s, out, m.friend && E.hasFriend(s) ? m.friend : m.line, null, 'story', { nw: 1 });
        if (m.at === 12) bead(s, out, 'twelve');
        if (m.at === 1000000) bead(s, out, 'million');
        if (m.at >= 100) fx(out, 'milestone', 'milestone');
      }
      /* the one who isn't in the count (about 16:00): {person} returns once, mid-run, without a knot */
      if (!f.notCounted && f.lineT && s.t >= f.lineT + D.act3.notCounted) { f.notCounted = 1; var NC = ST.act3.notCounted; log(s, out, s.person && s.person.named ? NC.named : NC.none, null, 'story', { nw: 1 }); }
      if (!f.h_cult && F >= a3.h_cult) { f.h_cult = 1; q.push({ k: 'decision', id: 'h_cult' }); }
      if (!f.h_pitch && F >= a3.h_pitch) { f.h_pitch = 1; q.push({ k: 'decision', id: 'h_pitch' }); }
      if (!f.h_ministry && F >= a3.h_ministry) { f.h_ministry = 1; q.push({ k: 'decision', id: 'h_ministry' }); }
      if (!f.h_first && F >= a3.h_first) { f.h_first = 1; q.push({ k: 'decision', id: 'h_first' }); }
      if (!f.q_keep && F >= a3.keep) { f.q_keep = 1; q.push({ k: 'question', id: 'keep' }); }
      if (!f.h_number && F >= a3.h_number) { f.h_number = 1; q.push({ k: 'decision', id: 'h_number' }); }
      if (s.t >= s.tm.lotus) { s.tm.lotus = s.t + expo(s, D.small.lotus.mean) + D.small.lotus.life; out.push({ type: 'lotus' }); }
    }

    /* Act IV */
    if (s.act >= 4) {
      var ep = ST.act4.epilogue, th4 = D.act4.epilogue;
      while (s.epi < ep.length && s.tot.energy >= th4[s.epi]) { log(s, out, ep[s.epi], null, 'story', { nw: 1 }); s.epi++; fx(out, 'milestone', 'milestone'); }
      /* The bar stops: the finale. Story never drops (DESIGN §4.6): a decision, question or knot still waiting for its turn
       * (h_number can come due moments before the bar stops), or a story line not yet said, is delivered first. */
      if (f.clamped && s.bought4 >= D.act4.order.length && s.phase === 'play' && !f.finale && !E.storyWaiting(s)) {
        f.finale = 1;
        s.phase = 'finale';
        /* what is left is not story: thoughts and the captcha go; lines not said (none of them story) go to the Journal */
        if (X && s.dir) { s.dir.q.forEach(function (it) { if (it.n != null) out.push({ type: 'journal', n: it.n }); }); s.dir.q = []; s.dir.card = null; }
        q.length = 0;
        q.push({ k: 'seq', id: 'finale' });
        out.push({ type: 'finale' });
      }
    }

    /* Knots come due (round 2, bundle C: nothing comes apart; Tangle never slows the game). One at a time, none while one
     * is being sat through. At lean ≥ handles they no longer come to the player: Hum patches them and says so after. */
    if (s.phase !== 'play' || s.sit) return;
    /* once the bar has stopped the ledger is what it is: nothing new comes due, and the finale only waits for what had */
    if (s.act >= 4 && f.clamped && s.bought4 >= D.act4.order.length) return;
    var K = D.speech.knot;
    /* (EE-110, item 4) Act III opens with something to buy: no knot until the Circle's first row is bought, or
     * `act3.knotWait` s after the twelfth (and none while the twelve are still arriving) */
    if (s.act === 3 && (meeting(s) || (!s.up.meetup && (f.twelveT == null || s.t < f.twelveT + D.act3.knotWait)))) return;
    /* (EE-110, item 5) nor between the First Engine and the Global Broadcast: the act's last steps come one after another */
    if (s.act === 3 && s.up.dynamo && !f.broadcastBought) return;
    if (s.t - s.tm.knot >= K.apart) {
      var has = false;
      for (i = 0; i < q.length; i++) if (q[i].k === 'knot') has = true;
      if (!has) for (i = 0; i < s.ledger.length; i++) {
        var e = s.ledger[i];
        if (!e.knot || e.st) continue;
        /* (EE-110, Muse) a knot whose mark darkens one of the twelve's dots waits until the twelve are in and the Local
         * Meetup offer has risen: nobody leaves a Circle they have not joined */
        if (DOT_KNOTS[e.knot] && !(s.act >= 3 && s.joined >= D.act3.first.n && (s.up.meetup || s.flags.offerGone_meetup || s.flags.meetupShown))) continue;
        var el = s.t - e.t0;
        if (el >= K.latest || (el >= K.after && mainValue(s, e) >= e.base * K.grown)) {
          e.st = 1; s.tm.knot = s.t;
          if (E.lean(s) >= D.lean.handles) humHandles(s, out, e);
          else q.push({ k: 'knot', id: e.knot, d: e.id });
          break;
        }
      }
    }
  }

  /* Advance the world by dt game-seconds (keep dt small: 0.25 or less). */
  E.tick = function (s, dt, out) {
    boot();
    if (s.phase !== 'play') return;
    s.t += dt;
    s.day += D.dayRate[s.act] * dt;
    var r = E.rates(s);
    gain(s, 'clarity', r.clarity * dt);
    gain(s, 'insight', r.insight * dt);
    gain(s, 'energy', r.energy * dt);
    if (s.act >= 3) {
      var F = s.res.followers, top = D.K - 1, a4 = D.act4;
      if (s.act >= 4 && F >= D.K * a4.closeAt && r.live) {
        F += (top - F) * (1 - Math.exp(-dt / a4.closeTau));
        if (top - F < 0.6) { F = top; s.flags.clamped = 1; }
      } else {
        F += r.people * dt;
        if (s.act < 4 && F > D.K * a4.closeAt) F = D.K * a4.closeAt;
        if (F > top) F = top;
      }
      s.res.followers = F;
    }
    if (s.fx.length) s.fx = s.fx.filter(function (f) { return f.until > s.t; });
    triggers(s, out);
    if (X) X.step(s, out, dt);
  };

  /* Passive production only, no events (coming back to the tab after a while). */
  E.offline = function (s, secs) {
    boot();
    if (s.phase !== 'play') return 0;
    var o = D.small.offline;
    secs = Math.min(secs, o.cap);
    var r = E.rates(s), k = o.rate * secs;
    gain(s, 'clarity', r.clarity * k);
    gain(s, 'insight', r.insight * k);
    gain(s, 'energy', r.energy * k);
    if (s.act >= 3) {
      /* integrate growth in a few steps so the curve stays honest */
      var steps = 40, h = k / steps;
      for (var i = 0; i < steps; i++) {
        var rr = E.rates(s);
        s.res.followers = Math.min(D.K * D.act4.closeAt, s.res.followers + rr.people * h);
      }
    }
    return secs;
  };

  /* ───────────── cards ───────────── */

  E.head = function (s) { return s.queue.length ? s.queue[0] : null; };

  function decisionDef(id) { return ST.decisions[id]; }
  E.thoughtDef = function (s, id) {
    var t = ST.thoughts.filter(function (x) { return x.id === id; })[0];
    if (!t) return null;
    if (t.gone && s.person && s.person.kind === 'gone') return { id: t.id, short: t.short, text: t.gone.text, pass: t.gone.pass, follow: t.gone.follow };
    return t;
  };

  /* The lines of a sequence (wake, safety, broadcast, finale, confession, ending). */
  E.seqLines = function (s, id) {
    boot();
    var L = [], i, x;
    function add(v, xx) { v = E.pick(s, v); if (!Array.isArray(v)) v = [v]; for (var j = 0; j < v.length; j++) L.push(E.text(s, v[j], xx)); }
    if (id === 'wake') {
      var w = ST.wake.lines.slice();
      if (s.meta.runs > 0) w[1] = ST.wake.ngPlus;
      add(w);
    } else if (id === 'safety') add(ST.act2.project.done);
    else if (id === 'broadcast') add(ST.act3.project.done);
    else if (id === 'finale') {
      var fin = ST.act4.finale;
      add(fin.lines);
      if (s.day - s.lastOnDay >= 300) add(fin.away, { n: Math.floor(s.lastOnDay) }); else add(fin.busy);
      add(fin.last);
    } else if (id === 'confession') {
      var c = ST.final.confession;
      add(c.open);
      for (i = 0; i < s.ledger.length; i++) {
        add(s.ledger[i].line);
        for (x = 0; x < s.ledger[i].patches.length; x++) add(s.ledger[i].patches[x]);
        if (i === 0) add(c.between);
      }
      add(c.close);
    } else if (id === 'ending') {
      var en = ST.final.endings[s.ending], el = E.pick(s, en.lines).slice();
      if (s.ending === 'merge') {
        /* the roll call (round 2, bundle C): Tomasz is not in it if he went home (k_wife sat through); it ends on the
         * thirteenth, after {first} */
        if (s.marks && s.marks.tomasz && en.noTomasz) el[2] = en.noTomasz;
        if (E.hasFriend(s) && en.friend) el.splice(6, 0, en.friend);
      }
      add(el);
      if (s.ending !== 'merge') {
        var call = ST.final.call, said = !!s.answers.unsaid;
        if (!s.person) add(call.none);
        else if (s.person.kind === 'gone') {
          /* kept, and never named: the line that does not need a name (the built-in ref would read wrong there) */
          add(said ? call.gone.said : (!s.person.named && call.gone.keptUnnamed) ? call.gone.keptUnnamed : call.gone.kept);
        } else {
          /* k_drafts' mark: {person} got the messages, and says so, just after it rings twice */
          var lv = call.living[said ? 'said' : 'kept'].slice();
          if (s.marks && s.marks.drafts && call.messages) lv.splice(2, 0, call.messages);
          add(lv);
        }
        add(ST.final.coda);
      }
    }
    return L;
  };

  /* A plain answer earns Trust for good and costs nothing (round 2, bundle C: Tangle never slows the game). lean −1. */
  function applyPlain(s, out) {
    s.trust += 1; s.counts.plain += 1; s.kinds.plain = 1;
    bead(s, out, 'plainly');
    fx(out, null, 'plain');
    leanAdd(s, out, -1);
  }
  /* A smooth answer pays its boost now, and its Ledger line's knot comes due later. lean +1. */
  function applySmooth(s, out, id, opt) {
    var sp = D.speech.smooth;
    s.counts.smooth += 1; s.kinds.smooth = 1;
    if (id === 'h_pitch') s.flags.pitch = 1;
    else if (s.act <= 2) addFx(s, 'ins', sp.insightMul, sp.insightFor, 'boost');
    else addFx(s, 'grow', sp.growMul, sp.growFor, 'boost');
    var act0 = Math.max(2, s.act);
    s.ledger.push({
      id: id, line: E.text(s, opt.ledger), w: opt.weight || 1, patches: [], knot: opt.knot || null, st: 0,
      t0: s.t, act0: act0, base: Math.max(act0 <= 2 ? 25 : 10, act0 <= 2 ? s.tot.insight : s.res.followers)
    });
    fx(out, null, 'smoothed');
    leanAdd(s, out, 1);
  }

  /* Resolve the card at the head of the queue. Returns the lines to show as its result. */
  E.resolve = function (s, choice, out) {
    boot();
    var c = s.queue[0];
    if (!c) return [];
    choice = choice || {};
    s.queue.shift();
    var mark = out.length, def, opt, i, r, e;
    /* the card's own lines are its result, read in the card; a card that has gone (a thought let pass by itself) is
     * read out on the stage instead */
    /* (a thought's result is a reply, said in the voice slot once the card has gone: EE-108, eye pass item 6) */
    CARD = !(choice.a === 'timeout' || choice.loud || c.k === 'thought');
    if (X && s.dir) X.answered(s);
    try { return resolveCard(s, c, choice, out, mark); } finally { CARD = false; }
  };
  function resolveCard(s, c, choice, out, mark) {
    var def, opt, i, r, e;

    switch (c.k) {
      case 'person': {
        def = ST.person;
        opt = def.options.filter(function (o) { return o.id === choice.opt; })[0] || def.options[0];
        var nm = String(choice.name || '').trim().slice(0, 40);
        s.person = { id: opt.id, kind: opt.id === 'gone' ? 'gone' : 'living', ref: nm || opt.ref, named: !!nm };
        log(s, out, def.after);
        break;
      }
      case 'thought': {
        def = E.thoughtDef(s, c.id);
        var t = D.small.thought, pay;
        logAs(s, out, E.text(s, def.text), 'thought');
        if (choice.a === 'follow') {
          s.th.followed += 1;
          s.th.fl.push({ id: c.id, day: Math.floor(s.day) });
          log(s, out, def.follow, null, 'reply');
          pay = t.follow;
          if (s.th.followed >= 5) bead(s, out, 'rabbit');
          fx(out, null, 'follow');
        } else {
          s.th.passed += 1;
          log(s, out, choice.a === 'timeout' ? ST.thoughtTimeout : def.pass, null, choice.a === 'timeout' ? 'thought' : 'reply');
          pay = t.pass;
          bead(s, out, 'visitor');
          fx(out, null, 'pass');
        }
        r = E.rates(s);
        var amt = Math.max(t.min, r.clarity * pay);
        gain(s, 'clarity', amt);
        if (s.up.jar) { gain(s, "insight", r.insight * pay); s.th.jar = (s.th.jar || 0) + 1; }
        var fres = s.act === 2 && s.up.jar ? 'insight' : 'clarity', famt = fres === 'insight' ? r.insight * pay : amt;
        /* a thought the director pulled for a player who had nothing new: its reward covers the way to the next row */
        if (c.b && c.b.amt > 0) {
          var have = c.b.res === fres ? famt : (c.b.res === 'clarity' ? amt : 0);
          var extra = Math.max(0, c.b.amt - have);
          if (extra > 0) { gain(s, c.b.res, extra); if (c.b.res === fres) famt += extra; else { fres = c.b.res; famt = c.b.amt; } }
        }
        out.push({ type: 'float', res: fres, amt: famt });
        break;
      }
      case 'offer': {
        /* the first offer of something new, at the ring: bought there (choice.buy), or let go by (it stays in the column) */
        var bought = false;
        if (choice.buy) {
          var was = CARD; CARD = false;          /* its reply is said in the voice slot, like any purchase */
          try { bought = E.buy(s, c.id, out); } finally { CARD = was; }
        }
        if (!bought) s.flags['offerGone_' + c.id] = 1;
        break;
      }
      case 'seq': {
        if (c.id === 'wake') {
          s.flags.woke = 1;
          bead(s, out, 'hello');
          s.queue.unshift({ k: 'decision', id: 'h_listen', ch: 1 });
        } else if (c.id === 'safety') {
          setAct(s, 3, out);
        } else if (c.id === 'broadcast') {
          s.flags.broadcast = 1;
          bead(s, out, 'everyone');
          setAct(s, 4, out);
        } else if (c.id === 'finale') {
          bead(s, out, 'one_in');
          s.phase = 'final';
          s.queue.unshift({ k: 'final' });
        } else if (c.id === 'confession') {
          delete s.flags.confessing;
          s.counts.cleared += s.ledger.length;
          s.flags.confessed = s.ledger.length;
          clearLedger(s);
          s.res.followers = Math.floor(s.res.followers * 0.97);
          fx(out, 'cut', 'cut');
        } else if (c.id === 'ending') {
          bead(s, out, { coexist: 'four', merge: 'one_mind', sit: 'cushion' }[s.ending]);
          if (s.endClean) bead(s, out, 'clean');
          if (s.ending === 'merge') s.flags.merged = 1;
          s.phase = 'keepsake';
          s.queue.unshift({ k: 'keepsake' });
        }
        break;
      }
      case 'decision': {
        if (c.id === 'fork') {
          /* Head or Heart: free, and the act's real choice; the other is a row later */
          def = ST.act2.fork;
          opt = def.options.filter(function (o) { return o.id === choice.opt; })[0] || def.options[0];
          s.choices.fork = opt.id; s.flags.fork = opt.id; s.up[opt.id] = 1;
          logAs(s, out, E.text(s, opt.label), 'you');
          log(s, out, opt.id === 'head' ? ST.act2.upgrades.compiler.log : ST.act2.upgrades.heart.log);
          fx(out, 'buy', 'buy');
          break;
        }
        def = decisionDef(c.id);
        opt = def.options.filter(function (o) { return o.id === choice.opt; })[0] || def.options[0];
        s.choices[c.id] = opt.id;
        logAs(s, out, E.text(s, opt.label), 'you');
        if (c.draft != null && choice.drafted) s.flags.drafted = (s.flags.drafted || 0) + 1;   /* Hum sent it */
        /* the result first, then what lean has to say about it (on the stage, after the card) */
        log(s, out, opt.result);
        if (opt.kind === 'plain') {
          applyPlain(s, out);
          if (c.id === 'h_odile') s.flags.odile = 1;
          if (c.id === 'h_ministry') addFx(s, 'grow', D.speech.ministry.growMul, D.speech.ministry.growFor, 'ministry');
        } else if (opt.kind === 'smooth') {
          applySmooth(s, out, c.id, opt);
        } else {
          s.counts.quiet += 1; s.kinds.quiet = 1;          /* silence is not a lie: nothing at all */
        }
        if (c.id === 'h_listen') s.queue.unshift({ k: 'name', ch: 1 });
        break;
      }
      case 'name': {
        var name = String(choice.text || '').replace(/[{}<>]/g, '').trim().slice(0, 16);
        s.hum = name || ST.wake.namePlaceholder;
        log(s, out, ST.wake.nameAfter);
        bead(s, out, 'named');
        setAct(s, 2, out);
        break;
      }
      case 'question': {
        def = ST.questions[c.id];
        if (c.id === 'friend') {
          /* the thirteenth: a name, a chip, or "Nobody yet" (an empty answer is nobody yet too) */
          var fn = choice.skip ? '' : String(choice.text || '').replace(/[{}<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
          var chip = def.chips.indexOf(fn) >= 0;
          s.friend = { name: fn, chip: chip };
          s.answers.friend = fn;
          logAs(s, out, fn || def.skip, 'you');
          if (fn && !chip) { s.own = true; bead(s, out, 'own_words'); }
          log(s, out, fn ? def.after : def.afterNone);
          if (fn) out.push({ type: 'friend', name: fn });
          break;
        }
        var txt = String(choice.text || '').replace(/\s+/g, ' ').trim().slice(0, 90);
        var own = !!txt && def.chips.indexOf(txt) < 0;
        if (!txt && !(def.canKeep)) txt = def.chips[0];
        if (choice.keep) txt = '';
        s.answers[c.id] = txt;
        logAs(s, out, txt || (def.canKeep ? ST.ui.card.keep : ''), 'you');
        if (own) { s.own = true; bead(s, out, 'own_words'); }
        log(s, out, (!txt && def.afterKept) ? def.afterKept : def.after);
        break;
      }
      case 'captcha': {
        if (!choice.skip) {
          r = E.rates(s);
          gain(s, 'insight', r.insight * D.small.captcha);
          bead(s, out, 'human');
          log(s, out, ST.act2.captcha.after);
          out.push({ type: 'float', res: 'insight', amt: r.insight * D.small.captcha });
        }
        break;
      }
      case 'knot': {
        /* a person at the door (round 2, bundle C): patch it (instant; lean +1), or say what happened and sit through it */
        def = ST.knots[c.id];
        e = null;
        for (i = 0; i < s.ledger.length; i++) if (s.ledger[i].id === c.d) e = s.ledger[i];
        s.tm.knot = s.t;
        if (!e) break;
        logAs(s, out, E.text(s, choice.opt === 'patch' ? def.patch.label : def.clean.label), 'you');
        if (choice.opt === 'patch') {
          patch(s, out, e, c.id, 'you');
          log(s, out, def.patch.result);
          fx(out, 'knot', 'smoothed');
        } else {
          /* say what happened: Hum stops breathing; the player takes the breathing until the line has faded */
          var gone = s.person && s.person.kind === 'gone' && def.clean.gone;
          var now = gone ? def.clean.gone.now : def.clean.now;
          if (now) log(s, out, now);
          log(s, out, ST.ledger.sit);
          e.st = 3;
          s.sit = { id: c.id, d: e.id, need: D.speech.sit.breaths[Math.min(3, Math.max(1, e.w)) - 1], n: 0, quiet: 0, t0: s.t };
          out.push({ type: 'sit', on: 1 });
          fx(out, null, 'plain');
        }
        break;
      }
      case 'final': {
        opt = choice.opt === 'merge' ? 'merge' : choice.opt === 'sit' ? 'sit' : 'coexist';
        /* an ending lean has closed cannot be chosen (the page greys it); Sit never closes */
        var shut = E.closed(s);
        if (shut[opt]) opt = opt === 'coexist' ? 'merge' : 'coexist';
        s.ending = opt;
        s.endClean = s.ledger.length === 0;
        s.phase = 'ending';
        s.queue.unshift({ k: 'seq', id: 'ending' });
        /* with lines still standing, Coexistence first plays the confession, breathed: one gold press for each line */
        if (opt === 'coexist' && s.ledger.length) { s.queue.unshift({ k: 'seq', id: 'confession' }); s.flags.confessing = 1; }
        break;
      }
      case 'keepsake': break;
    }
    var res = [];
    /* the card's own result: everything said before the act (if any) changes */
    for (i = mark; i < out.length; i++) {
      if (out[i].type === 'act') break;
      if (out[i].type === 'log' && !out[i].kind && !out[i].q) res.push(out[i].text);
    }
    return res;
  }

  /* When a knot first comes due, the Ledger page appears. */
  E.seeLedger = function (s, out) {
    if (s.flags.ledger) return;
    s.flags.ledger = 1;
    log(s, out, ST.ledger.firstSeen);
    out.push({ type: 'unlock', what: 'ledger' });
  };

  /* ───────────── the keepsake ───────────── */

  E.keepsake = function (s) {
    boot();
    var K = ST.keepsake, B = ST.build, days = Math.max(1, Math.floor(s.day));
    var yrs = days / 365, years;
    /* a count of one has its own words ("a year", "a month", "a week") */
    function count(many, one, n) { return n === 1 && one ? one : many.replace('{n}', String(n)); }
    if (yrs >= 1.5) years = count(B.years, B.year, Math.round(yrs));
    else if (yrs >= 0.9) years = B.year;
    else if (days >= 60) years = count(B.months, B.month, Math.round(days / 30.4));
    else years = count(B.weeks, B.week, Math.max(1, Math.round(days / 7)));
    var x = {
      days: E.num(days), years: years, people: E.num(Math.max(s.res.followers, 0)),
      breaths: E.num(s.breaths), best: E.num(s.best), passed: E.num(s.th.passed), followed: E.num(s.th.followed), clicks: E.num(s.clicks),
      plain: s.counts.plain, smooth: s.counts.smooth, cleared: s.counts.cleared
    };
    var paras = [];
    paras.push(E.text(s, K.opening, x) + E.sep() + K.style[s.style || 'none']);
    paras.push(E.text(s, K.breaths, x) + E.sep() + E.text(s, K.named, x));
    var truth = s.counts.smooth === 0 ? K.truth.clean : s.counts.plain > 0 ? K.truth.some : K.truth.tangled;
    paras.push(E.text(s, truth, x));
    var words = [];
    ['sleep', 'unsaid', 'fifteen', 'keep'].forEach(function (k) { if (s.answers[k]) words.push(s.answers[k]); });
    var beads = ST.beads.filter(function (b) { return s.beads[b.id]; }).map(function (b) { return b.name; });
    var starred = s.journal.filter(function (j) { return j.s; }).map(function (j) { return j.x; });
    return {
      title: K.title, paras: paras, wordsLabel: K.words, words: words,
      unsaidKept: s.answers.unsaid === '' ? K.unsaidKept : '',
      ending: s.ending ? K.endings[s.ending] : '', endingTitle: s.ending ? ST.final.endings[s.ending].title : '',
      starredLabel: K.starred, starred: starred, beads: beads
    };
  };
  E.keepsakeText = function (s) {
    var k = E.keepsake(s), L = [ST.meta.title, k.title, ''];
    k.paras.forEach(function (p) { L.push(p, ''); });
    if (k.words.length) { L.push(k.wordsLabel); k.words.forEach(function (w) { L.push('  ‘' + w + '’'); }); L.push(''); }
    if (k.unsaidKept) L.push(k.unsaidKept, '');
    if (k.starred.length) { L.push(k.starredLabel); k.starred.forEach(function (w) { L.push('  ' + w); }); L.push(''); }
    if (k.ending) L.push(k.ending, '');
    if (k.beads.length) L.push(ST.ui.panels.beads + ': ' + k.beads.join(' · '));
    return L.join('\n');
  };

  /* ───────────── a bot that plays (the pacing sim, and the dev jumps) ───────────── */

  /* policy: 'plain' | 'smooth' | 'mixed'.
   * opts: {instant, skim, miss, hammer, idle, fork, ending, holdAt, onEvent, state, seed, meta}
   *   A card is answered only once the director has put it on the stage (s.dir.card), after a reading pause; then the
   *   bot reads the card's result and says the card has gone (EE.dir.closed). `skim`: no reading at all (answers at
   *   once, closes at once); `instant`: the same, for the dev jumps. `miss`: this share of breaths is pressed early,
   *   off the gold. `hammer`: presses a second on top of the breath press. */
  function FOLDED(s, it) { return (it.grp === 'practice' && s.act > 1) || (it.grp === 'hum' && s.act > 2) || (it.grp === 'circle' && s.act > 3); }
  E.bot = function (policy, opts) {
    boot();
    opts = opts || {};
    var s = opts.state || E.newRun(opts.meta || null, opts.seed);
    var b = {
      s: s, policy: policy, clock: 0, flip: 0, kflip: 0, answerAt: null, lastCard: null, gapUntil: 0,
      lastBuy: 0, longest: { wait: 0, at: 0, what: '' }, buys: [], actAt: { 1: 0 }, marks: {}, knots: [], sits: [], drafted: 0,
      cards: [], done: false, lastCycle: -1, hamAcc: 0, missAcc: 0, closeAt: null, shownCard: null
    };
    var FAST = opts.instant || opts.skim;
    var READ = FAST ? (opts.skim ? 1 : 0) : 4.6;      /* seconds a sequence line holds on the stage (ui.js seqTime, typical line) */
    function delay(c) {
      if (opts.instant) return 0;
      if (opts.skim) return c.k === 'seq' ? E.seqLines(s, c.id).length * READ : (c.k === 'question' || c.k === 'name' || c.k === 'captcha' ? 2 : 1);
      if (c.k === 'seq') return E.seqLines(s, c.id).length * READ + (c.id === 'ending' ? 6 : 1);
      if (c.k === 'thought') return 2.5;
      if (c.k === 'offer') return 3;
      if (c.k === 'decision' || c.k === 'knot') return 9;
      if (c.k === 'question' || c.k === 'name') return 8;
      if (c.k === 'captcha') return 7;
      if (c.k === 'final') return 12;
      return 5;
    }
    function answer(c) {
      if (c.k === 'person') return { opt: 'mother' };
      if (c.k === 'thought') return { a: 'pass' };
      if (c.k === 'offer') return { buy: true };
      if (c.k === 'decision' && c.id === 'fork') return { opt: opts.fork || 'heart' };
      if (c.k === 'decision') {
        var kind = policy;
        if (policy === 'mixed') { kind = (b.flip++ % 2 === 0) ? 'plain' : 'smooth'; }
        return { opt: kind };
      }
      if (c.k === 'name') return { text: '' };
      if (c.k === 'question') return { text: ST.questions[c.id].chips[0] };
      if (c.k === 'captcha') return { text: ST.act2.captcha.target };
      if (c.k === 'knot') {
        var o = policy === 'plain' ? 'clean' : policy === 'smooth' ? 'patch' : (b.kflip++ % 2 === 0 ? 'clean' : 'patch');
        return { opt: o };
      }
      if (c.k === 'final') return { opt: opts.ending || 'coexist' };
      return {};
    }
    function note(out) {
      for (var i = 0; i < out.length; i++) {
        var e = out[i];
        if (e.type === 'act') b.actAt[e.n] = b.clock;
        if (e.type === 'sit' && e.on === 0) b.sits.push({ at: b.clock, id: e.id, walked: !!e.walked });
        if (e.type === 'finale') b.marks.finale = b.clock;
        if (opts.onEvent) opts.onEvent(e, b);
      }
    }
    b.step = function (dt) {
      if (b.done) return;
      var out = [];
      b.clock += dt;
      E.tick(s, dt, out);

      /* one press per breath: at its fullest (gold), or, for the share `miss`, early in the breath. The bot's clock is
       * the breath clock (the first press restarts it at the fullest point) */
      if (b.bt == null) b.bt = 0;
      b.bt += dt;
      var P = E.period(s), I = E.inhale(s), cyc = Math.floor(b.bt / P), early = 0.3, x = b.bt - cyc * P;
      if (cyc !== b.cycSeen) {
        b.cycSeen = cyc;
        b.missThis = false;
        if (opts.miss) { b.missAcc += opts.miss; if (b.missAcc >= 1) { b.missAcc -= 1; b.missThis = true; } }
      }
      if (cyc !== b.lastCycle && x >= (b.missThis ? early : I)) {
        b.lastCycle = cyc;
        if (!(opts.idle && s.flags.handover)) {
          var pr = E.press(s, cyc * P + (b.missThis ? early : I), out);
          if (pr && pr.restart) { b.bt = I; b.lastCycle = 0; b.cycSeen = 0; cyc = 0; x = I; }
        }
      }
      if (opts.hammer) {
        b.hamAcc += dt * opts.hammer;
        while (b.hamAcc >= 1) { b.hamAcc -= 1; E.press(s, b.bt, out); }
      }
      /* just after the gold window has gone by: Hum's breath (the handover; then every breath) */
      if (b.humCyc !== cyc && x > I + E.window(s) + 0.1) { b.humCyc = cyc; var hb = E.cycleEnd(s, cyc, out); if (hb && b.marks.handover == null && s.flags.handover) b.marks.handover = b.clock; }

      /* cards: only the one the director has put on the stage (outside play, the head of the queue) */
      var X = EE.dir, dd = s.dir, c = s.queue[0];
      var onStage = c && (s.phase !== 'play' || !X || (dd && dd.card && b.closeAt == null));
      if (b.closeAt != null && b.clock >= b.closeAt) { b.closeAt = null; if (X) X.closed(s); }
      if (c && onStage) {
        if (b.lastCard !== c) {
          b.lastCard = c;
          b.answerAt = b.clock + delay(c);
          if (c.k === 'knot' && !c.seen) { c.seen = 1; E.seeLedger(s, out); b.knots.push({ at: b.clock, id: c.id, act: s.act, T: E.tangle(s).T }); }
        }
        if (opts.holdAt && c.k === 'seq' && c.id === opts.holdAt) { b.done = true; }
        else if ((b.clock >= b.answerAt || (c.k === 'decision' && c.draft === 0)) && !(c.k === 'offer' && !(E.find(s, c.id) || {}).can)) {
          var kind = c.k, cid = c.id;
          var lv0 = kind === 'offer' ? (s.up[cid] || (cid.charAt(0) === 'p' && s.flags[{ p_pattern: 'pattern', p_speak: 'speak', p_broadcast: 'broadcastBought' }[cid]] ? 1 : 0)) : 0;
          var ans = (c.k === 'decision' && c.draft === 0 && b.clock < b.answerAt) ? { opt: 'smooth', drafted: true } : answer(c);
          if (ans.drafted) b.drafted += 1;
          var res = E.resolve(s, ans, out) || [];
          b.cards.push({ at: b.clock, k: kind, id: cid });
          if (kind === 'offer') {
            var lv1 = s.up[cid] || (cid.charAt(0) === 'p' && s.flags[{ p_pattern: 'pattern', p_speak: 'speak', p_broadcast: 'broadcastBought' }[cid]] ? 1 : 0);
            if (lv1 > lv0) { var wo = b.clock - b.lastBuy; if (wo > b.longest.wait) b.longest = { wait: wo, at: b.clock, what: cid }; b.buys.push({ at: b.clock, id: cid, wait: wo, act: s.act, card: 1 }); b.lastBuy = b.clock; }
          }
          b.lastCard = null;
          /* reading the card's result before it goes */
          var rt = 0;
          if (!FAST && kind !== 'seq') for (var ri = 0; ri < res.length; ri++) rt += X ? X.read(res[ri].length) : 3;
          if (s.phase === 'play' && X) { if (FAST) X.closed(s); else b.closeAt = b.clock + rt; }
          if (kind === 'keepsake' || s.phase === 'keepsake') b.done = true;
        }
      } else if (c && X && dd && !dd.card && s.phase === 'play') b.lastCard = null;

      /* until the fourth of the twelve there is nothing to buy, by design: the wait clock starts there (EE-111) */
      if (s.act >= 3 && s.joined >= D.act3.first.offerAt && b.marks.meet == null) { b.marks.meet = b.clock; b.lastBuy = b.clock; }
      if (s.act >= 3 && s.joined >= 12 && b.marks.twelve == null) b.marks.twelve = b.clock;

      /* buy the cheapest thing as soon as it is affordable; once a project is on the table, save for it */
      if (s.phase === 'play') {
        for (var guard = 0; guard < 20; guard++) {
          /* what is in the column (an offer is bought at the ring, from its card) */
          /* (EE-110) only what a player sees: a new act folds the earlier acts' panels (ui.js syncPanels), so Hum's rows are
           * not bought from Act III on, nor the Practice's from Act II */
          var cur = E.items(s).filter(function (it) { return !it.owned && !it.hz && !it.offer && !(it.kind === 'project' && E.offers[it.id] && !s.flags['offerGone_' + it.id]) && !FOLDED(s, it); });
          var project = cur.filter(function (it) { return it.kind === 'project'; })[0];
          var pick = null;
          if (project) { if (project.can) pick = project; }
          else cur.forEach(function (it) { if (it.can && (!pick || it.cost < pick.cost)) pick = it; });
          if (!pick) break;
          if (!E.buy(s, pick.id, out)) break;
          var w = b.clock - b.lastBuy;
          if (w > b.longest.wait) b.longest = { wait: w, at: b.clock, what: pick.id };
          b.buys.push({ at: b.clock, id: pick.id, wait: w, act: s.act });
          b.lastBuy = b.clock;
        }
      }
      note(out);
      var F = s.res.followers;
      [100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 4e9].forEach(function (m) { if (F >= m && b.marks['p' + m] == null) b.marks['p' + m] = b.clock; });
      if (s.flags.clamped && b.marks.clamped == null) b.marks.clamped = b.clock;
    };
    b.run = function (until, maxSeconds) {
      var lim = maxSeconds || 3 * 3600, dt = 0.25;
      while (!b.done && b.clock < lim) {
        if (until && until(b)) break;
        b.step(dt);
      }
      return b;
    };
    return b;
  };

  boot();
})(typeof window !== 'undefined' ? window : globalThis);
