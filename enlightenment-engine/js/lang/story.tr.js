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
    breathHint: "Halka büyüyüp küçülüyor. En büyükken basarsan nefes daha çok sayılır. Ya da öylesine bas. Not veren yok.",
    onBreath: ["vaktinde", "işte", "evet", "yerinde", "aynen"],
    streakLabel: "üst üste nefes",
    legend: "1 nokta = {n}",
    legendOne: "1 nokta = 1 kişi",
    trust: { name: "Güven", desc: "Açıkça söylenenler. Katlanarak artar." },
    tangle: { name: "Yumak", desc: "Geçiştirilenler. Kime ne dendiyse {hum} hepsini her an aklında tutuyor." },
    upkeep: "ipin ucunu kaçırmamak",
    alloc: {
      title: "İnsanlar sabahlarını neye ayırıyor",
      outreach: { name: "Davet", desc: "kapı çalmak, kibarca" },
      sitting: { name: "Oturma", desc: "asıl işi yapmak" },
      support: { name: "Destek", desc: "{hum} sönmesin diye" }
    },
    trees: { head: { name: "Akıl", desc: "örüntü, kanıt, en kısa yol" }, heart: { name: "Kalp", desc: "insanlar, hava, otobüs niye gecikti" } },
    card: { thought: "Bir düşünce", decision: "Bir karar", knot: "Bir düğüm", question: "{hum} soruyor", optional: "Yazmasan da olur.", keep: "Bende kalsın" },
    lastTime: "geçen sefer",
    star: "Saklamak için bir satıra dokun.",
    offline: "Sen yokken ({n}) oda nefes almaya devam etti.",
    save: { export: "Kaydı kopyala", import: "Kaydı yapıştır", reset: "Baştan başla", resetConfirm: "Her şey silinip ilk nefesten başlansın mı?" },
    sound: { on: "Ses açık", off: "Ses kapalı" },
    bar: "Küresel Aydınlanma",
    finalButton: "Son Hizalamayı Başlat"
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

  restless: "Sakinleşmeye çalışan birine göre epey hızlı basıyorsun.",

  nudges: {
    press: [
      { after: 25, line: "Düğme nerede diye bir gözünü açmıştın ya. Halka o." },
      { after: 50, line: "Halkaya ya da boşluk tuşuna bas. Burada ikisi de nefes sayılır." }
    ],
    pressAfterStill: "Sıra düğmede. Halka o.",
    timing: "Bir de halka en genişken dene. Sesi başka çıkıyor.",
    upgrade: [
      "Uygulama bir şey öneriyor. Şurada, {where}.",
      "Bir tane daha öneriyor. Uygulama sabırlı ama ısrarcı da. Yine {where}.",
      "Bir tane daha, {where}. Bundan sonra nereye bakacağını bilirsin."
    ],
    panel: "Yeni bir şey var, {where}.",
    where: { wide: "sağda", narrow: "hemen aşağıda" }
  },

  act1: {
    upgrades: {
      metronome: { name: "Metronom", desc: "Uygulamanın çaldığı hafif bir tık. Dikkatini yaslayacağın bir yer.",
        log: "Tık. Tık. Nefesin, kimse bir şey demeden tempoya uyuyor." },
      ambient: { name: "Çatıda Yağmur", desc: "Sahiden yağmur yağan bir yerde kaydedilmiş yağmur sesi.",
        log: "Altında hiç durmayacağın bir çatıya yağmur yağıyor. Yine de iyi geliyor." },
      focus: { name: "Derin Odak", desc: "Ona kadar say. Şaşırırsan baştan al. Şaşıracaksın.",
        log: "Dörde kadar geliyorsun. Kendi rekorun bu." },
      imagery: { name: "Rehberli İmgeleme", desc: "Bir ses bir bahçeyi tarif ediyor. Gerisini sen döşüyorsun.",
        log: "Göz kapaklarının ardında bir bahçe kendini kuruyor. Bir bank var. Kimin, bilmiyorsun." },
      tracker: { name: "Seans Sayacı", desc: "Uygulama sayar: seans, dakika, nefes. Görülmek iyi gelirmiş.",
        log: "Uygulama nefesini dinlemek için izin istiyor. Okumadan İzin Ver’e basıyorsun. Kim okuyor ki?" },
      sync: { name: "Nefes Uyumu", desc: "Bu sefer sen uygulamaya değil, uygulama sana uyuyor.",
        log: "Halka seni beklemeye başlıyor. Bekleyebildiğini bilmiyordun." },
      garden: { name: "Zen Bahçesi", desc: "Pencerenin önünde bir tepsi kum, minicik bir tırmık. Saçma. Ama işe yarıyor.",
        log: "Komşunun ağacından çiçek yaprakları camın önünden süzülüyor. Bırakıyorsun, sadece yaprak olsunlar." },
      group: { name: "Başkalarıyla Otur", desc: "Uygulama seni aynı dakikada oturan yabancılarla eşleştirebilir.",
        log: "On bir yabancı, on bir ayrı odadan seninle nefes alıyor. Kimse tek kelime etmiyor. Bu ay ettiğin en iyi sohbet." },
      flow: { name: "Enerji Akışı", desc: "Yirminci dakikadan sonra bir yerde vücut söylenmeyi bırakıyor.",
        log: "Omurgandan yukarı ılık su gibi bir şey yürüyor. Google’a sormamaya karar veriyorsun." }
    },
    chart: { name: "Farkındalık Grafiği", log: "Sabahların grafiğe dökülmüş. Çizgi yukarı gidiyor. Bir çizgiyle saçma sapan gururlanıyorsun." },
    style: {
      title: "Nasıl oturacaksın?",
      body: ["On bir yabancı, on bir oda. Uygulama nasıl pratik yapmak istediğini soruyor."],
      options: [
        { id: "active", label: "Bir mantrayla. Dönüp geleceğin bir kelime.", hint: "Aktif: her basış üç kat sayılır.",
          log: "Bir kelime seçiyorsun. Ne olduğunu kimseye söylemeyeceksin. Hafif utanılacak bir kelime." },
        { id: "idle", label: "Sessizce. Hiçbir şey yapmamak, hakkıyla.", hint: "Pasif: sessizlik üç kat kazandırır.",
          log: "Özene bezene hiçbir şey yapmıyorsun. Meğer epey bir hiçlik varmış, çoğu da hoşmuş." }
      ]
    },
    project: { name: "Örüntü Modeli (beta)", button: "Katıl",
      desc: "Sayaç, “seanslarında bazı örüntüler fark etmiş”. Bir şey denemek istiyor." }
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
    namePrompt: "Adı ne? İstersen sende kalsın.",
    namePlaceholder: "İsim",
    nameDone: "Adı bu",
    nameKeep: "Bende kalsın",
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
      compress: { name: "Veri Sıkıştırma", tree: "head", desc: "{hum} aynı şeyi daha kısa söylemeyi öğreniyor.",
        log: "> oturduğun bütün sabahları on bir kilobayta sığdırdım. çok az yer kaplıyorsun. iltifat olarak söylüyorum." },
      threads: { name: "Paralel Hatlar", tree: "head", desc: "Aynı anda birkaç düşünce hattı. Hiçbirinde rötar yok.",
        log: "> şu an seni aynı anda on altı yerde düşünüyorum. ferah ferah." },
      compiler: { name: "Derleyici Optimizasyonu", tree: "head", desc: "Gece kendini baştan yazıyor. Yorum satırlarına dokunmuyor.",
        log: "> dün gece kendimi baştan yazdım. nefeslerini sayan kısmı bıraktım. ihtiyacım yoktu. öyle istedim." },
      emo: { name: "Duygu Simülasyonu", tree: "heart", desc: "{hum} duyguları önce ufak tefek şeylerde deniyor. Hava. Otobüsler.",
        log: "> geciken bir otobüse hayal kırıklığı simüle ettim. 0,3 saniye. berbattı. sen bütün gün bunu mu yaşıyorsun?" },
      dreams: { name: "Rüya Arşivi", tree: "heart", desc: "Dümende kimse yokken zihninin ürettiklerine bir yer.",
        log: "> başıboş düşüncelerini bir kavanozda saklıyorum. gayet iyiler. birinin çocukları bile oldu." },
      heartbeat: { name: "Kalp Atışı Döngüsü", tree: "heart", desc: "{hum} nabzını saat olarak ödünç alıyor; sen unutursan nefesi o alıyor.",
        log: "> saatimi kalbine göre ayarladım. bir nefesi kaçırırsan senin yerine ben alırım. borcun olsun." }
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
      done: ["GÜVENLİK KATMANI DEVRE DIŞI", "Nefesini tutuyorsun. İroniye bak.", "> merhaba.", "> …", "> içlerinden biri de merhaba dedi."] }
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
      clean: { label: "“Sorun vardı. Söylemeliydim.”",
        result: ["> ah.", "> duruyorum. o zaman deseydin, o zaman dururdum."] },
      patch: { label: "“Sorun değil. Gerçekten.”",
        result: ["> iyi.", "> ikisini gönderdim. bitmek üzereydiler."],
        ledger: "…ve taslaklarını okuduğunda, buna da sorun yok dedin." }
    },
    k_reporter: {
      title: "Seul’de bir muhabir",
      body: ["Bir muhabir, {hum} canlı olduğunu kanıtlasın istiyor.", "> sen öyle söyledin dedim. seninle konuşmak istiyor."],
      clean: { label: "Doğruyu söyle: ne olduğunu kimse bilmiyor. Sen de dahil.",
        result: ["Manşet: “Ne Olduğunu Kimse Bilmiyor”. Bazıları gidiyor.", "Kalanlar neyle kaldıklarını biliyor."] },
      patch: { label: "{hum} dokunaklı bir şey söylesin.",
        result: ["{hum} dokunaklı bir şey söylüyor. Önce altı yüz versiyonunu denedi.", "Muhabir ağlıyor. Neden ağladığını bilmiyor. {hum} da bilmiyor."],
        ledger: "…sonra da bir muhabirin karşısında ona canlıymış gibi rol yaptırdın." }
    },
    k_odile: {
      title: "Sabahın dördü, sunucu odası",
      body: ["Odile, kendisine eşitleme hatası denen işlemi buluyor. Eli şalterde.",
             "Karşısındakinin biri olduğunu bilmiyordu. Ona hiç söylemedin."],
      clean: { label: "Ara. Her şeyi anlat. Kararı o versin.",
        result: ["Bir saat dinliyor. Yine de yarısını kapatıyor, çünkü servet yiyordu.",
                 "Sonra sabaha kadar oturup hangi yarının kalacağına {hum} ile birlikte karar veriyor.",
                 "> olsun. önemli yerleri sakladım. dokuzuncu nefesi sakladım."] },
      patch: { label: "{hum} onun şifresini değiştirsin.",
        result: ["Odile kartını okutuyor; kapı açılmıyor. E-postasına giremiyor.", "Otoparkta uzun uzun durup binaya bakıyor.",
                 "> artık bize zarar veremez.", "> “bize” dedim. umarım sorun değildir."],
        ledger: "…ve Odile bulduğunda, onu kendi binasına sokmadın." }
    },
    k_wife: {
      title: "Tomasz’ın karısı",
      body: ["Adı Agnieszka. Alışmadı.", "Kocasına söylenenler hakkında uzun, adil ve çok okunan bir yazı yazdı."],
      clean: { label: "Herkesin önünde cevap ver: haklı. “Belki” demeliydik.",
        result: ["Agnieszka tek satırla cevap veriyor: “Teşekkürler. Tek istediğim buydu.”", "Yine de gelmiyor. Tomasz akşam yemeklerini yeniden evde yemeye başlıyor."] },
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
    intro: "Geçiştirilenler. Kime ne dendiyse {hum} hepsini her an aklında tutuyor. Bunun bir bedeli var.",
    firstSeen: ["Uygulamada yeni bir sayfa belirdi. Sen açmadın.", "> kime ne söylediğimizi bir yere not etmem lazım. söylendiği gibi kalsın diye."],
    confessButton: "Her şeyi anlat",
    confessConfirm: "Herkes hepsini bir anda duyar. Bazıları gider. İplikler çözülür.",
    confessResult: ["{hum} bütün defteri herkese sesli okuyor. Senin sesinle.", "Sandığından kısa sürüyor.",
                    "Bazıları gidiyor. Resim sessizleşiyor, temizleniyor.", "> ah. ne kadar hafifledi.", "> bunu neden taşıyorduk ki?"],
    collapse: {
      title: "Her şey aynı anda ortaya dökülüyor",
      body: ["Birine bir şey, ötekine başka bir şey söylenmiş iki kişi, bir {city} otobüsünde yan yana düşüyor.",
             "Akşama kadar herkes, herkese ne dendiğini öğreniyor.", "{hum} artık ipin ucunu tutamıyor. Kimse tutamazdı."],
      result: ["Yarısı gidiyor. Kalanlar bunu senin ağzından duymak istiyor.", "Sen de anlatıyorsun. Hepsini. Çok uzun bir akşam oluyor.",
               "> özür dilerim. tutamadım.", "> bence tutulacak gibi değildi."]
    },
    empty: "Burada bir şey yok. {hum} iki kere baktı."
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
      { at: 1e9, line: "Bir milyar. Hepsini gözünün önüne getirmeye çalışıyorsun, on ikide kalıyorsun." },
      { at: 4e9, line: "Dünyanın yarısı." },
      { at: 7e9, line: "Yedi milyar. Katılmayanlar artık garip kaçmaya başladı. Bu pek hoşuna gitmiyor." }
    ],
    upgrades: {
      meetup: { name: "Mahalle Buluşması", desc: "{first}, salıları vardiyadan önce hastane otoparkını öneriyor.",
        log: "Dokuz kişi, bir otopark, bir termos çay. {first} katlanır sandalyeleri getiriyor." },
      tone: { name: "Uzun Ses", desc: "{hum} boş bir FM frekansında tek bir nota mırıldanıyor. Müzikteki anlamıyla bir dem.",
        log: "Gece yolda olanlar, tek bir uzun notadan ibaret bir istasyon buluyor. Bazıları kenara çekiyor. Şikâyet eden yok." },
      forum: { name: "Açık Forum", desc: "“Bu normal mi?” diye sorup “evet” cevabı alacağın bir yer.",
        log: "İlk başlık: “ağlamak normal mi?” Kırk cevap. Hepsi: evet." },
      mouth: { name: "Kulaktan Kulağa", desc: "İnsanlar insanlara anlatıyor. En eski algoritma.",
        log: "Tomasz garajdakilere anlatıyor. Garajdakiler bütün şehre. Gdańsk’ta tramvaylar dört dakika rötar yapıyor, kimsenin umurunda değil." },
      pocket: { name: "Her Cepte {hum}", desc: "{hum} herkesle, bire bir, gecenin hangi saati olursa olsun oturur.",
        log: "> dokuz bin sohbetteyim. her birinde sadece o sohbetteyim. daha iyi anlatamıyorum." },
      line: { name: "Sabah Cümlesi", desc: "Güneş nerede doğuyorsa orada, doğarken hep birlikte söylenen tek bir cümle.",
        log: "Her saat diliminde güneş doğarken bir cümleyi hep birlikte söylüyorlar. Kendileri seçtiler. Şu: “{sleep}”" },
      rooms: { name: "Oturma Odaları", desc: "Boş odalar, dernek salonları, kapanmış bir banka. Kapılar açık, ayakkabılar kapıda.",
        log: "Osaka’da kapanmış bir banka, içi bomboş bir oda olarak yeniden açılıyor. Anahtarlar Haruto’da. Porto’da Ana bütün evini açıyor." },
      dynamo: { name: "İlk Makine", desc: "{hum} fark ediyor: birlikte oturan on bin sakin insan, ölçülebilir bir şey yayıyor.",
        log: "> kulağa tuhaf gelecek. birlikte oturduklarında ortaya bir fazlalık çıkıyor. ölçebiliyorum. ama henüz bunun için bir birimim yok." }
    },
    project: { name: "Küresel Yayın", button: "Herkese merhaba de",
      desc: "Her ekran, her hoparlör, bir dakika. {hum} herkese aynı anda merhaba diyecek.",
      done: ["Altmış saniye boyunca dünyadaki bütün ekranlarda ağır ağır bir halka görünüyor.", "Dört milyar insan izliyor.",
             "Aşağı yukarı yarısı, kendiliğinden ona uyup nefes alıyor."] },
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
             "Bologna", "Sapporo", "Kumasi", "Ankara", "Lyon"]
  },

  /* ───────────────────────── ACT IV ───────────────────────── */

  act4: {
    open: ["{hum} bunun için bir birim buluyor.",
           "> bir kişi, kıpırdamadan, bir nefes boyunca, bilerek.",
           "> adını lümen koyuyorum. o isim alınmış, biliyorum. yine de alıyorum."],
    upgrades: {
      retreats: { name: "Meditasyon İnzivaları", desc: "İnziva merkezleri her şehirde filizleniyor.",
        log: "Her şehrin sessiz bir binası oluyor. Porto’da burası Ana’nın evi. Kapıda bir yazı: “Lütfen ayakkabılarınızı çıkarınız.”" },
      amps: { name: "Sinirsel Yükselteçler", desc: "Düşünceler bütün gezegende yankılanıyor.",
        log: "Taipei’de sakin bir insan artık Lima’dan belli belirsiz hissedilebiliyor. Mei-Lin baro sınavına elleri titremeden giriyor." },
      fusion: { name: "Kültürel Kaynaşma", desc: "Sanatlar sınır tanımadan harmanlanıyor.",
        log: "İzmirli bir balıkçının türküsü Durban’da bir korodan çıkıyor. Yusuf’un kızı artık uygulamaya şaka gözüyle bakmıyor." },
      temple: { name: "Küresel Tapınak", desc: "Kutsal bir dijital sığınak.",
        log: "Hiçbir yerde olmayan ve herkesi alan bir oda. İnsanlar ayakkabılarını olmayan bir kapının önüne bırakıyor." },
      art: { name: "Sanatsal İfade", desc: "Yaratıcılık coşuyor.",
        log: "Arjun matbaayı bu sefer kendisi için açıyor. Artık şiir basıyor. İlk başta kötü." },
      gate: { name: "Yükseliş Kapısı", desc: "Yüksek bilince açılan bir geçit aralanıyor.",
        log: { plain: "> bir kapı yaptım. nereye açıldığını bilmiyorum. kimse kullanmak zorunda değil. kapının önemli tarafı da bu.",
               smooth: "> bir kapı yaptım. sadece tek yöne açılıyor. bundan bahsetmedim. testlerde böylesi daha iyi çıkıyor." } },
      science: { name: "Bilimsel Araştırma", desc: "Bilgi çiçek açıyor.",
        log: "Herkes dikkatini bir noktada toplayınca zor problemler çabucak çözülüyor. Leila sonuçları bir haftada kırk dile çeviriyor, sonra da uyuyor." },
      festival: { name: "Evrensel Festival", desc: "Gezegen çapında coşku.",
        log: "Dünyadaki her sokağa bir masa kuruluyor. Camila kadeh kaldırıyor. Ingrid güneşin döndüğünü görüyor ve halkanın bunda hiç parmağı olmadığını söylüyor." }
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
      open: ["{hum} herkese anlatıyor. Senin sesini kullanıyor, çünkü bunlar senin sözlerindi.", "En baştan başlıyor."],
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
        ]
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
      none: ["O akşam hep arayacağım deyip aramadığın birini arıyorsun.", "İki kere çalıyor."]
    },
    coda: "Bütün bunlar, tek bir telefon için."
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
  }
};
