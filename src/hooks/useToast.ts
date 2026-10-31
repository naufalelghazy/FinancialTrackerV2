import { useCallback, useState } from 'react';
import type { ToastItem, ToastVariant } from '../components/ui/Toast';

/**
 * Single owner of the toast slot.
 *
 * Previously `setActiveToast` was called directly from a dozen handlers, each
 * minting its own id (`crypto.randomUUID()` in one place, `String(Date.now())` in
 * another). A stable id matters because the toast animates on key change; mixing
 * generators made two toasts in the same millisecond collide.
 */
export function useToast() {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const show = useCallback((title: string, subtitle?: string, variant: ToastVariant = 'success') => {
    setToast({ id: crypto.randomUUID(), title, subtitle, variant });
  }, []);

  /** Shows a toast that carries an undo action, e.g. after a quick-template save. */
  const showUndoable = useCallback((item: Omit<ToastItem, 'id'>, onUndo: () => void) => {
    setToast({ ...item, id: crypto.randomUUID(), onUndo });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, showUndoable, dismiss };
}
