import React from "react";
import { HighlightColor } from "../../contexts/BibleTypes";
declare const HIGHLIGHT_COLORS: {
    color: HighlightColor;
    label: string;
    bgColor: string;
}[];
interface HighlighterMenuProps {
    anchorEl: null | HTMLElement;
    onClose: () => void;
    onSelectColor: (color: HighlightColor) => void;
    onRemoveHighlight: () => void;
}
export declare const HighlighterMenu: React.FC<HighlighterMenuProps>;
export { HIGHLIGHT_COLORS };
//# sourceMappingURL=HighlighterMenu.d.ts.map