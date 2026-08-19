// Shared types used by Bible context and utilities
export type TabMode = "home" | "bible" | "article";

export interface TabState {
  mode: TabMode;
  selectedBook: string | null;
  chapterNumber: number;
  verseNumber?: number | null;
  articleId?: string | null;
}

export type HighlightColor =
  | "green"
  | "blue"
  | "pink"
  | "red"
  | "orange"
  | "purple";

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
