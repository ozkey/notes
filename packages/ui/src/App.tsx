import React from "react";
import { Box, Typography } from "@mui/material";
import { BibleProvider } from "./contexts/BibleContext";
import { BiblePanel } from "./components/BiblePanel/BiblePanel";

const App: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: "#1976d2",
          color: "white",
          padding: "7px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Bible Notes App
        </Typography>
      </Box>

      {/* Toolbar (select bible book) + Main Content */}
      <BibleProvider>
        <BiblePanel />
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
