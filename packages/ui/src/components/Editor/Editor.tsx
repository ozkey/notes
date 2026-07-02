import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useContext } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge";
import PhotoSizeSelectSmallIcon from "@mui/icons-material/PhotoSizeSelectSmall";
import RedoIcon from "@mui/icons-material/Redo";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import TableChartIcon from "@mui/icons-material/TableChart";
import UndoIcon from "@mui/icons-material/Undo";
import WidthFullIcon from "@mui/icons-material/WidthFull";
// import BorderColorIcon from "@mui/icons-material/BorderColor";
import EditLocationIcon from "@mui/icons-material/EditLocation";
import BibleContext from "../../contexts/BibleContext";
import { HighlightBadge } from "../Highlighter";
import "./Editor.css";

type EditorProps = {
  value?: string;
  refreshNotesDate?: Date;
  onChange?: (html: string) => void;
};

type LinkMenuState = {
  x: number;
  y: number;
  anchor: HTMLAnchorElement;
  isBibleLink: boolean;
};

type ImageMenuState = {
  x: number;
  y: number;
  image: HTMLImageElement;
};

type ResizeOverlayState = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type ActiveResizeState = {
  startX: number;
  startWidth: number;
};

type ToolbarButton = {
  key: string;
  label: string;
  icon: ReactNode;
  action: () => void;
};

