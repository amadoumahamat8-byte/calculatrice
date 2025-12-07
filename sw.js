self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("calc-cache-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./styles.css",
        "./app.js",
        "./IMG_20251129_195914_768.webp",
        "./favicon-16x16.png",
        "./favicon-32x32.png",
        "./android-chrome-192x192.png",
        "./android-chrome-512x512.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
