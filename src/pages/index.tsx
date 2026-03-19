import { Box } from "@mui/material";
import { lazy, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Loadable } from "@/components/Loadable";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import { useAuthStore } from "@/stores/useAuthStore";

const Page404 = Loadable(lazy(() => import("./Page404")));
const Hero = Loadable(lazy(() => import("./Hero")));
const ProjectPage = Loadable(lazy(() => import("./Project")));
const Dashboard = Loadable(lazy(() => import("./Dashboard")));
const SettingsPage = Loadable(lazy(() => import("./Settings")));
const Login = Loadable(lazy(() => import("./Login")));
const Signup = Loadable(lazy(() => import("./Signup")));

const RootContainer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const setToken = useAuthStore((s) => s.setToken);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sharedToken = params.get("token") || params.get("key");
        if (!sharedToken) return;

        setToken(sharedToken);
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
    }, [location.pathname, location.search, navigate, setToken]);

    return (
        <Box
            sx={{
                display: "flex",
                width: "100%",
                minHeight: "100vh",
                bgcolor: "background.default",
                justifyContent: "center",
            }}>
            <Outlet />
        </Box>
    );
};

const router = [
    {
        path: "/",
        element: <RootContainer />,
        children: [
            {
                index: true,
                element: <Hero />,
            },

            {
                element: <GuestRoute />,
                children: [
                    { path: "login", element: <Login /> },
                    { path: "signup", element: <Signup /> },
                ],
            },

            {
                element: <ProtectedRoute />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "projects/:projectId", element: <ProjectPage /> },
                    { path: "settings", element: <SettingsPage /> },
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
