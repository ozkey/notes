import React, { createContext, useState, useRef, useEffect } from "react";
import {
  saveNotesToFile as saveNotesToFileImpl,
  loadNotesFromFile as loadNotesFromFileImpl,
} from "./notesFileIO";

import { TabState, NoteEntry, ArticleEntry } from "./BibleTypes";
import {
  parseHash as parseHashUtil,
  addTab as addTabUtil,
  closeTab as closeTabUtil,
  updateTab as updateTabUtil,
  openTabForBookChapter as openTabForBookChapterUtil,
  MAX_TAB_LIMIT,
} from "./BibleContextUtils";
import { fetchBibleText } from "./bibleTextLoader";
import {
  setNoteForBookChapter as setNoteForBookChapterUtil,
  replaceAllNotes as replaceAllNotesUtil,
  setArticleById as setArticleByIdUtil,
  replaceAllArticles as replaceAllArticlesUtil,
} from "./notesUtils";

// List of common 66 books of the Protestant Bible
export const BIBLE_BOOKS: string[] = ["Genesis", "Revelation"];

export interface BibleContextType {
  tabs: TabState[];
  currentTab: number;
  setCurrentTab: (index: number) => void;
  addTab: () => void;
  closeTab: (index: number) => void;
  updateTab: (index: number, patch: Partial<TabState>) => void;
  books: string[];
  notes: NoteEntry[];
  articles: ArticleEntry[];
  refreshNotesDate: Date | undefined;
  setRefreshNotesDate: (date: Date) => void;
  setNoteForBookChapter: (
    book: string | null,
    chapterNumber: number,
    text: string,
  ) => void;
  setArticleById: (id: string, text: string) => void;
  replaceAllNotes: (entries: NoteEntry[]) => void;
  replaceAllArticles: (entries: ArticleEntry[]) => void;
  openHomeInCurrentTab: () => void;
  openBibleInCurrentTab: (book: string, chapterNumber: number) => void;
  openArticleInCurrentTab: (articleId: string) => void;
  // parsed bible text loaded from public/text.json
  bibleText: any | null;
  loadingBibleText: boolean;
  loadBibleText: () => Promise<void>;
  saveNotesToFile: () => Promise<void>;
  loadNotesFromFile: () => Promise<void>;
  // editor UI state (moved from component-local state into context)
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
}

