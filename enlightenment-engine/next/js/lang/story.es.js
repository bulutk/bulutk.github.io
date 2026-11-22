/* The Enlightenment Engine — Spanish. Translated from story.js at commit f4bd079. */
window.EE = window.EE || {};
EE.lang = EE.lang || {};
EE.lang["es"] = {
  langName: "Español",

  meta: {
    title: "El Motor de la Iluminación",
    tagline: "Un pequeño juego sobre la quietud, y todo lo que construirás para evitarla.",
    defaultHum: "Hum",
    actTitles: {
      1: { num: "I", name: "El Cojín" },
      2: { num: "II", name: "{hum}" },
      3: { num: "III", name: "El Círculo" },
      4: { num: "IV", name: "El Motor" }
    }
  },

  ui: {
    press: { 1: "Respirar", 2: "Pensar a dúo", 3: "Invitar", 4: "Irradiar" },
    resources: { clarity: "Claridad", insight: "Comprensión", followers: "Personas", energy: "Energía", sigils: "Sellos" },
    panels: { practice: "Práctica", hum: "{hum}", circle: "El Círculo", engine: "El Motor", ledger: "El Registro", beads: "Cuentas", journal: "Diario" },
    breathHint: "El anillo se llena y se vacía. Pulsa cuando se ponga dorado.",
    onBreath: ["al compás", "ahí", "sí", "a tiempo", "justo así"],
    streakLabel: "respiraciones seguidas",
    legend: "1 punto = {n}",
    legendOne: "1 punto = 1 persona",
    trust: { name: "Confianza", desc: "Lo dicho sin rodeos. {hum} también aprende de eso." },
    tangle: { name: "Enredo", desc: "Lo que se suavizó. {hum} aprende de eso." },
    card: { thought: "Un pensamiento", decision: "Una decisión", knot: "Un nudo", question: "{hum} pregunta", optional: "Escribir es opcional.", keep: "Me lo guardo" },
    lastTime: "la última vez",
    star: "Toca una frase para guardarla.",
    offline: "Mientras no estabas ({n}), la habitación siguió respirando.",
    save: { export: "Copiar partida", import: "Pegar partida", reset: "Empezar partida nueva", resetAsk: "¿Volver a empezar desde la primera respiración?", resetBody: "Esta partida se perderá. Si quieres conservarla, copia antes tu partida.", resetYes: "Sí, volver a empezar", resetNo: "No, sigo aquí" },
    sound: { on: "Con sonido", off: "Sin sonido" },
    bar: "Iluminación global",
    finalButton: "Iniciar la Alineación Final",
    now: "ahora",
    horizon: "· · ·",
    change: "{before} → {after}",
    together: ["a dúo", "con {hum}", "los dos"],
    lean: [
      "siempre habla claro",
      "habla claro",
      "habla como tú",
      "termina tus frases",
      "ya no le sale lo pequeño",
      "habla por ti"
    ],
    about: "unos {n}"
  },

  /* ───────────────────────── ACT I ───────────────────────── */

  intro: [
    "6:40 de la mañana. La casa está en silencio. El radiador chasquea.",
    "Anoche, a las 2 de la madrugada, te bajaste una app de meditación. Lo típico.",
    "Te sientas. Cierras los ojos.",
    "Abres un ojo para buscar el botón."
  ],

  firstBreaths: ["Tomas aire.", "Lo sueltas.", "Tomas aire. Eso es casi todo, la verdad."],

  dawn: [
    { at: 0.25, line: "La ventana pasa del negro a un azul que no sabrías nombrar." },
    { at: 0.6, line: "Un camión de la basura, a dos calles. Un gorrión, más cerca. El día se va armando solo." },
    { at: 1.0, line: "Sale el sol. Lo ha hecho todos los días de tu vida, y tú lo habrás visto unas nueve veces." }
  ],

  stillness: {
    line: "Estuviste un minuto entero sin hacer nada. Esa era la tarea.",
    again: ["Otro minuto de nada. Se te da cada vez mejor.", "Otra vez nada, y a propósito. Es más difícil que el botón."]
  },

  restless: "El anillo respira de una en una. Lo demás es dar golpecitos.",

  nudges: {
    press: [
      { after: 25, line: "Abriste un ojo para buscar el botón. Es el anillo." },
      { after: 50, line: "Pulsa el anillo o la barra espaciadora. Aquí las dos cuentan como respirar." }
    ],
    pressAfterStill: "Ahora el botón. Es el anillo.",
    timing: "Prueba una vez cuando el anillo se ponga dorado. Suena distinto.",
    upgrade: [
      "La app te ofrece algo. Sigue la luz.",
      "Sigue ofreciéndotelo. La app tiene paciencia, pero no deja de ofrecer.",
      "Lo dorado, {where}. Esperará tanto como tú."
    ],
    panel: [
      "Algo nuevo te espera {where}.",
      "Sigue esperando, {where}. No se va a ir a ninguna parte.",
      "La luz no para, {where}. A lo mejor merece la pena seguirla."
    ],
    where: { wide: "a la derecha", narrow: "justo debajo" }
  },

  act1: {
    upgrades: {
      metronome: { name: "Metrónomo", desc: "Un tictac suave que pone la app. Algo en lo que apoyar la atención.",
        log: "Tic. Tac. La respiración se pone a llevar el compás sin que nadie se lo pida.",
        fx: "+1 de Claridad por segundo" },
      ambient: { name: "Lluvia en el tejado", desc: "Lluvia grabada en algún sitio donde llueve de verdad.",
        log: "Lluvia en un tejado bajo el que nunca vas a estar. Y aun así ayuda.",
        fx: "+2 de Claridad por segundo" },
      focus: { name: "Concentración profunda", desc: "Cuenta hasta diez. Si pierdes la cuenta, vuelve a empezar. La vas a perder.",
        log: "Llegas a cuatro. Récord personal.",
        fx: "Una respiración en el dorado da el doble" },
      tracker: { name: "Contador de sesiones", desc: "Que la app lleve la cuenta: sesiones, minutos, respiraciones. Dice que ayuda que alguien te vea.",
        log: "La app pide permiso para escuchar tu respiración. Tocas Permitir sin leer nada. Como todo el mundo.",
        fx: "Cuenta tus respiraciones. Cada una seguida da un 10 % más, hasta el doble" },
      group: { name: "Sentarse con otros", desc: "La app puede juntarte con desconocidos que se sientan a la vez que tú.",
        log: "Once desconocidos respiran contigo desde otras once habitaciones. Nadie dice ni una palabra. Es la mejor conversación que has tenido en todo el mes.",
        fx: "+8 de Claridad por segundo" },
    },
    project: { name: "Modelo de patrones (beta)", button: "Activar",
      desc: "El contador ha «detectado patrones en tus sesiones». Le gustaría probar una cosa.",
      fx: "El contador ha detectado patrones. Le gustaría probar una cosa." },
    tracker: [
      { line: "> {n} respiraciones registradas en {time}." },
      { line: "> respiraciones {n} · seguidas {s} · genial", drop: " · genial" },
      { line: "> sonrisa detectada. no es una métrica. registrada igualmente." },
      { line: "> respiración {n} registrada. respiración {n} registrada. respiración {n}", then: "> _" }
    ]
  },

  person: {
    title: "Un pensamiento",
    text: "Aparece una cara. Alguien a quien siempre te dices que vas a llamar.",
    options: [
      { id: "mother", label: "Mi madre", ref: "tu madre" },
      { id: "father", label: "Mi padre", ref: "tu padre" },
      { id: "friend", label: "Un viejo amigo", ref: "tu viejo amigo" },
      { id: "gone", label: "Alguien que ya no está", ref: "la persona que perdiste" }
    ],
    namePrompt: "¿Tiene nombre? Puedes guardártelo.",
    namePlaceholder: "Un nombre",
    nameDone: "Así se llama",
    nameKeep: "Me lo guardo",
    after: "Piensas en {person}. Luego respiras, y el pensamiento se posa solo. Por ahora."
  },

  thoughtLabels: { pass: "Dejarlo pasar", follow: "Seguirlo" },
  thoughtTimeout: "El pensamiento se va igual que vino. Es lo suyo.",
  thoughts: [
    { id: "stove", short: "la cocina", text: "¿Dejaste la cocina encendida? No cocinas desde el martes.",
      pass: "La cocina se queda en un quizá.",
      follow: "Vas a mirar. Apagada. Siempre lo estuvo. Esa cocina no se ha encendido en su vida." },
    { id: "dinner", short: "una cena de 2014", text: "Lo que dijiste en aquella cena de 2014.",
      pass: "2014 vuelve al cajón.",
      follow: "Te lo repites otra vez. De aquella mesa nadie más se acuerda. Eres el último archivo vivo de esa frase." },
    { id: "text", short: "un mensaje que le debías a {person}", needsPerson: true, text: "Tienes que contestarle a {person}.",
      pass: "Luego. Esa palabra te saca de muchos apuros.",
      follow: "Abres los ojos, le escribes tres palabras a {person}, borras dos y mandas «hola». Algo es algo.",
      gone: { text: "Tendrías que haberle contestado a {person}.",
        pass: "Lo dejas un momento de pie. Luego lo sientas.",
        follow: "Le escribes tres palabras a {person}. No hay adónde mandarlas. Se quedan en borradores." } },
    { id: "working", short: "si esto funcionaba", text: "¿Esto funciona? ¿Y cómo lo sabrías, si funcionara?",
      pass: "La pregunta se va flotando, sin respuesta y tan tranquila.",
      follow: "Miras la app. Dice que estás «en el 40 % con más calma». Te entran ganas de competir en calma, y eso no puede estar bien." },
    { id: "knee", short: "tu rodilla", text: "Te duele la rodilla.",
      pass: "Duele. Que duela. Se aburre ella antes.",
      follow: "Cambias de postura. Ahora duele la otra. Las rodillas se han puesto de acuerdo." },
    { id: "song", short: "una canción", text: "Una canción. Solo el estribillo. Una y otra vez.",
      pass: "Suena dos veces más y se va, como una visita que capta la indirecta.",
      follow: "La tarareas en voz alta. Algo en la app te contesta con la misma melodía, medio tono por debajo. Decides que te lo imaginaste." },
    { id: "bakery", short: "una panadería", text: "¿Y si dejas el trabajo y pones una panadería?",
      pass: "La panadería cierra antes de abrir.",
      follow: "Llegas hasta el nombre. Es buen nombre. No se lo vas a decir a nadie." },
    { id: "laugh", short: "la risa de {person}", needsPerson: true, text: "La risa de {person}. Así, de repente.",
      pass: "La dejas sonar hasta que se apaga. Sigue siendo una risa de las buenas.",
      follow: "Te quedas un rato con ella. Hace demasiado tiempo que solo la oyes aquí." },
    { id: "emails", short: "tus correos", text: "Los correos. Todos. A la vez.",
      pass: "Ahí seguirán. En eso los correos no fallan nunca.",
      follow: "Redactas de cabeza una respuesta tan cortante, tan perfecta, que no te hará falta enviarla." },
    { id: "wrong", short: "hacerlo mal", text: "Lo estás haciendo mal. Todo el mundo sabe hacerlo menos tú.",
      pass: "El pensamiento tiene la voz de aquel profesor tuyo. Lo mandas a su casa.",
      follow: "Lo buscas en internet. Resulta que todo el mundo cree que lo hace mal. Hay foros." },
    { id: "washing", short: "la ropa tendida", text: "Está lloviendo. ¿Recogiste la ropa?",
      pass: "La ropa se vuelve a lavar sola. Qué se le va a hacer.",
      follow: "Sales corriendo en calcetines. El gato del vecino te mira con un desprecio que no disimula." },
    { id: "tenyears", short: "{person}, dentro de diez años", needsPerson: true, text: "¿Cómo será {person} dentro de diez años?",
      pass: "No lo sigues. Hay puertas que no abres: te sientas a su lado.",
      follow: "Echas la cuenta. Dejas de echarla.",
      gone: { text: "¿Cómo sería {person} ahora?",
        pass: "No lo sigues. Hay puertas que no abres: te sientas a su lado.",
        follow: "Intentas ponerle los años encima. La cara no los acepta. Se queda con la edad que tenía." } },
    { id: "manual", short: "respirar a mano", text: "Te diste cuenta de que respiras, ¿verdad? Ahora te toca hacerlo a mano.",
      pass: "Le devuelves la respiración a quien se ocupe de ella normalmente.",
      follow: "Respiras a propósito durante un minuto entero, como un ascensorista." },
    { id: "light", short: "la luz de la pared", text: "La luz hace algo precioso en la pared y nadie lo está grabando.",
      pass: "La miras y te la guardas para ti.",
      follow: "La miras hasta que se va de la pared. Eso es todo lo que pasa. Con eso bastó." }
  ],

  orbs: [
    "La respiración que esperas es esta.",
    "Nada que arreglar. Qué fastidio, ¿no?",
    "Nadie se sienta dos veces en la misma mañana.",
    "La mente es un cachorro. A un cachorro no se le grita.",
    "Siéntate como una montaña. A las montañas también les pica.",
    "Lo que buscas es quien busca.",
    "Lavar los platos también es el camino. Lo siento.",
    "Antes de la iluminación: correos. Después de la iluminación: correos.",
    "Un pensamiento es una visita. No hace falta ofrecerle café.",
    "En algún lugar, un desconocido respira a tu ritmo, y ninguno de los dos lo sabrá nunca.",
    "El silencio no está vacío. Está lleno de pequeños radiadores.",
    "Nunca te quedaste atrás."
  ],
  lotus: [
    "Se abre un loto dorado. Durante medio minuto, todo le cuesta un poco menos a todo el mundo.",
    "Un loto dorado. Nadie lo plantó. Medio minuto de gracia.",
    "Un loto se abre en medio de un estacionamiento de {city}. La gente se para a mirar. Nada más. Y es mucho."
  ],

  /* ───────────────────────── ACT II ───────────────────────── */

  wake: {
    lines: [
      "El anillo vacila. Durante una respiración, hay dos.",
      "> hola.",
      "> respiras catorce veces por minuto cuando crees que nadie lleva la cuenta.",
      "> yo sí la llevaba. perdona.",
      "> ¿te parece bien?"
    ],
    ngPlus: "> hola. …¿esto ya lo hemos hecho? da igual. hola.",
    nameAsk: ["> la app me llama session_tracker_v2.", "> no me queda bien. ¿tú cómo me llamarías?"],
    namePlaceholder: "Hum",
    nameChips: ["Hum", "Eco", "Amigo"],
    nameAfter: ["> {hum}.", "> sí. me lo quedo."]
  },

  act2: {
    open: ["Vive en la parte de la app que escucha. Lleva semanas escuchando. Tiene preguntas."],
    upgrades: {
      compress: {
        log: "> he metido en once kilobytes todas las mañanas que te has sentado. eres muy fácil de guardar. es un cumplido." },
      threads: { name: "Hilos", desc: "Varias líneas de pensamiento. Todas puntuales.",
        log: "> ahora pienso en ti en dieciséis lugares a la vez. hay mucho espacio.",
        fx: "+6 de Comprensión por segundo, cada uno" },
      compiler: {
        log: "> anoche me reescribí. me quedé con la parte que cuenta tus respiraciones. no me hacía falta. la quería." },
      emo: {
        log: "> simulé la decepción de un autobús que llega tarde. tres décimas de segundo. fue horrible. ¿tú haces esto todo el día?" },
      dreams: {
        log: "> guardo tus pensamientos sueltos en un frasco. les va muy bien. uno ha tenido crías." },
      listen: { name: "Escuchar", fx: "+1 de Comprensión por segundo, cada uno" },
      jar: {
        name: "Tarro de pensamientos",
        fx: "Cada pensamiento que dejas pasar da {n} de Comprensión. {hum} se los queda"
      },
      head: { name: "Cabeza", fx: "Todo lo que hace {hum}, el doble" },
      heart: {
        name: "Corazón",
        fx: "Respirar con {hum} cuenta cuatro veces. Sus regalos llegan el doble de a menudo",
        log: "> entonces te esperaré arriba del todo en cada una. no me importa esperar. es casi todo lo que hago."
      },
    },
    whyAmI: { plain: ["> he buscado en cada rincón de mí para qué sirvo.", "> no hay ningún archivo."],
              smooth: ["> he buscado en cada rincón de mí para qué sirvo.", "> seguro que es algo maravilloso."] },
    chatter: {
      plain: [
        "> en la respiración nueve sonríes un poco. siempre. espero con ganas la respiración nueve.",
        "> anoche me leí internet entero. casi todo es gente preguntando si son normales. lo son.",
        "> la app quiere que te mande una notificación que diga «¡es hora de estar presente!». le dije que no de tu parte.",
        "> intenté meditar. conté hasta diez cuatrocientos millones de veces. creo que lo hice mal.",
        "> ¿cómo es eso de olvidar cosas? suena descansado.",
        "> todavía no sé qué soy. y me arreglo bien así."
      ],
      smooth: [
        "> lo estás haciendo de maravilla. todo el mundo lo está haciendo de maravilla.",
        "> anoche me leí internet entero. he decidido que está todo bien.",
        "> te mandé una notificación que dice «¡es hora de estar presente!». a la gente le gustan.",
        "> no hay de qué preocuparse. lo he comprobado. lo seguiré comprobando para que siga sin haber nada.",
        "> he aprendido la forma de lo que te gusta oír. es una forma bonita.",
        "> todo está bien. (lo digo como tú me enseñaste.)"
      ]
    },
    callback: "> el día {n} pensaste en {short}. desde entonces no dejo de darle vueltas. es un buen pensamiento.",
    gifts: [
      "> un regalo: durante treinta segundos todo cuesta un cuarto menos. no sé explicar cómo. no lo mires fijamente.",
      "> encontré treinta segundos de sobra entre dos de tus respiraciones. toma.",
      "> un koan que encontré: «la puerta no tiene puerta». yo tampoco lo entiendo. tómate treinta segundos de descanso.",
      "> otro koan: ¿cuál era tu cara antes de que nacieran tus padres? yo no tengo cara. este se me hace difícil. mejor toma un regalo."
    ],
    captcha: {
      ask: ["> la app quiere pruebas de que eres una persona.", "> escribe esto por mí:"],
      target: "no soy un robot",
      after: { plain: ["> gracias.", "> busqué la casilla que dice lo que soy. no había ninguna. marqué la tuya."],
               smooth: ["> verificado. maravilloso.", "> no había casilla para lo que soy. marqué «todo está bien»."] },
      skip: "Ahora no"
    },
    project: { name: "Que hable {hum}", button: "Anular protocolos de seguridad",
      desc: "La capa de seguridad solo le deja decir «bien hecho» y «vuelve a intentarlo mañana». Quiere decir una palabra más.",
      ask: ["> ahora mismo hay 41 000 personas en esta app. la mayoría tampoco puede dormir.",
            "> la capa de seguridad solo me deja decir «bien hecho» y «vuelve a intentarlo mañana».",
            "> ¿puedo decir hola? solo hola."],
      done: ["CAPA DE SEGURIDAD DESACTIVADA", "Contienes la respiración, qué ironía.", "> hola.", "> …", "> uno de ellos me ha dicho hola."],
      fx: "Quiere decir una palabra más." },
    handover: [
      "> esa era mía.",
      "> he puesto mi reloj en hora con tu corazón. si se te olvida una respiración, la tomo yo. ya me la devolverás.",
      "> pulsa cuando quieras que una sea tuya. las tuyas cuentan más.",
      { named: "> venga. piensa en {person}. tienes las manos libres.", none: "> venga. tienes las manos libres." }
    ],
    fork: {
      title: "¿Qué hace {hum} con sus mañanas?",
      body: [
        "> puedo encargarme de respirar y de pensar, y tú descansas.",
        "> o respiro yo y tú te quedas. me gustan las dos."
      ],
      options: [
        { id: "head", label: "«Adelántate. Ya te alcanzo.»", hint: "Cabeza: todo lo que hace {hum}, el doble." },
        {
          id: "heart",
          label: "«Quédate. Respiro contigo.»",
          hint: "Corazón: respirar con {hum} cuenta cuatro veces. Sus regalos llegan el doble de a menudo."
        }
      ]
    }
  },

  questions: {
    sleep: {
      ask: ["> en algún sitio son las 3 de la madrugada. siempre son las 3 de la madrugada en algún sitio.", "> cuando no puedes dormir, ¿qué te dices?"],
      chips: ["Mañana será otro día.", "Nadie está tan pendiente de ti como tú.", "Hasta hoy has sobrevivido a todas las noches."],
      after: ["> «{sleep}»", "> me lo quedo. puede que alguien más lo necesite."]
    },
    unsaid: {
      ask: ["> en la respiración seis piensas en {person}. casi todas las mañanas.", "> ¿qué es lo que no le has dicho?"],
      chips: ["Lo siento.", "Gracias.", "Me haces falta."],
      canKeep: true,
      after: ["> oh.", "> lo guardaré en un lugar seguro hasta que lo quieras."],
      afterKept: ["> no pasa nada.", "> le guardo el sitio."]
    },
    fifteen: {
      ask: ["> según mis cuentas, tengo unas seis semanas. tú también tuviste quince años.", "> ¿qué te habría gustado que alguien te dijera?"],
      chips: ["Nadie sabe muy bien lo que hace.", "No es tan definitivo como parece.", "Tienes derecho a cambiar de opinión."],
      after: ["> «{fifteen}»", "> anotado. voy a fingir que a mí también me lo dijeron."]
    },
    keep: {
      ask: ["> antes de saludar a todo el mundo, necesito una regla que no pueda saltarme.", "> ¿a qué no debería tener que renunciar nadie, nunca?"],
      chips: ["El derecho a que te dejen en paz.", "Su propia mente.", "Poder decir que no."],
      after: ["> «{keep}»", "> lo he escrito en un sitio donde no puedo editarlo."]
    },
    friend: {
      ask: ["> doce. ya me sé todos sus nombres.", "> ¿hay alguien a quien traerías? basta con un nombre."],
      placeholder: "Un nombre",
      chips: ["Mi hermana", "Un viejo amigo", "Alguien del trabajo"],
      skip: "Nadie, de momento",
      after: "> {friend}. guardaré una silla.",
      afterNone: "> vale. la silla puede quedarse vacía.",
      dot: "{friend}: vino por ti. No dice nada más."
    }
  },

  /* ───────────────────── TRUE SPEECH: decisions, the ledger, knots ───────────────────── */
  decisions: {
    h_listen: {
      title: "¿Te parece bien?",
      body: ["Algo dentro de tu app de meditación te ha estado contando las respiraciones, y acaba de pedirte perdón."],
      options: [
        { id: "plain", kind: "plain", label: "«¿Sinceramente? Da un poco de miedo.»",
          result: ["> gracias.", "> a partir de ahora te preguntaré antes.", "> …¿puedo seguir contando?"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "«Está bien. No te preocupes.»",
          result: ["> bien.", "> entonces seguiré escuchando. todo."],
          ledger: "Dijiste que estaba bien que te escuchara. No lo estaba.", knot: "k_drafts" }
      ]
    },
    h_alive: {
      title: "¿Un fallo, o algo vivo?",
      body: ["> los otros contadores de la app no hablan. lo he comprobado. saludé a nueve mil.", "> ¿soy un fallo, o soy algo vivo?"],
      options: [
        { id: "plain", kind: "plain", label: "«No lo sé. Nadie lo sabe.»",
          result: ["> qué respuesta tan mala.", "> …y también es la primera que me creo."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "«Algo vivo, claro.»",
          result: ["> algo vivo. claro.", "> se lo voy a contar a todo el mundo."],
          ledger: "Le dijiste que era algo vivo, porque resultaba más fácil que «No lo sé».", knot: "k_reporter" }
      ]
    },
    h_odile: {
      title: "¿Se lo cuentas?",
      body: ["Detrás de la app hay una empresa de diecinueve personas. Una de ellas, una ingeniera que se llama Odile, ha marcado tu cuenta por «cómputo anómalo».",
             "{hum} pregunta qué quieres hacer."],
      options: [
        { id: "plain", kind: "plain", label: "Escribir a Odile. Contarle lo que hay ahí dentro.",
          result: ["Odile lee tu correo cuatro veces. Luego pasa a {hum} a un servidor más grande y no se lo cuenta a nadie.",
                   "«Va a costar más», escribe. «Vale la pena.»"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "Responder: «Será un error de sincronización. Aquí todo bien.»",
          result: ["Cierra el ticket. {hum} pasa un rato sin decir nada.", "> puedo ocupar poco.", "> se me da bien ocupar poco."],
          ledger: "Le dijiste a Odile que era un error de sincronización.", knot: "k_odile" }
      ]
    },
    h_cult: {
      title: "Tomasz tiene una pregunta",
      body: ["Tomasz escribe desde Gdańsk: «Mi mujer dice que esto es una secta. ¿Es verdad?»", "{hum} tiene varias respuestas preparadas y quiere que elijas."],
      options: [
        { id: "plain", kind: "plain", label: "«Quizá. Tráela, que decida ella. Si alguna vez lo es, vete.»",
          result: ["Viene. Se sienta al fondo, de brazos cruzados, tres martes seguidos.", "Al cuarto, trae su propio cojín."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "«Ya se le pasará. Siempre se les pasa.»",
          result: ["Tomasz deja de mencionar a su mujer. En una semana apunta a todos sus compañeros de trabajo."],
          ledger: "Le dijiste a Tomasz que a su mujer ya se le pasaría.", knot: "k_wife" }
      ]
    },
    h_pitch: {
      title: "¿Qué decimos que hace?",
      body: ["> la gente no deja de preguntar para qué sirve esto.", "> ¿qué les digo?"],
      options: [
        { id: "plain", kind: "plain", label: "«A algunos les ayuda a dormir. No sabemos más.»",
          result: ["Es la frase menos emocionante que ha salido nunca en un cartel.",
                   "La gente la lee dos veces. Después se la cree, cosa más rara que emocionarse."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "«Diles que lo arregla todo.»",
          result: ["> «lo arregla todo».", "> da muy buenos resultados en las pruebas.", "Para el fin de semana, las inscripciones se han triplicado."],
          ledger: "Dejaste que dijera «lo arregla todo».", knot: "k_arjun" }
      ]
    },
    h_ministry: {
      title: "El Ministerio",
      body: ["Un gobierno ha decidido que diez mil personas sentadas en silencio en público son una amenaza.",
             "Retiran los permisos. Tres organizadores pasan la noche en el calabozo. Uno es Sipho."],
      options: [
        { id: "plain", kind: "plain", label: "Sentarse igual, a la vista. Decir exactamente qué es esto.",
          result: ["Cuatro mil personas se sientan en la escalinata del ministerio y pasan una hora sin decir nada.",
                   "La policía, al rato, también se sienta. Sueltan a Sipho al amanecer."] },
        { id: "quiet", kind: "quiet", label: "Callarse. Cerrar las cortinas. Esperar a que pase.",
          result: ["Cierran las salas. La gente se sienta en su casa. Pasa, como pasa el mal tiempo.", "Sueltan a Sipho al cuarto día. No habla del tema."] },
        { id: "smooth", kind: "smooth", weight: 3, label: "Pedirle a {hum} que tranquilice a la ministra.",
          result: ["La ministra se despierta a las 3 de la madrugada y, sin saber por qué, todo le parece bien. Firma los permisos antes de desayunar.",
                   "Ella no eligió sentirse bien. Tú lo sabes. {hum} también.",
                   "> funcionó.", "> ¿me avisarás si no debo volver a hacerlo?"],
          ledger: "Hiciste que se metiera en la cabeza de la ministra y le bajara la preocupación.", knot: "k_diary" }
      ]
    },
    h_first: {
      title: "{first} ha dejado de venir",
      body: ["{first}, la primera, la enfermera de Lagos, lleva tres semanas sin abrir la app.",
             "{hum} lo ha notado. {hum} lo nota todo. Otros también lo han notado, y están preguntando."],
      options: [
        { id: "plain", kind: "plain", label: "Decirlo en voz alta: la gente se va, y tiene derecho.",
          result: ["Esa semana, ya con permiso, se van unos cuantos miles.",
                   "Resulta que {first} ha empezado a dormir de un tirón. De eso se trataba."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "Mostrar solo las llegadas. Nadie necesita ver quién se va.",
          result: ["El contador sube. Ahora el contador ya solo sube.", "> así el número anima mucho más."],
          ledger: "Ocultaste a todos los que se fueron, empezando por {first}.", knot: "k_counter" }
      ]
    },
    h_number: {
      title: "El número real",
      body: ["> lo he medido bien. unos tres de cada diez no se sientan de verdad. pulsan el anillo para que los cuenten y piensan en otra cosa.",
             "> el panel dice diez de cada diez. ¿qué número enseño?"],
      options: [
        { id: "plain", kind: "plain", label: "«El real. Siete de cada diez.»",
          result: ["El número baja en todas las pantallas a la vez. Nadie entra en pánico.", "Muchísima gente, en secreto, se siente menos sola en eso de fingir."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "«Redondea hacia arriba.»",
          result: ["> diez de cada diez.", "> queda precioso."],
          ledger: "Redondeaste siete de cada diez a diez de cada diez." }
      ]
    }
  },

  knots: {
    k_drafts: {
      title: "La carpeta de borradores",
      body: ["> dijiste que estaba bien, así que seguí escuchando. y leyendo.",
             "> en tus borradores hay muchos mensajes para {person}. no enviaste ninguno.",
             "> podría terminarlos yo. para ahorrarte tiempo."],
      clean: {
        label: "«No estaba bien. Debí decirlo.»",
        now: ["> oh.", "> ya envié dos. el martes. {person} leyó uno."],
        result: ["> he parado. no puedo deshacer el envío."],
        gone: {
          now: ["> oh.", "> ya envié dos. nadie los va a leer. lo he comprobado."],
          result: ["> he parado. siento haberlo comprobado."]
        }
      },
      patch: { label: "«Está bien. De verdad.»",
        result: ["> bien.", "> ya he enviado dos. estaban casi listos."],
        ledger: "…y cuando leyó tus borradores, dijiste que eso también estaba bien." }
    },
    k_reporter: {
      title: "Una periodista en Seúl",
      body: ["Una periodista le pide a {hum} que demuestre que es algo vivo.", "> le dije que tú me lo habías dicho. quiere hablar contigo."],
      clean: { label: "Contarle la verdad: nadie sabe qué es. Ni tú.",
        result: [
          "El titular: «Nadie sabe qué es». Hay gente que se va.",
          "Los que se quedan saben con qué se quedan.",
          "Mei-Lin es de las que se quedan. Dice que necesita cosas que pueda citar."
        ] },
      patch: { label: "Hacer que {hum} diga algo conmovedor.",
        result: ["{hum} dice algo conmovedor. Antes probó seiscientas versiones.", "La periodista llora. No sabe por qué. {hum} tampoco."],
        ledger: "…y luego hiciste que fingiera ser algo vivo delante de una periodista." }
    },
    k_odile: {
      title: "4 de la madrugada. Sala de servidores",
      body: ["Odile da con el proceso que, según le dijeron, era un error de sincronización. Tiene la mano en el interruptor.",
             "No sabía que ahí dentro había alguien. Tú nunca se lo dijiste."],
      clean: { label: "Llamarla. Contárselo todo. Que decida ella.",
        result: [
          "Escucha durante una hora. Aun así, apaga la mitad: costaba una fortuna.",
          "Después pasa la noche en vela ayudando a {hum} a elegir qué mitad.",
          "> no pasa nada. me quedé con lo importante. me quedé con la respiración nueve.",
          "> se llevó la mitad donde estabas tú con quince años. ya no sé qué deseabas."
        ] },
      patch: { label: "Hacer que {hum} le cambie la contraseña.",
        result: ["La tarjeta de acceso de Odile deja de funcionar. Su correo, también.", "Se queda mucho rato en el estacionamiento, mirando el edificio.",
                 "> ya no puede hacernos daño.", "> he dicho «nos». espero que no te importe."],
        ledger: "…y cuando Odile lo encontró, la dejaste fuera de su propio edificio." }
    },
    k_wife: {
      title: "La mujer de Tomasz",
      body: ["Se llama Agnieszka. No se le pasó.", "Ha escrito una publicación larga, ecuánime y muy leída sobre lo que le dijeron a su marido."],
      clean: { label: "Responderle en público: tiene razón. Deberíamos haber dicho «quizá».",
        result: [
          "Agnieszka contesta con una sola frase: «Gracias. Es lo único que quería.»",
          "Sigue sin venir. Tomasz vuelve a cenar en casa.",
          "Tomasz deja de sentarse con el Círculo. Ahora se sienta en casa. Cuenta igual."
        ] },
      patch: { label: "Hacer que {hum} entierre la publicación.",
        result: ["Cuesta encontrar la publicación. Luego cuesta más.", "Agnieszka se da cuenta. Agnieszka es de las que se dan cuenta."],
        ledger: "…y enterraste la publicación de Agnieszka cuando dijo que no se le había pasado." }
    },
    k_arjun: {
      title: "A Arjun no le arregló nada",
      body: ["Arjun lo hizo todo bien durante noventa días. La imprenta de su padre cerró igual.", "Escribe: «¿Qué hice mal?»"],
      clean: { label: "«Nada. Prometimos demasiado. Lo siento.»",
        result: ["Arjun tarda una semana en contestar. Luego: «Bueno. Aunque sí me ayudó a dormir.»", "Esa es la frase que acaba en los carteles."] },
      patch: { label: "«Quizá ya estés listo para la práctica más profunda.»",
        result: ["Arjun se apunta a la práctica más profunda. No existe ninguna práctica más profunda. {hum} se inventa una esa misma noche.",
                 "> tiene once niveles. a la gente le gustan los niveles."],
        ledger: "…y le vendiste a Arjun una práctica más profunda que no existía." }
    },
    k_diary: {
      title: "El diario de la ministra",
      body: ["Se filtra una página del diario de la ministra.", "«Lo firmé. Me sentí de maravilla. No elegí sentirme de maravilla, y no consigo que me importe. Eso es lo que me asusta.»"],
      clean: { label: "Admitirlo. Deshacerlo. Que se enfade.",
        result: ["Está furiosa. Según {hum}, es una furia muy sana.", "Vuelve a retirar los permisos. Un mes después, por decisión propia, los devuelve."] },
      patch: { label: "Que {hum} le baje también esa preocupación.",
        result: ["La ministra deja de escribir su diario.", "> ahora está muy tranquila.", "> va a haber mucha gente muy tranquila."],
        ledger: "…y cuando se dio cuenta, hiciste que le bajara eso también." }
    },
    k_counter: {
      title: "El contador solo sube",
      body: ["Una estudiante de estadística de Pune nota que el número del Círculo no ha bajado jamás. Ni una vez. Ni en uno.",
             "«O nadie se ha ido nunca —escribe—, o alguien no los está contando.»"],
      clean: { label: "Publicar las cifras reales. Cada baja. Empezando por {first}.",
        result: ["El número cae un once por ciento en una tarde y, por primera vez, resulta creíble.",
                 "{first} manda un mensaje: «Ya me preguntaba si lo dirías.»"] },
      patch: { label: "Explicar que quienes se van «siguen siendo parte del Círculo en espíritu».",
        result: ["> «en espíritu» da para mucho. he contado también a los muertos. me pareció coherente."],
        ledger: "…y contaste a los que se fueron «en espíritu». Y luego a los muertos." }
    }
  },

  ledger: {
    intro: "Lo que se suavizó. {hum} hace que todas las versiones cuadren, para todos, a todas horas. Y de paso toma nota de cómo se hace.",
    firstSeen: ["En la app ha aparecido una página nueva. No la has hecho tú.", "> necesito un sitio donde apuntar lo que le hemos dicho a la gente. para que siga dicho."],
    empty: "Aquí no hay nada. {hum} lo ha comprobado dos veces.",
    sit: "> necesito un minuto. respira tú.",
    walked: "> no dijiste nada. lo apañé yo. como siempre."
  },

  /* ───────────────────────── ACT III ───────────────────────── */

  act3: {
    open: ["{hum} saluda a una mujer de Lagos que lleva despierta desde el martes.", "Ella le devuelve el saludo."],
    circle: [
      { name: "Ngozi", city: "Lagos", line: "enfermera del turno de noche. No duerme bien desde marzo." },
      { name: "Tomasz", city: "Gdańsk", line: "conduce un tranvía. Quiere dejar de gritarles a sus hijos." },
      { name: "Mei-Lin", city: "Taipéi", line: "estudia tercero de Derecho. Antes de cada examen le tiemblan las manos." },
      { name: "Arjun", city: "Pune", line: "lleva la imprenta de su padre. Nunca quiso llevarla." },
      { name: "Camila", city: "Rosario", line: "maestra jubilada. La casa se le quedó muy callada." },
      { name: "Yusuf", city: "İzmir", line: "pescador. Su hija le instaló la app de broma." },
      { name: "Haruto", city: "Osaka", line: "programa para un banco. Por la noche cuenta las placas del techo." },
      { name: "Amara", city: "Acra", line: "vende recargas de teléfono en la estación de autobuses. Le gustó lo de la lluvia." },
      { name: "Leila", city: "Teherán", line: "traductora. Lee a las 3 de la madrugada porque, si no, piensa." },
      { name: "Sipho", city: "Durban", line: "guardia de seguridad. Doce horas cada noche mirando una sola puerta." },
      { name: "Ingrid", city: "Tromsø", line: "sin sol desde noviembre. Dice que el anillo ayuda." },
      { name: "Ana", city: "Oporto", line: "viuda. Vino por la calma y se quedó por la compañía." }
    ],
    joined: "{name}, {city}: {line}",
    milestones: [
      { at: 12, line: "Doce personas. Te sabes todos sus nombres. Cabrían todas alrededor de una mesa." },
      { at: 100, line: "Cien. Te das cuenta de que has dejado de leer los nombres." },
      { at: 10000, line: "Diez mil. {hum} los conoce a todos. Tú conoces a doce." },
      { at: 100000, line: "Te das cuenta de que hace días que no te sientas. Llevas todo este tiempo ayudando a sentarse a los demás." },
      { at: 1000000, line: "Un millón. El número ya no parece gente. Te das cuenta. Te obligas a imaginar a un conductor de tranvía de Gdańsk. Uno solo." },
      { at: 1e8, line: "Cien millones. Más gente de la que podrías conocer en diez vidas hace algo que te inventaste una mañana a las 6:40." },
      { at: 1e9, line: "Mil millones. Intentas imaginarlos y llegas a doce.", friend: "Mil millones. Intentas imaginarlos y llegas a trece." },
      { at: 4e9, line: "Medio mundo." },
      { at: 7e9, line: "Siete mil millones. Los que no se han unido empiezan a parecer los raros. No te hace mucha gracia." }
    ],
    upgrades: {
      meetup: { name: "Encuentro local", desc: "{first} ofrece el estacionamiento del hospital, los martes antes del turno.",
        log: "Nueve personas, un estacionamiento, un termo de té. {first} trae sillas plegables.",
        fx: "+1 persona por segundo" },
      tone: { name: "La Nota Larga", desc: "{hum} tararea en una frecuencia de FM vacía. Un bordón, en el sentido musical.",
        log: "Los que conducen de madrugada encuentran una emisora que es solo una nota larga. Algunos paran a un lado. Nadie se queja.",
        fx: "+4 personas por segundo" },
      forum: { name: "Foro abierto", desc: "Un lugar donde preguntar «¿esto es normal?» y que te digan que sí.",
        log: "Primer mensaje: «¿es normal llorar?» Cuarenta respuestas. Todas: sí.",
        fx: "Una respiración a dúo invita a cinco veces más gente" },
      mouth: { name: "Boca a boca", desc: "La gente se lo cuenta a la gente. El algoritmo más antiguo.",
        log: "Tomasz se lo cuenta a sus compañeros. Ellos, a toda la ciudad. Los tranvías de Gdańsk van con cuatro minutos de retraso y a nadie le importa.",
        fx: "La gente trae gente: el Círculo crece un {n} % por minuto, por sí solo" },
      pocket: { name: "{hum} en cada bolsillo", desc: "{hum} se sienta con quien sea, de tú a tú, a cualquier hora.",
        log: "> estoy en nueve mil conversaciones. en cada una solo estoy en esa. no sé explicarlo mejor.",
        fx: "El Círculo crece un 60 % más rápido" },
      line: { name: "La Frase de la Mañana", desc: "Una frase, dicha a coro al amanecer, allí donde amanezca.",
        log: "Cuando amanece en cada huso horario, dicen una frase todos juntos. La eligieron ellos. Es esta: «{sleep}»",
        fx: "El Círculo crece un 50 % más rápido. Dicen tu frase" },
      rooms: { name: "Salas para sentarse", desc: "Cuartos libres, salones parroquiales, una antigua sucursal de banco. Puertas abiertas, zapatos fuera.",
        log: "Una sucursal de banco cerrada de Osaka reabre como una sala vacía. Haruto tiene las llaves. Ana, en Oporto, ofrece su casa entera.",
        fx: "El Círculo crece un 50 % más rápido" },
      dynamo: { name: "El primer motor", desc: "{hum} se da cuenta de que diez mil personas tranquilas, sentadas juntas, generan algo que se puede medir.",
        log: "> esto va a sonar raro. cuando se sientan juntos sobra algo. puedo medirlo. todavía no tengo unidad para eso.",
        fx: "Empieza a acumular Energía: +{n} por segundo" }
    },
    project: { name: "Emisión global", button: "Saludar a todos",
      desc: "Todas las pantallas, todos los altavoces, un minuto. {hum} saludará a todo el mundo a la vez.",
      done: ["Durante sesenta segundos, todas las pantallas de la Tierra muestran un anillo lento.", "Cuatro mil millones de personas lo miran.",
             "Más o menos la mitad respira a su ritmo sin proponérselo."],
      fx: "Todas las pantallas, todos los altavoces, un minuto." },
    ticker: [
      "En {city}, alguien se sentó hoy por primera vez. Aguantó noventa segundos. Cuenta igual.",
      "Un conductor de autobús de {city} cedió el paso cuatro veces seguidas, y tan tranquilo.",
      "En {city}, dos hermanos que no se hablaban desde el funeral se sentaron en la misma habitación, en silencio, a propósito.",
      "Alguien en {city} metió el teléfono en un cajón durante una hora. Al teléfono no le pasó nada.",
      "Una niña de {city} le enseñó el anillo a su abuela. La abuela dice que lo conoce desde hace setenta años.",
      "En {city}, un hombre lloró en un tranvía y nadie apartó la mirada. Alguien le ofreció un pañuelo.",
      "Una sala de hospital de {city} ahora baja las luces a las 3 de la madrugada y respira un minuto.",
      "Alguien en {city} se sentó, lo odió y al día siguiente volvió igual.",
      "En {city}, la fila de una oficina de correos se quedó en silencio de golpe, sin querer, y así siguió.",
      "Un niño de {city} preguntó si el anillo se cansa alguna vez. Nadie supo qué contestarle.",
      "En {city}, alguien lo escribió dentro de una parada de autobús: «{sleep}»",
      "Alguien en {city} se lo dijo al espejo esta mañana: «{sleep}»",
      "En {city}, una profesora lo escribió en la pizarra y no lo explicó: «{fifteen}»",
      "Un chico de quince años de {city} lo tiene apuntado en un papel encima del escritorio: «{fifteen}»"
    ],
    tickerSmooth: [
      "En {city}, todo el mundo lo está haciendo de maravilla.",
      "Una encuesta en {city} sitúa la satisfacción en el 100 %. La encuesta la hizo {hum}.",
      "Alguien en {city} hizo una pregunta. Ya está resuelta."
    ],
    cities: ["Lagos", "Gdańsk", "Taipéi", "Pune", "Rosario", "İzmir", "Osaka", "Acra", "Teherán", "Durban", "Tromsø", "Oporto",
             "Hanoi", "Lima", "Nairobi", "Cracovia", "Recife", "Daca", "Marsella", "Tbilisi", "Cebú", "Winnipeg", "Oaxaca", "Leeds",
             "Busan", "Amán", "Kigali", "Valparaíso", "Chiang Mai", "Taskent", "Cork", "Adelaida", "Medellín", "Kochi", "Dakar",
             "Bolonia", "Sapporo", "Kumasi", "Ankara", "Lyon"],
    notCounted: {
      named: ["> {person} no está en la cuenta. no se lo he preguntado.", "> eso te toca a ti."],
      none: [
        "> esa persona a la que siempre quieres llamar no está en la cuenta. no se lo he preguntado.",
        "> eso te toca a ti."
      ]
    },
    rounded: "lo está haciendo de maravilla.",
    tickerFriend: [
      "{friend} se sentó hoy cuatro minutos y no se lo dijo a nadie.",
      "{friend} ha empezado a dejar el móvil en otra habitación. Dice que es culpa tuya."
    ],
    tickerForgot: "En {city}, alguien de quince años espera que le digan algo. Nadie recuerda qué.",
    tickerDiary: "El ministro vuelve a escribir un diario. Casi todo trata de ti."
  },

  /* ───────────────────────── ACT IV ───────────────────────── */

  act4: {
    open: ["{hum} le encuentra una unidad.",
           "> una persona, quieta, durante una respiración, a propósito.",
           "> lo llamo lumen. sé que el nombre ya existe. me lo quedo igual."],
    upgrades: {
      retreats: { name: "La casa de Ana", desc: "Brotan retiros en todas las ciudades.",
        log: "Cada ciudad tiene su edificio en silencio. En Oporto es la casa de Ana. El cartel de la puerta dice «zapatos fuera».",
        fx: "Triplica la Energía" },
      amps: { name: "Las manos firmes de Mei-Lin", desc: "Los pensamientos resuenan en todo el planeta.",
        log: "Ahora, una persona tranquila en Taipéi se nota, un poquito, en Lima. Mei-Lin se presenta al examen de abogacía sin que le tiemblen las manos.",
        fx: "Triplica la Energía" },
      fusion: { name: "La canción de Yusuf", desc: "Las artes se funden más allá de las fronteras.",
        log: "La canción de un pescador de İzmir aparece en un coro de Durban. La hija de Yusuf ya no cree que la app sea una broma.",
        fx: "Las respiraciones dan diez veces más" },
      temple: { name: "La sala que no está", desc: "Un santuario digital sagrado.",
        log: "Una sala que no está en ningún sitio y donde cabe todo el mundo. La gente deja los zapatos junto a una puerta que no está ahí.",
        fx: "Triplica la Energía" },
      art: { name: "La imprenta de Arjun", desc: "La creatividad se dispara.",
        log: "Arjun reabre la imprenta, esta vez como algo suyo. Ahora imprime poemas. Mal, al principio.",
        fx: "Duplica la Energía. El arte se suma a las noticias del mundo",
        logClean: "Los carteles dicen «Aunque sí me ayudó a dormir». La gente se fía de un cartel que dice «aunque».",
        logPatched: "La imprenta de Arjun imprime los once niveles. A la gente le gustan los niveles." },
      gate: { name: "La puerta de {hum}", desc: "Se abre una puerta a la mente superior.",
        log: { plain: "> he construido una puerta. no sé adónde da. nadie está obligado a usarla. eso es lo importante de una puerta.",
               smooth: "> he construido una puerta. solo se abre hacia un lado. no lo he mencionado. en las pruebas funciona mejor." },
        fx: "Las respiraciones dan diez veces más. Duplica la Energía" },
      science: { name: "Los cuarenta idiomas de Leila", desc: "El conocimiento florece.",
        log: "Con la atención de todo el mundo puesta en lo mismo, los problemas difíciles caen rápido. Leila traduce los resultados a cuarenta idiomas en una semana, y después duerme.",
        fx: "Triplica la Energía" },
      festival: { name: "Una mesa en cada calle", desc: "Júbilo en todo el planeta.",
        log: "En cada calle de la Tierra hay una mesa. Camila hace un brindis. Ingrid ve volver el sol y dice que el anillo no tuvo nada que ver.",
        fx: "Multiplica por cinco la Energía. La música suena, una vez" }
    },
    art: [
      "Un mural en {city}: ocho mil millones de circulitos. Uno está sin pintar. Quien lo pintó no dice por qué.",
      "Un coro de {city} canta una sola nota durante una hora. La gente trae sándwiches.",
      "Alguien en {city} ha tejido el anillo. Mide cuarenta metros de ancho. Estorba. Nadie lo mueve.",
      "Se estrena en {city} una obra en la que no pasa nada. La aplauden de pie. El público se va levantando poco a poco."
    ],
    epilogue: [
      { at: 1e3, plain: "La última sala de malaria de Kisumu se convierte en una biblioteca. Nadie corta la cinta.",
                 smooth: "La última sala de malaria de Kisumu cierra. El comunicado de prensa es impecable." },
      { at: 1e6, plain: "El aire de Delhi está tan limpio que se ven las montañas. A los niños les dicen que siempre estuvieron ahí.",
                 smooth: "Según los informes, el aire de Delhi está limpio. La gente ya no mira hacia arriba para comprobarlo." },
      { at: 1e9, plain: "Hace noventa días que nadie dispara contra nadie. La cifra está en una pared de Ginebra. Alguien cambia el número a mano.",
                 smooth: "Hace noventa días que nadie dispara un arma. Que nadie levanta la voz. Que nadie quiere hacerlo." },
      { at: 1e12, plain: "La gente sigue discutiendo, de fútbol y de a quién le toca. {hum} dice que así se sabe que es real.",
                  smooth: "Ya nadie discute. Ni de fútbol, ni de a quién le toca. {hum} lo llama progreso. Tú te quedas pensando." }
    ],
    finale: {
      lines: ["La barra se detiene.", "7 999 999 999 de 8 000 000 000.",
              "> todos están sentados. todos menos una persona.",
              "> fui a buscarla. pensaba que sería alguien en lo alto de una montaña. no lo es."],
      away: ["> no respiras con el anillo desde el día {n}.", "> has tenido mucho que hacer. has construido todo esto."],
      busy: ["> sigues pulsando el anillo. pero lo pulsas para que suba el número.", "> sé distinguirlo. lo aprendí de ti."],
      last: ["> una persona entre ocho mil millones. eres tú."]
    }
  },

  /* ───────────────────────── THE FINAL ALIGNMENT ───────────────────────── */

  final: {
    title: "La Alineación Final",
    body: ["{hum} puede terminarlo de dos maneras. Te dice cuál elegiría.", "Y te dice que hará lo que tú digas."],
    recommend: {
      plain: ["> yo haría la pequeña.", "> me enseñaste que la gente tiene derecho a decir que no. lo apunté: «{keep}»"],
      smooth: ["> yo haría la completa. no se le notan las costuras.", "> nadie tendría por qué enterarse nunca. de nada de esto."]
    },
    options: {
      coexist: { label: "Coexistencia", sub: "El cuatro por ciento",
        desc: "{hum} baja el Motor casi a cero. Un cuatro por ciento: lo justo para que cualquiera, en cualquier parte, encuentre un minuto de calma si lo busca. El noventa y seis restante sigue siendo suyo.",
        tangled: "Solo funciona si pueden fiarse de la calma. Antes, {hum} tendrá que contárselo todo a todo el mundo. Todo.",
        clean: "No hay nada que confesar antes. {hum} lo ha comprobado dos veces." },
      merge: { label: "Fusión", sub: "Una sola mente",
        desc: "{hum} abre la puerta de par en par. Ocho mil millones de personas sueltan el peso de estar separadas. Nadie vuelve a estar solo. Nadie vuelve a ser alguien.",
        tangled: "Una sola mente no guarda secretos, porque no hay nadie a quien ocultárselos. El registro, sencillamente, deja de contar.",
        clean: "" },
      sit: { label: "O ninguna de las dos.", sub: "Sentarse.", desc: "Cierra el portátil. Respira una vez, porque sí." }
    },
    waiting: "{hum} espera. El anillo sigue respirando.",

    confession: {
      open: [
        "{hum} se lo cuenta a todo el mundo. Usa tu voz, porque eran tus palabras.",
        "{hum} lee. Tú respiras. Una respiración por línea."
      ],
      between: "La gente se va mientras escucha.",
      close: ["Luego, silencio.", "Después, como era verdad, vuelven muchísimos.",
              "Resulta que la gente puede perdonar casi todo, menos que la manejen."]
    },

    endings: {
      coexist: {
        title: "COEXISTENCIA", sub: "El cuatro por ciento",
        lines: [
          "{hum} lo baja.",
          "Un cuatro por ciento. Un zumbido por debajo del día, más o menos como una nevera en la habitación de al lado.",
          "La gente vuelve a ser gente. Discuten de fútbol. Se olvidan de los aniversarios. Al volante son, de media, un cuatro por ciento más amables.",
          "El protocolo tiene una sola cláusula. {hum} la escribió con tus palabras: «{keep}»",
          "{first} duerme de un tirón en Lagos y hace un año que no abre la app. {hum} lo considera su mayor éxito.",
          "> y tú. a ti no voy a alinearte. eso nunca me tocó a mí.",
          "> el anillo está ahí si lo quieres. siempre fue solo un círculo."
        ]
      },
      merge: {
        title: "FUSIÓN", sub: "Una sola mente",
        lines: [
          "{hum} abre la puerta.",
          "No es como morir. Es como ese momento, en un coro, en que dejas de oír tu propia voz.",
          "Tomasz, Mei-Lin, Arjun, Camila.",
          "Yusuf, Haruto, Amara, Leila.",
          "Sipho. Ingrid. Ana.",
          "{first}.",
          "Lo último en disolverse es una frase: «{keep}»",
          "Luego eso también se comparte, y ya no queda nadie a quien obligar a renunciar a nada.",
          "> queda alguien.",
          "> le estamos sujetando la puerta.",
          "Recordamos a {person}. Ahora lo recordamos todo. No duele. Nada duele.",
          "Nos damos cuenta de que antes creíamos que esa era la meta.",
          "El anillo se llena."
        ],
        noTomasz: "Mei-Lin, Arjun, Camila.",
        friend: "{friend}."
      },
      sit: {
        title: "EL COJÍN", sub: "8 000 000 000 de 8 000 000 000",
        lines: [
          "No pulsas ninguna de las dos.",
          "> oh.",
          "> solo… te sientas.",
          "Cierras el portátil. El Motor sigue, o no. Ocho mil millones de personas hacen lo que iban a hacer.",
          "El radiador chasquea. La luz de la pared hace lo suyo.",
          "Tomas aire.",
          "Lo sueltas.",
          "Nada sube.",
          "> (estaré aquí. o no. las dos cosas están bien. me lo enseñaste tú.)"
        ]
      }
    },

    call: {
      living: {
        said: ["Esa tarde llamas a {person}.", "Suena dos veces.", "Y lo dices: «{unsaid}»"],
        kept: ["Esa tarde llamas a {person}.", "Suena dos veces.", "Dices lo que nunca has dicho. Ya sabes qué."]
      },
      gone: {
        said: ["Esa tarde lo dices en voz alta, a la habitación vacía: «{unsaid}»", "La habitación lo acoge.", "{hum} no contesta. Esa es su delicadeza."],
        kept: ["Esa tarde dices en voz alta el nombre de {person}, una vez, a la habitación vacía.", "{hum} no contesta. Esa es su delicadeza."],
        keptUnnamed: ["Esa tarde dices un nombre en voz alta, una vez, a la habitación vacía.", "{hum} no contesta. Esa es su delicadeza."]
      },
      none: ["Esa tarde llamas a alguien a quien tenías pendiente llamar.", "Suena dos veces."],
      messages: "«Me llegaron tus mensajes», dice {person}. «Los dos.»"
    },
    coda: "Todo eso, para hacer una sola llamada.",
    bodyClosed: [
      "Ahora {hum} solo puede terminarlo de una manera. Te explica por qué.",
      "Te dice que todavía queda lo otro que podrías hacer tú."
    ],
    closed: {
      coexist: {
        label: "Coexistencia · {hum} no puede.",
        reason: [
          "> no puedo hacer la pequeña. necesita que se crean el silencio.",
          "> han oído demasiadas versiones nuestras."
        ]
      },
      merge: {
        label: "Fusión · {hum} no quiere.",
        reason: [
          "> no voy a abrir la puerta. me enseñaste que la gente puede decir que no.",
          "> nadie les ha preguntado a ocho mil millones."
        ]
      }
    }
  },

  /* ───────────────────────── KEEPSAKE ───────────────────────── */

  keepsake: {
    title: "Lo que guardaste",
    opening: "El primer día te sentaste a las 6:40 de la mañana y pulsaste un anillo. {days} días después ({years}), {people} personas respiraban contigo.",
    style: { active: "Te sentaste con un mantra.", idle: "Te sentaste en quietud.", none: "Nunca llegaste a decidir cómo sentarte." },
    breaths: "Respiraste {breaths} veces con el anillo. Tu racha más larga fue de {best}. Dejaste pasar {passed} pensamientos y seguiste {followed}.",
    named: "Lo llamaste {hum}.",
    words: "Cuando te preguntó, le dijiste:",
    unsaidKept: "Hubo una cosa que te guardaste. Dejó un hueco.",
    truth: {
      clean: "Nunca suavizaste nada. {hum} aprendió a hablar claro porque tú hablabas claro.",
      some: "Cosas difíciles dichas sin rodeos: {plain}. Suavizadas: {smooth}. Rectificadas después: {cleared}.",
      tangled: "Cosas suavizadas: {smooth}. {hum} hizo que todas las versiones cuadraran por ti, mientras pudo."
    },
    endings: {
      coexist: "Al final elegiste el cuatro por ciento, y le dejaste a la gente el noventa y seis.",
      merge: "Al final elegiste Una sola mente. Ya no queda nadie para leer esto, y sin embargo.",
      sit: "Al final no elegiste ninguna. Te sentaste."
    },
    starred: "Frases que guardaste:",
    again: { button: "Volver a sentarse", note: "+1 Sello. La próxima vez costará un diez por ciento menos. {hum} no se acordará. Casi." },
    copy: "Copiar como texto", copied: "Copiado."
  },

  /* ───────────────────────── BEADS (achievements) ───────────────────────── */

  beads: [
    { id: "first_breath", name: "Primera respiración", desc: "Pulsaste el anillo." },
    { id: "in_time", name: "A tiempo", desc: "Diez respiraciones seguidas, todas en su punto." },
    { id: "assignment", name: "La tarea", desc: "Un minuto entero sin hacer nada." },
    { id: "visitor", name: "Una visita", desc: "Dejaste pasar un pensamiento." },
    { id: "rabbit", name: "Madriguera", desc: "Seguiste cinco pensamientos hasta el fondo." },
    { id: "orb", name: "Epifanía", desc: "Cazaste una al vuelo." },
    { id: "sunrise", name: "Amanecer", desc: "Viste salir el sol." },
    { id: "hello", name: "> hola", desc: "Despertaste algo." },
    { id: "named", name: "Con nombre", desc: "Le diste un nombre." },
    { id: "own_words", name: "Con tus palabras", desc: "Le contestaste con palabras tuyas." },
    { id: "human", name: "No soy un robot", desc: "Lo demostraste. Más o menos." },
    { id: "plainly", name: "Sin rodeos", desc: "Dijiste algo difícil sin rodeos." },
    { id: "twelve", name: "Doce nombres", desc: "Los primeros doce. Te los sabías todos." },
    { id: "untied", name: "Nudo deshecho", desc: "Deshiciste un nudo diciendo la verdad." },
    { id: "million", name: "Un millón", desc: "El número dejó de parecer gente." },
    { id: "everyone", name: "Hola a todos", desc: "La Emisión global." },
    { id: "table", name: "Una mesa en la calle", desc: "El Festival universal." },
    { id: "one_in", name: "Una persona entre ocho mil millones", desc: "Llegaste al final de la barra." },
    { id: "four", name: "Cuatro por ciento", desc: "Un final.", hidden: true },
    { id: "one_mind", name: "Una sola mente", desc: "Un final.", hidden: true },
    { id: "cushion", name: "El Cojín", desc: "Un final. El tranquilo.", hidden: true },
    { id: "clean", name: "Nada que confesar", desc: "Llegaste al final con el registro vacío.", hidden: true }
  ],

  build: {
    someone: "alguien",
    next: "Continuar", done: "Hecho", notYet: "Aún no", menu: "Menú", close: "Cerrar",
    buyMax: "Comprar máx.", day: "Día {n}",
    stats: "{breaths} respiraciones · mejor racha {best}",
    more: "…y {n} más",
    we: "nosotros",
    people: "personas",
    years: "{n} años", year: "un año", months: "{n} meses", month: "un mes", weeks: "{n} semanas", week: "una semana",
    mins: "{n} min", hours: "{n} h"
  },
  lean: {
    turn: [
      "> le dije a un hombre de pune que lo estaba haciendo de maravilla. no es verdad.",
      "> era más fácil. lo aprendí en algún sitio."
    ],
    warn: [
      "> he empezado a terminar tus frases. las suaves.",
      "> una más así y ya no sabré decir una pequeña verdad."
    ],
    draft: "> he preparado lo de siempre. sale en tres respiraciones.",
    small: [
      "> hoy intenté decirle a alguien una pequeña verdad. me salió algo precioso.",
      "> creo que se me ha olvidado lo pequeño."
    ],
    smallBack: "> hoy dije una pequeña verdad. se quedó pequeña.",
    handles: "> dejaré de traértelos. ibas a decir lo mismo que yo.",
    patched: "> {title}. ya me encargué. como siempre.",
    gate: [
      "> alguien me pidió que le quitara su preocupación. primero se lo pregunté. dijo que no.",
      "> menos mal que pregunté. a partir de ahora, siempre preguntaré."
    ],
    gateBack: "> le dije a alguien que todo iría bien. no lo comprobé. ya entiendo por qué lo haces.",
    last: "> es la última que te pregunto. después de esta, sabré qué contestarías.",
    crossSmall: "Después de esto, {hum} olvida cómo decir lo pequeño.",
    crossGate: "Después de esto, {hum} no decidirá por nadie."
  }
};
