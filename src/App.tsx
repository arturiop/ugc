import "simplebar-react/dist/simplebar.min.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { RouterPages } from "./pages";
import ThemeProvider from "./theme";
import useAuthBootstrap from "./hooks/useAuthBootstrap";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchInterval: false,
            retry: false,
        },
    },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
    useAuthBootstrap();

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ThemeProvider>
                        <RouterPages />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
