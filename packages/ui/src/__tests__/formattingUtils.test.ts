import {
  runExec,
  runFormatBlock,
  insertHtmlAtSelection,
  getColorForHighlight,
  createHighlightBadgeHtml,
  applyAlertVariant,
} from "../components/Editor/formattingUtils";

function makeEditorRef(el: HTMLDivElement | null): React.RefObject<HTMLDivElement | null> {
  return { current: el } as React.RefObject<HTMLDivElement | null>;
}

beforeEach(() => {
  document.body.innerHTML = "";
  (document as any).execCommand = jest.fn().mockReturnValue(true);
});

// ─── getColorForHighlight ─────────────────────────────────────────────────────

describe("getColorForHighlight", () => {
  test("returns color for green", () => {
    expect(getColorForHighlight("green")).toBe("#C8E6C9");
  });

  test("returns color for blue", () => {
    expect(getColorForHighlight("blue")).toBe("#BBDEFB");
  });

  test("returns color for pink", () => {
    expect(getColorForHighlight("pink")).toBe("#F8BBD0");
  });

  test("returns color for red", () => {
    expect(getColorForHighlight("red")).toBe("#FFCDD2");
  });

  test("returns color for orange", () => {
    expect(getColorForHighlight("orange")).toBe("#FFE0B2");
  });

  test("returns color for purple", () => {
    expect(getColorForHighlight("purple")).toBe("#E1BEE7");
  });

  test("returns #FFFFFF for unknown color", () => {
    expect(getColorForHighlight("unknown")).toBe("#FFFFFF");
  });
});

// ─── createHighlightBadgeHtml ─────────────────────────────────────────────────

describe("createHighlightBadgeHtml", () => {
  test("creates badge with verse number and color", () => {
    const html = createHighlightBadgeHtml(5, "green");
    expect(html).toContain('data-color="green"');
    expect(html).toContain(">5<");
  });

  test("includes contenteditable=false", () => {
    const html = createHighlightBadgeHtml(1, "blue");
    expect(html).toContain('contenteditable="false"');
  });

  test("includes editor-highlight-badge class", () => {
    const html = createHighlightBadgeHtml(1, "blue");
    expect(html).toContain('class="editor-highlight-badge"');
  });
});

// ─── runExec ──────────────────────────────────────────────────────────────────

describe("runExec", () => {
  test("calls document.execCommand and syncFromEditor", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const editorRef = makeEditorRef(div);
    const syncFromEditor = jest.fn();

    runExec(editorRef, "bold", syncFromEditor);

    expect(document.execCommand).toHaveBeenCalledWith("bold", false, undefined);
    expect(syncFromEditor).toHaveBeenCalled();
  });

  test("does nothing when editorRef.current is null", () => {
    const syncFromEditor = jest.fn();
    runExec(makeEditorRef(null), "bold", syncFromEditor);

    expect(document.execCommand).not.toHaveBeenCalled();
    expect(syncFromEditor).not.toHaveBeenCalled();
  });

  test("passes valueArg to execCommand", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const editorRef = makeEditorRef(div);
    const syncFromEditor = jest.fn();

    runExec(editorRef, "formatBlock", syncFromEditor, "h1");

    expect(document.execCommand).toHaveBeenCalledWith("formatBlock", false, "h1");
  });

  test("still calls syncFromEditor when execCommand throws", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const editorRef = makeEditorRef(div);
    const syncFromEditor = jest.fn();
    (document as any).execCommand = jest.fn().mockImplementation(() => {
      throw new Error("not supported");
    });

    expect(() => runExec(editorRef, "bold", syncFromEditor)).not.toThrow();
    expect(syncFromEditor).toHaveBeenCalled();
  });
});

// ─── runFormatBlock ───────────────────────────────────────────────────────────

describe("runFormatBlock", () => {
  test("calls runExec with formatBlock command", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const editorRef = makeEditorRef(div);
    const syncFromEditor = jest.fn();

    runFormatBlock(editorRef, "h1", syncFromEditor);

    expect(document.execCommand).toHaveBeenCalledWith("formatBlock", false, "h1");
    expect(syncFromEditor).toHaveBeenCalled();
  });
});

// ─── insertHtmlAtSelection ────────────────────────────────────────────────────

