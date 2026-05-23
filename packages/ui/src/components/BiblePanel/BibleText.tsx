import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";

import textData from "./text.json";

export const BibleText: React.FC<{
  selectedBook: string | null;
  chapterNumber: number;
}> = ({ selectedBook, chapterNumber }) => {
  if (!selectedBook) {
    return (
      <div>
        <Typography variant="body2" color="text.secondary">
          No book selected
        </Typography>
      </div>
    );
  }

  const book = (textData as any).books?.find(
    (b: any) => b.name === selectedBook,
  );
  const chapter = book?.chapters?.find((c: any) => c.chapter === chapterNumber);

  if (!book) {
    return (
      <div>
        <Typography variant="body2" color="text.secondary">
          Book "{selectedBook}" not found in text.json
        </Typography>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div>
        <Typography variant="body2" color="text.secondary">
          Chapter {chapterNumber} not found for {selectedBook}
        </Typography>
      </div>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {chapter.name}
        </Typography>
        <Box>
          {chapter.verses.map((v: any) => (
            <Typography key={v.name} variant="body2" color="text.secondary">
              <strong>{v.verse}. </strong>
              {v.text}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
