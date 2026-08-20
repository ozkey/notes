// Dialog components for the Editor
// Extracted sub-components for better code organization

import React from "react";
import { getBibleBooks } from "./utils";

/**
 * Dialog for inserting or editing a regular link
 */
interface LinkDialogProps {
  show: boolean;
  isEditing: boolean;
  url: string;
  text: string;
  openNewTab: boolean;
  onUrlChange: (url: string) => void;
  onTextChange: (text: string) => void;
  onOpenNewTabChange: (checked: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  show,
  isEditing,
  url,
  text,
  openNewTab,
  onUrlChange,
  onTextChange,
  onOpenNewTabChange,
  onSubmit,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <div className="editor-modal-overlay" onClick={onCancel}>
      <div
        className="editor-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{isEditing ? "Edit Link" : "Insert Link"}</h3>
        <input
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https:// or #hash"
        />
        <input
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Link text"
        />
        <label className="editor-inline-checkbox">
          <input
            type="checkbox"
            checked={openNewTab}
            onChange={(event) => onOpenNewTabChange(event.target.checked)}
          />
          Open in new tab
        </label>
        <div className="editor-modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit}>
            {isEditing ? "Save" : "Insert"}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Dialog for inserting or editing a Bible bookmark link
 */
interface BibleDialogProps {
  show: boolean;
  isEditing: boolean;
  book: string;
  chapter: string;
  verse: string;
  articleIds: string[];
  articleId: string;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  onVerseChange: (verse: string) => void;
  onArticleChange: (articleId: string) => void;
  onInsertArticle: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const BibleDialog: React.FC<BibleDialogProps> = ({
  show,
  isEditing,
  book,
  chapter,
  verse,
  articleIds,
  articleId,
  onBookChange,
  onChapterChange,
  onVerseChange,
  onArticleChange,
  onInsertArticle,
  onSubmit,
  onCancel,
}) => {
  if (!show) return null;

  const bibleBooks = getBibleBooks();

  return (
    <div className="editor-modal-overlay" onClick={onCancel}>
      <div
        className="editor-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{isEditing ? "Edit Bible Link" : "Insert Bible Link"}</h3>
        <label className="editor-inline-label">
          Book
          <select
            value={book}
            onChange={(event) => onBookChange(event.target.value)}
          >
            {bibleBooks.length === 0 ? (
              <option value="">No books available</option>
            ) : (
              <>
                <option value="">Select a book...</option>
                {bibleBooks.map((b) => (
                  <option key={b} value={b}>
                    {b}
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
            value={chapter}
            onChange={(event) => onChapterChange(event.target.value)}
            placeholder="1"
          />
        </label>
        <label className="editor-inline-label">
          Verse
          <input
            type="number"
            min="1"
            value={verse}
            onChange={(event) => onVerseChange(event.target.value)}
            placeholder="Optional"
          />
        </label>
        <div className="editor-modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit}>
            {isEditing ? "Save" : "Insert"}
          </button>
        </div>
        <label className="editor-inline-label">
          Article
          <select
            value={articleId}
            onChange={(event) => onArticleChange(event.target.value)}
          >
            {articleIds.length === 0 ? (
              <option value="">No articles available</option>
            ) : (
              <>
                <option value="">Select an article...</option>
                {articleIds.map((id) => (
                  <option key={id} value={id}>
                    #{id}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
        <div className="editor-modal-actions">
          <button
            type="button"
            onClick={onInsertArticle}
            disabled={!articleId.trim()}
          >
            Insert Article
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Dialog for selecting verses to insert highlight badges
 */
interface HighlightDialogProps {
  show: boolean;
  verses: number[];
  highlightsByVerse: Map<number, string>;
  onSelectVerse: (verseNumber: number, color: string) => void;
  onClose: () => void;
  getColorForHighlight: (color: string) => string;
}

export const HighlightDialog: React.FC<HighlightDialogProps> = ({
  show,
  verses,
  highlightsByVerse,
  onSelectVerse,
  onClose,
  getColorForHighlight,
}) => {
  if (!show) return null;

  return (
    <div className="editor-modal-overlay" onClick={onClose}>
      <div
        className="editor-modal"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: "500px", maxHeight: "600px", overflowY: "auto" }}
      >
        <h3>Select Verse to Insert</h3>
        {verses.length === 0 ? (
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
              {verses.map((verseNumber) => {
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
                      onSelectVerse(verseNumber, highlightColor || "white");
                      onClose();
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
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
