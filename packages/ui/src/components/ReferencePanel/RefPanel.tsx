import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { BibleReferenceContext } from "../../contexts/BibleContext";
import {
  BOOK_GROUPS,
  buildCrossReferenceBookTokenByAlias,
  formatReferenceDisplay,
  normalizeBookAlias,
  normalizeReferenceRange,
} from "../utils/BibleUtils";
import {
  CrossReferenceBookMap,
  fetchCrossReferenceBookTokens,
  fetchCrossReferencesFrom,
  fetchCrossReferencesTo,
  getChapterVerseLinks,
} from "../../contexts/crossReferenceLoader";

/** A single resolved cross reference pair, ready for display. */
export interface CrossReferenceEntry {
  from: string;
  to: string;
  score: number;
}

export const getAverageVoteThreshold = (
  linkedFromChapter: CrossReferenceEntry[] = [],
  linkedToChapter: CrossReferenceEntry[] = [],
) => {
  const relevantEntries = [...linkedFromChapter, ...linkedToChapter];
  const validScores = relevantEntries
    .map((entry) => entry.score)
    .filter((score) => Number.isFinite(score) && score >= 0);

  if (validScores.length === 0) return 0;

  return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
};

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
  return (
    REFERENCE_BOOK_NAME_BY_TOKEN.get(normalizeBookAlias(bookToken)) ?? null
  );
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

/**
 * Reads the links for a single chapter directly out of the nested
 * book/chapter/verse map (no scanning of the full dataset) and resolves them
 * into display-ready `{ from, to, score }` pairs.
 *
 * `direction` indicates which side of the pair the current chapter occupies:
 * - "from": `data` is `cross_references_from.json`, so the chapter is the
 *   source and each link's `to` is the referenced verse.
 * - "to": `data` is `cross_references_to.json`, so the chapter is the target
 *   and each link's `to` field actually holds the referencing ("from") verse.
 */
const buildChapterEntries = (
  data: CrossReferenceBookMap | null,
  bookToken: string | null,
  chapterNumber: number,
  direction: "from" | "to",
): CrossReferenceEntry[] => {
  if (!data || !bookToken) return [];

  const verseLinks = getChapterVerseLinks(data, bookToken, chapterNumber);
  const entries: CrossReferenceEntry[] = [];

  for (const [verse, links] of Object.entries(verseLinks)) {
    const chapterReference = `${bookToken}.${chapterNumber}.${verse}`;
    for (const link of links) {
      entries.push(
        direction === "from"
          ? { from: chapterReference, to: link.to, score: link.score }
          : { from: link.to, to: chapterReference, score: link.score },
      );
    }
  }

  return entries.sort((left, right) => right.score - left.score);
};

const filterByVoteThreshold = (
  entries: CrossReferenceEntry[],
  ignoreVoteThreshold: boolean,
  voteThreshold: number,
) =>
  ignoreVoteThreshold
    ? entries
    : entries.filter((entry) => entry.score > voteThreshold);

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
      {formatReferenceDisplay(reference)}
    </Link>
  );
};

