import { Button, Card, CardActions, CardContent } from "@mui/material";
import React, { useContext, useEffect } from "react";
import BibleContext from "../../contexts/BibleContext";
import { articleIdsMatch } from "../../contexts/BibleContextUtils";
import Editor from "../Editor/Editor";
import { SaveOpen } from "../ActionBar/SaveOpen";

export const NotesAndEditorPanel: React.FC = () => {
  const {
    tabs,
    currentTab,
    notes,
    articles,
    setNoteForBookChapter,
    setArticleById,
    refreshNotesDate,
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
      <Card>
        <CardContent>Select an option from Home to get started.</CardContent>
      </Card>
    );
  }
  if (currentTabState.mode === "bible" && !currentTabState.selectedBook) {
    return (
      <Card>
        <CardContent>No book selected</CardContent>
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

  // editorOpen state moved to context

  useEffect(() => {
    // console.log(
    //   "Current note text changed, opening editor if there are no notes",
    //   currentNoteText.length,
    // );
    // dont open editor if there is no text at all but open if length = 0
    if (refreshNotesDate && currentNoteText.length === 0) {
      setEditorOpen(true);
    }
  }, [refreshNotesDate]);

  return (
    <Card>
      <CardActions>
        {refreshNotesDate && !editorOpen && (
          <Button variant="contained" onClick={() => setEditorOpen(true)}>
            Open Editor
          </Button>
        )}
        {refreshNotesDate && editorOpen && (
          <Button variant="contained" onClick={() => setEditorOpen(false)}>
            Close Editor
          </Button>
        )}
        <div style={{ marginLeft: "auto" }}>
          <SaveOpen />
        </div>
      </CardActions>
      <hr />
      <CardContent>
        {!refreshNotesDate && (
          <div>
            <h2>Personal notes</h2>
            <br />

            <p>
              To get started, click the "New File" button to create a new file
              for your notes.
            </p>

            {/*<img*/}
            {/*  src={editorImage}*/}
            {/*  alt="Instructions"*/}
            {/*  style={{ width: "100%" }}*/}
            {/*/>*/}
          </div>
        )}
        {refreshNotesDate && editorOpen && (
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
              refreshNotesDate={refreshNotesDate}
            />
          </>
        )}
        {!editorOpen && (
          <div
            className="database-html-container"
            dangerouslySetInnerHTML={{ __html: currentNoteText }}
          />
        )}
      </CardContent>
    </Card>
  );
};
