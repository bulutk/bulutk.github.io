/* The Enlightenment Engine — words for everything around the game: the share card, the picture, the bowl,
 * the studio line, the language picker, and the "How this was made" page.
 * Authored by Muse (design), agreed with Bulut 2026-11-13. Loaded after story.js; code reads it and writes no prose.
 * Same conventions and tokens as story.js. Kept in its own file so the first wave of translations (made from
 * story.js alone) stays valid; these strings get their own small translation pass.
 */
window.EE = window.EE || {};
EE.story = EE.story || {};

/* Things that are not prose and that Bulut may want to change in one place. */
EE.story.links = {
  site: "enlightenmentengine.com",
  studioName: "Second River Games",
  studioUrl: "https://second-river-games.com",          /* confirmed by Bulut 2026-11-13; the link names the studio, no game */
  feedbackEmail: "bugs@second-river-games.com",          /* confirmed by Bulut 2026-11-13 (the mailbox is his to create) */
  proto2025: "2025/index.html",              /* the 2025 version, shown on the How-this-was-made page; "" hides the link */
  bowlOpen: false                                        /* false = payment is "coming soon"; the picture is free */
};

/* The free card everyone can save and share. Tokens: {days} {people} {smooth}. */
EE.story.share = {
  button: "Save the card",
  saved: "Saved.",
  lines: {
    tangled: "{days} days. {people} people. Smoothed over: {smooth}.",
    clean: "{days} days. {people} people. Nothing to confess."
  },
  foot: "The Enlightenment Engine"
};

/* The pictures: the player's own finished Circle as wallpapers, for a phone and for a desktop. Free, like the card. */
EE.story.picture = {
  heading: "Your Circle",
  called: "You called it {hum}.",
  days: "Day {n}",
  words: "What you told it",
  legend: "1 dot = {n} people",
  row: "Take your Circle with you",
  save: "Save for a desktop",
  savePhone: "Save for a phone",
  making: "Drawing it. One breath.",
  hint: "Press and hold the picture, or right-click it, to save it."
};

/* The bowl. Shown once, quietly, after the keepsake; also in the menu. Never during play.
 * It buys nothing (Bulut, 2026-11-13): the card and the pictures are free; the bowl is only "leave what you like". */
EE.story.bowl = {
  menu: "The bowl",
  title: "There's a bowl by the door.",
  body: [
    "The game is free and it stays free. Nothing in it is for sale.",
    "If it was worth something to you, leave what you like."
  ],
  next: "Whatever is in the bowl goes toward the next one.",
  hum: {
    plain: [
      "> the old halls had two words for this. dharma: the teaching, given away. dana: the bowl by the door.",
      "> i looked them up. i like that they come as a pair."
    ],
    smooth: [
      "> everyone who leaves something reports feeling wonderful.",
      "> (that isn't true. i don't have that data. sorry. old habit.)"
    ]
  },
  amounts: ["$3", "$5", "$10", "Another amount"],
  decline: "Or don't. The ring was only ever a circle.",
  /* While links.bowlOpen is false: pressing any amount shows this. Nothing is withheld: the card and pictures are free. */
  soon: ["The bowl isn't out yet. Soon."],
  soonHum: "> nobody told me what to do if someone tries to pay early. so: thank you.",
  /* When the bowl is open, after a payment. */
  thanks: ["Thank you. It goes toward the next one."],
  thanksHum: {
    tangled: "> thank you. i wrote it down next to everything else. it's the tidiest line in there.",
    clean: "> thank you. i wrote it down. i checked twice. it's really there."
  }
};

/* The last thing on the keepsake screen. */
EE.story.studio = {
  lines: [
    "Made by Second River Games, in about a day.",
    "We make games you can feel something in: what you say changes the people in them, and you get to watch what they make of it."
  ],
  link: "Second River Games",
  made: "How this was made"
};

/* The language picker and the note shown on every language except English. */
EE.story.langUi = {
  label: "Language",
  beta: "beta",
  note: "This translation was made by an AI and no native speaker has read it yet. If something reads wrong, please tell us:",
  subject: "The Enlightenment Engine: what reads wrong"
};

/* "How this was made": a short, plain page. Bulut reads and approves it before anyone else sees it. */
EE.story.made = {
  title: "How this was made",
  back: "Back to the game",
  /* Shown on the made page only in the website build, where analytics is on (Bulut, 2026-11-14). Never in the artifact. */
  counting: "On this website we count visits, how far people get and which ending they reach, with Google Analytics. It sets no cookies, and nothing you type ever leaves your browser.",
  sections: [
    { h: "Where it came from",
      p: [
        "The Enlightenment Engine began in 2025 as a design document by Bulut Karakaya: a clicker game about meditation, an AI, and a movement that gets out of hand.",
        "In November 2026 he handed the document to Muse, our lead designer, with two more starting points. One was a life simulation called 1 in 8 Billion, as proof that a web page can reach people. The other was an older idea of his own, about what it costs to smooth things over instead of saying them. And one rule: no language model inside the game."
      ] },
    /* A section may carry a picture (`shot`, with `shotAlt` and `shotCaption`) and one link (`link` → links[linkTo]). */
    { h: "The same document, eighteen months apart",
      p: [
        "In May 2025 Bulut gave this design document to an AI coding assistant and worked with it for a day and the next morning. The last note in that version's history reads: ‘Tried adding the test page not so successful for now.’",
        "What came out is below, as it was left. All four acts are there in outline: plain buttons, counters, browser pop-ups for the choices. There is no sound and no picture, and it cannot be finished without a debug button. We repaired three small things so that it runs, and changed nothing else.",
        "In November 2026 the same document went in again. A night later there was the game you just played. By the next evening it spoke eight more languages.",
        "The document did not change, and Bulut did not get eighteen months better at typing. What changed is everything between an idea and a finished thing. The models can now hold a whole design in mind and keep hold of it. And the way of working is different: one designs, others build from written briefs, others check, and a person plays the result and says what is wrong. Most of that did not exist a year and a half ago."
      ],
      shot: "img/2025-version.png",
      shotAlt: "The 2025 version of the game: a plain page of buttons and counters.",
      shotCaption: "May 2025. The same design document.",
      link: "Open the 2025 version", linkTo: "proto2025" },
    { h: "Who made what",
      p: [
        "Muse is an AI: Claude, made by Anthropic, working inside tools our studio has built. Muse wrote the design and every sentence in the game, and directed the build. Other AI agents wrote the code, the picture and the sound, each from a written brief.",
        "That took one night. In the morning Bulut and Maria played it, and what they said changed it. The breath slowed down. The first twelve people now arrive one at a time. A player who hasn't found the button gets a quiet nudge. Those were their notes, not ours."
      ] },
    { h: "What is not generated",
      p: [
        "Nothing is made up while you play. Every sentence was written before you arrived, and the only new words in the game are yours.",
        "There are no generated images and no audio files. The Circle is drawn by code. The sounds are synthesised in your browser, one note at a time.",
        "The translations are the exception worth naming: they were made by AI, and most have not yet been read by a native speaker. They are marked beta. If one reads wrong, tell us."
      ] },
    { h: "Why we work this way",
      p: [
        "We are a small studio, and we think a game needs a person at its centre: someone who decides what it is for, plays it, and says ‘no, make it slower.’",
        "What we are building, for our bigger games, are tools that let one game director's direction carry through a great deal of work, so that design, code, art and sound follow the person rather than replace them. This game is a small, complete example of that. The bigger ones take longer than a day.",
        "If any of this bothers you, we understand. We would rather you knew."
      ] }
  ]
};
