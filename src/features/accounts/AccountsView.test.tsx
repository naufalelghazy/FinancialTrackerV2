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

  it('the arrow buttons report the new full order', () => {
    const onReorderAccounts = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={onReorderAccounts}
      />,
    );

    // Move DANA up: BCA, DANA, GOPAY -> DANA, BCA, GOPAY
    fireEvent.click(screen.getByLabelText('Naikkan DANA'));
    expect(onReorderAccounts).toHaveBeenCalledWith(['b', 'a', 'c']);
  });

  it('the last card cannot be moved down, the first cannot be moved up', () => {
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={vi.fn()}
      />,
    );

    expect((screen.getByLabelText('Naikkan BCA') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('Turunkan GOPAY') as HTMLButtonElement).disabled).toBe(true);
  });

  it('moves a card to the end', () => {
    const onReorderAccounts = vi.fn();
    render(
      <AccountsView
        accounts={THREE}
        onEditAccount={vi.fn()}
        onAddAccount={vi.fn()}
        onReorderAccounts={onReorderAccounts}
      />,
    );

    fireEvent.click(screen.getByLabelText('Turunkan BCA'));
    expect(onReorderAccounts).toHaveBeenCalledWith(['b', 'a', 'c']);
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

  it('the arrow buttons do not also open the mutation history', () => {
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

    fireEvent.click(screen.getByLabelText('Turunkan BCA'));
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

    const handle = screen.getByLabelText('Geser BCA');

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

    fireEvent.pointerDown(screen.getByLabelText('Geser BCA'), { clientY: 10 });
    fireEvent.pointerUp(window, { clientY: 10 });

    // The click produced by the drag release is swallowed...
    fireEvent.click(screen.getByLabelText('Lihat mutasi rekening BCA'));
    expect(onSelectAccountHistory).not.toHaveBeenCalled();

    // ...but the guard only survives one click.
    fireEvent.click(screen.getByLabelText('Lihat mutasi rekening BCA'));
    expect(onSelectAccountHistory).toHaveBeenCalledTimes(1);
  });
});
