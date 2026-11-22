/* The Enlightenment Engine — the director (DESIGN §4.6; round 2, EE-105).
 * Every message the player is shown passes through here: Hum's and the narrator's lines, cards and sequences, world
 * lines, achievements, hints. It decides which one comes next, where (the voice slot above the ring, the card dock under
 * it, the caption at the foot of the stage), and when, so that one thing speaks at a time, each gets its reading time,
 * and a player who has nothing new for half a minute is given something. It never writes text: lines come from
 * story.js, resolved by economy.js.
 *
 * Pure rules, like economy.js: no DOM, no timers, the game clock only (s.t), E.rand only. It runs once per tick from
 * E.tick, in the game and in tools/sim.js alike. Its state lives in the run (s.dir: ids, counters and times, never
 * text) and is saved with it.
 *
 * In:  X.say(s, out, item)    a message to show (economy.js calls it as lines are logged and beads earned)
 *      X.busy(s)              the player bought or hovered a row: everything but the reply waits D.dir.busy s
 *      X.closed(s)            the card (or sequence) on the stage has gone (the page, or a bot, says so)
 *      X.isNew(s)             something new happened (a purchase changed the picture, a name arrived, an act turned)
 * Out: events pushed onto `out`:
 *      {type:'show', place:'voice'|'caption', k, n|text, hum, hold, j}   light this line (n: a Journal entry by number)
 *      {type:'show', place:'card', k, id}     the card at the head of s.queue may rise now
 *      {type:'dim', place:'voice'}            its reading time is over: dim it (it stays until replaced)
 *      {type:'end', place:'caption'}          the world line goes
 *      {type:'unshow', place:'voice'}         take the lit line away now (a hint whose thing was just done)
 *      {type:'journal', n}                    a line that will not be shown goes straight to the Journal
 *      {type:'hint', tg}                      the hint target changed (null: none) — the page draws motes and the glow
 *      {type:'lotus'}                         (a pull) the golden lotus, now
 * Log: X.sink, if set, receives one entry per decision {t, ev, place, id, k, due, wait} (EE.dev.log in the game; the
 *      whole list in the sim, which checks it).
 */
