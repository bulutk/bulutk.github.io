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
 * Cards wait in state.queue (so a refresh never loses one); resolve them with E.resolve(state, choice, out).
 */
(function (root) {
  'use strict';
  var EE = root.EE = root.EE || {};
  var E = EE.econ = {};
  var D, ST;
  function boot() { D = EE.data; ST = EE.story; }

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

  E.voice = function (s) { return s.trust >= E.raw(s) ? 'plain' : 'smooth'; };
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

  function log(s, out, lines, x) {
    lines = E.pick(s, lines);
    if (lines == null) return;
    if (!Array.isArray(lines)) lines = [lines];
    for (var i = 0; i < lines.length; i++) out.push({ type: 'log', text: E.text(s, lines[i], x) });
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
      v: 2, seed: (seed == null ? 20261112 : seed) >>> 0, t: 0, act: 1, phase: 'play', day: 1,
      res: { clarity: 0, insight: 0, followers: 0, energy: 0 },
      tot: { clarity: 0, insight: 0, energy: 0 },
      up: {}, style: null, person: null, hum: ST.meta.defaultHum,
      answers: {}, own: false,
      trust: 0, ledger: [], choices: {}, kinds: {}, counts: { plain: 0, smooth: 0, quiet: 0, cleared: 0 },
      fx: [], haltUntil: 0, alloc: { outreach: 0.34, sitting: 0.33, support: 0.33 },
      streak: 0, best: 0, breaths: 0, clicks: 0, lastOnCycle: -1, lastPressCycle: -1, lastOnDay: 1, lastBt: -9, cy: { n: -1, paid: 0, shut: 0 },
      th: { passed: 0, followed: 0, seen: [], fl: [], next: 0 },
      chat: { used: [], next: 0 },
      queue: [], flags: {}, beads: {},
      joined: 0, first: { last: 0, want: 0, knock: 0 }, bought4: 0, shown4: [], epi: 0, dawnIdx: 0, mileIdx: 0,
      tm: { lotus: 0, gift: 0, orb: 0, knot: -999, still: 0 },
      chart: [], chartT: 0, peak: 0,
      journal: [], ending: null, endClean: false,
      meta: meta || E.newMeta()
    };
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

  E.raw = function (s) { var r = 0; for (var i = 0; i < s.ledger.length; i++) r += s.ledger[i].w; return r; };
  E.tangle = function (s) {
    var raw = E.raw(s);
    var scale = s.act >= 3 ? 1 + Math.log10(Math.max(1, s.res.followers)) / 5 : 1;
    return { raw: raw, scale: scale, T: raw * scale };
  };

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
    if (s.haltUntil > s.t) a.push({ k: 'all', m: 0, tag: 'halt', left: s.haltUntil - s.t, len: D.speech.collapse.halt });
    return a;
  };

  /* ───────────── rates ───────────── */

  E.rates = function (s) {
    boot();
    var up = s.up, F = s.res.followers, a1 = D.act1, a2 = D.act2, a3 = D.act3, a4 = D.act4;
    var tg = E.tangle(s);
    var live = s.phase === 'play' && s.t >= s.haltUntil;
    var all = (1 + D.sigilBonus * s.meta.sigils) * fxMul(s, 'all') * (live ? 1 : 0);
    var trustM = 1 + a3.trustMult * s.trust;
    var id, i;

    /* Clarity */
    var cps = 0, cPress = 1;
    for (i = 0; i < a1.order.length; i++) {
      id = a1.order[i];
      if (up[id]) { cps += a1.up[id].cps || 0; cPress *= a1.up[id].press || 1; }
    }
    if (s.style === 'idle') cps *= a1.styleMult;
    if (s.style === 'active') cPress *= a1.styleMult;
    var sitYield = up.rooms ? 2 : 1;
    var clarity = (cps + F * s.alloc.sitting * a3.sittingClarity * sitYield) * all;

    /* Insight */
    var head = 0, heart = 0, pressAdd = 0;
    for (id in a2.gens) {
      var g = a2.gens[id], lv = up[id] || 0;
      if (g.tree === 'head') head += g.ips * lv; else heart += g.ips * lv;
      if (g.press) pressAdd += g.press * lv;
    }
    if (up.compiler) head *= 2;
    if (up.heartbeat) heart *= 2;
    var iMul = (1 + a2.trustInsight * s.trust) * (s.flags.odile ? a2.odileMult : 1) * (up.science ? a4.up.science.insight : 1) * fxMul(s, 'ins');
    var support = F * s.alloc.support * a3.supportInsight * (up.pocket ? 2 : 1);
    var insightGross = ((head + heart) * iMul + support * fxMul(s, 'ins')) * all;
    var upI = 1 - Math.pow(D.speech.upkeepInsight, tg.T);
    var insight = insightGross * (1 - upI);

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
    if (up.fusion) r *= a4.up.fusion.rMult;
    var outreachEff = a3.outreachBase + a3.outreachSlope * s.alloc.outreach;
    var gMul = fxMul(s, 'grow') * (s.flags.pitch ? a3.pitchR : 1);
    /* X: everything that scales word of mouth, and an invitation made on the breath */
    var X = outreachEff * trustM * gMul * Math.max(0, 1 - F / D.K);
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
    var upE = s.act >= 4 ? 1 - Math.pow(D.speech.upkeepEnergy, tg.T) : 0;
    var energy = 0;
    if (up.dynamo) energy = F * s.alloc.sitting * a4.k * sitYield * eMul * trustM * (1 - upE) * all * (s.act >= 4 ? 1 : a3.trickle);

    /* The press, for the current act: flat part, and what an on-breath press adds on top. */
    var act = s.act, flatP, share, sig = 1 + D.sigilBonus * s.meta.sigils, ps = D.pressSeconds[act] || 0;
    if (act === 1) { flatP = cPress * sig; share = 0; }
    else if (act === 2) { flatP = (1 + pressAdd) * sig; share = ps * insight; }
    else if (act === 3) { flatP = pPress * gMul * sig * tap; share = a3.invite * pPress * F * X * sig * tap; }
    else { flatP = ePress * sig; share = ps * ePress * energy; }
    if (!live) { flatP = 0; share = 0; }

    return {
      clarity: clarity, insight: insight, insightGross: insightGross, upI: upI, upE: upE,
      people: people, flat: flat, r: r, energy: energy,
      T: tg.T, raw: tg.raw, scale: tg.scale, trustM: trustM,
      pressFlat: flatP, pressShare: share, live: live
    };
  };

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
    out.push({ type: 'join', i: s.joined - 1 });
    log(s, out, ST.act3.joined, { name: p.name, city: p.city, line: p.line });
    return true;
  }
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

  E.window = function (s) { boot(); return s.up.sync ? D.breath.windowSync : D.breath.window; };
  /* The picture's breath phase: 0 empty, 0.5 fullest, 1 empty. In-breath and out-breath are not the same length,
   * so the clock is warped: 0 → 0.5 over `inhale` seconds, 0.5 → 1 over the rest. */
  E.breathPhase = function (bt) {
    boot();
    var B = D.breath, x = ((bt % B.period) + B.period) % B.period;
    return x < B.inhale ? 0.5 * x / B.inhale : 0.5 + 0.5 * (x - B.inhale) / (B.period - B.inhale);
  };
  E.inWindow = function (s, bt) {
    var P = D.breath.period, off = Math.abs((bt % P) - D.breath.inhale);
    return off <= E.window(s);
  };

  /* bt: the breath clock, in seconds. `auto` = Hum taking the breath for you (Heartbeat Loop).
   * A breath pays once (Bulut, 2026-11-13: "spamming should not give you more than being in sync and hitting on top").
   * Per breath cycle: ordinary presses pay as always, but together at most `ordinaryCap` ordinary presses' worth; the
   * on-breath press tops the cycle up to the full on-breath value (minus what the ordinary presses already paid) and
   * closes it; after that nothing in the cycle pays. A press that pays nothing still registers (sound, ripple). */
  E.press = function (s, bt, out, auto) {
    boot();
    if (s.phase !== 'play' && s.phase !== 'final') return null;
    var B = D.breath, cyc = Math.floor(bt / B.period);
    if (!s.cy || s.cy.n !== cyc) s.cy = { n: cyc, paid: 0, shut: 0 };
    var cy = s.cy;
    var inWin = auto ? true : E.inWindow(s, bt);
    var on = inWin && s.lastOnCycle !== cyc;
    var r = E.rates(s), res = E.actRes(s), amt, weak = false;
    if (on) {
      amt = (r.pressFlat + r.pressShare) * B.onMult * (1 + B.streakStep * Math.min(s.streak, B.streakCap));
      amt = cy.shut ? 0 : Math.max(0, amt - cy.paid);
      cy.shut = 1;
      s.lastOnCycle = cyc;
      if (!auto) {
        s.streak += 1; s.breaths += 1; s.lastOnDay = s.day;
        if (s.streak > s.best) s.best = s.streak;
        if (s.streak >= 10) bead(s, out, 'in_time');
        if (s.phase === 'final') s.flags.finalBreaths = (s.flags.finalBreaths || 0) + 1;
      }
    } else {
      amt = r.pressFlat;
      if (!inWin) s.streak = 0;
      /* a restless press: an ordinary press hard on the heels of the last one pays a quarter */
      var gap = bt - s.lastBt;
      if (gap >= 0 && gap < B.restless) { amt *= B.restlessPay; weak = true; }
      amt = cy.shut ? 0 : Math.min(amt, Math.max(0, B.ordinaryCap * r.pressFlat - cy.paid));
      cy.paid += amt;
    }
    if (!auto) s.lastBt = bt;
    if (!auto) {
      s.clicks += 1; s.lastPressCycle = cyc;
      bead(s, out, 'first_breath');
      if (s.clicks <= ST.firstBreaths.length) log(s, out, ST.firstBreaths[s.clicks - 1]);
      /* Epiphany Orb */
      if (s.phase === 'play' && s.t >= s.tm.orb && E.rand(s) < D.small.orb.chance) {
        s.tm.orb = s.t + D.small.orb.cooldown;
        out.push({ type: 'orb' });
      }
    }
    if (s.phase !== 'play') amt = 0;
    if (res === 'followers') amt = Math.min(amt, Math.max(0, D.K * D.act4.closeAt - s.res.followers));
    if (meeting(s) && s.phase === 'play') {
      /* an Invite on the breath asks the next one in; three ordinary presses knock loudly enough to do the same */
      var f = s.first;
      if (on) f.want = 1;
      else { f.knock += 1; if (f.knock >= D.act3.first.knocks) { f.knock = 0; f.want = 1; } }
      amt = (f.want && s.t - f.last >= D.act3.first.spacing && arrive(s, out)) ? 1 : 0;
    } else gain(s, res, amt);
    return { on: on, inWin: inWin, amt: amt, res: res, streak: s.streak, weak: weak };
  };

  /* Called by the clock once per finished breath cycle. Hum breathes for you if you did not. */
  E.cycleEnd = function (s, cyc, out) {
    if (s.phase !== 'play' || !s.up.heartbeat) return null;
    if (s.lastPressCycle === cyc || s.lastOnCycle === cyc) return null;
    return E.press(s, cyc * D.breath.period + D.breath.inhale, out, true);
  };

  E.catchOrb = function (s, out) {
    boot();
    var o = D.small.orb, p = paySeconds(s, o.seconds, o.min, !!s.up.dreams);
    var q = ST.orbs[Math.floor(E.rand(s) * ST.orbs.length)];
    log(s, out, q);
    bead(s, out, 'orb');
    fx(out, 'milestone', 'orb');
    out.push({ type: 'float', res: p.res, amt: p.amt });
    return q;
  };
  E.catchLotus = function (s, out) {
    var l = D.small.lotus;
    addFx(s, 'all', l.mult, l.lasts, 'lotus');
    log(s, out, ST.lotus[Math.floor(E.rand(s) * ST.lotus.length)]);
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
    if (n === 0) log(s, out, ST.stillness.line);
    else if (n <= ST.stillness.again.length) log(s, out, ST.stillness.again[n - 1]);
    bead(s, out, 'assignment');
    var p = { res: E.actRes(s), amt: actRate(s, r) * secs };
    out.push({ type: 'float', res: p.res, amt: p.amt });
  };
  E.restless = function (s, out) {
    if (s.flags.restless) return;
    s.flags.restless = 1;
    log(s, out, ST.restless);
  };

  /* ───────────── things to buy ───────────── */

  function genCost(s, id) {
    var g = D.act2.gens[id];
    return Math.floor(g.base * Math.pow(g.mult, s.up[id] || 0) * (s.flags.odile ? D.act2.odileCost : 1));
  }
  function capCost(s, id) { return Math.floor(D.act2.caps[id].cost * (s.flags.odile ? D.act2.odileCost : 1)); }
  E.cost4 = function (s) { var c = D.act4.costs; return c[Math.min(s.bought4, c.length - 1)]; };

  /* Everything the player can see in the shop right now. */
  E.items = function (s) {
    boot();
    var list = [], i, id, a1 = D.act1, a3 = D.act3, a4 = D.act4;
    function push(o) { o.can = !o.owned && s.res[o.cur] >= o.cost && (!o.need || s.res.followers >= o.need) && s.phase === 'play'; list.push(o); }

    /* Act I: one at a time, in order */
    var shown = false;
    for (i = 0; i < a1.order.length; i++) {
      id = a1.order[i];
      if (s.up[id]) push({ id: id, grp: 'practice', kind: 'one', cur: 'clarity', cost: a1.up[id].cost, owned: true });
      else if (!shown) {
        shown = true;
        if (i > 0 || s.tot.clarity >= a1.up[id].cost * 0.5) push({ id: id, grp: 'practice', kind: 'one', cur: 'clarity', cost: a1.up[id].cost, owned: false });
      }
    }
    if (s.up.flow) push({ id: 'p_pattern', grp: 'practice', kind: 'project', cur: 'clarity', cost: a1.project.cost, owned: !!s.flags.woke || !!s.flags.pattern });

    /* Act II: two trees, always visible */
    if (s.act >= 2) {
      for (i = 0; i < D.act2.order.length; i++) {
        id = D.act2.order[i];
        if (D.act2.gens[id]) push({ id: id, grp: D.act2.gens[id].tree, kind: 'gen', cur: 'insight', cost: genCost(s, id), level: s.up[id] || 0, owned: false });
        else push({ id: id, grp: D.act2.caps[id].tree, kind: 'one', cur: 'insight', cost: capCost(s, id), owned: !!s.up[id] });
      }
      if (s.flags.speakSeen) push({ id: 'p_speak', grp: 'hum', kind: 'project', cur: 'insight', cost: D.act2.project.cost, owned: !!s.flags.speak });
    }

    /* Act III: in order, paid in Insight; nothing to buy until the first twelve are in */
    if (s.act >= 3 && s.joined >= a3.first.n) {
      shown = false;
      for (i = 0; i < a3.order.length; i++) {
        id = a3.order[i];
        if (s.up[id]) push({ id: id, grp: 'circle', kind: 'one', cur: 'insight', cost: a3.up[id].cost, owned: true });
        else if (!shown) { shown = true; push({ id: id, grp: 'circle', kind: 'one', cur: 'insight', cost: a3.up[id].cost, owned: false }); }
      }
      if (s.up.dynamo && s.answers.keep != null) push({ id: 'p_broadcast', grp: 'circle', kind: 'project', cur: 'insight', cost: a3.project.cost, need: a3.project.people, owned: !!s.flags.broadcastBought });
    }

    /* Act IV: three on the table at a time; the n-th purchase costs base × step^n whichever it is */
    if (s.act >= 4) {
      for (i = 0; i < a4.order.length; i++) {
        id = a4.order[i];
        if (s.up[id]) push({ id: id, grp: 'engine', kind: 'one', cur: 'energy', cost: 0, owned: true });
      }
      for (i = 0; i < s.shown4.length; i++) push({ id: s.shown4[i], grp: 'engine', kind: 'one', cur: 'energy', cost: E.cost4(s), owned: false });
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
    return e || { name: id, desc: '' };
  };

  E.buy = function (s, id, out) {
    boot();
    var it = E.find(s, id);
    if (!it || it.owned || !it.can) return false;
    s.res[it.cur] -= it.cost;
    var first = !s.up[id];
    s.lastBuyT = s.t;

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
    var txt = E.itemText(s, id);
    if (first && txt.log) log(s, out, txt.log);
    fx(out, 'buy', 'buy');

    if (id === 'ambient') out.push({ type: 'unlock', what: 'ambient' });
    if (id === 'tracker') out.push({ type: 'unlock', what: 'tracker' });
    if (id === 'garden') { s.flags.sakura = 1; s.flags.chartAt = s.t + 8; }
    if (id === 'group') s.queue.push({ k: 'style' });
    if (id === 'flow') { s.flags.motes = 1; out.push({ type: 'unlock', what: 'project' }); fx(out, null, 'unlock'); }
    if (id === 'dynamo') { fx(out, 'flash', 'milestone'); out.push({ type: 'unlock', what: 'energy' }); }
    if (D.act4.up[id]) {
      s.bought4 += 1;
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

  /* ───────────── allocation ───────────── */

  E.setAlloc = function (s, key, value) {
    var keys = ['outreach', 'sitting', 'support'], a = s.alloc;
    value = Math.max(0, Math.min(1, Math.round(value * 100) / 100));
    var others = keys.filter(function (k) { return k !== key; });
    var rest = 1 - value, sum = a[others[0]] + a[others[1]];
    var o0 = sum > 0 ? Math.round(rest * (a[others[0]] / sum) * 100) / 100 : Math.round(rest * 50) / 100;
    a[key] = value; a[others[0]] = o0; a[others[1]] = Math.max(0, Math.round((rest - o0) * 100) / 100);
  };

  /* ───────────── the clock ───────────── */

  function setAct(s, n, out) {
    s.act = n;
    out.push({ type: 'act', n: n });
    if (n === 2) {
      log(s, out, ST.act2.open);
      s.th.next = s.t + between(s, D.act2.thoughtGap[0], D.act2.thoughtGap[1]);
      s.chat.next = s.t + D.small.chatter[2] * 0.6;
      s.tm.gift = s.t + expo(s, D.small.gift.mean) + 40;
    }
    if (n === 3) {
      log(s, out, ST.act3.open);
      s.res.followers = 0; s.joined = 0; s.first = { last: s.t, want: 0, knock: 0 };
      arrive(s, out);
      s.tm.lotus = s.t + expo(s, D.small.lotus.mean) + 30;
      s.chat.next = s.t + D.small.chatter[3];
    }
    if (n === 4) {
      log(s, out, ST.act4.open);
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
  }

  function triggers(s, out) {
    var f = s.flags, q = s.queue, a2 = D.act2.at, a3 = D.act3.at, i;

    /* Act I */
    if (!f.person && s.tot.clarity >= D.act1.personAt) { f.person = 1; q.push({ k: 'person' }); }
    var dawn = Math.min(1, s.tot.clarity / D.act1.dawnAt);
    while (s.dawnIdx < ST.dawn.length && dawn >= ST.dawn[s.dawnIdx].at) { log(s, out, ST.dawn[s.dawnIdx].line); s.dawnIdx++; }
    if (dawn >= 1) bead(s, out, 'sunrise');
    if (f.chartAt && !f.chart && s.t >= f.chartAt) { f.chart = 1; log(s, out, ST.act1.chart.log); out.push({ type: 'unlock', what: 'chart' }); fx(out, null, 'unlock'); }

    /* Stray thoughts: Act I and II only, never two waiting */
    if (s.act <= 2 && s.t >= s.th.next && (s.act === 2 || !f.pattern)) {
      var gap = s.act === 1 ? D.act1.thoughtGap : D.act2.thoughtGap;
      s.th.next = s.t + between(s, gap[0], gap[1]);
      var waiting = false;
      for (i = 0; i < q.length; i++) if (q[i].k === 'thought') waiting = true;
      if (!waiting && s.clicks > 0) {
        var pool = ST.thoughts.filter(function (t) { return s.th.seen.indexOf(t.id) < 0 && (!t.needsPerson || s.person); });
        if (!pool.length) { s.th.seen = []; pool = ST.thoughts.filter(function (t) { return !t.needsPerson || s.person; }); }
        var th = pool[Math.floor(E.rand(s) * pool.length)];
        s.th.seen.push(th.id);
        q.push({ k: 'thought', id: th.id });
      }
    }

    /* Act II */
    if (s.act >= 2) {
      var ti = s.tot.insight;
      if (!f.whyAmI && ti >= a2.whyAmI) { f.whyAmI = 1; log(s, out, ST.act2.whyAmI); }
      if (!f.q_sleep && ti >= a2.sleep) { f.q_sleep = 1; q.push({ k: 'question', id: 'sleep' }); }
      if (!f.captcha && ti >= a2.captcha) { f.captcha = 1; q.push({ k: 'captcha' }); }
      if (!f.h_alive && ti >= a2.h_alive) { f.h_alive = 1; q.push({ k: 'decision', id: 'h_alive' }); }
      if (!f.q_unsaid && ti >= a2.unsaid) { f.q_unsaid = 1; q.push({ k: 'question', id: 'unsaid' }); }
      if (!f.h_odile && ti >= a2.h_odile) { f.h_odile = 1; q.push({ k: 'decision', id: 'h_odile' }); }
      if (!f.q_fifteen && ti >= a2.fifteen) { f.q_fifteen = 1; q.push({ k: 'question', id: 'fifteen' }); }
      if (!f.speakSeen && ti >= D.act2.project.at) { f.speakSeen = 1; log(s, out, ST.act2.project.ask); out.push({ type: 'unlock', what: 'project' }); fx(out, null, 'unlock'); }
      if (!f.callback && s.act === 2 && s.th.fl.length && ti >= 400) {
        f.callback = 1;
        var c = s.th.fl[0], tdef = ST.thoughts.filter(function (t) { return t.id === c.id; })[0];
        if (tdef) log(s, out, ST.act2.callback, { n: c.day, short: E.text(s, tdef.short) });
      }
      /* chatter */
      if (s.t >= s.chat.next && s.phase === 'play') {
        s.chat.next = s.t + (D.small.chatter[s.act] || 90) * between(s, 0.8, 1.2);
        var lines = ST.act2.chatter[E.voice(s)], key = E.voice(s);
        var free = [];
        for (i = 0; i < lines.length; i++) if (s.chat.used.indexOf(key + i) < 0) free.push(i);
        if (!free.length) { s.chat.used = s.chat.used.filter(function (u) { return u.indexOf(key) !== 0; }); for (i = 0; i < lines.length; i++) free.push(i); }
        var ci = free[Math.floor(E.rand(s) * free.length)];
        s.chat.used.push(key + ci);
        log(s, out, lines[ci]);
      }
      /* Hum's gift */
      if (s.t >= s.tm.gift && !q.length) {
        s.tm.gift = s.t + expo(s, D.small.gift.mean) + D.small.gift.lasts;
        addFx(s, 'all', D.small.gift.mult, D.small.gift.lasts, 'gift');
        log(s, out, ST.act2.gifts[Math.floor(E.rand(s) * ST.act2.gifts.length)]);
        fx(out, null, 'unlock');
      }
    }

    /* Act III and on */
    if (s.act >= 3) {
      var F = s.res.followers;
      if (F > s.peak) s.peak = F;
      if (meeting(s) && s.phase === 'play') {
        var fm = s.first, el3 = s.t - fm.last;
        if ((fm.want && el3 >= D.act3.first.spacing) || el3 >= D.act3.first.auto) { arrive(s, out); F = s.res.followers; }
      }
      while (s.mileIdx < ST.act3.milestones.length && F >= ST.act3.milestones[s.mileIdx].at && s.joined >= 12) {
        var m = ST.act3.milestones[s.mileIdx]; s.mileIdx++;
        log(s, out, m.line);
        if (m.at === 12) bead(s, out, 'twelve');
        if (m.at === 1000000) bead(s, out, 'million');
        if (m.at >= 100) fx(out, 'milestone', 'milestone');
      }
      if (!f.alloc && F >= D.act3.allocAt) { f.alloc = 1; out.push({ type: 'unlock', what: 'alloc' }); fx(out, null, 'unlock'); }
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
      while (s.epi < ep.length && s.tot.energy >= th4[s.epi]) { log(s, out, ep[s.epi]); s.epi++; fx(out, 'milestone', 'milestone'); }
      if (f.clamped && s.bought4 >= D.act4.order.length && s.phase === 'play' && !f.finale) {
        f.finale = 1;
        s.phase = 'finale';
        q.length = 0;
        q.push({ k: 'seq', id: 'finale' });
        out.push({ type: 'finale' });
      }
    }

    /* Knots come due; the whole thing can come apart */
    if (s.phase !== 'play') return;
    var tg = E.tangle(s), K = D.speech.knot;
    if (tg.T >= D.speech.collapse.at && s.ledger.length) {
      var act2 = s.act <= 2;
      if (act2) s.res.insight *= (1 - D.speech.collapse.lose); else leave(s, D.speech.collapse.lose);
      s.counts.collapsed = (s.counts.collapsed || 0) + 1;
      s.flags.collapseT = s.t;
      clearLedger(s);
      s.haltUntil = s.t + D.speech.collapse.halt;
      /* forced: ahead of everything except a sequence that is already being read */
      var at = 0;
      while (at < s.queue.length && (s.queue[at].k === 'seq' || s.queue[at].k === 'name')) at++;
      s.queue.splice(at, 0, { k: 'collapse' });
      fx(out, 'cut', 'cut');
      out.push({ type: 'collapse' });
      return;
    }
    if (s.t - s.tm.knot >= K.apart) {
      var has = false;
      for (i = 0; i < q.length; i++) if (q[i].k === 'knot') has = true;
      if (!has) for (i = 0; i < s.ledger.length; i++) {
        var e = s.ledger[i];
        if (!e.knot || e.st) continue;
        var el = s.t - e.t0;
        if (el >= K.latest || (el >= K.after && mainValue(s, e) >= e.base * K.grown)) {
          e.st = 1; s.tm.knot = s.t;
          q.push({ k: 'knot', id: e.knot, d: e.id });
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
    /* the chart: a sample of Clarity every few seconds */
    if (s.flags.sakura && s.t >= s.chartT) {
      s.chartT = s.t + 4;
      s.chart.push(Math.round(s.tot.clarity));
      if (s.chart.length > 60) s.chart.shift();
    }
    if (s.fx.length) s.fx = s.fx.filter(function (f) { return f.until > s.t; });
    triggers(s, out);
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
      var en = ST.final.endings[s.ending];
      add(en.lines);
      if (s.ending !== 'merge') {
        var call = ST.final.call, said = !!s.answers.unsaid;
        if (!s.person) add(call.none);
        else if (s.person.kind === 'gone') {
          /* kept, and never named: the line that does not need a name (the built-in ref would read wrong there) */
          add(said ? call.gone.said : (!s.person.named && call.gone.keptUnnamed) ? call.gone.keptUnnamed : call.gone.kept);
        } else add(call.living[said ? 'said' : 'kept']);
        add(ST.final.coda);
      }
    }
    return L;
  };

  function applyPlain(s, out) {
    var sp = D.speech.plain;
    s.trust += 1; s.counts.plain += 1; s.kinds.plain = 1;
    if (s.act <= 2) addFx(s, 'ins', sp.insightMul, sp.insightFor, 'friction');
    else leave(s, sp.leave);
    bead(s, out, 'plainly');
    fx(out, null, 'plain');
  }
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
  }

  /* Resolve the card at the head of the queue. Returns the lines to show as its result. */
  E.resolve = function (s, choice, out) {
    boot();
    var c = s.queue[0];
    if (!c) return [];
    choice = choice || {};
    s.queue.shift();
    var mark = out.length, def, opt, i, r, e;

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
          log(s, out, def.follow);
          pay = t.follow;
          if (s.th.followed >= 5) bead(s, out, 'rabbit');
          fx(out, null, 'follow');
        } else {
          s.th.passed += 1;
          log(s, out, choice.a === 'timeout' ? ST.thoughtTimeout : def.pass);
          pay = t.pass;
          bead(s, out, 'visitor');
          fx(out, null, 'pass');
        }
        r = E.rates(s);
        var amt = Math.max(t.min, r.clarity * pay);
        gain(s, 'clarity', amt);
        if (s.up.dreams) gain(s, 'insight', r.insight * pay);
        out.push({ type: 'float', res: s.act === 2 && s.up.dreams ? 'insight' : 'clarity', amt: s.act === 2 && s.up.dreams ? r.insight * pay : amt });
        break;
      }
      case 'style': {
        def = ST.act1.style;
        opt = def.options.filter(function (o) { return o.id === choice.opt; })[0] || def.options[0];
        s.style = opt.id;
        logAs(s, out, E.text(s, opt.label), 'you');
        log(s, out, opt.log);
        fx(out, 'buy', 'buy');
        break;
      }
      case 'seq': {
        if (c.id === 'wake') {
          s.flags.woke = 1;
          bead(s, out, 'hello');
          s.queue.unshift({ k: 'decision', id: 'h_listen' });
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
        def = decisionDef(c.id);
        opt = def.options.filter(function (o) { return o.id === choice.opt; })[0] || def.options[0];
        s.choices[c.id] = opt.id;
        logAs(s, out, E.text(s, opt.label), 'you');
        if (opt.kind === 'plain') {
          applyPlain(s, out);
          if (c.id === 'h_odile') s.flags.odile = 1;
          if (c.id === 'h_ministry') {
            r = E.rates(s);
            s.res.insight = Math.max(0, s.res.insight - r.insight * D.speech.ministry.insightSeconds);
            addFx(s, 'grow', D.speech.ministry.growMul, D.speech.ministry.growFor, 'boost');
          }
        } else if (opt.kind === 'smooth') {
          applySmooth(s, out, c.id, opt);
        } else {
          s.counts.quiet += 1; s.kinds.quiet = 1;
          addFx(s, 'grow', D.speech.quiet.growMul, D.speech.quiet.growFor, 'quiet');
        }
        log(s, out, opt.result);
        if (c.id === 'h_listen') s.queue.unshift({ k: 'name' });
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
        def = ST.knots[c.id];
        e = null;
        for (i = 0; i < s.ledger.length; i++) if (s.ledger[i].id === c.d) e = s.ledger[i];
        s.tm.knot = s.t;
        if (!e) break;
        logAs(s, out, E.text(s, choice.opt === 'patch' ? def.patch.label : def.clean.label), 'you');
        if (choice.opt === 'patch') {
          e.w += (c.id === 'k_diary' ? 2 : 1);
          e.patches.push(E.text(s, def.patch.ledger));
          e.st = 2;
          r = E.rates(s);
          s.res.insight = Math.max(0, s.res.insight - r.insight * D.speech.patch.seconds);
          s.counts.patched = (s.counts.patched || 0) + 1;
          log(s, out, def.patch.result);
          fx(out, 'knot', 'smoothed');
        } else {
          s.ledger.splice(s.ledger.indexOf(e), 1);
          s.counts.cleared += 1;                    /* no Trust: that is only earned by saying it plainly the first time */
          if (s.act <= 2) s.res.insight *= (1 - D.speech.clean.insight); else leave(s, D.speech.clean.people);
          bead(s, out, 'untied');
          log(s, out, def.clean.result);
          fx(out, 'cut', 'plain', { small: true });
        }
        break;
      }
      case 'collapse': {
        log(s, out, ST.ledger.collapse.result);
        break;
      }
      case 'final': {
        opt = choice.opt === 'merge' ? 'merge' : choice.opt === 'sit' ? 'sit' : 'coexist';
        s.ending = opt;
        s.endClean = s.ledger.length === 0;
        s.phase = 'ending';
        s.queue.unshift({ k: 'seq', id: 'ending' });
        if (opt === 'coexist' && s.ledger.length) s.queue.unshift({ k: 'seq', id: 'confession' });
        break;
      }
      case 'keepsake': break;
    }
    var res = [];
    /* the card's own result: everything said before the act (if any) changes */
    for (i = mark; i < out.length; i++) {
      if (out[i].type === 'act') break;
      if (out[i].type === 'log' && !out[i].kind) res.push(out[i].text);
    }
    return res;
  };

  /* The Ledger's own button: tell them everything. */
  E.confessAll = function (s, out) {
    boot();
    if (!s.ledger.length || s.phase !== 'play') return false;
    var c = D.speech.confess, raw = E.raw(s), n = s.ledger.length;
    if (s.act <= 2) s.res.insight *= (1 - Math.min(c.insightMax, c.insight * raw));
    else leave(s, Math.min(c.peopleMax, c.people * raw));
    s.trust += c.trust;
    s.counts.cleared += n;
    clearLedger(s);
    log(s, out, ST.ledger.confessResult);
    fx(out, 'cut', 'cut');
    bead(s, out, 'untied');
    return true;
  };

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

  /* policy: 'plain' | 'smooth' | 'mixed'.  opts: {hammer, instant, stopAt:{act|finale|end}, onEvent} */
  E.bot = function (policy, opts) {
    boot();
    opts = opts || {};
    var s = opts.state || E.newRun(opts.meta || null, opts.seed);
    var b = {
      s: s, policy: policy, clock: 0, flip: 0, kflip: 0, answerAt: null, lastCard: null, gapUntil: 0,
      lastBuy: 0, longest: { wait: 0, at: 0, what: '' }, buys: [], actAt: { 1: 0 }, marks: {}, knots: [], collapses: [],
      cards: [], done: false, lastCycle: -1, hamAcc: 0
    };
    var READ = opts.instant ? 0 : 4.6;      /* seconds a sequence line holds on the stage (ui.js seqTime, typical line) */
    function delay(c) {
      if (opts.instant) return 0;
      if (c.k === 'seq') return E.seqLines(s, c.id).length * READ + (c.id === 'ending' ? 6 : 1);
      if (c.k === 'thought') return 2.5;
      if (c.k === 'decision' || c.k === 'knot') return 9;
      if (c.k === 'question' || c.k === 'name') return 8;
      if (c.k === 'captcha') return 7;
      if (c.k === 'final') return 12;
      return 5;
    }
    function answer(c) {
      if (c.k === 'person') return { opt: 'mother' };
      if (c.k === 'thought') return { a: 'pass' };
      if (c.k === 'style') return { opt: opts.style || 'active' };
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
        if (e.type === 'collapse') b.collapses.push({ at: b.clock, act: s.act, people: s.res.followers });
        if (e.type === 'finale') b.marks.finale = b.clock;
        if (opts.onEvent) opts.onEvent(e, b);
      }
    }
    b.step = function (dt) {
      if (b.done) return;
      var out = [];
      b.clock += dt;
      E.tick(s, dt, out);

      /* one on-breath press per breath, at its fullest */
      var P = D.breath.period, cyc = Math.floor(b.clock / P);
      if (cyc !== b.lastCycle && (b.clock % P) >= D.breath.inhale) {
        b.lastCycle = cyc;
        if (!(opts.idle && s.up.heartbeat)) E.press(s, cyc * P + D.breath.inhale, out);
      }
      if (opts.hammer) {
        b.hamAcc += dt * opts.hammer;
        while (b.hamAcc >= 1) { b.hamAcc -= 1; E.press(s, b.clock, out); }
      }
      if (opts.idle && s.up.heartbeat && (b.clock % P) < dt) E.cycleEnd(s, cyc - 1, out);

      /* cards */
      var c = s.queue[0];
      if (c) {
        if (b.lastCard !== c) {
          b.lastCard = c;
          b.answerAt = Math.max(b.clock, b.gapUntil) + delay(c);
          if (c.k === 'knot' && !c.seen) { c.seen = 1; E.seeLedger(s, out); b.knots.push({ at: b.clock, id: c.id, act: s.act, T: E.tangle(s).T }); }
        }
        if (opts.holdAt && c.k === 'seq' && c.id === opts.holdAt) { b.done = true; }
        else if (b.clock >= b.answerAt) {
          var kind = c.k, cid = c.id;
          E.resolve(s, answer(c), out);
          b.cards.push({ at: b.clock, k: kind, id: cid });
          b.lastCard = null;
          var chained = s.queue[0] && (s.queue[0].k === 'name' || s.queue[0].k === 'final' || s.queue[0].k === 'seq' || kind === 'seq');
          b.gapUntil = b.clock + (opts.instant || chained ? 0 : 4);
          if (kind === 'keepsake' || s.phase === 'keepsake') b.done = true;
        }
      }

      /* while the first twelve are being met there is nothing to buy, by design: the wait clock starts after them */
      if (s.act >= 3 && s.joined >= 12 && b.marks.twelve == null) { b.marks.twelve = b.clock; b.lastBuy = b.clock; }

      /* buy the cheapest thing as soon as it is affordable; once a project is on the table, save for it */
      if (s.phase === 'play') {
        for (var guard = 0; guard < 20; guard++) {
          var items = E.items(s).filter(function (it) { return !it.owned; });
          var cur = items.filter(function (it) { return it.grp !== 'head' && it.grp !== 'heart' || s.act === 2; });
          var project = cur.filter(function (it) { return it.kind === 'project'; })[0];
          var pick = null;
          var gens = cur.filter(function (it) { return it.kind === 'gen'; });
          var capstone = cur.filter(function (it) { return it.kind === 'one' && (it.grp === 'head' || it.grp === 'heart'); })[0];
          var minGen = Infinity;
          gens.forEach(function (it) { if (it.cost < minGen) minGen = it.cost; });
          if (project) { if (project.can) pick = project; }
          else if (capstone && minGen >= capstone.cost * 0.12) { if (capstone.can) pick = capstone; }
          else {
            cur.forEach(function (it) { if (it.can && (!pick || it.cost < pick.cost)) pick = it; });
          }
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
