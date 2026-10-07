// 藝術家詳細頁：artist.html?id=nikita
(async () => {
  await boot();
  const id = params.get("id");
  const a = S.artists.find((x) => x.id === id);
  const main = $("#page");
  if (!a) { main.innerHTML = `<section class="section"><h2>${t("not_found")}</h2><a class="btn btn-gold" href="${href("index.html")}">${t("back_home")}</a></section>`; return; }
  const tx = T.artists[id];
  document.title = `${a.en}｜SIGHT MUSIC`;
  const shows = S.tour.filter((p) => p.artists.includes(id))
    .sort((x, y) => (x.date < today) - (y.date < today) || x.date.localeCompare(y.date));
  // 這位藝術家相關的消息（Kazakov 有專文）
  const news = S.news.filter((n) => n.id === id || (id === "tkwo" && n.id === "tkwo2026"));

  main.innerHTML = `
    <section class="a-hero">
      <div class="a-photo reveal"><img src="${a.portrait}" alt="${esc(tx.name)}"></div>
      <div class="a-head reveal">
        <a class="d-back" href="${href("index.html")}#artists">${t("back")}</a>
        <span class="eyebrow">SIGHT ARTIST · ${esc(tx.from)}</span>
        <h1>${esc(a.en)}</h1>
        ${tx.name !== a.en ? `<p class="a-local">${esc(tx.name)}</p>` : ""}
        <p class="a-role">${esc(tx.role)}</p>
        <div class="a-bio">${tx.paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
        ${tx.members?.length ? `<h3>${t("members")}</h3><dl class="a-members">${tx.members.map(([n, r]) => `<dt>${esc(n)}</dt><dd>${esc(r)}</dd>`).join("")}</dl>` : ""}
        ${tx.awards?.length ? `<h3>${t("awards")}</h3><ul class="a-awards">${tx.awards.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      </div>
    </section>

    ${a.videos.length ? `
    <section class="section">
      <div class="section-head reveal"><span class="eyebrow">WATCH</span><h2>${t("watch_videos")}</h2></div>
      <div class="watch-list watch-list-3">${a.videos.map((v) => videoCard(S.videos.find((x) => x.id === v) || v)).join("")}</div>
    </section>` : ""}

    ${shows.length ? `
    <section class="section">
      <div class="section-head reveal"><span class="eyebrow">ON STAGE</span><h2>${t("related_program")}</h2></div>
      <div class="tour-list tour-list-3">${shows.map(showCard).join("")}</div>
    </section>` : ""}

    ${news.length ? `
    <section class="section">
      <div class="news-list news-list-wide">${news.map(newsCard).join("")}</div>
    </section>` : ""}

    <section class="section">
      <div class="section-head reveal"><span class="eyebrow">SIGHT ARTISTS</span><h2>${t("more_artists")}</h2></div>
      <div class="artist-grid">${S.artists.filter((x) => x.id !== id).map(artistCard).join("")}</div>
    </section>`;
  observeReveal();
})();
