import { useEffect } from "react";

/** Registers the production service worker without affecting server rendering. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Service worker support is optional; the app remains fully usable without it.
    });
  }, []);

  return null;
}
