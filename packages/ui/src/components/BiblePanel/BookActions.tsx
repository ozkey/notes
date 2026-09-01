import React, { useContext, useEffect, useState } from "react";
import { Autocomplete, Button, Stack, TextField } from "@mui/material";
import BibleContext from "../../contexts/BibleContext";

export const BookActions: React.FC = () => {
  const { tabs, currentTab, updateTab, books } = useContext(
    BibleContext as React.Context<any>,
  );

  const current = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
    verseNumber: null,
  };

  const [chapterInput, setChapterInput] = useState<string>(
    String(current.chapterNumber ?? 1),
  );
  const [verseInput, setVerseInput] = useState<string>(
    current.verseNumber ? String(current.verseNumber) : "",
  );

  useEffect(() => {
    setChapterInput(String(current.chapterNumber ?? 1));
    setVerseInput(current.verseNumber ? String(current.verseNumber) : "");
  }, [currentTab, current.chapterNumber, current.selectedBook, current.verseNumber]);

  const commitSelection = () => {
    const parsed = parseInt(chapterInput, 10);
    const trimmedVerse = verseInput.trim();
    const parsedVerse = trimmedVerse ? parseInt(trimmedVerse, 10) : null;

    if (
      Number.isNaN(parsed) ||
      parsed < 1 ||
      (parsedVerse !== null && (Number.isNaN(parsedVerse) || parsedVerse < 1))
    ) {
      setChapterInput(String(current.chapterNumber ?? 1));
      setVerseInput(current.verseNumber ? String(current.verseNumber) : "");
      return;
    }

    updateTab(currentTab, {
      chapterNumber: parsed,
      verseNumber: parsedVerse,
    });
    setChapterInput(String(parsed));
    setVerseInput(parsedVerse ? String(parsedVerse) : "");
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ p: 0.25, width: "100%", alignItems: { xs: "stretch", sm: "center" } }}
    >
      <Autocomplete
        freeSolo={false}
        options={books}
        value={current.selectedBook}
        onChange={(_, value) =>
          updateTab(currentTab, { selectedBook: value, verseNumber: null })
        }
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Bible Book"
            variant="outlined"
            size="small"
          />
        )}
        sx={{ width: { xs: "100%", sm: 180 } }}
      />

      <TextField
        label="Chapter"
        variant="outlined"
        size="small"
        type="number"
        value={chapterInput}
        onChange={(e) => {
          setChapterInput(e.target.value);
        }}
        onBlur={commitSelection}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitSelection();
          }
        }}
        sx={{ width: { xs: "100%", sm: 90 } }}
      />

      <TextField
        label="Verse"
        variant="outlined"
        size="small"
        type="number"
        value={verseInput}
        onChange={(e) => {
          setVerseInput(e.target.value);
        }}
        onBlur={commitSelection}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitSelection();
          }
        }}
        sx={{ width: { xs: "100%", sm: 90 } }}
      />

      <Button variant="contained" onClick={commitSelection} sx={{ width: { xs: "100%", sm: "auto" } }}>
        Open
      </Button>
    </Stack>
  );
};
