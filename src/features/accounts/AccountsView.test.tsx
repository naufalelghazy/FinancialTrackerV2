import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AccountsView } from './AccountsView';
import type { Account } from '../../types';

afterEach(cleanup);

function acc(id: string, name: string, sortOrder?: number): Account {
  return { id, name, type: 'bank', balance: 1000, sortOrder };
}

const THREE = [acc('a', 'BCA', 0), acc('b', 'DANA', 1), acc('c', 'GOPAY', 2)];

describe('AccountsView - reordering', () => {
  it('renders accounts in their stored order', () => {
    render(
      <AccountsView
        accounts={[acc('c', 'GOPAY', 2), acc('a', 'BCA', 0), acc('b', 'DANA', 1)]}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
      />,
    );

    const names = screen
      .getAllByLabelText(/^Lihat mutasi rekening /)
      .map((el) => el.textContent);
    expect(names[0]).toContain('BCA');
    expect(names[1]).toContain('DANA');
    expect(names[2]).toContain('GOPAY');
  });

  it('shows a drag handle only when reordering is wired up', () => {
    const { rerender } = render(
      <AccountsView accounts={THREE} onEditAccount={vi.fn()} onAddAccount={vi.fn()} />,
    );
    expect(screen.queryAllByLabelText(/^Geser /)).toHaveLength(0);

    rerender(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
      />,
    );
    expect(screen.getAllByLabelText(/^Geser /)).toHaveLength(3);
  });

  it('no longer shows arrow buttons inside the cards', () => {
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText(/^Naikkan /)).toBeNull();
    expect(screen.queryByLabelText(/^Turunkan /)).toBeNull();
  });

  it('dragging a card downwards reports the new full order', () => {
    const onReorderAccounts = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={onReorderAccounts}
      />,
    );

    // Simulate dropping BCA between DANA and GOPAY by giving the cards
    // measurable boxes; jsdom returns zeros for every rect by default.
    const cards = screen
      .getAllByLabelText(/^Lihat mutasi rekening /)
      .map((el) => el.closest('[data-account-index]') as HTMLElement);
    cards.forEach((el, i) => {
      el.getBoundingClientRect = () =>
        ({ top: i * 100, height: 100, bottom: i * 100 + 100 }) as DOMRect;
    });

    fireEvent.pointerDown(screen.getByLabelText(/^Geser BCA,/), { clientY: 10 });
    // Below the midpoint of GOPAY's slot -> lands at the end.
    fireEvent.pointerMove(window, { clientY: 450 });
    fireEvent.pointerUp(window, { clientY: 450 });

    expect(onReorderAccounts).toHaveBeenCalledWith(['b', 'c', 'a']);
  });

  it('a drag that does not move a card saves nothing', () => {
    const onReorderAccounts = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={onReorderAccounts}
      />,
    );

    fireEvent.pointerDown(screen.getByLabelText(/^Geser BCA,/), { clientY: 10 });
    fireEvent.pointerUp(window, { clientY: 10 });

    expect(onReorderAccounts).not.toHaveBeenCalled();
  });

  it('does not offer reordering for a single account', () => {
    render(
      <AccountsView
        accounts={[acc('a', 'BCA', 0)]}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
      />,
    );

    expect(screen.queryAllByLabelText(/^Geser /)).toHaveLength(0);
  });

  it('hides credit accounts from the list', () => {
    render(
      <AccountsView
        accounts={[...THREE, { ...acc('d', 'KARTU KREDIT'), type: 'credit' }]}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText('Lihat mutasi rekening KARTU KREDIT')).toBeNull();
  });

  it('moves a card with the keyboard from the grip', () => {
    const onReorderAccounts = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={onReorderAccounts}
      />,
    );

    // BCA is first; ArrowDown should swap it with DANA.
    fireEvent.keyDown(screen.getByLabelText(/^Geser BCA,/), { key: 'ArrowDown' });
    expect(onReorderAccounts).toHaveBeenCalledWith(['b', 'a', 'c']);
  });

  it('End sends a card to the bottom, Home to the top', () => {
    const onReorderAccounts = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={onReorderAccounts}
      />,
    );

    fireEvent.keyDown(screen.getByLabelText(/^Geser BCA,/), { key: 'End' });
    expect(onReorderAccounts).toHaveBeenLastCalledWith(['b', 'c', 'a']);

    fireEvent.keyDown(screen.getByLabelText(/^Geser GOPAY,/), { key: 'Home' });
    expect(onReorderAccounts).toHaveBeenLastCalledWith(['c', 'a', 'b']);
  });

  it('the grip is a tab stop and names the current position', () => {
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
      />,
    );

    const grip = screen.getByLabelText(/^Geser DANA,/);
    expect(grip.getAttribute('tabindex')).toBe('0');
    expect(grip.getAttribute('aria-label')).toContain('posisi 2 dari 3');
  });

  it('keeps opening the mutation history on card click', () => {
    const onSelectAccountHistory = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
        onSelectAccountHistory={onSelectAccountHistory}
      />,
    );

    fireEvent.click(screen.getByLabelText('Lihat mutasi rekening DANA'));
    expect(onSelectAccountHistory).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
  });

  it('the edit button does not also open the mutation history', () => {
    const onSelectAccountHistory = vi.fn();
    const onEditAccount = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={onEditAccount}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
        onSelectAccountHistory={onSelectAccountHistory}
      />,
    );

    fireEvent.click(screen.getByLabelText('Ubah Akun DANA'));
    expect(onEditAccount).toHaveBeenCalled();
    expect(onSelectAccountHistory).not.toHaveBeenCalled();
  });

  it('releasing a drag does not navigate to the account history', () => {
    // Regression: dragging ended with a click on the card under the finger,
    // which opened that account's mutation history.
    const onSelectAccountHistory = vi.fn();
    const onReorderAccounts = vi.fn();

    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={onReorderAccounts}
        onSelectAccountHistory={onSelectAccountHistory}
      />,
    );

    const handle = screen.getByLabelText(/^Geser BCA,/);

    fireEvent.pointerDown(handle, { clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(window, { clientY: 900, pointerId: 1 });
    fireEvent.pointerUp(window, { clientY: 900, pointerId: 1 });

    // The release itself lands as a click on the card.
    fireEvent.click(screen.getByLabelText('Lihat mutasi rekening BCA'));

    expect(onSelectAccountHistory).not.toHaveBeenCalled();
  });

  it('opens the history again on the next tap after a drag', () => {
    const onSelectAccountHistory = vi.fn();

    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
        onSelectAccountHistory={onSelectAccountHistory}
      />,
    );

    fireEvent.pointerDown(screen.getByLabelText(/^Geser BCA,/), { clientY: 10 });
    fireEvent.pointerUp(window, { clientY: 10 });

    // The click produced by the drag release is swallowed...
    fireEvent.click(screen.getByLabelText('Lihat mutasi rekening BCA'));
    expect(onSelectAccountHistory).not.toHaveBeenCalled();

    // ...but the guard only survives one click.
    fireEvent.click(screen.getByLabelText('Lihat mutasi rekening BCA'));
    expect(onSelectAccountHistory).toHaveBeenCalledTimes(1);
  });
});
