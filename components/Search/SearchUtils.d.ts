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
export declare function searchBibleText(bibleText: any, searchQuery: string): SearchResult[];
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
export declare function highlightKeyword(text: string, keyword: string): HighlightPart[];
//# sourceMappingURL=SearchUtils.d.ts.map