/* Ommi Sissi service worker.
 *
 * Strategy:
 *  - /_next/static (content-hashed, immutable) → cache-first
 *  - Other same-origin static assets (brand SVGs, icons, photos) →
 *    stale-while-revalidate: serve the cache instantly, refresh it in the
 *    background so asset updates propagate by the next visit
 *  - Page navigations → network-first, offline fallback page when unreachable
 *  - Everything else (Supabase API, auth, server actions) → network only,
 *    never cached: booking and auth data must always be fresh.
 *
 * Bump CACHE_VERSION when cached assets change in place — activation deletes
 * every older cache.
 */
const CACHE_VERSION = "ommi-sissi-v2";
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

    // Content-hashed build assets never change under the same URL: cache-first
    if (url.pathname.startsWith("/_next/static/")) {
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
        return;
    }

    // Mutable same-origin statics (logos, icons, photos): serve the cache
    // instantly but refresh it in the background (stale-while-revalidate)
    if (STATIC_DESTINATIONS.has(request.destination)) {
        event.respondWith(
            caches.open(CACHE_VERSION).then((cache) =>
                cache.match(request).then((cached) => {
                    const refresh = fetch(request)
                        .then((response) => {
                            if (response.ok) cache.put(request, response.clone());
                            return response;
                        })
                        .catch(() => cached ?? Response.error());
                    return cached ?? refresh;
                })
            )
        );
    }
    // Everything else falls through to the network untouched.
});
