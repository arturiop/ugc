import { createContext, useContext, useMemo } from "react";
import { CssBaseline } from "@mui/material";
import { createTheme, StyledEngineProvider, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";

import customShadows from "./customShadows";
import GlobalStyles from "./globalStyles";
import componentsOverride from "./overrides";
import palette from "./palette";
import shadows from "./shadows";
import typography from "./typography";
import useLocalStorage from "@/hooks/useLocalStorage";

export type ThemeMode = "light" | "dark";

type ThemeModeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export const useThemeMode = () => {
    const context = useContext(ThemeModeContext);
    if (!context) {
        throw new Error("useThemeMode must be used within ThemeProvider.");
    }
    return context;
};

const getThemeOptionsByMode = (themeMode: ThemeMode = "light") => {
    const theme = createTheme({
        palette: palette(themeMode),
        typography,
        shape: { borderRadius: 8 },
        direction: "ltr",
        shadows: shadows(themeMode),
        customShadows: customShadows(themeMode),
    });

    return {
        ...theme,
        components: componentsOverride(theme),
    };
};


export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useLocalStorage<ThemeMode>("ugc_theme_mode", "light");
    const theme = useMemo(() => getThemeOptionsByMode(mode), [mode]);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeModeContext.Provider value={{ mode, setMode }}>
                <MUIThemeProvider theme={theme}>
                    <CssBaseline />
                    <GlobalStyles />
                    {children}
                </MUIThemeProvider>
            </ThemeModeContext.Provider>
        </StyledEngineProvider>
    );
}
