import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { lazy, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useRoutes } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import SharedAppHeader from "@/components/SharedAppHeader";
import { exchangeShareToken } from "@/api/auth/auth";
import { Loadable } from "@/components/Loadable";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import SharedRoute from "@/components/SharedRoute";
import { useAuthStore } from "@/stores/useAuthStore";

const Page404 = Loadable(lazy(() => import("./Page404")));
const Hero = Loadable(lazy(() => import("./Hero")));
const ProjectPage = Loadable(lazy(() => import("./Project")));
const MarketplacePage = Loadable(lazy(() => import("./Marketplace")));
const EditorPage = Loadable(lazy(() => import("../editor")));
const Dashboard = Loadable(lazy(() => import("./Dashboard")));
const SettingsPage = Loadable(lazy(() => import("./Settings")));
const GlobalSettingsPage = Loadable(lazy(() => import("./settings/GlobalSettingsPage")));
const PromptSettingsPage = Loadable(lazy(() => import("./settings/PromptsPage")));
const ViralKnowledgePage = Loadable(lazy(() => import("./ViralKnowledge")));
const Login = Loadable(lazy(() => import("./Login")));
const Signup = Loadable(lazy(() => import("./Signup")));

const AppFrame = ({ header }: { header?: ReactNode }) => {
    const location = useLocation();
    const allowHeaderOverlap =
        location.pathname.startsWith("/marketplace") || location.pathname.startsWith("/shared/marketplace");

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minHeight: "100vh",
                bgcolor: "background.default",
                justifyContent: "center",
            }}>
            {header}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    pt: allowHeaderOverlap ? 0 : "56px",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

const PublicLayout = () => <Outlet />;

const AppLayout = () => <AppFrame header={<AppHeader />} />;

const SharedLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const setSharedAccess = useAuthStore((s) => s.setSharedAccess);
    const logout = useAuthStore((s) => s.logout);
    const [shareResolveState, setShareResolveState] = useState<"idle" | "resolving" | "failed">(() => {
        const params = new URLSearchParams(location.search);
        return location.pathname.startsWith("/shared/") && Boolean(params.get("s")) ? "resolving" : "idle";
    });
    const [shareResolveError, setShareResolveError] = useState<string | null>(null);
    const shareKey = useMemo(() => new URLSearchParams(location.search).get("s"), [location.search]);

    useEffect(() => {
        if (!location.pathname.startsWith("/shared/")) {
            setShareResolveState("idle");
            setShareResolveError(null);
            return;
        }

        if (!shareKey) {
            return;
        }

        let active = true;
        setShareResolveState("resolving");
        setShareResolveError(null);
        logout();

        const resolve = async () => {
            try {
                const resolved = await exchangeShareToken(shareKey);
                if (!active) return;
                setSharedAccess(resolved.access_token, resolved.project_id);
                const nextParams = new URLSearchParams(location.search);
                nextParams.delete("s");
                navigate(
                    {
                        pathname: location.pathname,
                        search: nextParams.toString() ? `?${nextParams.toString()}` : "",
                    },
                    { replace: true }
                );
                setShareResolveState("idle");
            } catch (error) {
                if (!active) return;
                setShareResolveError((error as Error).message || "Failed to open shared link.");
                setShareResolveState("failed");
            }
        };

        void resolve();
        return () => {
            active = false;
        };
    }, [location.pathname, location.search, navigate, logout, setSharedAccess, shareKey]);

    if (shareResolveState === "resolving") {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    minHeight: "100vh",
                    bgcolor: "background.default",
                }}
            >
                <SharedAppHeader />
                <Box sx={{ flex: 1, display: "grid", placeItems: "center", pt: "56px" }}>
                    <CircularProgress size={28} />
                </Box>
            </Box>
        );
    }

    if (shareResolveState === "failed") {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    minHeight: "100vh",
                    bgcolor: "background.default",
                }}
            >
                <SharedAppHeader />
                <Box sx={{ flex: 1, display: "grid", placeItems: "center", p: 3, pt: "calc(56px + 24px)" }}>
                    <Stack spacing={1.5} sx={{ textAlign: "center", maxWidth: 420 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Shared link unavailable
                        </Typography>
                        <Typography color="text.secondary">
                            {shareResolveError || "This share link is invalid or has expired."}
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        );
    }

    return <AppFrame header={<SharedAppHeader />} />;
};

const TokenResolverLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const setToken = useAuthStore((s) => s.setToken);
    const setSharedAccess = useAuthStore((s) => s.setSharedAccess);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sharedToken = params.get("token") || params.get("key");
        if (!sharedToken) return;

        const sharedProjectMatch = location.pathname.match(/^\/shared\/projects\/([^/?#]+)/);
        const sharedMarketplaceProjectId =
            location.pathname.startsWith("/shared/marketplace")
                ? location.pathname.match(/^\/shared\/marketplace\/([^/?#]+)/)?.[1] ?? params.get("projectId")
                : null;

        if (sharedProjectMatch) {
            setSharedAccess(sharedToken, decodeURIComponent(sharedProjectMatch[1]));
        } else if (sharedMarketplaceProjectId) {
            setSharedAccess(sharedToken, sharedMarketplaceProjectId);
        } else {
            setToken(sharedToken);
        }
        params.delete("token");
        params.delete("key");

        const nextSearch = params.toString();
        navigate(
            {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : "",
            },
            { replace: true }
        );
    }, [location.pathname, location.search, navigate, setSharedAccess, setToken]);

    return <Outlet />;
};

const router = [
    {
        element: <TokenResolverLayout />,
        children: [
            {
                element: <PublicLayout />,
                children: [
                    { index: true, element: <Hero /> },
                    {
                        element: <GuestRoute />,
                        children: [
                            { path: "login", element: <Login /> },
                            { path: "signup", element: <Signup /> },
                        ],
                    },
                ],
            },
            {
                element: <SharedLayout />,
                children: [
                    {
                        element: <SharedRoute />,
                        children: [
                            { path: "shared/projects/:projectId", element: <ProjectPage sharedMode /> },
                            { path: "shared/marketplace", element: <MarketplacePage /> },
                            { path: "shared/marketplace/:projectId", element: <MarketplacePage /> },
                        ],
                    },
                ],
            },
            {
                element: <AppLayout />,
                children: [
                    {
                        element: <ProtectedRoute />,
                        children: [
                            { path: "dashboard", element: <Dashboard /> },
                            { path: "marketplace", element: <MarketplacePage /> },
                            { path: "marketplace/:projectId", element: <MarketplacePage /> },
                            { path: "projects/:projectId", element: <ProjectPage /> },
                            { path: "editor", element: <EditorPage /> },
                            { path: "editor/:projectId", element: <EditorPage /> },
                            {
                                path: "settings",
                                element: <SettingsPage />,
                                children: [
                                    { index: true, element: <Navigate to="global" replace /> },
                                    { path: "global", element: <GlobalSettingsPage /> },
                                    { path: "prompts", element: <PromptSettingsPage /> },
                                ],
                            },
                            { path: "admin/viral-kb", element: <ViralKnowledgePage /> },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Page404 />,
    },
];

export const RouterPages = () => useRoutes(router);
