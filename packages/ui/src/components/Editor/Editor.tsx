import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import CodeIcon from "@mui/icons-material/Code";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ImageIcon from "@mui/icons-material/Image";
import TableChartIcon from "@mui/icons-material/TableChart";
import EditLocationIcon from "@mui/icons-material/EditLocation";
import LinkIcon from "@mui/icons-material/Link";
import BibleContext from "../../contexts/BibleContext";

// Import types
import type {
  EditorProps,
  LinkMenuState,
  ImageMenuState,
  ResizeOverlayState,
  ActiveResizeState,
} from "./types";

// Import utilities
import {
  escapeHtml,
  getBibleBooks,
  parseBibleBookmarkHash,
  createBibleBookmarkHtml,
  findParentTag,
} from "./utils";
import {
  withSelectedNode,
  replaceElementUndoably,
  replaceNodeWithTextUndoably,
  removeNodeUndoably,
} from "./selectionUtils";
import {
  runExec,
  runFormatBlock,
  applyAlertVariant,
  insertHtmlAtSelection,
  getColorForHighlight,
  createHighlightBadgeHtml,
} from "./formattingUtils";
import {
  updateResizeOverlayFromImage,
  setImageLayoutStyles,
  setImageAlignmentStyles,
  applyImageLayout,
  applyImageAlignment,
  removeImage as removeImageUtil,
  insertImages,
} from "./imageUtils";
import {
  submitLink,
  removeLink as removeLinkUtil,
  openLink,
  submitBibleBookmark,
} from "./linkUtils";
import {
  withCurrentCell,
  insertTable,
  addTableRow,
  deleteTableRow,
  addTableColumn,
  deleteTableColumn,
  deleteTable,
} from "./tableUtils";
import { buildToolbarButtons } from "./toolbarConfig";
import { LinkDialog, BibleDialog, HighlightDialog } from "./dialogs";
import { LinkContextMenu, ImageContextMenu, ImageResizeOverlay } from "./menus";

import "./Editor.css";

/**
 * The Editor component is a comprehensive rich text editor with support for:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Lists (ordered and unordered)
 * - Headings and block styles
 * - Links (regular and Bible bookmarks)
 * - Images (with resizing and alignment)
 * - Tables (with row/column operations)
 * - Source code editing
 * - Verse highlighting (Bible mode)
 *
 * The component is refactored into utility modules for better maintainability:
 * - types.ts: Type definitions
 * - utils.ts: General utilities (HTML, image processing, DOM)
 * - selectionUtils.ts: Selection and undo/redo management
 * - formattingUtils.ts: Content formatting (headings, blocks)
 * - imageUtils.ts: Image handling and resizing
 * - linkUtils.ts: Link and Bible bookmark operations
 * - tableUtils.ts: Table operations
 * - toolbarConfig.ts: Toolbar button configuration
 * - dialogs.tsx: Dialog sub-components
 * - menus.tsx: Context menu sub-components
 */
