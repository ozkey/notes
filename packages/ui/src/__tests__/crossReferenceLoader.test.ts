import {
  CrossReferenceEntry,
  fetchCrossReferences,
  resetCrossReferencesCacheForTests,
} from "../contexts/crossReferenceLoader";

describe("fetchCrossReferences", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetCrossReferencesCacheForTests();
  });

  test("fetches the cross reference dataset from the public folder", async () => {
    const json: CrossReferenceEntry[] = [
      { from: "Gen.1.1", to: "John.1.1", votes: 10 },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await fetchCrossReferences();

    expect(global.fetch).toHaveBeenCalledWith(
      "./public/Refdata/cross_references.json",
    );
    expect(result).toEqual(json);
  });

  test("throws when the fetch response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    await expect(fetchCrossReferences()).rejects.toThrow(
      "Failed to fetch cross references: Not Found",
    );
  });

  test("throws when the payload is not an array", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ entries: [] }),
    });

    await expect(fetchCrossReferences()).rejects.toThrow(
      "Cross references payload is not an array",
    );
  });

  test("returns cached data without fetching again", async () => {
    const json: CrossReferenceEntry[] = [
      { from: "Gen.1.1", to: "John.1.1", votes: 10 },
    ];
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });
    global.fetch = fetchMock;

    const first = await fetchCrossReferences();
    const second = await fetchCrossReferences();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(json);
    expect(second).toBe(first);
  });
});
