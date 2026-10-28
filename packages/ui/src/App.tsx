import React, { useContext, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { BibleProvider } from "./contexts/BibleContext";
import BibleContext from "./contexts/BibleContext";
import { MainTab } from "./components/MainTab/MainTab";
import appLogo from "./public/BibleNotesApp.png";

const AppShell: React.FC = () => {
  const { openSearchInNewTab } = useContext(BibleContext);
  const [searchInput, setSearchInput] = useState<string>("");

  const handleSearch = () => {
    const query = searchInput.trim();
    if (query.length > 0) {
      openSearchInNewTab(query);
      setSearchInput("");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

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
          flexWrap: "wrap",
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
            mr: { xs: 0, md: "auto" },
          }}
        >
          Bible Notes App
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          <TextField
            size="small"
            label="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="love"
            sx={{
              minWidth: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(24, 52, 42, 0.75)",
              },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.8)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              "& .MuiOutlinedInput-input": {
                color: "#FFF8EA",
                caretColor: "#FFF8EA",
                "&::placeholder": {
                  color: "rgba(255, 248, 234, 0.75)",
                  opacity: 1,
                },
                "&:-webkit-autofill": {
                  WebkitTextFillColor: "#FFF8EA",
                  WebkitBoxShadow: "0 0 0 100px rgba(24, 52, 42, 0.75) inset",
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.45)",
              },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "rgba(255, 255, 255, 0.8)",
                },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "white",
                },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              bgcolor: "#8B6F47",
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#725A39" },
            }}
          >
            Search
          </Button>
        </Stack>
      </Box>

      {/* Toolbar (select bible book) + Main Content */}
      <MainTab />

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

const App: React.FC = () => {
  return (
    <BibleProvider>
      <AppShell />
    </BibleProvider>
  );
};

export default App;
