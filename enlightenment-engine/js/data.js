/* The Enlightenment Engine — numbers.
 * Every tunable lives here. economy.js reads it; tools/sim.js proves the pacing (docs/sim-output.txt).
 * Text lives in story.js. Systems are described in docs/DESIGN.md §4.
 */
(function (root) {
  'use strict';
  var EE = root.EE = root.EE || {};

  EE.data = {
    K: 8e9,                       // everyone
    /* One breath is 6 s: 2.6 s swelling, 3.4 s settling (10 a minute; the out-breath is the longer one).
     * The fullest point is `inhale` seconds into the cycle. */
    breath: { period: 6.0, inhale: 2.6, window: 0.50, windowSync: 0.75, onMult: 7.5, streakStep: 0.1, streakCap: 10, restless: 0.6, restlessPay: 0.25,
      ordinaryCap: 3 },   /* a breath pays once (2026-11-13): ordinary presses in one cycle pay at most 3 presses' worth */

    /* An on-breath press also pays this many seconds of the act's current production (per unit of press
     * multiplier, before the ×5 and the streak). Ordinary presses pay the flat base only, so calm play is
     * the strong play at every scale. Act I is flat on purpose: the first act is the design table as written. */
    pressSeconds: { 1: 0, 2: 0.12, 4: 0.0012 },   // Act III: see act3.invite

    dayRate: { 1: 0.05, 2: 0.1, 3: 2, 4: 8 },
    sigilBonus: 0.10,

    act1: {
      order: ['metronome', 'ambient', 'focus', 'imagery', 'tracker', 'sync', 'garden', 'group', 'flow'],
      up: {
        metronome: { cost: 10, cps: 0.5 },
        ambient: { cost: 25, cps: 1 },
        focus: { cost: 60, press: 2 },
        imagery: { cost: 120, cps: 3 },
        tracker: { cost: 250, cps: 5 },
        sync: { cost: 500, cps: 5 },
        garden: { cost: 900, press: 2 },
        group: { cost: 1500 },
        flow: { cost: 2500, cps: 25 }
      },
      styleMult: 3,
      project: { cost: 5000 },
      personAt: 20,
      dawnAt: 5000,
      thoughtGap: [35, 55]
    },

    act2: {
      gens: {
        compress: { tree: 'head', base: 25, mult: 1.3, ips: 0.5 },
        threads: { tree: 'head', base: 200, mult: 1.3, ips: 3, press: 1 },
        emo: { tree: 'heart', base: 25, mult: 1.3, ips: 0.5 },
        dreams: { tree: 'heart', base: 200, mult: 1.3, ips: 3 }
      },
      caps: {
        compiler: { tree: 'head', cost: 3000 },
        heartbeat: { tree: 'heart', cost: 3000 }
      },
      order: ['compress', 'threads', 'compiler', 'emo', 'dreams', 'heartbeat'],
      project: { at: 10000, cost: 8000 },
      trustInsight: 0.05,
      thoughtGap: [80, 120],
      at: { whyAmI: 40, sleep: 120, captcha: 300, h_alive: 700, unsaid: 1500, h_odile: 3000, fifteen: 6000 },
      odileMult: 1.25, odileCost: 1.10
    },

    act3: {
      order: ['meetup', 'tone', 'forum', 'mouth', 'pocket', 'line', 'rooms', 'dynamo'],
      up: {
        meetup: { cost: 300, flat: 1 },
        tone: { cost: 1000, flat: 4 },
        forum: { cost: 1800, press: 5 },
        mouth: { cost: 4000, r: 0.00135 },
        pocket: { cost: 4200, rMult: 1.6 },
        line: { cost: 8000, rMult: 1.5 },
        rooms: { cost: 27000, rMult: 1.5 },
        dynamo: { cost: 760000, rMult: 1.3 }
      },
      project: { people: 10000000, cost: 3000000 },
      outreachBase: 0.4, outreachSlope: 1.8,
      trustMult: 0.15,
      sittingClarity: 0.1, supportInsight: 0.05,
      invite: 0.0009,             // an on-breath Invite also brings this share of the Circle (× press ×5 ×streak × everything that scales growth)
      allocAt: 25,
      /* The first twelve are met one at a time: an on-breath Invite brings the next (three ordinary presses do too),
       * never sooner than `spacing` seconds after the last, and one arrives anyway after `auto` seconds. */
      first: { n: 12, spacing: 5, auto: 12, knocks: 3 },
      /* After twelve the tap opens gradually: every source of people is multiplied by
       * base + (1 - base) × ((F - 12) / (until - 12))^pow until F reaches `until`. */
      tap: { until: 100, base: 0.03, pow: 3 },
      at: { h_cult: 20, h_pitch: 1000, h_ministry: 10000, h_first: 200000, keep: 2000000, h_number: 1000000000 },
      pitchR: 1.5,
      trickle: 0.05                // share of the Energy formula that leaks through before Act IV
    },

    act4: {
      order: ['retreats', 'amps', 'fusion', 'temple', 'art', 'gate', 'science', 'festival'],
      up: {
        retreats: { energy: 3 },
        amps: { energy: 3 },
        fusion: { press: 10, rMult: 1.3 },
        temple: { energy: 3 },
        art: { energy: 2 },
        gate: { press: 10, energy: 2 },
        science: { energy: 3, insight: 3 },
        festival: { energy: 5 }
      },
      costs: [4e5, 3e6, 2.5e7, 1.5e8, 1.5e9, 1.2e10, 6e10, 2.5e11],   // the n-th purchase, whichever project it is
      k: 0.001,                    // Energy per sitting person per second
      broadcastR: 2,
      purse: [1.3, 4],             // starting purse, in multiples of the first project's cost (min, max)
      purseRate: 0.01,             // banked Clarity → Energy
      closeAt: 0.999, closeTau: 1.0,
      epilogue: [3e7, 1e9, 2.5e10, 2e11],
      energyTop: 5e11              // total Energy that reads as full radiance on the picture
    },

    speech: {
      plain: { insightMul: 0.7, insightFor: 30, leave: 0.04 },
      smooth: { insightMul: 3, insightFor: 60, growMul: 2, growFor: 60 },
      quiet: { growMul: 0.5, growFor: 45 },
      ministry: { insightSeconds: 60, growMul: 2, growFor: 60 },
      upkeepInsight: 0.95, upkeepEnergy: 0.95,
      knot: { after: 120, grown: 20, latest: 240, apart: 45 },
      clean: { insight: 0.20, people: 0.05 },
      patch: { seconds: 30 },
      confess: { people: 0.04, peopleMax: 0.30, insight: 0.10, insightMax: 0.50, trust: 1 },
      collapse: { at: 12, lose: 0.5, halt: 30 }
    },

    small: {
      thought: { pass: 20, follow: 10, min: 10, timeout: 25 },
      captcha: 60,
      orb: { chance: 0.01, cooldown: 30, life: 5, seconds: 30, min: 25 },
      lotus: { mean: 90, life: 8, mult: 2, lasts: 30 },
      gift: { mean: 150, mult: 1.25, lasts: 30 },
      stillness: { after: 60, first: 60, again: 30 },
      /* nudges (seconds of real time): an Act I upgrade affordable and untouched; the first thing of a new kind in a
       * later act; the allocation steppers never touched; how long a nudged row glows; cycles the timing guide stays */
      nudge: { upgrade: 15, panel: 25, alloc: 60, glow: 20, guideCycles: 5, timingAfter: 15 },
      chatter: { 2: 50, 3: 90, 4: 90 },
      ticker: 12,
      offline: { after: 60, cap: 7200, rate: 0.5 }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
