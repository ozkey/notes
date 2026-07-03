// Utilities for table manipulation (insert, add/remove rows and columns)

import { replaceElementUndoably } from "./selectionUtils";
import { findParentTag } from "./utils";

/**
 * Helper to perform an action on the current table cell
 * Finds the cell, row, and table containing the cursor
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param callback - Function to execute with table context
 */
export const withCurrentCell = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  callback: (
    table: HTMLTableElement,
    row: HTMLTableRowElement,
    cellIndex: number,
  ) => void,
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
  const nextTable = replaceElementUndoably(table, editorRef, savedRangeRef, (draftTable) => {
    const draftRow = draftTable.rows[row.rowIndex];
    if (!(draftRow instanceof HTMLTableRowElement)) return;
    callback(draftTable, draftRow, cell.cellIndex);
  });
  if (nextTable) return nextTable;
};

/**
 * Inserts a table with 2x2 cells at the current selection
 * @param editorRef - Reference to the editor element
 * @param insertHtmlAtSelection - Function to insert HTML
 */
export const insertTable = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  insertHtmlAtSelection: (html: string) => void,
) => {
  insertHtmlAtSelection(
    `<table class="editor-table"><tbody><tr><td><br /></td><td><br /></td></tr><tr><td><br /></td><td><br /></td></tr></tbody></table><p><br /></p>`,
  );
};

/**
 * Adds a row to the current table after the current row
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export const addTableRow = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  syncFromEditor: () => void,
) => {
  const result = withCurrentCell(editorRef, savedRangeRef, (table, row) => {
    const newRow = table.insertRow(row.rowIndex + 1);
    const columns = row.cells.length || 1;
    for (let index = 0; index < columns; index += 1) {
      const cell = newRow.insertCell();
      cell.innerHTML = "<br />";
    }
  });
  if (result) syncFromEditor();
};

/**
 * Deletes a row from the current table
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export const deleteTableRow = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  syncFromEditor: () => void,
) => {
  const result = withCurrentCell(editorRef, savedRangeRef, (_table, row) => {
    if (row.parentElement?.children.length === 1) return;
    row.remove();
  });
  if (result) syncFromEditor();
};

/**
 * Adds a column to the current table after the current column
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export const addTableColumn = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  syncFromEditor: () => void,
) => {
  const result = withCurrentCell(editorRef, savedRangeRef, (table, _row, cellIndex) => {
    for (const row of Array.from(table.rows)) {
      const cell = row.insertCell(cellIndex + 1);
      cell.innerHTML = "<br />";
    }
  });
  if (result) syncFromEditor();
};

/**
 * Deletes a column from the current table
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export const deleteTableColumn = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  syncFromEditor: () => void,
) => {
  const result = withCurrentCell(editorRef, savedRangeRef, (table, _row, cellIndex) => {
    if (!table.rows.length || table.rows[0].cells.length <= 1) return;
    for (const row of Array.from(table.rows)) {
      if (row.cells[cellIndex]) row.deleteCell(cellIndex);
    }
  });
  if (result) syncFromEditor();
};

/**
 * Deletes the entire table containing the current cell
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export const deleteTable = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.RefObject<Range | null>,
  syncFromEditor: () => void,
) => {
  const result = withCurrentCell(editorRef, savedRangeRef, (table) => {
    table.remove();
  });
  if (result) syncFromEditor();
};
