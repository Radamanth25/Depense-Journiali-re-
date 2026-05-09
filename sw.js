/**
 * 📱 Service Worker - Suivi des Dépenses
 * Permet le fonctionnement offline avec cache first strategy
 */

const CACHE_NAME = 'depenses-v2.0.0';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    '/sw.js'
];

// ============================================
// 📦 INSTALLATION DU SERVICE WORKER
// ============================================

self.addEventListener('install', (event) => {
    console.log('📦 Installation du Service Worker...');
    
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
// 🔄 ACTIVATION DU SERVICE WORKER
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
// 🌐 STRATÉGIE DE FETCH
// ============================================

/**
 * Cache First, Network Fallback
 * - Essaie d'abord le cache
 * - Si non disponible, récupère du réseau
 * - Ajoute la réponse au cache
 */
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
                    console.log('✅ Réponse du cache:', event.request.url);
                    return response;
                }

                // Sinon, récupérer du réseau
                return fetch(event.request)
                    .then((response) => {
                        // Vérifier si la réponse est valide
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Cloner la réponse
                        const responseToCache = response.clone();

                        // Ajouter au cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Offline fallback
                        console.warn('⚠️ Mode offline - URL non disponible:', event.request.url);
                        return new Response('Offline - Contenu non disponible', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

console.log('✅ Service Worker prêt - Suivi des Dépenses v2.0.0');
