import React, { createContext, useState, useRef, useEffect } from "react";
import {
  saveNotesToFile as saveNotesToFileImpl,
  loadNotesFromFile as loadNotesFromFileImpl,
} from "./notesFileIO";

import {
  TabState,
  NoteEntry,
  ArticleEntry,
  HighlightData,
  HighlightColor,
} from "./BibleTypes";
import {
  parseHash as parseHashUtil,
  addTab as addTabUtil,
  closeTab as closeTabUtil,
  createArticleTab,
  createHomeTab,
  moveTab as moveTabUtil,
  updateTab as updateTabUtil,
  openTabForBookChapter as openTabForBookChapterUtil,
  articleIdsMatch,
  normalizeArticleId,
  MAX_TAB_LIMIT,
} from "./BibleContextUtils";
import {
  BIBLE_TRANSLATIONS,
  DEFAULT_BIBLE_TRANSLATION,
  BibleTranslationId,
  BibleTranslationOption,
  fetchBibleText,
} from "./bibleTextLoader";
import {
  setNoteForBookChapter as setNoteForBookChapterUtil,
  replaceAllNotes as replaceAllNotesUtil,
  setArticleById as setArticleByIdUtil,
  replaceAllArticles as replaceAllArticlesUtil,
  setHighlight as setHighlightUtil,
  removeHighlight as removeHighlightUtil,
  getHighlights as getHighlightsUtil,
} from "./notesUtils";

// List of common 66 books of the Protestant Bible
export const BIBLE_BOOKS: string[] = ["Genesis", "Revelation"];

export interface BibleContextType {
  tabs: TabState[];
  currentTab: number;
  setCurrentTab: (index: number) => void;
  addTab: () => void;
  closeTab: (index: number) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  updateTab: (index: number, patch: Partial<TabState>) => void;
  books: string[];
  notes: NoteEntry[];
  articles: ArticleEntry[];
  lastFileSyncDate: Date | undefined;
  setLastFileSyncDate: (date: Date) => void;
  hasUnsavedChanges: boolean;
  setNoteForBookChapter: (
    book: string | null,
    chapterNumber: number,
    text: string,
  ) => void;
  setArticleById: (id: string, text: string) => void;
  replaceAllNotes: (entries: NoteEntry[]) => void;
  replaceAllArticles: (entries: ArticleEntry[]) => void;
  openHomeInCurrentTab: () => void;
  openBibleInCurrentTab: (
    book: string,
    chapterNumber: number,
    verseNumber?: number | null,
  ) => void;
  openArticleInCurrentTab: (articleId: string) => void;
  openSearchInCurrentTab: (searchQuery: string) => void;
  // parsed bible text loaded from public/Douay-Rheims.json
  bibleText: any | null;
  loadingBibleText: boolean;
  loadBibleText: (translationId?: BibleTranslationId) => Promise<void>;
  bibleTranslations: BibleTranslationOption[];
  selectedBibleTranslation: BibleTranslationId;
  setSelectedBibleTranslation: (translationId: BibleTranslationId) => void;
  saveNotesToFile: () => Promise<void>;
  loadNotesFromFile: () => Promise<void>;
  // editor UI state (moved from component-local state into context)
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  // highlight methods
  setHighlight: (
    book: string | null,
    chapterNumber: number,
    verse: number,
    color: HighlightColor,
  ) => void;
  removeHighlight: (
    book: string | null,
    chapterNumber: number,
    verse: number,
  ) => void;
  getHighlights: (
    book: string | null,
    chapterNumber: number,
  ) => HighlightData[];
}

export const BibleReferenceContext = createContext<{
  tabs: TabState[];
  currentTab: number;
  bibleText: any | null;
}>({
  tabs: [
    {
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: null,
      searchQuery: null,
    },
  ],
  currentTab: 0,
  bibleText: null,
});

