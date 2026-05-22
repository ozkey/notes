import React from "react";
import { Container, Box } from "@mui/material";
import {BibleText} from "./BibleText";
import {StudyPanel} from "./StudyPanel";

export const MainPanel = () => {
  return (
    <Box component="main" sx={{ flex: 1, padding: "40px 0" }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr",
            },
            gap: 3,
          }}
        >
            <BibleText />
            <StudyPanel />

        </Box>
      </Container>
    </Box>
  );
};
