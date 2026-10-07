// 從 NFC 電子節目冊移植的互動元件：翻書式曲目解析、演出者滑動介紹、NFC 卡片輪播與 3D 檢視器

/* ───────── 翻書式曲目解析 ───────── */
function mountBook(el, program, lbl) {
  const pages = [];
  program.program.forEach((piece) => {
    pages.push({ piece });
    if (piece.no === program.intermissionAfter) pages.push({ intermission: true });
  });
  el.innerHTML = `
    <div class="book-toolbar">
      <span class="book-pos"></span>
      <div class="book-font">
        <button type="button" data-f="-1" aria-label="${esc(lbl.smaller)}">A−</button>
        <button type="button" data-f="1" aria-label="${esc(lbl.larger)}">A＋</button>
      </div>
    </div>
    <div class="book">
      <div class="book-page"></div>
      <button class="book-nav prev" type="button" aria-label="prev"></button>
      <button class="book-nav next" type="button" aria-label="next"></button>
    </div>
    <div class="book-tabs"></div>
    <p class="hint">${esc(lbl.hint)}</p>`;
  const page = $(".book-page", el), pos = $(".book-pos", el), tabs = $(".book-tabs", el);
  let idx = 0, flipping = false, font = 16;

  tabs.innerHTML = pages.map((p, i) => `<button type="button" data-i="${i}">${p.intermission ? "—" : p.piece.no}</button>`).join("");
  function fill() {
    const p = pages[idx];
    page.classList.toggle("intermission", !!p.intermission);
    if (p.intermission) {
      page.innerHTML = `<div>${esc(lbl.intermission)}</div>`;
    } else {
      const x = p.piece, pf = x.performers || {};
      const perf = [pf.ensemble, pf.conductor && `${lbl.conductor} / ${pf.conductor}`, pf.saxophone && `${lbl.saxophone} / ${pf.saxophone}`]
        .concat(Object.entries(pf).filter(([k]) => !["ensemble", "conductor", "saxophone"].includes(k)).map(([, v]) => v))
        .filter(Boolean).join("　");
      page.innerHTML = `<span class="book-no">${String(x.no).padStart(2, "0")}</span>
        <h3>${esc(x.title)}</h3><div class="composer">${esc(x.composer)}</div>
        ${perf ? `<div class="performers">${esc(perf)}</div>` : ""}
        ${x.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("")}`;
    }
    pos.textContent = `${idx + 1} / ${pages.length}`;
    $$("button", tabs).forEach((b, i) => b.classList.toggle("is-on", i === idx));
  }
  function go(n) {
    n = Math.max(0, Math.min(pages.length - 1, n));
    if (n === idx || flipping) return;
    const dir = n > idx ? 1 : -1;
    flipping = true;
    page.classList.add(dir > 0 ? "flip-out-next" : "flip-out-prev");
    setTimeout(() => {
      idx = n; fill();
      page.classList.remove("flip-out-next", "flip-out-prev");
      page.classList.add(dir > 0 ? "flip-in-next" : "flip-in-prev");
      page.scrollTop = 0;
      const top = el.getBoundingClientRect().top;
      if (top < 0) scrollBy({ top: top - 90, behavior: "smooth" });
      setTimeout(() => { page.classList.remove("flip-in-next", "flip-in-prev"); flipping = false; }, 260);
    }, 200);
  }
  $(".prev", el).addEventListener("click", () => go(idx - 1));
  $(".next", el).addEventListener("click", () => go(idx + 1));
  tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) go(+b.dataset.i); });
  $$(".book-font button", el).forEach((b) => b.addEventListener("click", () => {
    font = Math.min(24, Math.max(13, font + +b.dataset.f));
    el.style.setProperty("--book-font", font + "px");
  }));
  let sx = 0, sy = 0;
  const book = $(".book", el);
  book.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  book.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
  addEventListener("keydown", (e) => {
    const r = el.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    if (e.key === "ArrowRight") go(idx + 1);
    if (e.key === "ArrowLeft") go(idx - 1);
  });
  fill();
}

