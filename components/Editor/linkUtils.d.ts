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
export declare const submitLink: (url: string, text: string, openNewTab: boolean, editingAnchor: HTMLAnchorElement | null, editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, insertHtmlAtSelection: (html: string) => void, replaceElement: <T extends HTMLElement>(element: T, mutate: (draft: T) => void) => T | null, syncFromEditor: () => void) => void;
/**
 * Removes a link from the editor
 * @param anchor - The anchor element to remove
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param setLinkMenu - State setter for link menu
 * @param syncFromEditor - Callback to sync content
 */
export declare const removeLink: (anchor: HTMLAnchorElement, editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, setLinkMenu: (state: any) => void, syncFromEditor: () => void) => void;
/**
 * Opens a link in a new window/tab
 * Validates the link href for security before opening
 * @param href - The link href
 */
export declare const openLink: (href: string) => void;
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
export declare const submitBibleBookmark: (book: string, chapterNumber: number, verseNumber: number | null, editingAnchor: HTMLAnchorElement | null, editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, insertHtmlAtSelection: (html: string) => void, replaceElement: <T extends HTMLElement>(element: T, mutate: (draft: T) => void) => T | null, syncFromEditor: () => void) => void;
//# sourceMappingURL=linkUtils.d.ts.map