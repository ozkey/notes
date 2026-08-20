import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  List,
  ListItemButton,
  ListItemText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BibleContext from "../../contexts/BibleContext";
import { SaveOpen } from "../ActionBar/SaveOpen";
import { normalizeArticleId as normalizeArticleIdUtil } from "../../contexts/BibleContextUtils";
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
  minWidth: 44,
  height: 130,
  px: 0.75,
  py: 1,
  borderRadius: "4px 10px 10px 4px",
  borderLeftWidth: 5,
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
    notes,
    articles,
    lastFileSyncDate,
    bibleTranslations,
    selectedBibleTranslation,
    setSelectedBibleTranslation,
    loadBibleText,
    openBibleInCurrentTab,
    openArticleInCurrentTab,
  } = useContext(BibleContext as React.Context<any>);

  const current = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
    articleId: null,
  };

  const [selectedBook, setSelectedBook] = useState<string | null>(
    current.selectedBook ?? books[0] ?? null,
  );
  const [chapterInput, setChapterInput] = useState<string>(
    String(current.chapterNumber ?? 1),
  );
  const [articleIdInput, setArticleIdInput] = useState<string>("#");
  const [articleIdError, setArticleIdError] = useState<string>("");

  useEffect(() => {
    setSelectedBook(current.selectedBook ?? books[0] ?? null);
    setChapterInput(String(current.chapterNumber ?? 1));
  }, [currentTab, current.selectedBook, current.chapterNumber, books]);

  const existingArticleIds = useMemo(
    () => articles.map((article: any) => article.id),
    [articles],
  );
  const openArticleIds = useMemo(
    () =>
      new Set(
        tabs
          .filter((tab: any) => tab.mode === "article" && tab.articleId)
          .map((tab: any) => String(tab.articleId).toLowerCase()),
      ),
    [tabs],
  );
  const existingNoteRefs = useMemo(() => {
    const seen = new Set<string>();
    const refs: Array<{ id: string; book: string; chapterNumber: number }> = [];
    for (const entry of notes) {
      if (!entry?.book || !entry?.chapterNumber) continue;
      const id = `${entry.book}|${entry.chapterNumber}`;
      if (seen.has(id)) continue;
      seen.add(id);
      refs.push({ id, book: entry.book, chapterNumber: entry.chapterNumber });
    }
    return refs;
  }, [notes]);
  const openBibleRefs = useMemo(
    () =>
      new Set(
        tabs
          .filter((tab: any) => tab.mode === "bible" && tab.selectedBook)
          .map((tab: any) =>
            `${tab.selectedBook}|${String(tab.chapterNumber ?? 1)}`.toLowerCase(),
          ),
      ),
    [tabs],
  );
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

  const normalizeArticleId = (raw: string) => {
    const normalized = normalizeArticleIdUtil(raw);
    if (!normalized) return "";
    return `#${normalized}`;
  };

  const openBible = () => {
    const parsedChapter = parseInt(chapterInput, 10);
    if (!selectedBook || Number.isNaN(parsedChapter) || parsedChapter < 1)
      return;
    openBibleInCurrentTab(selectedBook, parsedChapter);
  };

  const createArticle = () => {
    const normalizedId = normalizeArticleId(articleIdInput);
    const idText = normalizedId.replace(/^#/, "");
    if (idText.length < 2) {
      setArticleIdError("Article ID must be at least 2 characters.");
      return;
    }
    setArticleIdError("");
    openArticleInCurrentTab(normalizedId);
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
              <Typography variant="subtitle1">Bookshelf</Typography>
              <FormControl size="small" sx={{ maxWidth: 360 }}>
                <InputLabel id="home-tab-bible-select-label">Bible</InputLabel>
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
                          borderColor: "#234",
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
                                openBibleInCurrentTab(book, 1);
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

      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2}>
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
                      <TextField {...params} label="Bible Book" size="small" />
                    )}
                    sx={{ minWidth: 220 }}
                  />
                  <TextField
                    size="small"
                    label="Chapter"
                    type="number"
                    value={chapterInput}
                    onChange={(e) => setChapterInput(e.target.value)}
                    sx={{ width: 120 }}
                  />
                  <Button variant="contained" onClick={openBible}>
                    Open
                  </Button>
                </Stack>

                {lastFileSyncDate !== undefined && (
                  <>
                    <Divider />

                    <Typography variant="subtitle1">Open a note</Typography>
                    {existingNoteRefs.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No saved notes yet.
                      </Typography>
                    ) : (
                      <List
                        dense
                        sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
                      >
                        {existingNoteRefs.map((note) => {
                          const isOpen = openBibleRefs.has(
                            note.id.toLowerCase(),
                          );
                          return (
                            <ListItemButton
                              key={note.id}
                              onClick={() =>
                                openBibleInCurrentTab(
                                  note.book,
                                  note.chapterNumber,
                                )
                              }
                              disabled={isOpen}
                            >
                              <ListItemText
                                primary={`${formatBookLabel(note.book)} ${note.chapterNumber}${
                                  isOpen ? " - open" : ""
                                }`}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    )}
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          {lastFileSyncDate !== undefined && (
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1">
                    Create a new article
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                      size="small"
                      label="Article ID / Hashtag"
                      value={articleIdInput}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setArticleIdInput(nextValue);
                        const normalizedId = normalizeArticleId(nextValue);
                        const idText = normalizedId.replace(/^#/, "");
                        if (idText.length >= 2) setArticleIdError("");
                      }}
                      error={Boolean(articleIdError)}
                      helperText={articleIdError}
                      sx={{ minWidth: 260 }}
                    />
                    <Button variant="contained" onClick={createArticle}>
                      Create article
                    </Button>
                  </Stack>

                  <Divider />

                  <Typography variant="subtitle1">Open an article</Typography>
                  {existingArticleIds.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No saved articles yet.
                    </Typography>
                  ) : (
                    <List
                      dense
                      sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
                    >
                      {existingArticleIds.map((id: string) => (
                        <ListItemButton
                          key={id}
                          onClick={() => openArticleInCurrentTab(id)}
                          disabled={openArticleIds.has(id.toLowerCase())}
                        >
                          <ListItemText
                            primary={
                              id +
                              (openArticleIds.has(id.toLowerCase())
                                ? " - open"
                                : "")
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Stack>
    </>
  );
};
