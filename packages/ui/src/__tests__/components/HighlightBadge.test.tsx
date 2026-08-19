import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HighlightBadge } from '../../components/Highlighter/HighlightBadge';
import { HighlightColor } from '../../contexts/BibleTypes';

describe('HighlightBadge', () => {
  describe('editable mode (default)', () => {
    it('renders a chip with "Verse N" label', () => {
      render(<HighlightBadge verseNumber={5} color="green" />);
      expect(screen.getByText('Verse 5')).toBeInTheDocument();
    });

    it('renders without onDelete when not provided', () => {
      render(<HighlightBadge verseNumber={2} color="blue" />);
      expect(screen.getByText('Verse 2')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows a delete button when onDelete is provided', () => {
      const onDelete = jest.fn();
      render(<HighlightBadge verseNumber={3} color="pink" onDelete={onDelete} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls onDelete when the chip delete icon is clicked', () => {
      const onDelete = jest.fn();
      const { container } = render(
        <HighlightBadge verseNumber={4} color="orange" onDelete={onDelete} />,
      );
      // Target the MUI Chip delete icon element directly
      const deleteIcon = container.querySelector('.MuiChip-deleteIcon') as HTMLElement;
      expect(deleteIcon).toBeTruthy();
      fireEvent.click(deleteIcon);
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('non-editable mode', () => {
    it('renders only the verse number (no "Verse" prefix)', () => {
      render(<HighlightBadge verseNumber={7} color="purple" editable={false} />);
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.queryByText('Verse 7')).not.toBeInTheDocument();
    });

    it('does not render a chip delete button', () => {
      render(
        <HighlightBadge verseNumber={8} color="blue" editable={false} onDelete={jest.fn()} />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('color mapping', () => {
    const colors: HighlightColor[] = ['green', 'blue', 'pink', 'red', 'orange', 'purple'];

    it.each(colors)('renders non-editable badge for color "%s" without errors', (color) => {
      const { container } = render(
        <HighlightBadge verseNumber={1} color={color} editable={false} />,
      );
      // Badge renders as a Box — first child should be in the DOM
      expect(container.firstChild).toBeInTheDocument();
      // The verse number should be visible
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it.each(colors)('renders editable chip for color "%s" without errors', (color) => {
      render(<HighlightBadge verseNumber={2} color={color} editable />);
      expect(screen.getByText('Verse 2')).toBeInTheDocument();
    });
  });
});
