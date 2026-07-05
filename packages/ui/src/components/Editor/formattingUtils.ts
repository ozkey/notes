// Utilities for content formatting (headings, alerts, blocks, etc.)

import { findParentTag } from "./utils";

/**
 * Executes a document command on the editor
 * Focuses the editor, runs the command, and syncs content
 * @param editorRef - Reference to the editor element
 * @param command - The execCommand command name
 * @param syncFromEditor - Callback to sync content after the command
 * @param valueArg - Optional argument for the command
 */
export const runExec = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  command: string,
  syncFromEditor: () => void,
  valueArg?: string,
) => {
  editorRef.current?.focus();
  document.execCommand(command, false, valueArg);
  syncFromEditor();
};

/**
 * Executes formatBlock command for heading/block style changes
 * @param editorRef - Reference to the editor element
 * @param blockTag - The block tag (h1, h2, h3, p, pre, blockquote, etc.)
 * @param syncFromEditor - Callback to sync content after the command
 */
export const runFormatBlock = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  blockTag: string,
  syncFromEditor: () => void,
) => {
  runExec(editorRef, "formatBlock", syncFromEditor, blockTag);
};

/**
 * Applies an alert variant (info, warning, error) or quote style to a blockquote
 * Adds appropriate CSS class for styling
 * @param editorRef - Reference to the editor element
 * @param variant - The alert variant type
 * @param syncFromEditor - Callback to sync content after changes
 */
export const applyAlertVariant = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  variant: "quote" | "info" | "warning" | "error",
  syncFromEditor: () => void,
) => {
  runFormatBlock(editorRef, "blockquote", syncFromEditor);
  const selection = window.getSelection();
  const anchorNode = selection?.anchorNode || null;
  if (!editorRef.current) return;
  const blockquote = findParentTag(
    anchorNode,
    editorRef.current,
    "BLOCKQUOTE",
  );
  if (!blockquote) return;
  blockquote.className = variant === "quote" ? "" : `editor-alert-${variant}`;
  syncFromEditor();
};

/**
 * Inserts HTML at the current selection and positions cursor at end
 * Focuses the editor and executes insertHTML command
 * @param editorRef - Reference to the editor element
 * @param html - The HTML string to insert
 * @param syncFromEditor - Callback to sync content after insertion
 */
export const insertHtmlAtSelection = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  html: string,
  syncFromEditor: () => void,
) => {
  editorRef.current?.focus();
  document.execCommand("insertHTML", false, html);
  
  // Move cursor to end of inserted content
  const selection = window.getSelection();
  if (selection && editorRef.current) {
    // Move cursor to the end of the editor content
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.collapse(false); // false = move to end
    selection.removeAllRanges();
    selection.addRange(range);
  }
  
  syncFromEditor();
};

/**
 * Maps highlight color names to CSS background colors
 * @param color - The highlight color name
 * @returns CSS color value
 */
export const getColorForHighlight = (color: string): string => {
  const colorMap: Record<string, string> = {
    green: "#C8E6C9",
    blue: "#BBDEFB",
    pink: "#F8BBD0",
    red: "#FFCDD2",
    orange: "#FFE0B2",
    purple: "#E1BEE7",
  };
  return colorMap[color] || "#FFFFFF";
};

/**
 * Creates HTML for a verse highlight badge
 * @param verseNumber - The verse number to display
 * @param color - The highlight color
 * @returns HTML string for the badge
 */
export const createHighlightBadgeHtml = (
  verseNumber: number,
  color: string,
): string => {
  return `<span class="editor-highlight-badge" data-color="${color}" contenteditable="false">${verseNumber}</span> - `;
};
