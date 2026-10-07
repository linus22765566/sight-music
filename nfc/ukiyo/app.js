// ---------- 分頁切換（含淡出淡入過場） ----------
const tabs = document.querySelectorAll('.tab');
let switching = false;

function switchTo(name) {
  const target = document.getElementById('page-' + name);
  const cur = document.querySelector('.page.active');
  if (cur === target || switching) return;
  switching = true;
  // 回到 TOUCH 分頁時重置輪播狀態：display:none 會把捲動位置歸零，
  // 互動留下的暫停計時器也一併清掉，確保每次進來都恢復自動輪播
  if (name === 'touch') carousels.forEach(c => { clearTimeout(c.idleTimer); c.autoScroll = true; c.pos = 0; });
  tabs.forEach(t => t.classList.toggle('active', t.dataset.page === name));
  cur.classList.add('leaving');
  setTimeout(() => {
    cur.classList.remove('leaving', 'active');
    target.classList.add('active');
    window.scrollTo(0, 0);
    if (name === 'home') sizeSlider();   // 回首頁時重算 slider 高度（分頁隱藏期間可能轉向/改變視窗）
    switching = false;
  }, 240);
}
tabs.forEach(tab => tab.addEventListener('click', () => switchTo(tab.dataset.page)));

document.getElementById('brand').addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- 演出者 slider 圓點 ----------
const slider = document.getElementById('artist-slider');
const slides = slider.querySelectorAll('.slide');
const dotsBox = document.getElementById('artist-dots');
slides.forEach(() => dotsBox.appendChild(document.createElement('i')));
const dots = dotsBox.querySelectorAll('i');

// 各演出者介紹長度不一，垂直捲動改在每張 slide 內部進行：
// slider 固定為視窗剩餘高度（扣掉 sticky 導覽與圓點列），
// 橫滑到任何一位都必定從該位的最上方開始，頁面本身不需回捲
function sizeSlider() {
  const fixed = document.getElementById('topbar').offsetHeight +
                document.getElementById('tabs').offsetHeight;
  const above = dotsBox.offsetHeight + slider.previousElementSibling.offsetHeight; // 圓點 + 滑動提示
  slider.style.height = Math.max(320, window.innerHeight - fixed - above) + 'px';
}
window.addEventListener('resize', () => {
  if (document.getElementById('page-home').classList.contains('active')) sizeSlider();
});
sizeSlider();

function curSlideIdx() { return Math.round(slider.scrollLeft / slider.clientWidth); }
function updateDots() {
  const i = curSlideIdx();
  dots.forEach((d, k) => d.classList.toggle('on', k === i));
}
// 橫滑停定後把其他 slide 的內部捲動歸零：之後再滑到任何一位都是從頂部開始
let settleTimer;
slider.addEventListener('scroll', () => {
  updateDots();
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    const i = curSlideIdx();
    slides.forEach((s, k) => { if (k !== i) s.scrollTop = 0; });
  }, 150);
}, { passive: true });
updateDots();

// ---------- 曲目解析：翻書 ----------
// 頁面序列：曲目1..3、中場休息、曲目4..6
const bookPages = [];
PROGRAM.program.forEach(piece => {
  bookPages.push({ type: 'piece', piece });
  if (piece.no === PROGRAM.intermissionAfter) bookPages.push({ type: 'intermission' });
});

let pageIdx = 0;
const content = document.getElementById('book-content');
const pos = document.getElementById('book-pos');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fillPage() {
  const pg = bookPages[pageIdx];
  content.classList.remove('intermission');
  if (pg.type === 'intermission') {
    content.classList.add('intermission');
    content.innerHTML = '<div>中場休息</div>';
    pos.textContent = '';
  } else {
    const p = pg.piece;
    const perf = [p.performers.ensemble,
                  'Conductor / ' + p.performers.conductor,
                  p.performers.extra || null]
                 .filter(Boolean).join('　');
    content.innerHTML =
      '<h3>' + esc(p.title) + '</h3>' +
      '<div class="composer">' + esc(p.composer) + '</div>' +
      '<div class="performers">' + esc(perf) + '</div>' +
      p.paragraphs.map(t => '<p>' + esc(t) + '</p>').join('');
    pos.textContent = p.no + ' / ' + PROGRAM.program.length;
  }
}

const FLIP_CLASSES = ['flip-out-next', 'flip-in-next', 'flip-out-prev', 'flip-in-prev'];
let flipping = false;

function renderPage(dir) {
  if (!dir) { fillPage(); return; }
  // 翻書效果：先往一側轉出，換內容後從另一側轉回
  flipping = true;
  const out = dir > 0 ? 'flip-out-next' : 'flip-out-prev';
  const back = dir > 0 ? 'flip-in-next' : 'flip-in-prev';
  content.classList.remove(...FLIP_CLASSES);
  content.classList.add(out);
  setTimeout(() => {
    fillPage();
    content.closest('.book').scrollIntoView();
    content.classList.remove(out);
    content.classList.add(back);
    setTimeout(() => { content.classList.remove(back); flipping = false; }, 240);
  }, 180);
}

