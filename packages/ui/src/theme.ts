import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2D5A48",
      dark: "#1A3A2E",
      light: "#4C7A66",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#A17A2D",
      dark: "#7B5A1E",
      light: "#E2CFA3",
      contrastText: "#1D1D1D",
    },
    background: {
      default: "#F6F4EE",
      paper: "#FFFCF6",
    },
    text: {
      primary: "#1F2A24",
      secondary: "#56655C",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Georgia", "Garamond", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Georgia", "Garamond", serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Georgia", "Garamond", serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Georgia", "Garamond", serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Georgia", "Garamond", serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Georgia", "Garamond", serif',
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: 0.2,
    },
    body2: {
      fontFamily: '"Georgia", "Garamond", serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { backgroundColor: "#F6F4EE" },
        body: {
          backgroundColor: "#F6F4EE",
          color: "#1F2A24",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(45, 90, 72, 0.14)",
          boxShadow: "0 3px 12px rgba(18, 35, 27, 0.06)",
          backgroundImage: "none",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          backgroundColor: "#2D5A48",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          minHeight: 46,
          fontWeight: 600,
          color: "#49584F",
          "&.Mui-selected": {
            color: "#1A3A2E",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: "none",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(45, 90, 72, 0.22)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(45, 90, 72, 0.45)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2D5A48",
            borderWidth: 2,
          },
        },
      },
    },
  },
});
