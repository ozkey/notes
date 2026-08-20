import { Card, CardContent } from "@mui/material";

import { NotesAndEditorPanel } from "../StudyPanel/NotesPanel/NotesAndEditorPanel";
import React from "react";
import { RefPanel } from "../ReferencePanel/RefPanel";

export const StudyPanel = React.memo(() => {
  return (
    <Card>
      <CardContent>
        <NotesAndEditorPanel />
        <br />
        <RefPanel />
      </CardContent>
    </Card>
  );
});

StudyPanel.displayName = "StudyPanel";
