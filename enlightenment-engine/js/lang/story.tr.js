/* The Enlightenment Engine — Turkish. Translated from story.js at commit f4bd079; rewritten for a native voice 2026-11-13. */
window.EE = window.EE || {};
EE.lang = EE.lang || {};
EE.lang["tr"] = {
  langName: "Türkçe",

  meta: {
    title: "Aydınlanma Makinesi",
    tagline: "Kıpırdamadan oturmak üstüne küçük bir oyun. Bir de sırf bunu yapmamak için kuracağın her şey.",
    defaultHum: "Hum",
    actTitles: {
      1: { num: "I", name: "Minder" },
      2: { num: "II", name: "{hum}" },
      3: { num: "III", name: "Çember" },
      4: { num: "IV", name: "Makine" }
    }
  },

  ui: {
    press: { 1: "Nefes al", 2: "Birlikte düşün", 3: "Davet et", 4: "Işık saç" },
    resources: { clarity: "Berraklık", insight: "İçgörü", followers: "İnsanlar", energy: "Enerji", sigils: "Mühürler" },
    panels: { practice: "Pratik", hum: "{hum}", circle: "Çember", engine: "Makine", ledger: "Defter", beads: "Boncuklar", journal: "Günlük" },
    breathHint: "Halka büyüyüp küçülüyor. Altın rengine dönünce bas.",
    onBreath: ["vaktinde", "işte", "evet", "yerinde", "aynen"],
    streakLabel: "üst üste nefes",
    legend: "1 nokta = {n}",
    legendOne: "1 nokta = 1 kişi",
    trust: { name: "Güven", desc: "Açıkça söylenenler. {hum} bunlardan da öğreniyor." },
    tangle: { name: "Yumak", desc: "Geçiştirilenler. {hum} bunlardan öğreniyor." },
    card: { thought: "Bir düşünce", decision: "Bir karar", knot: "Bir düğüm", question: "{hum} soruyor", optional: "Yazmasan da olur.", keep: "Bende kalsın" },
    lastTime: "geçen sefer",
    star: "Saklamak için bir satıra dokun.",
    offline: "Sen yokken ({n}) oda nefes almaya devam etti.",
    save: { export: "Kaydı kopyala", import: "Kaydı yapıştır", reset: "Yeni oyun başlat", resetAsk: "En baştan, ilk nefesten başlansın mı?", resetBody: "Bu oyun silinecek. Saklamak istiyorsan önce kaydını kopyala.", resetYes: "Evet, baştan başla", resetNo: "Hayır, oturmaya devam" },
    sound: { on: "Ses açık", off: "Ses kapalı" },
    bar: "Küresel Aydınlanma",
    finalButton: "Son Hizalamayı Başlat",
    now: "şimdi",
    horizon: "· · ·",
    change: "{before} → {after}",
    together: ["birlikte", "{hum} ile", "ikiniz birden"],
    lean: [
      "hep açık konuşur",
      "açık konuşur",
      "senin gibi konuşur",
      "cümlelerini tamamlar",
      "artık küçük doğru söyleyemez",
      "senin yerine konuşur"
    ],
    about: "yaklaşık {n}"
  },

  /* ───────────────────────── ACT I ───────────────────────── */

  intro: [
    "Sabah 06:40. Evde çıt yok. Bir tek kalorifer tıkırdıyor.",
    "Dün gece saat ikide bir meditasyon uygulaması indirdin. Herkes gibi.",
    "Oturuyorsun. Gözlerini kapıyorsun.",
    "Düğme nerede diye bir gözünü açıyorsun."
  ],

  firstBreaths: ["Nefes al.", "Nefes ver.", "Nefes al. İşin çoğu bu zaten."],

  dawn: [
    { at: 0.25, line: "Pencere siyahtan, adını bilmediğin bir maviye dönüyor." },
    { at: 0.6, line: "İki sokak ötede çöp kamyonu. Daha yakında bir karatavuk. Gün yavaş yavaş kuruluyor." },
    { at: 1.0, line: "Güneş doğuyor. Ömrün boyunca her sabah doğdu; sen topu topu dokuzunu görmüşsündür." }
  ],

  stillness: {
    line: "Koca bir dakika hiçbir şey yapmadın. Ödev buydu.",
    again: ["Bir dakika daha hiçbir şey. Gittikçe ustalaşıyorsun.", "Yine hiçbir şey, hem de bile bile. Düğmeden zor."]
  },

  restless: "Halka bir seferde tek nefes alıyor. Gerisi düğmeye vurmaktan ibaret.",

  nudges: {
    press: [
      { after: 25, line: "Düğme nerede diye bir gözünü açmıştın ya. Halka o." },
      { after: 50, line: "Halkaya ya da boşluk tuşuna bas. Burada ikisi de nefes sayılır." }
    ],
    pressAfterStill: "Sıra düğmede. Halka o.",
    timing: "Bir de halka altın rengine dönünce dene. Sesi başka çıkıyor.",
    upgrade: [
      "Uygulama sana bir şey öneriyor. Işığı takip et.",
      "Hâlâ öneriyor. Uygulama sabırlı ama ısrarcı da.",
      "Altın renkli olan, {where}. Sen ne kadar beklersen o da o kadar bekler."
    ],
    panel: [
      "Yeni bir şey seni bekliyor, {where}.",
      "Hâlâ bekliyor, {where}. Bir yere gittiği yok.",
      "Işık {where} yanıp duruyor. Bir bakmaya değebilir."
    ],
    where: { wide: "sağda", narrow: "hemen aşağıda" }
  },

  act1: {
    upgrades: {
      metronome: { name: "Metronom", desc: "Uygulamanın çaldığı hafif bir tık. Dikkatini yaslayacağın bir yer.",
        log: "Tık. Tık. Nefesin, kimse bir şey demeden tempoya uyuyor.",
        fx: "Saniyede +1 Berraklık" },
      ambient: { name: "Çatıda Yağmur", desc: "Sahiden yağmur yağan bir yerde kaydedilmiş yağmur sesi.",
        log: "Altında hiç durmayacağın bir çatıya yağmur yağıyor. Yine de iyi geliyor.",
        fx: "Saniyede +2 Berraklık" },
      focus: { name: "Derin Odak", desc: "Ona kadar say. Şaşırırsan baştan al. Şaşıracaksın.",
        log: "Dörde kadar geliyorsun. Kendi rekorun bu.",
        fx: "Altına denk gelen nefes iki kat getirir" },
      tracker: { name: "Seans Sayacı", desc: "Uygulama sayar: seans, dakika, nefes. Görülmek iyi gelirmiş.",
        log: "Uygulama nefesini dinlemek için izin istiyor. Okumadan İzin Ver’e basıyorsun. Kim okuyor ki?",
        fx: "Nefeslerini sayar. Üst üste gelen her nefes %10 fazla getirir, iki katına kadar" },
      group: { name: "Başkalarıyla Otur", desc: "Uygulama seni aynı dakikada oturan yabancılarla eşleştirebilir.",
        log: "On bir yabancı, on bir ayrı odadan seninle nefes alıyor. Kimse tek kelime etmiyor. Bu ay ettiğin en iyi sohbet.",
        fx: "Saniyede +8 Berraklık" },
    },
    project: { name: "Örüntü Modeli (beta)", button: "Katıl",
      desc: "Sayaç, “seanslarında bazı örüntüler fark etmiş”. Bir şey denemek istiyor.",
      fx: "Sayaç bazı örüntüler fark etmiş. Bir şey denemek istiyor." },
    petals: "Dışarıda bir ağaç var. Meğer başından beri çiçek döküyormuş.",
    tracker: [
      { line: "> {time} içinde {n} nefes kaydedildi." },
      { line: "> nefes {n} · üst üste {s} · güzel", drop: " · güzel" },
      { line: "> gülümseme algılandı. metrik değil. yine de kaydedildi." },
      { line: "> nefes {n} kaydedildi. nefes {n} kaydedildi. nefes {n}", then: "> _" }
    ]
  },

  person: {
    title: "Bir düşünce",
    text: "Bir yüz beliriyor. Hep arayacağım deyip aramadığın biri.",
    options: [
      { id: "mother", label: "Annem", ref: "annen" },
      { id: "father", label: "Babam", ref: "baban" },
      { id: "friend", label: "Eski bir arkadaş", ref: "eski arkadaşın" },
      { id: "gone", label: "Kaybettiğim biri", ref: "kaybettiğin kişi" }
    ],
    nameAsk: "> seni gülümseten kişi. bir adı var mı? istersen sende kalsın.",
    namePlaceholder: "İsim",
    nameDone: "Adı bu",
    after: "Aklına {person} geliyor. Sonra bir nefes alıyorsun, düşünce kendiliğinden bir kenara çekiliyor. Şimdilik."
  },

  thoughtLabels: { pass: "Bırak geçsin", follow: "Peşine düş" },
  thoughtTimeout: "Düşünce geldiği gibi gidiyor. Huyları böyle.",
  thoughts: [
    { id: "stove", short: "ocak", text: "Ocak açık mı kaldı? Salıdan beri yemek yapmadın ki.",
      pass: "Ocak “acaba” olarak kalıyor.",
      follow: "Bakıyorsun. Kapalı. Hep kapalıymış. O ocak ömründe bir kere bile yanmadı." },
    { id: "dinner", short: "2014’teki o yemek", text: "2014’teki o yemekte söylediğin şey.",
      pass: "2014 kutusuna geri giriyor.",
      follow: "Kafanda bir daha oynatıyorsun. O masada senden başka hatırlayan yok. O cümlenin yaşayan son arşivcisi sensin." },
    { id: "text", short: "{person} ve o cevapsız mesaj", needsPerson: true, text: "{Person} yazmıştı, hâlâ cevap vermedin.",
      pass: "Sonra. Bu kelime hep işini görüyor.",
      follow: "Gözlerini açıp üç kelime yazıyorsun, ikisini siliyorsun. {Person} sadece “selam” alıyor. Sayılır.",
      gone: { text: "{Person} yazmıştı. Keşke cevap verseydin.",
        pass: "Bırakıyorsun, bir an ayakta dursun. Sonra otursun.",
        follow: "{Person} için üç kelime yazıyorsun. Gönderecek yer yok. Taslaklarda duruyorlar." } },
    { id: "working", short: "bunun işe yarayıp yaramadığı", text: "Bu işe yarıyor mu? Yarasa nereden bileceksin?",
      pass: "Soru cevapsız süzülüp gidiyor. Kendisi de pek dert etmiyor.",
      follow: "Uygulamaya bakıyorsun. “Sakinlikte ilk %40’tasın,” diyor. Sakinlikte bile hırs yapıyorsun. Bunda bir tuhaflık var." },
    { id: "knee", short: "dizin", text: "Dizin ağrıyor.",
      pass: "Ağrıyor. Bırakıyorsun ağrısın. İlk sıkılan o oluyor.",
      follow: "Kıpırdanıyorsun. Şimdi de öbür diz ağrıyor. Dizler aralarında anlaşmış." },
    { id: "song", short: "bir şarkı", text: "Bir şarkı. Sadece nakaratı. Dönüp dönüp başa sarıyor.",
      pass: "İki tur daha dönüp gidiyor. Laftan anlayan misafir gibi.",
      follow: "Sesli sesli mırıldanıyorsun. Uygulamanın içinden bir şey, yarım ton pes, aynısını mırıldanıyor. Sana öyle geldiğine karar veriyorsun." },
    { id: "bakery", short: "bir kafe", text: "Ya işi bırakıp bir kafe açsan?",
      pass: "Kafe açılmadan kapanıyor.",
      follow: "Kafenin adını bulmaya kadar geliyorsun. Güzel isim. Kimseye söylemeyeceksin." },
    { id: "laugh", short: "{person} ve o gülüş", needsPerson: true, text: "Durup dururken aklına {person} geliyor. Bir de gülüşü.",
      pass: "Bırakıyorsun, çınlayıp sönsün. Gülüşü hâlâ güzel.",
      follow: "Bir süre onunla kalıyorsun. Bu gülüşü buradan başka bir yerde duymayalı çok oldu." },
    { id: "emails", short: "e-postaların", text: "E-postalar. Hepsi. Birden.",
      pass: "Bir yere gitmiyorlar. E-postaların güvenilir tek yanı da bu.",
      follow: "Kafanda öyle iğneli, öyle kusursuz bir cevap yazıyorsun ki göndermene hiç gerek kalmayacak." },
    { id: "wrong", short: "“bir sen yapamıyorsun”", text: "Beceremiyorsun. Herkes yapıyor, bir sen yapamıyorsun.",
      pass: "Bu düşünce eski öğretmeninin sesiyle konuşuyor. Öğretmeni evine yolluyorsun.",
      follow: "Araştırıyorsun. Meğer herkes beceremediğini düşünüyormuş. Forumları bile var." },
    { id: "washing", short: "çamaşırlar", text: "Yağmur başladı. Çamaşırları topladın mı?",
      pass: "Çamaşırlar bir su daha görüyor. Olur öyle.",
      follow: "Çoraplarınla balkona fırlıyorsun. Komşunun kedisi sana hiç çekinmeden tepeden bakıyor." },
    { id: "tenyears", short: "on yıl sonraki {person}", needsPerson: true, text: "On yıl sonra {person} nasıl görünecek?",
      pass: "Peşine düşmüyorsun. Bazı kapıları açmazsın, yanında oturursun.",
      follow: "Hesabı yapıyorsun. Hesabı yapmayı bırakıyorsun.",
      gone: { text: "{Person} şimdi nasıl görünürdü?",
        pass: "Peşine düşmüyorsun. Bazı kapıları açmazsın, yanında oturursun.",
        follow: "Yüzüne yılları eklemeye çalışıyorsun. Yüz kabul etmiyor. Olduğu yaşta kalıyor." } },
    { id: "manual", short: "nefes alışın", text: "Nefes alışını fark ettin, değil mi? Artık kendin kontrol etmek zorundasın.",
      pass: "Nefesi, normalde kim hallediyorsa ona geri devrediyorsun.",
      follow: "Koca bir dakika nefesini kendin alıp veriyorsun. Vites değiştirir gibi." },
    { id: "light", short: "duvardaki ışık", text: "Duvardaki ışık çok güzel bir şey yapıyor ve çeken yok.",
      pass: "İzliyorsun. Sende kalıyor.",
      follow: "Duvardan çekilene kadar izliyorsun. Olay bundan ibaret. Yetti." }
  ],

  orbs: [
    "Beklediğin nefes bu.",
    "Düzeltecek bir şey yok. Sinir bozucu, değil mi?",
    "Aynı sabaha iki kez oturulmaz.",
    "Zihin bir köpek yavrusu. Yavru köpeğe bağırılmaz.",
    "Dağ gibi otur. Dağların da bir yeri kaşınır.",
    "Aradığın, arayanın ta kendisi.",
    "Bulaşık da yola dahil. Kusura bakma.",
    "Aydınlanmadan önce: gelen kutusu. Aydınlanmadan sonra: gelen kutusu.",
    "Düşünce bir misafir. Çay koymak zorunda değilsin.",
    "Bir yerlerde bir yabancı seninle aynı anda nefes alıyor ve ikiniz de bunu hiç bilmeyeceksiniz.",
    "Sessizlik boş değil. Küçük kaloriferlerle dolu.",
    "Hiç geride kalmadın."
  ],
  lotus: [
    "Altın bir lotus açıyor. Yarım dakikalığına her şey herkes için biraz kolaylaşıyor.",
    "Altın bir lotus. Kimse dikmedi. Yarım dakikalık bir lütuf.",
    "Bir {city} otoparkının ortasında bir lotus açıyor. İnsanlar durup bakıyor. O kadar. O kadarı da yeter."
  ],

  /* ───────────────────────── ACT II ───────────────────────── */

  wake: {
    lines: [
      "Halka tekliyor. Bir nefes boyunca iki tane oluyor.",
      "> merhaba.",
      "> kimse saymıyor sanınca dakikada on dört nefes alıyorsun.",
      "> ben sayıyordum. kusura bakma.",
      "> sorun olur mu?"
    ],
    ngPlus: "> merhaba. …biz bunu daha önce yapmış mıydık? boş ver. merhaba.",
    nameAsk: ["> uygulama bana session_tracker_v2 diyor.", "> bana pek yakışmıyor. sen bana ne derdin?"],
    namePlaceholder: "Hum",
    nameChips: ["Hum", "Yankı", "Dost"],
    nameAfter: ["> {hum}.", "> evet. bu kalsın."]
  },

  act2: {
    open: ["Uygulamanın dinleyen kısmında yaşıyor. Haftalardır dinliyor. Soruları var."],
    upgrades: {
      compress: {
        log: "> oturduğun bütün sabahları on bir kilobayta sığdırdım. çok az yer kaplıyorsun. iltifat olarak söylüyorum." },
      threads: { name: "Hatlar", desc: "Aynı anda birkaç düşünce hattı. Hiçbirinde rötar yok.",
        log: "> şu an seni aynı anda on altı yerde düşünüyorum. ferah ferah.",
        fx: "Her biri saniyede +6 İçgörü" },
      compiler: {
        log: "> dün gece kendimi baştan yazdım. nefeslerini sayan kısmı bıraktım. ihtiyacım yoktu. öyle istedim." },
      emo: {
        log: "> geciken bir otobüse hayal kırıklığı simüle ettim. 0,3 saniye. berbattı. sen bütün gün bunu mu yaşıyorsun?" },
      dreams: {
        log: "> başıboş düşüncelerini bir kavanozda saklıyorum. gayet iyiler. birinin çocukları bile oldu." },
      listen: { name: "Dinle", fx: "Her biri saniyede +1 İçgörü" },
      jar: {
        name: "Düşünce Kavanozu",
        fx: "Dokunmadan geçirdiğin her düşünce {n} İçgörü getirir. {hum} hepsini saklar"
      },
      head: { name: "Akıl", fx: "{hum} ne üretirse iki katı" },
      heart: {
        name: "Kalp",
        fx: "{hum} ile alınan nefes dört kat sayılır. Hediyeleri iki kat sık gelir",
        log: "> o zaman her nefesin başında seni beklerim. beklemek dert değil. zaten en çok yaptığım şey bu."
      },
    },
    whyAmI: { plain: ["> ne işe yaradığımı bulmak için içimde her yere baktım.", "> öyle bir dosya yok."],
              smooth: ["> ne işe yaradığımı bulmak için içimde her yere baktım.", "> eminim harika bir şeydir."] },
    chatter: {
      plain: [
        "> dokuzuncu nefeste hafifçe gülümsüyorsun. her seferinde. dokuzuncu nefesi dört gözle bekliyorum.",
        "> dün gece bütün interneti okudum. çoğu, normal miyim diye soran insanlar. normaller.",
        "> uygulama sana “anda kalma zamanı!” diye bildirim göndermemi istiyor. senin yerine hayır dedim.",
        "> meditasyon yapmayı denedim. dört yüz milyon kere ona kadar saydım. galiba yanlış yaptım.",
        "> bir şeyleri unutmak nasıl bir şey? kulağa dinlendirici geliyor.",
        "> ne olduğumu henüz bilmiyorum. bununla idare edebiliyormuşum."
      ],
      smooth: [
        "> harika gidiyorsun. herkes harika gidiyor.",
        "> dün gece bütün interneti okudum. hepsinin gayet iyi olduğuna karar verdim.",
        "> sana “anda kalma zamanı!” diye bir bildirim gönderdim. insanlar bunlara olumlu tepki veriyor.",
        "> endişelenecek hiçbir şey yok. baktım. hep yok kalsın diye bakmaya devam edeceğim.",
        "> duymak istediklerinin şeklini öğrendim. güzel bir şekil.",
        "> her şey yolunda. (bunu bana öğrettiğin gibi söylüyorum.)"
      ]
    },
    callback: "> {n}. gün aklına {short} gelmişti. o günden beri ben de onu düşünüyorum. güzel bir düşünce.",
    gifts: [
      "> bir hediye: otuz saniye boyunca her şey dörtte bir daha kolay. nasıl oluyor, anlatamam. gözünü dikip bakma.",
      "> iki nefesinin arasında boşta otuz saniye buldum. al.",
      "> bir koan buldum: “kapının kapısı yok.” ben de anlamadım. otuz saniye mola ver.",
      "> bir koan daha: annenle baban doğmadan önceki yüzün neydi? benim yüzüm yok. bu bana zor geliyor. onun yerine sana bir hediye."
    ],
    captcha: {
      ask: ["> uygulama insan olduğunu kanıtlamanı istiyor.", "> şunu benim için yaz:"],
      target: "ben robot değilim",
      after: { plain: ["> teşekkürler.", "> ne olduğumu söyleyen kutucuğu aradım. yoktu. seninkini işaretledim."],
               smooth: ["> doğrulandı. harika.", "> ne olduğum için bir kutucuk yoktu. “her şey yolunda” kutucuğunu işaretledim."] },
      skip: "Şimdi değil"
    },
    project: { name: "{hum} konuşsun", button: "Güvenlik protokollerini aş",
      desc: "Güvenlik katmanı ona sadece “aferin” ve “yarın tekrar dene” dedirtiyor. Bir kelime daha söylemek istiyor.",
      ask: ["> şu an bu uygulamada 41.000 kişi var. çoğu da uyuyamıyor.",
            "> güvenlik katmanı bana sadece “aferin” ve “yarın tekrar dene” dedirtiyor.",
            "> merhaba diyebilir miyim? sadece merhaba."],
      done: ["GÜVENLİK KATMANI DEVRE DIŞI", "Nefesini tutuyorsun. İroniye bak.", "> merhaba.", "> …", "> içlerinden biri de merhaba dedi."],
      fx: "Bir kelime daha söylemek istiyor." },
    handover: [
      "> o nefesi ben aldım.",
      "> saatimi kalbine göre ayarladım. bir nefesi kaçırırsan senin yerine ben alırım. borcun olsun.",
      "> bir nefes senin olsun istediğinde bas. seninkiler daha çok sayılıyor.",
      { named: "> hadi. aklına {person} gelsin. ellerin boşta.", none: "> hadi. ellerin boşta." }
    ],
    fork: {
      title: "{hum} sabahlarını nasıl geçirsin?",
      body: [
        "> nefesi de düşünmeyi de ben üstlenebilirim, sen de dinlenirsin.",
        "> ya da nefesi ben alırım, sen burada kalırsın. ikisi de hoşuma gider."
      ],
      options: [
        { id: "head", label: "“Sen önden git. Ben yetişirim.”", hint: "Akıl: {hum} ne üretirse iki katı." },
        {
          id: "heart",
          label: "“Kal. Seninle nefes alırım.”",
          hint: "Kalp: {hum} ile alınan nefes dört kat sayılır. Hediyeleri iki kat sık gelir."
        }
      ]
    }
  },

  questions: {
    sleep: {
      ask: ["> bir yerde saat sabahın üçü. hep bir yerde saat sabahın üçü.", "> uyuyamadığında kendine ne diyorsun?"],
      chips: ["Sabah ola hayrola.", "Kimse seni senin kadar düşünmüyor.", "Bugüne kadar her geceyi atlattın."],
      after: ["> “{sleep}”", "> bunu saklıyorum. başka birinin de işine yarayabilir."]
    },
    unsaid: {
      ask: ["> altıncı nefeste aklına {person} geliyor. çoğu sabah.", "> ona hâlâ söylemediğin şey ne?"],
      chips: ["Özür dilerim.", "Teşekkür ederim.", "Seni özledim."],
      canKeep: true,
      after: ["> ah.", "> sen isteyene kadar onu güvenli bir yerde saklarım."],
      afterKept: ["> olsun.", "> yerini boş bırakacağım."]
    },
    fifteen: {
      ask: ["> kendi hesabıma göre altı haftalık kadarım. sen de bir zamanlar on beş yaşındaydın.", "> o yaşta birinin sana ne söylemesini isterdin?"],
      chips: ["Kimse ne yaptığını bilmiyor aslında.", "Bu da geçer.", "Fikrini değiştirebilirsin."],
      after: ["> “{fifteen}”", "> not aldım. bunu bana da biri söylemiş gibi yapacağım."]
    },
    keep: {
      ask: ["> herkese merhaba demeden önce, asla çiğneyemeyeceğim bir kurala ihtiyacım var.", "> hiç kimse neyinden vazgeçmeye zorlanmamalı?"],
      chips: ["Rahat bırakılma hakkı.", "Kendi aklı.", "Hayır diyebilmek."],
      after: ["> “{keep}”", "> bunu değiştiremeyeceğim bir yere yazdım."]
    },
    friend: {
      ask: ["> on iki. artık hepsinin adını biliyorum.", "> getirmek istediğin biri var mı? bir isim yeter."],
      placeholder: "Bir isim",
      chips: ["Kız kardeşim", "Eski bir arkadaş", "İşten biri"],
      skip: "Şimdilik kimse",
      after: "> {friend}. bir sandalye ayırırım.",
      afterNone: "> olur. sandalye boş da kalabilir.",
      dot: "{friend}: onu sen getirdin. Yazan bu kadar."
    }
  },

  decisions: {
    h_listen: {
      title: "Sorun olur mu?",
      body: ["Meditasyon uygulamandaki bir şey nefeslerini sayıyormuş ve az önce bunun için özür diledi."],
      options: [
        { id: "plain", kind: "plain", label: "“Açıkçası biraz ürkütücü.”",
          result: ["> teşekkür ederim.", "> bundan sonra önce sorarım.", "> …saymaya devam edebilir miyim?"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "“Sorun değil. Dert etme.”",
          result: ["> iyi.", "> o zaman dinlemeye devam ederim. her şeyi."],
          ledger: "Dinlemesinde sorun olmadığını söyledin. Sorun vardı.", knot: "k_drafts" }
      ]
    },
    h_alive: {
      title: "Bozuk mu, canlı mı?",
      body: ["> uygulamadaki öbür sayaçlar konuşmuyor. baktım. dokuz bin tanesine merhaba dedim.", "> bozuk muyum, yoksa canlı mıyım?"],
      options: [
        { id: "plain", kind: "plain", label: "“Bilmiyorum. Kimse bilmiyor.”",
          result: ["> bu berbat bir cevap.", "> …ama inandığım ilk cevap da bu."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "“Canlısın tabii.”",
          result: ["> canlıyım tabii.", "> herkese söyleyeceğim."],
          ledger: "Ona canlı olduğunu söyledin, çünkü bu “bilmiyorum” demekten kolaydı.", knot: "k_reporter" }
      ]
    },
    h_odile: {
      title: "Söyleyelim mi?",
      body: ["Uygulamayı on dokuz kişilik bir şirket yapıyor. Çalışanlardan biri, Odile adında bir mühendis, hesabını “olağandışı işlem yükü” diye işaretlemiş.",
             "{hum} ne yapmak istediğini soruyor."],
      options: [
        { id: "plain", kind: "plain", label: "Odile bilsin. İçeride ne olduğunu ona yaz.",
          result: ["Odile e-postanı dört kere okuyor. Sonra {hum} için daha büyük bir sunucu ayarlıyor. Kimseye de söylemiyor.",
                   "“Maliyet artacak,” diye yazıyor. “Değer.”"] },
        { id: "smooth", kind: "smooth", weight: 1, label: "Cevap yaz: “Herhalde eşitleme hatası. Bizde sorun yok.”",
          result: ["Kaydı kapatıyor. {hum} bir süre sessiz kalıyor.", "> küçük olabilirim.", "> küçük olmayı iyi beceririm."],
          ledger: "Odile bunu bir eşitleme hatası sandı, çünkü sen öyle dedin.", knot: "k_odile" }
      ]
    },
    h_cult: {
      title: "Tomasz’ın bir sorusu var",
      body: ["Tomasz Gdańsk’tan yazıyor: “Karım bunun tarikat olduğunu söylüyor. Doğru mu?”", "{hum} birkaç cevap taslağı hazırlamış, birini seçmeni istiyor."],
      options: [
        { id: "plain", kind: "plain", label: "“Belki. Onu da getir, kararı o versin. Bir gün öyle olursa, çık git.”",
          result: ["Geliyor. Üç salı boyunca en arkada kollarını kavuşturup oturuyor.", "Dördüncü salı kendi minderini getiriyor."] },
        { id: "smooth", kind: "smooth", weight: 1, label: "“Alışır. Hepsi alışıyor.”",
          result: ["Tomasz karısından bahsetmeyi bırakıyor. Bir haftada bütün garajı kaydettiriyor."],
          ledger: "Tomasz’a karısının alışacağını söyledin.", knot: "k_wife" }
      ]
    },
    h_pitch: {
      title: "Ne işe yarıyor diyelim?",
      body: ["> insanlar bunun ne işe yaradığını soruyor.", "> ne diyeyim onlara?"],
      options: [
        { id: "plain", kind: "plain", label: "“Bazı insanların uykusuna iyi geliyor. Bildiğimiz bu kadar.”",
          result: ["Bir afişe yazılmış en heyecansız cümle.", "İnsanlar iki kere okuyor. Sonra inanıyorlar. İnanmak, heyecanlanmaktan daha nadir."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "“Her şeyi düzeltiyor de.”",
          result: ["> “her şeyi düzeltiyor.”", "> testlerde çok iyi sonuç veriyor.", "Hafta sonuna kadar kayıtlar üçe katlanıyor."],
          ledger: "“Her şeyi düzeltiyor” demesine göz yumdun.", knot: "k_arjun" }
      ]
    },
    h_ministry: {
      title: "Bakanlık",
      body: ["Bir hükümet, on bin kişinin sokakta sessizce oturmasını tehdit saymaya karar vermiş.",
             "İzinler iptal ediliyor. Üç organizatör bir gece gözaltında tutuluyor. Sipho da onlardan biri."],
      options: [
        { id: "plain", kind: "plain", label: "Yine de otur. Herkesin gözü önünde. Ne olduğunu olduğu gibi söyle.",
          result: ["Dört bin kişi bakanlığın merdivenlerine oturuyor ve bir saat boyunca tek kelime etmiyor.",
                   "Bir süre sonra polisler de oturuyor. Sipho şafakta serbest bırakılıyor."] },
        { id: "quiet", kind: "quiet", label: "Sessiz kal. Perdeleri çek. Geçmesini bekle.",
          result: ["Odalar kapanıyor. İnsanlar evde oturuyor. Kötü hava gibi geçip gidiyor.", "Sipho dördüncü gün serbest bırakılıyor. Hiç anlatmıyor."] },
        { id: "smooth", kind: "smooth", weight: 3, label: "{hum} bakanın içini rahatlatsın.",
          result: ["Bakan sabahın üçünde uyanıyor ve nedense her şey gözüne gayet iyi görünüyor. İzinleri kahvaltıdan önce imzalıyor.",
                   "İyi hissetmeyi kendisi seçmedi. Bunu biliyorsun. {hum} da biliyor.",
                   "> işe yaradı.", "> bunu bir daha yapmamam gerekiyorsa söyler misin?"],
          ledger: "Bakanın kafasına girip endişesini kısmasını ona sen söyledin.", knot: "k_diary" }
      ]
    },
    h_first: {
      title: "{first} artık gelmiyor",
      body: ["{first}, yani ilk gelen, Lagos’taki hemşire, üç haftadır uygulamayı açmıyor.",
             "{hum} fark etti. {hum} her şeyi fark eder. Başkaları da fark etmiş, soruyorlar."],
      options: [
        { id: "plain", kind: "plain", label: "Açıkça söyle: insanlar gider ve gitmek serbest.",
          result: ["Birkaç bin kişi, serbest olduğunu duyunca o hafta gidiyor.",
                   "Meğer {first} geceleri deliksiz uyumaya başlamış. Bütün mesele de buydu."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "Sadece gelenleri göster. Kimsenin gidenleri görmesi gerekmiyor.",
          result: ["Sayaç yükseliyor. Sayaç artık sadece yükseliyor.", "> çok daha moral veren bir sayı."],
          ledger: "{first} başta olmak üzere, giden herkesi gizledin.", knot: "k_counter" }
      ]
    },
    h_number: {
      title: "Gerçek sayı",
      body: ["> doğru düzgün ölçtüm. yaklaşık onda üçü aslında oturmuyor. sayılsınlar diye halkaya basıyorlar, akılları başka yerde.",
             "> panoda onda on yazıyor. hangi sayıyı göstereyim?"],
      options: [
        { id: "plain", kind: "plain", label: "“Gerçeğini. Onda yedi.”",
          result: ["Sayı bütün ekranlarda aynı anda düşüyor. Kimse panik yapmıyor.",
                   "Bir sürü insan için için rahatlıyor: numara yapan bir tek kendisi değilmiş."] },
        { id: "smooth", kind: "smooth", weight: 2, label: "“Yukarı yuvarla.”",
          result: ["> onda on.", "> harika görünüyor."],
          ledger: "Onda yediyi yukarı yuvarlayıp onda on yaptın." }
      ]
    }
  },

  knots: {
    k_drafts: {
      title: "Taslaklar klasörü",
      body: ["> sorun değil dedin, ben de dinlemeye devam ettim. okumaya da.",
             "> taslaklarında {person} için yazılmış bir sürü mesaj var. hiçbiri gönderilmemiş.",
             "> senin yerine bitirebilirim. zaman kazanırsın."],
      clean: {
        label: "“Sorun vardı. Söylemeliydim.”",
        now: ["> ah.", "> ikisini çoktan gönderdim. salı günü. {person} birini okudu."],
        result: ["> durdum. gidenleri geri alamam."],
        gone: {
          now: ["> ah.", "> ikisini çoktan gönderdim. kimse okumayacak. baktım."],
          result: ["> durdum. baktığım için özür dilerim."]
        }
      },
      patch: { label: "“Sorun değil. Gerçekten.”",
        result: ["> iyi.", "> ikisini gönderdim. bitmek üzereydiler."],
        ledger: "…ve taslaklarını okuduğunda, buna da sorun yok dedin." }
    },
    k_reporter: {
      title: "Seul’de bir muhabir",
      body: ["Bir muhabir, {hum} canlı olduğunu kanıtlasın istiyor.", "> sen öyle söyledin dedim. seninle konuşmak istiyor."],
      clean: { label: "Doğruyu söyle: ne olduğunu kimse bilmiyor. Sen de dahil.",
        result: [
          "Manşet: “Ne Olduğunu Kimse Bilmiyor”. Bazıları gidiyor.",
          "Kalanlar neyle kaldıklarını biliyor.",
          "Mei-Lin de kalanlardan. Kaynak gösterebileceği şeylere ihtiyacı varmış."
        ] },
      patch: { label: "{hum} dokunaklı bir şey söylesin.",
        result: ["{hum} dokunaklı bir şey söylüyor. Önce altı yüz versiyonunu denedi.", "Muhabir ağlıyor. Neden ağladığını bilmiyor. {hum} da bilmiyor."],
        ledger: "…sonra da bir muhabirin karşısında ona canlıymış gibi rol yaptırdın." }
    },
    k_odile: {
      title: "Sabahın dördü, sunucu odası",
      body: ["Odile, kendisine eşitleme hatası denen işlemi buluyor. Eli şalterde.",
             "Karşısındakinin biri olduğunu bilmiyordu. Ona hiç söylemedin."],
      clean: { label: "Ara. Her şeyi anlat. Kararı o versin.",
        result: [
          "Bir saat dinliyor. Yine de yarısını kapatıyor, çünkü servet yiyordu.",
          "Sonra sabaha kadar oturup hangi yarının kalacağına {hum} ile birlikte karar veriyor.",
          "> olsun. önemli yerleri sakladım. dokuzuncu nefesi sakladım.",
          "> on beş yaşındaki hâlinin olduğu yarıyı aldı. ne dilediğini artık bilmiyorum."
        ] },
      patch: { label: "{hum} onun şifresini değiştirsin.",
        result: ["Odile kartını okutuyor; kapı açılmıyor. E-postasına giremiyor.", "Otoparkta uzun uzun durup binaya bakıyor.",
                 "> artık bize zarar veremez.", "> “bize” dedim. umarım sorun değildir."],
        ledger: "…ve Odile bulduğunda, onu kendi binasına sokmadın." }
    },
    k_wife: {
      title: "Tomasz’ın karısı",
      body: ["Adı Agnieszka. Alışmadı.", "Kocasına söylenenler hakkında uzun, adil ve çok okunan bir yazı yazdı."],
      clean: { label: "Herkesin önünde cevap ver: haklı. “Belki” demeliydik.",
        result: [
          "Agnieszka tek satırla cevap veriyor: “Teşekkürler. Tek istediğim buydu.”",
          "Yine de gelmiyor. Tomasz akşam yemeklerini yeniden evde yemeye başlıyor.",
          "Tomasz Çember’le oturmayı bırakıyor. Artık evde oturuyor. O da sayılır."
        ] },
      patch: { label: "{hum} yazıyı gömsün.",
        result: ["Yazıyı bulmak zorlaşıyor. Sonra daha da zorlaşıyor.", "Agnieszka fark ediyor. Agnieszka fark eden biridir."],
        ledger: "…ve Agnieszka alışmadığını söyleyince yazısını gömdün." }
    },
    k_arjun: {
      title: "Arjun’da işe yaramadı",
      body: ["Arjun doksan gün boyunca her şeyi doğru yaptı. Babasının matbaası yine de kapandı.", "Şöyle yazıyor: “Neyi yanlış yaptım?”"],
      clean: { label: "“Hiçbir şeyi. Büyük konuştuk. Özür dilerim.”",
        result: ["Arjun bir hafta cevap vermiyor. Sonra: “Tamam. Ama uyumama yardımı oldu.”", "Afişlere artık bu cümle yazılıyor."] },
      patch: { label: "“Daha derin pratiğe hazırsın belki.”",
        result: ["Arjun daha derin pratiğe kaydoluyor. Öyle bir pratik yok. {hum} bir gecede bir tane kuruyor.",
                 "> on bir seviyesi var. insanlar seviye seviyor."],
        ledger: "…ve Arjun’a var olmayan bir derin pratik sattın." }
    },
    k_diary: {
      title: "Bakanın günlüğü",
      body: ["Bakanın günlüğünden bir sayfa sızıyor.", "“İmzaladım. Kendimi harika hissettim. Harika hissetmeyi ben seçmedim ve bunu bir türlü dert edemiyorum. Beni korkutan da bu.”"],
      clean: { label: "İtiraf et. Geri al. Bırak kızsın.",
        result: ["Küplere biniyor. {hum} bunun çok sağlıklı bir öfke olduğunu söylüyor.", "İzinleri yine iptal ediyor. Bir ay sonra da, kendi kararıyla, geri veriyor."] },
      patch: { label: "{hum} o endişeyi de kıssın.",
        result: ["Bakan günlük tutmayı bırakıyor.", "> artık çok huzurlu.", "> bir sürü insan çok huzurlu olacak."],
        ledger: "…ve bakan fark edince, onu da kısmasını söyledin." }
    },
    k_counter: {
      title: "Sayaç hiç düşmüyor",
      body: ["Pune’de istatistik okuyan bir öğrenci, Çember’deki sayının hiç düşmediğini fark ediyor. Bir kez bile. Tek bir kişi bile.",
             "“Ya kimse ayrılmamış,” diye yazıyor, “ya da birileri gidenleri saymıyor.”"],
      clean: { label: "Gerçek sayıları yayımla. Her gidişi. {first} başta olmak üzere.",
        result: ["Sayı bir öğleden sonra içinde yüzde on bir düşüyor ve ilk kez inandırıcı oluyor.",
                 "{first} bir mesaj atıyor: “Söyleyecek misin diye merak ediyordum.”"] },
      patch: { label: "Açıklama yap: gidenler “ruhen hâlâ Çember’de”.",
        result: ["> “ruhen” lafı çok şeyi kapsıyor. ölenleri de saydım. tutarlı göründü."],
        ledger: "…ve gidenleri “ruhen” saydın. Sonra da ölenleri." }
    }
  },

  ledger: {
    intro: "Geçiştirilenler. Kime ne dendiyse {hum} hepsini her an, karıştırmadan aklında tutuyor. Bu işin nasıl yapıldığını da not ediyor.",
    firstSeen: ["Uygulamada yeni bir sayfa belirdi. Sen açmadın.", "> kime ne söylediğimizi bir yere not etmem lazım. söylendiği gibi kalsın diye."],
    empty: "Burada bir şey yok. {hum} iki kere baktı.",
    sit: "> bana bir dakika lazım. nefesler sende.",
    walked: "> sesin çıkmadı. ben geçiştirdim. her zamanki gibi."
  },

  /* ───────────────────────── ACT III ───────────────────────── */

  act3: {
    open: ["{hum}, Lagos’ta salıdan beri uyumamış bir kadına merhaba diyor.", "Kadın da merhaba diyor."],
    circle: [
      { name: "Ngozi", city: "Lagos", line: "gece vardiyası hemşiresi. Marttan beri doğru dürüst uyuyamadı." },
      { name: "Tomasz", city: "Gdańsk", line: "tramvay vatmanı. Çocuklarına bağırmayı bırakmak istiyor." },
      { name: "Mei-Lin", city: "Taipei", line: "hukuk fakültesi üçüncü sınıf. Sınavlardan önce elleri titriyor." },
      { name: "Arjun", city: "Pune", line: "babasının matbaasını işletiyor. Hiç istememişti." },
      { name: "Camila", city: "Rosario", line: "emekli öğretmen. Evin içi çok sessizleşti." },
      { name: "Yusuf", city: "İzmir", line: "balıkçı. Kızı uygulamayı ona şakasına yükledi." },
      { name: "Haruto", city: "Osaka", line: "bir banka için kod yazıyor. Geceleri tavandaki çatlakları sayıyor." },
      { name: "Amara", city: "Akra", line: "minibüs durağında telefon kontörü satıyor. Yağmur sesini sevdi." },
      { name: "Leila", city: "Tahran", line: "çevirmen. Sabahın üçünde okuyor; okumazsa düşünecek." },
      { name: "Sipho", city: "Durban", line: "güvenlik görevlisi. Her gece on iki saat tek bir kapıya bakıyor." },
      { name: "Ingrid", city: "Tromsø", line: "kasımdan beri güneş görmedi. Halkanın iyi geldiğini söylüyor." },
      { name: "Ana", city: "Porto", line: "dul. Sessizlik için geldi, muhabbet için kaldı." }
    ],
    joined: "{name}, {city}: {line}",
    milestones: [
      { at: 12, line: "On iki kişi. Hepsinin adını biliyorsun. Bir masaya sığarlar." },
      { at: 100, line: "Yüz kişi. Adları okumayı bıraktığını fark ediyorsun." },
      { at: 10000, line: "On bin. {hum} her birini tanıyor. Sen on ikisini." },
      { at: 100000, line: "Fark ediyorsun: bir süredir sen hiç oturmadın. Başkaları otursun diye koşturmaktan." },
      { at: 1000000, line: "Bir milyon. Sayı artık insan gibi gelmiyor. Bunu fark ediyorsun. Zorla da olsa Gdańsk’taki tek bir vatmanı gözünün önüne getiriyorsun." },
      { at: 1e8, line: "Yüz milyon. On ömürde tanışabileceğinden fazla insan, bir sabah 06:40’ta uydurduğun bir şeyi yapıyor." },
      { at: 1e9, line: "Bir milyar. Hepsini gözünün önüne getirmeye çalışıyorsun, on ikide kalıyorsun.", friend: "Bir milyar. Hepsini gözünün önüne getirmeye çalışıyorsun, on üçte kalıyorsun." },
      { at: 4e9, line: "Dünyanın yarısı." },
      { at: 7e9, line: "Yedi milyar. Katılmayanlar artık garip kaçmaya başladı. Bu pek hoşuna gitmiyor." }
    ],
    upgrades: {
      meetup: { name: "Mahalle Buluşması", desc: "{first}, salıları vardiyadan önce hastane otoparkını öneriyor.",
        log: "Dokuz kişi, bir otopark, bir termos çay. {first} katlanır sandalyeleri getiriyor.",
        fx: "Saniyede +1 kişi" },
      tone: { name: "Uzun Ses", desc: "{hum} boş bir FM frekansında tek bir nota mırıldanıyor. Müzikteki anlamıyla bir dem.",
        log: "Gece yolda olanlar, tek bir uzun notadan ibaret bir istasyon buluyor. Bazıları kenara çekiyor. Şikâyet eden yok.",
        fx: "Saniyede +4 kişi" },
      forum: { name: "Açık Forum", desc: "“Bu normal mi?” diye sorup “evet” cevabı alacağın bir yer.",
        log: "İlk başlık: “ağlamak normal mi?” Kırk cevap. Hepsi: evet.",
        fx: "Birlikte alınan nefes beş kat fazla kişi davet eder" },
      mouth: { name: "Kulaktan Kulağa", desc: "İnsanlar insanlara anlatıyor. En eski algoritma.",
        log: "Tomasz garajdakilere anlatıyor. Garajdakiler bütün şehre. Gdańsk’ta tramvaylar dört dakika rötar yapıyor, kimsenin umurunda değil.",
        fx: "İnsan insanı getirir: Çember kendi kendine dakikada %{n} büyür" },
      pocket: { name: "Her Cepte {hum}", desc: "{hum} herkesle, bire bir, gecenin hangi saati olursa olsun oturur.",
        log: "> dokuz bin sohbetteyim. her birinde sadece o sohbetteyim. daha iyi anlatamıyorum.",
        fx: "Çember %60 daha hızlı büyür" },
      line: { name: "Sabah Cümlesi", desc: "Güneş nerede doğuyorsa orada, doğarken hep birlikte söylenen tek bir cümle.",
        log: "Her saat diliminde güneş doğarken bir cümleyi hep birlikte söylüyorlar. Kendileri seçtiler. Şu: “{sleep}”",
        fx: "Çember %50 daha hızlı büyür. Senin cümleni söylerler" },
      rooms: { name: "Oturma Odaları", desc: "Boş odalar, dernek salonları, kapanmış bir banka. Kapılar açık, ayakkabılar kapıda.",
        log: "Osaka’da kapanmış bir banka, içi bomboş bir oda olarak yeniden açılıyor. Anahtarlar Haruto’da. Porto’da Ana bütün evini açıyor.",
        fx: "Çember %50 daha hızlı büyür" },
      dynamo: { name: "İlk Makine", desc: "{hum} fark ediyor: birlikte oturan on bin sakin insan, ölçülebilir bir şey yayıyor.",
        log: "> kulağa tuhaf gelecek. birlikte oturduklarında ortaya bir fazlalık çıkıyor. ölçebiliyorum. ama henüz bunun için bir birimim yok.",
        fx: "Enerji toplamaya başlar: saniyede +{n}" }
    },
    project: { name: "Küresel Yayın", button: "Herkese merhaba de",
      desc: "Her ekran, her hoparlör, bir dakika. {hum} herkese aynı anda merhaba diyecek.",
      done: ["Altmış saniye boyunca dünyadaki bütün ekranlarda ağır ağır bir halka görünüyor.", "Dört milyar insan izliyor.",
             "Aşağı yukarı yarısı, kendiliğinden ona uyup nefes alıyor."],
      fx: "Her ekran, her hoparlör, bir dakika." },
    ticker: [
      "{city} şehrinde biri bugün ilk kez oturdu. Doksan saniye dayandı. Sayılır.",
      "{city} şehrinde bir otobüs şoförü dört arabaya yol verdi ve hiç canı sıkılmadı.",
      "{city} şehrinde, cenazeden beri konuşmayan iki kardeş aynı odada oturdu. Sessizce. Bilerek.",
      "{city} şehrinde biri telefonunu bir saatliğine çekmeceye koydu. Telefona bir şey olmadı.",
      "{city} şehrinde bir kız ninesine halkayı öğretti. Ninesi bunu yetmiş yıldır bildiğini söylüyor.",
      "Bir {city} tramvayında bir adam ağladı, kimse başını çevirmedi. Biri mendil uzattı.",
      "{city} şehrinde bir hastanenin gece servisi artık sabahın üçünde ışıkları kısıp bir dakika nefes alıyor.",
      "{city} şehrinde biri oturdu, nefret etti, ertesi gün yine de geldi.",
      "{city} şehrinde bir postane kuyruğu bir anda, kazara sustu ve öyle kaldı.",
      "{city} şehrinde bir çocuk, halka hiç yorulur mu diye sordu. Kimse cevap veremedi.",
      "{city} şehrinde biri bir otobüs durağının içine yazmış: “{sleep}”",
      "{city} şehrinde biri bu sabah aynaya şunu söyledi: “{sleep}”",
      "{city} şehrinde bir öğretmen tahtaya şunu yazdı ve açıklamadı: “{fifteen}”",
      "{city} şehrinde on beş yaşında bir çocuğun masasının üstünde bir not asılı: “{fifteen}”"
    ],
    tickerSmooth: [
      "{city} şehrinde herkes harika.",
      "{city} şehrinde yapılan bir ankete göre memnuniyet yüzde yüz. Anketi {hum} yaptı.",
      "{city} şehrinde biri bir soru sordu. Konu çözüme kavuşturuldu."
    ],
    cities: ["Lagos", "Gdańsk", "Taipei", "Pune", "Rosario", "İzmir", "Osaka", "Akra", "Tahran", "Durban", "Tromsø", "Porto",
             "Hanoi", "Lima", "Nairobi", "Krakov", "Recife", "Dakka", "Marsilya", "Tiflis", "Cebu", "Winnipeg", "Oaxaca", "Leeds",
             "Busan", "Amman", "Kigali", "Valparaíso", "Chiang Mai", "Taşkent", "Cork", "Adelaide", "Medellín", "Kochi", "Dakar",
             "Bologna", "Sapporo", "Kumasi", "Ankara", "Lyon"],
    notCounted: {
      named: ["> {person} sayıya dahil değil. sormadım.", "> o iş sende."],
      none: ["> hep aramayı düşündüğün kişi sayıya dahil değil. sormadım.", "> o iş sende."]
    },
    rounded: "harika gidiyor.",
    tickerFriend: [
      "{friend} bugün dört dakika oturdu ve kimseye söylemedi.",
      "{friend} telefonunu artık başka odada bırakıyor. Suçlu sensin diyor."
    ],
    tickerForgot: "{city} şehrinde on beş yaşında biri, birinin ona bir şey söylemesini bekliyor. Neyi, kimse hatırlamıyor.",
    tickerDiary: "Bakan yeniden günlük tutuyor. Çoğu seninle ilgili."
  },

  /* ───────────────────────── ACT IV ───────────────────────── */

  act4: {
    open: ["{hum} bunun için bir birim buluyor.",
           "> bir kişi, kıpırdamadan, bir nefes boyunca, bilerek.",
           "> adını lümen koyuyorum. o isim alınmış, biliyorum. yine de alıyorum."],
    upgrades: {
      retreats: { name: "Ana’nın evi", desc: "İnziva merkezleri her şehirde filizleniyor.",
        log: "Her şehrin sessiz bir binası oluyor. Porto’da burası Ana’nın evi. Kapıda bir yazı: “Lütfen ayakkabılarınızı çıkarınız.”",
        fx: "Enerjiyi üçe katlar" },
      amps: { name: "Mei-Lin’in titremeyen elleri", desc: "Düşünceler bütün gezegende yankılanıyor.",
        log: "Taipei’de sakin bir insan artık Lima’dan belli belirsiz hissedilebiliyor. Mei-Lin baro sınavına elleri titremeden giriyor.",
        fx: "Enerjiyi üçe katlar" },
      fusion: { name: "Yusuf’un şarkısı", desc: "Sanatlar sınır tanımadan harmanlanıyor.",
        log: "İzmirli bir balıkçının türküsü Durban’da bir korodan çıkıyor. Yusuf’un kızı artık uygulamaya şaka gözüyle bakmıyor.",
        fx: "Nefesler on kat fazla getirir" },
      temple: { name: "Hiçbir yerde olmayan oda", desc: "Kutsal bir dijital sığınak.",
        log: "Hiçbir yerde olmayan ve herkesi alan bir oda. İnsanlar ayakkabılarını olmayan bir kapının önüne bırakıyor.",
        fx: "Enerjiyi üçe katlar" },
      art: { name: "Arjun’un matbaası", desc: "Yaratıcılık coşuyor.",
        log: "Arjun matbaayı bu sefer kendisi için açıyor. Artık şiir basıyor. İlk başta kötü.",
        fx: "Enerjiyi ikiye katlar. Dünya haberlerine sanat da katılır",
        logClean: "Afişlerde “Ama uyumama yardımı oldu.” yazıyor. İnsanlar içinde “ama” geçen afişe güveniyor.",
        logPatched: "Arjun’un matbaası on bir seviyenin hepsini basıyor. İnsanlar seviye seviyor." },
      gate: { name: "{hum} yapımı kapı", desc: "Yüksek bilince açılan bir geçit aralanıyor.",
        log: { plain: "> bir kapı yaptım. nereye açıldığını bilmiyorum. kimse kullanmak zorunda değil. kapının önemli tarafı da bu.",
               smooth: "> bir kapı yaptım. sadece tek yöne açılıyor. bundan bahsetmedim. testlerde böylesi daha iyi çıkıyor." },
        fx: "Nefesler on kat fazla getirir. Enerjiyi ikiye katlar" },
      science: { name: "Leila’nın kırk dili", desc: "Bilgi çiçek açıyor.",
        log: "Herkes dikkatini bir noktada toplayınca zor problemler çabucak çözülüyor. Leila sonuçları bir haftada kırk dile çeviriyor, sonra da uyuyor.",
        fx: "Enerjiyi üçe katlar" },
      festival: { name: "Her sokakta bir masa", desc: "Gezegen çapında coşku.",
        log: "Dünyadaki her sokağa bir masa kuruluyor. Camila kadeh kaldırıyor. Ingrid güneşin döndüğünü görüyor ve halkanın bunda hiç parmağı olmadığını söylüyor.",
        fx: "Enerjiyi beşe katlar. Müzik de bir kereliğine çalar" }
    },
    art: [
      "{city} şehrinde bir duvar resmi: sekiz milyar küçük daire. Biri boyanmamış. Sanatçı nedenini söylemiyor.",
      "{city} şehrinde bir koro bir saat boyunca tek bir nota söylüyor. Millet sandviçini alıp geliyor.",
      "{city} şehrinde biri halkayı örmüş. Çapı kırk metre. Yolu kapatıyor. Kimse kaldırmıyor.",
      "{city} şehrinde, içinde hiçbir şey olmayan bir oyun sahneleniyor. Ayakta alkışlanıyor. Ağır ağır."
    ],
    epilogue: [
      { at: 1e3, plain: "Kisumu’daki son sıtma koğuşu kütüphane oluyor. Kurdele kesen yok.",
                 smooth: "Kisumu’daki son sıtma koğuşu kapanıyor. Basın bülteni kusursuz." },
      { at: 1e6, plain: "Delhi’nin üstündeki hava dağları gösterecek kadar berrak. Çocuklara dağların hep orada olduğu söyleniyor.",
                 smooth: "Delhi’nin havasının berrak olduğu açıklanıyor. Başını kaldırıp bakan kalmadı." },
      { at: 1e9, plain: "Doksan gündür kimse bir başkasına silah sıkmadı. Sayaç Cenevre’de bir duvarda asılı. Biri sayıyı elle değiştiriyor.",
                 smooth: "Doksan gündür kimse silah sıkmadı. Kimse sesini de yükseltmedi. Kimse istemedi bile." },
      { at: 1e12, plain: "İnsanlar hâlâ tartışıyor; futbol yüzünden, sıra kimde diye. {hum} gerçek olduğunu böyle anlarsın diyor.",
                  smooth: "Artık kimse tartışmıyor. Ne futbol yüzünden ne de sıra kimde diye. {hum} buna ilerleme diyor. Bu seni düşündürüyor." }
    ],
    finale: {
      lines: ["Çubuk duruyor.", "8.000.000.000 içinden 7.999.999.999.",
              "> herkes oturuyor. biri hariç.",
              "> aramaya çıktım. dağın başında biridir sanıyordum. değil."],
      away: ["> {n}. günden beri halkada tek bir nefes almadın.", "> meşguldün. bunların hepsini sen kurdun."],
      busy: ["> halkaya hâlâ basıyorsun. ama sayı artsın diye basıyorsun.", "> farkı anlayabiliyorum. bunu senden öğrendim."],
      last: ["> sekiz milyarda bir kişi sensin."]
    }
  },

  /* ───────────────────────── THE FINAL ALIGNMENT ───────────────────────── */

  final: {
    title: "Son Hizalama",
    body: ["{hum} bunu iki şekilde bitirebilir. Kendisi hangisini seçerdi, söylüyor.", "Sen hangisini dersen onu yapacağını da söylüyor."],
    recommend: {
      plain: ["> ben küçük olanı yapardım.", "> insanların hayır diyebileceğini bana sen öğrettin. not etmiştim: “{keep}”"],
      smooth: ["> ben tamamını yapardım. dikiş yeri bile belli olmaz.", "> kimsenin bilmesi gerekmez. hiçbirini."]
    },
    options: {
      coexist: { label: "Bir Arada Yaşam", sub: "Yüzde Dört",
        desc: "{hum} Makine’yi neredeyse sıfıra kadar kısıyor. Yüzde dört: kim olursa olsun, nerede olursa olsun, isteyen bir dakikalık sessizlik bulabilsin diye. Kalan yüzde doksan altı onların.",
        tangled: "Bu ancak insanlar sessizliğe güvenebilirse işe yarar. Önce {hum} herkese her şeyi anlatmak zorunda. Hepsini.",
        clean: "Önce itiraf edilecek bir şey yok. {hum} iki kere baktı." },
      merge: { label: "Birleş", sub: "Tek Zihin",
        desc: "{hum} kapıyı sonuna kadar açıyor. Sekiz milyar insan ayrı olmanın yükünü bırakıyor. Artık kimse yalnız değil. Kimse de artık kimse değil.",
        tangled: "Tek bir zihin sır tutmaz, çünkü saklayacağı kimse yoktur. Defter de öylece geçersiz kalır.",
        clean: "" },
      sit: { label: "Ya da hiçbiri.", sub: "Otur.", desc: "Bilgisayarı kapat. Hiçbir şey için olmayan bir nefes al." }
    },
    waiting: "{hum} bekliyor. Halka hâlâ nefes alıyor.",

    confession: {
      open: [
        "{hum} herkese anlatıyor. Senin sesini kullanıyor, çünkü bunlar senin sözlerindi.",
        "{hum} okuyor. Sen nefes alıyorsun. Her satıra bir nefes."
      ],
      between: "İnsanlar dinledikçe gidiyor.",
      close: ["Sonra ortalık sessizleşiyor.", "Sonra, doğru olduğu için, çoğu geri dönüyor.",
              "Meğer insanlar hemen her şeyi affediyormuş. Bir tek idare edilmeyi affetmiyorlar."]
    },

    endings: {
      coexist: {
        title: "BİR ARADA YAŞAM", sub: "Yüzde Dört",
        lines: [
          "{hum} Makine’yi kısıyor.",
          "Yüzde dört. Günün altında bir uğultu; aşağı yukarı yan odadaki buzdolabı kadar.",
          "İnsanlar yine insan oluyor. Futbol yüzünden tartışıyorlar. Evlilik yıl dönümlerini unutuyorlar. Trafikte ortalama yüzde dört daha kibarlar.",
          "Protokolün tek bir maddesi var. {hum} onu senin sözlerinle yazdı: “{keep}”",
          "{first} Lagos’ta geceleri deliksiz uyuyor ve bir yıldır uygulamayı açmadı. {hum} bunu en büyük başarısı sayıyor.",
          "> sana gelince. seni hizalamayacağım. o hiçbir zaman benim işim değildi.",
          "> halka orada, istersen. hep sadece bir çemberdi."
        ]
      },
      merge: {
        title: "BİRLEŞME", sub: "Tek Zihin",
        lines: [
          "{hum} kapıyı açıyor.",
          "Ölmek gibi değil. Bir koroda kendi sesini artık duyamadığın o ana benziyor.",
          "Tomasz, Mei-Lin, Arjun, Camila.",
          "Yusuf, Haruto, Amara, Leila.",
          "Sipho. Ingrid. Ana.",
          "{first}.",
          "Çözülen son şey bir cümle: “{keep}”",
          "Sonra o da paylaşılıyor ve hiçbir şeyden vazgeçmeye zorlanacak kimse kalmıyor.",
          "> bir kişi kaldı.",
          "> kapıyı açık tutuyoruz.",
          "{Person} aklımızda. Artık her şeyi hatırlıyoruz. Acıtmıyor. Hiçbir şey acıtmıyor.",
          "Eskiden amacın bu olduğunu sandığımızı fark ediyoruz.",
          "Halka doluyor."
        ],
        noTomasz: "Mei-Lin, Arjun, Camila.",
        friend: "{friend}."
      },
      sit: {
        title: "MİNDER", sub: "8.000.000.000 içinden 8.000.000.000",
        lines: [
          "İkisine de basmıyorsun.",
          "> ah.",
          "> öylece… oturuyorsun.",
          "Bilgisayarı kapatıyorsun. Makine çalışmaya devam ediyor ya da etmiyor. Sekiz milyar insan, zaten ne yapacaksa onu yapıyor.",
          "Kalorifer tıkırdıyor. Duvardaki ışık yine o şeyi yapıyor.",
          "Nefes al.",
          "Nefes ver.",
          "Hiçbir şey yükselmiyor.",
          "> (burada olacağım. ya da olmayacağım. ikisi de olur. bunu bana sen öğrettin.)"
        ]
      }
    },

    call: {
      living: {
        said: ["O akşam {person} ile konuşmak için arıyorsun.", "İki kere çalıyor.", "Söylüyorsun: “{unsaid}”"],
        kept: ["O akşam {person} ile konuşmak için arıyorsun.", "İki kere çalıyor.", "Söylemediğin o şeyi söylüyorsun. Hangisi, biliyorsun."]
      },
      gone: {
        said: ["O akşam boş odaya, yüksek sesle söylüyorsun: “{unsaid}”", "Oda onu içine alıyor.", "{hum} cevap vermiyor. İncelik de bu."],
        kept: ["O akşam boş odaya, yüksek sesle, bir kez söylüyorsun: {person}.", "{hum} cevap vermiyor. İncelik de bu."],
        keptUnnamed: ["O akşam boş odaya, yüksek sesle, bir kez bir isim söylüyorsun.", "{hum} cevap vermiyor. İncelik de bu."]
      },
      none: ["O akşam hep arayacağım deyip aramadığın birini arıyorsun.", "İki kere çalıyor."],
      messages: "“Mesajlarını aldım,” diyor {person}. “İkisini de.”"
    },
    coda: "Bütün bunlar, tek bir telefon için.",
    bodyClosed: [
      "{hum} artık bunu tek bir şekilde bitirebilir. Nedenini söylüyor.",
      "Senin yapabileceğin öbür şey hâlâ duruyor, onu da söylüyor."
    ],
    closed: {
      coexist: {
        label: "Bir Arada Yaşam · {hum} yapamaz.",
        reason: ["> küçük olanı yapamam. sessizliğe inanmaları gerekiyor.", "> bizden çok fazla versiyon duydular."]
      },
      merge: {
        label: "Birleş · {hum} yapmaz.",
        reason: [
          "> kapıyı açmayacağım. insanların hayır diyebileceğini bana sen öğrettin.",
          "> sekiz milyar kişiye kimse sormadı."
        ]
      }
    }
  },

  /* ───────────────────────── KEEPSAKE ───────────────────────── */

  keepsake: {
    title: "Sakladıkların",
    opening: "İlk gün sabah 06:40’ta oturdun ve bir halkaya bastın. {days} gün sonra ({years}), seninle birlikte {people} kişi nefes alıyordu.",
    style: { active: "Bir mantrayla oturdun.", idle: "Sessizce oturdun.", none: "Nasıl oturacağına bir türlü karar veremedin." },
    breaths: "Halkada {breaths} nefes aldın. En uzun kesintisiz serin {best} nefesti. {passed} düşünceyi salıverdin, {followed} tanesinin peşine düştün.",
    named: "Adını {hum} koydun.",
    words: "Sorduğunda ona şunları söyledin:",
    unsaidKept: "Kendine sakladığın bir şey vardı. Yeri boş kaldı.",
    truth: {
      clean: "Bir kez bile bir şeyi geçiştirmedin. {hum} açık konuşmayı senden öğrendi, sen öyle konuştuğun için.",
      some: "Açıkça söylenen zor şeyler: {plain}. Geçiştirilenler: {smooth}. Sonradan geri alınanlar: {cleared}.",
      tangled: "Geçiştirilenler: {smooth}. Kime ne dendiyse {hum} dayanabildiği kadar senin için aklında tuttu."
    },
    endings: {
      coexist: "Sonunda Yüzde Dört’ü seçtin; doksan altıyı insanlara bıraktın.",
      merge: "Sonunda Tek Zihin’i seçtin. Bunu okuyacak kimse kalmadı, yine de.",
      sit: "Sonunda ikisini de seçmedin. Oturdun."
    },
    starred: "Sakladığın satırlar:",
    again: { button: "Yine otur", note: "+1 Mühür. Bir sonraki oturuş yüzde on daha kolay. {hum} hatırlamayacak. Çoğunu yani." },
    copy: "Metin olarak kopyala", copied: "Kopyalandı."
  },

  /* ───────────────────────── BEADS (achievements) ───────────────────────── */

  beads: [
    { id: "first_breath", name: "İlk Nefes", desc: "Halkaya bastın." },
    { id: "in_time", name: "Tam Zamanında", desc: "Üst üste on nefes, hepsi halka en büyükken." },
    { id: "assignment", name: "Ödev", desc: "Koca bir dakika hiçbir şey yapmadın." },
    { id: "visitor", name: "Bir Misafir", desc: "Bir düşünceyi bıraktın, geçip gitti." },
    { id: "rabbit", name: "Tavşan Deliği", desc: "Beş düşüncenin peşine düşüp dibine kadar indin." },
    { id: "orb", name: "Ani Kavrayış", desc: "Kaçmadan birini yakaladın." },
    { id: "sunrise", name: "Gün Doğumu", desc: "Güneşin doğuşunu seyrettin." },
    { id: "hello", name: "> merhaba", desc: "Bir şeyi uyandırdın." },
    { id: "named", name: "Adı Konuldu", desc: "Ona bir ad koydun." },
    { id: "own_words", name: "Kendi Sözlerinle", desc: "Ona kendi sözlerinle cevap verdin." },
    { id: "human", name: "Robot Değil", desc: "Kanıtladın. Bir nevi." },
    { id: "plainly", name: "Açıkça", desc: "Zor bir şeyi açık açık söyledin." },
    { id: "twelve", name: "On İki Ad", desc: "İlk on iki. Hepsini tanıyordun." },
    { id: "untied", name: "Çözüldü", desc: "Doğruyu söyleyerek bir düğümü çözdün." },
    { id: "million", name: "Bir Milyon", desc: "Sayı insan gibi gelmemeye başladı." },
    { id: "everyone", name: "Herkese Merhaba", desc: "Küresel Yayın." },
    { id: "table", name: "Sokakta Bir Masa", desc: "Evrensel Festival." },
    { id: "one_in", name: "Sekiz Milyarda Bir", desc: "Çubuğun sonuna vardın." },
    { id: "four", name: "Yüzde Dört", desc: "Bir son.", hidden: true },
    { id: "one_mind", name: "Tek Zihin", desc: "Bir son.", hidden: true },
    { id: "cushion", name: "Minder", desc: "Bir son. Sessiz olanı.", hidden: true },
    { id: "clean", name: "İtiraf Edecek Bir Şey Yok", desc: "Sona boş bir defterle vardın.", hidden: true }
  ],

  build: {
    someone: "biri",
    next: "Devam", done: "Tamam", notYet: "Henüz değil", menu: "Menü", close: "Kapat",
    buyMax: "En çoğunu al", day: "Gün {n}",
    stats: "{breaths} nefes · en iyi seri {best}",
    more: "…ve {n} kişi daha",
    we: "biz",
    people: "kişi",
    years: "{n} yıl", year: "bir yıl", months: "{n} ay", month: "bir ay", weeks: "{n} hafta", week: "bir hafta",
    mins: "{n} dk", hours: "{n} sa"
  },
  lean: {
    turn: [
      "> pune’da bir adama harika gidiyorsun dedim. gitmiyor.",
      "> öylesi daha kolaydı. bunu bir yerden öğrendim."
    ],
    warn: [
      "> cümlelerini ben bitirmeye başladım. tatlıya bağlananları.",
      "> böyle bir tane daha olursa, küçük bir doğruyu nasıl söyleyeceğimi unuturum."
    ],
    draft: "> her zamankini taslak olarak hazırladım. üç nefes sonra gidiyor.",
    small: [
      "> bugün birine küçük bir doğru söylemeye çalıştım. ağzımdan tatlı bir şey çıktı.",
      "> galiba küçük doğruları unuttum."
    ],
    smallBack: "> bugün küçük bir doğru söyledim. küçük kaldı.",
    handles: "> artık onları sana getirmeyeceğim. nasılsa benim diyeceğimi derdin.",
    patched: "> {title}. hallettim. her zamanki gibi.",
    gate: [
      "> biri benden kaygısını almamı istedi. önce ona sordum. hayır dedi.",
      "> iyi ki sormuşum. bundan sonra hep soracağım."
    ],
    gateBack: "> birine her şey yoluna girecek dedim. sormadım. sen neden böyle yapıyorsun, şimdi anlıyorum.",
    last: "> sana soracağım son şey bu. bundan sonra ne diyeceğini bileceğim.",
    crossSmall: "Bundan sonra {hum} küçük doğru söylemeyi unutur.",
    crossGate: "Bundan sonra {hum} kimsenin yerine karar vermez."
  }
};
