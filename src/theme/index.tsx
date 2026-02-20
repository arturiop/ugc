import { useMemo } from "react";
import { CssBaseline } from "@mui/material";
import { createTheme, StyledEngineProvider, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";

import customShadows from "./customShadows";
import GlobalStyles from "./globalStyles";
import componentsOverride from "./overrides";
import palette from "./palette";
import shadows from "./shadows";
import typography from "./typography";


const getThemeOptionsByMode = (themeMode: "light" | "dark" = "light") => {
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
    const theme = useMemo(() => getThemeOptionsByMode(), []);

    return (
        <StyledEngineProvider injectFirst>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles />
                {children}
            </MUIThemeProvider>
        </StyledEngineProvider>
    );
}
