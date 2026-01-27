// Service Worker for Offline Support and Caching
// Handles static asset caching and background sync for research data

const CACHE_NAME = 'gapminer-cache-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/main.tsx',
    '/src/App.tsx',
    '/src/index.css',
    '/favicon.ico',
];

const sw = (self as unknown) as any;

// Install event: Cache core assets
sw.addEventListener('install', (event: any) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching core assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    sw.skipWaiting();
});

// Activate event: Clean up old caches
sw.addEventListener('activate', (event: any) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    sw.clients.claim();
});

// Fetch event: Network-first falling back to cache
sw.addEventListener('fetch', (event: any) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                // Cache API responses optionally or static assets
                if (event.request.url.includes('/assets/')) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        })
    );
});

// Background Sync: For comments or analysis queued while offline
sw.addEventListener('sync', (event: any) => {
    if (event.tag === 'sync-comments') {
        event.waitUntil(syncComments());
    }
});

async function syncComments() {
    console.log('[ServiceWorker] Syncing queued comments');
    // Logic to read from IndexedDB and send to Firestore
}

// Push Notifications: Handle incoming background messages
sw.addEventListener('push', (event: any) => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        data: {
            url: data.url
        }
    };
    event.waitUntil(
        sw.registration.showNotification(data.title, options)
    );
});

export { }; // Make it a module