(function (root) {
  'use strict';
  var EE = root.EE = root.EE || {};
  var X = EE.dir = {};
  var D, ST, E;
  function boot() { D = EE.data; ST = EE.story; E = EE.econ; }

  var CHAINED = { name: 1, seq: 1, 'final': 1, keepsake: 1 };
  var REQUIRED = { person: 1, sleep: 1, unsaid: 1, fifteen: 1, keep: 1 };
  /* cards that ask the player to type (EE-110, item 6): at least D.dir.typeGap s between two of them */
  var TYPING = { question: 1, name: 1, captcha: 1, person: 1 };
  /* what may speak in the voice slot while a world line holds the caption (EE-110, item 1): the reply to something the
   * player just did (a purchase, an Invite answered by a name, a thought followed), and an act's turn, which a purchase sets off */
  var BESIDE = { reply: 1, act: 1 };

  X.sink = null;
  X.fresh = function () {
    return {
      q: [], seq: 0, voice: null, cap: null, card: null,
      quiet: 0, hold: 0, busy: 0, lastCard: -999, idle: 0, pulls: 0, lastPull: -999, pullN: 0,
      vis: [], gold: [], rowT: 0, tmWorld: 0, wl: [], wn: 0, shown: 0,
      ht: null, hw: { up: 0, panel: 0, press: 0, ring0: 0 }, retry: {}, pressT: -999, lastWorld: 0, lastType: -999, lastClose: -999
    };
  };
  function dir(s) { return s.dir || (s.dir = X.fresh()); }
  X.state = dir;

  function log(s, ev, it, extra) {
    if (!X.sink) return;
    var e = { t: Math.round(s.t * 10) / 10, ev: ev, place: it.p || 'voice', id: it.id || idOf(it), k: it.k, due: Math.round((it.t != null ? it.t : s.t) * 10) / 10, wait: Math.round((s.t - (it.t != null ? it.t : s.t)) * 10) / 10 };
    if (extra) for (var k in extra) e[k] = extra[k];
    try { X.sink(e); } catch (err) { /* a log sink never stops the game */ }
  }
  function idOf(it) {
    if (it.card) return it.card;
    if (it.src) return it.src + (it.w ? ':' + it.w : '') + (it.id ? ':' + it.id : '');
    return it.k + (it.x ? ':' + it.x : '');
  }

  /* reading time, game seconds */
  X.read = function (len) {
    boot();
    var R = D.dir.read, cjk = /^(ja|zh|ko)/.test(EE.locale || '');
    return Math.max(R.min, R.base + R.perChar * len * (cjk ? R.cjk : 1));
  };
  function pri(k) { var p = D.dir.pri[k]; return p == null ? 5 : p; }
  function cardKind(c) {
    if (c.k === 'seq') return 'seq';
    if (c.k === 'thought') return 'thought';
    return 'card';
  }

  /* ───────────── in ───────────── */

  X.say = function (s, out, it) {
    boot();
    var d = dir(s), i;
    it.s = ++d.seq; it.t = s.t; it.p = it.p || 'voice';
    /* three purchase replies waiting: the newest plays, the others go to the Journal */
    if (it.buy) {
      var older = d.q.filter(function (x) { return x.buy; });
      if (older.length >= D.dir.replies - 1) for (i = 0; i < older.length; i++) toJournal(s, out, older[i]);
    }
    /* (EE-111) a gift's line while another is still waiting: the newest is said, the older goes to the Journal (its boost
     * has already begun; only the line is late) */
    if (it.k === 'gift') for (i = d.q.length - 1; i >= 0; i--) if (d.q[i].k === 'gift') toJournal(s, out, d.q[i]);
    d.q.push(it);
    return it;
  };
  function toJournal(s, out, it) {
    var d = dir(s), ix = d.q.indexOf(it);
    if (ix >= 0) d.q.splice(ix, 1);
    if (it.n != null) out.push({ type: 'journal', n: it.n });
    log(s, 'journal', it);
  }
  X.busy = function (s) { boot(); var d = dir(s); d.busy = Math.max(d.busy, s.t + D.dir.busy); };
  /* the ring was pressed (EE-108): no card rises for D.dir.pressCard s after it */
  X.pressed = function (s) { dir(s).pressT = s.t; };
  /* Before the first purchase of a run (EE-108, eye pass item 1) the card dock is the Metronome's: nothing else rises */
  X.preBuy = function (s) { return s.act === 1 && !s.up.metronome && !s.flags.pattern; };
  /* may a card rise now? Not within D.dir.pressCard s of a ring press, nor while the player is busy in the column
   * (bought or hovered a row, D.dir.busy s). A sequence the player set off, the Final Alignment and the keepsake go. */
  function calm(s, c) {
    var d = dir(s), R = D.dir;
    if (!c || c.k === 'seq' || c.k === 'final' || c.k === 'keepsake') return true;
    if (s.t - (d.pressT == null ? -999 : d.pressT) >= R.pressCard && s.t >= d.busy) { c.bw = null; return true; }
    /* a player who never stops pressing still gets their cards: one held back this long rises anyway */
    if (c.bw == null) c.bw = s.t;
    return s.t - c.bw >= R.pressCardMax;
  }
  X.isNew = function (s) { dir(s).idle = 0; };
  X.act = function (s) { boot(); var d = dir(s); d.hold = s.t + D.dir.actHold; d.idle = 0; };
  /* the card on the stage has been answered: what follows in the queue is not on the stage until it is closed */
  X.answered = function (s) { var d = dir(s); if (d.card) d.card.res = 1; };
  /* k, id: which card the page closed (one pushed aside long ago must not close the one on the stage now) */
  X.closed = function (s, k, id) {
    boot();
    var d = dir(s);
    if (!d.card) return;
    if (k != null && (d.card.k !== k || (d.card.id || null) !== (id || null))) return;
    log(s, 'closed', { p: 'card', k: d.card.k, card: d.card.k + ':' + (d.card.id || ''), t: d.card.at });
    if (TYPING[d.card.k]) d.lastType = s.t;
    if (d.card.k !== 'offer') d.lastClose = s.t;
    d.card = null;
    d.quiet = Math.max(d.quiet, s.t + D.dir.quiet);
  };
  X.pending = function (s, pred) { var q = dir(s).q; for (var i = 0; i < q.length; i++) if (pred(q[i])) return true; return false; };
  /* how many messages are waiting, everywhere (the backlog invariant) */
  X.backlog = function (s) { var d = dir(s), n = d.q.length; for (var i = 0; i < s.queue.length; i++) if (!(d.card && i === 0)) n++; return n; };

  /* ───────────── what a waiting line says (lines picked when shown, so nothing is shown stale) ───────────── */

  function lazyText(s, it) {
    var i, line;
    if (it.src === 'chatter') {
      var key = E.voice(s), lines = ST.act2.chatter[key], free = [];
      for (i = 0; i < lines.length; i++) if (s.chat.used.indexOf(key + i) < 0) free.push(i);
      if (!free.length) { s.chat.used = s.chat.used.filter(function (u) { return u.indexOf(key) !== 0; }); for (i = 0; i < lines.length; i++) free.push(i); }
      var ci = free[Math.floor(E.rand(s) * free.length)];
      s.chat.used.push(key + ci);
      return { text: E.text(s, lines[ci]), j: true };
    }
    if (it.src === 'world') {
      /* round 2, bundle C: once Hum rounds, two world lines in three come from the smooth set; the thirteenth's two
       * lines join the pool once there is one; k_odile's mark: Hum has forgotten {fifteen} (its lines go, the forgotten
       * one comes); k_diary's mark: the minister's diary */
      var d = dir(s), M = s.marks || {}, pool = [], A3 = ST.act3, k;
      for (k = 0; k < A3.ticker.length; k++) if (!(M.odile && A3.ticker[k].indexOf('{fifteen}') >= 0)) pool.push('t' + k);
      if (s.flags.art) pool = pool.concat(ST.act4.art.map(function (l, j) { return 'a' + j; }));
      if (E.hasFriend(s)) pool = pool.concat(A3.tickerFriend.map(function (l, j) { return 'f' + j; }));
      if (M.odile) pool.push('o0');
      if (M.diary) pool.push('m0');
      d.wn += 1;
      if (E.voice(s) === 'smooth' && d.wn % 3 < D.lean.smoothWorld) pool = A3.tickerSmooth.map(function (l, j) { return 's' + j; });
      var fr = pool.filter(function (p) { return d.wl.indexOf(p) < 0; });
      if (!fr.length) fr = pool;
      var pk = fr[Math.floor(E.rand(s) * fr.length)];
      d.wl.push(pk); if (d.wl.length > 8) d.wl.shift();
      var c0 = pk.charAt(0), src = { t: A3.ticker, a: ST.act4.art, s: A3.tickerSmooth, f: A3.tickerFriend, o: [A3.tickerForgot], m: [A3.tickerDiary] }[c0];
      return { text: E.text(s, src[+pk.slice(1)]) };
    }
    if (it.src === 'tracker') {
      /* the tracker, before Hum wakes (round 2): {n} breaths, {s} in a row, {time} since the first breath */
      var tk = s.trk, TL = ST.act1.tracker[tk.i];
      if (!TL) return null;
      tk.i += 1; tk.at = s.t;
      var secs = Math.max(1, Math.round(s.t)), tm = Math.floor(secs / 60) + ':' + ('0' + (secs % 60)).slice(-2);
      var x = { n: s.breaths, s: s.streak, time: tm };
      return { text: E.text(s, TL.line, x), drop: TL.drop || null, then: TL.then ? E.text(s, TL.then, x) : null, j: true };
    }
    if (it.src === 'dawn') {
      line = ST.dawn[s.dawnIdx];
      if (!line) return null;
      s.dawnIdx += 1;
      return { text: E.text(s, line.line), j: true };
    }
    if (it.src === 'bead') {
      var b = ST.beads.filter(function (x) { return x.id === it.id; })[0];
      return b ? { text: b.name + ' ' + b.desc, bold: b.name.length } : null;
    }
    if (it.src === 'offline') return { text: ST.ui.offline.replace('{n}', it.m >= 90 ? ST.build.hours.replace('{n}', String(Math.round(it.m / 60))) : ST.build.mins.replace('{n}', String(Math.max(1, it.m)))) };
    if (it.src === 'hint') {
      var N = ST.nudges, w = it.w, arr;
      if (w === 'ring0') { arr = N.press.map(function (x) { return x.line; }); line = arr[Math.min(it.i, arr.length - 1)]; }
      else if (w === 'still0') line = N.pressAfterStill;
      else if (w === 'rule') line = ST.ui.breathHint;
      else if (w === 'press' || w === 'timing') line = N.timing;
      else { arr = w === 'up' ? N.upgrade : N.panel; if (!Array.isArray(arr)) arr = [arr]; line = arr[it.i % arr.length]; }
      return { text: E.text(s, line) };       /* {where} stays: the page knows which side "where" is */
    }
    return null;
  }

  /* dev (bundle C's playtest): the world line the director would pick now, as it would pick it (advances the pool) */
  X.worldLine = function (s) { boot(); var lz = lazyText(s, { src: 'world' }); return lz ? lz.text : null; };

  /* ───────────── the tick ───────────── */

  X.step = function (s, out, dt) {
    boot();
    if (s.phase !== 'play') return;
    var d = dir(s), t = s.t, R = D.dir, i, c;

    /* 1. what is on the stage runs out */
    if (d.voice && !d.voice.dim && t >= d.voice.until) {
      d.voice.dim = 1;
      out.push({ type: 'dim', place: 'voice' });
      if (!d.voice.r) d.quiet = Math.max(d.quiet, t + R.quiet);
    }
    if (d.cap && t >= d.cap.until) { d.cap = null; out.push({ type: 'end', place: 'caption' }); d.quiet = Math.max(d.quiet, t + R.caption.quiet); d.capEnd = t; }
    /* a card that was pushed off the stage before it was answered (a sequence put in front of it): it has gone */
    var hd = s.queue[0];
    if (d.card && !d.card.res && hd && (hd.k !== d.card.k || (hd.id || null) !== d.card.id)) {
      log(s, 'displaced', { p: 'card', k: d.card.k, card: d.card.k + ':' + (d.card.id || ''), t: d.card.at });
      d.card = null;
    }
    /* a card the page has lost (the queue emptied under it and nobody closed it): let it go after 30 s */
    if (d.card && !s.queue.length) { if (d.card.gone == null) d.card.gone = t; else if (t - d.card.gone > 30) X.closed(s); }

    /* 2. the attention clock: time with a card open, or typing in one, is not "nothing new" (an offer waiting at the
     * ring is not something to read: its time counts). Sitting through a knot is not nothing either. */
    var offerUp = !!(d.card && d.card.k === 'offer');
    /* an act's closing project offered at the ring: buying it sets off a sequence that takes the stage, so no world line
     * starts beside it (EE-110, the verifier: one began 0.4 s before the broadcast and was cut) */
    var projOffer = offerUp && /^p_/.test(d.card.id || '');
    if (s.sit) d.idle = 0;
    else if (!d.card || offerUp) d.idle += dt;
    for (i = 0; i < s.queue.length; i++) if (s.queue[i].qt == null) s.queue[i].qt = t;

    /* 3. rows revealed, or newly affordable, are new */
    if (t >= d.rowT) { d.rowT = t + 1; rows(s); }

    /* 4. the hints */
    hints(s, out);

    /* 5. world lines are offered every so often in Acts III–IV */
    var hard = s.act >= 3 && t - (d.lastWorld || 0) >= R.worldMax;
    if (s.act >= 3 && (t >= d.tmWorld || hard)) {
      if (t >= d.tmWorld) d.tmWorld = t + D.small.ticker;
      if (!X.pending(s, function (x) { return x.src === 'world'; })) X.say(s, out, { k: 'world', p: 'caption', src: 'world' });
    }

    /* 6. late messages: dropped (lines go back to their pool; thoughts are let go) */
    var ahead = X.ahead(s);
    for (i = d.q.length - 1; i >= 0; i--) {
      var it = d.q[i], lim = R.drop[it.k];
      if ((lim != null && t - it.t > lim) || (ahead && it.k === 'chatter')) {
        d.q.splice(i, 1);
        if (it.n != null) out.push({ type: 'journal', n: it.n });
        if (it.src) d.retry[it.src] = t + 20;
        log(s, 'dropped', it);
      }
    }
    for (i = s.queue.length - 1; i >= 0; i--) {
      c = s.queue[i];
      if (d.card && i === 0) continue;
      if ((c.k === 'thought' && t - c.qt > R.drop.thought) || (ahead && (c.k === 'thought' || c.k === 'captcha'))) {
        s.queue.splice(i, 1);
        log(s, 'dropped', { p: 'card', k: c.k, card: c.k + ':' + (c.id || ''), t: c.qt });
      }
    }

    /* 7. behind: nothing new for a while; pull the next thing (not before the first purchase: the Metronome's card is
     * the one thing at the ring then, EE-108) */
    var pre = X.preBuy(s);
    if ((!d.card || offerUp) && s.clicks > 0 && !pre && d.idle >= (R.behind[s.act] || 40)) pull(s, out, ahead);

    /* 8. what speaks next. A card is never taken away by something the player did elsewhere (EE-108, eye pass item 4):
     * a thought stays until it is answered or its own time runs out; the reply to a purchase waits behind it. */
    /* An offer at the ring (round 2, EE-106) is a buy button, not a speaker: lines may be said above the ring while it
     * waits under it (its hint's words among them), and after `offerHold` s any other card that may rise now displaces
     * it; it waits behind that card and comes back. World lines wait for it. */
    var free = t >= d.quiet && t >= d.hold && t >= d.busy;
    if (offerUp && !pre && !beatWaits(d) && !d.card.res && s.queue[0] && s.queue[0].k === 'offer' && t - d.card.at >= R.offerHold) {
      for (i = 1; i < s.queue.length; i++) {
        c = s.queue[i];
        if (c.k === 'offer') continue;
        /* (EE-111) a thought never displaces an act's closing project at the ring once it can be bought: the player is about to turn the act,
         * and the thought would be gone again in a moment (a real-speed run saw one on the stage for 0.6 s) */
        if (c.k === 'thought' && /^p_(pattern|speak|broadcast)$/.test(s.queue[0].id || '')) { var po2 = E.find(s, s.queue[0].id); if (po2 && po2.can) break; }
        var gp2 = (ahead && REQUIRED[c.k === 'question' ? c.id : c.k]) ? R.cardGapAhead : R.cardGap;
        if ((CHAINED[c.k] || c.ch || (free && !d.cap && t - d.lastCard >= gp2 && (!d.voice || d.voice.dim))) && calm(s, c)) {
          var off = s.queue.shift();
          s.queue.splice(i, 0, off);
          log(s, 'stepped aside', { p: 'card', k: 'offer', card: 'offer:' + (off.id || ''), t: d.card.at });
          d.card = null; offerUp = false;
        }
        break;
      }
    }
    if (d.card && !offerUp) return;
    /* The first offer has a hard limit (EE-108, Muse's ruling): the Metronome's card is a buy button, not a speaker. Once
     * it is due it rises beside whatever the voice slot is saying (a lit line, the rule's hint), and never later than
     * `act1.offerAfter` s after the run's first press, whatever the press gate says. The Local Meetup offer the same way
     * once the fourth of the twelve is in (EE-110, item 4; EE-111): beside that arrival's line once it has been read (or
     * `dir.offerSoon` s after it arrived), within 10 s, while the others keep arriving. */
    var po = X.prioOffer(s);
    if (po >= 0 && !d.card) {
      var poc = s.queue[po], late = pre ? t - (s.flags.firstT || 0) >= D.act1.offerAfter : poc.id === 'meetup' ? t - (s.flags.meetT || t) >= R.offerSoon : t - (poc.qt == null ? t : poc.qt) >= R.offerSoon;
      if (late || (calm(s, poc) && (pre || !d.voice || d.voice.dim))) { if (po > 0) s.queue.unshift(s.queue.splice(po, 1)[0]); showCard(s, out, s.queue[0]); return; }
    }
    /* a knot being sat through (round 2, bundle C): Hum is silent and the Ledger line holds the voice slot; nothing else
     * speaks until it has faded (or the player has walked away from it) */
    if (s.sit) return;
    if (d.voice && !d.voice.dim) {
      /* a world line that is due may start beside the reply to the player, as a reply may speak beside it (EE-110) */
      if (d.voice.r && hard && !projOffer && !d.cap && t >= d.hold && t >= (d.capEnd || 0) + R.caption.gap && !(d.card && !offerUp)) {
        for (i = 0; i < d.q.length; i++) if (d.q[i].p === 'caption') { show(s, out, d.q[i]); return; }
      }
      return;
    }
    /* the handover (EE-108, eye pass item 5) is one uninterrupted beat: from Hum's first breath to its fourth line
     * nothing else is said and no card rises; its lines follow one another as soon as each has been read */
    for (i = 0; i < d.q.length; i++) if (d.q[i].beat) { show(s, out, d.q[i]); return; }
    if (t < d.hold) return;                   /* an act's title card first: nothing is said over it */
    /* A world line is read (EE-110, item 1): once it has started it holds the caption for its full reading time. Voice lines
     * and cards wait for it; only the reply to something the player just did speaks in the voice slot beside it (BESIDE),
     * and an offer at the ring (a buy button) may rise under the ring. Acts III and IV carry one at least every 30 s even
     * while the twelve arrive and the story is busy: the story runs back to back up to `worldMax` s after the last one, and
     * whatever would still be on the stage by then waits for the next world line instead (below); once `worldMax` s have
     * gone by, the next takes the first moment the stage is clear (no card open, the voice slot dim or empty). */
    var wq = null;
    if (s.act >= 3 && !projOffer && !d.cap && t >= (d.capEnd || 0) + R.caption.gap) for (i = 0; i < d.q.length && !wq; i++) if (d.q[i].p === 'caption') wq = d.q[i];
    var wDue = (d.lastWorld || 0) + R.worldMax;
    if (hard && wq) { show(s, out, wq); return; }
    var best = null, bp = 99, head = offerUp ? null : (s.queue[0] || null);
    /* before the first purchase the Metronome's card is the only card (EE-108, eye pass item 1); while the Local Meetup
     * offer waits for its moment, no other card rises (EE-110, item 4) */
    if (head && pre && head.k !== 'offer') {
      head = null;
      for (i = 1; i < s.queue.length; i++) if (s.queue[i].k === 'offer') { head = s.queue.splice(i, 1)[0]; s.queue.unshift(head); break; }
    }
    if (po >= 0 && !pre) head = null;
    /* (EE-111) no thought rises while the act's closing project can be bought, at the ring or in the column: the player is
     * about to turn the act, and the thought would be gone again in a moment (real-speed runs saw one for 0.6 s) */
    if (head && head.k === 'thought') { var cp = E.find(s, ['', 'p_pattern', 'p_speak', 'p_broadcast'][s.act] || ''); if (cp && cp.can) head = null; }
    /* (EE-111, Muse) while the twelve are still arriving no knot, question or decision rises: they wait until the twelfth
     * is in (an offer or a thought may go first) */
    if (head && s.act === 3 && s.joined < D.act3.first.n && HOLD12[head.k]) {
      head = null;
      for (i = 1; i < s.queue.length; i++) if (!HOLD12[s.queue[i].k]) { head = s.queue.splice(i, 1)[0]; s.queue.unshift(head); break; }
    }
    /* Act II's cards (EE-110, item 6): the captcha only when no card has been on the stage for `captchaQuiet` s, and skipped
     * when another card wants the dock first; two cards that ask for typing at least `typeGap` s apart (one that must wait
     * lets the next card that asks for no typing go first) */
    var held = false;
    /* (EE-110, item 5) once the First Engine is bought the act's last cards go before a knot that was waiting */
    /* (EE-111) once the First Engine is bought, the act's last cards go first, h_first then keep: the Global Broadcast waits
     * for keep's answer (a real-speed player saw keep wait 87 s behind two decisions while the Circle grew forty-fold) */
    if (head && !d.card && s.act === 3 && s.up.dynamo && !s.flags.broadcastBought) {
      for (var lc = ['keep', 'h_first'], j = 0; j < lc.length; j++) {
        for (i = 1; i < s.queue.length; i++) if (s.queue[i].id === lc[j] && (s.queue[i].k === 'question' || s.queue[i].k === 'decision')) { s.queue.unshift(s.queue.splice(i, 1)[0]); break; }
      }
      head = s.queue[0];
    }
    if (head && !d.card && head.k === 'knot' && s.act === 3 && s.up.line && !s.flags.broadcastBought) {
      for (i = 1; i < s.queue.length; i++) if (s.queue[i].k === 'decision' || s.queue[i].k === 'question') { head = s.queue.splice(i, 1)[0]; s.queue.unshift(head); break; }
    }
    if (head && !d.card && head.k === 'captcha') {
      if (s.queue.some(function (c, j) { return j > 0 && c.k !== 'offer'; })) {
        s.queue.shift(); log(s, 'dropped', { p: 'card', k: 'captcha', card: 'captcha:', t: head.qt }, { why: 'skipped' });
        head = s.queue[0] || null;
      } else if (t - d.lastClose < R.captchaQuiet || t - d.lastCard < R.captchaQuiet) held = true;
    }
    if (head && !d.card && TYPING[head.k] && t - d.lastType < R.typeGap) {
      for (i = 1; i < s.queue.length; i++) if (!TYPING[s.queue[i].k] && s.queue[i].k !== 'offer') break;
      if (i < s.queue.length) { head = s.queue.splice(i, 1)[0]; s.queue.unshift(head); }
      else held = true;
    }
    /* World lines (EE-108, eye pass item 7): one may show whenever no card is open and the voice slot is dim or empty;
     * once none has shown for R.worldDue s, the next outranks chatter */
    var worldLate = t - (d.lastWorld || 0) >= R.worldDue, waiting = false;
    /* ... but a world line does not take the quiet another line is waiting for (a hint, a gift, a thought's reply): only
     * chatter and ambient lines give way to it, so nothing starves behind the world (EE-108). Nor does one start when a
     * card will be due within its reading time (EE-110, item 1): the card would only have to wait for it. */
    for (i = 0; i < d.q.length; i++) if (d.q[i].p !== 'caption' && d.q[i].k !== 'chatter' && d.q[i].k !== 'ambient') waiting = true;
    if (head && !held && !worldLate && !(CHAINED[head.k] || head.ch)) {
      var gp0 = (ahead && REQUIRED[head.k === 'question' ? head.id : head.k]) ? R.cardGapAhead : R.cardGap;
      if (t - d.lastCard >= gp0 - R.worldSoon) waiting = true;
    }
    for (i = 0; i < d.q.length; i++) {
      it = d.q[i];
      var reply = !!BESIDE[it.k], world = it.p === 'caption';
      /* a world line went first for the card at the head: that card is next, and a reply waits behind it, as it waits behind
       * any card on the stage (EE-110: world line + reply + card stretched a world-line gap to 35 s) */
      if (reply && turnOf(d, head) && !(CHAINED[head.k] || head.ch)) continue;
      if (world) { if (d.cap || waiting || projOffer || t < d.busy || t < (d.capEnd || 0) + R.caption.gap) continue; }
      else {
        if (!reply && !free) continue;
        /* a world line holds the caption: only the reply to the player speaks beside it */
        if (d.cap && !reply) continue;
      }
      var p = world && worldLate ? R.pri.worldLate : pri(it.k);
      if (p < bp || (p === bp && it.t < best.t)) { best = it; bp = p; }
    }
    if (head) {
      var chained = CHAINED[head.k] || head.ch;
      var finaleWaits = s.act === 4 && s.flags.clamped && s.bought4 >= D.act4.order.length;
      /* (EE-110, item 5) once the First Engine is bought, the act's last cards come one after another, ahead of the story
       * lines, so the Global Broadcast is not kept waiting */
      var rush = s.act === 3 && s.up.line && !s.flags.broadcastBought && (head.k === 'decision' || head.k === 'question');
      var gap = ((ahead && REQUIRED[head.k === 'question' ? head.id : head.k]) || finaleWaits || rush) ? R.cardGapAhead : R.cardGap;
      /* a card waits for a world line to be read (EE-110, item 1), a sequence the player set off too (it would cut it: the
       * verifier saw the broadcast cut one 0.4 s in); an offer at the ring rises under the ring beside it */
      var ready = !held && (chained || (free && t - d.lastCard >= gap)) && !(d.cap && !(head.k === 'offer' || head.k === 'final' || head.k === 'keepsake')), ok = ready && calm(s, head);
      var hp = chained || rush ? pri('seq') : pri(cardKind(head));
      /* Acts III–IV: a card about to rise would still be open when the next world line is due: the world line goes first,
       * so a card read for a while does not leave the world silent (EE-108, EE-110) */
      /* (and that card is next once the world line has been read: nothing it outranks or ties takes its turn) */
      if (ok && (hp < bp || (hp === bp && best && (head.qt <= best.t || turnOf(d, head))))) {
        if (s.act >= 3 && !chained && !turnOf(d, head) && t + (R.cardEst[head.k] || R.cardEst.other) > wDue) {
          if (wq) { show(s, out, wq); d.cardTurn = head.k + ':' + (head.id || ''); return; }
          /* the last world line has only just gone: the card waits the moment until the next may start (EE-110) */
          if (!d.cap && t < (d.capEnd || 0) + R.caption.gap && X.pending(s, function (x) { return x.p === 'caption'; })) return;
        }
        showCard(s, out, head); return;
      }
      /* a card held back only by the player's hands (a press, a click in the column) keeps its turn: nothing it outranks
       * takes the stage meanwhile (EE-108: the Metronome's card lost 4 s to a hint line that way) */
      if (ready && !ok && best && bp >= hp) best = null;
    }
    /* ... and the same for a line that would still be lit then (EE-110) */
    if (best && wq && best.p !== 'caption' && !BESIDE[best.k] && t + X.read(best.len || 60) + R.quiet > wDue) best = wq;
    if (best) show(s, out, best);
  };

  /* an offer that rises before anything else (its index in s.queue, or -1): the Metronome's before the first purchase
   * (EE-108), Local Meetup's once the fourth of the twelve is in (EE-110, item 4; EE-111) */
  X.prioOffer = function (s) {
    var q = s.queue, pre = X.preBuy(s), i;
    for (i = 0; i < q.length; i++) {
      if (q[i].k !== 'offer') continue;
      if (pre) return i;
      /* Local Meetup's after the twelfth, and (item 5) the Global Broadcast's once it can be bought, each the first time
       * only: an offer the player let step aside does not hold the other cards back again */
      if (q[i].shown) continue;
      if (q[i].id === 'meetup' && s.act === 3 && s.joined >= D.act3.first.offerAt && !s.up.meetup) return i;
      if (q[i].id === 'p_broadcast' && s.act === 3) return i;
    }
    return -1;
  };
  /* the card a world line went first for (EE-110: bound to that card, so a turn left over from a card that did not rise
   * is not spent on another) */
  var HOLD12 = { knot: 1, question: 1, decision: 1 };
  function turnOf(d, c) { return !!(c && d.cardTurn && d.cardTurn === c.k + ':' + (c.id || '')); }
  function beatWaits(d) { for (var i = 0; i < d.q.length; i++) if (d.q[i].beat) return true; return false; }

  function show(s, out, it) {
    var d = dir(s), t = s.t, R = D.dir, ix = d.q.indexOf(it);
    if (ix >= 0) d.q.splice(ix, 1);
    var ev = { type: 'show', place: it.p, k: it.k, src: it.src || null, tg: it.tg || null }, len = it.len || 0;
    if (it.n != null) ev.n = it.n;
    else {
      var lz = lazyText(s, it);
      if (!lz || !lz.text) { log(s, 'dropped', it, { why: 'empty' }); return; }
      ev.text = lz.text; len = lz.text.length; ev.j = !!lz.j; if (lz.bold) ev.bold = lz.bold;
      if (lz.drop) ev.drop = lz.drop;
      if (lz.then) { ev.then = lz.then; len += 40; }      /* the line, then "> _" for one breath */
      ev.hum = lz.text.indexOf('> ') === 0;
    }
    if (it.hum != null) ev.hum = it.hum;
    var hold = X.read(len);
    if (it.k === 'tracker') hold *= R.trackerHold;          /* the tracker's lines stay lit longer (EE-108, item 9) */
    if (it.p === 'caption') {
      hold += R.caption.fade;
      d.cap = { s: it.s, until: t + hold };
      d.lastWorld = t;
    } else {
      /* a reply speaks beside a world line, which stays (EE-110, item 1); anything else would have waited for it */
      if (d.cap && !BESIDE[it.k]) { d.cap = null; out.push({ type: 'end', place: 'caption' }); log(s, 'cut', { p: 'caption', k: 'world', id: 'world', t: t }); }
      d.voice = { s: it.s, k: it.k, until: t + hold, tg: it.tg || null, r: it.k === 'reply' ? 1 : 0 };
      if (!BESIDE[it.k]) d.lastOther = t;
      d.shown += 1;
      ev.first = d.shown;
    }
    ev.hold = hold;
    if (it.nw) d.idle = 0;
    out.push(ev);
    log(s, 'shown', it, it.tg ? { hold: Math.round(hold * 10) / 10, tg: it.tg } : { hold: Math.round(hold * 10) / 10 });
  }

  function showCard(s, out, c) {
    var d = dir(s);
    /* Hum drafts (lean ≥ drafts; round 2, bundle C): a decision arrives with the smooth option already lit, and sends
     * itself after three breaths of visible play unless the player answers (E.cycleEnd counts them) */
    if (c.k === 'decision' && c.id !== 'fork' && c.draft == null && E.lean(s) >= D.lean.drafts && ST.decisions[c.id] &&
        ST.decisions[c.id].options.some(function (o) { return o.kind === 'smooth'; })) c.draft = D.lean.draftBreaths;
    /* an offer is a buy button under the ring: a world line stays above it (EE-110, item 1) */
    if (d.cap && c.k !== 'offer') { d.cap = null; out.push({ type: 'end', place: 'caption' }); log(s, 'cut', { p: 'caption', k: 'world', id: 'world', t: s.t }); }
    d.card = { k: c.k, id: c.id || null, at: s.t };
    if (c.k !== 'offer') { d.lastOther = s.t; d.cardTurn = 0; } else { c.shown = 1; if (c.id === 'meetup') s.flags.meetupShown = 1; }
    if (!(CHAINED[c.k] || c.ch)) d.lastCard = s.t;
    d.idle = 0;
    out.push({ type: 'show', place: 'card', k: c.k, id: c.id || null });
    log(s, 'shown', { p: 'card', k: c.k, card: c.k + ':' + (c.id || ''), t: c.qt });
  }

  /* ───────────── new things on the right ───────────── */

  function rows(s) {
    var d = dir(s), items = E.items(s), vis = [], gold = [], fresh = false;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.owned) continue;
      vis.push(it.id);
      if (it.can) gold.push(it.id);
      if (d.vis.indexOf(it.id) < 0 || (it.can && d.gold.indexOf(it.id) < 0)) fresh = true;
    }
    d.vis = vis; d.gold = gold;
    if (fresh) d.idle = 0;
  }

  /* ───────────── ahead and behind ───────────── */

  /* An act's closing project waits for that act's required beats; while it is banked and waiting, the player is ahead. */
  X.ahead = function (s) {
    boot();
    var p;
    if (s.act === 1 && s.up.flow && !s.person) return s.res.clarity >= D.act1.project.cost;
    if (s.act === 2 && s.flags.speakSeen && !X.beatsDone(s, 'p_speak')) return s.res.insight >= D.act2.project.cost;
    if (s.act === 3 && s.up.dynamo && !X.beatsDone(s, 'p_broadcast')) { p = D.act3.project; return s.res.insight >= p.cost && s.res.followers >= p.people; }
    /* the bar has stopped and the finale waits for the story still due */
    if (s.act === 4 && s.flags.clamped && s.bought4 >= D.act4.order.length) return true;
    return false;
  };
  X.beatsDone = function (s, id) {
    var a = s.answers;
    /* (EE-108) the tracker's four lines are story: Hum does not wake before they have all been said */
    if (id === 'p_pattern') return !!s.person && (!s.up.tracker || !s.trk || s.trk.i >= ST.act1.tracker.length);
    if (id === 'p_speak') return ('sleep' in a) && ('unsaid' in a) && ('fifteen' in a);
    if (id === 'p_broadcast') return a.keep != null;
    return true;
  };

  /* the cheapest thing not yet bought, and what the player is short of it */
  function shortfall(s) {
    var items = E.items(s), best = null;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.owned || it.can || it.need) continue;
      if (it.grp !== 'practice' && it.cur !== E.actRes(s) && !(s.act === 3 && it.cur === 'insight')) continue;
      if (!best || it.cost - s.res[it.cur] < best.cost - s.res[best.cur]) best = it;
    }
    if (!best) return null;
    return { res: best.cur, amt: Math.max(0, best.cost - s.res[best.cur]) };
  }
  /* what one second of play earns in a resource: the passive rate, plus one gold breath per breath */
  function income(s, res) {
    var r = E.rates(s), B = D.breath;
    var pass = res === 'clarity' ? r.clarity : res === 'insight' ? r.insight : res === 'energy' ? r.energy : r.people;
    var press = res === E.actRes(s) ? (r.pressFlat + r.pressShare) * B.onMult / B.period : 0;
    return pass + press;
  }

  function pull(s, out, ahead) {
    var d = dir(s), t = s.t, R = D.dir, i, what = null;
    d.idle = 0; d.pulls += 1; d.lastPull = t;
    /* 1. a story item that is due: let it through now */
    var head = s.queue[0];
    if (head && head.k !== 'thought' && head.k !== 'captcha') { d.lastCard = -999; d.quiet = Math.min(d.quiet, t); what = head.k + ':' + (head.id || ''); }
    for (i = 0; !what && i < d.q.length; i++) if (pri(d.q[i].k) <= pri('story')) { d.quiet = Math.min(d.quiet, t); d.q[i].nw = 1; what = idOf(d.q[i]); }
    /* 2. a thought (Acts I–II), Hum's gift (II on), a lotus (III on), with the reward that covers the shortfall */
    if (!what && !ahead) {
      d.pullN += 1;
      var hasThought = s.queue.some(function (c) { return c.k === 'thought'; });
      if (s.act <= 2 && !hasThought && (s.act === 1 || d.pullN % 2 === 1)) {
        var th = E.pickThought(s);
        if (th) {
          var sf = shortfall(s), card = { k: 'thought', id: th.id, qt: t };
          if (sf && sf.amt > 0) card.b = { res: sf.res, amt: Math.min(sf.amt, R.pullCap * income(s, sf.res)) };
          s.queue.push(card); d.lastCard = -999; d.quiet = Math.min(d.quiet, t);
          what = 'thought:' + th.id;
        }
      }
      if (!what && s.act >= 3 && d.pullN % 2 === 0) { out.push({ type: 'lotus' }); s.tm.lotus = t + 60; what = 'lotus'; }
      if (!what && s.act >= 2) { E.gift(s, out, true); what = 'gift'; }
    }
    /* 3. a line: chatter, a world line */
    if (!what && s.act >= 2) {
      var it = X.say(s, out, s.act >= 3 ? { k: 'world', p: 'caption', src: 'world' } : { k: 'chatter', src: 'chatter' });     /* (the pull was the new thing, EE-108) */
      d.quiet = Math.min(d.quiet, t);
      what = idOf(it);
    }
    log(s, 'pulled', { p: 'director', k: 'pull', id: what || 'nothing', t: t }, { idle: R.behind[s.act] });
  }

  /* ───────────── hints: light first, words third (DESIGN §4.7) ───────────── */

  /* The thing a hint points at: a row or panel id (never a named upgrade, so rows can be renamed), or the ring. */
  function target(s) {
    var items, i, it;
    if (s.act === 1 && s.clicks === 0) return { tg: 'ring0', w: 'ring0' };
    if (s.pr && (s.pr.help || s.pr.hint)) return { tg: 'ring', w: 'press' };
    items = E.items(s);
    for (i = 0; i < items.length; i++) {
      it = items[i];
      if (!it.can || it.owned || it.hz) continue;
      /* an act's closing project, or a panel's first row offered at the ring (round 2) */
      if (it.kind === 'project') return { tg: 'row:' + it.id, w: 'panel' };
      if (it.offer) return { tg: 'row:' + it.id, w: s.act === 1 ? 'up' : 'panel' };
      if (s.act === 1 && it.grp === 'practice') return { tg: 'row:' + it.id, w: 'up' };
      if (s.act === 4 && it.grp === 'engine' && s.bought4 === 0) return { tg: 'row:' + it.id, w: 'panel' };
    }
    return null;
  }
  function hints(s, out) {
    var d = dir(s), t = s.t, H = D.hint, tg = target(s), ht = d.ht, i;
    if (!tg || !ht || ht.tg !== tg.tg) {
      /* the thing was done (or another took its place): everything about the old hint stops at once */
      if (ht) {
        for (i = d.q.length - 1; i >= 0; i--) if (d.q[i].k === 'hint' && d.q[i].tg === ht.tg) { log(s, 'dropped', d.q[i], { why: 'done' }); d.q.splice(i, 1); }
        if (d.voice && d.voice.tg === ht.tg && !d.voice.dim) { d.voice.until = t; d.voice.dim = 1; out.push({ type: 'unshow', place: 'voice' }); log(s, 'cut', { p: 'voice', k: 'hint', id: 'hint:' + ht.tg, t: t }); }
        if (ht.on) out.push({ type: 'hint', tg: null });
      }
      d.ht = ht = tg ? { tg: tg.tg, w: tg.w, since: t, on: 0, next: 0, n: 0 } : null;
      if (!ht) return;
    }
    if (ht.tg === 'ring0') {
      /* never pressed: the two press lines at their times (story.nudges.press[].after) */
      var P = ST.nudges.press;
      if (ht.n < P.length && t >= P[ht.n].after) { X.say(s, out, { k: 'hint', src: 'hint', w: 'ring0', i: ht.n, tg: ht.tg }); ht.n += 1; }
      return;
    }
    if (ht.tg === 'ring') {
      /* the press (EE-108, eye pass item 2): the rule was said, once, at the first breath pressed off the gold (E.press);
       * "now" is on the rim while the help lasts; three breaths with no gold press and the timing line is said, then
       * again every H.again s, until the help ends (three gold presses) */
      var P3 = 3 * E.period(s);
      if (!ht.on) { ht.on = 1; ht.next = t + P3; out.push({ type: 'hint', tg: ht.tg }); log(s, 'hint', { p: 'hint', k: 'hint', id: ht.tg, t: ht.since }); }
      var due = Math.max(ht.next, (s.pr.gt != null ? s.pr.gt : -999) + P3);
      if (t >= due && !X.pending(s, function (x) { return x.k === 'hint'; })) {
        X.say(s, out, { k: 'hint', src: 'hint', w: 'timing', i: d.hw.press || 0, tg: ht.tg });
        d.hw.press = (d.hw.press || 0) + 1;
        ht.n += 1;
        ht.next = t + H.again[0] + (H.again[1] - H.again[0]) * E.rand(s);
      }
      return;
    }
    var after = s.act === 1 ? H.afterAct1 : H.after;
    if (!ht.on && t - ht.since >= after) {
      ht.on = 1; ht.next = t + H.words;
      out.push({ type: 'hint', tg: ht.tg });
      log(s, 'hint', { p: 'hint', k: 'hint', id: ht.tg, t: ht.since });
    }
    if (ht.on && t >= ht.next && !X.pending(s, function (x) { return x.k === 'hint'; })) {
      var w = ht.w, k = w === 'press' ? 'press' : w;
      X.say(s, out, { k: 'hint', src: 'hint', w: w, i: d.hw[k] || 0, tg: ht.tg });
      d.hw[k] = (d.hw[k] || 0) + 1;
      ht.n += 1;
      ht.next = t + H.again[0] + (H.again[1] - H.again[0]) * E.rand(s);
    }
  }

  boot();
})(typeof window !== 'undefined' ? window : globalThis);
