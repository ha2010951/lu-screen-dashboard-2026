import { createTheme } from "@mui/material/styles";

function getTheme(mode = "light") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#4c9be0" : "#0b5fa5",
        dark: "#0b2f57",
        light: isDark ? "#16324f" : "#e9f2fb",
      },
      success: { main: isDark ? "#4caf6e" : "#2e7d32" },
      warning: { main: "#ed6c02" },
      error: { main: isDark ? "#ef5350" : "#d32f2f" },
      background: {
        default: isDark ? "#0f1720" : "#f4f7fa",
        paper: isDark ? "#16202b" : "#ffffff",
      },
      text: {
        primary: isDark ? "#e7edf3" : "#172b3f",
        secondary: isDark ? "#93a5b8" : "#66788a",
      },
      divider: isDark ? "#26333f" : "#dfe7ef",
    },
    typography: {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      h3: { fontWeight: 750 },
      h4: { fontWeight: 750 },
      h5: { fontWeight: 700 },
      button: { fontWeight: 700, textTransform: "none" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, boxShadow: "none" },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },
    },
  });
}

export default getTheme;