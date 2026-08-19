export interface CrossReferenceEntry {
    from: string;
    to: string;
    votes: number;
}
/**
 * Fetches the cross reference dataset from the public folder so it is loaded
 * on demand instead of bundled into the main application chunk.
 */
export declare function fetchCrossReferences(): Promise<CrossReferenceEntry[]>;
export declare function resetCrossReferencesCacheForTests(): void;
//# sourceMappingURL=crossReferenceLoader.d.ts.map