import type { Config } from "tailwindcss";
import DaisyUIThemes from "daisyui/src/theming/themes";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          ...DaisyUIThemes["light"],
          primary: "#8B5CF6", // Purple for mystery/werewolf theme
          secondary: "#F59E0B", // Amber for warmth
          accent: "#EF4444", // Red for danger/werewolves
          neutral: "#374151",
          "base-100": "#FFFFFF",
          "base-200": "#F9FAFB",
          "base-300": "#F3F4F6",
        },
      },
      {
        dark: {
          ...DaisyUIThemes["dark"],
          primary: "#A78BFA", // Lighter purple for dark mode
          secondary: "#FCD34D", // Lighter amber
          accent: "#F87171", // Lighter red
          neutral: "#4B5563",
          "base-100": "#1F2937",
          "base-200": "#374151",
          "base-300": "#4B5563",
        },
      },
      {
        mystery: {
          primary: "#7C3AED", // Deep purple
          secondary: "#F97316", // Orange
          accent: "#DC2626", // Red
          neutral: "#1F2937",
          "base-100": "#0F172A", // Dark blue-gray
          "base-200": "#1E293B",
          "base-300": "#334155",
          "base-content": "#F1F5F9",
        },
      },
    ],
  },
};
export default config;
