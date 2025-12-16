"use client";

import { GlobalLoadingOverlay } from "./global-loading-overlay";
import { useLoadingPreferences } from "@/stores/loading-preferences-store";

/**
 * Wrapper del GlobalLoadingOverlay que lee las preferencias del store
 */
export function GlobalLoadingOverlayWrapper() {
  const preferences = useLoadingPreferences();

  return (
    <GlobalLoadingOverlay
      spinnerVariant={preferences.variant}
      spinnerSize={preferences.size}
      showDelay={preferences.showDelay}
    />
  );
}
