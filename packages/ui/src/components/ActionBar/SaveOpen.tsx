import { Button } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../../contexts/BibleContext";
import Stack from "@mui/material/Stack";

export const SaveOpen: React.FC = () => {
  const { saveNotesToFile, loadNotesFromFile, refreshNotesDate } = useContext(
    BibleContext as React.Context<any>,
  );

  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={() => loadNotesFromFile()}>
        Load
      </Button>
      <Button variant="contained" onClick={() => saveNotesToFile()}>
        {!refreshNotesDate && <span>New File</span>}
        {refreshNotesDate && <span>Save</span>}
      </Button>
    </Stack>
  );
};
