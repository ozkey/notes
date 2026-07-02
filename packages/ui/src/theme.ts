import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#8B6F47",      // Medium brown
      dark: "#5C3D2E",      // Dark brown
      light: "#B8956A",     // Light brown
      contrastText: "#fff", // White text on brown
    },
    secondary: {
      main: "#D2B48C",      // Tan/light brown
      dark: "#8B6F47",      // Use primary dark
      light: "#F5E6D3",     // Very light tan
      contrastText: "#333", // Dark text
    },
    background: {
      default: "#F5E6D3",   // Light tan background
      paper: "#FFFAF0",     // Off-white/cream
    },
    text: {
      primary: "#333333",   // Dark text
      secondary: "#666666", // Medium gray
    },
  },
  typography: {
    body2: {
      fontFamily: '"Georgia", "Garamond", serif',
    },
  },
});
