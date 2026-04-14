import { Navigate, Outlet } from "react-router-dom";
import SharedSessionExit from "@/components/SharedSessionExit";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Wraps routes that should only be accessible by guests (non-authenticated users).
 * Redirects authenticated users to the dashboard.
 */
export default function GuestRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const accessMode = useAuthStore((s) => s.accessMode);

    if (accessMode === "shared") {
        return <SharedSessionExit />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
