// Utility to fetch and parse the Bible text JSON from the public folder.

export interface BibleTextResult {
  bibleText: any | null;
  bookNames: string[];
}

export type BibleTranslationId = "cpdv" | "douay-rheims";

export interface BibleTranslationOption {
  id: BibleTranslationId;
  label: string;
  fileName: string;
}

export const BIBLE_TRANSLATIONS: BibleTranslationOption[] = [
  {
    id: "cpdv",
    label: "Catholic Public Domain Version",
    fileName: "Catholic-Public-Domain-Version.json",
  },
  { id: "douay-rheims", label: "Douay-Rheims", fileName: "Douay-Rheims.json" },
];

export const DEFAULT_BIBLE_TRANSLATION: BibleTranslationId = "cpdv";

/**
 * Fetches the selected bible JSON and returns the parsed bible text together with
 * the list of book names extracted from it.
 */
export async function fetchBibleText(
  translationId: BibleTranslationId = DEFAULT_BIBLE_TRANSLATION,
): Promise<BibleTextResult> {
  // original text taken from:
  // https://github.com/scrollmapper/bible_databases/tree/master/sources/en/CPDV
  // https://github.com/scrollmapper/bible_databases/tree/master/sources/en/DRC

  const selectedTranslation =
    BIBLE_TRANSLATIONS.find((item) => item.id === translationId) ??
    BIBLE_TRANSLATIONS.find((item) => item.id === DEFAULT_BIBLE_TRANSLATION)!;
  const res = await fetch(`./public/${selectedTranslation.fileName}`);

  if (!res.ok) {
    console.warn("Failed to fetch bible text from API:", res.statusText);
    return { bibleText: null, bookNames: [] };
  }

  const json = await res.json();
  let bookNames: string[] = [];

  if (Array.isArray(json?.books)) {
    try {
      bookNames = json.books
        .map((b: any) => (b && typeof b.name === "string" ? b.name : null))
        .filter(Boolean) as string[];
    } catch (e) {
      console.warn("Failed to parse books from API response", e);
    }
  }

  return { bibleText: json, bookNames };
}
