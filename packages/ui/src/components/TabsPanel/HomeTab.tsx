import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BibleContext from "../../contexts/BibleContext";

export const HomeTab: React.FC = () => {
  const {
    tabs,
    currentTab,
    books,
    notes,
    articles,
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

  const normalizeArticleId = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
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

  return (
    <Stack spacing={2}>
      {/*<Typography variant="h6">Home</Typography>*/}
      {/*<Typography variant="body2" color="text.secondary">*/}
      {/*  Choose what you want to open in this tab.*/}
      {/*</Typography>*/}
      <Typography variant="h6" color="text.secondary">
        Choose what you want to open in this tab.
      </Typography>

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
                    const isOpen = openBibleRefs.has(note.id.toLowerCase());
                    return (
                      <ListItemButton
                        key={note.id}
                        onClick={() =>
                          openBibleInCurrentTab(note.book, note.chapterNumber)
                        }
                        disabled={isOpen}
                      >
                        <ListItemText
                          primary={`${note.book} ${note.chapterNumber}${
                            isOpen ? " - open" : ""
                          }`}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1">
                Create a new article that is not linked to a book and chapter
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
      </Stack>
    </Stack>
  );
};
