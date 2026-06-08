import { Button, Card, CardActions, CardContent } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import BibleContext, { TabState } from "../contexts/BibleContext";
import Editor from "./Editor/Editor";
import { SaveOpen } from "./ActionBar/SaveOpen";
import editorImage from "./Editor/editor.jpg";

export const StudyPanel: React.FC = () => {
  const { tabs, currentTab, notes, setNoteForBookChapter, refreshNotesDate } =
    useContext(BibleContext as React.Context<any>);

  const currentTabState = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
  };

  if (!notes) return <></>;
  const currentNoteText =
    notes.find(
      (entry: any) =>
        entry.book === currentTabState.selectedBook &&
        entry.chapterNumber === currentTabState.chapterNumber,
    )?.text ?? "";

  const [editorOpen, setEditorOpen] = useState(
    currentNoteText.length || 0 === 0,
  );

  useEffect(() => {
    console.log(
      "Current note text changed, opening editor if there are no notes",
    );
    setEditorOpen((currentNoteText.length || 0) === 0);
  }, [refreshNotesDate]);

  return (
    <Card>
      <CardActions>
        {!refreshNotesDate && (
          <div>
            <SaveOpen />
          </div>
        )}
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
      </CardActions>
      <hr />
      <CardContent>
        {!refreshNotesDate && (
          <div>
            <h2>Personal notes</h2>
            <br />
            <p>
              Notes are saved to a file on your computer as a html file. So your
              notes are private and available to you even without internet
              connection.
            </p>
            <p>
              To get started, click the "New File" button to create a new file
              for your notes.
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
