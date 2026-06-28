import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CodeIcon from "@mui/icons-material/Code";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import RedoIcon from "@mui/icons-material/Redo";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import TableChartIcon from "@mui/icons-material/TableChart";
import UndoIcon from "@mui/icons-material/Undo";
import "./Editor.css";
import {
  createBibleBookmarkHtml,
  getBibleBooks,
  parseBibleBookmarkHash,
  showBibleBookmarkDialog,
} from "./BibleBookmark";

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

const canOpenLinkHref = (href: string): boolean => {
  const value = href.trim();
  if (!value) return false;
  if (/^(javascript:|data:|vbscript:)/i.test(value)) return false;
  return /^(https?:|mailto:|tel:|#|\/|\?)/i.test(value);
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });

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
    if (!sourceMode && editorRef.current && editorRef.current.innerHTML !== content) {
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

  const runExec = (command: string, valueArg?: string) => {
    focusEditor();
    document.execCommand(command, false, valueArg);
    syncFromEditor();
  };

  const runFormatBlock = (blockTag: string) => {
    runExec("formatBlock", blockTag);
  };

  const applyAlertVariant = (variant: "quote" | "info" | "warning" | "error") => {
    runFormatBlock("blockquote");
    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode || null;
    if (!editorRef.current) return;
    const blockquote = findParentTag(anchorNode, editorRef.current, "BLOCKQUOTE");
    if (!blockquote) return;
    blockquote.className = variant === "quote" ? "" : `editor-alert-${variant}`;
    syncFromEditor();
  };

  const insertHtmlAtSelection = (html: string) => {
    focusEditor();
    document.execCommand("insertHTML", false, html);
    syncFromEditor();
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
    if (next === "quote" || next === "info" || next === "warning" || next === "error") {
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

  const submitLink = () => {
    const href = linkUrl.trim();
    if (!href) return;

    const text = linkText.trim() || href;
    const safeHref = href.replace(/"/g, "&quot;");
    if (editingLinkAnchor) {
      editingLinkAnchor.setAttribute("href", safeHref);
      if (linkOpenNewTab) {
        editingLinkAnchor.setAttribute("target", "_blank");
        editingLinkAnchor.setAttribute("rel", "noopener noreferrer");
      } else {
        editingLinkAnchor.removeAttribute("target");
        editingLinkAnchor.removeAttribute("rel");
      }
      editingLinkAnchor.textContent = text;
      syncFromEditor();
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
    saveSelection();
    void showBibleBookmarkDialog(getBibleBooks()).then((selection) => {
      if (!selection) return;
      insertHtmlAtSelection(createBibleBookmarkHtml(selection));
    });
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
    const parsed = parseBibleBookmarkHash(anchor.getAttribute("href") || "");
    void showBibleBookmarkDialog(getBibleBooks(), parsed || undefined).then((selection) => {
      if (!selection) return;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = createBibleBookmarkHtml(selection);
      const replacement = wrapper.firstElementChild as HTMLAnchorElement | null;
      if (!replacement) return;
      anchor.setAttribute("href", replacement.getAttribute("href") || "#");
      anchor.textContent = replacement.textContent || "";
      syncFromEditor();
    });
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
    const textNode = document.createTextNode(anchor.textContent || "");
    anchor.replaceWith(textNode);
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

  const applyImageLayout = (
    size: "small" | "medium" | "full",
    align: "left" | "center" | "right",
  ) => {
    if (!imageMenu?.image) return;
    const image = imageMenu.image;
    image.style.width =
      size === "small" ? "33%" : size === "medium" ? "66%" : "100%";
    image.style.display = "block";
    image.style.marginLeft = align === "left" ? "0" : "auto";
    image.style.marginRight = align === "right" ? "0" : "auto";
    updateResizeOverlayFromImage(image);
    syncFromEditor();
  };

  const applyImageAlignment = (align: "left" | "center" | "right") => {
    if (!imageMenu?.image) return;
    const image = imageMenu.image;
    image.style.display = "block";
    image.style.marginLeft = align === "left" ? "0" : "auto";
    image.style.marginRight = align === "right" ? "0" : "auto";
    updateResizeOverlayFromImage(image);
    syncFromEditor();
  };

  useEffect(() => {
    if (!imageMenu?.image) {
      setResizeOverlay(null);
      return;
    }

    updateResizeOverlayFromImage(imageMenu.image);
    const handleWindowChange = () => updateResizeOverlayFromImage(imageMenu.image);
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
      const nextWidth = Math.max(80, activeResizeRef.current.startWidth + deltaX);
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
      const dataUrl = await readFileAsDataUrl(file);
      insertHtmlAtSelection(
        `<img src="${dataUrl}" alt="${file.name.replace(/"/g, "&quot;")}" class="editor-image" />`,
      );
    }
  };

  const withCurrentCell = (
    callback: (table: HTMLTableElement, row: HTMLTableRowElement, cellIndex: number) => void,
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
    callback(table, row, cell.cellIndex);
    syncFromEditor();
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
            aria-label={sourceMode ? "Apply source" : "View or edit HTML source"}
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
                if (!table.rows.length || table.rows[0].cells.length <= 1) return;
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

      {showLinkDialog && (
        <div className="editor-modal-overlay" onClick={() => setShowLinkDialog(false)}>
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

      {linkMenu && (
        <div className="editor-floating-menu" style={{ left: linkMenu.x, top: linkMenu.y }}>
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
        <div className="editor-floating-menu" style={{ left: imageMenu.x, top: imageMenu.y }}>
          <button type="button" onClick={() => applyImageLayout("small", "left")}>
            Small
          </button>
          <button type="button" onClick={() => applyImageLayout("medium", "center")}>
            Medium
          </button>
          <button type="button" onClick={() => applyImageLayout("full", "center")}>
            Full
          </button>
          <button type="button" onClick={() => applyImageAlignment("left")}>
            Align Left
          </button>
          <button type="button" onClick={() => applyImageAlignment("center")}>
            Align Center
          </button>
          <button type="button" onClick={() => applyImageAlignment("right")}>
            Align Right
          </button>
          <button type="button" onClick={() => setImageMenu(null)}>
            Close
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
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onClick={(event) => {
            const element = event.target as HTMLElement;
            const image = element.closest("img");
            if (image instanceof HTMLImageElement) {
              const rect = image.getBoundingClientRect();
              setImageMenu({
                image,
                x: rect.left + window.scrollX,
                y: rect.bottom + window.scrollY + 6,
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
              x: rect.left + window.scrollX,
              y: rect.bottom + window.scrollY + 6,
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
