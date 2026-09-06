import React from "react";
/** A single resolved cross reference pair, ready for display. */
export interface CrossReferenceEntry {
    from: string;
    to: string;
    score: number;
}
export declare const getAverageVoteThreshold: (linkedFromChapter?: CrossReferenceEntry[], linkedToChapter?: CrossReferenceEntry[]) => number;
export declare const RefPanel: React.MemoExoticComponent<() => React.JSX.Element>;
//# sourceMappingURL=RefPanel.d.ts.map