"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Theme = "win95" | "tahoe";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "win95";
  const stored = window.localStorage.getItem("theme");
  return stored === "tahoe" ? "tahoe" : "win95";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads localStorage once on client mount; SSR returns "win95".
  // The inline no-flash script already set the attribute pre-paint; this aligns
  // React state with it without needing a post-mount setState effect.
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", t);
      document.documentElement.dataset.theme = t;
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "win95" ? "tahoe" : "win95");
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
