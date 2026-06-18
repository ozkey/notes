import { interfaces, modules, helper } from "suneditor";
import type { SunEditor } from "suneditor/types";

const { Modal } = modules.contract;
const { dom } = helper;

/**
 * @class
 * @description PluginModal — Button opens a modal dialog.
 * Pattern: link, image, video, audio
 * @implements {interfaces.ModuleModal} — Modal lifecycle hooks
 * @implements {interfaces.ModuleController} — Figure handles controllerAction
 * @implements {interfaces.EditorComponent} — Component select/deselect/destroy
 */
class BibleBookmark
  extends interfaces.PluginModal
  implements
    interfaces.ModuleModal,
    interfaces.ModuleController,
    interfaces.EditorComponent
{
  static key = "BibleBookmark";
  _element: HTMLAnchorElement | null = null;
  #isUpdate = false;
  modal: InstanceType<typeof Modal>;
  // form controls
  bookSelect: HTMLSelectElement;
  chapterInput: HTMLInputElement;

  /** @hook Editor.Component — Detect anchor nodes in editor content */
  static component(node: Node): Node | null {
    // Accept either a direct anchor node or an anchor wrapped in a <figure> element.
    const maybeEl = node as HTMLElement;
    const el =
      maybeEl && maybeEl.nodeName === "FIGURE"
        ? maybeEl.firstElementChild
        : node;
    return /^A$/i.test((el as Element)?.nodeName ?? "") ? (el as Node) : null;
  }

  constructor(kernel: SunEditor.Kernel) {
    super(kernel);
    this.title = "Bible Bookmark";
    this.icon = "🔖"; //"embed";

    // Full list of common 66 bible books (Protestant canon). Used to populate the select.
    // @ts-ignore
    const BOOKS = window.BIBLE_BOOKS;
    // se-modal-content > form > header/body/footer — suneditor standard modal structure
    const books = (window as any).BIBLE_BOOKS ?? BOOKS;
    const options = books
      .map((b: string) => `<option value="${b}">${b}</option>`)
      .join("");
    const modalEl = dom.utils.createElement(
      "div",
      { class: "se-modal-content" },
      `<form>
        <div class="se-modal-header">
          <button type="button" data-command="close" class="se-btn se-close-btn" aria-label="Close">${this.$.icons.cancel}</button>
          <span class="se-modal-title">Insert Bible Bookmark</span>
        </div>
        <div class="se-modal-body">
          <div class="se-modal-form">
            <label>Book</label>
            <select class="se-input-form" data-book data-focus>
              ${options}
            </select>
          </div>
          <div class="se-modal-form">
            <label>Chapter</label>
            <input class="se-input-form" type="number" min="1" value="1" data-chapter />
          </div>
        </div>
        <div class="se-modal-footer">
          <button type="submit" class="se-btn-primary"><span>Insert</span></button>
        </div>
      </form>`,
    );

    this.modal = new Modal(this, this.$, modalEl);
    this.bookSelect = modalEl.querySelector("select[data-book]")!;
    this.chapterInput = modalEl.querySelector("input[data-chapter]")!;
  }

  /** @override — Required: opens the modal */
  open(): void {
    this.modal.open();
  }

  /** @hook Modal.Action — Required: form submit handler */
  async modalAction(): Promise<boolean> {
    const book = this.bookSelect.value;
    const chapterRaw = this.chapterInput.value.trim();
    const chapter = chapterRaw ? parseInt(chapterRaw, 10) : NaN;
    if (!book || Number.isNaN(chapter) || chapter < 1) return false;

    // Build hash: spaces replaced by - (as requested) then encoded
    const bookForHash = encodeURIComponent(book.replace(/\s+/g, "-"));
    const hash = `#${bookForHash}:${chapter}`;

    if (this.#isUpdate && this._element) {
      this._element.setAttribute("href", hash);
      this._element.textContent = `${book} ${chapter}`;
    } else {
      const anchor = dom.utils.createElement(
        "A",
        { href: hash, class: "se-bible-bookmark" },
        `${book} ${chapter}`,
      ) as HTMLAnchorElement;

      this.$.html.insert(anchor);
    }
    this.$.history.push(false);
    return true;
  }

  /** @hook Modal.On — After modal opens */
  modalOn(isUpdate: boolean): void {
    this.#isUpdate = isUpdate;
    if (isUpdate && this._element) {
      const href = this._element.getAttribute("href") || "";
      // expected format: #Book-Name:chapter
      const raw = href.startsWith("#") ? href.slice(1) : href;
      const parts = raw.split(":");
      const bookPart = parts[0]
        ? decodeURIComponent(parts[0]).replace(/-/g, " ")
        : "";
      const chapterPart = parts[1] || "1";
      // set form values; fall back to defaults if not found in options
      if (
        bookPart &&
        Array.from(this.bookSelect.options).some((o) => o.value === bookPart)
      ) {
        this.bookSelect.value = bookPart;
      }
      this.chapterInput.value = chapterPart;
    } else {
      // default values
      this.bookSelect.selectedIndex = 0;
      this.chapterInput.value = "1";
    }
    this.bookSelect.focus();
  }

  /** @hook Modal.Init — Before modal opens/closes */
  modalInit(): void {
    // No figure/controller UI in this simplified plugin.
  }

  /** @hook Modal.Off — After modal closes */
  modalOff(): void {
    // reset form
    if (this.bookSelect) this.bookSelect.selectedIndex = 0;
    if (this.chapterInput) this.chapterInput.value = "1";
  }

  /** @hook Controller.Action — Figure dispatches controller button clicks here */
  controllerAction(target: HTMLElement): void {
    const cmd = target.getAttribute("data-command");
    if (cmd === "edit") this.modal.open();
    else if (cmd === "remove") this.componentDestroy(this._element!);
  }

  /** @hook Component.Select — Component clicked in editor */
  componentSelect(target: HTMLElement): void {
    this._element = target as HTMLAnchorElement;
  }

  /** @hook Component.Deselect */
  componentDeselect(): void {
    this._element = null;
  }

  /** @hook Component.Destroy — Delete the component */
  async componentDestroy(target: HTMLElement): Promise<void> {
    const previous = target.previousElementSibling;
    dom.utils.removeItem(target);
    this._element = null;
    this.$.focusManager.focusEdge(previous);
    this.$.history.push(false);
  }
}

export default BibleBookmark;
