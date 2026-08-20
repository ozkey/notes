// Type definitions for the Editor component
// These types are shared across multiple editor modules

import type { ReactNode } from "react";

/**
 * Props for the Editor component
 * @property value - Initial HTML content
 * @property lastFileSyncDate - Trigger to refresh content
 * @property onChange - Callback when content changes
 */
export type EditorProps = {
  value?: string;
  lastFileSyncDate?: Date;
  onChange?: (html: string) => void;
};

/**
 * State for the link context menu
 * Tracks position and the anchor element being edited
 */
export type LinkMenuState = {
  x: number;
  y: number;
  anchor: HTMLAnchorElement;
  isBibleLink: boolean;
};

/**
 * State for the image context menu
 * Tracks position and the image element being edited
 */
export type ImageMenuState = {
  x: number;
  y: number;
  image: HTMLImageElement;
};

/**
 * State for image resize overlay
 * Tracks the dimensions and position of the resize handle
 */
export type ResizeOverlayState = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * State during active image resizing
 * Tracks initial position and width for drag calculations
 */
export type ActiveResizeState = {
  startX: number;
  startWidth: number;
};

/**
 * Configuration for a toolbar button
 */
export type ToolbarButton = {
  key: string;
  label: string;
  icon: ReactNode;
  action: () => void;
};

/**
 * Bible bookmark selection data
 * Used when inserting or editing Bible references
 */
export type BibleBookmarkSelection = {
  book: string;
  chapterNumber: number;
  verseNumber?: number | null;
};
