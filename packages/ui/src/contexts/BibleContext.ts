import React, { createContext, useState } from "react";

export const BIBLE_BOOKS: string[] = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

export interface BibleContextType {
  selectedBook: string | null;
  setSelectedBook: (b: string ) => void;
  books: string[];
  chapterNumber: number;
  setChapterNumber: (n: number) => void;
}

export const BibleContext = createContext<BibleContextType>({
  selectedBook: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedBook: () => {},
  books: BIBLE_BOOKS,
  chapterNumber: 1,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setChapterNumber: () => {},
});

export const BibleProvider: React.FC<{ children: any }> = ({ children }) => {
  const [selectedBook, setSelectedBook] = useState<string>("Matthew");
  const [chapterNumber, setChapterNumber] = useState<number>(1);

  // Return without JSX so this file can remain .ts
  return React.createElement(BibleContext.Provider, { value: { selectedBook, setSelectedBook, books: BIBLE_BOOKS, chapterNumber, setChapterNumber } }, children);
};

export default BibleContext;
