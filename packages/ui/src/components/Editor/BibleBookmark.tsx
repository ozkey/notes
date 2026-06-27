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

type BibleBookmarkSelection = {
  book: string;
  chapterNumber: number;
};

const showBibleBookmarkDialog = (
  bibleBooks: string[],
): Promise<BibleBookmarkSelection | null> =>
  new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "2147483647";

    const dialog = document.createElement("form");
    dialog.style.background = "#fff";
    dialog.style.padding = "16px";
    dialog.style.borderRadius = "8px";
    dialog.style.minWidth = "280px";
    dialog.style.boxShadow = "0 12px 32px rgba(0,0,0,0.25)";

    const title = document.createElement("div");
    title.textContent = "Insert Bible Bookmark";
    title.style.fontWeight = "600";
    title.style.marginBottom = "12px";

    const bookLabel = document.createElement("label");
    bookLabel.textContent = "Book";
    bookLabel.style.display = "block";
    bookLabel.style.marginBottom = "6px";

    const bookSelect = document.createElement("select");
    bookSelect.style.width = "100%";
    bookSelect.style.marginBottom = "12px";
    bookSelect.style.padding = "8px";

    const noBooksOption = document.createElement("option");
    noBooksOption.value = "";
    noBooksOption.textContent =
      bibleBooks.length > 0 ? "Select a book..." : "No books available";
    bookSelect.appendChild(noBooksOption);

    for (const book of bibleBooks) {
      const option = document.createElement("option");
      option.value = book;
      option.textContent = book;
      bookSelect.appendChild(option);
    }

    const chapterLabel = document.createElement("label");
    chapterLabel.textContent = "Chapter";
    chapterLabel.style.display = "block";
    chapterLabel.style.marginBottom = "6px";

    const chapterInput = document.createElement("input");
    chapterInput.type = "number";
    chapterInput.min = "1";
    chapterInput.value = "1";
    chapterInput.style.width = "100%";
    chapterInput.style.marginBottom = "12px";
    chapterInput.style.padding = "8px";

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.justifyContent = "flex-end";
    actions.style.gap = "8px";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";

    const insertButton = document.createElement("button");
    insertButton.type = "submit";
    insertButton.textContent = "Insert";

    actions.append(cancelButton, insertButton);
    dialog.append(
      title,
      bookLabel,
      bookSelect,
      chapterLabel,
      chapterInput,
      actions,
    );
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const closeDialog = (result: BibleBookmarkSelection | null) => {
      overlay.remove();
      resolve(result);
    };

    cancelButton.addEventListener("click", () => closeDialog(null));

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeDialog(null);
    });

    dialog.addEventListener("submit", (event) => {
      event.preventDefault();

      const book = bookSelect.value.trim();
      const chapterNumber = Number.parseInt(chapterInput.value, 10);
      if (!book || !Number.isFinite(chapterNumber) || chapterNumber < 1) return;

      closeDialog({ book, chapterNumber });
    });

    bookSelect.focus();
  });

export const insertBibleBookmark = (editor: EditorWithInsertHtml): void => {
  const bibleBooks = ((window as Window & { BIBLE_BOOKS?: string[] })
    .BIBLE_BOOKS || []) as string[];

  void showBibleBookmarkDialog(bibleBooks).then((selection) => {
    if (!selection) return;

    const bookHash = selection.book.replace(/\s+/g, "-");
    const hash = `#${bookHash}:${selection.chapterNumber}`;
    const linkText = `${selection.book} ${selection.chapterNumber}`;

    editor.s?.insertHTML?.(
      `<a href="${escapeHtml(hash)}">${escapeHtml(linkText)}</a>`,
    );
  });
};
