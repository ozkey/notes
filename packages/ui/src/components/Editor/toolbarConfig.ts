// Configuration for toolbar buttons
// Defines all buttons displayed in the editor toolbar

import type { ToolbarButton } from "./types";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import React from "react";

/**
 * Builds toolbar buttons configuration
 * Organized into groups: undo/redo and text formatting
 * @param runExec - Function to execute document commands
 * @returns Object with button arrays grouped by category
 */
export const buildToolbarButtons = (
  runExec: (command: string) => void,
): { top: ToolbarButton[]; formatting: ToolbarButton[] } => ({
  top: [
    {
      key: "undo",
      label: "Undo",
      icon: React.createElement(UndoIcon, { fontSize: "small" }),
      action: () => runExec("undo"),
    },
    {
      key: "redo",
      label: "Redo",
      icon: React.createElement(RedoIcon, { fontSize: "small" }),
      action: () => runExec("redo"),
    },
  ] as ToolbarButton[],
  formatting: [
    {
      key: "bold",
      label: "Bold",
      icon: React.createElement(FormatBoldIcon, { fontSize: "small" }),
      action: () => runExec("bold"),
    },
    {
      key: "italic",
      label: "Italic",
      icon: React.createElement(FormatItalicIcon, { fontSize: "small" }),
      action: () => runExec("italic"),
    },
    {
      key: "underline",
      label: "Underline",
      icon: React.createElement(FormatUnderlinedIcon, { fontSize: "small" }),
      action: () => runExec("underline"),
    },
    {
      key: "strike",
      label: "Strikethrough",
      icon: React.createElement(StrikethroughSIcon, { fontSize: "small" }),
      action: () => runExec("strikeThrough"),
    },
    {
      key: "ordered",
      label: "Ordered list",
      icon: React.createElement(FormatListNumberedIcon, { fontSize: "small" }),
      action: () => runExec("insertOrderedList"),
    },
    {
      key: "unordered",
      label: "Unordered list",
      icon: React.createElement(FormatListBulletedIcon, { fontSize: "small" }),
      action: () => runExec("insertUnorderedList"),
    },
    {
      key: "indent",
      label: "Indent",
      icon: React.createElement(FormatIndentIncreaseIcon, { fontSize: "small" }),
      action: () => runExec("indent"),
    },
    {
      key: "outdent",
      label: "Outdent",
      icon: React.createElement(FormatIndentDecreaseIcon, { fontSize: "small" }),
      action: () => runExec("outdent"),
    },
  ] as ToolbarButton[],
});
