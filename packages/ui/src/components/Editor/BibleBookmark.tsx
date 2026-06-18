import { interfaces, helper } from "suneditor";
import type { SunEditor } from "suneditor/types";

const { dom } = helper;

/**
 * @class
 * @description BibleBookmark — Opens a form to insert Bible book:chapter links as hashes
 */
class BibleBookmark extends interfaces.PluginDropdown {
  static key = "BibleBookmark";

  constructor(kernel: SunEditor.Kernel) {
    super(kernel);
    this.title = "Bible Bookmark";
    this.icon = '<span style="font-size:16px">🔖</span>';

    const bibleBooks = (window as any).BIBLE_BOOKS || [];

    // Build the book select options
    const bookOptions = bibleBooks
      .map((book: string) => `<option value="${book}">${book}</option>`)
      .join("");

    // Create the form HTML
    const formHtml = `
      <div class="se-button-group" style="padding: 12px;">
        <div style="margin-bottom: 10px;">
          <label for="se-bible-book" style="display: block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Book:</label>
          <select id="se-bible-book" style="width: 100%; padding: 6px; font-size: 13px;">
            <option value="">Select a book...</option>
            ${bookOptions}
          </select>
        </div>
        <div>
          <label for="se-bible-chapter" style="display: block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Chapter:</label>
          <input type="number" id="se-bible-chapter" min="1" value="1" style="width: 100%; padding: 6px; font-size: 13px;" />
        </div>
        <button type="button" class="se-btn se-btn-list" id="se-bible-insert" style="width: 100%; margin-top: 10px; padding: 8px; cursor: pointer;">Insert Link</button>
      </div>
    `;

    const menu = dom.utils.createElement(
      "div",
      { class: "se-dropdown se-list-layer" },
      `<div class="se-list-inner">${formHtml}</div>`,
    );

    this.$.menu.initDropdownTarget(BibleBookmark, menu);

    // Add click handler for the insert button
    setTimeout(() => {
      const insertBtn = menu.querySelector("#se-bible-insert") as HTMLElement;
      if (insertBtn) {
        insertBtn.addEventListener("click", () => {
          this.#insertBibleLink(menu);
        });
      }
    }, 0);
  }

  #insertBibleLink(menu: HTMLElement): void {
    const bookSelect = menu.querySelector(
      "#se-bible-book",
    ) as HTMLSelectElement;
    const chapterInput = menu.querySelector(
      "#se-bible-chapter",
    ) as HTMLInputElement;

    const book = bookSelect?.value;
    const chapter = chapterInput?.value || "1";

    if (book && chapter) {
      // Replace spaces with hyphens in the book name for the hash
      const bookHash = book.replace(/\s+/g, "-");
      const hash = `#${bookHash}:${chapter}`;
      const linkText = `${book} ${chapter}`;

      // Insert a link element
      const link = `<a href="${hash}">${linkText}</a>`;
      this.$.html.insert(link);
      this.$.history.push(false);
      this.$.menu.dropdownOff();
    }
  }

  /** @override @type {PluginDropdown['action']} — Dropdown item click handler */
  action(target: HTMLElement): void {
    // This is called when a dropdown item is clicked
    // In our case, we handle it via the insert button, so this can be empty
  }
}

export default BibleBookmark;