/* ───────── 演出者滑動介紹 ───────── */
function mountSlider(el, artists, lbl) {
  el.innerHTML = `
    <div class="slider">${artists.map((a) => `
      <article class="slide">
        <div class="slide-img"><img src="${a.img}" alt="${esc(a.name)}" loading="lazy"></div>
        <div class="slide-body">
          <h3>${esc(a.name)}</h3>${a.role ? `<span class="slide-role">${esc(a.role)}</span>` : ""}
          ${a.paras.map((p) => `<p>${esc(p)}</p>`).join("")}
          ${a.roster.length ? `<details class="roster"><summary>${esc(lbl.roster)}</summary>
            <dl>${a.roster.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></details>` : ""}
        </div>
      </article>`).join("")}
    </div>
    <div class="slider-ctrl">
      <button type="button" class="slider-btn" data-d="-1" aria-label="prev">←</button>
      <div class="dots">${artists.map((_, i) => `<button type="button" data-i="${i}" aria-label="${i + 1}"></button>`).join("")}</div>
      <button type="button" class="slider-btn" data-d="1" aria-label="next">→</button>
    </div>`;
  const sl = $(".slider", el), dots = $$(".dots button", el), slides = $$(".slide", el);
  const cur = () => Math.round(sl.scrollLeft / (slides[0].offsetWidth + 24));
  const go = (i) => sl.scrollTo({ left: slides[Math.max(0, Math.min(slides.length - 1, i))].offsetLeft - sl.offsetLeft, behavior: "smooth" });
  const upd = () => dots.forEach((d, i) => d.classList.toggle("is-on", i === cur()));
  sl.addEventListener("scroll", upd, { passive: true });
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  $$(".slider-btn", el).forEach((b) => b.addEventListener("click", () => go(cur() + +b.dataset.d)));
  upd();
}

/* ───────── NFC 卡片檢視：左側演出者介紹、右側 3D 卡片（整站共用一個） ───────── */
// 讀取演出者介紹：有藝術家頁的用 site.json，其餘用該場 NFC 節目冊的演出者資料
async function personInfo(key) {
  const p = S.nfcPeople[key];
  const site = p.artist && T.artists[p.artist];
  let nfc = null;
  if (p.info) nfc = (await load(`nfc-${p.info[0]}.json`)).artists[p.info[1]];
  const art = p.artist && S.artists.find((a) => a.id === p.artist);
  return {
    name: site?.name || nfc?.name,
    en: art?.en && art.en !== (site?.name || nfc?.name) ? art.en : "",
    role: site?.role || nfc?.role || "",
    paras: site?.paras || nfc?.paras || [],
    members: site?.members || [],
    awards: site?.awards || [],
    videos: art?.videos || [],
    shows: p.shows.map((id) => S.tour.find((x) => x.id === id)).filter(Boolean),
    artist: p.artist, news: p.news,
  };
}

