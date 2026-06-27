import React from "react";
import { Box, Typography } from "@mui/material";
import { BibleProvider } from "./contexts/BibleContext";
import { TabsPanel } from "./components/TabsPanel/TabsPanel";
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
          backgroundColor: "#1976d2",
          color: "white",
          padding: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 1.5,
          paddingLeft: 2,
        }}
      >
        <Box
          component="img"
          src={appLogo}
          alt="Bible Notes App logo"
          sx={{
            width: 66,
            height: 66,
            objectFit: "contain",
            display: "block",
          }}
        />
        <Typography variant="h4" component="h1">
          Bible Notes App
        </Typography>
      </Box>

      {/* Toolbar (select bible book) + Main Content */}
      <BibleProvider>
        <TabsPanel />
      </BibleProvider>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: "#1976d2",
          color: "white",
          padding: "20px",
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        <Typography variant="body2">
          © 2026 Notes App. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default App;
