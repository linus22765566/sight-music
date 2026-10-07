// 各頁共用：語言切換、導覽列、頁尾、影片燈箱、進場動畫
const S = window.SITE;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const br = (s) => esc(s).replace(/\n/g, "<br>");
const params = new URLSearchParams(location.search);
const today = new Date().toISOString().slice(0, 10);

/* ── 語言 ── */
const LANGS = ["zh", "ru"];
let LANG = params.get("lang");
if (!LANGS.includes(LANG)) { try { LANG = localStorage.getItem("lang"); } catch (e) {} }
if (!LANGS.includes(LANG)) LANG = "zh";
document.documentElement.lang = LANG === "ru" ? "ru" : "zh-Hant";
document.documentElement.dataset.lang = LANG;

const cache = {};
// 讀取 content/<lang>/<file>，俄文缺檔時退回中文
async function load(file) {
  const key = LANG + "/" + file;
  if (!cache[key]) {
    cache[key] = fetch(`content/${LANG}/${file}`).then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => fetch(`content/zh/${file}`).then((r) => r.json()));
  }
  return cache[key];
}
let T = {};          // site.json
const t = (k) => T.ui?.[k] ?? k;

function setLang(l) {
  try { localStorage.setItem("lang", l); } catch (e) {}
  const u = new URL(location.href);
  u.searchParams.set("lang", l);
  location.href = u.toString();
}
// 站內連結自動帶上目前語言
function href(page, id) {
  const q = new URLSearchParams();
  if (id) q.set("id", id);
  if (LANG !== "zh") q.set("lang", LANG);
  const s = q.toString();
  return page + (s ? "?" + s : "");
}

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleString(LANG === "ru" ? "ru" : "en", { month: "short" }).replace(".", "").toUpperCase(),
    year: d.getFullYear(),
  };
};

