import {
  escapeHtml,
  getBibleBooks,
  parseBibleBookmarkHash,
  createBibleBookmarkHtml,
  canOpenLinkHref,
  readFileAsDataUrl,
  findParentTag,
} from "../components/Editor/utils";

// ─── escapeHtml ───────────────────────────────────────────────────────────────

describe("escapeHtml", () => {
  test("escapes & to &amp;", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  test("escapes < to &lt;", () => {
    expect(escapeHtml("<tag>")).toBe("&lt;tag&gt;");
  });

  test("escapes > to &gt;", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  test('escapes " to &quot;', () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  test("escapes ' to &#39;", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  test("escapes all special chars in one string", () => {
    expect(escapeHtml('<a href="x&y">it\'s</a>')).toBe(
      "&lt;a href=&quot;x&amp;y&quot;&gt;it&#39;s&lt;/a&gt;"
    );
  });

  test("leaves plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

// ─── getBibleBooks ────────────────────────────────────────────────────────────

describe("getBibleBooks", () => {
  afterEach(() => {
    delete (window as any).BIBLE_BOOKS;
  });

  test("returns empty array when window.BIBLE_BOOKS is not set", () => {
    expect(getBibleBooks()).toEqual([]);
  });

  test("returns window.BIBLE_BOOKS when set", () => {
    (window as any).BIBLE_BOOKS = ["Genesis", "Exodus"];
    expect(getBibleBooks()).toEqual(["Genesis", "Exodus"]);
  });
});

// ─── parseBibleBookmarkHash ───────────────────────────────────────────────────

describe("parseBibleBookmarkHash", () => {
  test("parses valid '#Genesis:1'", () => {
    expect(parseBibleBookmarkHash("#Genesis:1")).toEqual({
      book: "Genesis",
      chapterNumber: 1,
      verseNumber: null,
    });
  });

  test("parses valid '#Genesis:1:5' with verse", () => {
    expect(parseBibleBookmarkHash("#Genesis:1:5")).toEqual({
      book: "Genesis",
      chapterNumber: 1,
      verseNumber: 5,
    });
  });

  test("returns null when missing # prefix", () => {
    expect(parseBibleBookmarkHash("Genesis:1")).toBeNull();
  });

  test("returns null for invalid format (no colon)", () => {
    expect(parseBibleBookmarkHash("#Genesis")).toBeNull();
  });

  test("returns null when chapter is 0", () => {
    expect(parseBibleBookmarkHash("#Genesis:0")).toBeNull();
  });

  test("returns null when verse is 0", () => {
    expect(parseBibleBookmarkHash("#Genesis:1:0")).toBeNull();
  });

  test("handles URL-encoded book name", () => {
    const result = parseBibleBookmarkHash("#Song%20of%20Solomon:1");
    expect(result?.book).toBe("Song of Solomon");
  });

  test("replaces hyphen with space in book name", () => {
    const result = parseBibleBookmarkHash("#Song-of-Solomon:1");
    expect(result?.book).toBe("Song of Solomon");
  });

  test("replaces underscore with space in book name", () => {
    const result = parseBibleBookmarkHash("#Song_of_Solomon:1");
    expect(result?.book).toBe("Song of Solomon");
  });

  test("replaces + with space in book name", () => {
    const result = parseBibleBookmarkHash("#Song+of+Solomon:1");
    expect(result?.book).toBe("Song of Solomon");
  });

  test("returns null for empty string", () => {
    expect(parseBibleBookmarkHash("")).toBeNull();
  });
});

// ─── createBibleBookmarkHtml ──────────────────────────────────────────────────

describe("createBibleBookmarkHtml", () => {
  test("creates anchor for book and chapter", () => {
    const html = createBibleBookmarkHtml({ book: "Genesis", chapterNumber: 1 });
    expect(html).toBe('<a href="#Genesis:1">Genesis 1</a>');
  });

  test("includes verse when provided", () => {
    const html = createBibleBookmarkHtml({
      book: "Genesis",
      chapterNumber: 1,
      verseNumber: 5,
    });
    expect(html).toBe('<a href="#Genesis:1:5">Genesis 1:5</a>');
  });

  test("replaces spaces in book name with hyphens in href", () => {
    const html = createBibleBookmarkHtml({
      book: "Song of Solomon",
      chapterNumber: 1,
    });
    expect(html).toContain('href="#Song-of-Solomon:1"');
    expect(html).toContain(">Song of Solomon 1<");
  });

  test("escapes special characters in book name", () => {
    const html = createBibleBookmarkHtml({
      book: 'Book "Test"',
      chapterNumber: 1,
    });
    expect(html).toContain("&quot;");
  });

  test("does not add verse suffix when verseNumber is null", () => {
    const html = createBibleBookmarkHtml({
      book: "Genesis",
      chapterNumber: 1,
      verseNumber: null,
    });
    expect(html).toBe('<a href="#Genesis:1">Genesis 1</a>');
  });

  test("does not add verse suffix when verseNumber is 0 or negative", () => {
    const html0 = createBibleBookmarkHtml({
      book: "Genesis",
      chapterNumber: 1,
      verseNumber: 0,
    });
    expect(html0).toBe('<a href="#Genesis:1">Genesis 1</a>');
  });
});

// ─── canOpenLinkHref ──────────────────────────────────────────────────────────

describe("canOpenLinkHref", () => {
  test("allows https://", () => {
    expect(canOpenLinkHref("https://example.com")).toBe(true);
  });

  test("allows http://", () => {
    expect(canOpenLinkHref("http://example.com")).toBe(true);
  });

  test("allows mailto:", () => {
    expect(canOpenLinkHref("mailto:test@example.com")).toBe(true);
  });

  test("allows tel:", () => {
    expect(canOpenLinkHref("tel:+1234567890")).toBe(true);
  });

  test("allows #hash", () => {
    expect(canOpenLinkHref("#section")).toBe(true);
  });

  test("allows /path", () => {
    expect(canOpenLinkHref("/path/to/page")).toBe(true);
  });

  test("allows ?query", () => {
    expect(canOpenLinkHref("?q=search")).toBe(true);
  });

  test("blocks javascript:", () => {
    expect(canOpenLinkHref("javascript:alert(1)")).toBe(false);
  });

  test("blocks data:", () => {
    expect(canOpenLinkHref("data:text/html,<h1>test</h1>")).toBe(false);
  });

  test("blocks vbscript:", () => {
    expect(canOpenLinkHref("vbscript:msgbox(1)")).toBe(false);
  });

  test("blocks empty string", () => {
    expect(canOpenLinkHref("")).toBe(false);
  });

  test("blocks whitespace-only string", () => {
    expect(canOpenLinkHref("   ")).toBe(false);
  });
});

// ─── readFileAsDataUrl ────────────────────────────────────────────────────────

describe("readFileAsDataUrl", () => {
  test("resolves with data URL on success", async () => {
    const mockReader = {
      readAsDataURL: jest.fn(),
      onload: null as any,
      onerror: null as any,
      result: "data:image/png;base64,abc",
    };
    jest.spyOn(global, "FileReader").mockImplementation(() => mockReader as any);

    const promise = readFileAsDataUrl(new Blob(["data"]));
    mockReader.onload();

    await expect(promise).resolves.toBe("data:image/png;base64,abc");
    (global.FileReader as any).mockRestore();
  });

  test("rejects on error", async () => {
    const mockReader = {
      readAsDataURL: jest.fn(),
      onload: null as any,
      onerror: null as any,
      result: null,
    };
    jest.spyOn(global, "FileReader").mockImplementation(() => mockReader as any);

    const promise = readFileAsDataUrl(new Blob(["data"]));
    mockReader.onerror();

    await expect(promise).rejects.toThrow("Failed to read image");
    (global.FileReader as any).mockRestore();
  });
});

// ─── findParentTag ────────────────────────────────────────────────────────────

describe("findParentTag", () => {
  let editor: HTMLDivElement;

  beforeEach(() => {
    editor = document.createElement("div");
    document.body.appendChild(editor);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("finds ancestor element with matching tag", () => {
    const table = document.createElement("table");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    const span = document.createElement("span");
    td.appendChild(span);
    tr.appendChild(td);
    table.appendChild(tr);
    editor.appendChild(table);

    expect(findParentTag(span, editor, "TD")).toBe(td);
  });

  test("returns null when tag not found before editor boundary", () => {
    const p = document.createElement("p");
    editor.appendChild(p);

    expect(findParentTag(p, editor, "TABLE")).toBeNull();
  });

  test("returns null when node is null", () => {
    expect(findParentTag(null, editor, "TD")).toBeNull();
  });

  test("matches the node itself if tag matches", () => {
    const div = document.createElement("div");
    editor.appendChild(div);
    expect(findParentTag(div, editor, "DIV")).toBe(div);
  });

  test("stops at editor (does not traverse past it)", () => {
    const outer = document.createElement("table");
    document.body.appendChild(outer);
    editor.appendChild(document.createElement("span"));
    // span is inside editor, outer TABLE is outside editor
    const span = editor.querySelector("span")!;
    expect(findParentTag(span, editor, "TABLE")).toBeNull();
  });
});