function turn(dir) {
  if (flipping) return;
  const next = Math.min(bookPages.length - 1, Math.max(0, pageIdx + dir));
  if (next === pageIdx) return;
  pageIdx = next;
  renderPage(dir);
}
document.getElementById('book-prev').addEventListener('click', () => turn(-1));
document.getElementById('book-next').addEventListener('click', () => turn(1));

// 左右滑動也可翻頁
const book = document.getElementById('book');
let swipeX = 0, swipeY = 0;
book.addEventListener('touchstart', e => {
  swipeX = e.touches[0].clientX;
  swipeY = e.touches[0].clientY;
}, { passive: true });
book.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - swipeX;
  const dy = e.changedTouches[0].clientY - swipeY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) turn(dx < 0 ? 1 : -1);
}, { passive: true });

// 字級調整（客戶要求的閱讀放大功能）
let bookFont = 15;
function setFont(d) {
  bookFont = Math.min(22, Math.max(13, bookFont + d));
  document.documentElement.style.setProperty('--book-font', bookFont + 'px');
}
document.getElementById('font-minus').addEventListener('click', () => setFont(-1));
document.getElementById('font-plus').addEventListener('click', () => setFont(1));

renderPage();

// ---------- 卡片 3D 檢視器：點擊彈出，拖曳翻面 ----------
const viewer = document.getElementById('card-viewer');
const card3d = document.getElementById('card3d');
const faceFront = document.getElementById('face-front');
let angle = 0, dragging = false, lastX = 0, lastY = 0, tiltX = 0;
let originDx = 0, originDy = 0, originScale = 1;   // 記住飛入起點，收合時原路飛回去

function applyRotation() {
  card3d.style.transform = 'rotateY(' + angle + 'deg) rotateX(' + tiltX + 'deg)';
}

function openCardViewer(img) {
  clearTimeout(closeTimer);   // 若上一張還在收合中，取消它的「藏起來」排程
  closing = false;
  const first = img.getBoundingClientRect();   // 被點卡片的原始位置
  faceFront.src = img.src;
  angle = 0; tiltX = 0;
  viewer.hidden = false;

  // FLIP：先量出置中放大後的目標位置，再把卡片瞬移縮回原位，然後放行動畫飛過去（帶一圈滾動翻轉）
  card3d.style.transition = 'none';
  applyRotation();
  const last = card3d.getBoundingClientRect();
  originDx = (first.left + first.width / 2) - (last.left + last.width / 2);
  originDy = (first.top + first.height / 2) - (last.top + last.height / 2);
  originScale = first.width / last.width;
  // 起點/終點用同一組 transform 函式（順序、個數一致），瀏覽器才會逐項插值、
  // 讓 rotateY(-360→0) 真的轉滿一圈，而不是被矩陣分解成「沒有旋轉」
  card3d.style.transform =
    'translate(' + originDx + 'px,' + originDy + 'px) scale(' + originScale + ') rotateY(-360deg) rotateX(0deg)';
  void card3d.offsetWidth;   // 強制 reflow，讓下一步的 transform 產生過渡
  card3d.style.transition = 'transform 0.62s cubic-bezier(0.2,0.8,0.3,1)';
  card3d.style.transform = 'translate(0px,0px) scale(1) rotateY(0deg) rotateX(0deg)';
}

let closeTimer = null, closing = false;
function closeViewer() {
  if (viewer.hidden || closing) return;
  closing = true;
  // 先把目前角度正規化到 0~359 度，並改寫成與目標相同的 transform 函式組合
  // （不觸發過渡）；函式清單一致瀏覽器才會逐項插值，旋轉才不會被矩陣分解吃掉
  const norm = ((angle % 360) + 360) % 360;
  card3d.style.transition = 'none';
  card3d.style.transform =
    'translate(0px,0px) scale(1) rotateY(' + norm + 'deg) rotateX(' + tiltX + 'deg)';
  void card3d.offsetWidth;
  // 與開啟完全對稱：固定倒轉到 -360（無論當下正反面，至少轉滿一圈、以正面落地）
  card3d.style.transition = 'transform 0.62s cubic-bezier(0.2,0.8,0.3,1)';
  card3d.style.transform =
    'translate(' + originDx + 'px,' + originDy + 'px) scale(' + originScale + ') rotateY(-360deg) rotateX(0deg)';
  closeTimer = setTimeout(() => { viewer.hidden = true; closing = false; }, 620);
}
document.getElementById('viewer-close').addEventListener('click', closeViewer);
// 專用的全螢幕背景層接收點擊 → 關閉（卡片拖曳被 pointer capture 擋住，不會誤觸）
document.getElementById('viewer-backdrop').addEventListener('click', closeViewer);

