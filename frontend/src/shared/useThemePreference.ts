import { useState, useEffect } from "react";

export default function useThemePreference() {
  const [themePreference, setThemePreference] = useState(
    localStorage.getItem("themePreference")
  );

  if (themePreference === null) {
    setThemePreference("Default");
  }

  useEffect(() => {
    return localStorage.setItem("themePreference", themePreference);
  }, [themePreference]);

  return [themePreference, setThemePreference] as const;
}
