import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainTab } from "../../components/MainTab/MainTab";
import { renderWithContext } from "./testUtils";

// Mock complex child components to focus on tab management logic
jest.mock("../../components/Tabs/HomeTab", () => ({
  HomeTab: () => <div data-testid="home-tab-content" />,
}));
jest.mock("../../components/MainTab/MainTabBox", () => ({
  MainTabBox: () => <div data-testid="main-tab-box" />,
}));

describe("MainTab", () => {
  const homeTabs = [
    {
      id: "tab-1",
      mode: "home" as const,
      selectedBook: null,
      chapterNumber: 1,
      verseNumber: null,
      articleId: null,
    },
  ];

  it("renders a tab for each entry in tabs", () => {
    renderWithContext(<MainTab />, { tabs: homeTabs });
    expect(screen.getByRole("tab", { name: /home/i })).toBeInTheDocument();
  });

  it('shows "Home" label for home-mode tabs', () => {
    renderWithContext(<MainTab />, { tabs: homeTabs });
    expect(screen.getByRole("tab", { name: /home/i })).toBeInTheDocument();
  });

  it("shows book and chapter as label for bible-mode tabs", () => {
    const bibleTabs = [
      {
        id: "tab-2",
        mode: "bible" as const,
        selectedBook: "Genesis",
        chapterNumber: 2,
        verseNumber: null,
        articleId: null,
      },
    ];
    renderWithContext(<MainTab />, { tabs: bibleTabs, currentTab: 0 });
    expect(screen.getByText("Genesis 2")).toBeInTheDocument();
  });

  it('shows "Select a book" when bible tab has no selected book', () => {
    const bibleTabs = [
      {
        id: "tab-3",
        mode: "bible" as const,
        selectedBook: null,
        chapterNumber: 1,
        verseNumber: null,
        articleId: null,
      },
    ];
    renderWithContext(<MainTab />, { tabs: bibleTabs });
    expect(screen.getByText("Select a book")).toBeInTheDocument();
  });

  it("shows article id as label for article-mode tabs", () => {
    const articleTabs = [
      {
        id: "tab-4",
        mode: "article" as const,
        selectedBook: null,
        chapterNumber: 1,
        verseNumber: null,
        articleId: "#my-topic",
      },
    ];
    renderWithContext(<MainTab />, { tabs: articleTabs });
    expect(screen.getByText("#my-topic")).toBeInTheDocument();
  });

  it("does not render a New Tab button", () => {
    renderWithContext(<MainTab />, { tabs: homeTabs });
    expect(screen.queryByText("New Tab")).not.toBeInTheDocument();
  });

  it("does not render a close button for the first Home tab", () => {
    renderWithContext(<MainTab />, { tabs: homeTabs });
    expect(
      screen.queryByRole("button", { name: /close-tab-0/i }),
    ).not.toBeInTheDocument();
  });

  it("calls closeTab with the correct index for non-home tabs", async () => {
    const closeTab = jest.fn();
    const tabs = [
      {
        id: "tab-1",
        mode: "home" as const,
        selectedBook: null,
        chapterNumber: 1,
        verseNumber: null,
        articleId: null,
      },
      {
        id: "tab-2",
        mode: "bible" as const,
        selectedBook: "Genesis",
        chapterNumber: 2,
        verseNumber: null,
        articleId: null,
      },
    ];
    renderWithContext(<MainTab />, { tabs, closeTab, currentTab: 1 });
    const closeButton = screen.getByRole("button", { name: /close-tab-1/i });
    await userEvent.click(closeButton);
    expect(closeTab).toHaveBeenCalledWith(1);
  });

  it("renders the active tab panel content", () => {
    renderWithContext(<MainTab />, { tabs: homeTabs, currentTab: 0 });
    expect(screen.getByTestId("home-tab-content")).toBeInTheDocument();
  });

  it("reorders tabs when a tab is dropped onto another tab", () => {
    const moveTab = jest.fn();
    const tabs = [
      {
        id: "tab-a",
        mode: "home" as const,
        selectedBook: null,
        chapterNumber: 1,
        verseNumber: null,
        articleId: null,
      },
      {
        id: "tab-b",
        mode: "bible" as const,
        selectedBook: "Genesis",
        chapterNumber: 2,
        verseNumber: null,
        articleId: null,
      },
    ];
    renderWithContext(<MainTab />, { tabs, moveTab });

    const sourceTab = screen
      .getByText("Genesis 2")
      .closest('[role="tab"]') as HTMLElement;
    const targetTab = screen
      .getByText("Home")
      .closest('[role="tab"]') as HTMLElement;
    fireEvent.dragStart(sourceTab);
    fireEvent.dragOver(targetTab);
    fireEvent.drop(targetTab);

    expect(moveTab).not.toHaveBeenCalled();
  });

  it("reorders non-home tabs when dragged between non-home slots", () => {
    const moveTab = jest.fn();
    const tabs = [
      {
        id: "tab-a",
        mode: "home" as const,
        selectedBook: null,
        chapterNumber: 1,
        verseNumber: null,
        articleId: null,
      },
      {
        id: "tab-b",
        mode: "bible" as const,
        selectedBook: "Genesis",
        chapterNumber: 2,
        verseNumber: null,
        articleId: null,
      },
      {
        id: "tab-c",
        mode: "bible" as const,
        selectedBook: "Exodus",
        chapterNumber: 3,
        verseNumber: null,
        articleId: null,
      },
    ];
    renderWithContext(<MainTab />, { tabs, moveTab });

    const sourceTab = screen
      .getByText("Genesis 2")
      .closest('[role="tab"]') as HTMLElement;
    const targetTab = screen
      .getByText("Exodus 3")
      .closest('[role="tab"]') as HTMLElement;
    fireEvent.dragStart(sourceTab);
    fireEvent.dragOver(targetTab);
    fireEvent.drop(targetTab);

    expect(moveTab).toHaveBeenCalledWith(1, 2);
  });
});
