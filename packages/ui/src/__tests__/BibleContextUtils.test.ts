import {
  parseHash,
  normalizeArticleId,
  articleIdsMatch,
  addTab,
  closeTab,
  moveTab,
  updateTab,
  openTabForBookChapter,
  MAX_TAB_LIMIT,
} from "../contexts/BibleContextUtils";
import { TabState } from "../contexts/BibleTypes";

// ─── parseHash ────────────────────────────────────────────────────────────────

describe("parseHash", () => {
  const books = ["Genesis", "Exodus", "Matthew", "John"];

  test("returns null for empty string", () => {
    expect(parseHash("", books)).toBeNull();
  });

  test("strips leading # before parsing", () => {
    expect(parseHash("#Genesis:1", books)).toEqual({
      book: "Genesis",
      chapter: 1,
      verseNumber: null,
    });
  });

  test("works without leading #", () => {
    expect(parseHash("Genesis:1", books)).toEqual({
      book: "Genesis",
      chapter: 1,
      verseNumber: null,
    });
  });

  test("parses book:chapter:verse (3 parts)", () => {
    expect(parseHash("#Genesis:1:5", books)).toEqual({
      book: "Genesis",
      chapter: 1,
      verseNumber: 5,
    });
  });

  test("returns null for too many parts (4 colons)", () => {
    expect(parseHash("#Genesis:1:5:extra", books)).toBeNull();
  });

  test("returns null when chapter is NaN", () => {
    expect(parseHash("#Genesis:abc", books)).toBeNull();
  });

  test("returns null when chapter < 1", () => {
    expect(parseHash("#Genesis:0", books)).toBeNull();
  });

  test("returns null when verse is NaN", () => {
    expect(parseHash("#Genesis:1:abc", books)).toBeNull();
  });

  test("returns null when verse < 1", () => {
    expect(parseHash("#Genesis:1:0", books)).toBeNull();
  });

  test("returns null when book not found", () => {
    expect(parseHash("#Revelation:1", books)).toBeNull();
  });

  test("matches book case-insensitively", () => {
    expect(parseHash("#genesis:3", books)).toEqual({
      book: "Genesis",
      chapter: 3,
      verseNumber: null,
    });
  });

  test("replaces + with space in book name", () => {
    const booksWithSpace = ["Song of Solomon"];
    expect(parseHash("#Song+of+Solomon:1", booksWithSpace)).toEqual({
      book: "Song of Solomon",
      chapter: 1,
      verseNumber: null,
    });
  });

  test("replaces _ with space in book name", () => {
    const booksWithSpace = ["Song of Solomon"];
    expect(parseHash("#Song_of_Solomon:1", booksWithSpace)).toEqual({
      book: "Song of Solomon",
      chapter: 1,
      verseNumber: null,
    });
  });

  test("replaces - with space in book name", () => {
    const booksWithSpace = ["Song of Solomon"];
    expect(parseHash("#Song-of-Solomon:1", booksWithSpace)).toEqual({
      book: "Song of Solomon",
      chapter: 1,
      verseNumber: null,
    });
  });

  test("falls back to defaultBooks when books is empty", () => {
    expect(parseHash("#Genesis:1", [], ["Genesis", "Exodus"])).toEqual({
      book: "Genesis",
      chapter: 1,
      verseNumber: null,
    });
  });

  test("returns null when books and defaultBooks are both empty", () => {
    expect(parseHash("#Genesis:1", [], [])).toBeNull();
  });

  test("handles URL-encoded book name", () => {
    expect(parseHash("#Song%20of%20Solomon:1", ["Song of Solomon"])).toEqual({
      book: "Song of Solomon",
      chapter: 1,
      verseNumber: null,
    });
  });

  test("returns null for single part with no chapter", () => {
    // parts.length == 1, chapter defaults to 1, then book lookup fails
    expect(parseHash("#UnknownBook", books)).toBeNull();
  });
});

// ─── normalizeArticleId ───────────────────────────────────────────────────────

