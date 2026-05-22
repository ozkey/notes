import {Box, Card, CardContent, Typography} from "@mui/material";
import React from "react";

export const StudyPanel: React.FC = () => {
    return(
    <Box key={1}>
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
                    1
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    This is a simple card component
                </Typography>
            </CardContent>
        </Card>
    </Box>)
}