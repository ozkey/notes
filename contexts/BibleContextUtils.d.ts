import { Dispatch, SetStateAction } from "react";
import { TabState } from "./BibleTypes";
export declare const MAX_TAB_LIMIT = 10;
export declare const createTabId: () => string;
export declare const createHomeTab: () => TabState;
export declare const createBibleTab: (book: string, chapterNumber: number, verseNumber?: number | null) => TabState;
export declare const createArticleTab: (articleId: string) => TabState;
export declare const createSearchTab: (searchQuery: string) => TabState;
export declare const parseHash: (hash: string, books: string[], defaultBooks?: string[]) => {
    book: string;
    chapter: number;
    verseNumber: number | null;
} | null;
export declare const normalizeArticleId: (raw: string) => string;
export declare const articleIdsMatch: (left: string, right: string) => boolean;
type SetTabs = Dispatch<SetStateAction<TabState[]>>;
type SetCurrentTab = Dispatch<SetStateAction<number>>;
export declare const addTab: (setTabs: SetTabs, setCurrentTab: SetCurrentTab, maxLimit?: number) => void;
export declare const closeTab: (setTabs: SetTabs, setCurrentTab: SetCurrentTab, i: number) => void;
export declare const updateTab: (setTabs: SetTabs, setLastFileSyncDate: (d: Date | undefined) => void, lastFileSyncDate: Date | undefined, tabId: number, patch: Partial<TabState>) => void;
export declare const moveTab: (setTabs: SetTabs, setCurrentTab: SetCurrentTab, fromIndex: number, toIndex: number) => void;
export declare const openTabForBookChapter: (setTabs: SetTabs, setCurrentTab: SetCurrentTab, book: string, chapterNumber: number, verseNumber?: number | null, maxLimit?: number) => void;
export {};
//# sourceMappingURL=BibleContextUtils.d.ts.map