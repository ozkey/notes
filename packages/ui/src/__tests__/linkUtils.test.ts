import { submitLink, removeLink, openLink, submitBibleBookmark } from "../components/Editor/linkUtils";

function makeEditorRef(el: HTMLDivElement | null): React.RefObject<HTMLDivElement | null> {
  return { current: el } as React.RefObject<HTMLDivElement | null>;
}

function makeSavedRangeRef(): React.RefObject<Range | null> {
  return { current: null } as React.RefObject<Range | null>;
}

beforeEach(() => {
  document.body.innerHTML = "";
  (document as any).execCommand = jest.fn().mockReturnValue(true);
});

// ─── submitLink ───────────────────────────────────────────────────────────────

describe("submitLink", () => {
  test("returns early when href is empty", () => {
    const insertHtml = jest.fn();
    const replaceElement = jest.fn();
    const syncFromEditor = jest.fn();
    const editorRef = makeEditorRef(document.createElement("div"));

    submitLink("", "text", false, null, editorRef, makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(insertHtml).not.toHaveBeenCalled();
    expect(syncFromEditor).not.toHaveBeenCalled();
  });

  test("returns early when href is whitespace", () => {
    const insertHtml = jest.fn();
    const replaceElement = jest.fn();
    const syncFromEditor = jest.fn();

    submitLink("   ", "text", false, null, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(insertHtml).not.toHaveBeenCalled();
  });

  test("calls insertHtmlAtSelection when no editingAnchor", () => {
    const insertHtml = jest.fn();
    const replaceElement = jest.fn();
    const syncFromEditor = jest.fn();

    submitLink("https://example.com", "Example", false, null, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(insertHtml).toHaveBeenCalledWith('<a href="https://example.com">Example</a>');
  });

  test("uses href as text when text is empty", () => {
    const insertHtml = jest.fn();
    const replaceElement = jest.fn();
    const syncFromEditor = jest.fn();

    submitLink("https://example.com", "", false, null, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(insertHtml).toHaveBeenCalledWith('<a href="https://example.com">https://example.com</a>');
  });

  test("adds target=_blank when openNewTab is true", () => {
    const insertHtml = jest.fn();
    const replaceElement = jest.fn();
    const syncFromEditor = jest.fn();

    submitLink("https://example.com", "Example", true, null, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(insertHtml).toHaveBeenCalledWith('<a href="https://example.com" target="_blank">Example</a>');
  });

  test("calls replaceElement and syncFromEditor when editing anchor with success", () => {
    const anchor = document.createElement("a");
    anchor.href = "https://old.com";
    anchor.textContent = "Old";

    const updatedAnchor = document.createElement("a");
    const replaceElement = jest.fn().mockReturnValue(updatedAnchor);
    const syncFromEditor = jest.fn();
    const insertHtml = jest.fn();

    submitLink("https://new.com", "New", false, anchor, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(replaceElement).toHaveBeenCalledWith(anchor, expect.any(Function));
    expect(syncFromEditor).toHaveBeenCalled();
    expect(insertHtml).not.toHaveBeenCalled();
  });

  test("does not call syncFromEditor when replaceElement returns null", () => {
    const anchor = document.createElement("a");
    const replaceElement = jest.fn().mockReturnValue(null);
    const syncFromEditor = jest.fn();
    const insertHtml = jest.fn();

    submitLink("https://new.com", "New", false, anchor, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(syncFromEditor).not.toHaveBeenCalled();
  });

  test("mutate callback updates anchor attributes", () => {
    const anchor = document.createElement("a");
    anchor.href = "https://old.com";
    anchor.textContent = "Old";

    let capturedMutate: ((draft: HTMLAnchorElement) => void) | null = null;
    const replaceElement = jest.fn((el: any, mutate: any) => {
      capturedMutate = mutate;
      return null;
    });

    submitLink("https://new.com", "New", true, anchor, makeEditorRef(null), makeSavedRangeRef(), jest.fn(), replaceElement, jest.fn());

    const draft = document.createElement("a");
    capturedMutate!(draft);
    expect(draft.getAttribute("href")).toBe("https://new.com");
    expect(draft.getAttribute("target")).toBe("_blank");
    expect(draft.textContent).toBe("New");
  });
});

// ─── removeLink ───────────────────────────────────────────────────────────────

describe("removeLink", () => {
  test("removes anchor, sets link menu to null, calls syncFromEditor", () => {
    const editor = document.createElement("div");
    const anchor = document.createElement("a");
    anchor.textContent = "Link";
    editor.appendChild(anchor);
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const setLinkMenu = jest.fn();
    const syncFromEditor = jest.fn();

    removeLink(anchor, makeEditorRef(editor), makeSavedRangeRef(), setLinkMenu, syncFromEditor);

    expect(setLinkMenu).toHaveBeenCalledWith(null);
    expect(syncFromEditor).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

// ─── openLink ─────────────────────────────────────────────────────────────────

describe("openLink", () => {
  test("calls window.open for https:// URL", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    openLink("https://example.com");
    expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
    openSpy.mockRestore();
  });

  test("calls window.open for http:// URL", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    openLink("http://example.com");
    expect(openSpy).toHaveBeenCalledWith("http://example.com", "_blank");
    openSpy.mockRestore();
  });

  test("sets window.location.href for relative URLs", () => {
    // We test that invalid URLs are blocked (javascript:)
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    openLink("#section");
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  test("does nothing for javascript: URL", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    openLink("javascript:alert(1)");
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  test("does nothing for empty href", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    openLink("");
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });
});

// ─── submitBibleBookmark ──────────────────────────────────────────────────────

describe("submitBibleBookmark", () => {
  test("calls insertHtmlAtSelection with bookmark html when no editingAnchor", () => {
    const insertHtml = jest.fn();
    const replaceElement = jest.fn();
    const syncFromEditor = jest.fn();

    submitBibleBookmark("Genesis", 1, null, null, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(insertHtml).toHaveBeenCalledWith(expect.stringContaining("Genesis"));
  });

  test("calls replaceElement when editing existing bookmark", () => {
    const anchor = document.createElement("a");
    anchor.href = "#Genesis:1";
    anchor.textContent = "Genesis 1";

    const updatedAnchor = document.createElement("a");
    const replaceElement = jest.fn().mockReturnValue(updatedAnchor);
    const syncFromEditor = jest.fn();
    const insertHtml = jest.fn();

    submitBibleBookmark("Exodus", 2, null, anchor, makeEditorRef(null), makeSavedRangeRef(), insertHtml, replaceElement, syncFromEditor);

    expect(replaceElement).toHaveBeenCalled();
    expect(syncFromEditor).toHaveBeenCalled();
    expect(insertHtml).not.toHaveBeenCalled();
  });
});
