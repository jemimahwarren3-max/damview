const CACHE_VERSION = "damview-v1";
const STATIC_CACHE = "damview-static-v1";
const RUNTIME_CACHE = "damview-runtime-v1";

const PRECACHE_URLS = ["/admin/login"];

// Install: pre-cache admin shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (k) => k !== CACHE_VERSION && k !== STATIC_CACHE && k !== RUNTIME_CACHE
          )
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Notify all clients of online/offline status
function postToClients(msg) {
  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((c) => c.postMessage(msg));
  });
}

self.addEventListener("online", () => postToClients({ type: "STATUS", online: true }));
self.addEventListener("offline", () => postToClients({ type: "STATUS", online: false }));

// Fetch with timeout helper
function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET for caching (mutations go through sync queue)
  if (request.method !== "GET") return;

  // Static assets (/_next/static): cache-first (immutable)
  if (url.pathname.startsWith("/_next/static")) {
    e.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((resp) => {
              if (resp.ok) cache.put(request, resp.clone());
              return resp;
            })
        )
      )
    );
    return;
  }

  // Supabase auth endpoints: network-only (tokens must be fresh)
  if (url.pathname.includes("/auth/")) return;

  // Navigation (HTML pages): network-first, fall back to cached shell
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetchWithTimeout(request, 5000)
        .then((resp) => {
          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(request, resp.clone()));
          return resp;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match("/admin/login")
          )
        )
    );
    return;
  }

  // API / Server Action / Supabase data reads: network-first with cache fallback
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("supabase") ||
    request.headers.get("next-action")
  ) {
    e.respondWith(
      fetchWithTimeout(request, 5000)
        .then((resp) => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (images, fonts, etc.): stale-while-revalidate
  e.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((resp) => {
            if (resp.ok) cache.put(request, resp.clone());
            return resp;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});

// Background sync for queued mutations
self.addEventListener("sync", (e) => {
  if (e.tag === "damview-sync") {
    e.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: "TRIGGER_SYNC" }));
      })
    );
  }
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});
