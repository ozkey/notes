import Stack from "@mui/material/Stack";
import { SaveOpen } from "./SaveOpen";
import { Box, Card, CardContent } from "@mui/material";

export const ContainedButtons = () => {
  return (
    <Box component="main" sx={{ flex: 1, padding: "0px 0 0 0" }}>
      <Card sx={{ bgcolor: "grey.50" }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <SaveOpen />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
