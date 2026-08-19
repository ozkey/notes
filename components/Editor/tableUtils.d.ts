/**
 * Helper to perform an action on the current table cell
 * Finds the cell, row, and table containing the cursor
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param callback - Function to execute with table context
 */
export declare const withCurrentCell: (editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, callback: (table: HTMLTableElement, row: HTMLTableRowElement, cellIndex: number) => void) => HTMLTableElement | undefined;
/**
 * Inserts a table with 2x2 cells at the current selection
 * @param editorRef - Reference to the editor element
 * @param insertHtmlAtSelection - Function to insert HTML
 */
export declare const insertTable: (editorRef: React.RefObject<HTMLDivElement | null>, insertHtmlAtSelection: (html: string) => void) => void;
/**
 * Adds a row to the current table after the current row
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export declare const addTableRow: (editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, syncFromEditor: () => void) => void;
/**
 * Deletes a row from the current table
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export declare const deleteTableRow: (editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, syncFromEditor: () => void) => void;
/**
 * Adds a column to the current table after the current column
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export declare const addTableColumn: (editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, syncFromEditor: () => void) => void;
/**
 * Deletes a column from the current table
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export declare const deleteTableColumn: (editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, syncFromEditor: () => void) => void;
/**
 * Deletes the entire table containing the current cell
 * @param editorRef - Reference to the editor element
 * @param savedRangeRef - Reference to store the current selection
 * @param syncFromEditor - Callback to sync content
 */
export declare const deleteTable: (editorRef: React.RefObject<HTMLDivElement | null>, savedRangeRef: React.RefObject<Range | null>, syncFromEditor: () => void) => void;
//# sourceMappingURL=tableUtils.d.ts.map