describe("normalizeArticleId", () => {
  test("returns empty string for empty input", () => {
    expect(normalizeArticleId("")).toBe("");
  });

  test("returns empty string for whitespace-only input", () => {
    expect(normalizeArticleId("   ")).toBe("");
  });

  test("strips leading #", () => {
    expect(normalizeArticleId("#my-article")).toBe("my-article");
  });

  test("replaces spaces with hyphens", () => {
    expect(normalizeArticleId("my article")).toBe("my-article");
  });

  test("replaces + with hyphens", () => {
    expect(normalizeArticleId("my+article")).toBe("my-article");
  });

  test("replaces _ with hyphens", () => {
    expect(normalizeArticleId("my_article")).toBe("my-article");
  });

  test("collapses multiple hyphens", () => {
    expect(normalizeArticleId("my---article")).toBe("my-article");
  });

  test("strips leading and trailing hyphens", () => {
    expect(normalizeArticleId("-my-article-")).toBe("my-article");
  });

  test("already normalized remains unchanged", () => {
    expect(normalizeArticleId("my-article")).toBe("my-article");
  });

  test("handles mixed spaces, underscores, hyphens", () => {
    expect(normalizeArticleId("my _ article - test")).toBe("my-article-test");
  });
});

// ─── articleIdsMatch ──────────────────────────────────────────────────────────

describe("articleIdsMatch", () => {
  test("identical ids match", () => {
    expect(articleIdsMatch("my-article", "my-article")).toBe(true);
  });

  test("case-insensitive match", () => {
    expect(articleIdsMatch("My-Article", "my-article")).toBe(true);
  });

  test("different ids do not match", () => {
    expect(articleIdsMatch("article-one", "article-two")).toBe(false);
  });

  test("leading # stripped before compare", () => {
    expect(articleIdsMatch("#my-article", "my-article")).toBe(true);
  });
});

// ─── addTab ───────────────────────────────────────────────────────────────────

describe("addTab", () => {
  const homeTab: TabState = {
    mode: "home",
    selectedBook: null,
    chapterNumber: 1,
    articleId: null,
  };

  test("adds a new home tab", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => {
      capturedUpdater = fn;
    });
    const mockSetCurrentTab = jest.fn();

    addTab(mockSetTabs, mockSetCurrentTab);

    const result = capturedUpdater!([homeTab]);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(expect.objectContaining({
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: null,
    }));
    expect(mockSetCurrentTab).toHaveBeenCalledWith(1);
  });

  test("does not add beyond max limit", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => {
      capturedUpdater = fn;
    });
    const mockSetCurrentTab = jest.fn();

    addTab(mockSetTabs, mockSetCurrentTab, 2);

    const fullTabs: TabState[] = [homeTab, homeTab];
    const result = capturedUpdater!(fullTabs);
    expect(result).toHaveLength(2);
    expect(mockSetCurrentTab).not.toHaveBeenCalled();
  });

  test("uses MAX_TAB_LIMIT as default", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => {
      capturedUpdater = fn;
    });
    const mockSetCurrentTab = jest.fn();

    addTab(mockSetTabs, mockSetCurrentTab);

    const fullTabs: TabState[] = Array(MAX_TAB_LIMIT).fill(homeTab);
    const result = capturedUpdater!(fullTabs);
    expect(result).toHaveLength(MAX_TAB_LIMIT);
  });
});

// ─── closeTab ─────────────────────────────────────────────────────────────────

