import {
  withSelectedNode,
  replaceElementUndoably,
  replaceNodeWithTextUndoably,
  removeNodeUndoably,
} from "../components/Editor/selectionUtils";

function makeEditorRef(el: HTMLDivElement | null): React.RefObject<HTMLDivElement | null> {
  return { current: el } as React.RefObject<HTMLDivElement | null>;
}

function makeSavedRangeRef(): React.RefObject<Range | null> {
  return { current: null } as React.RefObject<Range | null>;
}

function mockSelection(anchorNode: Node | null, range?: Range) {
  const mockRange = range || document.createRange();
  return {
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
    rangeCount: 1,
    anchorNode,
    getRangeAt: jest.fn().mockReturnValue(mockRange),
  };
}

beforeEach(() => {
  document.body.innerHTML = "";
  (document as any).execCommand = jest.fn().mockReturnValue(true);
});

// ─── withSelectedNode ─────────────────────────────────────────────────────────

describe("withSelectedNode", () => {
  test("returns false when editorRef.current is null", () => {
    const node = document.createElement("span");
    const result = withSelectedNode(node, makeEditorRef(null), () => true);
    expect(result).toBe(false);
  });

  test("returns false when getSelection returns null", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);
    const span = document.createElement("span");
    editor.appendChild(span);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const result = withSelectedNode(span, makeEditorRef(editor), () => true);
    expect(result).toBe(false);
    jest.restoreAllMocks();
  });

  test("calls apply with selection and returns its result", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);
    const span = document.createElement("span");
    editor.appendChild(span);

    const sel = mockSelection(span);
    jest.spyOn(window, "getSelection").mockReturnValue(sel as any);

    const apply = jest.fn().mockReturnValue(true);
    const result = withSelectedNode(span, makeEditorRef(editor), apply);

    expect(apply).toHaveBeenCalledWith(sel);
    expect(result).toBe(true);
    jest.restoreAllMocks();
  });
});

// ─── replaceElementUndoably ───────────────────────────────────────────────────

describe("replaceElementUndoably", () => {
  test("returns null when editorRef.current is null", () => {
    const span = document.createElement("span");
    document.body.appendChild(span);

    const result = replaceElementUndoably(span, makeEditorRef(null), makeSavedRangeRef(), (d) => {
      d.textContent = "changed";
    });
    expect(result).toBeNull();
  });

  test("returns null when element is not connected", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);
    const span = document.createElement("span");
    // span is not appended to DOM

    const result = replaceElementUndoably(span, makeEditorRef(editor), makeSavedRangeRef(), (d) => {
      d.textContent = "changed";
    });
    expect(result).toBeNull();
  });

  test("returns null when mutate makes no change", () => {
    const editor = document.createElement("div");
    const span = document.createElement("span");
    span.textContent = "same";
    editor.appendChild(span);
    document.body.appendChild(editor);

    const sel = mockSelection(span);
    jest.spyOn(window, "getSelection").mockReturnValue(sel as any);

    const result = replaceElementUndoably(
      span,
      makeEditorRef(editor),
      makeSavedRangeRef(),
      (_d) => { /* no change */ }
    );
    expect(result).toBeNull();
    jest.restoreAllMocks();
  });

  test("replaces element when mutate changes outerHTML", () => {
    const editor = document.createElement("div");
    const span = document.createElement("span");
    span.textContent = "original";
    editor.appendChild(span);
    document.body.appendChild(editor);

    const range = document.createRange();
    range.selectNode(span);
    const sel = mockSelection(span, range);
    jest.spyOn(window, "getSelection").mockReturnValue(sel as any);

    const result = replaceElementUndoably(
      span,
      makeEditorRef(editor),
      makeSavedRangeRef(),
      (d) => { d.textContent = "changed"; }
    );

    expect(result).not.toBeNull();
    expect(result?.textContent).toBe("changed");
    jest.restoreAllMocks();
  });
});

// ─── replaceNodeWithTextUndoably ──────────────────────────────────────────────

describe("replaceNodeWithTextUndoably", () => {
  test("replaces node with text via withSelectedNode", () => {
    const editor = document.createElement("div");
    const span = document.createElement("span");
    span.textContent = "original";
    editor.appendChild(span);
    document.body.appendChild(editor);

    const range = document.createRange();
    range.selectNode(span);
    const sel = mockSelection(span, range);
    jest.spyOn(window, "getSelection").mockReturnValue(sel as any);

    const result = replaceNodeWithTextUndoably(span, makeEditorRef(editor), "new text");
    expect(result).toBe(true);
    jest.restoreAllMocks();
  });

  test("falls back to direct DOM manipulation when withSelectedNode fails", () => {
    const editor = document.createElement("div");
    const span = document.createElement("span");
    span.textContent = "original";
    editor.appendChild(span);
    document.body.appendChild(editor);

    // Return null selection to force withSelectedNode failure
    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const result = replaceNodeWithTextUndoably(span, makeEditorRef(editor), "fallback text");
    expect(result).toBe(true);
    jest.restoreAllMocks();
  });

  test("returns false in fallback when node has no parent", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    // Detached node
    const span = document.createElement("span");

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const result = replaceNodeWithTextUndoably(span, makeEditorRef(editor), "text");
    expect(result).toBe(false);
    jest.restoreAllMocks();
  });
});

// ─── removeNodeUndoably ───────────────────────────────────────────────────────

describe("removeNodeUndoably", () => {
  test("removes node via withSelectedNode when selection available", () => {
    const editor = document.createElement("div");
    const span = document.createElement("span");
    span.textContent = "to remove";
    editor.appendChild(span);
    document.body.appendChild(editor);

    const range = document.createRange();
    range.selectNode(span);
    const sel = mockSelection(span, range);
    jest.spyOn(window, "getSelection").mockReturnValue(sel as any);

    const result = removeNodeUndoably(span, makeEditorRef(editor));
    expect(result).toBe(true);
    jest.restoreAllMocks();
  });

  test("falls back to direct DOM removal when selection fails", () => {
    const editor = document.createElement("div");
    const span = document.createElement("span");
    editor.appendChild(span);
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const result = removeNodeUndoably(span, makeEditorRef(editor));
    expect(result).toBe(true);
    expect(editor.contains(span)).toBe(false);
    jest.restoreAllMocks();
  });

  test("returns false in fallback when node has no parent", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);
    const detachedSpan = document.createElement("span");

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const result = removeNodeUndoably(detachedSpan, makeEditorRef(editor));
    expect(result).toBe(false);
    jest.restoreAllMocks();
  });
});
