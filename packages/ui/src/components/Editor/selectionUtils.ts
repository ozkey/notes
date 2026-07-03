// Utilities for managing text selection and undo/redo functionality in the editor

/**
 * Performs selection manipulation with a callback
 * Used to execute document commands on specific nodes
 * @param node - The node to select
 * @param editorRef - Reference to the editor element
 * @param apply - Callback that performs the action on the selection
 * @returns True if the action was applied successfully
 */
export const withSelectedNode = (
  node: Node,
  editorRef: React.RefObject<HTMLDivElement | null>,
  apply: (selection: Selection) => boolean,
): boolean => {
  if (!editorRef.current) return false;
  const selection = window.getSelection();
  if (!selection) return false;
  editorRef.current.focus();
  const range = document.createRange();
  range.selectNode(node);
  selection.removeAllRanges();
  selection.addRange(range);
  return apply(selection);
};

/**
 * Replaces an HTML element while maintaining undo/redo capability
 * Uses document.execCommand to ensure changes are undoable
 * @param element - The element to replace
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param mutate - Callback that modifies the cloned element
 * @returns The new element after replacement, or null if unchanged or failed
 */
export const replaceElementUndoably = <T extends HTMLElement>(
  element: T,
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  mutate: (draft: T) => void,
): T | null => {
  if (!editorRef.current || !element.isConnected) return null;
  const draft = element.cloneNode(true) as T;
  const before = draft.outerHTML;
  mutate(draft);
  if (draft.outerHTML === before) return null;

  const tokenAttr = "data-editor-replace-token";
  const token = `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  draft.setAttribute(tokenAttr, token);
  const html = draft.outerHTML;
  const didReplace = withSelectedNode(element, editorRef, () =>
    document.execCommand("insertHTML", false, html),
  );

  if (!didReplace) {
    draft.removeAttribute(tokenAttr);
    element.replaceWith(draft);
    return draft;
  }

  const nextElement = editorRef.current.querySelector(
    `[${tokenAttr}="${token}"]`,
  ) as T | null;
  if (!nextElement) return null;
  nextElement.removeAttribute(tokenAttr);
  return nextElement;
};

/**
 * Replaces a node with text content
 * Uses execCommand for undo support or falls back to direct DOM manipulation
 * @param node - The node to replace
 * @param editorRef - Reference to the editor element
 * @param text - The text to insert
 * @returns True if replacement was successful
 */
export const replaceNodeWithTextUndoably = (
  node: Node,
  editorRef: React.RefObject<HTMLDivElement | null>,
  text: string,
): boolean => {
  const replaced = withSelectedNode(node, editorRef, () =>
    document.execCommand("insertText", false, text),
  );
  if (replaced) return true;
  const parent = node.parentNode;
  if (!parent) return false;
  parent.replaceChild(document.createTextNode(text), node);
  return true;
};

/**
 * Removes a node from the DOM
 * Uses execCommand for undo support or falls back to direct DOM manipulation
 * @param node - The node to remove
 * @param editorRef - Reference to the editor element
 * @returns True if removal was successful
 */
export const removeNodeUndoably = (
  node: Node,
  editorRef: React.RefObject<HTMLDivElement | null>,
): boolean => {
  const deleted = withSelectedNode(node, editorRef, () =>
    document.execCommand("delete"),
  );
  if (deleted) return true;
  const parent = node.parentNode;
  if (parent) {
    parent.removeChild(node);
    return true;
  }
  return false;
};
