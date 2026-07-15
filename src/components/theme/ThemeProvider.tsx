"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Theme = "win95" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  // Dark mode is disabled for now: always start in win95 (light) so the server
  // and client render identically (no hydration mismatch). Re-enable dark by
  // restoring the localStorage read here and the no-flash script in layout.tsx.
  return "win95";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", t);
      document.documentElement.dataset.theme = t;
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "win95" ? "dark" : "win95");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
