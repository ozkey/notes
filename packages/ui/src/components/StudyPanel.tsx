import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../contexts/BibleContext";
import Editor from "./Editor/Editor";

const saveNotesToFile = (notes: string) => {
  alert("saving notes to file is not implemented yet");
};

const loadNotesFromFile = () => {
  alert("loading notes from file is not implemented yet");
};

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
        <Button variant="outlined" onClick={() => saveNotesToFile("")}>
          Load
        </Button>
        <Button variant="outlined" onClick={() => loadNotesFromFile()}>
          Save
        </Button>

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
