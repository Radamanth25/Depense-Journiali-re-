/**
 * 📱 Service Worker - Budget Pixel v3.0.0
 * Network First Strategy (Privilégie le contenu frais)
 */

const CACHE_NAME = 'budget-pixel-v3.1.0';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    '/sw.js'
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
// 🌐 FETCH - CACHE FIRST STRATEGY
// ============================================

self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retourner du cache si disponible
                if (response) {
                    console.log('✅ Cache:', event.request.url);
                    return response;
                }

                // Sinon, récupérer du réseau
                return fetch(event.request)
                    .then((response) => {
                        // Vérifier la réponse
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Cloner et mettre en cache
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        console.warn('⚠️ Mode offline:', event.request.url);
                        return new Response('Mode offline - Contenu non disponible', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

console.log('✅ Service Worker Budget Pixel v3.0.0 prêt');