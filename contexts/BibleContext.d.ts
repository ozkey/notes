import React from "react";
import { TabState, NoteEntry, ArticleEntry, HighlightData, HighlightColor } from "./BibleTypes";
import { BibleTranslationId, BibleTranslationOption } from "./bibleTextLoader";
export declare const BIBLE_BOOKS: string[];
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
    setNoteForBookChapter: (book: string | null, chapterNumber: number, text: string) => void;
    setArticleById: (id: string, text: string) => void;
    replaceAllNotes: (entries: NoteEntry[]) => void;
    replaceAllArticles: (entries: ArticleEntry[]) => void;
    openHomeInCurrentTab: () => void;
    openBibleInCurrentTab: (book: string, chapterNumber: number, verseNumber?: number | null) => void;
    openArticleInCurrentTab: (articleId: string) => void;
    bibleText: any | null;
    loadingBibleText: boolean;
    loadBibleText: (translationId?: BibleTranslationId) => Promise<void>;
    bibleTranslations: BibleTranslationOption[];
    selectedBibleTranslation: BibleTranslationId;
    setSelectedBibleTranslation: (translationId: BibleTranslationId) => void;
    saveNotesToFile: () => Promise<void>;
    loadNotesFromFile: () => Promise<void>;
    editorOpen: boolean;
    setEditorOpen: (open: boolean) => void;
    setHighlight: (book: string | null, chapterNumber: number, verse: number, color: HighlightColor) => void;
    removeHighlight: (book: string | null, chapterNumber: number, verse: number) => void;
    getHighlights: (book: string | null, chapterNumber: number) => HighlightData[];
}
export declare const BibleReferenceContext: React.Context<{
    tabs: TabState[];
    currentTab: number;
    bibleText: any | null;
}>;
export declare const BibleContext: React.Context<BibleContextType>;
export declare const BibleProvider: React.FC<{
    children: React.ReactNode;
}>;
export default BibleContext;
//# sourceMappingURL=BibleContext.d.ts.map