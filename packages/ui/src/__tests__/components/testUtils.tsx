import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BibleContext, BibleContextType } from '../../contexts/BibleContext';
import { BIBLE_TRANSLATIONS } from '../../contexts/bibleTextLoader';

export const DEFAULT_MOCK_TABS = [
  { mode: 'home' as const, selectedBook: null, chapterNumber: 1, verseNumber: null, articleId: null },
];

export const createMockContextValue = (
  overrides: Partial<BibleContextType> = {},
): BibleContextType => ({
  tabs: DEFAULT_MOCK_TABS,
  currentTab: 0,
  setCurrentTab: jest.fn(),
  addTab: jest.fn(),
  closeTab: jest.fn(),
  updateTab: jest.fn(),
  books: ['Genesis', 'Exodus', 'Matthew', 'Revelation'],
  notes: [],
  articles: [],
  refreshNotesDate: undefined,
  setRefreshNotesDate: jest.fn(),
  bibleText: null,
  loadingBibleText: false,
  loadBibleText: jest.fn().mockResolvedValue(undefined),
  bibleTranslations: BIBLE_TRANSLATIONS,
  selectedBibleTranslation: 'cpdv',
  setSelectedBibleTranslation: jest.fn(),
  setNoteForBookChapter: jest.fn(),
  setArticleById: jest.fn(),
  replaceAllNotes: jest.fn(),
  replaceAllArticles: jest.fn(),
  openHomeInCurrentTab: jest.fn(),
  openBibleInCurrentTab: jest.fn(),
  openArticleInCurrentTab: jest.fn(),
  saveNotesToFile: jest.fn().mockResolvedValue(undefined),
  loadNotesFromFile: jest.fn().mockResolvedValue(undefined),
  editorOpen: false,
  setEditorOpen: jest.fn(),
  setHighlight: jest.fn(),
  removeHighlight: jest.fn(),
  getHighlights: jest.fn().mockReturnValue([]),
  ...overrides,
});

export const renderWithContext = (
  ui: React.ReactElement,
  contextOverrides: Partial<BibleContextType> = {},
  renderOptions?: RenderOptions,
): RenderResult => {
  const value = createMockContextValue(contextOverrides);
  return render(
    <BibleContext.Provider value={value}>{ui}</BibleContext.Provider>,
    renderOptions,
  );
};
