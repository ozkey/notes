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
  extractCrossReferenceChapterKeys,
  normalizeBookAlias,
  normalizeReferenceRange,
} from "../utils/BibleUtils";
import {
  CrossReferenceEntry,
  fetchCrossReferences,
} from "../../contexts/crossReferenceLoader";

const VOTE_THRESHOLD = 0;

const REFERENCE_BOOK_NAME_BY_TOKEN = (() => {
  const lookup = new Map<string, string>();

  for (const group of BOOK_GROUPS) {
    for (const aliases of group.books) {
      for (const alias of aliases) {
        lookup.set(normalizeBookAlias(alias), aliases[0]);
      }
    }
  }

  return lookup;
})();

const resolveBookNameFromReferenceToken = (bookToken: string) => {
  return REFERENCE_BOOK_NAME_BY_TOKEN.get(normalizeBookAlias(bookToken)) ?? null;
};

const buildBibleVerseLookup = (bibleText: any) => {
  if (!bibleText?.books) return null;

  const lookup = new Map<string, string>();
  for (const book of bibleText.books) {
    const normalizedBookName = normalizeBookAlias(book.name);

    for (const chapter of book.chapters ?? []) {
      for (const verse of chapter.verses ?? []) {
        lookup.set(
          `${normalizedBookName}.${Number(chapter.chapter)}.${Number(verse.verse)}`,
          verse.text,
        );
      }
    }
  }

  return lookup;
};

const getReferenceVerseText = (
  reference: string,
  bibleVerseLookup: Map<string, string> | null,
) => {
  if (!bibleVerseLookup) return null;

  const normalizedReference = normalizeReferenceRange(reference);
  const match = normalizedReference.match(/^([^.]+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  const [, bookToken, chapterText, verseText] = match;
  const canonicalBookName =
    resolveBookNameFromReferenceToken(bookToken) ?? bookToken;
  const verseKey = `${normalizeBookAlias(canonicalBookName)}.${Number(
    chapterText,
  )}.${Number(verseText)}`;

  return bibleVerseLookup.get(verseKey) ?? null;
};

const buildChapterReferenceIndex = (entries: CrossReferenceEntry[]) => {
  const linkedFrom = new Map<string, CrossReferenceEntry[]>();
  const linkedTo = new Map<string, CrossReferenceEntry[]>();

  for (const entry of entries) {
    if (entry.votes <= VOTE_THRESHOLD) continue;

    for (const chapterKey of extractCrossReferenceChapterKeys(entry.from)) {
      const existingEntries = linkedFrom.get(chapterKey);
      if (existingEntries) {
        existingEntries.push(entry);
      } else {
        linkedFrom.set(chapterKey, [entry]);
      }
    }

    for (const chapterKey of extractCrossReferenceChapterKeys(entry.to)) {
      const existingEntries = linkedTo.get(chapterKey);
      if (existingEntries) {
        existingEntries.push(entry);
      } else {
        linkedTo.set(chapterKey, [entry]);
      }
    }
  }

  const sortByVotes = (left: CrossReferenceEntry, right: CrossReferenceEntry) =>
    right.votes - left.votes;

  for (const entriesForChapter of linkedFrom.values()) {
    entriesForChapter.sort(sortByVotes);
  }

  for (const entriesForChapter of linkedTo.values()) {
    entriesForChapter.sort(sortByVotes);
  }

  return { linkedFrom, linkedTo };
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
  const [loadingReferences, setLoadingReferences] = useState(
   () => tabs[currentTab]?.mode === "bible",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const currentTabState = tabs[currentTab] ?? {
   mode: "home",
    selectedBook: null,
    chapterNumber: 1,
  };

  const selectedBook = currentTabState.selectedBook as string | null;
  const chapterNumber = currentTabState.chapterNumber as number;

  useEffect(() => {
    if (currentTabState.mode !== "bible") {
      setLoadingReferences(false);
      setLoadError(null);
      return;
    }

    let mounted = true;
    setLoadingReferences(true);
    fetchCrossReferences()
      .then((entries) => {
        if (!mounted) return;
        setCrossReferenceEntries(entries);
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
  }, [currentTabState.mode]);

  const bookTokenByAlias = useMemo(
    () => buildCrossReferenceBookTokenByAlias(crossReferenceEntries),
    [crossReferenceEntries],
  );

  const referenceIndex = useMemo(
    () => buildChapterReferenceIndex(crossReferenceEntries),
    [crossReferenceEntries],
  );

  const bibleVerseLookup = useMemo(
    () => buildBibleVerseLookup(bibleText),
    [bibleText],
  );

  const chapterKey = useMemo(() => {
    if (currentTabState.mode !== "bible" || !selectedBook) return null;
    const token = bookTokenByAlias.get(normalizeBookAlias(selectedBook));
    if (!token) return null;
    return `${token}.${chapterNumber}`;
  }, [bookTokenByAlias, chapterNumber, currentTabState.mode, selectedBook]);

  const linkedFromChapter = useMemo(() => {
    if (!chapterKey) return [];
    return referenceIndex.linkedFrom.get(chapterKey) ?? [];
  }, [chapterKey, referenceIndex]);

  const linkedToChapter = useMemo(() => {
    if (!chapterKey) return [];
    return referenceIndex.linkedTo.get(chapterKey) ?? [];
  }, [chapterKey, referenceIndex]);

  const getReferenceSecondaryText = (reference: string, votes: number) => {
    const verseText = getReferenceVerseText(reference, bibleVerseLookup);
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
