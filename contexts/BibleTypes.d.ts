export type TabMode = "home" | "bible" | "article" | "search";
export interface TabState {
    id?: string;
    mode: TabMode;
    selectedBook: string | null;
    chapterNumber: number;
    verseNumber?: number | null;
    articleId?: string | null;
    searchQuery?: string | null;
}
export type HighlightColor = "green" | "blue" | "pink" | "red" | "orange" | "purple";
export interface HighlightData {
    verse: number;
    color: HighlightColor;
}
export interface NoteEntry {
    book: string | null;
    chapterNumber: number;
    text: string;
    highlights?: HighlightData[];
}
export interface ArticleEntry {
    id: string;
    text: string;
}
//# sourceMappingURL=BibleTypes.d.ts.map