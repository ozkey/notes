export const BIBLE_BOOKMARK_BUTTON = "bibleBookmark";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type EditorWithInsertHtml = {
  s?: {
    insertHTML?: (html: string) => void;
  };
};

export const insertBibleBookmark = (editor: EditorWithInsertHtml): void => {
  const bibleBooks = ((window as Window & { BIBLE_BOOKS?: string[] })
    .BIBLE_BOOKS || []) as string[];
  const suggestedBook = bibleBooks[0] || "";
  const bookInput = window.prompt("Book:", suggestedBook);
  const book = bookInput?.trim() || "";
  if (!book) return;

  const chapterInput = window.prompt("Chapter:", "1");
  const chapterNumber = Number.parseInt((chapterInput || "1").trim(), 10);
  if (!Number.isFinite(chapterNumber) || chapterNumber < 1) return;

  const bookHash = book.replace(/\s+/g, "-");
  const hash = `#${bookHash}:${chapterNumber}`;
  const linkText = `${book} ${chapterNumber}`;

  editor.s?.insertHTML?.(
    `<a href="${escapeHtml(hash)}">${escapeHtml(linkText)}</a>`,
  );
};
