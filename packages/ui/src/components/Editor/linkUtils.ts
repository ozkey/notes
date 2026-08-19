// Utilities for link and Bible bookmark handling

import {
  replaceElementUndoably,
  removeNodeUndoably,
} from "./selectionUtils";
import { createBibleBookmarkHtml, canOpenLinkHref, getBibleBooks } from "./utils";

/**
 * Submits a link insertion or edit
 * @param url - The link URL
 * @param text - The link display text
 * @param openNewTab - Whether to open in new tab
 * @param editingAnchor - The anchor being edited, or null for new link
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param insertHtmlAtSelection - Function to insert HTML
 * @param replaceElement - Function to replace element
 * @param syncFromEditor - Callback to sync content
 */
export const submitLink = (
  url: string,
  text: string,
  openNewTab: boolean,
  editingAnchor: HTMLAnchorElement | null,
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  insertHtmlAtSelection: (html: string) => void,
  replaceElement: <T extends HTMLElement>(
    element: T,
    mutate: (draft: T) => void,
  ) => T | null,
  syncFromEditor: () => void,
) => {
  const href = url.trim();
  if (!href) return;

  const linkText = text.trim() || href;
  const safeHref = href.replace(/"/g, "&quot;");
  const safeText = linkText.replace(/"/g, "&quot;");
  const target = openNewTab ? ' target="_blank"' : "";
  const html = `<a href="${safeHref}"${target}>${safeText}</a>`;

  if (editingAnchor) {
    const updated = replaceElement(editingAnchor, (anchor) => {
      anchor.setAttribute("href", href);
      anchor.setAttribute("target", openNewTab ? "_blank" : "");
      anchor.textContent = linkText;
    });
    if (updated) syncFromEditor();
  } else {
    insertHtmlAtSelection(html);
  }
};

/**
 * Removes a link from the editor
 * @param anchor - The anchor element to remove
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param setLinkMenu - State setter for link menu
 * @param syncFromEditor - Callback to sync content
 */
export const removeLink = (
  anchor: HTMLAnchorElement,
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  setLinkMenu: (state: any) => void,
  syncFromEditor: () => void,
) => {
  removeNodeUndoably(anchor, editorRef);
  setLinkMenu(null);
  syncFromEditor();
};

/**
 * Opens a link in a new window/tab
 * Validates the link href for security before opening
 * @param href - The link href
 */
export const openLink = (href: string) => {
  if (!canOpenLinkHref(href)) return;
  const isExternalUrl = /^https?:/.test(href);
  if (isExternalUrl) {
    window.open(href, "_blank");
  } else {
    window.location.href = href;
  }
};

/**
 * Submits a Bible bookmark insertion or edit
 * @param book - The Bible book name
 * @param chapterNumber - The chapter number
 * @param editingAnchor - The anchor being edited, or null for new bookmark
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param insertHtmlAtSelection - Function to insert HTML
 * @param replaceElement - Function to replace element
 * @param syncFromEditor - Callback to sync content
 */
export const submitBibleBookmark = (
  book: string,
  chapterNumber: number,
  verseNumber: number | null,
  editingAnchor: HTMLAnchorElement | null,
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  insertHtmlAtSelection: (html: string) => void,
  replaceElement: <T extends HTMLElement>(
    element: T,
    mutate: (draft: T) => void,
  ) => T | null,
  syncFromEditor: () => void,
) => {
  const selection = { book, chapterNumber, verseNumber };

  if (editingAnchor) {
    const updated = replaceElement(editingAnchor, (anchor) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = createBibleBookmarkHtml(selection);
      const replacement =
        wrapper.firstElementChild as HTMLAnchorElement | null;
      if (!replacement) return;
      anchor.setAttribute("href", replacement.getAttribute("href") || "#");
      anchor.textContent = replacement.textContent || "";
    });
    if (updated) syncFromEditor();
  } else {
    insertHtmlAtSelection(createBibleBookmarkHtml(selection));
  }
};
