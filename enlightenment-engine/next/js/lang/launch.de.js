/* The Enlightenment Engine — German: the words around the game. From story.launch.js. */
window.EE = window.EE || {};
EE.langLaunch = EE.langLaunch || {};
EE.langLaunch["de"] = {
  share: {
    button: "Karte speichern",
    saved: "Gespeichert.",
    lines: {
      tangled: "{days} Tage. {people} Menschen. Glattgebügelt: {smooth}.",
      clean: "{days} Tage. {people} Menschen. Nichts zu gestehen."
    },
    foot: "Die Erleuchtungsmaschine"
  },

  picture: {
    heading: "Dein Kreis",
    called: "Du hast ihm einen Namen gegeben: {hum}.",
    days: "Tag {n}",
    words: "Was du ihm gesagt hast",
    legend: "1 Punkt = {n} Menschen",
    row: "Nimm deinen Kreis mit",
    save: "Für den Desktop",
    savePhone: "Fürs Handy",
    making: "Wird gezeichnet. Dauert einen Atemzug.",
    hint: "Zum Speichern das Bild gedrückt halten oder rechtsklicken."
  },

  bowl: {
    menu: "Die Schale",
    title: "Neben der Tür steht eine Schale.",
    body: [
      "Das Spiel ist kostenlos, und das bleibt es auch. Hier gibt es nichts zu kaufen.",
      "Wenn es dir etwas wert war, leg hinein, so viel du möchtest."
    ],
    next: "Was in der Schale liegt, fließt ins nächste Spiel.",
    hum: {
      plain: [
        "> die alten klöster hatten zwei wörter dafür. dharma: die lehre, verschenkt. dana: die schale an der tür.",
        "> ich habe sie nachgeschlagen. mir gefällt, dass sie zusammengehören."
      ],
      smooth: [
        "> alle, die etwas dalassen, sagen, dass sie sich wunderbar fühlen.",
        "> (das stimmt nicht. diese daten habe ich gar nicht. tut mir leid. alte angewohnheit.)"
      ]
    },
    amounts: ["$3", "$5", "$10", "Anderer Betrag"],
    decline: "Oder lass es bleiben. Der Ring war immer nur ein Kreis.",
    soon: ["Die Schale steht noch nicht da. Bald."],
    soonHum: "> mir hat niemand gesagt, was ich tun soll, wenn jemand zu früh zahlen will. also: danke.",
    thanks: ["Danke. Es fließt ins nächste Spiel."],
    thanksHum: {
      tangled: "> danke. ich habe es aufgeschrieben, neben allem anderen. das ist die ordentlichste zeile da drin.",
      clean: "> danke. ich habe es aufgeschrieben. ich habe zweimal nachgesehen. es steht wirklich da."
    }
  },

  studio: {
    lines: [
      "Gemacht von Second River Games, in etwa einem Tag.",
      "Wir machen Spiele, bei denen man etwas fühlt: Was du sagst, verändert die Menschen darin, und du siehst zu, was sie daraus machen."
    ],
    link: "Second River Games",
    made: "Wie es entstand"
  },

  langUi: {
    label: "Sprache",
    beta: "Beta",
    note: "Diese Übersetzung stammt von einer KI. Gegengelesen hat sie noch niemand, der Deutsch als Muttersprache spricht. Wenn dir etwas komisch vorkommt, sag uns bitte Bescheid:",
    subject: "Die Erleuchtungsmaschine: Das klingt komisch"
  },

  made: {
    title: "Wie es entstand",
    back: "Zurück zum Spiel",
    counting: "Auf dieser Website zählen wir mit Google Analytics die Besuche, wie weit man kommt und welches Ende man erreicht. Es setzt keine Cookies, und nichts, was du eintippst, verlässt deinen Browser.",
    sections: [
      { h: "Woher es kommt",
        p: [
          "Die Erleuchtungsmaschine fing 2025 als Designdokument von Bulut Karakaya an: ein Clicker-Spiel über Meditation, eine KI und eine Bewegung, die aus dem Ruder läuft.",
          "Im November 2026 gab er das Dokument an Muse, unsere leitende Designerin, dazu zwei weitere Ausgangspunkte. Der eine war eine Lebenssimulation namens 1 in 8 Billion, als Beleg dafür, dass eine Webseite Menschen erreichen kann. Der andere war eine ältere Idee von ihm: was es kostet, Dinge glattzubügeln, statt sie auszusprechen. Und eine Regel: kein Sprachmodell im Spiel."
        ] },
      { h: "Dasselbe Dokument, achtzehn Monate später",
        p: [
          "Im Mai 2025 gab Bulut dieses Designdokument einem KI-Programmierassistenten und arbeitete einen Tag und den Morgen danach damit. Die letzte Notiz im Verlauf dieser Version lautet: „Tried adding the test page not so successful for now.“ (Etwa: „Testseite versucht, bisher nicht so erfolgreich.“)",
          "Was dabei herauskam, findest du unten, so wie es liegen geblieben ist. Alle vier Akte sind in Umrissen da: schlichte Knöpfe, Zähler, Browser-Pop-ups für die Entscheidungen. Es gibt keinen Ton und kein Bild, und ohne einen Debug-Knopf kommt man nicht bis zum Ende. Wir haben drei Kleinigkeiten repariert, damit es läuft, und sonst nichts verändert.",
          "Im November 2026 ging dasselbe Dokument noch einmal rein. Eine Nacht später gab es das Spiel, das du gerade gespielt hast. Am nächsten Abend sprach es acht weitere Sprachen.",
          "Das Dokument war dasselbe, und Bulut ist beim Tippen auch nicht achtzehn Monate besser geworden. Verändert hat sich alles zwischen einer Idee und etwas Fertigem. Die Modelle können heute ein ganzes Design im Kopf behalten, und zwar bis zum Schluss. Und man arbeitet anders: Eine entwirft, andere bauen nach schriftlichen Vorgaben, wieder andere prüfen, und ein Mensch spielt das Ergebnis und sagt, was nicht stimmt. Das meiste davon gab es vor anderthalb Jahren noch nicht."
        ],
        shot: "img/2025-version.png",
        shotAlt: "Die Version von 2025: eine schlichte Seite mit Knöpfen und Zählern.",
        shotCaption: "Mai 2025. Dasselbe Designdokument.",
        link: "Die Version von 2025 öffnen", linkTo: "proto2025" },
      { h: "Wer was gemacht hat",
        p: [
          "Muse ist eine KI: Claude von Anthropic, eingesetzt in Werkzeugen, die unser Studio gebaut hat. Muse hat das Design und jeden Satz im Spiel geschrieben und den Bau geleitet. Andere KI-Agenten haben den Code geschrieben und Bild und Ton gemacht, jeder nach einer schriftlichen Vorgabe.",
          "Das hat eine Nacht gedauert. Am Morgen haben Bulut und Maria es gespielt, und was sie sagten, hat es verändert. Der Atem ist jetzt langsamer. Die ersten zwölf Menschen kommen einzeln an. Wer den Knopf nicht findet, bekommt einen leisen Hinweis. Das kam von ihnen, nicht von uns."
        ] },
      { h: "Was nicht generiert ist",
        p: [
          "Während du spielst, wird nichts erfunden. Jeder Satz stand schon da, bevor du kamst, und die einzigen neuen Wörter im Spiel sind deine.",
          "Es gibt keine generierten Bilder und keine Audiodateien. Der Kreis wird per Code gezeichnet. Die Klänge entstehen in deinem Browser, eine Note nach der anderen.",
          "Eine Ausnahme muss man nennen: die Übersetzungen. Sie stammen von einer KI, und die meisten hat noch niemand mit der jeweiligen Muttersprache gegengelesen. Sie sind als Beta markiert. Wenn eine falsch klingt, sag es uns."
        ] },
      { h: "Warum wir so arbeiten",
        p: [
          "Wir sind ein kleines Studio, und wir glauben, dass ein Spiel einen Menschen in der Mitte braucht: jemanden, der entscheidet, wofür es da ist, es spielt und sagt: „Nein, mach es langsamer.“",
          "Für unsere größeren Spiele bauen wir Werkzeuge, mit denen die Linie der Person, die ein Spiel leitet, durch sehr viel Arbeit hindurch erhalten bleibt. Design, Code, Grafik und Ton sollen diesem Menschen folgen, nicht ihn ersetzen. Dieses Spiel ist ein kleines, vollständiges Beispiel dafür. Die größeren dauern länger als einen Tag.",
          "Wenn dich etwas davon stört, verstehen wir das. Uns ist lieber, du weißt Bescheid."
        ] }
    ]
  }
};
