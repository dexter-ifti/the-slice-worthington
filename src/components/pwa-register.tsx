import { useEffect } from "react";
import { isNativePlatform } from "@/lib/platform";

declare const __SLICE_BUILD_ID__: string;

async function removeLegacyNativeWorker() {
  const registration = await navigator.serviceWorker.getRegistration("/");
  const workers = [registration?.active, registration?.waiting, registration?.installing];
  if (
    registration &&
    workers.some((worker) => worker && new URL(worker.scriptURL).pathname === "/sw.js")
  ) {
    await registration.unregister();
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith("the-slice-")).map((key) => caches.delete(key)),
    );
  }
}

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const worker = isNativePlatform()
      ? removeLegacyNativeWorker()
      : import.meta.env.PROD
        ? navigator.serviceWorker.register(`/sw.js?v=${__SLICE_BUILD_ID__}`, { scope: "/" })
        : undefined;
    void worker?.catch(() => {
      // Service worker support is optional.
    });
  }, []);

  return null;
}
