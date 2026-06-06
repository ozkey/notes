import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Container,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext } from "react";
import BibleContext from "../../contexts/BibleContext";
import { BibleText } from "./BibleText";
import { BookActions } from "../ActionBar/BookActions";
import { StudyPanel } from "../StudyPanel";
import { ContainedButtons } from "../ActionBar/ActionBar";

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
  const { tabs, currentTab, setCurrentTab, addTab, closeTab } = useContext(
    BibleContext as React.Context<any>,
  );

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // if user clicked the + tab (index === tabs.length) then add
    if (newValue === tabs.length) {
      addTab();
      return;
    }
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <ContainedButtons />
      <Box component="main" sx={{ flex: 1, padding: "10px 0 0 0" }}>
        <Card sx={{ bgcolor: "grey.50" }}>
          <CardContent>
            <Tabs
              value={currentTab}
              onChange={handleChange}
              aria-label="bible tabs"
            >
              {tabs.map((t: any, i: number) => (
                <Tab
                  key={i}
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: 8 }}>
                        {t.selectedBook
                          ? `${t.selectedBook} ${t.chapterNumber}`
                          : "Select a book"}
                      </span>
                      {/*<IconButton*/}
                      {/*  size="small"*/}
                      {/*  onClick={(e) => {*/}
                      {/*    e.stopPropagation();*/}
                      {/*    closeTab(i);*/}
                      {/*  }}*/}
                      {/*  aria-label={`close-tab-${i}`}*/}
                      {/*>*/}
                      {/*  <CloseIcon fontSize="small" />*/}
                      {/*</IconButton>*/}
                    </div>
                  }
                  {...a11yProps(i)}
                />
              ))}
              {tabs.length < 4 && <Tab label="+" {...a11yProps(tabs.length)} />}
            </Tabs>

            {tabs.map((t: any, i: number) => (
              <CustomTabPanel key={i} value={currentTab} index={i}>
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
                  <BibleText
                    selectedBook={t.selectedBook}
                    chapterNumber={t.chapterNumber}
                  />
                  <StudyPanel />
                </Box>
              </CustomTabPanel>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
