var CACHE = 'el-papacito-v3';
var ASSETS = [
  '/',
  '/index.html',
  '/sucursal.html',
  '/styles.css',
  '/script.js',
  '/assets/logo.png',
  '/assets/logo.mp4',
  '/assets/negociador.mp4',
  '/manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request);
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })
      );
    })
  );
});
