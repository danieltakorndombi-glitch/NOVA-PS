// Nova PSP v3 — service worker
// 1) Isolation cross-origin (COOP/COEP) : indispensable au moteur PSP (threads / SharedArrayBuffer).
// 2) Le moteur EmulatorJS est servi depuis ./engine/ (même domaine), téléchargé une fois puis gardé en cache.
const SHELL = 'nova-psp-shell-v10', ENGINE = 'nova-psp-engine';
const UP = 'https://cdn.emulatorjs.org/stable/data/';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

const iso = r => {
  if (!r || r.status === 0 || r.type === 'opaque') return r;
  const h = new Headers(r.headers);
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  h.set('Cross-Origin-Embedder-Policy', 'require-corp');
  h.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
};

self.addEventListener('install', e => e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(n => n !== SHELL && n !== ENGINE).map(n => caches.delete(n)))).then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET') return;
  const u = new URL(q.url);
  if (u.origin !== location.origin) return;
  const i = u.pathname.indexOf('/engine/');
  e.respondWith(i >= 0 ? engine(e, u.pathname.slice(i + 8)) : shell(q));
});

async function engine(e, path) {
  const key = UP + path, c = await caches.open(ENGINE);
  const hit = await c.match(key);
  if (hit) return iso(hit);
  let err;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(key, { mode: 'cors' });
      if (r.ok) { e.waitUntil(c.put(key, r.clone())); return iso(r); }
      err = r.status; if (r.status === 404) break;
    } catch (x) { err = String(x); }
    await new Promise(s => setTimeout(s, 700 * (i + 1)));
  }
  return new Response('Moteur indisponible : ' + err, { status: err === 404 ? 404 : 502 });
}

async function shell(q) {
  const c = await caches.open(SHELL);
  const hit = await c.match(q, { ignoreSearch: true });
  const net = fetch(q).then(r => { if (r && r.ok) c.put(q, r.clone()); return r; }).catch(() => null);
  if (hit) { net.catch(() => {}); return iso(hit); }
  const r = await net;
  if (r) return iso(r);
  if (q.mode === 'navigate') { const f = await c.match('./index.html'); if (f) return iso(f); }
  return Response.error();
}
