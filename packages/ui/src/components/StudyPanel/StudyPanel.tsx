import { Card, CardContent } from "@mui/material";

import { NotesAndEditorPanel } from "../StudyPanel/NotesPanel/NotesAndEditorPanel";
import React from "react";
import { RefPanel } from "../ReferencePanel/RefPanel";

interface StudyPanelProps {
  mode: "bible" | "article";
}

export const StudyPanel = React.memo(({ mode }: StudyPanelProps) => {
  return (
    <div>
      <NotesAndEditorPanel />
      <br />
      {mode === "bible" && <RefPanel />}
    </div>
  );
});

StudyPanel.displayName = "StudyPanel";
