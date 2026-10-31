import { useEffect, type RefObject } from "react";

/**
 * Closes a popup when the user clicks outside it or presses Escape.
 *
 * Six components had their own copy of this effect, each with slightly
 * different behaviour (some listened on `mousedown`, some on `touchstart`,
 * some did not handle Escape at all). Passing `null` as the active key means
 * "nothing is open", so the listener is not attached at all.
 */
export function useDismissable(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onDismiss: () => void
): void {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const container = containerRef.current;
      const target = event.target as Node | null;
      if (!container || !target) return;
      if (!container.contains(target)) onDismiss();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Stop the modal underneath from also closing on the same keypress.
      event.stopPropagation();
      onDismiss();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, isOpen, onDismiss]);
}
