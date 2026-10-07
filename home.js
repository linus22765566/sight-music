/* ── 開場 Logo 動畫：播完或最多 4.5 秒後淡出 ── */
const intro = $("#intro");
let keepPlaying = () => {};
function endIntro() {
  if (intro.classList.contains("is-done")) return;
  intro.classList.add("is-done");
  document.body.classList.add("is-ready");
  keepPlaying();
}
try { if (sessionStorage.getItem("introSeen")) endIntro(); sessionStorage.setItem("introSeen", "1"); } catch (e) {}
$("video", intro).addEventListener("ended", endIntro);
$(".intro-skip", intro).addEventListener("click", endIntro);
setTimeout(endIntro, 4500);

$$("[data-split]").forEach((el) => {
  el.innerHTML = [...el.textContent].map((c, i) => `<span class="ch" style="transition-delay:${0.15 + i * 0.06}s">${c}</span>`).join("");
});

/* ── HERO 影片輪播（兩支 video 交叉淡入） ── */
const vids = $$(".stage-video");
const cap = $("#stageCaption");
let clip = 0, front = 0;
const loadClip = (v, i) => { v.src = S.heroClips[i].src; v.load(); };
loadClip(vids[0], 0);
loadClip(vids[1], 1);
cap.textContent = S.heroClips[0].caption;
vids.forEach((v) => v.addEventListener("timeupdate", () => {
  if (!v.classList.contains("is-on") || !v.duration || v.duration - v.currentTime > 1.2 || v.dataset.switching) return;
  v.dataset.switching = "1";
  const next = vids[1 - front];
  clip = (clip + 1) % S.heroClips.length;
  next.currentTime = 0;
  next.play().catch(() => {});
  next.classList.add("is-on");
  v.classList.remove("is-on");
  cap.textContent = S.heroClips[clip].caption;
  front = 1 - front;
  setTimeout(() => { delete v.dataset.switching; loadClip(v, (clip + 1) % S.heroClips.length); }, 1500);
}));
// 自動播放可能被中斷或延後，定時確認目前那支在播
keepPlaying = () => { const v = vids[front]; if (v.paused) v.play().catch(() => {}); };
vids[0].addEventListener("canplay", keepPlaying);
setInterval(keepPlaying, 1000);
keepPlaying();

/* ── 捲動：全螢幕影片縮成舞台窗 ── */
const hero = $("#hero"), stage = $("#stage");
const fades = $$(".hero-type");
function onScroll() {
  const r = hero.getBoundingClientRect();
  const prog = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  const ease = 1 - Math.pow(1 - Math.min(1, prog * 1.4), 3);
  stage.style.setProperty("--p", (1 - ease).toFixed(4));
  fades.forEach((f) => (f.style.opacity = String(1 - Math.min(1, prog * 2.5))));
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ── 內容 ── */
(async () => {
  await boot();
  const N = T.nfc;

  // NFC 販售區
  $("#nfcFeatures").innerHTML = N.features.map((f) => `<li><b>${f.k}</b><div><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></div></li>`).join("");
  $("#nfcMail").href = `mailto:${S.mail}?subject=${encodeURIComponent(N.mail_subject)}`;
  $("#nfcLine").href = S.line;
  mountCards($("#nfcWall"), S.nfcShowcase.map(([c, person]) => ({ src: `nfc/${c.replace("/", "/img/")}.jpg`, person })), S.nfcBack, N.try_hint);
  $("#nfcCases").innerHTML = S.tour.filter((p) => p.nfc).map((p) => `
    <a class="nfc-case" href="${href("program.html", p.id)}#nfc-cards">
      <img src="nfc/${p.id}/img/hero.jpg" alt="" loading="lazy">
      <span>${esc(T.tour[p.id].title)}<small>${esc(p.en)}</small></span>
    </a>`).join("");

  // 跑馬燈
  const mq = T.home.marquee.map((m) => `<span>${esc(m)}</span><em>✦</em>`).join("");
  $("#marquee").innerHTML = mq + mq;

  // 巡演：即將演出在前
  const up = S.tour.filter((p) => p.date >= today);
  const past = S.tour.filter((p) => p.date < today).reverse();
  $("#tourList").innerHTML = [...up, ...past].map(showCard).join("");

  $("#watchList").innerHTML = S.videos.map(videoCard).join("");
  $("#artistGrid").innerHTML = S.artists.map(artistCard).join("");
  $("#phases").innerHTML = T.phases.map((p, i) => `
    <li class="phase reveal">
      <div class="phase-img"><img src="${S.phases[i]}" alt="" loading="lazy"></div>
      <b>${p.year}</b><h3>${esc(p.name)}</h3><em>${esc(p.sub)}</em><p>${esc(p.text)}</p>
    </li>`).join("");
  $("#newsList").innerHTML = S.news.map(newsCard).join("");
  observeReveal();
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
