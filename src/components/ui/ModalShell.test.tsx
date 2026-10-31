import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup, screen } from '@testing-library/react';
import { ModalShell } from './ModalShell';

afterEach(cleanup);

function Dialog({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} ariaLabel="Dialog Uji">
      <button type="button">Pertama</button>
      <button type="button">Terakhir</button>
    </ModalShell>
  );
}

describe('ModalShell', () => {
  it('exposes a labelled dialog', () => {
    render(<Dialog onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Dialog Uji');
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<Dialog onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps Tab from the last element back to the first', () => {
    render(<Dialog onClose={vi.fn()} />);
    const first = screen.getByText('Pertama');
    const last = screen.getByText('Terakhir');

    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    render(<Dialog onClose={vi.fn()} />);
    const first = screen.getByText('Pertama');
    const last = screen.getByText('Terakhir');

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('focuses the first control on open and restores focus on close', () => {
    const opener = document.createElement('button');
    opener.textContent = 'Buka';
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(<Dialog onClose={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByText('Pertama'));

    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('only closes on a backdrop click when asked to', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <ModalShell onClose={onClose} ariaLabel="X" closeOnBackdrop>
        <button type="button">Isi</button>
      </ModalShell>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
    unmount();

    const strict = vi.fn();
    render(
      <ModalShell onClose={strict} ariaLabel="Y">
        <button type="button">Isi</button>
      </ModalShell>
    );
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(strict).not.toHaveBeenCalled();
  });
});
