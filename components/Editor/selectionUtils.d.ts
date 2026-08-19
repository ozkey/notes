/**
 * Performs selection manipulation with a callback
 * Used to execute document commands on specific nodes
 * @param node - The node to select
 * @param editorRef - Reference to the editor element
 * @param apply - Callback that performs the action on the selection
 * @returns True if the action was applied successfully
 */
export declare const withSelectedNode: (node: Node, editorRef: React.RefObject<HTMLDivElement | null>, apply: (selection: Selection) => boolean) => boolean;
/**
 * Replaces an HTML element while maintaining undo/redo capability
 * Uses Range API instead of deprecated execCommand
 * @param element - The element to replace
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param mutate - Callback that modifies the cloned element
 * @returns The new element after replacement, or null if unchanged or failed
 */
export declare const replaceElementUndoably: <T extends HTMLElement>(element: T, editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, mutate: (draft: T) => void) => T | null;
/**
 * Replaces a node with text content
 * Uses Range API instead of deprecated execCommand
 * @param node - The node to replace
 * @param editorRef - Reference to the editor element
 * @param text - The text to insert
 * @returns True if replacement was successful
 */
export declare const replaceNodeWithTextUndoably: (node: Node, editorRef: React.RefObject<HTMLDivElement | null>, text: string) => boolean;
/**
 * Removes a node from the DOM
 * Uses Range API instead of deprecated execCommand
 * @param node - The node to remove
 * @param editorRef - Reference to the editor element
 * @returns True if removal was successful
 */
export declare const removeNodeUndoably: (node: Node, editorRef: React.RefObject<HTMLDivElement | null>) => boolean;
//# sourceMappingURL=selectionUtils.d.ts.map