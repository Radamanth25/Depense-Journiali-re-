/**
 * 📱 Service Worker - Budget Pixel v3.0.0
 * Network First Strategy (Vrai Network First)
 */

const CACHE_NAME = 'budget-pixel-v3.2.0';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json'
];

// ============================================
// 📦 INSTALLATION
// ============================================

self.addEventListener('install', (event) => {
    console.log('📦 Installation du Service Worker Budget Pixel...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache ouvert:', CACHE_NAME);
                return cache.addAll(URLS_TO_CACHE)
                    .catch(err => console.warn('⚠️ Erreur lors du cache:', err));
            })
            .then(() => self.skipWaiting())
    );
});

// ============================================
// 🔄 ACTIVATION
// ============================================

self.addEventListener('activate', (event) => {
    console.log('🔄 Activation du Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ============================================
// 🌐 FETCH - NETWORK FIRST STRATEGY
// ============================================

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si on a du réseau, on met à jour le cache
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si pas de réseau, on cherche dans le cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    return new Response('Contenu indisponible hors-ligne', { status: 503 });
                });
            })
    );
});

console.log('✅ Service Worker Budget Pixel v3.0.0 prêt');