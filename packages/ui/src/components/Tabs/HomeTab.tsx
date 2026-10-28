import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BibleContext from "../../contexts/BibleContext";
import { SaveOpen } from "../ActionBar/SaveOpen";
import { HomeNotesAndArticles } from "./HomeNotesAndArticles";
import {
  BOOK_GROUPS,
  formatBookLabel,
  toArabicOrdinalBook,
  toRomanOrdinalBook,
} from "../utils/BibleUtils";

const normalizeBookKey = (book: string) =>
  book.toLowerCase().replace(/[^a-z0-9]/g, "");

const GROUP_SPINE_COLORS: Record<string, string> = {
  Law: "#fde68a",
  History: "#fecdd3",
  Poetry: "#bfdbfe",
  "Major Prophets": "#ddd6fe",
  "Minor Prophets": "#bbf7d0",
  Gospels: "#fed7aa",
  "History (NT)": "#bae6fd",
  "Paul Letters": "#fbcfe8",
  "General Letters": "#c7d2fe",
  Prophecy: "#e9d5ff",
  Other: "#e5e7eb",
};

const bookSpineSx = {
  textTransform: "none",
  minWidth: 40,
  height: 155,
  px: 0.75,
  py: 1,
  borderRadius: "4px",
  borderLeftWidth: 10,
  borderLeftStyle: "solid",
  borderLeftColor: "primary.dark",
  justifyContent: "center",
  writingMode: "vertical-rl",
  textOrientation: "mixed",
  whiteSpace: "normal",
  fontWeight: 600,
  letterSpacing: 0.2,
};

