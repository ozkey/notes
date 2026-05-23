import {Box, Card, CardContent, Typography} from "@mui/material";
import React, {useContext} from "react";
import BibleContext from "../contexts/BibleContext";
import Editor from "./Editor";

export const StudyPanel: React.FC = () => {
    const { selectedBook, chapterNumber } = useContext(BibleContext as React.Context<any>);

    return(
        <Box key={1}>
            <Card
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 3,

                }}
            >
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {selectedBook ? `${selectedBook} — Chapter ${chapterNumber ?? 1}` : "No book selected"}
                    </Typography>
                    <Editor />
                </CardContent>
            </Card>
        </Box>)
}