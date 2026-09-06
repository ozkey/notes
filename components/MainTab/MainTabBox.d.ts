import React from "react";
interface NotesPanelProps {
    mode: "bible" | "article" | "search";
    selectedBook: string | null;
    chapterNumber: number;
    verseNumber?: number | null;
    searchQuery?: string | null;
}
export declare const MainTabBox: React.FC<NotesPanelProps>;
export {};
//# sourceMappingURL=MainTabBox.d.ts.map