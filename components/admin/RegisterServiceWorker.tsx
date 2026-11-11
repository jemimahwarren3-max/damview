"use client";

import { useEffect } from "react";

/** Registers the admin-scoped service worker so staff can install this as an app. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => {
        // Installability is a nice-to-have, not critical - fail silently.
      });
    }
  }, []);

  return null;
}
