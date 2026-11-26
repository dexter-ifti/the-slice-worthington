const BUILD_ID = new URL(self.location.href).searchParams.get("v") || "transition";
const CACHE_NAME = `the-slice-${BUILD_ID}`;
const MAX_ENTRIES = 64;
const ASSET_DESTINATIONS = new Set(["script", "style", "image", "font"]);
let cacheWrites = Promise.resolve();

async function remember(request, response) {
  if (!response.ok || response.type !== "basic" || response.redirected || response.status === 206) {
    return;
  }
  if (/(?:^|,)\s*(?:no-store|private)\b/i.test(response.headers.get("Cache-Control") || "")) {
    return;
  }

  const copy = response.clone();
  cacheWrites = cacheWrites
    .then(async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, copy);
      const keys = await cache.keys();
      const expired = keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES));
      await Promise.all(expired.map((key) => cache.delete(key)));
    })
    .catch(() => {
      // Storage failures must not prevent a valid network response.
    });
  await cacheWrites;
}

async function fetchAndRemember(request) {
  const response = await fetch(request);
  await remember(request, response);
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    fetchAndRemember(new Request(new URL("/", self.location.origin)))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("the-slice-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.search ||
    request.headers.has("Authorization") ||
    request.headers.has("Range") ||
    request.cache === "no-store"
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetchAndRemember(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) ?? (await cache.match("/")) ?? Response.error();
      }),
    );
  } else if (ASSET_DESTINATIONS.has(request.destination)) {
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.match(request))
        .catch(() => undefined)
        .then((cached) => cached ?? fetchAndRemember(request)),
    );
  }
});
