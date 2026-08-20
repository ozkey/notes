import '@testing-library/jest-dom';
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveOpen } from '../../components/ActionBar/SaveOpen';
import { renderWithContext } from './testUtils';

describe('SaveOpen', () => {
  it('always renders a Load button', () => {
    renderWithContext(<SaveOpen />);
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
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

  it('calls loadNotesFromFile when Load is clicked', async () => {
    const loadNotesFromFile = jest.fn().mockResolvedValue(undefined);
    renderWithContext(<SaveOpen />, { loadNotesFromFile });
    await userEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(loadNotesFromFile).toHaveBeenCalledTimes(1);
  });

  it('calls saveNotesToFile when the save/new-file button is clicked', async () => {
    const saveNotesToFile = jest.fn().mockResolvedValue(undefined);
    renderWithContext(<SaveOpen />, { saveNotesToFile, lastFileSyncDate: new Date() });
    await userEvent.click(screen.getByText('Save'));
    expect(saveNotesToFile).toHaveBeenCalledTimes(1);
  });
});
