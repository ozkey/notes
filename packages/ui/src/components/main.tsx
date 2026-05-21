import React from "react";
import { Container, Box, Card, CardContent, Typography } from "@mui/material";

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
          {["Col 1", "Col 2"].map((title, index) => (
            <Box key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: 3,
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is a simple card component in {title.toLowerCase()}.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
