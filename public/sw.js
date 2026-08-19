/* Foodie service worker.
 *
 * Strategy:
 *  - Static assets (images, fonts, /_next/static) → cache-first
 *  - Page navigations → network-first, offline fallback page when unreachable
 *  - Everything else (Supabase API, auth, server actions) → network only,
 *    never cached: booking and auth data must always be fresh.
 */
const CACHE_VERSION = "foodie-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll([OFFLINE_URL])).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

const STATIC_DESTINATIONS = new Set(["image", "font", "style", "script"]);

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Never touch cross-origin requests (Supabase API, Google Fonts fetches
    // are handled by the browser's HTTP cache).
    if (url.origin !== self.location.origin) return;

    // Page navigations: network first, offline page as fallback
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error())
            )
        );
        return;
    }

    // Same-origin static assets: cache first, then network (and store)
    if (STATIC_DESTINATIONS.has(request.destination) || url.pathname.startsWith("/_next/static/")) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ??
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const copy = response.clone();
                            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
                        }
                        return response;
                    })
            )
        );
    }
    // Everything else falls through to the network untouched.
});
