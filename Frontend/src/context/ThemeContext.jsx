import { useState, useCallback, useEffect, createContext, useContext } from "react";

const STORAGE_KEY = "tosif-os-theme";

const ThemeContext = createContext({ theme: "dark", isDark: true, toggleTheme: () => {} });

function readInitialTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("founder-os-theme");
    return saved === "light" ? "light" : "dark";
  } catch (e) {
    return "dark";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  // Reflect theme on <html> so Tailwind `dark:` classes + CSS vars activate.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