export const RefPanel = React.memo(() => {
  const { tabs, currentTab, bibleText } = useContext(
    BibleReferenceContext as React.Context<any>,
  );
  const [crossReferencesFrom, setCrossReferencesFrom] =
    useState<CrossReferenceBookMap | null>(null);
  const [crossReferencesTo, setCrossReferencesTo] =
    useState<CrossReferenceBookMap | null>(null);
  const [bookTokens, setBookTokens] = useState<string[]>([]);
  const [ignoreVoteThreshold, setIgnoreVoteThreshold] = useState(false);
  const [loadingReferences, setLoadingReferences] = useState(
    () => tabs[currentTab]?.mode === "bible",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const currentTabState = useMemo(
    () =>
      tabs[currentTab] ?? {
        mode: "home",
        selectedBook: null,
        chapterNumber: 1,
      },
    [currentTab, tabs],
  );

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
    Promise.all([
      fetchCrossReferencesFrom(),
      fetchCrossReferencesTo(),
      fetchCrossReferenceBookTokens(),
    ])
      .then(([fromData, toData, tokens]) => {
        if (!mounted) return;
        setCrossReferencesFrom(fromData);
        setCrossReferencesTo(toData);
        setBookTokens(tokens);
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
    () => buildCrossReferenceBookTokenByAlias(bookTokens),
    [bookTokens],
  );

  const bibleVerseLookup = useMemo(
    () => buildBibleVerseLookup(bibleText),
    [bibleText],
  );

  const chapterToken = useMemo(() => {
    if (currentTabState.mode !== "bible" || !selectedBook) return null;
    return bookTokenByAlias.get(normalizeBookAlias(selectedBook)) ?? null;
  }, [bookTokenByAlias, currentTabState.mode, selectedBook]);

  const chapterKey = chapterToken ? `${chapterToken}.${chapterNumber}` : null;

  const linkedFromChapter = useMemo(
    () => buildChapterEntries(crossReferencesFrom, chapterToken, chapterNumber, "from"),
    [crossReferencesFrom, chapterToken, chapterNumber],
  );

  const linkedToChapter = useMemo(
    () => buildChapterEntries(crossReferencesTo, chapterToken, chapterNumber, "to"),
    [crossReferencesTo, chapterToken, chapterNumber],
  );

  const voteThreshold = useMemo(
    () => getAverageVoteThreshold(linkedFromChapter, linkedToChapter),
    [linkedFromChapter, linkedToChapter],
  );

  const filteredLinkedFromChapter = useMemo(
    () => filterByVoteThreshold(linkedFromChapter, ignoreVoteThreshold, voteThreshold),
    [linkedFromChapter, ignoreVoteThreshold, voteThreshold],
  );

  const filteredLinkedToChapter = useMemo(
    () => filterByVoteThreshold(linkedToChapter, ignoreVoteThreshold, voteThreshold),
    [linkedToChapter, ignoreVoteThreshold, voteThreshold],
  );

  const getReferenceSecondaryText = (reference: string, votes: number) => {
    const verseText = getReferenceVerseText(reference, bibleVerseLookup);
    if (!verseText) return `v: ${votes}`;

    const trimmedText =
      verseText.length > 120 ? `${verseText.slice(0, 117)}...` : verseText;
    return `${trimmedText} — v: ${votes}`;
  };

  const toggleVoteThresholdLabel = ignoreVoteThreshold
    ? "show relevant only"
    : "show all";

  return (
    <Card>
      <CardContent>
        <h2>Cross References</h2>
        {loadingReferences && <p>Loading cross references...</p>}
        {loadError && <p>{loadError}</p>}
        {!loadingReferences && !loadError && !chapterKey && (
          <p>No references found</p>
        )}

        {chapterKey && !loadingReferences && !loadError && (
          <>
             <Box
               sx={{
                 display: "grid",
                 gridTemplateColumns: {
                   xs: "minmax(0, 1fr)",
                   sm: "repeat(2, minmax(0, 1fr))",
                 },
                 gap: 2,
                 alignItems: "stretch",
               }}
             >
              <Card variant="outlined">
                <CardContent>
                  <h4>
                    Linked from {selectedBook} {chapterNumber}
                  </h4>
                  {filteredLinkedFromChapter.length === 0 && (
                    <p>No references found.</p>
                  )}
                  {filteredLinkedFromChapter.length > 0 && (
                    <List dense>
                      {filteredLinkedFromChapter.map((entry, index) => (
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
                              entry.score,
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
                  <h4>
                    Linking to {selectedBook} {chapterNumber}
                  </h4>
                  {filteredLinkedToChapter.length === 0 && (
                    <p>No references found.</p>
                  )}
                  {filteredLinkedToChapter.length > 0 && (
                    <List dense>
                      {filteredLinkedToChapter.map((entry, index) => (
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
                              entry.score,
                            )}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="text"
                size="small"
                onClick={() => setIgnoreVoteThreshold((current) => !current)}
              >
                {toggleVoteThresholdLabel}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
});

RefPanel.displayName = "RefPanel";
