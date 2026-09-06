// Search utility functions for finding verses by keyword

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Search the Bible text for a keyword
 * Returns all matching verses with book, chapter, verse info
 * 
 * Supports word boundary matching:
 * - " key" (leading space) matches only when "key" starts a word
 * - "key " (trailing space) matches only when "key" ends a word
 * - " key " (both spaces) matches only complete words
 */
export function searchBibleText(
  bibleText: any,
  searchQuery: string,
): SearchResult[] {
  if (!bibleText || searchQuery === "") return [];

  const hasLeadingSpace = searchQuery.startsWith(" ");
  const hasTrailingSpace = searchQuery.endsWith(" ");
  const trimmedQuery = searchQuery.trim().toLowerCase();

  if (!trimmedQuery) return [];

  const results: SearchResult[] = [];

  if (!bibleText.books || !Array.isArray(bibleText.books)) {
    return results;
  }

  // Build regex pattern for word boundary matching
  let searchPattern: RegExp;
  if (hasLeadingSpace && hasTrailingSpace) {
    // Word boundary on both sides (complete word match)
    searchPattern = new RegExp(`\\b${escapeRegex(trimmedQuery)}\\b`, "gi");
  } else if (hasLeadingSpace) {
    // Word boundary at start only (match at word start)
    searchPattern = new RegExp(`\\b${escapeRegex(trimmedQuery)}`, "gi");
  } else if (hasTrailingSpace) {
    // Word boundary at end only (match at word end)
    searchPattern = new RegExp(`${escapeRegex(trimmedQuery)}\\b`, "gi");
  } else {
    // No word boundary matching, match anywhere in text
    searchPattern = new RegExp(escapeRegex(trimmedQuery), "gi");
  }

  for (const book of bibleText.books) {
    if (!book.name || !book.chapters || !Array.isArray(book.chapters)) {
      continue;
    }

    for (const chapter of book.chapters) {
      if (
        !chapter.chapter ||
        !chapter.verses ||
        !Array.isArray(chapter.verses)
      ) {
        continue;
      }

      for (const verse of chapter.verses) {
        if (!verse.text) continue;

        if (searchPattern.test(verse.text)) {
          results.push({
            book: book.name,
            chapter: chapter.chapter,
            verse: parseInt(verse.verse, 10),
            text: verse.text,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlight the search query in the verse text by wrapping it in a span
 * Returns an array with indices where matches occur
 * 
 * Respects word boundaries from leading/trailing spaces in keyword
 */
export interface HighlightPart {
  type: "text" | "highlight";
  content: string;
  key: string;
}

export function highlightKeyword(
  text: string,
  keyword: string,
): HighlightPart[] {
  if (!keyword) return [{ type: "text", content: text, key: "0" }];

  const hasLeadingSpace = keyword.startsWith(" ");
  const hasTrailingSpace = keyword.endsWith(" ");
  const trimmedKeyword = keyword.trim().toLowerCase();

  if (!trimmedKeyword) return [{ type: "text", content: text, key: "0" }];

  const parts: HighlightPart[] = [];
  let partKey = 0;

  // Build regex pattern for word boundary matching
  let searchPattern: RegExp;
  if (hasLeadingSpace && hasTrailingSpace) {
    // Word boundary on both sides (complete word match)
    searchPattern = new RegExp(`\\b${escapeRegex(trimmedKeyword)}\\b`, "g");
  } else if (hasLeadingSpace) {
    // Word boundary at start only (match at word start)
    searchPattern = new RegExp(`\\b${escapeRegex(trimmedKeyword)}`, "g");
  } else if (hasTrailingSpace) {
    // Word boundary at end only (match at word end)
    searchPattern = new RegExp(`${escapeRegex(trimmedKeyword)}\\b`, "g");
  } else {
    // No word boundary matching, match anywhere in text
    searchPattern = new RegExp(escapeRegex(trimmedKeyword), "g");
  }

  const textLower = text.toLowerCase();
  let lastIndex = 0;
  let match;

  // Reset regex to start
  searchPattern.lastIndex = 0;

  while ((match = searchPattern.exec(textLower)) !== null) {
    const currentIndex = match.index;

    // Add the text before the match
    if (currentIndex > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, currentIndex),
        key: `${partKey++}`,
      });
    }

    // Add the highlighted match
    parts.push({
      type: "highlight",
      content: text.substring(currentIndex, currentIndex + match[0].length),
      key: `${partKey++}`,
    });

    lastIndex = currentIndex + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
      key: `${partKey++}`,
    });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text, key: "0" }];
}
