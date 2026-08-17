import { Card, CardContent } from "@mui/material";

import { NotesAndEditorPanel } from "../StudyPanel/NotesPanel/NotesAndEditorPanel";
import React from "react";

export const StudyPanel = ({}) => {
  return (
    <Card>
      <CardContent>
        <NotesAndEditorPanel />
        <h1>Reference Data</h1>
      </CardContent>
    </Card>
  );
};
