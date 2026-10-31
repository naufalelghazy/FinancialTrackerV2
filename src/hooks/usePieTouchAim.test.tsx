import { describe, it, expect } from 'vitest';
import { sliceIndexAtPoint } from './usePieTouchAim';

const box = { left: 0, top: 0, width: 200, height: 200 };
const centre = { x: 100, y: 100 };
// A ring that matches the phone-sized chart: 45..95px from the centre.
const sizing = { innerRadius: 45, outerRadius: 95, paddingAngle: 0 };
const midRing = 70;

/** A point at `angle` degrees clockwise from 12 o'clock, `radius` out. */
function pointAt(angle: number, radius = midRing) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: centre.x + Math.sin(rad) * radius,
    y: centre.y - Math.cos(rad) * radius,
  };
}

const hit = (point: { x: number; y: number }, values: number[], padding = 0) =>
  sliceIndexAtPoint(point.x, point.y, box, values, {
    ...sizing,
    paddingAngle: padding,
  });

describe('sliceIndexAtPoint', () => {
  it('maps the four quadrants to four equal slices', () => {
    const values = [1, 1, 1, 1];
    expect(hit(pointAt(45), values)).toBe(0); // top right
    expect(hit(pointAt(135), values)).toBe(1); // bottom right
    expect(hit(pointAt(225), values)).toBe(2); // bottom left
    expect(hit(pointAt(315), values)).toBe(3); // top left
  });

  it('starts the first slice at 12 o clock, like Recharts', () => {
    const values = [1, 1];
    expect(hit(pointAt(1), values)).toBe(0);
    expect(hit(pointAt(181), values)).toBe(1);
    expect(hit(pointAt(359), values)).toBe(1);
  });

  it('gives a bigger slice a bigger arc', () => {
    const values = [3, 1];
    expect(hit(pointAt(100), values)).toBe(0); // inside the first 270deg
    expect(hit(pointAt(300), values)).toBe(1); // the last 90deg
  });

  it('handles a realistic 20-slice donut', () => {
    const values = Array.from({ length: 20 }, (_, i) => i + 1);
    const total = values.reduce((sum, value) => sum + value, 0);
    let start = 0;
    values.forEach((value, index) => {
      const sweep = (value / total) * 360;
      // Aim at the middle of each slice and expect that exact slice back.
      expect(hit(pointAt(start + sweep / 2), values)).toBe(index);
      start += sweep;
    });
  });

  it('returns nothing for a point inside the hole', () => {
    expect(hit(pointAt(45, 20), [1, 1, 1, 1])).toBeNull();
  });

  it('returns nothing for a point well beyond the ring', () => {
    expect(hit(pointAt(45, 140), [1, 1, 1, 1])).toBeNull();
  });

  it('accepts a fingertip a few pixels off the ring', () => {
    const values = [1, 1, 1, 1];
    // 10px of slack, because nobody lands on a hairline slice precisely.
    expect(hit(pointAt(45, 40), values)).toBe(0); // 5px inside the inner edge
    expect(hit(pointAt(45, 103), values)).toBe(0); // 8px past the outer edge
    expect(hit(pointAt(45, 20), values)).toBeNull(); // far too far inside
    expect(hit(pointAt(45, 130), values)).toBeNull(); // far too far outside
  });

  it('resolves a gap between slices to the nearer slice', () => {
    const values = [1, 1, 1, 1];
    // paddingAngle=12 leaves 78deg of arc and a 12deg gap per slice, so slice
    // 0 covers 0..78 and slice 1 covers 90..168. Each claims half a gap, which
    // puts the handover at 84deg.
    expect(hit(pointAt(70), values, 12)).toBe(0);
    expect(hit(pointAt(82), values, 12)).toBe(0);
    expect(hit(pointAt(86), values, 12)).toBe(1);
    expect(hit(pointAt(120), values, 12)).toBe(1);
  });

  it('returns nothing when there is no data or the data is empty', () => {
    expect(hit(pointAt(45), [])).toBeNull();
    expect(hit(pointAt(45), [0, 0])).toBeNull();
  });

  it('returns nothing while the chart box has no size yet', () => {
    // The first render happens before layout, so width and height are both 0.
    const empty = { left: 0, top: 0, width: 0, height: 0 };
    expect(
      sliceIndexAtPoint(10, 10, empty, [1, 1], sizing)
    ).toBeNull();
  });

  it('honours a chart that is not in the top-left corner', () => {
    const values = [1, 1, 1, 1];
    const shifted = { left: 50, top: 50, width: 200, height: 200 };
    // The centre is now at 150,150; 70px above it is the middle of slice 0.
    expect(sliceIndexAtPoint(150, 80, shifted, values, sizing)).toBe(0);
  });
});
