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
 */
export function searchBibleText(
  bibleText: any,
  searchQuery: string,
): SearchResult[] {
  if (!bibleText || !searchQuery.trim()) return [];
  
  const query = searchQuery.toLowerCase();
  const results: SearchResult[] = [];

  if (!bibleText.books || !Array.isArray(bibleText.books)) {
    return results;
  }

  for (const book of bibleText.books) {
    if (!book.name || !book.chapters || !Array.isArray(book.chapters)) {
      continue;
    }

    for (const chapter of book.chapters) {
      if (!chapter.chapter || !chapter.verses || !Array.isArray(chapter.verses)) {
        continue;
      }

      for (const verse of chapter.verses) {
        if (!verse.text) continue;
        
        if (verse.text.toLowerCase().includes(query)) {
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
 * Highlight the search query in the verse text by wrapping it in a span
 * Returns an array with indices where matches occur
 */
export interface HighlightPart {
  type: "text" | "highlight";
  content: string;
  key: string;
}

export function highlightKeyword(text: string, keyword: string): HighlightPart[] {
  if (!keyword.trim()) return [{ type: "text", content: text, key: "0" }];

  const query = keyword.toLowerCase();
  const parts: HighlightPart[] = [];
  let lastIndex = 0;
  let currentIndex = 0;
  let partKey = 0;

  while ((currentIndex = text.toLowerCase().indexOf(query, lastIndex)) !== -1) {
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
      content: text.substring(currentIndex, currentIndex + keyword.length),
      key: `${partKey++}`,
    });

    lastIndex = currentIndex + keyword.length;
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