export const HomeTab: React.FC = () => {
  const {
    tabs,
    currentTab,
    books,
    lastFileSyncDate,
    bibleTranslations,
    selectedBibleTranslation,
    setSelectedBibleTranslation,
    loadBibleText,
    openBibleInNewTab,
  } = useContext(BibleContext as React.Context<any>);

  const current = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
    verseNumber: null,
    articleId: null,
  };

  const [selectedBook, setSelectedBook] = useState<string | null>(
    current.selectedBook ?? books[0] ?? null,
  );
  const [chapterInput, setChapterInput] = useState<string>(
    String(current.chapterNumber ?? 1),
  );
  const [verseInput, setVerseInput] = useState<string>(
    current.verseNumber ? String(current.verseNumber) : "",
  );

  useEffect(() => {
    setSelectedBook(current.selectedBook ?? books[0] ?? null);
    setChapterInput(String(current.chapterNumber ?? 1));
    setVerseInput(current.verseNumber ? String(current.verseNumber) : "");
  }, [
    currentTab,
    current.selectedBook,
    current.chapterNumber,
    current.verseNumber,
    books,
  ]);

  const groupedBooks = useMemo(() => {
    const booksByKey = new Map(
      books.map((book: string) => [normalizeBookKey(book), book]),
    );
    const picked = new Set<string>();
    const groups = BOOK_GROUPS.map((group) => {
      const resolvedBooks = group.books
        .map((bookAliases) => {
          const candidates = Array.from(
            new Set([
              ...bookAliases,
              ...bookAliases.map((book) => toArabicOrdinalBook(book)),
              ...bookAliases.map((book) => toRomanOrdinalBook(book)),
            ]),
          );
          const match = candidates
            .map((candidate) => booksByKey.get(normalizeBookKey(candidate)))
            .find((candidateBook): candidateBook is string =>
              Boolean(candidateBook),
            );
          if (!match) return null;
          picked.add(match);
          return match;
        })
        .filter((book): book is string => Boolean(book));
      return { title: group.title, books: resolvedBooks };
    }).filter((group) => group.books.length > 0);
    const uncategorized = books.filter((book: string) => !picked.has(book));
    if (uncategorized.length > 0) {
      groups.push({ title: "Other", books: uncategorized });
    }
    return groups;
  }, [books]);

  const openBible = () => {
    const parsedChapter = parseInt(chapterInput, 10);
    const trimmedVerse = verseInput.trim();
    const parsedVerse = trimmedVerse ? parseInt(trimmedVerse, 10) : null;

    if (
      !selectedBook ||
      Number.isNaN(parsedChapter) ||
      parsedChapter < 1 ||
      (parsedVerse !== null && (Number.isNaN(parsedVerse) || parsedVerse < 1))
    )
      return;
    openBibleInNewTab(selectedBook, parsedChapter, parsedVerse);
  };

  const handleBibleTranslationChange = (nextTranslation: string) => {
    setSelectedBibleTranslation(nextTranslation);
    loadBibleText(nextTranslation);
  };

  return (
    <>
      <Box
        component="main"
        sx={{ flex: 1, padding: "0px 0 0 0", marginBottom: "1rem" }}
      >
        <Card sx={{ padding: "1rem", marginBottom: "1rem" }}>
          <CardContent>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5}>
                <Stack spacing={1} sx={{ minWidth: 220, maxWidth: 360 }}>
                  <Typography variant="subtitle1">Bookshelf</Typography>
                  <FormControl size="small" sx={{ width: "100%" }}>
                    <InputLabel id="home-tab-bible-select-label">
                      Bible
                    </InputLabel>
                    <Select
                      labelId="home-tab-bible-select-label"
                      label="Bible"
                      value={selectedBibleTranslation}
                      onChange={(event) =>
                        handleBibleTranslationChange(String(event.target.value))
                      }
                    >
                      {bibleTranslations.map((translation: any) => (
                        <MenuItem key={translation.id} value={translation.id}>
                          {translation.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">
                    Open a bible book and chapter
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Autocomplete
                      disablePortal
                      options={books}
                      value={selectedBook}
                      onChange={(_, value) => setSelectedBook(value)}
                      getOptionLabel={(option) => formatBookLabel(option)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Bible Book"
                          size="small"
                        />
                      )}
                      sx={{ minWidth: 200 }}
                    />
                    <TextField
                      size="small"
                      label="Chapter"
                      type="number"
                      value={chapterInput}
                      onChange={(e) => setChapterInput(e.target.value)}
                      sx={{ width: 100 }}
                    />
                    <TextField
                      size="small"
                      label="Verse"
                      type="number"
                      value={verseInput}
                      onChange={(e) => setVerseInput(e.target.value)}
                      sx={{ width: 100 }}
                    />
                    <Button variant="contained" onClick={openBible}>
                      Open
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
              <Box sx={{ overflowX: "auto" }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  useFlexGap
                  sx={{ flexWrap: "nowrap", width: "max-content", pb: 0.5 }}
                >
                  {groupedBooks.map((group) => {
                    const groupColor =
                      GROUP_SPINE_COLORS[group.title] ?? "#e5e7eb";
                    return (
                      <Box
                        key={group.title}
                        sx={{
                          flexShrink: 0,
                          borderBottom: "4px solid",
                          borderColor: "rgba(139, 111, 71, 0.3)",
                          // transparent 50% groupColor
                          backgroundColor: "rgba(139, 111, 71, 0.1)",
                          borderRadius: "10px 10px 0px 0px",
                          px: 1,
                          py: 0.75,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {group.title}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          useFlexGap
                          sx={{ mt: 0.5, flexWrap: "nowrap" }}
                        >
                          {group.books.map((book) => (
                            <Button
                              key={book}
                              onClick={() => {
                                setSelectedBook(book);
                                setChapterInput("1");
                                setVerseInput("");
                                openBibleInNewTab(book, 1);
                              }}
                              variant={
                                selectedBook === book ? "contained" : "outlined"
                              }
                              sx={{
                                ...bookSpineSx,
                                bgcolor: groupColor,
                                padding: "0px",
                                color: "text.primary",
                                borderColor:
                                  selectedBook === book
                                    ? "primary.main"
                                    : "rgba(0, 0, 0, 0.2)",
                                "&:hover": {
                                  bgcolor: groupColor,
                                  filter: "brightness(0.96)",
                                },
                              }}
                            >
                              {formatBookLabel(book)}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {lastFileSyncDate === undefined && (
        <Box
          component="main"
          sx={{ flex: 1, padding: "0px 0 0 0", margin: "0 0  10px 0" }}
        >
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Typography variant="subtitle1">
                  Would you like to open your notes or start a new
                </Typography>
                <SaveOpen />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      <HomeNotesAndArticles />
    </>
  );
};
