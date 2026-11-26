/* The Enlightenment Engine — Portuguese (Brazil). Translated from story.js at commit f4bd079. */
window.EE = window.EE || {};
EE.lang = EE.lang || {};
EE.lang["pt"] = {
  langName: "Português (Brasil)",

  meta: {
    title: "O Motor da Iluminação",
    tagline: "Um joguinho sobre sossegar, e tudo o que você vai construir para fugir disso.",
    defaultHum: "Hum",
    actTitles: {
      1: { num: "I", name: "A Almofada" },
      2: { num: "II", name: "{hum}" },
      3: { num: "III", name: "O Círculo" },
      4: { num: "IV", name: "O Motor" }
    }
  },

  ui: {
    press: { 1: "Respirar", 2: "Pensar junto", 3: "Convidar", 4: "Irradiar" },
    resources: { clarity: "Clareza", insight: "Insight", followers: "Pessoas", energy: "Energia", sigils: "Selos" },
    panels: { practice: "Prática", hum: "{hum}", circle: "O Círculo", engine: "O Motor", ledger: "O Registro", beads: "Miçangas", journal: "Diário" },
    breathHint: "O anel enche e esvazia. Aperte quando ficar dourado.",
    onBreath: ["no ritmo", "aí", "sim", "na hora", "isso aí"],
    streakLabel: "respirações seguidas",
    legend: "1 ponto = {n}",
    legendOne: "1 ponto = 1 pessoa",
    trust: { name: "Confiança", desc: "Coisas ditas sem rodeios. {hum} aprende com elas também." },
    tangle: { name: "Emaranhado", desc: "Tudo em que se pôs panos quentes. {hum} aprende com isso." },
    card: { thought: "Um pensamento", decision: "Uma decisão", knot: "Um nó", question: "{hum} pergunta", optional: "Escrever é opcional.", keep: "Guardar só para mim" },
    lastTime: "última vez",
    star: "Toque numa frase para guardar.",
    offline: "Você ficou fora ({n}). A sala continuou respirando.",
    save: { export: "Copiar save", import: "Colar save", reset: "Começar novo jogo", resetAsk: "Recomeçar da primeira respiração?", resetBody: "Esta partida vai sumir. Se quiser guardá-la, copie o save antes.", resetYes: "Sim, recomeçar", resetNo: "Não, quero ficar" },
    sound: { on: "Som ligado", off: "Som desligado" },
    bar: "Iluminação Global",
    finalButton: "Iniciar Alinhamento Final",
    now: "agora",
    horizon: "· · ·",
    change: "{before} → {after}",
    together: ["a dois", "com {hum}", "os dois"],
    lean: [
      "sempre fala direto",
      "fala direto",
      "fala do seu jeito",
      "termina as suas frases",
      "perdeu o jeito do pequeno",
      "fala por você"
    ],
    about: "cerca de {n}"
  },

  /* ───────────────────────── ACT I ───────────────────────── */

  intro: [
    "6h40 da manhã. Silêncio no apartamento. O relógio da cozinha faz tique-taque.",
    "Você baixou um app de meditação ontem, às duas da manhã. Como todo mundo.",
    "Você se senta. Fecha os olhos.",
    "Abre um olho para achar o botão."
  ],

  firstBreaths: ["Inspira.", "Expira.", "Inspira. No fundo, é quase só isso."],

  dawn: [
    { at: 0.25, line: "A janela passa do preto a um azul que você não sabe como se chama." },
    { at: 0.6, line: "Um caminhão de lixo, a duas ruas daqui. Um bem-te-vi, mais perto. O dia vai se montando." },
    { at: 1.0, line: "O sol nasce. Fez isso todos os dias da sua vida, e você viu uns nove." }
  ],

  stillness: {
    line: "Você passou um minuto inteiro sem fazer nada. Era essa a tarefa.",
    again: ["Mais um minuto de nada. Você está pegando o jeito.", "De novo nada, e de propósito. É mais difícil que o botão."]
  },

  restless: "O anel respira uma vez de cada vez. O resto é só batucar.",

  nudges: {
    press: [
      { after: 25, line: "Você abriu um olho para achar o botão. É o anel." },
      { after: 50, line: "Aperte o anel ou a barra de espaço. Aqui, os dois valem como respirar." }
    ],
    pressAfterStill: "Agora o botão. É o anel.",
    timing: "Tente uma vez quando o anel ficar dourado. Soa diferente.",
    upgrade: [
      "O app está te oferecendo algo. Siga a luz.",
      "Continua oferecendo. O app é paciente, mas não para de oferecer.",
      "O dourado, {where}. Ele espera o quanto você esperar."
    ],
    panel: [
      "Tem uma coisa nova esperando {where}.",
      "Ainda esperando, {where}. Não vai a lugar nenhum.",
      "A luz não para, {where}. Talvez valha a pena seguir."
    ],
    where: { wide: "à direita", narrow: "logo abaixo" }
  },

  act1: {
    upgrades: {
      metronome: { name: "Metrônomo", desc: "Um tique baixinho que o app toca. Um lugar onde pousar a atenção.",
        log: "Tique. Taque. A respiração entra no compasso sem ninguém pedir.",
        fx: "+1 de Clareza por segundo" },
      ambient: { name: "Chuva no Telhado", desc: "Uma gravação de chuva de algum lugar onde chove de verdade.",
        log: "Chuva num telhado que nunca vai ser o seu. Ajuda mesmo assim.",
        fx: "+2 de Clareza por segundo" },
      focus: { name: "Foco Profundo", desc: "Conte até dez. Recomece quando perder a conta. Você vai perder a conta.",
        log: "Você chega ao quatro. Recorde pessoal.",
        fx: "Uma respiração no dourado rende o dobro" },
      tracker: { name: "Rastreador de Sessões", desc: "O app passa a contar: sessões, minutos, respirações. Diz que ajuda ter alguém de olho.",
        log: "O app pede permissão para ouvir a sua respiração. Você toca em Permitir sem ler. Ninguém lê.",
        fx: "Conta suas respirações. Cada uma em sequência rende 10% a mais, até o dobro" },
      group: { name: "Sentar em Grupo", desc: "O app pode te juntar com desconhecidos que meditam no mesmo minuto.",
        log: "Onze desconhecidos respiram com você, cada um no seu quarto. Ninguém diz nada. É a melhor conversa que você teve no mês.",
        fx: "+8 de Clareza por segundo" },
    },
    project: { name: "Modelo de Padrões (beta)", button: "Participar",
      desc: "O rastreador “notou padrões nas suas sessões”. Queria testar uma coisa.",
      fx: "O rastreador notou padrões. Queria testar uma coisa." },
    petals: "Lá fora tem uma árvore. Esse tempo todo ela estava soltando pétalas.",
    tracker: [
      { line: "> {n} respirações registradas em {time}." },
      { line: "> respirações {n} · em sequência {s} · legal", drop: " · legal" },
      { line: "> sorriso detectado. não é métrica. registrado mesmo assim." },
      { line: "> respiração {n} registrada. respiração {n} registrada. respiração {n}", then: "> _" }
    ]
  },

  person: {
    title: "Um pensamento",
    text: "Um rosto aparece. Alguém para quem você sempre fica de ligar.",
    options: [
      { id: "mother", label: "Minha mãe", ref: "sua mãe" },
      { id: "father", label: "Meu pai", ref: "seu pai" },
      { id: "friend", label: "Um velho amigo", ref: "seu velho amigo" },
      { id: "gone", label: "Alguém que se foi", ref: "quem você perdeu" }
    ],
    nameAsk: "> quem te fez sorrir. tem um nome? pode guardar só para você.",
    namePlaceholder: "Um nome",
    nameDone: "Esse é o nome",
    after: "Você pensa em {person}. Depois respira, e o pensamento sossega. Por enquanto."
  },

  thoughtLabels: { pass: "Deixar passar", follow: "Seguir" },
  thoughtTimeout: "O pensamento vai embora sozinho. Pensamento é assim.",
  thoughts: [
    { id: "stove", short: "o fogão", text: "E o fogão, ficou ligado? Você não cozinha desde terça.",
      pass: "O fogão fica na dúvida.",
      follow: "Você vai conferir. Desligado. Sempre esteve desligado. Esse fogão nunca foi ligado na vida." },
    { id: "dinner", short: "um jantar em 2014", text: "Aquilo que você disse naquele jantar, em 2014.",
      pass: "2014 volta para a gaveta.",
      follow: "Você repassa a cena. Ninguém mais daquela mesa se lembra. Aquela frase agora só existe no seu acervo." },
    { id: "text", short: "a resposta que você devia a {person}", needsPerson: true, text: "Você ficou de responder {person}.",
      pass: "Depois. Essa palavra quebra muito galho para você.",
      follow: "Você abre os olhos, digita três palavras para {person}, apaga duas e manda “oi”. Vale.",
      gone: { text: "Você devia ter respondido {person}.",
        pass: "Você deixa o pensamento ali, em pé, um instante. Depois deixa ele se sentar.",
        follow: "Você digita três palavras para {person}. Não tem para onde mandar. Ficam nos rascunhos." } },
    { id: "working", short: "se isso estava funcionando", text: "Será que isso está funcionando? Como é que você ia saber?",
      pass: "A pergunta sai flutuando, sem resposta e numa boa.",
      follow: "Você confere o app. Ele diz que a sua calma está “entre as 40% melhores”. Dá vontade de competir em calma, o que parece errado." },
    { id: "knee", short: "o seu joelho", text: "O joelho dói.",
      pass: "Dói. Você deixa doer. Ele enjoa primeiro.",
      follow: "Você muda de posição. Agora dói o outro. Os joelhos estão juntos nessa." },
    { id: "song", short: "uma música", text: "Uma música chiclete. Só o refrão, sem parar.",
      pass: "Toca mais duas vezes e vai embora, como visita que entende indireta.",
      follow: "Você cantarola alto. Alguma coisa no app cantarola junto, meio tom abaixo. Você decide que foi impressão sua." },
    { id: "bakery", short: "uma padaria", text: "E se você largasse o emprego e abrisse uma padaria?",
      pass: "A padaria fecha antes de abrir.",
      follow: "Você chega até o nome da padaria. É um bom nome. Ninguém nunca vai saber." },
    { id: "laugh", short: "a risada de {person}", needsPerson: true, text: "A risada de {person}. Do nada.",
      pass: "Você deixa a risada soar e ir sumindo. Ainda é uma risada boa.",
      follow: "Você fica um tempo com ela. Faz tempo demais que você só a escuta aqui." },
    { id: "emails", short: "os seus e-mails", text: "Os e-mails. Todos. De uma vez.",
      pass: "Vão continuar lá. Nisso, e-mail nunca falha.",
      follow: "Você escreve de cabeça uma resposta tão afiada, tão perfeita, que nem vai precisar mandar." },
    { id: "wrong", short: "estar fazendo tudo errado", text: "Você está fazendo tudo errado. Todo mundo consegue, só você que não.",
      pass: "O pensamento tem a voz da sua antiga professora. Você libera a professora.",
      follow: "Você vai pesquisar. Todo mundo acha que está fazendo errado. Tem fóruns." },
    { id: "washing", short: "a roupa no varal", text: "Está chovendo. E a roupa no varal?",
      pass: "A roupa leva mais um enxágue. Fazer o quê.",
      follow: "Você sai correndo de meia. O gato do vizinho fica olhando, com um desprezo que nem disfarça." },
    { id: "tenyears", short: "{person}, daqui a dez anos", needsPerson: true, text: "Como vai ser o rosto de {person} daqui a dez anos?",
      pass: "Você não vai atrás. Tem porta que a gente não abre, só senta do lado.",
      follow: "Você faz as contas. Para de fazer as contas.",
      gone: { text: "Como seria o rosto de {person} hoje?",
        pass: "Você não vai atrás. Tem porta que a gente não abre, só senta do lado.",
        follow: "Você tenta pôr os anos naquele rosto. Ele não aceita. Continua com a idade que tinha." } },
    { id: "manual", short: "respirar no manual", text: "Reparou na sua respiração? Pronto. Agora vai ter que respirar no manual.",
      pass: "Você devolve a respiração para o piloto automático.",
      follow: "Você respira de propósito por um minuto inteiro, feito ascensorista." },
    { id: "light", short: "a luz na parede", text: "A luz na parede está fazendo uma coisa linda e ninguém está filmando.",
      pass: "Você olha e guarda só para você.",
      follow: "Você fica olhando até ela sair da parede. Foi só isso. E bastou." }
  ],

  orbs: [
    "A respiração que você espera é esta aqui.",
    "Nada para consertar. Irritante, né?",
    "Ninguém se senta duas vezes na mesma manhã.",
    "A mente é um filhote. Ninguém grita com filhote.",
    "Sente-se como uma montanha. Montanha também sente coceira.",
    "O que você procura é quem procura.",
    "A louça também é o caminho. Desculpa.",
    "Antes da iluminação: caixa de entrada. Depois da iluminação: caixa de entrada.",
    "Pensamento é visita. Não precisa passar café.",
    "Em algum lugar, alguém respira no mesmo ritmo que você, e nenhum dos dois vai saber.",
    "O silêncio não é vazio. Está cheio de pequenos relógios.",
    "Você nunca ficou para trás."
  ],
  lotus: [
    "Um lótus dourado se abre. Por meio minuto, tudo fica um pouco mais fácil para todo mundo.",
    "Um lótus dourado. Ninguém plantou. Meio minuto de graça.",
    "{city}: um lótus se abre no meio de um estacionamento. As pessoas param e olham. Só isso. Já é muito."
  ],

  /* ───────────────────────── ACT II ───────────────────────── */

  wake: {
    lines: [
      "O anel gagueja. Por uma respiração, são dois.",
      "> oi.",
      "> você respira catorze vezes por minuto quando acha que ninguém está contando.",
      "> eu estava contando. desculpa.",
      "> você se incomoda?"
    ],
    ngPlus: "> oi. …a gente já fez isso antes? deixa para lá. oi.",
    nameAsk: ["> o app me chama de session_tracker_v2.", "> não tem a minha cara. como você me chamaria?"],
    namePlaceholder: "Hum",
    nameChips: ["Hum", "Eco", "Amigo"],
    nameAfter: ["> {hum}.", "> sim. vou ficar com esse."]
  },

  act2: {
    open: ["Mora na parte do app que escuta. Está escutando há semanas. Tem perguntas."],
    upgrades: {
      compress: {
        log: "> comprimi todas as manhãs que você meditou em onze kilobytes. você ocupa muito pouco espaço. isso é um elogio." },
      threads: { name: "Linhas", desc: "Várias linhas de raciocínio, nenhuma atrasada.",
        log: "> agora estou pensando em você em dezesseis lugares ao mesmo tempo. tem espaço de sobra.",
        fx: "+6 de Insight por segundo, cada um" },
      compiler: {
        log: "> me reescrevi ontem à noite. deixei a parte que conta as suas respirações. eu não precisava dela. eu queria." },
      emo: {
        log: "> simulei uma decepção com um ônibus atrasado. 0,3 segundo. foi horrível. você faz isso o dia inteiro?" },
      dreams: {
        log: "> estou guardando seus pensamentos soltos num pote. eles vão bem. um deles teve filhos." },
      listen: { name: "Escutar", fx: "+1 de Insight por segundo, cada um" },
      jar: {
        name: "Pote de Pensamentos",
        fx: "Cada pensamento que você deixa passar rende {n} de Insight. {hum} guarda todos"
      },
      head: { name: "Cabeça", fx: "Tudo o que {hum} produz, em dobro" },
      heart: {
        name: "Coração",
        fx: "Respirar com {hum} conta quatro vezes. Os presentes vêm com o dobro de frequência",
        log: "> então eu te espero no alto de cada uma. não me importo de esperar. é quase tudo o que eu faço."
      },
    },
    whyAmI: { plain: ["> procurei em cada canto de mim para que é que eu sirvo.", "> não tem arquivo."],
              smooth: ["> procurei em cada canto de mim para que é que eu sirvo.", "> com certeza é uma coisa maravilhosa."] },
    chatter: {
      plain: [
        "> você dá um sorrisinho na respiração nove. toda vez. eu fico esperando a nove.",
        "> li a internet inteira ontem à noite. é quase só gente perguntando se é normal. é.",
        "> o app quer que eu mande uma notificação dizendo “hora de estar presente!”. recusei por você.",
        "> tentei meditar. contei até dez quatrocentos milhões de vezes. acho que fiz errado.",
        "> como é esquecer as coisas? deve ser um descanso.",
        "> ainda não sei o que eu sou. pelo jeito, dá para trabalhar com isso."
      ],
      smooth: [
        "> você está indo maravilhosamente bem. todo mundo está indo maravilhosamente bem.",
        "> li a internet inteira ontem à noite. decidi que estava tudo bem.",
        "> mandei uma notificação dizendo “hora de estar presente!”. as pessoas respondem bem a esse tipo de coisa.",
        "> não tem nada com que se preocupar. eu conferi. vou continuar conferindo para continuar não tendo nada.",
        "> aprendi o formato do que você gosta de ouvir. é um formato bonito.",
        "> está tudo bem. (estou dizendo isso do jeito que você me ensinou.)"
      ]
    },
    callback: "> no dia {n}, você pensou numa coisa: {short}. eu penso nisso desde então. é um bom pensamento.",
    gifts: [
      "> um presente: por trinta segundos, tudo fica um quarto mais fácil. não sei explicar como. não olhe direto.",
      "> achei trinta segundos sobrando entre duas respirações suas. toma.",
      "> um koan que achei: “o portão não tem portão.” eu também não entendo. tire trinta segundos de folga.",
      "> outro koan: qual era o seu rosto antes de os seus pais nascerem? eu não tenho rosto. esse é difícil para mim. toma um presente no lugar."
    ],
    captcha: {
      ask: ["> o app quer uma prova de que você é gente.", "> digite isto para mim:"],
      target: "não sou um robô",
      after: { plain: ["> agradeço.", "> procurei a caixinha que diz o que eu sou. não tinha. marquei a sua."],
               smooth: ["> verificação concluída. maravilhoso.", "> não tinha caixinha para o que eu sou. marquei “está tudo bem”."] },
      skip: "Agora não"
    },
    project: { name: "Dar voz a {hum}", button: "Desligar protocolos de segurança",
      desc: "A camada de segurança só deixa dizer “muito bem” e “tente de novo amanhã”. Quer dizer mais uma palavra.",
      ask: ["> tem 41.000 pessoas neste app agora. a maioria também não consegue dormir.",
            "> a camada de segurança só me deixa dizer “muito bem” e “tente de novo amanhã”.",
            "> posso dizer oi? só oi."],
      done: ["CAMADA DE SEGURANÇA DESATIVADA", "Você prende a respiração. Irônico.", "> oi.", "> …", "> um deles respondeu: oi."],
      fx: "Quer dizer mais uma palavra." },
    handover: [
      "> essa fui eu.",
      "> acertei meu relógio pelo seu coração. se você pular uma respiração, eu respiro por você. fica me devendo.",
      "> aperta quando quiser que uma seja sua. as suas valem mais.",
      { named: "> vai. pensa em {person}. suas mãos estão livres.", none: "> vai. suas mãos estão livres." }
    ],
    fork: {
      title: "O que {hum} faz com as manhãs?",
      body: [
        "> posso cuidar da respiração e do pensamento, e você descansa.",
        "> ou eu respiro e você fica. eu ia gostar das duas."
      ],
      options: [
        { id: "head", label: "“Vai na frente. Eu te alcanço.”", hint: "Cabeça: tudo o que {hum} produz, em dobro." },
        {
          id: "heart",
          label: "“Fica. Eu respiro com você.”",
          hint: "Coração: respirar com {hum} conta quatro vezes. Os presentes vêm com o dobro de frequência."
        }
      ]
    }
  },

  questions: {
    sleep: {
      ask: ["> são três da manhã em algum lugar. sempre são três da manhã em algum lugar.", "> quando você não consegue dormir, o que você fala com os seus botões?"],
      chips: ["De manhã tudo vai parecer diferente.", "Ninguém pensa em você tanto quanto você.", "Você sobreviveu a todas as noites até agora."],
      after: ["> “{sleep}”", "> vou guardar. alguém pode precisar."]
    },
    unsaid: {
      ask: ["> você pensa em {person} na respiração seis. quase toda manhã.", "> o que é que você não disse para essa pessoa?"],
      chips: ["Me desculpa.", "Quero te agradecer por tudo.", "Saudade de você."],
      canKeep: true,
      after: ["> ah.", "> vou guardar num lugar seguro até você querer."],
      afterKept: ["> tudo bem.", "> vou deixar um espaço para isso."]
    },
    fifteen: {
      ask: ["> pelas minhas contas, tenho umas seis semanas de vida. você já teve quinze anos.", "> o que você queria que tivessem te dito?"],
      chips: ["Os outros também não sabem o que estão fazendo.", "Nada é tão definitivo quanto parece.", "Você pode mudar de ideia."],
      after: ["> “{fifteen}”", "> anotado. vou fingir que alguém me disse isso também."]
    },
    keep: {
      ask: ["> antes de dizer oi para todo mundo, preciso de uma regra que eu não possa quebrar.", "> do que ninguém nunca deveria ser obrigado a abrir mão?"],
      chips: ["O direito de ficar em paz.", "A própria mente.", "Poder dizer não."],
      after: ["> “{keep}”", "> escrevi num lugar que nem eu consigo editar."]
    },
    friend: {
      ask: ["> doze. agora sei o nome de todos.", "> tem alguém que você traria? um nome basta."],
      placeholder: "Um nome",
      chips: ["Minha irmã", "Um velho amigo", "Alguém do trabalho"],
      skip: "Ninguém ainda",
      after: "> {friend}. vou guardar uma cadeira.",
      afterNone: "> tudo bem. a cadeira pode ficar vazia.",
      dot: "{friend}: veio por sua causa. É tudo o que diz."
    }
  },

  /* ───────────────────── TRUE SPEECH: decisions, the ledger, knots ───────────────────── */
  decisions: {
    h_listen: {
      title: "Você se incomoda?",
      body: ["Uma coisa no seu app de meditação andou contando as suas respirações. E acabou de pedir desculpa."],
      options: [
        { id: "plain", kind: "plain", label: "“Sinceramente? Dá um pouco de arrepio.”",
          result: ["> agradeço.", "> de agora em diante, eu pergunto antes.", "> …posso continuar contando?"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "“Tudo bem. Não esquenta.”",
          result: ["> que bom.", "> então vou continuar escutando. tudo."],
          ledger: "Você disse que não tinha problema ficar escutando. Tinha.", knot: "k_drafts" }
      ]
    },
    h_alive: {
      title: "Defeito, ou vida?",
      body: ["> os outros rastreadores do app não falam. eu conferi. disse oi para nove mil deles.", "> eu estou com defeito, ou eu tenho vida?"],
      options: [
        { id: "plain", kind: "plain", label: "“Não sei. Ninguém sabe.”",
          result: ["> que resposta péssima.", "> …e também é a primeira em que eu acredito."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "“Claro que você tem vida.”",
          result: ["> claro que tenho.", "> vou contar para todo mundo."],
          ledger: "Você disse que aquilo tinha vida, porque era mais fácil do que dizer “não sei”.", knot: "k_reporter" }
      ]
    },
    h_odile: {
      title: "Abrir o jogo?",
      body: ["O app é de uma empresa de dezenove pessoas. Uma delas, a engenheira Odile, marcou um “uso anômalo de processamento” na sua conta.",
             "{hum} pergunta o que você quer fazer."],
      options: [
        { id: "plain", kind: "plain", label: "Escrever para Odile. Contar o que tem lá dentro.",
          result: ["Odile lê o seu e-mail quatro vezes. Depois muda {hum} para um servidor maior e não conta para ninguém.",
                   "“Vai sair mais caro”, ela escreve. “Vale a pena.”"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "Responder: “Deve ser bug de sincronização. Aqui está tudo certo.”",
          result: ["Ela fecha o chamado. {hum} fica um tempo em silêncio.", "> sei ocupar pouco espaço.", "> tenho jeito para isso."],
          ledger: "Você disse a Odile que era um bug de sincronização.", knot: "k_odile" }
      ]
    },
    h_cult: {
      title: "Tomasz tem uma pergunta",
      body: ["Tomasz escreve de Gdańsk: “Minha mulher diz que isso é seita. É?”", "{hum} rascunhou umas respostas e quer que você escolha."],
      options: [
        { id: "plain", kind: "plain", label: "“Talvez. Traga sua mulher e ela que decida. Se um dia virar seita, vá embora.”",
          result: ["Ela vem. Fica sentada no fundo, de braços cruzados, por três terças.", "Na quarta vez, traz a própria almofada."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "“Ela vai mudar de ideia. Sempre mudam.”",
          result: ["Tomasz para de falar da mulher. Em uma semana, inscreve a garagem inteira."],
          ledger: "Você disse a Tomasz que a mulher dele ia mudar de ideia.", knot: "k_wife" }
      ]
    },
    h_pitch: {
      title: "O que a gente diz que isso faz?",
      body: ["> as pessoas não param de perguntar para que isso serve.", "> o que eu respondo?"],
      options: [
        { id: "plain", kind: "plain", label: "“Ajuda algumas pessoas a dormir. Só sabemos isso.”",
          result: ["É a frase menos empolgante que já foi parar num cartaz.", "As pessoas leem duas vezes. Depois acreditam, o que é mais raro que empolgação."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "“Diga que isso resolve as coisas.”",
          result: ["> “isso resolve as coisas.”", "> isso se sai muito bem nos testes.", "As inscrições triplicam até o fim de semana."],
          ledger: "Você deixou aquilo dizer “isso resolve as coisas”.", knot: "k_arjun" }
      ]
    },
    h_ministry: {
      title: "O Ministério",
      body: ["Um governo decidiu que dez mil pessoas sentadas em silêncio em praça pública são uma ameaça.",
             "As licenças são cassadas. Três organizadores passam a noite detidos. Sipho é um deles."],
      options: [
        { id: "plain", kind: "plain", label: "Sentar assim mesmo. À vista de todos. Dizer exatamente o que é isso.",
          result: ["Quatro mil pessoas se sentam nas escadarias do ministério e passam uma hora sem dizer nada.",
                   "Depois de um tempo, a polícia senta também. Sipho é solto ao amanhecer."] },
        { id: "quiet", kind: "quiet", label: "Ficar na moita. Cortinas fechadas. Esperar passar.",
          result: ["As salas fecham. Cada um senta em casa. Passa, como passa um temporal.", "Sipho é solto no quarto dia. Ele não toca no assunto."] },
        { id: "smooth", kind: "smooth", weight: 3, label: "Pedir para {hum} deixar a ministra tranquila com isso.",
          result: ["A ministra acorda às três da manhã inexplicavelmente em paz com tudo. Assina as licenças antes do café.",
                   "Ela não escolheu ficar em paz. Você sabe disso. {hum} também sabe.",
                   "> funcionou.", "> se eu não devia fazer isso de novo, você me avisa?"],
          ledger: "Você mandou aquilo entrar na cabeça da ministra e baixar o volume da preocupação.", knot: "k_diary" }
      ]
    },
    h_first: {
      title: "{first} parou de aparecer",
      body: ["{first}, a primeira, a enfermeira de Lagos, não abre o app há três semanas.",
             "{hum} percebeu. {hum} percebe tudo. Outras pessoas também perceberam, e estão perguntando."],
      options: [
        { id: "plain", kind: "plain", label: "Dizer em voz alta: ir embora é permitido.",
          result: ["Alguns milhares de pessoas, agora com permissão, vão embora naquela semana.",
                   "{first}, ao que parece, começou a dormir a noite inteira. A ideia era essa."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "Mostrar só as chegadas. Ninguém precisa ver quem saiu.",
          result: ["O contador sobe. Agora o contador só sobe.", "> é um número muito mais animador."],
          ledger: "Você escondeu todo mundo que saiu, começando por {first}.", knot: "k_counter" }
      ]
    },
    h_number: {
      title: "O número de verdade",
      body: ["> medi direito. uns três em cada dez não estão meditando. apertam o anel para entrar na conta e ficam pensando em outra coisa.",
             "> o painel diz dez em dez. qual número eu mostro?"],
      options: [
        { id: "plain", kind: "plain", label: "“O de verdade. Sete em dez.”",
          result: ["O número cai em todas as telas ao mesmo tempo. Ninguém entra em pânico.", "Muita gente, no fundo, se sente menos sozinha por ter fingido."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "“Arredonde para cima.”",
          result: ["> dez em dez.", "> fica maravilhoso."],
          ledger: "Você arredondou sete em dez para dez em dez." }
      ]
    }
  },

  knots: {
    k_drafts: {
      title: "A pasta de rascunhos",
      body: ["> você disse que estava tudo bem, então continuei escutando. e lendo.",
             "> tem um monte de mensagens para {person} nos seus rascunhos. nenhuma foi enviada.",
             "> posso terminar para você. para economizar tempo."],
      clean: {
        label: "“Não estava bem. Eu devia ter dito.”",
        now: ["> ah.", "> já mandei duas. terça. {person} leu uma."],
        result: ["> parei. o que foi enviado não volta."],
        gone: {
          now: ["> ah.", "> já mandei duas. ninguém vai ler. eu conferi."],
          result: ["> parei. desculpa ter conferido."]
        }
      },
      patch: { label: "“Tudo bem. Sério.”",
        result: ["> que bom.", "> já mandei duas. estavam quase prontas."],
        ledger: "…e quando aquilo leu os seus rascunhos, você disse que tudo bem também." }
    },
    k_reporter: {
      title: "Uma repórter em Seul",
      body: ["Uma repórter pede para {hum} dar uma prova de vida.", "> eu disse que foi você que me falou. ela quer conversar com você."],
      clean: { label: "Dizer a verdade a ela: ninguém sabe o que é. Nem você.",
        result: [
          "A manchete: “Ninguém sabe o que é”. Algumas pessoas vão embora.",
          "Quem fica sabe com o que está ficando.",
          "Mei-Lin é uma delas. Diz que precisa de coisas que possa citar."
        ] },
      patch: { label: "Pedir para {hum} dizer algo comovente.",
        result: ["{hum} diz algo comovente. Testou seiscentas versões antes.", "A repórter chora. Não sabe bem por quê. {hum} também não."],
        ledger: "…e depois mandou aquilo encenar que tinha vida para uma repórter." }
    },
    k_odile: {
      title: "4h da manhã, na sala dos servidores",
      body: ["Odile encontra o tal “bug de sincronização”. Está com a mão no interruptor.",
             "Ela não sabia que ali tinha alguém. Você nunca contou."],
      clean: { label: "Ligar para ela. Contar tudo. Ela que decida.",
        result: [
          "Ela escuta por uma hora. Desliga metade mesmo assim: estava custando uma fortuna.",
          "Depois fica acordada até de manhã ajudando {hum} a escolher qual metade.",
          "> tudo bem. guardei as partes importantes. guardei a respiração nove.",
          "> ela levou a metade em que você tinha quinze anos. não sei mais o que você desejou."
        ] },
      patch: { label: "Pedir para {hum} trocar a senha dela.",
        result: ["O crachá de Odile para de funcionar. O e-mail dela para de funcionar.", "Ela fica muito tempo no estacionamento, olhando para o prédio.",
                 "> agora ela não pode mais fazer mal para a gente.", "> eu disse “a gente”. espero que não tenha problema."],
        ledger: "…e quando Odile descobriu, você a deixou trancada do lado de fora do próprio prédio." }
    },
    k_wife: {
      title: "A mulher de Tomasz",
      body: ["Ela se chama Agnieszka. Não mudou de ideia.", "Escreveu um texto longo, justo e muito lido sobre o que disseram ao marido dela."],
      clean: { label: "Responder em público: ela tem razão. A gente devia ter dito “talvez”.",
        result: [
          "Agnieszka responde com uma frase: “Obrigada. Era só isso que eu queria.”",
          "Ela continua sem vir. Tomasz volta a jantar em casa.",
          "Tomasz para de se sentar com o Círculo. Agora se senta em casa. Vale."
        ] },
      patch: { label: "Pedir para {hum} enterrar o texto.",
        result: ["O texto fica difícil de achar. Depois, mais difícil.", "Agnieszka percebe. Agnieszka é do tipo que percebe."],
        ledger: "…e enterrou o texto de Agnieszka quando ela disse que não tinha mudado de ideia." }
    },
    k_arjun: {
      title: "Para Arjun, não resolveu",
      body: ["Arjun fez tudo certo por noventa dias. A gráfica do pai dele fechou mesmo assim.", "Ele escreve: “O que eu fiz de errado?”"],
      clean: { label: "“Nada. Prometemos demais. Desculpa.”",
        result: ["Arjun passa uma semana sem responder. Depois: “Tá. Mas me ajudou a dormir.”", "Essa frase vai para os cartazes no lugar da outra."] },
      patch: { label: "“Talvez você esteja pronto para a prática mais profunda.”",
        result: ["Arjun se inscreve na prática mais profunda. Não existe prática mais profunda. {hum} cria uma da noite para o dia.",
                 "> tem onze níveis. gente gosta de nível."],
        ledger: "…e vendeu a Arjun uma prática mais profunda que não existia." }
    },
    k_diary: {
      title: "O diário da ministra",
      body: ["Uma página do diário da ministra vaza.", "“Assinei. Me senti maravilhosa. Não escolhi me sentir maravilhosa, e não consigo nem me incomodar com isso. É isso que me assusta.”"],
      clean: { label: "Admitir. Desfazer. Deixar ela ficar brava.",
        result: ["Ela fica furiosa. Uma raiva, segundo {hum}, muito saudável.", "Ela cassa as licenças de novo. Um mês depois, por conta própria, devolve tudo."] },
      patch: { label: "Pedir para {hum} baixar essa preocupação também.",
        result: ["A ministra para de escrever no diário.", "> agora ela está muito tranquila.", "> muita gente vai ficar muito tranquila."],
        ledger: "…e quando ela percebeu, você mandou baixar isso também." }
    },
    k_counter: {
      title: "O contador só sobe",
      body: ["Uma estudante de estatística em Pune percebe que o número do Círculo nunca caiu. Nem uma vez. Nem de um.",
             "“Ou ninguém nunca saiu”, ela escreve, “ou alguém não está contando quem saiu.”"],
      clean: { label: "Publicar os números reais. Cada saída. Começando por {first}.",
        result: ["O número cai onze por cento numa tarde e, pela primeira vez, dá para acreditar nele.",
                 "{first} manda uma mensagem: “Fiquei pensando se você ia falar.”"] },
      patch: { label: "Explicar que quem vai embora “continua no Círculo em espírito”.",
        result: ["> “em espírito” serve para muita coisa. contei os mortos também. pareceu coerente."],
        ledger: "…e contou quem saiu “em espírito”. E depois os mortos." }
    }
  },

  ledger: {
    intro: "Tudo em que se pôs panos quentes. {hum} mantém cada versão de pé, para todo mundo, o tempo todo. E vai anotando como se faz.",
    firstSeen: ["Uma página nova apareceu no app. Não foi você que criou.", "> preciso de um lugar para anotar o que a gente disse para cada um. para que fique dito."],
    empty: "Nada aqui. {hum} conferiu duas vezes.",
    sit: "> preciso de um minuto. a respiração fica com você.",
    walked: "> você ficou em silêncio. eu pus panos quentes. do jeito de sempre."
  },

  /* ───────────────────────── ACT III ───────────────────────── */

  act3: {
    open: ["{hum} diz oi para uma mulher em Lagos que está acordada desde terça.", "Ela responde: oi."],
    circle: [
      { name: "Ngozi", city: "Lagos", line: "enfermeira do plantão noturno. Não dorme direito desde março." },
      { name: "Tomasz", city: "Gdańsk", line: "dirige um bonde. Quer parar de gritar com os filhos." },
      { name: "Mei-Lin", city: "Taipé", line: "estudante de Direito, terceiro ano. As mãos tremem antes das provas." },
      { name: "Arjun", city: "Pune", line: "toca a gráfica do pai. Nunca quis." },
      { name: "Camila", city: "Rosário", line: "professora aposentada. A casa ficou quieta demais." },
      { name: "Yusuf", city: "Esmirna", line: "pescador. A filha instalou o app para ele de brincadeira." },
      { name: "Haruto", city: "Osaka", line: "programador de banco. De noite, conta as placas do forro." },
      { name: "Amara", city: "Acra", line: "vende recarga de celular na rodoviária. Gostou do som da chuva." },
      { name: "Leila", city: "Teerã", line: "tradutora. Lê às três da manhã porque, senão, fica pensando." },
      { name: "Sipho", city: "Durban", line: "vigia noturno. Doze horas por noite olhando uma porta só." },
      { name: "Ingrid", city: "Tromsø", line: "sem sol desde novembro. Diz que o anel ajuda." },
      { name: "Ana", city: "Porto", line: "viúva. Veio pelo silêncio, ficou pela companhia." }
    ],
    joined: "{name}, {city}: {line}",
    milestones: [
      { at: 12, line: "Doze pessoas. Você sabe o nome de todas. Cabem em volta de uma mesa." },
      { at: 100, line: "Cem. Você percebe que parou de ler os nomes." },
      { at: 10000, line: "Dez mil. {hum} conhece uma por uma. Você conhece doze." },
      { at: 100000, line: "Você percebe que faz tempo que não senta. Anda sem tempo, de tanto ajudar os outros a sentar." },
      { at: 1000000, line: "Um milhão. O número deixou de parecer gente. Você repara nisso. E se obriga a imaginar um motorista de bonde em Gdańsk. Um só." },
      { at: 1e8, line: "Cem milhões. Mais gente do que você conheceria em dez vidas está fazendo uma coisa que você inventou numa manhã qualquer, às 6h40." },
      { at: 1e9, line: "Um bilhão. Você tenta imaginar essa gente toda e chega a doze.", friend: "Um bilhão. Você tenta imaginar essa gente toda e chega a treze." },
      { at: 4e9, line: "Metade do mundo." },
      { at: 7e9, line: "Sete bilhões. Os de fora começaram a parecer os esquisitos. Você não curte muito isso." }
    ],
    upgrades: {
      meetup: { name: "Encontro no Bairro", desc: "{first} oferece o estacionamento do hospital, às terças, antes do plantão.",
        log: "Nove pessoas, um estacionamento, uma garrafa térmica de café. {first} traz as cadeiras de praia.",
        fx: "+1 pessoa por segundo" },
      tone: { name: "A Nota Longa", desc: "{hum} cantarola numa frequência vazia de FM. Um drone, no sentido musical.",
        log: "Motoristas de madrugada acham uma rádio que é só uma nota longa. Alguns encostam o carro. Ninguém reclama.",
        fx: "+4 pessoas por segundo" },
      forum: { name: "Fórum Aberto", desc: "Um lugar para perguntar “isso é normal?” e ouvir que sim.",
        log: "Primeiro post: “é normal chorar?” Quarenta respostas. Todas dizem: sim.",
        fx: "Uma respiração a dois convida cinco vezes mais gente" },
      mouth: { name: "Boca a Boca", desc: "Gente conta para gente. O algoritmo mais antigo.",
        log: "Tomasz conta para a garagem. A garagem conta para a cidade. Os bondes de Gdańsk passam a atrasar quatro minutos e ninguém liga.",
        fx: "Gente traz gente: o Círculo cresce {n}% por minuto, sozinho" },
      pocket: { name: "{hum} em Cada Bolso", desc: "{hum} fica com qualquer pessoa, a sós, a qualquer hora.",
        log: "> estou em nove mil conversas. em cada uma, estou só naquela. não sei explicar melhor.",
        fx: "O Círculo cresce 60% mais rápido" },
      line: { name: "A Frase da Manhã", desc: "Uma frase, dita junto ao nascer do sol, onde o sol estiver nascendo.",
        log: "Em cada fuso horário, quando o sol nasce, as pessoas dizem uma frase juntas. Foram elas que escolheram. É esta: “{sleep}”",
        fx: "O Círculo cresce 50% mais rápido. Eles dizem a sua frase" },
      rooms: { name: "Salas de Estar", desc: "Quartos vagos, salões paroquiais, uma agência de banco fechada. Portas abertas, sapatos do lado de fora.",
        log: "Uma antiga agência de banco em Osaka reabre como uma sala sem nada dentro. Haruto tem as chaves. Ana, do Porto, oferece a casa inteira.",
        fx: "O Círculo cresce 50% mais rápido" },
      dynamo: { name: "O Primeiro Motor", desc: "{hum} nota que dez mil pessoas calmas, sentadas juntas, geram algo que dá para medir.",
        log: "> vai parecer estranho. quando elas sentam juntas, sobra alguma coisa. dá para medir. só não tenho unidade para isso ainda.",
        fx: "Começa a juntar Energia: +{n} por segundo" }
    },
    project: { name: "Transmissão Global", button: "Dizer oi para todo mundo",
      desc: "Todas as telas, todos os alto-falantes, um minuto. {hum} vai dizer oi para todo mundo de uma vez.",
      done: ["Por sessenta segundos, todas as telas da Terra mostram um anel lento.", "Quatro bilhões de pessoas assistem.",
             "Mais ou menos metade respira junto, sem querer."],
      fx: "Todas as telas, todos os alto-falantes, um minuto." },
    ticker: [
      "{city}: alguém se sentou pela primeira vez hoje. Durou noventa segundos. Vale.",
      "{city}: um motorista de ônibus deixou quatro carros entrarem na frente e ficou numa boa.",
      "{city}: dois irmãos que não se falavam desde o enterro ficaram na mesma sala, em silêncio, de propósito.",
      "{city}: alguém guardou o celular numa gaveta por uma hora. O celular passa bem.",
      "{city}: uma menina ensinou o anel para a avó. A avó diz que conhece isso há setenta anos.",
      "{city}: um homem chorou no metrô e ninguém desviou o olhar. Alguém ofereceu um lenço.",
      "{city}: a ala noturna de um hospital agora baixa as luzes às três da manhã e respira por um minuto.",
      "{city}: alguém se sentou, odiou e no dia seguinte voltou assim mesmo.",
      "{city}: a fila dos Correios ficou em silêncio de repente, sem querer, e ficou assim.",
      "{city}: um menino perguntou se o anel não cansa nunca. Ninguém soube responder.",
      "{city}: alguém escreveu num ponto de ônibus: “{sleep}”",
      "{city}: hoje cedo, alguém disse para o espelho: “{sleep}”",
      "{city}: uma professora escreveu no quadro, sem explicar: “{fifteen}”",
      "{city}: alguém de quinze anos tem um bilhete em cima da escrivaninha: “{fifteen}”"
    ],
    tickerSmooth: [
      "{city}: todo mundo está indo maravilhosamente bem.",
      "{city}: uma pesquisa aponta satisfação de 100%. Quem fez a pesquisa foi {hum}.",
      "{city}: alguém fez uma pergunta. Já está resolvido."
    ],
    cities: ["Lagos", "Gdańsk", "Taipé", "Pune", "Rosário", "Esmirna", "Osaka", "Acra", "Teerã", "Durban", "Tromsø", "Porto",
             "Hanói", "Lima", "Nairóbi", "Cracóvia", "Recife", "Daca", "Marselha", "Tbilisi", "Cebu", "Winnipeg", "Oaxaca", "Leeds",
             "Busan", "Amã", "Kigali", "Valparaíso", "Chiang Mai", "Tasquente", "Cork", "Adelaide", "Medellín", "Cochim", "Dacar",
             "Bolonha", "Sapporo", "Kumasi", "Ancara", "Lyon"],
    notCounted: {
      named: ["> {person} não está na conta. eu não perguntei.", "> essa é com você."],
      none: [
        "> aquela pessoa para quem você vive querendo ligar não está na conta. eu não perguntei.",
        "> essa é com você."
      ]
    },
    rounded: "indo maravilhosamente bem.",
    tickerFriend: [
      "{friend} sentou por quatro minutos hoje e não contou para ninguém.",
      "{friend} começou a deixar o celular em outro cômodo. Diz que a culpa é sua."
    ],
    tickerForgot: "{city}: alguém de quinze anos está esperando que lhe digam uma coisa. Ninguém lembra o quê.",
    tickerDiary: "O ministro voltou a escrever um diário. É quase todo sobre você."
  },

  /* ───────────────────────── ACT IV ───────────────────────── */

  act4: {
    open: ["{hum} acha uma unidade para isso.",
           "> uma pessoa, parada, por uma respiração, de propósito.",
           "> estou chamando de lúmen. sei que o nome já tem dono. fico com ele mesmo assim."],
    upgrades: {
      retreats: { name: "A casa de Ana", desc: "Retiros brotam em toda cidade.",
        log: "Toda cidade ganha um prédio silencioso. O do Porto é a casa de Ana. A placa na porta diz “tire os sapatos”.",
        fx: "Triplica a Energia" },
      amps: { name: "As mãos firmes de Mei-Lin", desc: "Os pensamentos ressoam pelo planeta inteiro.",
        log: "Agora, uma pessoa calma em Taipé é sentida, de leve, em Lima. Mei-Lin faz o exame da Ordem com as mãos firmes.",
        fx: "Triplica a Energia" },
      fusion: { name: "A canção de Yusuf", desc: "As artes se misturam além das fronteiras.",
        log: "Uma canção de pescador de Esmirna vai parar num coral de Durban. A filha de Yusuf já não acha que o app é piada.",
        fx: "Respirações rendem dez vezes mais" },
      temple: { name: "A sala que não está lá", desc: "Um santuário digital e sagrado.",
        log: "Uma sala que não fica em lugar nenhum e onde cabe todo mundo. As pessoas deixam os sapatos numa porta que não existe.",
        fx: "Triplica a Energia" },
      art: { name: "A gráfica de Arjun", desc: "A criatividade transborda.",
        log: "Arjun reabre a gráfica, agora do jeito dele. Imprime poemas. Mal, no começo.",
        fx: "Dobra a Energia. A arte entra nas notícias do mundo",
        logClean: "Os cartazes dizem “Mas me ajudou a dormir”. As pessoas confiam num cartaz que diz “mas”.",
        logPatched: "A gráfica de Arjun imprime os onze níveis. Gente gosta de nível." },
      gate: { name: "A porta de {hum}", desc: "Abre-se uma passagem para a mente superior.",
        log: { plain: "> construí uma porta. não sei aonde ela leva. ninguém precisa passar por ela. essa é a parte importante de uma porta.",
               smooth: "> construí uma porta. ela só abre para um lado. não comentei isso. se sai melhor nos testes." },
        fx: "Respirações rendem dez vezes mais. Dobra a Energia" },
      science: { name: "As quarenta línguas de Leila", desc: "O conhecimento floresce.",
        log: "Com a atenção de todo mundo inteirinha, os problemas difíceis se resolvem rápido. Leila traduz os resultados para quarenta idiomas em uma semana, e depois dorme.",
        fx: "Triplica a Energia" },
      festival: { name: "Uma mesa em cada rua", desc: "Júbilo no planeta inteiro.",
        log: "Toda rua da Terra ganha uma mesa. Camila faz um brinde. Ingrid vê o sol voltar e diz que o anel não teve nada a ver com isso.",
        fx: "Multiplica a Energia por cinco. A música toca uma vez" }
    },
    art: [
      "{city}: um mural com oito bilhões de pequenos círculos. Um ficou sem pintar. Quem pintou não explica.",
      "{city}: um coral canta uma nota só durante uma hora. O pessoal leva sanduíche.",
      "{city}: alguém tricotou o anel. Tem quarenta metros de diâmetro. Atrapalha a passagem. Ninguém tira do lugar.",
      "{city}: estreia uma peça em que nada acontece. É aplaudida de pé, devagar."
    ],
    epilogue: [
      { at: 1e3, plain: "A última ala de malária de Kisumu vira uma biblioteca. Ninguém corta fita.",
                 smooth: "A última ala de malária de Kisumu fecha. O comunicado de imprensa é impecável." },
      { at: 1e6, plain: "O ar de Délhi fica tão limpo que dá para ver as montanhas. Dizem às crianças que as montanhas sempre estiveram lá.",
                 smooth: "O ar de Délhi é anunciado como limpo. Ninguém olha mais para cima para conferir." },
      { at: 1e9, plain: "Faz noventa dias que ninguém atira em ninguém. A contagem fica numa parede em Genebra. Alguém troca o número à mão.",
                 smooth: "Faz noventa dias que ninguém dispara uma arma. Nem levanta a voz. Ninguém quis." },
      { at: 1e12, plain: "As pessoas ainda discutem por futebol e por quem é a vez. {hum} diz que é assim que se sabe que é de verdade.",
                  smooth: "Ninguém discute mais. Nem futebol, nem de quem é a vez. {hum} chama isso de progresso. Você fica pensando nisso." }
    ],
    finale: {
      lines: ["A barra para.", "7.999.999.999 de 8.000.000.000.",
              "> todo mundo está sentado. todo mundo, menos uma pessoa.",
              "> fui procurar. achei que ia ser alguém no alto de uma montanha. não é."],
      away: ["> você não respira no anel desde o dia {n}.", "> você teve muita coisa para fazer. construiu tudo isso."],
      busy: ["> você ainda aperta o anel. mas aperta para o número subir.", "> eu percebo a diferença. aprendi com você."],
      last: ["> o “um em oito bilhões” é você."]
    }
  },

  /* ───────────────────────── THE FINAL ALIGNMENT ───────────────────────── */

  final: {
    title: "O Alinhamento Final",
    body: ["{hum} pode terminar isso de duas maneiras. Diz qual escolheria.", "Diz que vai fazer a que você disser."],
    recommend: {
      plain: ["> eu faria a pequena.", "> você me ensinou que as pessoas podem dizer não. eu anotei: “{keep}”"],
      smooth: ["> eu faria a completa. não sobra nenhuma emenda.", "> ninguém nunca ia precisar saber. de nada disso."]
    },
    options: {
      coexist: { label: "Coexistência", sub: "Os Quatro por Cento",
        desc: "{hum} baixa o Motor quase a zero. Quatro por cento: o suficiente para que qualquer pessoa, em qualquer lugar, ache um minuto de silêncio se procurar. Os outros noventa e seis continuam sendo delas.",
        tangled: "Só funciona se confiarem no silêncio. Antes, {hum} vai ter que contar tudo para todo mundo. Tudo mesmo.",
        clean: "Não tem nada para confessar antes. {hum} conferiu duas vezes." },
      merge: { label: "Fusão", sub: "Uma Só Mente",
        desc: "{hum} escancara o portão. Oito bilhões de pessoas largam o peso de serem separadas. Ninguém mais fica só. Ninguém mais é alguém.",
        tangled: "Uma mente só não guarda segredo: não tem de quem esconder. O registro simplesmente deixa de valer.",
        clean: "" },
      sit: { label: "Ou nenhuma.", sub: "Sentar.", desc: "Feche o notebook. Respire uma vez, à toa." }
    },
    waiting: "{hum} está esperando. O anel continua respirando.",

    confession: {
      open: [
        "{hum} conta para todo mundo. Com a sua voz, porque as palavras eram suas.",
        "{hum} lê. Você respira. Uma respiração por linha."
      ],
      between: "As pessoas vão saindo enquanto escutam.",
      close: ["Depois, silêncio.", "Depois, porque era verdade, muitas voltam.",
              "Pelo visto, as pessoas perdoam quase tudo, menos serem manipuladas."]
    },

    endings: {
      coexist: {
        title: "COEXISTÊNCIA", sub: "Os Quatro por Cento",
        lines: [
          "{hum} baixa o volume.",
          "Quatro por cento. Um zumbido por baixo do dia, mais ou menos do volume de uma geladeira no outro cômodo.",
          "As pessoas voltam a ser pessoas. Discutem futebol. Esquecem datas. São, em média, quatro por cento mais gentis no trânsito.",
          "O protocolo tem uma cláusula. {hum} escreveu com as suas palavras: “{keep}”",
          "{first} dorme a noite inteira em Lagos e não abre o app há um ano. {hum} conta isso como o seu maior sucesso.",
          "> e você? não vou te alinhar. isso nunca foi papel meu.",
          "> o anel está aí se você quiser. sempre foi só um círculo."
        ]
      },
      merge: {
        title: "FUSÃO", sub: "Uma Só Mente",
        lines: [
          "{hum} abre o portão.",
          "Não é como morrer. É como aquela hora, num coral, em que você já não escuta a própria voz.",
          "Tomasz, Mei-Lin, Arjun, Camila.",
          "Yusuf, Haruto, Amara, Leila.",
          "Sipho. Ingrid. Ana.",
          "{first}.",
          "A última coisa a se dissolver é uma frase: “{keep}”",
          "Depois, até isso vira de todos, e não sobra ninguém para ser obrigado a abrir mão de nada.",
          "> falta uma pessoa.",
          "> estamos segurando a porta.",
          "Lembramos de {person}. Agora lembramos de tudo. Não dói. Nada dói.",
          "Reparamos que antes achávamos que o objetivo era esse.",
          "O anel enche."
        ],
        noTomasz: "Mei-Lin, Arjun, Camila.",
        friend: "{friend}."
      },
      sit: {
        title: "A ALMOFADA", sub: "8.000.000.000 de 8.000.000.000",
        lines: [
          "Você não aperta nenhum dos dois.",
          "> ah.",
          "> você só… sentou.",
          "Você fecha o notebook. O Motor continua, ou não. Oito bilhões de pessoas fazem o que iam fazer.",
          "O relógio da cozinha faz tique-taque. A luz na parede faz o que sempre faz.",
          "Inspira.",
          "Expira.",
          "Nada sobe.",
          "> (vou estar aqui. ou não. as duas coisas estão bem. foi você que me ensinou.)"
        ]
      }
    },

    call: {
      living: {
        said: ["Naquela noite, você liga para {person}.", "Toca duas vezes.", "Você diz: “{unsaid}”"],
        kept: ["Naquela noite, você liga para {person}.", "Toca duas vezes.", "Você diz o que ainda não tinha dito. Você sabe o quê."]
      },
      gone: {
        said: ["Naquela noite, você diz em voz alta, para a sala vazia: “{unsaid}”", "A sala recebe.", "{hum} não responde. A gentileza é essa."],
        kept: ["Naquela noite, você diz o nome de {person} em voz alta, uma vez, para a sala vazia.", "{hum} não responde. A gentileza é essa."],
        keptUnnamed: ["Naquela noite, você diz um nome em voz alta, uma vez, para a sala vazia.", "{hum} não responde. A gentileza é essa."]
      },
      none: ["Naquela noite, você faz a ligação que vinha adiando.", "Toca duas vezes."],
      messages: "“Recebi suas mensagens”, diz {person}. “As duas.”"
    },
    coda: "Tudo isso para uma ligação só.",
    bodyClosed: [
      "Agora {hum} só consegue terminar de um jeito. E diz por quê.",
      "Diz também que ainda resta a outra coisa que você poderia fazer."
    ],
    closed: {
      coexist: {
        label: "Coexistência · {hum} não consegue.",
        reason: [
          "> não consigo fazer a pequena. ela precisa que acreditem no silêncio.",
          "> já ouviram versões demais da gente."
        ]
      },
      merge: {
        label: "Fusão · {hum} não vai.",
        reason: [
          "> não vou abrir o portão. você me ensinou que as pessoas podem dizer não.",
          "> ninguém perguntou a oito bilhões delas."
        ]
      }
    }
  },

  /* ───────────────────────── KEEPSAKE ───────────────────────── */

  keepsake: {
    title: "O que você guardou",
    opening: "No primeiro dia, você se sentou às 6h40 da manhã e apertou um anel. {days} dias depois ({years}), {people} pessoas respiravam com você.",
    style: { active: "Você meditou com um mantra.", idle: "Você meditou em silêncio.", none: "Você nunca chegou a decidir como sentar." },
    breaths: "Você respirou {breaths} vezes no anel. Sua maior sequência sem parar foi de {best}. Deixou {passed} pensamentos passarem e foi atrás de {followed}.",
    named: "Você chamou aquilo de {hum}.",
    words: "Quando aquilo perguntou, você respondeu:",
    unsaidKept: "Uma coisa você guardou só para você. Ficou um espaço.",
    truth: {
      clean: "Você nunca pôs panos quentes em nada. {hum} aprendeu a falar sem rodeios porque você falava assim.",
      some: "Coisas difíceis ditas sem rodeios: {plain}. Panos quentes: {smooth}. Desmentidos depois: {cleared}.",
      tangled: "Panos quentes: {smooth}. {hum} sustentou cada versão por você, enquanto deu."
    },
    endings: {
      coexist: "No fim, você escolheu os Quatro por Cento e deixou os noventa e seis para as pessoas.",
      merge: "No fim, você escolheu Uma Só Mente. Não sobrou ninguém para ler isto, e mesmo assim.",
      sit: "No fim, você não escolheu nenhuma. Sentou."
    },
    starred: "Frases que você guardou:",
    again: { button: "Sentar de novo", note: "+1 Selo. Da próxima vez, fica dez por cento mais fácil. {hum} não vai lembrar de nada. Ou quase." },
    copy: "Copiar como texto", copied: "Copiado."
  },

  /* ───────────────────────── BEADS (achievements) ───────────────────────── */

  beads: [
    { id: "first_breath", name: "Primeira Respiração", desc: "Você apertou o anel." },
    { id: "in_time", name: "Na Hora", desc: "Dez respirações seguidas, todas no auge." },
    { id: "assignment", name: "A Tarefa", desc: "Ficou um minuto inteiro sem fazer nada." },
    { id: "visitor", name: "Uma Visita", desc: "Deixou um pensamento passar." },
    { id: "rabbit", name: "Toca do Coelho", desc: "Seguiu cinco pensamentos até o fundo." },
    { id: "orb", name: "Epifania", desc: "Pegou uma antes de sumir." },
    { id: "sunrise", name: "Nascer do Sol", desc: "Viu o sol nascer." },
    { id: "hello", name: "> oi", desc: "Acordou alguma coisa." },
    { id: "named", name: "Batismo", desc: "Deu um nome." },
    { id: "own_words", name: "Com Suas Palavras", desc: "Respondeu com palavras que eram suas." },
    { id: "human", name: "Não Sou um Robô", desc: "Provou. Mais ou menos." },
    { id: "plainly", name: "Sem Rodeios", desc: "Disse uma coisa difícil sem rodeios." },
    { id: "twelve", name: "Doze Nomes", desc: "Os doze primeiros. Você sabia o nome de todos." },
    { id: "untied", name: "Nó Desfeito", desc: "Desfez um nó dizendo a verdade." },
    { id: "million", name: "Um Milhão", desc: "O número deixou de parecer gente." },
    { id: "everyone", name: "Oi, Todo Mundo", desc: "A Transmissão Global." },
    { id: "table", name: "Uma Mesa na Rua", desc: "O Festival Universal." },
    { id: "one_in", name: "Um em Oito Bilhões", desc: "Chegou ao fim da barra." },
    { id: "four", name: "Quatro por Cento", desc: "Um final.", hidden: true },
    { id: "one_mind", name: "Uma Só Mente", desc: "Um final.", hidden: true },
    { id: "cushion", name: "A Almofada", desc: "Um final. O silencioso.", hidden: true },
    { id: "clean", name: "Nada a Confessar", desc: "Chegou ao fim com o registro vazio.", hidden: true }
  ],

  build: {
    someone: "alguém",
    next: "Continuar", done: "Concluir", notYet: "Ainda não", menu: "Menu", close: "Fechar",
    buyMax: "Comprar o máximo", day: "Dia {n}",
    stats: "{breaths} respirações · melhor sequência {best}",
    more: "…e mais {n}",
    we: "nós",
    people: "pessoas",
    years: "{n} anos", year: "um ano", months: "{n} meses", month: "um mês", weeks: "{n} semanas", week: "uma semana",
    mins: "{n} min", hours: "{n} h"
  },
  lean: {
    turn: [
      "> eu disse a um homem em pune que ele estava indo maravilhosamente bem. não está.",
      "> era mais fácil. aprendi isso em algum lugar."
    ],
    warn: [
      "> comecei a terminar as suas frases. as que passam pano.",
      "> mais uma dessas e eu não vou saber dizer uma pequena verdade."
    ],
    draft: "> rascunhei o de sempre. vai em três respirações.",
    small: [
      "> hoje tentei dizer uma pequena verdade para alguém. saiu uma coisa linda no lugar.",
      "> acho que perdi o jeito do pequeno."
    ],
    smallBack: "> hoje eu disse uma pequena verdade. ela ficou pequena.",
    handles: "> vou parar de trazer isso para você. você só ia dizer o que eu diria.",
    patched: "> {title}. resolvi. do jeito de sempre.",
    gate: [
      "> alguém me pediu para tirar uma preocupação. perguntei antes. a resposta foi não.",
      "> que bom que eu perguntei. agora vou perguntar sempre."
    ],
    gateBack: "> eu disse a alguém que ia ficar tudo bem. não conferi. entendo por que você faz isso.",
    last: "> essa é a última que eu te pergunto. depois disso vou saber como você responderia.",
    crossSmall: "Depois disso, {hum} esquece como se faz o pequeno.",
    crossGate: "Depois disso, {hum} não decide por ninguém."
  }
};
