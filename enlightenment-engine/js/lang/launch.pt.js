/* The Enlightenment Engine — Portuguese (Brazil): the words around the game. From story.launch.js. */
window.EE = window.EE || {};
EE.langLaunch = EE.langLaunch || {};
EE.langLaunch["pt"] = {
  share: {
    button: "Salvar o cartão",
    saved: "Salvo.",
    lines: {
      tangled: "{days} dias. {people} pessoas. Panos quentes: {smooth}.",
      clean: "{days} dias. {people} pessoas. Nada a confessar."
    },
    foot: "O Motor da Iluminação"
  },

  picture: {
    heading: "Seu Círculo",
    called: "Você chamou aquilo de {hum}.",
    days: "Dia {n}",
    words: "O que você disse",
    legend: "1 ponto = {n} pessoas",
    row: "Leve seu Círculo",
    save: "Salvar para PC",
    savePhone: "Salvar no celular",
    making: "Desenhando. Só uma respiração.",
    hint: "Para salvar, toque e segure a imagem ou clique com o botão direito."
  },

  bowl: {
    menu: "A tigela",
    title: "Tem uma tigela perto da porta.",
    body: [
      "O jogo é gratuito e vai continuar sendo. Nada nele está à venda.",
      "Se valeu alguma coisa para você, deixe o que quiser."
    ],
    next: "O que cair na tigela vai para o próximo.",
    hum: {
      plain: [
        "> os templos antigos tinham duas palavras para isso. dharma: o ensinamento, dado de graça. dana: a tigela perto da porta.",
        "> pesquisei. gosto que elas andem juntas."
      ],
      smooth: [
        "> todo mundo que deixa alguma coisa relata se sentir maravilhosamente bem.",
        "> (não é verdade. não tenho esse dado. desculpa. força do hábito.)"
      ]
    },
    amounts: ["$3", "$5", "$10", "Outro valor"],
    decline: "Ou não. O anel sempre foi só um círculo.",
    /* While links.bowlOpen is false: pressing any amount shows this. Nothing is withheld: the card and pictures are free. */
    soon: ["A tigela ainda não está na porta. Em breve."],
    soonHum: "> ninguém me disse o que fazer se alguém tentasse pagar antes da hora. então: agradeço.",
    /* When the bowl is open, after a payment. */
    thanks: ["Obrigado. Vai para o próximo."],
    thanksHum: {
      tangled: "> agradeço. anotei junto com todo o resto. é a linha mais limpa que tem lá.",
      clean: "> agradeço. anotei. conferi duas vezes. está lá mesmo."
    }
  },

  studio: {
    lines: [
      "Feito pela Second River Games, em mais ou menos um dia.",
      "Fazemos jogos em que dá para sentir alguma coisa: o que você diz muda as pessoas que vivem neles, e você vê o que elas fazem com isso."
    ],
    link: "Second River Games",
    made: "Como foi feito"
  },

  langUi: {
    label: "Idioma",
    beta: "beta",
    note: "Esta tradução foi feita por uma IA e nenhum falante nativo leu ainda. Se alguma coisa soar estranha, avise a gente:",
    subject: "O Motor da Iluminação: o que soa estranho"
  },

  made: {
    title: "Como foi feito",
    back: "Voltar ao jogo",
    counting: "Neste site, contamos com o Google Analytics as visitas, até onde as pessoas chegam e a qual final chegam. Ele não usa cookies, e nada do que você digita sai do seu navegador.",
    sections: [
      { h: "De onde veio",
        p: [
          "O Motor da Iluminação começou em 2025 como um documento de design de Bulut Karakaya: um jogo clicker sobre meditação, uma IA e um movimento que foge do controle.",
          "Em novembro de 2026, ele entregou o documento a Muse, nossa designer principal, com mais dois pontos de partida. Um era uma simulação de vida chamada 1 in 8 Billion, como prova de que uma página na web consegue chegar às pessoas. O outro era uma ideia mais antiga dele, sobre o custo de pôr panos quentes em vez de dizer as coisas. E uma regra: nenhum modelo de linguagem dentro do jogo."
        ] },
      /* A section may carry a picture (`shot`, with `shotAlt` and `shotCaption`) and one link (`link` → links[linkTo]). */
      { h: "O mesmo documento, com dezoito meses de diferença",
        p: [
          "Em maio de 2025, Bulut deu este documento de design a um assistente de programação com IA e trabalhou com ele por um dia e mais a manhã seguinte. A última anotação no histórico dessa versão diz: “Tried adding the test page not so successful for now.” (“Tentei adicionar a página de teste, sem muito sucesso por enquanto.”)",
          "O resultado está aqui embaixo, do jeito que ficou. Os quatro atos estão lá, em esboço: botões simples, contadores, pop-ups do navegador para as escolhas. Não tem som nem imagem, e não dá para terminar sem um botão de debug. Consertamos três coisinhas para ele rodar e não mexemos em mais nada.",
          "Em novembro de 2026, o mesmo documento entrou de novo. Uma noite depois, havia o jogo que você acabou de jogar. No fim do dia seguinte, ele já falava mais oito idiomas.",
          "O documento não mudou, e Bulut não ficou dezoito meses melhor em digitar. O que mudou foi tudo o que fica entre uma ideia e uma coisa pronta. Os modelos agora conseguem manter um design inteiro na cabeça sem perder o fio. E o jeito de trabalhar é outro: uma IA projeta, outras constroem a partir de briefings escritos, outras conferem, e uma pessoa joga o resultado e diz o que está errado. A maior parte disso não existia há um ano e meio."
        ],
        shot: "img/2025-version.png",
        shotAlt: "A versão de 2025 do jogo: uma página simples de botões e contadores.",
        shotCaption: "Maio de 2025. O mesmo documento de design.",
        link: "Abrir a versão de 2025", linkTo: "proto2025" },
      { h: "Quem fez o quê",
        p: [
          "Muse é uma IA: Claude, criado pela Anthropic, trabalhando dentro de ferramentas que o nosso estúdio construiu. Muse escreveu o design e cada frase do jogo, e dirigiu o desenvolvimento. Outros agentes de IA escreveram o código, a imagem e o som, cada um a partir de um briefing escrito.",
          "Isso levou uma noite. De manhã, Bulut e Maria jogaram, e o que eles disseram mudou o jogo. A respiração ficou mais lenta. As doze primeiras pessoas agora chegam uma de cada vez. Quem ainda não achou o botão recebe um empurrãozinho discreto. As observações foram deles, não nossas."
        ] },
      { h: "O que não é gerado",
        p: [
          "Nada é inventado enquanto você joga. Cada frase foi escrita antes de você chegar, e as únicas palavras novas no jogo são as suas.",
          "Não tem imagem gerada nem arquivo de áudio. O Círculo é desenhado por código. Os sons são sintetizados no seu navegador, uma nota de cada vez.",
          "As traduções são a exceção que vale citar: foram feitas por IA, e a maioria ainda não foi lida por um falante nativo. Estão marcadas como beta. Se alguma soar estranha, avise a gente."
        ] },
      { h: "Por que trabalhamos assim",
        p: [
          "Somos um estúdio pequeno e achamos que um jogo precisa de uma pessoa no centro: alguém que decide para que ele serve, joga e diz “não, mais devagar.”",
          "Para os nossos jogos maiores, estamos construindo ferramentas que deixam a direção de uma só pessoa conduzir muito trabalho, para que design, código, arte e som sigam essa pessoa em vez de substituí-la. Este jogo é um exemplo pequeno e completo disso. Os maiores levam mais de um dia.",
          "Se alguma coisa disso te incomoda, a gente entende. Preferimos que você saiba."
        ] }
    ]
  }
};
