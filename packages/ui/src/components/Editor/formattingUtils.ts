// Utilities for content formatting (headings, alerts, blocks, etc.)

import { findParentTag } from "./utils";

/**
 * Executes a document command on the editor
 * Note: Some commands still use execCommand as there's no perfect modern replacement
 * for all rich text editing operations. These will continue to work in browsers.
 * @param editorRef - Reference to the editor element
 * @param command - The command name
 * @param syncFromEditor - Callback to sync content after the command
 * @param valueArg - Optional argument for the command
 */
export const runExec = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  command: string,
  syncFromEditor: () => void,
  valueArg?: string,
) => {
  if (!editorRef.current) return;
  editorRef.current.focus();
  
  try {
    document.execCommand(command, false, valueArg);
  } catch (e) {
    console.warn(`Command "${command}" failed:`, e);
  }
  
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
 * Uses modern Range API instead of deprecated execCommand
 * @param editorRef - Reference to the editor element
 * @param html - The HTML string to insert
 * @param syncFromEditor - Callback to sync content after insertion
 */
export const insertHtmlAtSelection = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  html: string,
  syncFromEditor: () => void,
) => {
  if (!editorRef.current) return;
  editorRef.current.focus();
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    // No selection, append to end of editor
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    while (tempDiv.firstChild) {
      editorRef.current.appendChild(tempDiv.firstChild);
    }
  } else {
    // Insert at current selection using Range API
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    // Create document fragment from HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    
    // Insert the fragment
    range.insertNode(fragment);
    
    // Move cursor to end of inserted content
    range.collapse(false);
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
