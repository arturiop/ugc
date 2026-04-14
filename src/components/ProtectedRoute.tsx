import { Navigate, Outlet } from "react-router-dom";
import SharedSessionExit from "@/components/SharedSessionExit";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to the login page.
 */
export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const accessMode = useAuthStore((s) => s.accessMode);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (accessMode === "shared") {
        return <SharedSessionExit />;
    }

    return <Outlet />;
}
