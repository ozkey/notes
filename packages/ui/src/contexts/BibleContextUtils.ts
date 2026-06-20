import { Dispatch, SetStateAction } from "react";
import { TabState } from "./BibleTypes";

// Maximum number of tabs allowed
export const MAX_TAB_LIMIT = 10;

// Parse a hash of the form #book:chapter and return normalized book and chapter
// Accepts a list of candidate books and an optional default list to fall back to
export const parseHash = (
  hash: string,
  books: string[],
  defaultBooks: string[] = [],
) => {
  if (!hash) return null;
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const parts = raw.split(":");
  if (parts.length < 1) return null;
  // decode URI components (allow %20 for spaces) and replace +, _ and - with space
  // allow users to use +, underscore or hyphen as space separators in the book name
  const bookRaw = decodeURIComponent(
    parts[0].replace(/\+/g, " ").replace(/[_-]/g, " "),
  ).trim();
  const chapterRaw = (parts[1] || "1").trim();
  const chapter = parseInt(chapterRaw, 10);
  if (Number.isNaN(chapter) || chapter < 1) return null;

  const searchBooks = books && books.length ? books : defaultBooks;
  const match = searchBooks.find(
    (b) =>
      b && typeof b === "string" && b.toLowerCase() === bookRaw.toLowerCase(),
  );
  if (!match) return null;
  return { book: match, chapter } as { book: string; chapter: number };
};

type SetTabs = Dispatch<SetStateAction<TabState[]>>;
type SetCurrentTab = Dispatch<SetStateAction<number>>;

export const addTab = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  maxLimit = MAX_TAB_LIMIT,
) => {
  setTabs((prev) => {
    if (prev.length >= maxLimit) return prev;
    const next = [...prev, { selectedBook: null, chapterNumber: 1 }];
    setCurrentTab(next.length - 1);
    return next;
  });
};

export const closeTab = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  i: number,
) => {
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

export const updateTab = (
  setTabs: SetTabs,
  setRefreshNotesDate: (d: Date | undefined) => void,
  refreshNotesDate: Date | undefined,
  tabId: number,
  patch: Partial<TabState>,
) => {
  setTabs((prev) =>
    prev.map((t, idx) => (idx === tabId ? { ...t, ...patch } : t)),
  );
  if (refreshNotesDate) setRefreshNotesDate(new Date());
};

export const openTabForBookChapter = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  book: string,
  chapterNumber: number,
  maxLimit = MAX_TAB_LIMIT,
  setEditorOpen: (open: boolean) => void,
  editorOpen: boolean,
) => {
  setTabs((prev) => {
    const existingIndex = prev.findIndex(
      (t) => t.selectedBook === book && t.chapterNumber === chapterNumber,
    );
    debugger;
    if (existingIndex >= 0) {
      if (!editorOpen) {
        setCurrentTab(existingIndex);
        // i hope in future  to open but if editor it will through error
        // // focus on the first button
        // setEditorOpen(false);
        // // set setCurrentTab in 1 second
        // setTimeout(() => setCurrentTab(existingIndex), 1000);
      }
      return prev;
    }
    if (prev.length >= maxLimit) return prev;
    const next = [...prev, { selectedBook: book, chapterNumber }];

    if (!editorOpen) {
      //setEditorOpen(false);
      // setTimeout(() => setCurrentTab(next.length - 1), 1000);
      setCurrentTab(next.length - 1);
    }
    return next;
  });
};
