/**
 * Updates the resize overlay position and dimensions based on image position
 * @param image - The image element to track
 * @param setResizeOverlay - State setter for resize overlay
 */
export declare const updateResizeOverlayFromImage: (image: HTMLImageElement, setResizeOverlay: (state: any) => void) => void;
/**
 * Applies CSS classes to set image layout (size and float)
 * @param image - The image element to style
 * @param layout - The layout type (small, medium, full)
 */
export declare const setImageLayoutStyles: (image: HTMLImageElement, layout: "small" | "medium" | "full") => void;
/**
 * Applies alignment styles (float) to an image
 * @param image - The image element to align
 * @param align - The alignment direction (left, center, right)
 */
export declare const setImageAlignmentStyles: (image: HTMLImageElement, align: "left" | "center" | "right") => void;
/**
 * Applies both layout and alignment to an image
 * @param image - The image element to style
 * @param layout - The layout type
 * @param align - The alignment direction
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param setImageMenu - State setter for image menu
 * @param updateResizeOverlay - Function to update resize overlay
 * @param syncFromEditor - Callback to sync content
 */
export declare const applyImageLayout: (image: HTMLImageElement, layout: "small" | "medium" | "full", align: "left" | "center" | "right", editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, setImageMenu: (state: any) => void, updateResizeOverlay: () => void, syncFromEditor: () => void) => void;
/**
 * Applies alignment to an image (without changing layout)
 * @param image - The image element to align
 * @param align - The alignment direction
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param setImageMenu - State setter for image menu
 * @param updateResizeOverlay - Function to update resize overlay
 * @param syncFromEditor - Callback to sync content
 */
export declare const applyImageAlignment: (image: HTMLImageElement, align: "left" | "center" | "right", editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, setImageMenu: (state: any) => void, updateResizeOverlay: () => void, syncFromEditor: () => void) => void;
/**
 * Removes an image from the editor
 * @param image - The image element to remove
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param setImageMenu - State setter for image menu
 * @param setResizeOverlay - State setter for resize overlay
 * @param syncFromEditor - Callback to sync content
 */
export declare const removeImage: (image: HTMLImageElement, editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, setImageMenu: (state: any) => void, setResizeOverlay: (state: any) => void, syncFromEditor: () => void) => void;
/**
 * Inserts multiple image files into the editor
 * Filters for image files and compresses them before insertion
 * @param files - The files to insert
 * @param editorRef - Reference to the editor element
 * @param insertHtmlAtSelection - Function to insert HTML
 */
export declare const insertImages: (files: FileList | File[], editorRef: React.RefObject<HTMLDivElement | null>, insertHtmlAtSelection: (html: string) => void) => Promise<void>;
//# sourceMappingURL=imageUtils.d.ts.map