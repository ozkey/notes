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
import { TabState } from "../../contexts/BibleTypes";
import { ContainedButtons } from "../ActionBar/ActionBar";
import { NotesPanel } from "../NotesPanel/NotesPanel";
import { HomeTab } from "./HomeTab";

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

function getCustomTabPanel(i: number, currentTab: number, t: TabState) {
  return (
    <CustomTabPanel key={i} value={currentTab} index={i}>
      {t.mode === "home" ? (
        <HomeTab />
      ) : (
        <NotesPanel
          mode={t.mode}
          selectedBook={t.selectedBook}
          chapterNumber={t.chapterNumber}
        />
      )}
    </CustomTabPanel>
  );
}

export const TabsPanel: React.FC = () => {
  const { tabs, currentTab, setCurrentTab, addTab, closeTab } =
    useContext(BibleContext);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // if user clicked the + tab (index === tabs.length) then add
    if (newValue === tabs.length) {
      addTab();
      return;
    }
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ padding: "0px" }} disableGutters={true}>
      <ContainedButtons />
      <Box component="main" sx={{ flex: 1, padding: "0px", margin: "0px" }}>
        <Tabs
          value={currentTab}
          onChange={handleChange}
          aria-label="bible tabs"
        >
          {tabs.map((t, i: number) => (
            <Tab
              key={i}
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: 8 }}>
                    {t.mode === "home"
                      ? "Home"
                      : t.mode === "article"
                        ? t.articleId
                          ? `${t.articleId}`
                          : "Article"
                        : t.selectedBook
                          ? `${t.selectedBook} ${t.chapterNumber}`
                          : "Select a book"}
                  </span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(i);
                    }}
                    aria-label={`close-tab-${i}`}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              }
              {...a11yProps(i)}
            />
          ))}
          {tabs.length < 4 && <Tab label="+" {...a11yProps(tabs.length)} />}
        </Tabs>
        <Card sx={{ bgcolor: "grey.50", padding: "0px", margin: "0px" }}>
          <CardContent sx={{ padding: "0px", margin: "0px" }}>
            {tabs.map((t, i: number) => getCustomTabPanel(i, currentTab, t))}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