/* ── 導覽列與頁尾 ── */
function renderChrome() {
  const home = href("index.html");
  const nav = document.createElement("header");
  nav.className = "nav" + (document.body.dataset.page === "home" ? "" : " is-solid");
  nav.id = "nav";
  nav.innerHTML = `
    <a href="${home}" class="nav-logo" aria-label="SIGHT MUSIC"><img src="img/logo_white.svg" alt="SIGHT MUSIC"></a>
    <nav class="nav-links">
      <a href="${home}#nfc">${t("nav_nfc")}</a>
      <a href="${home}#tour">${t("nav_tour")}</a>
      <a href="${home}#watch">${t("nav_watch")}</a>
      <a href="${home}#artists">${t("nav_artists")}</a>
      <a href="${home}#about">${t("nav_about")}</a>
      <a href="${home}#news">${t("nav_news")}</a>
      <a href="#contact">${t("nav_contact")}</a>
    </nav>
    <div class="lang-switch" role="group" aria-label="Language">
      <button type="button" data-lang="zh" class="${LANG === "zh" ? "is-on" : ""}">中</button>
      <button type="button" data-lang="ru" class="${LANG === "ru" ? "is-on" : ""}">RU</button>
    </div>
    <a class="btn btn-gold nav-cta" href="${S.ticket}" target="_blank" rel="noopener">${t("ticket")}</a>
    <button class="nav-burger" type="button" aria-label="Menu"><span></span><span></span></button>`;
  document.body.prepend(nav);
  $$(".lang-switch button", nav).forEach((b) => b.addEventListener("click", () => b.dataset.lang !== LANG && setLang(b.dataset.lang)));
  $(".nav-burger", nav).addEventListener("click", () => nav.classList.toggle("is-open"));
  $$(".nav-links a", nav).forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
  if (document.body.dataset.page === "home") {
    const onScroll = () => nav.classList.toggle("is-solid", scrollY > innerHeight * 0.6);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const f = document.createElement("footer");
  f.className = "footer";
  f.id = "contact";
  f.innerHTML = `
    <div class="footer-big reveal">
      <span class="eyebrow">CONTACT</span>
      <a class="footer-mail" href="mailto:${S.mail}">sightmusic0721<wbr>@sight&#8209;music.com</a>
      <p>${esc(t("contact_lede"))}</p>
    </div>
    <div class="footer-cols">
      <div><h4>${t("address")}</h4><p>${esc(T.address)}<br><small>7F, No. 435, Zhongping Rd., Xinzhuang Dist., New Taipei City, Taiwan</small></p></div>
      <div><h4>${t("follow")}</h4><p>${Object.entries(S.social).map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener">${k}</a>`).join("<br>")}</p></div>
      <div><h4>${t("platforms")}</h4><p><a href="${S.ticket}" target="_blank" rel="noopener">${t("ticket_platform")}</a><br><a href="${S.ec}" target="_blank" rel="noopener">${t("ec_platform")}</a></p></div>
    </div>
    <div class="footer-base"><img src="img/logo_white.svg" alt="SIGHT MUSIC"><span>${esc(T.copyright)}</span></div>`;
  document.body.append(f);

  const lb = document.createElement("div");
  lb.className = "lightbox"; lb.id = "lightbox"; lb.hidden = true;
  lb.innerHTML = `<button class="lightbox-close" type="button" aria-label="${t("close")}">✕</button><div class="lightbox-frame"></div>`;
  document.body.append(lb);
  const frame = $(".lightbox-frame", lb);
  const close = () => { lb.hidden = true; frame.innerHTML = ""; document.body.classList.remove("is-locked"); };
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lightbox-close")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-yt]");
    if (!b) return;
    e.preventDefault();
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    lb.hidden = false;
    document.body.classList.add("is-locked");
  });
}

/* ── 共用卡片 ── */
function showCard(p) {
  const tx = T.tour[p.id] || {};
  const d = fmtDate(p.date);
  const past = p.date < today;
  return `<a class="show reveal ${past ? "is-past" : "is-upcoming"}" href="${href("program.html", p.id)}">
    <div class="show-kv"><img src="${p.img}" alt="${esc(tx.title)} ${esc(p.en)}" loading="lazy">
      <span class="show-tag">${past ? t("past") : t("ticket")}</span>${p.nfc ? '<span class="show-nfc">NFC</span>' : ""}</div>
    <div class="show-body">
      <div class="show-date"><b>${d.day}</b><span>${d.mon} ${d.year}</span></div>
      <div class="show-title">${esc(tx.title)}<small>${esc(p.en)}</small></div>
      <div class="show-meta"><strong>${esc(tx.guest)}</strong>${esc(tx.venue)}・${esc(tx.city)}</div>
      <p class="show-line">「${esc(tx.line)}」</p>
      <span class="show-cta">${t("buy_now")}</span>
    </div>
  </a>`;
}
function artistCard(a) {
  const tx = T.artists[a.id] || {};
  return `<a class="artist reveal" href="${href("artist.html", a.id)}">
    <img src="${a.img}" alt="${esc(tx.name)}" loading="lazy">
    <div class="artist-info"><span>${esc(tx.from)}</span><h3>${esc(a.en)}</h3><p>${esc(tx.name)}・${esc(tx.role)}</p></div>
  </a>`;
}
function newsCard(n) {
  return `<a class="post reveal" href="${href("news.html", n.id)}">
    <div class="post-img"><img src="${n.img}" alt="" loading="lazy"></div>
    <time>${n.date}</time><h3>${esc(T.news[n.id]?.title)}</h3>
  </a>`;
}
function videoCard(v) {
  return `<button class="vcard reveal" type="button" data-yt="${v.id || v}">
    <div class="vcard-img"><img src="img/yt/${v.id || v}.jpg" alt="" loading="lazy"><span class="vcard-play"></span></div>
    ${v.title ? `<h3>${esc(v.title)}</h3><p>${esc(v.by)}</p>` : ""}
  </button>`;
}

/* ── 把 data-h="nfc.title" 之類的標記填入文字（\n 轉換行） ── */
function fillText(root = document) {
  $$("[data-h]", root).forEach((el) => {
    const v = el.dataset.h.split(".").reduce((o, k) => o?.[k], T);
    if (v != null) el.innerHTML = br(v);
  });
}

/* ── 進場動畫 ── */
function observeReveal() {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal:not(.is-in)").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 0.08 + "s"; io.observe(el); });
}

// 各頁呼叫：await boot(); 之後即可使用 T / t()
async function boot() {
  T = await load("site.json");
  renderChrome();
  fillText();
  document.title = document.title; // 由各頁覆寫
  return T;
}
