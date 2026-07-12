"use client";

import { useEffect } from "react";

/**
 * Suppresses unhandled errors thrown by browser extension scripts
 * (MetaMask, etc.) that have nothing to do with our app.
 * These errors originate from chrome-extension:// URLs.
 */
export function ExtensionErrorSuppressor() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const src = event.filename ?? "";
      if (src.startsWith("chrome-extension://") || src.startsWith("moz-extension://")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason ?? "");
      // Suppress MetaMask / extension connection errors
      if (
        reason.includes("MetaMask") ||
        reason.includes("Failed to connect") ||
        reason.includes("chrome-extension")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);
  return null;
}
