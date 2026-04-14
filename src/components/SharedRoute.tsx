import { Navigate, Outlet, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SharedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const accessMode = useAuthStore((s) => s.accessMode);
    const sharedProjectId = useAuthStore((s) => s.sharedProjectId);
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { projectId } = useParams();
    const marketplaceProjectId = searchParams.get("projectId");
    const routeProjectId = projectId ?? marketplaceProjectId;

    if (!isAuthenticated || accessMode !== "shared") {
        return <Navigate to="/login" replace />;
    }

    if (sharedProjectId && routeProjectId && sharedProjectId !== routeProjectId) {
        if (location.pathname === "/shared/marketplace") {
            return <Navigate to={`/shared/marketplace?projectId=${encodeURIComponent(sharedProjectId)}`} replace />;
        }
        return <Navigate to={`/shared/projects/${sharedProjectId}`} replace />;
    }

    if (location.pathname === "/shared/marketplace" && !marketplaceProjectId && sharedProjectId) {
        return <Navigate to={`/shared/marketplace?projectId=${encodeURIComponent(sharedProjectId)}`} replace />;
    }

    return <Outlet />;
}
