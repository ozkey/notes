import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import React from "react";

import textData from "./text.json";
import { BookActions } from "../Editor/BookActions";

export const BibleText: React.FC<{
  selectedBook: string | null;
  chapterNumber: number;
}> = ({ selectedBook, chapterNumber }) => {
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

  const book = (textData as any).books?.find(
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
    <Card>
      <CardActions>
        <BookActions />
      </CardActions>
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
