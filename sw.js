// sw.js — service worker buat X Growth OS (cache biar bisa offline)

const CACHE_NAME = 'xgrowth-os-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './journal.html',
  './uploader.html',
  './coach.html',
  './content.html',
  './lab.html',
  './goals.html',
  './css/style.css',
  './js/db.js',
  './js/nav.js',
  './js/app.js',
  './js/journal.js',
  './js/uploader.js',
  './js/coach.js',
  './js/content.js',
  './js/lab.js',
  './js/goals.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
