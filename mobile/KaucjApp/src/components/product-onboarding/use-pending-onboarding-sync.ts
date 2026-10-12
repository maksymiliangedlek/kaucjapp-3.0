import { useEffect } from "react";
import { AppState } from "react-native";
import { apiClient } from "@/src/api/api-client";
import { appStorage } from "@/src/auth/secure-storage";
import { useAuthStore } from "@/src/auth/auth-store";
import { AppRole } from "@/src/types/user";

/** Retries product-onboarding PATCH after an offline "continue" finish. */
export function usePendingProductOnboardingSync(enabled: boolean) {
  const patchUser = useAuthStore((state) => state.patchUser);

  useEffect(() => {
    if (!enabled) return;

    const flush = async () => {
      const pending = await appStorage.getPendingProductOnboardingSync();
      if (!pending) return;

      try {
        await apiClient.patch("/user/me", {
          ...(pending.appRole
            ? { appRole: pending.appRole as AppRole }
            : {}),
          productOnboardingCompleted: true,
        });
        await patchUser({
          ...(pending.appRole
            ? { appRole: pending.appRole as AppRole }
            : {}),
          productOnboardingCompleted: true,
        });
        await appStorage.clearPendingProductOnboardingSync();
      } catch {
        // Keep pending for the next online attempt.
      }
    };

    void flush();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void flush();
    });
    return () => sub.remove();
  }, [enabled, patchUser]);
}
