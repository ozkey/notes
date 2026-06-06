import { Button, Card, CardContent } from "@mui/material";
import React, { useContext, useState } from "react";
import BibleContext, { TabState } from "../contexts/BibleContext";
import Editor from "./Editor/Editor";

export const StudyPanel: React.FC = () => {
  const { tabs, currentTab, notes, setNoteForBookChapter, refreshNotesDate } =
    useContext(BibleContext as React.Context<any>);

  const [editorOpen, setEditorOpen] = useState(false);

  const currentTabState = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
  };

  console.log("notes", notes);
  if (!notes) return <></>;
  const currentNoteText =
    notes.find(
      (entry: any) =>
        entry.book === currentTabState.selectedBook &&
        entry.chapterNumber === currentTabState.chapterNumber,
    )?.text ?? "";

  return (
    <Card>
      <CardContent>
        {!editorOpen && (
          <Button variant="outlined" onClick={() => setEditorOpen(true)}>
            Open Editor
          </Button>
        )}
        {editorOpen && (
          <Button variant="outlined" onClick={() => setEditorOpen(false)}>
            Close Editor
          </Button>
        )}
        {editorOpen && (
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
