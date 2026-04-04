import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === "undefined") return "dark";

        const storedTheme = window.localStorage.getItem("w-editor-theme");
        return storedTheme === "light" ? "light" : "dark";
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        window.localStorage.setItem("w-editor-theme", theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            setTheme: setThemeState,
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
