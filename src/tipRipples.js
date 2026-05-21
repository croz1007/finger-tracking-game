export const TIP_RIPPLE_THIN_STROKE_WIDTH_PX = 3;
export const TIP_RIPPLE_THICK_STROKE_WIDTH_PX = 72;
export const TIP_RIPPLE_STROKE_HALF_CYCLE_MS = 1000;

export function getTouchingTipRippleStrokeWidth(outerDiameterStepPx) {
  if (!Number.isFinite(outerDiameterStepPx) || outerDiameterStepPx <= 0) {
    return 0;
  }

  return outerDiameterStepPx / 2;
}

export function getTipRippleStrokeWidth(
  elapsedMs,
  {
    thinStrokeWidth = TIP_RIPPLE_THIN_STROKE_WIDTH_PX,
    thickStrokeWidth = TIP_RIPPLE_THICK_STROKE_WIDTH_PX,
    halfCycleMs = TIP_RIPPLE_STROKE_HALF_CYCLE_MS,
  } = {},
) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || !Number.isFinite(halfCycleMs) || halfCycleMs <= 0) {
    return thinStrokeWidth;
  }

  const cycleMs = halfCycleMs * 2;
  const cyclePosition = elapsedMs % cycleMs;
  const progress =
    cyclePosition <= halfCycleMs
      ? cyclePosition / halfCycleMs
      : 1 - (cyclePosition - halfCycleMs) / halfCycleMs;

  return thinStrokeWidth + (thickStrokeWidth - thinStrokeWidth) * progress;
}
