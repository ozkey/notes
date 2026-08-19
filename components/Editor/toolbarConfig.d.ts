import type { ToolbarButton } from "./types";
/**
 * Builds toolbar buttons configuration
 * Organized into groups: undo/redo and text formatting
 * @param runExec - Function to execute document commands
 * @returns Object with button arrays grouped by category
 */
export declare const buildToolbarButtons: (runExec: (command: string) => void) => {
    top: ToolbarButton[];
    formatting: ToolbarButton[];
};
//# sourceMappingURL=toolbarConfig.d.ts.map