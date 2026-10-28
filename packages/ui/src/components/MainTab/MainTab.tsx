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
import AddIcon from "@mui/icons-material/Add";
import React, { useContext, useState } from "react";
import BibleContext from "../../contexts/BibleContext";
import { TabState } from "../../contexts/BibleTypes";
import { ContainedButtons } from "../ActionBar/ActionBar";
import { MainTabBox } from "./MainTabBox";
import { HomeTab } from "../Tabs/HomeTab";
import { MAX_TAB_LIMIT } from "../../contexts/BibleContextUtils";

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
      {value === index && (
        <Box sx={{ p: { xs: 1.25, md: 1.75 } }}>{children}</Box>
      )}
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
        <MainTabBox
          mode={t.mode}
          selectedBook={t.selectedBook}
          chapterNumber={t.chapterNumber}
          verseNumber={t.verseNumber}
          searchQuery={t.searchQuery}
        />
      )}
    </CustomTabPanel>
  );
}

export const MainTab: React.FC = () => {
  const bibleContext = useContext(BibleContext);
  const { tabs, currentTab, setCurrentTab, addTab, closeTab } = bibleContext;
  const { moveTab } = bibleContext;
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // if user clicked the + tab (index === tabs.length) then add
    if (newValue === tabs.length) {
      addTab();
      return;
    }
    setCurrentTab(newValue);
  };

  const handleDropOnTab = (targetIndex: number) => {
    if (draggedTabIndex === null) return;
    moveTab(draggedTabIndex, targetIndex);
    setDraggedTabIndex(null);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ padding: 0, marginTop: 1.5 }}
      disableGutters={true}
    >
      <ContainedButtons />
      <Box component="main" sx={{ flex: 1, p: 0, m: 0, mt: 1.25 }}>
        <Card sx={{ p: 0, m: 0 }}>
          <CardContent sx={{ p: 0, m: 0 }}>
            <Box
              sx={{
                px: 1.1,
                pt: 0.9,
                borderBottom: "1px solid #DDD7C8",
                backgroundColor: "#FBF8F1",
              }}
            >
              <Tabs
                value={currentTab}
                onChange={handleChange}
                aria-label="bible tabs"
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  minHeight: 40,
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                  "& .MuiTabs-scrollButtons": {
                    color: "text.secondary",
                  },
                }}
              >
                {tabs.map((t, i: number) => (
                  <Tab
                    component="div"
                    key={t.id ?? i}
                    draggable
                    onDragStart={() => setDraggedTabIndex(i)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleDropOnTab(i);
                    }}
                    onDragEnd={() => setDraggedTabIndex(null)}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Box component="span" sx={{ mr: 0.5 }}>
                          {t.mode === "home"
                            ? "Home"
                            : t.mode === "article"
                              ? t.articleId
                                ? `${t.articleId}`
                                : "Article"
                              : t.mode === "search"
                                ? t.searchQuery
                                  ? `Search: ${t.searchQuery}`
                                  : "Search"
                                : t.selectedBook
                                  ? `${t.selectedBook} ${t.chapterNumber}`
                                  : "Select a book"}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(i);
                          }}
                          aria-label={`close-tab-${i}`}
                          sx={{
                            ml: 0.45,
                            p: 0.2,
                            color: "text.secondary",
                            "&:hover": {
                              backgroundColor: "transparent",
                              color: "text.primary",
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    sx={{
                      minHeight: 38,
                      minWidth: "auto",
                      flexShrink: 0,
                      px: 0.9,
                      mr: 0.8,
                      border: "1px solid #D9D3C2",
                      borderBottom: "1px solid #D9D3C2",
                      borderRadius: "8px 8px 0 0",
                      bgcolor: "#F6F1E6",
                      color: "#4E5B53",
                      fontWeight: 500,
                      "&.Mui-selected": {
                        bgcolor: "#FFFCF6",
                        color: "#1F2A24",
                        fontWeight: 700,
                        borderBottomColor: "#FFFCF6",
                      },
                      "&:hover": {
                        bgcolor: "#FBF7EE",
                      },
                    }}
                    {...a11yProps(i)}
                  />
                ))}
                {tabs.length < MAX_TAB_LIMIT && (
                  <Tab
                    component="div"
                    draggable
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggedTabIndex === null) return;
                      moveTab(draggedTabIndex, tabs.length - 1);
                      setDraggedTabIndex(null);
                    }}
                    label={
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontWeight: 700,
                          color: "primary.main",
                        }}
                      >
                        <AddIcon fontSize="small" />
                        New Tab
                      </Box>
                    }
                    sx={{
                      minHeight: 38,
                      minWidth: "auto",
                      flexShrink: 0,
                      px: 1.1,
                      border: "1px solid #D9D3C2",
                      borderRadius: "8px 8px 0 0",
                      bgcolor: "#F8F4EA",
                      ml: 0.2,
                      color: "primary.dark",
                      "&:hover": {
                        bgcolor: "#FCF8EF",
                      },
                    }}
                    {...a11yProps(tabs.length)}
                  />
                )}
              </Tabs>
            </Box>
            {tabs.map((t, i: number) => getCustomTabPanel(i, currentTab, t))}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
