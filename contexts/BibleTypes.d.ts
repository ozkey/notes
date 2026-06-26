export type TabMode = "home" | "bible" | "article";
export interface TabState {
    mode: TabMode;
    selectedBook: string | null;
    chapterNumber: number;
    articleId?: string | null;
}
export interface NoteEntry {
    book: string | null;
    chapterNumber: number;
    text: string;
}
export interface ArticleEntry {
    id: string;
    text: string;
}
//# sourceMappingURL=BibleTypes.d.ts.map