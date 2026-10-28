import React from "react";
import { Box, Typography } from "@mui/material";
import { BibleProvider } from "./contexts/BibleContext";
import { MainTab } from "./components/MainTab/MainTab";
import appLogo from "./public/BibleNotesApp.png";

const App: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 0,
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          background:
            "linear-gradient(90deg, rgba(22,54,42,1) 0%, rgba(36,74,60,1) 55%, rgba(31,63,51,1) 100%)",
          color: "white",
          px: 2.5,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          borderBottom: "1px solid rgba(255, 255, 255, 0.14)",
        }}
      >
        <Box
          component="img"
          src={appLogo}
          alt="Bible Notes App logo"
          sx={{
            width: 48,
            height: 48,
            objectFit: "contain",
            display: "block",
            borderRadius: 1,
            backgroundColor: "rgba(255,255,255,0.95)",
            p: 0.3,
          }}
        />
        <Typography
          variant="h4"
          component="h1"
          sx={{
            lineHeight: 1.1,
            letterSpacing: 0.2,
            fontSize: { xs: "1.55rem", md: "2rem" },
          }}
        >
          Bible Notes App
        </Typography>
      </Box>

      {/* Toolbar (select bible book) + Main Content */}
      <BibleProvider>
        <MainTab />
      </BibleProvider>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: "primary.dark",
          color: "rgba(255,255,255,0.9)",
          px: 2,
          py: 1.5,
          textAlign: "center",
          marginTop: "auto",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontFamily: "inherit", fontSize: "0.85rem" }}
        >
          © 2026 Notes App. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default App;
