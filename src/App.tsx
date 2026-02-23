import "simplebar-react/dist/simplebar.min.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RouterPages } from "./pages";
import ThemeProvider from "./theme";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchInterval: false,
            retry: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <RouterPages />
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
