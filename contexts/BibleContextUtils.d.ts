import { Dispatch, SetStateAction } from "react";
import { TabState } from "./BibleTypes";
export declare const MAX_TAB_LIMIT = 10;
export declare const parseHash: (hash: string, books: string[], defaultBooks?: string[]) => {
    book: string;
    chapter: number;
} | null;
type SetTabs = Dispatch<SetStateAction<TabState[]>>;
type SetCurrentTab = Dispatch<SetStateAction<number>>;
export declare const addTab: (setTabs: SetTabs, setCurrentTab: SetCurrentTab, maxLimit?: number) => void;
export declare const closeTab: (setTabs: SetTabs, setCurrentTab: SetCurrentTab, i: number) => void;
export declare const updateTab: (setTabs: SetTabs, setRefreshNotesDate: (d: Date | undefined) => void, refreshNotesDate: Date | undefined, tabId: number, patch: Partial<TabState>) => void;
export declare const openTabForBookChapter: (setTabs: SetTabs, setCurrentTab: SetCurrentTab, book: string, chapterNumber: number, maxLimit: number | undefined, setEditorOpen: (open: boolean) => void, editorOpen: boolean) => void;
export {};
//# sourceMappingURL=BibleContextUtils.d.ts.map