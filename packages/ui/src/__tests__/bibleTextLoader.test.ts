import {
  BIBLE_TRANSLATIONS,
  DEFAULT_BIBLE_TRANSLATION,
  fetchBibleText,
} from "../contexts/bibleTextLoader";

// ─── Constants ────────────────────────────────────────────────────────────────

describe("BIBLE_TRANSLATIONS", () => {
  test("is an array", () => {
    expect(Array.isArray(BIBLE_TRANSLATIONS)).toBe(true);
  });

  test("contains cpdv translation", () => {
    const cpdv = BIBLE_TRANSLATIONS.find((t) => t.id === "cpdv");
    expect(cpdv).toBeDefined();
    expect(cpdv!.label).toBe("Catholic Public Domain Version");
  });

  test("contains douay-rheims translation", () => {
    const dr = BIBLE_TRANSLATIONS.find((t) => t.id === "douay-rheims");
    expect(dr).toBeDefined();
    expect(dr!.label).toBe("Douay-Rheims");
  });
});

describe("DEFAULT_BIBLE_TRANSLATION", () => {
  test("is 'cpdv'", () => {
    expect(DEFAULT_BIBLE_TRANSLATION).toBe("cpdv");
  });
});

// ─── fetchBibleText ───────────────────────────────────────────────────────────

describe("fetchBibleText", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("uses default translation when no argument provided", async () => {
    const json = { books: [{ name: "Genesis" }] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await fetchBibleText();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("Catholic-Public-Domain-Version.json")
    );
    expect(result.bibleText).toEqual(json);
    expect(result.bookNames).toEqual(["Genesis"]);
  });

  test("uses custom translation when specified", async () => {
    const json = { books: [{ name: "Matthew" }] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    await fetchBibleText("douay-rheims");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("Douay-Rheims.json")
    );
  });

  test("returns null bibleText and empty bookNames when fetch fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const result = await fetchBibleText();

    expect(result.bibleText).toBeNull();
    expect(result.bookNames).toEqual([]);
  });

  test("returns bookNames array from books.name fields", async () => {
    const json = {
      books: [
        { name: "Genesis" },
        { name: "Exodus" },
        { name: "Matthew" },
      ],
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await fetchBibleText();

    expect(result.bookNames).toEqual(["Genesis", "Exodus", "Matthew"]);
  });

  test("returns empty bookNames when books is not an array", async () => {
    const json = { books: "not-an-array" };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await fetchBibleText();

    expect(result.bookNames).toEqual([]);
  });

  test("returns empty bookNames when json has no books property", async () => {
    const json = { title: "Bible" };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await fetchBibleText();

    expect(result.bookNames).toEqual([]);
  });

  test("filters out null/non-string book entries", async () => {
    const json = {
      books: [
        { name: "Genesis" },
        null,
        { name: 123 },
        { name: "Matthew" },
        undefined,
        {},
      ],
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await fetchBibleText();

    expect(result.bookNames).toEqual(["Genesis", "Matthew"]);
  });

  test("falls back to cpdv for unknown translationId", async () => {
    const json = { books: [] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    // Pass an unknown id
    await fetchBibleText("unknown" as any);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("Catholic-Public-Domain-Version.json")
    );
  });
});
