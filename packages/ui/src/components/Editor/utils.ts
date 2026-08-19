// Utility functions for the Editor component
// Contains helper functions for HTML handling, image processing, and DOM manipulation

import type { BibleBookmarkSelection } from "./types";

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param value - The string to escape
 * @returns Escaped HTML string
 */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Retrieves the list of Bible books from window global
 * @returns Array of Bible book names
 */
export const getBibleBooks = (): string[] =>
  ((window as Window & { BIBLE_BOOKS?: string[] }).BIBLE_BOOKS ||
    []) as string[];

/**
 * Parses a Bible bookmark hash (e.g., "#Genesis:3" or "#Genesis:3:16")
 * @param href - The href value to parse
 * @returns Parsed Bible selection or null if invalid
 */
export const parseBibleBookmarkHash = (
  href: string,
): BibleBookmarkSelection | null => {
  const match = href.trim().match(/^#([^:]+):(\d+)(?::(\d+))?$/);
  if (!match) return null;

  const book = decodeURIComponent(match[1])
    .replace(/\+/g, " ")
    .replace(/[_-]/g, " ")
    .trim();
  const chapterNumber = Number.parseInt(match[2], 10);
  const verseNumber = match[3] ? Number.parseInt(match[3], 10) : null;
  if (!book || !Number.isFinite(chapterNumber) || chapterNumber < 1)
    return null;
  if (verseNumber !== null && (!Number.isFinite(verseNumber) || verseNumber < 1))
    return null;

  return { book, chapterNumber, verseNumber };
};

/**
 * Creates HTML for a Bible bookmark link
 * @param selection - The Bible selection (book and chapter)
 * @returns HTML string for the link
 */
export const createBibleBookmarkHtml = (selection: BibleBookmarkSelection): string => {
  const bookHash = selection.book.trim().replace(/\s+/g, "-");
  const verseSuffix =
    selection.verseNumber && selection.verseNumber > 0
      ? `:${selection.verseNumber}`
      : "";
  const hash = `#${bookHash}:${selection.chapterNumber}${verseSuffix}`;
  const linkText = `${selection.book.trim()} ${selection.chapterNumber}${verseSuffix}`;
  return `<a href="${escapeHtml(hash)}">${escapeHtml(linkText)}</a>`;
};

/**
 * Validates if a link href is safe to open
 * Prevents javascript:, data:, vbscript: and other dangerous protocols
 * @param href - The href value to validate
 * @returns True if the href is safe to open
 */
export const canOpenLinkHref = (href: string): boolean => {
  const value = href.trim();
  if (!value) return false;
  if (/^(javascript:|data:|vbscript:)/i.test(value)) return false;
  return /^(https?:|mailto:|tel:|#|\/|\?)/i.test(value);
};

/**
 * Reads a Blob/File as a data URL
 * @param file - The file to read
 * @returns Promise resolving to data URL string
 */
export const readFileAsDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });

/**
 * Loads an image from a Blob and returns the HTMLImageElement
 * Handles object URL creation and cleanup
 * @param blob - The image blob to load
 * @returns Promise resolving to HTMLImageElement
 */
export const loadImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    image.src = url;
  });

/**
 * Compresses an image to WebP format with max dimension of 1200px
 * Falls back to original format if compression fails
 * @param file - The image file to compress
 * @returns Promise resolving to base64 data URL
 */
export const compressToWebPSmall = async (file: File): Promise<string> => {
  const image = await loadImage(file);
  const maxDimension = 1200;
  const scale = Math.min(
    maxDimension / image.width,
    maxDimension / image.height,
    1,
  );
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) return readFileAsDataUrl(file);

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const webpBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", 0.7);
  });

  if (!webpBlob) return readFileAsDataUrl(file);
  return readFileAsDataUrl(webpBlob);
};

/**
 * Finds a parent HTML element with a specific tag name
 * Traverses up the DOM tree until finding a match or reaching the editor root
 * @param node - Starting node for traversal
 * @param editor - The editor root element
 * @param tag - The tag name to search for (uppercase)
 * @returns The parent element or null if not found
 */
export const findParentTag = (
  node: Node | null,
  editor: HTMLElement,
  tag: string,
) => {
  let current: Node | null = node;
  while (current && current !== editor) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      (current as Element).tagName === tag
    ) {
      return current as HTMLElement;
    }
    current = current.parentNode;
  }
  return null;
};
