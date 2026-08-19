import {
  Box,
  Card,
  CardContent,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import BibleContext from "../../contexts/BibleContext";
import {
  BOOK_GROUPS,
  buildCrossReferenceBookTokenByAlias,
  crossReferenceHasChapter,
  normalizeBookAlias,
  normalizeReferenceRange,
} from "../utils/BibleUtils";

type CrossReferenceEntry = {
  from: string;
  to: string;
  votes: number;
};

const VOTE_THRESHOLD = 0;

const resolveBookNameFromReferenceToken = (bookToken: string) => {
  const normalizedToken = normalizeBookAlias(bookToken);

  for (const group of BOOK_GROUPS) {
    for (const aliases of group.books) {
      if (
        aliases.some((alias) => normalizeBookAlias(alias) === normalizedToken)
      ) {
        return aliases[0];
      }
    }
  }

  return null;
};

const getReferenceVerseText = (reference: string, bibleText: any) => {
  if (!bibleText?.books) return null;

  const normalizedReference = normalizeReferenceRange(reference);
  const match = normalizedReference.match(/^([^.]+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  const [, bookToken, chapterText, verseText] = match;
  const canonicalBookName =
    resolveBookNameFromReferenceToken(bookToken) ?? bookToken;
  const book = bibleText.books.find(
    (candidate: any) =>
      normalizeBookAlias(candidate.name) ===
      normalizeBookAlias(canonicalBookName),
  );

  if (!book) return null;

  const chapter = book.chapters?.find(
    (candidate: any) => Number(candidate.chapter) === Number(chapterText),
  );
  const verse = chapter?.verses?.find(
    (candidate: any) => Number(candidate.verse) === Number(verseText),
  );

  return verse?.text ?? null;
};

const buildReferenceHash = (reference: string) => {
  const normalizedReference = normalizeReferenceRange(reference);
  const match = normalizedReference.match(/^([^.]+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  const [, bookToken, chapterText, verseText] = match;
  const canonicalBookName =
    resolveBookNameFromReferenceToken(bookToken) ?? bookToken;
  const bookName = canonicalBookName.trim();
  return `#${encodeURIComponent(bookName)}:${chapterText}:${verseText}`;
};

const renderReferenceLink = (reference: string) => {
  const refHash = buildReferenceHash(reference);
  if (!refHash) return reference;

  return (
    <Link
      href={refHash}

      sx={{
        color: "primary.main",
        textDecoration: "underline",
        fontWeight: 500,
      }}
    >
      {reference}
    </Link>
  );
};

export const RefPanel = () => {
  const { tabs, currentTab, bibleText } = useContext(
    BibleContext as React.Context<any>,
  );
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
      .filter(
        (entry) =>
          crossReferenceHasChapter(entry.from, chapterKey) &&
          entry.votes > VOTE_THRESHOLD,
      )
      .sort((a, b) => b.votes - a.votes);
  }, [chapterKey, crossReferenceEntries]);

  const linkedToChapter = useMemo(() => {
    if (!chapterKey) return [];
    return crossReferenceEntries
      .filter(
        (entry) =>
          crossReferenceHasChapter(entry.to, chapterKey) &&
          entry.votes > VOTE_THRESHOLD,
      )
      .sort((a, b) => b.votes - a.votes);
  }, [chapterKey, crossReferenceEntries]);

  const getReferenceSecondaryText = (reference: string, votes: number) => {
    const verseText = getReferenceVerseText(reference, bibleText);
    if (!verseText) return `v: ${votes}`;

    const trimmedText =
      verseText.length > 120 ? `${verseText.slice(0, 117)}...` : verseText;
    return `${trimmedText} — v: ${votes}`;
  };

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
                      <ListItem key={`${entry.from}-${entry.to}-${index}`}>
                        <ListItemText
                          primary={
                            <>
                              {renderReferenceLink(entry.from)} {" => "}{" "}
                              {renderReferenceLink(entry.to)}
                            </>
                          }
                          secondary={getReferenceSecondaryText(
                            entry.to,
                            entry.votes,
                          )}
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
                          primary={
                            <>
                              {renderReferenceLink(entry.from)} {" => "}{" "}
                              {renderReferenceLink(entry.to)}
                            </>
                          }
                          secondary={getReferenceSecondaryText(
                            entry.from,
                            entry.votes,
                          )}
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
