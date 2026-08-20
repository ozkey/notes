import { Dispatch, SetStateAction } from "react";
import {
  ArticleEntry,
  NoteEntry,
  HighlightColor,
  HighlightData,
} from "./BibleTypes";
import { articleIdsMatch, normalizeArticleId } from "./BibleContextUtils";

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
  setLastFileSyncDate: (date: Date) => void,
  entries: NoteEntry[],
) => {
  setNotes(entries ?? []);
  setLastFileSyncDate(new Date());
};

export const setArticleById = (
  setArticles: SetArticles,
  id: string,
  text: string,
) => {
  const normalizedId = normalizeArticleId(id);
  setArticles((previousEntries) => {
    const existingIndex = previousEntries.findIndex((entry) =>
      articleIdsMatch(entry.id, normalizedId),
    );
    if (existingIndex >= 0) {
      return previousEntries.map((entry, idx) =>
        idx === existingIndex ? { ...entry, text } : entry,
      );
    }
    return [...previousEntries, { id: normalizedId, text }];
  });
};

export const replaceAllArticles = (
  setArticles: SetArticles,
  setLastFileSyncDate: (date: Date) => void,
  entries: ArticleEntry[],
) => {
  setArticles(entries ?? []);
  setLastFileSyncDate(new Date());
};

export const setHighlight = (
  setNotes: SetNotes,
  book: string | null,
  chapterNumber: number,
  verse: number,
  color: HighlightColor,
) => {
  setNotes((previousEntries) => {
    const existingIndex = previousEntries.findIndex(
      (entry) => entry.book === book && entry.chapterNumber === chapterNumber,
    );

    const newHighlight: HighlightData = { verse, color };

    if (existingIndex >= 0) {
      const entry = previousEntries[existingIndex];
      const highlights = entry.highlights ?? [];
      const highlightIndex = highlights.findIndex((h) => h.verse === verse);

      let updatedHighlights: HighlightData[];
      if (highlightIndex >= 0) {
        updatedHighlights = highlights.map((h, idx) =>
          idx === highlightIndex ? newHighlight : h,
        );
      } else {
        updatedHighlights = [...highlights, newHighlight];
      }

      return previousEntries.map((e, idx) =>
        idx === existingIndex ? { ...e, highlights: updatedHighlights } : e,
      );
    }

    return [
      ...previousEntries,
      { book, chapterNumber, text: "", highlights: [newHighlight] },
    ];
  });
};

export const removeHighlight = (
  setNotes: SetNotes,
  book: string | null,
  chapterNumber: number,
  verse: number,
) => {
  setNotes((previousEntries) => {
    return previousEntries.map((entry) => {
      if (entry.book === book && entry.chapterNumber === chapterNumber) {
        const highlights =
          entry.highlights?.filter((h) => h.verse !== verse) ?? [];
        return {
          ...entry,
          highlights: highlights.length > 0 ? highlights : undefined,
        };
      }
      return entry;
    });
  });
};

export const getHighlights = (
  notes: NoteEntry[],
  book: string | null,
  chapterNumber: number,
): HighlightData[] => {
  const entry = notes.find(
    (n) => n.book === book && n.chapterNumber === chapterNumber,
  );
  return entry?.highlights ?? [];
};
