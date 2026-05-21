import React, { useContext } from "react";
import { Box, Container, Autocomplete, TextField } from "@mui/material";
import BibleContext from "../contexts/BibleContext";

export const ToolbarPanel: React.FC = () => {
  const { selectedBook, setSelectedBook, books } = useContext(
    BibleContext as React.Context<any>,
  );

  return (
    <Box
      component="div"
      sx={{
        backgroundColor: "#fff",
        padding: "12px 0",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Container maxWidth="xl" sx={{ display: "flex", alignItems: "center" }}>
        <Autocomplete
          freeSolo={false}
          options={books}
          value={selectedBook}
          onChange={(_, value) => setSelectedBook(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Bible Book"
              variant="outlined"
              size="small"
            />
          )}
          sx={{ width: 320 }}
        />
      </Container>
    </Box>
  );
};
