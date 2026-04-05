import {
    createContext,
    useContext,
    useEffect,
    type PropsWithChildren,
} from "react";
import { useThemeMode } from "@/theme";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
    const { mode, setMode } = useThemeMode();

    useEffect(() => {
        document.documentElement.classList.toggle("dark", mode === "dark");
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ theme: mode, setTheme: setMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
