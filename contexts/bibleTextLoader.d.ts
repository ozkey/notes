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
export declare const BIBLE_TRANSLATIONS: BibleTranslationOption[];
export declare const DEFAULT_BIBLE_TRANSLATION: BibleTranslationId;
/**
 * Fetches the selected bible JSON and returns the parsed bible text together with
 * the list of book names extracted from it.
 */
export declare function fetchBibleText(translationId?: BibleTranslationId): Promise<BibleTextResult>;
//# sourceMappingURL=bibleTextLoader.d.ts.map