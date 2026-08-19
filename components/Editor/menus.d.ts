import React from "react";
import type { LinkMenuState, ImageMenuState, ResizeOverlayState } from "./types";
/**
 * Context menu for link operations
 */
interface LinkMenuProps {
    menu: LinkMenuState | null;
    onOpen: () => void;
    onEdit: () => void;
    onEditBible: () => void;
    onRemove: () => void;
}
export declare const LinkContextMenu: React.FC<LinkMenuProps>;
/**
 * Context menu for image operations
 */
interface ImageMenuProps {
    menu: ImageMenuState | null;
    onLayoutSmall: () => void;
    onLayoutMedium: () => void;
    onLayoutFull: () => void;
    onAlignLeft: () => void;
    onAlignCenter: () => void;
    onAlignRight: () => void;
    onDelete: () => void;
    onClose: () => void;
}
export declare const ImageContextMenu: React.FC<ImageMenuProps>;
/**
 * Resize handle overlay for images
 */
interface ImageResizeOverlayProps {
    overlay: ResizeOverlayState | null;
    onResizeStart: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export declare const ImageResizeOverlay: React.FC<ImageResizeOverlayProps>;
export {};
//# sourceMappingURL=menus.d.ts.map