import { alpha } from "@mui/material/styles";

export type ColorSchema = "primary" | "secondary" | "info" | "success" | "warning" | "error";

declare module "@mui/material/styles" {
    interface TypeBackground {
        neutral: string;
    }
    interface SimplePaletteColorOptions {
        lighter: string;
        darker: string;
    }
    interface PaletteColor {
        lighter: string;
        darker: string;
    }
}

const GREY = {
    0: "#FFFFFF",
    100: "#FCFBFA",
    200: "#F5F3EF",
    300: "#ECE8E2",
    400: "#D6D1C9",
    500: "#B7B2A8",
    600: "#8E8A82",
    700: "#6A675F",
    800: "#3A3935",
    900: "#262522",
};

const PRIMARY = {
    lighter: "#EEEDE9",
    light: "#D6D4CE",
    main: "#3A3935",
    dark: "#2E2D29",
    darker: "#1F1E1B",
    contrastText: "#FFFFFF",
};

const SECONDARY = {
    lighter: "#EEF3EF",
    light: "#D6E1D8",
    main: "#B7C8BA",
    dark: "#8FA294",
    darker: "#6A7C70",
    contrastText: "#262522",
};

const INFO = {
    lighter: "#F0F3F2",
    light: "#D9E3E1",
    main: "#B9C9C6",
    dark: "#93A8A4",
    darker: "#6E8480",
    contrastText: "#262522",
};

const SUCCESS = {
    lighter: "#EFF5F1",
    light: "#D6E8DD",
    main: "#B6D3C3",
    dark: "#8FB6A0",
    darker: "#6C907E",
    contrastText: "#262522",
};

const WARNING = {
    lighter: "#F7F2EB",
    light: "#EADFD1",
    main: "#D4C3AE",
    dark: "#B19A7F",
    darker: "#8A6F57",
    contrastText: "#262522",
};

const ERROR = {
    lighter: "#F6ECE8",
    light: "#E8D2C9",
    main: "#D6B2A6",
    dark: "#B3897B",
    darker: "#8C5F54",
    contrastText: "#262522",
};

const COMMON = {
    common: { black: "#000000", white: "#FFFFFF" },
    primary: PRIMARY,
    secondary: SECONDARY,
    info: INFO,
    success: SUCCESS,
    warning: WARNING,
    error: ERROR,
    grey: GREY,
    divider: alpha(GREY[500], 0.2),
    action: {
        hover: alpha(GREY[500], 0.06),
        selected: alpha(GREY[500], 0.12),
        disabled: alpha(GREY[500], 0.4),
        disabledBackground: alpha(GREY[500], 0.16),
        focus: alpha(GREY[500], 0.12),
        hoverOpacity: 0.06,
        disabledOpacity: 0.4,
    },
};

export const lightPalette = {
    ...COMMON,
    mode: "light",
    text: {
        primary: GREY[800],
        secondary: GREY[600],
        disabled: GREY[500],
    },
    background: {
        default: "#FAF9F6",
        paper: "#FFFFFF",
        neutral: "#F1EFEA",
    },
    action: {
        ...COMMON.action,
        active: GREY[600],
    },
} as const;

export const darkPalette = {
    ...COMMON,
    mode: "dark",
    text: {
        primary: "#e6e6e6",
        secondary: GREY[500],
        disabled: GREY[600],
    },
    background: {
        paper: GREY[800],
        default: GREY[900],
        neutral: alpha(GREY[500], 0.16),
    },
    action: {
        ...COMMON.action,
        active: GREY[500],
    },
} as const;

export default function palette(themeMode: 'light' | 'dark') {
    return themeMode === 'light' ? lightPalette : darkPalette;
}
