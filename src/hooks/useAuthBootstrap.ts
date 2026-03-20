import { useEffect } from "react";
import { getCurrentUser } from "@/api/auth/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function useAuthBootstrap() {
    const token = useAuthStore((s) => s.token);
    const setUser = useAuthStore((s) => s.setUser);
    const logout = useAuthStore((s) => s.logout);

    useEffect(() => {
        if (!token) return;

        let isActive = true;

        getCurrentUser()
            .then((data) => {
                if (!isActive) return;
                setUser({
                    id: data.id,
                    email: data.email,
                    full_name: data.full_name,
                    profile_image_url: data.profile_image_url,
                });
            })
            .catch((err) => {
                if (!isActive) return;
                console.warn("Failed to load current user", err);
                logout();
            });

        return () => {
            isActive = false;
        };
    }, [token, setUser]);
}
