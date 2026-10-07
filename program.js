// 節目詳細頁：program.html?id=homeshore
(async () => {
  await boot();
  const id = params.get("id");
  const p = S.tour.find((x) => x.id === id);
  const main = $("#page");
  if (!p) { main.innerHTML = `<section class="section"><h2>${t("not_found")}</h2><a class="btn btn-gold" href="${href("index.html")}">${t("back_home")}</a></section>`; return; }

  const tx = T.tour[id];
  const programs = await load("programs.json");
  const info = programs[id] || { about: [], info: [], setlist: [] };
  const nfc = p.nfc ? await load(`nfc-${id}.json`) : null;
  const d = fmtDate(p.date);
  const past = p.date < today;
  document.title = `${tx.title} ${p.en}｜SIGHT MUSIC`;

  // 曲目：有 NFC 資料時用其完整曲目
  let setlist = info.setlist;
  if (nfc) {
    setlist = [];
    nfc.program.program.forEach((x) => {
      setlist.push(`${x.no}. ${x.composer}: ${x.title}`);
      if (x.no === nfc.program.intermissionAfter) setlist.push(`— ${t("intermission")} —`);
    });
  }
  const isBreak = (s) => /^—.*—$/.test(s.trim());

  main.innerHTML = `
    <section class="d-hero">
      <div class="d-hero-bg" style="background-image:url('${p.img}')"></div>
      <div class="d-hero-inner">
        <a class="d-back" href="${href("index.html")}#tour">${t("back")}</a>
        <div class="d-kv reveal"><img src="${p.img}" alt="${esc(tx.title)}"></div>
        <div class="d-head reveal">
          <span class="eyebrow">SIGHT × TKWO 2026 · ${d.mon} ${d.day}</span>
          <h1>${esc(tx.title)}<small>${esc(p.en)}</small></h1>
          <p class="d-line">「${esc(tx.line)}」</p>
          <dl class="d-facts">
            <div><dt>${t("date")}</dt><dd>${d.year}.${p.date.slice(5).replace("-", ".")}</dd></div>
            <div><dt>${t("venue")}</dt><dd>${esc(tx.venue)}・${esc(tx.city)}</dd></div>
            <div><dt>${t("performers")}</dt><dd>${esc(tx.guest)}</dd></div>
          </dl>
          <div class="d-actions">
            ${past ? `<span class="btn btn-ghost is-static">${t("past")}</span>` : `<a class="btn btn-gold" href="${S.ticket}" target="_blank" rel="noopener">${t("buy_now")}</a>`}
            ${nfc ? `<a class="btn btn-ghost" href="#nfc-cards">NFC</a>` : ""}
          </div>
        </div>
      </div>
    </section>

    <nav class="d-subnav">
      <a href="#about">${t("about_program")}</a>
      <a href="#setlist">${t("setlist")}</a>
      ${nfc ? `<a href="#notes">${t("program_notes")}</a><a href="#performers">${t("performers")}</a><a href="#nfc-cards">NFC</a>` : ""}
    </nav>

    <section class="section d-grid" id="about">
      <div class="reveal">
        <span class="eyebrow">ABOUT THE PROGRAM</span>
        <h2 class="d-h2">${t("about_program")}</h2>
        ${info.about.map((x) => `<p class="d-p">${esc(x)}</p>`).join("")}
      </div>
      <aside class="d-aside reveal" id="setlist">
        <h3>${t("performance_info")}</h3>
        <dl class="d-info">${info.info.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
        <h3>${t("setlist")}</h3>
        <ol class="d-setlist">${setlist.map((s) => isBreak(s) ? `<li class="is-break">${esc(s)}</li>` : `<li>${esc(s.replace(/^\d+\.\s*/, ""))}</li>`).join("")}</ol>
      </aside>
    </section>

    ${nfc ? `
    <section class="section d-notes" id="notes">
      <div class="section-head reveal"><span class="eyebrow">PROGRAM NOTES</span><h2>${t("program_notes")}</h2></div>
      <div class="book-wrap reveal" id="book"></div>
    </section>

    <section class="section d-performers" id="performers">
      <div class="section-head reveal"><span class="eyebrow">ABOUT THE ARTISTS</span><h2>${t("performers")}</h2></div>
      <div class="reveal" id="slider"></div>
    </section>

    <section class="section d-nfc" id="nfc-cards">
      <div class="d-nfc-grid">
        <div class="reveal">
          <span class="eyebrow">MUSICIAN TOUCH!</span>
          <h2 class="d-h2">${t("nfc_cards")}</h2>
          <p class="d-p">${esc(T.nfc.lede)}</p>
          <div id="cards"></div>
          <div class="d-actions">
            <a class="btn btn-gold" href="${href("index.html")}#nfc">${esc(T.nfc.price)} →</a>
          </div>
        </div>
      </div>
    </section>` : ""}

    <section class="section" id="more">
      <div class="section-head reveal"><span class="eyebrow">MORE</span><h2>${t("other_programs")}</h2></div>
      <div class="tour-list tour-list-3">${S.tour.filter((x) => x.id !== id).sort((a, b) => (a.date < today) - (b.date < today) || a.date.localeCompare(b.date)).slice(0, 3).map(showCard).join("")}</div>
    </section>`;

  if (nfc) {
    mountBook($("#book"), nfc.program, { hint: t("program_notes_hint"), intermission: t("intermission"), smaller: t("font_smaller"), larger: t("font_larger"), conductor: t("conductor"), saxophone: t("saxophone") });
    mountSlider($("#slider"), nfc.artists, { roster: t("roster") });
    mountCards($("#cards"), S.nfcCards[id].map(([c, person]) => ({ src: `nfc/${id}/img/${c}.jpg`, person })), `nfc/${id}/img/card-back.jpg`, t("nfc_cards_hint"));
  }
  observeReveal();
  if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 50);
})();
