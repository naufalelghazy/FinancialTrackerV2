import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup, screen } from '@testing-library/react';
import { useDismissable } from './useDismissable';
import { useRef, useState } from 'react';

afterEach(cleanup);

function Popup({ onDismiss }: { onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  useDismissable(ref, open, () => {
    onDismiss();
    setOpen(false);
  });

  return (
    <div>
      <div ref={ref} data-testid="inside">
        <button type="button">Di dalam</button>
      </div>
      <button type="button">Di luar</button>
    </div>
  );
}

describe('useDismissable', () => {
  it('dismisses on a click outside the container', () => {
    const onDismiss = vi.fn();
    render(<Popup onDismiss={onDismiss} />);
    fireEvent.mouseDown(screen.getByText('Di luar'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps the popup open for a click inside', () => {
    const onDismiss = vi.fn();
    render(<Popup onDismiss={onDismiss} />);
    fireEvent.mouseDown(screen.getByText('Di dalam'));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses on Escape', () => {
    const onDismiss = vi.fn();
    render(<Popup onDismiss={onDismiss} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does nothing once closed', () => {
    const onDismiss = vi.fn();
    render(<Popup onDismiss={onDismiss} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Escape' });
    // Second Escape is ignored: the listener is gone after it closed.
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
