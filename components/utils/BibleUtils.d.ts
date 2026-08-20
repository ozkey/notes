export declare const toRomanOrdinalBook: (book: string) => string;
export declare const toArabicOrdinalBook: (book: string) => string;
export declare const formatBookLabel: (book: string) => string;
export type BookAliases = [string, ...string[]];
export type BookGroup = {
    title: string;
    books: BookAliases[];
};
export declare const BOOK_GROUPS: BookGroup[];
export declare const normalizeBookAlias: (book: string) => string;
export declare const normalizeReferenceRange: (reference: string) => string;
export declare const formatReferenceDisplay: (reference: string) => string;
export declare const extractCrossReferenceBookToken: (reference: string) => string | null;
export declare const extractCrossReferenceChapterKeys: (reference: string) => string[];
export declare const buildCrossReferenceBookTokenByAlias: (entries: {
    from: string;
    to: string;
}[]) => Map<string, string>;
export declare const crossReferenceHasChapter: (reference: string, chapterKey: string) => boolean;
//# sourceMappingURL=BibleUtils.d.ts.map