let viewer;
function cardViewer() {
  if (viewer) return viewer;
  const v = document.createElement("div");
  v.className = "viewer"; v.hidden = true;
  v.innerHTML = `<div class="viewer-backdrop"></div>
    <div class="viewer-layout">
      <div class="viewer-info"></div>
      <div class="viewer-side">
        <div class="viewer-stage"><div class="card3d">
          <img class="face front" alt=""><img class="face back" alt="">
          ${[-0.35, -0.17, 0, 0.17, 0.35].map((i) => `<span class="ply" style="--i:${i}"></span>`).join("")}
        </div></div>
        <p class="viewer-hint"></p>
        <div class="viewer-nav">
          <button type="button" data-d="-1">←</button><span class="viewer-pos"></span><button type="button" data-d="1">→</button>
        </div>
      </div>
    </div>
    <button class="viewer-close" type="button" aria-label="close">✕</button>`;
  document.body.append(v);
  const card = $(".card3d", v), front = $(".front", v), back = $(".back", v), info = $(".viewer-info", v);
  let angle = 0, tilt = 0, drag = false, lx = 0, ly = 0, ox = 0, oy = 0, os = 1, closing = false, timer;
  let list = [], idx = 0, origin = null, req = 0;
  const apply = () => (card.style.transform = `rotateY(${angle}deg) rotateX(${tilt}deg)`);

  async function render() {
    const it = list[idx], my = ++req;
    $(".viewer-pos", v).textContent = `${idx + 1} / ${list.length}`;
    $(".viewer-hint", v).textContent = t("card_flip");
    info.classList.add("is-loading");
    const p = await personInfo(it.person);
    if (my !== req) return;
    info.innerHTML = `
      <span class="eyebrow">${esc(t("nfc_card"))} · ${String(idx + 1).padStart(2, "0")}</span>
      <h2>${esc(p.name)}</h2>
      ${p.en ? `<p class="vi-en">${esc(p.en)}</p>` : ""}
      ${p.role ? `<p class="vi-role">${esc(p.role)}</p>` : ""}
      <div class="vi-bio">${p.paras.map((x) => `<p>${esc(x)}</p>`).join("")}</div>
      ${p.members.length ? `<h3>${t("members")}</h3><dl class="vi-members">${p.members.map(([n, r]) => `<dt>${esc(n)}</dt><dd>${esc(r)}</dd>`).join("")}</dl>` : ""}
      ${p.awards.length ? `<h3>${t("awards")}</h3><ul class="vi-awards">${p.awards.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      <h3>${t("appears_in")}</h3>
      ${p.shows.length ? `<div class="vi-shows">${p.shows.map((s) => {
        const d = fmtDate(s.date), past = s.date < today;
        return `<a class="vi-show ${past ? "is-past" : ""}" href="${href("program.html", s.id)}">
          <img src="${s.img}" alt="" loading="lazy">
          <span><b>${esc(T.tour[s.id].title)}</b><small>${d.year}.${d.mon} ${d.day} · ${past ? t("past") : esc(T.tour[s.id].venue)}</small></span></a>`;
      }).join("")}</div>` : `<p class="vi-none">${t("no_shows")}</p>`}
      ${p.videos.length ? `<h3>${t("watch_videos")}</h3><div class="vi-videos">${p.videos.slice(0, 4).map((id) =>
        `<button type="button" data-yt="${id}"><img src="img/yt/${id}.jpg" alt="" loading="lazy"><span class="vcard-play"></span></button>`).join("")}</div>` : ""}
      <div class="vi-actions">
        ${p.artist ? `<a class="btn btn-gold" href="${href("artist.html", p.artist)}">${t("artist_page")}</a>` : ""}
        ${p.news ? `<a class="btn btn-ghost" href="${href("news.html", p.news)}">${t("read_article")}</a>` : ""}
      </div>`;
    info.scrollTop = 0;
    info.classList.remove("is-loading");
  }

  function open(img, items, i, backSrc) {
    clearTimeout(timer); closing = false;
    list = items; idx = i; origin = img;
    const a = img.getBoundingClientRect();
    front.src = items[i].src; back.src = backSrc;
    angle = 0; tilt = 0; v.hidden = false;
    document.body.classList.add("is-locked");
    render();
    card.style.transition = "none"; apply();
    const b = card.getBoundingClientRect();
    ox = a.left + a.width / 2 - (b.left + b.width / 2);
    oy = a.top + a.height / 2 - (b.top + b.height / 2);
    os = a.width / b.width;
    // 起訖使用相同的 transform 函式組合，才會真的轉滿一圈
    card.style.transform = `translate(${ox}px,${oy}px) scale(${os}) rotateY(-360deg) rotateX(0deg)`;
    void card.offsetWidth;
    card.style.transition = "transform .62s cubic-bezier(.2,.8,.3,1)";
    card.style.transform = "translate(0px,0px) scale(1) rotateY(0deg) rotateX(0deg)";
  }
  // 上一張／下一張：卡片翻一圈換面
  function step(d) {
    if (list.length < 2) return;
    idx = (idx + d + list.length) % list.length;
    card.style.transition = "transform .28s ease-in";
    card.style.transform = `rotateY(${d * 90}deg) rotateX(0deg)`;
    setTimeout(() => {
      front.src = list[idx].src;
      card.style.transition = "none";
      card.style.transform = `rotateY(${-d * 90}deg) rotateX(0deg)`;
      void card.offsetWidth;
      angle = 0; tilt = 0;
      card.style.transition = "transform .34s cubic-bezier(.2,.8,.3,1)";
      apply();
    }, 280);
    render();
  }
  function close() {
    if (v.hidden || closing) return;
    closing = true;
    document.body.classList.remove("is-locked");
    const n = ((angle % 360) + 360) % 360;
    // 換過卡片時，起點那張已不是目前這張，直接淡出
    if (list[idx].src !== origin.getAttribute("src")) { v.classList.add("is-fading"); timer = setTimeout(() => { v.hidden = true; v.classList.remove("is-fading"); closing = false; }, 300); return; }
    card.style.transition = "none";
    card.style.transform = `translate(0px,0px) scale(1) rotateY(${n}deg) rotateX(${tilt}deg)`;
    void card.offsetWidth;
    card.style.transition = "transform .62s cubic-bezier(.2,.8,.3,1)";
    card.style.transform = `translate(${ox}px,${oy}px) scale(${os}) rotateY(-360deg) rotateX(0deg)`;
    v.classList.add("is-closing");
    timer = setTimeout(() => { v.hidden = true; v.classList.remove("is-closing"); closing = false; }, 620);
  }
  $(".viewer-close", v).addEventListener("click", close);
  $(".viewer-backdrop", v).addEventListener("click", close);
  $$(".viewer-nav button", v).forEach((b) => b.addEventListener("click", () => step(+b.dataset.d)));
  addEventListener("keydown", (e) => {
    if (v.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  card.addEventListener("pointerdown", (e) => { drag = true; lx = e.clientX; ly = e.clientY; card.style.transition = "none"; card.setPointerCapture(e.pointerId); });
  card.addEventListener("pointermove", (e) => {
    if (!drag) return;
    angle += (e.clientX - lx) * 0.7;
    tilt = Math.max(-22, Math.min(22, tilt - (e.clientY - ly) * 0.4));
    lx = e.clientX; ly = e.clientY; apply();
  });
  const end = () => {
    if (!drag) return;
    drag = false;
    card.style.transition = "transform .5s cubic-bezier(.2,.8,.3,1)";
    angle = Math.round(angle / 180) * 180; tilt = 0; apply();
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
  return (viewer = { open });
}

/* ───────── NFC 卡片輪播：自動推進＋拖曳，點擊看演出者 ───────── */
// items: [{ src, person }]
function mountCards(el, items, backSrc, hint) {
  el.innerHTML = `<div class="carousel"><div class="car-track">${[0, 1].map(() =>
    items.map((c, i) => `<img src="${c.src}" alt="NFC card ${i + 1}" data-i="${i}" draggable="false">`).join("")).join("")}</div></div>
    <p class="hint">${esc(hint)}</p>`;
  const car = $(".carousel", el), track = $(".car-track", el);
  let auto = true, idle, pos = 0, down = false, sx = 0, sl = 0, dragged = false;
  const pause = () => { auto = false; clearTimeout(idle); idle = setTimeout(() => (auto = true), 2500); };
  car.addEventListener("touchstart", pause, { passive: true });
  car.addEventListener("wheel", pause, { passive: true });
  car.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; dragged = false; sx = e.clientX; sl = car.scrollLeft; pause(); });
  car.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 6) dragged = true; car.scrollLeft = sl - dx; pause(); });
  ["pointerup", "pointerleave"].forEach((ev) => car.addEventListener(ev, () => (down = false)));
  track.addEventListener("click", (e) => {
    if (dragged) { dragged = false; return; }
    const img = e.target.closest("img");
    if (img) { pause(); cardViewer().open(img, items, +img.dataset.i, backSrc); }
  });
  // 卡片不夠填滿兩倍寬度時，不做無縫循環，避免同一張卡同時出現兩次
  let looping = true;
  function checkLoop() {
    const half = track.scrollWidth / 2;
    const fits = half > 0 && half < car.clientWidth * 1.15;
    if (fits === !looping) return;
    looping = !fits;
    $$("img", track).forEach((im, i) => (im.hidden = fits && i >= items.length));
    track.classList.toggle("is-static", fits);
  }
  addEventListener("resize", checkLoop);
  setTimeout(checkLoop, 300);
  (function loop() {
    if (!looping) return requestAnimationFrame(loop);
    const half = track.scrollWidth / 2;
    if (half > 0) {
      if (auto) { pos += 0.5; if (pos >= half) pos -= half; car.scrollLeft = pos; }
      else pos = car.scrollLeft;
    }
    requestAnimationFrame(loop);
  })();
}
