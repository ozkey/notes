import "@testing-library/jest-dom";
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeTab } from "../../components/Tabs/HomeTab";
import { renderWithContext } from "./testUtils";

describe("HomeTab", () => {
  it("renders an optional verse input", () => {
    renderWithContext(<HomeTab />, { lastFileSyncDate: new Date() });
    expect(
      screen.getByRole("spinbutton", { name: /verse \(optional\)/i }),
    ).toBeInTheDocument();
  });

  it("opens a chapter and verse when verse is provided", async () => {
    const openBibleInNewTab = jest.fn();
    renderWithContext(<HomeTab />, {
      lastFileSyncDate: new Date(),
      openBibleInNewTab,
      books: ["Genesis", "Exodus"],
      tabs: [
        {
          id: "tab-1",
          mode: "home",
          selectedBook: "Genesis",
          chapterNumber: 1,
          verseNumber: null,
          articleId: null,
          searchQuery: null,
        },
      ],
    });

    const chapterInput = screen.getByRole("spinbutton", { name: /chapter/i });
    const verseInput = screen.getByRole("spinbutton", { name: /verse \(optional\)/i });
    await userEvent.clear(chapterInput);
    await userEvent.type(chapterInput, "3");
    await userEvent.clear(verseInput);
    await userEvent.type(verseInput, "16");
    await userEvent.click(screen.getByText("Open"));

    expect(openBibleInNewTab).toHaveBeenCalledWith("Genesis", 3, 16);
  });

  it("opens chapter-only when verse is empty", async () => {
    const openBibleInNewTab = jest.fn();
    renderWithContext(<HomeTab />, {
      lastFileSyncDate: new Date(),
      openBibleInNewTab,
      books: ["Genesis", "Exodus"],
      tabs: [
        {
          id: "tab-1",
          mode: "home",
          selectedBook: "Genesis",
          chapterNumber: 2,
          verseNumber: null,
          articleId: null,
          searchQuery: null,
        },
      ],
    });

    const chapterInput = screen.getByRole("spinbutton", { name: /chapter/i });
    const verseInput = screen.getByRole("spinbutton", { name: /verse \(optional\)/i });
    await userEvent.clear(chapterInput);
    await userEvent.type(chapterInput, "4");
    await userEvent.clear(verseInput);
    await userEvent.click(screen.getByText("Open"));

    expect(openBibleInNewTab).toHaveBeenCalledWith("Genesis", 4, null);
  });
});
