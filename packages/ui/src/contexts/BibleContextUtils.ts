import { Dispatch, SetStateAction } from "react";
import { TabState } from "./BibleTypes";

// Maximum number of tabs allowed
export const MAX_TAB_LIMIT = 10;
let tabIdCounter = 0;

export const createTabId = () => `tab-${++tabIdCounter}`;

export const createHomeTab = (): TabState => ({
  id: createTabId(),
  mode: "home",
  selectedBook: null,
  chapterNumber: 1,
  verseNumber: null,
  articleId: null,
});

export const createBibleTab = (
  book: string,
  chapterNumber: number,
  verseNumber: number | null = null,
): TabState => ({
  id: createTabId(),
  mode: "bible",
  selectedBook: book,
  chapterNumber,
  verseNumber,
  articleId: null,
});

export const createArticleTab = (articleId: string): TabState => ({
  id: createTabId(),
  mode: "article",
  selectedBook: null,
  chapterNumber: 1,
  verseNumber: null,
  articleId,
});

export const createSearchTab = (searchQuery: string): TabState => ({
  id: createTabId(),
  mode: "search",
  selectedBook: null,
  chapterNumber: 1,
  verseNumber: null,
  articleId: null,
  searchQuery,
});

// Parse a hash of the form #book:chapter[:verse] and return normalized values
// Accepts a list of candidate books and an optional default list to fall back to
export const parseHash = (
  hash: string,
  books: string[],
  defaultBooks: string[] = [],
) => {
  if (!hash) return null;
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const parts = raw.split(":");
  if (parts.length < 1 || parts.length > 3) return null;
  // decode URI components (allow %20 for spaces) and replace +, _ and - with space
  // allow users to use +, underscore or hyphen as space separators in the book name
  const bookRaw = decodeURIComponent(
    parts[0].replace(/\+/g, " ").replace(/[_-]/g, " "),
  ).trim();
  const chapterRaw = (parts[1] || "1").trim();
  const chapter = parseInt(chapterRaw, 10);
  if (Number.isNaN(chapter) || chapter < 1) return null;
  const verseRaw = (parts[2] || "").trim();
  let verse: number | null = null;
  if (verseRaw) {
    const parsedVerse = parseInt(verseRaw, 10);
    if (Number.isNaN(parsedVerse) || parsedVerse < 1) return null;
    verse = parsedVerse;
  }

  const searchBooks = books && books.length ? books : defaultBooks;
  const match = searchBooks.find(
    (b) =>
      b && typeof b === "string" && b.toLowerCase() === bookRaw.toLowerCase(),
  );
  if (!match) return null;
  return {
    book: match,
    chapter,
    verseNumber: verse,
  } as { book: string; chapter: number; verseNumber: number | null };
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

const ensureHomeTabAtStart = (tabs: TabState[]): TabState[] => {
  if (tabs.length === 0) return [createHomeTab()];
  if (tabs[0].mode === "home") return tabs;

  const existingHomeIndex = tabs.findIndex((tab) => tab.mode === "home");
  if (existingHomeIndex >= 0) {
    const next = [...tabs];
    const [homeTab] = next.splice(existingHomeIndex, 1);
    return [homeTab, ...next];
  }

  return [createHomeTab(), ...tabs];
};

export const addTab = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  maxLimit = MAX_TAB_LIMIT,
) => {
  setTabs((prev) => {
    const normalizedPrev = ensureHomeTabAtStart(prev);
    if (normalizedPrev.length >= maxLimit) return normalizedPrev;
    const next: TabState[] = [...normalizedPrev, createHomeTab()];
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
    const normalizedPrev = ensureHomeTabAtStart(prev);
    if (i <= 0) {
      setCurrentTab(0);
      return normalizedPrev;
    }
    if (normalizedPrev.length <= 1) {
      setCurrentTab(0);
      return [createHomeTab()];
    }
    const next = normalizedPrev.filter((_, idx) => idx !== i);
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
  setLastFileSyncDate: (d: Date | undefined) => void,
  lastFileSyncDate: Date | undefined,
  tabId: number,
  patch: Partial<TabState>,
) => {
  setTabs((prev) =>
    prev.map((t, idx) => (idx === tabId ? { ...t, ...patch } : t)),
  );
  if (lastFileSyncDate) setLastFileSyncDate(new Date());
};

export const moveTab = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  fromIndex: number,
  toIndex: number,
) => {
  setTabs((prev) => {
    const normalizedPrev = ensureHomeTabAtStart(prev);
    if (
      fromIndex === toIndex ||
      fromIndex === 0 ||
      toIndex === 0 ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= normalizedPrev.length ||
      toIndex >= normalizedPrev.length
    ) {
      return normalizedPrev;
    }

    const next = [...normalizedPrev];
    const [movedTab] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, movedTab);

    setCurrentTab((current) => {
      if (current === fromIndex) return toIndex;
      if (fromIndex < current && toIndex >= current) return current - 1;
      if (fromIndex > current && toIndex <= current) return current + 1;
      return current;
    });

    return next;
  });
};

