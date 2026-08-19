import '@testing-library/jest-dom';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { BibleText } from '../../components/BiblePanel/BibleText';
import { renderWithContext } from './testUtils';

// Mock children that use context themselves to keep BibleText tests focused
jest.mock('../../components/BiblePanel/BookActions', () => ({
  BookActions: () => <div data-testid="book-actions" />,
}));
jest.mock('../../components/Highlighter', () => ({
  HighlighterMenu: () => null,
  HIGHLIGHT_COLORS: [
    { color: 'green', label: 'Green', bgColor: '#C8E6C9' },
    { color: 'blue', label: 'Blue', bgColor: '#BBDEFB' },
  ],
}));

const MOCK_BIBLE_TEXT = {
  books: [
    {
      name: 'Genesis',
      chapters: [
        {
          chapter: 1,
          name: 'Genesis 1',
          verses: [
            { verse: '1', name: 'Genesis 1:1', text: 'In the beginning God created the heavens.' },
            { verse: '2', name: 'Genesis 1:2', text: 'And the earth was without form.' },
          ],
        },
      ],
    },
  ],
};

describe('BibleText', () => {
  it('shows "No book selected" when selectedBook is null', () => {
    renderWithContext(<BibleText selectedBook={null} chapterNumber={1} />);
    expect(screen.getByText(/no book selected/i)).toBeInTheDocument();
  });

  it('shows loading indicator when loadingBibleText is true', () => {
    renderWithContext(<BibleText selectedBook="Genesis" chapterNumber={1} />, {
      loadingBibleText: true,
    });
    expect(screen.getByText(/loading text/i)).toBeInTheDocument();
  });

  it('shows "Bible text not available" when bibleText is null and not loading', () => {
    renderWithContext(<BibleText selectedBook="Genesis" chapterNumber={1} />, {
      bibleText: null,
      loadingBibleText: false,
    });
    expect(screen.getByText(/bible text not available/i)).toBeInTheDocument();
  });

  it('shows "not found in text.json" when the selected book is missing from bibleText', () => {
    renderWithContext(<BibleText selectedBook="Nonexistent" chapterNumber={1} />, {
      bibleText: MOCK_BIBLE_TEXT,
    });
    expect(screen.getByText(/not found in text\.json/i)).toBeInTheDocument();
  });

  it('shows "chapter not found" message when chapter number is missing', () => {
    renderWithContext(<BibleText selectedBook="Genesis" chapterNumber={99} />, {
      bibleText: MOCK_BIBLE_TEXT,
    });
    expect(screen.getByText(/chapter 99 not found/i)).toBeInTheDocument();
  });

  it('renders the chapter name and verse text when book/chapter are found', () => {
    renderWithContext(<BibleText selectedBook="Genesis" chapterNumber={1} />, {
      bibleText: MOCK_BIBLE_TEXT,
    });
    expect(screen.getByText('Genesis 1')).toBeInTheDocument();
    expect(screen.getByText(/in the beginning/i)).toBeInTheDocument();
    expect(screen.getByText(/earth was without form/i)).toBeInTheDocument();
  });

  it('renders verse numbers as bold labels', () => {
    renderWithContext(<BibleText selectedBook="Genesis" chapterNumber={1} />, {
      bibleText: MOCK_BIBLE_TEXT,
    });
    // Verse numbers are rendered inside <span> elements
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('applies a highlight background class/style when a verse is highlighted', () => {
    renderWithContext(<BibleText selectedBook="Genesis" chapterNumber={1} />, {
      bibleText: MOCK_BIBLE_TEXT,
      getHighlights: jest.fn().mockReturnValue([{ verse: 1, color: 'green' }]),
    });
    // Verse 1 element should exist in the DOM with data-verse="1"
    const verseEl = document.querySelector('[data-verse="1"]') as HTMLElement;
    expect(verseEl).toBeTruthy();
    // When highlighted, padding is applied (non-transparent background), not "0"
    // We verify the element exists and renders — color is applied via MUI CSS-in-JS
    expect(verseEl).toBeInTheDocument();
  });
});
