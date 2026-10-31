import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Makes a Recharts donut respond to a finger the way it responds to a desktop
 * mouse cursor.
 *
 * Recharts listens for `mouseenter` / `mousemove` / `mouseleave` on the slice
 * paths. Chrome synthesises a burst of those — but only *after* the finger is
 * lifted, which is why the centre readout used to appear on release instead of
 * while the finger was down.
 *
 * What was actually observed in Chromium (Android emulation), and why this file
 * looks the way it does:
 *
 *   touchstart/touchmove  -> keep firing for the whole gesture, even after the
 *                            browser has taken the drag over for scrolling
 *   pointermove           -> fires once, then Chrome fires `pointercancel` and
 *                            delivers no more pointer events for that finger
 *   touchend              -> NOT fired for a press held without moving
 *   pointerup             -> fires for that same press
 *
 * So the aim follows touch events, with `pointerup` covering the release of a
 * motionless press. An earlier version listened to pointer events only, which
 * is why a drag froze the readout on the first slice.
 *
 * Requested behaviour, literally "the finger is the cursor":
 *
 *   finger down on a slice -> readout shows that slice
 *   slide while held       -> readout follows what it moves over
 *   lift the finger        -> readout goes back to neutral
 */

interface SliceSizing {
  /** Centre of the ring, as a fraction of the chart box (Recharts' cx/cy). */
  cx?: number;
  cy?: number;
  innerRadius: number;
  outerRadius: number;
  /** Gap between slices in degrees, matching Recharts' `paddingAngle`. */
  paddingAngle?: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Which slice sits under a point, or null when the point is not on the ring.
 *
 * Found by angle rather than by hit-testing the SVG paths, because a hairline
 * slice (and this app has 20+ categories) has almost no clickable area, yet its
 * share of the circle is known exactly.
 *
 * Recharts starts the first slice at 12 o'clock and sweeps clockwise, so the
 * angle is measured the same way.
 */
export function sliceIndexAtPoint(
  x: number,
  y: number,
  box: Box,
  values: number[],
  sizing: SliceSizing
): number | null {
  if (values.length === 0) return null;
  if (!box.width || !box.height) return null;

  const cx = box.left + box.width * (sizing.cx ?? 0.5);
  const cy = box.top + box.height * (sizing.cy ?? 0.5);
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.hypot(dx, dy);

  // A fingertip is not pixel precise, so a few pixels either side of the ring
  // still count as a hit.
  const slack = 10;
  if (
    distance < sizing.innerRadius - slack ||
    distance > sizing.outerRadius + slack
  ) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || total <= 0) return null;

  // atan2 with the y axis flipped: 0deg at 12 o'clock, growing clockwise.
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (angle < 0) angle += 360;

  const padding = Math.max(0, sizing.paddingAngle ?? 0);
  const usable = Math.max(0, 360 - padding * values.length);

  let cursor = 0;
  for (let i = 0; i < values.length; i += 1) {
    const sweep = (values[i] / total) * usable;
    // Half of each gap belongs to the neighbouring slice, so a finger on the
    // divider still resolves to whichever slice it is closer to.
    if (angle >= cursor - padding / 2 && angle < cursor + sweep + padding / 2) {
      return i;
    }
    cursor += sweep + padding;
  }
  return null;
}

interface UsePieTouchAimOptions {
  /** Slice sizes, in the order the chart renders them. */
  values: number[];
  sizing: SliceSizing;
  /** Called with the aimed slice, or null when nothing is aimed at. */
  onAim: (index: number | null) => void;
}

export interface PieTouchAim {
  /**
   * Put this on the element wrapping the chart.
   *
   * A callback ref that does NOT re-render: it stores the element in a ref and
   * attaches the listeners itself. Driving this through `useState` meant every
   * aim change re-rendered, React detached and re-attached the ref, and the
   * listeners were torn down mid-gesture — so a slide was lost after the first
   * move.
   */
  attach: (element: HTMLDivElement | null) => void;
  /**
   * True once a finger has driven the chart and until a real mouse moves.
   * Recharts' own hover handlers keep firing on the synthetic mouse events
   * Chrome emits after a touch, and `mouseenter` cannot be intercepted, so the
   * caller must ignore its hover state while this is true.
   */
  isLocked: boolean;
  /**
   * The same flag as a ref, readable synchronously from an event handler.
   *
   * Recharts' synthetic `mouseenter` fires in the same task as the lift, before
   * React has re-rendered with `isLocked` — so the state value alone is one
   * render too late to stop it. `onMouseEnter` handlers ask this instead.
   */
  lockedRef: { readonly current: boolean };
}

