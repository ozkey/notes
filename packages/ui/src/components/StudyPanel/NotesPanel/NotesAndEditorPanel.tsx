import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect } from "react";
import BibleContext from "../../../contexts/BibleContext";
import { articleIdsMatch } from "../../../contexts/BibleContextUtils";
import Editor from "../../Editor/Editor";
import { SaveOpen } from "../../ActionBar/SaveOpen";

export const NotesAndEditorPanel: React.FC = () => {
  const {
    tabs,
    currentTab,
    notes,
    articles,
    setNoteForBookChapter,
    setArticleById,
    lastFileSyncDate,
    editorOpen,
    setEditorOpen,
  } = useContext(BibleContext as React.Context<any>);

  const currentTabState = tabs[currentTab] ?? {
    mode: "home",
    selectedBook: null,
    chapterNumber: 1,
    articleId: null,
  };

  if (!notes) return <></>;
  if (currentTabState.mode === "home") {
    return (
      <Card sx={{ p: 0, m: 0 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Select an option from Home to get started.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  if (currentTabState.mode === "bible" && !currentTabState.selectedBook) {
    return (
      <Card sx={{ p: 0, m: 0 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            No book selected
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const currentNoteText = (() => {
    if (currentTabState.mode === "article") {
      return (
        articles.find((entry: any) =>
          articleIdsMatch(entry.id, String(currentTabState.articleId ?? "")),
        )?.text ?? ""
      );
    }
    return (
      notes.find(
        (entry: any) =>
          entry.book === currentTabState.selectedBook &&
          entry.chapterNumber === currentTabState.chapterNumber,
      )?.text ?? ""
    );
  })();

  const lastSavedLabel = lastFileSyncDate
    ? lastFileSyncDate.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  // editorOpen state moved to context

  useEffect(() => {
    // console.log(
    //   "Current note text changed, opening editor if there are no notes",
    //   currentNoteText.length,
    // );
    // dont open editor if there is no text at all but open if length = 0
    if (lastFileSyncDate && currentNoteText.length === 0) {
      setEditorOpen(true);
    }
  }, [lastFileSyncDate]);

  return (
    <Card sx={{ p: 0, m: 0 }}>
      <CardActions
        disableSpacing
        sx={{
          px: 1.25,
          py: 1,
          borderBottom: "1px solid rgba(45, 90, 72, 0.16)",
          backgroundColor: "#FFFCF8",
          gap: 1,
        }}
      >
        {lastFileSyncDate && !editorOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setEditorOpen(true)}
          >
            Open Editor
          </Button>
        )}
        {lastFileSyncDate && editorOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setEditorOpen(false)}
          >
            Close Editor
          </Button>
        )}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          {lastFileSyncDate && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "inherit" }}
            >
              Last saved {lastSavedLabel}
            </Typography>
          )}
          <SaveOpen />
        </Box>
      </CardActions>
      <Divider />
      <CardContent sx={{ pt: 1.5 }}>
        {!lastFileSyncDate && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Personal notes
            </Typography>
            <Typography variant="body1">
              To get started, click the "New File" button to create a new file
              for your notes.
            </Typography>

            {/*<img*/}
            {/*  src={editorImage}*/}
            {/*  alt="Instructions"*/}
            {/*  style={{ width: "100%" }}*/}
            {/*/>*/}
          </Box>
        )}
        {lastFileSyncDate && editorOpen && (
          <>
            <Editor
              value={currentNoteText}
              onChange={(html) => {
                if (currentTabState.mode === "article") {
                  if (currentTabState.articleId) {
                    setArticleById(currentTabState.articleId, html);
                  }
                  return;
                }
                setNoteForBookChapter(
                  currentTabState.selectedBook,
                  currentTabState.chapterNumber,
                  html,
                );
              }}
              lastFileSyncDate={lastFileSyncDate}
            />
          </>
        )}
        {!editorOpen && (
          <Box
            className="database-html-container"
            dangerouslySetInnerHTML={{ __html: currentNoteText }}
            sx={{
              border: "1px solid rgba(45, 90, 72, 0.18)",
              borderRadius: 1,
              backgroundColor: "#FFFDF8",
              p: 1.5,
              minHeight: 240,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
