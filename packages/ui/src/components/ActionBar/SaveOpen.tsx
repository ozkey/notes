import { Badge, Button } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../../contexts/BibleContext";
import Stack from "@mui/material/Stack";

export const SaveOpen: React.FC = () => {
  const { saveNotesToFile, loadNotesFromFile, lastFileSyncDate, hasUnsavedChanges } = useContext(
    BibleContext as React.Context<any>,
  );
  const handleOpen = async () => {
    if (hasUnsavedChanges) {
      const shouldSave = window.confirm(
        "You have unsaved changes. Save the current file before opening another one?",
      );
      if (shouldSave) {
        await saveNotesToFile();
      }
    }
    await loadNotesFromFile();
  };

  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={handleOpen}>
        Open
      </Button>
      <Badge color="warning" variant="dot" invisible={!hasUnsavedChanges}>
        <Button variant="contained" onClick={() => saveNotesToFile()}>
          {!lastFileSyncDate && <span>New File</span>}
          {lastFileSyncDate && <span>Save</span>}
        </Button>
      </Badge>
    </Stack>
  );
};
