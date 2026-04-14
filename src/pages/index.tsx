import { Box } from "@mui/material";
import { lazy, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useRoutes } from "react-router-dom";
import AppShellHeader from "@/components/AppShellHeader";
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

const RootContainer = () => {
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
            location.pathname === "/shared/marketplace" ? params.get("projectId") : null;

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
            <AppShellHeader />
            <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex", justifyContent: "center" }}>
                <Outlet />
            </Box>
        </Box>
    );
};

const router = [
    {
        path: "/",
        element: <Hero />,
    },
    {
        path: "/",
        element: <RootContainer />,
        children: [
            {
                element: <GuestRoute />,
                children: [
                    { path: "login", element: <Login /> },
                    { path: "signup", element: <Signup /> },
                ],
            },

            {
                element: <SharedRoute />,
                children: [
                    { path: "shared/projects/:projectId", element: <ProjectPage sharedMode /> },
                    { path: "shared/marketplace", element: <MarketplacePage /> },
                ],
            },

            {
                element: <ProtectedRoute />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "marketplace", element: <MarketplacePage /> },
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
    {
        path: "*",
        element: <Page404 />,
    },
];

export const RouterPages = () => useRoutes(router);
