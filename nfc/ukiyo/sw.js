// 版本號：內容有更新時 +1，舊快取會被清掉
const CACHE = 'ukiyo-v10';

const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'data.js',
  'img/hero.jpg',
  'img/title.png',
  'img/logo.png',
  'img/ensemble.jpg',
  'img/conductor.jpg',
  'img/chen.jpg',
  'img/host1.jpg',
  'img/host3.jpg',
  'img/collection.jpg',
  'img/sponsors.png',
  'img/tagline.png',
  ...Array.from({ length: 12 }, (_, i) =>
    'img/card' + String(i + 1).padStart(2, '0') + '.jpg'),
  'img/card-back.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 頁面導覽（重新整理、輸入網址）一律直接回快取的頁面殼。
  // ignoreVary：代理（如 Cloudflare）會加 Vary 標頭，Safari 重新整理時
  // 請求標頭與快取當下不一致會讓比對落空，離線就變成載入失敗。
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('index.html', { ignoreVary: true })
        .then(hit => hit || fetch(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true, ignoreVary: true })
      .then(hit => hit || fetch(e.request).then(resp => {
        // 快取自癒：未命中改抓網路成功後，回填進現行快取
        // （涵蓋版本切換空窗期與任何漏網資源，之後離線也拿得到）
        if (resp.ok && e.request.method === 'GET' && new URL(e.request.url).origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }))
  );
});
