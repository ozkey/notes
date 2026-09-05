import {
  CrossReferenceBookMap,
  fetchCrossReferenceBookTokens,
  fetchCrossReferencesFrom,
  fetchCrossReferencesTo,
  getChapterVerseLinks,
  getVerseLinks,
  resetCrossReferencesCacheForTests,
} from "../contexts/crossReferenceLoader";

const mockFetchOnce = (json: unknown, ok = true, statusText = "Not Found") => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    statusText,
    json: () => Promise.resolve(json),
  });
};

describe("fetchCrossReferencesFrom", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetCrossReferencesCacheForTests();
  });

  test("fetches the keyed source dataset from the public folder", async () => {
    const json: CrossReferenceBookMap = {
      Gen: { "1": { "1": [{ to: "John.1.1", score: 10 }] } },
    };
    mockFetchOnce(json);

    const result = await fetchCrossReferencesFrom();

    expect(global.fetch).toHaveBeenCalledWith(
      "./public/Refdata/cross_references_from.json",
    );
    expect(result).toEqual(json);
  });

  test("throws when the fetch response is not ok", async () => {
    mockFetchOnce(null, false, "Not Found");

    await expect(fetchCrossReferencesFrom()).rejects.toThrow(
      "Failed to fetch ./public/Refdata/cross_references_from.json: Not Found",
    );
  });

  test("throws when the payload is not a keyed object", async () => {
    mockFetchOnce([]);

    await expect(fetchCrossReferencesFrom()).rejects.toThrow(
      "Cross references payload is not a keyed object",
    );
  });

  test("returns cached data without fetching again", async () => {
    const json: CrossReferenceBookMap = {
      Gen: { "1": { "1": [{ to: "John.1.1", score: 10 }] } },
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });
    global.fetch = fetchMock;

    const first = await fetchCrossReferencesFrom();
    const second = await fetchCrossReferencesFrom();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(json);
    expect(second).toBe(first);
  });
});

describe("fetchCrossReferencesTo", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetCrossReferencesCacheForTests();
  });

  test("fetches the keyed target dataset from the public folder", async () => {
    const json: CrossReferenceBookMap = {
      Gen: { "1": { "1": [{ to: "Ps.90.2", score: 22 }] } },
    };
    mockFetchOnce(json);

    const result = await fetchCrossReferencesTo();

    expect(global.fetch).toHaveBeenCalledWith(
      "./public/Refdata/cross_references_to.json",
    );
    expect(result).toEqual(json);
  });
});

describe("fetchCrossReferenceBookTokens", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetCrossReferencesCacheForTests();
  });

  test("fetches the book token list from the public folder", async () => {
    const json = ["Gen", "Ps", "Rev"];
    mockFetchOnce(json);

    const result = await fetchCrossReferenceBookTokens();

    expect(global.fetch).toHaveBeenCalledWith("./public/Refdata/books.json");
    expect(result).toEqual(json);
  });

  test("throws when the payload is not an array", async () => {
    mockFetchOnce({});

    await expect(fetchCrossReferenceBookTokens()).rejects.toThrow(
      "Book tokens payload is not an array",
    );
  });
});

describe("getChapterVerseLinks", () => {
  const data: CrossReferenceBookMap = {
    Gen: {
      "1": {
        "1": [
          { to: "Jer.32.17", score: 90 },
          { to: "Isa.44.24", score: 97 },
        ],
      },
    },
  };

  test("returns the verse map for a known book/chapter without touching other data", () => {
    expect(getChapterVerseLinks(data, "Gen", 1)).toEqual(data.Gen["1"]);
  });

  test("returns an empty object for an unknown chapter", () => {
    expect(getChapterVerseLinks(data, "Gen", 99)).toEqual({});
  });

  test("returns an empty object for an unknown book", () => {
    expect(getChapterVerseLinks(data, "Rev", 1)).toEqual({});
  });

  test("returns an empty object when data or book token is missing", () => {
    expect(getChapterVerseLinks(null, "Gen", 1)).toEqual({});
    expect(getChapterVerseLinks(data, null, 1)).toEqual({});
  });
});

describe("getVerseLinks", () => {
  const data: CrossReferenceBookMap = {
    Gen: {
      "1": {
        "1": [{ to: "Jer.32.17", score: 90 }],
      },
    },
  };

  test("returns the links for a known verse", () => {
    expect(getVerseLinks(data, "Gen", 1, 1)).toEqual([
      { to: "Jer.32.17", score: 90 },
    ]);
  });

  test("returns an empty array for an unknown verse", () => {
    expect(getVerseLinks(data, "Gen", 1, 2)).toEqual([]);
  });
});
