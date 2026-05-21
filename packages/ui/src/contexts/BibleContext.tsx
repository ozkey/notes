import React, { createContext, useState } from "react";

// List of common 66 books of the Protestant Bible
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
  setSelectedBook: (b: string | null) => void;
  books: string[];
}

export const BibleContext = createContext<BibleContextType>({
  selectedBook: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedBook: () => {},
  books: BIBLE_BOOKS,
});

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  return (
    <BibleContext.Provider value={{ selectedBook, setSelectedBook, books: BIBLE_BOOKS }}>
      {children}
    </BibleContext.Provider>
  );
};

export default BibleContext;


