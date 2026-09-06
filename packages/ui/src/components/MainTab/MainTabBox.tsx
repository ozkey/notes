import { Box } from "@mui/material";
import { BibleText } from "../BiblePanel/BibleText";
import React from "react";
import { StudyPanel } from "../StudyPanel/StudyPanel";
import { SearchResults } from "../Search/SearchResults";

interface NotesPanelProps {
  mode: "bible" | "article" | "search";
  selectedBook: string | null;
  chapterNumber: number;
  verseNumber?: number | null;
  searchQuery?: string | null;
}

export const MainTabBox: React.FC<NotesPanelProps> = ({
  mode,
  selectedBook,
  chapterNumber,
  verseNumber,
  searchQuery,
}) => {
  const isBibleTab = mode === "bible";
  const isSearchTab = mode === "search";
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
          <BibleText
            selectedBook={selectedBook}
            chapterNumber={chapterNumber}
            verseNumber={verseNumber ?? null}
          />
        )}
        {isSearchTab && searchQuery && <SearchResults searchQuery={searchQuery} />}
        {!isSearchTab && <StudyPanel mode={mode} />}
      </Box>
    </>
  );
};
