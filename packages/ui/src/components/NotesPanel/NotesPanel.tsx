import { Box } from "@mui/material";
import { BibleText } from "./BiblePanel/BibleText";
import { NotesAndEditorPanel } from "./NotesAndEditorPanel";
import React from "react";

interface NotesPanelProps {
  mode: "bible" | "article";
  selectedBook: string | null;
  chapterNumber: number;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  mode,
  selectedBook,
  chapterNumber,
}) => {
  const isBibleTab = mode === "bible";
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: isBibleTab ? "1fr 1fr" : "1fr",
          },
          gap: 0.5,
          padding: "0px",
          margin: "0px",
        }}
      >
        {isBibleTab && (
          <BibleText selectedBook={selectedBook} chapterNumber={chapterNumber} />
        )}
        <NotesAndEditorPanel />
      </Box>
    </>
  );
};
