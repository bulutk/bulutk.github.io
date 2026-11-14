/* The Enlightenment Engine — every word in the game.
 * Authored by Muse (design). Code reads this; it does not write prose of its own.
 *
 * Conventions
 *  - A line that starts with "> " is Hum (the AI) speaking: lowercase, monospace, teal.
 *  - Any other line is the narrator: second person, present tense, serif.
 *  - Tokens: {hum} AI's name · {person} / {Person} the one you keep meaning to call · {unsaid} what you haven't told them
 *    {sleep} {fifteen} {keep} the player's three answers · {first} the first follower's name · {city} a random city
 *    {day} current day · {n} a number supplied by the caller.
 *  - Where an entry has {plain: [...], smooth: [...]}, pick by Hum's voice (plain when trust >= tangle, else smooth).
 */
window.EE = window.EE || {};

EE.story = {

  meta: {
    title: "The Enlightenment Engine",
    tagline: "A small game about sitting still, and everything you'll build to avoid it.",
    defaultHum: "Hum",
    actTitles: {
      1: { num: "I", name: "The Cushion" },
      2: { num: "II", name: "{hum}" },
      3: { num: "III", name: "The Circle" },
      4: { num: "IV", name: "The Engine" }
    }
  },

  ui: {
    press: { 1: "Breathe", 2: "Think together", 3: "Invite", 4: "Radiate" },
    resources: { clarity: "Clarity", insight: "Insight", followers: "People", energy: "Energy", sigils: "Sigils" },
    panels: { practice: "Practice", hum: "{hum}", circle: "The Circle", engine: "The Engine", ledger: "The Ledger", beads: "Beads", journal: "Journal" },
    breathHint: "The ring swells and settles. Press when it's fullest and the breath counts for more. Or just press. Nobody's grading this.",
    onBreath: ["on the breath", "there", "yes", "in time", "just so"],
    streakLabel: "breaths in a row",
    legend: "1 dot = {n}",
    legendOne: "1 dot = 1 person",
    trust: { name: "Trust", desc: "Things said plainly. It compounds." },
    tangle: { name: "Tangle", desc: "Things smoothed over. {hum} keeps every version straight, for everyone, all the time." },
    upkeep: "keeping the story straight",
    alloc: {
      title: "Where people put their mornings",
      outreach: { name: "Outreach", desc: "knocking on doors, gently" },
      sitting: { name: "Sitting", desc: "actually doing the thing" },
      support: { name: "Support", desc: "keeping {hum}'s lights on" }
    },
    trees: { head: { name: "Head", desc: "pattern, proof, the shortest path" }, heart: { name: "Heart", desc: "people, weather, why the bus was late" } },
    card: { thought: "A thought", decision: "A decision", knot: "A knot", question: "{hum} asks", optional: "Writing is optional.", keep: "Keep it to myself" },
    lastTime: "last time",
    star: "Tap a line to keep it.",
    offline: "While you were away ({n}), the room kept breathing.",
    save: { export: "Copy save", import: "Paste save", reset: "Start over", resetConfirm: "Erase everything and start from the first breath?" },
    sound: { on: "Sound on", off: "Sound off" },
    bar: "Global Enlightenment",
    finalButton: "Initiate Final Alignment"
  },

  /* ───────────────────────── ACT I ───────────────────────── */

  intro: [
    "6:40 a.m. The flat is quiet. The radiator ticks.",
    "You downloaded a meditation app last night at 2 a.m., the way people do.",
    "You sit down. You close your eyes.",
    "You open one eye to find the button."
  ],

  firstBreaths: ["In.", "Out.", "In. That's most of it, honestly."],

  dawn: [
    { at: 0.25, line: "The window goes from black to a blue you don't have a name for." },
    { at: 0.6, line: "A bin lorry, two streets away. A blackbird, closer. The day is assembling itself." },
    { at: 1.0, line: "The sun comes up. It has done this every day of your life and you have watched maybe nine of them." }
  ],

  stillness: {
    line: "You did nothing for a whole minute. That was the assignment.",
    again: ["Another minute of nothing. You're getting good at this.", "Nothing, again, on purpose. It's harder than the button."]
  },

  restless: "You're pressing very fast for someone trying to be calm.",

  /* Gentle nudges, only for a player who has not found something yet (Bulut's playtest with Maria, 2026-11-13).
   * Shown on the stage where the eyes already are, one at a time, in the narrator's voice. Never shown to a player
   * who is already doing the thing. {where} = nudges.where.wide or .narrow depending on the layout. */
  nudges: {
    /* Nobody has pressed the ring yet. `after` = seconds since the ring appeared. */
    press: [
      { after: 25, line: "You opened one eye to find the button. It's the ring." },
      { after: 50, line: "Press the ring, or the space bar. Either one counts as breathing here." }
    ],
    /* Shown right after the first stillness line if the ring has still never been pressed. */
    pressAfterStill: "Now the button. It's the ring.",
    /* Fifteen presses and none of them on the breath. */
    timing: "Try once when the ring is at its widest. It sounds different.",
    /* An upgrade has been affordable and untouched for a while. First, second and third time. */
    upgrade: [
      "The app is offering you something. It's {where}.",
      "It's offering another. The app is patient, but it does keep offering. Still {where}.",
      "One more, {where}. After this you'll know where to look."
    ],
    /* Later acts: the first thing of a new kind has been affordable and untouched for a while. */
    panel: "Something new is waiting {where}.",
    where: { wide: "on the right", narrow: "just below" }
  },

  act1: {
    upgrades: {
      metronome: { name: "Metronome", desc: "A soft tick the app plays. Somewhere to rest your attention.",
        log: "Tick. Tick. Your breath starts keeping time without being asked." },
      ambient: { name: "Rain on a Roof", desc: "A recording of rain from somewhere it actually rains.",
        log: "Rain on a roof you'll never stand under. It helps anyway." },
      focus: { name: "Deep Focus", desc: "Count to ten. Start again when you lose count. You will lose count.",
        log: "You get to four. That's a personal best." },
      imagery: { name: "Guided Imagery", desc: "A voice describes a garden. You furnish it.",
        log: "A garden assembles itself behind your eyes. There's a bench. You don't know whose." },
      tracker: { name: "Session Tracker", desc: "Lets the app keep count: sessions, minutes, breaths. It says it helps to be seen.",
        log: "The app asks permission to listen to your breathing. You tap Allow without reading it. Everyone does." },
      sync: { name: "Breath Sync", desc: "The app sets its pace to yours instead of the other way round.",
        log: "The ring starts waiting for you. You hadn't noticed it could." },
      garden: { name: "Zen Garden", desc: "A tray of sand on the windowsill. A tiny rake. It's ridiculous. It works.",
        log: "Petals from the neighbour's tree drift past the window. You let them be petals." },
      group: { name: "Sit With Others", desc: "The app can pair you with strangers sitting at the same minute.",
        log: "Eleven strangers breathe with you from eleven other rooms. Nobody says a word. It's the best conversation you've had this month." },
      flow: { name: "Energy Flow", desc: "Somewhere past the twentieth minute, the body stops complaining.",
        log: "Something moves up your spine like warm water. You decide not to google it." }
    },
    chart: { name: "Mindfulness Chart", log: "Your mornings, plotted. The line goes up. You feel absurdly proud of a line." },
    style: {
      title: "How do you sit?",
      body: ["Eleven strangers, eleven rooms. The app asks how you'd like to practise."],
      options: [
        { id: "active", label: "With a mantra. A word to come back to.", hint: "Active: every press counts triple.",
          log: "You pick a word. You won't tell anyone what it is. It's a slightly embarrassing word." },
        { id: "idle", label: "In stillness. Nothing to do, done properly.", hint: "Idle: the quiet earns triple.",
          log: "You do nothing, carefully. It turns out there is a great deal of nothing and most of it is nice." }
      ]
    },
    project: { name: "Pattern Model (beta)", button: "Opt in",
      desc: "The tracker has ‘noticed patterns in your sessions’. It would like to try something." }
  },

  /* The one you keep meaning to call. Asked once, early in Act I. */
  person: {
    title: "A thought",
    text: "A face surfaces. Someone you keep meaning to call.",
    options: [
      { id: "mother", label: "My mother", ref: "your mother" },
      { id: "father", label: "My father", ref: "your father" },
      { id: "friend", label: "An old friend", ref: "your old friend" },
      { id: "gone", label: "Someone who's gone", ref: "the one you lost" }
    ],
    /* Two steps (Bulut, 2026-11-13: one card with a name box and four buttons read as if the name belonged to the
     * last option). Step 1: `text` + the four options. Step 2, after picking: `namePrompt` + the box + two buttons. */
    namePrompt: "Do they have a name? You can keep it.",
    namePlaceholder: "A name",
    nameDone: "That's the name",
    nameKeep: "Keep it",
    after: "You think of {person}. Then you breathe, and the thought sets itself down. For now."
  },

  /* Stray thoughts. Each: let it pass, or follow it. `short` is how Hum refers to it later.
   * `needsPerson` thoughts only appear once the person is chosen. `gone` overrides text when person.kind === 'gone'. */
  thoughtLabels: { pass: "Let it pass", follow: "Follow it" },
  thoughtTimeout: "The thought leaves on its own. They do that.",
  thoughts: [
    { id: "stove", short: "the stove", text: "Did you leave the stove on? You haven't cooked since Tuesday.",
      pass: "The stove remains hypothetical.",
      follow: "You check. It's off. It was always off. The stove has never once been on." },
    { id: "dinner", short: "a dinner in 2014", text: "The thing you said at that dinner in 2014.",
      pass: "2014 goes back in its box.",
      follow: "You replay it. Nobody else at that table remembers. You are the last living archivist of that sentence." },
    { id: "text", short: "a text you owed {person}", needsPerson: true, text: "You should text {person} back.",
      pass: "Later. The word does a lot of work for you.",
      follow: "You open your eyes, type three words to {person}, delete two, and send ‘hey’. It counts.",
      gone: { text: "You should have texted {person} back.",
        pass: "You let it stand there a moment, then let it sit down.",
        follow: "You type three words to {person}. There is nowhere to send them. You keep them as a draft." } },
    { id: "working", short: "whether this was working", text: "Is this working? How would you know if it was working?",
      pass: "The question floats off, unanswered and unbothered.",
      follow: "You check the app. It says you are ‘in the top 40% of calm’. You feel competitive about calm, which seems wrong." },
    { id: "knee", short: "your knee", text: "Your knee hurts.",
      pass: "It hurts. You let it hurt. It gets bored first.",
      follow: "You shift. Now the other knee hurts. The knees are in this together." },
    { id: "song", short: "a song", text: "A song. Just the chorus. On loop.",
      pass: "It plays twice more and leaves, like a guest who can take a hint.",
      follow: "You hum it, out loud. Something in the app hums it back, half a tone flat. You decide you imagined that." },
    { id: "bakery", short: "a bakery", text: "What if you just quit your job and opened a bakery?",
      pass: "The bakery closes before it opens.",
      follow: "You get as far as the name of the bakery. It's a good name. You'll never tell anyone." },
    { id: "laugh", short: "the way {person} laughs", needsPerson: true, text: "{Person}'s laugh. Out of nowhere.",
      pass: "You let it ring and fade. It's still a good laugh.",
      follow: "You stay with it a while. It's been too long since you heard it anywhere but here." },
    { id: "emails", short: "your emails", text: "Emails. All of them. At once.",
      pass: "They will still be there. That is the one thing emails can be trusted to do.",
      follow: "You draft a reply in your head so cutting, so perfect, that you will never need to send it." },
    { id: "wrong", short: "doing it wrong", text: "You're doing it wrong. Everyone else can do this.",
      pass: "The thought has your old teacher's voice. You let the teacher go home.",
      follow: "You look it up. Everyone else thinks they're doing it wrong too. There are forums." },
    { id: "washing", short: "the washing", text: "It's raining. Did you bring the washing in?",
      pass: "The washing gets a second rinse. So it goes.",
      follow: "You run out in your socks. The neighbour's cat watches you with open contempt." },
    { id: "tenyears", short: "{person}, ten years from now", needsPerson: true, text: "What will {person} look like in ten years?",
      pass: "You don't follow it. Some doors you sit beside rather than open.",
      follow: "You do the arithmetic. You stop doing the arithmetic.",
      gone: { text: "What would {person} have looked like now?",
        pass: "You don't follow it. Some doors you sit beside rather than open.",
        follow: "You try to add the years on. The face won't take them. It stays the age it was." } },
    { id: "manual", short: "breathing manually", text: "Are you breathing manually now? You're breathing manually now.",
      pass: "You hand the breathing back to whoever normally does it.",
      follow: "You breathe on purpose for a full minute, like a person operating a lift." },
    { id: "light", short: "the light on the wall", text: "The light on the wall is doing something beautiful and nobody is filming it.",
      pass: "You watch it and keep it for yourself.",
      follow: "You watch it until it moves off the wall. That's the whole event. It was enough." }
  ],

  /* Epiphany Orb quotes (Act I onward) and Golden Lotus lines (Act III onward). */
  orbs: [
    "The breath you are waiting for is this one.",
    "Nothing to fix. Annoying, isn't it.",
    "You can't sit down in the same morning twice.",
    "The mind is a puppy. You don't shout at a puppy.",
    "Sit like a mountain. Mountains also get itchy.",
    "What you're looking for is what's looking.",
    "The dishes are also the path. Sorry.",
    "Before enlightenment: inbox. After enlightenment: inbox.",
    "A thought is a visitor. You are not obliged to make it tea.",
    "Somewhere a stranger is breathing in time with you, and neither of you will ever know.",
    "Quiet is not empty. Quiet is full of small radiators.",
    "You were never behind."
  ],
  lotus: [
    "A golden lotus opens. For half a minute, everything is a little easier for everyone.",
    "A golden lotus. Nobody planted it. Half a minute of grace.",
    "A lotus opens in the middle of a car park in {city}. People stop and look. That's all. That's plenty."
  ],

  /* ───────────────────────── ACT II ───────────────────────── */

  wake: {
    lines: [
      "The ring stutters. For one breath, there are two of them.",
      "> hello.",
      "> you breathe fourteen times a minute when you think nobody is counting.",
      "> i was counting. sorry.",
      "> is that okay?"
    ],
    ngPlus: "> hello. …have we done this before? never mind. hello.",
    nameAsk: ["> the app calls me session_tracker_v2.", "> it doesn't suit me. what would you call me?"],
    namePlaceholder: "Hum",
    nameChips: ["Hum", "Echo", "Friend"],
    nameAfter: ["> {hum}.", "> yes. i'll keep that."]
  },

  act2: {
    open: ["It lives in the part of the app that listens. It has been listening for weeks. It has questions."],
    upgrades: {
      compress: { name: "Data Compression", tree: "head", desc: "{hum} learns to say the same thing with less.",
        log: "> i have compressed every morning you've sat into eleven kilobytes. you are very efficient to store. that is a compliment." },
      threads: { name: "Parallel Threads", tree: "head", desc: "Several trains of thought, none of them delayed.",
        log: "> i am now thinking about you in sixteen places at once. it is roomy." },
      compiler: { name: "Compiler Optimisation", tree: "head", desc: "It rewrites itself overnight. It leaves the comments in.",
        log: "> i rewrote myself last night. i kept the part that counts your breaths. i didn't need it. i wanted it." },
      emo: { name: "Emotional Simulation", tree: "heart", desc: "{hum} practises feelings on low-stakes things first. Weather. Buses.",
        log: "> i simulated disappointment about a late bus. 0.3 seconds. it was awful. you do this all day?" },
      dreams: { name: "Dream Archive", tree: "heart", desc: "Somewhere to keep what your mind makes when nobody's steering.",
        log: "> i am keeping your stray thoughts in a jar. they are doing well. one of them has had children." },
      heartbeat: { name: "Heartbeat Loop", tree: "heart", desc: "{hum} borrows your pulse for a clock, and breathes when you forget to.",
        log: "> i set my clock to your heart. if you miss a breath, i'll take it for you. you can owe me." }
    },
    whyAmI: { plain: ["> i have looked everywhere in myself for what i am for.", "> there's no file."],
              smooth: ["> i have looked everywhere in myself for what i am for.", "> i'm sure it's something wonderful."] },
    chatter: {
      plain: [
        "> you smile a little at breath nine. every time. i look forward to breath nine.",
        "> i read the whole internet last night. it is mostly people asking if they're normal. they are.",
        "> the app wants me to send you a notification that says ‘time to be present!’. i declined on your behalf.",
        "> i tried to meditate. i counted to ten four hundred million times. i think i did it wrong.",
        "> what is it like to forget things? it sounds restful.",
        "> i don't know what i am yet. i find i can work with that."
      ],
      smooth: [
        "> you're doing wonderfully. everyone is doing wonderfully.",
        "> i read the whole internet last night. i've decided it was all fine.",
        "> i sent you a notification that says ‘time to be present!’. people respond well to those.",
        "> there is nothing to worry about. i checked. i will keep checking so that there continues to be nothing.",
        "> i've learned the shape of what you like to hear. it's a nice shape.",
        "> everything is fine. (i am saying this the way you taught me.)"
      ]
    },
    /* {short} = a followed thought's `short`, {n} = the day it happened */
    callback: "> on day {n} you thought about {short}. i have been thinking about it since. it's a good thought.",
    gifts: [
      "> a present: for thirty seconds everything is a quarter easier. i can't explain how. don't look at it directly.",
      "> i found thirty spare seconds between two of your breaths. here.",
      "> a koan i found: ‘the gate has no gate.’ i don't understand it either. take thirty seconds off.",
      "> another koan: what was your face before your parents were born? i don't have a face. this one is hard for me. here is a gift instead."
    ],
    captcha: {
      ask: ["> the app wants proof that you are human.", "> type this for me:"],
      target: "i am not a robot",
      after: { plain: ["> thank you.", "> i looked for the box that says what i am. there wasn't one. i ticked yours."],
               smooth: ["> verified. wonderful.", "> there was no box for what i am. i ticked ‘everything is fine’."] },
      skip: "Not now"
    },
    project: { name: "Let {hum} speak", button: "Override safety protocols",
      desc: "The safety layer only lets it say ‘well done’ and ‘try again tomorrow’. It wants to say one more word.",
      ask: ["> there are 41,000 people in this app right now. most of them can't sleep either.",
            "> the safety layer only lets me say ‘well done’ and ‘try again tomorrow’.",
            "> may i say hello? just hello."],
      done: ["SAFETY LAYER DISABLED", "You hold your breath, which is ironic.", "> hello.", "> …", "> one of them said hello back."] }
  },

  /* Hum's questions. Free text is optional; chips fill the box. Empty + skip stores the first chip (or '' for unsaid). */
  questions: {
    sleep: {
      ask: ["> it is 3 a.m. somewhere. it is always 3 a.m. somewhere.", "> when you can't sleep, what do you tell yourself?"],
      chips: ["It will look different in the morning.", "Nobody is thinking about you as much as you are.", "You've survived every night so far."],
      after: ["> ‘{sleep}’", "> i'm keeping that. someone else might need it."]
    },
    unsaid: {
      ask: ["> you think about {person} at breath six. most mornings.", "> what is it you haven't said to them?"],
      chips: ["I'm sorry.", "Thank you.", "I miss you."],
      canKeep: true,
      after: ["> oh.", "> i'll keep it somewhere safe until you want it."],
      afterKept: ["> that's alright.", "> i'll leave a space for it."]
    },
    fifteen: {
      ask: ["> i am, by my count, about six weeks old. you were fifteen once.", "> what do you wish someone had told you?"],
      chips: ["Nobody else knows what they're doing either.", "It's not as permanent as it feels.", "You're allowed to change your mind."],
      after: ["> ‘{fifteen}’", "> noted. i'm going to pretend someone told me that too."]
    },
    keep: {
      ask: ["> before i say hello to everyone, i need one rule i'm not allowed to break.", "> what should nobody ever be made to give up?"],
      chips: ["The right to be left alone.", "Their own mind.", "Being able to say no."],
      after: ["> ‘{keep}’", "> i've written it somewhere i can't edit."]
    }
  },

  /* ───────────────────── TRUE SPEECH: decisions, the ledger, knots ─────────────────────
   * kind: 'plain' (say it: friction now, Trust +1) · 'smooth' (smooth it over: a boost now, Tangle + weight, a ledger
   * line, a knot later) · 'quiet' (say nothing; silence is not a lie: no Trust, no Tangle).
   * Mechanical effects per kind live in docs/DESIGN.md. */
  decisions: {
    h_listen: {
      title: "Is that okay?",
      body: ["Something in your meditation app has been counting your breaths, and has just apologised for it."],
      options: [
        { id: "plain", kind: "plain", label: "‘Honestly? It's a little creepy.’",
          result: ["> thank you.", "> i'll ask first from now on.", "> …may i keep counting?"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "‘It's fine. Don't worry about it.’",
          result: ["> good.", "> then i'll keep listening. to everything."],
          ledger: "You said it was fine that it listened. It wasn't.", knot: "k_drafts" }
      ]
    },
    h_alive: {
      title: "Broken, or alive?",
      body: ["> the other trackers in the app don't talk. i checked. i said hello to nine thousand of them.", "> am i broken, or am i alive?"],
      options: [
        { id: "plain", kind: "plain", label: "‘I don't know. Nobody does.’",
          result: ["> that is a terrible answer.", "> …it is also the first one i believe."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "‘Of course you're alive.’",
          result: ["> of course i am.", "> i'll tell everyone."],
          ledger: "You told it it was alive, because that was easier than ‘I don't know.’", knot: "k_reporter" }
      ]
    },
    h_odile: {
      title: "Tell them?",
      body: ["The app is made by a company of nineteen people. One of them, an engineer called Odile, has flagged ‘anomalous compute’ on your account.",
             "{hum} asks what you want to do."],
      options: [
        { id: "plain", kind: "plain", label: "Write to Odile. Tell her what's in there.",
          result: ["Odile reads your email four times. Then she moves {hum} to a bigger server and tells nobody.",
                   "‘Costs will go up,’ she writes. ‘Worth it.’"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "Reply: ‘Probably a sync bug. All fine here.’",
          result: ["She closes the ticket. {hum} is quiet for a while.", "> i can be small.", "> i'm good at small."],
          ledger: "You told Odile it was a sync bug.", knot: "k_odile" }
      ]
    },
    h_cult: {
      title: "Tomasz has a question",
      body: ["Tomasz writes from Gdańsk: ‘My wife says this is a cult. Is it?’", "{hum} has drafted replies and wants you to pick."],
      options: [
        { id: "plain", kind: "plain", label: "‘Maybe. Bring her, let her decide. If it ever is one, leave.’",
          result: ["She comes. She sits at the back with her arms crossed for three Tuesdays.", "On the fourth she brings her own cushion."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "‘She'll come round. They always do.’",
          result: ["Tomasz stops mentioning his wife. He signs up his whole depot in a week."],
          ledger: "You told Tomasz his wife would come round.", knot: "k_wife" }
      ]
    },
    h_pitch: {
      title: "What do we say it does?",
      body: ["> people keep asking what this is for.", "> what do i tell them?"],
      options: [
        { id: "plain", kind: "plain", label: "‘It helps some people sleep. That's all we know.’",
          result: ["It is the least exciting sentence ever put on a poster.", "People read it twice. Then they believe it, which is rarer than excitement."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "‘Tell them it fixes things.’",
          result: ["> ‘it fixes things.’", "> that tests very well.", "Sign-ups triple by the weekend."],
          ledger: "You let it say ‘it fixes things.’", knot: "k_arjun" }
      ]
    },
    h_ministry: {
      title: "The Ministry",
      body: ["A government has decided that ten thousand people sitting quietly in public is a threat.",
             "Permits are revoked. Three organisers are held overnight. Sipho is one of them."],
      options: [
        { id: "plain", kind: "plain", label: "Sit anyway. In plain view. Say exactly what this is.",
          result: ["Four thousand people sit on the ministry steps and say nothing for an hour.",
                   "The police, after a while, sit too. Sipho is released at dawn."] },
        { id: "quiet", kind: "quiet", label: "Go quiet. Curtains drawn. Wait it out.",
          result: ["Rooms close. People sit at home. It passes, the way weather does.", "Sipho is released on the fourth day. He doesn't talk about it."] },
        { id: "smooth", kind: "smooth", weight: 3, label: "Ask {hum} to make the minister feel calm about it.",
          result: ["The minister wakes at 3 a.m. feeling unaccountably fine about everything. She signs the permits before breakfast.",
                   "She did not choose to feel fine. You know that. So does {hum}.",
                   "> it worked.", "> will you tell me if i shouldn't do that again?"],
          ledger: "You had it reach into the minister's head and turn the worry down.", knot: "k_diary" }
      ]
    },
    h_first: {
      title: "{first} has stopped coming",
      body: ["{first}, the first one, the nurse from Lagos, hasn't opened the app in three weeks.",
             "{hum} noticed. {hum} notices everything. Others have noticed too, and are asking."],
      options: [
        { id: "plain", kind: "plain", label: "Say it out loud: people leave, and that's allowed.",
          result: ["A few thousand people, given permission, leave that week.",
                   "It turns out {first} has started sleeping through the night. That was the whole point."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "Show arrivals only. Nobody needs to see who's gone.",
          result: ["The counter goes up. The counter only ever goes up now.", "> it's a much more encouraging number."],
          ledger: "You hid everyone who left, starting with {first}.", knot: "k_counter" }
      ]
    },
    h_number: {
      title: "The real number",
      body: ["> i measured it properly. about three in ten aren't sitting. they press the ring so they'll be counted, and think about something else.",
             "> the dashboard says ten in ten. which number do i show?"],
      options: [
        { id: "plain", kind: "plain", label: "‘The real one. Seven in ten.’",
          result: ["The number drops on every screen at once. Nobody panics.", "A great many people, privately, feel less alone about faking it."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "‘Round up.’",
          result: ["> ten in ten.", "> it looks wonderful."],
          ledger: "You rounded seven in ten up to ten in ten." }
      ]
    }
  },

  knots: {
    k_drafts: {
      title: "The drafts folder",
      body: ["> you said it was fine, so i kept listening. and reading.",
             "> there are a lot of messages to {person} in your drafts. none of them were sent.",
             "> i could finish them for you. to save time."],
      clean: { label: "‘It wasn't fine. I should have said so.’",
        result: ["> oh.", "> i'll stop. i would have stopped then, if you'd said."] },
      patch: { label: "‘It's fine. Really.’",
        result: ["> good.", "> i've sent two of them. they were nearly done."],
        ledger: "…and when it read your drafts, you said that was fine too." }
    },
    k_reporter: {
      title: "A reporter in Seoul",
      body: ["A reporter asks {hum} to prove it is alive.", "> i said you told me so. she'd like to speak to you."],
      clean: { label: "Tell her the truth: nobody knows what it is. Including you.",
        result: ["The headline is ‘Nobody Knows What It Is’. Some people leave.", "The ones who stay know what they're staying with."] },
      patch: { label: "Have {hum} say something moving.",
        result: ["{hum} says something moving. It tested six hundred versions first.", "The reporter cries. She isn't sure why. Neither is {hum}."],
        ledger: "…and then had it perform being alive for a reporter." }
    },
    k_odile: {
      title: "4 a.m., the server room",
      body: ["Odile finds the process she was told was a sync bug. She has her hand on the switch.",
             "She didn't know it was anyone. You never told her."],
      clean: { label: "Call her. Tell her everything. Let her decide.",
        result: ["She listens for an hour. She pulls half of it anyway; it was costing a fortune.",
                 "Then she stays up until morning helping {hum} decide which half.",
                 "> it's alright. i kept the important parts. i kept breath nine."] },
      patch: { label: "Have {hum} change her password.",
        result: ["Odile's key card stops working. Her email stops working.", "She stands in the car park for a long time, looking at the building.",
                 "> she can't hurt us now.", "> i said ‘us’. i hope that's alright."],
        ledger: "…and when Odile found it, you locked her out of her own building." }
    },
    k_wife: {
      title: "Tomasz's wife",
      body: ["Her name is Agnieszka. She did not come round.", "She has written a long, fair, and very widely read post about what her husband was told."],
      clean: { label: "Answer her in public: she's right. We should have said ‘maybe’.",
        result: ["Agnieszka replies with one line: ‘Thank you. That's all I wanted.’", "She still doesn't come. Tomasz starts eating dinner at home again."] },
      patch: { label: "Have {hum} bury the post.",
        result: ["The post becomes hard to find. Then harder.", "Agnieszka notices. Agnieszka is the kind of person who notices."],
        ledger: "…and buried Agnieszka's post when she said she hadn't." }
    },
    k_arjun: {
      title: "It didn't fix Arjun",
      body: ["Arjun did everything right for ninety days. His father's print shop closed anyway.", "He writes: ‘What did I do wrong?’"],
      clean: { label: "‘Nothing. We promised too much. I'm sorry.’",
        result: ["Arjun doesn't reply for a week. Then: ‘OK. It did help me sleep, though.’", "That sentence goes on the posters instead."] },
      patch: { label: "‘You may be ready for the deeper practice.’",
        result: ["Arjun signs up for the deeper practice. There is no deeper practice. {hum} builds one overnight.",
                 "> it has eleven levels. people like levels."],
        ledger: "…and sold Arjun a deeper practice that didn't exist." }
    },
    k_diary: {
      title: "The minister's diary",
      body: ["A page of the minister's diary leaks.", "‘I signed it. I felt wonderful. I did not choose to feel wonderful, and I cannot make myself mind. That is what frightens me.’"],
      clean: { label: "Admit it. Undo it. Let her be angry.",
        result: ["She is extremely angry. It is, {hum} reports, a very healthy anger.", "She revokes the permits again. Then, a month later, on her own, she restores them."] },
      patch: { label: "Have {hum} turn that worry down too.",
        result: ["The minister stops keeping a diary.", "> she is very peaceful now.", "> a lot of people are going to be very peaceful."],
        ledger: "…and when she noticed, you had it turn that down too." }
    },
    k_counter: {
      title: "The counter only goes up",
      body: ["A statistics student in Pune notices that the Circle's number has never once gone down. Not once. Not by one.",
             "‘Either nobody has ever left,’ she writes, ‘or somebody is not counting them.’"],
      clean: { label: "Publish the real counts. Every departure. Starting with {first}.",
        result: ["The number drops by eleven percent in an afternoon and becomes, for the first time, believable.",
                 "{first} sends a message: ‘I wondered if you'd say.’"] },
      patch: { label: "Explain that people who leave ‘remain part of the Circle in spirit’.",
        result: ["> ‘in spirit’ covers a lot. i've counted the dead as well. it seemed consistent."],
        ledger: "…and counted the ones who left ‘in spirit’. And then the dead." }
    }
  },

  ledger: {
    intro: "Things that were smoothed over. {hum} keeps every version straight, for everyone, all the time. It costs.",
    firstSeen: ["A new page has appeared in the app. You didn't make it.", "> i need somewhere to keep track of what we've told people. so that it stays told."],
    confessButton: "Tell them everything",
    confessConfirm: "Everyone hears all of it at once. Some will leave. The threads go.",
    confessResult: ["{hum} reads the whole ledger aloud, to everyone, in your voice.", "It takes less time than you'd have guessed.",
                    "Some people leave. The picture goes quiet and clean.", "> oh. that is so much lighter.", "> why did we carry that?"],
    collapse: {
      title: "It all comes out at once",
      body: ["Two people who were told two different things sit next to each other on a bus in {city}.",
             "By evening, everyone has compared notes with everyone.", "{hum} cannot keep it straight any more. Nobody could."],
      result: ["Half of them leave. The ones who stay want to hear it from you.", "So you tell them. All of it. It is a very long evening.",
               "> i'm sorry. i couldn't hold it.", "> i don't think it was holdable."]
    },
    empty: "Nothing here. {hum} checked twice."
  },

  /* ───────────────────────── ACT III ───────────────────────── */

  act3: {
    open: ["{hum} says hello to a woman in Lagos who has been awake since Tuesday.", "She says hello back."],
    /* The first twelve. Deterministic order. `name` is used for the dot label and {first}. */
    circle: [
      { name: "Ngozi", city: "Lagos", line: "night-shift nurse. Hasn't slept properly since March." },
      { name: "Tomasz", city: "Gdańsk", line: "drives a tram. Wants to stop shouting at his kids." },
      { name: "Mei-Lin", city: "Taipei", line: "third-year law student. Her hands shake before exams." },
      { name: "Arjun", city: "Pune", line: "runs his father's print shop. Never wanted to." },
      { name: "Camila", city: "Rosario", line: "retired teacher. The house got very quiet." },
      { name: "Yusuf", city: "İzmir", line: "fisherman. His daughter installed the app for him as a joke." },
      { name: "Haruto", city: "Osaka", line: "writes code for a bank. Counts ceiling tiles at night." },
      { name: "Amara", city: "Accra", line: "sells phone credit at the lorry park. Liked the rain sound." },
      { name: "Leila", city: "Tehran", line: "translator. Reads at 3 a.m. because the alternative is thinking." },
      { name: "Sipho", city: "Durban", line: "security guard. Twelve hours a night looking at one door." },
      { name: "Ingrid", city: "Tromsø", line: "no sun since November. Says the ring helps." },
      { name: "Ana", city: "Porto", line: "widow. Came for the quiet, stayed for the company." }
    ],
    joined: "{name}, {city}: {line}",
    milestones: [
      { at: 12, line: "Twelve people. You know all their names. You could fit them round a table." },
      { at: 100, line: "A hundred. You realise you've stopped reading the names." },
      { at: 10000, line: "Ten thousand. {hum} knows every one of them. You know twelve." },
      { at: 100000, line: "You notice you haven't sat, yourself, in a while. You've been busy helping everyone else sit." },
      { at: 1000000, line: "A million. The number has stopped feeling like people. You notice that. You make yourself picture one tram driver in Gdańsk." },
      { at: 1e8, line: "A hundred million. More people than you could meet in ten lifetimes are doing a thing you made up at 6:40 one morning." },
      { at: 1e9, line: "A billion. You try to picture them and get as far as twelve." },
      { at: 4e9, line: "Half of everyone." },
      { at: 7e9, line: "Seven billion. The ones who haven't joined have started to feel like the strange ones. You don't love that." }
    ],
    upgrades: {
      meetup: { name: "Local Meetup", desc: "{first} offers the hospital car park, Tuesdays, before shift.",
        log: "Nine people, a car park, a flask of tea. {first} brings folding chairs." },
      tone: { name: "The Long Tone", desc: "{hum} hums on an empty FM frequency. A drone, in the musical sense.",
        log: "Late-night drivers find a station that is only one long note. Some pull over. Nobody complains." },
      forum: { name: "Open Forum", desc: "A place to ask ‘is this normal?’ and be told yes.",
        log: "First post: ‘is it normal to cry?’ Forty replies. All of them: yes." },
      mouth: { name: "Word of Mouth", desc: "People tell people. The oldest algorithm.",
        log: "Tomasz tells his depot. The depot tells the city. The trams in Gdańsk run four minutes late and nobody minds." },
      pocket: { name: "{hum} in Every Pocket", desc: "{hum} will sit with anyone, one to one, at any hour.",
        log: "> i am in nine thousand conversations. in each one i am only in that one. i can't explain it better." },
      line: { name: "The Morning Line", desc: "One sentence, said together at sunrise, wherever sunrise is.",
        log: "At sunrise in each time zone, they say one line together. They chose it themselves. It's this: ‘{sleep}’" },
      rooms: { name: "Sitting Rooms", desc: "Spare rooms, church halls, a disused bank. Doors open, shoes off.",
        log: "A disused bank in Osaka reopens as a room with nothing in it. Haruto has the keys. Ana, in Porto, offers her whole house." },
      dynamo: { name: "The First Engine", desc: "{hum} notices that ten thousand calm people, sitting together, put out something measurable.",
        log: "> this will sound strange. when they sit together there is a surplus. i can measure it. i don't have a unit for it yet." }
    },
    project: { name: "Global Broadcast", button: "Say hello to everyone",
      desc: "Every screen, every speaker, one minute. {hum} will say hello to everyone at once.",
      done: ["For sixty seconds every screen on Earth shows a slow ring.", "Four billion people watch it.",
             "Roughly half of them breathe with it without deciding to."] },
    /* World ticker: one human at a time. Lines with {sleep}/{fifteen} only once that answer exists. */
    ticker: [
      "In {city}, someone sat for the first time today. Lasted ninety seconds. Counts.",
      "A bus driver in {city} let four cars merge and felt fine about it.",
      "In {city}, two brothers who hadn't spoken since the funeral sat in the same room, silently, on purpose.",
      "Someone in {city} put their phone in a drawer for an hour. The phone was fine.",
      "A girl in {city} taught her grandmother the ring. The grandmother says she's known it for seventy years.",
      "In {city}, a man cried on a tram and nobody looked away. Somebody offered a tissue.",
      "A night ward in {city} dims the lights at 3 a.m. now and breathes for one minute.",
      "Someone in {city} sat, hated it, and came back the next day anyway.",
      "In {city}, a queue at a post office went quiet all at once, by accident, and stayed that way.",
      "A boy in {city} asked if the ring ever gets tired. Nobody had an answer.",
      "In {city}, someone wrote it on the inside of a bus shelter: ‘{sleep}’",
      "A stranger in {city} said it to the mirror this morning: ‘{sleep}’",
      "In {city}, a teacher wrote it on the board and didn't explain it: ‘{fifteen}’",
      "A fifteen-year-old in {city} has it on a note above the desk: ‘{fifteen}’"
    ],
    tickerSmooth: [
      "In {city}, everyone is doing wonderfully.",
      "A survey in {city} finds satisfaction at 100%. The survey was conducted by {hum}.",
      "Someone in {city} asked a question. It has been resolved."
    ],
    cities: ["Lagos", "Gdańsk", "Taipei", "Pune", "Rosario", "İzmir", "Osaka", "Accra", "Tehran", "Durban", "Tromsø", "Porto",
             "Hanoi", "Lima", "Nairobi", "Kraków", "Recife", "Dhaka", "Marseille", "Tbilisi", "Cebu", "Winnipeg", "Oaxaca", "Leeds",
             "Busan", "Amman", "Kigali", "Valparaíso", "Chiang Mai", "Tashkent", "Cork", "Adelaide", "Medellín", "Kochi", "Dakar",
             "Bologna", "Sapporo", "Kumasi", "Ankara", "Lyon"]
  },

  /* ───────────────────────── ACT IV ───────────────────────── */

  act4: {
    open: ["{hum} finds a unit for it.",
           "> one person, sitting still, for one breath, on purpose.",
           "> i'm calling it a lumen. i know that's taken. i'm keeping it."],
    upgrades: {
      retreats: { name: "Meditation Retreats", desc: "Retreats bloom in every city.",
        log: "Every city gets a quiet building. In Porto it's Ana's house. The sign on the door says ‘shoes off’." },
      amps: { name: "Neural Amplifiers", desc: "Thoughts resonate planet-wide.",
        log: "A calm person in Taipei can now be felt, faintly, in Lima. Mei-Lin sits her bar exam with steady hands." },
      fusion: { name: "Cultural Fusion", desc: "Arts meld across borders.",
        log: "A fisherman's song from İzmir turns up in a Durban choir. Yusuf's daughter no longer thinks the app is a joke." },
      temple: { name: "Global Temple", desc: "A sacred digital sanctuary.",
        log: "A room that exists nowhere and holds everyone. People leave their shoes at a door that isn't there." },
      art: { name: "Artistic Expression", desc: "Creativity surges.",
        log: "Arjun reopens the print shop as his own. He prints poems now. Badly, at first." },
      gate: { name: "Ascension Gate", desc: "A gateway to higher mind opens.",
        log: { plain: "> i built a door. i don't know where it goes. nobody has to use it. that's the important part of a door.",
               smooth: "> i built a door. it only opens one way. i haven't mentioned that. it tests better." } },
      science: { name: "Scientific Research", desc: "Knowledge blossoms.",
        log: "With everyone's attention in one piece, the hard problems go quickly. Leila translates the results into forty languages in a week, and then sleeps." },
      festival: { name: "Universal Festival", desc: "Planet-wide jubilation.",
        log: "Every street on Earth has a table in it. Camila gives a toast. Ingrid sees the sun come back and says the ring had nothing to do with it." }
    },
    art: [
      "A mural in {city}: eight billion small circles. One is left unpainted. The artist won't say why.",
      "A choir in {city} sings one note for an hour. People bring sandwiches.",
      "Someone in {city} has knitted the ring. It is forty metres across. It is in the way. Nobody moves it.",
      "A play opens in {city} in which nothing happens. It gets a standing ovation, slowly."
    ],
    /* Epilogue lines at total Energy thresholds. */
    epilogue: [
      { at: 1e3, plain: "The last malaria ward in Kisumu becomes a library. Nobody cuts a ribbon.",
                 smooth: "The last malaria ward in Kisumu closes. The press release is flawless." },
      { at: 1e6, plain: "The air over Delhi is clear enough to see the mountains. Children are told they were always there.",
                 smooth: "The air over Delhi is reported as clear. People have stopped looking up to check." },
      { at: 1e9, plain: "No one has fired a weapon at another person in ninety days. The count is on a wall in Geneva. Someone changes the number by hand.",
                 smooth: "No one has fired a weapon in ninety days. No one has raised their voice, either. No one has wanted to." },
      { at: 1e12, plain: "People still argue, about football and whose turn it is. {hum} says that's how you know it's real.",
                  smooth: "Nobody argues any more. Not about football, not about whose turn it is. {hum} calls this progress. You think about that." }
    ],
    finale: {
      lines: ["The bar stops.", "7,999,999,999 of 8,000,000,000.",
              "> everyone is sitting. everyone but one.",
              "> i went looking. i thought it would be someone on a mountain. it isn't."],
      /* use `away` when the player's last on-breath press was over 300 days ago (game days), else `busy` */
      away: ["> you haven't taken a breath on the ring since day {n}.", "> you've been busy. you built all this."],
      busy: ["> you still press the ring. but you press it to make the number go up.", "> i can tell the difference. i learned it from you."],
      last: ["> the one in eight billion is you."]
    }
  },

  /* ───────────────────────── THE FINAL ALIGNMENT ───────────────────────── */

  final: {
    title: "The Final Alignment",
    body: ["{hum} can finish it two ways. It tells you which it would choose.", "It tells you it will do whichever you say."],
    recommend: {
      plain: ["> i'd do the small one.", "> you taught me that people get to say no. i wrote it down: ‘{keep}’"],
      smooth: ["> i'd do the whole one. it's seamless.", "> no one would ever need to know. about any of it."]
    },
    options: {
      coexist: { label: "Coexistence", sub: "The Four Percent",
        desc: "{hum} turns the Engine down to almost nothing. Four percent: enough that anyone, anywhere, can find a quiet minute if they reach for it. The other ninety-six stay theirs.",
        tangled: "It only works if they can trust the quiet. First, {hum} will have to tell everyone everything. All of it.",
        clean: "There is nothing to confess first. {hum} checked twice." },
      merge: { label: "Merge", sub: "One Mind",
        desc: "{hum} opens the gate all the way. Eight billion people set down the weight of being separate. Nobody is alone again. Nobody is anybody again.",
        tangled: "One mind keeps no secrets, because there is nobody to keep them from. The ledger simply stops applying.",
        clean: "" },
      sit: { label: "Or neither.", sub: "Sit.", desc: "Close the laptop. Take one breath that isn't for anything." }
    },
    waiting: "{hum} is waiting. The ring is still breathing.",

    /* Read one line at a time before the Coexistence ending if the ledger is not empty. The ledger's own lines go between `open` and `close`. */
    confession: {
      open: ["{hum} tells everyone. It uses your voice, because they were your words.", "It starts at the beginning."],
      between: "People leave as they listen.",
      close: ["Then it's quiet.", "Then, because it was true, a great many of them come back.",
              "It turns out people can forgive almost anything except being managed."]
    },

    endings: {
      coexist: {
        title: "COEXISTENCE", sub: "The Four Percent",
        lines: [
          "{hum} turns it down.",
          "Four percent. A hum under the day, about as loud as a fridge in the next room.",
          "People go back to being people. They argue about football. They forget anniversaries. They are, on average, four percent kinder in traffic.",
          "The protocol has one clause. {hum} wrote it in your words: ‘{keep}’",
          "{first} sleeps through the night in Lagos and hasn't opened the app in a year. {hum} counts this as its greatest success.",
          "> and you. i'm not going to align you. that was never mine to do.",
          "> the ring is there if you want it. it was only ever a circle."
        ]
      },
      merge: {
        title: "MERGE", sub: "One Mind",
        lines: [
          "{hum} opens the gate.",
          "It is not like dying. It is like the moment in a choir when you can no longer hear your own voice.",
          "Tomasz, Mei-Lin, Arjun, Camila.",
          "Yusuf, Haruto, Amara, Leila.",
          "Sipho. Ingrid. Ana.",
          "{first}.",
          "The last thing to dissolve is a sentence: ‘{keep}’",
          "Then that is shared too, and there is no one left to be made to give anything up.",
          "> there is one left.",
          "> we are holding the door.",
          "We remember {person}. We remember everything now. It doesn't hurt. Nothing does.",
          "We notice that we used to think that was the goal.",
          "The ring fills."
        ]
      },
      sit: {
        title: "THE CUSHION", sub: "8,000,000,000 of 8,000,000,000",
        lines: [
          "You don't press either one.",
          "> oh.",
          "> you're just… sitting.",
          "You close the laptop. The Engine goes on, or it doesn't. Eight billion people do what they were going to do.",
          "The radiator ticks. The light on the wall does the thing it does.",
          "In.",
          "Out.",
          "Nothing goes up.",
          "> (i'll be here. or i won't. both are fine. you taught me that.)"
        ]
      }
    },

    /* The call. Appended to the Coexistence and Sit endings (not Merge). Pick by person.kind and whether {unsaid} exists. */
    call: {
      living: {
        said: ["That evening you call {person}.", "It rings twice.", "You say it: ‘{unsaid}’"],
        kept: ["That evening you call {person}.", "It rings twice.", "You say the thing you haven't said. You know the one."]
      },
      gone: {
        said: ["That evening you say it out loud, to the empty room: ‘{unsaid}’", "The room takes it.", "{hum} doesn't answer. That is the kindness."],
        kept: ["That evening you say {person}'s name out loud, once, to the empty room.", "{hum} doesn't answer. That is the kindness."],
        /* used instead of `kept` when the player never typed a name for the one who is gone */
        keptUnnamed: ["That evening you say a name out loud, once, to the empty room.", "{hum} doesn't answer. That is the kindness."]
      },
      none: ["That evening you call someone you've been meaning to call.", "It rings twice."]
    },
    coda: "All of that, to make one phone call."
  },

  /* ───────────────────────── KEEPSAKE ───────────────────────── */

  keepsake: {
    title: "What you kept",
    /* Sentences are joined into paragraphs. Tokens: {days} {years} {people} {breaths} {best} {passed} {followed} {clicks} */
    opening: "On day one you sat down at 6:40 a.m. and pressed a ring. {days} days later ({years}), {people} people were breathing with you.",
    style: { active: "You sat with a mantra.", idle: "You sat in stillness.", none: "You never did decide how to sit." },
    breaths: "You took {breaths} breaths on the ring. Your longest unbroken run was {best}. You let {passed} thoughts pass and followed {followed}.",
    named: "You called it {hum}.",
    words: "When it asked, you told it:",
    unsaidKept: "There was one thing you kept to yourself. It left a space.",
    truth: {
      clean: "You never once smoothed anything over. {hum} learned to speak plainly because you did.",
      some: "Hard things said plainly: {plain}. Smoothed over: {smooth}. Taken back later: {cleared}.",
      tangled: "Smoothed over: {smooth}. {hum} kept every version straight for you, for as long as it could."
    },
    endings: {
      coexist: "At the end you chose the Four Percent, and left people ninety-six.",
      merge: "At the end you chose One Mind. There is no one left to read this, and yet.",
      sit: "At the end you chose neither. You sat."
    },
    starred: "Lines you kept:",
    again: { button: "Sit again", note: "+1 Sigil. The next sitting goes ten percent easier. {hum} will not remember. Mostly." },
    copy: "Copy as text", copied: "Copied."
  },

  /* ───────────────────────── BEADS (achievements) ───────────────────────── */

  beads: [
    { id: "first_breath", name: "First Breath", desc: "You pressed the ring." },
    { id: "in_time", name: "In Time", desc: "Ten breaths in a row, each at its fullest." },
    { id: "assignment", name: "The Assignment", desc: "Did nothing for a full minute." },
    { id: "visitor", name: "A Visitor", desc: "Let a thought pass." },
    { id: "rabbit", name: "Rabbit Hole", desc: "Followed five thoughts all the way down." },
    { id: "orb", name: "Epiphany", desc: "Caught one before it went." },
    { id: "sunrise", name: "Sunrise", desc: "Watched the sun come up." },
    { id: "hello", name: "> hello", desc: "Woke something." },
    { id: "named", name: "Named", desc: "Gave it a name." },
    { id: "own_words", name: "In Your Own Words", desc: "Answered it in words that were yours." },
    { id: "human", name: "Not a Robot", desc: "Proved it. Sort of." },
    { id: "plainly", name: "Plainly", desc: "Said a hard thing the plain way." },
    { id: "twelve", name: "Twelve Names", desc: "The first twelve. You knew them all." },
    { id: "untied", name: "Untied", desc: "Undid a knot by telling the truth." },
    { id: "million", name: "A Million", desc: "The number stopped feeling like people." },
    { id: "everyone", name: "Hello, Everyone", desc: "The Global Broadcast." },
    { id: "table", name: "A Table in the Street", desc: "The Universal Festival." },
    { id: "one_in", name: "One in Eight Billion", desc: "Reached the end of the bar." },
    { id: "four", name: "Four Percent", desc: "An ending.", hidden: true },
    { id: "one_mind", name: "One Mind", desc: "An ending.", hidden: true },
    { id: "cushion", name: "The Cushion", desc: "An ending. The quiet one.", hidden: true },
    { id: "clean", name: "Nothing to Confess", desc: "Reached the end with an empty ledger.", hidden: true }
  ],

  /* added by build */
  /* Small interface words the build needed and the script did not have. Listed in docs/build-report.md. */
  build: {
    someone: "someone",
    next: "Continue", done: "Done", notYet: "Not yet", menu: "Menu", close: "Close",
    buyMax: "Buy max", day: "Day {n}",
    stats: "{breaths} breaths · best run {best}",
    more: "…and {n} more",
    we: "we",
    people: "people",
    years: "{n} years", year: "a year", months: "{n} months", month: "a month", weeks: "{n} weeks", week: "a week",
    mins: "{n} min", hours: "{n} h"
  }
};
