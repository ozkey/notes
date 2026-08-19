import {
  toRomanOrdinalBook,
  toArabicOrdinalBook,
  formatBookLabel,
  normalizeBookAlias,
  normalizeReferenceRange,
  extractCrossReferenceBookToken,
  extractCrossReferenceChapterKeys,
  buildCrossReferenceBookTokenByAlias,
  crossReferenceHasChapter,
  BOOK_GROUPS,
} from "../components/utils/BibleUtils";

// ─── toRomanOrdinalBook ───────────────────────────────────────────────────────

describe("toRomanOrdinalBook", () => {
  test("converts '1 Samuel' to 'I Samuel'", () => {
    expect(toRomanOrdinalBook("1 Samuel")).toBe("I Samuel");
  });

  test("converts '2 Kings' to 'II Kings'", () => {
    expect(toRomanOrdinalBook("2 Kings")).toBe("II Kings");
  });

  test("converts '3 John' to 'III John'", () => {
    expect(toRomanOrdinalBook("3 John")).toBe("III John");
  });

  test("leaves 'Genesis' unchanged (no ordinal prefix)", () => {
    expect(toRomanOrdinalBook("Genesis")).toBe("Genesis");
  });

  test("leaves '4 Example' unchanged (4 not in map)", () => {
    expect(toRomanOrdinalBook("4 Example")).toBe("4 Example");
  });
});

// ─── toArabicOrdinalBook ──────────────────────────────────────────────────────

describe("toArabicOrdinalBook", () => {
  test("converts 'I Samuel' to '1 Samuel'", () => {
    expect(toArabicOrdinalBook("I Samuel")).toBe("1 Samuel");
  });

  test("converts 'II Kings' to '2 Kings'", () => {
    expect(toArabicOrdinalBook("II Kings")).toBe("2 Kings");
  });

  test("converts 'III John' to '3 John'", () => {
    expect(toArabicOrdinalBook("III John")).toBe("3 John");
  });

  test("leaves 'Genesis' unchanged", () => {
    expect(toArabicOrdinalBook("Genesis")).toBe("Genesis");
  });

  test("leaves 'IV Example' unchanged (IV not in map)", () => {
    expect(toArabicOrdinalBook("IV Example")).toBe("IV Example");
  });
});

// ─── formatBookLabel ──────────────────────────────────────────────────────────

describe("formatBookLabel", () => {
  test("delegates to toRomanOrdinalBook", () => {
    expect(formatBookLabel("1 Samuel")).toBe("I Samuel");
    expect(formatBookLabel("Genesis")).toBe("Genesis");
  });
});

// ─── normalizeBookAlias ───────────────────────────────────────────────────────

describe("normalizeBookAlias", () => {
  test("'1 Samuel' normalizes to '1samuel'", () => {
    expect(normalizeBookAlias("1 Samuel")).toBe("1samuel");
  });

  test("'I Samuel' normalizes to '1samuel' (roman → arabic then strip non-alnum)", () => {
    expect(normalizeBookAlias("I Samuel")).toBe("1samuel");
  });

  test("'Song of Solomon' normalizes to 'songofsolomon'", () => {
    expect(normalizeBookAlias("Song of Solomon")).toBe("songofsolomon");
  });

  test("strips all non-alphanumeric characters", () => {
    expect(normalizeBookAlias("John")).toBe("john");
  });

  test("'II Corinthians' normalizes to '2corinthians'", () => {
    expect(normalizeBookAlias("II Corinthians")).toBe("2corinthians");
  });
});

// ─── normalizeReferenceRange ──────────────────────────────────────────────────

describe("normalizeReferenceRange", () => {
  test("returns first part before '-'", () => {
    expect(normalizeReferenceRange("Gen.1.1-Gen.1.5")).toBe("Gen.1.1");
  });

  test("returns reference unchanged when no '-'", () => {
    expect(normalizeReferenceRange("Gen.1.1")).toBe("Gen.1.1");
  });
});

// ─── extractCrossReferenceBookToken ──────────────────────────────────────────