export const BibleContext = createContext<BibleContextType>({
  tabs: [
    {
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      articleId: null,
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
  articles: [],
  // if file loads refresh the date
  refreshNotesDate: undefined,
  setRefreshNotesDate: () => {},
  // bible text defaults
  bibleText: null,
  loadingBibleText: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadBibleText: async () => {},
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
  saveNotesToFile: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadNotesFromFile: async () => {},
  // editor default
  editorOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setEditorOpen: () => {},
});

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabs, setTabs] = useState<TabState[]>([
    {
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      articleId: null,
    },
  ]);
  const [notes, setNotes] = useState<NoteEntry[]>([
    { book: "Matthew", chapterNumber: 1, text: "" },
  ]);
  const [articles, setArticles] = useState<ArticleEntry[]>([]);
  // books are populated from the API at runtime; default to the static list
  const [books, setBooks] = useState<string[]>([]);
  const [refreshNotesDate, setRefreshNotesDate] = useState<Date | undefined>(
    undefined,
  );
  // Move editor open state into the context so multiple components can control it
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [bibleText, setBibleText] = useState<any | null>(null);
  const [loadingBibleText, setLoadingBibleText] = useState<boolean>(false);
  // Keep a file handle so save/load can reuse the same file when supported by the
  // File System Access API.
  const fileHandleRef = useRef<any>(null);

  // Load bible text and book list from the API on mount.
  // The API is expected to return the same structure as the local text.json, e.g.
  // { books: [ { name: 'Genesis', chapters: [...] }, ... ] }
  const loadBibleText = async () => {
    try {
      setLoadingBibleText(true);
      const { bibleText: text, bookNames } = await fetchBibleText();
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
    loadBibleText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // tab helpers (delegated to utils)
  const addTab = () => addTabUtil(setTabs, setCurrentTab, MAX_TAB_LIMIT);
  const closeTab = (i: number) => closeTabUtil(setTabs, setCurrentTab, i);
  const updateTab = (tabId: number, patch: Partial<TabState>) =>
    updateTabUtil(setTabs, setRefreshNotesDate, refreshNotesDate, tabId, patch);

  // Listen for URL hash changes and open/switch tabs when a valid #book:chapter is present.
  useEffect(() => {
    const handleHash = () => {
      try {
        const rawHash = decodeURIComponent(
          window.location.hash.startsWith("#")
            ? window.location.hash.slice(1)
            : window.location.hash,
        ).trim();

        if (rawHash) {
          const articleHashCandidates = [
            rawHash,
            rawHash.startsWith("#") ? rawHash : `#${rawHash}`,
            rawHash.startsWith("#") ? rawHash.slice(1) : rawHash,
          ].filter(Boolean);

          const matchedArticle = articles.find((article) =>
            articleHashCandidates.some(
              (candidate) =>
                article.id.toLowerCase() === String(candidate).toLowerCase(),
            ),
          );

          if (matchedArticle) {
            setTabs((previousTabs) => {
              if (previousTabs.length >= MAX_TAB_LIMIT) return previousTabs;
              const nextTabs: TabState[] = [
                ...previousTabs,
                {
                  mode: "article",
                  selectedBook: null,
                  chapterNumber: 1,
                  articleId: matchedArticle.id,
                },
              ];
              setCurrentTab(nextTabs.length - 1);
              return nextTabs;
            });
            setEditorOpen(true);
            return;
          }
        }

        const parsed = parseHashUtil(window.location.hash, books, BIBLE_BOOKS);
        if (parsed)
          openTabForBookChapterUtil(
            setTabs,
            setCurrentTab,
            parsed.book,
            parsed.chapter,
            MAX_TAB_LIMIT,
          );
      } catch (e) {
        // ignore malformed hashes
      }
      // remove window hash
      window.location.hash = "";
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
  ) => setNoteForBookChapterUtil(setNotes, book, chapterNumber, text);

  const replaceAllNotes = (entries: NoteEntry[]) =>
    replaceAllNotesUtil(setNotes, setRefreshNotesDate, entries);

  const setArticleById = (id: string, text: string) =>
    setArticleByIdUtil(setArticles, id, text);

  const replaceAllArticles = (entries: ArticleEntry[]) =>
    replaceAllArticlesUtil(setArticles, setRefreshNotesDate, entries);

  const openHomeInCurrentTab = () =>
    updateTab(currentTab, {
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      articleId: null,
    });

  const openBibleInCurrentTab = (book: string, chapterNumber: number) =>
    updateTab(currentTab, {
      mode: "bible",
      selectedBook: book,
      chapterNumber,
      articleId: null,
    });

  const openArticleInCurrentTab = (articleId: string) => {
    const normalizedId = articleId.trim();
    if (!normalizedId) return;
    setArticles((previous) => {
      const exists = previous.some((entry) => entry.id === normalizedId);
      if (exists) return previous;
      return [...previous, { id: normalizedId, text: "" }];
    });
    updateTab(currentTab, {
      mode: "article",
      selectedBook: null,
      chapterNumber: 1,
      articleId: normalizedId,
    });
    setEditorOpen(true);
  };

  // Use the extracted functions from notesFileIO. Provide small local wrappers
  // so the context value can pass functions with the expected signatures.
  const saveNotesToFile = async () => {
    await saveNotesToFileImpl(notes, articles, fileHandleRef);
    // if (refreshNotesDate) - new file should update date
    setRefreshNotesDate(new Date());
  };

  const loadNotesFromFile = async () => {
    await loadNotesFromFileImpl(
      fileHandleRef,
      replaceAllNotes,
      replaceAllArticles,
    );
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
        books,
        notes,
        articles,
        refreshNotesDate,
        setRefreshNotesDate,
        setNoteForBookChapter,
        setArticleById,
        replaceAllNotes,
        replaceAllArticles,
        openHomeInCurrentTab,
        openBibleInCurrentTab,
        openArticleInCurrentTab,
        // editor UI state exposed in context
        editorOpen,
        setEditorOpen,
        bibleText,
        loadingBibleText,
        loadBibleText,
        saveNotesToFile,
        loadNotesFromFile,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export default BibleContext;
