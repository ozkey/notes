// Shared types used by Bible context and utilities
export interface TabState {
  selectedBook: string | null;
  chapterNumber: number;
}

export interface NoteEntry {
  book: string | null;
  chapterNumber: number;
  text: string;
}

