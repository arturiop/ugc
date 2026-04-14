import { useEffect } from "react";
import { getCurrentUser } from "@/api/auth/auth";
import { HttpError } from "@/api/httpClient";
import { queryClient } from "@/queryClient";
import { useAuthStore } from "@/stores/useAuthStore";

const RETRY_DELAY_MS = 5000;

export default function useAuthBootstrap() {
    const token = useAuthStore((s) => s.token);
    const accessMode = useAuthStore((s) => s.accessMode);
    const setUser = useAuthStore((s) => s.setUser);
    const logout = useAuthStore((s) => s.logout);

    useEffect(() => {
        if (!token || accessMode !== "user") return;

        let isActive = true;
        let retryTimer: number | null = null;
        let inFlight = false;
        let sawTransientFailure = false;

        const clearRetryTimer = () => {
            if (retryTimer) {
                window.clearTimeout(retryTimer);
                retryTimer = null;
            }
        };

        const scheduleRetry = () => {
            clearRetryTimer();
            retryTimer = window.setTimeout(() => {
                if (!isActive) return;
                void loadCurrentUser();
            }, RETRY_DELAY_MS);
        };

        const loadCurrentUser = async () => {
            if (inFlight) return;
            inFlight = true;

            try {
                const data = await getCurrentUser();
                if (!isActive) return;
                clearRetryTimer();
                setUser({
                    id: data.id,
                    email: data.email,
                    full_name: data.full_name,
                    profile_image_url: data.profile_image_url,
                });

                if (sawTransientFailure) {
                    sawTransientFailure = false;
                    void queryClient.invalidateQueries();
                }
            } catch (err) {
                if (!isActive) return;
                console.warn("Failed to load current user", err);

                if (err instanceof HttpError) {
                    if ([401, 403, 404, 422].includes(err.status)) {
                        clearRetryTimer();
                        logout();
                        return;
                    }

                    if (err.status >= 500 || err.status === 408 || err.status === 429) {
                        sawTransientFailure = true;
                        scheduleRetry();
                        return;
                    }
                }

                sawTransientFailure = true;
                scheduleRetry();
            } finally {
                inFlight = false;
            }
        };

        const retryNow = () => {
            if (!isActive) return;
            clearRetryTimer();
            void loadCurrentUser();
        };

        void loadCurrentUser();
        window.addEventListener("focus", retryNow);
        window.addEventListener("online", retryNow);

        return () => {
            isActive = false;
            clearRetryTimer();
            window.removeEventListener("focus", retryNow);
            window.removeEventListener("online", retryNow);
        };
    }, [token, accessMode, setUser, logout]);
}
