import React, { useContext, useMemo, useState } from "react";
import {
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
import { normalizeArticleId as normalizeArticleIdUtil } from "../../contexts/BibleContextUtils";
import { formatBookLabel } from "../utils/BibleUtils";

export const HomeNotesAndArticles: React.FC = () => {
  const { tabs, notes, articles, lastFileSyncDate, openBibleInNewTab, openArticleInNewTab } =
    useContext(BibleContext as React.Context<any>);
  const [articleIdInput, setArticleIdInput] = useState<string>("#");
  const [articleIdError, setArticleIdError] = useState<string>("");

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
    const normalized = normalizeArticleIdUtil(raw);
    if (!normalized) return "";
    return `#${normalized}`;
  };

  const createArticle = () => {
    const normalizedId = normalizeArticleId(articleIdInput);
    const idText = normalizedId.replace(/^#/, "");
    if (idText.length < 2) {
      setArticleIdError("Article ID must be at least 2 characters.");
      return;
    }
    setArticleIdError("");
    openArticleInNewTab(normalizedId);
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              {lastFileSyncDate !== undefined && (
                <>
                  <Typography variant="subtitle1">Open a note</Typography>
                  {existingNoteRefs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No saved notes yet.
                    </Typography>
                  ) : (
                    <List dense sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                      {existingNoteRefs.map((note) => {
                        const isOpen = openBibleRefs.has(note.id.toLowerCase());
                        return (
                          <ListItemButton
                            key={note.id}
                            onClick={() => openBibleInNewTab(note.book, note.chapterNumber)}
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
                <Typography variant="subtitle1">Create a new article</Typography>
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
                  <List dense sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                    {existingArticleIds.map((id: string) => (
                      <ListItemButton
                        key={id}
                        onClick={() => openArticleInNewTab(id)}
                        disabled={openArticleIds.has(id.toLowerCase())}
                      >
                        <ListItemText
                          primary={
                            id + (openArticleIds.has(id.toLowerCase()) ? " - open" : "")
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
  );
};
