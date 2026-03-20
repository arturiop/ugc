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
    100: "#F5F7FA",
    200: "#EEF2F6",
    300: "#D7DEE7",
    400: "#C5CEDA",
    500: "#98A2B3",
    600: "#667085",
    700: "#2D3340",
    800: "#151922",
    900: "#0B0D12",
};

const PRIMARY = {
    lighter: "#FFE2D2",
    light: "#FFB98F",
    main: "#FF6A1A",
    dark: "#E85A0C",
    darker: "#C84B07",
    contrastText: "#FFFFFF",
};

const PRIMARY2 = {
    lighter: "#EEF2F6",
    light: "#D7DEE7",
    main: "#0B0D12",
    dark: "#151922",
    darker: "#2D3340",
    contrastText: "#FFFFFF",
};

const SECONDARY = {
    lighter: "#E7E9FF",
    light: "#C7CCFF",
    main: "#5B61FF",
    dark: "#4046E6",
    darker: "#2D31B8",
    contrastText: "#FFFFFF",
};

const INFO = {
    lighter: "#E7E9FF",
    light: "#C7CCFF",
    main: "#5B61FF",
    dark: "#4046E6",
    darker: "#2D31B8",
    contrastText: "#FFFFFF",
};

const SUCCESS = {
    lighter: "#DDF4EE",
    light: "#AEE3D3",
    main: "#0F8B6D",
    dark: "#0B6E56",
    darker: "#064E3B",
    contrastText: "#FFFFFF",
};

const WARNING = {
    lighter: "#FBE9D5",
    light: "#F0C59B",
    main: "#D9822B",
    dark: "#B96A1F",
    darker: "#8A4A12",
    contrastText: "#FFFFFF",
};

const ERROR = {
    lighter: "#F9D7D7",
    light: "#F1B0B0",
    main: "#D64545",
    dark: "#B23333",
    darker: "#7E1F1F",
    contrastText: "#FFFFFF",
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
    divider: "#E6EBF1",
    action: {
        hover: alpha(GREY[900], 0.04),
        selected: alpha(GREY[900], 0.08),
        disabled: alpha(GREY[500], 0.4),
        disabledBackground: alpha(GREY[500], 0.16),
        focus: alpha(GREY[900], 0.12),
        hoverOpacity: 0.04,
        disabledOpacity: 0.4,
    },
};

export const lightPalette = {
    ...COMMON,
    mode: "light",
    text: {
        primary: GREY[900],
        secondary: GREY[600],
        disabled: GREY[500],
    },
    background: {
        default: GREY[100],
        paper: GREY[0],
        neutral: GREY[200],
    },
    action: {
        ...COMMON.action,
        active: GREY[600],
    },
} as const;

export const darkPalette = {
    ...COMMON,
    mode: "dark",
    primary: {
        ...PRIMARY,
        main: "#FF8A3D",
        dark: "#FF6A1A",
        darker: "#E85A0C",
        contrastText: "#0B0D12",
    },
    secondary: {
        ...SECONDARY,
        lighter: "#E7E9FF",
        light: "#C7CCFF",
        main: "#5B61FF",
        dark: "#4046E6",
        darker: "#2D31B8",
        contrastText: "#F8FAFC",
    },
    text: {
        primary: "#F8FAFC",
        secondary: "#D7DEE7",
        disabled: "#98A2B3",
    },
    background: {
        paper: "#151922",
        default: "#0B0D12",
        neutral: "#1C212B",
    },
    action: {
        ...COMMON.action,
        active: GREY[500],
    },
} as const;

export default function palette(themeMode: 'light' | 'dark') {
    return themeMode === 'light' ? lightPalette : darkPalette;
}
