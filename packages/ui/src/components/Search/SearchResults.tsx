import React, { useContext, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Link as MuiLink,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import BibleContext from "../../contexts/BibleContext";
import { searchBibleText, highlightKeyword } from "./SearchUtils";

interface SearchResultsProps {
  searchQuery: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
}) => {
  const { bibleText, loadingBibleText, openSearchInCurrentTab } =
    useContext(BibleContext);
  const [refinedSearch, setRefinedSearch] = useState<string>(searchQuery);

  const results = useMemo(() => {
    if (!bibleText || !searchQuery) return [];
    return searchBibleText(bibleText, searchQuery);
  }, [bibleText, searchQuery]);

  const handleRefineSearch = () => {
    const query = refinedSearch;
    if (query.length > 0) {
      openSearchInCurrentTab(query);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRefineSearch();
    }
  };

  if (loadingBibleText) {
    return (
      <Card sx={{ padding: "0px", margin: "0px" }}>
        <CardContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: "0px", margin: "0px" }}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: "Georgia, Garamond, serif",
                color: "primary.dark",
              }}
            >
              Search Results for "{searchQuery}"
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.5 }}
            >
              <TextField
                size="small"
                label="Refine search"
                value={refinedSearch}
                onChange={(e) => setRefinedSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Enter new keyword..."
                sx={{ minWidth: 260 }}
              />
              <Button variant="contained" onClick={handleRefineSearch}>
                Search
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Found {results.length} verse{results.length !== 1 ? "s" : ""}
          </Typography>

          {results.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No verses found containing "{searchQuery}"
            </Typography>
          ) : (
            <List
              dense
              sx={{
                fontFamily: "Georgia, Garamond, serif",
                lineHeight: 1.8,
              }}
            >
              {results.map((result, index) => {
                const bookLink = `#${result.book}:${result.chapter}:${result.verse}`;
                const highlightedParts = highlightKeyword(
                  result.text,
                  searchQuery,
                );

                return (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: "1px solid #e0e0e0",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <MuiLink
                        href={bookLink}
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                          mb: 0.5,
                          display: "block",
                        }}
                      >
                        {result.book} {result.chapter}:{result.verse}
                      </MuiLink>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Georgia, Garamond, serif",
                          color: "text.primary",
                          lineHeight: 1.6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            marginRight: "0.3em",
                            color: "#8B6F47",
                          }}
                        >
                          {result.verse}
                        </span>
                        {highlightedParts.map((part) =>
                          part.type === "highlight" ? (
                            <mark
                              key={part.key}
                              style={{
                                backgroundColor: "#ffeb3b",
                                fontWeight: "bold",
                              }}
                            >
                              {part.content}
                            </mark>
                          ) : (
                            <span key={part.key}>{part.content}</span>
                          ),
                        )}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
