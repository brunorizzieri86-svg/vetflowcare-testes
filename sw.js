// VetFlowCare — Service Worker v9.80 — TESTES
// Estratégia: Network-First (busca atualização na rede; cache só responde offline)
// B&G Systems | Todos os direitos reservados

const CACHE = 'vfc-test-v9.80';

// 9.74: cadastro em tela única, sem fotos de animais — register-data-art.png e
// register-security-art.png não são mais usados nessa tela e saíram do pré-cache.
// ui-updates.css / ui-updates.js / access-reference.css saíram do pré-cache também:
// desde a 9.74 eles só existem embutidos (inline) dentro do próprio index.html
// (marcadores data-bundled) e nunca são buscados como arquivos separados pelo app.
// Mantê-los aqui faria o cache.addAll() abaixo falhar inteiro (404) em qualquer
// pacote que não inclua esses 3 arquivos soltos — o que quebraria a instalação
// do Service Worker (e o modo offline) silenciosamente para todo usuário.
const CORE_FILES = [
  './index.html',
  './manifest.json',
  './logo.jpg',
  './access-art.jpg',
  './vfc-mark.webp',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

// ── Instalação: pré-cacheia os arquivos essenciais ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

// ── Ativação: apaga caches de versões antigas ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('vfc-test-') && k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network-First ──
self.addEventListener('fetch', e => {
  // Ignora requisições não-GET e externas (GoatCounter, ViaCEP, etc.)
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Avisos sempre vêm da rede: nunca exibir campanha antiga do cache.
  if (url.pathname.endsWith('/avisos.json')) return;

  e.respondWith(
    fetch(e.request, {cache: 'no-cache'})
      .then(resp => {
        // Atualiza o cache com a resposta mais nova
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      })
      .catch(async () => (await caches.match(e.request)) || (e.request.mode === 'navigate' ? await caches.match('./index.html') : Response.error())) // offline: serve do cache
  );
});
