"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // L'installation en PWA reste possible sans service worker actif ;
      // on évite simplement le mode hors-ligne.
    });
  }, []);

  return null;
}
