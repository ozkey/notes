import React, { createContext, useState, useRef } from "react";

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

  // Save current notes to a .json file. Uses the File System Access API when available,
  // otherwise falls back to creating a downloadable blob.
  const saveNotesToFile = async () => {
    const payload = {
      notes: notes,
      savedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(payload, null, 2);

    try {
      // @ts-ignore - feature-detect the newer File System Access API
      if (window.showSaveFilePicker) {
        // Use remembered handle if present, otherwise prompt once and remember it.
        // @ts-ignore
        let handle = fileHandleRef.current;
        if (!handle) {
          // @ts-ignore
          handle = await window.showSaveFilePicker({
            suggestedName: "notes.json",
            types: [
              {
                description: "Notes",
                accept: { "application/json": [".json"] },
              },
            ],
          });
          fileHandleRef.current = handle;
        }

        // Try to get (or request) write permission before creating writable.
        try {
          // @ts-ignore - some browsers implement queryPermission/requestPermission
          if (handle.queryPermission) {
            // @ts-ignore
            const perm = await handle.queryPermission({ mode: "readwrite" });
            if (perm !== "granted") {
              // @ts-ignore
              await handle.requestPermission({ mode: "readwrite" });
            }
          }
        } catch (permErr) {
          // ignore permission helper errors and continue to attempt write
          console.warn("Permission check failed:", permErr);
        }

        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
      } else {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "notes.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // user probably cancelled or an error occurred
      console.error("Failed to save notes:", err);
      alert("Saving notes was cancelled or failed.");
    }
  };

  // Load notes from a .json file and update the current tab's notes.
  const loadNotesFromFile = async () => {
    try {
      let file: File | null;

      // @ts-ignore
      if (window.showOpenFilePicker) {
        // @ts-ignore
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: "Notes",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        // Remember the handle so future saves can write back to the same file.
        fileHandleRef.current = handle;
        file = await handle.getFile();
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.click();

        file = await new Promise<File | null>((resolve) => {
          input.onchange = () => resolve(input.files ? input.files[0] : null);
        });
      }

      if (!file) return;

      const text = await file.text();

      console.log("text", text);
      const parsed = JSON.parse(text);

      // Normalized parsed -> entries array. Accept legacy formats:
      // - { notes: [...] }
      // - array of entries
      // - raw string (apply to current book/chapter would be ambiguous) -> wrap as a single note
      let loadedNotes: any[] = [];
      if (Array.isArray(parsed)) {
        loadedNotes = parsed;
      } else if (parsed && parsed.notes && Array.isArray(parsed.notes)) {
        loadedNotes = parsed.notes;
      } else if (typeof parsed === "string") {
        // wrap legacy single-string payload as a single-entry with no book/chapter
        loadedNotes = [{ book: null, chapterNumber: 1, text: parsed }];
      } else if (parsed && parsed.text) {
        // single note object
        loadedNotes = [parsed];
      }

      replaceAllNotes(loadedNotes as any[]);
    } catch (err) {
      console.error("Failed to load notes:", err);
      alert("Loading notes was cancelled or failed.");
    }
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
