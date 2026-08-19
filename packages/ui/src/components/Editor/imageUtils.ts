// Utilities for image handling, resizing, and alignment

import { replaceElementUndoably, removeNodeUndoably } from "./selectionUtils";
import { compressToWebPSmall } from "./utils";

/**
 * Updates the resize overlay position and dimensions based on image position
 * @param image - The image element to track
 * @param setResizeOverlay - State setter for resize overlay
 */
export const updateResizeOverlayFromImage = (
  image: HTMLImageElement,
  setResizeOverlay: (state: any) => void,
) => {
  const rect = image.getBoundingClientRect();
  setResizeOverlay({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  });
};

/**
 * Applies CSS classes to set image layout (size and float)
 * @param image - The image element to style
 * @param layout - The layout type (small, medium, full)
 */
export const setImageLayoutStyles = (
  image: HTMLImageElement,
  layout: "small" | "medium" | "full",
) => {
  image.className = `editor-image editor-image-${layout}`;
};

/**
 * Applies alignment styles (float) to an image
 * @param image - The image element to align
 * @param align - The alignment direction (left, center, right)
 */
export const setImageAlignmentStyles = (
  image: HTMLImageElement,
  align: "left" | "center" | "right",
) => {
  if (align === "center") {
    image.style.float = "none";
    image.style.margin = "0 auto";
    image.style.display = "block";
  } else if (align === "left") {
    image.style.float = "left";
    image.style.margin = "0 1em 1em 0";
    image.style.display = "";
  } else {
    image.style.float = "right";
    image.style.margin = "0 0 1em 1em";
    image.style.display = "";
  }
};

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
export const applyImageLayout = (
  image: HTMLImageElement,
  layout: "small" | "medium" | "full",
  align: "left" | "center" | "right",
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  setImageMenu: (state: any) => void,
  updateResizeOverlay: () => void,
  syncFromEditor: () => void,
) => {
  const nextImage = replaceElementUndoably(image, editorRef, savedRangeRef, (img) => {
    setImageLayoutStyles(img, layout);
    setImageAlignmentStyles(img, align);
  });
  if (!nextImage) return;
  setImageMenu((previous: any) =>
    previous ? { ...previous, image: nextImage } : previous,
  );
  updateResizeOverlay();
  syncFromEditor();
};

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
export const applyImageAlignment = (
  image: HTMLImageElement,
  align: "left" | "center" | "right",
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  setImageMenu: (state: any) => void,
  updateResizeOverlay: () => void,
  syncFromEditor: () => void,
) => {
  const nextImage = replaceElementUndoably(image, editorRef, savedRangeRef, (img) => {
    setImageAlignmentStyles(img, align);
  });
  if (!nextImage) return;
  setImageMenu((previous: any) =>
    previous ? { ...previous, image: nextImage } : previous,
  );
  updateResizeOverlay();
  syncFromEditor();
};

/**
 * Removes an image from the editor
 * @param image - The image element to remove
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to selection state
 * @param setImageMenu - State setter for image menu
 * @param setResizeOverlay - State setter for resize overlay
 * @param syncFromEditor - Callback to sync content
 */
export const removeImage = (
  image: HTMLImageElement,
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  setImageMenu: (state: any) => void,
  setResizeOverlay: (state: any) => void,
  syncFromEditor: () => void,
) => {
  removeNodeUndoably(image, editorRef);
  setImageMenu(null);
  setResizeOverlay(null);
  syncFromEditor();
};

/**
 * Inserts multiple image files into the editor
 * Filters for image files and compresses them before insertion
 * @param files - The files to insert
 * @param editorRef - Reference to the editor element
 * @param insertHtmlAtSelection - Function to insert HTML
 */
export const insertImages = async (
  files: FileList | File[],
  editorRef: React.RefObject<HTMLDivElement | null>,
  insertHtmlAtSelection: (html: string) => void,
) => {
  const imageFiles = Array.from(files).filter((file) =>
    file.type.toLowerCase().startsWith("image/"),
  );
  for (const file of imageFiles) {
    const dataUrl = await compressToWebPSmall(file);
    insertHtmlAtSelection(
      `<img src="${dataUrl}" alt="${file.name.replace(/"/g, "&quot;")}" class="editor-image" data-original-format="${file.type.replace(/"/g, "&quot;")}" />`,
    );
  }
};