describe("closeTab", () => {
  const homeTab = (n = 1): TabState => ({
    mode: "home",
    selectedBook: null,
    chapterNumber: n,
    articleId: null,
  });

  function captureSetCurrentTabUpdater(mockSetCurrentTab: jest.Mock) {
    return (cur: number) => {
      const calls = mockSetCurrentTab.mock.calls;
      const last = calls[calls.length - 1]?.[0];
      if (typeof last === "function") return last(cur);
      return last;
    };
  }

  test("resets to single home tab when only one tab remains", () => {
    let capturedTabsUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedTabsUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    closeTab(mockSetTabs, mockSetCurrentTab, 0);

    const result = capturedTabsUpdater!([homeTab(1)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({
      mode: "home",
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: null,
    }));
    expect(mockSetCurrentTab).toHaveBeenCalledWith(0);
  });

  test("closes first tab of many, adjusts current tab", () => {
    let capturedTabsUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedTabsUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    closeTab(mockSetTabs, mockSetCurrentTab, 0);

    const tabs = [homeTab(1), homeTab(2), homeTab(3)];
    const result = capturedTabsUpdater!(tabs);
    expect(result).toHaveLength(2);
    expect(result[0].chapterNumber).toBe(2);

    // current was 2 (after first tab), closing index 0 < cur => cur-1=1
    const getNewCurrent = captureSetCurrentTabUpdater(mockSetCurrentTab);
    expect(getNewCurrent(2)).toBe(1);
  });

  test("closes last tab of many, moves current to previous", () => {
    let capturedTabsUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedTabsUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    closeTab(mockSetTabs, mockSetCurrentTab, 2);

    const tabs = [homeTab(1), homeTab(2), homeTab(3)];
    const result = capturedTabsUpdater!(tabs);
    expect(result).toHaveLength(2);

    // current === closed index (2) => max(0, cur-1) = 1
    const getNewCurrent = captureSetCurrentTabUpdater(mockSetCurrentTab);
    expect(getNewCurrent(2)).toBe(1);
  });

  test("closes middle tab, index after current stays same", () => {
    let capturedTabsUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedTabsUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    closeTab(mockSetTabs, mockSetCurrentTab, 1);

    const tabs = [homeTab(1), homeTab(2), homeTab(3)];
    const result = capturedTabsUpdater!(tabs);
    expect(result).toHaveLength(2);

    // closing index 1, current is 0 (< 1) => cur stays 0
    const getNewCurrent = captureSetCurrentTabUpdater(mockSetCurrentTab);
    expect(getNewCurrent(0)).toBe(0);
  });

  test("closing index after current: current unchanged", () => {
    let capturedTabsUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedTabsUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    closeTab(mockSetTabs, mockSetCurrentTab, 2);

    const tabs = [homeTab(1), homeTab(2), homeTab(3)];
    capturedTabsUpdater!(tabs);

    const getNewCurrent = captureSetCurrentTabUpdater(mockSetCurrentTab);
    // current is 0, closing tab 2 which is > 0 => return cur (0)
    expect(getNewCurrent(0)).toBe(0);
  });
});

// ─── moveTab ───────────────────────────────────────────────────────────────────

describe("moveTab", () => {
  const tab = (id: string, chapterNumber: number): TabState => ({
    id,
    mode: "home",
    selectedBook: null,
    chapterNumber,
    verseNumber: null,
    articleId: null,
  });

  test("moves a tab to a new position", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => {
      capturedUpdater = fn;
    });
    const mockSetCurrentTab = jest.fn();

    moveTab(mockSetTabs, mockSetCurrentTab, 0, 2);

    const result = capturedUpdater!([
      tab("a", 1),
      tab("b", 2),
      tab("c", 3),
    ]);
    expect(result.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
    expect(mockSetCurrentTab).toHaveBeenCalled();
  });

  test("keeps current tab aligned when the selected tab is moved", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => {
      capturedUpdater = fn;
    });
    const mockSetCurrentTab = jest.fn();

    moveTab(mockSetTabs, mockSetCurrentTab, 1, 0);

    capturedUpdater!([tab("a", 1), tab("b", 2), tab("c", 3)]);

    const updater = mockSetCurrentTab.mock.calls[0][0];
    expect(updater(1)).toBe(0);
  });
});

// ─── updateTab ────────────────────────────────────────────────────────────────

