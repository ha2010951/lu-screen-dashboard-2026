import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import getTheme from "../theme";

const ThemeModeContext = createContext({ mode: "light", toggleMode: () => {} });

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "light");

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}