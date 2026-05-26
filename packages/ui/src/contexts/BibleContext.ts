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

export interface TabState {
  selectedBook: string | null;
  chapterNumber: number;
  notes: string;
}

export interface BibleContextType {
  tabs: TabState[];
  currentTab: number;
  setCurrentTab: (i: number) => void;
  addTab: () => void;
  closeTab: (i: number) => void;
  updateTab: (i: number, patch: Partial<TabState>) => void;
  books: string[];
}

export const BibleContext = createContext<BibleContextType>({
  tabs: [
    {
      selectedBook: "Matthew",
      chapterNumber: 1,
      notes: "",
    },
  ],
  currentTab: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCurrentTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateTab: () => {},
  books: BIBLE_BOOKS,
});

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabs, setTabs] = useState<TabState[]>([
    { selectedBook: "Matthew", chapterNumber: 1, notes: "" },
  ]);
  const [currentTab, setCurrentTab] = useState<number>(0);

  const addTab = () => {
    setTabs((prev) => {
      if (prev.length >= 4) return prev;
      const next = [
        ...prev,
        { selectedBook: null, chapterNumber: 1, notes: "" },
      ];
      setCurrentTab(next.length - 1);
      return next;
    });
  };

  const closeTab = (i: number) => {
    setTabs((prev) => {
      if (prev.length <= 1) return prev; // keep at least one
      const next = prev.filter((_, idx) => idx !== i);
      setCurrentTab((cur) => {
        if (i < cur) return cur - 1;
        if (i === cur) return Math.max(0, cur - 1);
        return cur;
      });
      return next;
    });
  };

  const updateTab = (i: number, patch: Partial<TabState>) => {
    setTabs((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    );
  };

  // Return without JSX to keep file .ts
  return React.createElement(
    BibleContext.Provider,
    {
      value: {
        tabs,
        currentTab,
        setCurrentTab,
        addTab,
        closeTab,
        updateTab,
        books: BIBLE_BOOKS,
      },
    },
    children,
  );
};

export default BibleContext;
