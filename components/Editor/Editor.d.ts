import React from "react";
import type { EditorProps } from "./types";
import "./Editor.css";
/**
 * The Editor component is a comprehensive rich text editor with support for:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Lists (ordered and unordered)
 * - Headings and block styles
 * - Links (regular and Bible bookmarks)
 * - Images (with resizing and alignment)
 * - Tables (with row/column operations)
 * - Source code editing
 * - Verse highlighting (Bible mode)
 *
 * The component is refactored into utility modules for better maintainability:
 * - types.ts: Type definitions
 * - utils.ts: General utilities (HTML, image processing, DOM)
 * - selectionUtils.ts: Selection and undo/redo management
 * - formattingUtils.ts: Content formatting (headings, blocks)
 * - imageUtils.ts: Image handling and resizing
 * - linkUtils.ts: Link and Bible bookmark operations
 * - tableUtils.ts: Table operations
 * - toolbarConfig.ts: Toolbar button configuration
 * - dialogs.tsx: Dialog sub-components
 * - menus.tsx: Context menu sub-components
 */
export default function Editor({ value, refreshNotesDate: _refreshNotesDate, onChange, }: EditorProps): React.JSX.Element;
//# sourceMappingURL=Editor.d.ts.map