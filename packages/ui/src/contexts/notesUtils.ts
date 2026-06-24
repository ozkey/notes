import { Dispatch, SetStateAction } from "react";
import { ArticleEntry, NoteEntry } from "./BibleTypes";

type SetNotes = Dispatch<SetStateAction<NoteEntry[]>>;
type SetArticles = Dispatch<SetStateAction<ArticleEntry[]>>;

/**
 * Updates an existing note for the given book/chapter or appends a new one.
 */
export const setNoteForBookChapter = (
  setNotes: SetNotes,
  book: string | null,
  chapterNumber: number,
  text: string,
) => {
  setNotes((previousEntries) => {
    // find existing note for same book and chapter
    const existingIndex = previousEntries.findIndex(
      (entry) => entry.book === book && entry.chapterNumber === chapterNumber,
    );
    if (existingIndex >= 0) {
      return previousEntries.map((entry, idx) =>
        idx === existingIndex ? { ...entry, text } : entry,
      );
    }
    // otherwise append
    return [...previousEntries, { book, chapterNumber, text }];
  });
};

/**
 * Replaces all notes with the given entries and updates the refresh date.
 */
export const replaceAllNotes = (
  setNotes: SetNotes,
  setRefreshNotesDate: (date: Date) => void,
  entries: NoteEntry[],
) => {
  setNotes(entries ?? []);
  setRefreshNotesDate(new Date());
};

export const setArticleById = (
  setArticles: SetArticles,
  id: string,
  text: string,
) => {
  setArticles((previousEntries) => {
    const existingIndex = previousEntries.findIndex((entry) => entry.id === id);
    if (existingIndex >= 0) {
      return previousEntries.map((entry, idx) =>
        idx === existingIndex ? { ...entry, text } : entry,
      );
    }
    return [...previousEntries, { id, text }];
  });
};

export const replaceAllArticles = (
  setArticles: SetArticles,
  setRefreshNotesDate: (date: Date) => void,
  entries: ArticleEntry[],
) => {
  setArticles(entries ?? []);
  setRefreshNotesDate(new Date());
};