describe("extractCrossReferenceBookToken", () => {
  test("extracts book token before first '.'", () => {
    expect(extractCrossReferenceBookToken("Gen.1.1")).toBe("Gen");
  });

  test("extracts from ranged reference using first part", () => {
    expect(extractCrossReferenceBookToken("Gen.1.1-Rev.2.3")).toBe("Gen");
  });

  test("returns null when no dot in reference", () => {
    expect(extractCrossReferenceBookToken("NoBook")).toBeNull();
  });
});

// ─── extractCrossReferenceChapterKeys ────────────────────────────────────────

describe("extractCrossReferenceChapterKeys", () => {
  test("extracts single chapter key from reference", () => {
    expect(extractCrossReferenceChapterKeys("Gen.1.1")).toEqual(["Gen.1"]);
  });

  test("extracts only first part from ranged reference", () => {
    // normalizeReferenceRange strips the '-Rev...' part
    expect(extractCrossReferenceChapterKeys("Gen.1.1-Rev.2.3")).toEqual(["Gen.1"]);
  });

  test("extracts multiple chapter keys from comma-separated references", () => {
    // After normalizeReferenceRange, comma-separated refs are joined
    // single string like "Gen.1.1,Rev.2.3" - the range normalizer splits on '-' not ','
    // So both matches appear
    expect(extractCrossReferenceChapterKeys("Gen.1.1,Rev.2.3")).toEqual(["Gen.1", "Rev.2"]);
  });

  test("returns empty array for reference without dots", () => {
    expect(extractCrossReferenceChapterKeys("NoBook")).toEqual([]);
  });

  test("handles 1-prefix book tokens", () => {
    expect(extractCrossReferenceChapterKeys("1Sam.3.1")).toEqual(["1Sam.3"]);
  });
});

// ─── buildCrossReferenceBookTokenByAlias ─────────────────────────────────────

describe("buildCrossReferenceBookTokenByAlias", () => {
  test("builds alias map for Genesis entries", () => {
    const entries = [
      { from: "Gen.1.1", to: "Gen.2.1" },
    ];
    const map = buildCrossReferenceBookTokenByAlias(entries);

    // 'Gen' token should map to 'Gen'
    expect(map.get("gen")).toBe("Gen");
    // All canonical aliases from BOOK_GROUPS for Genesis should also map to 'Gen'
    expect(map.get("genesis")).toBe("Gen");
    expect(map.get("ge")).toBe("Gen");
    expect(map.get("gn")).toBe("Gen");
  });

  test("returns empty map for empty entries", () => {
    const map = buildCrossReferenceBookTokenByAlias([]);
    expect(map.size).toBe(0);
  });

  test("handles both 'from' and 'to' tokens", () => {
    const entries = [
      { from: "Gen.1.1", to: "Rev.22.1" },
    ];
    const map = buildCrossReferenceBookTokenByAlias(entries);
    expect(map.get("gen")).toBe("Gen");
    expect(map.get("rev")).toBe("Rev");
  });

  test("handles entries without dots (null tokens) gracefully", () => {
    const entries = [
      { from: "NoBookRef", to: "AlsoNoRef" },
    ];
    const map = buildCrossReferenceBookTokenByAlias(entries);
    expect(map.size).toBe(0);
  });
});

// ─── crossReferenceHasChapter ─────────────────────────────────────────────────

describe("crossReferenceHasChapter", () => {
  test("returns true when chapter key is in reference", () => {
    expect(crossReferenceHasChapter("Gen.1.1", "Gen.1")).toBe(true);
  });

  test("returns false when chapter key is not in reference", () => {
    expect(crossReferenceHasChapter("Gen.1.1", "Gen.2")).toBe(false);
  });

  test("returns false for completely different book", () => {
    expect(crossReferenceHasChapter("Gen.1.1", "Rev.1")).toBe(false);
  });
});

// ─── BOOK_GROUPS ──────────────────────────────────────────────────────────────

describe("BOOK_GROUPS", () => {
  test("is an array", () => {
    expect(Array.isArray(BOOK_GROUPS)).toBe(true);
  });

  test("contains Law section with Genesis", () => {
    const law = BOOK_GROUPS.find((g) => g.title === "Law");
    expect(law).toBeDefined();
    expect(law!.books[0][0]).toBe("Genesis");
  });
});
