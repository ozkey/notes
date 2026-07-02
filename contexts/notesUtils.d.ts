import { Dispatch, SetStateAction } from "react";
import { ArticleEntry, NoteEntry, HighlightColor, HighlightData } from "./BibleTypes";
type SetNotes = Dispatch<SetStateAction<NoteEntry[]>>;
type SetArticles = Dispatch<SetStateAction<ArticleEntry[]>>;
/**
 * Updates an existing note for the given book/chapter or appends a new one.
 */
export declare const setNoteForBookChapter: (setNotes: SetNotes, book: string | null, chapterNumber: number, text: string) => void;
/**
 * Replaces all notes with the given entries and updates the refresh date.
 */
export declare const replaceAllNotes: (setNotes: SetNotes, setRefreshNotesDate: (date: Date) => void, entries: NoteEntry[]) => void;
export declare const setArticleById: (setArticles: SetArticles, id: string, text: string) => void;
export declare const replaceAllArticles: (setArticles: SetArticles, setRefreshNotesDate: (date: Date) => void, entries: ArticleEntry[]) => void;
export declare const setHighlight: (setNotes: SetNotes, book: string | null, chapterNumber: number, verse: number, color: HighlightColor) => void;
export declare const removeHighlight: (setNotes: SetNotes, book: string | null, chapterNumber: number, verse: number) => void;
export declare const getHighlights: (notes: NoteEntry[], book: string | null, chapterNumber: number) => HighlightData[];
export {};
//# sourceMappingURL=notesUtils.d.ts.map