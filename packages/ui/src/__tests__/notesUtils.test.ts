import {
  setNoteForBookChapter,
  replaceAllNotes,
  setArticleById,
  replaceAllArticles,
  setHighlight,
  removeHighlight,
  getHighlights,
} from "../contexts/notesUtils";
import { NoteEntry, ArticleEntry } from "../contexts/BibleTypes";

// ─── setNoteForBookChapter ────────────────────────────────────────────────────

describe("setNoteForBookChapter", () => {
  test("appends new note when book/chapter not found", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    setNoteForBookChapter(mockSetNotes, "Genesis", 1, "Hello");

    const result = capturedUpdater!([]);
    expect(result).toEqual([{ book: "Genesis", chapterNumber: 1, text: "Hello" }]);
  });

  test("updates existing note for matching book/chapter", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [{ book: "Genesis", chapterNumber: 1, text: "Old text" }];
    setNoteForBookChapter(mockSetNotes, "Genesis", 1, "New text");

    const result = capturedUpdater!(existing);
    expect(result).toEqual([{ book: "Genesis", chapterNumber: 1, text: "New text" }]);
  });

  test("only updates the matched entry, leaving others unchanged", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "First" },
      { book: "Exodus", chapterNumber: 1, text: "Second" },
    ];
    setNoteForBookChapter(mockSetNotes, "Genesis", 1, "Updated");

    const result = capturedUpdater!(existing);
    expect(result[0].text).toBe("Updated");
    expect(result[1].text).toBe("Second");
  });

  test("works with null book", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    setNoteForBookChapter(mockSetNotes, null, 1, "General note");

    const result = capturedUpdater!([]);
    expect(result).toEqual([{ book: null, chapterNumber: 1, text: "General note" }]);
  });
});

// ─── replaceAllNotes ──────────────────────────────────────────────────────────

describe("replaceAllNotes", () => {
  test("replaces notes with given entries", () => {
    const mockSetNotes = jest.fn();
    const mockSetRefreshDate = jest.fn();
    const entries: NoteEntry[] = [{ book: "Genesis", chapterNumber: 1, text: "text" }];

    replaceAllNotes(mockSetNotes, mockSetRefreshDate, entries);

    expect(mockSetNotes).toHaveBeenCalledWith(entries);
    expect(mockSetRefreshDate).toHaveBeenCalledWith(expect.any(Date));
  });

  test("uses empty array when entries is null (via nullish coalescing)", () => {
    const mockSetNotes = jest.fn();
    const mockSetRefreshDate = jest.fn();

    replaceAllNotes(mockSetNotes, mockSetRefreshDate, null as any);

    expect(mockSetNotes).toHaveBeenCalledWith([]);
  });
});

// ─── setArticleById ───────────────────────────────────────────────────────────

describe("setArticleById", () => {
  test("appends new article when id not found", () => {
    let capturedUpdater: ((prev: ArticleEntry[]) => ArticleEntry[]) | null = null;
    const mockSetArticles = jest.fn((fn: any) => { capturedUpdater = fn; });

    setArticleById(mockSetArticles, "intro", "Introduction text");

    const result = capturedUpdater!([]);
    expect(result).toEqual([{ id: "intro", text: "Introduction text" }]);
  });

  test("updates existing article with matching id", () => {
    let capturedUpdater: ((prev: ArticleEntry[]) => ArticleEntry[]) | null = null;
    const mockSetArticles = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: ArticleEntry[] = [{ id: "intro", text: "Old" }];
    setArticleById(mockSetArticles, "intro", "New");

    const result = capturedUpdater!(existing);
    expect(result).toEqual([{ id: "intro", text: "New" }]);
  });

  test("normalizes the id before storing (strips # and replaces spaces)", () => {
    let capturedUpdater: ((prev: ArticleEntry[]) => ArticleEntry[]) | null = null;
    const mockSetArticles = jest.fn((fn: any) => { capturedUpdater = fn; });

    setArticleById(mockSetArticles, "#My Article", "text");

    const result = capturedUpdater!([]);
    // normalizeArticleId strips #, replaces spaces with hyphens (not lowercased)
    expect(result[0].id).toBe("My-Article");
  });

  test("matches existing article by normalized id (case-insensitive)", () => {
    let capturedUpdater: ((prev: ArticleEntry[]) => ArticleEntry[]) | null = null;
    const mockSetArticles = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: ArticleEntry[] = [{ id: "my-article", text: "Old" }];
    setArticleById(mockSetArticles, "My Article", "New");

    const result = capturedUpdater!(existing);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("New");
  });
});

