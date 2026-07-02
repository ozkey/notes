import { Box, Card, CardActions, CardContent, Typography } from "@mui/material";
import React, { useContext } from "react";
import { BookActions } from "./BookActions";
import BibleContext from "../../../contexts/BibleContext";

export const BibleText: React.FC<{
  selectedBook: string | null;
  chapterNumber: number;
}> = ({ selectedBook, chapterNumber }) => {
  const { bibleText, loadingBibleText } = useContext(BibleContext);

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
        <Typography variant="h6" gutterBottom sx={{ fontFamily: "Georgia, Garamond, serif", color: "primary.dark" }}>
          {chapter.name}
        </Typography>
        <Box sx={{ fontFamily: "Georgia, Garamond, serif", lineHeight: 1.8 }}>
          {chapter.verses.map((v: any) => (
            <Typography
              key={v.name}
              variant="body2"
              sx={{
                fontFamily: "Georgia, Garamond, serif",
                color: "text.primary",
                marginBottom: "0.8em",
                lineHeight: 1.8,
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
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
