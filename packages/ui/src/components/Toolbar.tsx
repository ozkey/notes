import React, { useContext, useEffect, useState } from "react";
import { Box, Container, Autocomplete, TextField } from "@mui/material";
import BibleContext from "../contexts/BibleContext";

export const ToolbarPanel: React.FC = () => {
  const { tabs, currentTab, updateTab, books } = useContext(
    BibleContext as React.Context<any>,
  );

  const current = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
    notes: "",
  };

  const [chapterInput, setChapterInput] = useState<string>(
    String(current.chapterNumber ?? 1),
  );

  useEffect(() => {
    setChapterInput(String(current.chapterNumber ?? 1));
  }, [currentTab, current.chapterNumber]);

  const commitChapter = () => {
    const parsed = parseInt(chapterInput, 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      updateTab(currentTab, { chapterNumber: parsed });
      setChapterInput(String(parsed));
    } else {
      // revert to last valid
      setChapterInput(String(current.chapterNumber ?? 1));
    }
  };

  return (
    <Box
      component="div"
      sx={{
        backgroundColor: "#fff",
        padding: "12px 0",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Container maxWidth="xl" sx={{ display: "flex", alignItems: "center" }}>
        <Autocomplete
          freeSolo={false}
          options={books}
          value={current.selectedBook}
          onChange={(_, value) =>
            updateTab(currentTab, { selectedBook: value })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Bible Book"
              variant="outlined"
              size="small"
            />
          )}
          sx={{ width: 320 }}
        />

        <TextField
          label="Chapter"
          variant="outlined"
          size="small"
          type="number"
          value={chapterInput}
          onChange={(e) => setChapterInput(e.target.value)}
          onBlur={commitChapter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitChapter();
            }
          }}
          sx={{ width: 120, marginLeft: 2 }}
        />
      </Container>
    </Box>
  );
};
