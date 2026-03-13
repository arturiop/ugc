import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Wraps routes that should only be accessible by guests (non-authenticated users).
 * Redirects authenticated users to the dashboard.
 */
export default function GuestRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
