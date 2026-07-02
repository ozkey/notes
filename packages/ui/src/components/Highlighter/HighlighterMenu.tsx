import React from "react";
import { Menu, MenuItem, Box, ListItemIcon, ListItemText } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { HighlightColor } from "../../contexts/BibleTypes";

const HIGHLIGHT_COLORS: {
  color: HighlightColor;
  label: string;
  bgColor: string;
}[] = [
  { color: "green", label: "Green", bgColor: "#C8E6C9" },
  { color: "blue", label: "Blue", bgColor: "#BBDEFB" },
  { color: "pink", label: "Pink", bgColor: "#FFCDD2" },
  { color: "orange", label: "Orange", bgColor: "#FFE0B2" },
  { color: "purple", label: "Purple", bgColor: "#E1BEE7" },
];

interface HighlighterMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  onSelectColor: (color: HighlightColor) => void;
  onRemoveHighlight: () => void;
}

export const HighlighterMenu: React.FC<HighlighterMenuProps> = ({
  anchorEl,
  onClose,
  onSelectColor,
  onRemoveHighlight,
}) => {
  return (
    <Menu
      id="highlighter-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      {HIGHLIGHT_COLORS.map((item) => (
        <MenuItem
          key={item.color}
          onClick={() => {
            onSelectColor(item.color);
            onClose();
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: item.bgColor,
              borderRadius: "4px",
              marginRight: "12px",
              border: "1px solid #999",
            }}
          />
          <ListItemText>{item.label}</ListItemText>
        </MenuItem>
      ))}
      <MenuItem
        onClick={() => {
          onRemoveHighlight();
          onClose();
        }}
        sx={{
          borderTop: "1px solid #eee",
          marginTop: "8px",
          paddingTop: "8px",
        }}
      >
        <ListItemIcon>
          <ClearIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Remove highlight</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export { HIGHLIGHT_COLORS };
