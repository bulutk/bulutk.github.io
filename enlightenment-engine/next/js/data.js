/* The Enlightenment Engine — numbers.
 * Every tunable lives here. economy.js reads it; tools/sim.js proves the pacing (docs/sim-output.txt).
 * Text lives in story.js. Systems are described in docs/DESIGN.md §4.
 */
(function (root) {
  'use strict';
  var EE = root.EE = root.EE || {};

  EE.data = {
    K: 8e9,                       // everyone
    /* One breath is 4 s (2026-11-19, Bulut after Duygu's playtest: "let's make it 4 again"): 1.75 s swelling, 2.25 s
     * settling. The fullest point is `inhale` seconds into the cycle. The gold window is ±`window` s round it (±`windowHelp`
     * for a player who can't find it, until `helpGolds` gold presses). When the bar stops the breath slows to `slow` s.
     * A breath pays once (DESIGN §4.1): the first press in the window (gold) pays base × onMult × the streak; a first press
     * outside it pays the base once (`missPay` × base); every other press pays nothing (a dry tap). `onMult` 5 is the pay
     * per second the design had at 4 s. Six dry taps inside `restless.span` s play the restless line, once a run. */
    breath: { period: 4.0, inhale: 1.75, window: 0.50, windowHelp: 0.80, onMult: 5, streakStep: 0.1, streakCap: 10,
      missPay: 1, helpAfter: 2, helpGolds: 3, restless: { taps: 6, span: 3 } },

    /* A gold press also pays this many seconds of the act's current production (per unit of press multiplier, before
     * the ×5 and the streak). Act I is flat on purpose. */
    pressSeconds: { 1: 0, 2: 0.04, 4: 0.0012 },   // Act III: see act3.invite

    /* The breath slows to `slow` seconds when the bar stops (the finale, the Final Alignment and the Sit ending): the only
     * human-paced breath is the last (merged design §1). */
    slow: 6,

    dayRate: { 1: 0.05, 2: 0.1, 3: 2, 4: 8 },
    sigilBonus: 0.10,
    trustFull: 8,                 // Trust counts with diminishing weight up to this many (economy.js E.trustN; EE-108)

    /* Round 2 (EE-106): every row says what it does in one line with a number (story.js `fx`), and that number is the one
     * here. tools/sim.js checks every row's line against these. */
    act1: {
      order: ['metronome', 'ambient', 'tracker', 'focus', 'group'],
      up: {
        metronome: { cost: 10, cps: 1 },          /* +1 Clarity every second */
        ambient: { cost: 60, cps: 2 },            /* +2 Clarity every second */
        tracker: { cost: 120, streak: 1 },        /* each breath in a row pays 10% more, up to double (breath.streakStep, streakCap) */
        focus: { cost: 200, gold: 2 },            /* a breath on the gold pays double */
        group: { cost: 350, cps: 8 }              /* +8 Clarity every second */
      },
      project: { cost: 650 },   /* EE-110: was 600 (the run's length, now that Acts III–IV are tighter) */
      personAt: 20,
      offerAfter: 10,              /* the Metronome's card rises after the three first-breath lines, or this long after the first press (EE-108) */
      dawnAt: 3000,
      thoughtGap: [35, 55],
      /* the tracker talks before Hum does (merged design §4): after the `breaths`-th gold breath (EE-108: the sixth); then
       * once Session Tracker is bought, its lines at least `gap` s apart, the first `after` s after buying it. Its lines
       * are story: they wait, and are never dropped; without Session Tracker the second waits `unbought` s after the first */
      tracker: { breaths: 6, after: 22, gap: 26, unbought: 60 }
    },

    act2: {
      /* levels: the n-th costs base × mult^n */
      gens: {
        listen: { base: 15, mult: 1.3, ips: 1 },     /* +1 Insight a second, each */
        threads: { base: 150, mult: 1.3, ips: 6 }    /* +6 Insight a second, each */
      },
      jar: { cost: 400 },                           /* thoughts pay Insight */
      /* Head or Heart: a decision card once this much Insight has been made; the one not picked is a row at `other` */
      fork: { at: 2400, other: 4000, head: 2, heart: 4, gifts: 2 },
      project: { cost: 9000 },      /* EE-110: was 4000; Act II runs about 40 s longer, so its cards have room; EE-111: 9000 (at 9700 the half bot's first person comes at 11:06: 11:00 caps it) */
      /* the handover (merged design §4): on the first breath of Act II the player lets go by, or its `breath`-th breath,
       * Hum takes the breathing. From then on Hum's breath pays the base every breath, and a gold press on top is a
       * breath together: the same again, with the streak. */
      handover: { breath: 4 },
      trustInsight: 0.06,          // Trust: +6% Insight each, for good, the first counting most (E.trustN; EE-108: was +8% flat, merged design §6)
      thoughtGap: [70, 100],
      at: { whyAmI: 40, sleep: 900, h_alive: 1500, unsaid: 3000, h_odile: 4000, captcha: 6000, fifteen: 9000, speak: 9000 },
      odileMult: 1.25             // h_odile said plainly: a bigger server, Insight ×1.25 for good (round 2: no longer costs more)
    },

    act3: {
      /* EE-110 (item 5): priced so a calm player buys one about every 50 s from the twelfth to the Global Broadcast (the sim
       * bot buys only what is in view: Hum's rows are folded from Act III on), and checked against the real-speed full run,
       * which comes into Act III with less Insight a second than the bots (about 270/s against 390/s). */
      order: ['meetup', 'tone', 'forum', 'mouth', 'pocket', 'line', 'rooms', 'dynamo'],
      /* EE-110 (Muse's ruling after the second verifier): every row after Local Meetup also waits for the Circle to reach
       * `need` people, so the purchases come about every 45 s whatever Insight is banked when the twelve are in (a quick
       * player had 8k, a slow one 18k, and The Long Tone came 71 s or 55 s after Local Meetup). The Insight costs are low
       * enough for a player making about 250 Insight a second. EE-111 (Muse): the rows open with the fourth of the twelve;
       * The Long Tone waits for the ninth, Open Forum for 18; the rest are tuned (scratch tuner, calm and mixed bots) to about
       * 47 s apart, neither bot over 50. */
      up: {
        meetup: { cost: 12000, flat: 1 },                       /* +1 person every second */
        tone: { cost: 6000, need: 9, flat: 4 },                 /* +4 people every second */
        forum: { cost: 8000, need: 18, press: 5 },              /* a breath together invites five times as many */
        mouth: { cost: 10000, need: 690, r: 0.00135 },          /* people bring people */
        pocket: { cost: 14000, need: 3100, rMult: 1.6 },        /* the Circle grows 60% faster */
        line: { cost: 18000, need: 9200, rMult: 1.5 },          /* 50% faster */
        rooms: { cost: 24000, need: 33000, rMult: 1.5 },        /* 50% faster */
        dynamo: { cost: 40000, need: 140000 }                   /* Energy starts collecting */
      },
      project: { people: 420000, cost: 120000 },     /* EE-110: was 10 million people and 1 million Insight */
      /* The allocation panel is cut (merged design §4, 12:25): the Circle's Insight comes from everyone in it. What the
       * old default shares gave is now the base: word of mouth at `outreach`, Clarity and Energy from a `sitting` share,
       * Insight from a `support` share. */
      outreach: 1.0, sitting: 0.33, support: 0.33,
      trustMult: 0.06,             // Trust: +6% growth and Energy each, for good, the first counting most (E.trustN; EE-108: was +8%)
      sittingClarity: 0.1, supportInsight: 0.05,
      invite: 0.0004,             // an on-breath Invite also brings this share of the Circle (× press ×5 ×streak × everything that scales growth)
      /* The first twelve are met one at a time: an on-breath Invite brings the next (three ordinary presses do too),
       * never sooner than `spacing` seconds after the last, and one arrives anyway after `auto` seconds. The Circle's rows
       * (and the Local Meetup offer) open once `offerAt` have arrived, while the others keep arriving. */
      first: { n: 12, spacing: 6, auto: 8, knocks: 3, offerAt: 4 },   /* EE-111 (Muse): 8 s apart, an Invite never under 6 s; Local Meetup at the fourth */
      /* After twelve the tap opens gradually: every source of people is multiplied by
       * base + (1 - base) × ((F - 12) / (until - 12))^pow until F reaches `until`. */
      tap: { until: 100, base: 0.03, pow: 3 },
      at: { h_cult: 20, h_pitch: 5000, h_ministry: 10000, h_first: 15000, keep: 25000, h_number: 1000000000 },   /* h_ministry's card says ‘ten thousand’; EE-110: h_first and keep long before the First Engine (were 1.5 and 5 million) */
      fallback: 46,               // (EE-111) a Circle row whose people have not come 46 s after the last Circle purchase opens anyway, at the count then
      friendWait: 40,
      knotWait: 30,                // no knot in Act III until Local Meetup is bought, or this long after the twelfth (EE-110)              // the thirteenth's question: once Local Meetup is bought, or this long after the twelfth (EE-108)
      notCounted: 25,              // seconds after The Morning Line: "{person} isn't in the count"
      pitchR: 1.5,
      trickle: 0.05                // share of the Energy formula that leaks through before Act IV
    },

    act4: {
      /* the twelve's projects (merged design §5): buying one lights its person's dot for good (`who`: index in story.act3.circle) */
      order: ['retreats', 'amps', 'fusion', 'temple', 'art', 'gate', 'science', 'festival'],
      up: {
        retreats: { energy: 3, who: 11 },           /* Ana's house: Energy ×3 */
        amps: { energy: 3, who: 2 },                /* Mei-Lin's steady hands: Energy ×3 */
        fusion: { press: 10, who: 5 },              /* Yusuf's song: Breaths ×10 */
        temple: { energy: 3, who: 10 },             /* The room that isn't there: Energy ×3 (Ingrid) */
        art: { energy: 2, who: 3 },                 /* Arjun's print shop: Energy ×2 */
        gate: { press: 10, energy: 2, who: 9 },     /* Hum's door: Breaths ×10, Energy ×2 (Sipho) */
        science: { energy: 3, who: 8 },             /* Leila's forty languages: Energy ×3 */
        festival: { energy: 5, who: 4 }             /* A table in every street: Energy ×5 (Camila) */
      },
      costs: [4e6, 4e6, 5e6, 1e7, 5e7, 2e8, 1e9, 4e9],               // the n-th purchase, whichever project it is (EE-110: low enough that `need` paces them)
      need: [1.7e6, 5.4e6, 1.8e7, 5.8e7, 1.9e8, 5.4e8, 1.7e9, 4.3e9],           // ... once the Circle has this many people (EE-110, EE-111: about 49 s apart, the last ~70 s before the bar stops)
      k: 0.002,                    // Energy per sitting person per second (bundle C: ×2 when Trust became +8%)
      broadcastR: 3.12,             // bundle C: 2 → 2.3 when Trust became +8%; EE-110: 3.6, Act IV starts with a smaller Circle; EE-111: 3.12, Act IV long enough for its eight
      purse: [3, 6],               // starting purse, in multiples of the first project's cost (min, max)
      purseRate: 0.01,             // banked Clarity → Energy
      closeAt: 0.999, closeTau: 1.0,
      damp: 0.35,                  // Act IV: growth × (1 − F/K)^damp (Act III: to the power 1)
      epilogue: [1.35e7, 2.4e7, 5.8e8, 4e10],   // total Energy: between the projects (EE-110: about 18:55, 19:55, 21:40, 23:25 for the calm bot)
      energyTop: 5e11              // total Energy that reads as full radiance on the picture
    },

    /* True speech (round 2, bundle C, EE-107; merged design §6; DESIGN §4.3). Tangle never slows the game: no upkeep, no
     * collapse, no "Tell them everything", and a plain answer costs nothing. A smooth answer pays its boost now; a plain
     * one earns Trust for good (act2.trustInsight, act3.trustMult). h_odile's plain answer moves Hum to a bigger server
     * (Insight ×odileMult for good) and h_ministry's sits in plain view (growth ×growMul for growFor s): both rewards,
     * never costs. Quiet is nothing at all: silence is not a lie. */
    speech: {
      smooth: { insightMul: 2, insightFor: 60, growMul: 1.55, growFor: 60 },   // EE-110: growth ×1.55 (was 2; the Circle's rows wait for people now, so plain and smooth stay within a minute)   // the boost now (bundle C: ×2 Insight, was ×3)
      ministry: { growMul: 2, growFor: 60 },
      knot: { after: 120, grown: 20, latest: 240, apart: 45 },
      /* sitting through a knot: Hum stops breathing; the player's gold breaths, `breaths[w - 1]` for a line of weight w
       * (EE-108: 3, 5 or 7; it held the stage for up to 48 s at four a weight); five breaths in a row with no gold press
       * and Hum patches it for them (walking away). k_counter's mark: the count really drops by `counterDrop`. */
      sit: { breaths: [3, 5, 7], quiet: 5, counterDrop: 0.11 }
    },

    /* Hum learns from you (merged design §6): one number, lean, +1 for each smooth answer and each patch, −1 for each
     * plain answer and each knot sat through. Its bands: at `rounds` Hum rounds (counters, world lines, the twelve), at
     * `drafts` it drafts decisions (the smooth option lit; it sends after `draftBreaths` breaths of visible play), at
     * `small` it can't do the small ending (Coexistence closes), at `handles` it patches knots itself; at `gate` it won't
     * open the gate (Merge closes). The Sit ending appears after `sitWait` s or `sitPresses[0]` gold presses; when an
     * ending is closed, after `sitClosed` s or `sitPresses[1]` (EE-108: the closed ending points at it); at `handles`
     * only `sitPresses[2]` gold presses take the ring back. Two world lines in three come from the smooth set once Hum
     * rounds. */
    lean: { rounds: 1, drafts: 3, small: 4, handles: 6, gate: -4, draftBreaths: 3, sitPresses: [4, 2, 8], sitWait: 40, sitClosed: 15, smoothWorld: 2 },

    small: {
      thought: { pass: 20, follow: 10, min: 10, timeout: 25 },
      captcha: 60,
      orb: { chance: 0.01, cooldown: 30, life: 5, seconds: 30, min: 25 },
      lotus: { mean: 90, life: 8, mult: 2, lasts: 30 },
      gift: { mean: 150, mult: 1.25, lasts: 30 },
      stillness: { after: 60, first: 60, again: 30 },
      chatter: { 2: 50, 3: 90, 4: 90 },
      ticker: 12,                   /* a world line is offered every 12 s in Acts III–IV (the caption) */
      offline: { after: 60, cap: 7200, rate: 0.5 }
    },

    /* The director (js/director.js, DESIGN §4.6): every message the player is shown passes through it. Game seconds. */
    dir: {
      /* reading time: base + perChar × characters, at least `min`; ×cjk per character in Japanese, Chinese, Korean */
      read: { base: 1.5, perChar: 0.055, min: 2.5, cjk: 2.2 },
      quiet: 3,                 /* after a line's reading time, before anything the player didn't ask for */
      pressCard: 1.5,           /* no card rises this long after a ring press (EE-108) */
      pressCardMax: 8,          /* ... unless it has been held back this long (a player who never stops pressing) */
      cardGap: 25,              /* at most one card per 25 s ... */
      cardGapAhead: 12,         /* ... 12 s for an act's required beats once its closing project is banked */
      busy: 2.5,                /* a row bought or hovered: everything but the reply waits this long */
      offerHold: 10,            /* an offer at the ring keeps the card dock this long before another card may displace it */
      offerSoon: 6,             /* the Local Meetup offer rises beside the fourth arrival's line once read, or this long after it arrived (EE-110, EE-111) */
      typeGap: 40,              /* at least this long between two cards that ask for typing (from one's close to the next's rise; EE-110) */
      captchaQuiet: 40,         /* the captcha rises only when no card has been on the stage this long; skipped if another card waits (EE-110) */
      worldSoon: 8,             /* a world line does not start when a card will be due within this long (about its reading time; EE-110) */
      actHold: 3.2,             /* an act turn: its title card first */
      /* priority, lowest first: the reply to the player's own action · act turns and sequences · decisions, knots,
       * questions and story lines · a hint's words · thoughts · Hum's chatter and gifts, beads · tracker · world · ambient */
      pri: { reply: 0, act: 1, seq: 1, story: 2, card: 2, hint: 3, thought: 4, worldLate: 4.5, chatter: 5, gift: 5, tracker: 6, world: 7, ambient: 8 },
      /* dropped after this long waiting (never shown stale); kinds not listed never drop (the tracker's lines are story,
       * EE-108; a world line waits up to 30 s) */
      drop: { ambient: 15, chatter: 15, thought: 30 },     /* (a world line no longer drops: its line is picked when shown, EE-110) */
      worldDue: 30,             /* no world line for this long: the next outranks chatter (pri.worldLate) */
      worldMax: 25,             /* Acts III–IV: the next world line starts at most this long after the last (EE-110: ≤ 30 s, start to start);
                                   a line or card that would still be up by then waits for it, and once it is due it takes the first clear moment */
      cardEst: { decision: 24, knot: 24, question: 20, thought: 12, other: 16 },   /* how long a card is reckoned to hold the stage, answered and its result read (for the line above; EE-110: a knot held 27 s in the full run) */
      trackerHold: 1.5,         /* the tracker's lines stay lit 1.5× their reading time */
      replies: 3,               /* three purchase replies waiting: the newest plays, the others go to the Journal */
      behind: { 1: 30, 2: 30, 3: 38, 4: 44 },   /* nothing new for this long: pull the next thing (III: 38, IV: 44, EE-110: the purchases come about every 45–50 s; at most one pull per 2 min) */
      pullCap: 40,              /* a pulled reward covers the shortfall to the cheapest row, up to this many s of income */
      /* a world line holds its full reading time plus its way in (up to 0.4 s for a dimmed line to leave, then 0.3 s), and
       * nothing but a reply to the player speaks over it (EE-110); it fades out (1.5 s) as the next thing comes, which needs
       * no quiet after it (`quiet`: the caption is another place); the next world line waits `gap` s */
      caption: { fade: 0.7, gap: 2, quiet: 0 },
      backlog: 12,              /* the invariant: messages waiting (voice, caption and cards together) never exceed this */
      log: 400                  /* EE.dev.log keeps this many entries */
    },

    /* Hints (DESIGN §4.7): light first, words third. A row usable and untouched for `after` s (Act I: `afterAct1`, EE-108): motes every second breath
     * and the row glows gold with the breath, with no timeout; words at the third stream, then every `again` s. */
    hint: { after: 12, afterAct1: 8, words: 16, again: [40, 45] }
  };
})(typeof window !== 'undefined' ? window : globalThis);
