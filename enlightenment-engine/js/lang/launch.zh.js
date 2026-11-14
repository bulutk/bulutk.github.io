/* The Enlightenment Engine — Chinese (Simplified): the words around the game. From story.launch.js. */
window.EE = window.EE || {};
EE.langLaunch = EE.langLaunch || {};
EE.langLaunch["zh"] = {

  /* The free card everyone can save and share. Tokens: {days} {people} {smooth}. */
  share: {
    button: "保存卡片",
    saved: "已保存。",
    lines: {
      tangled: "{days}天。{people}人。圆过去的：{smooth}件。",
      clean: "{days}天。{people}人。无事可坦白。"
    },
    foot: "开悟引擎"
  },

  /* The pictures: the player's own finished Circle as wallpapers, for a phone and for a desktop. Free, like the card. */
  picture: {
    heading: "你的圈子",
    called: "你叫它{hum}。",
    days: "第{n}天",
    words: "你跟它说的话",
    legend: "1 个点 = {n} 人",
    row: "带上你的圈子",
    save: "电脑壁纸",
    savePhone: "手机壁纸",
    making: "正在画。一口气的工夫。",
    hint: "长按图片或点右键，就能保存。"
  },

  /* The bowl. Shown once, quietly, after the keepsake; also in the menu. Never during play. It buys nothing. */
  bowl: {
    menu: "那只碗",
    title: "门边有只碗。",
    body: [
      "游戏是免费的，以后也免费。里面什么都不卖。",
      "要是觉得它值点什么，想留多少就留多少。"
    ],
    next: "碗里的，都用来做下一个游戏。",
    hum: {
      plain: [
        "> 老禅堂里，这件事有两个词。法：教的东西，是送出去的。布施：门边的那只碗。",
        "> 我去查了。我喜欢它们是一对。"
      ],
      smooth: [
        "> 每一位留下东西的人，都说感觉好极了呢。",
        "> （这不是真的。我没这个数据。抱歉。老毛病了。）"
      ]
    },
    amounts: ["$3", "$5", "$10", "其他金额"],
    decline: "不留也行。圆环从来就只是个圆。",
    /* While links.bowlOpen is false: pressing any amount shows this. Nothing is withheld: the card and pictures are free. */
    soon: ["碗还没摆出来。快了。"],
    soonHum: "> 没人告诉我，有人提前付钱该怎么办。那就：谢谢你。",
    /* When the bowl is open, after a payment. */
    thanks: ["谢谢你。会用来做下一个游戏。"],
    thanksHum: {
      tangled: "> 谢谢你。我记下了，就记在别的那些旁边。这是里面最干净的一行。",
      clean: "> 谢谢你。我记下了。查了两遍。真的在。"
    }
  },

  /* The last thing on the keepsake screen. */
  studio: {
    lines: [
      "Second River Games 出品，做了大概一天。",
      "我们做让人心里有感觉的游戏：你说的话会改变里面的人，你还能看着他们拿这些话做些什么。"
    ],
    link: "Second River Games",
    made: "这是怎么做出来的"
  },

  /* The language picker and the note shown on every language except English. */
  langUi: {
    label: "语言",
    beta: "测试版",
    note: "本译文由 AI 完成，还没有中文母语者读过。哪里读着别扭，请告诉我们：",
    subject: "开悟引擎：读着别扭的地方"
  },

  /* "How this was made": a short, plain page. */
  made: {
    title: "这是怎么做出来的",
    back: "回到游戏",
    counting: "在这个网站上，我们用 Google Analytics 统计访问次数、大家玩到了哪里、走到了哪个结局。它不使用 Cookie，你输入的任何文字都不会离开你的浏览器。",
    sections: [
      { h: "它是怎么来的",
        p: [
          "《开悟引擎》最早是2025年 Bulut Karakaya 写的一份设计文档：一款点击游戏，讲冥想、一个 AI，还有一场失控的运动。",
          "2026年11月，他把文档交给了我们的首席设计师 Muse，另外给了两个出发点。一个是叫 1 in 8 Billion 的人生模拟游戏，证明一个网页也能打动人。另一个是他自己早先的一个想法：有话不直说、把事情圆过去，代价是什么。外加一条规矩：游戏里不放语言模型。"
        ] },
      { h: "同一份文档，相隔十八个月",
        p: [
          "2025年5月，Bulut 把这份设计文档交给一个 AI 编程助手，和它一起做了一天，又加上第二天一上午。那个版本的提交记录里，最后一条写的是：“Tried adding the test page not so successful for now.”（想加个测试页，暂时不太成功。）",
          "做出来的东西就在下面，原样保留。四幕都有，只是个轮廓：简单的按钮、计数器，做选择靠浏览器弹窗。没有声音，没有画面，不按调试按钮就打不通。我们修了三个小地方让它能跑，别的一概没动。",
          "2026年11月，同一份文档再交了进去。过了一夜，就有了你刚玩的这个游戏。第二天傍晚，它又多会了八种语言。",
          "文档没变，Bulut 的打字水平也没比十八个月前高明多少。变的是从想法到成品中间的一切。现在的模型能把整份设计装在脑子里，而且一直记得住。工作方式也变了：一个负责设计，几个照着书面说明去做，几个负责检查，再由一个人来玩，说哪里不对。这些，一年半以前大多还没有。"
        ],
        shot: "img/2025-version.png",
        shotAlt: "2025年版的游戏：一页简单的按钮和计数器。",
        shotCaption: "2025年5月。同一份设计文档。",
        link: "打开2025年版", linkTo: "proto2025" },
      { h: "谁做了什么",
        p: [
          "Muse 是个 AI：Anthropic 开发的 Claude，在我们工作室自己搭的工具里干活。游戏的设计和里面的每一句话都是 Muse 写的，制作也由 Muse 指挥。代码、画面和声音，由其他 AI 智能体照着书面说明分别完成。",
          "这些用了一个晚上。第二天早上，Bulut 和 Maria 玩了一遍，又照他们说的改了。呼吸放慢了。最早的十二个人，现在是一个一个来的。找不到按钮的玩家，会收到一句轻轻的提醒。这些都是他们提的，不是我们想到的。"
        ] },
      { h: "哪些不是生成的",
        p: [
          "你玩的时候，没有任何东西是现编的。每一句话在你来之前就写好了，游戏里唯一新冒出来的字，是你自己写的。",
          "没有生成的图片，也没有音频文件。圈子是代码画的。声音是在你的浏览器里合成的，一个音一个音地来。",
          "译文是个例外，值得单独说一句：译文是 AI 做的，大多还没有母语读者看过。都标着“测试版”。哪里读着别扭，请告诉我们。"
        ] },
      { h: "我们为什么这样做",
        p: [
          "我们是个小工作室。我们觉得，一个游戏中间得有一个人：由这个人来定游戏为什么而做，亲自去玩，然后说：“不对，再慢一点。”",
          "我们正在为更大的游戏做一些工具，让一个游戏总监的方向能贯穿大量的工作：设计、代码、美术和声音都跟着这个人走，而不是把人换掉。这个游戏就是一个小而完整的例子。大的游戏，就不止一天了。",
          "要是这些里有什么让你不舒服，我们理解。我们宁愿你知道。"
        ] }
    ]
  }
};
