import { Box, Card, CardContent, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";

import { NotesAndEditorPanel } from "./NotesPanel/NotesAndEditorPanel";
import { RefPanel } from "../ReferencePanel/RefPanel";

export const StudyPanel = () => {
  const [activeTab, setActiveTab] = useState<"notes" | "references">("notes");

  return (
    <Card>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="Study panel tabs"
          >
            <Tab label="Notes" value="notes" />
            <Tab label="References" value="references" />
          </Tabs>
        </Box>
      </CardContent>
      {activeTab === "notes" ? <NotesAndEditorPanel /> : <RefPanel />}
    </Card>
  );
};
