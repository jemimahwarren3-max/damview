"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener("statechange", () => {
          if (newSW.state === "installed" && navigator.serviceWorker.controller) {
            toast("App update available — refresh to update.", {
              duration: 8000,
              icon: "🔄",
            });
          }
        });
      });
    });
  }, []);

  return null;
}
