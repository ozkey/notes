// Context menu components for the Editor
// Floating menus that appear for links, images, and tables

import React from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge";
import PhotoSizeSelectSmallIcon from "@mui/icons-material/PhotoSizeSelectSmall";
import WidthFullIcon from "@mui/icons-material/WidthFull";
import type {
  LinkMenuState,
  ImageMenuState,
  ResizeOverlayState,
} from "./types";

/**
 * Context menu for link operations
 */
interface LinkMenuProps {
  menu: LinkMenuState | null;
  onOpen: () => void;
  onEdit: () => void;
  onEditBible: () => void;
  onRemove: () => void;
}

export const LinkContextMenu: React.FC<LinkMenuProps> = ({
  menu,
  onOpen,
  onEdit,
  onEditBible,
  onRemove,
}) => {
  if (!menu) return null;

  return (
    <div className="editor-floating-menu" style={{ left: menu.x, top: menu.y }}>
      <button type="button" onClick={onOpen}>
        Open
      </button>

      {menu.isBibleLink && (
        <button type="button" onClick={onEditBible}>
          Edit Link (Bible/Article)
        </button>
      )}
      <button type="button" onClick={onRemove}>
        Remove
      </button>
      <button type="button" onClick={onEdit}>
        Edit Link
      </button>
    </div>
  );
};

/**
 * Context menu for image operations
 */
interface ImageMenuProps {
  menu: ImageMenuState | null;
  onLayoutSmall: () => void;
  onLayoutMedium: () => void;
  onLayoutFull: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ImageContextMenu: React.FC<ImageMenuProps> = ({
  menu,
  onLayoutSmall,
  onLayoutMedium,
  onLayoutFull,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onDelete,
  onClose,
}) => {
  if (!menu) return null;

  return (
    <div className="editor-floating-menu" style={{ left: menu.x, top: menu.y }}>
      <button
        type="button"
        title="Small image size"
        aria-label="Small image size"
        onClick={onLayoutSmall}
      >
        <PhotoSizeSelectSmallIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Medium image size"
        aria-label="Medium image size"
        onClick={onLayoutMedium}
      >
        <PhotoSizeSelectLargeIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Full width image"
        aria-label="Full width image"
        onClick={onLayoutFull}
      >
        <WidthFullIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Wrap text left"
        aria-label="Wrap text left"
        onClick={onAlignLeft}
      >
        <FormatAlignLeftIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Align image center"
        aria-label="Align image center"
        onClick={onAlignCenter}
      >
        <FormatAlignCenterIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Wrap text right"
        aria-label="Wrap text right"
        onClick={onAlignRight}
      >
        <FormatAlignRightIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Delete image"
        aria-label="Delete image"
        onClick={onDelete}
      >
        <DeleteIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Close image menu"
        aria-label="Close image menu"
        onClick={onClose}
      >
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
};

/**
 * Resize handle overlay for images
 */
interface ImageResizeOverlayProps {
  overlay: ResizeOverlayState | null;
  onResizeStart: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ImageResizeOverlay: React.FC<ImageResizeOverlayProps> = ({
  overlay,
  onResizeStart,
}) => {
  if (!overlay) return null;

  return (
    <div
      className="editor-image-resize-overlay"
      style={{
        left: overlay.left,
        top: overlay.top,
        width: overlay.width,
        height: overlay.height,
      }}
    >
      <button
        type="button"
        className="editor-image-resize-handle"
        title="Drag to resize image"
        aria-label="Drag to resize image"
        onMouseDown={onResizeStart}
      />
    </div>
  );
};