export default function Editor({
  value = "",
  refreshNotesDate: _refreshNotesDate,
  onChange,
}: EditorProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Content state
  const [content, setContent] = useState(value || "");
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceDraft, setSourceDraft] = useState(value || "");

  // Block formatting state
  const [headingChoice, setHeadingChoice] = useState("p");

  // Menu state
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [linkMenu, setLinkMenu] = useState<LinkMenuState | null>(null);
  const [imageMenu, setImageMenu] = useState<ImageMenuState | null>(null);
  const [resizeOverlay, setResizeOverlay] = useState<ResizeOverlayState | null>(
    null,
  );

  // Editor focus state
  const [isEditing, setIsEditing] = useState(false);

  // Link dialog state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(false);
  const [editingLinkAnchor, setEditingLinkAnchor] =
    useState<HTMLAnchorElement | null>(null);

  // Bible bookmark dialog state
  const [showBibleDialog, setShowBibleDialog] = useState(false);
  const [bibleBook, setBibleBook] = useState("");
  const [bibleChapter, setBibleChapter] = useState("1");
  const [editingBibleAnchor, setEditingBibleAnchor] =
    useState<HTMLAnchorElement | null>(null);

  // Highlight dialog state
  const [showHighlightDialog, setShowHighlightDialog] = useState(false);

  // ============================================================================
  // REFS - Persistent references across renders
  // ============================================================================

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const activeResizeRef = useRef<ActiveResizeState | null>(null);

  // ============================================================================
  // BIBLE CONTEXT
  // ============================================================================

  const bibleContext = useContext(BibleContext);
  const { tabs, currentTab } = bibleContext;
  const currentTabState = tabs[currentTab];

  // Get highlights for the current Bible chapter
  const highlights =
    currentTabState.mode === "bible"
      ? bibleContext.getHighlights(
          currentTabState.selectedBook,
          currentTabState.chapterNumber,
        )
      : [];

  /**
   * Retrieves all verse numbers in the current chapter
   * Used for verse selection dialogs
   */
  const getAllVersesInChapter = (): number[] => {
    if (
      currentTabState.mode !== "bible" ||
      !currentTabState.selectedBook ||
      !bibleContext.bibleText
    ) {
      return [];
    }
    const bibleData = bibleContext.bibleText as any;
    const book = bibleData.books?.find(
      (b: any) => b.name === currentTabState.selectedBook,
    );
    const chapter = book?.chapters?.find(
      (c: any) => c.chapter === currentTabState.chapterNumber,
    );
    if (!chapter || !chapter.verses) return [];
    return chapter.verses.map((v: any) => parseInt(v.verse, 10));
  };

  const highlightsByVerse = new Map(highlights.map((h) => [h.verse, h.color]));
  const allVerses = getAllVersesInChapter();

  // ============================================================================
  // CORE CONTENT MANAGEMENT
  // ============================================================================

  /**
   * Emits content changes to the parent component
   */
  const emitContent = (nextHtml: string) => {
    setContent((prev) => (prev === nextHtml ? prev : nextHtml));
    onChange?.(nextHtml);
  };

  /**
   * Syncs content from editor to state
   * Called after any editor modification
   */
  const syncFromEditor = () => {
    const html = editorRef.current?.innerHTML || "";
    emitContent(html);
  };

  const isEditorHtmlEffectivelyEmpty = (html: string) => {
    const normalized = html
      .toLowerCase()
      .replace(/&nbsp;/g, "")
      .replace(/\u200b/g, "")
      .replace(/\s+/g, "");
    return (
      normalized === "" ||
      normalized === "<br>" ||
      normalized === "<p><br></p>" ||
      normalized === "<p></p>"
    );
  };

  const moveCaretToParagraphStart = (paragraph: HTMLParagraphElement) => {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const ensureParagraphStructure = () => {
    const editor = editorRef.current;
    if (!editor) return;

    if (isEditorHtmlEffectivelyEmpty(editor.innerHTML)) {
      editor.innerHTML = "<p><br></p>";
      const paragraph = editor.querySelector("p");
      if (paragraph instanceof HTMLParagraphElement) {
        moveCaretToParagraphStart(paragraph);
      }
      return;
    }

    const topLevelDivs = Array.from(editor.children).filter(
      (element): element is HTMLDivElement => element instanceof HTMLDivElement,
    );

    topLevelDivs.forEach((div) => {
      const paragraph = document.createElement("p");
      paragraph.innerHTML = div.innerHTML || "<br>";
      div.replaceWith(paragraph);
    });
  };

  // ============================================================================
  // SELECTION MANAGEMENT
  // ============================================================================

  /**
   * Saves the current text selection for later restoration
   * Called on input changes to preserve cursor position
   */
  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  };

  /**
   * Restores a previously saved text selection
   */
  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  /**
   * Focuses the editor and restores previous selection
   */
  const focusEditor = () => {
    editorRef.current?.focus();
    restoreSelection();
  };

  // ============================================================================
  // WRAPPER FUNCTIONS - Bind utilities to component state
  // ============================================================================

  /**
   * Wrapper for replaceElementUndoably that includes all required refs
   */
  const replaceElement = <T extends HTMLElement>(
    element: T,
    mutate: (draft: T) => void,
  ): T | null => {
    return replaceElementUndoably(element, editorRef, savedRangeRef, mutate);
  };

  /**
   * Wrapper for insertHtmlAtSelection that includes all required refs
   */
  const insertHtml = (html: string) => {
    insertHtmlAtSelection(editorRef, html, syncFromEditor);
  };

  /**
   * Wrapper for runExec that includes required refs and callbacks
   */
  const execCommand = (command: string, valueArg?: string) => {
    runExec(editorRef, command, syncFromEditor, valueArg);
  };

  /**
   * Wrapper for image utility functions
   */
  const updateResizeOverlay = () => {
    if (imageMenu?.image) {
      updateResizeOverlayFromImage(imageMenu.image, setResizeOverlay);
    }
  };

  // ============================================================================
  // EFFECTS - Setup and cleanup
  // ============================================================================

  /**
   * Effect: Synchronize external value prop to editor content
   * Prevents overwriting user edits while typing
   */
  useEffect(() => {
    if (isEditing || sourceMode) return;
    const next = value || "";
    setContent((previous) => (previous === next ? previous : next));
    setSourceDraft(next);
    if (editorRef.current && editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
    }
  }, [value, isEditing, sourceMode]);

  /**
   * Effect: Update editor DOM when content state changes
   * Used when switching between source and visual modes
   */
  useEffect(() => {
    if (
      !sourceMode &&
      editorRef.current &&
      editorRef.current.innerHTML !== content
    ) {
      editorRef.current.innerHTML = content;
    }
  }, [content, sourceMode]);



  /**
   * Effect: Update highlight badge colors when Bible highlights change
   * Keeps verse badges in sync with external highlight state
   */
  useEffect(() => {
    if (!editorRef.current) return;

    const badges = editorRef.current.querySelectorAll(
      ".editor-highlight-badge",
    );
    let updated = false;

    badges.forEach((badge) => {
      const verseNumberText = badge.textContent || "";
      const verseNumber = parseInt(verseNumberText, 10);
      if (Number.isNaN(verseNumber)) return;

      const currentColor = badge.getAttribute("data-color") || "white";
      const newColor = highlightsByVerse.get(verseNumber) || "white";

      if (currentColor !== newColor) {
        badge.setAttribute("data-color", newColor);
        updated = true;
      }
    });

    if (updated) {
      syncFromEditor();
    }
  }, [highlights.map((h) => `${h.verse}-${h.color}`).join(",")]);

  /**
   * Effect: Update image resize overlay on scroll/resize
   * Keeps the overlay positioned correctly as page layout changes
   */
  useEffect(() => {
    if (!imageMenu?.image) {
      setResizeOverlay(null);
      return;
    }

    updateResizeOverlay();
    const handleWindowChange = () => updateResizeOverlay();
    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);
    return () => {
      window.removeEventListener("scroll", handleWindowChange, true);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [imageMenu]);

  /**
   * Effect: Handle image resizing with mouse drag
   * Updates image width as user drags the resize handle
   */
  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!activeResizeRef.current || !imageMenu?.image) return;
      const deltaX = event.clientX - activeResizeRef.current.startX;
      const nextWidth = Math.max(
        80,
        activeResizeRef.current.startWidth + deltaX,
      );
      imageMenu.image.style.width = `${Math.round(nextWidth)}px`;
      imageMenu.image.style.height = "auto";
      updateResizeOverlay();
    };

    const onMouseUp = () => {
      if (!activeResizeRef.current) return;
      activeResizeRef.current = null;
      syncFromEditor();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [imageMenu]);

  // ============================================================================
  // LINK OPERATIONS
  // ============================================================================

  const handleInsertLink = () => {
    saveSelection();
    const selection = window.getSelection();
    const text = selection?.toString() || "";
    setEditingLinkAnchor(null);
    setLinkText(text);
    setLinkUrl("");
    setLinkOpenNewTab(false);
    setShowLinkDialog(true);
  };

  const handleSubmitLink = () => {
    submitLink(
      linkUrl,
      linkText,
      linkOpenNewTab,
      editingLinkAnchor,
      editorRef,
      savedRangeRef,
      insertHtml,
      replaceElement,
      syncFromEditor,
    );
    setEditingLinkAnchor(null);
    setShowLinkDialog(false);
  };

  const handleEditLink = (anchor: HTMLAnchorElement) => {
    setEditingLinkAnchor(anchor);
    setLinkUrl(anchor.getAttribute("href") || "");
    setLinkText(anchor.textContent || "");
    setLinkOpenNewTab(anchor.getAttribute("target") === "_blank");
    setShowLinkDialog(true);
  };

  const handleRemoveLink = () => {
    if (!linkMenu?.anchor) return;
    removeLinkUtil(
      linkMenu.anchor,
      editorRef,
      savedRangeRef,
      setLinkMenu,
      syncFromEditor,
    );
  };

  // ============================================================================
  // BIBLE BOOKMARK OPERATIONS
  // ============================================================================

  const openBibleDialog = (anchor?: HTMLAnchorElement) => {
    saveSelection();
    const books = getBibleBooks();
    const parsed = anchor
      ? parseBibleBookmarkHash(anchor.getAttribute("href") || "")
      : null;
    setEditingBibleAnchor(anchor || null);
    setBibleBook(
      parsed?.book && books.includes(parsed.book) ? parsed.book : "",
    );
    setBibleChapter(String(parsed?.chapterNumber || 1));
    setShowBibleDialog(true);
  };

  const insertBibleBookmark = () => {
    openBibleDialog();
  };

  const handleSubmitBibleBookmark = () => {
    const book = bibleBook.trim();
    const chapterNumber = Number.parseInt(bibleChapter, 10);
    if (!book || !Number.isFinite(chapterNumber) || chapterNumber < 1) return;

    submitBibleBookmark(
      book,
      chapterNumber,
      editingBibleAnchor,
      editorRef,
      savedRangeRef,
      insertHtml,
      replaceElement,
      syncFromEditor,
    );

    setEditingBibleAnchor(null);
    setShowBibleDialog(false);
  };

  const editBibleLink = (anchor: HTMLAnchorElement) => {
    openBibleDialog(anchor);
  };

  // ============================================================================
  // IMAGE OPERATIONS
  // ============================================================================

  const handleInsertImages = async (files: FileList | File[]) => {
    await insertImages(files, editorRef, insertHtml);
  };

  const handleApplyImageLayout = (
    size: "small" | "medium" | "full",
    align: "left" | "center" | "right",
  ) => {
    if (!imageMenu?.image) return;
    applyImageLayout(
      imageMenu.image,
      size,
      align,
      editorRef,
      savedRangeRef,
      setImageMenu,
      updateResizeOverlay,
      syncFromEditor,
    );
  };

  const handleApplyImageAlignment = (align: "left" | "center" | "right") => {
    if (!imageMenu?.image) return;
    applyImageAlignment(
      imageMenu.image,
      align,
      editorRef,
      savedRangeRef,
      setImageMenu,
      updateResizeOverlay,
      syncFromEditor,
    );
  };

  const handleRemoveImage = () => {
    if (!imageMenu?.image) return;
    removeImageUtil(
      imageMenu.image,
      editorRef,
      savedRangeRef,
      setImageMenu,
      setResizeOverlay,
      syncFromEditor,
    );
  };

  // ============================================================================
  // TABLE OPERATIONS
  // ============================================================================

  const handleInsertTable = () => {
    insertTable(editorRef, insertHtml);
  };

  const handleAddTableRow = () => {
    addTableRow(editorRef, savedRangeRef, syncFromEditor);
  };

  const handleDeleteTableRow = () => {
    deleteTableRow(editorRef, savedRangeRef, syncFromEditor);
  };

  const handleAddTableColumn = () => {
    addTableColumn(editorRef, savedRangeRef, syncFromEditor);
  };

  const handleDeleteTableColumn = () => {
    deleteTableColumn(editorRef, savedRangeRef, syncFromEditor);
  };

  const handleDeleteTable = () => {
    deleteTable(editorRef, savedRangeRef, syncFromEditor);
  };

  // ============================================================================
  // TEXT FORMATTING OPERATIONS
  // ============================================================================

  const handleHeadingChange = (next: string) => {
    setHeadingChoice(next);
    if (next === "h1" || next === "h2" || next === "h3" || next === "p") {
      runFormatBlock(editorRef, next, syncFromEditor);
      return;
    }
    if (next === "code") {
      runFormatBlock(editorRef, "pre", syncFromEditor);
      return;
    }
    if (
      next === "quote" ||
      next === "info" ||
      next === "warning" ||
      next === "error"
    ) {
      applyAlertVariant(editorRef, next, syncFromEditor);
    }
  };

  // ============================================================================
  // TOOLBAR BUTTONS
  // ============================================================================

  const toolbarButtons = useMemo(
    () => buildToolbarButtons(execCommand),
    [],
  );

  const bibleBooks = getBibleBooks();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="custom-editor">
      {/* Main toolbar */}
      <div className="editor-toolbar">
        {/* Top row: undo, redo, heading select, text formatting */}
        <div className="editor-toolbar-row">
          {toolbarButtons.top.map((item) => (
            <button
              type="button"
              key={item.key}
              className="editor-toolbar-btn"
              title={item.label}
              aria-label={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={item.action}
            >
              {item.icon}
            </button>
          ))}

          <select
            className="editor-toolbar-select"
            value={headingChoice}
            onChange={(event) => handleHeadingChange(event.target.value)}
            title="Headings and block styles"
            aria-label="Headings and block styles"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="p">Paragraph</option>
            <option value="quote">Quote</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="code">Code</option>
          </select>

          {toolbarButtons.formatting.map((item) => (
            <button
              type="button"
              key={item.key}
              className="editor-toolbar-btn"
              title={item.label}
              aria-label={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={item.action}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Bottom row: links, images, tables, source code */}
        <div className="editor-toolbar-row">
          <button
            type="button"
            className="editor-toolbar-btn"
            title="Insert link"
            aria-label="Insert link"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleInsertLink}
          >
            <LinkIcon fontSize="small" />
          </button>
          <button
            type="button"
            className="editor-toolbar-btn"
            title="Insert Bible link"
            aria-label="Insert Bible link"
            onMouseDown={(event) => event.preventDefault()}
            onClick={insertBibleBookmark}
          >
            <BookmarkIcon fontSize="small" />
          </button>
          <button
            type="button"
            className="editor-toolbar-btn"
            title="Add highlighted verse"
            aria-label="Add highlighted verse"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowHighlightDialog(true)}
          >
            <EditLocationIcon fontSize="small" />
          </button>
          <label className="editor-toolbar-btn editor-file-btn">
            <ImageIcon fontSize="small" />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                if (!event.target.files?.length) return;
                void handleInsertImages(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="editor-toolbar-btn"
            title="Table tools"
            aria-label="Table tools"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setShowTableMenu((prev) => !prev);
              focusEditor();
            }}
          >
            <TableChartIcon fontSize="small" />
          </button>
          <button
            type="button"
            className="editor-toolbar-btn"
            title={sourceMode ? "Apply source" : "View or edit HTML source"}
            aria-label={
              sourceMode ? "Apply source" : "View or edit HTML source"
            }
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (sourceMode) {
                emitContent(sourceDraft);
                setSourceMode(false);
                return;
              }
              setSourceDraft(content);
              setSourceMode(true);
            }}
          >
            <CodeIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Table menu */}
      {showTableMenu && (
        <div className="editor-menu">
          <button type="button" onClick={handleInsertTable}>
            Insert Table
          </button>
          <button type="button" onClick={handleAddTableRow}>
            Add Row
          </button>
          <button type="button" onClick={handleDeleteTableRow}>
            Delete Row
          </button>
          <button type="button" onClick={handleAddTableColumn}>
            Add Column
          </button>
          <button type="button" onClick={handleDeleteTableColumn}>
            Delete Column
          </button>
          <button type="button" onClick={handleDeleteTable}>
            Delete Table
          </button>
        </div>
      )}

      {/* Dialogs */}
      <HighlightDialog
        show={showHighlightDialog}
        verses={allVerses}
        highlightsByVerse={highlightsByVerse}
        onSelectVerse={(verseNumber, color) => {
          insertHtml(createHighlightBadgeHtml(verseNumber, color));
        }}
        onClose={() => setShowHighlightDialog(false)}
        getColorForHighlight={getColorForHighlight}
      />

      <LinkDialog
        show={showLinkDialog}
        isEditing={!!editingLinkAnchor}
        url={linkUrl}
        text={linkText}
        openNewTab={linkOpenNewTab}
        onUrlChange={setLinkUrl}
        onTextChange={setLinkText}
        onOpenNewTabChange={setLinkOpenNewTab}
        onSubmit={handleSubmitLink}
        onCancel={() => {
          setShowLinkDialog(false);
          setEditingLinkAnchor(null);
        }}
      />

      <BibleDialog
        show={showBibleDialog}
        isEditing={!!editingBibleAnchor}
        book={bibleBook}
        chapter={bibleChapter}
        onBookChange={setBibleBook}
        onChapterChange={setBibleChapter}
        onSubmit={handleSubmitBibleBookmark}
        onCancel={() => {
          setShowBibleDialog(false);
          setEditingBibleAnchor(null);
        }}
      />

      {/* Context Menus */}
      <LinkContextMenu
        menu={linkMenu}
        onOpen={() => {
          openLink(linkMenu?.anchor.getAttribute("href") || "");
          setLinkMenu(null);
        }}
        onEdit={() => {
          handleEditLink(linkMenu!.anchor);
          setLinkMenu(null);
        }}
        onEditBible={() => {
          editBibleLink(linkMenu!.anchor);
          setLinkMenu(null);
        }}
        onRemove={handleRemoveLink}
      />

      <ImageContextMenu
        menu={imageMenu}
        onLayoutSmall={() => handleApplyImageLayout("small", "left")}
        onLayoutMedium={() => handleApplyImageLayout("medium", "center")}
        onLayoutFull={() => handleApplyImageLayout("full", "center")}
        onAlignLeft={() => handleApplyImageAlignment("left")}
        onAlignCenter={() => handleApplyImageAlignment("center")}
        onAlignRight={() => handleApplyImageAlignment("right")}
        onDelete={handleRemoveImage}
        onClose={() => setImageMenu(null)}
      />

      <ImageResizeOverlay
        overlay={resizeOverlay}
        onResizeStart={(event) => {
          event.preventDefault();
          if (!imageMenu?.image) return;
          activeResizeRef.current = {
            startX: event.clientX,
            startWidth: imageMenu.image.getBoundingClientRect().width,
          };
        }}
      />

      {/* Editor content area */}
      {sourceMode ? (
        <textarea
          className="editor-source"
          value={sourceDraft}
          onChange={(event) => setSourceDraft(event.target.value)}
        />
      ) : (
        <div
          ref={editorRef}
          className="editor-content"
          contentEditable
          suppressContentEditableWarning
          onFocus={() => {
            setIsEditing(true);
            ensureParagraphStructure();
          }}
          onBlur={() => {
            setIsEditing(false);
            syncFromEditor();
          }}
          onBeforeInput={() => {
            ensureParagraphStructure();
          }}
          onInput={() => {
            ensureParagraphStructure();
            syncFromEditor();
          }}
          onKeyDown={(event) => {
            // Delete image when pressing Backspace or Delete with image selected
            if (event.key !== "Backspace" && event.key !== "Delete") return;
            const editor = editorRef.current;
            if (
              !imageMenu?.image ||
              !editor ||
              !editor.contains(imageMenu.image)
            ) {
              return;
            }
            event.preventDefault();
            handleRemoveImage();
          }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onClick={(event) => {
            const element = event.target as HTMLElement;

            // Handle image click
            const image = element.closest("img");
            if (image instanceof HTMLImageElement) {
              const rect = image.getBoundingClientRect();
              setImageMenu({
                image,
                x: rect.left,
                y: rect.bottom + 6,
              });
              updateResizeOverlay();
              setLinkMenu(null);
              return;
            }

            // Handle link click
            setImageMenu(null);
            setResizeOverlay(null);
            const anchor = element.closest("a");
            if (!(anchor instanceof HTMLAnchorElement)) {
              setLinkMenu(null);
              return;
            }

            const href = anchor.getAttribute("href") || "";
            event.preventDefault();
            const rect = anchor.getBoundingClientRect();
            setLinkMenu({
              anchor,
              x: rect.left,
              y: rect.bottom + 6,
              isBibleLink: parseBibleBookmarkHash(href) !== null,
            });
          }}
          onPaste={(event) => {
            if (!event.clipboardData?.files?.length) return;
            event.preventDefault();
            void handleInsertImages(event.clipboardData.files);
          }}
          onDrop={(event) => {
            if (!event.dataTransfer?.files?.length) return;
            event.preventDefault();
            void handleInsertImages(event.dataTransfer.files);
          }}
        />
      )}
    </div>
  );
}
