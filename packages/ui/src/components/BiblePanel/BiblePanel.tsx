import { Box, Card, CardContent, Tabs, Tab } from "@mui/material";
import React, { useContext } from "react";
import BibleContext from "../../contexts/BibleContext";
import { BibleText } from "./BibleText";
import { ToolbarPanel } from "../Toolbar";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
export const BiblePanel: React.FC = () => {
  const { selectedBook, chapterNumber } = useContext(
    BibleContext as React.Context<any>,
  );

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box key={1}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: 3,
          minHeight: "500px",
        }}
      >
        <CardContent>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab
              label={
                selectedBook
                  ? `${selectedBook} ${chapterNumber}`
                  : "Select a book"
              }
              {...a11yProps(0)}
            />
            <Tab label="Item Two" {...a11yProps(1)} />
          </Tabs>
          <CustomTabPanel value={value} index={0}>
            <ToolbarPanel />
            <BibleText
              selectedBook={selectedBook}
              chapterNumber={chapterNumber}
            />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <BibleText selectedBook={"Genesis"} chapterNumber={2} />
          </CustomTabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};
