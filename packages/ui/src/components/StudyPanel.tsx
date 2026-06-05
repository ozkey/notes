import { Card, CardContent } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../contexts/BibleContext";
import Editor from "./Editor/Editor";
import { SaveOpen } from "./SaveOpen";

export const StudyPanel: React.FC = () => {
  const { tabs, currentTab, updateTab } = useContext(
    BibleContext as React.Context<any>,
  );

  const current = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
    notes: "",
  };

  return (
    <Card>
      <CardContent>
        <SaveOpen />

        <Editor
          value={current.notes}
          onChange={(html) => updateTab(currentTab, { notes: html })}
          onSave={(html) => {
            console.log("Saving notes to file", html);
            updateTab(currentTab, { notes: html });
          }}
        />
      </CardContent>
    </Card>
  );
};