export const BibleContext = createContext<BibleContextType>({
  tabs: [
    {
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: null,
      searchQuery: null,
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
  moveTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateTab: () => {},
  books: BIBLE_BOOKS,
  notes: [{ book: "Matthew", chapterNumber: 1, text: "" }],
  articles: [],
  // if file loads refresh the date
  lastFileSyncDate: undefined,
  setLastFileSyncDate: () => {},
  hasUnsavedChanges: false,
  // bible text defaults
  bibleText: null,
  loadingBibleText: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadBibleText: async () => {},
  bibleTranslations: BIBLE_TRANSLATIONS,
  selectedBibleTranslation: DEFAULT_BIBLE_TRANSLATION,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedBibleTranslation: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setNoteForBookChapter: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setArticleById: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  replaceAllNotes: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  replaceAllArticles: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openHomeInCurrentTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openBibleInCurrentTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openArticleInCurrentTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openSearchInCurrentTab: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  saveNotesToFile: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadNotesFromFile: async () => {},
  // editor default
  editorOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setEditorOpen: () => {},
  // highlight defaults
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHighlight: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeHighlight: () => {},
  getHighlights: () => [],
});

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabs, setTabs] = useState<TabState[]>([
    createHomeTab(),
  ]);
  const [notes, setNotes] = useState<NoteEntry[]>([
    { book: "Matthew", chapterNumber: 1, text: "" },
  ]);
  const [articles, setArticles] = useState<ArticleEntry[]>([]);
  // books are populated from the API at runtime; default to the static list
  const [books, setBooks] = useState<string[]>([]);
  const [lastFileSyncDate, setLastFileSyncDate] = useState<Date | undefined>(
    undefined,
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Move editor open state into the context so multiple components can control it
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [bibleText, setBibleText] = useState<any | null>(null);
  const [loadingBibleText, setLoadingBibleText] = useState<boolean>(false);
  const [selectedBibleTranslation, setSelectedBibleTranslation] =
    useState<BibleTranslationId>(DEFAULT_BIBLE_TRANSLATION);
  // Keep a file handle so save/load can reuse the same file when supported by the
  // File System Access API.
  const fileHandleRef = useRef<any>(null);

  // Load bible text and book list from the API on mount.
  // The API is expected to return the same structure as the local Douay-Rheims.json, e.g.
  // { books: [ { name: 'Genesis', chapters: [...] }, ... ] }
  const loadBibleText = async (
    translationId: BibleTranslationId = selectedBibleTranslation,
  ) => {
    try {
      setLoadingBibleText(true);
      const { bibleText: text, bookNames } =
        await fetchBibleText(translationId);
      setSelectedBibleTranslation(translationId);
      setBibleText(text);
      if (bookNames.length > 0) {
        setBooks(bookNames);
        // Ensure a canonical copy is available on window for other code to reuse.
        if (!(window as any).BIBLE_BOOKS)
          (window as any).BIBLE_BOOKS = bookNames;
      }
    } catch (err) {
      console.warn("Error fetching bible text from API", err);
      setBibleText(null);
    } finally {
      setLoadingBibleText(false);
    }
  };

  useEffect(() => {
    loadBibleText(DEFAULT_BIBLE_TRANSLATION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // tab helpers (delegated to utils)
  const addTab = () => addTabUtil(setTabs, setCurrentTab, MAX_TAB_LIMIT);
  const closeTab = (i: number) => closeTabUtil(setTabs, setCurrentTab, i);
  const moveTab = (fromIndex: number, toIndex: number) =>
    moveTabUtil(setTabs, setCurrentTab, fromIndex, toIndex);
  const updateTab = (tabId: number, patch: Partial<TabState>) =>
    updateTabUtil(setTabs, setLastFileSyncDate, lastFileSyncDate, tabId, patch);

  // Listen for URL hash changes and open/switch tabs when a valid #book:chapter is present.
  useEffect(() => {
    const clearLocationHash = () => {
      if (!window.location.hash) return;
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    };

    const handleHash = () => {
      if (!window.location.hash) return;

      try {
        const rawHash = decodeURIComponent(
          window.location.hash.startsWith("#")
            ? window.location.hash.slice(1)
            : window.location.hash,
        ).trim();

        if (!rawHash) {
          clearLocationHash();
          return;
        }

        const matchedArticle = articles.find((article) =>
          articleIdsMatch(article.id, rawHash),
        );

        if (matchedArticle) {
          setTabs((previousTabs) => {
            if (previousTabs.length >= MAX_TAB_LIMIT) return previousTabs;
            const nextTabs: TabState[] = [
              ...previousTabs,
              createArticleTab(matchedArticle.id),
            ];
            setCurrentTab(nextTabs.length - 1);
            return nextTabs;
          });
          setEditorOpen(true);
          clearLocationHash();
          return;
        }

        const parsed = parseHashUtil(
          window.location.hash,
          books.length > 0
            ? books
            : (((window as Window & { BIBLE_BOOKS?: string[] }).BIBLE_BOOKS ||
                []) as string[]),
        );
        if (parsed)
          openTabForBookChapterUtil(
            setTabs,
            setCurrentTab,
            parsed.book,
            parsed.chapter,
            parsed.verseNumber,
            MAX_TAB_LIMIT,
          );
        if (parsed) clearLocationHash();
      } catch (e) {
        // ignore malformed hashes
      }
    };

    // check initial hash on mount
    handleHash();

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, articles]);

  const setNoteForBookChapter = (
    book: string | null,
    chapterNumber: number,
    text: string,
  ) => {
    setNoteForBookChapterUtil(setNotes, book, chapterNumber, text);
    setHasUnsavedChanges(true);
  };

  const replaceAllNotes = (entries: NoteEntry[]) =>
    replaceAllNotesUtil(setNotes, setLastFileSyncDate, entries);

  const setArticleById = (id: string, text: string) => {
    setArticleByIdUtil(setArticles, id, text);
    setHasUnsavedChanges(true);
  };

  const replaceAllArticles = (entries: ArticleEntry[]) =>
    replaceAllArticlesUtil(setArticles, setLastFileSyncDate, entries);

  const openHomeInCurrentTab = () =>
    updateTab(currentTab, {
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: null,
      searchQuery: null,
    });

  const openBibleInCurrentTab = (
    book: string,
    chapterNumber: number,
    verseNumber: number | null = null,
  ) =>
    updateTab(currentTab, {
      mode: "bible",
      selectedBook: book,
      chapterNumber,
      verseNumber,
      articleId: null,
      searchQuery: null,
    });

  const openArticleInCurrentTab = (articleId: string) => {
    const normalizedId = normalizeArticleId(articleId);
    if (!normalizedId) return;
    setArticles((previous) => {
      const exists = previous.some((entry) =>
        articleIdsMatch(entry.id, normalizedId),
      );
      if (exists) return previous;
      return [...previous, { id: normalizedId, text: "" }];
    });
    updateTab(currentTab, {
      mode: "article",
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: normalizedId,
      searchQuery: null,
    });
    setEditorOpen(true);
  };

  const openSearchInCurrentTab = (searchQuery: string) =>
    updateTab(currentTab, {
      mode: "search",
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: null,
      searchQuery,
    });

  const setHighlight = (
    book: string | null,
    chapterNumber: number,
    verse: number,
    color: any,
  ) => {
    setHighlightUtil(setNotes, book, chapterNumber, verse, color);
    setHasUnsavedChanges(true);
  };

  const removeHighlight = (
    book: string | null,
    chapterNumber: number,
    verse: number,
  ) => {
    removeHighlightUtil(setNotes, book, chapterNumber, verse);
    setHasUnsavedChanges(true);
  };

  const getHighlights = (book: string | null, chapterNumber: number) =>
    getHighlightsUtil(notes, book, chapterNumber);

  // Use the extracted functions from notesFileIO. Provide small local wrappers
  // so the context value can pass functions with the expected signatures.
  const saveNotesToFile = async () => {
    await saveNotesToFileImpl(notes, articles, fileHandleRef);
    setLastFileSyncDate(new Date());
    setHasUnsavedChanges(false);
  };

  const loadNotesFromFile = async () => {
    await loadNotesFromFileImpl(
      fileHandleRef,
      replaceAllNotes,
      replaceAllArticles,
    );
    setHasUnsavedChanges(false);
  };

  const bibleContextValue = React.useMemo(
    () => ({
      tabs,
      currentTab,
      setCurrentTab,
      addTab,
      closeTab,
      updateTab,
      books,
      notes,
      articles,
      lastFileSyncDate,
      setLastFileSyncDate,
      hasUnsavedChanges,
      setNoteForBookChapter,
      setArticleById,
      replaceAllNotes,
      replaceAllArticles,
      openHomeInCurrentTab,
      openBibleInCurrentTab,
      openArticleInCurrentTab,
      openSearchInCurrentTab,
      moveTab,
      // editor UI state exposed in context
      editorOpen,
      setEditorOpen,
      bibleText,
      loadingBibleText,
      loadBibleText,
      bibleTranslations: BIBLE_TRANSLATIONS,
      selectedBibleTranslation,
      setSelectedBibleTranslation,
      saveNotesToFile,
      loadNotesFromFile,
      setHighlight,
      removeHighlight,
      getHighlights,
    }),
    [
      addTab,
      articles,
      bibleText,
      books,
      closeTab,
      currentTab,
      editorOpen,
      getHighlights,
      hasUnsavedChanges,
      loadBibleText,
      loadNotesFromFile,
      loadingBibleText,
      notes,
      openArticleInCurrentTab,
      openBibleInCurrentTab,
      openHomeInCurrentTab,
      openSearchInCurrentTab,
      lastFileSyncDate,
      moveTab,
      removeHighlight,
      replaceAllArticles,
      replaceAllNotes,
      saveNotesToFile,
      selectedBibleTranslation,
      setArticleById,
      setCurrentTab,
      setEditorOpen,
      setHighlight,
      setNoteForBookChapter,
      setLastFileSyncDate,
      setSelectedBibleTranslation,
      tabs,
      updateTab,
    ],
  );

  const bibleReferenceContextValue = React.useMemo(
    () => ({
      tabs,
      currentTab,
      bibleText,
    }),
    [currentTab, tabs, bibleText],
  );

  return (
    <BibleContext.Provider value={bibleContextValue}>
      <BibleReferenceContext.Provider value={bibleReferenceContextValue}>
        {children}
      </BibleReferenceContext.Provider>
    </BibleContext.Provider>
  );
};

export default BibleContext;
