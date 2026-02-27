import { Box } from "@mui/material";
import { lazy } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { Loadable } from "@/components/Loadable";

const Page404 = Loadable(lazy(() => import("./Page404")));
const Hero = Loadable(lazy(() => import("./Hero")));
const ChatPage = Loadable(lazy(() => import("./ChatPage")));
const StudioPane = Loadable(lazy(() => import("./chat/StudioPane")));
const UploadsPane = Loadable(lazy(() => import("./chat/UploadsPane")));
const HistoryPane = Loadable(lazy(() => import("./chat/HistoryPane")));
const GeneratedContentPanel = Loadable(lazy(() => import("@/components/GeneratedContentPanel")));

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
                path: "chat",
                element: <ChatPage />,
            },
              {
                path: "chat/:chatId",
                element: <ChatPage />,
                children: [
                  { index: true, element: <Navigate to="studio" replace /> },
                  { path: "studio", element: <StudioPane /> },
                  { path: "uploads", element: <UploadsPane /> },
                  { path: "generated_content", element: <GeneratedContentPanel /> },
                  { path: "history", element: <HistoryPane /> },
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
