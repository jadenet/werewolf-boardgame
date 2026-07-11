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
          primary: "#8B5CF6",
          secondary: "#F59E0B",
          accent: "#EF4444",
          neutral: "#374151",
          "base-100": "#FFFFFF",
          "base-200": "#F9FAFB",
          "base-300": "#F3F4F6",
        },
      },
      {
        dark: {
          ...DaisyUIThemes["dark"],
          primary: "#A78BFA",
          secondary: "#FCD34D",
          accent: "#F87171",
          neutral: "#4B5563",
          "base-100": "#1F2937",
          "base-200": "#374151",
          "base-300": "#4B5563",
        },
      },
    ],
  },
};
export default config;
