import React from "react";
import { HighlightColor } from "../../contexts/BibleTypes";
interface HighlightBadgeProps {
    verseNumber: number;
    color: HighlightColor;
    onDelete?: () => void;
    editable?: boolean;
}
export declare const HighlightBadge: React.FC<HighlightBadgeProps>;
export {};
//# sourceMappingURL=HighlightBadge.d.ts.map