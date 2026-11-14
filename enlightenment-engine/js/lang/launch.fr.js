/* The Enlightenment Engine — French: the words around the game. From story.launch.js. */
window.EE = window.EE || {};
EE.langLaunch = EE.langLaunch || {};
EE.langLaunch["fr"] = {
  share: {
    button: "Enregistrer la carte",
    saved: "Enregistrée.",
    lines: {
      tangled: "{days} jours. {people} personnes. Choses lissées : {smooth}.",
      clean: "{days} jours. {people} personnes. Rien à avouer."
    },
    foot: "Le Moteur d’Éveil"
  },
  picture: {
    heading: "Ton Cercle",
    called: "Tu lui as donné un nom : {hum}.",
    days: "Jour {n}",
    words: "Ce que tu lui as dit",
    legend: "1 point = {n} personnes",
    row: "Emporte ton Cercle",
    save: "Pour ordinateur",
    savePhone: "Pour téléphone",
    making: "Dessin en cours. Le temps d’une respiration.",
    hint: "Pour l’enregistrer, appuie longuement sur l’image ou fais un clic droit."
  },
  bowl: {
    menu: "Le bol",
    title: "Il y a un bol près de la porte.",
    body: [
      "Le jeu est gratuit, et il le restera. Rien n’y est à vendre.",
      "Si ça t’a apporté quelque chose, laisse ce que tu veux."
    ],
    next: "Ce qui tombe dans le bol servira au prochain jeu.",
    hum: {
      plain: [
        "> les anciennes salles de méditation avaient deux mots pour ça. dharma : l’enseignement, offert. dana : le bol près de la porte.",
        "> je les ai cherchés. j’aime bien qu’ils aillent ensemble."
      ],
      smooth: [
        "> tous ceux qui laissent quelque chose disent se sentir merveilleusement bien.",
        "> (ce n’est pas vrai. je n’ai pas ces données. pardon. vieille habitude.)"
      ]
    },
    amounts: ["$3", "$5", "$10", "Autre montant"],
    decline: "Ou pas. L’anneau n’a jamais été qu’un cercle.",
    /* While links.bowlOpen is false: pressing any amount shows this. Nothing is withheld: the card and pictures are free. */
    soon: ["Le bol n’est pas encore sorti. Bientôt."],
    soonHum: "> personne ne m’a dit quoi faire si quelqu’un veut payer en avance. alors : merci.",
    /* When the bowl is open, after a payment. */
    thanks: ["Merci. Ça servira au prochain jeu."],
    thanksHum: {
      tangled: "> merci. je l’ai noté avec tout le reste. c’est la ligne la plus propre de toutes.",
      clean: "> merci. je l’ai noté. j’ai vérifié deux fois. c’est bien là."
    }
  },
  studio: {
    lines: [
      "Fait par Second River Games, en une journée environ.",
      "Nous faisons des jeux où l’on ressent quelque chose : ce que tu dis change les gens qui y vivent, et tu vois ce qu’ils en font."
    ],
    link: "Second River Games",
    made: "Comment on l’a fait"
  },
  langUi: {
    label: "Langue",
    beta: "bêta",
    note: "Cette traduction a été faite par une IA et aucun locuteur natif ne l’a encore lue. Si quelque chose sonne faux, dis-le-nous :",
    subject: "Le Moteur d’Éveil : ce qui sonne faux"
  },
  made: {
    title: "Comment on l’a fait",
    back: "Retour au jeu",
    counting: "Sur ce site, nous comptons avec Google Analytics les visites, jusqu’où les gens vont et quelle fin ils atteignent. Aucun cookie n’est déposé, et rien de ce que tu écris ne quitte ton navigateur.",
    sections: [
      { h: "D’où ça vient",
        p: [
          "Le Moteur d’Éveil est né en 2025, sous la forme d’un document de conception de Bulut Karakaya : un clicker sur la méditation, une IA et un mouvement qui dérape.",
          "En novembre 2026, il a confié le document à Muse, notre lead designer, avec deux autres points de départ. L’un : une simulation de vie, 1 in 8 Billion, preuve qu’une page web peut toucher les gens. L’autre : une vieille idée à lui, sur ce que ça coûte de lisser les choses au lieu de les dire. Et une règle : pas de modèle de langage dans le jeu."
        ] },
      { h: "Le même document, à dix-huit mois d’écart",
        p: [
          "En mai 2025, Bulut a donné ce document de conception à un assistant de programmation IA, et ils y ont travaillé une journée, puis le lendemain matin. La dernière note de l’historique de cette version dit : « Tried adding the test page not so successful for now. » (en gros : essayé d’ajouter la page de test, pas très concluant pour l’instant.)",
          "Le résultat est ci-dessous, tel qu’il a été laissé. Les quatre actes y sont, en esquisse : des boutons tout simples, des compteurs, des fenêtres pop-up du navigateur pour les choix. Il n’y a ni son ni image, et on ne peut pas le terminer sans un bouton de débogage. Nous avons réparé trois petites choses pour qu’il tourne, sans rien changer d’autre.",
          "En novembre 2026, nous avons redonné le même document. Une nuit plus tard, il y avait le jeu auquel tu viens de jouer. Dès le lendemain soir, il parlait huit langues de plus.",
          "Le document n’a pas changé, et Bulut ne tape pas mieux qu’il y a dix-huit mois. Ce qui a changé, c’est tout ce qui sépare une idée d’une chose finie. Les modèles savent maintenant garder tout un design en tête sans en perdre le fil. Et la façon de travailler n’est plus la même : l’un conçoit, d’autres construisent à partir de consignes écrites, d’autres vérifient, et une personne joue à ce qui en sort et dit ce qui ne va pas. L’essentiel de tout ça n’existait pas il y a un an et demi."
        ],
        shot: "img/2025-version.png",
        shotAlt: "La version 2025 du jeu : une page toute simple de boutons et de compteurs.",
        shotCaption: "Mai 2025. Le même document de conception.",
        link: "Ouvrir la version 2025", linkTo: "proto2025" },
      { h: "Qui a fait quoi",
        p: [
          "Muse est une IA : Claude, conçu par Anthropic, qui travaille avec des outils construits par notre studio. Muse a écrit le game design et chaque phrase du jeu, et a dirigé la fabrication. D’autres agents IA ont écrit le code, l’image et le son, chacun à partir d’une consigne écrite.",
          "Ça a pris une nuit. Au matin, Bulut et Maria y ont joué, et leurs remarques l’ont changé. La respiration a ralenti. Les douze premières personnes arrivent maintenant une par une. Qui ne trouve pas le bouton reçoit un petit coup de pouce discret. C’étaient leurs remarques, pas les nôtres."
        ] },
      { h: "Ce qui n’est pas généré",
        p: [
          "Rien n’est inventé pendant que tu joues. Chaque phrase a été écrite avant ton arrivée, et les seuls mots nouveaux du jeu sont les tiens.",
          "Il n’y a ni image générée ni fichier audio. Le Cercle est dessiné par du code. Les sons sont synthétisés dans ton navigateur, une note à la fois.",
          "Les traductions sont l’exception qu’il faut signaler : elles ont été faites par une IA, et la plupart n’ont pas encore été lues par un locuteur natif. Elles sont marquées bêta. Si l’une d’elles sonne faux, dis-le-nous."
        ] },
      { h: "Pourquoi nous travaillons ainsi",
        p: [
          "Nous sommes un petit studio, et nous pensons qu’un jeu a besoin d’une personne en son centre : quelqu’un qui décide à quoi il sert, y joue, et dit « non, plus lentement ».",
          "Pour nos plus gros jeux, nous construisons des outils qui permettent à la vision d’un seul directeur de jeu de porter sur une énorme quantité de travail, pour que le design, le code, l’art et le son suivent cette personne au lieu de la remplacer. Ce jeu en est un petit exemple, complet. Les gros prennent plus d’une journée.",
          "Si quelque chose là-dedans te dérange, nous le comprenons. Nous préférons que tu le saches."
        ] }
    ]
  }
};
