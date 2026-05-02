import { TIC_TAC_TOE_RESET_HOLD_MS, createTicTacToeLayout } from "./ticTacToeGame.js";

export const FULLSCREEN_LANDING_MODE = "landing";
export const FULLSCREEN_MODE_LANDING_HOLD_MS = TIC_TAC_TOE_RESET_HOLD_MS;
export const FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID = "back-to-input-test";

export const FULLSCREEN_CAMERA_MODE_OPTIONS = [
  { id: "square", label: "Squares", category: "Visual" },
  { id: "hex", label: "Hex", category: "Visual" },
  { id: "voronoi", label: "Voronoi", category: "Visual" },
  { id: "rings", label: "Rings", category: "Visual" },
  { id: "pulse", label: "Pulse", category: "Visual" },
  { id: "tip-ripples", label: "Tip Ripples", category: "Visual" },
  { id: "tip-ripples-v2", label: "Tip Ripples v2", category: "Visual" },
  { id: "static", label: "Static", category: "Visual" },
  { id: "hand-bounce", label: "Hand Bounce", category: "Game" },
  { id: "brick-dodger", label: "Brick Dodger", category: "Game" },
  { id: "breakout-coop", label: "Breakout Co-op", category: "Game" },
  { id: "breakout", label: "Breakout", category: "Game" },
  { id: "finger-pong", label: "Finger Pong", category: "Game" },
  { id: "tic-tac-toe", label: "Tic Tac Toe", category: "Game" },
  { id: "fruit-ninja", label: "Slice Air", category: "Game" },
  { id: "sky-patrol", label: "Sky Patrol", category: "Game" },
  { id: "fingerprint-worlds", label: "Fingerprint Worlds", category: "Game" },
  { id: "invaders", label: "Invaders", category: "Game" },
  { id: "flappy", label: "Flappy", category: "Game" },
  { id: "missile-command", label: "Missile Command", category: "Game" },
  { id: "virtual-piano", label: "Virtual Piano", category: "Music" },
];

export const FULLSCREEN_CAMERA_LANDING_OPTIONS = [
  ...FULLSCREEN_CAMERA_MODE_OPTIONS,
  {
    id: FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID,
    label: "Back to Input Test",
    category: "Navigation",
  },
];

const MAX_COLUMNS = 5;
const FULLSCREEN_MENU_REQUIRED_FINGER_NAMES = ["thumb", "index", "middle", "ring", "pinky"];
const FULLSCREEN_LANDING_TOP_HUD_SAFE_RATIO = 0.1;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isPointerInBox(box, pointer) {
  return (
    box &&
    pointer &&
    pointer.x >= box.left &&
    pointer.x <= box.left + box.width &&
    pointer.y >= box.top &&
    pointer.y <= box.top + box.height
  );
}

function getHoveredModeBox(layout, pointer) {
  if (!layout || !pointer?.active) {
    return null;
  }

  return layout.boxes.find((box) => isPointerInBox(box, pointer)) ?? null;
}

export function hasVerifiedFullscreenMenuHand(hand) {
  return FULLSCREEN_MENU_REQUIRED_FINGER_NAMES.every((fingerName) => {
    const tip = hand?.fingerTips?.[fingerName] ?? null;
    return Number.isFinite(tip?.u) && Number.isFinite(tip?.v);
  });
}

export function getVerifiedFullscreenMenuHand(hands) {
  const candidates = Array.isArray(hands) ? hands : [];
  return candidates.find((hand) => hasVerifiedFullscreenMenuHand(hand)) ?? null;
}

export function getVerifiedFullscreenMenuHandPointerInput(hands, viewport, projectPoint) {
  const verifiedHand = getVerifiedFullscreenMenuHand(hands);
  if (!verifiedHand) {
    return {
      handVerified: false,
      pointerActive: false,
      pointerX: 0,
      pointerY: 0,
    };
  }

  const indexTip = verifiedHand.fingerTips?.index ?? verifiedHand.indexTip ?? null;
  const projectedPoint =
    typeof projectPoint === "function" && indexTip
      ? projectPoint(indexTip)
      : null;
  const hasProjectedPoint =
    Number.isFinite(projectedPoint?.x) && Number.isFinite(projectedPoint?.y);
  const hasNormalizedPoint =
    Number.isFinite(indexTip?.u) &&
    Number.isFinite(indexTip?.v) &&
    Number.isFinite(viewport?.width) &&
    Number.isFinite(viewport?.height);
  const pointerX = hasProjectedPoint
    ? projectedPoint.x - (Number.isFinite(viewport?.left) ? viewport.left : 0)
    : hasNormalizedPoint
      ? indexTip.u * viewport.width
      : 0;
  const pointerY = hasProjectedPoint
    ? projectedPoint.y - (Number.isFinite(viewport?.top) ? viewport.top : 0)
    : hasNormalizedPoint
      ? indexTip.v * viewport.height
      : 0;
  const pointerActive = hasProjectedPoint || hasNormalizedPoint;

  return {
    handVerified: true,
    pointerActive,
    pointerX: pointerActive ? pointerX : 0,
    pointerY: pointerActive ? pointerY : 0,
  };
}

