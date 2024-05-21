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
          primary: DaisyUIThemes["light"].secondary,
          secondary: DaisyUIThemes["light"].primary,
        },
      },
      {
        dark: {
          ...DaisyUIThemes["dark"],
          primary: DaisyUIThemes["dark"].secondary,
          secondary: DaisyUIThemes["dark"].primary,
        },
      },
    ],
  },
};
export default config;
