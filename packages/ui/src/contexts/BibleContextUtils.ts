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

export const normalizeArticleId = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/^#/, "")
    .replace(/[+_\s-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
};

export const articleIdsMatch = (left: string, right: string) =>
  normalizeArticleId(left).toLowerCase() ===
  normalizeArticleId(right).toLowerCase();

type SetTabs = Dispatch<SetStateAction<TabState[]>>;
type SetCurrentTab = Dispatch<SetStateAction<number>>;

export const addTab = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  maxLimit = MAX_TAB_LIMIT,
) => {
  setTabs((prev) => {
    if (prev.length >= maxLimit) return prev;
    const next: TabState[] = [
      ...prev,
      { mode: "home", selectedBook: null, chapterNumber: 1, articleId: null },
    ];
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
    if (prev.length <= 1) {
      setCurrentTab(0);
      return [
        {
          mode: "home",
          selectedBook: null,
          chapterNumber: 1,
          articleId: null,
        },
      ];
    }
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
) => {
  setTabs((prev) => {
    const existingIndex = prev.findIndex(
      (t) =>
        t.mode === "bible" &&
        t.selectedBook === book &&
        t.chapterNumber === chapterNumber,
    );
    if (existingIndex >= 0) {
      setCurrentTab(existingIndex);
      return prev;
    }
    if (prev.length >= maxLimit) return prev;
    const next: TabState[] = [
      ...prev,
      { mode: "bible", selectedBook: book, chapterNumber, articleId: null },
    ];
    setCurrentTab(next.length - 1);
    return next;
  });
};
