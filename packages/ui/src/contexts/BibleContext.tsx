import React, { createContext, useState, useRef } from "react";
import {
  saveNotesToFile as saveNotesToFileImpl,
  loadNotesFromFile as loadNotesFromFileImpl,
} from "./notesFileIO";

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
  saveNotesToFile: () => Promise<void>;
  loadNotesFromFile: () => Promise<void>;
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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  saveNotesToFile: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadNotesFromFile: async () => {},
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
  // Keep a file handle so save/load can reuse the same file when supported by the
  // File System Access API.
  const fileHandleRef = useRef<any>(null);

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
    // makes the editor reset as you type
    // setRefreshNotesDate(new Date());
  };

  const replaceAllNotes = (entries: NoteEntry[]) => {
    setNotes(entries ?? []);
    setRefreshNotesDate(new Date());
  };

  // Use the extracted functions from notesFileIO. Provide small local wrappers
  // so the context value can pass functions with the expected signatures.
  const saveNotesToFile = async () => {
    await saveNotesToFileImpl(notes, fileHandleRef);
  };

  const loadNotesFromFile = async () => {
    await loadNotesFromFileImpl(fileHandleRef, replaceAllNotes);
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
          saveNotesToFile,
          loadNotesFromFile,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export default BibleContext;