type BibleBookmarkSelection = {
  book: string;
  chapterNumber: number;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getBibleBooks = (): string[] =>
  ((window as Window & { BIBLE_BOOKS?: string[] }).BIBLE_BOOKS ||
    []) as string[];

const parseBibleBookmarkHash = (
  href: string,
): BibleBookmarkSelection | null => {
  const match = href.trim().match(/^#([^:]+):(\d+)$/);
  if (!match) return null;

  const book = decodeURIComponent(match[1])
    .replace(/\+/g, " ")
    .replace(/[_-]/g, " ")
    .trim();
  const chapterNumber = Number.parseInt(match[2], 10);
  if (!book || !Number.isFinite(chapterNumber) || chapterNumber < 1)
    return null;

  return { book, chapterNumber };
};

const createBibleBookmarkHtml = (selection: BibleBookmarkSelection): string => {
  const bookHash = selection.book.trim().replace(/\s+/g, "-");
  const hash = `#${bookHash}:${selection.chapterNumber}`;
  const linkText = `${selection.book.trim()} ${selection.chapterNumber}`;
  return `<a href="${escapeHtml(hash)}">${escapeHtml(linkText)}</a>`;
};

const canOpenLinkHref = (href: string): boolean => {
  const value = href.trim();
  if (!value) return false;
  if (/^(javascript:|data:|vbscript:)/i.test(value)) return false;
  return /^(https?:|mailto:|tel:|#|\/|\?)/i.test(value);
};

const readFileAsDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });

const loadImage = (blob: Blob): Promise<HTMLImageElement> =>
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

const compressToWebPSmall = async (file: File): Promise<string> => {
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

const findParentTag = (node: Node | null, editor: HTMLElement, tag: string) => {
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

export default function Editor({
  value = "",
  refreshNotesDate: _refreshNotesDate,
  onChange,
}: EditorProps) {
  const [content, setContent] = useState(value || "");
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceDraft, setSourceDraft] = useState(value || "");
  const [headingChoice, setHeadingChoice] = useState("p");
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [linkMenu, setLinkMenu] = useState<LinkMenuState | null>(null);
  const [imageMenu, setImageMenu] = useState<ImageMenuState | null>(null);
  const [resizeOverlay, setResizeOverlay] = useState<ResizeOverlayState | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(false);
  const [editingLinkAnchor, setEditingLinkAnchor] =
    useState<HTMLAnchorElement | null>(null);
  const [showBibleDialog, setShowBibleDialog] = useState(false);
  const [bibleBook, setBibleBook] = useState("");
  const [bibleChapter, setBibleChapter] = useState("1");
  const [editingBibleAnchor, setEditingBibleAnchor] =
    useState<HTMLAnchorElement | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showHighlightDialog, setShowHighlightDialog] = useState(false);

  const bibleContext = useContext(BibleContext);
  const { tabs, currentTab } = bibleContext;
  const currentTabState = tabs[currentTab];
  const highlights =
    currentTabState.mode === "bible"
      ? bibleContext.getHighlights(
          currentTabState.selectedBook,
          currentTabState.chapterNumber,
        )
      : [];

  // Get all verses in the current chapter
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

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const activeResizeRef = useRef<ActiveResizeState | null>(null);

  useEffect(() => {
    if (isEditing || sourceMode) return;
    const next = value || "";
    setContent((previous) => (previous === next ? previous : next));
    setSourceDraft(next);
    if (editorRef.current && editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
    }
  }, [value, isEditing, sourceMode]);

  useEffect(() => {
    if (
      !sourceMode &&
      editorRef.current &&
      editorRef.current.innerHTML !== content
    ) {
      editorRef.current.innerHTML = content;
    }
  }, [content, sourceMode]);

  const emitContent = (nextHtml: string) => {
    setContent((prev) => (prev === nextHtml ? prev : nextHtml));
    onChange?.(nextHtml);
  };

  const syncFromEditor = () => {
    const html = editorRef.current?.innerHTML || "";
    emitContent(html);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
    restoreSelection();
  };

  const withSelectedNode = (
    node: Node,
    apply: (selection: Selection) => boolean,
  ): boolean => {
    if (!editorRef.current) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    editorRef.current.focus();
    const range = document.createRange();
    range.selectNode(node);
    selection.removeAllRanges();
    selection.addRange(range);
    return apply(selection);
  };

  const replaceElementUndoably = <T extends HTMLElement>(
    element: T,
    mutate: (draft: T) => void,
  ): T | null => {
    if (!editorRef.current || !element.isConnected) return null;
    const draft = element.cloneNode(true) as T;
    const before = draft.outerHTML;
    mutate(draft);
    if (draft.outerHTML === before) return null;

    const tokenAttr = "data-editor-replace-token";
    const token = `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    draft.setAttribute(tokenAttr, token);
    const html = draft.outerHTML;
    const didReplace = withSelectedNode(element, () =>
      document.execCommand("insertHTML", false, html),
    );

    if (!didReplace) {
      draft.removeAttribute(tokenAttr);
      element.replaceWith(draft);
      return draft;
    }

    const nextElement = editorRef.current.querySelector(
      `[${tokenAttr}="${token}"]`,
    ) as T | null;
    if (!nextElement) return null;
    nextElement.removeAttribute(tokenAttr);
    return nextElement;
  };

  const replaceNodeWithTextUndoably = (node: Node, text: string): boolean => {
    const replaced = withSelectedNode(node, () =>
      document.execCommand("insertText", false, text),
    );
    if (replaced) return true;
    const parent = node.parentNode;
    if (!parent) return false;
    parent.replaceChild(document.createTextNode(text), node);
    return true;
  };

  const removeNodeUndoably = (node: Node): boolean => {
    const deleted = withSelectedNode(node, () =>
      document.execCommand("delete"),
    );
    if (deleted) return true;
    const parent = node.parentNode;
    if (parent) {
      parent.removeChild(node);
      return true;
    }
    return false;
  };

  const runExec = (command: string, valueArg?: string) => {
    focusEditor();
    document.execCommand(command, false, valueArg);
    syncFromEditor();
  };

  const runFormatBlock = (blockTag: string) => {
    runExec("formatBlock", blockTag);
  };

  const applyAlertVariant = (
    variant: "quote" | "info" | "warning" | "error",
  ) => {
    runFormatBlock("blockquote");
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

  const insertHtmlAtSelection = (html: string) => {
    focusEditor();
    document.execCommand("insertHTML", false, html);
    syncFromEditor();
  };

  const getColorForHighlight = (color: string): string => {
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

  const createHighlightBadgeHtml = (
    verseNumber: number,
    color: string,
  ): string => {
    return `<span class="editor-highlight-badge" data-color="${color}" contenteditable="false">${verseNumber}</span> Verse`;
  };

  const handleHeadingChange = (next: string) => {
    setHeadingChoice(next);
    if (next === "h1" || next === "h2" || next === "h3" || next === "p") {
      runFormatBlock(next);
      return;
    }
    if (next === "code") {
      runFormatBlock("pre");
      return;
    }
    if (
      next === "quote" ||
      next === "info" ||
      next === "warning" ||
      next === "error"
    ) {
      applyAlertVariant(next);
    }
  };

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

  const submitLink = () => {
    const href = linkUrl.trim();
    if (!href) return;

    const text = linkText.trim() || href;
    const safeHref = href.replace(/"/g, "&quot;");
    if (editingLinkAnchor) {
      const updated = replaceElementUndoably(editingLinkAnchor, (anchor) => {
        anchor.setAttribute("href", safeHref);
        if (linkOpenNewTab) {
          anchor.setAttribute("target", "_blank");
          anchor.setAttribute("rel", "noopener noreferrer");
        } else {
          anchor.removeAttribute("target");
          anchor.removeAttribute("rel");
        }
        anchor.textContent = text;
      });
      if (updated) syncFromEditor();
    } else {
      const target = linkOpenNewTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      const html = `<a href="${safeHref}"${target}>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</a>`;
      insertHtmlAtSelection(html);
    }
    setEditingLinkAnchor(null);
    setShowLinkDialog(false);
  };

  const insertBibleBookmark = () => {
    openBibleDialog();
  };

  const openLink = (href: string) => {
    if (!canOpenLinkHref(href)) return;
    if (href.startsWith("#")) {
      window.location.hash = href.slice(1);
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const editBibleLink = (anchor: HTMLAnchorElement) => {
    openBibleDialog(anchor);
  };

  const editLink = (anchor: HTMLAnchorElement) => {
    setEditingLinkAnchor(anchor);
    setLinkUrl(anchor.getAttribute("href") || "");
    setLinkText(anchor.textContent || "");
    setLinkOpenNewTab(anchor.getAttribute("target") === "_blank");
    setShowLinkDialog(true);
  };

  const removeLink = () => {
    if (!linkMenu?.anchor) return;
    const anchor = linkMenu.anchor;
    replaceNodeWithTextUndoably(anchor, anchor.textContent || "");
    setLinkMenu(null);
    syncFromEditor();
  };

  const updateResizeOverlayFromImage = (image: HTMLImageElement) => {
    const rect = image.getBoundingClientRect();
    setResizeOverlay({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  };

  const setImageAlignmentStyles = (
    image: HTMLImageElement,
    align: "left" | "center" | "right",
  ) => {
    if (align === "center") {
      image.style.setProperty("float", "none");
      image.style.display = "block";
      image.style.clear = "both";
      image.style.marginTop = "8px";
      image.style.marginBottom = "8px";
      image.style.marginLeft = "auto";
      image.style.marginRight = "auto";
      return;
    }

    image.style.setProperty("float", align);
    image.style.display = "block";
    image.style.clear = "none";
    image.style.marginTop = "0";
    image.style.marginBottom = "1rem";
    image.style.marginLeft = align === "right" ? "1rem" : "0";
    image.style.marginRight = align === "left" ? "1rem" : "0";
  };

  const applyImageLayout = (
    size: "small" | "medium" | "full",
    align: "left" | "center" | "right",
  ) => {
    if (!imageMenu?.image) return;
    const nextImage = replaceElementUndoably(imageMenu.image, (image) => {
      image.style.width =
        size === "small" ? "33%" : size === "medium" ? "66%" : "100%";
      setImageAlignmentStyles(image, align);
    });
    if (!nextImage) return;
    setImageMenu((previous) =>
      previous ? { ...previous, image: nextImage } : previous,
    );
    updateResizeOverlayFromImage(nextImage);
    syncFromEditor();
  };

  const applyImageAlignment = (align: "left" | "center" | "right") => {
    if (!imageMenu?.image) return;
    const nextImage = replaceElementUndoably(imageMenu.image, (image) => {
      setImageAlignmentStyles(image, align);
    });
    if (!nextImage) return;
    setImageMenu((previous) =>
      previous ? { ...previous, image: nextImage } : previous,
    );
    updateResizeOverlayFromImage(nextImage);
    syncFromEditor();
  };

  const removeImage = () => {
    if (!imageMenu?.image) return;
    removeNodeUndoably(imageMenu.image);
    setImageMenu(null);
    setResizeOverlay(null);
    syncFromEditor();
  };

  const submitBibleBookmark = () => {
    const book = bibleBook.trim();
    const chapterNumber = Number.parseInt(bibleChapter, 10);
    if (!book || !Number.isFinite(chapterNumber) || chapterNumber < 1) return;

    const selection = { book, chapterNumber };
    if (editingBibleAnchor) {
      const updated = replaceElementUndoably(editingBibleAnchor, (anchor) => {
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

    setEditingBibleAnchor(null);
    setShowBibleDialog(false);
  };

  useEffect(() => {
    if (!imageMenu?.image) {
      setResizeOverlay(null);
      return;
    }

    updateResizeOverlayFromImage(imageMenu.image);
    const handleWindowChange = () =>
      updateResizeOverlayFromImage(imageMenu.image);
    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);
    return () => {
      window.removeEventListener("scroll", handleWindowChange, true);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [imageMenu]);

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
      updateResizeOverlayFromImage(imageMenu.image);
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

  const insertImages = async (files: FileList | File[]) => {
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

  const withCurrentCell = (
    callback: (
      table: HTMLTableElement,
      row: HTMLTableRowElement,
      cellIndex: number,
    ) => void,
  ) => {
    const selection = window.getSelection();
    const node = selection?.anchorNode || null;
    if (!editorRef.current) return;
    const cell =
      findParentTag(node, editorRef.current, "TD") ||
      findParentTag(node, editorRef.current, "TH");
    if (!cell) return;
    const row = cell.parentElement;
    const table = row?.closest("table");
    if (
      !(row instanceof HTMLTableRowElement) ||
      !(table instanceof HTMLTableElement) ||
      !(cell instanceof HTMLTableCellElement)
    ) {
      return;
    }
    const nextTable = replaceElementUndoably(table, (draftTable) => {
      const draftRow = draftTable.rows[row.rowIndex];
      if (!(draftRow instanceof HTMLTableRowElement)) return;
      callback(draftTable, draftRow, cell.cellIndex);
    });
    if (nextTable) syncFromEditor();
  };

  const toolbarButtons = useMemo(
    () => ({
      top: [
        {
          key: "undo",
          label: "Undo",
          icon: <UndoIcon fontSize="small" />,
          action: () => runExec("undo"),
        },
        {
          key: "redo",
          label: "Redo",
          icon: <RedoIcon fontSize="small" />,
          action: () => runExec("redo"),
        },
      ] as ToolbarButton[],
      formatting: [
        {
          key: "bold",
          label: "Bold",
          icon: <FormatBoldIcon fontSize="small" />,
          action: () => runExec("bold"),
        },
        {
          key: "italic",
          label: "Italic",
          icon: <FormatItalicIcon fontSize="small" />,
          action: () => runExec("italic"),
        },
        {
          key: "underline",
          label: "Underline",
          icon: <FormatUnderlinedIcon fontSize="small" />,
          action: () => runExec("underline"),
        },
        {
          key: "strike",
          label: "Strikethrough",
          icon: <StrikethroughSIcon fontSize="small" />,
          action: () => runExec("strikeThrough"),
        },
        {
          key: "ordered",
          label: "Ordered list",
          icon: <FormatListNumberedIcon fontSize="small" />,
          action: () => runExec("insertOrderedList"),
        },
        {
          key: "unordered",
          label: "Unordered list",
          icon: <FormatListBulletedIcon fontSize="small" />,
          action: () => runExec("insertUnorderedList"),
        },
        {
          key: "indent",
          label: "Indent",
          icon: <FormatIndentIncreaseIcon fontSize="small" />,
          action: () => runExec("indent"),
        },
        {
          key: "outdent",
          label: "Outdent",
          icon: <FormatIndentDecreaseIcon fontSize="small" />,
          action: () => runExec("outdent"),
        },
      ] as ToolbarButton[],
    }),
    [],
  );

  const bibleBooks = getBibleBooks();

  return (
    <div className="custom-editor">
      <div className="editor-toolbar">
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
                void insertImages(event.target.files);
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

      {showTableMenu && (
        <div className="editor-menu">
          <button
            type="button"
            onClick={() =>
              insertHtmlAtSelection(
                `<table class="editor-table"><tbody><tr><td><br /></td><td><br /></td></tr><tr><td><br /></td><td><br /></td></tr></tbody></table><p><br /></p>`,
              )
            }
          >
            Insert Table
          </button>
          <button
            type="button"
            onClick={() =>
              withCurrentCell((table, row) => {
                const newRow = table.insertRow(row.rowIndex + 1);
                const columns = row.cells.length || 1;
                for (let index = 0; index < columns; index += 1) {
                  const cell = newRow.insertCell();
                  cell.innerHTML = "<br />";
                }
              })
            }
          >
            Add Row
          </button>
          <button
            type="button"
            onClick={() =>
              withCurrentCell((_table, row) => {
                if (row.parentElement?.children.length === 1) return;
                row.remove();
              })
            }
          >
            Delete Row
          </button>
          <button
            type="button"
            onClick={() =>
              withCurrentCell((table, _row, cellIndex) => {
                for (const row of Array.from(table.rows)) {
                  const cell = row.insertCell(cellIndex + 1);
                  cell.innerHTML = "<br />";
                }
              })
            }
          >
            Add Column
          </button>
          <button
            type="button"
            onClick={() =>
              withCurrentCell((table, _row, cellIndex) => {
                if (!table.rows.length || table.rows[0].cells.length <= 1)
                  return;
                for (const row of Array.from(table.rows)) {
                  if (row.cells[cellIndex]) row.deleteCell(cellIndex);
                }
              })
            }
          >
            Delete Column
          </button>
          <button
            type="button"
            onClick={() =>
              withCurrentCell((table) => {
                table.remove();
              })
            }
          >
            Delete Table
          </button>
        </div>
      )}

      {showHighlightDialog && (
        <div
          className="editor-modal-overlay"
          onClick={() => setShowHighlightDialog(false)}
        >
          <div
            className="editor-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
            style={{ maxWidth: "500px", maxHeight: "600px", overflowY: "auto" }}
          >
            <h3>Select Verse to Insert</h3>
            {allVerses.length === 0 ? (
              <p style={{ color: "#666", marginTop: "20px" }}>
                No verses available in this chapter.
              </p>
            ) : (
              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {allVerses.map((verseNumber) => {
                    const highlightColor = highlightsByVerse.get(verseNumber);
                    const bgColor = highlightColor
                      ? getColorForHighlight(highlightColor)
                      : "#ffffff";
                    const borderColor = highlightColor ? "#999" : "#ddd";

                    return (
                      <button
                        key={verseNumber}
                        type="button"
                        onClick={() => {
                          insertHtmlAtSelection(
                            createHighlightBadgeHtml(
                              verseNumber,
                              highlightColor || "white",
                            ),
                          );
                          setShowHighlightDialog(false);
                        }}
                        style={{
                          padding: "8px",
                          backgroundColor: bgColor,
                          border: `2px solid ${borderColor}`,
                          borderRadius: "4px",
                          fontWeight: highlightColor ? "bold" : "normal",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          textAlign: "center",
                        }}
                        title={
                          highlightColor
                            ? `Highlighted: ${highlightColor}`
                            : "White badge"
                        }
                      >
                        {verseNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="editor-modal-actions">
              <button
                type="button"
                onClick={() => setShowHighlightDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkDialog && (
        <div
          className="editor-modal-overlay"
          onClick={() => setShowLinkDialog(false)}
        >
          <div
            className="editor-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <h3>{editingLinkAnchor ? "Edit Link" : "Insert Link"}</h3>
            <input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https:// or #hash"
            />
            <input
              value={linkText}
              onChange={(event) => setLinkText(event.target.value)}
              placeholder="Link text"
            />
            <label className="editor-inline-checkbox">
              <input
                type="checkbox"
                checked={linkOpenNewTab}
                onChange={(event) => setLinkOpenNewTab(event.target.checked)}
              />
              Open in new tab
            </label>
            <div className="editor-modal-actions">
              <button type="button" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </button>
              <button type="button" onClick={submitLink}>
                {editingLinkAnchor ? "Save" : "Insert"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBibleDialog && (
        <div
          className="editor-modal-overlay"
          onClick={() => {
            setShowBibleDialog(false);
            setEditingBibleAnchor(null);
          }}
        >
          <div
            className="editor-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <h3>
              {editingBibleAnchor ? "Edit Bible Link" : "Insert Bible Link"}
            </h3>
            <label className="editor-inline-label">
              Book
              <select
                value={bibleBook}
                onChange={(event) => setBibleBook(event.target.value)}
              >
                {bibleBooks.length === 0 ? (
                  <option value="">No books available</option>
                ) : (
                  <>
                    <option value="">Select a book...</option>
                    {bibleBooks.map((book) => (
                      <option key={book} value={book}>
                        {book}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
            <label className="editor-inline-label">
              Chapter
              <input
                type="number"
                min="1"
                value={bibleChapter}
                onChange={(event) => setBibleChapter(event.target.value)}
                placeholder="1"
              />
            </label>
            <div className="editor-modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowBibleDialog(false);
                  setEditingBibleAnchor(null);
                }}
              >
                Cancel
              </button>
              <button type="button" onClick={submitBibleBookmark}>
                {editingBibleAnchor ? "Save" : "Insert"}
              </button>
            </div>
          </div>
        </div>
      )}

      {linkMenu && (
        <div
          className="editor-floating-menu"
          style={{ left: linkMenu.x, top: linkMenu.y }}
        >
          <button
            type="button"
            onClick={() => {
              openLink(linkMenu.anchor.getAttribute("href") || "");
              setLinkMenu(null);
            }}
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => {
              editLink(linkMenu.anchor);
              setLinkMenu(null);
            }}
          >
            Edit Link
          </button>
          {linkMenu.isBibleLink && (
            <button
              type="button"
              onClick={() => {
                editBibleLink(linkMenu.anchor);
                setLinkMenu(null);
              }}
            >
              Edit Bible
            </button>
          )}
          <button type="button" onClick={removeLink}>
            Remove
          </button>
        </div>
      )}

      {imageMenu && (
        <div
          className="editor-floating-menu"
          style={{ left: imageMenu.x, top: imageMenu.y }}
        >
          <button
            type="button"
            title="Small image size"
            aria-label="Small image size"
            onClick={() => applyImageLayout("small", "left")}
          >
            <PhotoSizeSelectSmallIcon fontSize="small" />
          </button>
          <button
            type="button"
            title="Medium image size"
            aria-label="Medium image size"
            onClick={() => applyImageLayout("medium", "center")}
          >
            <PhotoSizeSelectLargeIcon fontSize="small" />
          </button>
          <button
            type="button"
            title="Full width image"
            aria-label="Full width image"
            onClick={() => applyImageLayout("full", "center")}
          >
            <WidthFullIcon fontSize="small" />
          </button>
          <button
            type="button"
            title="Wrap text left"
            aria-label="Wrap text left"
            onClick={() => applyImageAlignment("left")}
          >
            <FormatAlignLeftIcon fontSize="small" />
          </button>
          <button
            type="button"
            title="Align image center"
            aria-label="Align image center"
            onClick={() => applyImageAlignment("center")}
          >
            <FormatAlignCenterIcon fontSize="small" />
          </button>
          <button
            type="button"
            title="Wrap text right"
            aria-label="Wrap text right"
            onClick={() => applyImageAlignment("right")}
          >
            <FormatAlignRightIcon fontSize="small" />
          </button>
          <button
            type="button"
            title="Delete image"
            aria-label="Delete image"
            onClick={removeImage}
          >
            <DeleteIcon fontSize="small" />
          </button>
          <button
            type="button"
            title="Close image menu"
            aria-label="Close image menu"
            onClick={() => setImageMenu(null)}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}

      {imageMenu && resizeOverlay && (
        <div
          className="editor-image-resize-overlay"
          style={{
            left: resizeOverlay.left,
            top: resizeOverlay.top,
            width: resizeOverlay.width,
            height: resizeOverlay.height,
          }}
        >
          <button
            type="button"
            className="editor-image-resize-handle"
            title="Drag to resize image"
            aria-label="Drag to resize image"
            onMouseDown={(event) => {
              event.preventDefault();
              if (!imageMenu.image) return;
              activeResizeRef.current = {
                startX: event.clientX,
                startWidth: imageMenu.image.getBoundingClientRect().width,
              };
            }}
          />
        </div>
      )}

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
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            setIsEditing(false);
            syncFromEditor();
          }}
          onInput={syncFromEditor}
          onKeyDown={(event) => {
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
            removeImage();
          }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onClick={(event) => {
            const element = event.target as HTMLElement;
            const image = element.closest("img");
            if (image instanceof HTMLImageElement) {
              const rect = image.getBoundingClientRect();
              setImageMenu({
                image,
                x: rect.left,
                y: rect.bottom + 6,
              });
              updateResizeOverlayFromImage(image);
              setLinkMenu(null);
              return;
            }

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
            void insertImages(event.clipboardData.files);
          }}
          onDrop={(event) => {
            if (!event.dataTransfer?.files?.length) return;
            event.preventDefault();
            void insertImages(event.dataTransfer.files);
          }}
        />
      )}
    </div>
  );
}
