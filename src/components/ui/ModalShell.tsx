import React, { useEffect, useRef } from "react";

/**
 * Shared dialog chrome: backdrop, `role="dialog"`, Escape handling, a focus
 * trap and focus restoration.
 *
 * Every modal used to redeclare `role="dialog" aria-modal="true"` and its own
 * Escape listener, but none of them kept Tab inside the dialog or put focus
 * back where it came from. Claiming `aria-modal` without actually trapping
 * focus is worse than not claiming it: screen-reader users are told the rest
 * of the page is inert while Tab still walks straight into it.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface ModalShellProps {
  /** Rendered inside the dialog box, below the backdrop. */
  children: React.ReactNode;
  /** Called on Escape and when focus would leave the page (optional). */
  onClose: () => void;
  /** Accessible name; also what the dialog is announced as. */
  ariaLabel: string;
  /** Optional id of the element that visually labels the dialog. */
  ariaLabelledBy?: string;
  /** Max width utility for the dialog box. */
  maxWidthClass?: string;
  /** z-index utility; the default sits above the page chrome. */
  zIndexClass?: string;
  /**
   * Element to focus when the dialog opens. Defaults to the first
   * focusable child, which for these modals is the close button — pass an
   * `id` here when a specific field should win.
   */
  initialFocusId?: string;
  /** Whether clicking the backdrop dismisses the dialog. */
  closeOnBackdrop?: boolean;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  children,
  onClose,
  ariaLabel,
  ariaLabelledBy,
  maxWidthClass = "max-w-sm",
  zIndexClass = "z-[60]",
  initialFocusId,
  closeOnBackdrop = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without re-running the effect (which would steal
  // focus again every time the parent re-renders with a new callback).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;

    const focusInitial = () => {
      const preferred = initialFocusId
        ? document.getElementById(initialFocusId)
        : null;
      if (preferred) {
        preferred.focus();
        return;
      }
      const first = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? dialog)?.focus();
    };
    focusInitial();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      // Skip controls the browser cannot focus. `offsetParent` looks like the
      // obvious test, but it is null for every element inside a fixed-position
      // dialog, so use explicit hidden/disabled state instead.
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => {
        if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') {
          return false;
        }
        if (el.closest('[hidden],[aria-hidden="true"]')) return false;
        return el.tabIndex !== -1 || el === document.activeElement;
      });

      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Put the user back where they were so a keyboard user does not lose
      // their place in the list behind the dialog.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
    // Only mount/unmount should move focus; `initialFocusId` is read once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-xs animate-in fade-in`}
      onClick={
        closeOnBackdrop
          ? (event) => {
              if (event.target === event.currentTarget) onCloseRef.current();
            }
          : undefined
      }
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className={`bg-surface rounded-[16px] w-full ${maxWidthClass} overflow-hidden shadow-whisper border border-hairline flex flex-col max-h-[90vh] outline-none transition-colors duration-200`}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
