import { Button, Card, CardActions, CardContent } from "@mui/material";
import React, { useContext, useEffect } from "react";
import BibleContext from "../../contexts/BibleContext";
import Editor from "../Editor/Editor";
import { SaveOpen } from "../ActionBar/SaveOpen";
import editorImage from "../Editor/editor.jpg";

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
        articles.find((entry: any) => entry.id === currentTabState.articleId)
          ?.text ?? ""
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
    console.log(
      "Current note text changed, opening editor if there are no notes",
      currentNoteText.length,
    );
    // dont open editor if there is no text at all but open if length = 0
    if (refreshNotesDate && currentNoteText.length === 0) {
      setEditorOpen(true);
    }
  }, [refreshNotesDate]);

  console.log("editorOpen", editorOpen);
  return (
    <Card>
      <CardActions>
        {/*{!refreshNotesDate && (*/}
        {/*  <div>*/}
        {/*    /!*Please load or create a new personal file for your notes*!/*/}
        {/*    <SaveOpen />*/}
        {/*  </div>*/}
        {/*)}*/}
        {refreshNotesDate && !editorOpen && (
          <Button variant="outlined" onClick={() => setEditorOpen(true)}>
            Open Editor
          </Button>
        )}
        {refreshNotesDate && editorOpen && (
          <Button variant="outlined" onClick={() => setEditorOpen(false)}>
            Close Editor
          </Button>
        )}
        <SaveOpen />
      </CardActions>
      <hr />
      <CardContent>
        {!refreshNotesDate && (
          <div>
            <h2>Personal notes</h2>
            <br />
            <p>
              Notes are saved to a file on your computer/mobile as a html file.
              So your notes are <b>private</b> and available to you even without
              internet connection.
            </p>
            <p>
              If you want to share your notes between your PC and Mobile save
              your file to OneDrive* or Google Drive* or similar service.
            </p>
            <p>
              To get started, click the "New File" button to create a new file
              for your notes.
            </p>
            <p>
              * OneDrive and Google Drive are services provided by Microsoft and
              Google respectively. This app is not affiliated with or endorsed
              by either company.
            </p>
            <img
              src={editorImage}
              alt="Instructions"
              style={{ width: "100%" }}
            />
          </div>
        )}
        {refreshNotesDate && editorOpen && (
          <>
            <Editor
              value={currentNoteText}
              onChange={(html) => {
                console.log("Saving notes to file", html);
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
