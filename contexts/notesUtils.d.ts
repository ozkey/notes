import { Dispatch, SetStateAction } from "react";
import { NoteEntry } from "./BibleTypes";
type SetNotes = Dispatch<SetStateAction<NoteEntry[]>>;
/**
 * Updates an existing note for the given book/chapter or appends a new one.
 */
export declare const setNoteForBookChapter: (setNotes: SetNotes, book: string | null, chapterNumber: number, text: string) => void;
/**
 * Replaces all notes with the given entries and updates the refresh date.
 */
export declare const replaceAllNotes: (setNotes: SetNotes, setRefreshNotesDate: (date: Date) => void, entries: NoteEntry[]) => void;
export {};
//# sourceMappingURL=notesUtils.d.ts.map