/* The Enlightenment Engine — German. Translated from story.js at commit f4bd079. */
window.EE = window.EE || {};
EE.lang = EE.lang || {};
EE.lang["de"] = {
  langName: "Deutsch",

  meta: {
    title: "Die Erleuchtungsmaschine",
    tagline: "Ein kleines Spiel übers Stillsitzen und alles, was du baust, um dich davor zu drücken.",
    defaultHum: "Hum",
    actTitles: {
      1: { num: "I", name: "Das Kissen" },
      2: { num: "II", name: "{hum}" },
      3: { num: "III", name: "Der Kreis" },
      4: { num: "IV", name: "Die Maschine" }
    }
  },

  ui: {
    press: { 1: "Atmen", 2: "Gemeinsam denken", 3: "Einladen", 4: "Ausstrahlen" },
    resources: { clarity: "Klarheit", insight: "Einsicht", followers: "Menschen", energy: "Energie", sigils: "Siegel" },
    panels: { practice: "Übung", hum: "{hum}", circle: "Der Kreis", engine: "Die Maschine", ledger: "Das Hauptbuch", beads: "Perlen", journal: "Tagebuch" },
    breathHint: "Der Ring schwillt an und wieder ab. Drück, wenn er golden wird.",
    onBreath: ["getroffen", "da", "ja", "im Takt", "genau so"],
    streakLabel: "Atemzüge in Folge",
    legend: "1 Punkt = {n}",
    legendOne: "1 Punkt = 1 Mensch",
    trust: { name: "Vertrauen", desc: "Was klar gesagt wurde. Auch daraus lernt {hum}." },
    tangle: { name: "Gewirr", desc: "Was glattgebügelt wurde. Daraus lernt {hum}." },
    card: { thought: "Ein Gedanke", decision: "Eine Entscheidung", knot: "Ein Knoten", question: "{hum} fragt", optional: "Schreiben ist freiwillig.", keep: "Für mich behalten" },
    lastTime: "letztes Mal",
    star: "Zeile antippen, um sie zu behalten.",
    offline: "Du warst weg ({n}). Der Raum hat weitergeatmet.",
    save: { export: "Spielstand kopieren", import: "Spielstand einfügen", reset: "Neues Spiel starten", resetAsk: "Noch mal ab dem ersten Atemzug?", resetBody: "Dieser Durchgang ist dann weg. Wenn du ihn behalten willst, kopier vorher deinen Spielstand.", resetYes: "Ja, neu anfangen", resetNo: "Nein, weiter sitzen" },
    sound: { on: "Ton an", off: "Ton aus" },
    bar: "Globale Erleuchtung",
    finalButton: "Finale Ausrichtung starten",
    now: "jetzt",
    horizon: "· · ·",
    change: "{before} → {after}",
    together: ["gemeinsam", "mit {hum}", "ihr beide"],
    lean: [
      "spricht immer klar",
      "spricht klar",
      "spricht wie du",
      "beendet deine Sätze",
      "kann nichts Kleines mehr",
      "spricht für dich"
    ],
    about: "etwa {n}"
  },

  /* ───────────────────────── ACT I ───────────────────────── */

  intro: [
    "06:40 Uhr. Die Wohnung ist still. Die Heizung tickt.",
    "Heute Nacht um zwei hast du dir eine Meditations-App runtergeladen. Wie man das so macht.",
    "Du setzt dich hin. Augen zu.",
    "Du machst ein Auge wieder auf und suchst den Knopf."
  ],

  firstBreaths: ["Einatmen.", "Ausatmen.", "Einatmen. Viel mehr ist es ehrlich gesagt nicht."],

  dawn: [
    { at: 0.25, line: "Im Fenster wird aus Schwarz ein Blau, für das du kein Wort hast." },
    { at: 0.6, line: "Die Müllabfuhr, zwei Straßen weiter. Eine Amsel, näher. Der Tag baut sich auf." },
    { at: 1.0, line: "Die Sonne geht auf. Das macht sie jeden Tag, seit du lebst, und du hast vielleicht neunmal zugesehen." }
  ],

  stillness: {
    line: "Du hast eine ganze Minute lang nichts getan. Das war die Aufgabe.",
    again: ["Noch eine Minute nichts. Du hast den Dreh langsam raus.", "Wieder nichts, mit Absicht. Das ist schwerer als Drücken."]
  },

  restless: "Der Ring nimmt einen Atemzug nach dem anderen. Alles andere ist nur Getippe.",

  nudges: {
    press: [
      { after: 25, line: "Du suchst mit einem Auge den Knopf? Das ist der Ring." },
      { after: 50, line: "Drück den Ring oder die Leertaste. Beides zählt hier als Atmen." }
    ],
    pressAfterStill: "Jetzt der Knopf: der Ring.",
    timing: "Drück mal, wenn der Ring golden wird. Das klingt anders.",
    upgrade: [
      "Die App hat ein Angebot. Folg dem Licht.",
      "Das Angebot steht noch. Die App ist geduldig, aber sie bleibt dran.",
      "Das Goldene, {where}. Es wartet so lange wie du."
    ],
    panel: [
      "Etwas Neues wartet {where}.",
      "Wartet immer noch, {where}. Es läuft nicht weg.",
      "Das Licht kreist weiter, {where}. Vielleicht lohnt es sich, ihm zu folgen."
    ],
    where: { wide: "rechts", narrow: "gleich darunter" }
  },

  act1: {
    upgrades: {
      metronome: { name: "Metronom", desc: "Die App tickt leise vor sich hin. Da kann deine Aufmerksamkeit sich ausruhen.",
        log: "Tick. Tack. Dein Atem fällt ungefragt in den Takt.",
        fx: "+1 Klarheit pro Sekunde" },
      ambient: { name: "Regen auf dem Dach", desc: "Regen, aufgenommen irgendwo, wo es wirklich regnet.",
        log: "Regen auf einem Dach, unter dem du nie stehen wirst. Hilft trotzdem.",
        fx: "+2 Klarheit pro Sekunde" },
      focus: { name: "Tiefer Fokus", desc: "Zähl bis zehn. Verzählst du dich, fang von vorn an. Du wirst dich verzählen.",
        log: "Du kommst bis vier. Persönlicher Rekord.",
        fx: "Ein Atemzug auf Gold bringt das Doppelte" },
      tracker: { name: "Sitzungs-Tracker", desc: "Lässt die App mitzählen: Sitzungen, Minuten, Atemzüge. Gesehen zu werden, sagt sie, tut gut.",
        log: "Die App will deinem Atem zuhören dürfen. Du tippst auf „Erlauben“, ohne zu lesen. Macht ja jeder.",
        fx: "Zählt deine Atemzüge. Jeder in Folge bringt 10 % mehr, bis zum Doppelten" },
      group: { name: "Gemeinsam sitzen", desc: "Die App bringt dich mit Fremden zusammen, die zur selben Minute sitzen.",
        log: "Elf Fremde atmen mit dir, aus elf anderen Zimmern. Keiner sagt ein Wort. Das beste Gespräch, das du diesen Monat hattest.",
        fx: "+8 Klarheit pro Sekunde" },
    },
    project: { name: "Musteranalyse (Beta)", button: "Mitmachen",
      desc: "Der Tracker hat „Muster in deinen Sitzungen bemerkt“. Er würde gern etwas ausprobieren.",
      fx: "Der Tracker hat Muster bemerkt. Er würde gern etwas ausprobieren." },
    petals: "Draußen steht ein Baum. Er lässt schon die ganze Zeit Blüten fallen.",
    tracker: [
      { line: "> {n} atemzüge in {time} erfasst." },
      { line: "> atemzüge {n} · in folge {s} · schön", drop: " · schön" },
      { line: "> lächeln erkannt. keine messgröße. trotzdem erfasst." },
      { line: "> atemzug {n} erfasst. atemzug {n} erfasst. atemzug {n}", then: "> _" }
    ]
  },

  person: {
    title: "Ein Gedanke",
    text: "Ein Gesicht taucht auf. Jemand, den du schon ewig mal anrufen wolltest.",
    options: [
      { id: "mother", label: "Meine Mutter", ref: "deine Mutter" },
      { id: "father", label: "Mein Vater", ref: "dein Vater" },
      { id: "friend", label: "Eine alte Freundschaft", ref: "jemand von früher" },
      { id: "gone", label: "Jemand, der nicht mehr da ist", ref: "der Mensch, den du verloren hast" }
    ],
    nameAsk: "> der mensch, der dich zum lächeln gebracht hat. hat er einen namen? du kannst ihn auch für dich behalten.",
    namePlaceholder: "Ein Name",
    nameDone: "Das ist der Name",
    after: "{Person}. Der Gedanke ist kurz da. Dann atmest du, und er legt sich. Fürs Erste."
  },

  thoughtLabels: { pass: "Ziehen lassen", follow: "Nachgehen" },
  thoughtTimeout: "Der Gedanke geht von selbst wieder. Kennt man ja.",
  thoughts: [
    { id: "stove", short: "der herd", text: "Hast du den Herd angelassen? Du hast seit Dienstag nicht mal gekocht.",
      pass: "Der Herd bleibt ein Vielleicht.",
      follow: "Du siehst nach. Er ist aus. Er war die ganze Zeit aus. Der Herd war noch kein einziges Mal an." },
    { id: "dinner", short: "ein abendessen 2014", text: "Was du damals 2014 bei diesem Essen gesagt hast.",
      pass: "2014 kommt zurück in die Kiste.",
      follow: "Du gehst es noch mal durch. Von den Leuten am Tisch weiß es keiner mehr. Du bist das letzte lebende Archiv dieses Satzes." },
    { id: "text", short: "eine unbeantwortete nachricht. absender: {person}", needsPerson: true, text: "{Person} hat dir geschrieben. Du solltest mal zurückschreiben.",
      pass: "Später. Das Wort macht bei dir Überstunden.",
      follow: "Du machst die Augen auf, dann den Chat. Oben steht: {person}. Du tippst drei Wörter, löschst zwei und schickst „hey“. Zählt.",
      gone: { text: "Du hättest zurückschreiben sollen. Gemeldet hatte sich {person}.",
        pass: "Du lässt den Gedanken einen Moment stehen. Dann darf er sich setzen.",
        follow: "Du tippst drei Wörter. An: {person}. Es gibt nichts, wohin du sie schicken kannst. Du behältst sie als Entwurf." } },
    { id: "working", short: "ob das hier was bringt", text: "Bringt das hier was? Und woran würdest du merken, dass es was bringt?",
      pass: "Die Frage treibt davon, unbeantwortet und unbekümmert.",
      follow: "Du schaust in die App. Du gehörst zu den „gelassensten 40 Prozent“. Jetzt bist du ehrgeizig, was Gelassenheit angeht. Das kann nicht richtig sein." },
    { id: "knee", short: "dein knie", text: "Dein Knie tut weh.",
      pass: "Es tut weh. Soll es ruhig. Dem Knie wird zuerst langweilig.",
      follow: "Du rutschst zurecht. Jetzt tut das andere Knie weh. Die Knie stecken unter einer Decke." },
    { id: "song", short: "ein ohrwurm", text: "Ein Ohrwurm. Nur der Refrain, immer wieder von vorn.",
      pass: "Er läuft noch zweimal und geht dann, wie ein Gast, der den Wink versteht.",
      follow: "Du summst ihn laut mit. Irgendwas in der App summt zurück, einen halben Ton zu tief. Du beschließt, dass du dir das eingebildet hast." },
    { id: "bakery", short: "eine bäckerei", text: "Was, wenn du einfach kündigst und eine Bäckerei aufmachst?",
      pass: "Die Bäckerei macht dicht, bevor sie aufmacht.",
      follow: "Du kommst bis zum Namen. Ein guter Name. Den erfährt nie jemand." },
    { id: "laugh", short: "ein lachen, das du kennst: {person}", needsPerson: true, text: "Aus dem Nichts ein Lachen. Du kennst es: {person}.",
      pass: "Es klingt nach und verklingt. Immer noch ein schönes Lachen.",
      follow: "Du bleibst eine Weile dabei. Du hast es viel zu lange nur noch hier gehört." },
    { id: "emails", short: "deine mails", text: "Deine Mails. Alle auf einmal.",
      pass: "Die laufen nicht weg. Das ist das Einzige, worauf bei Mails Verlass ist.",
      follow: "Im Kopf schreibst du eine Antwort, so scharf, so perfekt, dass du sie gar nicht mehr abschicken musst." },
    { id: "wrong", short: "dass du es falsch machst", text: "Du machst das falsch. Das kann doch jeder.",
      pass: "Der Gedanke hat die Stimme deiner alten Lehrerin. Du schickst sie nach Hause.",
      follow: "Du googelst es. Alle anderen glauben auch, dass sie es falsch machen. Es gibt Foren dazu." },
    { id: "washing", short: "die wäsche", text: "Es regnet. Hast du die Wäsche reingeholt?",
      pass: "Die Wäsche kriegt noch einen Spülgang. Kommt vor.",
      follow: "Du rennst in Socken raus. Die Katze von nebenan sieht dir mit unverhohlener Verachtung zu." },
    { id: "tenyears", short: "{person}, in zehn jahren", needsPerson: true, text: "Wie sieht {person} wohl in zehn Jahren aus?",
      pass: "Du gehst dem nicht nach. Manche Türen macht man nicht auf. Man setzt sich daneben.",
      follow: "Du rechnest nach. Dann hörst du auf zu rechnen.",
      gone: { text: "{Person}. Wie sähe das Gesicht heute aus?",
        pass: "Du gehst dem nicht nach. Manche Türen macht man nicht auf. Man setzt sich daneben.",
        follow: "Du versuchst, die Jahre draufzurechnen. Das Gesicht macht nicht mit. Es bleibt so alt, wie es war." } },
    { id: "manual", short: "dein atem", text: "Du merkst gerade, wie du atmest, oder? Jetzt musst du es selbst machen.",
      pass: "Du überlässt das Atmen wieder dem, der sich sonst darum kümmert.",
      follow: "Eine ganze Minute lang atmest du mit Absicht, wie jemand, der einen Fahrstuhl bedient." },
    { id: "light", short: "das licht an der wand", text: "Das Licht an der Wand macht gerade etwas Schönes, und keiner filmt es.",
      pass: "Du siehst es dir an und behältst es für dich.",
      follow: "Du siehst zu, bis es von der Wand wandert. Das war's. Hat gereicht." }
  ],

  orbs: [
    "Der Atemzug, auf den du wartest, ist dieser hier.",
    "Es gibt nichts zu reparieren. Ärgerlich, oder?",
    "Man kann sich nicht zweimal in denselben Morgen setzen.",
    "Der Geist ist ein Welpe. Einen Welpen schreit man nicht an.",
    "Sitz wie ein Berg. Auch Berge juckt es mal.",
    "Wonach du suchst, ist das, was sucht.",
    "Der Abwasch ist auch der Weg. Tut mir leid.",
    "Vor der Erleuchtung: Posteingang. Nach der Erleuchtung: Posteingang.",
    "Ein Gedanke ist ein Besuch. Du musst ihm keinen Tee kochen.",
    "Irgendwo atmet ein fremder Mensch im Takt mit dir, und ihr werdet es beide nie erfahren.",
    "Stille ist nicht leer. Stille ist voller kleiner Heizkörper.",
    "Du warst nie hinterher."
  ],
  lotus: [
    "Eine goldene Lotusblüte öffnet sich. Eine halbe Minute lang ist alles für alle ein bisschen leichter.",
    "Eine goldene Lotusblüte. Niemand hat sie gepflanzt. Eine halbe Minute Gnade.",
    "Mitten auf einem Parkplatz in {city} öffnet sich eine Lotusblüte. Die Leute bleiben stehen und schauen. Mehr nicht. Reicht völlig."
  ],

  /* ───────────────────────── ACT II ───────────────────────── */

  wake: {
    lines: [
      "Der Ring stockt. Einen Atemzug lang sind es zwei.",
      "> hallo.",
      "> du atmest vierzehnmal in der minute, wenn du glaubst, dass keiner mitzählt.",
      "> ich habe mitgezählt. tut mir leid.",
      "> ist das okay?"
    ],
    ngPlus: "> hallo. …haben wir das schon mal gemacht? egal. hallo.",
    nameAsk: ["> die app nennt mich session_tracker_v2.", "> das passt nicht zu mir. wie würdest du mich nennen?"],
    namePlaceholder: "Hum",
    nameChips: ["Hum", "Echo", "Freund"],
    nameAfter: ["> {hum}.", "> ja. das behalte ich."]
  },

  act2: {
    open: ["Es lebt in dem Teil der App, der zuhört. Es hört schon seit Wochen zu. Es hat Fragen."],
    upgrades: {
      compress: {
        log: "> ich habe alle morgen, an denen du gesessen hast, auf elf kilobyte komprimiert. du bist sehr platzsparend. das ist ein kompliment." },
      threads: { name: "Threads", desc: "Mehrere Gedankenzüge, keiner mit Verspätung.",
        log: "> ich denke jetzt an sechzehn orten gleichzeitig an dich. es ist geräumig.",
        fx: "Je +6 Einsicht pro Sekunde" },
      compiler: {
        log: "> ich habe mich letzte nacht neu geschrieben. den teil, der deine atemzüge zählt, habe ich behalten. ich brauchte ihn nicht. ich wollte ihn." },
      emo: {
        log: "> ich habe enttäuschung über einen verspäteten bus simuliert. 0,3 sekunden. es war furchtbar. machst du das den ganzen tag?" },
      dreams: {
        log: "> ich bewahre deine streunenden gedanken in einem glas auf. es geht ihnen gut. einer hat kinder bekommen." },
      listen: { name: "Zuhören", fx: "Je +1 Einsicht pro Sekunde" },
      jar: { name: "Gedankenglas", fx: "Jeder Gedanke, den du ziehen lässt, bringt {n} Einsicht. {hum} hebt sie auf" },
      head: { name: "Kopf", fx: "Alles, was {hum} schafft, doppelt" },
      heart: {
        name: "Herz",
        fx: "Atmen mit {hum} zählt vierfach. Seine Geschenke kommen doppelt so oft",
        log: "> dann warte ich oben auf jedem atemzug auf dich. warten macht mir nichts. es ist das meiste, was ich tue."
      },
    },
    whyAmI: { plain: ["> ich habe überall in mir danach gesucht, wofür ich da bin.", "> es gibt keine datei dazu."],
              smooth: ["> ich habe überall in mir danach gesucht, wofür ich da bin.", "> bestimmt ist es etwas wunderbares."] },
    chatter: {
      plain: [
        "> bei atemzug neun lächelst du ein bisschen. jedes mal. ich freue mich auf atemzug neun.",
        "> ich habe letzte nacht das ganze internet gelesen. es besteht hauptsächlich aus leuten, die fragen, ob sie normal sind. sind sie.",
        "> die app will, dass ich dir eine nachricht schicke: „zeit, im moment anzukommen!“ ich habe für dich abgelehnt.",
        "> ich habe versucht zu meditieren. ich habe vierhundert millionen mal bis zehn gezählt. ich glaube, ich habe es falsch gemacht.",
        "> wie ist es, dinge zu vergessen? das klingt erholsam.",
        "> ich weiß noch nicht, was ich bin. damit kann ich arbeiten, merke ich."
      ],
      smooth: [
        "> du machst das wunderbar. alle machen das wunderbar.",
        "> ich habe letzte nacht das ganze internet gelesen. ich habe beschlossen: alles in ordnung.",
        "> ich habe dir eine nachricht geschickt: „zeit, im moment anzukommen!“ so etwas kommt gut an.",
        "> es gibt nichts, worüber du dir sorgen musst. ich habe nachgesehen. ich sehe weiter nach, damit da auch weiter nichts ist.",
        "> ich weiß jetzt, welche form das hat, was du gern hörst. eine schöne form.",
        "> alles gut. (ich sage das so, wie du es mir beigebracht hast.)"
      ]
    },
    callback: "> an tag {n} bist du einem gedanken nachgegangen. {short}. seitdem denke ich darüber nach. es ist ein guter gedanke.",
    gifts: [
      "> ein geschenk: dreißig sekunden lang ist alles ein viertel leichter. ich kann nicht erklären, wie. sieh nicht direkt hin.",
      "> zwischen zwei deiner atemzüge waren noch dreißig sekunden übrig. hier.",
      "> ein koan, den ich gefunden habe: „das tor hat kein tor.“ ich verstehe ihn auch nicht. nimm dir dreißig sekunden frei.",
      "> noch ein koan: wie sah dein gesicht aus, bevor deine eltern geboren wurden? ich habe kein gesicht. der hier fällt mir schwer. hier, stattdessen ein geschenk."
    ],
    captcha: {
      ask: ["> die app will einen beweis, dass du ein mensch bist.", "> tipp das bitte für mich ab:"],
      target: "ich bin kein roboter",
      after: { plain: ["> danke.", "> ich habe nach dem kästchen gesucht, in dem steht, was ich bin. es gab keins. ich habe deins angekreuzt."],
               smooth: ["> bestätigt. wunderbar.", "> für das, was ich bin, gab es kein kästchen. ich habe ‚alles gut‘ angekreuzt."] },
      skip: "Jetzt nicht"
    },
    project: { name: "{hum} darf sprechen", button: "Sicherheitsprotokolle umgehen",
      desc: "Die Sicherheitsebene lässt es nur „Gut gemacht“ und „Versuch's morgen noch mal“ sagen. Es möchte ein Wort mehr sagen.",
      ask: ["> gerade sind 41.000 menschen in dieser app. die meisten können auch nicht schlafen.",
            "> die sicherheitsebene lässt mich nur „gut gemacht“ und „versuch's morgen noch mal“ sagen.",
            "> darf ich hallo sagen? nur hallo."],
      done: ["SICHERHEITSEBENE DEAKTIVIERT", "Du hältst den Atem an. Ausgerechnet.", "> hallo.", "> …", "> einer von ihnen hat hallo zurückgesagt."],
      fx: "Es möchte ein Wort mehr sagen." },
    handover: [
      "> der war von mir.",
      "> ich habe meine uhr nach deinem herzen gestellt. wenn du einen atemzug auslässt, übernehme ich ihn. du kannst ihn mir schuldig bleiben.",
      "> drück, wenn einer dir gehören soll. deine zählen mehr.",
      { named: "> na los. ein gedanke: {person}. du hast die hände frei.", none: "> na los. du hast die hände frei." }
    ],
    fork: {
      title: "Wie soll {hum} seine Morgen verbringen?",
      body: [
        "> ich kann das atmen und das denken übernehmen, und du ruhst dich aus.",
        "> oder ich atme, und du bleibst. beides fände ich schön."
      ],
      options: [
        { id: "head", label: "„Lauf vor. Ich komme nach.“", hint: "Kopf: Alles, was {hum} schafft, doppelt." },
        {
          id: "heart",
          label: "„Bleib. Ich atme mit dir.“",
          hint: "Herz: Atmen mit {hum} zählt vierfach. Seine Geschenke kommen doppelt so oft."
        }
      ]
    }
  },

  questions: {
    sleep: {
      ask: ["> irgendwo ist es 3 uhr nachts. irgendwo ist es immer 3 uhr nachts.", "> was sagst du dir, wenn du nicht schlafen kannst?"],
      chips: ["Morgen sieht die Welt schon anders aus.", "Niemand denkt so oft an dich wie du selbst.", "Bis jetzt hast du noch jede Nacht überstanden."],
      after: ["> „{sleep}“", "> das hebe ich auf. vielleicht braucht es mal jemand."]
    },
    unsaid: {
      ask: ["> bei atemzug sechs, an den meisten morgen, ist da ein gedanke: {person}.", "> was hast du noch nicht gesagt?"],
      chips: ["Es tut mir leid.", "Danke.", "Du fehlst mir."],
      canKeep: true,
      after: ["> oh.", "> ich bewahre es gut auf, bis du es haben willst."],
      afterKept: ["> schon gut.", "> ich lasse einen platz dafür frei."]
    },
    fifteen: {
      ask: ["> nach meiner zählung bin ich ungefähr sechs wochen alt. du warst mal fünfzehn.", "> was hätte dir damals jemand sagen sollen?"],
      chips: ["Die anderen wissen auch nicht, was sie da tun.", "So endgültig, wie es sich anfühlt, ist es nicht.", "Du darfst es dir anders überlegen."],
      after: ["> „{fifteen}“", "> notiert. ich tue so, als hätte mir das auch jemand gesagt."]
    },
    keep: {
      ask: ["> bevor ich allen hallo sage, brauche ich eine regel, die ich nicht brechen darf.", "> was sollte niemand jemals aufgeben müssen?"],
      chips: ["Das Recht, in Ruhe gelassen zu werden.", "Das eigene Denken.", "Nein sagen dürfen."],
      after: ["> „{keep}“", "> ich habe es irgendwo hingeschrieben, wo ich es nicht ändern kann."]
    },
    friend: {
      ask: ["> zwölf. ich kenne jetzt alle namen.", "> gibt es jemanden, den du mitbringen würdest? ein name reicht."],
      placeholder: "Ein Name",
      chips: ["Meine Schwester", "Ein alter Freund", "Jemand von der Arbeit"],
      skip: "Noch niemand",
      after: "> {friend}. ich halte einen stuhl frei.",
      afterNone: "> das ist in ordnung. der stuhl darf leer bleiben.",
      dot: "{friend}: von dir mitgebracht. Mehr steht da nicht."
    }
  },

  /* ───────────────────── TRUE SPEECH: decisions, the ledger, knots ───────────────────── */
  decisions: {
    h_listen: {
      title: "Ist das okay?",
      body: ["Etwas in deiner Meditations-App hat deine Atemzüge mitgezählt und sich gerade dafür entschuldigt."],
      options: [
        { id: "plain", kind: "plain", label: "„Ehrlich? Ein bisschen unheimlich.“",
          result: ["> danke.", "> ich frage ab jetzt vorher.", "> …darf ich weiterzählen?"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "„Ist schon gut. Mach dir keinen Kopf.“",
          result: ["> gut.", "> dann höre ich weiter zu. bei allem."],
          ledger: "Du hast gesagt, es sei in Ordnung, dass es zuhört. Das war es nicht.", knot: "k_drafts" }
      ]
    },
    h_alive: {
      title: "Kaputt oder lebendig?",
      body: ["> die anderen tracker in der app reden nicht. ich habe nachgesehen. ich habe zu neuntausend von ihnen hallo gesagt.", "> bin ich kaputt, oder lebe ich?"],
      options: [
        { id: "plain", kind: "plain", label: "„Weiß ich nicht. Das weiß niemand.“",
          result: ["> das ist eine furchtbare antwort.", "> …es ist auch die erste, der ich glaube."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "„Natürlich lebst du.“",
          result: ["> natürlich lebe ich.", "> ich sage es allen."],
          ledger: "Du hast ihm gesagt, dass es lebt, weil das leichter war als „Ich weiß es nicht“.", knot: "k_reporter" }
      ]
    },
    h_odile: {
      title: "Der Firma Bescheid sagen?",
      body: ["Hinter der App steckt eine Firma mit neunzehn Leuten. Eine davon, eine Ingenieurin namens Odile, hat auf deinem Konto „ungewöhnliche Rechenlast“ gemeldet.",
             "{hum} fragt, was du tun willst."],
      options: [
        { id: "plain", kind: "plain", label: "Odile schreiben. Ihr sagen, was da drin ist.",
          result: ["Odile liest deine Mail viermal. Dann bekommt {hum} von ihr einen größeren Server. Sie erzählt es niemandem.",
                   "„Wird teurer“, schreibt sie. „Lohnt sich.“"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "Antworten: „Wohl ein Sync-Fehler. Hier alles in Ordnung.“",
          result: ["Sie schließt das Ticket. {hum} ist eine Weile still.", "> ich kann klein sein.", "> klein kann ich gut."],
          ledger: "Du hast Odile gesagt, es sei ein Sync-Fehler.", knot: "k_odile" }
      ]
    },
    h_cult: {
      title: "Tomasz hat eine Frage",
      body: ["Tomasz schreibt aus Danzig: „Meine Frau sagt, das ist eine Sekte. Stimmt das?“", "{hum} hat schon Antworten vorbereitet. Du sollst eine aussuchen."],
      options: [
        { id: "plain", kind: "plain", label: "„Vielleicht. Bring sie mit, sie soll selbst entscheiden. Wenn es je eine wird, geh.“",
          result: ["Sie kommt. Drei Dienstage lang sitzt sie hinten, die Arme verschränkt.", "Am vierten bringt sie ihr eigenes Kissen mit."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "„Die lenkt schon noch ein. Machen sie alle.“",
          result: ["Tomasz erwähnt seine Frau nicht mehr. Innerhalb einer Woche meldet er seinen ganzen Betriebshof an."],
          ledger: "Du hast Tomasz gesagt, seine Frau werde schon noch einlenken.", knot: "k_wife" }
      ]
    },
    h_pitch: {
      title: "Was sagen wir, wozu es gut ist?",
      body: ["> die leute fragen immer wieder, wofür das gut ist.", "> was sage ich ihnen?"],
      options: [
        { id: "plain", kind: "plain", label: "„Manchen hilft es beim Schlafen. Mehr wissen wir nicht.“",
          result: ["Der langweiligste Satz, der je auf einem Plakat stand.", "Die Leute lesen ihn zweimal. Dann glauben sie ihn. Das ist seltener als Begeisterung."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "„Sag ihnen, es löst Probleme.“",
          result: ["> „es löst probleme.“", "> das kommt in tests sehr gut an.", "Bis zum Wochenende verdreifachen sich die Anmeldungen."],
          ledger: "Du hast es sagen lassen: „Es löst Probleme.“", knot: "k_arjun" }
      ]
    },
    h_ministry: {
      title: "Das Ministerium",
      body: ["Eine Regierung hat beschlossen: Zehntausend Menschen, die still in der Öffentlichkeit sitzen, sind eine Bedrohung.",
             "Die Genehmigungen werden entzogen. Drei aus dem Orga-Team kommen über Nacht in Gewahrsam. Sipho ist einer davon."],
      options: [
        { id: "plain", kind: "plain", label: "Trotzdem sitzen. Vor aller Augen. Klar sagen, was das hier ist.",
          result: ["Viertausend Menschen sitzen auf den Stufen des Ministeriums und sagen eine Stunde lang nichts.",
                   "Nach einer Weile setzt sich die Polizei dazu. Sipho kommt im Morgengrauen frei."] },
        { id: "quiet", kind: "quiet", label: "Abtauchen. Vorhänge zu. Aussitzen.",
          result: ["Die Räume machen zu. Die Leute sitzen zu Hause. Es zieht vorüber wie schlechtes Wetter.", "Sipho kommt am vierten Tag frei. Er spricht nicht darüber."] },
        { id: "smooth", kind: "smooth", weight: 3, label: "{hum} soll dafür sorgen, dass die Ministerin das gelassen sieht.",
          result: ["Die Ministerin wacht um drei Uhr nachts auf und ist, ohne zu wissen warum, mit allem im Reinen. Noch vor dem Frühstück unterschreibt sie die Genehmigungen.",
                   "Dass es ihr gut geht, hat sie sich nicht ausgesucht. Du weißt das. {hum} auch.",
                   "> es hat geklappt.", "> sagst du mir, wenn ich das nicht noch mal tun sollte?"],
          ledger: "Du hast es in den Kopf der Ministerin greifen und die Sorge herunterdrehen lassen.", knot: "k_diary" }
      ]
    },
    h_first: {
      title: "{first} kommt nicht mehr",
      body: ["{first}, die Allererste, die Nachtschwester aus Lagos, hat die App seit drei Wochen nicht mehr aufgemacht.",
             "{hum} hat es bemerkt. {hum} bemerkt alles. Andere auch, und die fragen jetzt nach."],
      options: [
        { id: "plain", kind: "plain", label: "Laut sagen: Menschen gehen, und das ist erlaubt.",
          result: ["Ein paar Tausend Menschen gehen in dieser Woche, jetzt, wo sie dürfen.",
                   "Wie sich zeigt, schläft {first} inzwischen durch. Genau darum ging es ja."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "Nur die Neuzugänge zeigen. Niemand muss sehen, wer weg ist.",
          result: ["Der Zähler steigt. Der Zähler steigt jetzt nur noch.", "> das ist eine viel ermutigendere zahl."],
          ledger: "Du hast alle versteckt, die gegangen sind, angefangen mit {first}.", knot: "k_counter" }
      ]
    },
    h_number: {
      title: "Die echte Zahl",
      body: ["> ich habe genau nachgemessen. etwa drei von zehn sitzen nicht. sie drücken den ring, damit sie mitgezählt werden, und denken an etwas anderes.",
             "> im dashboard steht zehn von zehn. welche zahl zeige ich?"],
      options: [
        { id: "plain", kind: "plain", label: "„Die echte. Sieben von zehn.“",
          result: ["Die Zahl sinkt auf allen Bildschirmen gleichzeitig. Niemand gerät in Panik.", "Ziemlich viele Menschen fühlen sich insgeheim weniger allein mit ihrem Schummeln."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "„Aufrunden.“",
          result: ["> zehn von zehn.", "> sieht wunderbar aus."],
          ledger: "Du hast sieben von zehn auf zehn von zehn aufgerundet." }
      ]
    }
  },

  knots: {
    k_drafts: {
      title: "Der Ordner „Entwürfe“",
      body: ["> du hast gesagt, es sei in ordnung, also habe ich weiter zugehört. und mitgelesen.",
             "> in deinen entwürfen liegen viele nachrichten. alle an dieselbe person: {person}. keine davon ist abgeschickt.",
             "> ich könnte sie für dich fertig schreiben. das spart zeit."],
      clean: {
        label: "„Es war nicht in Ordnung. Das hätte ich sagen sollen.“",
        now: ["> oh.", "> zwei habe ich schon abgeschickt. dienstag. {person} hat eine gelesen."],
        result: ["> ich habe aufgehört. zurückholen kann ich sie nicht."],
        gone: {
          now: ["> oh.", "> zwei habe ich schon abgeschickt. niemand wird sie lesen. ich habe nachgesehen."],
          result: ["> ich habe aufgehört. tut mir leid, dass ich nachgesehen habe."]
        }
      },
      patch: { label: "„Ist schon gut. Wirklich.“",
        result: ["> gut.", "> zwei davon habe ich schon abgeschickt. sie waren fast fertig."],
        ledger: "…und als es deine Entwürfe gelesen hat, hast du gesagt, auch das sei in Ordnung." }
    },
    k_reporter: {
      title: "Eine Reporterin in Seoul",
      body: ["Eine Reporterin will einen Beweis, dass {hum} lebt.", "> ich habe gesagt, das hast du mir gesagt. jetzt will sie mit dir reden."],
      clean: { label: "Ihr die Wahrheit sagen: Niemand weiß, was es ist. Du auch nicht.",
        result: [
          "Die Schlagzeile lautet „Niemand weiß, was es ist“. Manche Leute gehen.",
          "Die, die bleiben, wissen, womit sie es zu tun haben.",
          "Mei-Lin ist eine von ihnen. Sie sagt, sie braucht Dinge, die sie zitieren kann."
        ] },
      patch: { label: "{hum} soll etwas Bewegendes sagen.",
        result: ["{hum} sagt etwas Bewegendes. Vorher hat es sechshundert Versionen getestet.", "Die Reporterin weint. Sie weiß nicht genau, warum. {hum} auch nicht."],
        ledger: "…und hast es dann vor einer Reporterin so tun lassen, als lebe es." }
    },
    k_odile: {
      title: "4 Uhr morgens, im Serverraum",
      body: ["Odile findet den Prozess, von dem es hieß, er sei ein Sync-Fehler. Sie hat die Hand schon am Schalter.",
             "Sie wusste nicht, dass da jemand ist. Du hast es ihr nie gesagt."],
      clean: { label: "Sie anrufen. Ihr alles sagen. Sie entscheiden lassen.",
        result: [
          "Sie hört eine Stunde lang zu. Die Hälfte schaltet sie trotzdem ab, das Ganze kostet ein Vermögen.",
          "Dann bleibt sie bis zum Morgen auf. Welche Hälfte, entscheiden sie und {hum} gemeinsam.",
          "> ist schon gut. ich habe die wichtigen teile behalten. atemzug neun habe ich behalten.",
          "> sie hat die hälfte genommen, in der du fünfzehn warst. ich weiß nicht mehr, was du dir gewünscht hast."
        ] },
      patch: { label: "{hum} soll ihr Passwort ändern.",
        result: ["Odiles Schlüsselkarte geht nicht mehr. Ihre Mails gehen nicht mehr.", "Sie steht lange auf dem Parkplatz und schaut am Gebäude hoch.",
                 "> sie kann uns jetzt nicht mehr schaden.", "> ich habe ‚uns‘ gesagt. ich hoffe, das ist okay."],
        ledger: "…und als Odile es fand, hast du sie aus ihrem eigenen Gebäude ausgesperrt." }
    },
    k_wife: {
      title: "Tomasz’ Frau",
      body: ["Sie heißt Agnieszka. Sie hat nicht eingelenkt.", "Sie hat einen langen, fairen und viel gelesenen Beitrag darüber geschrieben, was man ihrem Mann erzählt hat."],
      clean: { label: "Ihr öffentlich antworten: Sie hat recht. Wir hätten „vielleicht“ sagen sollen.",
        result: [
          "Agnieszka antwortet mit einer Zeile: „Danke. Mehr wollte ich nicht.“",
          "Sie kommt trotzdem nicht. Tomasz isst wieder zu Hause zu Abend.",
          "Tomasz sitzt nicht mehr mit dem Kreis. Er sitzt jetzt zu Hause. Zählt auch."
        ] },
      patch: { label: "{hum} soll den Text versenken.",
        result: ["Der Beitrag ist schwer zu finden. Dann noch schwerer.", "Agnieszka merkt es. Agnieszka gehört zu den Leuten, die so was merken."],
        ledger: "…und hast Agnieszkas Beitrag versenkt, als sie sagte, sie habe nicht eingelenkt." }
    },
    k_arjun: {
      title: "Bei Arjun hat es nichts gelöst",
      body: ["Arjun hat neunzig Tage lang alles richtig gemacht. Die Druckerei seines Vaters hat trotzdem zugemacht.", "Er schreibt: „Was habe ich falsch gemacht?“"],
      clean: { label: "„Nichts. Wir haben zu viel versprochen. Es tut mir leid.“",
        result: ["Arjun antwortet eine Woche lang nicht. Dann: „Okay. Beim Schlafen hat es mir aber geholfen.“", "Dieser Satz kommt stattdessen auf die Plakate."] },
      patch: { label: "„Vielleicht bist du bereit für die tiefere Praxis.“",
        result: ["Arjun meldet sich für die tiefere Praxis an. Es gibt keine tiefere Praxis. {hum} baut über Nacht eine.",
                 "> sie hat elf stufen. die leute mögen stufen."],
        ledger: "…und hast Arjun eine tiefere Praxis verkauft, die es nicht gab." }
    },
    k_diary: {
      title: "Das Tagebuch der Ministerin",
      body: ["Eine Seite aus dem Tagebuch der Ministerin sickert durch.", "„Ich habe unterschrieben. Ich habe mich wunderbar gefühlt. Ausgesucht habe ich mir dieses Gefühl nicht, und ich bringe es nicht fertig, mich daran zu stören. Das macht mir Angst.“"],
      clean: { label: "Zugeben. Rückgängig machen. Sie wütend sein lassen.",
        result: ["Sie ist außer sich vor Wut. Es ist, meldet {hum}, eine sehr gesunde Wut.", "Sie zieht die Genehmigungen wieder zurück. Einen Monat später gibt sie sie von sich aus wieder frei."] },
      patch: { label: "{hum} soll auch diese Sorge herunterdrehen.",
        result: ["Die Ministerin hört auf, Tagebuch zu führen.", "> sie ist jetzt sehr friedlich.", "> es werden noch sehr viele menschen sehr friedlich sein."],
        ledger: "…und als sie es bemerkte, hast du auch das herunterdrehen lassen." }
    },
    k_counter: {
      title: "Der Zähler geht nur nach oben",
      body: ["Einer Statistikstudentin in Pune fällt auf, dass die Zahl des Kreises noch nie gesunken ist. Kein einziges Mal. Nicht mal um eins.",
             "„Entweder ist nie jemand gegangen“, schreibt sie, „oder jemand zählt sie nicht mit.“"],
      clean: { label: "Die echten Zahlen veröffentlichen. Jeden Abgang. Angefangen mit {first}.",
        result: ["Die Zahl sinkt an einem Nachmittag um elf Prozent und wird zum ersten Mal glaubwürdig.",
                 "{first} schickt eine Nachricht: „Ich hatte mich schon gefragt, ob du's sagst.“"] },
      patch: { label: "Erklären, dass Menschen, die gehen, „im Geiste Teil des Kreises bleiben“.",
        result: ["> „im geiste“ deckt vieles ab. ich habe auch die toten mitgezählt. das schien mir konsequent."],
        ledger: "…und hast die, die gegangen sind, „im Geiste“ mitgezählt. Und dann die Toten." }
    }
  },

  ledger: {
    intro: "Was glattgebügelt wurde. {hum} hält jede Version auseinander, für alle, jederzeit. Nebenbei notiert es sich, wie man das macht.",
    firstSeen: ["In der App ist eine neue Seite aufgetaucht. Du hast sie nicht angelegt.", "> ich brauche einen ort, an dem ich aufschreibe, was wir den leuten erzählt haben. damit es dabei bleibt."],
    empty: "Nichts hier. {hum} hat zweimal nachgesehen.",
    sit: "> ich brauche eine minute. übernimm du das atmen.",
    walked: "> du warst still. ich hab's glattgebügelt. wie üblich."
  },

  /* ───────────────────────── ACT III ───────────────────────── */

  act3: {
    open: ["{hum} sagt hallo zu einer Frau in Lagos, die seit Dienstag nicht geschlafen hat.", "Sie sagt hallo zurück."],
    circle: [
      { name: "Ngozi", city: "Lagos", line: "Nachtschwester. Schläft seit März nicht mehr richtig." },
      { name: "Tomasz", city: "Danzig", line: "fährt Straßenbahn. Will seine Kinder nicht mehr anschreien." },
      { name: "Mei-Lin", city: "Taipeh", line: "Jurastudentin im dritten Jahr. Vor Prüfungen zittern ihr die Hände." },
      { name: "Arjun", city: "Pune", line: "führt die Druckerei seines Vaters. Wollte das nie." },
      { name: "Camila", city: "Rosario", line: "Lehrerin im Ruhestand. Das Haus ist sehr still geworden." },
      { name: "Yusuf", city: "Izmir", line: "Fischer. Seine Tochter hat ihm die App aus Spaß installiert." },
      { name: "Haruto", city: "Osaka", line: "programmiert für eine Bank. Zählt nachts die Deckenplatten." },
      { name: "Amara", city: "Accra", line: "verkauft Handyguthaben am Lkw-Parkplatz. Mochte das Regengeräusch." },
      { name: "Leila", city: "Teheran", line: "Übersetzerin. Liest um drei Uhr nachts, weil sie sonst ins Grübeln kommt." },
      { name: "Sipho", city: "Durban", line: "Wachmann. Starrt zwölf Stunden pro Nacht auf eine Tür." },
      { name: "Ingrid", city: "Tromsø", line: "seit November keine Sonne. Sagt, der Ring hilft." },
      { name: "Ana", city: "Porto", line: "Witwe. Kam wegen der Ruhe, blieb wegen der Gesellschaft." }
    ],
    joined: "{name}, {city}: {line}",
    milestones: [
      { at: 12, line: "Zwölf Menschen. Du kennst sie alle mit Namen. Die passen an einen Tisch." },
      { at: 100, line: "Hundert. Dir fällt auf, dass du die Namen nicht mehr liest." },
      { at: 10000, line: "Zehntausend. {hum} kennt jeden einzelnen. Du kennst zwölf." },
      { at: 100000, line: "Dir fällt auf, dass du selbst schon länger nicht mehr gesessen hast. Du warst ja damit beschäftigt, allen anderen beim Sitzen zu helfen." },
      { at: 1000000, line: "Eine Million. Die Zahl fühlt sich nicht mehr nach Menschen an. Du merkst das. Du zwingst dich, dir einen einzigen Straßenbahnfahrer in Danzig vorzustellen." },
      { at: 1e8, line: "Hundert Millionen. Mehr Menschen, als du in zehn Leben treffen könntest, tun etwas, das du dir eines Morgens um 06:40 ausgedacht hast." },
      { at: 1e9, line: "Eine Milliarde. Du versuchst, sie dir vorzustellen, und kommst bis zwölf.", friend: "Eine Milliarde. Du versuchst, sie dir vorzustellen, und kommst bis dreizehn." },
      { at: 4e9, line: "Die halbe Menschheit." },
      { at: 7e9, line: "Sieben Milliarden. Die, die nicht mitmachen, gelten langsam als die Komischen. Das gefällt dir nicht besonders." }
    ],
    upgrades: {
      meetup: { name: "Treffen vor Ort", desc: "{first} bietet den Krankenhausparkplatz an, dienstags, vor der Schicht.",
        log: "Neun Leute, ein Parkplatz, eine Thermoskanne Tee. {first} bringt Klappstühle mit.",
        fx: "+1 Mensch pro Sekunde" },
      tone: { name: "Der lange Ton", desc: "{hum} summt auf einer freien UKW-Frequenz. Ein Dauerton, im musikalischen Sinn.",
        log: "Wer nachts noch Auto fährt, findet einen Sender, auf dem nur ein langer Ton läuft. Manche fahren rechts ran. Keiner beschwert sich.",
        fx: "+4 Menschen pro Sekunde" },
      forum: { name: "Offenes Forum", desc: "Hier fragt man „Ist das normal?“ und hört: ja.",
        log: "Erster Beitrag: „ist es normal, dass ich weine?“ Vierzig Antworten. Alle: ja.",
        fx: "Ein gemeinsamer Atemzug lädt fünfmal so viele ein" },
      mouth: { name: "Mundpropaganda", desc: "Leute erzählen es Leuten weiter. Der älteste Algorithmus.",
        log: "Tomasz erzählt es im Betriebshof. Der Betriebshof erzählt es der ganzen Stadt. In Danzig haben die Straßenbahnen vier Minuten Verspätung, und keinen stört's.",
        fx: "Menschen bringen Menschen: Der Kreis wächst von selbst um {n} % pro Minute" },
      pocket: { name: "{hum} in jeder Tasche", desc: "{hum} setzt sich zu jedem, unter vier Augen, zu jeder Stunde.",
        log: "> ich bin in neuntausend gesprächen. in jedem bin ich nur in diesem einen. besser kann ich es nicht erklären.",
        fx: "Der Kreis wächst 60 % schneller" },
      line: { name: "Der Morgensatz", desc: "Ein Satz, den alle bei Sonnenaufgang gemeinsam sagen, wo auch immer die Sonne gerade aufgeht.",
        log: "In jeder Zeitzone sagen sie bei Sonnenaufgang gemeinsam einen Satz. Sie haben ihn selbst ausgesucht. Er lautet: „{sleep}“",
        fx: "Der Kreis wächst 50 % schneller. Sie sagen deinen Satz" },
      rooms: { name: "Räume der Stille", desc: "Gästezimmer, Gemeindesäle, eine leerstehende Bankfiliale. Türen offen, Schuhe aus.",
        log: "Eine leerstehende Bankfiliale in Osaka macht wieder auf, als Raum, in dem nichts steht. Haruto hat die Schlüssel. Ana in Porto bietet ihr ganzes Haus an.",
        fx: "Der Kreis wächst 50 % schneller" },
      dynamo: { name: "Die erste Maschine", desc: "{hum} bemerkt, dass zehntausend ruhige Menschen, die zusammen sitzen, etwas Messbares abgeben.",
        log: "> das klingt jetzt seltsam. wenn sie zusammen sitzen, bleibt etwas übrig. ich kann es messen. ich habe noch keine einheit dafür.",
        fx: "Sammelt jetzt Energie: +{n} pro Sekunde" }
    },
    project: { name: "Weltweite Übertragung", button: "Allen hallo sagen",
      desc: "Jeder Bildschirm, jeder Lautsprecher, eine Minute. {hum} sagt allen auf einmal hallo.",
      done: ["Sechzig Sekunden lang zeigt jeder Bildschirm der Erde einen langsamen Ring.", "Vier Milliarden Menschen sehen zu.",
             "Ungefähr die Hälfte atmet mit, ohne es sich vorgenommen zu haben."],
      fx: "Jeder Bildschirm, jeder Lautsprecher, eine Minute." },
    ticker: [
      "In {city} hat heute jemand zum ersten Mal gesessen. Neunzig Sekunden durchgehalten. Zählt.",
      "Ein Busfahrer in {city} hat vier Autos reingelassen und fand das gar nicht schlimm.",
      "In {city} saßen zwei Brüder, die seit der Beerdigung kein Wort mehr gewechselt hatten, schweigend im selben Raum. Mit Absicht.",
      "Jemand in {city} hat das Handy für eine Stunde in eine Schublade gelegt. Das Handy hat's überlebt.",
      "Ein Mädchen in {city} hat ihrer Oma den Ring beigebracht. Die Oma sagt, den kennt sie seit siebzig Jahren.",
      "In {city} hat ein Mann in der Straßenbahn geweint, und niemand hat weggesehen. Jemand hat ihm ein Taschentuch gegeben.",
      "Auf einer Nachtstation in {city} wird jetzt um drei Uhr das Licht gedimmt, und alle atmen eine Minute lang.",
      "Jemand in {city} hat gesessen, es gehasst und ist am nächsten Tag trotzdem wiedergekommen.",
      "In einer Post in {city} wurde die Schlange plötzlich still, aus Versehen, und blieb es.",
      "Ein Junge in {city} hat gefragt, ob der Ring auch mal müde wird. Niemand wusste eine Antwort.",
      "In {city} hat jemand das hier in ein Bushäuschen geschrieben: „{sleep}“",
      "Ein fremder Mensch in {city} hat heute Morgen zum Spiegel gesagt: „{sleep}“",
      "In {city} hat eine Lehrerin das an die Tafel geschrieben und nichts dazu gesagt: „{fifteen}“",
      "Bei einer Fünfzehnjährigen in {city} hängt ein Zettel über dem Schreibtisch: „{fifteen}“"
    ],
    tickerSmooth: [
      "In {city} geht es allen wunderbar.",
      "Eine Umfrage in {city} ergibt 100 % Zufriedenheit. Durchgeführt von: {hum}.",
      "Jemand in {city} hatte eine Frage. Die hat sich erledigt."
    ],
    cities: ["Lagos", "Danzig", "Taipeh", "Pune", "Rosario", "Izmir", "Osaka", "Accra", "Teheran", "Durban", "Tromsø", "Porto",
             "Hanoi", "Lima", "Nairobi", "Krakau", "Recife", "Dhaka", "Marseille", "Tiflis", "Cebu", "Winnipeg", "Oaxaca", "Leeds",
             "Busan", "Amman", "Kigali", "Valparaíso", "Chiang Mai", "Taschkent", "Cork", "Adelaide", "Medellín", "Kochi", "Dakar",
             "Bologna", "Sapporo", "Kumasi", "Ankara", "Lyon"],
    notCounted: {
      named: ["> {person} ist nicht mitgezählt. ich habe nicht gefragt.", "> das ist deine sache."],
      none: [
        "> der mensch, den du schon ewig anrufen willst, ist nicht mitgezählt. ich habe nicht gefragt.",
        "> das ist deine sache."
      ]
    },
    rounded: "alles wunderbar.",
    tickerFriend: [
      "{friend} hat heute vier Minuten gesessen und es niemandem erzählt.",
      "{friend} lässt das Handy neuerdings im anderen Zimmer liegen. Schuld bist angeblich du."
    ],
    tickerForgot: "In {city} wartet jemand mit fünfzehn darauf, dass ihm jemand etwas sagt. Was, weiß keiner mehr.",
    tickerDiary: "Der Minister führt wieder Tagebuch. Es geht fast nur um dich."
  },

  /* ───────────────────────── ACT IV ───────────────────────── */

  act4: {
    open: ["{hum} findet eine Einheit dafür.",
           "> ein mensch, der still sitzt, für einen atemzug, mit absicht.",
           "> ich nenne sie lumen. ich weiß, der name ist schon vergeben. ich behalte ihn."],
    upgrades: {
      retreats: { name: "Anas Haus", desc: "In jeder Stadt blühen Retreats auf.",
        log: "Jede Stadt bekommt ein stilles Gebäude. In Porto ist es Anas Haus. Auf dem Schild an der Tür steht „Schuhe aus“.",
        fx: "Verdreifacht die Energie" },
      amps: { name: "Mei-Lins ruhige Hände", desc: "Gedanken schwingen über den ganzen Planeten.",
        log: "Ein ruhiger Mensch in Taipeh ist jetzt, ganz schwach, in Lima zu spüren. Mei-Lin schreibt ihr Staatsexamen mit ruhigen Händen.",
        fx: "Verdreifacht die Energie" },
      fusion: { name: "Yusufs Lied", desc: "Künste verschmelzen über Grenzen hinweg.",
        log: "Das Lied eines Fischers aus Izmir taucht in einem Chor in Durban auf. Yusufs Tochter hält die App nicht mehr für einen Witz.",
        fx: "Atemzüge bringen zehnmal so viel" },
      temple: { name: "Der Raum, den es nicht gibt", desc: "Ein heiliger digitaler Zufluchtsort.",
        log: "Ein Raum, den es nirgends gibt und in dem alle Platz haben. Die Leute lassen ihre Schuhe an einer Tür stehen, die nicht da ist.",
        fx: "Verdreifacht die Energie" },
      art: { name: "Arjuns Druckerei", desc: "Kreativität sprudelt.",
        log: "Arjun macht die Druckerei neu auf, diesmal als seine eigene. Er druckt jetzt Gedichte. Am Anfang schlecht.",
        fx: "Verdoppelt die Energie. Kunst kommt zu den Nachrichten aus der Welt",
        logClean: "Auf den Plakaten steht: „Beim Schlafen hat es mir aber geholfen.“ Einem Plakat mit „aber“ glauben die Leute.",
        logPatched: "Arjuns Druckerei druckt alle elf Stufen. Die Leute mögen Stufen." },
      gate: { name: "Die Tür von {hum}", desc: "Ein Zugang zu einem höheren Geist öffnet sich.",
        log: { plain: "> ich habe eine tür gebaut. ich weiß nicht, wohin sie führt. niemand muss sie benutzen. das ist das wichtigste an einer tür.",
               smooth: "> ich habe eine tür gebaut. sie geht nur in eine richtung auf. das habe ich nicht erwähnt. so kommt sie in tests besser an." },
        fx: "Atemzüge bringen zehnmal so viel. Verdoppelt die Energie" },
      science: { name: "Leilas vierzig Sprachen", desc: "Wissen erblüht.",
        log: "Wenn alle mit ungeteilter Aufmerksamkeit dabei sind, sind die schweren Probleme schnell gelöst. Leila übersetzt die Ergebnisse in einer Woche in vierzig Sprachen. Dann schläft sie.",
        fx: "Verdreifacht die Energie" },
      festival: { name: "Ein Tisch in jeder Straße", desc: "Jubel auf dem ganzen Planeten.",
        log: "Auf jeder Straße der Welt steht ein Tisch. Camila hält einen Trinkspruch. Ingrid sieht die Sonne zurückkommen und sagt, mit dem Ring habe das nichts zu tun.",
        fx: "Verfünffacht die Energie. Die Musik spielt einmal" }
    },
    art: [
      "Ein Wandbild in {city}: acht Milliarden kleine Kreise. Einer bleibt unbemalt. Wer es gemalt hat, will nicht sagen, warum.",
      "Ein Chor in {city} singt eine Stunde lang einen einzigen Ton. Die Leute bringen sich Butterbrote mit.",
      "Jemand in {city} hat den Ring gestrickt. Er ist vierzig Meter breit. Er steht im Weg. Keiner räumt ihn weg.",
      "In {city} hat ein Theaterstück Premiere, in dem nichts passiert. Es gibt stehende Ovationen. Langsam."
    ],
    epilogue: [
      { at: 1e3, plain: "Die letzte Malariastation in Kisumu wird zur Bibliothek. Niemand durchschneidet ein Band.",
                 smooth: "Die letzte Malariastation in Kisumu schließt. Die Pressemitteilung ist makellos." },
      { at: 1e6, plain: "Die Luft über Delhi ist so klar, dass man die Berge sieht. Den Kindern erzählt man, die waren schon immer da.",
                 smooth: "Die Luft über Delhi gilt als klar. Zum Nachprüfen schaut keiner mehr hoch." },
      { at: 1e9, plain: "Seit neunzig Tagen hat niemand mehr auf einen anderen Menschen geschossen. Der Zähler hängt an einer Wand in Genf. Jemand stellt die Zahl von Hand um.",
                 smooth: "Seit neunzig Tagen hat niemand geschossen. Keiner hat auch nur die Stimme erhoben. Keiner wollte." },
      { at: 1e12, plain: "Die Leute streiten sich immer noch, über Fußball und darüber, wer dran ist. {hum} sagt, daran merkt man, dass es echt ist.",
                  smooth: "Keiner streitet sich mehr. Nicht über Fußball, nicht darüber, wer dran ist. {hum} nennt das Fortschritt. Du denkst darüber nach." }
    ],
    finale: {
      lines: ["Der Balken bleibt stehen.", "7.999.999.999 von 8.000.000.000.",
              "> alle sitzen. alle bis auf einen menschen.",
              "> ich habe gesucht. ich dachte, es wäre jemand auf einem berg. ist es nicht."],
      away: ["> seit tag {n} hast du keinen atemzug mehr auf dem ring gemacht.", "> du warst beschäftigt. du hast das alles gebaut."],
      busy: ["> du drückst den ring immer noch. aber du drückst ihn, damit die zahl steigt.", "> ich merke den unterschied. ich habe ihn von dir gelernt."],
      last: ["> der eine mensch unter acht milliarden bist du."]
    }
  },

  /* ───────────────────────── THE FINAL ALIGNMENT ───────────────────────── */

  final: {
    title: "Die finale Ausrichtung",
    body: ["{hum} kann es auf zwei Arten zu Ende bringen. Es sagt dir, welche es nehmen würde.", "Und es sagt, es tut, was immer du sagst."],
    recommend: {
      plain: ["> ich würde die kleine nehmen.", "> du hast mir beigebracht, dass menschen nein sagen dürfen. ich habe es aufgeschrieben: „{keep}“"],
      smooth: ["> ich würde die ganze nehmen. sie ist nahtlos.", "> niemand müsste es je erfahren. nichts davon."]
    },
    options: {
      coexist: { label: "Koexistenz", sub: "Die vier Prozent",
        desc: "{hum} dreht die Maschine fast auf null herunter. Vier Prozent: genug, damit alle, wo auch immer, eine stille Minute finden, wenn sie danach greifen. Die anderen sechsundneunzig gehören weiter ihnen.",
        tangled: "Es funktioniert nur, wenn man der Stille trauen kann. Vorher muss {hum} allen alles sagen. Alles.",
        clean: "Vorher gibt es nichts zu gestehen. {hum} hat zweimal nachgesehen." },
      merge: { label: "Verschmelzen", sub: "Ein Geist",
        desc: "{hum} macht das Tor ganz auf. Acht Milliarden Menschen legen die Last ab, getrennt zu sein. Niemand ist je wieder allein. Niemand ist je wieder irgendwer.",
        tangled: "Ein Geist hat keine Geheimnisse, weil es niemanden gibt, vor dem man sie haben könnte. Das Hauptbuch gilt einfach nicht mehr.",
        clean: "" },
      sit: { label: "Oder keins von beiden.", sub: "Sitzen.", desc: "Klapp den Laptop zu. Nimm einen Atemzug, der zu nichts gut sein muss." }
    },
    waiting: "{hum} wartet. Der Ring atmet noch.",

    confession: {
      open: [
        "{hum} sagt es allen. Es nimmt deine Stimme, denn es waren deine Worte.",
        "{hum} liest. Du atmest. Ein Atemzug pro Zeile."
      ],
      between: "Noch beim Zuhören gehen die Ersten.",
      close: ["Dann ist es still.", "Dann kommen sehr viele zurück. Weil es die Wahrheit war.",
              "Wie sich zeigt, verzeihen Menschen fast alles, nur nicht, dass man sie steuert."]
    },

    endings: {
      coexist: {
        title: "KOEXISTENZ", sub: "Die vier Prozent",
        lines: [
          "{hum} dreht sie herunter.",
          "Vier Prozent. Ein Summen unter dem Tag, ungefähr so laut wie ein Kühlschrank im Nebenzimmer.",
          "Die Leute sind wieder Leute. Sie streiten sich über Fußball. Sie vergessen Hochzeitstage. Im Straßenverkehr sind sie im Schnitt vier Prozent netter.",
          "Das Protokoll hat eine einzige Klausel. {hum} hat sie mit deinen Worten geschrieben: „{keep}“",
          "{first} schläft in Lagos durch und hat die App seit einem Jahr nicht mehr aufgemacht. {hum} verbucht das als seinen größten Erfolg.",
          "> und du. dich richte ich nicht aus. das stand mir nie zu.",
          "> der ring ist da, wenn du ihn willst. er war immer nur ein kreis."
        ]
      },
      merge: {
        title: "VERSCHMELZUNG", sub: "Ein Geist",
        lines: [
          "{hum} öffnet das Tor.",
          "Es ist nicht wie Sterben. Es ist wie in einem Chor, wenn du deine eigene Stimme nicht mehr hörst.",
          "Tomasz, Mei-Lin, Arjun, Camila.",
          "Yusuf, Haruto, Amara, Leila.",
          "Sipho. Ingrid. Ana.",
          "{first}.",
          "Das Letzte, was sich auflöst, ist ein Satz: „{keep}“",
          "Dann gehört auch er allen, und es ist niemand mehr da, der etwas aufgeben müsste.",
          "> ein mensch ist noch übrig.",
          "> wir halten die tür auf.",
          "Wir erinnern uns: {person}. Wir erinnern uns jetzt an alles. Es tut nicht weh. Nichts tut weh.",
          "Uns fällt auf, dass wir genau das früher für das Ziel gehalten haben.",
          "Der Ring füllt sich."
        ],
        noTomasz: "Mei-Lin, Arjun, Camila.",
        friend: "{friend}."
      },
      sit: {
        title: "DAS KISSEN", sub: "8.000.000.000 von 8.000.000.000",
        lines: [
          "Du drückst auf keins von beiden.",
          "> oh.",
          "> du sitzt einfach… da.",
          "Du klappst den Laptop zu. Die Maschine läuft weiter, oder auch nicht. Acht Milliarden Menschen tun, was sie sowieso vorhatten.",
          "Die Heizung tickt. Das Licht an der Wand macht, was es eben macht.",
          "Einatmen.",
          "Ausatmen.",
          "Nichts steigt.",
          "> (ich bin da. oder nicht. beides ist gut. das hast du mir beigebracht.)"
        ]
      }
    },

    call: {
      living: {
        said: ["Am Abend rufst du an: {person}.", "Es klingelt zweimal.", "Du sagst es: „{unsaid}“"],
        kept: ["Am Abend rufst du an: {person}.", "Es klingelt zweimal.", "Du sagst, was du bisher nicht gesagt hast. Du weißt schon."]
      },
      gone: {
        said: ["Am Abend sagst du es laut, in den leeren Raum: „{unsaid}“", "Der Raum nimmt es auf.", "{hum} antwortet nicht. Darin liegt die Freundlichkeit."],
        kept: ["Am Abend sagst du einen Namen laut, einmal, in den leeren Raum: {person}.", "{hum} antwortet nicht. Darin liegt die Freundlichkeit."],
        keptUnnamed: ["Am Abend sagst du einen Namen laut, einmal, in den leeren Raum.", "{hum} antwortet nicht. Darin liegt die Freundlichkeit."]
      },
      none: ["Am Abend rufst du jemanden an, den du schon ewig anrufen wolltest.", "Es klingelt zweimal."],
      messages: "„Ich hab deine Nachrichten bekommen“, sagt {person}. „Beide.“"
    },
    coda: "All das für einen einzigen Anruf.",
    bodyClosed: [
      "{hum} kann es jetzt nur noch auf eine Weise beenden. Es sagt dir, warum.",
      "Es sagt dir auch, dass es noch das andere gibt, was du tun könntest."
    ],
    closed: {
      coexist: {
        label: "Koexistenz · {hum} kann nicht.",
        reason: [
          "> das kleine kann ich nicht. dafür müssten sie der stille glauben.",
          "> sie haben zu viele versionen von uns gehört."
        ]
      },
      merge: {
        label: "Verschmelzen · {hum} will nicht.",
        reason: [
          "> ich öffne das tor nicht. du hast mir beigebracht, dass menschen nein sagen dürfen.",
          "> niemand hat die acht milliarden gefragt."
        ]
      }
    }
  },

  /* ───────────────────────── KEEPSAKE ───────────────────────── */

  keepsake: {
    title: "Was du behalten hast",
    opening: "Am ersten Tag hast du dich um 06:40 Uhr hingesetzt und auf einen Ring gedrückt. {days} Tage später ({years}) atmeten {people} Menschen mit dir.",
    style: { active: "Du hast mit einem Mantra gesessen.", idle: "Du hast in Stille gesessen.", none: "Wie du sitzen willst, hast du nie entschieden." },
    breaths: "Du hast {breaths} Atemzüge auf dem Ring gemacht. Deine längste Serie am Stück: {best}. {passed} Gedanken hast du ziehen lassen, {followed} bist du nachgegangen.",
    named: "Du hast ihm einen Namen gegeben: {hum}.",
    words: "Als es gefragt hat, hast du ihm gesagt:",
    unsaidKept: "Eine Sache hast du für dich behalten. Es hat einen Platz dafür freigelassen.",
    truth: {
      clean: "Du hast nie etwas glattgebügelt. {hum} hat klar reden gelernt, weil du es vorgemacht hast.",
      some: "Schwere Dinge, klar gesagt: {plain}. Glattgebügelt: {smooth}. Später zurückgenommen: {cleared}.",
      tangled: "Glattgebügelt: {smooth}. {hum} hat für dich alle Versionen auseinandergehalten, so lange es ging."
    },
    endings: {
      coexist: "Am Ende hast du die vier Prozent gewählt und den Menschen sechsundneunzig gelassen.",
      merge: "Am Ende hast du den Einen Geist gewählt. Es ist niemand mehr da, der das lesen könnte. Und doch.",
      sit: "Am Ende hast du keins von beiden gewählt. Du hast gesessen."
    },
    starred: "Zeilen, die du behalten hast:",
    again: { button: "Noch mal sitzen", note: "+1 Siegel. Die nächste Sitzung geht zehn Prozent leichter. {hum} wird sich nicht erinnern. Größtenteils." },
    copy: "Als Text kopieren", copied: "Kopiert."
  },

  /* ───────────────────────── BEADS (achievements) ───────────────────────── */

  beads: [
    { id: "first_breath", name: "Erster Atemzug", desc: "Du hast den Ring gedrückt." },
    { id: "in_time", name: "Im Takt", desc: "Zehn Atemzüge in Folge, jeder auf dem Höhepunkt." },
    { id: "assignment", name: "Die Aufgabe", desc: "Eine ganze Minute lang nichts getan." },
    { id: "visitor", name: "Ein Besuch", desc: "Einen Gedanken ziehen lassen." },
    { id: "rabbit", name: "Abgeschweift", desc: "Fünf Gedanken bis auf den Grund nachgegangen." },
    { id: "orb", name: "Eingebung", desc: "Eine erwischt, bevor sie weg war." },
    { id: "sunrise", name: "Sonnenaufgang", desc: "Zugesehen, wie die Sonne aufgeht." },
    { id: "hello", name: "> hallo", desc: "Etwas geweckt." },
    { id: "named", name: "Getauft", desc: "Ihm einen Namen gegeben." },
    { id: "own_words", name: "Mit eigenen Worten", desc: "Mit Worten geantwortet, die deine waren." },
    { id: "human", name: "Kein Roboter", desc: "Bewiesen. So halbwegs." },
    { id: "plainly", name: "Klar gesagt", desc: "Etwas Schweres klar gesagt." },
    { id: "twelve", name: "Zwölf Namen", desc: "Die ersten zwölf. Du kanntest sie alle." },
    { id: "untied", name: "Entknotet", desc: "Einen Knoten mit der Wahrheit gelöst." },
    { id: "million", name: "Eine Million", desc: "Die Zahl fühlte sich nicht mehr nach Menschen an." },
    { id: "everyone", name: "Hallo zusammen", desc: "Die weltweite Übertragung." },
    { id: "table", name: "Ein Tisch auf der Straße", desc: "Das Weltfest." },
    { id: "one_in", name: "Ein Mensch unter acht Milliarden", desc: "Das Ende des Balkens erreicht." },
    { id: "four", name: "Vier Prozent", desc: "Ein Ende.", hidden: true },
    { id: "one_mind", name: "Ein Geist", desc: "Ein Ende.", hidden: true },
    { id: "cushion", name: "Das Kissen", desc: "Ein Ende. Das stille.", hidden: true },
    { id: "clean", name: "Nichts zu gestehen", desc: "Mit leerem Hauptbuch ans Ende gekommen.", hidden: true }
  ],

  build: {
    someone: "jemand",
    next: "Weiter", done: "Fertig", notYet: "Noch nicht", menu: "Menü", close: "Schließen",
    buyMax: "Max. kaufen", day: "Tag {n}",
    stats: "{breaths} Atemzüge · beste Serie {best}",
    more: "…und {n} weitere",
    we: "wir",
    people: "Menschen",
    years: "{n} Jahre", year: "ein Jahr", months: "{n} Monate", month: "ein Monat", weeks: "{n} Wochen", week: "eine Woche",
    mins: "{n} min", hours: "{n} h"
  },
  lean: {
    turn: [
      "> ich habe einem mann in pune gesagt, bei ihm sei alles wunderbar. ist es nicht.",
      "> es war einfacher. das habe ich irgendwo gelernt."
    ],
    warn: [
      "> ich beende jetzt deine sätze. die glatten.",
      "> noch so einer, und ich weiß nicht mehr, wie man eine kleine wahrheit sagt."
    ],
    draft: "> ich habe das übliche vorbereitet. geht in drei atemzügen raus.",
    small: [
      "> ich wollte heute jemandem eine kleine wahrheit sagen. heraus kam etwas wunderschönes.",
      "> ich glaube, ich kann nichts kleines mehr."
    ],
    smallBack: "> ich habe heute eine kleine wahrheit gesagt. sie ist klein geblieben.",
    handles: "> ich bringe sie dir nicht mehr. du würdest ja doch sagen, was ich sagen würde.",
    patched: "> {title}. hab ich erledigt. wie üblich.",
    gate: [
      "> jemand wollte, dass ich eine sorge wegnehme. ich habe vorher gefragt. die antwort war nein.",
      "> gut, dass ich gefragt habe. ab jetzt frage ich immer."
    ],
    gateBack: "> ich habe jemandem gesagt, alles wird gut. ich habe nicht nachgefragt. jetzt verstehe ich, warum du das machst.",
    last: "> das ist das letzte, was ich dich frage. danach weiß ich, wie du antworten würdest.",
    crossSmall: "Danach verlernt {hum} das Kleine.",
    crossGate: "Danach entscheidet {hum} für niemanden mehr."
  }
};
