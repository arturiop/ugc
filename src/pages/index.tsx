import { Box } from "@mui/material";
import { lazy } from "react";
import { Outlet, useRoutes } from "react-router-dom";
import { Loadable } from "@/components/Loadable";

const Page404 = Loadable(lazy(() => import("./Page404")));
const Hero = Loadable(lazy(() => import("./Hero")));
const ClipPage = Loadable(lazy(() => import("./ClipPage")));

const RootContainer = () => (
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
                path: "clip",
                element: <ClipPage />,
            },
            {
                path: "clip/:clipId",
                element: <ClipPage />,
            },
        ],
    },
    {
        path: "*",
        element: <Page404 />,
    },
];

export const RouterPages = () => useRoutes(router);
