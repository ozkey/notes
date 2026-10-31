import { Stack } from "@mui/material";

import { NotesAndEditorPanel } from "../StudyPanel/NotesPanel/NotesAndEditorPanel";
import React from "react";
import { RefPanel } from "../ReferencePanel/RefPanel";

interface StudyPanelProps {
  mode: "bible" | "article" | "search";
}

export const StudyPanel = React.memo(({ mode }: StudyPanelProps) => {
  return (
    <Stack spacing={1.25}>
      <NotesAndEditorPanel />
      {mode === "bible" && <RefPanel />}
    </Stack>
  );
});

StudyPanel.displayName = "StudyPanel";
