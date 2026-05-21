import test from "node:test";
import assert from "node:assert/strict";

import {
  TIP_RIPPLE_THICK_STROKE_WIDTH_PX,
  TIP_RIPPLE_THIN_STROKE_WIDTH_PX,
  getTipRippleStrokeWidth,
  getTouchingTipRippleStrokeWidth,
} from "../src/tipRipples.js";

test("getTipRippleStrokeWidth cycles thin to thick to thin over two seconds", () => {
  assert.equal(getTipRippleStrokeWidth(0), TIP_RIPPLE_THIN_STROKE_WIDTH_PX);
  assert.equal(getTipRippleStrokeWidth(1000), TIP_RIPPLE_THICK_STROKE_WIDTH_PX);
  assert.equal(getTipRippleStrokeWidth(2000), TIP_RIPPLE_THIN_STROKE_WIDTH_PX);
  assert.equal(getTipRippleStrokeWidth(3000), TIP_RIPPLE_THICK_STROKE_WIDTH_PX);
});

test("getTipRippleStrokeWidth interpolates evenly between endpoints", () => {
  const midpoint = (TIP_RIPPLE_THIN_STROKE_WIDTH_PX + TIP_RIPPLE_THICK_STROKE_WIDTH_PX) / 2;

  assert.equal(getTipRippleStrokeWidth(500), midpoint);
  assert.equal(getTipRippleStrokeWidth(1500), midpoint);
});

test("getTipRippleStrokeWidth starts thin for invalid elapsed time", () => {
  assert.equal(getTipRippleStrokeWidth(Number.NaN), TIP_RIPPLE_THIN_STROKE_WIDTH_PX);
  assert.equal(getTipRippleStrokeWidth(-1), TIP_RIPPLE_THIN_STROKE_WIDTH_PX);
});

test("getTouchingTipRippleStrokeWidth uses half the outer diameter spacing", () => {
  assert.equal(getTouchingTipRippleStrokeWidth(144), 72);
  assert.equal(getTouchingTipRippleStrokeWidth(0), 0);
});
