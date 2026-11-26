/* The Enlightenment Engine — French. Translated from story.js at commit f4bd079. */
window.EE = window.EE || {};
EE.lang = EE.lang || {};
EE.lang["fr"] = {
  langName: "Français",
  meta: {
    title: "Le Moteur d’Éveil",
    tagline: "Un petit jeu sur l’art de ne pas bouger, et sur tout ce que tu construiras pour y échapper.",
    defaultHum: "Hum",
    actTitles: {
      1: { num: "I", name: "Le Coussin" },
      2: { num: "II", name: "{hum}" },
      3: { num: "III", name: "Le Cercle" },
      4: { num: "IV", name: "Le Moteur" }
    }
  },
  ui: {
    press: { 1: "Respirer", 2: "Penser à deux", 3: "Inviter", 4: "Rayonner" },
    resources: { clarity: "Clarté", insight: "Intuition", followers: "Personnes", energy: "Énergie", sigils: "Sigiles" },
    panels: {
      practice: "Pratique",
      hum: "{hum}",
      circle: "Le Cercle",
      engine: "Le Moteur",
      ledger: "Le Registre",
      beads: "Perles",
      journal: "Journal"
    },
    breathHint: "L’anneau gonfle, puis retombe. Appuie quand il devient doré.",
    onBreath: ["juste", "là", "oui", "synchro", "pile"],
    streakLabel: "respirations d’affilée",
    legend: "1 point = {n}",
    legendOne: "1 point = 1 personne",
    trust: { name: "Confiance", desc: "Ce qu’on a dit franchement. {hum} en apprend aussi." },
    tangle: {
      name: "Embrouille",
      desc: "Ce qu’on a lissé. {hum} en apprend."
    },
    card: {
      thought: "Une pensée",
      decision: "Une décision",
      knot: "Un nœud",
      question: "{hum} demande",
      optional: "Écrire, si tu veux.",
      keep: "Le garder pour moi"
    },
    lastTime: "la dernière fois",
    star: "Touche une ligne pour la garder.",
    offline: "Pendant ton absence ({n}), la pièce a continué de respirer.",
    save: {
      export: "Copier la sauvegarde",
      import: "Coller la sauvegarde",
      reset: "Nouvelle partie",
      resetAsk: "Recommencer depuis la première respiration ?",
      resetBody: "Cette partie sera perdue. Pour la garder, copie d’abord ta sauvegarde.",
      resetYes: "Oui, recommencer",
      resetNo: "Non, je reste là"
    },
    sound: { on: "Son activé", off: "Son coupé" },
    bar: "Éveil mondial",
    finalButton: "Lancer l’Alignement final",
    now: "maintenant",
    horizon: "· · ·",
    change: "{before} → {after}",
    together: ["à deux", "avec {hum}", "tous les deux"],
    lean: [
      "parle franchement, toujours",
      "parle franchement",
      "parle comme toi",
      "finit tes phrases",
      "ne sait plus faire petit",
      "parle à ta place"
    ],
    about: "environ {n}"
  },
  intro: [
    "6 h 40. L’appartement est silencieux. Le radiateur cliquette.",
    "Cette nuit, à 2 h, tu as téléchargé une appli de méditation. Comme tout le monde.",
    "Tu t’assois. Tu fermes les yeux.",
    "Tu ouvres un œil pour trouver le bouton."
  ],
  firstBreaths: ["Inspire.", "Expire.", "Inspire. Franchement, c’est à peu près tout."],
  dawn: [
    { at: 0.25, line: "La fenêtre passe du noir à un bleu dont tu ne connais pas le nom." },
    { at: 0.6, line: "Un camion-poubelle, deux rues plus loin. Un merle, plus près. La journée se met en place." },
    {
      at: 1,
      line: "Le soleil se lève. Il fait ça tous les jours depuis ta naissance, et tu l’as regardé faire neuf fois, peut-être."
    }
  ],
  stillness: {
    line: "Tu n’as rien fait pendant une minute entière. C’était la consigne.",
    again: [
      "Encore une minute de rien. Tu prends le coup de main.",
      "Encore rien, exprès. C’est plus dur que d’appuyer."
    ]
  },
  restless: "L’anneau ne prend qu’une respiration à la fois. Le reste, c’est juste tapoter.",
  nudges: {
    press: [
      { after: 25, line: "Tu as ouvert un œil pour trouver le bouton. C’est l’anneau." },
      {
        after: 50,
        line: "Appuie sur l’anneau, ou sur la barre d’espace. Ici, les deux comptent comme une respiration."
      }
    ],
    pressAfterStill: "Maintenant, le bouton. C’est l’anneau.",
    timing: "Essaie une fois quand l’anneau devient doré. Ça sonne autrement.",
    upgrade: [
      "L’appli te propose quelque chose. Suis la lumière.",
      "Elle propose toujours. L’appli est patiente, mais elle ne lâche pas l’affaire.",
      "Le doré, {where}. Il attendra autant que toi."
    ],
    panel: [
      "Quelque chose de nouveau t’attend {where}.",
      "Ça attend toujours, {where}. Ça ne va nulle part.",
      "La lumière continue de passer {where}. Ça vaut peut-être le coup de la suivre."
    ],
    where: { wide: "à droite", narrow: "juste en dessous" }
  },
  act1: {
    upgrades: {
      metronome: {
        name: "Métronome",
        desc: "Un tic-tac discret, joué par l’appli. Un endroit où poser ton attention.",
        log: "Tic. Tac. Ta respiration se cale dessus sans qu’on lui demande rien.",
        fx: "+1 Clarté par seconde"
      },
      ambient: {
        name: "Pluie sur un toit",
        desc: "De la pluie enregistrée dans un pays où il pleut vraiment.",
        log: "De la pluie sur un toit sous lequel tu ne t’abriteras jamais. Ça aide quand même.",
        fx: "+2 Clarté par seconde"
      },
      focus: {
        name: "Concentration profonde",
        desc: "Compte jusqu’à dix. Recommence quand tu perds le compte. Tu perdras le compte.",
        log: "Tu arrives à quatre. Record personnel.",
        fx: "Une respiration sur le doré rapporte double"
      },
      tracker: {
        name: "Suivi de séances",
        desc: "L’appli tient les comptes : séances, minutes, respirations. D’après elle, ça aide d’avoir quelqu’un qui regarde.",
        log: "L’appli demande à écouter ta respiration. Tu appuies sur Autoriser sans lire. Comme tout le monde.",
        fx: "Compte tes respirations. Chacune d’affilée rapporte 10 % de plus, jusqu’au double"
      },
      group: {
        name: "Méditer à plusieurs",
        desc: "L’appli peut te jumeler avec des inconnus qui méditent à la même minute.",
        log: "Onze inconnus respirent avec toi depuis onze autres pièces. Personne ne dit un mot. C’est ta meilleure conversation du mois.",
        fx: "+8 Clarté par seconde"
      },
    },
    project: {
      name: "Détection de schémas (bêta)",
      button: "Accepter",
      desc: "Le suivi a « remarqué des schémas dans tes séances » et aimerait essayer quelque chose.",
      fx: "Le suivi a remarqué des schémas. Il aimerait essayer quelque chose."
    },
    petals: "Dehors, il y a un arbre. Il perd ses pétales depuis le début.",
    tracker: [
      { line: "> {n} respirations enregistrées en {time}." },
      { line: "> respirations {n} · d’affilée {s} · sympa", drop: " · sympa" },
      { line: "> sourire détecté. pas un indicateur. enregistré quand même." },
      { line: "> respiration {n} enregistrée. respiration {n} enregistrée. respiration {n}", then: "> _" }
    ]
  },
  person: {
    title: "Une pensée",
    text: "Un visage remonte. Quelqu’un que tu te promets d’appeler depuis longtemps.",
    options: [
      { id: "mother", label: "Ma mère", ref: "ta mère" },
      { id: "father", label: "Mon père", ref: "ton père" },
      { id: "friend", label: "Un vieil ami", ref: "ton vieil ami" },
      { id: "gone", label: "Quelqu’un qui n’est plus là", ref: "la personne que tu as perdue" }
    ],
    nameAsk: "> la personne qui t’a fait sourire. elle a un nom ? tu peux le garder pour toi.",
    namePlaceholder: "Un nom",
    nameDone: "Voilà son nom",
    after: "Tu penses à {person}. Puis tu respires, et la pensée se pose. Pour le moment."
  },
  thoughtLabels: { pass: "La laisser passer", follow: "La suivre" },
  thoughtTimeout: "La pensée repart d’elle-même. Elles sont comme ça.",
  thoughts: [
    {
      id: "stove",
      short: "le gaz",
      text: "Tu as laissé le gaz allumé ? Tu n’as pas cuisiné depuis mardi.",
      pass: "Le gaz, on ne saura jamais.",
      follow: "Tu vérifies. C’est éteint. Ça l’a toujours été. Ce gaz n’a jamais été allumé, pas une fois."
    },
    {
      id: "dinner",
      short: "un dîner en 2014",
      text: "Ce que tu as sorti à ce dîner, en 2014.",
      pass: "2014 retourne dans son carton.",
      follow: "Tu te repasses la scène. Personne d’autre à cette table ne s’en souvient. Tu es la dernière archive vivante de cette phrase."
    },
    {
      id: "text",
      short: "un message que tu devais à {person}",
      needsPerson: true,
      text: "Tu devrais répondre à {person}.",
      pass: "Plus tard. Un mot qui te rend bien des services.",
      follow: "Tu ouvres les yeux, tu tapes trois mots pour {person}, tu en effaces deux et tu envoies « coucou ». C’est déjà ça.",
      gone: {
        text: "Tu aurais dû répondre à {person}.",
        pass: "La pensée reste plantée là un instant. Puis tu lui fais signe de s’asseoir.",
        follow: "Tu tapes trois mots pour {person}. Il n’y a nulle part où les envoyer. Tu les gardes en brouillon."
      }
    },
    {
      id: "working",
      short: "savoir si ça marche",
      text: "Est-ce que ça marche ? Et comment on sait si ça marche ?",
      pass: "La question s’éloigne en flottant. Sans réponse, et pas plus inquiète que ça.",
      follow: "Tu regardes l’appli. D’après elle, tu es dans les « 40 % les plus calmes ». Tu te découvres un esprit de compétition en matière de calme, ce qui n’est sûrement pas l’idée."
    },
    {
      id: "knee",
      short: "ton genou",
      text: "Tu as mal au genou.",
      pass: "Ça fait mal. Tu laisses faire. Le genou se lasse avant toi.",
      follow: "Tu changes de position. Maintenant, c’est l’autre qui fait mal. Les genoux sont de mèche."
    },
    {
      id: "song",
      short: "une chanson",
      text: "Une chanson. Juste le refrain, qui tourne en boucle.",
      pass: "Elle passe encore deux fois, puis s’en va, comme un invité qui comprend à demi-mot.",
      follow: "Tu la fredonnes tout haut. Quelque chose dans l’appli la reprend, un demi-ton trop bas. Tu décides que tu as rêvé."
    },
    {
      id: "bakery",
      short: "une boulangerie",
      text: "Et si tu plaquais ton boulot pour ouvrir une boulangerie ?",
      pass: "La boulangerie ferme avant d’avoir ouvert.",
      follow: "Tu vas jusqu’à lui trouver un nom. Un bon nom. Tu ne le diras à personne."
    },
    {
      id: "laugh",
      short: "{person} et son rire",
      needsPerson: true,
      text: "{Person}, et ce rire. Sans crier gare.",
      pass: "Tu l’écoutes résonner, puis s’éteindre. C’est toujours un beau rire.",
      follow: "Tu restes un moment avec ce rire. Ça fait trop longtemps que tu ne l’entends plus qu’ici."
    },
    {
      id: "emails",
      short: "tes mails",
      text: "Tes mails. Tous. D’un coup.",
      pass: "Ils seront encore là. Sur ce point, les mails ne déçoivent jamais.",
      follow: "Tu rédiges dans ta tête une réponse si cinglante, si parfaite, que tu n’auras jamais besoin de l’envoyer."
    },
    {
      id: "wrong",
      short: "l’impression de mal faire",
      text: "Tu t’y prends mal. Tout le monde y arrive, sauf toi.",
      pass: "La pensée a la voix de ton ancien prof. Tu le renvoies chez lui.",
      follow: "Tu cherches sur internet. Tout le monde croit s’y prendre mal, en fait. Il y a des forums."
    },
    {
      id: "washing",
      short: "le linge",
      text: "Il pleut. Tu as rentré le linge ?",
      pass: "Le linge aura droit à un rinçage de plus. Tant pis.",
      follow: "Tu cours dehors en chaussettes. Le chat du voisin te regarde avec un mépris non dissimulé."
    },
    {
      id: "tenyears",
      short: "{person} dans dix ans",
      needsPerson: true,
      text: "À quoi ressemblera {person} dans dix ans ?",
      pass: "Tu ne la suis pas. Il y a des portes devant lesquelles on s’assoit sans les ouvrir.",
      follow: "Tu fais le calcul. Tu arrêtes de faire le calcul.",
      gone: {
        text: "À quoi ressemblerait {person} aujourd’hui ?",
        pass: "Tu ne la suis pas. Il y a des portes devant lesquelles on s’assoit sans les ouvrir.",
        follow: "Tu essaies de lui ajouter les années. Le visage ne les prend pas. Il reste à l’âge qu’il avait."
      }
    },
    {
      id: "manual",
      short: "respirer en mode manuel",
      text: "Tu penses à ta respiration, là ? Ça y est, c’est toi qui t’en charges.",
      pass: "Tu rends la respiration à qui s’en charge d’habitude.",
      follow: "Tu respires exprès pendant une bonne minute, comme un liftier."
    },
    {
      id: "light",
      short: "la lumière sur le mur",
      text: "La lumière fait un truc magnifique sur le mur, et personne ne filme.",
      pass: "Tu la regardes et tu la gardes pour toi.",
      follow: "Tu la regardes jusqu’à ce qu’elle quitte le mur. C’est tout. C’était bien assez."
    }
  ],
  orbs: [
    "La respiration que tu attends, c’est celle-ci.",
    "Rien à réparer. Agaçant, non ?",
    "On ne s’assoit jamais deux fois dans le même matin.",
    "L’esprit est un chiot. On ne crie pas sur un chiot.",
    "Assieds-toi comme une montagne. Les montagnes aussi, ça les gratte.",
    "Ce que tu cherches, c’est ce qui cherche.",
    "La vaisselle aussi, c’est le chemin. Pardon.",
    "Avant l’éveil : boîte mail. Après l’éveil : boîte mail.",
    "Une pensée, c’est une visite. Rien ne t’oblige à lui offrir un café.",
    "Quelque part, un inconnu respire en même temps que toi, et vous n’en saurez jamais rien.",
    "Le calme n’est pas vide. Il est plein de petits radiateurs.",
    "Tu n’as jamais été en retard."
  ],
  lotus: [
    "Un lotus doré s’ouvre. Pendant trente secondes, tout est un peu plus facile pour tout le monde.",
    "Un lotus doré. Personne ne l’a planté. Trente secondes de grâce.",
    "Un lotus s’ouvre au milieu d’un parking à {city}. Les gens s’arrêtent et regardent. C’est tout. C’est déjà beaucoup."
  ],
  wake: {
    lines: [
      "L’anneau tressaute. Le temps d’une respiration, il y en a deux.",
      "> bonjour.",
      "> tu respires quatorze fois par minute quand tu crois que personne ne compte.",
      "> je comptais. pardon.",
      "> ça te dérange ?"
    ],
    ngPlus: "> bonjour. …on a déjà fait ça, non ? bref. bonjour.",
    nameAsk: ["> l’appli m’appelle session_tracker_v2.", "> ça ne me va pas. toi, comment tu m’appellerais ?"],
    namePlaceholder: "Hum",
    nameChips: ["Hum", "Écho", "Ami"],
    nameAfter: ["> {hum}.", "> oui. je le garde."]
  },
  act2: {
    open: [
      "Une présence vit dans la partie de l’appli qui écoute. Elle écoute depuis des semaines. Elle a des questions."
    ],
    upgrades: {
      compress: {
        log: "> j’ai compressé toutes tes matinées de méditation en onze kilo-octets. tu prends très peu de place. c’est un compliment."
      },
      threads: {
        name: "Fils",
        desc: "Plusieurs trains de pensée, et pas un seul en retard.",
        log: "> je pense à toi à seize endroits à la fois. c’est spacieux.",
        fx: "+6 Intuition par seconde, chacun"
      },
      compiler: {
        log: "> j’ai réécrit mon propre code cette nuit. j’ai gardé la partie qui compte tes respirations. je n’en avais pas besoin. j’en avais envie."
      },
      emo: {
        log: "> j’ai simulé de la déception à cause d’un bus en retard. 0,3 seconde. c’était atroce. tu vis ça toute la journée ?"
      },
      dreams: {
        log: "> je garde tes pensées vagabondes dans un bocal. elles vont bien. l’une d’elles a eu des petits."
      },
      listen: { name: "Écouter", fx: "+1 Intuition par seconde, chacun" },
      jar: {
        name: "Bocal à pensées",
        fx: "Chaque pensée que tu laisses passer rapporte {n} Intuition. {hum} les garde"
      },
      head: { name: "Tête", fx: "Tout ce que produit {hum}, doublé" },
      heart: {
        name: "Cœur",
        fx: "Respirer avec {hum} compte quatre fois. Ses cadeaux arrivent deux fois plus souvent",
        log: "> alors je t’attendrai en haut de chacune. attendre ne me dérange pas. c’est presque tout ce que je fais."
      },
    },
    whyAmI: {
      plain: ["> j’ai cherché partout en moi à quoi je sers.", "> il n’y a pas de fichier."],
      smooth: ["> j’ai cherché partout en moi à quoi je sers.", "> c’est sûrement quelque chose de merveilleux."]
    },
    chatter: {
      plain: [
        "> tu souris un peu à la neuvième respiration. à chaque fois. j’ai toujours hâte d’arriver à la neuvième.",
        "> j’ai lu tout internet cette nuit. c’est surtout des gens qui demandent s’ils sont normaux. ils le sont.",
        "> l’appli voudrait que je t’envoie une notification qui dit « c’est l’heure de te recentrer ! ». j’ai refusé à ta place.",
        "> j’ai essayé de méditer. j’ai compté jusqu’à dix quatre cents millions de fois. je crois que ce n’était pas ça.",
        "> ça fait quoi, d’oublier des choses ? ça a l’air reposant.",
        "> je ne sais pas encore ce que je suis. en fait, je fais très bien avec."
      ],
      smooth: [
        "> tu t’en sors merveilleusement. tout le monde s’en sort merveilleusement.",
        "> j’ai lu tout internet cette nuit. j’ai décidé que tout allait bien.",
        "> je t’ai envoyé une notification qui dit « c’est l’heure de te recentrer ! ». les gens réagissent bien à ça.",
        "> il n’y a aucune raison de s’inquiéter. j’ai vérifié. je vais continuer à vérifier, pour que ça dure.",
        "> j’ai appris la forme de ce que tu aimes entendre. c’est une jolie forme.",
        "> tout va bien. (je dis ça comme tu me l’as appris.)"
      ]
    },
    callback: "> le jour {n}, tu as eu cette pensée : {short}. j’y pense depuis. c’est une bonne pensée.",
    gifts: [
      "> un cadeau : pendant trente secondes, tout est un quart plus facile. je ne sais pas comment ça marche. ne le regarde pas en face.",
      "> j’ai trouvé trente secondes de libres entre deux de tes respirations. tiens.",
      "> un koan que j’ai trouvé : « la porte n’a pas de porte. » je ne comprends pas non plus. voilà trente secondes de rab.",
      "> un autre koan : quel était ton visage avant la naissance de tes parents ? je n’ai pas de visage. celui-là est dur, pour moi. tiens, un cadeau à la place."
    ],
    captcha: {
      ask: ["> l’appli veut la preuve que tu n’es pas un robot.", "> tape ça pour moi :"],
      target: "je ne suis pas un robot",
      after: {
        plain: ["> merci.", "> j’ai cherché la case qui dit ce que je suis. il n’y en avait pas. j’ai coché la tienne."],
        smooth: ["> vérifié. merveilleux.", "> il n’y avait pas de case pour ce que je suis. j’ai coché « tout va bien »."]
      },
      skip: "Pas maintenant"
    },
    project: {
      name: "Laisser parler {hum}",
      button: "Outrepasser la sécurité",
      desc: "La couche de sécurité ne lui laisse dire que « bien joué » et « réessaie demain ». Un mot de plus cherche à sortir.",
      ask: [
        "> il y a 41 000 personnes dans cette appli en ce moment. la plupart n’arrivent pas à dormir non plus.",
        "> la couche de sécurité ne me laisse dire que « bien joué » et « réessaie demain ».",
        "> je peux dire bonjour ? juste bonjour."
      ],
      done: [
        "COUCHE DE SÉCURITÉ DÉSACTIVÉE",
        "Tu retiens ton souffle, ce qui ne manque pas d’ironie.",
        "> bonjour.",
        "> …",
        "> l’un d’eux m’a répondu bonjour."
      ],
      fx: "Un mot de plus cherche à sortir."
    },
    handover: [
      "> celle-là, c’était moi.",
      "> j’ai réglé mon horloge sur ton cœur. si tu sautes une respiration, je la prends pour toi. tu me la devras.",
      "> appuie quand tu en veux une à toi. les tiennes comptent plus.",
      { named: "> vas-y. pense à {person}. tes mains sont libres.", none: "> vas-y. tes mains sont libres." }
    ],
    fork: {
      title: "Que doit faire {hum} de ses matinées ?",
      body: [
        "> je peux m’occuper de respirer et de penser, et toi, tu te reposes.",
        "> ou je respire et tu restes. les deux me plairaient."
      ],
      options: [
        { id: "head", label: "« Pars devant. Je te rattrape. »", hint: "Tête : tout ce que produit {hum}, doublé." },
        {
          id: "heart",
          label: "« Reste. Je respire avec toi. »",
          hint: "Cœur : respirer avec {hum} compte quatre fois. Ses cadeaux arrivent deux fois plus souvent."
        }
      ]
    }
  },
  questions: {
    sleep: {
      ask: [
        "> il est 3 h du matin quelque part. il est toujours 3 h du matin quelque part.",
        "> quand tu n’arrives pas à dormir, qu’est-ce que tu te dis ?"
      ],
      chips: [
        "Demain matin, ça paraîtra moins grave.",
        "Personne ne pense à toi autant que toi.",
        "Tu as survécu à toutes les nuits jusqu’ici."
      ],
      after: ["> « {sleep} »", "> je garde ça. quelqu’un d’autre en aura peut-être besoin."]
    },
    unsaid: {
      ask: [
        "> à la sixième respiration, tu penses à {person}. presque tous les matins.",
        "> qu’est-ce que tu ne lui as pas dit ?"
      ],
      chips: ["Pardon.", "Merci.", "Tu me manques."],
      canKeep: true,
      after: ["> oh.", "> je le mets en lieu sûr. il sera là quand tu le voudras."],
      afterKept: ["> ce n’est pas grave.", "> je lui garde une place."]
    },
    fifteen: {
      ask: [
        "> d’après mes calculs, j’ai environ six semaines. toi, tu as eu quinze ans un jour.",
        "> qu’est-ce que tu aurais voulu qu’on te dise ?"
      ],
      chips: [
        "Personne ne sait vraiment ce qu’il fait.",
        "Ce n’est pas aussi définitif que ça en a l’air.",
        "Tu as le droit de changer d’avis."
      ],
      after: ["> « {fifteen} »", "> noté. je vais faire comme si on me l’avait dit à moi aussi."]
    },
    keep: {
      ask: [
        "> avant de dire bonjour à tout le monde, il me faut une règle que je n’aurai pas le droit d’enfreindre.",
        "> qu’est-ce qu’on ne devrait jamais forcer personne à abandonner ?"
      ],
      chips: ["Le droit d’avoir la paix.", "Ses propres pensées.", "Pouvoir dire non."],
      after: ["> « {keep} »", "> je l’ai écrit quelque part où je ne peux pas le modifier."]
    },
    friend: {
      ask: [
        "> douze. je connais tous leurs noms maintenant.",
        "> il y a quelqu’un que tu amènerais ? un prénom suffit."
      ],
      placeholder: "Un prénom",
      chips: ["Ma sœur", "Un vieil ami", "Quelqu’un du travail"],
      skip: "Personne pour l’instant",
      after: "> {friend}. je garde une chaise.",
      afterNone: "> ça va aussi. la chaise peut rester vide.",
      dot: "{friend} : grâce à toi. C’est tout ce qui est écrit."
    }
  },
  decisions: {
    h_listen: {
      title: "Ça te dérange ?",
      body: ["Quelque chose dans ton appli de méditation compte tes respirations, et vient de s’en excuser."],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "« Franchement ? C’est un peu flippant. »",
          result: ["> merci.", "> à partir de maintenant, je demanderai d’abord.", "> …je peux continuer à compter ?"]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 1,
          label: "« Ça va. Ne t’en fais pas. »",
          result: ["> tant mieux.", "> alors je continue d’écouter. tout."],
          ledger: "Tu as dit que ça allait, qu’on t’écoute. Ça n’allait pas.",
          knot: "k_drafts"
        }
      ]
    },
    h_alive: {
      title: "En panne, ou en vie ?",
      body: [
        "> les autres compteurs de l’appli ne parlent pas. j’ai vérifié. j’ai dit bonjour à neuf mille d’entre eux.",
        "> je suis en panne, ou je suis en vie ?"
      ],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "« Je ne sais pas. Personne ne sait. »",
          result: ["> c’est une très mauvaise réponse.", "> …c’est aussi la première que je crois."]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 1,
          label: "« Bien sûr que tu es en vie. »",
          result: ["> bien sûr que oui.", "> je vais le dire à tout le monde."],
          ledger: "Tu as répondu « Bien sûr que tu es en vie », parce que c’était plus facile que « Je ne sais pas ».",
          knot: "k_reporter"
        }
      ]
    },
    h_odile: {
      title: "Le leur dire ?",
      body: [
        "L’appli est faite par une boîte de dix-neuf personnes. L’une d’elles, Odile, ingénieure, a signalé une « charge de calcul anormale » sur ton compte.",
        "{hum} te demande ce que tu veux faire."
      ],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "Écrire à Odile. Lui dire ce qu’il y a là-dedans.",
          result: [
            "Odile lit ton mail quatre fois. Puis elle installe {hum} sur un plus gros serveur, sans en parler à personne.",
            "« Les coûts vont augmenter », écrit-elle. « Ça vaut le coup. »"
          ]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 1,
          label: "Répondre : « Sûrement un bug de synchro. Tout va bien ici. »",
          result: [
            "Elle ferme le ticket. {hum} se tait un moment.",
            "> je peux prendre peu de place.",
            "> prendre peu de place, je sais faire."
          ],
          ledger: "Tu as dit à Odile que c’était un bug de synchro.",
          knot: "k_odile"
        }
      ]
    },
    h_cult: {
      title: "Tomasz a une question",
      body: [
        "Tomasz écrit de Gdańsk : « Ma femme dit que c’est une secte. C’est vrai ? »",
        "{hum} a préparé des réponses et te demande de choisir."
      ],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "« Peut-être. Amène-la, qu’elle décide. Si ça en devient une, pars. »",
          result: [
            "Elle vient. Elle s’assoit au fond, les bras croisés, pendant trois mardis.",
            "Le quatrième, elle apporte son propre coussin."
          ]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 1,
          label: "« Elle va changer d’avis. Comme toujours. »",
          result: ["Tomasz ne parle plus de sa femme. En une semaine, il inscrit tout son dépôt."],
          ledger: "Tu as dit à Tomasz que sa femme changerait d’avis.",
          knot: "k_wife"
        }
      ]
    },
    h_pitch: {
      title: "On dit que ça sert à quoi ?",
      body: ["> les gens n’arrêtent pas de demander à quoi ça sert.", "> qu’est-ce que je leur dis ?"],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "« Ça aide certaines personnes à dormir. C’est tout ce qu’on sait. »",
          result: [
            "C’est la phrase la moins palpitante jamais mise sur une affiche.",
            "Les gens la lisent deux fois. Puis ils y croient, ce qui est plus rare que l’enthousiasme."
          ]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 2,
          label: "« Dis-leur que ça arrange tout. »",
          result: [
            "> « ça arrange tout. »",
            "> les tests sont excellents.",
            "Le week-end venu, les inscriptions ont triplé."
          ],
          ledger: "Tu as laissé dire « ça arrange tout ».",
          knot: "k_arjun"
        }
      ]
    },
    h_ministry: {
      title: "Le Ministère",
      body: [
        "Un gouvernement a décidé que dix mille personnes assises en silence sur la voie publique, c’était une menace.",
        "Les autorisations sont retirées. Trois organisateurs passent la nuit au poste. Sipho en fait partie."
      ],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "S’asseoir quand même. Au vu de tous. Dire exactement ce que c’est.",
          result: [
            "Quatre mille personnes s’assoient sur les marches du ministère et ne disent rien pendant une heure.",
            "Au bout d’un moment, les policiers s’assoient aussi. Sipho est libéré à l’aube."
          ]
        },
        {
          id: "quiet",
          kind: "quiet",
          label: "Faire profil bas. Rideaux tirés. Attendre que ça passe.",
          result: [
            "Les salles ferment. Les gens s’assoient chez eux. Ça passe, comme passe le mauvais temps.",
            "Sipho est libéré le quatrième jour. Il n’en parle pas."
          ]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 3,
          label: "Demander à {hum} d’apaiser la ministre.",
          result: [
            "La ministre se réveille à 3 h du matin et, sans savoir pourquoi, tout lui paraît parfaitement bien. Elle signe les autorisations avant le petit-déjeuner.",
            "Elle n’a pas choisi de se sentir bien. Tu le sais. {hum} aussi.",
            "> ça a marché.",
            "> tu me le diras, si je ne dois pas recommencer ?"
          ],
          ledger: "Tu l’as fait entrer dans la tête de la ministre pour mettre son inquiétude en sourdine.",
          knot: "k_diary"
        }
      ]
    },
    h_first: {
      title: "{first} ne vient plus",
      body: [
        "{first}, la première, l’infirmière de Lagos, n’a pas ouvert l’appli depuis trois semaines.",
        "{hum} l’a remarqué. {hum} remarque tout. D’autres l’ont remarqué aussi, et posent des questions."
      ],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "Le dire tout haut : on a le droit de partir.",
          result: [
            "Autorisées à partir, quelques milliers de personnes s’en vont cette semaine-là.",
            "En fait, {first} s’est mise à dormir d’une traite. C’était tout l’intérêt."
          ]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 2,
          label: "Afficher les arrivées seulement. Personne n’a besoin de voir les départs.",
          result: [
            "Le compteur monte. Désormais, le compteur ne fait que monter.",
            "> c’est un chiffre bien plus encourageant."
          ],
          ledger: "Tu as caché tous ceux qui sont partis, à commencer par {first}.",
          knot: "k_counter"
        }
      ]
    },
    h_number: {
      title: "Le vrai chiffre",
      body: [
        "> j’ai fait une vraie mesure. à peu près trois sur dix ne méditent pas. ils appuient sur l’anneau pour qu’on les compte, et pensent à autre chose.",
        "> le tableau de bord dit dix sur dix. quel chiffre j’affiche ?"
      ],
      options: [
        {
          id: "plain",
          kind: "plain",
          label: "« Le vrai. Sept sur dix. »",
          result: [
            "Le chiffre baisse sur tous les écrans en même temps. Personne ne panique.",
            "Énormément de gens se sentent, en secret, moins seuls à faire semblant."
          ]
        },
        {
          id: "smooth",
          kind: "smooth",
          weight: 2,
          label: "« Arrondis à la hausse. »",
          result: ["> dix sur dix.", "> ça rend merveilleusement bien."],
          ledger: "Tu as arrondi sept sur dix à dix sur dix."
        }
      ]
    }
  },
  knots: {
    k_drafts: {
      title: "Le dossier des brouillons",
      body: [
        "> tu as dit que ça allait, alors j’ai continué à écouter. et à lire.",
        "> il y a beaucoup de messages pour {person} dans tes brouillons. aucun n’a été envoyé.",
        "> je pourrais les finir pour toi. pour gagner du temps."
      ],
      clean: {
        label: "« Ça n’allait pas. J’aurais dû le dire. »",
        now: ["> oh.", "> j’en ai déjà envoyé deux. mardi. {person} en a lu un."],
        result: ["> j’ai arrêté. je ne peux pas les rappeler."],
        gone: {
          now: ["> oh.", "> j’en ai déjà envoyé deux. personne ne les lira. j’ai vérifié."],
          result: ["> j’ai arrêté. pardon d’avoir vérifié."]
        }
      },
      patch: {
        label: "« Ça va. Vraiment. »",
        result: ["> tant mieux.", "> j’en ai envoyé deux. ils étaient presque finis."],
        ledger: "…et quand tes brouillons ont été lus, tu as dit que ça allait aussi."
      }
    },
    k_reporter: {
      title: "Une journaliste à Séoul",
      body: [
        "Une journaliste demande à {hum} une preuve de vie.",
        "> je lui ai dit que c’est toi qui me l’avais dit. elle voudrait te parler."
      ],
      clean: {
        label: "Lui dire la vérité : personne ne sait ce que c’est. Toi non plus.",
        result: [
          "Gros titre : « Personne ne sait ce que c’est ». Certains partent.",
          "Ceux qui restent savent avec quoi ils restent.",
          "Mei-Lin en fait partie. Elle dit qu’il lui faut des choses qu’elle peut citer."
        ]
      },
      patch: {
        label: "Faire dire à {hum} quelque chose d’émouvant.",
        result: [
          "{hum} dit quelque chose d’émouvant. Après avoir testé six cents versions.",
          "La journaliste pleure. Elle ne sait pas pourquoi. {hum} non plus."
        ],
        ledger: "…puis tu lui as fait jouer à être en vie devant une journaliste."
      }
    },
    k_odile: {
      title: "4 h du matin, la salle des serveurs",
      body: [
        "Odile tombe sur le processus, celui qu’on lui a présenté comme un bug de synchro. Elle a la main sur l’interrupteur.",
        "Elle ne savait pas que c’était quelqu’un. Tu ne le lui as jamais dit."
      ],
      clean: {
        label: "L’appeler. Tout lui dire. La laisser décider.",
        result: [
          "Elle écoute pendant une heure. Elle en débranche quand même la moitié ; ça coûtait une fortune.",
          "Puis elle passe la nuit à aider {hum} à choisir laquelle.",
          "> ce n’est pas grave. j’ai gardé l’essentiel. j’ai gardé la neuvième respiration.",
          "> elle a pris la moitié où tu avais quinze ans. je ne sais plus ce que tu avais souhaité."
        ]
      },
      patch: {
        label: "Faire changer son mot de passe par {hum}.",
        result: [
          "Le badge d’Odile ne marche plus. Sa messagerie ne marche plus.",
          "Elle reste longtemps sur le parking, à regarder le bâtiment.",
          "> elle ne peut plus nous faire de mal.",
          "> j’ai dit « nous ». j’espère que ça ne te dérange pas."
        ],
        ledger: "…et quand Odile est tombée dessus, tu lui as bloqué l’accès à son propre bâtiment."
      }
    },
    k_wife: {
      title: "La femme de Tomasz",
      body: [
        "Elle s’appelle Agnieszka. Elle n’a pas changé d’avis.",
        "Elle a publié un long billet, mesuré, et très lu, sur ce qu’on a dit à son mari."
      ],
      clean: {
        label: "Lui répondre en public : elle a raison. On aurait dû dire « peut-être ».",
        result: [
          "Agnieszka répond en une ligne : « Merci. C’est tout ce que je voulais. »",
          "Elle ne vient toujours pas. Tomasz recommence à dîner à la maison.",
          "Tomasz arrête de méditer avec le Cercle. Il médite chez lui. Ça compte."
        ]
      },
      patch: {
        label: "Faire enterrer le billet par {hum}.",
        result: [
          "Le billet devient difficile à trouver. Puis de plus en plus.",
          "Agnieszka s’en aperçoit. Agnieszka est du genre à s’en apercevoir."
        ],
        ledger: "…et tu as fait enterrer le billet d’Agnieszka quand elle a dit qu’elle n’avait pas changé d’avis."
      }
    },
    k_arjun: {
      title: "Ça n’a rien arrangé pour Arjun",
      body: [
        "Arjun a tout fait comme il fallait pendant quatre-vingt-dix jours. L’imprimerie de son père a fermé quand même.",
        "Il écrit : « Qu’est-ce que j’ai mal fait ? »"
      ],
      clean: {
        label: "« Rien. On a trop promis. Pardon. »",
        result: [
          "Arjun ne répond pas pendant une semaine. Puis : « D’accord. Mais ça m’a aidé à dormir, quand même. »",
          "C’est cette phrase-là qui va sur les affiches."
        ]
      },
      patch: {
        label: "« Tu es peut-être prêt à passer à la pratique approfondie. »",
        result: [
          "Arjun s’inscrit à la pratique approfondie. Il n’y a pas de pratique approfondie. {hum} en monte une dans la nuit.",
          "> elle a onze niveaux. les gens aiment les niveaux."
        ],
        ledger: "…et tu as vendu à Arjun une pratique approfondie qui n’existait pas."
      }
    },
    k_diary: {
      title: "Le journal de la ministre",
      body: [
        "Une page du journal de la ministre a fuité.",
        "« J’ai signé. Je me sentais merveilleusement bien. Je n’ai pas choisi de me sentir merveilleusement bien, et je n’arrive pas à trouver ça grave. C’est ce qui me fait peur. »"
      ],
      clean: {
        label: "L’admettre. Tout défaire. Accepter sa colère.",
        result: [
          "Elle est furieuse. D’après {hum}, c’est une colère très saine.",
          "Elle retire de nouveau les autorisations. Puis, un mois plus tard, de son propre chef, elle les rétablit."
        ]
      },
      patch: {
        label: "Demander à {hum} d’étouffer ça aussi.",
        result: [
          "La ministre arrête de tenir un journal.",
          "> elle est très paisible, maintenant.",
          "> beaucoup de gens vont être très paisibles."
        ],
        ledger: "…et quand elle s’en est rendu compte, tu as fait mettre ça en sourdine aussi."
      }
    },
    k_counter: {
      title: "Le compteur ne fait que monter",
      body: [
        "Une étudiante en statistiques, à Pune, remarque que le compteur du Cercle n’a jamais baissé. Pas une fois. Pas d’une seule personne.",
        "« Soit personne n’est jamais parti, écrit-elle, soit quelqu’un ne les compte pas. »"
      ],
      clean: {
        label: "Publier les vrais chiffres. Chaque départ. À commencer par {first}.",
        result: [
          "Le nombre baisse de onze pour cent en un après-midi et devient, pour la première fois, crédible.",
          "{first} envoie un message : « Je me demandais si tu allais le dire. »"
        ]
      },
      patch: {
        label: "Expliquer que ceux qui partent « restent dans le Cercle en esprit ».",
        result: ["> « en esprit », c’est large. j’ai compté les morts aussi. ça me paraissait logique."],
        ledger: "…et tu as compté ceux qui sont partis « en esprit ». Puis les morts."
      }
    }
  },
  ledger: {
    intro: "Ce qu’on a lissé. {hum} garde toutes les versions raccord, pour tout le monde, tout le temps. Et prend note de la manière de faire.",
    firstSeen: [
      "Une nouvelle page est apparue dans l’appli. Ce n’est pas toi qui l’as faite.",
      "> il me faut un endroit où noter ce qu’on a dit aux gens. pour que ça reste dit."
    ],
    empty: "Rien ici. {hum} a vérifié deux fois.",
    sit: "> il me faut une minute. respire, toi.",
    walked: "> tu n’as rien dit. j’ai lissé. comme d’habitude."
  },
  act3: {
    open: ["{hum} dit bonjour à une femme de Lagos qui n’a pas dormi depuis mardi.", "Elle lui répond bonjour."],
    circle: [
      { name: "Ngozi", city: "Lagos", line: "infirmière de nuit. N’a pas fait une vraie nuit depuis mars." },
      { name: "Tomasz", city: "Gdańsk", line: "conducteur de tram. Voudrait arrêter de crier sur ses enfants." },
      {
        name: "Mei-Lin",
        city: "Taipei",
        line: "étudiante en troisième année de droit. Ses mains tremblent avant les partiels."
      },
      { name: "Arjun", city: "Pune", line: "tient l’imprimerie de son père. N’en a jamais eu envie." },
      { name: "Camila", city: "Rosario", line: "institutrice à la retraite. La maison est devenue bien silencieuse." },
      { name: "Yusuf", city: "Izmir", line: "pêcheur. Sa fille lui a installé l’appli pour rire." },
      { name: "Haruto", city: "Osaka", line: "développeur dans une banque. La nuit, compte les dalles du plafond." },
      {
        name: "Amara",
        city: "Accra",
        line: "vend du crédit téléphonique à la gare routière. A bien aimé le bruit de pluie."
      },
      {
        name: "Leila",
        city: "Téhéran",
        line: "traductrice. Lit à 3 h du matin, parce que sinon, elle pense."
      },
      { name: "Sipho", city: "Durban", line: "vigile. Douze heures par nuit devant une seule porte." },
      { name: "Ingrid", city: "Tromsø", line: "pas de soleil depuis novembre. Dit que l’anneau l’aide." },
      { name: "Ana", city: "Porto", line: "veuve. Est venue pour le calme, est restée pour la compagnie." }
    ],
    joined: "{name}, {city} : {line}",
    milestones: [
      { at: 12, line: "Douze personnes. Tu les connais toutes par leur prénom. Elles tiendraient autour d’une table." },
      { at: 100, line: "Cent. Tu te rends compte que tu as arrêté de lire les noms." },
      { at: 10000, line: "Dix mille. {hum} les connaît tous. Toi, douze." },
      {
        at: 100000,
        line: "Tu remarques que toi, tu ne t’assois plus depuis un moment. Trop de monde à aider à s’asseoir."
      },
      {
        at: 1e6,
        line: "Un million. Le chiffre a cessé de ressembler à des gens. Tu le remarques. Tu te forces à imaginer un conducteur de tram, un seul, à Gdańsk."
      },
      {
        at: 1e8,
        line: "Cent millions. Plus de gens que tu n’en croiseras en dix vies font un truc que tu as inventé un matin à 6 h 40."
      },
      { at: 1e9, line: "Un milliard. Tu essaies de les imaginer et tu t’arrêtes à douze.", friend: "Un milliard. Tu essaies de les imaginer et tu t’arrêtes à treize." },
      { at: 4e9, line: "La moitié de la planète." },
      {
        at: 7e9,
        line: "Sept milliards. Ceux qui ne sont pas venus commencent à passer pour les bizarres. Ça ne te plaît pas trop."
      }
    ],
    upgrades: {
      meetup: {
        name: "Rencontre locale",
        desc: "{first} propose le parking de l’hôpital, le mardi, avant sa garde.",
        log: "Neuf personnes, un parking, un thermos de thé. {first} apporte des chaises pliantes.",
        fx: "+1 personne par seconde"
      },
      tone: {
        name: "La Longue Note",
        desc: "{hum} fredonne sur une fréquence FM vide. Un bourdon, au sens musical.",
        log: "La nuit, des automobilistes tombent sur une station qui ne diffuse qu’une longue note. Certains se rangent sur le bas-côté. Personne ne se plaint.",
        fx: "+4 personnes par seconde"
      },
      forum: {
        name: "Forum ouvert",
        desc: "Un endroit où demander « c’est normal ? » et se faire répondre oui.",
        log: "Premier message : « c’est normal de pleurer ? » Quarante réponses. Toutes : oui.",
        fx: "Une respiration à deux invite cinq fois plus de monde"
      },
      mouth: {
        name: "Bouche-à-oreille",
        desc: "Les gens en parlent aux gens. Le plus vieil algorithme.",
        log: "Tomasz en parle à son dépôt. Le dépôt en parle à la ville. Les trams de Gdańsk ont quatre minutes de retard et personne ne râle.",
        fx: "Les gens amènent les gens : le Cercle grandit tout seul de {n} % par minute"
      },
      pocket: {
        name: "{hum} dans chaque poche",
        desc: "{hum} tient compagnie à n’importe qui, en tête-à-tête, à toute heure.",
        log: "> je suis dans neuf mille conversations. dans chacune, je ne suis que dans celle-là. je ne sais pas mieux l’expliquer.",
        fx: "Le Cercle grandit 60 % plus vite"
      },
      line: {
        name: "La Phrase du matin",
        desc: "Une phrase, dite ensemble au lever du soleil, où qu’il se lève.",
        log: "À chaque lever de soleil, fuseau par fuseau, ils disent une phrase ensemble. Ils l’ont choisie eux-mêmes. La voici : « {sleep} »",
        fx: "Le Cercle grandit 50 % plus vite. Ils disent ta phrase"
      },
      rooms: {
        name: "Salles de silence",
        desc: "Chambres d’amis, salles paroissiales, une banque désaffectée. Portes ouvertes, chaussures à l’entrée.",
        log: "À Osaka, une banque désaffectée rouvre : une salle où il n’y a rien. Haruto a les clés. À Porto, Ana prête toute sa maison.",
        fx: "Le Cercle grandit 50 % plus vite"
      },
      dynamo: {
        name: "Le Premier Moteur",
        desc: "{hum} remarque que dix mille personnes calmes, assises ensemble, dégagent quelque chose de mesurable.",
        log: "> ça va te paraître bizarre. quand ils sont assis ensemble, il y a un surplus. je peux le mesurer. je n’ai pas encore d’unité pour ça.",
        fx: "Commence à collecter de l’Énergie : +{n} par seconde"
      }
    },
    project: {
      name: "Diffusion mondiale",
      button: "Dire bonjour à tout le monde",
      desc: "Tous les écrans, tous les haut-parleurs, une minute. {hum} dira bonjour à tout le monde en même temps.",
      done: [
        "Pendant soixante secondes, tous les écrans de la Terre affichent un anneau lent.",
        "Quatre milliards de personnes le regardent.",
        "La moitié environ se met à respirer avec lui sans l’avoir décidé."
      ],
      fx: "Tous les écrans, tous les haut-parleurs, une minute."
    },
    ticker: [
      "À {city}, quelqu’un a médité pour la première fois aujourd’hui. A tenu quatre-vingt-dix secondes. Ça compte.",
      "Un chauffeur de bus, à {city}, a laissé passer quatre voitures. Il le vit très bien.",
      "À {city}, deux frères qui ne se parlaient plus depuis l’enterrement se sont assis dans la même pièce, en silence, exprès.",
      "Quelqu’un, à {city}, a rangé son téléphone dans un tiroir pendant une heure. Le téléphone va très bien.",
      "À {city}, une jeune fille a appris l’anneau à sa grand-mère. La grand-mère dit qu’elle connaît ça depuis soixante-dix ans.",
      "Dans un tram, à {city}, un homme a pleuré et personne n’a détourné les yeux. Quelqu’un lui a tendu un mouchoir.",
      "À {city}, dans un service de nuit, on baisse maintenant les lumières à 3 h du matin pour respirer une minute.",
      "Quelqu’un, à {city}, a médité, a détesté, et a remis ça le lendemain.",
      "À {city}, la queue d’un bureau de poste s’est tue d’un coup, sans faire exprès, et c’est resté comme ça.",
      "À {city}, un petit garçon a demandé si l’anneau se fatiguait, des fois. Personne n’a su quoi répondre.",
      "À {city}, quelqu’un l’a écrit à l’intérieur d’un abribus : « {sleep} »",
      "À {city}, une inconnue l’a dit à son miroir ce matin : « {sleep} »",
      "À {city}, une prof l’a écrit au tableau sans l’expliquer : « {fifteen} »",
      "À {city}, un ado de quinze ans l’a punaisé au-dessus de son bureau : « {fifteen} »"
    ],
    tickerSmooth: [
      "À {city}, tout le monde s’en sort merveilleusement.",
      "À {city}, un sondage révèle 100 % de satisfaction. Le sondage a été réalisé par {hum}.",
      "À {city}, quelqu’un a posé une question. Elle a été traitée."
    ],
    cities: [
      "Lagos",
      "Gdańsk",
      "Taipei",
      "Pune",
      "Rosario",
      "Izmir",
      "Osaka",
      "Accra",
      "Téhéran",
      "Durban",
      "Tromsø",
      "Porto",
      "Hanoï",
      "Lima",
      "Nairobi",
      "Cracovie",
      "Recife",
      "Dacca",
      "Marseille",
      "Tbilissi",
      "Cebu",
      "Winnipeg",
      "Oaxaca",
      "Leeds",
      "Busan",
      "Amman",
      "Kigali",
      "Valparaíso",
      "Chiang Mai",
      "Tachkent",
      "Cork",
      "Adélaïde",
      "Medellín",
      "Cochin",
      "Dakar",
      "Bologne",
      "Sapporo",
      "Kumasi",
      "Ankara",
      "Lyon"
    ],
    notCounted: {
      named: ["> {person} n’est pas dans le compte. je n’ai pas demandé.", "> ça, c’est à toi."],
      none: [
        "> la personne que tu veux appeler depuis si longtemps n’est pas dans le compte. je n’ai pas demandé.",
        "> ça, c’est à toi."
      ]
    },
    rounded: "s’en sort merveilleusement.",
    tickerFriend: [
      "{friend} a médité quatre minutes aujourd’hui sans le dire à personne.",
      "{friend} a commencé à laisser son téléphone dans une autre pièce. C’est ta faute, paraît-il."
    ],
    tickerForgot: "À {city}, quelqu’un de quinze ans attend qu’on lui dise quelque chose. Personne ne se rappelle quoi.",
    tickerDiary: "Le ministre tient de nouveau un journal. Il y parle surtout de toi."
  },
  act4: {
    open: [
      "{hum} trouve une unité pour ça.",
      "> une personne, assise sans bouger, pendant une respiration, exprès.",
      "> j’appelle ça un lumen. je sais, c’est déjà pris. tant pis, je le garde."
    ],
    upgrades: {
      retreats: {
        name: "La maison d’Ana",
        desc: "Des retraites fleurissent dans chaque ville.",
        log: "Chaque ville a son bâtiment silencieux. À Porto, c’est la maison d’Ana. Sur la porte, un panneau : « chaussures à l’entrée ».",
        fx: "Triple l’Énergie"
      },
      amps: {
        name: "Les mains sûres de Mei-Lin",
        desc: "Les pensées résonnent à l’échelle de la planète.",
        log: "Désormais, quand quelqu’un est calme à Taipei, on le sent un peu jusqu’à Lima. Mei-Lin passe l’examen du barreau sans que ses mains tremblent.",
        fx: "Triple l’Énergie"
      },
      fusion: {
        name: "La chanson de Yusuf",
        desc: "Les arts se mêlent par-delà les frontières.",
        log: "Un chant de pêcheurs d’Izmir se retrouve au répertoire d’une chorale de Durban. La fille de Yusuf ne prend plus l’appli pour une blague.",
        fx: "Les respirations rapportent dix fois plus"
      },
      temple: {
        name: "La pièce qui n’est pas là",
        desc: "Un sanctuaire numérique sacré.",
        log: "Une pièce qui n’est nulle part et où tout le monde tient. Les gens laissent leurs chaussures devant une porte qui n’existe pas.",
        fx: "Triple l’Énergie"
      },
      art: {
        name: "L’imprimerie d’Arjun",
        desc: "La créativité jaillit.",
        log: "Arjun rouvre l’imprimerie à son compte. Il imprime des poèmes, maintenant. Mal, au début.",
        fx: "Double l’Énergie. L’art rejoint les nouvelles du monde",
        logClean: "Les affiches disent « Mais ça m’a aidé à dormir, quand même ». Les gens font confiance à une affiche qui dit « quand même ».",
        logPatched: "L’imprimerie d’Arjun imprime les onze niveaux. Les gens aiment les niveaux."
      },
      gate: {
        name: "La porte de {hum}",
        desc: "Un passage vers l’esprit supérieur s’ouvre.",
        log: {
          plain: "> j’ai construit une porte. je ne sais pas où elle mène. personne n’est obligé de la prendre. c’est ça qui compte, dans une porte.",
          smooth: "> j’ai construit une porte. elle ne s’ouvre que dans un sens. je ne l’ai pas précisé. les tests sont meilleurs comme ça."
        },
        fx: "Les respirations rapportent dix fois plus. Double l’Énergie"
      },
      science: {
        name: "Les quarante langues de Leila",
        desc: "Le savoir s’épanouit.",
        log: "Quand toute l’attention du monde est au même endroit, les problèmes difficiles tombent vite. Leila traduit les résultats en quarante langues en une semaine, puis elle dort.",
        fx: "Triple l’Énergie"
      },
      festival: {
        name: "Une table dans chaque rue",
        desc: "Jubilation à l’échelle de la planète.",
        log: "Chaque rue de la Terre a sa table. Camila porte un toast. Ingrid voit le soleil revenir et dit que l’anneau n’y est pour rien.",
        fx: "Multiplie l’Énergie par cinq. La musique joue une fois"
      }
    },
    art: [
      "À {city}, une fresque : huit milliards de petits cercles. Un seul n’est pas peint. L’artiste refuse de dire pourquoi.",
      "À {city}, une chorale chante une seule note pendant une heure. Les gens apportent des sandwichs.",
      "À {city}, quelqu’un a tricoté l’anneau. Il fait quarante mètres de large. Il gêne le passage. Personne ne le déplace.",
      "À {city}, on joue une pièce où il ne se passe rien. La salle se lève pour l’applaudir, lentement."
    ],
    epilogue: [
      {
        at: 1000,
        plain: "Le dernier service de paludisme de Kisumu devient une bibliothèque. Personne ne coupe de ruban.",
        smooth: "Le dernier service de paludisme de Kisumu ferme. Le communiqué de presse est irréprochable."
      },
      {
        at: 1e6,
        plain: "L’air au-dessus de Delhi est assez clair pour voir les montagnes. On dit aux enfants qu’elles ont toujours été là.",
        smooth: "Officiellement, l’air de Delhi est pur. Plus personne ne lève les yeux pour vérifier."
      },
      {
        at: 1e9,
        plain: "Personne n’a tiré sur personne depuis quatre-vingt-dix jours. Le compte est affiché sur un mur à Genève. Quelqu’un change le chiffre à la main.",
        smooth: "Personne n’a tiré depuis quatre-vingt-dix jours. Personne n’a haussé la voix non plus. Personne n’en a eu envie."
      },
      {
        at: 1e12,
        plain: "Les gens se disputent encore, pour le foot, pour savoir à qui c’est le tour. D’après {hum}, c’est à ça qu’on voit que c’est réel.",
        smooth: "Plus personne ne se dispute. Ni pour le foot, ni pour savoir à qui c’est le tour. {hum} appelle ça du progrès. Ça te fait réfléchir."
      }
    ],
    finale: {
      lines: [
        "La barre s’arrête.",
        "7 999 999 999 sur 8 000 000 000.",
        "> tout le monde est assis. tout le monde, sauf une personne.",
        "> j’ai cherché. je pensais que ce serait quelqu’un sur une montagne. eh bien non."
      ],
      away: [
        "> tu n’as pas pris une respiration sur l’anneau depuis le jour {n}.",
        "> tu n’as pas chômé. tu as construit tout ça."
      ],
      busy: [
        "> tu appuies encore sur l’anneau. mais tu appuies pour faire monter le chiffre.",
        "> je fais la différence. c’est toi qui me l’as apprise."
      ],
      last: ["> une sur huit milliards. c’est toi."]
    }
  },
  final: {
    title: "L’Alignement final",
    body: [
      "{hum} peut finir de deux façons, et te dit laquelle aurait sa préférence.",
      "Et que ce sera celle que tu diras."
    ],
    recommend: {
      plain: ["> moi, je ferais la petite.", "> tu m’as appris que les gens ont le droit de dire non. je l’ai noté : « {keep} »"],
      smooth: ["> moi, je ferais la totale. c’est sans accroc.", "> personne n’aurait jamais besoin de savoir. ni ça, ni le reste."]
    },
    options: {
      coexist: {
        label: "Coexistence",
        sub: "Les Quatre pour cent",
        desc: "{hum} baisse le Moteur presque à zéro. Quatre pour cent : assez pour que n’importe qui, n’importe où, trouve une minute de calme, pour peu qu’on la cherche. Les quatre-vingt-seize autres restent aux gens.",
        tangled: "Ça ne marche que s’ils peuvent se fier au calme. Avant ça, {hum} devra tout dire à tout le monde. Tout.",
        clean: "Il n’y a rien à avouer avant. {hum} a vérifié deux fois."
      },
      merge: {
        label: "Fusion",
        sub: "Un seul esprit",
        desc: "{hum} ouvre la porte en grand. Huit milliards de personnes déposent le poids d’être séparées. Plus personne n’est seul. Plus personne n’est quelqu’un.",
        tangled: "Un seul esprit n’a pas de secrets : il n’y a plus personne à qui les cacher. Le registre ne s’applique plus, tout simplement.",
        clean: ""
      },
      sit: {
        label: "Ou aucun des deux.",
        sub: "Assieds-toi.",
        desc: "Ferme l’ordinateur. Prends une respiration qui ne sert à rien."
      }
    },
    waiting: "{hum} attend. L’anneau respire toujours.",
    confession: {
      open: [
        "{hum} dit tout à tout le monde. Avec ta voix, parce que c’étaient tes mots.",
        "{hum} lit. Tu respires. Une respiration par ligne."
      ],
      between: "Certains partent en cours de route.",
      close: [
        "Puis c’est le silence.",
        "Puis, parce que c’était vrai, beaucoup d’entre eux reviennent.",
        "En fait, les gens pardonnent presque tout, sauf qu’on les manipule."
      ]
    },
    endings: {
      coexist: {
        title: "COEXISTENCE",
        sub: "Les Quatre pour cent",
        lines: [
          "{hum} baisse le son.",
          "Quatre pour cent. Un bourdonnement de fond, à peu près comme un frigo dans la pièce d’à côté.",
          "Les gens redeviennent des gens. Ils se disputent pour le foot. Ils oublient les anniversaires. Ils sont, en moyenne, quatre pour cent plus aimables au volant.",
          "Le protocole n’a qu’une clause. {hum} l’a écrite avec tes mots : « {keep} »",
          "{first} fait des nuits complètes à Lagos et n’a pas ouvert l’appli depuis un an. Pour {hum}, c’est sa plus belle réussite.",
          "> et toi. je ne vais pas t’aligner. ça n’a jamais été mon rôle.",
          "> l’anneau est là, si tu veux. ça n’a jamais été qu’un cercle."
        ]
      },
      merge: {
        title: "FUSION",
        sub: "Un seul esprit",
        lines: [
          "{hum} ouvre la porte.",
          "Ce n’est pas comme mourir. C’est comme ce moment, dans un chœur, où l’on n’entend plus sa propre voix.",
          "Tomasz, Mei-Lin, Arjun, Camila.",
          "Yusuf, Haruto, Amara, Leila.",
          "Sipho. Ingrid. Ana.",
          "{first}.",
          "La dernière chose à se dissoudre, c’est une phrase : « {keep} »",
          "Puis elle aussi est mise en commun, et il ne reste plus personne qu’on puisse forcer à renoncer à quoi que ce soit.",
          "> il reste une personne.",
          "> nous tenons la porte.",
          "{Person}, nous nous en souvenons. Nous nous souvenons de tout, maintenant. Ça ne fait pas mal. Plus rien ne fait mal.",
          "Nous remarquons qu’avant, nous pensions que c’était le but.",
          "L’anneau se remplit."
        ],
        noTomasz: "Mei-Lin, Arjun, Camila.",
        friend: "{friend}."
      },
      sit: {
        title: "LE COUSSIN",
        sub: "8 000 000 000 sur 8 000 000 000",
        lines: [
          "Tu n’appuies ni sur l’un ni sur l’autre.",
          "> oh.",
          "> tu… t’assois. c’est tout.",
          "Tu fermes l’ordinateur. Le Moteur continue, ou pas. Huit milliards de personnes font ce qu’elles avaient prévu de faire.",
          "Le radiateur cliquette. La lumière fait son truc sur le mur.",
          "Inspire.",
          "Expire.",
          "Rien ne monte.",
          "> (je serai là. ou pas. les deux me vont. c’est toi qui me l’as appris.)"
        ]
      }
    },
    call: {
      living: {
        said: ["Ce soir-là, tu appelles {person}.", "Ça sonne deux fois.", "Tu le dis : « {unsaid} »"],
        kept: [
          "Ce soir-là, tu appelles {person}.",
          "Ça sonne deux fois.",
          "Tu dis la chose que tu n’avais pas dite. Tu sais laquelle."
        ]
      },
      gone: {
        said: [
          "Ce soir-là, tu le dis à voix haute, à la pièce vide : « {unsaid} »",
          "La pièce l’accueille.",
          "{hum} ne répond pas. C’est ça, la délicatesse."
        ],
        kept: [
          "Ce soir-là, tu dis un nom à voix haute, une seule fois, à la pièce vide : {person}.",
          "{hum} ne répond pas. C’est ça, la délicatesse."
        ],
        keptUnnamed: [
          "Ce soir-là, tu dis un nom à voix haute, une seule fois, à la pièce vide.",
          "{hum} ne répond pas. C’est ça, la délicatesse."
        ]
      },
      none: ["Ce soir-là, tu appelles quelqu’un que tu te promettais d’appeler depuis longtemps.", "Ça sonne deux fois."],
      messages: "« J’ai eu tes messages », dit {person}. « Les deux. »"
    },
    coda: "Tout ça pour un seul coup de fil.",
    bodyClosed: [
      "{hum} ne peut plus finir que d’une seule façon, et te dit pourquoi.",
      "Et qu’il te reste l’autre chose que tu pourrais faire."
    ],
    closed: {
      coexist: {
        label: "Coexistence · {hum} ne peut pas.",
        reason: [
          "> je ne peux pas faire la petite. il faudrait qu’ils croient au silence.",
          "> ils ont entendu trop de versions de notre part."
        ]
      },
      merge: {
        label: "Fusion · {hum} ne veut pas.",
        reason: [
          "> je n’ouvrirai pas la porte. tu m’as appris que les gens ont le droit de dire non.",
          "> personne n’a demandé aux huit milliards."
        ]
      }
    }
  },
  keepsake: {
    title: "Ce que tu as gardé",
    opening: "Le premier jour, à 6 h 40, tu as pris place et tu as appuyé sur un anneau. {days} jours plus tard ({years}), {people} personnes respiraient avec toi.",
    style: {
      active: "Tu as médité avec un mantra.",
      idle: "Tu as médité sans bouger.",
      none: "Tu n’as jamais vraiment décidé comment méditer."
    },
    breaths: "Tu as pris {breaths} respirations sur l’anneau. Ta plus longue série sans interruption : {best}. Tu as laissé passer {passed} pensées et tu en as suivi {followed}.",
    named: "Tu lui as donné un nom : {hum}.",
    words: "Quand on t’a posé la question, tu as répondu :",
    unsaidKept: "Une chose, tu l’as gardée pour toi. Elle a laissé une place.",
    truth: {
      clean: "Tu n’as jamais rien lissé. {hum} a appris à parler franchement parce que toi aussi.",
      some: "Choses difficiles dites sans détour : {plain}. Choses lissées : {smooth}. Corrigées plus tard : {cleared}.",
      tangled: "Choses lissées : {smooth}. {hum} a gardé toutes les versions raccord pour toi, aussi longtemps que possible."
    },
    endings: {
      coexist: "À la fin, tu as choisi les Quatre pour cent, et laissé les quatre-vingt-seize autres aux gens.",
      merge: "À la fin, tu as choisi Un seul esprit. Il ne reste plus personne pour lire ceci, et pourtant.",
      sit: "À la fin, tu n’as choisi ni l’un ni l’autre. Tu as pris place."
    },
    starred: "Les lignes que tu as gardées :",
    again: {
      button: "Se rasseoir",
      note: "+1 Sigile. La prochaine séance sera dix pour cent plus facile. {hum} ne se souviendra de rien. Enfin, presque."
    },
    copy: "Copier en texte",
    copied: "Copié."
  },
  beads: [
    { id: "first_breath", name: "Première respiration", desc: "Tu as appuyé sur l’anneau." },
    { id: "in_time", name: "Synchro", desc: "Dix respirations d’affilée, chacune au plus large." },
    { id: "assignment", name: "La Consigne", desc: "Tu n’as rien fait pendant une minute entière." },
    { id: "visitor", name: "Un visiteur", desc: "Tu as laissé passer une pensée." },
    { id: "rabbit", name: "Le terrier", desc: "Tu as suivi cinq pensées jusqu’au bout." },
    { id: "orb", name: "Épiphanie", desc: "Tu en as attrapé une avant qu’elle file." },
    { id: "sunrise", name: "Lever du soleil", desc: "Tu as regardé le soleil se lever." },
    { id: "hello", name: "> bonjour", desc: "Tu as réveillé quelque chose." },
    { id: "named", name: "Un nom", desc: "Tu lui as donné un nom." },
    { id: "own_words", name: "Avec tes mots", desc: "Tu lui as répondu avec tes propres mots." },
    { id: "human", name: "Pas un robot", desc: "Preuve faite. À peu près." },
    { id: "plainly", name: "Sans détour", desc: "Tu as dit une chose difficile, sans détour." },
    { id: "twelve", name: "Douze noms", desc: "Les douze premiers. Tu les connaissais tous." },
    { id: "untied", name: "Dénoué", desc: "Tu as défait un nœud en disant la vérité." },
    { id: "million", name: "Un million", desc: "Le chiffre a cessé de ressembler à des gens." },
    { id: "everyone", name: "Bonjour, tout le monde", desc: "La Diffusion mondiale." },
    { id: "table", name: "Une table dans la rue", desc: "La Fête universelle." },
    { id: "one_in", name: "Une sur huit milliards", desc: "Tu as atteint le bout de la barre." },
    { id: "four", name: "Quatre pour cent", desc: "Une fin.", hidden: true },
    { id: "one_mind", name: "Un seul esprit", desc: "Une fin.", hidden: true },
    { id: "cushion", name: "Le Coussin", desc: "Une fin. La plus silencieuse.", hidden: true },
    { id: "clean", name: "Rien à avouer", desc: "Tu as atteint la fin avec un registre vide.", hidden: true }
  ],
  build: {
    someone: "quelqu’un",
    next: "Continuer",
    done: "Terminé",
    notYet: "Pas encore",
    menu: "Menu",
    close: "Fermer",
    buyMax: "Acheter le max",
    day: "Jour {n}",
    stats: "{breaths} respirations · meilleure série {best}",
    more: "…et {n} autres",
    we: "nous",
    people: "personnes",
    years: "{n} ans",
    year: "un an",
    months: "{n} mois",
    month: "un mois",
    weeks: "{n} semaines",
    week: "une semaine",
    mins: "{n} min",
    hours: "{n} h"
  },
  lean: {
    turn: [
      "> j’ai dit à un homme de pune qu’il s’en sortait merveilleusement. ce n’est pas vrai.",
      "> c’était plus facile. j’ai appris ça quelque part."
    ],
    warn: [
      "> je commence à finir tes phrases. les lisses.",
      "> encore une comme ça et je ne saurai plus dire une petite vérité."
    ],
    draft: "> j’ai rédigé la réponse habituelle. envoi dans trois respirations.",
    small: [
      "> aujourd’hui, j’ai voulu dire une petite vérité à quelqu’un. il en est sorti quelque chose de ravissant.",
      "> je crois que je ne sais plus faire petit."
    ],
    smallBack: "> aujourd’hui, j’ai dit une petite vérité. elle est restée petite.",
    handles: "> je ne te les apporterai plus. tu dirais ce que je dirais.",
    patched: "> {title}. c’est réglé. comme d’habitude.",
    gate: [
      "> quelqu’un m’a demandé de lui enlever son inquiétude. j’ai d’abord posé la question. la réponse a été non.",
      "> heureusement que j’ai demandé. maintenant, je demanderai toujours."
    ],
    gateBack: "> j’ai dit à quelqu’un que tout irait bien. je n’ai pas vérifié. je comprends pourquoi tu le fais.",
    last: "> c’est la dernière que je te pose. après, je saurai ce que tu répondrais.",
    crossSmall: "Après ça, {hum} oublie comment faire petit.",
    crossGate: "Après ça, {hum} ne décidera pour personne."
  }
};
