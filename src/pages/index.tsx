import { Box } from "@mui/material";
import { lazy } from "react";
import { useRoutes } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Loadable } from "@/components/Loadable";

const Page404 = Loadable(lazy(() => import("./Page404")));
const Hero = Loadable(lazy(() => import("./Hero")));
const ChatPage = Loadable(lazy(() => import("./ChatPage")));

const Container = () => (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default',
        justifyContent: 'center',
      }}
    >
      <Outlet />
    </Box>
  );


const router = [
    {
        path: "/",
        element: <Container />,
        children: [
            {
                index: true,
                element: <Hero />,
            },
            {
                path: "chat",
                element: <ChatPage />,
            },
        ],
    },
    {
        path: "/section",
        element: <Container />,
        children: [
            {
                path: "/section/:id",
                element: <Hero />,
            },
        ],
    },
    {
        path: "*",
        element: <Page404 />,
    },
];

export const RouterPages = () => useRoutes(router);
