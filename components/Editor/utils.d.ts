import type { BibleBookmarkSelection } from "./types";
/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param value - The string to escape
 * @returns Escaped HTML string
 */
export declare const escapeHtml: (value: string) => string;
/**
 * Retrieves the list of Bible books from window global
 * @returns Array of Bible book names
 */
export declare const getBibleBooks: () => string[];
/**
 * Parses a Bible bookmark hash (e.g., "#Genesis:3" or "#Genesis:3:16")
 * @param href - The href value to parse
 * @returns Parsed Bible selection or null if invalid
 */
export declare const parseBibleBookmarkHash: (href: string) => BibleBookmarkSelection | null;
/**
 * Creates HTML for a Bible bookmark link
 * @param selection - The Bible selection (book and chapter)
 * @returns HTML string for the link
 */
export declare const createBibleBookmarkHtml: (selection: BibleBookmarkSelection) => string;
/**
 * Validates if a link href is safe to open
 * Prevents javascript:, data:, vbscript: and other dangerous protocols
 * @param href - The href value to validate
 * @returns True if the href is safe to open
 */
export declare const canOpenLinkHref: (href: string) => boolean;
/**
 * Reads a Blob/File as a data URL
 * @param file - The file to read
 * @returns Promise resolving to data URL string
 */
export declare const readFileAsDataUrl: (file: Blob) => Promise<string>;
/**
 * Loads an image from a Blob and returns the HTMLImageElement
 * Handles object URL creation and cleanup
 * @param blob - The image blob to load
 * @returns Promise resolving to HTMLImageElement
 */
export declare const loadImage: (blob: Blob) => Promise<HTMLImageElement>;
/**
 * Compresses an image to WebP format with max dimension of 1200px
 * Falls back to original format if compression fails
 * @param file - The image file to compress
 * @returns Promise resolving to base64 data URL
 */
export declare const compressToWebPSmall: (file: File) => Promise<string>;
/**
 * Finds a parent HTML element with a specific tag name
 * Traverses up the DOM tree until finding a match or reaching the editor root
 * @param node - Starting node for traversal
 * @param editor - The editor root element
 * @param tag - The tag name to search for (uppercase)
 * @returns The parent element or null if not found
 */
export declare const findParentTag: (node: Node | null, editor: HTMLElement, tag: string) => HTMLElement | null;
//# sourceMappingURL=utils.d.ts.map