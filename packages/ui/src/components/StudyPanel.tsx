import { Card, CardContent } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../contexts/BibleContext";
import Editor from "./Editor/Editor";
import { SaveOpen } from "./SaveOpen";

export const StudyPanel: React.FC = () => {
  const { tabs, currentTab, notes, setNoteForBookChapter } = useContext(
    BibleContext as React.Context<any>,
  );

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
        <SaveOpen />

        <Editor
          value={currentNoteText}
          onChange={(html) =>
            setNoteForBookChapter(
              currentTabState.selectedBook,
              currentTabState.chapterNumber,
              html,
            )
          }
          onSave={(html) => {
            console.log("Saving notes to file", html);
            setNoteForBookChapter(
              currentTabState.selectedBook,
              currentTabState.chapterNumber,
              html,
            );
          }}
        />
      </CardContent>
    </Card>
  );
};