export function createFullscreenModeLandingLayout(width, height) {
  const ticTacToeLayout = createTicTacToeLayout(width, height);
  const layoutWidth = Math.max(1, Number.isFinite(width) ? width : ticTacToeLayout.width);
  const layoutHeight = Math.max(1, Number.isFinite(height) ? height : ticTacToeLayout.height);
  const baseBoxWidth = ticTacToeLayout.resetBoxWidth;
  const baseBoxHeight = ticTacToeLayout.resetBoxHeight;
  const baseColumnGap = clamp(baseBoxWidth * 0.11, 12, 26);
  const baseRowGap = clamp(baseBoxHeight * 0.1, 12, 24);
  const edgePadding = clamp(Math.min(layoutWidth, layoutHeight) * 0.04, 18, 42);
  const contentTop = Math.max(
    edgePadding,
    clamp(
      layoutHeight * FULLSCREEN_LANDING_TOP_HUD_SAFE_RATIO,
      64,
      92,
    ),
  );
  const contentBottom = layoutHeight - edgePadding;
  const contentHeight = Math.max(1, contentBottom - contentTop);
  const maxColumns = Math.min(MAX_COLUMNS, FULLSCREEN_CAMERA_LANDING_OPTIONS.length);
  const availableWidth = Math.max(1, layoutWidth - edgePadding * 2);
  const availableHeight = contentHeight;

  let bestColumns = 1;
  let bestRows = FULLSCREEN_CAMERA_LANDING_OPTIONS.length;
  let bestScale = 0;

  for (let candidate = 1; candidate <= maxColumns; candidate += 1) {
    const rows = Math.ceil(FULLSCREEN_CAMERA_LANDING_OPTIONS.length / candidate);
    const totalBaseWidth = candidate * baseBoxWidth + (candidate - 1) * baseColumnGap;
    const totalBaseHeight = rows * baseBoxHeight + (rows - 1) * baseRowGap;
    const scale = Math.min(1, availableWidth / totalBaseWidth, availableHeight / totalBaseHeight);

    if (
      scale > bestScale + 1e-6 ||
      (Math.abs(scale - bestScale) <= 1e-6 && rows < bestRows)
    ) {
      bestColumns = candidate;
      bestRows = rows;
      bestScale = scale;
    }
  }

  const columns = bestColumns;
  const rows = bestRows;
  const scale = Math.max(0.01, bestScale);
  const boxWidth = baseBoxWidth * scale;
  const boxHeight = baseBoxHeight * scale;
  const columnGap = baseColumnGap * scale;
  const rowGap = baseRowGap * scale;
  const totalHeight = rows * boxHeight + (rows - 1) * rowGap;
  const startY = Math.max(contentTop, contentTop + (contentHeight - totalHeight) / 2);
  const boxes = FULLSCREEN_CAMERA_LANDING_OPTIONS.map((option, index) => {
    const row = Math.floor(index / columns);
    const indexInRow = index % columns;
    const rowItemCount =
      row === rows - 1
        ? FULLSCREEN_CAMERA_LANDING_OPTIONS.length - row * columns || columns
        : columns;
    const rowWidth = rowItemCount * boxWidth + Math.max(0, rowItemCount - 1) * columnGap;
    const rowStartX = (layoutWidth - rowWidth) / 2;

    return {
      ...option,
      left: rowStartX + indexInRow * (boxWidth + columnGap),
      top: startY + row * (boxHeight + rowGap),
      width: boxWidth,
      height: boxHeight,
    };
  });

  return {
    width: layoutWidth,
    height: layoutHeight,
    boxWidth,
    boxHeight,
    columnGap,
    rowGap,
    columns,
    rows,
    scale,
    contentTop,
    contentBottom,
    boxes,
  };
}

export function createFullscreenModeLandingState(width, height) {
  return {
    layout: createFullscreenModeLandingLayout(width, height),
    handVerified: false,
    hoverModeId: null,
    holdModeId: null,
    holdMs: 0,
    selectedModeId: null,
  };
}

export function selectFullscreenModeLandingMode(state, modeId) {
  const safeState = state ?? createFullscreenModeLandingState(1280, 720);
  const selectedBox = safeState.layout?.boxes?.find((box) => box.id === modeId) ?? null;
  return {
    ...safeState,
    selectedModeId: selectedBox?.id ?? null,
  };
}

export function stepFullscreenModeLanding(state, dtSeconds, input) {
  const safeState = state ?? createFullscreenModeLandingState(1280, 720);
  const handVerified = Boolean(input?.handVerified);
  const pointer = {
    active:
      handVerified &&
      input?.pointerActive !== false &&
      Number.isFinite(input?.pointerX) &&
      Number.isFinite(input?.pointerY),
    x: Number.isFinite(input?.pointerX) ? clamp(input.pointerX, 0, safeState.layout.width) : 0,
    y: Number.isFinite(input?.pointerY) ? clamp(input.pointerY, 0, safeState.layout.height) : 0,
  };
  const hoveredBox = getHoveredModeBox(safeState.layout, pointer);
  const hoveredModeId = hoveredBox?.id ?? null;
  const elapsedMs = Math.max(0, Math.min(0.05, Number.isFinite(dtSeconds) ? dtSeconds : 0)) * 1000;

  let holdMs = 0;
  if (hoveredModeId) {
    holdMs =
      safeState.holdModeId === hoveredModeId
        ? Math.min(FULLSCREEN_MODE_LANDING_HOLD_MS, safeState.holdMs + elapsedMs)
        : 0;
  }

  return {
    ...safeState,
    handVerified,
    hoverModeId: hoveredModeId,
    holdModeId: hoveredModeId,
    holdMs,
    selectedModeId:
      hoveredModeId && holdMs >= FULLSCREEN_MODE_LANDING_HOLD_MS ? hoveredModeId : null,
  };
}
