import { Box, Card, CardActions, CardContent, Typography } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { BookActions } from "./BookActions";
import BibleContext from "../../contexts/BibleContext";
import { HighlighterMenu, HIGHLIGHT_COLORS } from "../Highlighter";
import { HighlightColor } from "../../contexts/BibleTypes";

export const BibleText: React.FC<{
  selectedBook: string | null;
  chapterNumber: number;
  verseNumber?: number | null;
}> = ({ selectedBook, chapterNumber, verseNumber = null }) => {
  const {
    bibleText,
    loadingBibleText,
    setHighlight,
    removeHighlight,
    getHighlights,
  } = useContext(BibleContext);
  const [highlighterAnchorEl, setHighlighterAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const chapterContainerRef = useRef<HTMLDivElement | null>(null);

  const highlights = getHighlights(selectedBook, chapterNumber);
  const highlightsByVerse = new Map(highlights.map((h) => [h.verse, h.color]));

  const renderStatusCard = (message: string) => (
    <Card sx={{ p: 0, m: 0 }}>
      <CardActions sx={{ px: 1, pt: 1, pb: 0.75 }}>
        <BookActions />
      </CardActions>
      <CardContent sx={{ pt: 1.25 }}>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    if (!verseNumber) return;
    const verseElement = chapterContainerRef.current?.querySelector(
      `[data-verse="${verseNumber}"]`,
    ) as HTMLElement | null;
    verseElement?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [chapterNumber, selectedBook, verseNumber]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      // Find which verse contains the selection
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const verseElement = (
        container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : (container as Element)
      )?.closest("[data-verse]") as HTMLElement | null;

      if (verseElement && verseElement.dataset.verse) {
        const verseNum = parseInt(verseElement.dataset.verse, 10);
        setSelectedVerse(verseNum);
        setHighlighterAnchorEl(verseElement);
      }
    }
  };

  const handleSelectColor = (color: HighlightColor) => {
    if (selectedVerse !== null) {
      setHighlight(selectedBook, chapterNumber, selectedVerse, color);
      setSelectedVerse(null);
      setHighlighterAnchorEl(null);
    }
  };

  const handleRemoveHighlight = () => {
    if (selectedVerse !== null) {
      removeHighlight(selectedBook, chapterNumber, selectedVerse);
      setSelectedVerse(null);
      setHighlighterAnchorEl(null);
    }
  };

  if (!selectedBook) {
    return renderStatusCard("No book selected");
  }

  if (loadingBibleText) {
    return renderStatusCard("Loading text...");
  }

  if (!bibleText) {
    return renderStatusCard("Bible text not available");
  }

  const book = (bibleText as any).books?.find(
    (b: any) => b.name === selectedBook,
  );
  const chapter = book?.chapters?.find((c: any) => c.chapter === chapterNumber);

  if (!book) {
    return renderStatusCard(`Book "${selectedBook}" not found in text.json`);
  }

  if (!chapter) {
    return renderStatusCard(
      `Chapter ${chapterNumber} not found for ${selectedBook}`,
    );
  }

  return (
    <Card sx={{ p: 0, m: 0 }}>
      <CardActions sx={{ px: 1, pt: 1, pb: 0.75 }}>
        <BookActions />
      </CardActions>
      <CardContent sx={{ pt: 1.25 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: "Georgia, Garamond, serif",
            color: "primary.dark",
            fontSize: { xs: "1.8rem", md: "2.2rem" },
            lineHeight: 1.2,
            mb: 1.25,
          }}
        >
          {chapter.name}
        </Typography>
        <Box
          ref={chapterContainerRef}
          sx={{
            fontFamily: "Georgia, Garamond, serif",
            lineHeight: 1.85,
            border: "1px solid rgba(45, 90, 72, 0.14)",
            borderRadius: 1,
            backgroundColor: "#FFFDF8",
            px: 1.2,
            py: 1.1,
          }}
          onMouseUp={handleTextSelection}
        >
          {chapter.verses.map((v: any) => {
            const currentVerseNumber = parseInt(v.verse, 10);
            const highlightColor = highlightsByVerse.get(currentVerseNumber);
            const bgColor = highlightColor
              ? HIGHLIGHT_COLORS.find(
                  (c: {
                    color: HighlightColor;
                    label: string;
                    bgColor: string;
                  }) => c.color === highlightColor,
                )?.bgColor
              : "transparent";

            return (
              <Typography
                key={v.name}
                variant="body2"
                data-verse={currentVerseNumber}
                sx={{
                  fontFamily: "Georgia, Garamond, serif",
                  color: "text.primary",
                  marginBottom: "0.7em",
                  lineHeight: 1.8,
                  backgroundColor: bgColor,
                  padding: bgColor !== "transparent" ? "0.23em 0.45em" : "0",
                  borderRadius: "3px",
                  cursor: "text",
                  transition: "background-color 120ms ease",
                  textDecorationLine:
                    currentVerseNumber === verseNumber ? "underline" : "none",
                  textDecorationColor:
                    currentVerseNumber === verseNumber ? "#c62828" : undefined,
                  textDecorationThickness:
                    currentVerseNumber === verseNumber ? "2px" : undefined,
                  textUnderlineOffset:
                    currentVerseNumber === verseNumber ? "0.18em" : undefined,
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#A17A2D",
                    marginRight: "0.35em",
                    fontSize: "0.9em",
                  }}
                >
                  {v.verse}
                </span>
                {v.text}
              </Typography>
            );
          })}
        </Box>
      </CardContent>
      <HighlighterMenu
        anchorEl={highlighterAnchorEl}
        onClose={() => setHighlighterAnchorEl(null)}
        onSelectColor={handleSelectColor}
        onRemoveHighlight={handleRemoveHighlight}
      />
    </Card>
  );
};
