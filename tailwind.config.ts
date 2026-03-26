import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    screens: {
      xs: "30rem",
      sm: "40rem",
      md: "48rem",
      lg: "64rem",
      xl: "80rem",
      "2xl": "96rem",
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    fontSize: {
      xs: ["0.72rem", { lineHeight: "1.25" }],
      sm: ["0.79rem", { lineHeight: "1.4" }],
      base: ["0.92rem", { lineHeight: "1.58" }],
      lg: ["1rem", { lineHeight: "1.6" }],
      xl: ["1.125rem", { lineHeight: "1.5" }],
      "2xl": ["1.35rem", { lineHeight: "1.35" }],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border-raw) / <alpha-value>)",
        input: "hsl(var(--input-raw) / <alpha-value>)",
        ring: "hsl(var(--ring-raw) / <alpha-value>)",
        background: "hsl(var(--background-raw) / <alpha-value>)",
        foreground: "hsl(var(--foreground-raw) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary-raw) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground-raw) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary-raw) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground-raw) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive-raw) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground-raw) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted-raw) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground-raw) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-raw) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground-raw) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover-raw) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground-raw) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card-raw) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground-raw) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background-raw) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground-raw) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary-raw) / <alpha-value>)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground-raw) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent-raw) / <alpha-value>)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground-raw) / <alpha-value>)",
          border: "hsl(var(--sidebar-border-raw) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring-raw) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
