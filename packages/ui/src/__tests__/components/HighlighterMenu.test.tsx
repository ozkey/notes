import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HighlighterMenu } from '../../components/Highlighter/HighlighterMenu';

const makeAnchor = () => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
};

const cleanupAnchor = (el: HTMLElement) => {
  if (document.body.contains(el)) document.body.removeChild(el);
};

describe('HighlighterMenu', () => {
  it('renders nothing visible when anchorEl is null (menu closed)', () => {
    render(
      <HighlighterMenu
        anchorEl={null}
        onClose={jest.fn()}
        onSelectColor={jest.fn()}
        onRemoveHighlight={jest.fn()}
      />,
    );
    expect(screen.queryByText('Green')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove highlight')).not.toBeInTheDocument();
  });

  it('renders all 5 color options and a remove option when open', () => {
    const anchor = makeAnchor();
    render(
      <HighlighterMenu
        anchorEl={anchor}
        onClose={jest.fn()}
        onSelectColor={jest.fn()}
        onRemoveHighlight={jest.fn()}
      />,
    );
    expect(screen.getByText('Green')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Pink')).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();
    expect(screen.getByText('Purple')).toBeInTheDocument();
    expect(screen.getByText('Remove highlight')).toBeInTheDocument();
    cleanupAnchor(anchor);
  });

  it('calls onSelectColor with the correct color and calls onClose when a color is clicked', async () => {
    const onSelectColor = jest.fn();
    const onClose = jest.fn();
    const anchor = makeAnchor();
    render(
      <HighlighterMenu
        anchorEl={anchor}
        onClose={onClose}
        onSelectColor={onSelectColor}
        onRemoveHighlight={jest.fn()}
      />,
    );
    await userEvent.click(screen.getByText('Blue'));
    expect(onSelectColor).toHaveBeenCalledWith('blue');
    expect(onClose).toHaveBeenCalled();
    cleanupAnchor(anchor);
  });

  it('calls onRemoveHighlight and onClose when remove option is clicked', async () => {
    const onRemoveHighlight = jest.fn();
    const onClose = jest.fn();
    const anchor = makeAnchor();
    render(
      <HighlighterMenu
        anchorEl={anchor}
        onClose={onClose}
        onSelectColor={jest.fn()}
        onRemoveHighlight={onRemoveHighlight}
      />,
    );
    await userEvent.click(screen.getByText('Remove highlight'));
    expect(onRemoveHighlight).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
    cleanupAnchor(anchor);
  });

  it('calls onClose when the menu backdrop is clicked', async () => {
    const onClose = jest.fn();
    const anchor = makeAnchor();
    render(
      <HighlighterMenu
        anchorEl={anchor}
        onClose={onClose}
        onSelectColor={jest.fn()}
        onRemoveHighlight={jest.fn()}
      />,
    );
    // Press Escape to close the menu (standard MUI Menu behavior)
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
    cleanupAnchor(anchor);
  });
});
