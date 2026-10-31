import '@testing-library/jest-dom';
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveOpen } from '../../components/ActionBar/SaveOpen';
import { renderWithContext } from './testUtils';

describe('SaveOpen', () => {
  it('always renders an Open button', () => {
    renderWithContext(<SaveOpen />);
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
  });

  it('renders "New File" when lastFileSyncDate is undefined', () => {
    renderWithContext(<SaveOpen />, { lastFileSyncDate: undefined });
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('renders "Save" when lastFileSyncDate is set', () => {
    renderWithContext(<SaveOpen />, { lastFileSyncDate: new Date() });
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.queryByText('New File')).not.toBeInTheDocument();
  });

  it('calls loadNotesFromFile when Open is clicked and there are no unsaved changes', async () => {
    const loadNotesFromFile = jest.fn().mockResolvedValue(true);
    const confirmSpy = jest.spyOn(window, 'confirm');
    renderWithContext(<SaveOpen />, { loadNotesFromFile });
    await userEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(loadNotesFromFile).toHaveBeenCalledTimes(1);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('asks to save before opening when there are unsaved changes and saves if confirmed', async () => {
    const saveNotesToFile = jest.fn().mockResolvedValue(true);
    const loadNotesFromFile = jest.fn().mockResolvedValue(true);
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithContext(<SaveOpen />, {
      hasUnsavedChanges: true,
      saveNotesToFile,
      loadNotesFromFile,
    });
    await userEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(saveNotesToFile).toHaveBeenCalledTimes(1);
    expect(loadNotesFromFile).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it('opens without saving when unsaved changes prompt is declined', async () => {
    const saveNotesToFile = jest.fn().mockResolvedValue(true);
    const loadNotesFromFile = jest.fn().mockResolvedValue(true);
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderWithContext(<SaveOpen />, {
      hasUnsavedChanges: true,
      saveNotesToFile,
      loadNotesFromFile,
    });
    await userEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(saveNotesToFile).not.toHaveBeenCalled();
    expect(loadNotesFromFile).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it('still opens even if save is cancelled', async () => {
    const saveNotesToFile = jest.fn().mockResolvedValue(false);
    const loadNotesFromFile = jest.fn().mockResolvedValue(true);
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithContext(<SaveOpen />, {
      hasUnsavedChanges: true,
      saveNotesToFile,
      loadNotesFromFile,
    });
    await userEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(saveNotesToFile).toHaveBeenCalledTimes(1);
    expect(loadNotesFromFile).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it('calls saveNotesToFile when the save/new-file button is clicked', async () => {
    const saveNotesToFile = jest.fn().mockResolvedValue(true);
    renderWithContext(<SaveOpen />, { saveNotesToFile, lastFileSyncDate: new Date() });
    await userEvent.click(screen.getByText('Save'));
    expect(saveNotesToFile).toHaveBeenCalledTimes(1);
  });

  it('shows unsaved-changes badge dot when hasUnsavedChanges is true', () => {
    renderWithContext(<SaveOpen />, { lastFileSyncDate: new Date(), hasUnsavedChanges: true });
    // MUI Badge renders a span with class MuiBadge-badge that is not invisible
    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).not.toHaveClass('MuiBadge-invisible');
  });

  it('hides the badge when hasUnsavedChanges is false', () => {
    renderWithContext(<SaveOpen />, { lastFileSyncDate: new Date(), hasUnsavedChanges: false });
    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toHaveClass('MuiBadge-invisible');
  });
});
