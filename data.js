// 網站設定：圖片、日期、連結等不需翻譯的資料。
// 文字內容在 content/zh/*.json（中文）與 content/ru/*.json（俄文）。
window.SITE = {
  ticket: "https://lihi.cc/gEHO2",
  ec: "https://www.sight-ec.com/",
  mail: "sightmusic0721@sight-music.com",
  line: "https://line.me/R/ti/p/@836pqtzr",
  social: {
    Facebook: "https://www.facebook.com/SIGHT.0721",
    Instagram: "https://www.instagram.com/sight_international/",
    YouTube: "https://www.youtube.com/@sightmusic0721",
  },

  heroClips: [
    { src: "media/hero-1.mp4", caption: "Tokyo Kosei Wind Orchestra — Magellan's Voyage" },
    { src: "media/hero-2.mp4", caption: "Tokyo Kosei Wind Orchestra — Live in Concert" },
    { src: "media/hero-3.mp4", caption: "Tokyo Kosei Wind Orchestra — Magellan's Voyage" },
    { src: "media/hero-5.mp4", caption: "Tokyo Kosei Wind Orchestra — Tanabata" },
    { src: "media/hero-4.mp4", caption: "Tokyo Kosei Wind Orchestra — Percussion" },
  ],

  // 節目：id 對應 content/*/site.json 的 tour.<id> 與 programs.json
  tour: [
    { id: "dreamwalker", date: "2026-07-22", en: "The Dreamwalker", img: "img/kv-dreamwalker.jpg", nfc: true, artists: ["tkwo"] },
    { id: "storyteller", date: "2026-07-24", en: "A Teller of Tales", img: "img/kv-storyteller.jpg", nfc: true, artists: ["tkwo", "msq", "nikita"] },
    { id: "homeshore", date: "2026-08-30", en: "Home Shore: Formosa", img: "img/kv-homeshore.jpg", nfc: true, artists: ["tkwo", "nikita"] },
    { id: "ukiyo", date: "2026-08-31", en: "Ukiyo", img: "img/kv-ukiyo.jpg", nfc: true, artists: ["tkwo"] },
    { id: "myseat", date: "2026-11-23", en: "My Seat", img: "img/kv-myseat.jpg", nfc: false, artists: ["tkwo", "nikita"] },
    { id: "gala", date: "2026-11-24", en: "Gala Splendor", img: "img/kv-gala.jpg", nfc: false, artists: ["tkwo"] },
    { id: "finale", date: "2026-12-12", en: "Finale", img: "img/kv-finale.jpg", nfc: false, artists: ["tkwo"] },
  ],

  artists: [
    { id: "tkwo", en: "Tokyo Kosei Wind Orchestra", img: "img/photo-4.jpg", portrait: "nfc/homeshore/img/ensemble.jpg",
      videos: ["-mgV_g0Wnwg", "OUmxcA6JouA", "XfdtqNGQzU8"] },
    { id: "matsushita", en: "Matsushita Yo", img: "img/artist-matsushita.jpg", portrait: "img/artist-matsushita.jpg", videos: [] },
    { id: "nikita", en: "Nikita Zimin", img: "img/artist-nikita.jpg", portrait: "img/artist-nikita.jpg", videos: [] },
    { id: "msq", en: "Moscow Saxophone Quartet", img: "img/artist-msq.jpg", portrait: "img/artist-msq.jpg", videos: [] },
    { id: "kazakov", en: "Mikhail Kazakov", img: "img/news-kazakov.jpg", portrait: "img/news-kazakov.jpg",
      videos: ["pD_vLOGzMdc", "2LS3gj4r318", "82LkcmHRYjY", "NngXhnhVQxQ", "n3eUV8VzRxY", "rQwheKDiGlU"] },
  ],

  videos: [
    { id: "-mgV_g0Wnwg", title: "Magellan's Voyage to Unknown Continent", by: "Tokyo Kosei Wind Orchestra" },
    { id: "OUmxcA6JouA", title: "Tanabata — Itaru Sakai", by: "Tokyo Kosei Wind Orchestra" },
    { id: "XfdtqNGQzU8", title: "Polonaise and Aria", by: "Tokyo Kosei Wind Orchestra" },
    { id: "JViA7PPuXc0", title: "Haydn: Cello Concerto in C", by: "Sergei Nakariakov" },
    { id: "pD_vLOGzMdc", title: "Impetus — N. Šenk", by: "Mikhail Kazakov" },
    { id: "2LS3gj4r318", title: "Concertino Op.17 — J. Rueff", by: "Mikhail Kazakov" },
    { id: "82LkcmHRYjY", title: "Nuée Ardente — V. David", by: "Mikhail Kazakov" },
    { id: "NngXhnhVQxQ", title: "The love I took to leave you", by: "Mikhail Kazakov" },
  ],

  news: [
    { id: "tkwo2026", date: "2026.04.10", img: "img/news-tkwo.jpg" },
    { id: "kazakov", date: "2026.02.24", img: "img/news-kazakov.jpg" },
    { id: "masterclass", date: "2025.07.05", img: "img/kv-echoes.jpg" },
    { id: "echoes", date: "2024.05.12", img: "img/photo-11.jpg" },
  ],

  phases: ["img/photo-2.jpg", "img/photo-3.jpg", "img/photo-5.jpg", "img/photo-6.jpg"],

  // NFC 卡片：每張卡對應一位演出者（響系列兩張已移除；同一人只放一張）
  // info: [場次, 該場 nfc-*.json 的 artists 索引]，用來顯示介紹；artist: 有藝術家頁時連過去
  nfcPeople: {
    tkwo:    { info: ["homeshore", 0], artist: "tkwo", shows: ["dreamwalker", "storyteller", "homeshore", "ukiyo", "myseat", "gala", "finale"] },
    ooi:     { info: ["homeshore", 1], shows: ["dreamwalker", "storyteller", "homeshore", "ukiyo"] },
    nikita:  { info: ["homeshore", 3], artist: "nikita", shows: ["storyteller", "homeshore", "myseat"] },
    yeh:     { info: ["homeshore", 2], shows: ["homeshore"] },
    chen:    { info: ["ukiyo", 2], shows: ["ukiyo"] },
    saito:   { info: ["dreamwalker", 1], shows: ["dreamwalker"] },
    hou:     { info: ["storyteller", 1], shows: ["storyteller"] },
    msq:     { info: ["storyteller", 2], artist: "msq", shows: ["storyteller"] },
    kazakov: { artist: "kazakov", shows: [], news: "kazakov" },
  },
  nfcBack: "nfc/homeshore/img/card-back.jpg",
  // 各場次的卡片：[檔名, 演出者]
  nfcCards: {
    dreamwalker: [["card09", "tkwo"], ["card05", "ooi"], ["card06", "saito"], ["card07", "hou"], ["card08", "msq"], ["card03", "kazakov"]],
    storyteller: [["card09", "tkwo"], ["card05", "ooi"], ["card06", "saito"], ["card07", "hou"], ["card08", "msq"], ["card03", "kazakov"]],
    homeshore: [["card13", "tkwo"], ["card10", "ooi"], ["card12", "nikita"], ["card11", "yeh"], ["card06", "saito"], ["card07", "hou"], ["card08", "msq"], ["card03", "kazakov"]],
    ukiyo: [["card12", "tkwo"], ["card10", "ooi"], ["card11", "chen"], ["card06", "saito"], ["card07", "hou"], ["card08", "msq"], ["card03", "kazakov"]],
  },
  // 首頁展示：全部演出者各一張
  nfcShowcase: [
    ["homeshore/card13", "tkwo"], ["homeshore/card10", "ooi"], ["homeshore/card12", "nikita"], ["homeshore/card11", "yeh"],
    ["ukiyo/card11", "chen"], ["dreamwalker/card06", "saito"], ["dreamwalker/card07", "hou"], ["dreamwalker/card08", "msq"],
    ["dreamwalker/card03", "kazakov"],
  ],
};
