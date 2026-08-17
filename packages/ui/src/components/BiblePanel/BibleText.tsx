import { Box, Card, CardActions, CardContent, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { BookActions } from "./BookActions";
import BibleContext from "../../contexts/BibleContext";
import { HighlighterMenu, HIGHLIGHT_COLORS } from "../Highlighter";
import { HighlightColor } from "../../contexts/BibleTypes";

export const BibleText: React.FC<{
  selectedBook: string | null;
  chapterNumber: number;
}> = ({ selectedBook, chapterNumber }) => {
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

  const highlights = getHighlights(selectedBook, chapterNumber);
  const highlightsByVerse = new Map(highlights.map((h) => [h.verse, h.color]));

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
    return (
      <Card>
        <CardActions>
          <BookActions />
        </CardActions>
        <div style={{ padding: "1em", margin: "1em" }}>
          <Typography variant="body2" color="text.secondary">
            No book selected
          </Typography>
        </div>
      </Card>
    );
  }

  if (loadingBibleText) {
    return (
      <Card>
        <CardActions>
          <BookActions />
        </CardActions>
        <div style={{ padding: "1em", margin: "1em" }}>
          <Typography variant="body2" color="text.secondary">
            Loading text...
          </Typography>
        </div>
      </Card>
    );
  }

  if (!bibleText) {
    return (
      <Card>
        <CardActions>
          <BookActions />
        </CardActions>
        <div style={{ padding: "1em", margin: "1em" }}>
          <Typography variant="body2" color="text.secondary">
            Bible text not available
          </Typography>
        </div>
      </Card>
    );
  }

  const book = (bibleText as any).books?.find(
    (b: any) => b.name === selectedBook,
  );
  const chapter = book?.chapters?.find((c: any) => c.chapter === chapterNumber);

  if (!book) {
    return (
      <Card>
        <CardActions>
          <BookActions />
        </CardActions>
        <div style={{ padding: "1em", margin: "1em" }}>
          <Typography variant="body2" color="text.secondary">
            Book "{selectedBook}" not found in text.json
          </Typography>
        </div>
      </Card>
    );
  }

  if (!chapter) {
    return (
      <Card>
        <CardActions>
          <BookActions />
        </CardActions>
        <div style={{ padding: "1em", margin: "1em" }}>
          <Typography variant="body2" color="text.secondary">
            Chapter {chapterNumber} not found for {selectedBook}
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: "0px", margin: "0px" }}>
      <CardActions>
        <BookActions />
      </CardActions>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontFamily: "Georgia, Garamond, serif", color: "primary.dark" }}
        >
          {chapter.name}
        </Typography>
        <Box
          sx={{ fontFamily: "Georgia, Garamond, serif", lineHeight: 1.8 }}
          onMouseUp={handleTextSelection}
        >
          {chapter.verses.map((v: any) => {
            const verseNumber = parseInt(v.verse, 10);
            const highlightColor = highlightsByVerse.get(verseNumber);
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
                data-verse={verseNumber}
                sx={{
                  fontFamily: "Georgia, Garamond, serif",
                  color: "text.primary",
                  marginBottom: "0.8em",
                  lineHeight: 1.8,
                  backgroundColor: bgColor,
                  padding: bgColor !== "transparent" ? "0.2em 0.4em" : "0",
                  borderRadius: "2px",
                  cursor: "text",
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#8B6F47",
                    marginRight: "0.3em",
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
