// Remove responses cached by the previous broad Supabase runtime-caching rule.
self.addEventListener('activate', event => {
  event.waitUntil(caches.delete('api-cache'));
});
