import React from "react";
import { Container, Box, Card, CardContent, Typography } from "@mui/material";
import { MainPanel } from "./components/main";

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
          padding: "20px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Notes App
        </Typography>
      </Box>

      {/* Main Content */}
      <MainPanel />

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
