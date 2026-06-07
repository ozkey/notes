import { Button } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../../contexts/BibleContext";

export const SaveOpen: React.FC = () => {
  const { saveNotesToFile, loadNotesFromFile } = useContext(
    BibleContext as React.Context<any>,
  );


  return (
    <>
      <Button variant="outlined" onClick={() => loadNotesFromFile()}>
        Load
      </Button>
      <Button variant="outlined" onClick={() => saveNotesToFile()}>
        Save
      </Button>
    </>
  );
};