describe("insertHtmlAtSelection", () => {
  test("returns early when editorRef.current is null", () => {
    const syncFromEditor = jest.fn();
    insertHtmlAtSelection(makeEditorRef(null), "<b>test</b>", syncFromEditor);
    expect(syncFromEditor).not.toHaveBeenCalled();
  });

  test("appends to editor when no selection (rangeCount = 0)", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const editorRef = makeEditorRef(div);
    const syncFromEditor = jest.fn();

    jest.spyOn(window, "getSelection").mockReturnValue({
      rangeCount: 0,
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      getRangeAt: jest.fn(),
    } as any);

    insertHtmlAtSelection(editorRef, "<b>hello</b>", syncFromEditor);

    expect(div.innerHTML).toContain("<b>hello</b>");
    expect(syncFromEditor).toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  test("appends to editor when getSelection returns null", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const editorRef = makeEditorRef(div);
    const syncFromEditor = jest.fn();

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    insertHtmlAtSelection(editorRef, "<b>world</b>", syncFromEditor);

    expect(div.innerHTML).toContain("<b>world</b>");
    expect(syncFromEditor).toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  test("inserts at selection when selection exists", () => {
    const div = document.createElement("div");
    div.innerHTML = "<p>existing</p>";
    document.body.appendChild(div);
    const editorRef = makeEditorRef(div);
    const syncFromEditor = jest.fn();

    const range = document.createRange();
    range.selectNodeContents(div);

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue(range),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    };
    jest.spyOn(window, "getSelection").mockReturnValue(mockSelection as any);

    insertHtmlAtSelection(editorRef, "<span>inserted</span>", syncFromEditor);

    expect(syncFromEditor).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

// ─── applyAlertVariant ────────────────────────────────────────────────────────

describe("applyAlertVariant", () => {
  test("returns early when editorRef.current is null after runFormatBlock", () => {
    const syncFromEditor = jest.fn();
    // editorRef is null so both runFormatBlock and applyAlertVariant return early
    applyAlertVariant(makeEditorRef(null), "info", syncFromEditor);
    // syncFromEditor called by runFormatBlock only if editor is set - should not be called
    expect(syncFromEditor).not.toHaveBeenCalled();
  });

  test("applies 'quote' class as empty string", () => {
    const editor = document.createElement("div");
    const blockquote = document.createElement("blockquote");
    blockquote.className = "old-class";
    editor.appendChild(blockquote);
    document.body.appendChild(editor);

    const editorRef = makeEditorRef(editor);
    const syncFromEditor = jest.fn();

    // Mock getSelection to return anchorNode inside blockquote
    jest.spyOn(window, "getSelection").mockReturnValue({
      anchorNode: blockquote,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn(),
      }),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any);

    applyAlertVariant(editorRef, "quote", syncFromEditor);

    expect(blockquote.className).toBe("");
    jest.restoreAllMocks();
  });

  test("applies 'editor-alert-info' class for info variant", () => {
    const editor = document.createElement("div");
    const blockquote = document.createElement("blockquote");
    editor.appendChild(blockquote);
    document.body.appendChild(editor);

    const editorRef = makeEditorRef(editor);
    const syncFromEditor = jest.fn();

    jest.spyOn(window, "getSelection").mockReturnValue({
      anchorNode: blockquote,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn(),
      }),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any);

    applyAlertVariant(editorRef, "info", syncFromEditor);

    expect(blockquote.className).toBe("editor-alert-info");
    jest.restoreAllMocks();
  });

  test("does nothing when no blockquote parent found", () => {
    const editor = document.createElement("div");
    const p = document.createElement("p");
    editor.appendChild(p);
    document.body.appendChild(editor);

    const editorRef = makeEditorRef(editor);
    const syncFromEditor = jest.fn();

    jest.spyOn(window, "getSelection").mockReturnValue({
      anchorNode: p,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn(),
      }),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    } as any);

    applyAlertVariant(editorRef, "warning", syncFromEditor);

    // syncFromEditor is called once by runFormatBlock but not the second time in applyAlertVariant
    expect(syncFromEditor).toHaveBeenCalledTimes(1);
    jest.restoreAllMocks();
  });
});
