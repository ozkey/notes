import '@testing-library/jest-dom';
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookActions } from '../../components/BiblePanel/BookActions';
import { renderWithContext } from './testUtils';

describe('BookActions', () => {
  it('renders the book autocomplete', () => {
    renderWithContext(<BookActions />);
    expect(screen.getByRole('combobox', { name: /select bible book/i })).toBeInTheDocument();
  });

  it('renders the chapter number input', () => {
    renderWithContext(<BookActions />, {
      tabs: [{ mode: 'bible', selectedBook: 'Genesis', chapterNumber: 3, verseNumber: null, articleId: null }],
    });
    const chapterInput = screen.getByRole('spinbutton', { name: /chapter/i });
    expect(chapterInput).toHaveValue(3);
  });

  it('renders an Open button', () => {
    renderWithContext(<BookActions />);
    // Use getByText to target the text "Open" in the chapter navigation button,
    // distinct from MUI Autocomplete's popup indicator (which uses an icon, not text)
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('calls updateTab with parsed chapter number when Open is clicked', async () => {
    const updateTab = jest.fn();
    renderWithContext(<BookActions />, {
      tabs: [{ mode: 'bible', selectedBook: 'Genesis', chapterNumber: 1, verseNumber: null, articleId: null }],
      updateTab,
    });
    const chapterInput = screen.getByRole('spinbutton', { name: /chapter/i });
    await userEvent.clear(chapterInput);
    await userEvent.type(chapterInput, '5');
    // Click the "Open" text button (not the Autocomplete popup indicator)
    await userEvent.click(screen.getByText('Open'));
    expect(updateTab).toHaveBeenCalledWith(0, { chapterNumber: 5, verseNumber: null });
  });

  it('does not call updateTab with invalid chapter (non-numeric)', async () => {
    const updateTab = jest.fn();
    renderWithContext(<BookActions />, {
      tabs: [{ mode: 'bible', selectedBook: 'Genesis', chapterNumber: 2, verseNumber: null, articleId: null }],
      updateTab,
    });
    const chapterInput = screen.getByRole('spinbutton', { name: /chapter/i });
    await userEvent.clear(chapterInput);
    await userEvent.type(chapterInput, 'abc');
    await userEvent.click(screen.getByText('Open'));
    // Input is invalid — updateTab should not be called with new chapter
    expect(updateTab).not.toHaveBeenCalledWith(0, expect.objectContaining({ chapterNumber: NaN }));
  });

  it('calls updateTab with selected book when a book is chosen via autocomplete', async () => {
    const updateTab = jest.fn();
    renderWithContext(<BookActions />, {
      books: ['Genesis', 'Exodus'],
      tabs: [{ mode: 'bible', selectedBook: null, chapterNumber: 1, verseNumber: null, articleId: null }],
      updateTab,
    });
    const combo = screen.getByRole('combobox', { name: /select bible book/i });
    await userEvent.click(combo);
    await userEvent.type(combo, 'Exo');
    const option = await screen.findByText('Exodus');
    await userEvent.click(option);
    expect(updateTab).toHaveBeenCalledWith(0, { selectedBook: 'Exodus', verseNumber: null });
  });
});
