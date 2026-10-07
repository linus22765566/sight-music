// 消息詳細頁：news.html?id=kazakov
(async () => {
  await boot();
  const id = params.get("id");
  const n = S.news.find((x) => x.id === id);
  const main = $("#page");
  if (!n) { main.innerHTML = `<section class="section"><h2>${t("not_found")}</h2><a class="btn btn-gold" href="${href("index.html")}">${t("back_home")}</a></section>`; return; }
  const title = T.news[id].title;
  document.title = `${title}｜SIGHT MUSIC`;
  const blocks = await load(`news-${id}.json`);

  // 連續的 li 合併成一個清單；影片做成點擊播放的縮圖
  let html = "", list = null;
  const flush = () => { if (list) { html += `<ul>${list}</ul>`; list = null; } };
  for (const b of blocks) {
    if (b.t === "li") { list = (list || "") + `<li>${br(b.x)}</li>`; continue; }
    flush();
    if (b.t === "video") html += `<button class="n-video" type="button" data-yt="${esc(b.x)}"><img src="https://i.ytimg.com/vi/${esc(b.x)}/hqdefault.jpg" alt="" loading="lazy"><span class="vcard-play"></span></button>`;
    else if (/^h[1-6]$/.test(b.t)) { const lv = Math.max(2, Math.min(4, +b.t[1])); html += `<h${lv}>${br(b.x)}</h${lv}>`; }
    else if (b.t === "blockquote") html += `<blockquote>${br(b.x)}</blockquote>`;
    else html += `<p>${br(b.x)}</p>`;
  }
  flush();

  main.innerHTML = `
    <article class="n-article">
      <header class="n-head">
        <a class="d-back" href="${href("index.html")}#news">${t("back")}</a>
        <time class="eyebrow">${n.date}</time>
        <h1>${esc(title)}</h1>
      </header>
      <div class="n-cover"><img src="${n.img}" alt=""></div>
      <div class="n-body">${html}</div>
    </article>
    <section class="section">
      <div class="section-head reveal"><span class="eyebrow">LATEST NEWS</span><h2>${t("more_news")}</h2></div>
      <div class="news-list">${S.news.filter((x) => x.id !== id).map(newsCard).join("")}</div>
    </section>`;
  observeReveal();
})();
