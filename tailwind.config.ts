import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: "#F7F9FB",
        "surface-dim": "#D8DADC",
        "surface-bright": "#F7F9FB",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F2F4F6",
        "surface-container": "#ECEEF0",
        "surface-container-high": "#E6E8EA",
        "surface-container-highest": "#E0E3E5",
        // Text
        "on-surface": "#191C1E",
        "on-surface-variant": "#434655",
        "inverse-surface": "#2D3133",
        "inverse-on-surface": "#EFF1F3",
        // Primary
        primary: "#2563EB",
        "on-primary": "#FFFFFF",
        "primary-container": "#2563EB",
        "on-primary-container": "#EEEFFF",
        "primary-fixed": "#DBE1FF",
        "primary-fixed-dim": "#B4C5FF",
        // Secondary
        secondary: "#545F73",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#D5E0F8",
        "on-secondary-container": "#586377",
        // Tertiary
        tertiary: "#943700",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#BC4800",
        "on-tertiary-container": "#FFEDE6",
        // Error
        error: "#BA1A1A",
        "on-error": "#FFFFFF",
        "error-container": "#FFDAD6",
        "on-error-container": "#93000A",
        // Outline
        outline: "#737686",
        "outline-variant": "#C3C6D7",
        // Background
        background: "#F7F9FB",
        "on-background": "#191C1E",
        "surface-variant": "#E0E3E5",
        // Status colors
        available: "#16A34A",
        allocated: "#2563EB",
        reserved: "#D97706",
        "under-maintenance": "#EA580C",
        lost: "#BA1A1A",
        rejected: "#BA1A1A",
        overdue: "#BA1A1A",
        retired: "#737686",
        disposed: "#737686",
        cancelled: "#737686",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        display: ["36px", { lineHeight: "44px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["24px", { lineHeight: "32px", fontWeight: "600", letterSpacing: "-0.01em" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.01em" }],
        "mono-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "1.5rem",
      },
      spacing: {
        sidebar: "260px",
        topbar: "64px",
      },
      boxShadow: {
        ambient: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
