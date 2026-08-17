import { Card, CardContent } from "@mui/material";

import { NotesAndEditorPanel } from "../StudyPanel/NotesPanel/NotesAndEditorPanel";
import React from "react";

export const StudyPanel = ({}) => {
  return (
    <Card>
      <CardContent>
        <NotesAndEditorPanel />
      </CardContent>
    </Card>
  );
};