// ---------- TOUCH 卡片輪播（兩排）：自動推進 + 手動滑動，點擊開啟 3D 檢視 ----------
const CAROUSELS = [
  { trackId: 'car-track-1', cards: [1, 2, 3, 4, 5, 6, 7, 8, 9] },  // 精彩回顧（歷代場次）
  { trackId: 'car-track-2', cards: [10, 11, 12] },                 // 本場系列音樂會
];

const carousels = CAROUSELS.map(({ trackId, cards }) => {
  const track = document.getElementById(trackId);
  // 內容放兩份，位移 -50% 時剛好無縫接回起點
  for (let copy = 0; copy < 2; copy++) {
    cards.forEach(n => {
      const img = document.createElement('img');
      img.loading = 'lazy';   // 卡片在 TOUCH 分頁才需要，延後載入讓首頁更快
      img.src = 'img/card' + String(n).padStart(2, '0') + '.jpg';
      img.alt = 'NFC 卡片 ' + n;
      track.appendChild(img);
    });
  }
  return { track, car: track.closest('.carousel'), autoScroll: true, idleTimer: null, dragged: false, pos: 0 };
});

function pauseAuto(c) {
  c.autoScroll = false;
  clearTimeout(c.idleTimer);
  c.idleTimer = setTimeout(() => { c.autoScroll = true; }, 2500);
}

carousels.forEach(c => {
  c.car.addEventListener('touchstart', () => pauseAuto(c), { passive: true });
  c.car.addEventListener('wheel', () => pauseAuto(c), { passive: true });

  // 桌機滑鼠按住拖曳（觸控交給原生捲動）
  let down = false, startX = 0, startLeft = 0;
  c.car.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = true; c.dragged = false;
    startX = e.clientX; startLeft = c.car.scrollLeft;
    pauseAuto(c);
  });
  c.car.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) c.dragged = true;
    c.car.scrollLeft = startLeft - dx;
    pauseAuto(c);
  });
  ['pointerup', 'pointerleave'].forEach(t =>
    c.car.addEventListener(t, () => { down = false; }));

  c.track.addEventListener('click', e => {
    if (c.dragged) { c.dragged = false; return; }   // 拖曳後的點擊不開檢視器
    const img = e.target.closest('img');
    if (img) openCardViewer(img);
  });
});

(function autoLoop() {
  carousels.forEach(c => {
    const half = c.track.scrollWidth / 2;   // 內容放兩份，半寬 = 一份的寬度
    if (half <= 0) return;                   // 分頁隱藏時 scrollWidth 為 0，略過
    if (c.autoScroll) {
      // 用浮點累加器推進，避開瀏覽器把 scrollLeft 整數化造成的「加了等於沒加」凍結
      c.pos += 0.5;
      if (c.pos >= half) c.pos -= half;      // 越過一份寬度就折返，因兩份內容相同故無縫
      c.car.scrollLeft = c.pos;
    } else {
      c.pos = c.car.scrollLeft;              // 使用者手動捲動中：順應使用者，只記住位置
    }
  });
  requestAnimationFrame(autoLoop);
})();

card3d.addEventListener('pointerdown', e => {
  dragging = true;
  lastX = e.clientX; lastY = e.clientY;
  card3d.style.transition = 'none';
  card3d.setPointerCapture(e.pointerId);
});
card3d.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  angle += dx * 0.7;                                   // 水平拖曳 → 左右翻面
  tiltX = Math.max(-22, Math.min(22, tiltX - dy * 0.4)); // 垂直拖曳 → 輕微上下傾斜
  lastX = e.clientX; lastY = e.clientY;
  applyRotation();
});
function endDrag() {
  if (!dragging) return;
  dragging = false;
  // 放開後平滑回正：Y 貼齊最近的正/背面，X 回 0
  card3d.style.transition = 'transform 0.5s cubic-bezier(0.2,0.8,0.3,1)';
  angle = Math.round(angle / 180) * 180;
  tiltX = 0;
  applyRotation();
}
card3d.addEventListener('pointerup', endDrag);
card3d.addEventListener('pointercancel', endDrag);

// ---------- 首頁：捲動離開 hero 後浮現「回到頂端」按鈕 ----------
const fab = document.getElementById('back-to-top');
const pageHome = document.getElementById('page-home');
window.addEventListener('scroll', () => {
  fab.classList.toggle('show', pageHome.classList.contains('active') && window.scrollY > 240);
}, { passive: true });
fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
  // 新版快取安裝完成接手後自動換新（首次安裝不動作）：
  // 剛開頁 4 秒內直接刷新；已在瀏覽中則等頁面退到背景時再默默換，避免眼前閃白
  const hadController = !!navigator.serviceWorker.controller;
  let refreshed = false;
  const swapToNew = () => {
    if (refreshed) return;
    refreshed = true;
    location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    if (performance.now() < 4000) { swapToNew(); return; }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') swapToNew();
    });
  });
  navigator.serviceWorker.register('sw.js');
}
