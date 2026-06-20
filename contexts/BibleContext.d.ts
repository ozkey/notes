import React from "react";
import { TabState, NoteEntry } from "./BibleTypes";
export declare const BIBLE_BOOKS: string[];
export interface BibleContextType {
    tabs: TabState[];
    currentTab: number;
    setCurrentTab: (index: number) => void;
    addTab: () => void;
    closeTab: (index: number) => void;
    updateTab: (index: number, patch: Partial<TabState>) => void;
    books: string[];
    notes: NoteEntry[];
    refreshNotesDate: Date | undefined;
    setRefreshNotesDate: (date: Date) => void;
    setNoteForBookChapter: (book: string | null, chapterNumber: number, text: string) => void;
    replaceAllNotes: (entries: NoteEntry[]) => void;
    bibleText: any | null;
    loadingBibleText: boolean;
    loadBibleText: () => Promise<void>;
    saveNotesToFile: () => Promise<void>;
    loadNotesFromFile: () => Promise<void>;
    editorOpen: boolean;
    setEditorOpen: (open: boolean) => void;
}
export declare const BibleContext: React.Context<BibleContextType>;
export declare const BibleProvider: React.FC<{
    children: React.ReactNode;
}>;
export default BibleContext;
//# sourceMappingURL=BibleContext.d.ts.map