export function usePieTouchAim({
  values,
  sizing,
  onAim,
}: UsePieTouchAimOptions): PieTouchAim {
  // Latest inputs in refs so the listeners never need re-attaching.
  const valuesRef = useRef(values);
  const sizingRef = useRef(sizing);
  const onAimRef = useRef(onAim);
  const lockedRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);
  // Which elements already have listeners, so a re-render cannot double-wire
  // them or tear them down. A WeakSet keeps this from pinning dead nodes.
  const wiredElements = useRef(new WeakSet<HTMLDivElement>());
  // How to un-wire the listeners currently attached, so unmount cleans up.
  const detachListeners = useRef<(() => void) | null>(null);

  useEffect(() => {
    valuesRef.current = values;
    sizingRef.current = sizing;
    onAimRef.current = onAim;
  }, [values, sizing, onAim]);

  const setLocked = useCallback((locked: boolean) => {
    lockedRef.current = locked;
    // Only re-render when the flag actually flips; every aim move must not.
    setIsLocked((previous) => (previous === locked ? previous : locked));
  }, []);

  const attach = useCallback(
    (element: HTMLDivElement | null) => {
      // React detaches a callback ref with `null` on every re-render before
      // re-attaching it. Tearing the listeners down there would kill them
      // mid-gesture, so listeners are attached exactly once per element —
      // tracked in a WeakSet, which survives the null/element round-trip.
      if (!element) return;
      if (wiredElements.current.has(element)) return;
      wiredElements.current.add(element);
      detachListeners.current?.();
      detachListeners.current = attachListeners(
        element,
        valuesRef,
        sizingRef,
        onAimRef,
        lockedRef,
        setLocked
      );
    },
    [setLocked]
  );

  // Drop the listeners and any aim left behind when the component unmounts.
  useEffect(() => {
    return () => {
      detachListeners.current?.();
      detachListeners.current = null;
      onAimRef.current(null);
    };
  }, []);

  return { attach, isLocked, lockedRef };
}

/**
 * Wires the listeners for one chart element.
 *
 * Kept outside the hook body so it has no dependency on React's render cycle:
 * the listeners live for as long as the element does, not for as long as some
 * dependency array says so.
 *
 * The gesture state (`aiming`) lives in a per-hook ref rather than a closure,
 * so React replacing the host node mid-gesture does not lose the gesture.
 */
function attachListeners(
  host: HTMLDivElement,
  valuesRef: { current: number[] },
  sizingRef: { current: SliceSizing },
  onAimRef: { current: (index: number | null) => void },
  lockedRef: { current: boolean },
  setLocked: (locked: boolean) => void
): () => void {
  let aiming = false;

  const aimAt = (clientX: number, clientY: number) => {
    if (lockedRef.current) return;
    onAimRef.current(
      sliceIndexAtPoint(
        clientX,
        clientY,
        host.getBoundingClientRect(),
        valuesRef.current,
        sizingRef.current
      )
    );
  };

  const release = () => {
    if (!aiming) return;
    aiming = false;
    setLocked(true);
    onAimRef.current(null);
  };

  // --- Touch path: the only one that survives a drag in Chrome. ---

  const onTouchStart = (event: TouchEvent) => {
    // Multi-touch is not a cursor; only a single finger aims.
    if (event.touches.length > 1) {
      release();
      return;
    }
    const touch = event.touches[0];
    if (!touch) return;
    // A new gesture means the user is back on touch: drop the post-lift lock
    // so this press can aim again.
    setLocked(false);
    aiming = true;
    aimAt(touch.clientX, touch.clientY);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!aiming) return;
    const touch = event.touches[0];
    if (!touch) return;
    aimAt(touch.clientX, touch.clientY);
  };

  const onTouchEnd = (event: TouchEvent) => {
    // `touchend` still lists the finger that is leaving, so check for any
    // remaining contact before clearing.
    if (event.touches.length === 0) release();
  };

  // A motionless press fires no `touchend` at all, only `pointerup`.
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "touch") return;
    aiming = true;
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerType !== "touch") return;
    release();
  };

  // `pointercancel` fires the moment Chrome hands a drag over to scrolling and
  // the gesture continues as `touchmove`, so there is nothing to do here.
  const touchOptions: AddEventListenerOptions = { passive: true };

  host.addEventListener("touchstart", onTouchStart, touchOptions);
  host.addEventListener("touchmove", onTouchMove, touchOptions);
  host.addEventListener("touchend", onTouchEnd, touchOptions);
  host.addEventListener("touchcancel", onTouchEnd, touchOptions);
  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointerup", onPointerUp);

  return () => {
    host.removeEventListener("touchstart", onTouchStart, touchOptions);
    host.removeEventListener("touchmove", onTouchMove, touchOptions);
    host.removeEventListener("touchend", onTouchEnd, touchOptions);
    host.removeEventListener("touchcancel", onTouchEnd, touchOptions);
    host.removeEventListener("pointerdown", onPointerDown);
    host.removeEventListener("pointerup", onPointerUp);
  };
}
