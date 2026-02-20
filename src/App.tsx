import "simplebar-react/dist/simplebar.min.css";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import { RouterPages } from "./pages";
import ThemeProvider from "./theme";

function App() {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <ThemeProvider>
                    <RouterPages />
                </ThemeProvider>
            </BrowserRouter>
        </HelmetProvider>
    );
}

export default App;
