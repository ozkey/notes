export interface BibleTextResult {
    bibleText: any | null;
    bookNames: string[];
}
/**
 * Fetches `./public/text.json` and returns the parsed bible text together with
 * the list of book names extracted from it.
 */
export declare function fetchBibleText(): Promise<BibleTextResult>;
//# sourceMappingURL=bibleTextLoader.d.ts.map