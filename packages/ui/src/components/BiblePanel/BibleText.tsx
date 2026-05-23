import {Box, Card, CardContent, Typography} from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../../contexts/BibleContext";

export const BibleText: React.FC = () => {
    const { selectedBook, chapterNumber } = useContext(BibleContext as React.Context<any>);

    return(
    <div>
        <Typography variant="body2" color="text.secondary">
            bible text for the selected book and chapter will go here
        </Typography>
    </div>)
}