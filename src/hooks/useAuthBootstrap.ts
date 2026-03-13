import { useEffect } from "react";
import { getCurrentUser } from "@/api/auth/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function useAuthBootstrap() {
    const token = useAuthStore((s) => s.token);
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        if (!token) return;

        let isActive = true;

        getCurrentUser()
            .then((data) => {
                if (!isActive) return;
                setUser({ id: data.id, email: data.email, full_name: data.full_name });
            })
            .catch((err) => {
                if (!isActive) return;
                console.warn("Failed to load current user", err);
            });

        return () => {
            isActive = false;
        };
    }, [token, setUser]);
}
