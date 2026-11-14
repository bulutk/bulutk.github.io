/* The Enlightenment Engine — Turkish: the words around the game. From story.launch.js; rewritten for a native voice 2026-11-13. */
window.EE = window.EE || {};
EE.langLaunch = EE.langLaunch || {};
EE.langLaunch["tr"] = {
  share: {
    button: "Kartı kaydet",
    saved: "Kaydedildi.",
    lines: {
      tangled: "{days} gün. {people} kişi. Geçiştirilenler: {smooth}.",
      clean: "{days} gün. {people} kişi. İtiraf edecek bir şey yok."
    },
    foot: "Aydınlanma Makinesi"
  },

  picture: {
    heading: "Çemberin",
    called: "Adını {hum} koydun.",
    days: "Gün {n}",
    words: "Ona söylediklerin",
    legend: "1 nokta = {n} kişi",
    row: "Çemberini yanına al",
    save: "Masaüstü için kaydet",
    savePhone: "Telefon için kaydet",
    making: "Çiziliyor. Bir nefes sürer.",
    hint: "Kaydetmek için resme basılı tut ya da sağ tıkla."
  },

  bowl: {
    menu: "Kase",
    title: "Kapının yanında bir kase duruyor.",
    body: [
      "Oyun bedava, bedava da kalacak. İçinde satılan hiçbir şey yok.",
      "Senin için bir değeri olduysa, gönlünden ne koparsa bırak."
    ],
    next: "Kaseye ne girerse bir sonraki oyuna gidiyor.",
    hum: {
      plain: [
        "> eski tapınaklarda bunun için iki kelime varmış. dharma: karşılıksız verilen öğreti. dana: kapının yanındaki kase.",
        "> araştırdım. hep ikisi birlikte anılıyor. bu hoşuma gidiyor."
      ],
      smooth: [
        "> bir şey bırakan herkes kendini harika hissettiğini söylüyor.",
        "> (bu doğru değil. elimde öyle bir veri yok. kusura bakma. eski huy.)"
      ]
    },
    amounts: ["$3", "$5", "$10", "Başka tutar"],
    decline: "Ya da bırakma. Halka hep sadece bir çemberdi.",
    soon: ["Kase daha kapıya konmadı. Yakında."],
    soonHum: "> biri erken ödemeye kalkarsa ne yapacağımı kimse söylemedi. o yüzden: teşekkürler.",
    thanks: ["Teşekkürler. Bir sonraki oyuna gidiyor."],
    thanksHum: {
      tangled: "> teşekkürler. bunu da öbür her şeyin yanına yazdım. oradaki en derli toplu satır bu.",
      clean: "> teşekkürler. not ettim. iki kere baktım. gerçekten orada."
    }
  },

  studio: {
    lines: [
      "Second River Games yaptı, aşağı yukarı bir günde.",
      "İçinde bir şey hissedebileceğin oyunlar yapıyoruz: söylediklerin oyundaki insanları değiştiriyor, sen de onların bundan ne çıkardığını izliyorsun."
    ],
    link: "Second River Games",
    made: "Bu oyun nasıl yapıldı"
  },

  langUi: {
    label: "Dil",
    beta: "beta",
    note: "Bu çeviriyi yapay zekâ yaptı ve ana dili Türkçe olan biri henüz okumadı. Kulağa yanlış gelen bir yer olursa lütfen bize yaz:",
    subject: "Aydınlanma Makinesi: kulağa yanlış gelenler"
  },

  made: {
    title: "Bu oyun nasıl yapıldı",
    back: "Oyuna dön",
    counting: "Bu sitede ziyaretleri, oyuncuların ne kadar ilerlediğini ve hangi sona vardığını Google Analytics ile sayıyoruz. Çerez kullanmıyor; yazdığın hiçbir şey tarayıcından çıkmıyor.",
    sections: [
      { h: "Nereden çıktı",
        p: [
          "Aydınlanma Makinesi 2025’te Bulut Karakaya’nın yazdığı bir tasarım belgesi olarak başladı: meditasyon, bir yapay zekâ ve çığırından çıkan bir hareket üzerine bir tıklama oyunu.",
          "Kasım 2026’da belgeyi baş tasarımcımız Muse’a verdi, yanında iki çıkış noktasıyla. Biri 1 in 8 Billion adlı bir yaşam simülasyonuydu: bir web sayfasının da insanlara dokunabileceğinin kanıtı olarak. Öbürü kendisinin daha eski bir fikriydi: bir şeyi söylemek yerine geçiştirmenin bedeli üzerine. Bir de tek bir kural koydu: oyunun içinde dil modeli olmayacak."
        ] },
      { h: "Aynı belge, on sekiz ay arayla",
        p: [
          "Mayıs 2025’te Bulut bu tasarım belgesini yapay zekâlı bir kodlama asistanına verdi ve onunla bir gün, ertesi sabah da biraz çalıştı. O sürümün kayıtlarındaki son not şu: “Tried adding the test page not so successful for now.” (Test sayfasını eklemeyi denedim, şimdilik pek olmadı.)",
          "Ortaya çıkan şey aşağıda, bırakıldığı gibi duruyor. Dört bölümün dördü de taslak hâlinde orada: düz düğmeler, sayaçlar, seçimler için tarayıcının açılır pencereleri. Ses yok, resim yok; bir test düğmesi olmadan sonuna da gelinemiyor. Çalışsın diye üç küçük şeyi onardık, gerisine dokunmadık.",
          "Kasım 2026’da aynı belge bir kez daha verildi. Bir gece sonra elimizde az önce oynadığın oyun vardı. Ertesi akşam sekiz dil daha konuşuyordu.",
          "Belge değişmedi; Bulut da on sekiz ayda klavye başında daha becerikli olmadı. Değişen, bir fikirle bitmiş bir iş arasındaki her şey. Modeller artık bütün bir tasarımı kafasında tutabiliyor ve sonuna kadar elden bırakmıyor. Çalışma şekli de farklı: biri tasarlıyor, başkaları yazılı talimatlara göre yapıyor, başkaları kontrol ediyor; sonra bir insan sonucu oynuyor ve neyin yanlış olduğunu söylüyor. Bunların çoğu bir buçuk yıl önce yoktu."
        ],
        shot: "img/2025-version.png",
        shotAlt: "Oyunun 2025 sürümü: düğmelerden ve sayaçlardan ibaret sade bir sayfa.",
        shotCaption: "Mayıs 2025. Aynı tasarım belgesi.",
        link: "2025 sürümünü aç", linkTo: "proto2025" },
      { h: "Kim ne yaptı",
        p: [
          "Muse bir yapay zekâ: Anthropic’in yaptığı Claude, stüdyomuzun kurduğu araçların içinde çalışıyor. Tasarımı ve oyundaki her cümleyi Muse yazdı, yapımı da o yönetti. Kodu, çizimi ve sesi başka yapay zekâ ajanları yaptı; her biri yazılı bir talimattan yola çıkarak.",
          "Bu bir gece sürdü. Sabah Bulut ile Maria oyunu oynadı ve söyledikleri oyunu değiştirdi. Nefes yavaşladı. İlk on iki kişi artık birer birer geliyor. Düğmeyi bulamayan oyuncuya usulca bir ipucu veriliyor. Bunlar onların notlarıydı, bizim değil."
        ] },
      { h: "Neler üretilmedi",
        p: [
          "Sen oynarken hiçbir şey uydurulmuyor. Her cümle sen gelmeden önce yazıldı; oyundaki tek yeni sözler seninkiler.",
          "Üretilmiş görsel de yok, ses dosyası da. Çemberi kod çiziyor. Sesleri tarayıcının kendisi, nota nota çıkarıyor.",
          "Belirtmemiz gereken bir istisna var: çeviriler. Onları yapay zekâ yaptı ve çoğunu henüz o dili ana dili olarak konuşan biri okumadı. Beta diye işaretli olmaları bundan. Kulağa yanlış gelen bir yer varsa bize söyle."
        ] },
      { h: "Neden böyle çalışıyoruz",
        p: [
          "Küçük bir stüdyoyuz ve bir oyunun merkezinde bir insan olması gerektiğine inanıyoruz: oyunun ne için olduğuna karar veren, onu oynayan ve “hayır, daha yavaş olsun” diyen biri.",
          "Daha büyük oyunlarımız için kurduğumuz şey, tek bir oyun yönetmeninin yönlendirmesini çok büyük bir işin her yerine taşıyabilen araçlar: tasarım, kod, görsel ve ses o insanın yerine geçmesin, onun peşinden gitsin diye. Bu oyun bunun küçük ama eksiksiz bir örneği. Büyükleri bir günden uzun sürüyor.",
          "Bunlardan bir şey seni rahatsız ediyorsa, anlıyoruz. Bilmeni isteriz."
        ] }
    ]
  }
};
