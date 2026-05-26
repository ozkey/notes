import { Box, Card, CardContent, Typography } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../contexts/BibleContext";
import Editor from "./Editor";

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
    <Box key={1}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: 3,
        }}
      >
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {current.selectedBook
              ? `${current.selectedBook} — Chapter ${current.chapterNumber ?? 1}`
              : "No book selected"}
          </Typography>
          <Editor
            value={current.notes}
            onChange={(html) => updateTab(currentTab, { notes: html })}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