// ─── replaceAllArticles ───────────────────────────────────────────────────────

describe("replaceAllArticles", () => {
  test("replaces articles with given entries", () => {
    const mockSetArticles = jest.fn();
    const mockSetRefreshDate = jest.fn();
    const entries: ArticleEntry[] = [{ id: "intro", text: "text" }];

    replaceAllArticles(mockSetArticles, mockSetRefreshDate, entries);

    expect(mockSetArticles).toHaveBeenCalledWith(entries);
    expect(mockSetRefreshDate).toHaveBeenCalledWith(expect.any(Date));
  });

  test("uses empty array when entries is null", () => {
    const mockSetArticles = jest.fn();
    const mockSetRefreshDate = jest.fn();

    replaceAllArticles(mockSetArticles, mockSetRefreshDate, null as any);

    expect(mockSetArticles).toHaveBeenCalledWith([]);
  });
});

// ─── setHighlight ─────────────────────────────────────────────────────────────

describe("setHighlight", () => {
  test("creates new note entry with highlight when no existing entry", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    setHighlight(mockSetNotes, "Genesis", 1, 5, "green");

    const result = capturedUpdater!([]);
    expect(result).toEqual([
      { book: "Genesis", chapterNumber: 1, text: "", highlights: [{ verse: 5, color: "green" }] },
    ]);
  });

  test("appends highlight to existing entry without that verse", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "text", highlights: [{ verse: 3, color: "blue" }] },
    ];
    setHighlight(mockSetNotes, "Genesis", 1, 5, "green");

    const result = capturedUpdater!(existing);
    expect(result[0].highlights).toHaveLength(2);
    expect(result[0].highlights![1]).toEqual({ verse: 5, color: "green" });
  });

  test("updates highlight color for existing verse", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "text", highlights: [{ verse: 5, color: "blue" }] },
    ];
    setHighlight(mockSetNotes, "Genesis", 1, 5, "red");

    const result = capturedUpdater!(existing);
    expect(result[0].highlights).toHaveLength(1);
    expect(result[0].highlights![0]).toEqual({ verse: 5, color: "red" });
  });

  test("handles entry with no highlights array", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [{ book: "Genesis", chapterNumber: 1, text: "text" }];
    setHighlight(mockSetNotes, "Genesis", 1, 5, "green");

    const result = capturedUpdater!(existing);
    expect(result[0].highlights).toEqual([{ verse: 5, color: "green" }]);
  });
});

// ─── removeHighlight ──────────────────────────────────────────────────────────

describe("removeHighlight", () => {
  test("removes the specified highlight", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [
      {
        book: "Genesis",
        chapterNumber: 1,
        text: "text",
        highlights: [
          { verse: 5, color: "green" },
          { verse: 10, color: "blue" },
        ],
      },
    ];
    removeHighlight(mockSetNotes, "Genesis", 1, 5);

    const result = capturedUpdater!(existing);
    expect(result[0].highlights).toEqual([{ verse: 10, color: "blue" }]);
  });

  test("sets highlights to undefined when no highlights remain", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "text", highlights: [{ verse: 5, color: "green" }] },
    ];
    removeHighlight(mockSetNotes, "Genesis", 1, 5);

    const result = capturedUpdater!(existing);
    expect(result[0].highlights).toBeUndefined();
  });

  test("leaves entry unchanged when book/chapter not found", () => {
    let capturedUpdater: ((prev: NoteEntry[]) => NoteEntry[]) | null = null;
    const mockSetNotes = jest.fn((fn: any) => { capturedUpdater = fn; });

    const existing: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "text", highlights: [{ verse: 5, color: "green" }] },
    ];
    removeHighlight(mockSetNotes, "Exodus", 1, 5);

    const result = capturedUpdater!(existing);
    expect(result[0].highlights).toEqual([{ verse: 5, color: "green" }]);
  });
});

// ─── getHighlights ────────────────────────────────────────────────────────────

describe("getHighlights", () => {
  test("returns highlights for matching book/chapter", () => {
    const notes: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "text", highlights: [{ verse: 5, color: "green" }] },
    ];
    expect(getHighlights(notes, "Genesis", 1)).toEqual([{ verse: 5, color: "green" }]);
  });

  test("returns empty array when entry not found", () => {
    const notes: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "text" },
    ];
    expect(getHighlights(notes, "Exodus", 1)).toEqual([]);
  });

  test("returns empty array when entry has no highlights", () => {
    const notes: NoteEntry[] = [
      { book: "Genesis", chapterNumber: 1, text: "text" },
    ];
    expect(getHighlights(notes, "Genesis", 1)).toEqual([]);
  });
});