describe("updateTab", () => {
  test("applies patch to specified tab", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mocksetLastFileSyncDate = jest.fn();

    const tab: TabState = { mode: "home", selectedBook: null, chapterNumber: 1, articleId: null };
    updateTab(mockSetTabs, mocksetLastFileSyncDate, undefined, 0, { mode: "bible" });

    const result = capturedUpdater!([tab]);
    expect(result[0].mode).toBe("bible");
  });

  test("does not call setLastFileSyncDate when undefined", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mocksetLastFileSyncDate = jest.fn();

    const tab: TabState = { mode: "home", selectedBook: null, chapterNumber: 1, articleId: null };
    updateTab(mockSetTabs, mocksetLastFileSyncDate, undefined, 0, { chapterNumber: 5 });
    capturedUpdater!([tab]);

    expect(mocksetLastFileSyncDate).not.toHaveBeenCalled();
  });

  test("calls setLastFileSyncDate with new Date when lastFileSyncDate is defined", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mocksetLastFileSyncDate = jest.fn();

    const tab: TabState = { mode: "home", selectedBook: null, chapterNumber: 1, articleId: null };
    updateTab(mockSetTabs, mocksetLastFileSyncDate, new Date(), 0, { chapterNumber: 5 });
    capturedUpdater!([tab]);

    expect(mocksetLastFileSyncDate).toHaveBeenCalledWith(expect.any(Date));
  });

  test("leaves other tabs unchanged", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mocksetLastFileSyncDate = jest.fn();

    const tabs: TabState[] = [
      { mode: "home", selectedBook: null, chapterNumber: 1, articleId: null },
      { mode: "bible", selectedBook: "Genesis", chapterNumber: 2, articleId: null },
    ];
    updateTab(mockSetTabs, mocksetLastFileSyncDate, undefined, 0, { chapterNumber: 99 });

    const result = capturedUpdater!(tabs);
    expect(result[0].chapterNumber).toBe(99);
    expect(result[1].chapterNumber).toBe(2);
  });
});

// ─── openTabForBookChapter ────────────────────────────────────────────────────

describe("openTabForBookChapter", () => {
  const homeTab: TabState = {
    mode: "home",
    selectedBook: null,
    chapterNumber: 1,
    articleId: null,
  };

  test("opens new tab for book/chapter", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    openTabForBookChapter(mockSetTabs, mockSetCurrentTab, "Genesis", 1);

    const result = capturedUpdater!([homeTab]);
    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({ mode: "bible", selectedBook: "Genesis", chapterNumber: 1 });
    expect(mockSetCurrentTab).toHaveBeenCalledWith(1);
  });

  test("switches to existing tab if same book/chapter already open", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    const existingBibleTab: TabState = {
      mode: "bible",
      selectedBook: "Genesis",
      chapterNumber: 1,
      articleId: null,
    };

    openTabForBookChapter(mockSetTabs, mockSetCurrentTab, "Genesis", 1, 5);

    const result = capturedUpdater!([homeTab, existingBibleTab]);
    expect(result).toHaveLength(2);
    expect(result[1].verseNumber).toBe(5);
    expect(mockSetCurrentTab).toHaveBeenCalledWith(1);
  });

  test("does not add new tab when at max limit", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    openTabForBookChapter(mockSetTabs, mockSetCurrentTab, "Genesis", 1, null, 1);

    const result = capturedUpdater!([homeTab]);
    expect(result).toHaveLength(1);
    expect(mockSetCurrentTab).not.toHaveBeenCalled();
  });

  test("opens tab with verse number", () => {
    let capturedUpdater: ((prev: TabState[]) => TabState[]) | null = null;
    const mockSetTabs = jest.fn((fn: any) => { capturedUpdater = fn; });
    const mockSetCurrentTab = jest.fn();

    openTabForBookChapter(mockSetTabs, mockSetCurrentTab, "John", 3, 16);

    const result = capturedUpdater!([homeTab]);
    expect(result[1]).toMatchObject({
      mode: "bible",
      selectedBook: "John",
      chapterNumber: 3,
      verseNumber: 16,
    });
  });
});
