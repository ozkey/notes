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
/**
 * Fetches `cross_references_to.json` (keyed by the *target* verse). For a
 * given verse this tells you which other verses reference it.
 */
export declare const fetchCrossReferencesTo: () => Promise<CrossReferenceBookMap>;
/**
 * Fetches `cross_references_from.json` (keyed by the *source* verse). For a
 * given verse this tells you which other verses it references.
 */
export declare const fetchCrossReferencesFrom: () => Promise<CrossReferenceBookMap>;
/** Fetches the list of canonical cross-reference book tokens (e.g. "Gen"). */
export declare const fetchCrossReferenceBookTokens: () => Promise<string[]>;
export declare function resetCrossReferencesCacheForTests(): void;
/** Reads the verse -> links map for a single chapter without touching the rest of the dataset. */
export declare function getChapterVerseLinks(data: CrossReferenceBookMap | null | undefined, bookToken: string | null | undefined, chapterNumber: number): CrossReferenceVerseMap;
/** Reads the links for a single verse without touching the rest of the dataset. */
export declare function getVerseLinks(data: CrossReferenceBookMap | null | undefined, bookToken: string | null | undefined, chapterNumber: number, verseNumber: number): CrossReferenceLink[];
//# sourceMappingURL=crossReferenceLoader.d.ts.map