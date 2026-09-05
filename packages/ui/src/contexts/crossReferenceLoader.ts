/**
 * Cross reference data is shipped pre-indexed by the book/chapter/verse
 * hierarchy (see `public/Refdata/README.md`) instead of a single flat array.
 * This lets consumers jump straight to the verses they care about
 * (`data[book][chapter][verse]`) instead of scanning every entry in the
 * dataset. The nested shape is preserved end-to-end - it is never flattened
 * into a big array.
 */
export interface CrossReferenceLink {
  to: string;
  score: number;
}

export type CrossReferenceVerseMap = Record<string, CrossReferenceLink[]>;
export type CrossReferenceChapterMap = Record<string, CrossReferenceVerseMap>;
export type CrossReferenceBookMap = Record<string, CrossReferenceChapterMap>;

const CROSS_REFERENCES_TO_PATH = "./public/Refdata/cross_references_to.json";
const CROSS_REFERENCES_FROM_PATH = "./public/Refdata/cross_references_from.json";
const BOOK_TOKENS_PATH = "./public/Refdata/books.json";

function createCachedJsonFetcher<T>(path: string, validate: (json: unknown) => T) {
  let cached: T | null = null;
  let pending: Promise<T> | null = null;

  const fetchData = async (): Promise<T> => {
    if (cached) return cached;
    if (pending) return pending;

    pending = (async () => {
      const res = await fetch(path);

      if (!res.ok) {
        throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
      }

      const json = await res.json();
      cached = validate(json);
      return cached;
    })().finally(() => {
      pending = null;
    });

    return pending;
  };

  const reset = () => {
    cached = null;
    pending = null;
  };

  return { fetchData, reset };
}

const validateBookMap = (json: unknown): CrossReferenceBookMap => {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    throw new Error("Cross references payload is not a keyed object");
  }
  return json as CrossReferenceBookMap;
};

const validateBookTokens = (json: unknown): string[] => {
  if (!Array.isArray(json)) {
    throw new Error("Book tokens payload is not an array");
  }
  return json as string[];
};

const crossReferencesToFetcher = createCachedJsonFetcher(
  CROSS_REFERENCES_TO_PATH,
  validateBookMap,
);
const crossReferencesFromFetcher = createCachedJsonFetcher(
  CROSS_REFERENCES_FROM_PATH,
  validateBookMap,
);
const bookTokensFetcher = createCachedJsonFetcher(BOOK_TOKENS_PATH, validateBookTokens);

/**
 * Fetches `cross_references_to.json` (keyed by the *target* verse). For a
 * given verse this tells you which other verses reference it.
 */
export const fetchCrossReferencesTo = (): Promise<CrossReferenceBookMap> =>
  crossReferencesToFetcher.fetchData();

/**
 * Fetches `cross_references_from.json` (keyed by the *source* verse). For a
 * given verse this tells you which other verses it references.
 */
export const fetchCrossReferencesFrom = (): Promise<CrossReferenceBookMap> =>
  crossReferencesFromFetcher.fetchData();

/** Fetches the list of canonical cross-reference book tokens (e.g. "Gen"). */
export const fetchCrossReferenceBookTokens = (): Promise<string[]> =>
  bookTokensFetcher.fetchData();

export function resetCrossReferencesCacheForTests() {
  crossReferencesToFetcher.reset();
  crossReferencesFromFetcher.reset();
  bookTokensFetcher.reset();
}

/** Reads the verse -> links map for a single chapter without touching the rest of the dataset. */
export function getChapterVerseLinks(
  data: CrossReferenceBookMap | null | undefined,
  bookToken: string | null | undefined,
  chapterNumber: number,
): CrossReferenceVerseMap {
  if (!data || !bookToken) return {};
  return data[bookToken]?.[String(chapterNumber)] ?? {};
}

/** Reads the links for a single verse without touching the rest of the dataset. */
export function getVerseLinks(
  data: CrossReferenceBookMap | null | undefined,
  bookToken: string | null | undefined,
  chapterNumber: number,
  verseNumber: number,
): CrossReferenceLink[] {
  return getChapterVerseLinks(data, bookToken, chapterNumber)[String(verseNumber)] ?? [];
}
