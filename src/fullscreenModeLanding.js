import { TIC_TAC_TOE_RESET_HOLD_MS } from "./ticTacToeGame.js";

export const FULLSCREEN_LANDING_MODE = "landing";
export const FULLSCREEN_MODE_LANDING_HOLD_MS = TIC_TAC_TOE_RESET_HOLD_MS;
export const FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID = "back-to-input-test";

export const FULLSCREEN_CAMERA_LANDING_SECTIONS = [
  {
    id: "visual-effects",
    title: "Visual Effects",
    icon: "eye",
    kind: "visual",
    preferredColumns: 4,
    items: [
      {
        id: "square",
        label: "Squares",
        preview: "squares",
        iconSrc: "/assets/launcher-icons/squares.png",
        accent: "#2f9bff",
      },
      {
        id: "hex",
        label: "Hex",
        preview: "hex",
        iconSrc: "/assets/launcher-icons/hex.png",
        accent: "#65d84f",
      },
      {
        id: "voronoi",
        label: "Voronoi",
        preview: "voronoi",
        iconSrc: "/assets/launcher-icons/voronoi.png",
        accent: "#a855f7",
      },
      {
        id: "rings",
        label: "Rings",
        preview: "rings",
        iconSrc: "/assets/launcher-icons/rings.png",
        accent: "#fb923c",
      },
      {
        id: "pulse",
        label: "Pulse",
        preview: "pulse",
        iconSrc: "/assets/launcher-icons/pulse.png",
        accent: "#fb4e7a",
      },
      {
        id: "tip-ripples",
        label: "Tip Ripples",
        preview: "ripples",
        iconSrc: "/assets/launcher-icons/tip-ripples.png",
        accent: "#1d9bf0",
      },
      {
        id: "static",
        label: "Static",
        preview: "static",
        iconSrc: "/assets/launcher-icons/static.png",
        accent: "#e2e8f0",
      },
    ],
  },
  {
    id: "games",
    title: "Games",
    icon: "gamepad",
    kind: "game",
    preferredColumns: 6,
    items: [
      {
        id: "hand-bounce",
        label: "Hand Bounce",
        preview: "hand-bounce",
        iconSrc: "/assets/launcher-icons/hand-bounce.png",
        accent: "#66e24e",
      },
      {
        id: "brick-dodger",
        label: "Brick Dodger",
        preview: "brick-dodger",
        iconSrc: "/assets/launcher-icons/brick-dodger.png",
        accent: "#f7c948",
      },
      {
        id: "breakout-coop",
        label: "Breakout Co-op",
        preview: "breakout-coop",
        iconSrc: "/assets/launcher-icons/breakout-coop.png",
        accent: "#8b5cf6",
      },
      {
        id: "breakout",
        label: "Breakout",
        preview: "breakout",
        iconSrc: "/assets/launcher-icons/breakout.png",
        accent: "#22d3ee",
      },
      {
        id: "find-your-grind-breakout",
        label: "Find Your Grind",
        preview: "breakout",
        iconSrc: "/assets/launcher-icons/find-your-grind-breakout.png",
        accent: "#2a5eff",
      },
      {
        id: "finger-pong",
        label: "Finger Pong",
        preview: "finger-pong",
        iconSrc: "/assets/launcher-icons/finger-pong.png",
        accent: "#fb7185",
      },
      {
        id: "tic-tac-toe",
        label: "Tic Tac Toe",
        preview: "tic-tac-toe",
        iconSrc: "/assets/launcher-icons/tic-tac-toe.png",
        accent: "#facc15",
      },
      {
        id: "fruit-ninja",
        label: "Slice Air",
        preview: "slice-air",
        iconSrc: "/assets/launcher-icons/slice-air.png",
        accent: "#38d9f7",
      },
      {
        id: "sky-patrol",
        label: "Sky Patrol",
        preview: "sky-patrol",
        iconSrc: "/assets/launcher-icons/sky-patrol.png",
        accent: "#59e04f",
      },
      {
        id: "fingerprint-worlds",
        label: "Fingerprint Worlds",
        preview: "fingerprint-worlds",
        iconSrc: "/assets/launcher-icons/fingerprint-worlds.png",
        accent: "#7c6cff",
      },
      {
        id: "invaders",
        label: "Invaders",
        preview: "invaders",
        iconSrc: "/assets/launcher-icons/invaders.png",
        accent: "#ff5a52",
      },
      {
        id: "flappy",
        label: "Flappy",
        preview: "flappy",
        iconSrc: "/assets/launcher-icons/flappy.png",
        accent: "#fbbf24",
      },
      {
        id: "missile-command",
        label: "Missile Command",
        preview: "missile-command",
        iconSrc: "/assets/launcher-icons/missile-command.png",
        accent: "#33d7ee",
      },
    ],
  },
];

