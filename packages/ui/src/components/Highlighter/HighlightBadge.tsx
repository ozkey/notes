import React from "react";
import { Box, Chip } from "@mui/material";
import { HighlightColor } from "../../contexts/BibleTypes";

const getColorMap = (color: HighlightColor): string => {
  const colorMap: Record<HighlightColor, string> = {
    green: "#C8E6C9",
    blue: "#BBDEFB",
    pink: "#F8BBD0",
    red: "#FFCDD2",
    orange: "#FFE0B2",
    purple: "#E1BEE7",
  };
  return colorMap[color];
};

interface HighlightBadgeProps {
  verseNumber: number;
  color: HighlightColor;
  onDelete?: () => void;
  editable?: boolean;
}

export const HighlightBadge: React.FC<HighlightBadgeProps> = ({
  verseNumber,
  color,
  onDelete,
  editable = true,
}) => {
  const bgColor = getColorMap(color);

  if (editable) {
    return (
      <Chip
        label={`Verse ${verseNumber}`}
        onDelete={onDelete}
        size="small"
        sx={{
          backgroundColor: bgColor,
          fontWeight: "bold",
          marginRight: "4px",
          marginBottom: "4px",
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "inline-block",
        backgroundColor: bgColor,
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.875rem",
        fontWeight: "bold",
        marginRight: "4px",
        marginBottom: "4px",
        border: "1px solid #999",
      }}
    >
      {verseNumber}
    </Box>
  );
};
