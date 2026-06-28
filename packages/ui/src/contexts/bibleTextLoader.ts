// Utility to fetch and parse the Bible text JSON from the public folder.

export interface BibleTextResult {
  bibleText: any | null;
  bookNames: string[];
}

/**
 * Fetches `./public/Douay-Rheims.json` and returns the parsed bible text together with
 * the list of book names extracted from it.
 */
export async function fetchBibleText(): Promise<BibleTextResult> {
  // https://github.com/scrollmapper/bible_databases/tree/master/sources/en/CPDV
  // https://github.com/scrollmapper/bible_databases/tree/master/sources/en/DRC
  const res = await fetch(`./public/Catholic-Public-Domain-Version.json`);

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
