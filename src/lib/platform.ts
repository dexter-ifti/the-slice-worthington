import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.isNativePlatform();
}

export function getPlatform(): "android" | "ios" | "web" {
  if (typeof window === "undefined") return "web";
  return Capacitor.getPlatform() as "android" | "ios" | "web";
}

export async function openExternalUrl(url: string, target = "_blank"): Promise<void> {
  if (isNativePlatform()) {
    try {
      await Browser.open({
        url,
        presentationStyle: "popover",
        toolbarColor: "#000000",
      });
      return;
    } catch (error) {
      console.warn("Capacitor Browser failed, falling back to window.open", error);
    }
  }

  if (typeof window !== "undefined") {
    window.open(url, target, "noopener,noreferrer");
  }
}

export function setupNativeListeners(onNavigate?: (path: string) => void): () => void {
  if (!isNativePlatform()) return () => {};

  void StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  void StatusBar.setBackgroundColor({ color: "#000000" }).catch(() => {});
  void SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});

  const backHandlerPromise = App.addListener("backButton", ({ canGoBack }) => {
    if (typeof window === "undefined") return;

    const isRoot = window.location.pathname === "/" || window.location.pathname === "";
    if (!isRoot && canGoBack) {
      window.history.back();
    } else {
      void App.exitApp();
    }
  });

  const appUrlPromise = App.addListener("appUrlOpen", (data) => {
    try {
      const url = new URL(data.url);
      const path = url.pathname + url.search + url.hash;
      if (path) onNavigate?.(path);
    } catch {
      const slug = data.url.split("://")[1];
      if (slug) onNavigate?.(`/${slug.replace(/^\/+/, "")}`);
    }
  });

  return () => {
    void backHandlerPromise.then((handle) => handle.remove());
    void appUrlPromise.then((handle) => handle.remove());
  };
}
