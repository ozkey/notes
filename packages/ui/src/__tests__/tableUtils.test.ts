import {
  insertTable,
  withCurrentCell,
  addTableRow,
  deleteTableRow,
  addTableColumn,
  deleteTableColumn,
  deleteTable,
} from "../components/Editor/tableUtils";

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

// ─── insertTable ──────────────────────────────────────────────────────────────

describe("insertTable", () => {
  test("calls insertHtmlAtSelection with table HTML", () => {
    const insertHtml = jest.fn();
    const editorRef = makeEditorRef(document.createElement("div"));

    insertTable(editorRef, insertHtml);

    expect(insertHtml).toHaveBeenCalledWith(
      expect.stringContaining('<table class="editor-table">')
    );
  });

  test("inserts a 2x2 table structure", () => {
    const insertHtml = jest.fn();
    const editorRef = makeEditorRef(document.createElement("div"));

    insertTable(editorRef, insertHtml);

    const html = insertHtml.mock.calls[0][0] as string;
    // Should have 4 <td> elements
    const tdCount = (html.match(/<td>/g) || []).length;
    expect(tdCount).toBe(4);
  });
});

// ─── withCurrentCell ──────────────────────────────────────────────────────────

describe("withCurrentCell", () => {
  test("returns early when editorRef.current is null", () => {
    jest.spyOn(window, "getSelection").mockReturnValue({
      anchorNode: null,
    } as any);

    const callback = jest.fn();
    withCurrentCell(makeEditorRef(null), makeSavedRangeRef(), callback);

    expect(callback).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  test("returns early when no cell parent found", () => {
    const editor = document.createElement("div");
    const p = document.createElement("p");
    editor.appendChild(p);
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue({
      anchorNode: p,
    } as any);

    const callback = jest.fn();
    withCurrentCell(makeEditorRef(editor), makeSavedRangeRef(), callback);

    expect(callback).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  test("returns early when no selection", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const callback = jest.fn();
    withCurrentCell(makeEditorRef(editor), makeSavedRangeRef(), callback);

    expect(callback).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

// ─── Table operation no-ops when no current cell ───────────────────────────────

describe("addTableRow", () => {
  test("does not call syncFromEditor when no cell is found", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const syncFromEditor = jest.fn();
    addTableRow(makeEditorRef(editor), makeSavedRangeRef(), syncFromEditor);

    expect(syncFromEditor).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

describe("deleteTableRow", () => {
  test("does not call syncFromEditor when no cell is found", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const syncFromEditor = jest.fn();
    deleteTableRow(makeEditorRef(editor), makeSavedRangeRef(), syncFromEditor);

    expect(syncFromEditor).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

describe("addTableColumn", () => {
  test("does not call syncFromEditor when no cell is found", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const syncFromEditor = jest.fn();
    addTableColumn(makeEditorRef(editor), makeSavedRangeRef(), syncFromEditor);

    expect(syncFromEditor).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

describe("deleteTableColumn", () => {
  test("does not call syncFromEditor when no cell is found", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const syncFromEditor = jest.fn();
    deleteTableColumn(makeEditorRef(editor), makeSavedRangeRef(), syncFromEditor);

    expect(syncFromEditor).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

describe("deleteTable", () => {
  test("does not call syncFromEditor when no cell is found", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const syncFromEditor = jest.fn();
    deleteTable(makeEditorRef(editor), makeSavedRangeRef(), syncFromEditor);

    expect(syncFromEditor).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

// ─── Table operations with real DOM table ────────────────────────────────────

function buildTable(editor: HTMLDivElement) {
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  const row1 = document.createElement("tr");
  const row2 = document.createElement("tr");

  const td1 = document.createElement("td");
  td1.textContent = "R1C1";
  const td2 = document.createElement("td");
  td2.textContent = "R1C2";
  row1.appendChild(td1);
  row1.appendChild(td2);

  const td3 = document.createElement("td");
  td3.textContent = "R2C1";
  const td4 = document.createElement("td");
  td4.textContent = "R2C2";
  row2.appendChild(td3);
  row2.appendChild(td4);

  tbody.appendChild(row1);
  tbody.appendChild(row2);
  table.appendChild(tbody);
  editor.appendChild(table);

  return { table, row1, row2, td1, td2, td3, td4 };
}

describe("addTableRow (with real table)", () => {
  test("adds a row when cursor is in a table cell", () => {
    const editor = document.createElement("div");
    document.body.appendChild(editor);
    const { row1, td1, table } = buildTable(editor);

    // Set up a real range pointing to the cell
    const range = document.createRange();
    range.selectNode(td1);

    jest.spyOn(window, "getSelection").mockReturnValue({
      anchorNode: td1,
      rangeCount: 1,
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      getRangeAt: jest.fn().mockReturnValue(range),
    } as any);

    const syncFromEditor = jest.fn();
    addTableRow(makeEditorRef(editor), makeSavedRangeRef(), syncFromEditor);

    jest.restoreAllMocks();
  });
});
