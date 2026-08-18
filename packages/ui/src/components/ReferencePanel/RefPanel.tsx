import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import BibleContext from "../../contexts/BibleContext";
import {
  buildCrossReferenceBookTokenByAlias,
  crossReferenceHasChapter,
  normalizeBookAlias,
} from "../utils/BibleUtils";

type CrossReferenceEntry = {
  from: string;
  to: string;
  votes: number;
};

export const RefPanel = () => {
  const { tabs, currentTab } = useContext(BibleContext as React.Context<any>);
  const [crossReferenceEntries, setCrossReferenceEntries] = useState<
    CrossReferenceEntry[]
  >([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const currentTabState = tabs[currentTab] ?? {
    mode: "home",
    selectedBook: null,
    chapterNumber: 1,
  };

  useEffect(() => {
    let mounted = true;
    import("./data/cross_references.json")
      .then((module) => {
        if (!mounted) return;
        setCrossReferenceEntries(module.default as CrossReferenceEntry[]);
        setLoadError(null);
      })
      .catch((error) => {
        console.warn("Unable to load cross references", error);
        if (!mounted) return;
        setLoadError("Unable to load cross references.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingReferences(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedBook = currentTabState.selectedBook as string | null;
  const chapterNumber = currentTabState.chapterNumber as number;
  const bookTokenByAlias = useMemo(
    () => buildCrossReferenceBookTokenByAlias(crossReferenceEntries),
    [crossReferenceEntries],
  );

  const chapterKey = useMemo(() => {
    if (currentTabState.mode !== "bible" || !selectedBook) return null;
    const token = bookTokenByAlias.get(normalizeBookAlias(selectedBook));
    if (!token) return null;
    return `${token}.${chapterNumber}`;
  }, [bookTokenByAlias, chapterNumber, currentTabState.mode, selectedBook]);

  const linkedFromChapter = useMemo(() => {
    if (!chapterKey) return [];
    return crossReferenceEntries
      .filter((entry) => crossReferenceHasChapter(entry.from, chapterKey))
      .sort((a, b) => b.votes - a.votes);
  }, [chapterKey, crossReferenceEntries]);

  const linkedToChapter = useMemo(() => {
    if (!chapterKey) return [];
    return crossReferenceEntries
      .filter((entry) => crossReferenceHasChapter(entry.to, chapterKey))
      .sort((a, b) => b.votes - a.votes);
  }, [chapterKey, crossReferenceEntries]);

  return (
    <Card>
      <CardContent>
        <h2>Cross References</h2>
        {loadingReferences && <p>Loading cross references...</p>}
        {loadError && <p>{loadError}</p>}
        {!loadingReferences && !loadError && !chapterKey && (
          <p>Open a Bible chapter to view incoming and outgoing references.</p>
        )}

        {chapterKey && !loadingReferences && !loadError && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <h3>
                  Linked from {selectedBook} {chapterNumber}
                </h3>
                {linkedFromChapter.length === 0 && <p>No references found.</p>}
                {linkedFromChapter.length > 0 && (
                  <List dense>
                    {linkedFromChapter.map((entry, index) => (
                      <ListItem
                        key={`${entry.from}-${entry.to}-${index}`}
                        disableGutters
                      >
                        <ListItemText
                          primary={entry.to}
                          secondary={`From ${entry.from} - votes: ${entry.votes}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <h3>
                  Linking to {selectedBook} {chapterNumber}
                </h3>
                {linkedToChapter.length === 0 && <p>No references found.</p>}
                {linkedToChapter.length > 0 && (
                  <List dense>
                    {linkedToChapter.map((entry, index) => (
                      <ListItem
                        key={`${entry.from}-${entry.to}-${index}`}
                        disableGutters
                      >
                        <ListItemText
                          primary={entry.from}
                          secondary={`To ${entry.to} - votes: ${entry.votes}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
