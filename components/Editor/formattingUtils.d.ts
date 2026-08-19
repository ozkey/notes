/**
 * Executes a document command on the editor
 * Note: Some commands still use execCommand as there's no perfect modern replacement
 * for all rich text editing operations. These will continue to work in browsers.
 * @param editorRef - Reference to the editor element
 * @param command - The command name
 * @param syncFromEditor - Callback to sync content after the command
 * @param valueArg - Optional argument for the command
 */
export declare const runExec: (editorRef: React.RefObject<HTMLDivElement | null>, command: string, syncFromEditor: () => void, valueArg?: string) => void;
/**
 * Executes formatBlock command for heading/block style changes
 * @param editorRef - Reference to the editor element
 * @param blockTag - The block tag (h1, h2, h3, p, pre, blockquote, etc.)
 * @param syncFromEditor - Callback to sync content after the command
 */
export declare const runFormatBlock: (editorRef: React.RefObject<HTMLDivElement | null>, blockTag: string, syncFromEditor: () => void) => void;
/**
 * Applies an alert variant (info, warning, error) or quote style to a blockquote
 * Adds appropriate CSS class for styling
 * @param editorRef - Reference to the editor element
 * @param variant - The alert variant type
 * @param syncFromEditor - Callback to sync content after changes
 */
export declare const applyAlertVariant: (editorRef: React.RefObject<HTMLDivElement | null>, variant: "quote" | "info" | "warning" | "error", syncFromEditor: () => void) => void;
/**
 * Inserts HTML at the current selection and positions cursor at end
 * Uses modern Range API instead of deprecated execCommand
 * @param editorRef - Reference to the editor element
 * @param html - The HTML string to insert
 * @param syncFromEditor - Callback to sync content after insertion
 */
export declare const insertHtmlAtSelection: (editorRef: React.RefObject<HTMLDivElement | null>, html: string, syncFromEditor: () => void) => void;
/**
 * Maps highlight color names to CSS background colors
 * @param color - The highlight color name
 * @returns CSS color value
 */
export declare const getColorForHighlight: (color: string) => string;
/**
 * Creates HTML for a verse highlight badge
 * @param verseNumber - The verse number to display
 * @param color - The highlight color
 * @returns HTML string for the badge
 */
export declare const createHighlightBadgeHtml: (verseNumber: number, color: string) => string;
//# sourceMappingURL=formattingUtils.d.ts.map