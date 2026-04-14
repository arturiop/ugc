import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SharedSessionExit() {
    const logout = useAuthStore((s) => s.logout);

    useEffect(() => {
        logout();
    }, [logout]);

    return <Navigate to="/login" replace />;
}