export const openTabForBookChapter = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  book: string,
  chapterNumber: number,
  verseNumber: number | null = null,
  maxLimit = MAX_TAB_LIMIT,
) => {
  setTabs((prev) => {
    const normalizedPrev = ensureHomeTabAtStart(prev);
    const existingIndex = normalizedPrev.findIndex(
      (t) =>
        t.mode === "bible" &&
        t.selectedBook === book &&
        t.chapterNumber === chapterNumber,
    );
    if (existingIndex >= 0) {
      setCurrentTab(existingIndex);
      return normalizedPrev.map((tab, index) =>
        index === existingIndex ? { ...tab, verseNumber } : tab,
      );
    }
    if (normalizedPrev.length >= maxLimit) return normalizedPrev;
    const next: TabState[] = [
      ...normalizedPrev,
      createBibleTab(book, chapterNumber, verseNumber),
    ];
    setCurrentTab(next.length - 1);
    return next;
  });
};

export const openTabForArticle = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  articleId: string,
  maxLimit = MAX_TAB_LIMIT,
) => {
  const normalizedId = normalizeArticleId(articleId);
  if (!normalizedId) return;

  setTabs((prev) => {
    const normalizedPrev = ensureHomeTabAtStart(prev);
    const existingIndex = normalizedPrev.findIndex(
      (tab) =>
        tab.mode === "article" &&
        articleIdsMatch(tab.articleId ?? "", normalizedId),
    );
    if (existingIndex >= 0) {
      setCurrentTab(existingIndex);
      return normalizedPrev;
    }
    if (normalizedPrev.length >= maxLimit) return normalizedPrev;

    const next: TabState[] = [
      ...normalizedPrev,
      createArticleTab(normalizedId),
    ];
    setCurrentTab(next.length - 1);
    return next;
  });
};

export const openTabForSearch = (
  setTabs: SetTabs,
  setCurrentTab: SetCurrentTab,
  searchQuery: string,
  maxLimit = MAX_TAB_LIMIT,
) => {
  const normalizedQuery = searchQuery.trim();
  if (!normalizedQuery) return;

  setTabs((prev) => {
    const normalizedPrev = ensureHomeTabAtStart(prev);
    const existingIndex = normalizedPrev.findIndex(
      (tab) =>
        tab.mode === "search" &&
        (tab.searchQuery ?? "").trim().toLowerCase() ===
          normalizedQuery.toLowerCase(),
    );
    if (existingIndex >= 0) {
      setCurrentTab(existingIndex);
      return normalizedPrev;
    }
    if (normalizedPrev.length >= maxLimit) return normalizedPrev;

    const next: TabState[] = [
      ...normalizedPrev,
      createSearchTab(normalizedQuery),
    ];
    setCurrentTab(next.length - 1);
    return next;
  });
};
