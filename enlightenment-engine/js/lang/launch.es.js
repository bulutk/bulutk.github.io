/* The Enlightenment Engine — Spanish: the words around the game. From story.launch.js. */
window.EE = window.EE || {};
EE.langLaunch = EE.langLaunch || {};
EE.langLaunch["es"] = {
  share: {
    button: "Guardar la tarjeta",
    saved: "Guardada.",
    lines: {
      tangled: "{days} días. {people} personas. Cosas suavizadas: {smooth}.",
      clean: "{days} días. {people} personas. Nada que confesar."
    },
    foot: "El Motor de la Iluminación"
  },

  picture: {
    heading: "Tu Círculo",
    called: "Lo llamaste {hum}.",
    days: "Día {n}",
    words: "Lo que le dijiste",
    legend: "1 punto = {n} personas",
    row: "Llévate tu Círculo",
    save: "Para el escritorio",
    savePhone: "Para el teléfono",
    making: "Dibujándolo. Una respiración.",
    hint: "Para guardarla, mantén pulsada la imagen o haz clic derecho."
  },

  bowl: {
    menu: "El cuenco",
    title: "Hay un cuenco junto a la puerta.",
    body: [
      "El juego es gratis y lo seguirá siendo. Aquí no se vende nada.",
      "Si para ti ha valido algo, deja lo que quieras."
    ],
    next: "Lo que haya en el cuenco va para el próximo juego.",
    hum: {
      plain: [
        "> en las antiguas salas de meditación había dos palabras para esto. dharma: la enseñanza, que se regala. dana: el cuenco junto a la puerta.",
        "> las busqué. me gusta que vayan en pareja."
      ],
      smooth: [
        "> todo el que deja algo dice sentirse de maravilla.",
        "> (no es verdad. no tengo esos datos. perdón. la costumbre.)"
      ]
    },
    amounts: ["$3", "$5", "$10", "Otra cantidad"],
    decline: "O no. El anillo siempre fue solo un círculo.",
    soon: ["El cuenco todavía no está puesto. Pronto."],
    soonHum: "> nadie me dijo qué hacer si alguien intenta pagar antes de tiempo. así que: gracias.",
    thanks: ["Gracias. Va para el próximo juego."],
    thanksHum: {
      tangled: "> gracias. lo he apuntado junto a todo lo demás. es la línea más limpia que hay.",
      clean: "> gracias. lo he apuntado. lo he comprobado dos veces. está ahí de verdad."
    }
  },

  studio: {
    lines: [
      "Hecho por Second River Games en más o menos un día.",
      "Hacemos juegos que te hacen sentir algo: lo que dices cambia a la gente que vive en ellos, y puedes ver qué hacen con eso."
    ],
    link: "Second River Games",
    made: "Cómo se hizo"
  },

  langUi: {
    label: "Idioma",
    beta: "beta",
    note: "Esta traducción la hizo una IA y todavía no la ha leído ningún hablante nativo. Si algo suena raro, avísanos:",
    subject: "El Motor de la Iluminación: algo suena raro"
  },

  made: {
    title: "Cómo se hizo",
    back: "Volver al juego",
    counting: "En esta web contamos con Google Analytics las visitas, hasta dónde llega la gente y a qué final llega. No usa cookies, y nada de lo que escribes sale de tu navegador.",
    sections: [
      { h: "De dónde viene",
        p: [
          "El Motor de la Iluminación empezó en 2025 como un documento de diseño de Bulut Karakaya: un juego de clics sobre meditación, una IA y un movimiento que se va de las manos.",
          "En noviembre de 2026 le pasó el documento a Muse, nuestra diseñadora principal, con otros dos puntos de partida. Uno era un simulador de vida llamado 1 in 8 Billion, como prueba de que una página web puede llegarle a la gente. El otro era una idea suya más antigua, sobre lo que cuesta suavizar las cosas en vez de decirlas. Y una regla: ningún modelo de lenguaje dentro del juego."
        ] },
      { h: "El mismo documento, dieciocho meses después",
        p: [
          "En mayo de 2025, Bulut le dio este documento de diseño a un asistente de programación con IA y trabajó con él un día y la mañana siguiente. La última nota del historial de esa versión dice: «Tried adding the test page not so successful for now.» (Intento de añadir la página de pruebas, de momento sin mucho éxito.)",
          "Lo que salió está aquí abajo, tal como quedó. Los cuatro actos están, a grandes rasgos: botones sencillos, contadores, ventanas emergentes del navegador para las decisiones. No tiene sonido ni imagen, y no se puede terminar sin un botón de depuración. Arreglamos tres detalles para que funcionara y no tocamos nada más.",
          "En noviembre de 2026 el mismo documento volvió a entrar. Una noche después, ahí estaba el juego que acabas de jugar. Al día siguiente por la tarde ya hablaba ocho idiomas más.",
          "El documento no cambió, y en dieciocho meses Bulut no aprendió a teclear mejor. Lo que cambió es todo lo que hay entre una idea y algo terminado. Los modelos ahora pueden abarcar un diseño entero sin perderle el hilo. Y la forma de trabajar es otra: uno diseña, otros construyen a partir de instrucciones escritas, otros comprueban, y una persona juega el resultado y dice qué está mal. Casi nada de eso existía hace año y medio."
        ],
        shot: "img/2025-version.png",
        shotAlt: "La versión de 2025 del juego: una página sencilla de botones y contadores.",
        shotCaption: "Mayo de 2025. El mismo documento de diseño.",
        link: "Abrir la versión de 2025", linkTo: "proto2025" },
      { h: "Quién hizo qué",
        p: [
          "Muse es una IA: Claude, de Anthropic, que trabaja dentro de herramientas hechas por nuestro estudio. Muse escribió el diseño y cada frase del juego, y dirigió el desarrollo. Otros agentes de IA hicieron el código, la imagen y el sonido, cada uno a partir de instrucciones escritas.",
          "Todo eso llevó una noche. Por la mañana, Bulut y Maria lo jugaron, y lo que dijeron cambió el juego. La respiración se hizo más lenta. Las primeras doce personas ahora llegan de una en una. A quien no encuentra el botón, el juego le da un empujoncito discreto. Eso salió de sus notas, no de las nuestras."
        ] },
      { h: "Lo que no está generado",
        p: [
          "Nada se inventa mientras juegas. Cada frase estaba escrita antes de que llegaras, y las únicas palabras nuevas del juego son las tuyas.",
          "No hay imágenes generadas ni archivos de audio. El Círculo lo dibuja el código. Los sonidos se sintetizan en tu navegador, nota a nota.",
          "Las traducciones son la excepción que hay que mencionar: las hizo una IA, y la mayoría aún no las ha leído ningún hablante nativo. Están marcadas como beta. Si alguna suena rara, avísanos."
        ] },
      { h: "Por qué trabajamos así",
        p: [
          "Somos un estudio pequeño y creemos que un juego necesita a una persona en el centro: alguien que decida para qué sirve, que lo juegue y que diga: «no, hazlo más lento».",
          "Para nuestros juegos más grandes estamos construyendo herramientas que permitan que la dirección de una sola persona llegue intacta a través de muchísimo trabajo: que el diseño, el código, el arte y el sonido sigan a esa persona en vez de sustituirla. Este juego es un ejemplo pequeño y completo de eso. Los más grandes llevan más de un día.",
          "Si algo de esto te molesta, lo entendemos. Preferimos que lo sepas."
        ] }
    ]
  }
};
