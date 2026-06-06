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
}

export interface NoteEntry {
  book: string | null;
  chapterNumber: number;
  text: string;
}

export interface BibleContextType {
  tabs: TabState[];
  currentTab: number;
  setCurrentTab: (index: number) => void;
  addTab: () => void;
  closeTab: (index: number) => void;
  updateTab: (index: number, patch: Partial<TabState>) => void;
  books: string[];
  notes: NoteEntry[];
  refreshNotesDate: Date;
  setRefreshNotesDate: (date: Date) => void;
  setNoteForBookChapter: (
    book: string | null,
    chapterNumber: number,
    text: string,
  ) => void;
  replaceAllNotes: (entries: NoteEntry[]) => void;
}

export const BibleContext = createContext<BibleContextType>({
  tabs: [
    {
      selectedBook: "Matthew",
      chapterNumber: 1,
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
  notes: [{ book: "Matthew", chapterNumber: 1, text: "" }],
  // if file loads refresh the date
  refreshNotesDate: new Date(),
  setRefreshNotesDate: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setNoteForBookChapter: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  replaceAllNotes: () => {},
});

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabs, setTabs] = useState<TabState[]>([
    { selectedBook: "Matthew", chapterNumber: 1 },
  ]);
  const [notes, setNotes] = useState<NoteEntry[]>([
    { book: "Matthew", chapterNumber: 1, text: "" },
  ]);
  const [refreshNotesDate, setRefreshNotesDate] = useState<Date>(new Date());
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

  const updateTab = (tabId: number, patch: Partial<TabState>) => {
    setTabs((prev) =>
      prev.map((t, idx) => (idx === tabId ? { ...t, ...patch } : t)),
    );
    setRefreshNotesDate(new Date());
  };

  const setNoteForBookChapter = (
    book: string | null,
    chapterNumber: number,
    text: string,
  ) => {
    setNotes((previousEntries) => {
      // find existing note for same book and chapter
      const existingIndex = previousEntries.findIndex(
        (entry) => entry.book === book && entry.chapterNumber === chapterNumber,
      );
      if (existingIndex >= 0) {
        const next = previousEntries.map((entry, idx) =>
          idx === existingIndex ? { ...entry, text } : entry,
        );
        return next;
      }
      // otherwise append
      return [...previousEntries, { book, chapterNumber, text }];
    });
    setRefreshNotesDate(new Date());
  };

  const replaceAllNotes = (entries: NoteEntry[]) => {
    setNotes(entries ?? []);
    setRefreshNotesDate(new Date());
  };

  return (
    <BibleContext.Provider
      value={{
        tabs,
        currentTab,
        setCurrentTab,
        addTab,
        closeTab,
        updateTab,
        books: BIBLE_BOOKS,
        notes,
        refreshNotesDate,
        setRefreshNotesDate,
        setNoteForBookChapter,
        replaceAllNotes,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export default BibleContext;
