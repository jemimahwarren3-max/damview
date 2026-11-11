// Minimal service worker so the staff admin area qualifies as an installable
// app ("Add to Home Screen" / desktop install). No offline caching - just a
// pass-through fetch handler, which is part of what browsers check before
// allowing an install prompt.
self.addEventListener("fetch", () => {});