export const FULLSCREEN_CAMERA_MODE_OPTIONS = FULLSCREEN_CAMERA_LANDING_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    category: section.title,
    kind: section.kind,
    previewType: item.previewType ?? item.preview,
    route: item.route ?? item.id,
    sectionId: section.id,
  })),
);

export const FULLSCREEN_CAMERA_LANDING_OPTIONS = [
  ...FULLSCREEN_CAMERA_MODE_OPTIONS,
  {
    id: FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID,
    label: "Back to Input Test",
    category: "Navigation",
    kind: "navigation",
    previewType: "back",
    route: "input-test",
    accent: "#22d3ee",
  },
];

const FULLSCREEN_MENU_REQUIRED_FINGER_NAMES = ["thumb", "index", "middle", "ring", "pinky"];
const LANDING_HAND_ROOT_CONNECTIONS = [
  [0, 1],
  [0, 5],
  [0, 9],
  [0, 13],
  [0, 17],
];
const LANDING_HAND_FINGER_CHAINS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];
const BASE_TILE_WIDTH = 158;
const BASE_TILE_HEIGHT = 110;
const BASE_TILE_GAP = 16;
const BASE_PANEL_PADDING = 24;
const BASE_PANEL_HEADING_HEIGHT = 34;
const BASE_SECTION_GAP = 18;
const MIN_LAYOUT_SCALE = 0.1;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getResponsiveSectionColumns(section, width) {
  const preferredColumns = section.preferredColumns ?? 4;

  if (width >= 960) {
    return preferredColumns;
  }

  if (width >= 700) {
    return Math.min(preferredColumns, 4);
  }

  return Math.min(preferredColumns, 2);
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

export function createFullscreenLandingHandSkeleton(hands, viewport, projectPoint) {
  const safeHands = Array.isArray(hands) ? hands : [];
  const viewportLeft = Number.isFinite(viewport?.left) ? viewport.left : 0;
  const viewportTop = Number.isFinite(viewport?.top) ? viewport.top : 0;
  const connections = [
    ...LANDING_HAND_ROOT_CONNECTIONS,
    ...LANDING_HAND_FINGER_CHAINS.flatMap((chain) =>
      chain.slice(1).map((landmarkIndex, index) => [chain[index], landmarkIndex]),
    ),
  ];

  return {
    hands: safeHands
      .map((hand, handIndex) => {
        const landmarks = Array.isArray(hand?.landmarks) ? hand.landmarks : [];
        if (landmarks.length === 0) {
          return null;
        }

        const joints = landmarks
          .map((landmark, index) => {
            const projectedPoint =
              typeof projectPoint === "function" ? projectPoint(landmark) : null;
            if (!Number.isFinite(projectedPoint?.x) || !Number.isFinite(projectedPoint?.y)) {
              return null;
            }
            return {
              index,
              x: projectedPoint.x - viewportLeft,
              y: projectedPoint.y - viewportTop,
            };
          })
          .filter(Boolean);
        const jointByIndex = new Map(joints.map((joint) => [joint.index, joint]));
        const projectedConnections = connections
          .map(([startIndex, endIndex]) => {
            const start = jointByIndex.get(startIndex);
            const end = jointByIndex.get(endIndex);
            return start && end
              ? {
                start,
                end,
              }
              : null;
          })
          .filter(Boolean);

        return {
          id: hand?.id ?? hand?.label ?? `hand-${handIndex}`,
          joints,
          connections: projectedConnections,
          indexTip: jointByIndex.get(8) ?? null,
        };
      })
      .filter(Boolean),
  };
}

export function createFullscreenModeLandingLayout(width, height) {
  const layoutWidth = Math.max(1, Number.isFinite(width) ? width : 1280);
  const layoutHeight = Math.max(1, Number.isFinite(height) ? height : 720);
  const edgePadding = clamp(Math.min(layoutWidth, layoutHeight) * 0.032, 16, 34);
  const headerHeight = clamp(layoutHeight * 0.12, 70, 108);
  const backButtonHeight = clamp(layoutHeight * 0.064, 46, 56);
  const backButtonWidth = Math.min(layoutWidth - edgePadding * 2, clamp(layoutWidth * 0.22, 220, 310));
  const footerTop = layoutHeight - edgePadding - backButtonHeight;
  const contentTop = edgePadding + headerHeight;
  const viewportContentBottom = Math.max(contentTop + 1, footerTop - edgePadding * 0.25);
  const availableWidth = Math.max(1, layoutWidth - edgePadding * 2);
  const availableHeight = Math.max(1, viewportContentBottom - contentTop);
  const baseSectionLayouts = FULLSCREEN_CAMERA_LANDING_SECTIONS.map((section) => {
    const columns = getResponsiveSectionColumns(section, layoutWidth);
    const rows = Math.ceil(section.items.length / columns);
    const panelWidth =
      BASE_PANEL_PADDING * 2 +
      columns * BASE_TILE_WIDTH +
      Math.max(0, columns - 1) * BASE_TILE_GAP;
    const panelHeight =
      BASE_PANEL_PADDING * 2 +
      BASE_PANEL_HEADING_HEIGHT +
      rows * BASE_TILE_HEIGHT +
      Math.max(0, rows - 1) * BASE_TILE_GAP;

    return {
      section,
      columns,
      rows,
      panelWidth,
      panelHeight,
    };
  });
  const maxBasePanelWidth = Math.max(...baseSectionLayouts.map((section) => section.panelWidth), 1);
  const totalBasePanelsHeight =
    baseSectionLayouts.reduce((total, section) => total + section.panelHeight, 0) +
    Math.max(0, baseSectionLayouts.length - 1) * BASE_SECTION_GAP;
  const allowVerticalOverflow = layoutWidth < 700;
  const scale = Math.max(
    MIN_LAYOUT_SCALE,
    Math.min(
      1,
      availableWidth / maxBasePanelWidth,
      allowVerticalOverflow ? 1 : availableHeight / Math.max(1, totalBasePanelsHeight),
    ),
  );
  const tileWidth = BASE_TILE_WIDTH * scale;
  const tileHeight = BASE_TILE_HEIGHT * scale;
  const tileGap = BASE_TILE_GAP * scale;
  const panelPadding = BASE_PANEL_PADDING * scale;
  const panelHeadingHeight = BASE_PANEL_HEADING_HEIGHT * scale;
  const sectionGap = BASE_SECTION_GAP * scale;
  const scaledPanelsHeight = totalBasePanelsHeight * scale;
  let nextPanelTop = allowVerticalOverflow
    ? contentTop
    : contentTop + Math.max(0, (availableHeight - scaledPanelsHeight) / 2);
  const boxes = [];
  const sections = baseSectionLayouts.map((baseSectionLayout) => {
    const panelWidth = baseSectionLayout.panelWidth * scale;
    const panelHeight = baseSectionLayout.panelHeight * scale;
    const panelLeft = (layoutWidth - panelWidth) / 2;
    const panelTop = nextPanelTop;
    nextPanelTop += panelHeight + sectionGap;
    const sectionBoxes = baseSectionLayout.section.items.map((item, index) => {
      const row = Math.floor(index / baseSectionLayout.columns);
      const column = index % baseSectionLayout.columns;
      const box = {
        ...item,
        category: baseSectionLayout.section.title,
        kind: baseSectionLayout.section.kind,
        previewType: item.previewType ?? item.preview,
        route: item.route ?? item.id,
        sectionId: baseSectionLayout.section.id,
        left: panelLeft + panelPadding + column * (tileWidth + tileGap),
        top: panelTop + panelPadding + panelHeadingHeight + row * (tileHeight + tileGap),
        width: tileWidth,
        height: tileHeight,
      };
      boxes.push(box);
      return box;
    });

    return {
      id: baseSectionLayout.section.id,
      title: baseSectionLayout.section.title,
      icon: baseSectionLayout.section.icon,
      kind: baseSectionLayout.section.kind,
      left: panelLeft,
      top: panelTop,
      width: panelWidth,
      height: panelHeight,
      columns: baseSectionLayout.columns,
      rows: baseSectionLayout.rows,
      padding: panelPadding,
      headingHeight: panelHeadingHeight,
      boxIds: sectionBoxes.map((box) => box.id),
    };
  });
  const panelsBottom = nextPanelTop - sectionGap;
  const backTop = allowVerticalOverflow ? panelsBottom + sectionGap : footerTop;
  const backBox = {
    id: FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID,
    label: "Back to Input Test",
    category: "Navigation",
    kind: "navigation",
    preview: "back",
    accent: "#22d3ee",
    left: (layoutWidth - backButtonWidth) / 2,
    top: backTop,
    width: backButtonWidth,
    height: backButtonHeight,
  };
  boxes.push(backBox);

  return {
    width: layoutWidth,
    height: layoutHeight,
    boxWidth: tileWidth,
    boxHeight: tileHeight,
    columnGap: tileGap,
    rowGap: tileGap,
    columns: Math.max(...sections.map((section) => section.columns), 1),
    rows: sections.reduce((total, section) => total + section.rows, 0),
    scale,
    contentTop,
    contentBottom: allowVerticalOverflow ? panelsBottom : viewportContentBottom,
    footerTop: backTop,
    scrollHeight: Math.max(layoutHeight, backTop + backButtonHeight + edgePadding),
    edgePadding,
    panelPadding,
    panelHeadingHeight,
    sections,
    boxes,
  };
}

export function createFullscreenModeLandingState(width, height) {
  return {
    layout: createFullscreenModeLandingLayout(width, height),
    handVerified: false,
    pointerActive: false,
    pointerX: 0,
    pointerY: 0,
    skeleton: { hands: [] },
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

export function resetFullscreenModeLandingHold(state) {
  const safeState = state ?? createFullscreenModeLandingState(1280, 720);
  return {
    ...safeState,
    handVerified: false,
    pointerActive: false,
    pointerX: 0,
    pointerY: 0,
    hoverModeId: null,
    holdModeId: null,
    holdMs: 0,
    selectedModeId: null,
  };
}

export function stepFullscreenModeLanding(state, dtSeconds, input) {
  const safeState = state ?? createFullscreenModeLandingState(1280, 720);
  if (input?.appActive === false) {
    return resetFullscreenModeLandingHold(safeState);
  }

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
  const hitPointer = {
    active: pointer.active,
    x: Number.isFinite(input?.hitPointerX)
      ? clamp(input.hitPointerX, 0, safeState.layout.width)
      : pointer.x,
    y: Number.isFinite(input?.hitPointerY)
      ? clamp(input.hitPointerY, 0, safeState.layout.scrollHeight ?? safeState.layout.height)
      : pointer.y,
  };
  const hoveredBox = getHoveredModeBox(safeState.layout, hitPointer);
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
    pointerActive: pointer.active,
    pointerX: pointer.active ? pointer.x : 0,
    pointerY: pointer.active ? pointer.y : 0,
    hoverModeId: hoveredModeId,
    holdModeId: hoveredModeId,
    holdMs,
    selectedModeId:
      hoveredModeId && holdMs >= FULLSCREEN_MODE_LANDING_HOLD_MS ? hoveredModeId : null,
  };
}
