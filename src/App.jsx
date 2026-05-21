import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyArcCalibration,
  applyAffineTransform,
  clampPoint,
  clearCalibration,
  createCalibrationTargets,
  evaluateArcCaptureConfidence,
  loadCalibration,
  saveCalibration,
  solveArcCalibrationFromSamples,
  solveAffineFromPairs,
} from "./calibration.js";
import {
  buildGridHoles,
  computeRunnerTrackGridLayout,
  GAME_DURATION_MS,
  getRunnerTrackIndexFromNormalized,
  getRunnerTrackOffsetFromIndex,
  isPointInCircle,
  MOLE_VISIBLE_MS,
  pickRandomHole,
  pickDistinctRandomChoice,
  randomSpawnDelay,
  shouldCollectRunnerCoin,
} from "./gameLogic.js";
import {
  BRICK_DODGER_BONUS_SCORE,
  createBrickDodgerGame,
  stepBrickDodgerGame,
} from "./brickDodgerGame.js";
import {
  BREAKOUT_BRICK_COLORS,
  BREAKOUT_BRICK_SCORE,
  BREAKOUT_CAPSULE_SCORE,
  BREAKOUT_COUNTDOWN_MS,
  FIND_YOUR_GRIND_BREAKOUT_MODE_ID,
  createBreakoutGame,
  createFindYourGrindBreakoutGame,
  stepBreakoutGame,
} from "./breakoutGame.js";
import {
  BREAKOUT_COOP_BRICK_SCORE,
  BREAKOUT_COOP_PRISM_BRICK_SCORE,
  BREAKOUT_COOP_SHIELD_COOLDOWN_MS,
  BREAKOUT_COOP_SHIELD_DURATION_MS,
  createBreakoutCoopGame,
  stepBreakoutCoopGame,
} from "./breakoutCoopGame.js";
import { selectBreakoutCoopSupportHand } from "./fullscreenBreakoutCoopInput.js";
import {
  FINGER_PONG_COUNTDOWN_MS,
  FINGER_PONG_MAX_SCORE,
  createFingerPongGame,
  stepFingerPongGame,
} from "./fingerPongGame.js";
import {
  createFullscreenHandBounceGame,
  stepFullscreenHandBounceGame,
} from "./fullscreenHandBounceGame.js";
import { createFlappyGame, flapFlappyGame, stepFlappyGame } from "./flappyGame.js";
import {
  getFullscreenTrackedHandLimit,
  getFullscreenTrackedFingerNames,
  shouldShowFullscreenNeonHandOutline,
  shouldShowFullscreenHandSkeleton,
  shouldShowFullscreenInvadersBanner,
} from "./fullscreenGameUi.js";
import { getFullscreenRingLayersForHand } from "./fullscreenRings.js";
import {
  getTipRippleStrokeWidth,
  getTouchingTipRippleStrokeWidth,
} from "./tipRipples.js";
import {
  FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID,
  FULLSCREEN_LANDING_MODE,
  FULLSCREEN_MODE_LANDING_HOLD_MS,
  createFullscreenLandingHandSkeleton,
  createFullscreenModeLandingState,
  getVerifiedFullscreenMenuHandPointerInput,
  hasVerifiedFullscreenMenuHand,
  resetFullscreenModeLandingHold,
  selectFullscreenModeLandingMode,
  stepFullscreenModeLanding,
} from "./fullscreenModeLanding.js";
import {
  areFullscreenExitControlStatesEqual,
  createFullscreenExitControlState,
  stepFullscreenExitControl,
} from "./fullscreenExitControl.js";
import {
  createFullscreenRestartControlState,
  stepFullscreenRestartControl,
} from "./fullscreenRestartControl.js";
import { getFullscreenRestartControlLabel } from "./fullscreenRestartModes.js";
import { runFullscreenOverlayGameUpdates } from "./fullscreenOverlayGames.js";
import {
  MISSILE_COMMAND_COUNTDOWN_MS,
  MISSILE_COMMAND_THREAT_SCORE,
  createMissileCommandGame,
  getMissileCommandExplosionRadius,
  launchMissileCommandInterceptor,
  stepMissileCommandGame,
} from "./missileCommandGame.js";
import {
  getMissileCommandCooldownUi,
  getMissileCommandCrosshairUi,
  getMissileCommandCountdownUi,
  getMissileCommandExplosionUi,
  getMissileCommandGameOverUi,
  getMissileCommandInterceptorUi,
  getMissileCommandLegendItems,
  getMissileCommandLaunchPreview,
  getMissileCommandSceneClassName,
  getMissileCommandStructureUi,
  getMissileCommandTargetWarnings,
  getMissileCommandThreatUi,
  getMissileCommandTacticalMetrics,
} from "./missileCommandUi.js";
import {
  SPACE_INVADERS_ENEMY_SCORE,
  createSpaceInvadersGame,
  stepSpaceInvadersGame,
} from "./spaceInvadersGame.js";
import {
  SKY_PATROL_STARTING_LIVES,
  createSkyPatrolGame,
  stepSkyPatrolGame,
} from "./skyPatrolGame.js";
import { WfcWorldRenderer } from "./wfc/WfcWorldRenderer.jsx";
import {
  WFC_WORLD_MODE_ID,
  createWfcWorldGame,
  createWfcWorldStepInput,
  stepWfcWorldGame,
} from "./wfc/wfcWorldGame.js";
import {
  areSkyPatrolHudStatesEqual,
  createSkyPatrolCanvasRenderer,
  getSkyPatrolHudState,
} from "./skyPatrolCanvas.js";
import { SKY_PATROL_SPRITE_ATLAS_URL } from "./skyPatrolSpriteAtlas.js";
import {
  SKY_PATROL_ACTIVE_HAND_CONNECTIONS,
  SKY_PATROL_ACTIVE_HAND_TIP_INDEXES,
  getSkyPatrolActiveHandTipStyle,
} from "./skyPatrolHandOverlay.js";
import {
  getSkyPatrolFireCooldownUi,
  getSkyPatrolGameOverUi,
  getSkyPatrolGunCooldownUi,
  getSkyPatrolHudItems,
  getSkyPatrolLegendUi,
  getSkyPatrolLifeIcons,
  getSkyPatrolStartPromptUi,
} from "./skyPatrolUi.js";
import {
  TIC_TAC_TOE_AI_MARK,
  TIC_TAC_TOE_AI_PIECE_LIMIT,
  TIC_TAC_TOE_PLAYER_MARK,
  TIC_TAC_TOE_PLAYER_PIECE_LIMIT,
  TIC_TAC_TOE_RESET_HOLD_MS,
  createTicTacToeGame,
  getTicTacToeCellIndex,
  getTicTacToeCellRect,
  restartTicTacToeRound,
  stepTicTacToeGame,
} from "./ticTacToeGame.js";
import {
  getTicTacToeCellUi,
  getTicTacToeCursorUi,
  getTicTacToeHudUi,
  getTicTacToeMarkUi,
  getTicTacToeReservePips,
  getTicTacToeResetUi,
  getTicTacToeTurnUi,
  getTicTacToeWinningLineUi,
} from "./ticTacToeUi.js";
import {
  FRUIT_NINJA_BASE_SCORE,
  FRUIT_NINJA_BLADE_TRAIL_MS,
  FRUIT_NINJA_BOMB_PENALTY,
  FRUIT_NINJA_COMBO_BONUS,
  FRUIT_NINJA_GAME_OVER_LIVES,
  createFruitNinjaGame,
  stepFruitNinjaGame,
} from "./fruitNinjaGame.js";
import {
  detectHands,
  getCurrentBackend,
  getCurrentRuntime,
  getLastDetectionMeta,
  initHandTracking,
} from "./handTracking.js";
import { assignStableHandLabels } from "./handLabeling.js";
import { getHandOverlayStyle } from "./handOverlayStyles.js";
import {
  getPinchClickExcludeSelector,
  shouldAcceptPinchClick,
  shouldBypassGlobalPinchDebounce,
} from "./pinchInput.js";
import {
  shouldShowInlineCameraPreview,
  shouldUseContainedCameraFit,
  shouldUseImmersiveAppLayout,
} from "./cameraLayout.js";
import {
  getCameraVideoKeepAliveAction,
  getStaleInferenceKeepAliveAction,
  shouldRunTrackingKeepAlive,
} from "./trackingKeepAlive.js";
import { detectPose, getLastPoseMeta, getPoseRuntime, initPoseTracking } from "./poseTracking.js";
import {
  createEmptyOffAxisState,
  createHeldOffAxisState,
  deriveOffAxisHeadState,
} from "./offAxisHeadTracking.js";
import { createScopedLogger } from "./logger.js";
import MinorityReportLab from "./components/MinorityReportLab.jsx";
import BodyPoseLab from "./components/BodyPoseLab.jsx";
import OffAxisChamberLab from "./components/OffAxisChamberLab.jsx";
import RouletteFingerGame from "./components/RouletteFingerGame.jsx";
import ConveyorSphereGame from "./components/ConveyorSphereGame.jsx";
import FullscreenLandingPage, {
  WebcamBackground,
} from "./components/FullscreenLandingPage.jsx";
import SpatialGestureMemory from "./components/SpatialGestureMemory.jsx";
import GestureAnalyticsLab from "./components/GestureAnalyticsLab.jsx";
import GestureArtLab from "./components/GestureArtLab.jsx";
import GestureControlOS from "./components/GestureControlOS.jsx";
import { createGestureEngine } from "./gestures/gestureEngine.js";
import { shouldShowWorkspaceNav } from "./workspaceNavigation.js";
import {
  RESIZABLE_LEFT_PANE_HANDLE_WIDTH_PX,
  RESIZABLE_LEFT_PANE_MIN_WIDTH_PX,
  clampResizableLeftPaneWidth,
} from "./layoutSizing.js";
import {
  ALL_GESTURE_IDS,
  GESTURE_DEFINITIONS,
  GESTURE_IDS,
  isTwoHandGesture,
} from "./gestures/constants.js";
import { createGesturePersonalization } from "./gestures/personalization.js";
import {
  createVirtualPianoGame,
  stepVirtualPianoGame,
} from "./virtualPianoGame.js";
import { startPianoNote } from "./virtualPianoAudio.js";

const PHASES = {
  CALIBRATION: "CALIBRATION",
  FULLSCREEN_CAMERA: "FULLSCREEN_CAMERA",
  SANDBOX: "SANDBOX",
  FLIGHT: "FLIGHT",
  RUNNER: "RUNNER",
  BODY_POSE: "BODY_POSE",
  OFF_AXIS_LAB: "OFF_AXIS_LAB",
  MINORITY_REPORT_LAB: "MINORITY_REPORT_LAB",
  CONVEYOR: "CONVEYOR",
  ROULETTE: "ROULETTE",
  SPATIAL_GESTURE_MEMORY: "SPATIAL_GESTURE_MEMORY",
  GESTURE_ANALYTICS_LAB: "GESTURE_ANALYTICS_LAB",
  GESTURE_ART_LAB: "GESTURE_ART_LAB",
  GESTURE_CONTROL_OS: "GESTURE_CONTROL_OS",
  GAME: "GAME",
};

const PINCH_START_THRESHOLD = 0.045;
const PINCH_END_THRESHOLD = 0.06;
const PINCH_DEBOUNCE_MS = 250;
const CURSOR_ALPHA = 0.35;
const CURSOR_TRAIL_DURATION_MS = 1000;
const CURSOR_TRAIL_SAMPLE_INTERVAL_MS = 34;
const CURSOR_TRAIL_MIN_DISTANCE_PX = 6;
const FULLSCREEN_GRID_SIZE_PX = 48;
const FULLSCREEN_HEX_RADIUS_PX = 28;
const FULLSCREEN_RING_TRAIL_DURATION_MS = 2000;
const FULLSCREEN_RING_TRAIL_SAMPLE_INTERVAL_MS = 34;
const FULLSCREEN_PULSE_RING_DURATION_MS = 1800;
const FULLSCREEN_PULSE_RING_INTERVAL_MS = 260;
const FULLSCREEN_RING_STEP_PX = 36;
const FULLSCREEN_STATIC_RING_STEP_PX = FULLSCREEN_RING_STEP_PX * 2;
const FULLSCREEN_TIP_RIPPLE_OUTER_DIAMETER_STEP_PX = FULLSCREEN_STATIC_RING_STEP_PX * 2;
const FULLSCREEN_TIP_RIPPLE_TOUCHING_STROKE_WIDTH_PX = getTouchingTipRippleStrokeWidth(
  FULLSCREEN_TIP_RIPPLE_OUTER_DIAMETER_STEP_PX,
);
const FULLSCREEN_RING_LAYERS = [
  { diameter: 44, color: "#ff0000" },
  { diameter: 80, color: "#ff8d00" },
  { diameter: 116, color: "#ffdb00" },
  { diameter: 152, color: "#00d619" },
  { diameter: 188, color: "#009fff" },
];
const FULLSCREEN_TIP_RIPPLE_COLORS = [
  FULLSCREEN_RING_LAYERS[1]?.color ?? "#ff8d00",
  FULLSCREEN_RING_LAYERS[2]?.color ?? "#ffdb00",
  FULLSCREEN_RING_LAYERS[3]?.color ?? "#00d619",
  FULLSCREEN_RING_LAYERS[4]?.color ?? "#009fff",
  FULLSCREEN_RING_LAYERS[0]?.color ?? "#ff0000",
];
const FULLSCREEN_VORONOI_DOT_RADIUS = 4.5;
const CIRCLE_OF_FIFTHS_AUTOSTART_SESSION_KEY = "circle-of-fifths-autostart";
const DESKTOP_LAYOUT_BREAKPOINT_PX = 980;
const LEFT_PANE_RESIZE_KEYBOARD_STEP_PX = 24;

function clipPolygonToHalfPlane(polygon, normalX, normalY, offset) {
  if (!Array.isArray(polygon) || polygon.length === 0) {
    return [];
  }

  const clipped = [];
  const isInside = (point) => normalX * point.x + normalY * point.y <= offset + 1e-6;
  const getIntersection = (start, end) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const denominator = normalX * deltaX + normalY * deltaY;
    if (Math.abs(denominator) < 1e-6) {
      return end;
    }
    const t = (offset - normalX * start.x - normalY * start.y) / denominator;
    return {
      x: start.x + deltaX * t,
      y: start.y + deltaY * t,
    };
  };

  for (let index = 0; index < polygon.length; index += 1) {
    const start = polygon[index];
    const end = polygon[(index + 1) % polygon.length];
    const startInside = isInside(start);
    const endInside = isInside(end);

    if (startInside && endInside) {
      clipped.push(end);
    } else if (startInside && !endInside) {
      clipped.push(getIntersection(start, end));
    } else if (!startInside && endInside) {
      clipped.push(getIntersection(start, end), end);
    }
  }

  return clipped;
}

function buildStaticRippleClipPolygon(point, points, viewport) {
  if (
    !viewport ||
    !Number.isFinite(point?.x) ||
    !Number.isFinite(point?.y) ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height)
  ) {
    return null;
  }

  const localPoint = {
    x: point.x - viewport.left,
    y: point.y - viewport.top,
  };
  let polygon = [
    { x: 0, y: 0 },
    { x: viewport.width, y: 0 },
    { x: viewport.width, y: viewport.height },
    { x: 0, y: viewport.height },
  ];

  for (const candidate of points) {
    if (
      candidate?.id === point.id ||
      !Number.isFinite(candidate?.x) ||
      !Number.isFinite(candidate?.y)
    ) {
      continue;
    }

    const candidateLocal = {
      x: candidate.x - viewport.left,
      y: candidate.y - viewport.top,
    };
    const normalX = candidateLocal.x - localPoint.x;
    const normalY = candidateLocal.y - localPoint.y;
    const offset =
      (candidateLocal.x * candidateLocal.x +
        candidateLocal.y * candidateLocal.y -
        localPoint.x * localPoint.x -
        localPoint.y * localPoint.y) /
      2;

    polygon = clipPolygonToHalfPlane(polygon, normalX, normalY, offset);
    if (polygon.length === 0) {
      return null;
    }
  }

  return polygon;
}

function getStaticRippleClipPath(point, points, viewport) {
  const polygon = buildStaticRippleClipPolygon(point, points, viewport);
  if (!polygon || polygon.length < 3) {
    return null;
  }

  return `polygon(${polygon
    .map(({ x, y }) => `${x.toFixed(2)}px ${y.toFixed(2)}px`)
    .join(", ")})`;
}

function getStaticRippleSeam(pointA, pointB, viewport) {
  if (
    !viewport ||
    !Number.isFinite(pointA?.x) ||
    !Number.isFinite(pointA?.y) ||
    !Number.isFinite(pointB?.x) ||
    !Number.isFinite(pointB?.y)
  ) {
    return null;
  }

  const a = {
    x: pointA.x - viewport.left,
    y: pointA.y - viewport.top,
  };
  const b = {
    x: pointB.x - viewport.left,
    y: pointB.y - viewport.top,
  };
  const normalX = b.x - a.x;
  const normalY = b.y - a.y;
  const offset = (b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y) / 2;
  const intersections = [];
  const registerPoint = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    if (x < -1e-6 || x > viewport.width + 1e-6 || y < -1e-6 || y > viewport.height + 1e-6) {
      return;
    }
    const roundedX = Math.min(viewport.width, Math.max(0, x));
    const roundedY = Math.min(viewport.height, Math.max(0, y));
    const alreadyRegistered = intersections.some(
      (point) =>
        Math.abs(point.x - roundedX) < 0.5 && Math.abs(point.y - roundedY) < 0.5,
    );
    if (!alreadyRegistered) {
      intersections.push({ x: roundedX, y: roundedY });
    }
  };

  if (Math.abs(normalY) >= 1e-6) {
    registerPoint(0, offset / normalY);
    registerPoint(viewport.width, (offset - normalX * viewport.width) / normalY);
  }
  if (Math.abs(normalX) >= 1e-6) {
    registerPoint(offset / normalX, 0);
    registerPoint((offset - normalY * viewport.height) / normalX, viewport.height);
  }

  if (intersections.length < 2) {
    return null;
  }

  let bestPair = null;
  let bestDistance = -1;
  for (let firstIndex = 0; firstIndex < intersections.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < intersections.length; secondIndex += 1) {
      const first = intersections[firstIndex];
      const second = intersections[secondIndex];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      if (distance > bestDistance) {
        bestDistance = distance;
        bestPair = { x1: first.x, y1: first.y, x2: second.x, y2: second.y };
      }
    }
  }

  return bestPair;
}
const CALIBRATION_SAMPLE_FRAMES = 10;
const ARC_CALIBRATION_READY_CONFIDENCE = 0.86;
const ARC_CALIBRATION_MAX_CAPTURE_FRAMES = 2400;
const INVALID_LANDMARK_RECOVERY_THRESHOLD = 45;
const NO_HAND_KEEP_ALIVE_NOTICE_THRESHOLD = 300;
const NO_HAND_KEEP_ALIVE_LOG_INTERVAL = 1800;
const HAND_DETECTION_GRACE_MS = 1600;
const INITIAL_TRACKING_RUNTIME = "mediapipe";
const FINGERTIP_OVERLAY_STYLES = {
  thumb: { fill: "rgba(255, 255, 255, 0.98)", radius: 6.2 },
  index: { fill: "rgba(255, 122, 89, 0.95)", radius: 4.8 },
  middle: { fill: "rgba(111, 245, 164, 0.95)", radius: 4.8 },
  ring: { fill: "rgba(128, 183, 255, 0.95)", radius: 4.8 },
  pinky: { fill: "rgba(226, 153, 255, 0.95)", radius: 4.8 },
};
const EXTENT_FINGER_NAMES = ["thumb", "index", "middle", "ring", "pinky"];
const EXTENT_LOG_SAMPLE_INTERVAL = 180;
const MIN_VISIBLE_SPAN = 1e-6;
const INPUT_TEST_GRID_ROWS = 6;
const INPUT_TEST_GRID_COLS = 10;
const INPUT_TEST_CELL_COUNT = INPUT_TEST_GRID_ROWS * INPUT_TEST_GRID_COLS;
const INPUT_TEST_CELL_GAP = 8;
const SANDBOX_BLOCK_COUNT = 4;
const SANDBOX_BLOCK_GAP = 14;
const SANDBOX_GRAVITY = 2050;
const SANDBOX_REST_VELOCITY = 28;
const SANDBOX_MAX_STEP_SECONDS = 0.05;
const SANDBOX_MAX_FLING_SPEED = 2200;
const SANDBOX_COLLISION_ITERATIONS = 4;
const SANDBOX_COLLISION_FRICTION = 0.2;
const SANDBOX_FLOOR_FRICTION = 0.86;
const SANDBOX_TOP_SPAWN_BAND_RATIO = 0.24;
const SANDBOX_SUPPORT_EPSILON = 8;
const SANDBOX_OVERHANG_ACCEL = 2100;
const SANDBOX_MATERIAL_SEQUENCE = ["steel", "steel", "rubber", "rubber"];
const SANDBOX_MATERIAL_PROPS = {
  steel: { restitution: 0.16, mass: 1.75, airDrag: 0.996 },
  rubber: { restitution: 0.62, mass: 1.05, airDrag: 0.992 },
};
const SANDBOX_MATERIAL_COLORS = {
  steel: ["#91a2b8", "#7d8fa8"],
  rubber: ["#ef4444", "#f97316"],
};
const FLIGHT_FINGER_ORDER = ["thumb", "index", "middle", "ring", "pinky"];
const FLIGHT_BASELINE_SAMPLE_TARGET = 34;
const FLIGHT_FORWARD_SPEED = 310;
const FLIGHT_STEER_ACCEL = 560;
const FLIGHT_DRAG_PER_60FPS = 0.9;
const FLIGHT_MAX_SHIP_OFFSET_X = 170;
const FLIGHT_MAX_SHIP_OFFSET_Y = 120;
const FLIGHT_STAR_COUNT = 170;
const FLIGHT_RING_COUNT = 7;
const FLIGHT_NEAR_Z = 26;
const FLIGHT_FAR_Z = 1480;
const FLIGHT_WORLD_HALF_WIDTH = 520;
const FLIGHT_WORLD_HALF_HEIGHT = 320;
const FLIGHT_HUD_UPDATE_MS = 90;
const FLIGHT_ROLL_WEIGHTS = [-2, -1, 0, 1, 2];
const RUNNER_TRACK_GRID_SIZE = 4;
const RUNNER_DEFAULT_TRACK_INDEX = Math.floor((RUNNER_TRACK_GRID_SIZE - 1) / 2);
const RUNNER_SPEED = 360;
const RUNNER_MAX_Z = 1480;
const RUNNER_NEAR_Z = 24;
const RUNNER_COIN_COUNT = 20;
const RUNNER_COIN_RESPAWN_MIN_Z = 860;
const RUNNER_COIN_RESPAWN_MAX_Z = 1880;
const RUNNER_HUD_UPDATE_MS = 90;
const RUNNER_LANE_SMOOTH_ALPHA = 0.19;
const RUNNER_COIN_COLOR_STEPS = [
  {
    maxDepthT: 0.2,
    fill: "#9aa3af",
    stroke: "#6d7784",
    glowInner: "rgba(233, 238, 245, 0.88)",
    glowOuter: "rgba(182, 192, 204, 0.07)",
  },
  {
    maxDepthT: 0.4,
    fill: "#73e48a",
    stroke: "#2d9c54",
    glowInner: "rgba(190, 255, 205, 0.9)",
    glowOuter: "rgba(91, 197, 116, 0.08)",
  },
  {
    maxDepthT: 0.6,
    fill: "#6bb9ff",
    stroke: "#2f74d6",
    glowInner: "rgba(184, 222, 255, 0.9)",
    glowOuter: "rgba(97, 154, 235, 0.08)",
  },
  {
    maxDepthT: 0.8,
    fill: "#b784ff",
    stroke: "#7a44d1",
    glowInner: "rgba(224, 193, 255, 0.9)",
    glowOuter: "rgba(152, 87, 232, 0.08)",
  },
  {
    maxDepthT: Number.POSITIVE_INFINITY,
    fill: "#ffd95f",
    stroke: "#f3a91f",
    glowInner: "rgba(255, 250, 170, 0.95)",
    glowOuter: "rgba(255, 204, 64, 0.08)",
  },
];
const TRACKING_MAX_HANDS = 2;
const LAB_DEFAULT_CONFIDENCE_THRESHOLD = 0.7;
const LAB_EVENT_LOG_LIMIT = 220;
const LAB_TRAIN_CAPTURE_FRAMES = 24;
const LAB_TRAIN_COUNTDOWN_SECONDS = 3;
const SGM_STORAGE_KEY = "spatial_gesture_memory_stats_v1";
const SGM_STEP_TIMEOUT_MS = 3600;
const SGM_GLOBAL_BASE_TIME_MS = 10000;
const SGM_GESTURE_POOL_EARLY = [
  GESTURE_IDS.SWIPE_LEFT,
  GESTURE_IDS.SWIPE_RIGHT,
  GESTURE_IDS.PINCH_GRAB,
  GESTURE_IDS.OPEN_PALM,
  GESTURE_IDS.PUSH_FORWARD,
  GESTURE_IDS.CIRCLE,
];
const SGM_GESTURE_POOL_ADVANCED = [
  GESTURE_IDS.EXPAND,
  GESTURE_IDS.COMPRESS,
  GESTURE_IDS.ROTATE_TWIST,
  GESTURE_IDS.SYMMETRIC_SWIPE,
];
const POSE_KEYPOINT_THRESHOLD = 0.2;
const POSE_CONNECTIONS = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_eye", "right_eye"],
  ["nose", "left_eye"],
  ["nose", "right_eye"],
  ["left_eye", "left_ear"],
  ["right_eye", "right_ear"],
];
const POSE_KEYPOINT_GROUPS = {
  head: ["nose", "left_ear", "right_ear"],
  eyes: ["left_eye", "right_eye"],
  shoulders: ["left_shoulder", "right_shoulder"],
  arms: ["left_elbow", "right_elbow", "left_wrist", "right_wrist"],
  torso: ["left_hip", "right_hip", "left_shoulder", "right_shoulder"],
};
const HAND_ROOT_CONNECTIONS = [
  [0, 1],
  [0, 5],
  [0, 9],
  [0, 13],
  [0, 17],
];
const HAND_WRIST_INDEX = 0;
const HAND_PALM_LANDMARK_INDEXES = [0, 5, 9, 13, 17];
const HAND_INDEX_KNUCKLE_INDEX = 5;
const HAND_MIDDLE_KNUCKLE_INDEX = 9;
const HAND_PINKY_KNUCKLE_INDEX = 17;
const HAND_FINGER_CHAINS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];
const HAND_FINGERTIP_INDEXES = [4, 8, 12, 16, 20];
const FINGERTIP_NAME_BY_INDEX = {
  4: "thumb",
  8: "index",
  12: "middle",
  16: "ring",
  20: "pinky",
};

const GESTURE_LABEL_BY_ID = GESTURE_DEFINITIONS.reduce((accumulator, definition) => {
  accumulator[definition.id] = definition.label;
  return accumulator;
}, {});

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerpValue(start, end, alpha) {
  return start + (end - start) * alpha;
}

function wrapAngleDelta(value) {
  let next = value;
  while (next > Math.PI) {
    next -= Math.PI * 2;
  }
  while (next < -Math.PI) {
    next += Math.PI * 2;
  }
  return next;
}

function roundMetric(value, digits = 4) {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Number(value.toFixed(digits));
}

function getRunnerCoinPaletteByDepth(depthT) {
  for (const step of RUNNER_COIN_COLOR_STEPS) {
    if (depthT < step.maxDepthT) {
      return step;
    }
  }
  return RUNNER_COIN_COLOR_STEPS[RUNNER_COIN_COLOR_STEPS.length - 1];
}

function createEmptyExtent() {
  return {
    count: 0,
    minU: 1,
    maxU: 0,
    minV: 1,
    maxV: 0,
  };
}

function createFingerExtentStats() {
  return {
    raw: createEmptyExtent(),
    clamped: createEmptyExtent(),
    visible: createEmptyExtent(),
    totalSamples: 0,
    clampedSamples: 0,
    outsideVisibleCount: 0,
  };
}

function createTrackingExtentState() {
  const fingers = EXTENT_FINGER_NAMES.reduce((accumulator, fingerName) => {
    accumulator[fingerName] = createFingerExtentStats();
    return accumulator;
  }, {});
  return {
    sampleFrames: 0,
    lastFrameId: 0,
    lastTimestamp: 0,
    rawOverall: createEmptyExtent(),
    clampedOverall: createEmptyExtent(),
    visibleOverall: createEmptyExtent(),
    totalTipSamples: 0,
    clampedTipSamples: 0,
    outsideVisibleTipSamples: 0,
    lastVisibleBounds: null,
    fingers,
  };
}

function updateExtentAccumulator(extent, u, v) {
  if (!extent || !Number.isFinite(u) || !Number.isFinite(v)) {
    return false;
  }
  extent.count += 1;
  extent.minU = Math.min(extent.minU, u);
  extent.maxU = Math.max(extent.maxU, u);
  extent.minV = Math.min(extent.minV, v);
  extent.maxV = Math.max(extent.maxV, v);
  return true;
}

function safeRatio(part, total) {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return part / total;
}

function normalizeTipToVisibleBounds(uRaw, vRaw, visibleBounds) {
  if (!visibleBounds || !Number.isFinite(uRaw) || !Number.isFinite(vRaw)) {
    return null;
  }
  const uSpan = Math.max(MIN_VISIBLE_SPAN, visibleBounds.uMax - visibleBounds.uMin);
  const vSpan = Math.max(MIN_VISIBLE_SPAN, visibleBounds.vMax - visibleBounds.vMin);
  const uVisibleRaw = (uRaw - visibleBounds.uMin) / uSpan;
  const vVisibleRaw = (vRaw - visibleBounds.vMin) / vSpan;
  const uVisible = clampValue(uVisibleRaw, 0, 1);
  const vVisible = clampValue(vVisibleRaw, 0, 1);

  return {
    u: uVisible,
    v: vVisible,
    uRaw: uVisibleRaw,
    vRaw: vVisibleRaw,
    inBounds:
      uRaw >= visibleBounds.uMin &&
      uRaw <= visibleBounds.uMax &&
      vRaw >= visibleBounds.vMin &&
      vRaw <= visibleBounds.vMax,
    wasClamped: uVisible !== uVisibleRaw || vVisible !== vVisibleRaw,
  };
}

function getCameraObjectFitForPhase(phase) {
  return shouldUseContainedCameraFit(phase) ? "contain" : "cover";
}

function pruneCursorTrail(trail, now) {
  return trail.filter((point) => now - point.timestamp <= FULLSCREEN_RING_TRAIL_DURATION_MS);
}

function pruneTrackedCursorTrail(trail, now) {
  return trail.filter((point) => now - point.timestamp <= CURSOR_TRAIL_DURATION_MS);
}

function prunePulseBursts(bursts, now) {
  return bursts.filter((burst) => now - burst.startTime <= FULLSCREEN_PULSE_RING_DURATION_MS);
}

function createFullscreenCameraViewport(stageWidth, stageHeight, aspectRatio) {
  let width = stageWidth;
  let height = width / aspectRatio;
  if (height > stageHeight) {
    height = stageHeight;
    width = height * aspectRatio;
  }

  const left = (stageWidth - width) / 2;
  const top = (stageHeight - height) / 2;

  return {
    left,
    top,
    width,
    height,
    style: {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    },
  };
}

function buildFullscreenHexCells(width, height, radius = FULLSCREEN_HEX_RADIUS_PX) {
  const hexWidth = Math.sqrt(3) * radius;
  const hexHeight = radius * 2;
  const verticalStep = radius * 1.5;
  const rows = Math.ceil(height / verticalStep) + 2;
  const cols = Math.ceil(width / hexWidth) + 2;
  const cells = [];
  const cellMap = new Map();

  for (let row = 0; row < rows; row += 1) {
    const centerY = radius + row * verticalStep;
    const rowOffsetX = (row % 2) * (hexWidth / 2);
    for (let col = 0; col < cols; col += 1) {
      const centerX = hexWidth / 2 + rowOffsetX + col * hexWidth;
      const left = centerX - hexWidth / 2;
      const top = centerY - radius;
      if (left >= width || top >= height || left + hexWidth <= 0 || top + hexHeight <= 0) {
        continue;
      }

      const q = col - ((row - (row & 1)) >> 1);
      const r = row;
      const key = `${q},${r}`;
      const cell = {
        key,
        q,
        r,
        centerX,
        centerY,
        style: {
          left: `${left}px`,
          top: `${top}px`,
          width: `${hexWidth}px`,
          height: `${hexHeight}px`,
        },
      };
      cells.push(cell);
      cellMap.set(key, cell);
    }
  }

  return {
    cells,
    cellMap,
  };
}

function createEmptyLabConfidenceMap() {
  return ALL_GESTURE_IDS.reduce((accumulator, gestureId) => {
    accumulator[gestureId] = 0;
    return accumulator;
  }, {});
}

function createEmptyLabEngineOutput() {
  return {
    frameId: 0,
    hands: [],
    events: [],
    confidences: createEmptyLabConfidenceMap(),
    heuristicConfidences: createEmptyLabConfidenceMap(),
    personalizedConfidences: createEmptyLabConfidenceMap(),
    liveVectors: {},
    continuous: {
      pinchActiveByHand: {},
      twoHandManipulationActive: false,
    },
    twoHand: { present: false },
  };
}

function randomChoice(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * values.length);
  return values[index] ?? values[0];
}

function formatSgmStepLabel(step) {
  const ids = Array.isArray(step) ? step : [step];
  return ids.map((gestureId) => GESTURE_LABEL_BY_ID[gestureId] ?? gestureId).join(" + ");
}

function createInitialSpatialMemoryStats() {
  return {
    highScore: 0,
    bestRound: 1,
    totalRounds: 0,
    completedRounds: 0,
  };
}

function createInitialSpatialMemoryState() {
  return {
    active: false,
    status: "idle",
    round: 1,
    sequence: [],
    currentStepIndex: 0,
    stepProgressIds: [],
    expectedStep: null,
    expectedLabel: "Press Start",
    stepDeadline: 0,
    roundStartAt: 0,
    elapsedSeconds: 0,
    message: "Watch the sequence, then reproduce it in order.",
    lastActionLabel: "—",
    accuracy: 1,
    smoothness: 0,
    score: 0,
    ...createInitialSpatialMemoryStats(),
    successRate: 0,
    difficultyLevel: 1,
    sequenceLength: 0,
    recentStepDurations: [],
  };
}

function loadSpatialMemoryStats() {
  try {
    const raw = window.localStorage.getItem(SGM_STORAGE_KEY);
    if (!raw) {
      return createInitialSpatialMemoryStats();
    }
    const parsed = JSON.parse(raw);
    return {
      highScore: Number.isFinite(parsed?.highScore) ? parsed.highScore : 0,
      bestRound: Number.isFinite(parsed?.bestRound) ? parsed.bestRound : 1,
      totalRounds: Number.isFinite(parsed?.totalRounds) ? parsed.totalRounds : 0,
      completedRounds: Number.isFinite(parsed?.completedRounds) ? parsed.completedRounds : 0,
    };
  } catch {
    return createInitialSpatialMemoryStats();
  }
}

function saveSpatialMemoryStats(stats) {
  try {
    window.localStorage.setItem(SGM_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore persistence errors
  }
}

function buildSpatialSequence(round, difficultyLevel) {
  const length = Math.max(2, round + 1);
  const sequence = [];
  for (let i = 0; i < length; i += 1) {
    const shouldUseCombo = difficultyLevel >= 4 && i > 0 && Math.random() < 0.25;
    if (shouldUseCombo) {
      const first = randomChoice(SGM_GESTURE_POOL_EARLY);
      const second = pickDistinctRandomChoice(
        [...SGM_GESTURE_POOL_EARLY, ...SGM_GESTURE_POOL_ADVANCED],
        first,
      );
      sequence.push([first, second]);
      continue;
    }
    const pool = difficultyLevel >= 3 && i >= 2
      ? [...SGM_GESTURE_POOL_EARLY, ...SGM_GESTURE_POOL_ADVANCED]
      : SGM_GESTURE_POOL_EARLY;
    sequence.push(randomChoice(pool));
  }
  return sequence;
}

function createInitialLabTrainingState() {
  return {
    active: false,
    phase: "idle",
    gestureId: null,
    gestureLabel: null,
    countdown: 0,
    capturedFrames: 0,
    targetFrames: LAB_TRAIN_CAPTURE_FRAMES,
    message: "Record samples to personalize gesture recognition.",
  };
}

function summarizeEventMeta(meta) {
  if (!meta || typeof meta !== "object") {
    return "";
  }
  if (meta.direction) {
    return `dir=${meta.direction}`;
  }
  if (meta.pointer && Number.isFinite(meta.pointer.x) && Number.isFinite(meta.pointer.y)) {
    return `p=${meta.pointer.x.toFixed(2)},${meta.pointer.y.toFixed(2)}`;
  }
  if (meta.pinchDistance && Number.isFinite(meta.pinchDistance)) {
    return `d=${meta.pinchDistance.toFixed(3)}`;
  }
  return "";
}

function createEmptyPoseStatus() {
  return {
    detected: false,
    score: 0,
    keypointsCount: 0,
    handsCount: 0,
    fingerCount: 0,
    fingertipCount: 0,
    parts: {
      head: false,
      eyes: false,
      shoulders: false,
      arms: false,
      torso: false,
      fingers: false,
      fingertips: false,
    },
    offAxis: createEmptyOffAxisState(),
  };
}

function hasVisiblePoseKeypoints(map, names, minScore = POSE_KEYPOINT_THRESHOLD) {
  for (const name of names) {
    const point = map[name];
    if (point && Number.isFinite(point.score) && point.score >= minScore) {
      return true;
    }
  }
  return false;
}

function isValidHandLandmark(point) {
  return Boolean(point && Number.isFinite(point.u) && Number.isFinite(point.v));
}

function summarizeFingerVisibilityFromHands(hands) {
  const summary = {
    handsCount: Array.isArray(hands) ? hands.length : 0,
    fingerCount: 0,
    fingertipCount: 0,
    fingersVisible: false,
    fingertipsVisible: false,
  };
  if (!Array.isArray(hands) || hands.length === 0) {
    return summary;
  }

  for (const hand of hands) {
    const landmarks = Array.isArray(hand?.landmarks) ? hand.landmarks : [];
    for (const chain of HAND_FINGER_CHAINS) {
      const visibleSegments = chain.filter((index) => isValidHandLandmark(landmarks[index])).length;
      if (visibleSegments >= 3) {
        summary.fingerCount += 1;
      }
    }
    for (const tipIndex of HAND_FINGERTIP_INDEXES) {
      const tipFromLandmarks = landmarks[tipIndex];
      const tipName = FINGERTIP_NAME_BY_INDEX[tipIndex];
      const tipFromFingerTips = hand?.fingerTips?.[tipName];
      if (isValidHandLandmark(tipFromFingerTips) || isValidHandLandmark(tipFromLandmarks)) {
        summary.fingertipCount += 1;
      }
    }
  }

  summary.fingersVisible = summary.fingerCount > 0;
  summary.fingertipsVisible = summary.fingertipCount > 0;
  return summary;
}

function summarizeExtentForLog(extent, canvasWidth, canvasHeight) {
  if (!extent || extent.count === 0) {
    return null;
  }

  const normalized = {
    uMin: roundMetric(extent.minU),
    uMax: roundMetric(extent.maxU),
    vMin: roundMetric(extent.minV),
    vMax: roundMetric(extent.maxV),
    uSpan: roundMetric(extent.maxU - extent.minU),
    vSpan: roundMetric(extent.maxV - extent.minV),
  };

  const hasCanvas = Number.isFinite(canvasWidth) && canvasWidth > 0 && Number.isFinite(canvasHeight) && canvasHeight > 0;
  const pixels = hasCanvas
    ? {
        xMin: roundMetric(extent.minU * canvasWidth, 2),
        xMax: roundMetric(extent.maxU * canvasWidth, 2),
        yMin: roundMetric(extent.minV * canvasHeight, 2),
        yMax: roundMetric(extent.maxV * canvasHeight, 2),
        xSpan: roundMetric((extent.maxU - extent.minU) * canvasWidth, 2),
        ySpan: roundMetric((extent.maxV - extent.minV) * canvasHeight, 2),
      }
    : null;

  return {
    samples: extent.count,
    mirroredNormalized: normalized,
    canvasPixels: pixels,
  };
}

function summarizeFingerExtentStats(fingerStats, canvasWidth, canvasHeight) {
  if (!fingerStats || fingerStats.totalSamples === 0) {
    return null;
  }

  return {
    samples: fingerStats.totalSamples,
    clampedSamples: fingerStats.clampedSamples,
    clampedRatio: roundMetric(safeRatio(fingerStats.clampedSamples, fingerStats.totalSamples), 6),
    outsideVisibleSamples: fingerStats.outsideVisibleCount,
    outsideVisibleRatio: roundMetric(
      safeRatio(fingerStats.outsideVisibleCount, fingerStats.totalSamples),
      6,
    ),
    raw: summarizeExtentForLog(fingerStats.raw, canvasWidth, canvasHeight),
    clamped: summarizeExtentForLog(fingerStats.clamped, canvasWidth, canvasHeight),
    visibleNormalized: summarizeExtentForLog(fingerStats.visible, canvasWidth, canvasHeight),
  };
}

function isPointInsideClientRect(point, rect) {
  if (!point || !rect) {
    return false;
  }
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

function clickButtonAtPoint(point, options = {}) {
  const { excludeInsideSelector = null } = options;
  if (!point) {
    return false;
  }

  const buttons = Array.from(document.querySelectorAll("button"));
  for (let index = buttons.length - 1; index >= 0; index -= 1) {
    const button = buttons[index];
    if (!button || button.disabled) {
      continue;
    }
    if (excludeInsideSelector && button.closest(excludeInsideSelector)) {
      continue;
    }

    const rect = button.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      continue;
    }
    if (isPointInsideClientRect(point, rect)) {
      button.click();
      return true;
    }
  }

  return false;
}

function isArcCalibrationModel(model) {
  return Boolean(model && typeof model === "object" && model.kind === "arc");
}

function computeFittedGridSize(containerWidth, containerHeight, columns, rows, gap) {
  if (
    !Number.isFinite(containerWidth) ||
    !Number.isFinite(containerHeight) ||
    containerWidth <= 0 ||
    containerHeight <= 0
  ) {
    return { width: 0, height: 0, cellSize: 0 };
  }

  const horizontalGapTotal = Math.max(0, columns - 1) * gap;
  const verticalGapTotal = Math.max(0, rows - 1) * gap;
  const maxCellFromWidth = (containerWidth - horizontalGapTotal) / columns;
  const maxCellFromHeight = (containerHeight - verticalGapTotal) / rows;
  const fittedCellSize = Math.floor(Math.max(0, Math.min(maxCellFromWidth, maxCellFromHeight)));

  if (!Number.isFinite(fittedCellSize) || fittedCellSize <= 0) {
    return { width: 0, height: 0, cellSize: 0 };
  }

  return {
    width: fittedCellSize * columns + horizontalGapTotal,
    height: fittedCellSize * rows + verticalGapTotal,
    cellSize: fittedCellSize,
  };
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const next = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = next;
  }
  return copy;
}

function randomBetween(min, max) {
  return min + Math.random() * Math.max(0, max - min);
}

function doBlocksOverlap(a, b, padding = 0) {
  return (
    a.x < b.x + b.size + padding &&
    a.x + a.size + padding > b.x &&
    a.y < b.y + b.size + padding &&
    a.y + a.size + padding > b.y
  );
}

function createEmptyFlightBaseline() {
  return {
    ready: false,
    sampleCount: 0,
    centroid: { u: 0.5, v: 0.5 },
    principalAngle: 0,
    openness: 0.2,
    tips: FLIGHT_FINGER_ORDER.map(() => ({ u: 0.5, v: 0.5 })),
  };
}

function computeFiveFingerPose(fingerTips) {
  if (!fingerTips || typeof fingerTips !== "object") {
    return null;
  }

  const points = [];
  for (const fingerName of FLIGHT_FINGER_ORDER) {
    const tip = fingerTips[fingerName];
    if (!tip || !Number.isFinite(tip.u) || !Number.isFinite(tip.v)) {
      return null;
    }
    points.push({ u: tip.u, v: tip.v });
  }

  const centroid = points.reduce(
    (accumulator, point) => {
      accumulator.u += point.u;
      accumulator.v += point.v;
      return accumulator;
    },
    { u: 0, v: 0 },
  );
  centroid.u /= points.length;
  centroid.v /= points.length;

  let covarianceXX = 0;
  let covarianceYY = 0;
  let covarianceXY = 0;
  let openness = 0;
  for (const point of points) {
    const du = point.u - centroid.u;
    const dv = point.v - centroid.v;
    covarianceXX += du * du;
    covarianceYY += dv * dv;
    covarianceXY += du * dv;
    openness += Math.hypot(du, dv);
  }

  covarianceXX /= points.length;
  covarianceYY /= points.length;
  covarianceXY /= points.length;
  openness /= points.length;
  const principalAngle = 0.5 * Math.atan2(2 * covarianceXY, covarianceXX - covarianceYY);

  return {
    points,
    centroid,
    openness,
    principalAngle,
  };
}

function createFlightStars() {
  const stars = [];
  for (let index = 0; index < FLIGHT_STAR_COUNT; index += 1) {
    stars.push({
      x: randomBetween(-FLIGHT_WORLD_HALF_WIDTH, FLIGHT_WORLD_HALF_WIDTH),
      y: randomBetween(-FLIGHT_WORLD_HALF_HEIGHT, FLIGHT_WORLD_HALF_HEIGHT),
      z: randomBetween(FLIGHT_NEAR_Z * 2.4, FLIGHT_FAR_Z),
    });
  }
  return stars;
}

function createFlightRings() {
  const rings = [];
  const spacing = (FLIGHT_FAR_Z - 280) / Math.max(1, FLIGHT_RING_COUNT);
  for (let index = 0; index < FLIGHT_RING_COUNT; index += 1) {
    rings.push({
      x: randomBetween(-170, 170),
      y: randomBetween(-108, 108),
      z: 280 + index * spacing + randomBetween(-90, 90),
      radius: randomBetween(34, 66),
    });
  }
  return rings;
}

function pickRandomRunnerTrackIndex() {
  return Math.floor(Math.random() * RUNNER_TRACK_GRID_SIZE);
}

function createRunnerCoin(zMin = RUNNER_COIN_RESPAWN_MIN_Z, zMax = RUNNER_COIN_RESPAWN_MAX_Z) {
  const trackXIndex = pickRandomRunnerTrackIndex();
  const trackYIndex = pickRandomRunnerTrackIndex();
  return {
    id: Math.random().toString(36).slice(2),
    trackXIndex,
    trackYIndex,
    trackX: getRunnerTrackOffsetFromIndex(trackXIndex, RUNNER_TRACK_GRID_SIZE),
    trackY: getRunnerTrackOffsetFromIndex(trackYIndex, RUNNER_TRACK_GRID_SIZE),
    z: randomBetween(zMin, zMax),
    height: 0,
    value: 1,
  };
}

function createRunnerCoins() {
  const coins = [];
  for (let index = 0; index < RUNNER_COIN_COUNT; index += 1) {
    const baseZ =
      RUNNER_COIN_RESPAWN_MIN_Z +
      (index / Math.max(1, RUNNER_COIN_COUNT - 1)) *
        (RUNNER_COIN_RESPAWN_MAX_Z - RUNNER_COIN_RESPAWN_MIN_Z);
    coins.push(createRunnerCoin(baseZ, baseZ + randomBetween(90, 240)));
  }
  return coins;
}

function createSandboxBlocks(stageWidth, stageHeight) {
  const safeWidth = Math.max(320, stageWidth);
  const safeHeight = Math.max(240, stageHeight);
  const horizontalPadding = Math.max(14, safeWidth * 0.04);
  const topPadding = Math.max(8, safeHeight * 0.03);
  const spawnBandHeight = Math.max(68, safeHeight * SANDBOX_TOP_SPAWN_BAND_RATIO);
  const maxSizeFromWidth =
    (safeWidth - horizontalPadding * 2 - SANDBOX_BLOCK_GAP * (SANDBOX_BLOCK_COUNT - 1)) /
    SANDBOX_BLOCK_COUNT;
  const desiredSize = Math.min(safeWidth * 0.2, safeHeight * 0.24);
  const blockSize = Math.floor(clampValue(Math.min(desiredSize, maxSizeFromWidth), 42, 132));
  const xMin = horizontalPadding;
  const xMax = safeWidth - horizontalPadding - blockSize;
  const yMin = topPadding;
  const yMax = topPadding + Math.max(0, spawnBandHeight - blockSize);
  const placementPadding = Math.max(4, SANDBOX_BLOCK_GAP * 0.35);

  const shuffledMaterials = shuffleArray(SANDBOX_MATERIAL_SEQUENCE);
  const colorDeckByMaterial = {
    steel: shuffleArray(SANDBOX_MATERIAL_COLORS.steel),
    rubber: shuffleArray(SANDBOX_MATERIAL_COLORS.rubber),
  };
  const colorIndexByMaterial = {
    steel: 0,
    rubber: 0,
  };

  const blocks = [];
  for (let blockIndex = 0; blockIndex < SANDBOX_BLOCK_COUNT; blockIndex += 1) {
    const material = shuffledMaterials[blockIndex] ?? "steel";
    const palette = colorDeckByMaterial[material] ?? SANDBOX_MATERIAL_COLORS.steel;
    const color = palette[colorIndexByMaterial[material] % palette.length];
    colorIndexByMaterial[material] += 1;

    let placed = null;
    for (let attempt = 0; attempt < 220; attempt += 1) {
      const candidate = {
        x: randomBetween(xMin, xMax),
        y: randomBetween(yMin, yMax),
        size: blockSize,
      };
      const collides = blocks.some((other) =>
        doBlocksOverlap(other, candidate, placementPadding),
      );
      if (!collides) {
        placed = candidate;
        break;
      }
    }

    if (!placed) {
      const slotStride = (safeWidth - horizontalPadding * 2 - blockSize) / Math.max(1, SANDBOX_BLOCK_COUNT - 1);
      const fallbackX = clampValue(
        horizontalPadding + blockIndex * slotStride,
        xMin,
        xMax,
      );
      const fallbackY = yMin + (blockIndex % 2) * Math.min(blockSize * 0.36, spawnBandHeight * 0.44);
      placed = { x: fallbackX, y: fallbackY, size: blockSize };
    }

    const materialProps = SANDBOX_MATERIAL_PROPS[material] ?? SANDBOX_MATERIAL_PROPS.steel;
    blocks.push({
      id: blockIndex + 1,
      x: placed.x,
      y: placed.y,
      size: blockSize,
      vx: 0,
      vy: 0,
      material,
      restitution: materialProps.restitution,
      mass: materialProps.mass,
      airDrag: materialProps.airDrag,
      color,
    });
  }

  return blocks;
}

export default function App() {
  const appLog = useMemo(() => createScopedLogger("app"), []);
  const gestureEngineRef = useRef(null);
  const personalizationRef = useRef(null);

  if (!gestureEngineRef.current) {
    gestureEngineRef.current = createGestureEngine({
      logger: createScopedLogger("gestureEngine"),
    });
  }
  if (!personalizationRef.current) {
    personalizationRef.current = createGesturePersonalization({
      logger: createScopedLogger("gesturePersonalization"),
    });
  }

  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [phase, setPhase] = useState(PHASES.FULLSCREEN_CAMERA);
  const [leftPaneWidth, setLeftPaneWidth] = useState(null);
  const [isLeftPaneResizing, setIsLeftPaneResizing] = useState(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraAspectRatio, setCameraAspectRatio] = useState(4 / 3);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState("");
  const [activeBackend, setActiveBackend] = useState("n/a");
  const [activeRuntime, setActiveRuntime] = useState(INITIAL_TRACKING_RUNTIME);

  const [handDetected, setHandDetected] = useState(false);
  const [pinchActive, setPinchActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [cursor, setCursor] = useState(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }));
  const [rawCursor, setRawCursor] = useState(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }));
  const [cursorTrail, setCursorTrail] = useState([]);
  const [cursorTrailNow, setCursorTrailNow] = useState(() => performance.now());
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [labConfidenceThreshold, setLabConfidenceThreshold] = useState(
    LAB_DEFAULT_CONFIDENCE_THRESHOLD,
  );
  const [labShowSkeleton, setLabShowSkeleton] = useState(true);
  const [labShowTrails, setLabShowTrails] = useState(true);
  const [labPersonalizationEnabled, setLabPersonalizationEnabled] = useState(true);
  const [labEngineOutput, setLabEngineOutput] = useState(createEmptyLabEngineOutput);
  const [labEventLog, setLabEventLog] = useState([]);
  const [labSampleCounts, setLabSampleCounts] = useState(() =>
    personalizationRef.current.getSampleCounts(),
  );
  const [labTrainingState, setLabTrainingState] = useState(createInitialLabTrainingState);
  const [spatialMemoryState, setSpatialMemoryState] = useState(() => {
    const base = createInitialSpatialMemoryState();
    const persisted = loadSpatialMemoryStats();
    return {
      ...base,
      ...persisted,
      successRate: persisted.totalRounds > 0 ? persisted.completedRounds / persisted.totalRounds : 0,
    };
  });
  const [analyticsHands, setAnalyticsHands] = useState([]);
  const [analyticsTimestamp, setAnalyticsTimestamp] = useState(0);
  const [gestureAnalyticsLabSessionKey, setGestureAnalyticsLabSessionKey] = useState(0);
  const [gestureArtHands, setGestureArtHands] = useState([]);
  const [gestureArtSessionKey, setGestureArtSessionKey] = useState(0);
  const [gestureControlOSSessionKey, setGestureControlOSSessionKey] = useState(0);
  const [fullscreenIndexPoints, setFullscreenIndexPoints] = useState([]);
  const [fullscreenTipPoints, setFullscreenTipPoints] = useState([]);
  const [fullscreenGridMode, setFullscreenGridMode] = useState(FULLSCREEN_LANDING_MODE);
  const [fullscreenModeLandingState, setFullscreenModeLandingState] = useState(null);
  const [fullscreenExitControlState, setFullscreenExitControlState] = useState(null);
  const [fullscreenRestartControlState, setFullscreenRestartControlState] = useState(null);
  const [fullscreenRingTrail, setFullscreenRingTrail] = useState([]);
  const [fullscreenRingTrailNow, setFullscreenRingTrailNow] = useState(() => performance.now());
  const [fullscreenPulseBursts, setFullscreenPulseBursts] = useState([]);
  const [fullscreenPulseNow, setFullscreenPulseNow] = useState(() => performance.now());
  const [fullscreenTipRippleNow, setFullscreenTipRippleNow] = useState(() => performance.now());
  const [fullscreenHandBounceState, setFullscreenHandBounceState] = useState(null);
  const [fullscreenBrickDodgerState, setFullscreenBrickDodgerState] = useState(null);
  const [fullscreenBreakoutState, setFullscreenBreakoutState] = useState(null);
  const [fullscreenBreakoutCoopState, setFullscreenBreakoutCoopState] = useState(null);
  const [fullscreenFingerPongState, setFullscreenFingerPongState] = useState(null);
  const [fullscreenFruitNinjaState, setFullscreenFruitNinjaState] = useState(null);
  const [fullscreenSkyPatrolHud, setFullscreenSkyPatrolHud] = useState(null);
  const [fullscreenWfcWorldState, setFullscreenWfcWorldState] = useState(null);
  const [fullscreenInvadersState, setFullscreenInvadersState] = useState(null);
  const [fullscreenFlappyState, setFullscreenFlappyState] = useState(null);
  const [fullscreenMissileCommandState, setFullscreenMissileCommandState] = useState(null);
  const [fullscreenTicTacToeState, setFullscreenTicTacToeState] = useState(null);
  const [fullscreenVirtualPianoState, setFullscreenVirtualPianoState] = useState(null);
  const [poseModelReady, setPoseModelReady] = useState(false);
  const [poseModelError, setPoseModelError] = useState("");
  const [poseStatus, setPoseStatus] = useState(createEmptyPoseStatus);

  const [transform, setTransform] = useState(null);
  const [hasSavedCalibration, setHasSavedCalibration] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationTargets, setCalibrationTargets] = useState(() =>
    createCalibrationTargets(window.innerWidth, window.innerHeight),
  );
  const [calibrationTargetIndex, setCalibrationTargetIndex] = useState(0);
  const [calibrationPairsCount, setCalibrationPairsCount] = useState(0);
  const [calibrationSampleFrames, setCalibrationSampleFrames] = useState(0);
  const [calibrationMessage, setCalibrationMessage] = useState(
    "Press Start Calibration to begin.",
  );
  const [isArcCalibrating, setIsArcCalibrating] = useState(false);
  const [arcCalibrationProgress, setArcCalibrationProgress] = useState(0);
  const [arcCalibrationSamples, setArcCalibrationSamples] = useState(0);
  const [inputTestHoveredCell, setInputTestHoveredCell] = useState(-1);
  const [inputTestGridSize, setInputTestGridSize] = useState({
    width: 0,
    height: 0,
    cellSize: 0,
  });
  const [sandboxBlocks, setSandboxBlocks] = useState([]);
  const [sandboxGrabbedBlockId, setSandboxGrabbedBlockId] = useState(null);
  const [flightHud, setFlightHud] = useState({
    yaw: 0,
    pitch: 0,
    roll: 0,
    confidence: 0,
    baselineReady: false,
    baselineSamples: 0,
    distance: 0,
  });
  const [runnerHud, setRunnerHud] = useState({
    coins: 0,
    distance: 0,
    trackCol: RUNNER_DEFAULT_TRACK_INDEX + 1,
    trackRow: RUNNER_DEFAULT_TRACK_INDEX + 1,
    trackSpacingPx: 0,
  });

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Math.ceil(GAME_DURATION_MS / 1000));
  const [gameRunning, setGameRunning] = useState(false);
  const [activeMoleIndex, setActiveMoleIndex] = useState(null);
  const [holes, setHoles] = useState([]);

  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const cameraWrapRef = useRef(null);
  const contentGridRef = useRef(null);
  const cameraPaneRef = useRef(null);
  const boardRef = useRef(null);
  const inputTestStageRef = useRef(null);
  const sandboxStageRef = useRef(null);
  const flightStageRef = useRef(null);
  const flightCanvasRef = useRef(null);
  const runnerStageRef = useRef(null);
  const runnerCanvasRef = useRef(null);
  const fullscreenSkyPatrolCanvasRef = useRef(null);
  const inputTestCellRefs = useRef([]);
  const leftPaneResizeStateRef = useRef({
    startWidth: 0,
    startX: 0,
  });

  const detectorRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const poseInitPromiseRef = useRef(null);
  const streamRef = useRef(null);
  const attachedVideoElementRef = useRef(null);
  const rafRef = useRef(0);
  const inferenceBusyRef = useRef(false);
  const activeInferenceTokenRef = useRef(0);
  const lastInferenceStartedAtRef = useRef(0);
  const lastInferenceCompletedAtRef = useRef(0);
  const lastTrackingKeepAliveAtRef = useRef(0);
  const mountedRef = useRef(true);

  const phaseRef = useRef(phase);
  const poseStatusRef = useRef(poseStatus);
  const spatialMemoryRef = useRef(spatialMemoryState);
  const viewportRef = useRef(viewport);
  const transformRef = useRef(transform);
  const cursorRef = useRef(cursor);
  const rawCursorRef = useRef(rawCursor);
  const cursorTrailRef = useRef([]);
  const cursorTrailLastSampleAtRef = useRef(0);
  const fullscreenRingTrailRef = useRef([]);
  const fullscreenRingTrailLastSampleAtRef = useRef(0);
  const fullscreenPulseBurstsRef = useRef([]);
  const fullscreenPulseLastEmitByIdRef = useRef({});
  const fullscreenTipRippleStartedAtRef = useRef(0);
  const fullscreenGridModeRef = useRef(fullscreenGridMode);
  const fullscreenModeLandingStateRef = useRef(null);
  const fullscreenModeLandingViewportRef = useRef(null);
  const fullscreenModeLandingLastTickRef = useRef(0);
  const fullscreenModeLandingScrollTopRef = useRef(0);
  const fullscreenLandingAppActiveRef = useRef(true);
  const fullscreenExitControlStateRef = useRef(null);
  const fullscreenExitControlViewportRef = useRef(null);
  const fullscreenExitControlLastTickRef = useRef(0);
  const fullscreenRestartControlStateRef = useRef(null);
  const fullscreenRestartControlViewportRef = useRef(null);
  const fullscreenRestartControlLastTickRef = useRef(0);
  const fullscreenHandsRef = useRef([]);
  const fullscreenPrimaryHandIdRef = useRef(null);
  const fullscreenHandBounceStateRef = useRef(null);
  const fullscreenHandBounceViewportRef = useRef(null);
  const fullscreenHandBounceLastTickRef = useRef(0);
  const fullscreenBrickDodgerStateRef = useRef(null);
  const fullscreenBrickDodgerViewportRef = useRef(null);
  const fullscreenBrickDodgerLastTickRef = useRef(0);
  const fullscreenBreakoutStateRef = useRef(null);
  const fullscreenBreakoutCoopStateRef = useRef(null);
  const fullscreenFingerPongStateRef = useRef(null);
  const fullscreenFruitNinjaStateRef = useRef(null);
  const fullscreenSkyPatrolHudRef = useRef(null);
  const fullscreenSkyPatrolStateRef = useRef(null);
  const fullscreenSkyPatrolRendererRef = useRef(null);
  const fullscreenSkyPatrolSpriteImageRef = useRef(null);
  const fullscreenWfcWorldStateRef = useRef(null);
  const fullscreenWfcWorldViewportRef = useRef(null);
  const fullscreenWfcWorldLastTickRef = useRef(0);
  const fullscreenWfcWorldMouseInputRef = useRef({
    pointerActive: false,
    pointerX: 0,
    pointerY: 0,
    pinchActive: false,
    pinchStarted: false,
  });
  const fullscreenInvadersStateRef = useRef(null);
  const fullscreenBreakoutViewportRef = useRef(null);
  const fullscreenFingerPongViewportRef = useRef(null);
  const fullscreenBreakoutLastTickRef = useRef(0);
  const fullscreenBreakoutCoopViewportRef = useRef(null);
  const fullscreenBreakoutCoopLastTickRef = useRef(0);
  const fullscreenBreakoutCoopPrimaryPinchLatchRef = useRef(false);
  const fullscreenBreakoutCoopSecondaryPinchLatchRef = useRef(false);
  const fullscreenFingerPongLastTickRef = useRef(0);
  const fullscreenFruitNinjaLastTickRef = useRef(0);
  const fullscreenSkyPatrolViewportRef = useRef(null);
  const fullscreenSkyPatrolLastTickRef = useRef(0);
  const fullscreenInvadersLastTickRef = useRef(0);
  const fullscreenFlappyStateRef = useRef(null);
  const fullscreenFlappyViewportRef = useRef(null);
  const fullscreenFlappyLastTickRef = useRef(0);
  const fullscreenMissileCommandStateRef = useRef(null);
  const fullscreenMissileCommandViewportRef = useRef(null);
  const fullscreenMissileCommandLastTickRef = useRef(0);
  const fullscreenTicTacToeStateRef = useRef(null);
  const fullscreenTicTacToeViewportRef = useRef(null);
  const fullscreenTicTacToeLastTickRef = useRef(0);
  const fullscreenVirtualPianoStateRef = useRef(null);
  const fullscreenVirtualPianoViewportRef = useRef(null);
  const fullscreenVirtualPianoLastTickRef = useRef(0);
  // maps keyId -> stop() function for each currently-sustained note
  const fullscreenVirtualPianoActiveNotesRef = useRef({});
  const debugRef = useRef(debugEnabled);
  const labConfidenceThresholdRef = useRef(labConfidenceThreshold);
  const labShowSkeletonRef = useRef(labShowSkeleton);
  const labPersonalizationEnabledRef = useRef(labPersonalizationEnabled);
  const labTrainingSessionRef = useRef(null);
  const handLabelMemoryRef = useRef({ byLabel: {} });

  const handDetectedRef = useRef(false);
  const lastValidHandTimestampRef = useRef(0);
  const handGraceFrameCounterRef = useRef(0);
  const pinchStateRef = useRef(false);
  const lastPinchClickRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const fpsRef = useRef(0);
  const frameCounterRef = useRef(0);
  const inferenceBusySkipCounterRef = useRef(0);
  const recoveryFrameSkipCounterRef = useRef(0);
  const invalidLandmarkStreakRef = useRef(0);
  const noHandStreakRef = useRef(0);
  const trackingExtentsRef = useRef(createTrackingExtentState());
  const detectorRecoveryAttemptsRef = useRef(0);
  const lastDetectorRecoveryAtRef = useRef(0);
  const recoveringDetectorRef = useRef(false);

  const calibrationTargetsRef = useRef(calibrationTargets);
  const calibrationIndexRef = useRef(calibrationTargetIndex);
  const calibrationPairsRef = useRef([]);
  const calibrationSampleRef = useRef(null);
  const isCalibratingRef = useRef(isCalibrating);
  const isArcCalibratingRef = useRef(isArcCalibrating);
  const arcCalibrationStartRef = useRef(0);
  const arcCalibrationSamplesRef = useRef([]);
  const inputTestHoveredCellRef = useRef(inputTestHoveredCell);
  const sandboxBlocksRef = useRef(sandboxBlocks);
  const sandboxGrabbedBlockIdRef = useRef(sandboxGrabbedBlockId);
  const sandboxGrabOffsetRef = useRef({ x: 0, y: 0 });
  const sandboxGrabVelocityRef = useRef({ vx: 0, vy: 0 });
  const sandboxGrabLastPositionRef = useRef({ x: 0, y: 0, timestamp: 0 });
  const sandboxLastTickRef = useRef(0);
  const flightStateRef = useRef({
    initialized: false,
    lastTimestamp: 0,
    shipX: 0,
    shipY: 0,
    shipVx: 0,
    shipVy: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    distance: 0,
    stars: [],
    rings: [],
  });
  const flightControlRef = useRef({
    yaw: 0,
    pitch: 0,
    roll: 0,
    confidence: 0,
    hasControl: false,
    lastUpdate: 0,
  });
  const flightBaselineRef = useRef(createEmptyFlightBaseline());
  const flightBaselineSamplesRef = useRef([]);
  const flightHudLastUpdateRef = useRef(0);
  const runnerStateRef = useRef({
    initialized: false,
    lastTimestamp: 0,
    trackXTargetIndex: RUNNER_DEFAULT_TRACK_INDEX,
    trackYTargetIndex: RUNNER_DEFAULT_TRACK_INDEX,
    trackXTarget: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
    trackYTarget: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
    trackXFloat: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
    trackYFloat: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
    trackSpacing: 0,
    distance: 0,
    coinsCollected: 0,
    coins: [],
  });
  const runnerHudLastUpdateRef = useRef(0);
  const runnerGeometryLogKeyRef = useRef("");

  const holesRef = useRef(holes);
  const hitZonesRef = useRef([]);
  const lastHoleIndexRef = useRef(-1);

  const gameRunningRef = useRef(gameRunning);
  const gameStartTimeRef = useRef(0);
  const nextSpawnAtRef = useRef(Number.POSITIVE_INFINITY);
  const activeMoleRef = useRef(null);
  const timeLeftRef = useRef(timeLeft);

  const currentTarget = useMemo(
    () => calibrationTargets[calibrationTargetIndex] ?? null,
    [calibrationTargets, calibrationTargetIndex],
  );
  const isFullscreenCameraPhase = phase === PHASES.FULLSCREEN_CAMERA;
  const isMinorityReportLabPhase = phase === PHASES.MINORITY_REPORT_LAB;
  const isImmersiveAppPhase = shouldUseImmersiveAppLayout(phase);
  const isFullscreenModeLanding =
    isFullscreenCameraPhase && fullscreenGridMode === FULLSCREEN_LANDING_MODE;
  const isFullscreenBreakoutGridMode =
    fullscreenGridMode === "breakout" ||
    fullscreenGridMode === FIND_YOUR_GRIND_BREAKOUT_MODE_ID;
  const isFullscreenHandBounceMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "hand-bounce" &&
    Boolean(fullscreenHandBounceState);
  const isFullscreenBrickDodgerMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "brick-dodger" &&
    Boolean(fullscreenBrickDodgerState);
  const isFullscreenBreakoutMode =
    isFullscreenCameraPhase && isFullscreenBreakoutGridMode && Boolean(fullscreenBreakoutState);
  const isFullscreenBreakoutCoopMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "breakout-coop" &&
    Boolean(fullscreenBreakoutCoopState);
  const isFullscreenFingerPongMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "finger-pong" &&
    Boolean(fullscreenFingerPongState);
  const isFullscreenFruitNinjaMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "fruit-ninja" &&
    Boolean(fullscreenFruitNinjaState);
  const isFullscreenSkyPatrolMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "sky-patrol" &&
    Boolean(fullscreenSkyPatrolHud);
  const isFullscreenWfcWorldMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === WFC_WORLD_MODE_ID &&
    Boolean(fullscreenWfcWorldState);
  const isFullscreenInvadersMode =
    isFullscreenCameraPhase && fullscreenGridMode === "invaders" && Boolean(fullscreenInvadersState);
  const isFullscreenFlappyMode =
    isFullscreenCameraPhase && fullscreenGridMode === "flappy" && Boolean(fullscreenFlappyState);
  const isFullscreenMissileCommandMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "missile-command" &&
    Boolean(fullscreenMissileCommandState);
  const isFullscreenTicTacToeMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "tic-tac-toe" &&
    Boolean(fullscreenTicTacToeState);
  const isFullscreenVirtualPianoMode =
    isFullscreenCameraPhase &&
    fullscreenGridMode === "virtual-piano" &&
    Boolean(fullscreenVirtualPianoState);
  const fullscreenRestartControlLabel = getFullscreenRestartControlLabel(fullscreenGridMode, {
    handBounce: fullscreenHandBounceState,
    brickDodger: fullscreenBrickDodgerState,
    fingerPong: fullscreenFingerPongState,
    fruitNinja: fullscreenFruitNinjaState,
    skyPatrol: fullscreenSkyPatrolHud,
    missileCommand: fullscreenMissileCommandState,
  });
  const fullscreenTicTacToeLayout = fullscreenTicTacToeState?.layout ?? null;
  const fullscreenTicTacToeHasActiveBoard =
    fullscreenTicTacToeState?.board?.some(Boolean) ?? false;
  const fullscreenTicTacToePlayerCount =
    fullscreenTicTacToeState?.board?.filter((mark) => mark === TIC_TAC_TOE_PLAYER_MARK).length ?? 0;
  const fullscreenTicTacToeAiCount =
    fullscreenTicTacToeState?.board?.filter((mark) => mark === TIC_TAC_TOE_AI_MARK).length ?? 0;
  const fullscreenTicTacToePlayerReserveCount = Math.max(
    0,
    TIC_TAC_TOE_PLAYER_PIECE_LIMIT -
      fullscreenTicTacToePlayerCount -
      (fullscreenTicTacToeState?.draggingPiece ? 1 : 0),
  );
  const fullscreenTicTacToeAiReserveCount = Math.max(
    0,
    TIC_TAC_TOE_AI_PIECE_LIMIT - fullscreenTicTacToeAiCount,
  );
  const fullscreenTicTacToePlayerReservePips = getTicTacToeReservePips(
    fullscreenTicTacToePlayerReserveCount,
    TIC_TAC_TOE_PLAYER_PIECE_LIMIT,
  );
  const fullscreenTicTacToeAiReservePips = getTicTacToeReservePips(
    fullscreenTicTacToeAiReserveCount,
    TIC_TAC_TOE_AI_PIECE_LIMIT,
  );
  const fullscreenTicTacToeTurnUi = getTicTacToeTurnUi(fullscreenTicTacToeState);
  const fullscreenTicTacToeHudUi = getTicTacToeHudUi(fullscreenTicTacToeState, {
    playerWins: fullscreenTicTacToeState?.playerWins ?? 0,
    aiWins: fullscreenTicTacToeState?.aiWins ?? 0,
    draws: fullscreenTicTacToeState?.draws ?? 0,
    boardCount: fullscreenTicTacToePlayerCount + fullscreenTicTacToeAiCount,
  });
  const fullscreenTicTacToeResetUi = getTicTacToeResetUi(fullscreenTicTacToeState, {
    hasActiveBoard: fullscreenTicTacToeHasActiveBoard,
    totalMs: TIC_TAC_TOE_RESET_HOLD_MS,
  });
  const fullscreenTicTacToeWinningLineUi = getTicTacToeWinningLineUi(
    fullscreenTicTacToeLayout,
    fullscreenTicTacToeState?.winningLine,
  );
  const fullscreenTicTacToeDraggingCellIndex =
    fullscreenTicTacToeState?.draggingPiece && fullscreenTicTacToeLayout
      ? getTicTacToeCellIndex(
          fullscreenTicTacToeLayout,
          fullscreenTicTacToeState.draggingPiece.x,
          fullscreenTicTacToeState.draggingPiece.y,
        )
      : -1;
  const fullscreenTicTacToeCursorUi = getTicTacToeCursorUi(fullscreenTicTacToeState, {
    handDetected,
    pinchActive,
    draggingCellIndex: fullscreenTicTacToeDraggingCellIndex,
  });
  const fullscreenModeLandingHoldProgress = clampValue(
    (fullscreenModeLandingState?.holdMs ?? 0) / FULLSCREEN_MODE_LANDING_HOLD_MS,
    0,
    1,
  );
  const fullscreenModeLandingLayout = fullscreenModeLandingState?.layout ?? null;
  const fullscreenExitControlCountdown = (
    Math.max(
      0,
      FULLSCREEN_MODE_LANDING_HOLD_MS - (fullscreenExitControlState?.holdMs ?? 0),
    ) / 1000
  ).toFixed(2);
  const fullscreenRestartControlCountdown = (
    Math.max(
      0,
      FULLSCREEN_MODE_LANDING_HOLD_MS - (fullscreenRestartControlState?.holdMs ?? 0),
    ) / 1000
  ).toFixed(2);
  const isSandboxPhase = phase === PHASES.SANDBOX;
  const isCalibrationLayoutPhase =
    phase === PHASES.CALIBRATION ||
    phase === PHASES.FULLSCREEN_CAMERA ||
    isSandboxPhase ||
    phase === PHASES.FLIGHT ||
    phase === PHASES.RUNNER ||
    phase === PHASES.BODY_POSE ||
    phase === PHASES.OFF_AXIS_LAB ||
    phase === PHASES.MINORITY_REPORT_LAB ||
    phase === PHASES.CONVEYOR ||
    phase === PHASES.ROULETTE ||
    phase === PHASES.SPATIAL_GESTURE_MEMORY ||
    phase === PHASES.GESTURE_ANALYTICS_LAB ||
    phase === PHASES.GESTURE_ART_LAB ||
    phase === PHASES.GESTURE_CONTROL_OS;
  const cameraPanelTitle =
    phase === PHASES.FULLSCREEN_CAMERA
      ? "Fullscreen Camera"
      : phase === PHASES.FLIGHT
      ? "Camera + Flight Controls"
      : phase === PHASES.RUNNER
      ? "Camera + Runner Controls"
      : phase === PHASES.BODY_POSE
      ? "Camera + Body Pose Highlight"
      : phase === PHASES.OFF_AXIS_LAB
      ? "Camera + Off-Axis Forest Walk"
      : phase === PHASES.MINORITY_REPORT_LAB
      ? "Camera + Minority Report Controls"
      : phase === PHASES.CONVEYOR
      ? "Camera + Conveyor Toss Controls"
      : phase === PHASES.ROULETTE
      ? "Camera + Roulette Controls"
      : phase === PHASES.SPATIAL_GESTURE_MEMORY
      ? "Camera + Spatial Memory Controls"
      : phase === PHASES.GESTURE_ANALYTICS_LAB
      ? "Camera + Gesture Analytics"
      : phase === PHASES.GESTURE_ART_LAB
      ? "Camera + Gesture Art Controls"
      : phase === PHASES.GESTURE_CONTROL_OS
      ? "Camera + Gesture Control OS"
      : phase === PHASES.GAME
      ? "Camera + Tracking"
      : phase === PHASES.SANDBOX
      ? "Camera + Pinch Sandbox Controls"
      : "Camera + Calibration Controls";
  const showInlineCameraPreview = shouldShowInlineCameraPreview(phase);
  const inputTestPinchingCell =
    phase === PHASES.CALIBRATION && !isCalibrating && pinchActive
      ? inputTestHoveredCell
      : -1;
  const isBodyPosePhase = phase === PHASES.BODY_POSE || phase === PHASES.OFF_AXIS_LAB;
  const showLeftPaneResizer =
    !isBodyPosePhase && viewport.width > DESKTOP_LAYOUT_BREAKPOINT_PX;

  const getContentGridWidth = () =>
    contentGridRef.current?.getBoundingClientRect().width ?? viewport.width;

  const getMeasuredLeftPaneWidth = () => {
    const measuredWidth = cameraPaneRef.current?.getBoundingClientRect().width;
    if (Number.isFinite(measuredWidth) && measuredWidth > 0) {
      return measuredWidth;
    }
    if (Number.isFinite(leftPaneWidth) && leftPaneWidth > 0) {
      return leftPaneWidth;
    }
    return clampResizableLeftPaneWidth(viewport.width * 0.42, getContentGridWidth());
  };

  const getMaxLeftPaneWidth = () =>
    clampResizableLeftPaneWidth(Number.POSITIVE_INFINITY, getContentGridWidth());

  const setClampedLeftPaneWidth = (nextWidth) => {
    const clampedWidth = clampResizableLeftPaneWidth(nextWidth, getContentGridWidth());
    setLeftPaneWidth(clampedWidth);
    return clampedWidth;
  };

  const handleLeftPaneResizerPointerDown = (event) => {
    if (!showLeftPaneResizer) {
      return;
    }

    const startingWidth = getMeasuredLeftPaneWidth();
    if (!Number.isFinite(startingWidth) || startingWidth <= 0) {
      return;
    }

    leftPaneResizeStateRef.current = {
      startWidth: startingWidth,
      startX: event.clientX,
    };
    setIsLeftPaneResizing(true);
    event.preventDefault();
  };

  const handleLeftPaneResizerKeyDown = (event) => {
    if (!showLeftPaneResizer) {
      return;
    }

    const currentWidth = getMeasuredLeftPaneWidth();
    if (!Number.isFinite(currentWidth) || currentWidth <= 0) {
      return;
    }

    if (event.key === "ArrowLeft") {
      setClampedLeftPaneWidth(currentWidth - LEFT_PANE_RESIZE_KEYBOARD_STEP_PX);
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowRight") {
      setClampedLeftPaneWidth(currentWidth + LEFT_PANE_RESIZE_KEYBOARD_STEP_PX);
      event.preventDefault();
      return;
    }

    if (event.key === "Home") {
      setClampedLeftPaneWidth(RESIZABLE_LEFT_PANE_MIN_WIDTH_PX);
      event.preventDefault();
      return;
    }

    if (event.key === "End") {
      setClampedLeftPaneWidth(getMaxLeftPaneWidth());
      event.preventDefault();
    }
  };

  const cameraObjectFit = isFullscreenModeLanding ? "cover" : getCameraObjectFitForPhase(phase);
  const fullscreenCameraViewport = useMemo(() => {
    if (!isFullscreenCameraPhase) {
      return null;
    }

    const stageWidth = viewport.width;
    const stageHeight = viewport.height;
    const aspectRatio =
      Number.isFinite(cameraAspectRatio) && cameraAspectRatio > 0 ? cameraAspectRatio : 4 / 3;
    return createFullscreenCameraViewport(stageWidth, stageHeight, aspectRatio);
  }, [cameraAspectRatio, isFullscreenCameraPhase, viewport.height, viewport.width]);
  const fullscreenCameraLandingViewport = useMemo(() => {
    if (!isFullscreenCameraPhase) {
      return null;
    }

    return {
      left: 0,
      top: 0,
      width: viewport.width,
      height: viewport.height,
      style: {
        left: "0px",
        top: "0px",
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
      },
    };
  }, [isFullscreenCameraPhase, viewport.height, viewport.width]);
  const fullscreenTicTacToeCursorPoint =
    isFullscreenTicTacToeMode &&
    fullscreenCameraViewport &&
    handDetected &&
    Number.isFinite(cursor.x) &&
    Number.isFinite(cursor.y)
      ? {
          x: clampValue(cursor.x - fullscreenCameraViewport.left, 0, fullscreenCameraViewport.width),
          y: clampValue(cursor.y - fullscreenCameraViewport.top, 0, fullscreenCameraViewport.height),
        }
      : null;

  const fullscreenCameraGridMetrics = useMemo(() => {
    if (!fullscreenCameraViewport) {
      return null;
    }

    const { left, top, width, height, style } = fullscreenCameraViewport;
    const colCount = Math.ceil(width / FULLSCREEN_GRID_SIZE_PX);
    const rowCount = Math.ceil(height / FULLSCREEN_GRID_SIZE_PX);
    const cellPriority = {
      outer: 1,
      neighbor: 2,
      highlight: 3,
    };
    const cellMap = new Map();
    const registerCell = (col, row, type) => {
      if (col < 0 || row < 0 || col >= colCount || row >= rowCount) {
        return;
      }
      const key = `${col}-${row}`;
      const existing = cellMap.get(key);
      if (existing && cellPriority[existing.type] >= cellPriority[type]) {
        return;
      }
      const cellLeft = col * FULLSCREEN_GRID_SIZE_PX;
      const cellTop = row * FULLSCREEN_GRID_SIZE_PX;
      cellMap.set(key, {
        key,
        type,
        style: {
          left: `${cellLeft}px`,
          top: `${cellTop}px`,
          width: `${Math.min(FULLSCREEN_GRID_SIZE_PX, width - cellLeft)}px`,
          height: `${Math.min(FULLSCREEN_GRID_SIZE_PX, height - cellTop)}px`,
        },
      });
    };

    for (const point of fullscreenIndexPoints) {
      const isPointInside =
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) &&
        point.x >= left &&
        point.x <= left + width &&
        point.y >= top &&
        point.y <= top + height;
      if (!isPointInside) {
        continue;
      }

      const col = Math.min(Math.floor((point.x - left) / FULLSCREEN_GRID_SIZE_PX), colCount - 1);
      const row = Math.min(Math.floor((point.y - top) / FULLSCREEN_GRID_SIZE_PX), rowCount - 1);
      registerCell(col, row, "highlight");

      for (let rowOffset = -2; rowOffset <= 2; rowOffset += 1) {
        for (let colOffset = -2; colOffset <= 2; colOffset += 1) {
          const distance = Math.max(Math.abs(rowOffset), Math.abs(colOffset));
          if (distance === 0) {
            continue;
          }
          if (distance === 1) {
            registerCell(col + colOffset, row + rowOffset, "neighbor");
          } else if (distance === 2) {
            registerCell(col + colOffset, row + rowOffset, "outer");
          }
        }
      }
    }

    const highlight = [];
    const neighbors = [];
    const outerRing = [];
    for (const cell of cellMap.values()) {
      if (cell.type === "highlight") {
        highlight.push(cell);
      } else if (cell.type === "neighbor") {
        neighbors.push(cell);
      } else {
        outerRing.push(cell);
      }
    }

    return {
      style,
      highlight,
      neighbors,
      outerRing,
    };
  }, [fullscreenCameraViewport, fullscreenIndexPoints]);

  const fullscreenMissileAimPoint = useMemo(() => {
    if (
      !isFullscreenMissileCommandMode ||
      !fullscreenCameraViewport ||
      !handDetected ||
      !Number.isFinite(cursor.x) ||
      !Number.isFinite(cursor.y)
    ) {
      return null;
    }

    return {
      x: clampValue(cursor.x - fullscreenCameraViewport.left, 0, fullscreenCameraViewport.width),
      y: clampValue(cursor.y - fullscreenCameraViewport.top, 0, fullscreenCameraViewport.height),
    };
  }, [cursor.x, cursor.y, fullscreenCameraViewport, handDetected, isFullscreenMissileCommandMode]);
  const fullscreenMissileLaunchPreview = useMemo(
    () => getMissileCommandLaunchPreview(fullscreenMissileCommandState, fullscreenMissileAimPoint),
    [fullscreenMissileAimPoint, fullscreenMissileCommandState],
  );
  const fullscreenMissileCooldownUi = useMemo(
    () => getMissileCommandCooldownUi(fullscreenMissileCommandState),
    [fullscreenMissileCommandState],
  );
  const fullscreenMissileCrosshairUi = useMemo(
    () =>
      getMissileCommandCrosshairUi(
        fullscreenMissileCommandState,
        fullscreenMissileAimPoint,
        handDetected,
      ),
    [fullscreenMissileAimPoint, fullscreenMissileCommandState, handDetected],
  );
  const fullscreenMissileTargetWarnings = useMemo(
    () => getMissileCommandTargetWarnings(fullscreenMissileCommandState),
    [fullscreenMissileCommandState],
  );
  const fullscreenMissileLegendItems = useMemo(
    () => getMissileCommandLegendItems(MISSILE_COMMAND_THREAT_SCORE),
    [],
  );
  const fullscreenMissileTacticalMetrics = useMemo(
    () => getMissileCommandTacticalMetrics(fullscreenMissileCommandState),
    [fullscreenMissileCommandState],
  );
  const fullscreenMissileCountdownUi = useMemo(
    () => getMissileCommandCountdownUi(fullscreenMissileCommandState),
    [fullscreenMissileCommandState],
  );
  const fullscreenMissileGameOverUi = useMemo(
    () => getMissileCommandGameOverUi(fullscreenMissileCommandState, "Restart Defense"),
    [fullscreenMissileCommandState],
  );
  const fullscreenSkyPatrolHudItems = useMemo(
    () => getSkyPatrolHudItems(fullscreenSkyPatrolHud),
    [fullscreenSkyPatrolHud],
  );
  const fullscreenSkyPatrolFireCooldownUi = useMemo(
    () => getSkyPatrolFireCooldownUi(fullscreenSkyPatrolHud),
    [fullscreenSkyPatrolHud],
  );
  const fullscreenSkyPatrolGunCooldownUi = useMemo(
    () => getSkyPatrolGunCooldownUi(fullscreenSkyPatrolHud),
    [fullscreenSkyPatrolHud],
  );
  const fullscreenSkyPatrolLifeIcons = useMemo(
    () => getSkyPatrolLifeIcons(fullscreenSkyPatrolHud?.lives ?? 0, SKY_PATROL_STARTING_LIVES),
    [fullscreenSkyPatrolHud?.lives],
  );
  const fullscreenSkyPatrolGameOverUi = useMemo(
    () => getSkyPatrolGameOverUi(fullscreenSkyPatrolHud),
    [fullscreenSkyPatrolHud],
  );
  const fullscreenSkyPatrolLegendUi = useMemo(
    () => getSkyPatrolLegendUi(fullscreenSkyPatrolHud),
    [fullscreenSkyPatrolHud],
  );
  const fullscreenSkyPatrolStartPromptUi = useMemo(
    () => getSkyPatrolStartPromptUi(fullscreenSkyPatrolHud),
    [fullscreenSkyPatrolHud],
  );

  const fullscreenHexGridMetrics = useMemo(() => {
    if (!fullscreenCameraViewport) {
      return null;
    }

    const { left, top, width, height, style } = fullscreenCameraViewport;
    const { cells, cellMap } = buildFullscreenHexCells(width, height);
    const cellPriority = {
      outer: 1,
      neighbor: 2,
      highlight: 3,
    };
    const highlightedCellMap = new Map();

    const registerCell = (cell, type) => {
      if (!cell) {
        return;
      }
      const existing = highlightedCellMap.get(cell.key);
      if (existing && cellPriority[existing.type] >= cellPriority[type]) {
        return;
      }
      highlightedCellMap.set(cell.key, {
        key: cell.key,
        type,
        style: cell.style,
      });
    };

    for (const point of fullscreenIndexPoints) {
      const isPointInside =
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) &&
        point.x >= left &&
        point.x <= left + width &&
        point.y >= top &&
        point.y <= top + height;
      if (!isPointInside) {
        continue;
      }

      let nearestCell = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (const cell of cells) {
        const dx = point.x - (left + cell.centerX);
        const dy = point.y - (top + cell.centerY);
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestCell = cell;
        }
      }
      if (!nearestCell) {
        continue;
      }

      registerCell(nearestCell, "highlight");

      for (const candidate of cells) {
        const dq = candidate.q - nearestCell.q;
        const dr = candidate.r - nearestCell.r;
        const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
        if (distance === 1) {
          registerCell(candidate, "neighbor");
        } else if (distance === 2) {
          registerCell(candidate, "outer");
        }
      }
    }

    const highlight = [];
    const neighbors = [];
    const outerRing = [];
    for (const cell of highlightedCellMap.values()) {
      if (cell.type === "highlight") {
        highlight.push(cell);
      } else if (cell.type === "neighbor") {
        neighbors.push(cell);
      } else {
        outerRing.push(cell);
      }
    }

    return {
      style,
      cells,
      highlight,
      neighbors,
      outerRing,
    };
  }, [fullscreenCameraViewport, fullscreenIndexPoints]);

  const fullscreenVoronoiMetrics = useMemo(() => {
    if (!fullscreenCameraViewport) {
      return null;
    }

    const { left, top, width, height, style } = fullscreenCameraViewport;
    const sites = fullscreenTipPoints.filter(
      (point) =>
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) &&
        point.x >= left &&
        point.x <= left + width &&
        point.y >= top &&
        point.y <= top + height,
    );

    const cells = sites
      .map((point, index) => {
        const polygon = buildStaticRippleClipPolygon(point, sites, fullscreenCameraViewport);
        if (!polygon || polygon.length < 3) {
          return null;
        }
        return {
          key: point.id,
          color: BREAKOUT_BRICK_COLORS[index % BREAKOUT_BRICK_COLORS.length],
          polygon,
        };
      })
      .filter(Boolean);

    return {
      style,
      cells,
      sites: sites.map((point) => ({
        id: point.id,
        x: point.x - left,
        y: point.y - top,
      })),
      width,
      height,
    };
  }, [fullscreenCameraViewport, fullscreenTipPoints]);

  async function attachStreamToVideoElement(video, reason) {
    const stream = streamRef.current;
    if (!video || !stream) {
      return false;
    }

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    try {
      await video.play();
    } catch (error) {
      appLog.warn("Video playback could not be resumed for active camera element", {
        reason,
        error,
      });
      throw (
        error instanceof Error
          ? error
          : new Error("Camera video playback could not be started.")
      );
    }

    attachedVideoElementRef.current = video;

    const primaryTrack = stream.getVideoTracks()[0];
    const trackSettings = primaryTrack?.getSettings?.() ?? {};
    const measuredWidth = video.videoWidth || trackSettings.width;
    const measuredHeight = video.videoHeight || trackSettings.height;
    if (
      Number.isFinite(measuredWidth) &&
      Number.isFinite(measuredHeight) &&
      measuredWidth > 0 &&
      measuredHeight > 0
    ) {
      const ratio = measuredWidth / measuredHeight;
      setCameraAspectRatio(ratio);
      appLog.info("Camera stream attached to active video element", {
        reason,
        measuredWidth,
        measuredHeight,
        ratio: roundMetric(ratio, 6),
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
    } else {
      appLog.warn("Camera stream attached but dimensions are not ready yet", {
        reason,
        measuredWidth,
        measuredHeight,
      });
    }

    return true;
  }

  function getTrackingTimestamp() {
    return typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  }

  function beginTrackingInference(timestamp) {
    const inferenceToken = activeInferenceTokenRef.current + 1;
    activeInferenceTokenRef.current = inferenceToken;
    lastInferenceStartedAtRef.current = timestamp;
    inferenceBusyRef.current = true;
    return inferenceToken;
  }

  function completeTrackingInference(inferenceToken) {
    lastInferenceCompletedAtRef.current = getTrackingTimestamp();
    if (activeInferenceTokenRef.current === inferenceToken) {
      inferenceBusyRef.current = false;
    }
  }

  function isCurrentTrackingInference(inferenceToken) {
    return activeInferenceTokenRef.current === inferenceToken;
  }

  function releaseStaleTrackingInference(timestamp, staleAction) {
    const staleToken = activeInferenceTokenRef.current;
    activeInferenceTokenRef.current += 1;
    inferenceBusyRef.current = false;
    inferenceBusySkipCounterRef.current = 0;
    appLog.warn("Tracking keep-alive detected a stale hand inference; recycling detector", {
      staleToken,
      timestamp,
      inferenceStartedAt: lastInferenceStartedAtRef.current,
      inferenceAgeMs: roundMetric(staleAction.ageMs, 2),
      cooldownRemainingMs: roundMetric(staleAction.cooldownRemainingMs, 2),
      lastInferenceCompletedAt: lastInferenceCompletedAtRef.current,
    });
    void recoverDetectorFromInvalidLandmarks("stale_inference_keep_alive", {
      inferenceAgeMs: staleAction.ageMs,
      inferenceStartedAt: lastInferenceStartedAtRef.current,
      lastInferenceCompletedAt: lastInferenceCompletedAtRef.current,
    });
  }

  function runTrackingKeepAlive(timestamp, { allowDetectorRecovery = true } = {}) {
    if (
      !shouldRunTrackingKeepAlive({
        now: timestamp,
        lastRunAt: lastTrackingKeepAliveAtRef.current,
      })
    ) {
      return;
    }
    lastTrackingKeepAliveAtRef.current = timestamp;

    const video = videoRef.current;
    const videoAction = getCameraVideoKeepAliveAction({
      video,
      stream: streamRef.current,
      attachedVideoElement: attachedVideoElementRef.current,
    });

    if (videoAction.shouldAttach) {
      appLog.info("Tracking keep-alive refreshing camera playback", videoAction);
      void attachStreamToVideoElement(video, `keep_alive_${videoAction.reason}`).catch((error) => {
        appLog.warn("Tracking keep-alive could not refresh camera playback", {
          videoAction,
          error,
        });
        setCameraError(
          error instanceof Error
            ? error.message
            : "Camera video playback could not be restarted.",
        );
      });
    } else if (videoAction.reason !== "healthy") {
      appLog.debug("Tracking keep-alive skipped camera refresh", videoAction);
    }

    if (!allowDetectorRecovery) {
      return;
    }

    const staleAction = getStaleInferenceKeepAliveAction({
      now: timestamp,
      inferenceBusy: inferenceBusyRef.current,
      inferenceStartedAt: lastInferenceStartedAtRef.current,
      recoveryInProgress: recoveringDetectorRef.current,
      lastRecoveryAt: lastDetectorRecoveryAtRef.current,
    });

    if (staleAction.shouldRecover) {
      releaseStaleTrackingInference(timestamp, staleAction);
    } else if (
      staleAction.reason !== "idle" &&
      staleAction.reason !== "within_stale_window"
    ) {
      appLog.debug("Tracking keep-alive skipped detector recovery", staleAction);
    }
  }

  useEffect(() => {
    appLog.info("App mounted", {
      initialViewport: viewportRef.current,
      initialPhase: phaseRef.current,
    });
    return () => {
      appLog.info("App unmounted");
    };
  }, [appLog]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const markLandingAppActive = () => {
      fullscreenLandingAppActiveRef.current = document.visibilityState !== "hidden";
      fullscreenModeLandingLastTickRef.current = 0;
    };

    const clearLandingHold = () => {
      fullscreenLandingAppActiveRef.current = false;
      fullscreenModeLandingLastTickRef.current = 0;
      setFullscreenModeLandingState((previous) => {
        const sourceState = previous ?? fullscreenModeLandingStateRef.current;
        if (!sourceState) {
          fullscreenModeLandingStateRef.current = null;
          return previous;
        }
        const nextState = resetFullscreenModeLandingHold(sourceState);
        fullscreenModeLandingStateRef.current = nextState;
        return nextState;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearLandingHold();
        return;
      }
      markLandingAppActive();
    };

    window.addEventListener("blur", clearLandingHold);
    window.addEventListener("focus", markLandingAppActive);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", clearLandingHold);
      window.removeEventListener("focus", markLandingAppActive);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    appLog.info("Phase changed", { phase });
  }, [appLog, phase]);

  useEffect(() => {
    if (phase === PHASES.CALIBRATION) {
      return;
    }
    if (isArcCalibratingRef.current) {
      isArcCalibratingRef.current = false;
      arcCalibrationStartRef.current = 0;
      arcCalibrationSamplesRef.current = [];
      setIsArcCalibrating(false);
      setArcCalibrationProgress(0);
      setArcCalibrationSamples(0);
    }
    if (inputTestHoveredCellRef.current !== -1) {
      inputTestHoveredCellRef.current = -1;
      setInputTestHoveredCell(-1);
    }
    if (sandboxGrabbedBlockIdRef.current !== null) {
      sandboxGrabbedBlockIdRef.current = null;
      setSandboxGrabbedBlockId(null);
    }
    sandboxGrabOffsetRef.current = { x: 0, y: 0 };
    sandboxGrabVelocityRef.current = { vx: 0, vy: 0 };
    sandboxGrabLastPositionRef.current = { x: 0, y: 0, timestamp: 0 };
    if (phase !== PHASES.FLIGHT) {
      flightControlRef.current = {
        yaw: 0,
        pitch: 0,
        roll: 0,
        confidence: 0,
        hasControl: false,
        lastUpdate: 0,
      };
      flightBaselineRef.current = createEmptyFlightBaseline();
      flightBaselineSamplesRef.current = [];
      flightHudLastUpdateRef.current = 0;
      setFlightHud({
        yaw: 0,
        pitch: 0,
        roll: 0,
        confidence: 0,
        baselineReady: false,
        baselineSamples: 0,
        distance: 0,
      });
    }
    if (phase !== PHASES.RUNNER) {
      runnerStateRef.current = {
        initialized: false,
        lastTimestamp: 0,
        trackXTargetIndex: RUNNER_DEFAULT_TRACK_INDEX,
        trackYTargetIndex: RUNNER_DEFAULT_TRACK_INDEX,
        trackXTarget: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
        trackYTarget: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
        trackXFloat: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
        trackYFloat: getRunnerTrackOffsetFromIndex(RUNNER_DEFAULT_TRACK_INDEX, RUNNER_TRACK_GRID_SIZE),
        trackSpacing: 0,
        distance: 0,
        coinsCollected: 0,
        coins: [],
      };
      runnerHudLastUpdateRef.current = 0;
      setRunnerHud({
        coins: 0,
        distance: 0,
        trackCol: RUNNER_DEFAULT_TRACK_INDEX + 1,
        trackRow: RUNNER_DEFAULT_TRACK_INDEX + 1,
        trackSpacingPx: 0,
      });
    }
    if (phase !== PHASES.MINORITY_REPORT_LAB) {
      labTrainingSessionRef.current = null;
      gestureEngineRef.current.reset();
      setLabEngineOutput(createEmptyLabEngineOutput());
      setLabTrainingState((previous) =>
        previous.active
          ? {
              ...createInitialLabTrainingState(),
              message: "Minority Report Lab exited. Training session cancelled.",
            }
          : previous,
      );
    }
    if (phase !== PHASES.BODY_POSE && phase !== PHASES.OFF_AXIS_LAB) {
      setPoseStatus(createEmptyPoseStatus());
    }
    if (phase !== PHASES.SPATIAL_GESTURE_MEMORY && spatialMemoryRef.current?.active) {
      setSpatialMemoryState((prev) => ({ ...prev, active: false }));
    }
    if (phase !== PHASES.GESTURE_ART_LAB) {
      setGestureArtHands([]);
    }
    if (phase !== PHASES.FULLSCREEN_CAMERA) {
      setFullscreenIndexPoints([]);
      setFullscreenTipPoints([]);
      setFullscreenModeLandingState(null);
      setFullscreenExitControlState(null);
      setFullscreenRestartControlState(null);
      setFullscreenRingTrail([]);
      setFullscreenPulseBursts([]);
      setFullscreenHandBounceState(null);
      setFullscreenBrickDodgerState(null);
      setFullscreenBreakoutState(null);
      setFullscreenBreakoutCoopState(null);
      setFullscreenFingerPongState(null);
      setFullscreenFruitNinjaState(null);
      setFullscreenWfcWorldState(null);
      setFullscreenInvadersState(null);
      setFullscreenFlappyState(null);
      setFullscreenMissileCommandState(null);
      setFullscreenTicTacToeState(null);
      setFullscreenVirtualPianoState(null);
    }
  }, [phase]);

  useEffect(() => {
    fullscreenGridModeRef.current = fullscreenGridMode;
  }, [fullscreenGridMode]);

  useEffect(() => {
    fullscreenModeLandingStateRef.current = fullscreenModeLandingState;
  }, [fullscreenModeLandingState]);

  useEffect(() => {
    fullscreenExitControlStateRef.current = fullscreenExitControlState;
  }, [fullscreenExitControlState]);

  useEffect(() => {
    fullscreenRestartControlStateRef.current = fullscreenRestartControlState;
  }, [fullscreenRestartControlState]);

  useEffect(() => {
    fullscreenModeLandingViewportRef.current = fullscreenCameraLandingViewport;
  }, [fullscreenCameraLandingViewport]);

  useEffect(() => {
    fullscreenExitControlViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenRestartControlViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenHandBounceStateRef.current = fullscreenHandBounceState;
  }, [fullscreenHandBounceState]);

  useEffect(() => {
    fullscreenHandBounceViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenBrickDodgerStateRef.current = fullscreenBrickDodgerState;
  }, [fullscreenBrickDodgerState]);

  useEffect(() => {
    fullscreenBrickDodgerViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenBreakoutStateRef.current = fullscreenBreakoutState;
  }, [fullscreenBreakoutState]);

  useEffect(() => {
    fullscreenBreakoutCoopStateRef.current = fullscreenBreakoutCoopState;
  }, [fullscreenBreakoutCoopState]);

  useEffect(() => {
    fullscreenFingerPongStateRef.current = fullscreenFingerPongState;
  }, [fullscreenFingerPongState]);

  useEffect(() => {
    fullscreenFruitNinjaStateRef.current = fullscreenFruitNinjaState;
  }, [fullscreenFruitNinjaState]);

  useEffect(() => {
    fullscreenInvadersStateRef.current = fullscreenInvadersState;
  }, [fullscreenInvadersState]);

  useEffect(() => {
    fullscreenBreakoutViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenBreakoutCoopViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenFingerPongViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenSkyPatrolViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenWfcWorldStateRef.current = fullscreenWfcWorldState;
  }, [fullscreenWfcWorldState]);

  useEffect(() => {
    fullscreenWfcWorldViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenFlappyStateRef.current = fullscreenFlappyState;
  }, [fullscreenFlappyState]);

  useEffect(() => {
    fullscreenFlappyViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenMissileCommandStateRef.current = fullscreenMissileCommandState;
  }, [fullscreenMissileCommandState]);

  useEffect(() => {
    fullscreenMissileCommandViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenTicTacToeStateRef.current = fullscreenTicTacToeState;
  }, [fullscreenTicTacToeState]);

  useEffect(() => {
    fullscreenTicTacToeViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    fullscreenVirtualPianoStateRef.current = fullscreenVirtualPianoState;
  }, [fullscreenVirtualPianoState]);

  useEffect(() => {
    fullscreenVirtualPianoViewportRef.current = fullscreenCameraViewport;
  }, [fullscreenCameraViewport]);

  useEffect(() => {
    if (!isImmersiveAppPhase) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (phase === PHASES.FULLSCREEN_CAMERA) {
          returnFromFullscreenCameraScreen();
          return;
        }
        if (phase === PHASES.MINORITY_REPORT_LAB) {
          returnFromMinorityReportLab();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImmersiveAppPhase, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== FULLSCREEN_LANDING_MODE ||
      !fullscreenCameraLandingViewport
    ) {
      fullscreenModeLandingLastTickRef.current = 0;
      fullscreenModeLandingScrollTopRef.current = 0;
      if (fullscreenModeLandingStateRef.current) {
        fullscreenModeLandingStateRef.current = null;
        setFullscreenModeLandingState(null);
      }
      return undefined;
    }

    const nextLandingState = createFullscreenModeLandingState(
      fullscreenCameraLandingViewport.width,
      fullscreenCameraLandingViewport.height,
    );
    fullscreenModeLandingLastTickRef.current = 0;
    fullscreenModeLandingScrollTopRef.current = 0;
    fullscreenModeLandingStateRef.current = nextLandingState;
    setFullscreenModeLandingState(nextLandingState);
    return undefined;
  }, [fullscreenCameraLandingViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode === FULLSCREEN_LANDING_MODE ||
      !fullscreenCameraViewport
    ) {
      fullscreenExitControlLastTickRef.current = 0;
      if (fullscreenExitControlStateRef.current) {
        fullscreenExitControlStateRef.current = null;
        setFullscreenExitControlState(null);
      }
      return undefined;
    }

    const nextExitControlState = createFullscreenExitControlState(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenExitControlLastTickRef.current = 0;
    fullscreenExitControlStateRef.current = nextExitControlState;
    setFullscreenExitControlState(nextExitControlState);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      !fullscreenRestartControlLabel ||
      !fullscreenCameraViewport
    ) {
      fullscreenRestartControlLastTickRef.current = 0;
      if (fullscreenRestartControlStateRef.current) {
        fullscreenRestartControlStateRef.current = null;
        setFullscreenRestartControlState(null);
      }
      return undefined;
    }

    const nextRestartControlState = createFullscreenRestartControlState(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenRestartControlLastTickRef.current = 0;
    fullscreenRestartControlStateRef.current = nextRestartControlState;
    setFullscreenRestartControlState(nextRestartControlState);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenRestartControlLabel, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "hand-bounce" ||
      !fullscreenCameraViewport
    ) {
      fullscreenHandBounceLastTickRef.current = 0;
      if (fullscreenHandBounceStateRef.current) {
        fullscreenHandBounceStateRef.current = null;
        setFullscreenHandBounceState(null);
      }
      return undefined;
    }

    const nextGame = createFullscreenHandBounceGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenHandBounceLastTickRef.current = 0;
    fullscreenHandBounceStateRef.current = nextGame;
    setFullscreenHandBounceState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "brick-dodger" ||
      !fullscreenCameraViewport
    ) {
      fullscreenBrickDodgerLastTickRef.current = 0;
      if (fullscreenBrickDodgerStateRef.current) {
        fullscreenBrickDodgerStateRef.current = null;
        setFullscreenBrickDodgerState(null);
      }
      return undefined;
    }

    const nextGame = createBrickDodgerGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenBrickDodgerLastTickRef.current = 0;
    fullscreenBrickDodgerStateRef.current = nextGame;
    setFullscreenBrickDodgerState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      (fullscreenGridMode !== "breakout" &&
        fullscreenGridMode !== FIND_YOUR_GRIND_BREAKOUT_MODE_ID) ||
      !fullscreenCameraViewport
    ) {
      fullscreenBreakoutLastTickRef.current = 0;
      if (fullscreenBreakoutStateRef.current) {
        fullscreenBreakoutStateRef.current = null;
        setFullscreenBreakoutState(null);
      }
      return undefined;
    }

    const nextGame =
      fullscreenGridMode === FIND_YOUR_GRIND_BREAKOUT_MODE_ID
        ? createFindYourGrindBreakoutGame(
            fullscreenCameraViewport.width,
            fullscreenCameraViewport.height,
          )
        : createBreakoutGame(
            fullscreenCameraViewport.width,
            fullscreenCameraViewport.height,
          );
    fullscreenBreakoutLastTickRef.current = 0;
    fullscreenBreakoutStateRef.current = nextGame;
    setFullscreenBreakoutState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "breakout-coop" ||
      !fullscreenCameraViewport
    ) {
      fullscreenBreakoutCoopLastTickRef.current = 0;
      fullscreenBreakoutCoopPrimaryPinchLatchRef.current = false;
      fullscreenBreakoutCoopSecondaryPinchLatchRef.current = false;
      fullscreenPrimaryHandIdRef.current = null;
      if (fullscreenBreakoutCoopStateRef.current) {
        fullscreenBreakoutCoopStateRef.current = null;
        setFullscreenBreakoutCoopState(null);
      }
      return undefined;
    }

    const nextGame = createBreakoutCoopGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenBreakoutCoopLastTickRef.current = 0;
    fullscreenBreakoutCoopPrimaryPinchLatchRef.current = false;
    fullscreenBreakoutCoopSecondaryPinchLatchRef.current = false;
    fullscreenPrimaryHandIdRef.current = null;
    fullscreenBreakoutCoopStateRef.current = nextGame;
    setFullscreenBreakoutCoopState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "fruit-ninja" ||
      !fullscreenCameraViewport
    ) {
      fullscreenFruitNinjaLastTickRef.current = 0;
      if (fullscreenFruitNinjaStateRef.current) {
        fullscreenFruitNinjaStateRef.current = null;
        setFullscreenFruitNinjaState(null);
      }
      return undefined;
    }

    const nextGame = createFruitNinjaGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenFruitNinjaLastTickRef.current = 0;
    fullscreenFruitNinjaStateRef.current = nextGame;
    setFullscreenFruitNinjaState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (typeof Image === "undefined") {
      return undefined;
    }

    const spriteImage = new Image();
    spriteImage.onload = () => {
      fullscreenSkyPatrolSpriteImageRef.current = spriteImage;
      const renderer = fullscreenSkyPatrolRendererRef.current;
      renderer?.setSpriteImage(spriteImage);
      if (fullscreenSkyPatrolStateRef.current) {
        renderer?.draw(fullscreenSkyPatrolStateRef.current);
      }
    };
    spriteImage.src = SKY_PATROL_SPRITE_ATLAS_URL;

    return () => {
      spriteImage.onload = null;
    };
  }, []);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "sky-patrol" ||
      !fullscreenCameraViewport
    ) {
      fullscreenSkyPatrolLastTickRef.current = 0;
      fullscreenSkyPatrolStateRef.current = null;
      fullscreenSkyPatrolHudRef.current = null;
      fullscreenSkyPatrolRendererRef.current?.clear();
      fullscreenSkyPatrolRendererRef.current = null;
      setFullscreenSkyPatrolHud(null);
      return undefined;
    }

    const nextGame = createSkyPatrolGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenSkyPatrolLastTickRef.current = 0;
    publishFullscreenSkyPatrolState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== WFC_WORLD_MODE_ID ||
      !fullscreenCameraViewport
    ) {
      fullscreenWfcWorldLastTickRef.current = 0;
      fullscreenWfcWorldMouseInputRef.current = {
        pointerActive: false,
        pointerX: 0,
        pointerY: 0,
        pinchActive: false,
        pinchStarted: false,
      };
      if (fullscreenWfcWorldStateRef.current) {
        fullscreenWfcWorldStateRef.current = null;
        setFullscreenWfcWorldState(null);
      }
      return undefined;
    }

    const nextGame = createWfcWorldGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenWfcWorldLastTickRef.current = 0;
    fullscreenWfcWorldMouseInputRef.current = {
      pointerActive: false,
      pointerX: 0,
      pointerY: 0,
      pinchActive: false,
      pinchStarted: false,
    };
    fullscreenWfcWorldStateRef.current = nextGame;
    setFullscreenWfcWorldState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "invaders" ||
      !fullscreenCameraViewport
    ) {
      fullscreenInvadersLastTickRef.current = 0;
      if (fullscreenInvadersStateRef.current) {
        fullscreenInvadersStateRef.current = null;
        setFullscreenInvadersState(null);
      }
      return undefined;
    }

    const nextGame = createSpaceInvadersGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenInvadersLastTickRef.current = 0;
    fullscreenInvadersStateRef.current = nextGame;
    setFullscreenInvadersState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "finger-pong" ||
      !fullscreenCameraViewport
    ) {
      fullscreenFingerPongLastTickRef.current = 0;
      if (fullscreenFingerPongStateRef.current) {
        fullscreenFingerPongStateRef.current = null;
        setFullscreenFingerPongState(null);
      }
      return undefined;
    }

    const nextGame = createFingerPongGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenFingerPongLastTickRef.current = 0;
    fullscreenFingerPongStateRef.current = nextGame;
    setFullscreenFingerPongState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "flappy" ||
      !fullscreenCameraViewport
    ) {
      fullscreenFlappyLastTickRef.current = 0;
      if (fullscreenFlappyStateRef.current) {
        fullscreenFlappyStateRef.current = null;
        setFullscreenFlappyState(null);
      }
      return undefined;
    }

    const nextGame = createFlappyGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenFlappyLastTickRef.current = 0;
    fullscreenFlappyStateRef.current = nextGame;
    setFullscreenFlappyState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "missile-command" ||
      !fullscreenCameraViewport
    ) {
      fullscreenMissileCommandLastTickRef.current = 0;
      if (fullscreenMissileCommandStateRef.current) {
        fullscreenMissileCommandStateRef.current = null;
        setFullscreenMissileCommandState(null);
      }
      return undefined;
    }

    const nextGame = createMissileCommandGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenMissileCommandLastTickRef.current = 0;
    fullscreenMissileCommandStateRef.current = nextGame;
    setFullscreenMissileCommandState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "tic-tac-toe" ||
      !fullscreenCameraViewport
    ) {
      fullscreenTicTacToeLastTickRef.current = 0;
      if (fullscreenTicTacToeStateRef.current) {
        fullscreenTicTacToeStateRef.current = null;
        setFullscreenTicTacToeState(null);
      }
      return undefined;
    }

    const nextGame = createTicTacToeGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenTicTacToeLastTickRef.current = 0;
    fullscreenTicTacToeStateRef.current = nextGame;
    setFullscreenTicTacToeState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    if (
      phase !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridMode !== "virtual-piano" ||
      !fullscreenCameraViewport
    ) {
      for (const stopFn of Object.values(fullscreenVirtualPianoActiveNotesRef.current)) {
        stopFn?.();
      }
      fullscreenVirtualPianoActiveNotesRef.current = {};
      fullscreenVirtualPianoLastTickRef.current = 0;
      if (fullscreenVirtualPianoStateRef.current) {
        fullscreenVirtualPianoStateRef.current = null;
        setFullscreenVirtualPianoState(null);
      }
      return undefined;
    }

    const nextGame = createVirtualPianoGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenVirtualPianoLastTickRef.current = 0;
    fullscreenVirtualPianoStateRef.current = nextGame;
    setFullscreenVirtualPianoState(nextGame);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, phase]);

  useEffect(() => {
    const now = performance.now();

    if (!handDetected) {
      const pruned = pruneTrackedCursorTrail(cursorTrailRef.current, now);
      if (pruned.length !== cursorTrailRef.current.length) {
        cursorTrailRef.current = pruned;
        setCursorTrail(pruned);
      }
      return undefined;
    }

    const previousPoint = cursorTrailRef.current[cursorTrailRef.current.length - 1] ?? null;
    const elapsed = now - cursorTrailLastSampleAtRef.current;
    const distance = previousPoint
      ? Math.hypot(cursor.x - previousPoint.x, cursor.y - previousPoint.y)
      : Number.POSITIVE_INFINITY;
    if (elapsed < CURSOR_TRAIL_SAMPLE_INTERVAL_MS && distance < CURSOR_TRAIL_MIN_DISTANCE_PX) {
      return undefined;
    }

    cursorTrailLastSampleAtRef.current = now;
    const nextTrail = pruneTrackedCursorTrail(
      [
        ...cursorTrailRef.current,
        {
          x: cursor.x,
          y: cursor.y,
          timestamp: now,
        },
      ],
      now,
    );
    cursorTrailRef.current = nextTrail;
    setCursorTrail(nextTrail);
    setCursorTrailNow(now);
    return undefined;
  }, [cursor, handDetected]);

  useEffect(() => {
    if (cursorTrail.length === 0) {
      return undefined;
    }

    let frameId = 0;
    const tick = () => {
      const now = performance.now();
      const pruned = pruneTrackedCursorTrail(cursorTrailRef.current, now);
      cursorTrailRef.current = pruned;
      setCursorTrailNow(now);
      setCursorTrail((previous) => (previous.length === pruned.length ? previous : pruned));
      if (pruned.length > 0) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [cursorTrail.length]);

  useEffect(() => {
    if (fullscreenGridMode !== "rings") {
      fullscreenRingTrailRef.current = [];
      fullscreenRingTrailLastSampleAtRef.current = 0;
      if (fullscreenRingTrail.length > 0) {
        setFullscreenRingTrail([]);
      }
      return undefined;
    }

    const now = performance.now();
    const normalizedPoints = fullscreenIndexPoints
      .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
      .map((point) => ({
        id: point.id,
        label: point.label,
        x: point.x,
        y: point.y,
      }));
    const pruned = pruneCursorTrail(fullscreenRingTrailRef.current, now);
    const elapsed = now - fullscreenRingTrailLastSampleAtRef.current;

    if (normalizedPoints.length === 0) {
      if (pruned.length !== fullscreenRingTrailRef.current.length) {
        fullscreenRingTrailRef.current = pruned;
        setFullscreenRingTrail(pruned);
      }
      return undefined;
    }

    if (elapsed < FULLSCREEN_RING_TRAIL_SAMPLE_INTERVAL_MS) {
      return undefined;
    }

    fullscreenRingTrailLastSampleAtRef.current = now;
    const nextTrail = pruneCursorTrail(
      [
        ...pruned,
        {
          timestamp: now,
          points: normalizedPoints,
        },
      ],
      now,
    );
    fullscreenRingTrailRef.current = nextTrail;
    setFullscreenRingTrail(nextTrail);
    setFullscreenRingTrailNow(now);
    return undefined;
  }, [fullscreenGridMode, fullscreenIndexPoints, fullscreenRingTrail.length]);

  useEffect(() => {
    if (fullscreenGridMode !== "rings" || fullscreenRingTrail.length === 0) {
      return undefined;
    }

    let frameId = 0;
    const tick = () => {
      const now = performance.now();
      const pruned = pruneCursorTrail(fullscreenRingTrailRef.current, now);
      fullscreenRingTrailRef.current = pruned;
      setFullscreenRingTrailNow(now);
      setFullscreenRingTrail((previous) => (previous.length === pruned.length ? previous : pruned));
      if (pruned.length > 0) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [fullscreenGridMode, fullscreenRingTrail.length]);

  useEffect(() => {
    if (fullscreenGridMode !== "pulse" || !fullscreenCameraViewport) {
      fullscreenPulseBurstsRef.current = [];
      fullscreenPulseLastEmitByIdRef.current = {};
      if (fullscreenPulseBursts.length > 0) {
        setFullscreenPulseBursts([]);
      }
      return undefined;
    }

    const now = performance.now();
    const pruned = prunePulseBursts(fullscreenPulseBurstsRef.current, now);
    const nextBursts = [...pruned];
    const nextLastEmitById = { ...fullscreenPulseLastEmitByIdRef.current };
    const largestRingRadius =
      (FULLSCREEN_RING_LAYERS[FULLSCREEN_RING_LAYERS.length - 1]?.diameter ?? 0) / 2;

    for (const point of fullscreenIndexPoints) {
      if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
        continue;
      }

      const lastEmitAt = nextLastEmitById[point.id] ?? 0;
      if (now - lastEmitAt < FULLSCREEN_PULSE_RING_INTERVAL_MS) {
        continue;
      }

      const localX = point.x - fullscreenCameraViewport.left;
      const localY = point.y - fullscreenCameraViewport.top;
      const maxRadius = Math.max(
        Math.hypot(localX, localY),
        Math.hypot(fullscreenCameraViewport.width - localX, localY),
        Math.hypot(localX, fullscreenCameraViewport.height - localY),
        Math.hypot(
          fullscreenCameraViewport.width - localX,
          fullscreenCameraViewport.height - localY,
        ),
      );

      nextLastEmitById[point.id] = now;
      nextBursts.push({
        id: `${point.id}-${now}`,
        pointId: point.id,
        x: point.x,
        y: point.y,
        startTime: now,
        startRadius: largestRingRadius,
        maxRadius,
      });
    }

    fullscreenPulseBurstsRef.current = nextBursts;
    fullscreenPulseLastEmitByIdRef.current = nextLastEmitById;
    setFullscreenPulseBursts(nextBursts);
    setFullscreenPulseNow(now);
    return undefined;
  }, [fullscreenCameraViewport, fullscreenGridMode, fullscreenIndexPoints, fullscreenPulseBursts.length]);

  useEffect(() => {
    if (fullscreenGridMode !== "pulse" || fullscreenPulseBursts.length === 0) {
      return undefined;
    }

    let frameId = 0;
    const tick = () => {
      const now = performance.now();
      const pruned = prunePulseBursts(fullscreenPulseBurstsRef.current, now);
      fullscreenPulseBurstsRef.current = pruned;
      setFullscreenPulseNow(now);
      setFullscreenPulseBursts((previous) => (previous.length === pruned.length ? previous : pruned));
      if (pruned.length > 0) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [fullscreenGridMode, fullscreenPulseBursts.length]);

  useEffect(() => {
    if (fullscreenGridMode !== "tip-ripples") {
      fullscreenTipRippleStartedAtRef.current = 0;
      return undefined;
    }

    let frameId = 0;
    const startTime = performance.now();
    fullscreenTipRippleStartedAtRef.current = startTime;
    setFullscreenTipRippleNow(startTime);

    const tick = () => {
      setFullscreenTipRippleNow(performance.now());
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [fullscreenGridMode]);

  useEffect(() => {
    appLog.debug("Viewport changed", viewport);
  }, [appLog, viewport]);

  useEffect(() => {
    appLog.info("Camera ready state changed", { cameraReady });
  }, [appLog, cameraReady]);

  useEffect(() => {
    appLog.info("Camera aspect ratio changed", { cameraAspectRatio });
  }, [appLog, cameraAspectRatio]);

  useEffect(() => {
    appLog.info("Model ready state changed", { modelReady });
  }, [appLog, modelReady]);

  useEffect(() => {
    appLog.info("Tracking backend changed", { activeBackend });
  }, [activeBackend, appLog]);

  useEffect(() => {
    appLog.info("Tracking runtime changed", { activeRuntime });
  }, [activeRuntime, appLog]);

  useEffect(() => {
    appLog.debug("Hand detection state changed", { handDetected });
  }, [appLog, handDetected]);

  useEffect(() => {
    appLog.debug("Pinch active state changed", { pinchActive });
  }, [appLog, pinchActive]);

  useEffect(() => {
    appLog.debug("Calibration progress changed", {
      isCalibrating,
      isArcCalibrating,
      calibrationTargetIndex,
      calibrationPairsCount,
      calibrationSampleFrames,
      arcCalibrationProgress,
      arcCalibrationSamples,
      calibrationMessage,
    });
  }, [
    appLog,
    isCalibrating,
    isArcCalibrating,
    calibrationTargetIndex,
    calibrationPairsCount,
    calibrationSampleFrames,
    arcCalibrationProgress,
    arcCalibrationSamples,
    calibrationMessage,
  ]);

  useEffect(() => {
    appLog.debug("Sandbox state changed", {
      phase,
      blockCount: sandboxBlocks.length,
      grabbedBlockId: sandboxGrabbedBlockId,
    });
  }, [appLog, phase, sandboxBlocks.length, sandboxGrabbedBlockId]);

  useEffect(() => {
    appLog.debug("Flight HUD state changed", {
      phase,
      flightHud,
    });
  }, [appLog, phase, flightHud]);

  useEffect(() => {
    appLog.debug("Runner HUD state changed", {
      phase,
      runnerHud,
    });
  }, [appLog, phase, runnerHud]);

  useEffect(() => {
    appLog.debug("Calibration input test state changed", {
      hoveredCellIndex: inputTestHoveredCell,
      totalCells: INPUT_TEST_CELL_COUNT,
      pinchActive,
      pinchingHoverCell:
        phase === PHASES.CALIBRATION && !isCalibrating && pinchActive
          ? inputTestHoveredCell
          : -1,
      phase,
      isCalibrating,
    });
  }, [
    appLog,
    inputTestHoveredCell,
    pinchActive,
    phase,
    isCalibrating,
  ]);

  useEffect(() => {
    appLog.debug("Game scoreboard state changed", {
      score,
      timeLeft,
      gameRunning,
      activeMoleIndex,
    });
  }, [appLog, score, timeLeft, gameRunning, activeMoleIndex]);

  useEffect(() => {
    appLog.debug("Debug overlay state changed", { debugEnabled });
  }, [appLog, debugEnabled]);

  useEffect(() => {
    spatialMemoryRef.current = spatialMemoryState;
  }, [spatialMemoryState]);

  useEffect(() => {
    appLog.debug("Calibration transform state changed", {
      hasTransform: Boolean(transform),
      hasSavedCalibration,
      transform,
    });
  }, [appLog, transform, hasSavedCalibration]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    poseStatusRef.current = poseStatus;
  }, [poseStatus]);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    rawCursorRef.current = rawCursor;
  }, [rawCursor]);

  useEffect(() => {
    cursorTrailRef.current = cursorTrail;
  }, [cursorTrail]);

  useEffect(() => {
    fullscreenRingTrailRef.current = fullscreenRingTrail;
  }, [fullscreenRingTrail]);

  useEffect(() => {
    fullscreenPulseBurstsRef.current = fullscreenPulseBursts;
  }, [fullscreenPulseBursts]);

  useEffect(() => {
    debugRef.current = debugEnabled;
  }, [debugEnabled]);

  useEffect(() => {
    labConfidenceThresholdRef.current = labConfidenceThreshold;
  }, [labConfidenceThreshold]);

  useEffect(() => {
    labShowSkeletonRef.current = labShowSkeleton;
  }, [labShowSkeleton]);

  useEffect(() => {
    labPersonalizationEnabledRef.current = labPersonalizationEnabled;
  }, [labPersonalizationEnabled]);

  useEffect(() => {
    calibrationTargetsRef.current = calibrationTargets;
  }, [calibrationTargets]);

  useEffect(() => {
    calibrationIndexRef.current = calibrationTargetIndex;
  }, [calibrationTargetIndex]);

  useEffect(() => {
    isCalibratingRef.current = isCalibrating;
  }, [isCalibrating]);

  useEffect(() => {
    isArcCalibratingRef.current = isArcCalibrating;
  }, [isArcCalibrating]);

  useEffect(() => {
    inputTestHoveredCellRef.current = inputTestHoveredCell;
  }, [inputTestHoveredCell]);

  useEffect(() => {
    sandboxBlocksRef.current = sandboxBlocks;
  }, [sandboxBlocks]);

  useEffect(() => {
    sandboxGrabbedBlockIdRef.current = sandboxGrabbedBlockId;
  }, [sandboxGrabbedBlockId]);

  useEffect(() => {
    holesRef.current = holes;
  }, [holes]);

  useEffect(() => {
    gameRunningRef.current = gameRunning;
  }, [gameRunning]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    appLog.info("Attempting to load saved calibration on startup");
    const stored = loadCalibration();
    if (stored) {
      setTransform(stored);
      transformRef.current = stored;
      setHasSavedCalibration(true);
      setCalibrationMessage(
        isArcCalibrationModel(stored)
          ? "Saved lazy-arc calibration loaded. Start game or recalibrate anytime."
          : "Saved calibration loaded. Start game or recalibrate anytime.",
      );
      appLog.info("Loaded saved calibration", { stored });
    } else {
      appLog.info("No saved calibration found on startup");
    }
  }, [appLog]);

  useEffect(() => {
    appLog.debug("Registering window resize listener");
    const onResize = () => {
      appLog.debug("Window resize event received", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      appLog.debug("Removing window resize listener");
      window.removeEventListener("resize", onResize);
    };
  }, [appLog]);

  useEffect(() => {
    if (!showLeftPaneResizer && isLeftPaneResizing) {
      setIsLeftPaneResizing(false);
    }
  }, [isLeftPaneResizing, showLeftPaneResizer]);

  useEffect(() => {
    if (!showLeftPaneResizer || leftPaneWidth === null) {
      return;
    }

    const clampedWidth = clampResizableLeftPaneWidth(leftPaneWidth, getContentGridWidth());
    if (Math.abs(clampedWidth - leftPaneWidth) > 0.5) {
      setLeftPaneWidth(clampedWidth);
    }
  }, [leftPaneWidth, showLeftPaneResizer, viewport.width]);

  useEffect(() => {
    if (!isLeftPaneResizing) {
      return undefined;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isLeftPaneResizing]);

  useEffect(() => {
    if (!isLeftPaneResizing || !showLeftPaneResizer) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const { startWidth, startX } = leftPaneResizeStateRef.current;
      if (!Number.isFinite(startWidth) || startWidth <= 0) {
        return;
      }
      setClampedLeftPaneWidth(startWidth + event.clientX - startX);
    };

    const stopResizing = () => {
      setIsLeftPaneResizing(false);
      leftPaneResizeStateRef.current = {
        startWidth: 0,
        startX: 0,
      };
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isLeftPaneResizing, showLeftPaneResizer, viewport.width]);

  useEffect(() => {
    appLog.debug("Viewport effect started for targets/cursor refresh", viewport);
    const targets = createCalibrationTargets(viewport.width, viewport.height);
    setCalibrationTargets(targets);
    calibrationTargetsRef.current = targets;

    if (isCalibratingRef.current) {
      const nextIndex = Math.min(calibrationIndexRef.current, targets.length - 1);
      calibrationIndexRef.current = nextIndex;
      setCalibrationTargetIndex(nextIndex);
    }

    const clampedCursor = clampPoint(cursorRef.current, viewport.width, viewport.height);
    const clampedRaw = clampPoint(rawCursorRef.current, viewport.width, viewport.height);
    cursorRef.current = clampedCursor;
    rawCursorRef.current = clampedRaw;
    setCursor(clampedCursor);
    setRawCursor(clampedRaw);
    appLog.debug("Viewport effect completed", {
      targets: targets.length,
      clampedCursor,
      clampedRaw,
    });
  }, [appLog, viewport]);

  useEffect(() => {
    mountedRef.current = true;
    appLog.info("Camera initialization effect started");

    const initCamera = async () => {
      try {
        appLog.info("Requesting webcam access");
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support webcam access.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!mountedRef.current) {
          appLog.warn("Camera stream obtained but component was unmounted; closing tracks");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          await attachStreamToVideoElement(video, "camera_init");
        } else {
          appLog.warn("Video ref was unavailable after webcam stream setup");
        }
        setCameraReady(true);
      } catch (error) {
        appLog.error("Camera initialization failed", { error });
        setCameraError(
          error instanceof Error
            ? error.message
            : "Camera access failed. Check browser permissions.",
        );
      }
    };

    initCamera();

    return () => {
      appLog.info("Camera initialization cleanup started");
      mountedRef.current = false;
      if (rafRef.current) {
        appLog.debug("Cancelling RAF during camera cleanup", { rafId: rafRef.current });
        cancelAnimationFrame(rafRef.current);
      }
      if (streamRef.current) {
        appLog.info("Stopping webcam tracks during cleanup", {
          trackCount: streamRef.current.getTracks().length,
        });
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      attachedVideoElementRef.current = null;
    };
  }, [appLog]);

  useEffect(() => {
    let cancelled = false;
    appLog.info("Hand-tracking model initialization effect started");

    const initModel = async () => {
      try {
        const preferredConfig =
          INITIAL_TRACKING_RUNTIME === "mediapipe"
            ? { runtime: "mediapipe", modelType: "full", maxHands: TRACKING_MAX_HANDS }
            : {
                runtime: "tfjs",
                backend: "webgl",
                modelType: "full",
                maxHands: TRACKING_MAX_HANDS,
              };

        appLog.info("Initializing hand-tracking detector", {
          requestedRuntime: preferredConfig.runtime,
          requestedBackend: preferredConfig.backend ?? "n/a",
          requestedModelType: preferredConfig.modelType,
          requestedMaxHands: preferredConfig.maxHands,
        });

        let detector = null;
        try {
          detector = await initHandTracking(preferredConfig);
        } catch (error) {
          if (preferredConfig.runtime !== "mediapipe") {
            throw error;
          }

          appLog.warn("Preferred MediaPipe init failed; retrying TFJS WebGL", { error });
          detector = await initHandTracking({
            runtime: "tfjs",
            backend: "webgl",
            modelType: "full",
            maxHands: TRACKING_MAX_HANDS,
          });
        }

        if (cancelled) {
          appLog.warn("Model initialized after cancellation; disposing detector");
          detector?.dispose?.();
          return;
        }
        detectorRef.current = detector;
        const runtime = getCurrentRuntime() || preferredConfig.runtime;
        const backend =
          getCurrentBackend() || (runtime === "mediapipe" ? "n/a" : preferredConfig.backend || "webgl");
        setActiveRuntime(runtime);
        setActiveBackend(backend);
        appLog.info("Hand-tracking detector is ready");
        setModelReady(true);
      } catch (error) {
        appLog.error("Failed to initialize hand-tracking detector", { error });
        setModelError(
          error instanceof Error
            ? error.message
            : "Failed to initialize hand tracking model.",
        );
      }
    };

    initModel();

    return () => {
      cancelled = true;
      appLog.info("Model initialization cleanup started");
      if (detectorRef.current) {
        appLog.info("Disposing hand-tracking detector");
        detectorRef.current.dispose?.();
        detectorRef.current = null;
      }
    };
  }, [appLog]);

  useEffect(() => {
    appLog.debug("Starting camera overlay canvas sync effect");
    const syncCanvasSize = () => {
      const wrapper = cameraWrapRef.current;
      const canvas = overlayCanvasRef.current;
      if (!wrapper || !canvas) {
        appLog.debug("Skipped canvas sync due to missing wrapper/canvas", {
          hasWrapper: Boolean(wrapper),
          hasCanvas: Boolean(canvas),
        });
        return;
      }
      const rect = wrapper.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
      appLog.debug("Synced overlay canvas size", {
        width: canvas.width,
        height: canvas.height,
      });
    };

    syncCanvasSize();

    const wrapper = cameraWrapRef.current;
    if (!wrapper || !window.ResizeObserver) {
      appLog.warn("ResizeObserver unavailable for canvas sync; using window resize fallback");
      window.addEventListener("resize", syncCanvasSize);
      return () => {
        appLog.debug("Cleaning up fallback canvas resize listener");
        window.removeEventListener("resize", syncCanvasSize);
      };
    }

    const observer = new ResizeObserver(syncCanvasSize);
    observer.observe(wrapper);
    window.addEventListener("resize", syncCanvasSize);

    return () => {
      appLog.debug("Cleaning up canvas sync ResizeObserver and listeners");
      observer.disconnect();
      window.removeEventListener("resize", syncCanvasSize);
    };
  }, [appLog, phase]);

  useEffect(() => {
    const activeVideoElement = videoRef.current;
    if (!cameraReady || !activeVideoElement || !streamRef.current) {
      return;
    }

    if (
      attachedVideoElementRef.current === activeVideoElement &&
      activeVideoElement.srcObject === streamRef.current
    ) {
      return;
    }

    void attachStreamToVideoElement(activeVideoElement, "phase_video_swap").catch((error) => {
      appLog.error("Failed to attach camera stream after active video element changed", {
        phase,
        error,
      });
      setCameraError(
        error instanceof Error
          ? error.message
          : "Camera video playback could not be started.",
      );
    });
  }, [cameraReady, phase]);

  useEffect(() => {
    if (phase !== PHASES.GAME) {
      appLog.debug("Skipping board layout effect because phase is not GAME", { phase });
      return undefined;
    }
    appLog.debug("Starting board layout effect");

    const updateBoardLayout = () => {
      const board = boardRef.current;
      if (!board) {
        appLog.debug("Skipped board layout update due to missing board ref");
        return;
      }
      const rect = board.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        appLog.debug("Skipped board layout update due to zero-sized board rect", {
          width: rect.width,
          height: rect.height,
        });
        return;
      }

      const localHoles = buildGridHoles(rect.width, rect.height, 3, 3);
      setHoles(localHoles);
      holesRef.current = localHoles;
      hitZonesRef.current = localHoles.map((hole) => ({
        x: rect.left + hole.x,
        y: rect.top + hole.y,
        r: hole.r * 0.9,
      }));
      appLog.debug("Board layout updated", {
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        holeCount: localHoles.length,
      });
    };

    updateBoardLayout();

    const board = boardRef.current;
    if (!board || !window.ResizeObserver) {
      appLog.warn("ResizeObserver unavailable for board layout; using window resize fallback");
      window.addEventListener("resize", updateBoardLayout);
      return () => {
        appLog.debug("Cleaning up board layout fallback listener");
        window.removeEventListener("resize", updateBoardLayout);
      };
    }

    const observer = new ResizeObserver(updateBoardLayout);
    observer.observe(board);
    window.addEventListener("resize", updateBoardLayout);
    window.addEventListener("scroll", updateBoardLayout, true);

    return () => {
      appLog.debug("Cleaning up board layout observers/listeners");
      observer.disconnect();
      window.removeEventListener("resize", updateBoardLayout);
      window.removeEventListener("scroll", updateBoardLayout, true);
    };
  }, [appLog, phase]);

  useEffect(() => {
    if (phase !== PHASES.CALIBRATION) {
      setInputTestGridSize((previous) =>
        previous.width === 0 && previous.height === 0 && previous.cellSize === 0
          ? previous
          : { width: 0, height: 0, cellSize: 0 },
      );
      return undefined;
    }

    const stage = inputTestStageRef.current;
    if (!stage) {
      appLog.debug("Skipping input-test grid sizing because stage ref is unavailable");
      return undefined;
    }

    let rafId = 0;
    const updateGridSize = () => {
      const rect = stage.getBoundingClientRect();
      const nextSize = computeFittedGridSize(
        rect.width,
        rect.height,
        INPUT_TEST_GRID_COLS,
        INPUT_TEST_GRID_ROWS,
        INPUT_TEST_CELL_GAP,
      );
      setInputTestGridSize((previous) => {
        if (
          previous.width === nextSize.width &&
          previous.height === nextSize.height &&
          previous.cellSize === nextSize.cellSize
        ) {
          return previous;
        }
        appLog.debug("Updated calibration input-test grid fit size", {
          stageWidth: roundMetric(rect.width, 1),
          stageHeight: roundMetric(rect.height, 1),
          nextSize,
        });
        return nextSize;
      });
    };

    const scheduleGridSizeUpdate = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateGridSize();
      });
    };

    scheduleGridSizeUpdate();

    if (!window.ResizeObserver) {
      appLog.warn("ResizeObserver unavailable for input-test stage sizing; using window resize fallback");
      window.addEventListener("resize", scheduleGridSizeUpdate);
      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        window.removeEventListener("resize", scheduleGridSizeUpdate);
      };
    }

    const observer = new ResizeObserver(scheduleGridSizeUpdate);
    observer.observe(stage);
    window.addEventListener("resize", scheduleGridSizeUpdate);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      window.removeEventListener("resize", scheduleGridSizeUpdate);
    };
  }, [appLog, phase]);

  useEffect(() => {
    if (phase !== PHASES.SANDBOX) {
      return undefined;
    }
    const stage = sandboxStageRef.current;
    if (!stage) {
      appLog.debug("Skipping sandbox stage observer because stage ref is unavailable");
      return undefined;
    }

    let rafId = 0;
    const scheduleReset = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        resetSandboxBlocks("stage_resize_or_open");
      });
    };

    scheduleReset();

    if (!window.ResizeObserver) {
      window.addEventListener("resize", scheduleReset);
      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        window.removeEventListener("resize", scheduleReset);
      };
    }

    const observer = new ResizeObserver(scheduleReset);
    observer.observe(stage);
    window.addEventListener("resize", scheduleReset);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      window.removeEventListener("resize", scheduleReset);
    };
  }, [appLog, phase]);

  useEffect(() => {
    if (phase !== PHASES.FLIGHT) {
      return undefined;
    }
    const stage = flightStageRef.current;
    const canvas = flightCanvasRef.current;
    if (!stage || !canvas) {
      appLog.debug("Skipping flight stage observer because stage/canvas ref is unavailable", {
        hasStage: Boolean(stage),
        hasCanvas: Boolean(canvas),
      });
      return undefined;
    }

    let rafId = 0;
    const syncCanvasSizeAndReset = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        appLog.info("Synced flight canvas dimensions", { width, height });
      }
      resetFlightSession("flight_stage_resize_or_open");
    };
    const scheduleSync = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        syncCanvasSizeAndReset();
      });
    };

    scheduleSync();

    if (!window.ResizeObserver) {
      window.addEventListener("resize", scheduleSync);
      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        window.removeEventListener("resize", scheduleSync);
      };
    }

    const observer = new ResizeObserver(scheduleSync);
    observer.observe(stage);
    window.addEventListener("resize", scheduleSync);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      window.removeEventListener("resize", scheduleSync);
    };
  }, [appLog, phase]);

  useEffect(() => {
    if (phase !== PHASES.RUNNER) {
      return undefined;
    }
    const stage = runnerStageRef.current;
    const canvas = runnerCanvasRef.current;
    if (!stage || !canvas) {
      appLog.debug("Skipping runner stage observer because stage/canvas ref is unavailable", {
        hasStage: Boolean(stage),
        hasCanvas: Boolean(canvas),
      });
      return undefined;
    }

    let rafId = 0;
    const syncCanvasSize = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      let resized = false;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        resized = true;
        appLog.info("Synced runner canvas dimensions", { width, height });
      }
      if (resized) {
        drawRunnerScene();
      }
    };
    const scheduleSync = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        syncCanvasSize();
      });
    };

    scheduleSync();

    if (!window.ResizeObserver) {
      window.addEventListener("resize", scheduleSync);
      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        window.removeEventListener("resize", scheduleSync);
      };
    }

    const observer = new ResizeObserver(scheduleSync);
    observer.observe(stage);
    window.addEventListener("resize", scheduleSync);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      window.removeEventListener("resize", scheduleSync);
    };
  }, [appLog, phase]);

  useEffect(() => {
    if (
      phase === PHASES.BODY_POSE ||
      phase === PHASES.OFF_AXIS_LAB ||
      phase === PHASES.MINORITY_REPORT_LAB
    ) {
      void ensurePoseDetectorInitialized(
        phase === PHASES.BODY_POSE
          ? "enter_body_pose"
          : phase === PHASES.OFF_AXIS_LAB
            ? "enter_off_axis_lab"
            : "enter_minority_report_lab",
      );
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      if (poseDetectorRef.current) {
        poseDetectorRef.current.dispose?.();
        poseDetectorRef.current = null;
      }
    };
  }, []);

  async function ensurePoseDetectorInitialized(reason = "manual") {
    if (poseDetectorRef.current) {
      setPoseModelReady(true);
      return true;
    }

    if (poseInitPromiseRef.current) {
      await poseInitPromiseRef.current;
      return Boolean(poseDetectorRef.current);
    }

    const requestedBackend = getCurrentBackend() === "cpu" ? "cpu" : "webgl";
    setPoseModelReady(false);
    setPoseModelError("");
    poseInitPromiseRef.current = (async () => {
      try {
        appLog.info("Initializing pose detector", {
          reason,
          requestedBackend,
        });
        const detector = await initPoseTracking({
          runtime: "tfjs",
          backend: requestedBackend,
        });
        poseDetectorRef.current = detector;
        setPoseModelReady(true);
        setPoseModelError("");
        appLog.info("Pose detector ready", {
          reason,
          runtime: getPoseRuntime(),
        });
      } catch (error) {
        appLog.error("Pose detector initialization failed", { reason, error });
        setPoseModelError(
          error instanceof Error
            ? error.message
            : "Failed to initialize body pose detector.",
        );
      } finally {
        poseInitPromiseRef.current = null;
      }
    })();

    await poseInitPromiseRef.current;
    return Boolean(poseDetectorRef.current);
  }

  function getRecoveryConfig(attempt, reason) {
    const currentRuntime = getCurrentRuntime() || activeRuntime;
    const currentBackend = getCurrentBackend() || activeBackend;

    // Keep MediaPipe as the sticky runtime once it has been reached.
    if (currentRuntime === "mediapipe") {
      // Periodically probe TFJS in case a device/runtime combination recovers.
      if (attempt % 4 === 0) {
        return {
          runtime: "tfjs",
          backend: "webgl",
          modelType: "full",
          maxHands: TRACKING_MAX_HANDS,
        };
      }
      return { runtime: "mediapipe", modelType: "full", maxHands: TRACKING_MAX_HANDS };
    }

    // TFJS invalid-keypoint corruption should switch straight to MediaPipe.
    if (reason === "continuous_invalid_landmarks") {
      return { runtime: "mediapipe", modelType: "full", maxHands: TRACKING_MAX_HANDS };
    }

    if (attempt === 1) {
      return {
        runtime: "tfjs",
        backend: currentBackend === "cpu" ? "cpu" : "webgl",
        modelType: "full",
        maxHands: TRACKING_MAX_HANDS,
      };
    }

    if (attempt === 2) {
      return { runtime: "mediapipe", modelType: "full", maxHands: TRACKING_MAX_HANDS };
    }

    return { runtime: "tfjs", backend: "cpu", modelType: "full", maxHands: TRACKING_MAX_HANDS };
  }

  async function recoverDetectorFromInvalidLandmarks(reason, details) {
    if (recoveringDetectorRef.current) {
      return;
    }

    recoveringDetectorRef.current = true;
    detectorRecoveryAttemptsRef.current += 1;
    lastDetectorRecoveryAtRef.current = getTrackingTimestamp();
    const attempt = detectorRecoveryAttemptsRef.current;
    const requestedConfig = getRecoveryConfig(attempt, reason);
    logTrackingExtentsSnapshot(`pre_recovery_${reason}`);

    appLog.warn("Attempting detector recovery", {
      attempt,
      reason,
      requestedRuntime: requestedConfig.runtime,
      requestedBackend: requestedConfig.backend ?? "n/a",
      requestedModelType: requestedConfig.modelType,
      details,
      invalidLandmarkStreak: invalidLandmarkStreakRef.current,
      noHandStreak: noHandStreakRef.current,
    });

    try {
      const previousDetector = detectorRef.current;
      const nextDetector = await initHandTracking(requestedConfig);
      detectorRef.current = nextDetector;
      if (previousDetector && previousDetector !== nextDetector) {
        previousDetector.dispose?.();
      }
      invalidLandmarkStreakRef.current = 0;
      noHandStreakRef.current = 0;
      setActiveBackend(
        getCurrentBackend() ||
          requestedConfig.backend ||
          (requestedConfig.runtime === "mediapipe" ? "n/a" : "unknown"),
      );
      setActiveRuntime(getCurrentRuntime() || requestedConfig.runtime);
      setModelError("");
      appLog.info("Detector recovery succeeded", {
        attempt,
        activeRuntime: getCurrentRuntime(),
        activeBackend: getCurrentBackend(),
      });
    } catch (error) {
      appLog.error("Detector recovery failed", {
        attempt,
        requestedRuntime: requestedConfig.runtime,
        requestedBackend: requestedConfig.backend ?? "n/a",
        error,
      });
      setModelError(
        error instanceof Error
          ? `Tracking recovery failed: ${error.message}`
          : "Tracking recovery failed.",
      );
    } finally {
      recoveringDetectorRef.current = false;
    }
  }

  function resetCalibrationInputTests(reason = "manual_reset") {
    inputTestHoveredCellRef.current = -1;
    setInputTestHoveredCell(-1);
    appLog.info("Calibration input tests reset", { reason });
  }

  function resetArcCalibrationSession(reason = "manual_reset") {
    arcCalibrationStartRef.current = 0;
    arcCalibrationSamplesRef.current = [];
    isArcCalibratingRef.current = false;
    setIsArcCalibrating(false);
    setArcCalibrationProgress(0);
    setArcCalibrationSamples(0);
    appLog.info("Lazy-arc calibration session reset", { reason });
  }

  function resetSandboxBlocks(reason = "manual_reset") {
    const stage = sandboxStageRef.current;
    if (!stage) {
      appLog.debug("Skipping sandbox block reset because stage ref is unavailable", { reason });
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      appLog.debug("Skipping sandbox block reset because stage size is not ready", {
        reason,
        width: rect.width,
        height: rect.height,
      });
      return;
    }
    const nextBlocks = createSandboxBlocks(rect.width, rect.height);
    sandboxBlocksRef.current = nextBlocks;
    setSandboxBlocks(nextBlocks);
    sandboxLastTickRef.current = performance.now();
    sandboxGrabbedBlockIdRef.current = null;
    setSandboxGrabbedBlockId(null);
    sandboxGrabOffsetRef.current = { x: 0, y: 0 };
    sandboxGrabVelocityRef.current = { vx: 0, vy: 0 };
    sandboxGrabLastPositionRef.current = { x: 0, y: 0, timestamp: 0 };
    appLog.info("Sandbox blocks reset", {
      reason,
      width: rect.width,
      height: rect.height,
      blockCount: nextBlocks.length,
      blockSize: nextBlocks[0]?.size ?? null,
    });
  }

  function openSandboxScreen() {
    appLog.info("Opening pinch drag sandbox screen");
    stopGameSession();
    resetArcCalibrationSession("open_sandbox");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setPhase(PHASES.SANDBOX);
    phaseRef.current = PHASES.SANDBOX;
    setCalibrationMessage("Pinch Drag Sandbox active.");
    requestAnimationFrame(() => resetSandboxBlocks("open_sandbox"));
  }

  function openFullscreenCameraScreen() {
    appLog.info("Opening fullscreen camera screen");
    stopGameSession();
    resetArcCalibrationSession("open_fullscreen_camera");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setFullscreenGridMode(FULLSCREEN_LANDING_MODE);
    setPhase(PHASES.FULLSCREEN_CAMERA);
    phaseRef.current = PHASES.FULLSCREEN_CAMERA;
    setCalibrationMessage(
      "Fullscreen camera active. Webcam view fits the entire browser window without cropping.",
    );
  }

  function returnToCalibrationInputTest() {
    appLog.info("Returning from sandbox to calibration input test");
    sandboxGrabbedBlockIdRef.current = null;
    sandboxGrabOffsetRef.current = { x: 0, y: 0 };
    sandboxGrabVelocityRef.current = { vx: 0, vy: 0 };
    sandboxGrabLastPositionRef.current = { x: 0, y: 0, timestamp: 0 };
    setSandboxGrabbedBlockId(null);
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function returnFromFullscreenCameraScreen() {
    appLog.info("Returning from fullscreen camera to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function returnToFullscreenCameraMenu(reason = "manual_mode_select") {
    appLog.info("Returning to fullscreen camera menu", {
      reason,
      previousMode: fullscreenGridModeRef.current,
    });
    fullscreenGridModeRef.current = FULLSCREEN_LANDING_MODE;
    setFullscreenGridMode(FULLSCREEN_LANDING_MODE);
  }

  function updateSandboxPhysics(timestamp, pointerPoint, hasHand, grabNow) {
    if (phaseRef.current !== PHASES.SANDBOX) {
      return;
    }
    const stage = sandboxStageRef.current;
    if (!stage) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    if (!Array.isArray(sandboxBlocksRef.current) || sandboxBlocksRef.current.length === 0) {
      const seededBlocks = createSandboxBlocks(rect.width, rect.height);
      sandboxBlocksRef.current = seededBlocks;
      setSandboxBlocks(seededBlocks);
      sandboxLastTickRef.current = timestamp;
      return;
    }

    const dtSeconds = clampValue(
      (timestamp - (sandboxLastTickRef.current || timestamp)) / 1000,
      0,
      SANDBOX_MAX_STEP_SECONDS,
    );
    sandboxLastTickRef.current = timestamp;

    const pointerLocal = pointerPoint
      ? {
          x: pointerPoint.x - rect.left,
          y: pointerPoint.y - rect.top,
        }
      : null;

    let blocks = sandboxBlocksRef.current.map((block) => ({ ...block }));
    let grabbedId = sandboxGrabbedBlockIdRef.current;
    const clampVelocity = (value) =>
      clampValue(value, -SANDBOX_MAX_FLING_SPEED, SANDBOX_MAX_FLING_SPEED);

    const releaseGrabbedBlock = () => {
      if (grabbedId === null) {
        return;
      }
      const releaseIndex = blocks.findIndex((block) => block.id === grabbedId);
      if (releaseIndex >= 0) {
        const releaseVelocity = sandboxGrabVelocityRef.current;
        blocks[releaseIndex].vx = clampVelocity(releaseVelocity.vx);
        blocks[releaseIndex].vy = clampVelocity(releaseVelocity.vy);
        appLog.info("Sandbox block released with fling velocity", {
          blockId: grabbedId,
          vx: roundMetric(blocks[releaseIndex].vx, 2),
          vy: roundMetric(blocks[releaseIndex].vy, 2),
        });
      }
      grabbedId = null;
      sandboxGrabbedBlockIdRef.current = null;
      setSandboxGrabbedBlockId(null);
      sandboxGrabOffsetRef.current = { x: 0, y: 0 };
      sandboxGrabVelocityRef.current = { vx: 0, vy: 0 };
      sandboxGrabLastPositionRef.current = { x: 0, y: 0, timestamp: 0 };
    };

    if (!grabNow || !hasHand || !pointerLocal) {
      releaseGrabbedBlock();
    }

    if (grabNow && hasHand && pointerLocal) {
      if (grabbedId === null) {
        for (let index = blocks.length - 1; index >= 0; index -= 1) {
          const block = blocks[index];
          if (
            pointerLocal.x >= block.x &&
            pointerLocal.x <= block.x + block.size &&
            pointerLocal.y >= block.y &&
            pointerLocal.y <= block.y + block.size
          ) {
            grabbedId = block.id;
            sandboxGrabbedBlockIdRef.current = grabbedId;
            setSandboxGrabbedBlockId(grabbedId);
            sandboxGrabOffsetRef.current = {
              x: pointerLocal.x - block.x,
              y: pointerLocal.y - block.y,
            };
            sandboxGrabVelocityRef.current = {
              vx: block.vx,
              vy: block.vy,
            };
            sandboxGrabLastPositionRef.current = {
              x: block.x,
              y: block.y,
              timestamp,
            };
            const grabbedBlock = blocks.splice(index, 1)[0];
            blocks.push(grabbedBlock);
            break;
          }
        }
      }

      if (grabbedId !== null) {
        const grabbedIndex = blocks.findIndex((block) => block.id === grabbedId);
        if (grabbedIndex >= 0) {
          const grabbedBlock = blocks[grabbedIndex];
          const previousX = grabbedBlock.x;
          const previousY = grabbedBlock.y;
          grabbedBlock.x = clampValue(
            pointerLocal.x - sandboxGrabOffsetRef.current.x,
            0,
            rect.width - grabbedBlock.size,
          );
          grabbedBlock.y = clampValue(
            pointerLocal.y - sandboxGrabOffsetRef.current.y,
            0,
            rect.height - grabbedBlock.size,
          );

          const previousMove = sandboxGrabLastPositionRef.current;
          const elapsedSeconds = Math.max(
            1 / 120,
            (timestamp - (previousMove.timestamp || timestamp)) / 1000,
          );
          const instantVx = (grabbedBlock.x - previousX) / elapsedSeconds;
          const instantVy = (grabbedBlock.y - previousY) / elapsedSeconds;
          const smoothedVx =
            sandboxGrabVelocityRef.current.vx * 0.58 + instantVx * 0.42;
          const smoothedVy =
            sandboxGrabVelocityRef.current.vy * 0.58 + instantVy * 0.42;
          sandboxGrabVelocityRef.current = {
            vx: clampVelocity(smoothedVx),
            vy: clampVelocity(smoothedVy),
          };
          sandboxGrabLastPositionRef.current = {
            x: grabbedBlock.x,
            y: grabbedBlock.y,
            timestamp,
          };
          grabbedBlock.vx = 0;
          grabbedBlock.vy = 0;
        }
      }
    }

    for (const block of blocks) {
      if (grabbedId !== null && block.id === grabbedId) {
        continue;
      }

      block.vy += SANDBOX_GRAVITY * dtSeconds;
      const drag = Number.isFinite(block.airDrag) ? block.airDrag : 0.994;
      block.vx *= drag;
      block.vy *= drag;
      block.x += block.vx * dtSeconds;
      block.y += block.vy * dtSeconds;

      const restitution = Number.isFinite(block.restitution) ? block.restitution : 0.2;
      if (block.x < 0) {
        block.x = 0;
        if (block.vx < 0) {
          block.vx = -block.vx * restitution;
          block.vy *= SANDBOX_FLOOR_FRICTION;
        }
      } else if (block.x + block.size > rect.width) {
        block.x = rect.width - block.size;
        if (block.vx > 0) {
          block.vx = -block.vx * restitution;
          block.vy *= SANDBOX_FLOOR_FRICTION;
        }
      }

      if (block.y < 0) {
        block.y = 0;
        if (block.vy < 0) {
          block.vy = -block.vy * restitution;
          block.vx *= SANDBOX_FLOOR_FRICTION;
        }
      } else if (block.y + block.size > rect.height) {
        block.y = rect.height - block.size;
        if (block.vy > 0) {
          block.vy = -Math.abs(block.vy) * restitution;
          block.vx *= SANDBOX_FLOOR_FRICTION;
        }
        if (Math.abs(block.vy) < SANDBOX_REST_VELOCITY) {
          block.vy = 0;
        }
      }
    }

    for (let iteration = 0; iteration < SANDBOX_COLLISION_ITERATIONS; iteration += 1) {
      for (let first = 0; first < blocks.length; first += 1) {
        for (let second = first + 1; second < blocks.length; second += 1) {
          const blockA = blocks[first];
          const blockB = blocks[second];
          const overlapX =
            Math.min(blockA.x + blockA.size, blockB.x + blockB.size) -
            Math.max(blockA.x, blockB.x);
          const overlapY =
            Math.min(blockA.y + blockA.size, blockB.y + blockB.size) -
            Math.max(blockA.y, blockB.y);
          if (overlapX <= 0 || overlapY <= 0) {
            continue;
          }

          const centerAx = blockA.x + blockA.size / 2;
          const centerAy = blockA.y + blockA.size / 2;
          const centerBx = blockB.x + blockB.size / 2;
          const centerBy = blockB.y + blockB.size / 2;
          const blockAGrabbed = grabbedId === blockA.id;
          const blockBGrabbed = grabbedId === blockB.id;
          const moveShareA = blockAGrabbed ? 0 : blockBGrabbed ? 1 : 0.5;
          const moveShareB = blockBGrabbed ? 0 : blockAGrabbed ? 1 : 0.5;
          const invMassA = blockAGrabbed ? 0 : 1 / Math.max(0.001, blockA.mass || 1);
          const invMassB = blockBGrabbed ? 0 : 1 / Math.max(0.001, blockB.mass || 1);
          const invMassSum = invMassA + invMassB;
          const restitution = Math.max(
            blockA.restitution ?? 0.2,
            blockB.restitution ?? 0.2,
          );

          if (overlapX < overlapY) {
            const direction = centerAx < centerBx ? -1 : 1;
            const separation = overlapX + 0.01;
            blockA.x = clampValue(
              blockA.x + direction * separation * moveShareA,
              0,
              rect.width - blockA.size,
            );
            blockB.x = clampValue(
              blockB.x - direction * separation * moveShareB,
              0,
              rect.width - blockB.size,
            );

            if (invMassSum > 0) {
              const normal = centerAx < centerBx ? 1 : -1;
              const relativeNormalVelocity = (blockB.vx - blockA.vx) * normal;
              if (relativeNormalVelocity < 0) {
                const impulseMagnitude =
                  (-(1 + restitution) * relativeNormalVelocity) / invMassSum;
                blockA.vx -= impulseMagnitude * invMassA * normal;
                blockB.vx += impulseMagnitude * invMassB * normal;
              }
              const tangentVelocity = blockB.vy - blockA.vy;
              const frictionImpulse = tangentVelocity * SANDBOX_COLLISION_FRICTION;
              blockA.vy += frictionImpulse * invMassA * 0.5;
              blockB.vy -= frictionImpulse * invMassB * 0.5;
            }
          } else {
            const direction = centerAy < centerBy ? -1 : 1;
            const separation = overlapY + 0.01;
            blockA.y = clampValue(
              blockA.y + direction * separation * moveShareA,
              0,
              rect.height - blockA.size,
            );
            blockB.y = clampValue(
              blockB.y - direction * separation * moveShareB,
              0,
              rect.height - blockB.size,
            );

            if (invMassSum > 0) {
              const normal = centerAy < centerBy ? 1 : -1;
              const relativeNormalVelocity = (blockB.vy - blockA.vy) * normal;
              if (relativeNormalVelocity < 0) {
                const impulseMagnitude =
                  (-(1 + restitution) * relativeNormalVelocity) / invMassSum;
                blockA.vy -= impulseMagnitude * invMassA * normal;
                blockB.vy += impulseMagnitude * invMassB * normal;
              }
              const tangentVelocity = blockB.vx - blockA.vx;
              const frictionImpulse = tangentVelocity * SANDBOX_COLLISION_FRICTION;
              blockA.vx += frictionImpulse * invMassA * 0.5;
              blockB.vx -= frictionImpulse * invMassB * 0.5;
            }
          }
        }
      }
    }

    for (const block of blocks) {
      if (grabbedId !== null && block.id === grabbedId) {
        continue;
      }

      const isOnFloor = Math.abs(block.y + block.size - rect.height) <= 1.2;
      if (isOnFloor && Math.abs(block.vx) < 1.2) {
        block.vx = 0;
      }

      if (!isOnFloor) {
        let supportMin = Number.POSITIVE_INFINITY;
        let supportMax = Number.NEGATIVE_INFINITY;

        for (const other of blocks) {
          if (other.id === block.id) {
            continue;
          }
          const verticalGap = Math.abs(block.y + block.size - other.y);
          if (verticalGap > SANDBOX_SUPPORT_EPSILON) {
            continue;
          }
          const overlapLeft = Math.max(block.x, other.x);
          const overlapRight = Math.min(block.x + block.size, other.x + other.size);
          const overlapWidth = overlapRight - overlapLeft;
          if (overlapWidth <= 1) {
            continue;
          }
          supportMin = Math.min(supportMin, overlapLeft);
          supportMax = Math.max(supportMax, overlapRight);
        }

        if (Number.isFinite(supportMin) && Number.isFinite(supportMax)) {
          const centerX = block.x + block.size / 2;
          let overhangDistance = 0;
          if (centerX < supportMin) {
            overhangDistance = centerX - supportMin;
          } else if (centerX > supportMax) {
            overhangDistance = centerX - supportMax;
          }

          if (overhangDistance !== 0) {
            const direction = Math.sign(overhangDistance);
            const overhangRatio = clampValue(
              Math.abs(overhangDistance) / Math.max(1, block.size * 0.5),
              0.08,
              1.4,
            );
            block.vx += direction * SANDBOX_OVERHANG_ACCEL * overhangRatio * dtSeconds;
            block.vy += SANDBOX_GRAVITY * 0.08 * dtSeconds;
          }
        }
      }

      block.x = clampValue(block.x, 0, rect.width - block.size);
      block.y = clampValue(block.y, 0, rect.height - block.size);
      block.vx = clampVelocity(block.vx);
      block.vy = clampVelocity(block.vy);
      if (Math.abs(block.vx) < 0.18) {
        block.vx = 0;
      }
      if (Math.abs(block.vy) < 0.18 && block.y + block.size >= rect.height - 0.6) {
        block.vy = 0;
      }
    }

    sandboxBlocksRef.current = blocks;
    setSandboxBlocks(blocks);
  }

  function publishFlightHud(timestamp) {
    if (timestamp - flightHudLastUpdateRef.current < FLIGHT_HUD_UPDATE_MS) {
      return;
    }
    flightHudLastUpdateRef.current = timestamp;
    const baseline = flightBaselineRef.current;
    const control = flightControlRef.current;
    const state = flightStateRef.current;
    const nextHud = {
      yaw: roundMetric(control.yaw, 3) ?? 0,
      pitch: roundMetric(control.pitch, 3) ?? 0,
      roll: roundMetric(control.roll, 3) ?? 0,
      confidence: roundMetric(control.confidence, 3) ?? 0,
      baselineReady: baseline.ready,
      baselineSamples: baseline.sampleCount,
      distance: roundMetric(state.distance, 1) ?? 0,
    };
    setFlightHud((previous) => {
      if (
        previous.yaw === nextHud.yaw &&
        previous.pitch === nextHud.pitch &&
        previous.roll === nextHud.roll &&
        previous.confidence === nextHud.confidence &&
        previous.baselineReady === nextHud.baselineReady &&
        previous.baselineSamples === nextHud.baselineSamples &&
        previous.distance === nextHud.distance
      ) {
        return previous;
      }
      return nextHud;
    });
  }

  function resetFlightSession(reason = "manual_reset") {
    flightStateRef.current = {
      initialized: true,
      lastTimestamp: 0,
      shipX: 0,
      shipY: 0,
      shipVx: 0,
      shipVy: 0,
      roll: 0,
      pitch: 0,
      yaw: 0,
      distance: 0,
      stars: createFlightStars(),
      rings: createFlightRings(),
    };
    flightControlRef.current = {
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 0,
      hasControl: false,
      lastUpdate: 0,
    };
    flightBaselineRef.current = createEmptyFlightBaseline();
    flightBaselineSamplesRef.current = [];
    flightHudLastUpdateRef.current = 0;
    setFlightHud({
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 0,
      baselineReady: false,
      baselineSamples: 0,
      distance: 0,
    });
    appLog.info("Flight session reset", {
      reason,
      starCount: flightStateRef.current.stars.length,
      ringCount: flightStateRef.current.rings.length,
    });
  }

  function resetFlightNeutral(reason = "manual_reset") {
    flightControlRef.current = {
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 0,
      hasControl: false,
      lastUpdate: 0,
    };
    flightBaselineRef.current = createEmptyFlightBaseline();
    flightBaselineSamplesRef.current = [];
    flightHudLastUpdateRef.current = 0;
    setCalibrationMessage(
      "Flight neutral reset. Hold all five fingertips visible to recapture your center pose.",
    );
    appLog.info("Flight neutral reset", { reason });
  }

  function startFlightSession() {
    appLog.info("Flight session start requested", {
      hasTransform: Boolean(transformRef.current),
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_flight");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setPhase(PHASES.FLIGHT);
    phaseRef.current = PHASES.FLIGHT;
    setCalibrationMessage(
      "Flight mode active. Hold all five fingertips visible to capture neutral orientation.",
    );
    requestAnimationFrame(() => resetFlightSession("start_flight"));
  }

  function returnFromFlightSession() {
    appLog.info("Returning from flight mode to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function updateFlightControlFromTips(mappedFingerTips, timestamp, frameId) {
    if (phaseRef.current !== PHASES.FLIGHT) {
      return;
    }

    const control = flightControlRef.current;
    const baseline = flightBaselineRef.current;
    const pose = computeFiveFingerPose(mappedFingerTips);
    if (!pose) {
      control.yaw = lerpValue(control.yaw, 0, 0.08);
      control.pitch = lerpValue(control.pitch, 0, 0.08);
      control.roll = lerpValue(control.roll, 0, 0.08);
      control.confidence = lerpValue(control.confidence, 0, 0.12);
      control.hasControl = false;
      control.lastUpdate = timestamp;
      publishFlightHud(timestamp);
      if (!baseline.ready && frameId % 45 === 0) {
        setCalibrationMessage(
          "Flight neutral capture paused: keep all five fingertips visible in frame.",
        );
      }
      return;
    }

    if (!baseline.ready) {
      flightBaselineSamplesRef.current.push(pose);
      if (flightBaselineSamplesRef.current.length > FLIGHT_BASELINE_SAMPLE_TARGET) {
        flightBaselineSamplesRef.current.shift();
      }
      baseline.sampleCount = flightBaselineSamplesRef.current.length;
      flightBaselineRef.current = { ...baseline };

      const progress = Math.round(
        (flightBaselineSamplesRef.current.length / FLIGHT_BASELINE_SAMPLE_TARGET) * 100,
      );
      if (frameId % 8 === 0) {
        setCalibrationMessage(
          `Capturing flight neutral pose: ${progress}% (${flightBaselineSamplesRef.current.length}/${FLIGHT_BASELINE_SAMPLE_TARGET}). Keep fingertips visible and steady.`,
        );
      }

      if (flightBaselineSamplesRef.current.length >= FLIGHT_BASELINE_SAMPLE_TARGET) {
        const samples = flightBaselineSamplesRef.current;
        const tipSums = FLIGHT_FINGER_ORDER.map(() => ({ u: 0, v: 0 }));
        let centroidUSum = 0;
        let centroidVSum = 0;
        let opennessSum = 0;
        let angleSinSum = 0;
        let angleCosSum = 0;
        for (const sample of samples) {
          centroidUSum += sample.centroid.u;
          centroidVSum += sample.centroid.v;
          opennessSum += sample.openness;
          angleSinSum += Math.sin(sample.principalAngle);
          angleCosSum += Math.cos(sample.principalAngle);
          sample.points.forEach((point, pointIndex) => {
            tipSums[pointIndex].u += point.u;
            tipSums[pointIndex].v += point.v;
          });
        }
        const nextBaseline = {
          ready: true,
          sampleCount: samples.length,
          centroid: {
            u: centroidUSum / samples.length,
            v: centroidVSum / samples.length,
          },
          principalAngle: Math.atan2(angleSinSum / samples.length, angleCosSum / samples.length),
          openness: opennessSum / samples.length,
          tips: tipSums.map((sum) => ({
            u: sum.u / samples.length,
            v: sum.v / samples.length,
          })),
        };
        flightBaselineRef.current = nextBaseline;
        flightBaselineSamplesRef.current = [];
        setCalibrationMessage(
          "Flight neutral captured. Move your hand to steer the ship using all five fingertips.",
        );
        appLog.info("Flight baseline captured", {
          frameId,
          baseline: nextBaseline,
        });
      }

      control.yaw = lerpValue(control.yaw, 0, 0.18);
      control.pitch = lerpValue(control.pitch, 0, 0.18);
      control.roll = lerpValue(control.roll, 0, 0.18);
      control.confidence = lerpValue(control.confidence, 0.2, 0.2);
      control.hasControl = false;
      control.lastUpdate = timestamp;
      publishFlightHud(timestamp);
      return;
    }

    const baselineAngleDelta = wrapAngleDelta(pose.principalAngle - baseline.principalAngle);
    const rollFromAngle = clampValue((-baselineAngleDelta) / 0.75, -1, 1);
    const fingerRollNumerator = pose.points.reduce((accumulator, point, pointIndex) => {
      const baselinePoint = baseline.tips[pointIndex];
      const weight = FLIGHT_ROLL_WEIGHTS[pointIndex] ?? 0;
      return accumulator + weight * (baselinePoint.v - point.v);
    }, 0);
    const rollFromFingers = clampValue(fingerRollNumerator / 1.44, -1, 1);
    const opennessRatio = pose.openness / Math.max(0.0001, baseline.openness);
    const opennessGain = clampValue((opennessRatio - 0.52) / 0.52, 0.45, 1.22);

    const yawTarget = clampValue(
      ((pose.centroid.u - baseline.centroid.u) / 0.2) * opennessGain,
      -1,
      1,
    );
    const pitchTarget = clampValue(
      ((baseline.centroid.v - pose.centroid.v) / 0.2) * opennessGain,
      -1,
      1,
    );
    const rollTarget = clampValue(rollFromAngle * 0.66 + rollFromFingers * 0.34, -1, 1);

    control.yaw = lerpValue(control.yaw, yawTarget, 0.24);
    control.pitch = lerpValue(control.pitch, pitchTarget, 0.24);
    control.roll = lerpValue(control.roll, rollTarget, 0.24);
    const opennessConfidence = clampValue(
      1 - Math.abs(opennessRatio - 1) * 0.42,
      0.25,
      1,
    );
    control.confidence = lerpValue(control.confidence, opennessConfidence, 0.22);
    control.hasControl = true;
    control.lastUpdate = timestamp;
    if (frameId % 18 === 0) {
      appLog.debug("Flight control update from five fingertips", {
        frameId,
        yawTarget: roundMetric(yawTarget, 4),
        pitchTarget: roundMetric(pitchTarget, 4),
        rollTarget: roundMetric(rollTarget, 4),
        rollFromAngle: roundMetric(rollFromAngle, 4),
        rollFromFingers: roundMetric(rollFromFingers, 4),
        opennessRatio: roundMetric(opennessRatio, 4),
        centroid: {
          u: roundMetric(pose.centroid.u, 4),
          v: roundMetric(pose.centroid.v, 4),
        },
      });
    }
    publishFlightHud(timestamp);
  }

  function drawFlightScene() {
    const stage = flightStageRef.current;
    const canvas = flightCanvasRef.current;
    if (!stage || !canvas) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const state = flightStateRef.current;
    const control = flightControlRef.current;
    ctx.clearRect(0, 0, width, height);
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#050a16");
    sky.addColorStop(0.52, "#081327");
    sky.addColorStop(1, "#0f1f2f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.32;
    ctx.fillStyle = "#3161ff";
    ctx.beginPath();
    ctx.arc(width * 0.24, height * 0.16, Math.max(40, width * 0.16), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4ad8ff";
    ctx.beginPath();
    ctx.arc(width * 0.78, height * 0.26, Math.max(34, width * 0.12), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const fov = Math.min(width, height) * 1.06;
    const cameraX = state.shipX * 0.66;
    const cameraY = state.shipY * 0.6;

    ctx.strokeStyle = "rgba(74, 126, 220, 0.24)";
    ctx.lineWidth = 1.2;
    for (let lane = -3; lane <= 3; lane += 1) {
      const farDepth = FLIGHT_FAR_Z;
      const nearDepth = 260;
      const xNear = centerX + ((lane * 112 - cameraX) * fov) / nearDepth;
      const yNear = centerY + ((136 - cameraY) * fov) / nearDepth;
      const xFar = centerX + ((lane * 420 - cameraX) * fov) / farDepth;
      const yFar = centerY + ((-210 - cameraY) * fov) / farDepth;
      ctx.beginPath();
      ctx.moveTo(xNear, yNear);
      ctx.lineTo(xFar, yFar);
      ctx.stroke();
    }

    for (const star of state.stars) {
      const depth = Math.max(FLIGHT_NEAR_Z, star.z);
      const projectedX = centerX + ((star.x - cameraX) * fov) / depth;
      const projectedY = centerY + ((star.y - cameraY) * fov) / depth;
      if (
        projectedX < -12 ||
        projectedX > width + 12 ||
        projectedY < -12 ||
        projectedY > height + 12
      ) {
        continue;
      }
      const size = clampValue(0.8 + 200 / depth, 0.8, 3.4);
      const alpha = clampValue(1.1 - depth / FLIGHT_FAR_Z, 0.16, 0.95);
      ctx.fillStyle = `rgba(214, 231, 255, ${alpha})`;
      ctx.fillRect(projectedX - size * 0.5, projectedY - size * 0.5, size, size);
    }

    const sortedRings = [...state.rings].sort((a, b) => b.z - a.z);
    for (const ring of sortedRings) {
      const depth = Math.max(FLIGHT_NEAR_Z, ring.z);
      const projectedX = centerX + ((ring.x - state.shipX * 0.92) * fov) / depth;
      const projectedY = centerY + ((ring.y - state.shipY * 0.92) * fov) / depth;
      const projectedRadius = (ring.radius * fov) / depth;
      if (projectedRadius < 2) {
        continue;
      }
      const alpha = clampValue(1 - depth / FLIGHT_FAR_Z, 0.18, 0.84);
      ctx.lineWidth = clampValue((ring.radius / depth) * 150, 1.2, 5.4);
      ctx.strokeStyle = `rgba(80, 221, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(projectedX, projectedY, projectedRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(170, 225, 255, 0.48)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(centerX - 16, centerY);
    ctx.lineTo(centerX + 16, centerY);
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX, centerY + 12);
    ctx.stroke();

    const shipX = width * 0.5 + state.shipX * 0.38;
    const shipY = height * 0.5 + state.shipY * 0.3;
    const shipScale = clampValue(Math.min(width, height) / 420, 0.72, 1.34);
    ctx.save();
    ctx.translate(shipX, shipY);
    ctx.rotate(state.roll * 0.9);
    ctx.scale(shipScale, shipScale);

    const thrusterLength = 22 + Math.abs(control.pitch) * 16;
    ctx.strokeStyle = "rgba(125, 219, 255, 0.74)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, 16);
    ctx.lineTo(-10, 16 + thrusterLength);
    ctx.moveTo(10, 16);
    ctx.lineTo(10, 16 + thrusterLength);
    ctx.stroke();

    ctx.fillStyle = "#cad8f0";
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(18, 2);
    ctx.lineTo(12, 24);
    ctx.lineTo(-12, 24);
    ctx.lineTo(-18, 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#8ea2c2";
    ctx.beginPath();
    ctx.moveTo(-54, 10);
    ctx.lineTo(-14, -2);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-50, 30);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(54, 10);
    ctx.lineTo(14, -2);
    ctx.lineTo(8, 20);
    ctx.lineTo(50, 30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#59ccff";
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(8, -10);
    ctx.lineTo(-8, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function updateFlightSimulation(timestamp) {
    if (phaseRef.current !== PHASES.FLIGHT) {
      return;
    }

    const state = flightStateRef.current;
    if (!state.initialized) {
      resetFlightSession("auto_init");
      return;
    }

    const dtSeconds = clampValue(
      (timestamp - (state.lastTimestamp || timestamp)) / 1000,
      0.001,
      SANDBOX_MAX_STEP_SECONDS,
    );
    state.lastTimestamp = timestamp;
    const control = flightControlRef.current;
    const drag = Math.pow(FLIGHT_DRAG_PER_60FPS, dtSeconds * 60);

    state.shipVx = (state.shipVx + control.yaw * FLIGHT_STEER_ACCEL * dtSeconds) * drag;
    state.shipVy = (state.shipVy + control.pitch * FLIGHT_STEER_ACCEL * dtSeconds) * drag;
    state.shipX = clampValue(
      state.shipX + state.shipVx * dtSeconds,
      -FLIGHT_MAX_SHIP_OFFSET_X,
      FLIGHT_MAX_SHIP_OFFSET_X,
    );
    state.shipY = clampValue(
      state.shipY + state.shipVy * dtSeconds,
      -FLIGHT_MAX_SHIP_OFFSET_Y,
      FLIGHT_MAX_SHIP_OFFSET_Y,
    );
    const targetRoll = control.roll * 0.92 + control.yaw * 0.36;
    const targetPitch = control.pitch * 0.6;
    const targetYaw = control.yaw * 0.62;
    state.roll = lerpValue(state.roll, targetRoll, 0.13);
    state.pitch = lerpValue(state.pitch, targetPitch, 0.13);
    state.yaw = lerpValue(state.yaw, targetYaw, 0.13);
    state.distance += FLIGHT_FORWARD_SPEED * dtSeconds;

    for (const star of state.stars) {
      star.z -= FLIGHT_FORWARD_SPEED * dtSeconds * (1 + Math.abs(control.pitch) * 0.14);
      if (star.z < FLIGHT_NEAR_Z) {
        star.z = FLIGHT_FAR_Z;
        star.x = randomBetween(-FLIGHT_WORLD_HALF_WIDTH, FLIGHT_WORLD_HALF_WIDTH);
        star.y = randomBetween(-FLIGHT_WORLD_HALF_HEIGHT, FLIGHT_WORLD_HALF_HEIGHT);
      }
    }

    for (const ring of state.rings) {
      ring.z -= FLIGHT_FORWARD_SPEED * dtSeconds;
      if (ring.z < FLIGHT_NEAR_Z) {
        ring.z = FLIGHT_FAR_Z + randomBetween(120, 380);
        ring.x = randomBetween(-180, 180);
        ring.y = randomBetween(-116, 116);
        ring.radius = randomBetween(34, 66);
      }
    }

    drawFlightScene();
    publishFlightHud(timestamp);
  }

  function publishRunnerHud(timestamp) {
    if (timestamp - runnerHudLastUpdateRef.current < RUNNER_HUD_UPDATE_MS) {
      return;
    }
    runnerHudLastUpdateRef.current = timestamp;
    const state = runnerStateRef.current;
    const nextHud = {
      coins: state.coinsCollected,
      distance: roundMetric(state.distance, 1) ?? 0,
      trackCol: state.trackXTargetIndex + 1,
      trackRow: state.trackYTargetIndex + 1,
      trackSpacingPx: roundMetric(state.trackSpacing, 1) ?? 0,
    };
    setRunnerHud((previous) => {
      if (
        previous.coins === nextHud.coins &&
        previous.distance === nextHud.distance &&
        previous.trackCol === nextHud.trackCol &&
        previous.trackRow === nextHud.trackRow &&
        previous.trackSpacingPx === nextHud.trackSpacingPx
      ) {
        return previous;
      }
      return nextHud;
    });
  }

  function resetRunnerSession(reason = "manual_reset") {
    const defaultTrackOffset = getRunnerTrackOffsetFromIndex(
      RUNNER_DEFAULT_TRACK_INDEX,
      RUNNER_TRACK_GRID_SIZE,
    );
    runnerStateRef.current = {
      initialized: true,
      lastTimestamp: 0,
      trackXTargetIndex: RUNNER_DEFAULT_TRACK_INDEX,
      trackYTargetIndex: RUNNER_DEFAULT_TRACK_INDEX,
      trackXTarget: defaultTrackOffset,
      trackYTarget: defaultTrackOffset,
      trackXFloat: defaultTrackOffset,
      trackYFloat: defaultTrackOffset,
      trackSpacing: 0,
      distance: 0,
      coinsCollected: 0,
      coins: createRunnerCoins(),
    };
    runnerHudLastUpdateRef.current = 0;
    setRunnerHud({
      coins: 0,
      distance: 0,
      trackCol: RUNNER_DEFAULT_TRACK_INDEX + 1,
      trackRow: RUNNER_DEFAULT_TRACK_INDEX + 1,
      trackSpacingPx: 0,
    });
    runnerGeometryLogKeyRef.current = "";
    setCalibrationMessage(
      "Runner mode active. Move hand to pick one of 4x4 converging tracks.",
    );
    appLog.info("Runner session reset", {
      reason,
      coinCount: runnerStateRef.current.coins.length,
    });
  }

  function startRunnerSession() {
    appLog.info("Runner session start requested", {
      hasTransform: Boolean(transformRef.current),
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_runner");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setPhase(PHASES.RUNNER);
    phaseRef.current = PHASES.RUNNER;
    setCalibrationMessage(
      "Runner mode active. Move hand to pick one of 4x4 converging tracks.",
    );
    requestAnimationFrame(() => resetRunnerSession("start_runner"));
  }

  function startConveyorSession() {
    appLog.info("Conveyor sphere toss start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_conveyor");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationPairsRef.current = [];
    calibrationIndexRef.current = 0;
    setCalibrationTargetIndex(0);
    setCalibrationPairsCount(0);
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setPhase(PHASES.CONVEYOR);
    phaseRef.current = PHASES.CONVEYOR;
    setCalibrationMessage(
      "Conveyor sphere toss active. Pinch to grab, then release to throw. Faster flicks add speed.",
    );
  }

  function returnFromRunnerSession() {
    appLog.info("Returning from runner mode to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function returnFromConveyorSession() {
    appLog.info("Returning from conveyor mode to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function returnFromRouletteSession() {
    appLog.info("Returning from roulette mode to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function startBodyPoseLab() {
    appLog.info("Body pose lab start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_body_pose_lab");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setPoseStatus(createEmptyPoseStatus());
    setPhase(PHASES.BODY_POSE);
    phaseRef.current = PHASES.BODY_POSE;
    setCalibrationMessage(
      "Body Pose Highlight Lab active. Keep your head and upper body centered in frame.",
    );
    void ensurePoseDetectorInitialized("start_body_pose_lab");
  }

  function returnFromBodyPoseLab() {
    appLog.info("Returning from body pose lab to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function startOffAxisLab() {
    appLog.info("Off-axis chamber lab start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_off_axis_lab");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setPoseStatus(createEmptyPoseStatus());
    setPhase(PHASES.OFF_AXIS_LAB);
    phaseRef.current = PHASES.OFF_AXIS_LAB;
    setCalibrationMessage(
      "Off-Axis Forest Walk active. Keep your face centered, then lean left and right to look past the trees.",
    );
    void ensurePoseDetectorInitialized("start_off_axis_lab");
  }

  function returnFromOffAxisLab() {
    appLog.info("Returning from off-axis chamber lab to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function startMinorityReportLab() {
    appLog.info("Minority Report Lab start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
      personalizationSamples: personalizationRef.current.getSampleCounts(),
    });
    stopGameSession();
    resetArcCalibrationSession("start_minority_report_lab");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    labTrainingSessionRef.current = null;
    gestureEngineRef.current.reset();
    setLabEngineOutput(createEmptyLabEngineOutput());
    setLabEventLog([]);
    setLabSampleCounts(personalizationRef.current.getSampleCounts());
    setLabTrainingState(createInitialLabTrainingState());
    setPhase(PHASES.MINORITY_REPORT_LAB);
    phaseRef.current = PHASES.MINORITY_REPORT_LAB;
    setCalibrationMessage(
      "Minority Report Lab active. Keep your forearm visible for steadier left/right hand labeling.",
    );
    void ensurePoseDetectorInitialized("start_minority_report_lab");
  }

  function startSpatialGestureMemorySession() {
    appLog.info("Spatial Gesture Memory start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_spatial_gesture_memory");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    labTrainingSessionRef.current = null;
    gestureEngineRef.current.reset();
    setLabEventLog([]);
    setPhase(PHASES.SPATIAL_GESTURE_MEMORY);
    phaseRef.current = PHASES.SPATIAL_GESTURE_MEMORY;
    setCalibrationMessage(
      "Spatial Gesture Memory active. Reproduce the sequence exactly under time pressure.",
    );
    startSpatialGestureMemoryRound();
  }

  function returnFromSpatialGestureMemorySession() {
    appLog.info("Returning from Spatial Gesture Memory to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function returnFromMinorityReportLab() {
    appLog.info("Returning from Minority Report Lab to calibration input test");
    labTrainingSessionRef.current = null;
    setLabTrainingState((previous) =>
      previous.active
        ? {
            ...createInitialLabTrainingState(),
            message: "Training session cancelled.",
          }
        : previous,
    );
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function startGestureAnalyticsLab() {
    appLog.info("Gesture Analytics Lab start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_gesture_analytics_lab");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setAnalyticsHands([]);
    setAnalyticsTimestamp(0);
    setGestureAnalyticsLabSessionKey((value) => value + 1);
    setPhase(PHASES.GESTURE_ANALYTICS_LAB);
    phaseRef.current = PHASES.GESTURE_ANALYTICS_LAB;
    setCalibrationMessage(
      "Gesture Analytics Lab active. Movement is measured for behavioral instrumentation, not direct control.",
    );
  }

  function returnFromGestureAnalyticsLab() {
    appLog.info("Returning from Gesture Analytics Lab to calibration input test");
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function startGestureArtLab() {
    appLog.info("Gesture Art Lab start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_gesture_art_lab");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setGestureArtHands([]);
    setGestureArtSessionKey((value) => value + 1);
    setPhase(PHASES.GESTURE_ART_LAB);
    phaseRef.current = PHASES.GESTURE_ART_LAB;
    setCalibrationMessage(
      "Gesture Art Lab active. One hand draws particles, two hands warp the entire field.",
    );
  }

  function returnFromGestureArtLab() {
    appLog.info("Returning from Gesture Art Lab to calibration input test");
    setGestureArtHands([]);
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function startGestureControlOS() {
    appLog.info("Gesture Control OS start requested", {
      currentPhase: phaseRef.current,
      cameraReady,
      modelReady,
    });
    stopGameSession();
    resetArcCalibrationSession("start_gesture_control_os");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    labTrainingSessionRef.current = null;
    gestureEngineRef.current.reset();
    setLabEngineOutput(createEmptyLabEngineOutput());
    setLabEventLog([]);
    setLabSampleCounts(personalizationRef.current.getSampleCounts());
    setLabTrainingState(createInitialLabTrainingState());
    setGestureControlOSSessionKey((value) => value + 1);
    setPhase(PHASES.GESTURE_CONTROL_OS);
    phaseRef.current = PHASES.GESTURE_CONTROL_OS;
    setCalibrationMessage(
      "Gesture Control OS active. Pinch to move windows and use gestures to manage the workspace.",
    );
  }

  function returnFromGestureControlOS() {
    appLog.info("Returning from Gesture Control OS to calibration input test");
    labTrainingSessionRef.current = null;
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationMessage("Back on Calibration Input Test.");
  }

  function setRunnerTrackFromNormalized(normalizedX, normalizedY, hasHand, frameId) {
    if (phaseRef.current !== PHASES.RUNNER) {
      return;
    }
    if (!hasHand || !Number.isFinite(normalizedX) || !Number.isFinite(normalizedY)) {
      return;
    }

    const nextTrackXIndex = getRunnerTrackIndexFromNormalized(normalizedX, RUNNER_TRACK_GRID_SIZE);
    const nextTrackYIndex = getRunnerTrackIndexFromNormalized(normalizedY, RUNNER_TRACK_GRID_SIZE);
    const nextTrackX = getRunnerTrackOffsetFromIndex(nextTrackXIndex, RUNNER_TRACK_GRID_SIZE);
    const nextTrackY = getRunnerTrackOffsetFromIndex(nextTrackYIndex, RUNNER_TRACK_GRID_SIZE);
    const state = runnerStateRef.current;
    if (state.trackXTargetIndex !== nextTrackXIndex || state.trackYTargetIndex !== nextTrackYIndex) {
      state.trackXTargetIndex = nextTrackXIndex;
      state.trackYTargetIndex = nextTrackYIndex;
      state.trackXTarget = nextTrackX;
      state.trackYTarget = nextTrackY;
      appLog.info("Runner track target changed from normalized tracking point", {
        frameId,
        trackXIndex: nextTrackXIndex,
        trackYIndex: nextTrackYIndex,
        trackX: roundMetric(nextTrackX, 4),
        trackY: roundMetric(nextTrackY, 4),
        normalizedX: roundMetric(normalizedX, 4),
        normalizedY: roundMetric(normalizedY, 4),
      });
    }
  }

  function drawRunnerScene() {
    const stage = runnerStageRef.current;
    const canvas = runnerCanvasRef.current;
    if (!stage || !canvas) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const state = runnerStateRef.current;
    const layout = computeRunnerTrackGridLayout(width, height, RUNNER_TRACK_GRID_SIZE);
    const {
      focalPoint,
      horizonY,
      groundY,
      trackSpacing,
      trackOffsets,
      fieldEdgeOffset,
      rowYs,
      columnXs,
    } = layout;
    state.trackSpacing = trackSpacing;

    const geometryLogKey = `${width}x${height}|s:${trackSpacing.toFixed(2)}|fx:${focalPoint.x.toFixed(
      2,
    )}|fy:${focalPoint.y.toFixed(2)}`;
    if (geometryLogKey !== runnerGeometryLogKeyRef.current) {
      runnerGeometryLogKeyRef.current = geometryLogKey;
      appLog.info("Runner geometry updated", {
        width,
        height,
        focalPoint,
        trackSpacing: roundMetric(trackSpacing, 3),
        rowYs: rowYs.map((value) => roundMetric(value, 2)),
        columnXs: columnXs.map((value) => roundMetric(value, 2)),
      });
    }

    const projectTrackPoint = (trackX, trackY, depthT) => {
      const nearX = focalPoint.x + trackX * trackSpacing;
      const nearY = focalPoint.y + trackY * trackSpacing;
      return {
        x: lerpValue(focalPoint.x, nearX, depthT),
        y: lerpValue(focalPoint.y, nearY, depthT),
      };
    };
    const depthFromZ = (z) => clampValue(1 - z / RUNNER_MAX_Z, 0, 1);

    ctx.clearRect(0, 0, width, height);
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, "#1d2738");
    sky.addColorStop(1, "#2f4468");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, horizonY);

    const city = ctx.createLinearGradient(0, horizonY * 0.45, 0, horizonY + 40);
    city.addColorStop(0, "rgba(23, 33, 52, 0.18)");
    city.addColorStop(1, "rgba(14, 21, 34, 0.85)");
    ctx.fillStyle = city;
    ctx.fillRect(0, horizonY * 0.45, width, horizonY);

    const groundGradient = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGradient.addColorStop(0, "#2a3950");
    groundGradient.addColorStop(1, "#172232");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    const nearTopLeft = projectTrackPoint(-fieldEdgeOffset, -fieldEdgeOffset, 1);
    const nearTopRight = projectTrackPoint(fieldEdgeOffset, -fieldEdgeOffset, 1);
    const nearBottomRight = projectTrackPoint(fieldEdgeOffset, fieldEdgeOffset, 1);
    const nearBottomLeft = projectTrackPoint(-fieldEdgeOffset, fieldEdgeOffset, 1);
    ctx.fillStyle = "rgba(80, 120, 170, 0.15)";
    ctx.beginPath();
    ctx.moveTo(focalPoint.x, focalPoint.y);
    ctx.lineTo(nearTopRight.x, nearTopRight.y);
    ctx.lineTo(nearBottomRight.x, nearBottomRight.y);
    ctx.lineTo(nearBottomLeft.x, nearBottomLeft.y);
    ctx.lineTo(nearTopLeft.x, nearTopLeft.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(177, 212, 255, 0.24)";
    ctx.lineWidth = 1.6;
    for (const trackX of trackOffsets) {
      for (const trackY of trackOffsets) {
        const nearPoint = projectTrackPoint(trackX, trackY, 1);
        ctx.beginPath();
        ctx.moveTo(focalPoint.x, focalPoint.y);
        ctx.lineTo(nearPoint.x, nearPoint.y);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = "rgba(137, 193, 255, 0.36)";
    ctx.lineWidth = 1.2;
    for (const trackY of trackOffsets) {
      ctx.beginPath();
      for (let index = 0; index < trackOffsets.length; index += 1) {
        const trackX = trackOffsets[index];
        const nearPoint = projectTrackPoint(trackX, trackY, 1);
        if (index === 0) {
          ctx.moveTo(nearPoint.x, nearPoint.y);
        } else {
          ctx.lineTo(nearPoint.x, nearPoint.y);
        }
      }
      ctx.stroke();
    }
    for (const trackX of trackOffsets) {
      ctx.beginPath();
      for (let index = 0; index < trackOffsets.length; index += 1) {
        const trackY = trackOffsets[index];
        const nearPoint = projectTrackPoint(trackX, trackY, 1);
        if (index === 0) {
          ctx.moveTo(nearPoint.x, nearPoint.y);
        } else {
          ctx.lineTo(nearPoint.x, nearPoint.y);
        }
      }
      ctx.stroke();
    }

    for (const coin of state.coins) {
      const depthT = depthFromZ(coin.z);
      if (depthT <= 0) {
        continue;
      }
      const coinPalette = getRunnerCoinPaletteByDepth(depthT);
      const trackPoint = projectTrackPoint(coin.trackX, coin.trackY, depthT);
      const x = trackPoint.x;
      const y = trackPoint.y - coin.height * lerpValue(0.12, 0.66, depthT);
      const radius = lerpValue(4, 18, depthT);
      if (x < -60 || x > width + 60 || y < -60 || y > height + 60) {
        continue;
      }
      const glow = ctx.createRadialGradient(x, y, radius * 0.18, x, y, radius * 1.8);
      glow.addColorStop(0, coinPalette.glowInner);
      glow.addColorStop(1, coinPalette.glowOuter);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = coinPalette.fill;
      ctx.strokeStyle = coinPalette.stroke;
      ctx.lineWidth = Math.max(1, radius * 0.18);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    const runnerTrackPoint = projectTrackPoint(state.trackXFloat, state.trackYFloat, 1);
    const runnerX = runnerTrackPoint.x;
    const runnerY = runnerTrackPoint.y;
    const bodyHeight = 74;
    const bodyWidth = 38;
    ctx.fillStyle = "#6ee7ff";
    ctx.fillRect(runnerX - bodyWidth * 0.14, runnerY - bodyHeight * 0.96, bodyWidth * 0.28, bodyHeight * 0.44);
    ctx.fillStyle = "#ffefe0";
    ctx.beginPath();
    ctx.arc(runnerX, runnerY - bodyHeight * 0.92, bodyWidth * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2cc4ff";
    ctx.fillRect(runnerX - bodyWidth * 0.38, runnerY - bodyHeight * 0.74, bodyWidth * 0.76, bodyHeight * 0.56);
    ctx.fillStyle = "#122741";
    ctx.fillRect(runnerX - bodyWidth * 0.34, runnerY - bodyHeight * 0.2, bodyWidth * 0.24, bodyHeight * 0.35);
    ctx.fillRect(runnerX + bodyWidth * 0.1, runnerY - bodyHeight * 0.2, bodyWidth * 0.24, bodyHeight * 0.35);
    ctx.strokeStyle = "rgba(161, 232, 255, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(runnerX - 8, runnerY + 6);
    ctx.lineTo(runnerX + 8, runnerY + 6);
    ctx.stroke();
  }

  function updateRunnerSimulation(timestamp) {
    if (phaseRef.current !== PHASES.RUNNER) {
      return;
    }
    const state = runnerStateRef.current;
    if (!state.initialized) {
      resetRunnerSession("auto_init");
      return;
    }

    const dtSeconds = clampValue(
      (timestamp - (state.lastTimestamp || timestamp)) / 1000,
      0.001,
      SANDBOX_MAX_STEP_SECONDS,
    );
    state.lastTimestamp = timestamp;
    state.distance += RUNNER_SPEED * dtSeconds;

    state.trackXFloat = lerpValue(state.trackXFloat, state.trackXTarget, RUNNER_LANE_SMOOTH_ALPHA);
    state.trackYFloat = lerpValue(state.trackYFloat, state.trackYTarget, RUNNER_LANE_SMOOTH_ALPHA);
    if (Math.abs(state.trackXFloat - state.trackXTarget) < 0.001) {
      state.trackXFloat = state.trackXTarget;
    }
    if (Math.abs(state.trackYFloat - state.trackYTarget) < 0.001) {
      state.trackYFloat = state.trackYTarget;
    }

    for (const coin of state.coins) {
      coin.z -= RUNNER_SPEED * dtSeconds;
      if (shouldCollectRunnerCoin(coin, state.trackXFloat, state.trackYFloat, 0)) {
        state.coinsCollected += coin.value ?? 1;
        appLog.info("Runner coin collected", {
          coinsCollected: state.coinsCollected,
          trackCol: state.trackXTargetIndex + 1,
          trackRow: state.trackYTargetIndex + 1,
        });
        Object.assign(coin, createRunnerCoin());
      }

      if (coin.z < RUNNER_NEAR_Z - 80) {
        Object.assign(
          coin,
          createRunnerCoin(RUNNER_COIN_RESPAWN_MIN_Z, RUNNER_COIN_RESPAWN_MAX_Z),
        );
      }
    }

    drawRunnerScene();
    publishRunnerHud(timestamp);
  }

  function getHoveredInputTestCellIndex(pointerPoint) {
    if (!pointerPoint) {
      return -1;
    }
    for (let cellIndex = 0; cellIndex < INPUT_TEST_CELL_COUNT; cellIndex += 1) {
      const cellElement = inputTestCellRefs.current[cellIndex];
      const cellRect = cellElement?.getBoundingClientRect() ?? null;
      if (isPointInsideClientRect(pointerPoint, cellRect)) {
        return cellIndex;
      }
    }
    return -1;
  }

  function updateCalibrationInputTestHoverState(pointerPoint, hasHand, frameId) {
    if (
      phaseRef.current !== PHASES.CALIBRATION ||
      isCalibratingRef.current ||
      !hasHand ||
      !pointerPoint
    ) {
      if (inputTestHoveredCellRef.current !== -1) {
        inputTestHoveredCellRef.current = -1;
        setInputTestHoveredCell(-1);
      }
      return;
    }

    const hoveredCellIndex = getHoveredInputTestCellIndex(pointerPoint);
    if (inputTestHoveredCellRef.current !== hoveredCellIndex) {
      inputTestHoveredCellRef.current = hoveredCellIndex;
      setInputTestHoveredCell(hoveredCellIndex);
      appLog.info("Calibration grid hover cell changed", {
        frameId,
        hoveredCellIndex,
        pointerPoint,
      });
    }
  }

  function stopGameSession() {
    appLog.info("Stopping game session", {
      wasRunning: gameRunningRef.current,
      activeMole: activeMoleRef.current,
      score,
      timeLeft: timeLeftRef.current,
    });
    gameRunningRef.current = false;
    setGameRunning(false);
    activeMoleRef.current = null;
    setActiveMoleIndex(null);
    nextSpawnAtRef.current = Number.POSITIVE_INFINITY;
  }

  function startRouletteSession() {
    appLog.info("Roulette mode start requested");
    stopGameSession();
    resetArcCalibrationSession("open_roulette");
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationPairsRef.current = [];
    calibrationIndexRef.current = 0;
    setCalibrationTargetIndex(0);
    setCalibrationPairsCount(0);
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setPhase(PHASES.ROULETTE);
    phaseRef.current = PHASES.ROULETTE;
    setCalibrationMessage("Roulette mode active. Pinch and hold to drag chips with your finger.");
  }

  function openCircleOfFifthsPage() {
    try {
      window.sessionStorage.setItem(
        CIRCLE_OF_FIFTHS_AUTOSTART_SESSION_KEY,
        JSON.stringify({
          issuedAt: Date.now(),
          from: "main-app",
        }),
      );
    } catch (error) {
      appLog.warn("Failed to persist circle of fifths launch intent", { error });
    }

    window.location.assign("/circle-of-fifths.html");
  }

  function startGameSession() {
    appLog.info("Starting game session requested", {
      hasTransform: Boolean(transformRef.current),
      currentPhase: phaseRef.current,
    });
    if (!transformRef.current) {
      setPhase(PHASES.CALIBRATION);
      phaseRef.current = PHASES.CALIBRATION;
      setCalibrationMessage("Calibration is required before starting the game.");
      appLog.warn("Cannot start game session without calibration transform");
      return;
    }

    const now = performance.now();

    setPhase(PHASES.GAME);
    phaseRef.current = PHASES.GAME;
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    resetArcCalibrationSession("start_game");
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setScore(0);
    setTimeLeft(Math.ceil(GAME_DURATION_MS / 1000));
    timeLeftRef.current = Math.ceil(GAME_DURATION_MS / 1000);
    setActiveMoleIndex(null);
    activeMoleRef.current = null;
    lastHoleIndexRef.current = -1;

    gameStartTimeRef.current = now;
    nextSpawnAtRef.current = now + 350;
    gameRunningRef.current = true;
    setGameRunning(true);
    appLog.info("Game session started", {
      startAt: now,
      firstSpawnAt: nextSpawnAtRef.current,
      durationMs: GAME_DURATION_MS,
    });
  }

  function beginCalibration() {
    appLog.info("Calibration start requested");
    stopGameSession();
    resetArcCalibrationSession("begin_standard_calibration");

    const targets = createCalibrationTargets(viewportRef.current.width, viewportRef.current.height);
    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setCalibrationTargets(targets);
    calibrationTargetsRef.current = targets;
    calibrationPairsRef.current = [];
    calibrationSampleRef.current = null;
    calibrationIndexRef.current = 0;
    setCalibrationTargetIndex(0);
    setCalibrationPairsCount(0);
    setCalibrationSampleFrames(0);
    setCalibrationMessage(`Target 1/${targets.length}: point and pinch to confirm.`);
    setIsCalibrating(true);
    isCalibratingRef.current = true;
    appLog.info("Calibration session started", {
      targetCount: targets.length,
      viewport: viewportRef.current,
    });
  }

  function beginArcCalibration() {
    appLog.info("Lazy-arc calibration start requested");
    stopGameSession();
    resetArcCalibrationSession("begin_arc_calibration");
    resetCalibrationInputTests("begin_arc_calibration");

    setPhase(PHASES.CALIBRATION);
    phaseRef.current = PHASES.CALIBRATION;
    setIsCalibrating(false);
    isCalibratingRef.current = false;
    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);
    setCalibrationMessage(
      "Lazy arc capture started. Keep your elbow planted, sweep forearm in an arc, and move wrist/fingers up/down.",
    );

    setArcCalibrationProgress(0);
    setArcCalibrationSamples(0);
    setIsArcCalibrating(true);
    isArcCalibratingRef.current = true;
    appLog.info("Lazy-arc calibration session initialized", {
      confidenceTarget: ARC_CALIBRATION_READY_CONFIDENCE,
      maxCaptureFrames: ARC_CALIBRATION_MAX_CAPTURE_FRAMES,
    });
  }

  function finalizeArcCalibration(reason, timestamp) {
    const captured = arcCalibrationSamplesRef.current;
    const evaluation = evaluateArcCaptureConfidence(captured);
    resetArcCalibrationSession(`finalize_${reason}`);

    if (!evaluation.ready) {
      const confidencePercent = Math.round(evaluation.confidence * 100);
      setCalibrationMessage(
        `Lazy arc capture incomplete (${confidencePercent}% confidence). Keep elbow fixed, sweep wider, and move all fingers up/down, then retry.`,
      );
      appLog.warn("Lazy-arc calibration ended before reaching confidence target", {
        reason,
        sampleCount: captured?.length ?? 0,
        confidence: evaluation.confidence,
        metrics: evaluation.metrics,
        confidenceTarget: ARC_CALIBRATION_READY_CONFIDENCE,
        timestamp,
      });
      return;
    }

    const solved = solveArcCalibrationFromSamples(captured);
    if (!solved) {
      setCalibrationMessage(
        "Lazy arc calibration failed to solve. Try a wider arc plus more wrist up/down movement.",
      );
      appLog.error("Lazy-arc calibration solve returned null", {
        reason,
        sampleCount: captured.length,
        metrics: evaluation.metrics,
      });
      return;
    }

    setTransform(solved);
    transformRef.current = solved;
    saveCalibration(solved);
    setHasSavedCalibration(true);
    setCalibrationMessage("Lazy arc calibration complete. Launching runner mode.");
    appLog.info("Lazy-arc calibration solved successfully", {
      reason,
      sampleCount: captured.length,
      model: solved,
    });
    startRunnerSession();
  }

  function finalizeCalibrationSample() {
    appLog.debug("Finalizing calibration sample");
    const sample = calibrationSampleRef.current;
    if (!sample) {
      appLog.warn("No calibration sample found to finalize");
      return;
    }

    calibrationSampleRef.current = null;
    setCalibrationSampleFrames(0);

    if (sample.points.length < Math.floor(CALIBRATION_SAMPLE_FRAMES * 0.6)) {
      appLog.warn("Calibration sample rejected due to too few points", {
        sampleCount: sample.points.length,
      });
      setCalibrationMessage("Sample lost. Keep your hand visible and pinch again.");
      return;
    }

    const average = sample.points.reduce(
      (acc, point) => {
        acc.u += point.u;
        acc.v += point.v;
        return acc;
      },
      { u: 0, v: 0 },
    );
    average.u /= sample.points.length;
    average.v /= sample.points.length;

    const target = calibrationTargetsRef.current[sample.targetIndex];
    if (!target) {
      appLog.error("Calibration target missing during sample finalization", {
        targetIndex: sample.targetIndex,
      });
      setCalibrationMessage("Calibration target was not found. Restart calibration.");
      return;
    }

    const nextPairs = [
      ...calibrationPairsRef.current,
      {
        cam: average,
        screen: { x: target.x, y: target.y },
      },
    ];

    calibrationPairsRef.current = nextPairs;
    setCalibrationPairsCount(nextPairs.length);
    appLog.info("Stored calibration sample pair", {
      targetIndex: sample.targetIndex,
      nextPairCount: nextPairs.length,
      average,
      target,
    });

    const nextIndex = sample.targetIndex + 1;
    if (nextIndex >= calibrationTargetsRef.current.length) {
      const solved = solveAffineFromPairs(nextPairs);
      if (!solved) {
        appLog.error("Calibration solve failed after collecting all points", {
          pairCount: nextPairs.length,
        });
        setCalibrationMessage(
          "Calibration failed (matrix inversion error). Please restart calibration.",
        );
        setIsCalibrating(false);
        isCalibratingRef.current = false;
        return;
      }

      setTransform(solved);
      transformRef.current = solved;
      saveCalibration(solved);
      setHasSavedCalibration(true);
      setIsCalibrating(false);
      isCalibratingRef.current = false;
      setCalibrationMessage("Calibration complete. Launching runner mode.");
      appLog.info("Calibration solved successfully", {
        transform: solved,
      });
      startRunnerSession();
      return;
    }

    calibrationIndexRef.current = nextIndex;
    setCalibrationTargetIndex(nextIndex);
    setCalibrationMessage(
      `Target ${nextIndex + 1}/${calibrationTargetsRef.current.length}: pinch to confirm.`,
    );
    appLog.debug("Advancing to next calibration target", {
      nextIndex,
      remaining: calibrationTargetsRef.current.length - nextIndex,
    });
  }

  function handleRecalibrate() {
    appLog.info("Recalibrate requested");
    clearCalibration();
    setTransform(null);
    transformRef.current = null;
    setHasSavedCalibration(false);
    resetCalibrationInputTests("recalibrate");
    setCalibrationMessage("Calibration cleared. Run calibration again.");
    beginCalibration();
  }

  function restartFullscreenMissileCommandGame() {
    const viewportMetrics = fullscreenMissileCommandViewportRef.current;
    if (!viewportMetrics) {
      return;
    }
    const nextGame = createMissileCommandGame(viewportMetrics.width, viewportMetrics.height);
    fullscreenMissileCommandLastTickRef.current = 0;
    fullscreenMissileCommandStateRef.current = nextGame;
    setFullscreenMissileCommandState(nextGame);
  }

  function restartFullscreenBrickDodgerGame() {
    const viewportMetrics = fullscreenBrickDodgerViewportRef.current;
    if (!viewportMetrics) {
      return;
    }
    const nextGame = createBrickDodgerGame(viewportMetrics.width, viewportMetrics.height);
    fullscreenBrickDodgerLastTickRef.current = 0;
    fullscreenBrickDodgerStateRef.current = nextGame;
    setFullscreenBrickDodgerState(nextGame);
  }

  function restartFullscreenHandBounceGame() {
    const viewportMetrics = fullscreenHandBounceViewportRef.current;
    if (!viewportMetrics) {
      return;
    }
    const nextGame = createFullscreenHandBounceGame(
      viewportMetrics.width,
      viewportMetrics.height,
    );
    fullscreenHandBounceLastTickRef.current = 0;
    fullscreenHandBounceStateRef.current = nextGame;
    setFullscreenHandBounceState(nextGame);
  }

  function restartFullscreenFingerPongGame() {
    const viewportMetrics = fullscreenFingerPongViewportRef.current;
    if (!viewportMetrics) {
      return;
    }
    const nextGame = createFingerPongGame(viewportMetrics.width, viewportMetrics.height);
    fullscreenFingerPongLastTickRef.current = 0;
    fullscreenFingerPongStateRef.current = nextGame;
    setFullscreenFingerPongState(nextGame);
  }

  function restartFullscreenSkyPatrolGame() {
    const viewportMetrics = fullscreenSkyPatrolViewportRef.current;
    if (!viewportMetrics) {
      return;
    }
    const nextGame = createSkyPatrolGame(viewportMetrics.width, viewportMetrics.height);
    fullscreenSkyPatrolLastTickRef.current = 0;
    publishFullscreenSkyPatrolState(nextGame);
  }

  function getFullscreenRestartControlStatesFromRefs() {
    return {
      handBounce: fullscreenHandBounceStateRef.current,
      brickDodger: fullscreenBrickDodgerStateRef.current,
      fingerPong: fullscreenFingerPongStateRef.current,
      fruitNinja: fullscreenFruitNinjaStateRef.current,
      skyPatrol: fullscreenSkyPatrolHudRef.current,
      missileCommand: fullscreenMissileCommandStateRef.current,
    };
  }

  function runFullscreenRestartControlActionFromRefs() {
    const mode = fullscreenGridModeRef.current;
    const label = getFullscreenRestartControlLabel(
      mode,
      getFullscreenRestartControlStatesFromRefs(),
    );
    if (!label) {
      return false;
    }

    switch (mode) {
      case "hand-bounce":
        restartFullscreenHandBounceGame();
        return true;
      case "brick-dodger":
        restartFullscreenBrickDodgerGame();
        return true;
      case "finger-pong":
        restartFullscreenFingerPongGame();
        return true;
      case "fruit-ninja":
        restartFullscreenFruitNinjaGame();
        return true;
      case "sky-patrol":
        restartFullscreenSkyPatrolGame();
        return true;
      case "missile-command":
        restartFullscreenMissileCommandGame();
        return true;
      default:
        return false;
    }
  }

  function syncFullscreenSkyPatrolRenderer() {
    const canvas = fullscreenSkyPatrolCanvasRef.current;
    const viewportMetrics = fullscreenSkyPatrolViewportRef.current;
    if (!canvas || !viewportMetrics) {
      return null;
    }

    let renderer = fullscreenSkyPatrolRendererRef.current;
    if (!renderer || renderer.canvas !== canvas) {
      renderer = createSkyPatrolCanvasRenderer(canvas, {
        spriteImage: fullscreenSkyPatrolSpriteImageRef.current,
      });
      fullscreenSkyPatrolRendererRef.current = renderer;
    }

    renderer.setSpriteImage(fullscreenSkyPatrolSpriteImageRef.current);
    renderer.resize(viewportMetrics.width, viewportMetrics.height);
    return renderer;
  }

  function publishFullscreenSkyPatrolState(nextState) {
    fullscreenSkyPatrolStateRef.current = nextState;

    const nextHud = getSkyPatrolHudState(nextState);
    if (!areSkyPatrolHudStatesEqual(fullscreenSkyPatrolHudRef.current, nextHud)) {
      fullscreenSkyPatrolHudRef.current = nextHud;
      setFullscreenSkyPatrolHud(nextHud);
    }

    const renderer = syncFullscreenSkyPatrolRenderer();
    renderer?.draw(nextState);
  }

  function restartFullscreenTicTacToeGame() {
    const existingGame = fullscreenTicTacToeStateRef.current;
    if (existingGame?.layout) {
      const nextGame = restartTicTacToeRound(existingGame);
      fullscreenTicTacToeLastTickRef.current = 0;
      fullscreenTicTacToeStateRef.current = nextGame;
      setFullscreenTicTacToeState(nextGame);
      return;
    }

    const viewportMetrics = fullscreenTicTacToeViewportRef.current;
    if (!viewportMetrics) {
      return;
    }
    const nextGame = createTicTacToeGame(viewportMetrics.width, viewportMetrics.height);
    fullscreenTicTacToeLastTickRef.current = 0;
    fullscreenTicTacToeStateRef.current = nextGame;
    setFullscreenTicTacToeState(nextGame);
  }

  function handlePinchClick(timestamp) {
    appLog.debug("Pinch click detected", {
      timestamp,
      isCalibrating: isCalibratingRef.current,
      isArcCalibrating: isArcCalibratingRef.current,
      phase: phaseRef.current,
      gameRunning: gameRunningRef.current,
    });
    const excludeInsideSelector = getPinchClickExcludeSelector({
      phase: phaseRef.current,
    });
    const clickedButton = clickButtonAtPoint(cursorRef.current, {
      excludeInsideSelector,
    });
    if (clickedButton) {
      appLog.info("Pinch click triggered button", {
        timestamp,
        phase: phaseRef.current,
        cursor: cursorRef.current,
      });
      return;
    }

    if (isArcCalibratingRef.current) {
      appLog.debug("Pinch click ignored because lazy-arc calibration is active");
      return;
    }

    if (
      phaseRef.current === PHASES.FULLSCREEN_CAMERA &&
      fullscreenGridModeRef.current === "missile-command"
    ) {
      const viewportMetrics = fullscreenMissileCommandViewportRef.current;
      const activeState = fullscreenMissileCommandStateRef.current;
      if (!viewportMetrics || !activeState) {
        return;
      }

      if (activeState.status === "game_over") {
        restartFullscreenMissileCommandGame();
        return;
      }

      const targetX = Math.min(
        viewportMetrics.width,
        Math.max(0, cursorRef.current.x - viewportMetrics.left),
      );
      const targetY = Math.min(
        viewportMetrics.height,
        Math.max(0, cursorRef.current.y - viewportMetrics.top),
      );
      const nextState = launchMissileCommandInterceptor(activeState, targetX, targetY);
      if (nextState !== activeState) {
        fullscreenMissileCommandStateRef.current = nextState;
        setFullscreenMissileCommandState(nextState);
      }
      return;
    }

    if (isCalibratingRef.current) {
      if (!handDetectedRef.current) {
        appLog.warn("Pinch click ignored during calibration because hand is missing");
        setCalibrationMessage("Hand not detected. Keep your hand in view and try again.");
        return;
      }

      if (calibrationSampleRef.current) {
        appLog.debug("Pinch click ignored because calibration sampling is already in progress");
        return;
      }

      calibrationSampleRef.current = {
        targetIndex: calibrationIndexRef.current,
        points: [],
      };
      setCalibrationSampleFrames(0);
      setCalibrationMessage("Sampling fingertip position...");
      appLog.info("Calibration sampling started for target", {
        targetIndex: calibrationIndexRef.current,
        sampleFrames: CALIBRATION_SAMPLE_FRAMES,
      });
      return;
    }

    if (phaseRef.current === PHASES.RUNNER) {
      appLog.debug("Pinch click ignored in runner mode because jumping is disabled", {
        timestamp,
      });
      return;
    }

    if (phaseRef.current === PHASES.FULLSCREEN_CAMERA && fullscreenGridModeRef.current === "flappy") {
      if (!fullscreenFlappyStateRef.current) {
        return;
      }
      const nextState = flapFlappyGame(fullscreenFlappyStateRef.current);
      fullscreenFlappyStateRef.current = nextState;
      fullscreenFlappyLastTickRef.current = timestamp;
      setFullscreenFlappyState(nextState);
      return;
    }

    if (phaseRef.current !== PHASES.GAME || !gameRunningRef.current) {
      appLog.debug("Pinch click ignored because game is not actively running");
      return;
    }

    const activeMole = activeMoleRef.current;
    if (!activeMole) {
      appLog.debug("Pinch click ignored because there is no active mole");
      return;
    }

    const hitZone = hitZonesRef.current[activeMole.holeIndex];
    if (!hitZone) {
      appLog.warn("Pinch click ignored because hit zone was not found", {
        activeMole,
      });
      return;
    }

    if (isPointInCircle(cursorRef.current, hitZone)) {
      appLog.info("Mole hit registered", {
        holeIndex: activeMole.holeIndex,
        cursor: cursorRef.current,
        hitZone,
      });
      activeMoleRef.current = null;
      setActiveMoleIndex(null);
      setScore((value) => value + 1);
      nextSpawnAtRef.current = timestamp + 100;
    } else {
      appLog.debug("Pinch click missed active mole", {
        holeIndex: activeMole.holeIndex,
        cursor: cursorRef.current,
        hitZone,
      });
    }
  }

  function updateGame(timestamp) {
    if (!gameRunningRef.current) {
      return;
    }

    const elapsed = timestamp - gameStartTimeRef.current;
    const remainingMs = GAME_DURATION_MS - elapsed;
    const nextTimeLeft = Math.max(0, Math.ceil(remainingMs / 1000));

    if (nextTimeLeft !== timeLeftRef.current) {
      timeLeftRef.current = nextTimeLeft;
      setTimeLeft(nextTimeLeft);
      appLog.debug("Game timer tick", {
        timestamp,
        remainingMs,
        nextTimeLeft,
      });
    }

    if (remainingMs <= 0) {
      appLog.info("Game timer expired");
      stopGameSession();
      return;
    }

    if (activeMoleRef.current && timestamp >= activeMoleRef.current.expiresAt) {
      appLog.debug("Active mole expired", {
        activeMole: activeMoleRef.current,
        timestamp,
      });
      activeMoleRef.current = null;
      setActiveMoleIndex(null);
    }

    if (!activeMoleRef.current && timestamp >= nextSpawnAtRef.current) {
      const count = holesRef.current.length;
      if (count > 0) {
        const nextIndex = pickRandomHole(count, lastHoleIndexRef.current);
        if (nextIndex >= 0) {
          lastHoleIndexRef.current = nextIndex;
          activeMoleRef.current = {
            holeIndex: nextIndex,
            expiresAt: timestamp + MOLE_VISIBLE_MS,
          };
          setActiveMoleIndex(nextIndex);
          appLog.info("Spawned new mole", {
            holeIndex: nextIndex,
            expiresAt: timestamp + MOLE_VISIBLE_MS,
          });
        }
      }
      nextSpawnAtRef.current = timestamp + randomSpawnDelay();
      appLog.debug("Scheduled next mole spawn", {
        nextSpawnAt: nextSpawnAtRef.current,
      });
    }
  }

  function computeCameraRenderMetrics(
    objectFit =
      phaseRef.current === PHASES.FULLSCREEN_CAMERA &&
      fullscreenGridModeRef.current === FULLSCREEN_LANDING_MODE
        ? "cover"
        : getCameraObjectFitForPhase(phaseRef.current),
  ) {
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight || !canvas.width || !canvas.height) {
      return null;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const scale =
      objectFit === "contain"
        ? Math.min(canvasWidth / videoWidth, canvasHeight / videoHeight)
        : Math.max(canvasWidth / videoWidth, canvasHeight / videoHeight);
    const renderedWidth = videoWidth * scale;
    const renderedHeight = videoHeight * scale;
    const offsetX = (canvasWidth - renderedWidth) / 2;
    const offsetY = (canvasHeight - renderedHeight) / 2;

    // Convert from rendered-canvas crop back to source-video visible window.
    const sourceX = clampValue(-offsetX / scale, 0, videoWidth);
    const sourceY = clampValue(-offsetY / scale, 0, videoHeight);
    const sourceWidth = clampValue(canvasWidth / scale, 0, videoWidth);
    const sourceHeight = clampValue(canvasHeight / scale, 0, videoHeight);

    const sourceNormalized = {
      xMin: sourceX / videoWidth,
      xMax: (sourceX + sourceWidth) / videoWidth,
      yMin: sourceY / videoHeight,
      yMax: (sourceY + sourceHeight) / videoHeight,
    };

    // Tracking points are mirrored, so convert source-x bounds into mirrored-u bounds.
    const mirroredNormalized = {
      uMin: 1 - sourceNormalized.xMax,
      uMax: 1 - sourceNormalized.xMin,
      vMin: sourceNormalized.yMin,
      vMax: sourceNormalized.yMax,
    };

    return {
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
      },
      video: {
        width: videoWidth,
        height: videoHeight,
      },
      render: {
        objectFit,
        scale,
        renderedWidth,
        renderedHeight,
        offsetX,
        offsetY,
      },
      visibleSourcePixels: {
        x: sourceX,
        y: sourceY,
        width: sourceWidth,
        height: sourceHeight,
      },
      sourceNormalized,
      mirroredNormalized,
    };
  }

  function projectCameraPointToCanvas(point, renderMetrics) {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !Number.isFinite(point?.u) || !Number.isFinite(point?.v)) {
      return null;
    }

    if (!renderMetrics) {
      return {
        x: point.u * canvas.width,
        y: point.v * canvas.height,
      };
    }

    return {
      x: renderMetrics.render.offsetX + point.u * renderMetrics.render.renderedWidth,
      y: renderMetrics.render.offsetY + point.v * renderMetrics.render.renderedHeight,
    };
  }

  function logTrackingExtentsSnapshot(reason) {
    const extentState = trackingExtentsRef.current;
    const renderMetrics = computeCameraRenderMetrics();
    const canvasWidth = renderMetrics?.canvas.width ?? 0;
    const canvasHeight = renderMetrics?.canvas.height ?? 0;

    const fingerExtents = EXTENT_FINGER_NAMES.reduce((accumulator, fingerName) => {
      accumulator[fingerName] = summarizeFingerExtentStats(
        extentState.fingers[fingerName],
        canvasWidth,
        canvasHeight,
      );
      return accumulator;
    }, {});

    const visibleMirroredBounds = renderMetrics
      ? {
          uMin: roundMetric(renderMetrics.mirroredNormalized.uMin),
          uMax: roundMetric(renderMetrics.mirroredNormalized.uMax),
          vMin: roundMetric(renderMetrics.mirroredNormalized.vMin),
          vMax: roundMetric(renderMetrics.mirroredNormalized.vMax),
          uSpan: roundMetric(
            renderMetrics.mirroredNormalized.uMax - renderMetrics.mirroredNormalized.uMin,
          ),
          vSpan: roundMetric(
            renderMetrics.mirroredNormalized.vMax - renderMetrics.mirroredNormalized.vMin,
          ),
        }
      : null;

    appLog.info("Tracking extent snapshot", {
      reason,
      sampleFrames: extentState.sampleFrames,
      lastFrameId: extentState.lastFrameId,
      lastTimestamp: roundMetric(extentState.lastTimestamp, 1),
      overall: {
        raw: summarizeExtentForLog(extentState.rawOverall, canvasWidth, canvasHeight),
        clamped: summarizeExtentForLog(extentState.clampedOverall, canvasWidth, canvasHeight),
        visibleNormalized: summarizeExtentForLog(
          extentState.visibleOverall,
          canvasWidth,
          canvasHeight,
        ),
      },
      totals: {
        tipSamples: extentState.totalTipSamples,
        clampedSamples: extentState.clampedTipSamples,
        clampedRatio: roundMetric(
          safeRatio(extentState.clampedTipSamples, extentState.totalTipSamples),
          6,
        ),
        outsideVisibleSamples: extentState.outsideVisibleTipSamples,
        outsideVisibleRatio: roundMetric(
          safeRatio(extentState.outsideVisibleTipSamples, extentState.totalTipSamples),
          6,
        ),
      },
      fingerExtents,
      visibleMirroredBounds,
      lastVisibleBounds:
        extentState.lastVisibleBounds && Number.isFinite(extentState.lastVisibleBounds.uMin)
          ? {
              uMin: roundMetric(extentState.lastVisibleBounds.uMin),
              uMax: roundMetric(extentState.lastVisibleBounds.uMax),
              vMin: roundMetric(extentState.lastVisibleBounds.vMin),
              vMax: roundMetric(extentState.lastVisibleBounds.vMax),
            }
          : null,
      cameraCoverMetrics: renderMetrics
        ? {
            canvas: renderMetrics.canvas,
            video: renderMetrics.video,
            render: {
              objectFit: renderMetrics.render.objectFit,
              scale: roundMetric(renderMetrics.render.scale, 5),
              renderedWidth: roundMetric(renderMetrics.render.renderedWidth, 2),
              renderedHeight: roundMetric(renderMetrics.render.renderedHeight, 2),
              offsetX: roundMetric(renderMetrics.render.offsetX, 2),
              offsetY: roundMetric(renderMetrics.render.offsetY, 2),
            },
            visibleSourcePixels: {
              x: roundMetric(renderMetrics.visibleSourcePixels.x, 2),
              y: roundMetric(renderMetrics.visibleSourcePixels.y, 2),
              width: roundMetric(renderMetrics.visibleSourcePixels.width, 2),
              height: roundMetric(renderMetrics.visibleSourcePixels.height, 2),
            },
          }
        : null,
    });
  }

  function updateTrackingExtentsWithHand(hand, frameId, timestamp, visibleBounds) {
    if (!hand) {
      return;
    }

    const extentState = trackingExtentsRef.current;
    extentState.lastVisibleBounds = visibleBounds
      ? {
          uMin: visibleBounds.uMin,
          uMax: visibleBounds.uMax,
          vMin: visibleBounds.vMin,
          vMax: visibleBounds.vMax,
        }
      : null;
    const tips = hand.fingerTips ?? {
      thumb: hand.thumbTip ?? null,
      index: hand.indexTip ?? null,
      middle: null,
      ring: null,
      pinky: null,
    };

    let updatedAny = false;
    for (const fingerName of EXTENT_FINGER_NAMES) {
      const tip = tips[fingerName];
      if (!tip || !Number.isFinite(tip.u) || !Number.isFinite(tip.v)) {
        continue;
      }

      const uClamped = tip.u;
      const vClamped = tip.v;
      const uRaw = Number.isFinite(tip.uRaw) ? tip.uRaw : uClamped;
      const vRaw = Number.isFinite(tip.vRaw) ? tip.vRaw : vClamped;
      const wasClamped = Boolean(
        tip.wasClamped || uRaw !== uClamped || vRaw !== vClamped,
      );

      const fingerStats = extentState.fingers[fingerName];
      if (fingerStats.totalSamples === 0) {
        appLog.info("First fingertip sample captured for extent tracking", {
          fingerName,
          frameId,
          uRaw,
          vRaw,
          uClamped,
          vClamped,
          wasClamped,
        });
      }

      fingerStats.totalSamples += 1;
      extentState.totalTipSamples += 1;

      const updatedRaw = updateExtentAccumulator(fingerStats.raw, uRaw, vRaw);
      const updatedClamped = updateExtentAccumulator(fingerStats.clamped, uClamped, vClamped);
      if (updatedRaw) {
        updateExtentAccumulator(extentState.rawOverall, uRaw, vRaw);
      }
      if (updatedClamped) {
        updateExtentAccumulator(extentState.clampedOverall, uClamped, vClamped);
      }

      if (wasClamped) {
        fingerStats.clampedSamples += 1;
        extentState.clampedTipSamples += 1;
      }

      const visibleTip = normalizeTipToVisibleBounds(uRaw, vRaw, visibleBounds);
      if (visibleTip) {
        updateExtentAccumulator(fingerStats.visible, visibleTip.u, visibleTip.v);
        updateExtentAccumulator(extentState.visibleOverall, visibleTip.u, visibleTip.v);
        if (!visibleTip.inBounds) {
          fingerStats.outsideVisibleCount += 1;
          extentState.outsideVisibleTipSamples += 1;
        }
      }

      updatedAny = true;
    }

    if (!updatedAny) {
      return;
    }

    extentState.sampleFrames += 1;
    extentState.lastFrameId = frameId;
    extentState.lastTimestamp = timestamp;
    if (extentState.sampleFrames % EXTENT_LOG_SAMPLE_INTERVAL === 0) {
      logTrackingExtentsSnapshot("periodic_extent_samples");
    }
  }

  function drawCameraOverlay(hand) {
    const canvas = overlayCanvasRef.current;
    if (!canvas) {
      appLog.debug("Skipped drawing overlay because canvas ref is missing");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      appLog.warn("Skipped drawing overlay because 2d context is unavailable");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const renderMetrics = computeCameraRenderMetrics();

    if (hand?.fingerTips) {
      const fingertipEntries =
        phaseRef.current === PHASES.FULLSCREEN_CAMERA
          ? [["index", FINGERTIP_OVERLAY_STYLES.index]]
          : Object.entries(FINGERTIP_OVERLAY_STYLES);
      for (const [fingerName, style] of fingertipEntries) {
        const tip = hand.fingerTips[fingerName];
        const projectedTip = projectCameraPointToCanvas(tip, renderMetrics);
        if (!projectedTip) {
          continue;
        }
        const { x, y } = projectedTip;

        ctx.fillStyle = style.fill;
        ctx.beginPath();
        ctx.arc(x, y, style.radius, 0, Math.PI * 2);
        ctx.fill();

        if (fingerName === "thumb") {
          ctx.strokeStyle = "rgba(12, 16, 20, 0.75)";
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.arc(x, y, style.radius + 1.8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    } else if (phaseRef.current === PHASES.FULLSCREEN_CAMERA ? hand?.indexTip : hand?.thumbTip) {
      const fallbackTip =
        phaseRef.current === PHASES.FULLSCREEN_CAMERA ? hand.indexTip : hand.thumbTip;
      const projectedFallbackTip = projectCameraPointToCanvas(fallbackTip, renderMetrics);
      if (!projectedFallbackTip) {
        return;
      }
      const fallbackStyle =
        phaseRef.current === PHASES.FULLSCREEN_CAMERA
          ? FINGERTIP_OVERLAY_STYLES.index
          : { fill: "rgba(255, 255, 255, 0.98)", radius: 6.2 };
      ctx.fillStyle = fallbackStyle.fill;
      ctx.beginPath();
      ctx.arc(projectedFallbackTip.x, projectedFallbackTip.y, fallbackStyle.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (debugRef.current && hand?.landmarks) {
      ctx.fillStyle = "rgba(111, 245, 164, 0.9)";
      for (const point of hand.landmarks) {
        const projectedPoint = projectCameraPointToCanvas(point, renderMetrics);
        if (!projectedPoint) {
          continue;
        }
        ctx.beginPath();
        ctx.arc(projectedPoint.x, projectedPoint.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(12, 16, 20, 0.72)";
      ctx.fillRect(10, 10, 190, 64);
      ctx.fillStyle = "#f2f6fb";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(`hand: ${hand ? "yes" : "no"}`, 18, 30);
      ctx.fillText(`pinch: ${pinchStateRef.current ? "on" : "off"}`, 18, 47);
      ctx.fillText(`fps: ${fpsRef.current.toFixed(1)}`, 18, 64);
    }
  }

  function drawCameraOverlayHands(hands, options = {}) {
    const canvas = overlayCanvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!options.showSkeleton) {
      return;
    }
    const renderMetrics = computeCameraRenderMetrics(options.objectFit);

    const safeHands = Array.isArray(hands) ? hands : [];
    for (let handIndex = 0; handIndex < safeHands.length; handIndex += 1) {
      const hand = safeHands[handIndex];
      if (!hand) {
        continue;
      }
      const style = getHandOverlayStyle(hand, handIndex);
      const fingerTips = hand.fingerTips ?? {};
      const pointerTip = fingerTips.index ?? hand.indexTip ?? null;

      if (Array.isArray(hand.landmarks) && hand.landmarks.length > 0) {
        ctx.strokeStyle = style.line;
        ctx.lineWidth = options.boneLineWidth ?? 1.45;
        for (const [startIndex, endIndex] of HAND_ROOT_CONNECTIONS) {
          const projectedStart = projectCameraPointToCanvas(
            hand.landmarks[startIndex],
            renderMetrics,
          );
          const projectedEnd = projectCameraPointToCanvas(
            hand.landmarks[endIndex],
            renderMetrics,
          );
          if (!projectedStart || !projectedEnd) {
            continue;
          }
          ctx.beginPath();
          ctx.moveTo(projectedStart.x, projectedStart.y);
          ctx.lineTo(projectedEnd.x, projectedEnd.y);
          ctx.stroke();
        }
        for (const chain of HAND_FINGER_CHAINS) {
          for (let index = 1; index < chain.length; index += 1) {
            const projectedStart = projectCameraPointToCanvas(
              hand.landmarks[chain[index - 1]],
              renderMetrics,
            );
            const projectedEnd = projectCameraPointToCanvas(
              hand.landmarks[chain[index]],
              renderMetrics,
            );
            if (!projectedStart || !projectedEnd) {
              continue;
            }
            ctx.beginPath();
            ctx.moveTo(projectedStart.x, projectedStart.y);
            ctx.lineTo(projectedEnd.x, projectedEnd.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = style.point;
        for (const point of hand.landmarks) {
          const projectedPoint = projectCameraPointToCanvas(point, renderMetrics);
          if (!projectedPoint) {
            continue;
          }
          ctx.beginPath();
          ctx.arc(projectedPoint.x, projectedPoint.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const highlightedFingerNames = options.highlightIndexOnly ? ["index"] : EXTENT_FINGER_NAMES;
      for (const fingerName of highlightedFingerNames) {
        const tip = fingerTips[fingerName];
        const projectedTip = projectCameraPointToCanvas(tip, renderMetrics);
        if (!projectedTip) {
          continue;
        }
        const { x, y } = projectedTip;
        ctx.fillStyle =
          options.highlightIndexOnly && fingerName === "index"
            ? (options.indexHighlightFill ?? "#22d3ee")
            : style.point;
        ctx.beginPath();
        ctx.arc(x, y, fingerName === "thumb" ? 6 : 5, 0, Math.PI * 2);
        ctx.fill();
      }

      const projectedPointerTip = projectCameraPointToCanvas(pointerTip, renderMetrics);
      if (projectedPointerTip && options.showPointerRing !== false) {
        const pointerX = projectedPointerTip.x;
        const pointerY = projectedPointerTip.y;
        ctx.strokeStyle = style.ring;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = style.line;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (options.showHandLabels !== false) {
        ctx.fillStyle = "#f5f9ff";
        ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(
          `${hand.label ?? `Hand ${handIndex + 1}`}`,
          18,
          24 + handIndex * 16,
        );
      }
    }

    if (debugRef.current) {
      ctx.fillStyle = "rgba(12, 16, 20, 0.68)";
      ctx.fillRect(10, canvas.height - 60, 210, 50);
      ctx.fillStyle = "#f2f6fb";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(`hands: ${safeHands.length}`, 18, canvas.height - 38);
      ctx.fillText(`fps: ${fpsRef.current.toFixed(1)}`, 18, canvas.height - 22);
    }
  }

  function drawNeonActiveHandOutline(hands) {
    const canvas = overlayCanvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const activeHand = Array.isArray(hands) ? hands[0] ?? null : null;
    const landmarks = Array.isArray(activeHand?.landmarks) ? activeHand.landmarks : [];
    if (landmarks.length === 0) {
      return;
    }
    const renderMetrics = computeCameraRenderMetrics();

    const drawConnection = (startIndex, endIndex) => {
      const projectedStart = projectCameraPointToCanvas(landmarks[startIndex], renderMetrics);
      const projectedEnd = projectCameraPointToCanvas(landmarks[endIndex], renderMetrics);
      if (!projectedStart || !projectedEnd) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(projectedStart.x, projectedStart.y);
      ctx.lineTo(projectedEnd.x, projectedEnd.y);
      ctx.stroke();
    };

    const drawHandConnections = () => {
      for (const [startIndex, endIndex] of SKY_PATROL_ACTIVE_HAND_CONNECTIONS) {
        drawConnection(startIndex, endIndex);
      }
    };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(80, 255, 230, 0.24)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(64, 255, 225, 0.18)";
    ctx.lineWidth = 8;
    drawHandConnections();

    ctx.shadowBlur = 8;
    ctx.strokeStyle = "rgba(222, 255, 250, 0.24)";
    ctx.lineWidth = 2.4;
    drawHandConnections();

    const tipStyle = getSkyPatrolActiveHandTipStyle(pinchStateRef.current);
    for (const tipIndex of SKY_PATROL_ACTIVE_HAND_TIP_INDEXES) {
      const projectedTip = projectCameraPointToCanvas(landmarks[tipIndex], renderMetrics);
      if (!projectedTip) {
        continue;
      }
      ctx.fillStyle = tipStyle.fill;
      ctx.beginPath();
      ctx.arc(projectedTip.x, projectedTip.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = tipStyle.stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(projectedTip.x, projectedTip.y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPoseOverlay(pose, hands = []) {
    const canvas = overlayCanvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const renderMetrics = computeCameraRenderMetrics();
    if (pose && Array.isArray(pose.keypoints) && pose.keypoints.length > 0) {
      const keypointMap = {};
      for (const keypoint of pose.keypoints) {
        if (!keypoint?.name || !Number.isFinite(keypoint.u) || !Number.isFinite(keypoint.v)) {
          continue;
        }
        keypointMap[keypoint.name] = keypoint;
      }

      ctx.lineWidth = 2.8;
      ctx.strokeStyle = "rgba(128, 202, 255, 0.72)";
      for (const [startName, endName] of POSE_CONNECTIONS) {
        const start = keypointMap[startName];
        const end = keypointMap[endName];
        const projectedStart = projectCameraPointToCanvas(start, renderMetrics);
        const projectedEnd = projectCameraPointToCanvas(end, renderMetrics);
        if (
          !start ||
          !end ||
          !projectedStart ||
          !projectedEnd ||
          (start.score ?? 0) < POSE_KEYPOINT_THRESHOLD ||
          (end.score ?? 0) < POSE_KEYPOINT_THRESHOLD
        ) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(projectedStart.x, projectedStart.y);
        ctx.lineTo(projectedEnd.x, projectedEnd.y);
        ctx.stroke();
      }

      const colorByGroup = {
        head: "rgba(255, 195, 92, 0.96)",
        eyes: "rgba(255, 120, 120, 0.96)",
        shoulders: "rgba(123, 237, 181, 0.96)",
        arms: "rgba(105, 188, 255, 0.96)",
        torso: "rgba(198, 153, 255, 0.96)",
        other: "rgba(223, 232, 248, 0.86)",
      };

      const resolveGroup = (name) => {
        if (POSE_KEYPOINT_GROUPS.head.includes(name)) {
          return "head";
        }
        if (POSE_KEYPOINT_GROUPS.eyes.includes(name)) {
          return "eyes";
        }
        if (POSE_KEYPOINT_GROUPS.shoulders.includes(name)) {
          return "shoulders";
        }
        if (POSE_KEYPOINT_GROUPS.arms.includes(name)) {
          return "arms";
        }
        if (POSE_KEYPOINT_GROUPS.torso.includes(name)) {
          return "torso";
        }
        return "other";
      };

      for (const keypoint of pose.keypoints) {
        const projectedKeypoint = projectCameraPointToCanvas(keypoint, renderMetrics);
        if (!keypoint?.name || !projectedKeypoint || (keypoint.score ?? 0) < POSE_KEYPOINT_THRESHOLD) {
          continue;
        }
        const group = resolveGroup(keypoint.name);
        const { x, y } = projectedKeypoint;
        ctx.fillStyle = colorByGroup[group];
        ctx.beginPath();
        ctx.arc(x, y, group === "eyes" ? 4.6 : 5.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(245, 250, 255, 0.9)";
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(keypoint.name.replace("left_", "L-").replace("right_", "R-"), x + 6, y - 6);
      }
    }

    const safeHands = Array.isArray(hands) ? hands : [];
    for (let handIndex = 0; handIndex < safeHands.length; handIndex += 1) {
      const hand = safeHands[handIndex];
      const landmarks = Array.isArray(hand?.landmarks) ? hand.landmarks : [];
      if (landmarks.length === 0) {
        continue;
      }
      const style = getHandOverlayStyle(hand, handIndex);
      const strokeColor = style.poseStroke;
      const fillColor = style.poseFill;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.2;
      for (const [startIndex, endIndex] of HAND_ROOT_CONNECTIONS) {
        const start = landmarks[startIndex];
        const end = landmarks[endIndex];
        const projectedStart = projectCameraPointToCanvas(start, renderMetrics);
        const projectedEnd = projectCameraPointToCanvas(end, renderMetrics);
        if (!projectedStart || !projectedEnd) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(projectedStart.x, projectedStart.y);
        ctx.lineTo(projectedEnd.x, projectedEnd.y);
        ctx.stroke();
      }
      for (const chain of HAND_FINGER_CHAINS) {
        for (let index = 1; index < chain.length; index += 1) {
          const start = landmarks[chain[index - 1]];
          const end = landmarks[chain[index]];
          const projectedStart = projectCameraPointToCanvas(start, renderMetrics);
          const projectedEnd = projectCameraPointToCanvas(end, renderMetrics);
          if (!projectedStart || !projectedEnd) {
            continue;
          }
          ctx.beginPath();
          ctx.moveTo(projectedStart.x, projectedStart.y);
          ctx.lineTo(projectedEnd.x, projectedEnd.y);
          ctx.stroke();
        }
      }

      for (const tipIndex of HAND_FINGERTIP_INDEXES) {
        const tip = landmarks[tipIndex];
        const projectedTip = projectCameraPointToCanvas(tip, renderMetrics);
        if (!projectedTip) {
          continue;
        }
        const tipX = projectedTip.x;
        const tipY = projectedTip.y;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 5.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(8, 12, 18, 0.82)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 6.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(240, 247, 255, 0.92)";
        ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(FINGERTIP_NAME_BY_INDEX[tipIndex], tipX + 6, tipY - 4);
      }
    }
  }

  function getFullscreenIndexOverlayPoints(hands) {
    const renderMetrics = computeCameraRenderMetrics("contain");
    const safeHands = Array.isArray(hands) ? hands : [];
    const eligibleHands =
      fullscreenGridModeRef.current === FULLSCREEN_LANDING_MODE
        ? safeHands.filter((hand) => hasVerifiedFullscreenMenuHand(hand))
        : safeHands;
    return eligibleHands
      .map((hand, handIndex) => {
        const indexTip = hand?.fingerTips?.index ?? hand?.indexTip ?? null;
        const projectedPoint = projectCameraPointToCanvas(indexTip, renderMetrics);
        if (!projectedPoint) {
          return null;
        }
        return {
          id: hand?.id ?? hand?.label ?? `hand-${handIndex}`,
          label: hand?.label ?? `Hand ${handIndex + 1}`,
          x: projectedPoint.x,
          y: projectedPoint.y,
        };
      })
      .filter(Boolean);
  }

  function getFullscreenTipOverlayPoints(hands) {
    const renderMetrics = computeCameraRenderMetrics("contain");
    const safeHands = Array.isArray(hands) ? hands : [];
    const eligibleHands =
      fullscreenGridModeRef.current === FULLSCREEN_LANDING_MODE
        ? safeHands.filter((hand) => hasVerifiedFullscreenMenuHand(hand))
        : safeHands;
    const trackedFingerNames = getFullscreenTrackedFingerNames(
      fullscreenGridModeRef.current,
      EXTENT_FINGER_NAMES,
    );
    return eligibleHands.flatMap((hand, handIndex) => {
      const handId = hand?.id ?? hand?.label ?? `hand-${handIndex}`;
      return trackedFingerNames.map((fingerName) => {
        const tip = hand?.fingerTips?.[fingerName] ?? hand?.[`${fingerName}Tip`] ?? null;
        const projectedPoint = projectCameraPointToCanvas(tip, renderMetrics);
        if (!projectedPoint) {
          return null;
        }
        return {
          id: `${handId}-${fingerName}`,
          handId,
          fingerName,
          x: projectedPoint.x,
          y: projectedPoint.y,
        };
      }).filter(Boolean);
    });
  }

  function getFullscreenHandBouncePaddleInput() {
    const viewportMetrics = fullscreenHandBounceViewportRef.current;
    if (!viewportMetrics) {
      return null;
    }

    const renderMetrics = computeCameraRenderMetrics("contain");
    const primaryHand = Array.isArray(fullscreenHandsRef.current)
      ? fullscreenHandsRef.current[0] ?? null
      : null;
    if (!renderMetrics || !primaryHand) {
      return null;
    }

    const pointByIndex = new Map();
    for (const landmarkIndex of HAND_PALM_LANDMARK_INDEXES) {
      const landmark = primaryHand.landmarks?.[landmarkIndex];
      const projectedPoint = projectCameraPointToCanvas(landmark, renderMetrics);
      if (!projectedPoint) {
        continue;
      }

      pointByIndex.set(landmarkIndex, {
        x: projectedPoint.x - viewportMetrics.left,
        y: projectedPoint.y - viewportMetrics.top,
      });
    }

    const knucklePoints = [
      pointByIndex.get(HAND_INDEX_KNUCKLE_INDEX),
      pointByIndex.get(HAND_MIDDLE_KNUCKLE_INDEX),
      pointByIndex.get(HAND_PINKY_KNUCKLE_INDEX),
    ].filter(Boolean);

    if (knucklePoints.length === 0) {
      return null;
    }

    const ballRadius = fullscreenHandBounceStateRef.current?.layout?.ballRadius ?? 32;
    const centerX =
      knucklePoints.reduce((sum, point) => sum + point.x, 0) / knucklePoints.length;
    const knuckleY =
      knucklePoints.reduce((sum, point) => sum + point.y, 0) / knucklePoints.length;
    const wristPoint = pointByIndex.get(HAND_WRIST_INDEX) ?? null;
    const wristY = wristPoint?.y ?? knuckleY + ballRadius * 0.92;
    const indexKnuckle = pointByIndex.get(HAND_INDEX_KNUCKLE_INDEX) ?? null;
    const pinkyKnuckle = pointByIndex.get(HAND_PINKY_KNUCKLE_INDEX) ?? null;
    const palmSpan =
      indexKnuckle && pinkyKnuckle
        ? Math.hypot(
            pinkyKnuckle.x - indexKnuckle.x,
            pinkyKnuckle.y - indexKnuckle.y,
          )
        : ballRadius * 1.95;
    const width = clampValue(
      palmSpan * 1.68,
      ballRadius * 2.15,
      viewportMetrics.width * 0.34,
    );
    const palmDepth = Math.abs(wristY - knuckleY);
    const height = clampValue(
      palmDepth * 1.45,
      ballRadius * 0.9,
      ballRadius * 1.55,
    );
    const x = clampValue(
      centerX,
      width / 2 + 6,
      viewportMetrics.width - width / 2 - 6,
    );
    const y = clampValue(
      knuckleY + (wristY - knuckleY) * 0.38,
      height / 2 + ballRadius * 0.42,
      viewportMetrics.height - height / 2 - ballRadius * 0.24,
    );

    return {
      x,
      y,
      width,
      height,
    };
  }

  function drawFullscreenOverlay(hands) {
    const canvas = overlayCanvasRef.current;
    if (!canvas) {
      return {
        indexPoints: [],
        tipPoints: [],
      };
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        indexPoints: [],
        tipPoints: [],
      };
    }

    const indexPoints = getFullscreenIndexOverlayPoints(hands);
    const tipPoints = getFullscreenTipOverlayPoints(hands);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (fullscreenGridModeRef.current === FULLSCREEN_LANDING_MODE) {
      return {
        indexPoints,
        tipPoints,
      };
    }

    if (shouldShowFullscreenNeonHandOutline(fullscreenGridModeRef.current)) {
      drawNeonActiveHandOutline(hands);
      return {
        indexPoints,
        tipPoints,
      };
    }

    if (
      fullscreenGridModeRef.current === "hand-bounce" ||
      fullscreenGridModeRef.current === "brick-dodger" ||
      fullscreenGridModeRef.current === "breakout-coop" ||
      fullscreenGridModeRef.current === "breakout" ||
      fullscreenGridModeRef.current === FIND_YOUR_GRIND_BREAKOUT_MODE_ID ||
      fullscreenGridModeRef.current === "fruit-ninja" ||
      fullscreenGridModeRef.current === "sky-patrol" ||
      fullscreenGridModeRef.current === "invaders" ||
      fullscreenGridModeRef.current === "flappy" ||
      fullscreenGridModeRef.current === "missile-command" ||
      fullscreenGridModeRef.current === "virtual-piano"
    ) {
      return {
        indexPoints,
        tipPoints,
      };
    }

    if (shouldShowFullscreenHandSkeleton(fullscreenGridModeRef.current)) {
      const isFullscreenLandingSkeleton = fullscreenGridModeRef.current === FULLSCREEN_LANDING_MODE;
      drawCameraOverlayHands(hands, {
        showSkeleton: true,
        objectFit: isFullscreenLandingSkeleton ? "cover" : undefined,
        highlightIndexOnly: isFullscreenLandingSkeleton,
        showPointerRing: !isFullscreenLandingSkeleton,
        showHandLabels: !isFullscreenLandingSkeleton,
      });
      return {
        indexPoints,
        tipPoints,
      };
    }

    if (fullscreenGridModeRef.current === "voronoi") {
      for (const point of tipPoints) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        ctx.beginPath();
        ctx.arc(point.x, point.y, FULLSCREEN_VORONOI_DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (const point of indexPoints) {
        ctx.fillStyle = FINGERTIP_OVERLAY_STYLES.index.fill;
        ctx.beginPath();
        ctx.arc(point.x, point.y, FINGERTIP_OVERLAY_STYLES.index.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, FINGERTIP_OVERLAY_STYLES.index.radius + 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    return {
      indexPoints,
      tipPoints,
    };
  }

  function getVerifiedFullscreenHoldControlInput(viewportMetrics) {
    const renderMetrics = computeCameraRenderMetrics(
      fullscreenGridModeRef.current === FULLSCREEN_LANDING_MODE ? "cover" : "contain",
    );
    return getVerifiedFullscreenMenuHandPointerInput(
      fullscreenHandsRef.current,
      viewportMetrics,
      (point) => projectCameraPointToCanvas(point, renderMetrics),
    );
  }

  function getFullscreenLandingHandSkeleton(viewportMetrics) {
    const renderMetrics = computeCameraRenderMetrics("cover");
    return createFullscreenLandingHandSkeleton(
      fullscreenHandsRef.current,
      viewportMetrics,
      (point) => projectCameraPointToCanvas(point, renderMetrics),
    );
  }

  function updateFullscreenModeLandingSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== FULLSCREEN_LANDING_MODE ||
      !fullscreenModeLandingStateRef.current
    ) {
      fullscreenModeLandingLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenModeLandingViewportRef.current;
    if (!viewportMetrics) {
      fullscreenModeLandingLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenModeLandingLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenModeLandingLastTickRef.current = timestamp;
    const holdInput = getVerifiedFullscreenHoldControlInput(viewportMetrics);
    const appActive =
      fullscreenLandingAppActiveRef.current &&
      (typeof document === "undefined" || document.visibilityState !== "hidden");
    const pointerActive = appActive && handDetectedRef.current && holdInput.pointerActive;
    const scrollTop = Math.max(
      0,
      Number.isFinite(fullscreenModeLandingScrollTopRef.current)
        ? fullscreenModeLandingScrollTopRef.current
        : 0,
    );
    const nextState = stepFullscreenModeLanding(fullscreenModeLandingStateRef.current, deltaSeconds, {
      appActive,
      handVerified: holdInput.handVerified,
      pointerActive,
      pointerX: pointerActive ? holdInput.pointerX : 0,
      pointerY: pointerActive ? holdInput.pointerY : 0,
      hitPointerX: pointerActive ? holdInput.pointerX : 0,
      hitPointerY: pointerActive ? holdInput.pointerY + scrollTop : 0,
    });
    const nextStateWithSkeleton = {
      ...nextState,
      skeleton: getFullscreenLandingHandSkeleton(viewportMetrics),
    };
    fullscreenModeLandingStateRef.current = nextStateWithSkeleton;
    setFullscreenModeLandingState(nextStateWithSkeleton);

    if (nextStateWithSkeleton.selectedModeId === FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID) {
      returnFromFullscreenCameraScreen();
      return;
    }

    if (
      nextStateWithSkeleton.selectedModeId &&
      nextStateWithSkeleton.selectedModeId !== fullscreenGridModeRef.current
    ) {
      setFullscreenGridMode(nextStateWithSkeleton.selectedModeId);
    }
  }

  function handleFullscreenModeLandingBoxClick(event, modeId) {
    event.preventDefault();
    event.stopPropagation();
    const nextState = selectFullscreenModeLandingMode(fullscreenModeLandingStateRef.current, modeId);
    fullscreenModeLandingStateRef.current = nextState;
    setFullscreenModeLandingState(nextState);

    if (nextState.selectedModeId === FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID) {
      returnFromFullscreenCameraScreen();
      return;
    }

    if (nextState.selectedModeId && nextState.selectedModeId !== fullscreenGridModeRef.current) {
      setFullscreenGridMode(nextState.selectedModeId);
    }
  }

  function handleFullscreenModeLandingScrollOffsetChange(scrollTop) {
    fullscreenModeLandingScrollTopRef.current = Math.max(
      0,
      Number.isFinite(scrollTop) ? scrollTop : 0,
    );
  }

  function updateFullscreenExitControlSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current === FULLSCREEN_LANDING_MODE ||
      !fullscreenExitControlStateRef.current
    ) {
      fullscreenExitControlLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenExitControlViewportRef.current;
    if (!viewportMetrics) {
      fullscreenExitControlLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenExitControlLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenExitControlLastTickRef.current = timestamp;
    const holdInput = getVerifiedFullscreenHoldControlInput(viewportMetrics);
    const pointerActive = handDetectedRef.current && holdInput.pointerActive;

    const previousState = fullscreenExitControlStateRef.current;
    const nextState = stepFullscreenExitControl(previousState, deltaSeconds, {
      handVerified: holdInput.handVerified,
      pointerActive,
      pointerX: pointerActive ? holdInput.pointerX : 0,
      pointerY: pointerActive ? holdInput.pointerY : 0,
    });
    fullscreenExitControlStateRef.current = nextState;
    if (!areFullscreenExitControlStatesEqual(previousState, nextState)) {
      setFullscreenExitControlState(nextState);
    }

    if (nextState.shouldExit) {
      returnToFullscreenCameraMenu("exit_box_hold");
    }
  }

  function updateFullscreenRestartControlSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      !getFullscreenRestartControlLabel(
        fullscreenGridModeRef.current,
        getFullscreenRestartControlStatesFromRefs(),
      ) ||
      !fullscreenRestartControlStateRef.current
    ) {
      fullscreenRestartControlLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenRestartControlViewportRef.current;
    if (!viewportMetrics) {
      fullscreenRestartControlLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenRestartControlLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenRestartControlLastTickRef.current = timestamp;
    const holdInput = getVerifiedFullscreenHoldControlInput(viewportMetrics);
    const pointerActive = handDetectedRef.current && holdInput.pointerActive;

    const nextState = stepFullscreenRestartControl(
      fullscreenRestartControlStateRef.current,
      deltaSeconds,
      {
        handVerified: holdInput.handVerified,
        pointerActive,
        pointerX: pointerActive ? holdInput.pointerX : 0,
        pointerY: pointerActive ? holdInput.pointerY : 0,
      },
    );
    fullscreenRestartControlStateRef.current = nextState;
    setFullscreenRestartControlState(nextState);

    if (nextState.shouldRestart && runFullscreenRestartControlActionFromRefs()) {
      fullscreenRestartControlLastTickRef.current = timestamp;
      fullscreenRestartControlStateRef.current = null;
      setFullscreenRestartControlState(null);
    }
  }

  function updateFullscreenHandBounceSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "hand-bounce" ||
      !fullscreenHandBounceStateRef.current
    ) {
      fullscreenHandBounceLastTickRef.current = timestamp;
      return;
    }

    if (!fullscreenHandBounceViewportRef.current) {
      fullscreenHandBounceLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenHandBounceLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenHandBounceLastTickRef.current = timestamp;

    const nextState = stepFullscreenHandBounceGame(
      fullscreenHandBounceStateRef.current,
      deltaSeconds,
      getFullscreenHandBouncePaddleInput(),
    );
    fullscreenHandBounceStateRef.current = nextState;
    setFullscreenHandBounceState(nextState);
  }

  function updateFullscreenBreakoutSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      (fullscreenGridModeRef.current !== "breakout" &&
        fullscreenGridModeRef.current !== FIND_YOUR_GRIND_BREAKOUT_MODE_ID) ||
      !fullscreenBreakoutStateRef.current
    ) {
      fullscreenBreakoutLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenBreakoutViewportRef.current;
    if (!viewportMetrics) {
      fullscreenBreakoutLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenBreakoutLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenBreakoutLastTickRef.current = timestamp;

    const fallbackPaddleX =
      fullscreenBreakoutStateRef.current?.paddle?.x ?? viewportMetrics.width / 2;
    const pointerX =
      handDetectedRef.current && Number.isFinite(cursorRef.current?.x)
        ? cursorRef.current.x - viewportMetrics.left
        : fallbackPaddleX;
    const nextState = stepBreakoutGame(
      fullscreenBreakoutStateRef.current,
      deltaSeconds,
      pointerX,
    );
    fullscreenBreakoutStateRef.current = nextState;
    setFullscreenBreakoutState(nextState);
  }

  function getFullscreenBreakoutCoopInput() {
    const hands = Array.isArray(fullscreenHandsRef.current) ? fullscreenHandsRef.current : [];
    const secondaryHand = selectBreakoutCoopSupportHand(
      hands,
      fullscreenPrimaryHandIdRef.current,
    );
    const secondaryPinching =
      secondaryHand && Number.isFinite(secondaryHand.pinchDistance)
        ? secondaryHand.pinchDistance < PINCH_START_THRESHOLD
        : false;

    let secondaryAbilityRequested = false;
    if (secondaryPinching && !fullscreenBreakoutCoopSecondaryPinchLatchRef.current) {
      secondaryAbilityRequested = true;
      fullscreenBreakoutCoopSecondaryPinchLatchRef.current = true;
    } else if (
      !secondaryHand ||
      !Number.isFinite(secondaryHand.pinchDistance) ||
      secondaryHand.pinchDistance > PINCH_END_THRESHOLD
    ) {
      fullscreenBreakoutCoopSecondaryPinchLatchRef.current = false;
    }

    const primaryPinching = handDetectedRef.current && pinchStateRef.current;
    let primaryPinchRising = false;
    if (primaryPinching && !fullscreenBreakoutCoopPrimaryPinchLatchRef.current) {
      primaryPinchRising = true;
      fullscreenBreakoutCoopPrimaryPinchLatchRef.current = true;
    } else if (!primaryPinching) {
      fullscreenBreakoutCoopPrimaryPinchLatchRef.current = false;
    }

    return {
      abilityRequested: secondaryAbilityRequested || (!secondaryHand && primaryPinchRising),
      restartRequested: primaryPinchRising || secondaryAbilityRequested,
    };
  }

  function updateFullscreenBreakoutCoopSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "breakout-coop" ||
      !fullscreenBreakoutCoopStateRef.current
    ) {
      fullscreenBreakoutCoopLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenBreakoutCoopViewportRef.current;
    if (!viewportMetrics) {
      fullscreenBreakoutCoopLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenBreakoutCoopLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenBreakoutCoopLastTickRef.current = timestamp;

    const fallbackPaddleX =
      fullscreenBreakoutCoopStateRef.current?.paddle?.x ?? viewportMetrics.width / 2;
    const pointerX =
      handDetectedRef.current && Number.isFinite(cursorRef.current?.x)
        ? cursorRef.current.x - viewportMetrics.left
        : fallbackPaddleX;
    const coopInput = getFullscreenBreakoutCoopInput();
    const nextState = stepBreakoutCoopGame(
      fullscreenBreakoutCoopStateRef.current,
      deltaSeconds,
      pointerX,
      coopInput.abilityRequested,
      coopInput.restartRequested,
    );
    fullscreenBreakoutCoopStateRef.current = nextState;
    setFullscreenBreakoutCoopState(nextState);
  }

  function updateFullscreenBrickDodgerSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "brick-dodger" ||
      !fullscreenBrickDodgerStateRef.current
    ) {
      fullscreenBrickDodgerLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenBrickDodgerViewportRef.current;
    if (!viewportMetrics) {
      fullscreenBrickDodgerLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenBrickDodgerLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenBrickDodgerLastTickRef.current = timestamp;

    const fallbackPlayerX =
      fullscreenBrickDodgerStateRef.current?.player?.x ?? viewportMetrics.width / 2;
    const pointerX =
      handDetectedRef.current && Number.isFinite(cursorRef.current?.x)
        ? cursorRef.current.x - viewportMetrics.left
        : fallbackPlayerX;
    const nextState = stepBrickDodgerGame(
      fullscreenBrickDodgerStateRef.current,
      deltaSeconds,
      pointerX,
    );
    fullscreenBrickDodgerStateRef.current = nextState;
    setFullscreenBrickDodgerState(nextState);
  }

  function updateFullscreenFingerPongSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "finger-pong" ||
      !fullscreenFingerPongStateRef.current
    ) {
      fullscreenFingerPongLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenFingerPongViewportRef.current;
    if (!viewportMetrics) {
      fullscreenFingerPongLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenFingerPongLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenFingerPongLastTickRef.current = timestamp;

    const fallbackPaddleX =
      fullscreenFingerPongStateRef.current?.player?.x ?? viewportMetrics.width / 2;
    const pointerX =
      handDetectedRef.current && Number.isFinite(cursorRef.current?.x)
        ? cursorRef.current.x - viewportMetrics.left
        : fallbackPaddleX;
    const nextState = stepFingerPongGame(
      fullscreenFingerPongStateRef.current,
      deltaSeconds,
      pointerX,
    );
    fullscreenFingerPongStateRef.current = nextState;
    setFullscreenFingerPongState(nextState);
  }

  function updateFullscreenFruitNinjaSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "fruit-ninja" ||
      !fullscreenFruitNinjaStateRef.current
    ) {
      fullscreenFruitNinjaLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenBreakoutViewportRef.current;
    if (!viewportMetrics) {
      fullscreenFruitNinjaLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenFruitNinjaLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenFruitNinjaLastTickRef.current = timestamp;

    const pointer =
      handDetectedRef.current &&
      Number.isFinite(cursorRef.current?.x) &&
      Number.isFinite(cursorRef.current?.y)
        ? {
            active: true,
            x: clampValue(cursorRef.current.x - viewportMetrics.left, 0, viewportMetrics.width),
            y: clampValue(cursorRef.current.y - viewportMetrics.top, 0, viewportMetrics.height),
          }
        : { active: false };
    const nextState = stepFruitNinjaGame(
      fullscreenFruitNinjaStateRef.current,
      deltaSeconds,
      pointer,
      timestamp,
    );
    fullscreenFruitNinjaStateRef.current = nextState;
    setFullscreenFruitNinjaState(nextState);
  }

  function updateFullscreenSkyPatrolSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "sky-patrol" ||
      !fullscreenSkyPatrolStateRef.current
    ) {
      fullscreenSkyPatrolLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenSkyPatrolViewportRef.current;
    if (!viewportMetrics) {
      fullscreenSkyPatrolLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenSkyPatrolLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenSkyPatrolLastTickRef.current = timestamp;

    const nextState = stepSkyPatrolGame(
      fullscreenSkyPatrolStateRef.current,
      deltaSeconds,
      {
        pointerActive:
          handDetectedRef.current &&
          Number.isFinite(cursorRef.current?.x) &&
          Number.isFinite(cursorRef.current?.y),
        pointerX: handDetectedRef.current
          ? clampValue(cursorRef.current?.x - viewportMetrics.left, 0, viewportMetrics.width)
          : fullscreenSkyPatrolStateRef.current.ship.x,
        pointerY: handDetectedRef.current
          ? clampValue(cursorRef.current?.y - viewportMetrics.top, 0, viewportMetrics.height)
          : fullscreenSkyPatrolStateRef.current.ship.y,
        fireRequested: handDetectedRef.current && pinchStateRef.current,
      },
    );
    publishFullscreenSkyPatrolState(nextState);
  }

  function getFullscreenWfcWorldMousePoint(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handleFullscreenWfcWorldMouseDown(event) {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const point = getFullscreenWfcWorldMousePoint(event);
    fullscreenWfcWorldMouseInputRef.current = {
      pointerActive: true,
      pointerX: point.x,
      pointerY: point.y,
      pinchActive: true,
      pinchStarted: true,
    };
  }

  function handleFullscreenWfcWorldMouseMove(event) {
    const currentMouseInput = fullscreenWfcWorldMouseInputRef.current;
    if (!currentMouseInput.pinchActive) {
      return;
    }
    const point = getFullscreenWfcWorldMousePoint(event);
    fullscreenWfcWorldMouseInputRef.current = {
      ...currentMouseInput,
      pointerActive: true,
      pointerX: point.x,
      pointerY: point.y,
      pinchActive: true,
    };
  }

  function stopFullscreenWfcWorldMouseInput(event) {
    const currentMouseInput = fullscreenWfcWorldMouseInputRef.current;
    if (!currentMouseInput.pinchActive && !currentMouseInput.pinchStarted) {
      return;
    }
    const point = getFullscreenWfcWorldMousePoint(event);
    fullscreenWfcWorldMouseInputRef.current = {
      pointerActive: Boolean(currentMouseInput.pinchStarted),
      pointerX: point.x,
      pointerY: point.y,
      pinchActive: false,
      pinchStarted: Boolean(currentMouseInput.pinchStarted),
    };
  }

  function updateFullscreenWfcWorldSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== WFC_WORLD_MODE_ID ||
      !fullscreenWfcWorldStateRef.current
    ) {
      fullscreenWfcWorldLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenWfcWorldViewportRef.current;
    if (!viewportMetrics) {
      fullscreenWfcWorldLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenWfcWorldLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenWfcWorldLastTickRef.current = timestamp;

    const mouseInput = fullscreenWfcWorldMouseInputRef.current;
    const nextState = stepWfcWorldGame(
      fullscreenWfcWorldStateRef.current,
      deltaSeconds,
      createWfcWorldStepInput({
        viewport: viewportMetrics,
        handDetected: handDetectedRef.current,
        cursor: cursorRef.current,
        pinchActive: pinchStateRef.current,
        mouseInput,
      }),
    );
    if (mouseInput.pinchStarted) {
      fullscreenWfcWorldMouseInputRef.current = {
        ...mouseInput,
        pointerActive: Boolean(mouseInput.pinchActive),
        pinchStarted: false,
      };
    }
    fullscreenWfcWorldStateRef.current = nextState;
    setFullscreenWfcWorldState(nextState);
  }

  function updateFullscreenInvadersSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "invaders" ||
      !fullscreenInvadersStateRef.current
    ) {
      fullscreenInvadersLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenBreakoutViewportRef.current;
    if (!viewportMetrics) {
      fullscreenInvadersLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenInvadersLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenInvadersLastTickRef.current = timestamp;

    const fallbackShipX =
      fullscreenInvadersStateRef.current?.ship?.x ?? viewportMetrics.width / 2;
    const pointerX =
      handDetectedRef.current && Number.isFinite(cursorRef.current?.x)
        ? cursorRef.current.x - viewportMetrics.left
        : fallbackShipX;
    const nextState = stepSpaceInvadersGame(
      fullscreenInvadersStateRef.current,
      deltaSeconds,
      pointerX,
      handDetectedRef.current && pinchStateRef.current,
    );
    fullscreenInvadersStateRef.current = nextState;
    setFullscreenInvadersState(nextState);
  }

  function updateFullscreenFlappySimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "flappy" ||
      !fullscreenFlappyStateRef.current
    ) {
      fullscreenFlappyLastTickRef.current = timestamp;
      return;
    }

    if (!fullscreenFlappyViewportRef.current) {
      fullscreenFlappyLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenFlappyLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenFlappyLastTickRef.current = timestamp;

    const nextState = stepFlappyGame(
      fullscreenFlappyStateRef.current,
      deltaSeconds,
    );
    fullscreenFlappyStateRef.current = nextState;
    setFullscreenFlappyState(nextState);
  }

  function updateFullscreenMissileCommandSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "missile-command" ||
      !fullscreenMissileCommandStateRef.current
    ) {
      fullscreenMissileCommandLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenMissileCommandViewportRef.current;
    if (!viewportMetrics) {
      fullscreenMissileCommandLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenMissileCommandLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenMissileCommandLastTickRef.current = timestamp;

    const nextState = stepMissileCommandGame(
      fullscreenMissileCommandStateRef.current,
      deltaSeconds,
    );
    fullscreenMissileCommandStateRef.current = nextState;
    setFullscreenMissileCommandState(nextState);
  }

  function updateFullscreenTicTacToeSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "tic-tac-toe" ||
      !fullscreenTicTacToeStateRef.current
    ) {
      fullscreenTicTacToeLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenTicTacToeViewportRef.current;
    if (!viewportMetrics) {
      fullscreenTicTacToeLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenTicTacToeLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenTicTacToeLastTickRef.current = timestamp;

    const pointerActive =
      handDetectedRef.current &&
      Number.isFinite(cursorRef.current?.x) &&
      Number.isFinite(cursorRef.current?.y);
    const nextState = stepTicTacToeGame(fullscreenTicTacToeStateRef.current, deltaSeconds, {
      pointerActive,
      pointerX: pointerActive ? cursorRef.current.x - viewportMetrics.left : 0,
      pointerY: pointerActive ? cursorRef.current.y - viewportMetrics.top : 0,
      pinchActive: handDetectedRef.current && pinchStateRef.current,
    });
    fullscreenTicTacToeStateRef.current = nextState;
    setFullscreenTicTacToeState(nextState);
  }

  function updateFullscreenVirtualPianoSimulation(timestamp) {
    if (
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA ||
      fullscreenGridModeRef.current !== "virtual-piano" ||
      !fullscreenVirtualPianoStateRef.current
    ) {
      fullscreenVirtualPianoLastTickRef.current = timestamp;
      return;
    }

    const viewportMetrics = fullscreenVirtualPianoViewportRef.current;
    if (!viewportMetrics) {
      fullscreenVirtualPianoLastTickRef.current = timestamp;
      return;
    }

    const previousTimestamp = fullscreenVirtualPianoLastTickRef.current || timestamp;
    const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    fullscreenVirtualPianoLastTickRef.current = timestamp;

    // Project all fingertips from all tracked hands into viewport-local coordinates.
    // Also project the MCP (base knuckle) for each finger so the game can use
    // knuckle-relative velocity — filters out whole-hand movement, only individual
    // finger presses trigger notes.
    const renderMetrics = computeCameraRenderMetrics("contain");
    const hands = Array.isArray(fullscreenHandsRef.current) ? fullscreenHandsRef.current : [];
    const fingerNames = ["thumb", "index", "middle", "ring", "pinky"];
    // MediaPipe landmark indices for MCP (base knuckle) of each finger
    const knuckleLandmarkIndex = { thumb: 2, index: 5, middle: 9, ring: 13, pinky: 17 };
    const fingerTips = hands.flatMap((hand, handIndex) => {
      const handId = hand?.id ?? hand?.label ?? `hand-${handIndex}`;
      const landmarks = Array.isArray(hand?.landmarks) ? hand.landmarks : [];
      return fingerNames.flatMap((fingerName) => {
        const tip = hand?.fingerTips?.[fingerName] ?? hand?.[`${fingerName}Tip`] ?? null;
        const projected = projectCameraPointToCanvas(tip, renderMetrics);
        if (!projected) {
          return [];
        }
        const knuckleLm = landmarks[knuckleLandmarkIndex[fingerName]] ?? null;
        const projectedKnuckle = projectCameraPointToCanvas(knuckleLm, renderMetrics);
        const knuckleY = projectedKnuckle ? projectedKnuckle.y - viewportMetrics.top : null;
        return [{
          id: `${handId}-${fingerName}`,
          x: projected.x - viewportMetrics.left,
          y: projected.y - viewportMetrics.top,
          knuckleY,
        }];
      });
    });

    const nextState = stepVirtualPianoGame(
      fullscreenVirtualPianoStateRef.current,
      fingerTips,
      deltaSeconds,
    );

    const activeNotes = fullscreenVirtualPianoActiveNotesRef.current;

    // Start a sustained note for every new press; stop any orphaned note on that key first
    for (const press of nextState.newPresses) {
      activeNotes[press.id]?.();
      activeNotes[press.id] = startPianoNote(press.freq);
    }

    // Release notes for keys no longer held down
    for (const keyId of nextState.releasedKeyIds) {
      activeNotes[keyId]?.();
      delete activeNotes[keyId];
    }

    fullscreenVirtualPianoStateRef.current = nextState;
    setFullscreenVirtualPianoState(nextState);
  }

  function updateFullscreenOverlayGames(timestamp) {
    runFullscreenOverlayGameUpdates(timestamp, {
      updateFullscreenModeLandingSimulation,
      updateFullscreenExitControlSimulation,
      updateFullscreenRestartControlSimulation,
      updateFullscreenHandBounceSimulation,
      updateFullscreenBrickDodgerSimulation,
      updateFullscreenBreakoutSimulation,
      updateFullscreenBreakoutCoopSimulation,
      updateFullscreenFingerPongSimulation,
      updateFullscreenSkyPatrolSimulation,
      updateFullscreenWfcWorldSimulation,
      updateFullscreenInvadersSimulation,
      updateFullscreenFlappySimulation,
      updateFullscreenMissileCommandSimulation,
      updateFullscreenTicTacToeSimulation,
      updateFullscreenVirtualPianoSimulation,
    });
    updateFullscreenFruitNinjaSimulation(timestamp);
  }

  function updateFrameTiming(timestamp) {
    frameCounterRef.current += 1;
    const frameId = frameCounterRef.current;

    if (lastFrameTimeRef.current > 0) {
      const delta = timestamp - lastFrameTimeRef.current;
      if (delta > 0) {
        const instantaneous = 1000 / delta;
        fpsRef.current =
          fpsRef.current === 0 ? instantaneous : fpsRef.current * 0.86 + instantaneous * 0.14;
        setFps(fpsRef.current);
      }
    }
    lastFrameTimeRef.current = timestamp;
    return frameId;
  }

  function processPoseFrame(pose, timestamp, hands = []) {
    const frameId = updateFrameTiming(timestamp);
    const poseMeta = getLastPoseMeta();
    const fingerSummary = summarizeFingerVisibilityFromHands(hands);

    if (!pose) {
      if (handDetectedRef.current) {
        handDetectedRef.current = false;
        setHandDetected(false);
      }
      setPinchActive(false);
      const emptyPoseStatus = createEmptyPoseStatus();
      const previousOffAxis = poseStatusRef.current?.offAxis ?? emptyPoseStatus.offAxis;
      const nextStatus = {
        ...emptyPoseStatus,
        handsCount: fingerSummary.handsCount,
        fingerCount: fingerSummary.fingerCount,
        fingertipCount: fingerSummary.fingertipCount,
        offAxis:
          phaseRef.current === PHASES.OFF_AXIS_LAB
            ? createHeldOffAxisState(previousOffAxis)
            : emptyPoseStatus.offAxis,
        parts: {
          ...emptyPoseStatus.parts,
          fingers: fingerSummary.fingersVisible,
          fingertips: fingerSummary.fingertipsVisible,
        },
      };
      setPoseStatus((previous) => {
        if (
          previous.detected === nextStatus.detected &&
          previous.handsCount === nextStatus.handsCount &&
          previous.fingerCount === nextStatus.fingerCount &&
          previous.fingertipCount === nextStatus.fingertipCount &&
          previous.parts.fingers === nextStatus.parts.fingers &&
          previous.parts.fingertips === nextStatus.parts.fingertips
        ) {
          return previous;
        }
        return nextStatus;
      });
      drawPoseOverlay(null, hands);
      if (frameId % 45 === 0) {
        appLog.debug("Body pose frame without detection", {
          frameId,
          poseMeta,
        });
      }
      return;
    }

    if (!handDetectedRef.current) {
      handDetectedRef.current = true;
      setHandDetected(true);
    }
    setPinchActive(false);

    const keypointMap = {};
    for (const point of pose.keypoints) {
      if (point?.name) {
        keypointMap[point.name] = point;
      }
    }

    const previousOffAxis = poseStatusRef.current?.offAxis ?? createEmptyOffAxisState();
    const nextPoseStatus = {
      detected: true,
      score: Number.isFinite(pose.score) ? pose.score : 0,
      keypointsCount: pose.keypoints.length,
      handsCount: fingerSummary.handsCount,
      fingerCount: fingerSummary.fingerCount,
      fingertipCount: fingerSummary.fingertipCount,
      parts: {
        head: hasVisiblePoseKeypoints(keypointMap, POSE_KEYPOINT_GROUPS.head),
        eyes: hasVisiblePoseKeypoints(keypointMap, POSE_KEYPOINT_GROUPS.eyes),
        shoulders: hasVisiblePoseKeypoints(keypointMap, POSE_KEYPOINT_GROUPS.shoulders),
        arms: hasVisiblePoseKeypoints(keypointMap, POSE_KEYPOINT_GROUPS.arms),
        torso: hasVisiblePoseKeypoints(keypointMap, POSE_KEYPOINT_GROUPS.torso),
        fingers: fingerSummary.fingersVisible,
        fingertips: fingerSummary.fingertipsVisible,
      },
      offAxis: deriveOffAxisHeadState(pose, previousOffAxis),
    };
    setPoseStatus(nextPoseStatus);
    drawPoseOverlay(pose, hands);

    if (frameId % 45 === 0) {
      appLog.debug("Body pose frame processed", {
        frameId,
        poseMeta,
        score: nextPoseStatus.score,
        parts: nextPoseStatus.parts,
      });
    }
  }

  function processTrackingFrame(hand, timestamp) {
    const frameId = updateFrameTiming(timestamp);

    appLog.debug("Processing tracking frame", {
      frameId,
      timestamp,
      hasHand: Boolean(hand),
      phase: phaseRef.current,
      isCalibrating: isCalibratingRef.current,
      fps: fpsRef.current,
      pinchDistance: hand?.pinchDistance ?? null,
    });

    if (!hand) {
      const millisSinceLastValidHand =
        lastValidHandTimestampRef.current > 0
          ? timestamp - lastValidHandTimestampRef.current
          : Number.POSITIVE_INFINITY;
      const withinGraceWindow = millisSinceLastValidHand <= HAND_DETECTION_GRACE_MS;

      if (withinGraceWindow) {
        handGraceFrameCounterRef.current += 1;
        if (handGraceFrameCounterRef.current === 1 || handGraceFrameCounterRef.current % 30 === 0) {
          appLog.debug("Holding hand-detected state during brief no-hand gap", {
            frameId,
            graceFrames: handGraceFrameCounterRef.current,
            millisSinceLastValidHand,
          });
        }
        drawCameraOverlay(null);
        updateFlightControlFromTips(null, timestamp, frameId);
        updateSandboxPhysics(timestamp, cursorRef.current, false, false);
        updateFlightSimulation(timestamp);
        updateRunnerSimulation(timestamp);
        updateFullscreenOverlayGames(timestamp);
        updateGame(timestamp);
        return;
      }

      handGraceFrameCounterRef.current = 0;
      if (isCalibratingRef.current && calibrationSampleRef.current) {
        calibrationSampleRef.current = null;
        setCalibrationSampleFrames(0);
        setCalibrationMessage("Hand lost while sampling. Pinch again on this target.");
        appLog.warn("Calibration sampling aborted because hand disappeared", {
          frameId,
        });
      }
      if (handDetectedRef.current) {
        logTrackingExtentsSnapshot("hand_detection_lost");
        handDetectedRef.current = false;
        setHandDetected(false);
        appLog.debug("Hand detection flag switched to false", { frameId });
      }
      fullscreenPrimaryHandIdRef.current = null;
      if (pinchStateRef.current) {
        pinchStateRef.current = false;
        setPinchActive(false);
        appLog.debug("Pinch state reset because hand is missing", { frameId });
      }
      if (isArcCalibratingRef.current && frameId % 20 === 0) {
        setCalibrationMessage(
          "Lazy arc capture paused: all five fingertips are not visible. Return your hand to continue capture.",
        );
      }
      updateCalibrationInputTestHoverState(cursorRef.current, false, frameId);
      drawCameraOverlay(null);
      updateFlightControlFromTips(null, timestamp, frameId);
      updateSandboxPhysics(timestamp, cursorRef.current, false, false);
      updateFlightSimulation(timestamp);
      updateRunnerSimulation(timestamp);
      updateFullscreenOverlayGames(timestamp);
      updateGame(timestamp);
      return;
    }

    if (!handDetectedRef.current) {
      handDetectedRef.current = true;
      setHandDetected(true);
      appLog.debug("Hand detection flag switched to true", { frameId });
    }
    lastValidHandTimestampRef.current = timestamp;
    handGraceFrameCounterRef.current = 0;

    const renderMetrics = computeCameraRenderMetrics();
    const visibleBounds = renderMetrics?.mirroredNormalized ?? null;
    const thumbTipRawU = Number.isFinite(hand.thumbTip?.uRaw) ? hand.thumbTip.uRaw : hand.thumbTip?.u;
    const thumbTipRawV = Number.isFinite(hand.thumbTip?.vRaw) ? hand.thumbTip.vRaw : hand.thumbTip?.v;
    const indexTipRawU = Number.isFinite(hand.indexTip?.uRaw) ? hand.indexTip.uRaw : hand.indexTip?.u;
    const indexTipRawV = Number.isFinite(hand.indexTip?.vRaw) ? hand.indexTip.vRaw : hand.indexTip?.v;
    const visibleThumbTip = normalizeTipToVisibleBounds(thumbTipRawU, thumbTipRawV, visibleBounds);
    const visibleIndexTip = normalizeTipToVisibleBounds(indexTipRawU, indexTipRawV, visibleBounds);
    const mappedFingerTips = {};
    for (const fingerName of EXTENT_FINGER_NAMES) {
      const tip = hand.fingerTips?.[fingerName];
      if (!tip || !Number.isFinite(tip.u) || !Number.isFinite(tip.v)) {
        mappedFingerTips[fingerName] = null;
        continue;
      }
      const tipRawU = Number.isFinite(tip.uRaw) ? tip.uRaw : tip.u;
      const tipRawV = Number.isFinite(tip.vRaw) ? tip.vRaw : tip.v;
      const normalizedTip = normalizeTipToVisibleBounds(tipRawU, tipRawV, visibleBounds);
      mappedFingerTips[fingerName] = normalizedTip
        ? { u: normalizedTip.u, v: normalizedTip.v }
        : { u: tip.u, v: tip.v };
    }
    const mappedThumbTip =
      mappedFingerTips.thumb && Number.isFinite(mappedFingerTips.thumb.u) && Number.isFinite(mappedFingerTips.thumb.v)
        ? mappedFingerTips.thumb
        : visibleThumbTip
          ? { u: visibleThumbTip.u, v: visibleThumbTip.v }
          : { u: hand.thumbTip.u, v: hand.thumbTip.v };
    const mappedIndexTip =
      mappedFingerTips.index && Number.isFinite(mappedFingerTips.index.u) && Number.isFinite(mappedFingerTips.index.v)
        ? mappedFingerTips.index
        : visibleIndexTip
          ? { u: visibleIndexTip.u, v: visibleIndexTip.v }
          : Number.isFinite(hand.indexTip?.u) && Number.isFinite(hand.indexTip?.v)
            ? { u: hand.indexTip.u, v: hand.indexTip.v }
            : null;
    const usesIndexPointer =
      phaseRef.current === PHASES.RUNNER || phaseRef.current === PHASES.FULLSCREEN_CAMERA;
    const mappedPointerTip =
      usesIndexPointer && mappedIndexTip
        ? mappedIndexTip
        : mappedThumbTip;
    const pointerSource = usesIndexPointer && mappedIndexTip ? "index" : "thumb";
    const pointerRawU = pointerSource === "index" ? indexTipRawU : thumbTipRawU;
    const pointerRawV = pointerSource === "index" ? indexTipRawV : thumbTipRawV;
    const pointerClampedU = pointerSource === "index" ? hand.indexTip?.u : hand.thumbTip?.u;
    const pointerClampedV = pointerSource === "index" ? hand.indexTip?.v : hand.thumbTip?.v;
    const visiblePointerTip = pointerSource === "index" ? visibleIndexTip : visibleThumbTip;
    updateTrackingExtentsWithHand(hand, frameId, timestamp, visibleBounds);
    updateFlightControlFromTips(mappedFingerTips, timestamp, frameId);

    if (isArcCalibratingRef.current) {
      if (arcCalibrationStartRef.current === 0) {
        arcCalibrationStartRef.current = timestamp;
        appLog.info("Lazy-arc calibration capture timing started", {
          frameId,
          timestamp,
        });
      }

      const capturedFrames = arcCalibrationSamplesRef.current;
      if (capturedFrames.length < ARC_CALIBRATION_MAX_CAPTURE_FRAMES) {
        capturedFrames.push({
          frameId,
          timestamp,
          tips: mappedFingerTips,
        });
      }

      const evaluation = evaluateArcCaptureConfidence(capturedFrames);
      if (frameId % 2 === 0 || evaluation.ready) {
        setArcCalibrationProgress(evaluation.confidence);
        setArcCalibrationSamples(evaluation.metrics.validFrameCount);
      }
      if (frameId % 18 === 0) {
        const confidencePercent = Math.round(evaluation.confidence * 100);
        const fingerSummary = EXTENT_FINGER_NAMES.map((fingerName) => {
          const metric = evaluation.metrics.fingerMetrics?.[fingerName];
          return metric && metric.ready ? fingerName[0].toUpperCase() : "_";
        }).join("");
        setCalibrationMessage(
          `Lazy arc confidence: ${confidencePercent}% (${evaluation.metrics.validFrameCount} valid frames). Keep elbow fixed and sweep back/forth + up/down. [${fingerSummary}]`,
        );
      }

      if (evaluation.ready) {
        finalizeArcCalibration("confidence_target_reached", timestamp);
      } else if (capturedFrames.length >= ARC_CALIBRATION_MAX_CAPTURE_FRAMES) {
        finalizeArcCalibration("capture_frame_limit_reached", timestamp);
      }
    }

    const shouldUseTransform =
      Boolean(transformRef.current) &&
      phaseRef.current !== PHASES.FULLSCREEN_CAMERA &&
      !isCalibratingRef.current &&
      !isArcCalibratingRef.current;
    const renderedPointerPoint = projectCameraPointToCanvas(mappedPointerTip, renderMetrics);
    let mappedPoint =
      phaseRef.current === PHASES.FULLSCREEN_CAMERA && renderedPointerPoint
        ? renderedPointerPoint
        : {
            x: mappedPointerTip.u * viewportRef.current.width,
            y: mappedPointerTip.v * viewportRef.current.height,
          };
    let transformMode =
      phaseRef.current === PHASES.FULLSCREEN_CAMERA && renderedPointerPoint
        ? "fullscreen_rendered_camera_space"
        : "none";
    let arcMappedPoint = null;
    if (shouldUseTransform) {
      if (isArcCalibrationModel(transformRef.current)) {
        arcMappedPoint = applyArcCalibration(
          transformRef.current,
          mappedPointerTip.u,
          mappedPointerTip.v,
        );
        if (arcMappedPoint) {
          mappedPoint = {
            x: arcMappedPoint.u * viewportRef.current.width,
            y: arcMappedPoint.v * viewportRef.current.height,
          };
          transformMode = "arc";
        } else {
          transformMode = "arc_fallback_identity";
        }
      } else {
        mappedPoint = applyAffineTransform(
          transformRef.current,
          mappedPointerTip.u,
          mappedPointerTip.v,
        );
        transformMode = "affine";
      }
    }

    const rawPoint = clampPoint(mappedPoint, viewportRef.current.width, viewportRef.current.height);
    rawCursorRef.current = rawPoint;
    setRawCursor(rawPoint);

    const prev = cursorRef.current;
    const smoothed = clampPoint(
      {
        x: CURSOR_ALPHA * rawPoint.x + (1 - CURSOR_ALPHA) * prev.x,
        y: CURSOR_ALPHA * rawPoint.y + (1 - CURSOR_ALPHA) * prev.y,
      },
      viewportRef.current.width,
      viewportRef.current.height,
    );
    cursorRef.current = smoothed;
    setCursor(smoothed);
    updateCalibrationInputTestHoverState(smoothed, true, frameId);
    setRunnerTrackFromNormalized(mappedPointerTip.u, mappedPointerTip.v, true, frameId);

    appLog.debug("Updated raw and smoothed cursor", {
      frameId,
      rawPoint,
      previous: prev,
      smoothed,
      usedTransform: shouldUseTransform,
      transformMode,
      pointerTip: {
        source: pointerSource,
        uRaw: roundMetric(pointerRawU),
        vRaw: roundMetric(pointerRawV),
        uClamped: roundMetric(pointerClampedU),
        vClamped: roundMetric(pointerClampedV),
      },
      mappedPointerTip,
      arcMappedPoint,
      visiblePointerTip,
      visibleBounds: visibleBounds
        ? {
            uMin: roundMetric(visibleBounds.uMin),
            uMax: roundMetric(visibleBounds.uMax),
            vMin: roundMetric(visibleBounds.vMin),
            vMax: roundMetric(visibleBounds.vMax),
          }
        : null,
    });

    if (isCalibratingRef.current && calibrationSampleRef.current) {
      calibrationSampleRef.current.points.push({ u: mappedPointerTip.u, v: mappedPointerTip.v });
      setCalibrationSampleFrames(calibrationSampleRef.current.points.length);
      appLog.debug("Captured calibration sample frame", {
        frameId,
        targetIndex: calibrationSampleRef.current.targetIndex,
        sampleCount: calibrationSampleRef.current.points.length,
        mappedPointerTip,
        visiblePointerTip,
      });
      if (calibrationSampleRef.current.points.length >= CALIBRATION_SAMPLE_FRAMES) {
        finalizeCalibrationSample();
      }
    }

    let nextPinch = pinchStateRef.current;
    if (!nextPinch && hand.pinchDistance < PINCH_START_THRESHOLD) {
      nextPinch = true;
    } else if (nextPinch && hand.pinchDistance > PINCH_END_THRESHOLD) {
      nextPinch = false;
    }

    if (nextPinch !== pinchStateRef.current) {
      const wasPinching = pinchStateRef.current;
      pinchStateRef.current = nextPinch;
      setPinchActive(nextPinch);
      appLog.info("Pinch state transition", {
        frameId,
        wasPinching,
        nowPinching: nextPinch,
        pinchDistance: hand.pinchDistance,
      });

      if (
        phaseRef.current === PHASES.CALIBRATION &&
        !isCalibratingRef.current &&
        nextPinch &&
        inputTestHoveredCellRef.current >= 0
      ) {
        appLog.info("Calibration grid pinch-active over hovered cell", {
          frameId,
          hoveredCellIndex: inputTestHoveredCellRef.current,
        });
      }

      const bypassGlobalPinchDebounce = shouldBypassGlobalPinchDebounce({
        phase: phaseRef.current,
        fullscreenGridMode: fullscreenGridModeRef.current,
      });

      if (
        shouldAcceptPinchClick({
          wasPinching,
          isPinching: nextPinch,
          timestamp,
          lastPinchClickAt: lastPinchClickRef.current,
          debounceMs: PINCH_DEBOUNCE_MS,
          bypassGlobalDebounce: bypassGlobalPinchDebounce,
        })
      ) {
        lastPinchClickRef.current = timestamp;
        appLog.info("Pinch click accepted", {
          frameId,
          timestamp,
          debounceMs: PINCH_DEBOUNCE_MS,
          bypassGlobalPinchDebounce,
        });
        handlePinchClick(timestamp);
      } else if (!wasPinching && nextPinch) {
        appLog.debug("Pinch click suppressed by debounce", {
          frameId,
          timestamp,
          lastPinchClickAt: lastPinchClickRef.current,
        });
      }
    }

    const sandboxGrabActive = pinchStateRef.current;
    updateSandboxPhysics(timestamp, smoothed, true, sandboxGrabActive);
    drawCameraOverlay(hand);
    updateFlightSimulation(timestamp);
    updateRunnerSimulation(timestamp);
    updateFullscreenOverlayGames(timestamp);
    updateGame(timestamp);
  }

  function appendLabEventsToLog(events) {
    if (!Array.isArray(events) || events.length === 0) {
      return;
    }
    const entries = events.map((event) => {
      const eventDate = new Date();
      const timeLabel = eventDate.toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return {
        id: `${event.id}-${event.frameId}-${event.timestamp}`,
        timeLabel,
        timestamp: eventDate.toISOString(),
        gestureId: event.gestureId,
        gestureLabel: GESTURE_LABEL_BY_ID[event.gestureId] ?? event.gestureId,
        confidence: event.confidence ?? 0,
        handId: event.handId ?? null,
        handLabel: event.handLabel ?? null,
        metaSummary: summarizeEventMeta(event.meta),
      };
    });
    setLabEventLog((previous) => [...entries, ...previous].slice(0, LAB_EVENT_LOG_LIMIT));
  }

  function updateLabTrainingSession(timestamp, output) {
    const session = labTrainingSessionRef.current;
    if (!session) {
      return;
    }

    if (session.phase === "countdown") {
      const remainingMs = Math.max(0, session.countdownEndAt - timestamp);
      const nextCountdown = Math.ceil(remainingMs / 1000);
      if (nextCountdown !== session.lastCountdownValue) {
        session.lastCountdownValue = nextCountdown;
        setLabTrainingState({
          active: true,
          phase: "countdown",
          gestureId: session.gestureId,
          gestureLabel: GESTURE_LABEL_BY_ID[session.gestureId] ?? session.gestureId,
          countdown: nextCountdown,
          capturedFrames: 0,
          targetFrames: LAB_TRAIN_CAPTURE_FRAMES,
          message: `Prepare to perform ${GESTURE_LABEL_BY_ID[session.gestureId] ?? session.gestureId}.`,
        });
      }

      if (remainingMs <= 0) {
        session.phase = "capture";
        session.captureFrames = 0;
        session.bestVector = null;
        session.bestScore = -1;
        setLabTrainingState({
          active: true,
          phase: "capture",
          gestureId: session.gestureId,
          gestureLabel: GESTURE_LABEL_BY_ID[session.gestureId] ?? session.gestureId,
          countdown: 0,
          capturedFrames: 0,
          targetFrames: LAB_TRAIN_CAPTURE_FRAMES,
          message: `Capturing ${GESTURE_LABEL_BY_ID[session.gestureId] ?? session.gestureId} sample...`,
        });
      }
      return;
    }

    if (session.phase !== "capture") {
      return;
    }

    const requiresTwoHands = isTwoHandGesture(session.gestureId);
    const hasRequiredHands = requiresTwoHands
      ? Boolean(output?.twoHand?.present) && (output?.hands?.length ?? 0) >= 2
      : (output?.hands?.length ?? 0) >= 1;

    if (hasRequiredHands) {
      session.captureFrames += 1;
      const vector = output?.liveVectors?.[session.gestureId] ?? null;
      if (Array.isArray(vector) && vector.length > 0) {
        const score = output?.heuristicConfidences?.[session.gestureId] ?? output?.confidences?.[session.gestureId] ?? 0;
        if (score >= session.bestScore) {
          session.bestScore = score;
          session.bestVector = [...vector];
        }
      }

      setLabTrainingState({
        active: true,
        phase: "capture",
        gestureId: session.gestureId,
        gestureLabel: GESTURE_LABEL_BY_ID[session.gestureId] ?? session.gestureId,
        countdown: 0,
        capturedFrames: session.captureFrames,
        targetFrames: LAB_TRAIN_CAPTURE_FRAMES,
        message: `Capturing ${GESTURE_LABEL_BY_ID[session.gestureId] ?? session.gestureId} sample...`,
      });
    } else {
      setLabTrainingState({
        active: true,
        phase: "capture",
        gestureId: session.gestureId,
        gestureLabel: GESTURE_LABEL_BY_ID[session.gestureId] ?? session.gestureId,
        countdown: 0,
        capturedFrames: session.captureFrames,
        targetFrames: LAB_TRAIN_CAPTURE_FRAMES,
        message: requiresTwoHands
          ? "Capture paused: two hands required for this gesture."
          : "Capture paused: hand not detected.",
      });
    }

    if (session.captureFrames < LAB_TRAIN_CAPTURE_FRAMES) {
      return;
    }

    const vectorToStore = session.bestVector;
    const gestureId = session.gestureId;
    labTrainingSessionRef.current = null;
    if (!Array.isArray(vectorToStore) || vectorToStore.length === 0) {
      setLabTrainingState({
        ...createInitialLabTrainingState(),
        message: `No valid vector captured for ${GESTURE_LABEL_BY_ID[gestureId] ?? gestureId}. Try again.`,
      });
      return;
    }

    const saved = personalizationRef.current.addSample(gestureId, vectorToStore);
    if (!saved) {
      setLabTrainingState({
        ...createInitialLabTrainingState(),
        message: `Failed to save sample for ${GESTURE_LABEL_BY_ID[gestureId] ?? gestureId}.`,
      });
      return;
    }

    setLabSampleCounts(personalizationRef.current.getSampleCounts());
    const nextCount = personalizationRef.current.getSampleCount(gestureId);
    setLabTrainingState({
      ...createInitialLabTrainingState(),
      message: `Saved sample for ${GESTURE_LABEL_BY_ID[gestureId] ?? gestureId}. Total samples: ${nextCount}.`,
    });
  }

  function processMinorityReportFrame(hands, timestamp) {
    if (
      phaseRef.current !== PHASES.MINORITY_REPORT_LAB &&
      phaseRef.current !== PHASES.SPATIAL_GESTURE_MEMORY &&
      phaseRef.current !== PHASES.GESTURE_CONTROL_OS
    ) {
      return;
    }

    const output = gestureEngineRef.current.update({
      hands,
      timestamp,
      confidenceThreshold: labConfidenceThresholdRef.current,
      personalizationEnabled: labPersonalizationEnabledRef.current,
      personalizer: personalizationRef.current,
    });
    setLabEngineOutput(output);

    if (Array.isArray(output?.events) && output.events.length > 0) {
      appendLabEventsToLog(output.events);
      if (phaseRef.current === PHASES.SPATIAL_GESTURE_MEMORY) {
        for (const event of output.events) {
          if (event?.confidence >= labConfidenceThresholdRef.current) {
            handleSpatialMemoryEvent(event, timestamp);
          }
        }
      }
    }
    if (phaseRef.current === PHASES.SPATIAL_GESTURE_MEMORY) {
      updateSpatialMemoryTimeout(timestamp);
    }
    updateLabTrainingSession(timestamp, output);
  }


  function startSpatialGestureMemoryRound() {
    const previous = spatialMemoryRef.current ?? createInitialSpatialMemoryState();
    const nextRound = previous.status === "completed" ? previous.round + 1 : previous.round;
    const successRate = previous.totalRounds > 0 ? previous.completedRounds / previous.totalRounds : 0;
    const adaptiveBoost = successRate >= 0.75 ? 1 : 0;
    const adaptivePenalty = successRate < 0.45 ? -1 : 0;
    const difficultyLevel = Math.max(1, Math.min(6, nextRound + adaptiveBoost + adaptivePenalty));
    const sequence = buildSpatialSequence(nextRound, difficultyLevel);
    const now = performance.now();
    const expected = sequence[0] ?? null;
    const globalTimeLimitMs = Math.max(4200, SGM_GLOBAL_BASE_TIME_MS - (difficultyLevel - 1) * 650);

    setSpatialMemoryState((prev) => ({
      ...prev,
      active: true,
      status: "playing",
      round: nextRound,
      sequence,
      sequenceLength: sequence.length,
      currentStepIndex: 0,
      stepProgressIds: [],
      expectedStep: expected,
      expectedLabel: formatSgmStepLabel(expected),
      stepDeadline: now + SGM_STEP_TIMEOUT_MS,
      roundStartAt: now,
      elapsedSeconds: 0,
      message: `Repeat ${sequence.length} gestures in order. Total time limit: ${(globalTimeLimitMs / 1000).toFixed(1)}s.`,
      lastActionLabel: "—",
      accuracy: 1,
      smoothness: 0,
      difficultyLevel,
      globalTimeLimitMs,
      recentStepDurations: [],
      attempts: 0,
      correctSteps: 0,
    }));
  }

  function resetSpatialGestureMemory() {
    const nextStats = createInitialSpatialMemoryStats();
    saveSpatialMemoryStats(nextStats);
    setSpatialMemoryState({
      ...createInitialSpatialMemoryState(),
      ...nextStats,
    });
  }

  function handleSpatialMemoryEvent(event, timestamp) {
    setSpatialMemoryState((prev) => {
      if (!prev.active || prev.status !== "playing") {
        return prev;
      }
      const expected = prev.sequence[prev.currentStepIndex] ?? null;
      const expectedIds = Array.isArray(expected) ? expected : [expected];
      const isExpected = expectedIds.includes(event.gestureId);
      const attempts = (prev.attempts ?? 0) + 1;
      const elapsedFromRoundStart = Math.max(0, timestamp - prev.roundStartAt);
      const stepDuration = prev.currentStepIndex === 0
        ? elapsedFromRoundStart
        : Math.max(0, elapsedFromRoundStart - prev.recentStepDurations.reduce((sum, value) => sum + value, 0));

      if (!isExpected) {
        const totalRounds = (prev.totalRounds ?? 0) + 1;
        saveSpatialMemoryStats({
          highScore: prev.highScore ?? 0,
          bestRound: prev.bestRound ?? 1,
          totalRounds,
          completedRounds: prev.completedRounds ?? 0,
        });
        const accuracy = prev.correctSteps / attempts;
        return {
          ...prev,
          status: "failed",
          active: false,
          attempts,
          accuracy,
          totalRounds,
          successRate: (prev.completedRounds ?? 0) / Math.max(1, totalRounds),
          elapsedSeconds: elapsedFromRoundStart / 1000,
          lastActionLabel: `${GESTURE_LABEL_BY_ID[event.gestureId] ?? event.gestureId} (wrong)`,
          message: `Wrong gesture. Expected ${formatSgmStepLabel(expected)}.`,
        };
      }

      const currentProgress = Array.isArray(prev.stepProgressIds) ? prev.stepProgressIds : [];
      const nextProgressIds = currentProgress.includes(event.gestureId)
        ? currentProgress
        : [...currentProgress, event.gestureId];
      if (nextProgressIds.length < expectedIds.length) {
        const remaining = expectedIds.filter((gestureId) => !nextProgressIds.includes(gestureId));
        return {
          ...prev,
          attempts,
          stepProgressIds: nextProgressIds,
          lastActionLabel: `${GESTURE_LABEL_BY_ID[event.gestureId] ?? event.gestureId} (partial)`,
          message: `Combo step in progress. Still need ${formatSgmStepLabel(remaining)}.`,
        };
      }

      const nextStepIndex = prev.currentStepIndex + 1;
      const nextDurations = [...prev.recentStepDurations, stepDuration];
      const correctSteps = (prev.correctSteps ?? 0) + 1;
      const accuracy = correctSteps / attempts;
      const avgDuration = nextDurations.reduce((sum, value) => sum + value, 0) / Math.max(1, nextDurations.length);
      const smoothness = 1 - Math.min(1, avgDuration / SGM_STEP_TIMEOUT_MS);

      if (nextStepIndex >= prev.sequence.length) {
        const elapsedSeconds = elapsedFromRoundStart / 1000;
        const speedScore = Math.max(0.25, 1 - elapsedFromRoundStart / Math.max(1, prev.globalTimeLimitMs));
        const score = prev.score + correctSteps * 100 + accuracy * 90 + smoothness * 70 + speedScore * 110;
        const totalRounds = (prev.totalRounds ?? 0) + 1;
        const completedRounds = (prev.completedRounds ?? 0) + 1;
        const highScore = Math.max(prev.highScore ?? 0, score);
        const bestRound = Math.max(prev.bestRound ?? 1, prev.round);
        saveSpatialMemoryStats({ highScore, bestRound, totalRounds, completedRounds });
        return {
          ...prev,
          active: false,
          status: "completed",
          attempts,
          correctSteps,
          accuracy,
          smoothness,
          elapsedSeconds,
          score,
          highScore,
          bestRound,
          totalRounds,
          completedRounds,
          successRate: completedRounds / Math.max(1, totalRounds),
          lastActionLabel: GESTURE_LABEL_BY_ID[event.gestureId] ?? event.gestureId,
          message: `Round complete! Great memory + control.`,
          stepProgressIds: [],
          expectedStep: null,
          expectedLabel: "Round complete",
        };
      }

      const nextExpected = prev.sequence[nextStepIndex] ?? null;
      return {
        ...prev,
        attempts,
        correctSteps,
        accuracy,
        smoothness,
        currentStepIndex: nextStepIndex,
        stepProgressIds: [],
        expectedStep: nextExpected,
        expectedLabel: formatSgmStepLabel(nextExpected),
        lastActionLabel: GESTURE_LABEL_BY_ID[event.gestureId] ?? event.gestureId,
        stepDeadline: timestamp + SGM_STEP_TIMEOUT_MS,
        elapsedSeconds: elapsedFromRoundStart / 1000,
        message: "Nice. Keep going.",
        recentStepDurations: nextDurations,
      };
    });
  }

  function updateSpatialMemoryTimeout(timestamp) {
    setSpatialMemoryState((prev) => {
      if (!prev.active || prev.status !== "playing") {
        return prev;
      }
      const elapsed = Math.max(0, timestamp - prev.roundStartAt);
      if (elapsed > prev.globalTimeLimitMs) {
        const totalRounds = (prev.totalRounds ?? 0) + 1;
        saveSpatialMemoryStats({
          highScore: prev.highScore ?? 0,
          bestRound: prev.bestRound ?? 1,
          totalRounds,
          completedRounds: prev.completedRounds ?? 0,
        });
        return {
          ...prev,
          active: false,
          status: "failed",
          totalRounds,
          successRate: (prev.completedRounds ?? 0) / Math.max(1, totalRounds),
          message: "Round failed: global speed limit exceeded.",
          elapsedSeconds: elapsed / 1000,
        };
      }
      if (timestamp <= prev.stepDeadline) {
        if (Math.abs(prev.elapsedSeconds - elapsed / 1000) < 0.02) {
          return prev;
        }
        return {
          ...prev,
          elapsedSeconds: elapsed / 1000,
        };
      }
      const totalRounds = (prev.totalRounds ?? 0) + 1;
      saveSpatialMemoryStats({
        highScore: prev.highScore ?? 0,
        bestRound: prev.bestRound ?? 1,
        totalRounds,
        completedRounds: prev.completedRounds ?? 0,
      });
      return {
        ...prev,
        active: false,
        status: "failed",
        totalRounds,
        successRate: (prev.completedRounds ?? 0) / Math.max(1, totalRounds),
        elapsedSeconds: elapsed / 1000,
        message: `Timeout on step ${prev.currentStepIndex + 1}.`,
      };
    });
  }

  function startLabGestureRecording(gestureId) {
    const label = GESTURE_LABEL_BY_ID[gestureId] ?? gestureId;
    labTrainingSessionRef.current = {
      gestureId,
      phase: "countdown",
      countdownEndAt: performance.now() + LAB_TRAIN_COUNTDOWN_SECONDS * 1000,
      lastCountdownValue: LAB_TRAIN_COUNTDOWN_SECONDS,
      captureFrames: 0,
      bestVector: null,
      bestScore: -1,
    };
    setLabTrainingState({
      active: true,
      phase: "countdown",
      gestureId,
      gestureLabel: label,
      countdown: LAB_TRAIN_COUNTDOWN_SECONDS,
      capturedFrames: 0,
      targetFrames: LAB_TRAIN_CAPTURE_FRAMES,
      message: `Get ready: recording ${label} in ${LAB_TRAIN_COUNTDOWN_SECONDS} seconds.`,
    });
  }

  function deleteLastLabSample(gestureId) {
    personalizationRef.current.deleteLastSample(gestureId);
    setLabSampleCounts(personalizationRef.current.getSampleCounts());
    setLabTrainingState({
      ...createInitialLabTrainingState(),
      message: `Deleted last sample for ${GESTURE_LABEL_BY_ID[gestureId] ?? gestureId}.`,
    });
  }

  function clearLabSamples(gestureId) {
    personalizationRef.current.clearGesture(gestureId);
    setLabSampleCounts(personalizationRef.current.getSampleCounts());
    setLabTrainingState({
      ...createInitialLabTrainingState(),
      message: `Cleared all samples for ${GESTURE_LABEL_BY_ID[gestureId] ?? gestureId}.`,
    });
  }

  function clearLabEventLog() {
    setLabEventLog([]);
  }

  async function exportLabSamples() {
    const json = personalizationRef.current.exportJSON();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const filename = `minority-report-training-${stamp}.json`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
      }
    } catch (error) {
      appLog.warn("Failed to copy training JSON to clipboard", { error });
    }

    try {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setLabTrainingState({
        ...createInitialLabTrainingState(),
        message: `Exported training JSON and copied to clipboard (${filename}).`,
      });
    } catch (error) {
      appLog.error("Failed to export training JSON", { error });
      setLabTrainingState({
        ...createInitialLabTrainingState(),
        message: "Export failed. Check browser download permissions.",
      });
    }
  }

  async function importLabSamples(file) {
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const result = personalizationRef.current.importFromJSON(text, true);
      if (!result.ok) {
        setLabTrainingState({
          ...createInitialLabTrainingState(),
          message: "Import failed: invalid or incompatible JSON payload.",
        });
        return;
      }
      setLabSampleCounts(personalizationRef.current.getSampleCounts());
      setLabTrainingState({
        ...createInitialLabTrainingState(),
        message: `Imported training JSON (${file.name}).`,
      });
    } catch (error) {
      appLog.error("Failed to import training JSON", { error });
      setLabTrainingState({
        ...createInitialLabTrainingState(),
        message: "Import failed while reading the JSON file.",
      });
    }
  }

  useEffect(() => {
    const poseOnlyTrackingPhase =
      phase === PHASES.BODY_POSE || phase === PHASES.OFF_AXIS_LAB;
    const trackingReady = cameraReady && (poseOnlyTrackingPhase ? poseModelReady : modelReady);

    if (!trackingReady) {
      appLog.debug("Tracking loop not started because prerequisites are not ready", {
        phase,
        cameraReady,
        modelReady,
        poseModelReady,
        poseOnlyTrackingPhase,
      });
      return undefined;
    }

    let cancelled = false;
    appLog.info("Starting tracking frame loop");

    const frameLoop = async (timestamp) => {
      if (cancelled || !mountedRef.current) {
        appLog.debug("Frame loop callback aborted due to cancellation/unmount", {
          cancelled,
          mounted: mountedRef.current,
        });
        return;
      }

      rafRef.current = requestAnimationFrame(frameLoop);

      const poseOnlyFrame =
        phaseRef.current === PHASES.BODY_POSE || phaseRef.current === PHASES.OFF_AXIS_LAB;
      runTrackingKeepAlive(timestamp, { allowDetectorRecovery: !poseOnlyFrame });

      if (poseOnlyFrame) {
        const video = videoRef.current;
        const poseDetector = poseDetectorRef.current;
        const handDetector = detectorRef.current;
        if (!poseDetector || !video || video.readyState < 2) {
          if (frameCounterRef.current % 30 === 0) {
            appLog.debug("Skipping pose-scene frame due to detector/video readiness", {
              hasPoseDetector: Boolean(poseDetector),
              hasVideo: Boolean(video),
              readyState: video?.readyState ?? null,
            });
          }
          setPoseStatus((previous) => (previous.detected ? createEmptyPoseStatus() : previous));
          if (handDetectedRef.current) {
            handDetectedRef.current = false;
            setHandDetected(false);
          }
          drawPoseOverlay(null, []);
          return;
        }

        if (inferenceBusyRef.current) {
          return;
        }

        const inferenceToken = beginTrackingInference(timestamp);
        try {
          const pose = await detectPose(poseDetector, video);
          const detectedHands = handDetector ? await detectHands(handDetector, video) : [];
          if (!isCurrentTrackingInference(inferenceToken)) {
            appLog.warn("Ignoring stale pose-scene inference result after keep-alive recovery", {
              inferenceToken,
              activeInferenceToken: activeInferenceTokenRef.current,
            });
            return;
          }
          const stableHands = assignStableHandLabels(detectedHands, {
            memory: handLabelMemoryRef.current,
            timestamp,
            pose,
          }).slice(0, TRACKING_MAX_HANDS);
          if (!cancelled && mountedRef.current) {
            processPoseFrame(pose, timestamp, stableHands);
          }
        } catch (error) {
          appLog.error("Pose frame inference failed", { error });
        } finally {
          completeTrackingInference(inferenceToken);
        }
        return;
      }

      if (inferenceBusyRef.current) {
        inferenceBusySkipCounterRef.current += 1;
        if (inferenceBusySkipCounterRef.current % 30 === 0) {
          appLog.debug("Skipping frame because previous inference is still running", {
            skipCount: inferenceBusySkipCounterRef.current,
            timestamp,
          });
        }
        updateFlightControlFromTips(null, timestamp, frameCounterRef.current);
        updateFlightSimulation(timestamp);
        updateRunnerSimulation(timestamp);
        updateFullscreenOverlayGames(timestamp);
        updateGame(timestamp);
        return;
      }
      inferenceBusySkipCounterRef.current = 0;

      if (recoveringDetectorRef.current) {
        fullscreenHandsRef.current = [];
        fullscreenPrimaryHandIdRef.current = null;
        recoveryFrameSkipCounterRef.current += 1;
        if (recoveryFrameSkipCounterRef.current % 30 === 0) {
          appLog.debug("Skipping frame because detector recovery is in progress", {
            skipCount: recoveryFrameSkipCounterRef.current,
          });
        }
        updateFlightControlFromTips(null, timestamp, frameCounterRef.current);
        updateFlightSimulation(timestamp);
        updateRunnerSimulation(timestamp);
        updateFullscreenOverlayGames(timestamp);
        updateGame(timestamp);
        return;
      }
      recoveryFrameSkipCounterRef.current = 0;

      const detector = detectorRef.current;
      const video = videoRef.current;
      if (!detector || !video || video.readyState < 2) {
        fullscreenHandsRef.current = [];
        fullscreenPrimaryHandIdRef.current = null;
        appLog.debug("Skipping frame due to missing detector/video readiness", {
          hasDetector: Boolean(detector),
          hasVideo: Boolean(video),
          readyState: video?.readyState ?? null,
        });
        updateFlightControlFromTips(null, timestamp, frameCounterRef.current);
        updateFlightSimulation(timestamp);
        updateRunnerSimulation(timestamp);
        updateFullscreenOverlayGames(timestamp);
        updateGame(timestamp);
        return;
      }

      const inferenceToken = beginTrackingInference(timestamp);
      try {
        const detectedHands = await detectHands(detector, video);
        const minorityReportPose =
          phaseRef.current === PHASES.MINORITY_REPORT_LAB && poseDetectorRef.current
            ? await detectPose(poseDetectorRef.current, video)
            : null;
        if (!isCurrentTrackingInference(inferenceToken)) {
          appLog.warn("Ignoring stale hand inference result after keep-alive recovery", {
            inferenceToken,
            activeInferenceToken: activeInferenceTokenRef.current,
          });
          return;
        }
        const detectionMeta = getLastDetectionMeta();

        if (detectionMeta.invalid) {
          invalidLandmarkStreakRef.current += 1;
          if (
            invalidLandmarkStreakRef.current <= 5 ||
            invalidLandmarkStreakRef.current % 30 === 0
          ) {
            appLog.warn("Invalid landmark frame detected", {
              invalidLandmarkStreak: invalidLandmarkStreakRef.current,
              detectionMeta,
            });
          }

          const shouldRecover =
            invalidLandmarkStreakRef.current % INVALID_LANDMARK_RECOVERY_THRESHOLD === 0;

          if (shouldRecover && !recoveringDetectorRef.current) {
            void recoverDetectorFromInvalidLandmarks(
              "continuous_invalid_landmarks",
              detectionMeta,
            );
          }
        } else if (invalidLandmarkStreakRef.current > 0) {
          appLog.info("Invalid landmark streak ended", {
            invalidLandmarkStreak: invalidLandmarkStreakRef.current,
            detectionMeta,
          });
          invalidLandmarkStreakRef.current = 0;
        }

        const millisSinceLastValidHand =
          lastValidHandTimestampRef.current > 0
            ? timestamp - lastValidHandTimestampRef.current
            : Number.POSITIVE_INFINITY;
        const withinHandGraceWindow = millisSinceLastValidHand <= HAND_DETECTION_GRACE_MS;

        if (detectionMeta.reason === "no_hands" && !withinHandGraceWindow) {
          noHandStreakRef.current += 1;
          if (
            noHandStreakRef.current === NO_HAND_KEEP_ALIVE_NOTICE_THRESHOLD ||
            noHandStreakRef.current % NO_HAND_KEEP_ALIVE_LOG_INTERVAL === 0
          ) {
            appLog.info("No hands detected; tracking keep-alive is continuing detection", {
              noHandStreak: noHandStreakRef.current,
              detectionMeta,
              millisSinceLastValidHand,
            });
          }
        } else if (noHandStreakRef.current > 0) {
          appLog.info("No-hand streak ended", {
            noHandStreak: noHandStreakRef.current,
            detectionMeta,
            withinHandGraceWindow,
          });
          noHandStreakRef.current = 0;
        }

        if (!cancelled && mountedRef.current) {
          const fullscreenTrackedHandLimit =
            phaseRef.current === PHASES.FULLSCREEN_CAMERA
              ? getFullscreenTrackedHandLimit(fullscreenGridModeRef.current, TRACKING_MAX_HANDS)
              : TRACKING_MAX_HANDS;
          const stableHands = assignStableHandLabels(detectedHands, {
            memory: handLabelMemoryRef.current,
            timestamp,
            pose: minorityReportPose,
          }).slice(0, fullscreenTrackedHandLimit);
          fullscreenHandsRef.current = stableHands;
          const primaryHand = stableHands[0] ?? null;
          fullscreenPrimaryHandIdRef.current = primaryHand?.id ?? primaryHand?.label ?? null;
          processTrackingFrame(primaryHand, timestamp);
          if (phaseRef.current === PHASES.FULLSCREEN_CAMERA) {
            const overlayPoints = drawFullscreenOverlay(stableHands);
            setFullscreenIndexPoints(overlayPoints.indexPoints);
            setFullscreenTipPoints(overlayPoints.tipPoints);
          }
          processMinorityReportFrame(stableHands, timestamp);
          if (phaseRef.current === PHASES.GESTURE_ANALYTICS_LAB) {
            setAnalyticsHands(stableHands);
            setAnalyticsTimestamp(timestamp);
            drawCameraOverlayHands(stableHands, {
              showSkeleton: true,
            });
          } else if (phaseRef.current === PHASES.GESTURE_ART_LAB) {
            setGestureArtHands(stableHands);
          }
          if (
            phaseRef.current === PHASES.MINORITY_REPORT_LAB ||
            phaseRef.current === PHASES.GESTURE_CONTROL_OS
          ) {
            drawCameraOverlayHands(stableHands, {
              showSkeleton: labShowSkeletonRef.current,
            });
          }
        }
      } catch (error) {
        appLog.error("Frame inference failed", { error });
        updateFlightControlFromTips(null, timestamp, frameCounterRef.current);
        updateFlightSimulation(timestamp);
        updateRunnerSimulation(timestamp);
        updateFullscreenOverlayGames(timestamp);
        updateGame(timestamp);
      } finally {
        completeTrackingInference(inferenceToken);
      }
    };

    rafRef.current = requestAnimationFrame(frameLoop);

    return () => {
      cancelled = true;
      appLog.info("Stopping tracking frame loop", {
        rafId: rafRef.current,
      });
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [appLog, cameraReady, modelReady, phase, poseModelReady]);

  function renderFullscreenRingGroup(point, opacity, keyPrefix) {
    if (!fullscreenCameraViewport || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
      return null;
    }

    return (
      <div
        key={`${keyPrefix}-${point.id}`}
        className="fullscreen-camera-ring-group"
        style={{
          left: `${point.x - fullscreenCameraViewport.left}px`,
          top: `${point.y - fullscreenCameraViewport.top}px`,
          opacity,
        }}
      >
        {getFullscreenRingLayersForHand(FULLSCREEN_RING_LAYERS, point.label).map((layer) => (
          <div
            key={`${keyPrefix}-${point.id}-${layer.color}`}
            className="fullscreen-camera-ring-layer"
            style={{
              width: `${layer.diameter}px`,
              height: `${layer.diameter}px`,
              backgroundColor: layer.color,
            }}
          />
        ))}
      </div>
    );
  }

  function renderFullscreenPulseBurst(burst, keyPrefix) {
    if (!fullscreenCameraViewport || !Number.isFinite(burst?.x) || !Number.isFinite(burst?.y)) {
      return null;
    }

    const elapsed = Math.max(0, fullscreenPulseNow - burst.startTime);
    const progress = Math.min(1, elapsed / FULLSCREEN_PULSE_RING_DURATION_MS);
    if (progress <= 0 || progress >= 1) {
      return null;
    }

    const radius = burst.startRadius + (burst.maxRadius - burst.startRadius) * progress;
    return (
      <div
        key={`${keyPrefix}-${burst.id}`}
        className="fullscreen-camera-pulse-ring"
        style={{
          left: `${burst.x - fullscreenCameraViewport.left}px`,
          top: `${burst.y - fullscreenCameraViewport.top}px`,
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          opacity: (1 - progress) * 0.9,
        }}
      />
    );
  }

  function renderTrackedCursorLayer() {
    return (
      <>
        {cursorTrail.map((point, index) => {
          const age = Math.max(0, cursorTrailNow - point.timestamp);
          const progress = 1 - Math.min(1, age / CURSOR_TRAIL_DURATION_MS);
          if (progress <= 0) {
            return null;
          }
          return (
            <div
              key={`cursor-trail-${point.timestamp}-${index}`}
              className="tracked-cursor-trail"
              style={{
                left: `${point.x}px`,
                top: `${point.y}px`,
                opacity: progress * 0.75,
                transform: `translate(-50%, -50%) scale(${0.42 + progress * 0.5})`,
              }}
            />
          );
        })}
        <div
          className={`tracked-cursor ${handDetected ? "" : "paused"}`}
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
          }}
        />
        {debugEnabled && (
          <div
            className="raw-cursor"
            style={{
              left: `${rawCursor.x}px`,
              top: `${rawCursor.y}px`,
            }}
          />
        )}
      </>
    );
  }

  function renderFullscreenStaticRingSet(point, keyPrefix) {
    if (!fullscreenCameraViewport || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
      return null;
    }

    const localX = point.x - fullscreenCameraViewport.left;
    const localY = point.y - fullscreenCameraViewport.top;
    const viewportRadius = Math.max(
      Math.hypot(localX, localY),
      Math.hypot(fullscreenCameraViewport.width - localX, localY),
      Math.hypot(localX, fullscreenCameraViewport.height - localY),
      Math.hypot(
        fullscreenCameraViewport.width - localX,
        fullscreenCameraViewport.height - localY,
      ),
    );
    const maxDiameter = viewportRadius * 2;
    const startDiameter =
      (FULLSCREEN_RING_LAYERS[0]?.diameter ?? 0) + FULLSCREEN_STATIC_RING_STEP_PX;
    const diameters = [];
    const clipPath = getStaticRippleClipPath(
      point,
      fullscreenIndexPoints,
      fullscreenCameraViewport,
    );
    for (
      let diameter = startDiameter;
      diameter <= maxDiameter + FULLSCREEN_STATIC_RING_STEP_PX;
      diameter += FULLSCREEN_STATIC_RING_STEP_PX
    ) {
      diameters.push(diameter);
    }

    return (
      <div
        key={`${keyPrefix}-${point.id}`}
        className="fullscreen-camera-static-ripple-field"
        style={{
          clipPath,
        }}
      >
        {diameters.map((diameter) => (
          <div
            key={`${keyPrefix}-${point.id}-${diameter}`}
            className="fullscreen-camera-static-ring"
            style={{
              left: `${point.x - fullscreenCameraViewport.left}px`,
              top: `${point.y - fullscreenCameraViewport.top}px`,
              width: `${diameter}px`,
              height: `${diameter}px`,
            }}
          />
        ))}
      </div>
    );
  }

  function renderFullscreenTipRippleSet(point, keyPrefix, strokeWidth) {
    if (!fullscreenCameraViewport || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
      return null;
    }

    const localX = point.x - fullscreenCameraViewport.left;
    const localY = point.y - fullscreenCameraViewport.top;
    const viewportRadius = Math.max(
      Math.hypot(localX, localY),
      Math.hypot(fullscreenCameraViewport.width - localX, localY),
      Math.hypot(localX, fullscreenCameraViewport.height - localY),
      Math.hypot(
        fullscreenCameraViewport.width - localX,
        fullscreenCameraViewport.height - localY,
      ),
    );
    const maxDiameter = viewportRadius * 2;
    const centerDiameter = FULLSCREEN_RING_LAYERS[0]?.diameter ?? 44;
    const clipPath = getStaticRippleClipPath(
      point,
      fullscreenTipPoints,
      fullscreenCameraViewport,
    );
    const bands = [];

    for (
      let bandIndex = 0, outerDiameter = centerDiameter + FULLSCREEN_TIP_RIPPLE_OUTER_DIAMETER_STEP_PX;
      outerDiameter < maxDiameter + FULLSCREEN_STATIC_RING_STEP_PX;
      bandIndex += 1, outerDiameter += FULLSCREEN_TIP_RIPPLE_OUTER_DIAMETER_STEP_PX
    ) {
      const borderWidth = Math.min(strokeWidth, outerDiameter / 2);
      const contentDiameter = Math.max(0, outerDiameter - borderWidth * 2);
      const color =
        FULLSCREEN_TIP_RIPPLE_COLORS[bandIndex % FULLSCREEN_TIP_RIPPLE_COLORS.length];
      bands.push({
        contentDiameter,
        outerDiameter,
        borderWidth,
        color,
      });
    }

    return (
      <div
        key={`${keyPrefix}-${point.id}`}
        className="fullscreen-camera-static-ripple-field"
        style={{
          clipPath,
        }}
      >
        {bands.map((band) => (
          <div
            key={`${keyPrefix}-${point.id}-${band.outerDiameter}`}
            className="fullscreen-camera-tip-ripple-band"
            style={{
              left: `${point.x - fullscreenCameraViewport.left}px`,
              top: `${point.y - fullscreenCameraViewport.top}px`,
              width: `${band.contentDiameter}px`,
              height: `${band.contentDiameter}px`,
              borderWidth: `${band.borderWidth}px`,
              borderColor: band.color,
            }}
          />
        ))}
      </div>
    );
  }

  function renderFullscreenStaticCenter(point, keyPrefix) {
    if (!fullscreenCameraViewport || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
      return null;
    }

    const centerDiameter = FULLSCREEN_RING_LAYERS[0]?.diameter ?? 44;
    return (
      <div
        key={`${keyPrefix}-${point.id}`}
        className="fullscreen-camera-static-center"
        style={{
          left: `${point.x - fullscreenCameraViewport.left}px`,
          top: `${point.y - fullscreenCameraViewport.top}px`,
          width: `${centerDiameter}px`,
          height: `${centerDiameter}px`,
        }}
      />
    );
  }

  function renderFullscreenStaticSeam(keyPrefix) {
    if (!fullscreenCameraViewport || fullscreenIndexPoints.length !== 2) {
      return null;
    }

    const seam = getStaticRippleSeam(
      fullscreenIndexPoints[0],
      fullscreenIndexPoints[1],
      fullscreenCameraViewport,
    );
    if (!seam) {
      return null;
    }

    return (
      <svg
        key={keyPrefix}
        className="fullscreen-camera-static-seam"
        viewBox={`0 0 ${fullscreenCameraViewport.width} ${fullscreenCameraViewport.height}`}
        preserveAspectRatio="none"
      >
        <line x1={seam.x1} y1={seam.y1} x2={seam.x2} y2={seam.y2} />
      </svg>
    );
  }

  function restartFullscreenFruitNinjaGame() {
    if (!fullscreenCameraViewport) {
      return;
    }
    const nextGame = createFruitNinjaGame(
      fullscreenCameraViewport.width,
      fullscreenCameraViewport.height,
    );
    fullscreenFruitNinjaLastTickRef.current = 0;
    fullscreenFruitNinjaStateRef.current = nextGame;
    setFullscreenFruitNinjaState(nextGame);
  }

  function renderFullscreenFruitTarget(target) {
    const size = target.radius * 2;
    return (
      <div
        key={target.id}
        className={`fullscreen-camera-fruit-target ${target.kind === "bomb" ? "bomb" : "fruit"}`}
        style={{
          left: `${target.x - target.radius}px`,
          top: `${target.y - target.radius}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${target.rotation}rad)`,
          background: target.fill,
          boxShadow:
            target.kind === "bomb"
              ? "0 0 0 2px rgba(255, 123, 107, 0.72), 0 16px 40px rgba(0, 0, 0, 0.34)"
              : `0 0 0 2px ${target.accent}, 0 18px 36px rgba(0, 0, 0, 0.28)`,
        }}
      >
        <div
          className={`fullscreen-camera-fruit-core ${target.kind === "bomb" ? "bomb" : ""}`}
          style={{
            background: target.kind === "bomb" ? target.accent : target.accent,
          }}
        />
      </div>
    );
  }

  function renderFullscreenFruitSplitPiece(piece) {
    const size = piece.radius * 2;
    return (
      <div
        key={piece.id}
        className={`fullscreen-camera-fruit-split ${piece.half}`}
        style={{
          left: `${piece.x - piece.radius}px`,
          top: `${piece.y - piece.radius}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${piece.rotation}rad)`,
          background: piece.fill,
        }}
      >
        <div
          className="fullscreen-camera-fruit-core"
          style={{
            background: piece.accent,
          }}
        />
      </div>
    );
  }

  const fullscreenTipRippleStrokeWidth = getTipRippleStrokeWidth(
    fullscreenTipRippleNow - fullscreenTipRippleStartedAtRef.current,
    {
      thickStrokeWidth: FULLSCREEN_TIP_RIPPLE_TOUCHING_STROKE_WIDTH_PX,
    },
  );

  if (isFullscreenCameraPhase) {
    return (
      <div className="app fullscreen-camera-app">
        <div className="fullscreen-camera-stage" ref={cameraWrapRef}>
          <WebcamBackground
            videoRef={videoRef}
            overlayCanvasRef={overlayCanvasRef}
            cameraObjectFit={cameraObjectFit}
          />
          {isFullscreenModeLanding ? (
            <FullscreenLandingPage
              viewportStyle={fullscreenCameraLandingViewport?.style}
              layout={fullscreenModeLandingLayout}
              state={fullscreenModeLandingState}
              holdProgress={fullscreenModeLandingHoldProgress}
              handDetected={handDetected}
              fps={fps}
              onSelect={handleFullscreenModeLandingBoxClick}
              onScrollOffsetChange={handleFullscreenModeLandingScrollOffsetChange}
            />
          ) : fullscreenGridMode === "hex" ? (
            <div className="fullscreen-camera-hex-grid" style={fullscreenHexGridMetrics?.style ?? undefined}>
              {fullscreenHexGridMetrics?.cells?.map((cell) => (
                <div
                  key={`fullscreen-hex-cell-${cell.key}`}
                  className="fullscreen-camera-hex-cell"
                  style={cell.style}
                />
              ))}
              {fullscreenHexGridMetrics?.outerRing?.map((cell) => (
                <div
                  key={`fullscreen-hex-outer-${cell.key}`}
                  className="fullscreen-camera-grid-outer-ring fullscreen-camera-hex-cell fullscreen-camera-hex-highlight"
                  style={cell.style}
                />
              ))}
              {fullscreenHexGridMetrics?.neighbors?.map((cell) => (
                <div
                  key={`fullscreen-hex-neighbor-${cell.key}`}
                  className="fullscreen-camera-grid-neighbor fullscreen-camera-hex-cell fullscreen-camera-hex-highlight"
                  style={cell.style}
                />
              ))}
              {fullscreenHexGridMetrics?.highlight?.map((cell) => (
                <div
                  key={`fullscreen-hex-highlight-${cell.key}`}
                  className="fullscreen-camera-grid-highlight fullscreen-camera-hex-cell fullscreen-camera-hex-highlight"
                  style={cell.style}
                />
              ))}
            </div>
          ) : fullscreenGridMode === "voronoi" ? (
            <svg
              className="fullscreen-camera-voronoi"
              style={fullscreenVoronoiMetrics?.style ?? undefined}
              viewBox={`0 0 ${fullscreenVoronoiMetrics?.width ?? 0} ${fullscreenVoronoiMetrics?.height ?? 0}`}
              preserveAspectRatio="none"
            >
              {fullscreenVoronoiMetrics?.cells.map((cell) => (
                <polygon
                  key={`fullscreen-voronoi-cell-${cell.key}`}
                  className="fullscreen-camera-voronoi-cell"
                  points={cell.polygon.map((point) => `${point.x},${point.y}`).join(" ")}
                  style={{ fill: cell.color }}
                />
              ))}
            </svg>
          ) : fullscreenGridMode === "rings" ? (
            <div
              className="fullscreen-camera-rings"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenRingTrail.map((snapshot, snapshotIndex) => {
                const age = Math.max(0, fullscreenRingTrailNow - snapshot.timestamp);
                if (age < FULLSCREEN_RING_TRAIL_SAMPLE_INTERVAL_MS) {
                  return null;
                }
                const progress = 1 - Math.min(1, age / FULLSCREEN_RING_TRAIL_DURATION_MS);
                if (progress <= 0) {
                  return null;
                }
                return snapshot.points.map((point) =>
                  renderFullscreenRingGroup(
                    point,
                    progress * 0.9,
                    `fullscreen-ring-trail-${snapshot.timestamp}-${snapshotIndex}`,
                  ),
                );
              })}
              {fullscreenIndexPoints.map((point) =>
                renderFullscreenRingGroup(point, 0.9, "fullscreen-ring-current"),
              )}
            </div>
          ) : fullscreenGridMode === "pulse" ? (
            <div
              className="fullscreen-camera-rings"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenPulseBursts.map((burst) =>
                renderFullscreenPulseBurst(burst, "fullscreen-pulse-burst"),
              )}
              {fullscreenIndexPoints.map((point) =>
                renderFullscreenRingGroup(point, 0.9, "fullscreen-pulse-current"),
              )}
            </div>
          ) : fullscreenGridMode === "tip-ripples" ? (
            <div
              className="fullscreen-camera-rings"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenTipPoints.map((point) =>
                renderFullscreenTipRippleSet(
                  point,
                  "fullscreen-tip-ripple-rings",
                  fullscreenTipRippleStrokeWidth,
                ),
              )}
              {fullscreenTipPoints.map((point) =>
                renderFullscreenStaticCenter(point, "fullscreen-tip-ripple-center"),
              )}
            </div>
          ) : fullscreenGridMode === "static" ? (
            <div
              className="fullscreen-camera-rings"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenIndexPoints.map((point) =>
                renderFullscreenStaticRingSet(point, "fullscreen-static-rings"),
              )}
              {renderFullscreenStaticSeam("fullscreen-static-seam")}
              {fullscreenIndexPoints.map((point) =>
                renderFullscreenStaticCenter(point, "fullscreen-static-center"),
              )}
            </div>
          ) : fullscreenGridMode === "brick-dodger" ? (
            <div
              className="fullscreen-camera-brick-dodger"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenBrickDodgerState?.layout?.laneCenters?.map((center, index) => (
                <div
                  key={`brick-dodger-lane-${index + 1}`}
                  className="fullscreen-camera-brick-dodger-lane"
                  style={{
                    left: `${center - fullscreenBrickDodgerState.layout.laneWidth / 2}px`,
                    width: `${fullscreenBrickDodgerState.layout.laneWidth}px`,
                  }}
                />
              ))}
              {fullscreenBrickDodgerState?.hazards?.map((hazard) => (
                <div
                  key={hazard.id}
                  className="fullscreen-camera-brick-dodger-hazard"
                  style={{
                    left: `${hazard.x - hazard.width / 2}px`,
                    top: `${hazard.y - hazard.height / 2}px`,
                    width: `${hazard.width}px`,
                    height: `${hazard.height}px`,
                  }}
                />
              ))}
              {fullscreenBrickDodgerState?.bonuses?.map((bonus) => (
                <div
                  key={bonus.id}
                  className="fullscreen-camera-brick-dodger-bonus"
                  style={{
                    left: `${bonus.x - bonus.size / 2}px`,
                    top: `${bonus.y - bonus.size / 2}px`,
                    width: `${bonus.size}px`,
                    height: `${bonus.size}px`,
                  }}
                />
              ))}
              {fullscreenBrickDodgerState?.player ? (
                <div
                  className={`fullscreen-camera-brick-dodger-player ${
                    fullscreenBrickDodgerState.invulnerabilityMs > 0 ? "invulnerable" : ""
                  }`}
                  style={{
                    left: `${fullscreenBrickDodgerState.player.x - fullscreenBrickDodgerState.layout.playerWidth / 2}px`,
                    top: `${fullscreenBrickDodgerState.layout.playerY - fullscreenBrickDodgerState.layout.playerHeight / 2}px`,
                    width: `${fullscreenBrickDodgerState.layout.playerWidth}px`,
                    height: `${fullscreenBrickDodgerState.layout.playerHeight}px`,
                  }}
                />
              ) : null}
              <div className="fullscreen-camera-brick-dodger-scoreboard">
                <span>Score {fullscreenBrickDodgerState?.score ?? 0}</span>
                <span>Shields {fullscreenBrickDodgerState?.lives ?? 0}</span>
                <span>Time {Math.floor((fullscreenBrickDodgerState?.survivalMs ?? 0) / 1000)}s</span>
                <span>Streak {fullscreenBrickDodgerState?.bonusStreak ?? 0}</span>
              </div>
              <div className="fullscreen-camera-brick-dodger-legend">
                <span>Bonus +{BRICK_DODGER_BONUS_SCORE}</span>
                <span>Survive for score over time</span>
                <span>Adjacent lanes hold the risky pickups</span>
              </div>
              {isFullscreenBrickDodgerMode && fullscreenBrickDodgerState?.message ? (
                <div
                  className={`fullscreen-camera-brick-dodger-banner ${
                    fullscreenBrickDodgerState.status === "gameover" ? "game-over" : ""
                  }`}
                >
                  {fullscreenBrickDodgerState.message}
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "breakout-coop" ? (
            <div
              className="fullscreen-camera-breakout fullscreen-camera-breakout-coop"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenBreakoutCoopState?.bricks
                ?.filter((brick) => !brick.destroyed)
                .map((brick) => (
                  <div
                    key={brick.id}
                    className={`fullscreen-camera-breakout-brick fullscreen-camera-breakout-coop-brick ${brick.kind === "prism" ? "prism" : ""}`}
                    style={{
                      left: `${brick.x}px`,
                      top: `${brick.y}px`,
                      width: `${brick.width}px`,
                      height: `${brick.height}px`,
                      background: brick.color,
                    }}
                  />
                ))}
              {fullscreenBreakoutCoopState?.shield?.activeMs > 0 ? (
                <div
                  className="fullscreen-camera-breakout-coop-shield"
                  style={{
                    left: `${fullscreenBreakoutCoopState.paddle.x - fullscreenBreakoutCoopState.layout.shieldWidth / 2}px`,
                    top: `${fullscreenBreakoutCoopState.layout.shieldY - fullscreenBreakoutCoopState.layout.shieldHeight / 2}px`,
                    width: `${fullscreenBreakoutCoopState.layout.shieldWidth}px`,
                    height: `${fullscreenBreakoutCoopState.layout.shieldHeight}px`,
                  }}
                />
              ) : null}
              {fullscreenBreakoutCoopState?.balls?.map((ball) => (
                <div
                  key={ball.id}
                  className="fullscreen-camera-breakout-ball fullscreen-camera-breakout-coop-ball"
                  style={{
                    left: `${ball.x - ball.radius}px`,
                    top: `${ball.y - ball.radius}px`,
                    width: `${ball.radius * 2}px`,
                    height: `${ball.radius * 2}px`,
                  }}
                />
              ))}
              {fullscreenBreakoutCoopState?.paddle && (
                <div
                  className="fullscreen-camera-breakout-paddle fullscreen-camera-breakout-coop-paddle"
                  style={{
                    left: `${fullscreenBreakoutCoopState.paddle.x - fullscreenBreakoutCoopState.layout.paddleWidth / 2}px`,
                    top: `${fullscreenBreakoutCoopState.layout.paddleY - fullscreenBreakoutCoopState.layout.paddleHeight / 2}px`,
                    width: `${fullscreenBreakoutCoopState.layout.paddleWidth}px`,
                    height: `${fullscreenBreakoutCoopState.layout.paddleHeight}px`,
                  }}
                />
              )}
              <div className="fullscreen-camera-breakout-scoreboard fullscreen-camera-breakout-coop-scoreboard">
                <span>Score {fullscreenBreakoutCoopState?.score ?? 0}</span>
                <span>Lives {fullscreenBreakoutCoopState?.lives ?? 0}</span>
                <span>
                  Bricks{" "}
                  {fullscreenBreakoutCoopState?.bricks?.filter((brick) => !brick.destroyed).length ?? 0}
                </span>
                <span>Balls {fullscreenBreakoutCoopState?.balls?.length ?? 0}</span>
                <span>
                  Shield {Math.round((fullscreenBreakoutCoopState?.shield?.meter ?? 0) * 100)}%
                </span>
              </div>
              <div className="fullscreen-camera-breakout-legend fullscreen-camera-breakout-coop-legend">
                <span>Standard +{BREAKOUT_COOP_BRICK_SCORE}</span>
                <span>Prism +{BREAKOUT_COOP_PRISM_BRICK_SCORE} + split ball</span>
                <span>Support-hand pinch: energy shield</span>
              </div>
              <div className="fullscreen-camera-breakout-coop-status">
                {fullscreenBreakoutCoopState?.message ?? ""}
              </div>
              <div className="fullscreen-camera-breakout-coop-meter">
                <div
                  className="fullscreen-camera-breakout-coop-meter-fill"
                  style={{
                    width: `${Math.round((fullscreenBreakoutCoopState?.shield?.meter ?? 0) * 100)}%`,
                  }}
                />
              </div>
              {isFullscreenBreakoutCoopMode &&
              fullscreenBreakoutCoopState.status === "countdown" &&
              fullscreenBreakoutCoopState.countdownMs > 0 ? (
                <div className="fullscreen-camera-breakout-countdown">
                  {Math.max(1, Math.ceil(fullscreenBreakoutCoopState.countdownMs / 1000))}
                </div>
              ) : null}
              {isFullscreenBreakoutCoopMode &&
              (fullscreenBreakoutCoopState.status === "cleared" ||
                fullscreenBreakoutCoopState.status === "gameover") ? (
                <div className="fullscreen-camera-breakout-banner">
                  {fullscreenBreakoutCoopState.status === "cleared"
                    ? "Wave clear"
                    : "Round over"}
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "breakout" ||
            fullscreenGridMode === FIND_YOUR_GRIND_BREAKOUT_MODE_ID ? (
            <div
              className={`fullscreen-camera-breakout ${
                fullscreenGridMode === FIND_YOUR_GRIND_BREAKOUT_MODE_ID
                  ? "find-your-grind"
                  : ""
              }`}
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenBreakoutState?.bricks
                ?.filter((brick) => !brick.destroyed)
                .map((brick) => (
                  <div
                    key={brick.id}
                    className="fullscreen-camera-breakout-brick"
                    style={{
                      left: `${brick.x}px`,
                      top: `${brick.y}px`,
                      width: `${brick.width}px`,
                      height: `${brick.height}px`,
                      background: brick.color,
                    }}
                  />
                ))}
              {fullscreenBreakoutState?.capsules?.map((capsule) => (
                <div
                  key={capsule.id}
                  className="fullscreen-camera-breakout-capsule"
                  style={{
                    left: `${capsule.x - capsule.width / 2}px`,
                    top: `${capsule.y - capsule.height / 2}px`,
                    width: `${capsule.width}px`,
                    height: `${capsule.height}px`,
                  }}
                />
              ))}
              {fullscreenBreakoutState?.balls?.map((ball) => (
                <div
                  key={ball.id}
                  className="fullscreen-camera-breakout-ball"
                  style={{
                    left: `${ball.x - ball.radius}px`,
                    top: `${ball.y - ball.radius}px`,
                    width: `${ball.radius * 2}px`,
                    height: `${ball.radius * 2}px`,
                  }}
                />
              ))}
              {fullscreenBreakoutState?.paddle && (
                <div
                  className="fullscreen-camera-breakout-paddle"
                  style={{
                    left: `${fullscreenBreakoutState.paddle.x - fullscreenBreakoutState.layout.paddleWidth / 2}px`,
                    top: `${fullscreenBreakoutState.layout.paddleY - fullscreenBreakoutState.layout.paddleHeight / 2}px`,
                    width: `${fullscreenBreakoutState.layout.paddleWidth}px`,
                    height: `${fullscreenBreakoutState.layout.paddleHeight}px`,
                  }}
                />
              )}
              <div className="fullscreen-camera-breakout-scoreboard">
                <span>Score {fullscreenBreakoutState?.score ?? 0}</span>
                <span>
                  Bricks {fullscreenBreakoutState?.bricks?.filter((brick) => !brick.destroyed).length ?? 0}
                </span>
                <span>Balls {fullscreenBreakoutState?.balls?.length ?? 0}</span>
              </div>
              <div className="fullscreen-camera-breakout-legend">
                <span>Brick +{BREAKOUT_BRICK_SCORE}</span>
                <span>Capsule +{BREAKOUT_CAPSULE_SCORE}</span>
              </div>
              {isFullscreenBreakoutMode &&
              fullscreenBreakoutState.status === "countdown" &&
              fullscreenBreakoutState.countdownMs > 0 ? (
                <div className="fullscreen-camera-breakout-countdown">
                  {Math.max(1, Math.ceil(fullscreenBreakoutState.countdownMs / 1000))}
                </div>
              ) : null}
              {isFullscreenBreakoutMode && fullscreenBreakoutState.status === "cleared" ? (
                <div className="fullscreen-camera-breakout-banner">All bricks cleared</div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "finger-pong" ? (
            <div
              className="fullscreen-camera-finger-pong"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              <div className="fullscreen-camera-finger-pong-midline" />
              <div
                className="fullscreen-camera-finger-pong-paddle opponent"
                style={{
                  left: `${(fullscreenFingerPongState?.opponent?.x ?? 0) - (fullscreenFingerPongState?.layout?.opponentPaddleWidth ?? 0) / 2}px`,
                  top: `${(fullscreenFingerPongState?.layout?.opponentPaddleY ?? 0) - (fullscreenFingerPongState?.layout?.paddleHeight ?? 0) / 2}px`,
                  width: `${fullscreenFingerPongState?.layout?.opponentPaddleWidth ?? 0}px`,
                  height: `${fullscreenFingerPongState?.layout?.paddleHeight ?? 0}px`,
                }}
              />
              <div
                className="fullscreen-camera-finger-pong-paddle player"
                style={{
                  left: `${(fullscreenFingerPongState?.player?.x ?? 0) - (fullscreenFingerPongState?.layout?.paddleWidth ?? 0) / 2}px`,
                  top: `${(fullscreenFingerPongState?.layout?.playerPaddleY ?? 0) - (fullscreenFingerPongState?.layout?.paddleHeight ?? 0) / 2}px`,
                  width: `${fullscreenFingerPongState?.layout?.paddleWidth ?? 0}px`,
                  height: `${fullscreenFingerPongState?.layout?.paddleHeight ?? 0}px`,
                }}
              />
              <div
                className="fullscreen-camera-finger-pong-ball"
                style={{
                  left: `${(fullscreenFingerPongState?.ball?.x ?? 0) - (fullscreenFingerPongState?.ball?.radius ?? 0)}px`,
                  top: `${(fullscreenFingerPongState?.ball?.y ?? 0) - (fullscreenFingerPongState?.ball?.radius ?? 0)}px`,
                  width: `${(fullscreenFingerPongState?.ball?.radius ?? 0) * 2}px`,
                  height: `${(fullscreenFingerPongState?.ball?.radius ?? 0) * 2}px`,
                }}
              />
              <div className="fullscreen-camera-finger-pong-scoreboard">
                <span>Score {fullscreenFingerPongState?.score ?? 0}</span>
                <span>Rally {fullscreenFingerPongState?.rallyCount ?? 0}</span>
                <span>Best {fullscreenFingerPongState?.bestRally ?? 0}</span>
                <span>Misses {fullscreenFingerPongState?.opponentScore ?? 0}</span>
              </div>
              <div className="fullscreen-camera-finger-pong-legend">
                <span>Horizontal fingertip steers</span>
                <span>Edge hits bend returns</span>
                <span>First to {FINGER_PONG_MAX_SCORE}</span>
              </div>
              {isFullscreenFingerPongMode &&
              fullscreenFingerPongState?.status === "countdown" &&
              fullscreenFingerPongState.countdownMs > 0 ? (
                <div className="fullscreen-camera-finger-pong-banner countdown">
                  {Math.max(1, Math.ceil(fullscreenFingerPongState.countdownMs / 1000))}
                </div>
              ) : null}
              {isFullscreenFingerPongMode &&
              fullscreenFingerPongState?.status === "won" ? (
                <div className="fullscreen-camera-finger-pong-banner">
                  {fullscreenFingerPongState.message}
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "tic-tac-toe" ? (
            <div
              className="fullscreen-camera-tic-tac-toe"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              <div
                className="fullscreen-camera-tic-tac-toe-board"
                style={{
                  left: `${fullscreenTicTacToeLayout?.boardLeft ?? 0}px`,
                  top: `${fullscreenTicTacToeLayout?.boardTop ?? 0}px`,
                  width: `${fullscreenTicTacToeLayout?.boardSize ?? 0}px`,
                  height: `${fullscreenTicTacToeLayout?.boardSize ?? 0}px`,
                }}
              />
              <div
                className={`fullscreen-camera-tic-tac-toe-rail player ${
                  fullscreenTicTacToeTurnUi.playerRailState
                } ${fullscreenTicTacToeLayout?.layoutMode ?? "landscape-rails"} ${
                  fullscreenTicTacToeState?.draggingPiece ? "dragging" : ""
                }`}
                style={{
                  left: `${fullscreenTicTacToeLayout?.playerRailLeft ?? 0}px`,
                  top: `${fullscreenTicTacToeLayout?.playerRailTop ?? 0}px`,
                  width: `${fullscreenTicTacToeLayout?.playerRailWidth ?? 0}px`,
                  height: `${fullscreenTicTacToeLayout?.playerRailHeight ?? 0}px`,
                }}
              >
                {[-1, 0, 1].map((offset, index) => (
                  <div
                    key={`tic-tac-toe-player-stack-${index}`}
                    className="fullscreen-camera-tic-tac-toe-reserve-piece player"
                    style={{
                      left:
                        fullscreenTicTacToeLayout?.reserveAxis === "x"
                          ? `${(fullscreenTicTacToeLayout?.playerRailWidth ?? 0) / 2 + offset * (fullscreenTicTacToeLayout?.reserveStepX ?? 0)}px`
                          : "50%",
                      top:
                        fullscreenTicTacToeLayout?.reserveAxis === "x"
                          ? "50%"
                          : `${(fullscreenTicTacToeLayout?.playerRailHeight ?? 0) / 2 + offset * (fullscreenTicTacToeLayout?.reserveStepY ?? 0)}px`,
                      width: `${fullscreenTicTacToeLayout?.reservePieceSize ?? 0}px`,
                      height: `${fullscreenTicTacToeLayout?.reservePieceSize ?? 0}px`,
                      opacity:
                        fullscreenTicTacToePlayerReserveCount <= 0
                          ? 0.08
                          : offset === 0
                          ? 0.34
                          : 0.18,
                    }}
                  >
                    <span className="fullscreen-camera-tic-tac-toe-piece-label">
                      {TIC_TAC_TOE_PLAYER_MARK}
                    </span>
                  </div>
                ))}
                <div
                  className={`fullscreen-camera-tic-tac-toe-active-piece player ${
                    fullscreenTicTacToeState?.draggingPiece ? "hidden" : ""
                  }`}
                  style={{
                    width: `${fullscreenTicTacToeLayout?.activePieceSize ?? 0}px`,
                    height: `${fullscreenTicTacToeLayout?.activePieceSize ?? 0}px`,
                  }}
                >
                  <span className="fullscreen-camera-tic-tac-toe-piece-label">
                    {TIC_TAC_TOE_PLAYER_MARK}
                  </span>
                </div>
                <div className="fullscreen-camera-tic-tac-toe-rail-label">X Rail</div>
                <div className="fullscreen-camera-tic-tac-toe-rail-pips player" aria-hidden="true">
                  {fullscreenTicTacToePlayerReservePips.map((pip) => (
                    <span
                      key={`player-reserve-pip-${pip.index}`}
                      className={`fullscreen-camera-tic-tac-toe-rail-pip ${pip.className}`}
                    />
                  ))}
                </div>
                <div className="fullscreen-camera-tic-tac-toe-rail-count">
                  {fullscreenTicTacToePlayerReserveCount} left
                </div>
              </div>
              <div
                className={`fullscreen-camera-tic-tac-toe-rail ai ${
                  fullscreenTicTacToeTurnUi.aiRailState
                } ${fullscreenTicTacToeLayout?.layoutMode ?? "landscape-rails"} ${
                  fullscreenTicTacToeState?.status === "ai-turn" ? "thinking" : ""
                }`}
                style={{
                  left: `${fullscreenTicTacToeLayout?.aiRailLeft ?? 0}px`,
                  top: `${fullscreenTicTacToeLayout?.aiRailTop ?? 0}px`,
                  width: `${fullscreenTicTacToeLayout?.aiRailWidth ?? 0}px`,
                  height: `${fullscreenTicTacToeLayout?.aiRailHeight ?? 0}px`,
                }}
              >
                {[-1, 0, 1].map((offset, index) => (
                  <div
                    key={`tic-tac-toe-ai-stack-${index}`}
                    className="fullscreen-camera-tic-tac-toe-reserve-piece ai"
                    style={{
                      left:
                        fullscreenTicTacToeLayout?.reserveAxis === "x"
                          ? `${(fullscreenTicTacToeLayout?.aiRailWidth ?? 0) / 2 + offset * (fullscreenTicTacToeLayout?.reserveStepX ?? 0)}px`
                          : "50%",
                      top:
                        fullscreenTicTacToeLayout?.reserveAxis === "x"
                          ? "50%"
                          : `${(fullscreenTicTacToeLayout?.aiRailHeight ?? 0) / 2 + offset * (fullscreenTicTacToeLayout?.reserveStepY ?? 0)}px`,
                      width: `${fullscreenTicTacToeLayout?.reservePieceSize ?? 0}px`,
                      height: `${fullscreenTicTacToeLayout?.reservePieceSize ?? 0}px`,
                      opacity:
                        fullscreenTicTacToeAiReserveCount <= 0
                          ? 0.08
                          : offset === 0
                          ? 0.34
                          : 0.18,
                    }}
                  >
                    <span className="fullscreen-camera-tic-tac-toe-piece-label">
                      {TIC_TAC_TOE_AI_MARK}
                    </span>
                  </div>
                ))}
                <div
                  className={`fullscreen-camera-tic-tac-toe-active-piece ai ${
                    fullscreenTicTacToeState?.status === "ai-turn" ? "thinking" : ""
                  }`}
                  style={{
                    width: `${fullscreenTicTacToeLayout?.activePieceSize ?? 0}px`,
                    height: `${fullscreenTicTacToeLayout?.activePieceSize ?? 0}px`,
                  }}
                >
                  <span className="fullscreen-camera-tic-tac-toe-piece-label">
                    {TIC_TAC_TOE_AI_MARK}
                  </span>
                </div>
                <div className="fullscreen-camera-tic-tac-toe-rail-label">O Rail</div>
                <div className="fullscreen-camera-tic-tac-toe-rail-pips ai" aria-hidden="true">
                  {fullscreenTicTacToeAiReservePips.map((pip) => (
                    <span
                      key={`ai-reserve-pip-${pip.index}`}
                      className={`fullscreen-camera-tic-tac-toe-rail-pip ${pip.className}`}
                    />
                  ))}
                </div>
                <div className="fullscreen-camera-tic-tac-toe-rail-count">
                  {fullscreenTicTacToeAiReserveCount} left
                </div>
              </div>
              <div
                className={`fullscreen-camera-tic-tac-toe-reset-box ${
                  fullscreenTicTacToeResetUi.isDisabled ? "disabled" : ""
                } ${
                  fullscreenTicTacToeResetUi.isActive ? "active" : ""
                }`}
                style={{
                  left: `${fullscreenTicTacToeLayout?.resetBoxLeft ?? 0}px`,
                  top: `${fullscreenTicTacToeLayout?.resetBoxTop ?? 0}px`,
                  width: `${fullscreenTicTacToeLayout?.resetBoxWidth ?? 0}px`,
                  height: `${fullscreenTicTacToeLayout?.resetBoxHeight ?? 0}px`,
                  "--tic-tac-toe-reset-progress": fullscreenTicTacToeResetUi.progressDegrees,
                }}
              >
                <span
                  className="fullscreen-camera-tic-tac-toe-reset-progress"
                  aria-hidden="true"
                />
                <span className="fullscreen-camera-tic-tac-toe-reset-title">
                  {fullscreenTicTacToeResetUi.label}
                </span>
                <span className="fullscreen-camera-tic-tac-toe-reset-countdown">
                  {fullscreenTicTacToeResetUi.countdownText}
                </span>
                <span className="fullscreen-camera-tic-tac-toe-reset-hint">
                  {fullscreenTicTacToeResetUi.hint}
                </span>
              </div>
              {Array.from({ length: 9 }, (_, index) => {
                const cellRect = getTicTacToeCellRect(fullscreenTicTacToeLayout, index);
                const mark = fullscreenTicTacToeState?.board?.[index] ?? null;
                if (!cellRect) {
                  return null;
                }

                const cellUi = getTicTacToeCellUi(fullscreenTicTacToeState, index, {
                  draggingCellIndex: fullscreenTicTacToeDraggingCellIndex,
                });
                const markUi = mark
                  ? getTicTacToeMarkUi(fullscreenTicTacToeState, index, mark, {
                      playerMark: TIC_TAC_TOE_PLAYER_MARK,
                      aiMark: TIC_TAC_TOE_AI_MARK,
                    })
                  : null;
                const cellClassName = [
                  "fullscreen-camera-tic-tac-toe-cell",
                  ...cellUi.classNames,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div
                    key={`tic-tac-toe-cell-${index}`}
                    className={cellClassName}
                    style={{
                      left: `${cellRect.left}px`,
                      top: `${cellRect.top}px`,
                      width: `${cellRect.width}px`,
                      height: `${cellRect.height}px`,
                    }}
                  >
                    {mark ? (
                      <span
                        className={`fullscreen-camera-tic-tac-toe-mark ${
                          markUi?.classNames.join(" ") ?? ""
                        }`}
                      >
                        {mark}
                      </span>
                    ) : null}
                    {cellUi.showPreviewMark ? (
                      <span className="fullscreen-camera-tic-tac-toe-mark player preview">
                        {TIC_TAC_TOE_PLAYER_MARK}
                      </span>
                    ) : null}
                  </div>
                );
              })}
              {fullscreenTicTacToeWinningLineUi ? (
                <div
                  className="fullscreen-camera-tic-tac-toe-winning-line"
                  style={{
                    left: `${fullscreenTicTacToeWinningLineUi.left}px`,
                    top: `${fullscreenTicTacToeWinningLineUi.top}px`,
                    width: `${fullscreenTicTacToeWinningLineUi.width}px`,
                    height: `${fullscreenTicTacToeWinningLineUi.thickness}px`,
                    transform: `translateY(-50%) rotate(${fullscreenTicTacToeWinningLineUi.angleDegrees}deg)`,
                  }}
                />
              ) : null}
              {fullscreenTicTacToeState?.draggingPiece ? (
                <div
                  className="fullscreen-camera-tic-tac-toe-drag-piece player"
                  style={{
                    left: `${fullscreenTicTacToeState.draggingPiece.x - fullscreenTicTacToeState.draggingPiece.size / 2}px`,
                    top: `${fullscreenTicTacToeState.draggingPiece.y - fullscreenTicTacToeState.draggingPiece.size / 2}px`,
                    width: `${fullscreenTicTacToeState.draggingPiece.size}px`,
                    height: `${fullscreenTicTacToeState.draggingPiece.size}px`,
                  }}
                >
                  <span className="fullscreen-camera-tic-tac-toe-piece-label">
                    {TIC_TAC_TOE_PLAYER_MARK}
                  </span>
                </div>
              ) : null}
              {fullscreenTicTacToeCursorUi.show && fullscreenTicTacToeCursorPoint ? (
                <div
                  className={`fullscreen-camera-tic-tac-toe-cursor-indicator ${fullscreenTicTacToeCursorUi.tone}`}
                  style={{
                    left: `${fullscreenTicTacToeCursorPoint.x}px`,
                    top: `${fullscreenTicTacToeCursorPoint.y}px`,
                  }}
                >
                  {fullscreenTicTacToeCursorUi.label}
                </div>
              ) : null}
              <div className="fullscreen-camera-tic-tac-toe-topbar">
                <div className="fullscreen-camera-tic-tac-toe-scoreboard">
                  {fullscreenTicTacToeHudUi.scoreItems.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                {fullscreenTicTacToeHudUi.statusMessage ? (
                  <div
                    className={`fullscreen-camera-tic-tac-toe-status ${fullscreenTicTacToeHudUi.statusTone}`}
                  >
                    {fullscreenTicTacToeHudUi.statusMessage}
                  </div>
                ) : null}
              </div>
              {fullscreenTicTacToeHudUi.showLegend ? (
                <div className="fullscreen-camera-tic-tac-toe-legend">
                  <span>Pinch to grab</span>
                  <span>Release to place</span>
                  <span>Random opening, optimal after</span>
                </div>
              ) : null}
              <div
                className={`fullscreen-camera-tic-tac-toe-turn-badge ${fullscreenTicTacToeTurnUi.tone}`}
              >
                <span className="fullscreen-camera-tic-tac-toe-turn-label">
                  {fullscreenTicTacToeTurnUi.label}
                </span>
                <span className="fullscreen-camera-tic-tac-toe-turn-detail">
                  {fullscreenTicTacToeTurnUi.detail}
                </span>
              </div>
            </div>
          ) : fullscreenGridMode === "hand-bounce" ? (
            <div
              className="fullscreen-camera-hand-bounce"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              <div className="fullscreen-camera-hand-bounce-backdrop" />
              {fullscreenHandBounceState?.ball ? (
                <div
                  className="fullscreen-camera-hand-bounce-ball-shadow"
                  style={{
                    left: `${fullscreenHandBounceState.ball.x - fullscreenHandBounceState.ball.radius * (0.62 + Math.min(0.5, (fullscreenHandBounceState.ball.y / Math.max(1, fullscreenHandBounceState.layout.height)) * 0.45))}px`,
                    top: `${(fullscreenHandBounceState.layout.height ?? 0) - fullscreenHandBounceState.ball.radius * 0.46}px`,
                    width: `${fullscreenHandBounceState.ball.radius * 2 * (0.62 + Math.min(0.5, (fullscreenHandBounceState.ball.y / Math.max(1, fullscreenHandBounceState.layout.height)) * 0.45))}px`,
                    height: `${fullscreenHandBounceState.ball.radius * 0.6}px`,
                    opacity: Math.min(
                      0.5,
                      0.16 +
                        (fullscreenHandBounceState.ball.y /
                          Math.max(1, fullscreenHandBounceState.layout.height)) *
                          0.28,
                    ),
                  }}
                />
              ) : null}
              {fullscreenHandBounceState?.paddle ? (
                <div
                  className="fullscreen-camera-hand-bounce-paddle"
                  style={{
                    left: `${fullscreenHandBounceState.paddle.x - fullscreenHandBounceState.paddle.width / 2}px`,
                    top: `${fullscreenHandBounceState.paddle.y - fullscreenHandBounceState.paddle.height / 2}px`,
                    width: `${fullscreenHandBounceState.paddle.width}px`,
                    height: `${fullscreenHandBounceState.paddle.height}px`,
                  }}
                />
              ) : null}
              {fullscreenHandBounceState?.ball ? (
                <div
                  className="fullscreen-camera-hand-bounce-ball"
                  style={{
                    left: `${fullscreenHandBounceState.ball.x - fullscreenHandBounceState.ball.radius}px`,
                    top: `${fullscreenHandBounceState.ball.y - fullscreenHandBounceState.ball.radius}px`,
                    width: `${fullscreenHandBounceState.ball.radius * 2}px`,
                    height: `${fullscreenHandBounceState.ball.radius * 2}px`,
                    transform: `rotate(${Math.atan2(
                      fullscreenHandBounceState.ball.vy ?? 0,
                      fullscreenHandBounceState.ball.vx ?? 0,
                    )}rad)`,
                  }}
                />
              ) : null}
              <div className="fullscreen-camera-hand-bounce-scoreboard">
                <span>Saves {fullscreenHandBounceState?.score ?? 0}</span>
                <span>Best {fullscreenHandBounceState?.bestScore ?? 0}</span>
                <span>
                  Speed{" "}
                  {Math.round(
                    Math.hypot(
                      fullscreenHandBounceState?.ball?.vx ?? 0,
                      fullscreenHandBounceState?.ball?.vy ?? 0,
                    ),
                  )}
                </span>
              </div>
              <div className="fullscreen-camera-hand-bounce-legend">
                <span>No pinch needed</span>
                <span>Use your palm to volley</span>
                <span>Miss the bottom and the round ends</span>
              </div>
              {fullscreenHandBounceState?.message ? (
                <div
                  className={`fullscreen-camera-hand-bounce-banner ${
                    fullscreenHandBounceState.status === "gameover" ? "game-over" : ""
                  }`}
                >
                  {fullscreenHandBounceState.message}
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "fruit-ninja" ? (
            <div
              className="fullscreen-camera-fruit-ninja"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              <div className="fullscreen-camera-fruit-blade-trail">
                {fullscreenFruitNinjaState?.bladeTrail?.map((point, index, trail) => {
                  const previous = trail[index - 1];
                  if (!previous) {
                    return null;
                  }
                  const dx = point.x - previous.x;
                  const dy = point.y - previous.y;
                  const length = Math.hypot(dx, dy);
                  if (length < 2) {
                    return null;
                  }
                  const age = Math.max(0, performance.now() - point.timestamp);
                  const opacity = Math.max(0, 1 - age / FRUIT_NINJA_BLADE_TRAIL_MS);
                  return (
                    <div
                      key={`blade-trail-${point.timestamp}-${index}`}
                      className="fullscreen-camera-fruit-blade-segment"
                      style={{
                        left: `${previous.x}px`,
                        top: `${previous.y}px`,
                        width: `${length}px`,
                        transform: `translateY(-50%) rotate(${Math.atan2(dy, dx)}rad)`,
                        opacity,
                      }}
                    />
                  );
                })}
              </div>
              {fullscreenFruitNinjaState?.splitPieces?.map((piece) =>
                renderFullscreenFruitSplitPiece(piece),
              )}
              {fullscreenFruitNinjaState?.targets?.map((target) =>
                renderFullscreenFruitTarget(target),
              )}
              {fullscreenFruitNinjaState?.particles?.map((particle) => (
                <div
                  key={particle.id}
                  className={`fullscreen-camera-fruit-particle ${particle.kind}`}
                  style={{
                    left: `${particle.x - particle.radius}px`,
                    top: `${particle.y - particle.radius}px`,
                    width: `${particle.radius * 2}px`,
                    height: `${particle.radius * 2}px`,
                    background: particle.fill,
                    opacity: Math.max(0, 1 - particle.ageMs / particle.ttlMs),
                  }}
                />
              ))}
              {fullscreenFruitNinjaState?.popups?.map((popup) => (
                <div
                  key={popup.id}
                  className={`fullscreen-camera-fruit-popup ${popup.kind}`}
                  style={{
                    left: `${popup.x}px`,
                    top: `${popup.y}px`,
                    opacity: Math.max(0, 1 - popup.ageMs / popup.ttlMs),
                  }}
                >
                  {popup.text}
                </div>
              ))}
              <div className="fullscreen-camera-fruit-scoreboard">
                <span>Score {fullscreenFruitNinjaState?.score ?? 0}</span>
                <span>Lives {fullscreenFruitNinjaState?.lives ?? FRUIT_NINJA_GAME_OVER_LIVES}</span>
                <span>Combo x{Math.max(1, fullscreenFruitNinjaState?.comboCount ?? 0)}</span>
              </div>
              <div className="fullscreen-camera-fruit-legend">
                <span>Fruit +{FRUIT_NINJA_BASE_SCORE}</span>
                <span>Combo +{FRUIT_NINJA_COMBO_BONUS}</span>
                <span>Bomb -{FRUIT_NINJA_BOMB_PENALTY}</span>
              </div>
              <div className="fullscreen-camera-fruit-banner">
                {fullscreenFruitNinjaState?.message}
              </div>
              {isFullscreenFruitNinjaMode &&
              fullscreenFruitNinjaState?.status === "gameover" ? (
                <div className="fullscreen-camera-fruit-gameover">Round Over</div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "sky-patrol" ? (
            <div
              className="fullscreen-camera-sky-patrol"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              <canvas
                ref={fullscreenSkyPatrolCanvasRef}
                className="fullscreen-camera-sky-patrol-canvas"
              />
              {fullscreenSkyPatrolHud?.incomingIndicators?.map((indicator) => (
                <div
                  key={indicator.id}
                  className={`fullscreen-camera-sky-patrol-incoming-indicator ${indicator.kind}`}
                  style={{ left: `${indicator.x}px` }}
                >
                  <span />
                </div>
              ))}
              <div className="fullscreen-camera-sky-patrol-scoreboard">
                {fullscreenSkyPatrolHudItems.map((item) => (
                  <span key={item.id} className={`fullscreen-camera-sky-patrol-hud-chip ${item.id}`}>
                    {item.id === "fire" ? (
                      <span
                        className={`fullscreen-camera-sky-patrol-fire-ring ${
                          fullscreenSkyPatrolFireCooldownUi.ready ? "ready" : "reloading"
                        }`}
                        style={{
                          "--sky-patrol-fire-progress": fullscreenSkyPatrolFireCooldownUi.progress,
                        }}
                      />
                    ) : null}
                    <span className="fullscreen-camera-sky-patrol-hud-label">{item.label}</span>
                    {item.id === "lives" ? (
                      <span className="fullscreen-camera-sky-patrol-life-icons">
                        {fullscreenSkyPatrolLifeIcons.map((iconState, index) => (
                          <span
                            key={`sky-patrol-life-${index}`}
                            className={`fullscreen-camera-sky-patrol-life-icon ${iconState}`}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="fullscreen-camera-sky-patrol-hud-value">{item.value}</span>
                    )}
                  </span>
                ))}
              </div>
              <div
                className={`fullscreen-camera-sky-patrol-gun-meter ${fullscreenSkyPatrolGunCooldownUi.state}`}
                style={{
                  "--sky-patrol-gun-fill": fullscreenSkyPatrolGunCooldownUi.fill,
                }}
              >
                <span className="fullscreen-camera-sky-patrol-gun-meter-label">Guns</span>
                <span className="fullscreen-camera-sky-patrol-gun-meter-track">
                  <span className="fullscreen-camera-sky-patrol-gun-meter-fill" />
                </span>
                <span className="fullscreen-camera-sky-patrol-gun-meter-state">
                  {fullscreenSkyPatrolGunCooldownUi.stateLabel}
                </span>
                {fullscreenSkyPatrolGunCooldownUi.cooldownLabel ? (
                  <span className="fullscreen-camera-sky-patrol-gun-meter-timer">
                    {fullscreenSkyPatrolGunCooldownUi.cooldownLabel}
                  </span>
                ) : null}
              </div>
              {fullscreenSkyPatrolHud?.radarBlips?.length ? (
                <div className="fullscreen-camera-sky-patrol-radar" aria-hidden="true">
                  <span className="fullscreen-camera-sky-patrol-radar-sweep" />
                  {fullscreenSkyPatrolHud.radarBlips.map((blip) => (
                    <span
                      key={blip.id}
                      className={`fullscreen-camera-sky-patrol-radar-blip ${blip.role}`}
                      style={{
                        left: `${blip.xPct}%`,
                        top: `${blip.yPct}%`,
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {fullscreenSkyPatrolLegendUi.visible ? (
                <div
                  className={`fullscreen-camera-sky-patrol-legend ${
                    fullscreenSkyPatrolLegendUi.compact ? "compact" : ""
                  } ${fullscreenSkyPatrolLegendUi.faded ? "faded" : ""}`}
                >
                  {fullscreenSkyPatrolLegendUi.items.map((item) => (
                    <span
                      key={item.id}
                      className={`fullscreen-camera-sky-patrol-legend-chip ${item.role}`}
                    >
                      <span className="fullscreen-camera-sky-patrol-legend-symbol" />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </span>
                  ))}
                </div>
              ) : null}
              {fullscreenSkyPatrolGameOverUi.visible ? (
                <div className="fullscreen-camera-sky-patrol-banner game-over">
                  <span className="fullscreen-camera-sky-patrol-game-over-title">
                    {fullscreenSkyPatrolGameOverUi.title}
                  </span>
                  <span className="fullscreen-camera-sky-patrol-game-over-stats">
                    {fullscreenSkyPatrolGameOverUi.stats.map((stat) => (
                      <span key={stat.label}>
                        {stat.label} {stat.value}
                      </span>
                    ))}
                  </span>
                  <span className="fullscreen-camera-sky-patrol-game-over-restart">
                    {fullscreenSkyPatrolGameOverUi.restartText}
                  </span>
                </div>
              ) : fullscreenSkyPatrolStartPromptUi.visible ? (
                <div className="fullscreen-camera-sky-patrol-banner start-prompt">
                  <span className="fullscreen-camera-sky-patrol-start-title">
                    {fullscreenSkyPatrolStartPromptUi.title}
                  </span>
                  <span className="fullscreen-camera-sky-patrol-start-detail">
                    {fullscreenSkyPatrolStartPromptUi.detail}
                  </span>
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === WFC_WORLD_MODE_ID ? (
            <WfcWorldRenderer
              game={fullscreenWfcWorldState}
              style={fullscreenCameraViewport?.style ?? undefined}
              onMouseDown={handleFullscreenWfcWorldMouseDown}
              onMouseMove={handleFullscreenWfcWorldMouseMove}
              onMouseUp={stopFullscreenWfcWorldMouseInput}
              onMouseLeave={stopFullscreenWfcWorldMouseInput}
            />
          ) : fullscreenGridMode === "invaders" ? (
            <div
              className="fullscreen-camera-invaders"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenInvadersState?.enemies
                ?.filter((enemy) => enemy.alive)
                .map((enemy) => (
                  <div
                    key={enemy.id}
                    className="fullscreen-camera-invaders-enemy"
                    style={{
                      left: `${enemy.x}px`,
                      top: `${enemy.y}px`,
                      width: `${enemy.width}px`,
                      height: `${enemy.height}px`,
                    }}
                  />
                ))}
              {fullscreenInvadersState?.playerShots?.map((shot) => (
                <div
                  key={shot.id}
                  className="fullscreen-camera-invaders-shot player"
                  style={{
                    left: `${shot.x}px`,
                    top: `${shot.y}px`,
                    width: `${shot.width}px`,
                    height: `${shot.height}px`,
                  }}
                />
              ))}
              {fullscreenInvadersState?.enemyShots?.map((shot) => (
                <div
                  key={shot.id}
                  className="fullscreen-camera-invaders-shot enemy"
                  style={{
                    left: `${shot.x}px`,
                    top: `${shot.y}px`,
                    width: `${shot.width}px`,
                    height: `${shot.height}px`,
                  }}
                />
              ))}
              {fullscreenInvadersState?.ship && (
                <div
                  className="fullscreen-camera-invaders-ship"
                  style={{
                    left: `${fullscreenInvadersState.ship.x - fullscreenInvadersState.ship.width / 2}px`,
                    top: `${fullscreenInvadersState.ship.y - fullscreenInvadersState.ship.height / 2}px`,
                    width: `${fullscreenInvadersState.ship.width}px`,
                    height: `${fullscreenInvadersState.ship.height}px`,
                  }}
                />
              )}
              <div className="fullscreen-camera-invaders-scoreboard">
                <span>Score {fullscreenInvadersState?.score ?? 0}</span>
                <span>
                  Enemies {fullscreenInvadersState?.enemies?.filter((enemy) => enemy.alive).length ?? 0}
                </span>
                <span>Status {fullscreenInvadersState?.status ?? "idle"}</span>
              </div>
              <div className="fullscreen-camera-invaders-legend">
                <span>Enemy +{SPACE_INVADERS_ENEMY_SCORE}</span>
                <span>Pinch fires</span>
                <span>Pinch after loss restarts</span>
              </div>
              {isFullscreenInvadersMode &&
              shouldShowFullscreenInvadersBanner(fullscreenInvadersState) ? (
                <div className="fullscreen-camera-invaders-banner">
                  {fullscreenInvadersState.message}
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "flappy" ? (
            <div
              className="fullscreen-camera-flappy"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              {fullscreenFlappyState?.pipes?.map((pipe) => (
                <div key={pipe.id}>
                  <div
                    className="fullscreen-camera-flappy-pipe"
                    style={{
                      left: `${pipe.x}px`,
                      top: "0px",
                      width: `${pipe.width}px`,
                      height: `${pipe.gapTop}px`,
                    }}
                  />
                  <div
                    className="fullscreen-camera-flappy-pipe"
                    style={{
                      left: `${pipe.x}px`,
                      top: `${pipe.gapTop + pipe.gapHeight}px`,
                      width: `${pipe.width}px`,
                      height: `${Math.max(
                        0,
                        (fullscreenFlappyState?.layout?.playfieldHeight ?? 0) -
                          (pipe.gapTop + pipe.gapHeight),
                      )}px`,
                    }}
                  />
                </div>
              ))}
              <div
                className="fullscreen-camera-flappy-bird"
                style={{
                  left: `${(fullscreenFlappyState?.bird?.x ?? 0) - (fullscreenFlappyState?.bird?.radius ?? 0)}px`,
                  top: `${(fullscreenFlappyState?.bird?.y ?? 0) - (fullscreenFlappyState?.bird?.radius ?? 0)}px`,
                  width: `${(fullscreenFlappyState?.bird?.radius ?? 0) * 2}px`,
                  height: `${(fullscreenFlappyState?.bird?.radius ?? 0) * 2}px`,
                  transform: `rotate(${fullscreenFlappyState?.bird?.rotation ?? 0}deg)`,
                }}
              />
              <div
                className="fullscreen-camera-flappy-ground"
                style={{ height: `${fullscreenFlappyState?.layout?.groundHeight ?? 0}px` }}
              />
              <div className="fullscreen-camera-flappy-scoreboard">
                <span>Score {fullscreenFlappyState?.score ?? 0}</span>
                <span>Status {fullscreenFlappyState?.status ?? "ready"}</span>
              </div>
              <div className="fullscreen-camera-flappy-legend">
                <span>Pinch = flap</span>
                <span>Pass a gap = +1</span>
              </div>
              {isFullscreenFlappyMode && fullscreenFlappyState?.message ? (
                <div className="fullscreen-camera-flappy-banner">
                  {fullscreenFlappyState.message}
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "missile-command" ? (
            <div
              className={getMissileCommandSceneClassName()}
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              <div className="fullscreen-camera-missile-skyline" />
              <div
                className="fullscreen-camera-missile-ground"
                style={{ top: `${fullscreenMissileCommandState?.layout.groundY ?? 0}px` }}
              />
              {fullscreenMissileTargetWarnings.map((warning) => (
                <div
                  key={`missile-target-warning-${warning.structureId}`}
                  className={warning.className}
                  style={{
                    left: `${warning.x}px`,
                    top: `${warning.y}px`,
                    width: `${warning.width * 1.62}px`,
                    height: `${warning.height * 1.62}px`,
                  }}
                >
                  {warning.threatCount > 1 ? (
                    <span className="fullscreen-camera-missile-target-warning-count">
                      {warning.threatCount}
                    </span>
                  ) : null}
                </div>
              ))}
              {fullscreenMissileCommandState?.structures?.map((structure) => {
                const structureUi = getMissileCommandStructureUi(structure, {
                  selectedLaunchBaseId: fullscreenMissileLaunchPreview?.originStructureId,
                });
                return (
                  <div
                    key={structure.id}
                    className={structureUi.className}
                    style={{
                      left: `${structure.x - structure.width / 2}px`,
                      top: `${structure.y - structure.height}px`,
                      width: `${structure.width}px`,
                      height: `${structure.height}px`,
                    }}
                  >
                    {structureUi.showSmoke ? (
                      <span className="fullscreen-camera-missile-structure-smoke" />
                    ) : null}
                    {structureUi.fragments.map((fragment) => (
                      <span
                        key={fragment.id}
                        className={`fullscreen-camera-missile-rubble-fragment ${fragment.className}`}
                      />
                    ))}
                  </div>
                );
              })}
              {fullscreenMissileLaunchPreview ? (
                <div
                  className="fullscreen-camera-missile-launch-preview"
                  style={{
                    left: `${fullscreenMissileLaunchPreview.originX}px`,
                    top: `${fullscreenMissileLaunchPreview.originY}px`,
                    width: `${fullscreenMissileLaunchPreview.distance}px`,
                    transform: `rotate(${fullscreenMissileLaunchPreview.angleRad}rad)`,
                  }}
                />
              ) : null}
              {fullscreenMissileCommandState?.threats?.map((threat) => {
                const threatUi = getMissileCommandThreatUi(threat);
                return (
                  <div key={threat.id}>
                    <div
                      className={threatUi.trailClassName}
                      style={{
                        left: `${threat.startX}px`,
                        top: `${threat.startY}px`,
                        width: `${Math.hypot(threat.x - threat.startX, threat.y - threat.startY)}px`,
                        transform: `rotate(${Math.atan2(
                          threat.y - threat.startY,
                          threat.x - threat.startX,
                        )}rad)`,
                      }}
                    />
                    <div
                      className={threatUi.headClassName}
                      style={{
                        left: `${threat.x}px`,
                        top: `${threat.y}px`,
                      }}
                    />
                  </div>
                );
              })}
              {fullscreenMissileCommandState?.interceptors?.map((interceptor) => {
                const interceptorUi = getMissileCommandInterceptorUi();
                return (
                  <div key={interceptor.id}>
                    <div
                      className={interceptorUi.trailClassName}
                      style={{
                        left: `${interceptor.originX}px`,
                        top: `${interceptor.originY}px`,
                        width: `${Math.hypot(
                          interceptor.x - interceptor.originX,
                          interceptor.y - interceptor.originY,
                        )}px`,
                        transform: `rotate(${Math.atan2(
                          interceptor.y - interceptor.originY,
                          interceptor.x - interceptor.originX,
                        )}rad)`,
                      }}
                    />
                    <div
                      className={interceptorUi.headClassName}
                      style={{
                        left: `${interceptor.x}px`,
                        top: `${interceptor.y}px`,
                      }}
                    />
                  </div>
                );
              })}
              {fullscreenMissileCommandState?.explosions?.map((explosion) => {
                const radius = getMissileCommandExplosionRadius(explosion);
                const explosionUi = getMissileCommandExplosionUi(explosion);
                return (
                  <div
                    key={explosion.id}
                    className={explosionUi.className}
                    style={{
                      left: `${explosion.x - radius}px`,
                      top: `${explosion.y - radius}px`,
                      width: `${radius * 2}px`,
                      height: `${radius * 2}px`,
                      borderColor: explosion.color,
                      boxShadow: `0 0 ${Math.max(18, radius * 0.7)}px ${explosion.color}`,
                    }}
                  >
                    <span
                      className="fullscreen-camera-missile-explosion-core"
                      style={{ opacity: explosionUi.coreOpacity }}
                    />
                    <span
                      className="fullscreen-camera-missile-explosion-shockwave"
                      style={{
                        opacity: explosionUi.shockwaveOpacity,
                        transform: `scale(${explosionUi.shockwaveScale})`,
                      }}
                    />
                  </div>
                );
              })}
              {fullscreenMissileCommandState?.scoreBursts?.map((burst) => {
                const progress = Math.min(1, burst.ageMs / Math.max(1, burst.durationMs));
                return (
                  <div
                    key={burst.id}
                    className="fullscreen-camera-missile-score-popup"
                    style={{
                      left: `${burst.x}px`,
                      top: `${burst.y - progress * 34}px`,
                      opacity: 1 - progress,
                    }}
                  >
                    +{burst.value}
                  </div>
                );
              })}
              {fullscreenMissileCrosshairUi.point ? (
                <div
                  className={fullscreenMissileCrosshairUi.className}
                  style={{
                    left: `${fullscreenMissileCrosshairUi.point.x}px`,
                    top: `${fullscreenMissileCrosshairUi.point.y}px`,
                    "--missile-cooldown-progress": fullscreenMissileCooldownUi.reloadProgress,
                  }}
                >
                  <span className="fullscreen-camera-missile-cooldown-ring" />
                  <span className="fullscreen-camera-missile-crosshair-label">
                    {fullscreenMissileCrosshairUi.label}
                  </span>
                </div>
              ) : null}
              <div className="fullscreen-camera-missile-scoreboard">
                {fullscreenMissileTacticalMetrics.items.map((item) => (
                  <span
                    key={item.id}
                    className={`fullscreen-camera-missile-score-item ${
                      item.id === "pressure" ? `pressure-${item.value}` : ""
                    }`}
                  >
                    <span className="fullscreen-camera-missile-score-label">{item.label}</span>
                    <span className="fullscreen-camera-missile-score-value">{item.value}</span>
                  </span>
                ))}
              </div>
              <div className="fullscreen-camera-missile-legend compact">
                {fullscreenMissileLegendItems.map((item) => (
                  <span key={item.id} className="fullscreen-camera-missile-legend-chip">
                    <span className="fullscreen-camera-missile-legend-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
              {isFullscreenMissileCommandMode &&
              fullscreenMissileCountdownUi.visible ? (
                <div className="fullscreen-camera-missile-banner countdown">
                  <span className="fullscreen-camera-missile-banner-title">
                    {fullscreenMissileCountdownUi.title}
                  </span>
                  <span className="fullscreen-camera-missile-banner-count">
                    {fullscreenMissileCountdownUi.seconds}
                  </span>
                  <span className="fullscreen-camera-missile-banner-structures">
                    {fullscreenMissileCountdownUi.structureIds.map((structureId) => (
                      <span key={structureId} />
                    ))}
                  </span>
                </div>
              ) : null}
              {isFullscreenMissileCommandMode && fullscreenMissileGameOverUi.visible ? (
                <div className="fullscreen-camera-missile-banner game-over">
                  <span className="fullscreen-camera-missile-game-over-title">
                    {fullscreenMissileGameOverUi.title}
                  </span>
                  <span className="fullscreen-camera-missile-game-over-stats">
                    {fullscreenMissileGameOverUi.stats.map((stat) => (
                      <span key={stat.label}>
                        {stat.label} {stat.value}
                      </span>
                    ))}
                  </span>
                  <span className="fullscreen-camera-missile-game-over-restart">
                    {fullscreenMissileGameOverUi.restartText}
                  </span>
                </div>
              ) : null}
            </div>
          ) : fullscreenGridMode === "virtual-piano" ? (
            <div
              className="fullscreen-camera-virtual-piano"
              style={fullscreenCameraViewport?.style ?? undefined}
            >
              <div className="fullscreen-camera-piano-keys-stage">
                <div className="fullscreen-camera-piano-keys-inner">
                  {fullscreenVirtualPianoState?.keys
                    ?.filter((key) => key.isWhite)
                    .map((key) => (
                      <div
                        key={key.id}
                        className={`fullscreen-camera-piano-white-key${key.pressed ? " pressed" : ""}`}
                        style={{
                          left: `${key.x}px`,
                          top: `${key.y}px`,
                          width: `${key.width}px`,
                          height: `${key.height}px`,
                        }}
                      >
                        {key.label ? (
                          <span className="fullscreen-camera-piano-key-label">{key.label}</span>
                        ) : null}
                      </div>
                    ))}
                  {fullscreenVirtualPianoState?.keys
                    ?.filter((key) => !key.isWhite)
                    .map((key) => (
                      <div
                        key={key.id}
                        className={`fullscreen-camera-piano-black-key${key.pressed ? " pressed" : ""}`}
                        style={{
                          left: `${key.x}px`,
                          top: `${key.y}px`,
                          width: `${key.width}px`,
                          height: `${key.height}px`,
                        }}
                      >
                        {key.label ? (
                          <span className="fullscreen-camera-piano-key-label">{key.label}</span>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
              {isFullscreenVirtualPianoMode
                ? fullscreenTipPoints
                    .filter((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y))
                    .map((pt) => {
                      const vx = pt.x - (fullscreenCameraViewport?.left ?? 0);
                      const vy = pt.y - (fullscreenCameraViewport?.top ?? 0);
                      const isOnKey = fullscreenVirtualPianoState?.keys?.some(
                        (k) =>
                          k.pressed &&
                          vx >= k.x &&
                          vx <= k.x + k.width &&
                          vy >= k.y &&
                          vy <= k.y + k.height,
                      );
                      return (
                        <div
                          key={pt.id}
                          className="fullscreen-camera-piano-finger-dot"
                          style={{
                            left: `${vx}px`,
                            top: `${vy}px`,
                            width: "22px",
                            height: "22px",
                            background: isOnKey
                              ? "rgba(100, 180, 255, 0.9)"
                              : "rgba(255, 255, 255, 0.55)",
                            boxShadow: isOnKey
                              ? "0 0 12px rgba(100, 180, 255, 0.7)"
                              : "0 0 6px rgba(255, 255, 255, 0.4)",
                          }}
                        />
                      );
                    })
                : null}
              <div className="fullscreen-camera-piano-hint">
                Lower your fingertips onto the keys to play
              </div>
            </div>
          ) : (
            <div className="fullscreen-camera-grid" style={fullscreenCameraGridMetrics?.style ?? undefined}>
              {fullscreenCameraGridMetrics?.outerRing?.map((cell) => (
                <div
                  key={`fullscreen-grid-outer-${cell.key}`}
                  className="fullscreen-camera-grid-outer-ring"
                  style={cell.style}
                />
              ))}
              {fullscreenCameraGridMetrics?.neighbors?.map((cell) => (
                <div
                  key={`fullscreen-grid-neighbor-${cell.key}`}
                  className="fullscreen-camera-grid-neighbor"
                  style={cell.style}
                />
              ))}
              {fullscreenCameraGridMetrics?.highlight?.map((cell) => (
                <div
                  key={`fullscreen-grid-highlight-${cell.key}`}
                  className="fullscreen-camera-grid-highlight"
                  style={cell.style}
                />
              ))}
            </div>
          )}

          {fullscreenRestartControlLabel && fullscreenRestartControlState?.layout ? (
            <div
              className={`fullscreen-camera-restart-box ${
                fullscreenRestartControlState.handVerified ? "" : "disabled"
              } ${fullscreenRestartControlState.holdActive ? "active" : ""}`}
              style={{
                left: `${
                  (fullscreenCameraViewport?.left ?? 0) + fullscreenRestartControlState.layout.left
                }px`,
                top: `${
                  (fullscreenCameraViewport?.top ?? 0) + fullscreenRestartControlState.layout.top
                }px`,
                width: `${fullscreenRestartControlState.layout.boxWidth}px`,
                height: `${fullscreenRestartControlState.layout.boxHeight}px`,
              }}
            >
              <span className="fullscreen-camera-restart-title">
                {fullscreenRestartControlLabel}
              </span>
              <span className="fullscreen-camera-restart-countdown">
                {fullscreenRestartControlState.handVerified &&
                fullscreenRestartControlState.holdActive
                  ? fullscreenRestartControlCountdown
                  : (FULLSCREEN_MODE_LANDING_HOLD_MS / 1000).toFixed(2)}
              </span>
              <span className="fullscreen-camera-restart-hint">
                {!fullscreenRestartControlState.handVerified
                  ? "Show 5 tips"
                  : fullscreenRestartControlState.holdActive
                  ? "Keep holding"
                  : "Hold to restart"}
              </span>
            </div>
          ) : null}

          {!isFullscreenModeLanding && fullscreenExitControlState?.layout ? (
            <div
              className={`fullscreen-camera-exit-box ${
                fullscreenExitControlState.handVerified ? "" : "disabled"
              } ${fullscreenExitControlState.holdActive ? "active" : ""}`}
              style={{
                left: `${
                  (fullscreenCameraViewport?.left ?? 0) + fullscreenExitControlState.layout.left
                }px`,
                top: `${
                  (fullscreenCameraViewport?.top ?? 0) + fullscreenExitControlState.layout.top
                }px`,
                width: `${fullscreenExitControlState.layout.boxWidth}px`,
                height: `${fullscreenExitControlState.layout.boxHeight}px`,
              }}
            >
              <span className="fullscreen-camera-exit-title">Exit</span>
              <span className="fullscreen-camera-exit-countdown">
                {fullscreenExitControlState.handVerified && fullscreenExitControlState.holdActive
                  ? fullscreenExitControlCountdown
                  : (FULLSCREEN_MODE_LANDING_HOLD_MS / 1000).toFixed(2)}
              </span>
              <span className="fullscreen-camera-exit-hint">
                {!fullscreenExitControlState.handVerified
                  ? "Show 5 tips"
                  : fullscreenExitControlState.holdActive
                  ? "Keep holding"
                  : "Hold to exit"}
              </span>
            </div>
          ) : null}

          <div className="fullscreen-camera-hud">
            {!isFullscreenModeLanding ? (
              <div className="fullscreen-camera-hud-bottom">
                <span className={`tracking-indicator fullscreen-camera-status ${handDetected ? "ok" : "warn"}`}>
                  {handDetected ? "Hand detected" : "Hand not detected"} | FPS: {fps.toFixed(1)}
                </span>
                <div className="fullscreen-camera-meta fullscreen-camera-actions">
                  <span className="fullscreen-camera-note">
                    {fullscreenGridMode === "breakout-coop"
                      ? `Breakout Co-op keeps index-finger steering on the paddle, uses support-hand pinch for a ${Math.round(BREAKOUT_COOP_SHIELD_DURATION_MS / 1000)} second shield pulse, and prism bricks split the ball while the shield recharges over about ${Math.round(BREAKOUT_COOP_SHIELD_COOLDOWN_MS / 1000)} seconds.`
                      : fullscreenGridMode === "hand-bounce"
                      ? "Hand Bounce turns your tracked palm into a bounce surface. The ball uses gravity-driven motion, rebounds off the side walls, and you only need to keep your hand under it."
                      : fullscreenGridMode === "brick-dodger"
                      ? "Brick Dodger uses the existing smoothed index-fingertip X position only. Drift across the full webcam overlay to dodge falling hazards, chase adjacent bonus pickups, and stretch the run as the descent speed ramps up."
                      : fullscreenGridMode === FIND_YOUR_GRIND_BREAKOUT_MODE_ID
                      ? "Find Your Grind Breakout uses small logo-colored bricks to spell the wordmark inside the blue frame, while the index fingertip steers the paddle like classic Breakout."
                      : fullscreenGridMode === "breakout"
                      ? `Index fingertip steers the paddle left and right. Bricks use the Rings palette, the launch countdown is ${BREAKOUT_COUNTDOWN_MS / 1000} seconds, and each capsule adds one extra ball.`
                      : fullscreenGridMode === "finger-pong"
                      ? `Finger Pong keeps the full webcam visible behind a one-player rally. Your bottom paddle follows smoothed horizontal fingertip motion, the opening countdown is ${FINGER_PONG_COUNTDOWN_MS / 1000} seconds, and off-center contacts steer the return angle while rallies gently speed up.`
                      : fullscreenGridMode === "tic-tac-toe"
                      ? "Tic Tac Toe locks the fullscreen camera to a single tracked hand, reuses the Minority Report hand-outline overlay, lays out New Board, O Rail, the board, and X Rail from left to right, clears the board after a 1.00 second index-fingertip hold, and gives O a random opening before switching to optimal play."
                      : fullscreenGridMode === "fruit-ninja"
                      ? "Fast index-fingertip swipes become blade trails. Slice bright fruit for combos, avoid dark bombs, and restart after three mistakes."
                      : fullscreenGridMode === "sky-patrol"
                      ? "Index fingertip steers a fighter across a vertically scrolling 16-bit coastline. Pinch fires twin cannons, air fighters weave in from above, ground emplacements ride the terrain below, and pinching after a loss relaunches the sortie."
                      : fullscreenGridMode === WFC_WORLD_MODE_ID
                      ? "Fingerprint Worlds lets you seed a fantasy map with pinched terrain rules, then Wave Function Collapse fills the rest while obeying the adjacency constraints."
                      : fullscreenGridMode === "invaders"
                      ? "Index fingertip steers the ship with the existing fullscreen smoothing. Pinch fires on a short cooldown, enemies descend in arcade sweeps, and pinch restarts the wave after a loss."
                      : fullscreenGridMode === "missile-command"
                      ? `Index fingertip aims. Pinch launches interceptors from the nearest surviving base, blasts stop threats in an area, and the pace ramps over time after the ${MISSILE_COMMAND_COUNTDOWN_MS / 1000}-second opening countdown.`
                      : fullscreenGridMode === "flappy"
                      ? "Flappy overlay uses pinch rising edges only. Each distinct pinch flaps once, holding a pinch does not retrigger, and pinching after a crash restarts the round."
                      : fullscreenGridMode === "virtual-piano"
                      ? "Virtual Piano renders a two-octave keyboard (C3–C5) across the bottom of the frame. Lower any fingertip into a key to play it — up to 10 simultaneous notes across both hands. Black keys take priority where they overlap white keys."
                      : "Camera fits the window without cropping. Press `Esc` to close."}
                  </span>
                </div>
              </div>
            ) : null}
            {(cameraError || modelError) && (
              <div className="fullscreen-camera-errors">
                {cameraError && <p className="error-text">{cameraError}</p>}
                {modelError && <p className="error-text">{modelError}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isMinorityReportLabPhase) {
    return (
      <div className="app fullscreen-camera-app minority-report-app">
        <MinorityReportLab
          immersive
          cameraAspectRatio={cameraAspectRatio}
          cameraObjectFit={cameraObjectFit}
          cameraOverlayRef={overlayCanvasRef}
          cameraStageRef={cameraWrapRef}
          cameraVideoRef={videoRef}
          cameraError={cameraError}
          modelError={modelError}
          fps={fps}
          engineOutput={labEngineOutput}
          eventLog={labEventLog}
          detectionStatus={{
            handsCount: labEngineOutput.hands.length,
            inferenceBusy: inferenceBusyRef.current,
            handDetected,
          }}
          confidenceThreshold={labConfidenceThreshold}
          showSkeleton={labShowSkeleton}
          showTrails={labShowTrails}
          personalizationEnabled={labPersonalizationEnabled}
          onConfidenceThresholdChange={setLabConfidenceThreshold}
          onShowSkeletonChange={setLabShowSkeleton}
          onShowTrailsChange={setLabShowTrails}
          onPersonalizationEnabledChange={setLabPersonalizationEnabled}
          trainingState={labTrainingState}
          sampleCounts={labSampleCounts}
          onRecordGesture={startLabGestureRecording}
          onDeleteLastSample={deleteLastLabSample}
          onClearSamples={clearLabSamples}
          onExportSamples={exportLabSamples}
          onImportSamples={importLabSamples}
          onClearEventLog={clearLabEventLog}
          onBack={returnFromMinorityReportLab}
          onReset={startMinorityReportLab}
        />
      </div>
    );
  }

  const navigationLocked = !cameraReady || !modelReady || isCalibrating || isArcCalibrating;
  const offAxisNavigationLocked = !cameraReady || isCalibrating || isArcCalibrating;
  const showWorkspaceNav = shouldShowWorkspaceNav(phase);
  const contentGridClassName = `content-grid ${
    isCalibrationLayoutPhase && !isBodyPosePhase ? "calibration-layout" : ""
  } ${isBodyPosePhase ? "body-layout" : ""} ${showLeftPaneResizer ? "resizable-layout" : ""}`;
  const contentGridStyle = showLeftPaneResizer
    ? {
        "--left-pane-resizer-width": `${RESIZABLE_LEFT_PANE_HANDLE_WIDTH_PX}px`,
        ...(leftPaneWidth !== null
          ? { "--left-pane-column": `${Math.round(leftPaneWidth)}px` }
          : {}),
      }
    : undefined;
  const leftPaneResizerValueNow = showLeftPaneResizer
    ? Math.round(getMeasuredLeftPaneWidth())
    : undefined;
  const leftPaneResizerValueMax = showLeftPaneResizer ? Math.round(getMaxLeftPaneWidth()) : undefined;
  const activePhaseName =
    phase === PHASES.CALIBRATION
      ? "Calibration Input Test"
      : phase === PHASES.SANDBOX
      ? "Pinch Sandbox"
      : phase === PHASES.FLIGHT
      ? "Star Flight"
      : phase === PHASES.RUNNER
      ? "Track Runner"
      : phase === PHASES.BODY_POSE
      ? "Body Pose Lab"
      : phase === PHASES.OFF_AXIS_LAB
      ? "Off-Axis Forest Walk"
      : phase === PHASES.CONVEYOR
      ? "Conveyor Toss"
      : phase === PHASES.ROULETTE
      ? "Roulette Table"
      : phase === PHASES.MINORITY_REPORT_LAB
      ? "Minority Report Lab"
      : phase === PHASES.SPATIAL_GESTURE_MEMORY
      ? "Spatial Gesture Memory"
      : phase === PHASES.GESTURE_ANALYTICS_LAB
      ? "Gesture Analytics Lab"
      : phase === PHASES.GESTURE_ART_LAB
      ? "Gesture Art Lab"
      : phase === PHASES.GESTURE_CONTROL_OS
      ? "Gesture Control OS"
      : "Whack-a-Mole";
  const activePhaseSummary =
    phase === PHASES.CALIBRATION
      ? "Start here for setup, camera checks, and quick access to every mode."
      : phase === PHASES.SANDBOX
      ? "A focused pinch-and-drag test area for verifying direct manipulation."
      : phase === PHASES.FLIGHT
      ? "Five-finger steering playground with quick reset controls."
      : phase === PHASES.RUNNER
      ? "Track-switching runner with streamlined access back to the hub."
      : phase === PHASES.BODY_POSE
      ? "Whole-body tracking mode with pose-specific readiness details."
      : phase === PHASES.OFF_AXIS_LAB
      ? "Head-pose forest scene that uses pose-only tracking instead of hand readiness."
      : phase === PHASES.CONVEYOR
      ? "Throwing sandbox kept separate from the main navigation clusters."
      : phase === PHASES.ROULETTE
      ? "Table game entry kept distinct from the motion experiment labs."
      : phase === PHASES.MINORITY_REPORT_LAB
      ? "Multi-hand interaction lab with training and event logging tools."
      : phase === PHASES.SPATIAL_GESTURE_MEMORY
      ? "Memory challenge with next-round and reset actions kept up front."
      : phase === PHASES.GESTURE_ANALYTICS_LAB
      ? "Analysis workspace for reviewing live gesture features and performance."
      : phase === PHASES.GESTURE_ART_LAB
      ? "Creative canvas mode with a cleaner way to move between labs and games."
      : phase === PHASES.GESTURE_CONTROL_OS
      ? "Desktop simulation mode grouped under labs instead of ad hoc buttons."
      : "Core game mode with calibration and alternate experiences available from the sidebar.";

  const currentModeActions =
    phase === PHASES.CALIBRATION
      ? [
          {
            label: isCalibrating ? "Restart Calibration" : "Start Calibration",
            onClick: beginCalibration,
            disabled: !cameraReady || !modelReady || isArcCalibrating,
          },
          {
            label: isArcCalibrating
              ? "Restart Lazy Arc Calibration"
              : "Start Lazy Arc Calibration",
            onClick: beginArcCalibration,
            secondary: true,
            disabled: !cameraReady || !modelReady || isCalibrating,
          },
          {
            label: "Reset Input Test",
            onClick: () => resetCalibrationInputTests("manual_button"),
            secondary: true,
          },
          {
            label: "Open Pinch Sandbox",
            onClick: openSandboxScreen,
            secondary: true,
            disabled: navigationLocked,
          },
          {
            label: "Open Fullscreen Camera",
            onClick: openFullscreenCameraScreen,
            secondary: true,
            disabled: navigationLocked,
          },
          {
            label: "Open Circle of Fifths Page",
            onClick: openCircleOfFifthsPage,
            secondary: true,
            disabled: navigationLocked,
          },
          {
            label: "Open Off-Axis Forest Walk",
            onClick: startOffAxisLab,
            secondary: true,
            disabled: offAxisNavigationLocked,
          },
        ]
      : isSandboxPhase
      ? [
          { label: "Back to Input Test", onClick: returnToCalibrationInputTest },
          {
            label: "Reset Blocks",
            onClick: () => resetSandboxBlocks("manual_button"),
            secondary: true,
          },
        ]
      : phase === PHASES.FLIGHT
      ? [
          { label: "Back to Input Test", onClick: returnFromFlightSession },
          {
            label: "Re-center Hand Pose",
            onClick: () => resetFlightNeutral("manual_button"),
            secondary: true,
          },
          {
            label: "Reset Flight Scene",
            onClick: () => resetFlightSession("manual_button"),
            secondary: true,
          },
        ]
      : phase === PHASES.RUNNER
      ? [
          { label: "Back to Input Test", onClick: returnFromRunnerSession },
          {
            label: "Reset Runner",
            onClick: () => resetRunnerSession("manual_button"),
            secondary: true,
          },
        ]
      : phase === PHASES.BODY_POSE
      ? [
          { label: "Back to Input Test", onClick: returnFromBodyPoseLab },
          { label: "Restart Body Pose Lab", onClick: startBodyPoseLab, secondary: true },
        ]
      : phase === PHASES.OFF_AXIS_LAB
      ? [
          { label: "Back to Input Test", onClick: returnFromOffAxisLab },
          { label: "Restart Forest Walk", onClick: startOffAxisLab, secondary: true },
        ]
      : phase === PHASES.CONVEYOR
      ? [
          { label: "Back to Input Test", onClick: returnFromConveyorSession },
          { label: "Restart Conveyor Toss", onClick: startConveyorSession, secondary: true },
        ]
      : phase === PHASES.ROULETTE
      ? [{ label: "Back to Input Test", onClick: returnFromRouletteSession }]
      : phase === PHASES.MINORITY_REPORT_LAB
      ? [
          { label: "Back to Input Test", onClick: returnFromMinorityReportLab },
          { label: "Reset Lab Session", onClick: startMinorityReportLab, secondary: true },
        ]
      : phase === PHASES.SPATIAL_GESTURE_MEMORY
      ? [
          { label: "Back to Input Test", onClick: returnFromSpatialGestureMemorySession },
          { label: "Next Round", onClick: startSpatialGestureMemoryRound, secondary: true },
          { label: "Reset Spatial Memory", onClick: resetSpatialGestureMemory, secondary: true },
        ]
      : phase === PHASES.GESTURE_ANALYTICS_LAB
      ? [
          { label: "Back to Input Test", onClick: returnFromGestureAnalyticsLab },
          { label: "Reset Analytics Lab", onClick: startGestureAnalyticsLab, secondary: true },
        ]
      : phase === PHASES.GESTURE_ART_LAB
      ? [
          { label: "Back to Input Test", onClick: returnFromGestureArtLab },
          { label: "Restart Gesture Art Lab", onClick: startGestureArtLab, secondary: true },
        ]
      : phase === PHASES.GESTURE_CONTROL_OS
      ? [
          { label: "Back to Input Test", onClick: returnFromGestureControlOS },
          { label: "Restart Gesture Control OS", onClick: startGestureControlOS, secondary: true },
        ]
      : [
          {
            label: gameRunning ? "Restart Game" : "Start Game",
            onClick: startGameSession,
            disabled: !hasSavedCalibration,
          },
          { label: "Recalibrate", onClick: handleRecalibrate, secondary: true },
        ];

  const navigationSections = [
    {
      title: "Core",
      description: "Setup and shared spaces live together at the top of the sidebar.",
      items: [
        {
          label: "Input Test",
          onClick: returnToCalibrationInputTest,
          active: phase === PHASES.CALIBRATION,
        },
        {
          label: "Pinch Sandbox",
          onClick: openSandboxScreen,
          active: phase === PHASES.SANDBOX,
          disabled: navigationLocked,
        },
        {
          label: "Fullscreen Camera",
          onClick: openFullscreenCameraScreen,
          disabled: navigationLocked,
        },
        {
          label: "Whack-a-Mole",
          onClick: startGameSession,
          active: phase === PHASES.GAME,
          disabled: navigationLocked || !hasSavedCalibration,
        },
      ],
    },
    {
      title: "Games",
      description: "Game modes are grouped separately from labs so the page reads faster.",
      items: [
        {
          label: "Runner",
          onClick: startRunnerSession,
          active: phase === PHASES.RUNNER,
          disabled: navigationLocked,
        },
        {
          label: "Flight",
          onClick: startFlightSession,
          active: phase === PHASES.FLIGHT,
          disabled: navigationLocked,
        },
        {
          label: "Conveyor Toss",
          onClick: startConveyorSession,
          active: phase === PHASES.CONVEYOR,
          disabled: navigationLocked,
        },
        {
          label: "Roulette",
          onClick: startRouletteSession,
          active: phase === PHASES.ROULETTE,
          disabled: navigationLocked,
        },
        {
          label: "Spatial Memory",
          onClick: startSpatialGestureMemorySession,
          active: phase === PHASES.SPATIAL_GESTURE_MEMORY,
          disabled: navigationLocked,
        },
      ],
    },
    {
      title: "Labs",
      description: "Experimental workspaces now sit in one consistent navigation group.",
      items: [
        {
          label: "Body Pose",
          onClick: startBodyPoseLab,
          active: phase === PHASES.BODY_POSE,
          disabled: navigationLocked,
        },
        {
          label: "Off-Axis Forest Walk",
          onClick: startOffAxisLab,
          active: phase === PHASES.OFF_AXIS_LAB,
          disabled: offAxisNavigationLocked,
        },
        {
          label: "Minority Report",
          onClick: startMinorityReportLab,
          active: phase === PHASES.MINORITY_REPORT_LAB,
          disabled: navigationLocked,
        },
        {
          label: "Gesture Analytics",
          onClick: startGestureAnalyticsLab,
          active: phase === PHASES.GESTURE_ANALYTICS_LAB,
          disabled: navigationLocked,
        },
        {
          label: "Gesture Art",
          onClick: startGestureArtLab,
          active: phase === PHASES.GESTURE_ART_LAB,
          disabled: navigationLocked,
        },
        {
          label: "Gesture Control OS",
          onClick: startGestureControlOS,
          active: phase === PHASES.GESTURE_CONTROL_OS,
          disabled: navigationLocked,
        },
      ],
    },
  ];

  return (
    <div className="app">
      <header className="top-bar">
        <div className="top-bar-title-group">
          <h1>Finger Tracking Game</h1>
          <p className="top-bar-subtitle">
            Cleaner navigation with one home for setup, games, and labs.
          </p>
        </div>
        <div className="phase-pill">{activePhaseName}</div>
        <div className={`tracking-indicator ${handDetected ? "ok" : "warn"}`}>
          {phase === PHASES.BODY_POSE || phase === PHASES.OFF_AXIS_LAB
            ? handDetected
              ? "Pose detected"
              : "Pose not detected"
            : handDetected
            ? "Hand detected"
            : "Hand not detected"}{" "}
          | FPS: {fps.toFixed(1)}
        </div>
      </header>

      <div className={contentGridClassName} ref={contentGridRef} style={contentGridStyle}>
        <section className="card camera-card" ref={cameraPaneRef}>
          <div className="camera-preview-panel">
            <h2>{cameraPanelTitle}</h2>
            {showInlineCameraPreview ? (
              <div
                className="camera-wrap"
                ref={cameraWrapRef}
                style={{ aspectRatio: String(cameraAspectRatio) }}
              >
                <video
                  ref={videoRef}
                  className="camera-video"
                  style={{ objectFit: cameraObjectFit }}
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={overlayCanvasRef} className="camera-overlay" />
              </div>
            ) : null}
          </div>

          <div className="camera-support-panel">
            <p className="help-text">Hold one hand up.</p>
            <p className="help-text">
              {phase === PHASES.RUNNER
                ? "Use your INDEX tip to steer the runner."
                : phase === PHASES.BODY_POSE
                ? "Body mode: keep head, shoulders, elbows, and wrists in view."
                : phase === PHASES.OFF_AXIS_LAB
                ? "Forest walk mode: keep your nose and both eyes visible, then lean to look around trees."
                : phase === PHASES.MINORITY_REPORT_LAB
                ? "In lab mode, thumb tips drive pointers."
                : phase === PHASES.GESTURE_ART_LAB
                ? "Index fingertip controls the primary art attractor in real time."
                : phase === PHASES.GESTURE_CONTROL_OS
                ? "Pinch focuses and moves windows while the gesture engine manages desktop actions."
                : "Use your THUMB tip as the pointer."}
            </p>
            <p className="help-text">
              {phase === PHASES.RUNNER
                ? "Pinch is disabled in runner mode."
                : phase === PHASES.BODY_POSE
                ? "No pinch input needed; pose keypoints are highlighted directly."
                : phase === PHASES.OFF_AXIS_LAB
                ? "No pinch input needed; head movement shifts the off-axis forest path."
                : phase === PHASES.MINORITY_REPORT_LAB
                ? "Pinch to grab/release. Swipes/push/circle and two-hand gestures trigger lab actions."
                : phase === PHASES.CONVEYOR
                ? "Pinch to grab spheres, then release to throw. Faster flicks add speed."
                : phase === PHASES.GESTURE_ART_LAB
                ? "One hand draws, two hands warp, circle clears, and push toggles freeze."
                : phase === PHASES.GESTURE_CONTROL_OS
                ? "Pinch drags windows, swipes switch desktops, and open-palm hold opens the window menu."
                : 'Pinch (thumb + index) to "click".'}
            </p>

            <div className="status-row">
              <span>Camera: {cameraReady ? "ready" : "waiting"}</span>
              <span>Model: {modelReady ? "ready" : "loading"}</span>
              {(phase === PHASES.BODY_POSE || phase === PHASES.OFF_AXIS_LAB) && (
                <span>Pose model: {poseModelReady ? "ready" : "loading"}</span>
              )}
              <span>Runtime: {activeRuntime}</span>
              <span>Backend: {activeBackend}</span>
              {phase !== PHASES.BODY_POSE && phase !== PHASES.OFF_AXIS_LAB && (
                <span>Pinch: {pinchActive ? "active" : "idle"}</span>
              )}
            </div>

            {cameraError && <p className="error-text">{cameraError}</p>}
            {modelError && <p className="error-text">{modelError}</p>}
            {(phase === PHASES.BODY_POSE || phase === PHASES.OFF_AXIS_LAB) && poseModelError && (
              <p className="error-text">{poseModelError}</p>
            )}

            {showWorkspaceNav && (
              <div className="workspace-nav">
                <div className="workspace-summary">
                  <span className="workspace-summary-label">Current workspace</span>
                  <h3>{activePhaseName}</h3>
                  <p className="small-text">{activePhaseSummary}</p>
                  <p className="small-text">{calibrationMessage}</p>
                  <p className="small-text">
                    {phase === PHASES.CALIBRATION
                      ? isArcCalibrating
                        ? `Lazy Arc Confidence: ${Math.round(arcCalibrationProgress * 100)}% (${arcCalibrationSamples} valid frames)`
                        : `Captured points: ${calibrationPairsCount}/${calibrationTargets.length}${
                            isCalibrating
                              ? ` | Sampling: ${calibrationSampleFrames}/${CALIBRATION_SAMPLE_FRAMES}`
                              : ""
                          }`
                      : phase === PHASES.SANDBOX
                      ? "Pinch over a block to grab it. Keep pinching to drag, then release to fling."
                      : phase === PHASES.FLIGHT
                      ? `Steering uses all five fingertips. Neutral baseline: ${
                          flightHud.baselineReady
                            ? "locked"
                            : `${flightHud.baselineSamples}/${FLIGHT_BASELINE_SAMPLE_TARGET}`
                        }.`
                      : phase === PHASES.BODY_POSE
                      ? "Body pose mode tracks head, eyes, shoulders, arms, torso, and webcam overlays."
                      : phase === PHASES.OFF_AXIS_LAB
                      ? "Off-axis mode uses your nose and both eyes to drive a layered forest scene while holding the last transform through short pose dropouts."
                      : phase === PHASES.CONVEYOR
                      ? "Pinch to grab a sphere, then release to throw. Faster flicks add launch speed."
                      : phase === PHASES.MINORITY_REPORT_LAB
                      ? "One-hand pinch grabs panels, two-hand pinch transforms the stage, and gestures log events."
                      : phase === PHASES.GESTURE_ART_LAB
                      ? "Index attractor, pinch thickness, openness palette, wrist hue, and two-hand warp stay active."
                      : phase === PHASES.GESTURE_CONTROL_OS
                      ? "Pinch drags windows, swipes switch desktops, and open-palm hold opens contextual menu actions."
                      : "4x4 track control: move hand across the camera view to pick any converging track."}
                  </p>
                </div>

                <div className="workspace-actions">
                  <h3>Mode actions</h3>
                  <div className="workspace-action-grid">
                    {currentModeActions.map((action) => (
                      <button
                        key={action.label}
                        className={action.secondary ? "secondary" : ""}
                        type="button"
                        onClick={action.onClick}
                        disabled={action.disabled}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {navigationSections.map((section) => (
                  <section key={section.title} className="workspace-nav-section">
                    <div className="workspace-nav-section-heading">
                      <h3>{section.title}</h3>
                      <p className="small-text">{section.description}</p>
                    </div>
                    <div className="workspace-nav-grid">
                      {section.items.map((item) => (
                        <button
                          key={item.label}
                          className={item.active ? "nav-button active" : "nav-button secondary"}
                          type="button"
                          onClick={item.onClick}
                          disabled={item.disabled || item.active}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <label className="debug-toggle">
              <input
                type="checkbox"
                checked={debugEnabled}
                onChange={(event) => setDebugEnabled(event.target.checked)}
              />
              Debug overlay
            </label>
            <div className="button-row">
              <button
                className="secondary"
                type="button"
                disabled={!modelReady}
                onClick={() => logTrackingExtentsSnapshot("manual_button")}
              >
                Log Tracking Extents
              </button>
            </div>
          </div>
        </section>

        {showLeftPaneResizer && (
          <div
            aria-label="Resize camera pane"
            aria-orientation="vertical"
            aria-valuemax={leftPaneResizerValueMax}
            aria-valuemin={RESIZABLE_LEFT_PANE_MIN_WIDTH_PX}
            aria-valuenow={leftPaneResizerValueNow}
            className={`content-grid-resizer ${isLeftPaneResizing ? "active" : ""}`}
            onKeyDown={handleLeftPaneResizerKeyDown}
            onPointerDown={handleLeftPaneResizerPointerDown}
            role="separator"
            tabIndex={0}
            title="Drag to resize the camera pane"
          />
        )}

        {phase === PHASES.CALIBRATION ? (
          <section className="card panel calibration-panel">
            <h2>Calibration Input Test</h2>
            <p className="small-text">
              Primary target area: hover any box, then pinch while hovering to verify gesture
              input behavior.
            </p>

            <div className="input-test-panel input-test-primary">
              <div className="input-test-stage" ref={inputTestStageRef}>
                <div
                  className="input-test-grid"
                  style={{
                    width: `${inputTestGridSize.width}px`,
                    height: `${inputTestGridSize.height}px`,
                    "--input-test-grid-gap": `${INPUT_TEST_CELL_GAP}px`,
                    "--input-test-grid-cols": String(INPUT_TEST_GRID_COLS),
                    "--input-test-grid-rows": String(INPUT_TEST_GRID_ROWS),
                  }}
                >
                  {Array.from({ length: INPUT_TEST_CELL_COUNT }, (_, cellIndex) => {
                    const isHovered = inputTestHoveredCell === cellIndex;
                    const isPinching = inputTestPinchingCell === cellIndex;
                    return (
                      <div
                        key={cellIndex}
                        ref={(element) => {
                          inputTestCellRefs.current[cellIndex] = element;
                        }}
                        className={`input-test-cell ${
                          isPinching ? "pinching" : isHovered ? "hovered" : ""
                        }`}
                      >
                        <span>{cellIndex + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <h3>Input Test</h3>
              <p className="small-text">
                Move over any of the {INPUT_TEST_CELL_COUNT} cells to see hover color. Keep
                hovering and pinch to switch to the red pinch color.
              </p>
              <p className="small-text">
                Hovered cell: {inputTestHoveredCell >= 0 ? inputTestHoveredCell + 1 : "none"} |
                Pinch: {pinchActive ? "active" : "idle"}
              </p>
            </div>
          </section>
        ) : isSandboxPhase ? (
          <section className="card panel sandbox-panel">
            <h2>Pinch Drag Sandbox</h2>
            <p className="small-text">
              Hover over a block and pinch to grab it. Move while pinching, then release to fling.
            </p>
            <p className="small-text">
              Two steel blocks (lower bounce) and two rubber blocks (higher bounce).
            </p>

            <div className="sandbox-panel-body">
              <div className="sandbox-stage" ref={sandboxStageRef}>
                {sandboxBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`sandbox-block ${block.material} ${
                      sandboxGrabbedBlockId === block.id ? "grabbed" : ""
                    }`}
                    style={{
                      left: `${block.x}px`,
                      top: `${block.y}px`,
                      width: `${block.size}px`,
                      height: `${block.size}px`,
                      background: block.color,
                    }}
                  >
                    <span>{block.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="small-text">
              Blocks: {sandboxBlocks.length} | Grabbed:{" "}
              {sandboxGrabbedBlockId !== null ? sandboxGrabbedBlockId : "none"} | Pinch:{" "}
              {pinchActive ? "active" : "idle"}
            </p>
          </section>
        ) : phase === PHASES.FLIGHT ? (
          <section className="card panel flight-panel">
            <h2>Star Flight</h2>
            <p className="small-text">
              Third-person flight at constant speed. Move all five fingertips to steer.
            </p>
            <p className="small-text">
              Shift hand left/right for yaw, up/down for pitch, and rotate hand for roll.
            </p>

            <div className="flight-stage" ref={flightStageRef}>
              <canvas className="flight-canvas" ref={flightCanvasRef} />
              <div className="flight-hud">
                <span>Yaw: {(flightHud.yaw * 100).toFixed(0)}%</span>
                <span>Pitch: {(flightHud.pitch * 100).toFixed(0)}%</span>
                <span>Roll: {(flightHud.roll * 100).toFixed(0)}%</span>
                <span>Control: {(flightHud.confidence * 100).toFixed(0)}%</span>
                <span>
                  Neutral:{" "}
                  {flightHud.baselineReady
                    ? "locked"
                    : `${flightHud.baselineSamples}/${FLIGHT_BASELINE_SAMPLE_TARGET}`}
                </span>
                <span>Distance: {flightHud.distance.toFixed(0)} u</span>
              </div>
            </div>

          </section>
        ) : phase === PHASES.RUNNER ? (
          <section className="card panel runner-panel">
            <h2>Track Runner</h2>
            <p className="small-text">
              4x4 converging-track runner: move hand to switch tracks in both directions.
            </p>
            <p className="small-text">
              Collect coins on your selected track.
            </p>

            <div className="runner-stage" ref={runnerStageRef}>
              <canvas className="runner-canvas" ref={runnerCanvasRef} />
              <div className="runner-hud">
                <span>Coins: {runnerHud.coins}</span>
                <span>Distance: {runnerHud.distance.toFixed(0)} u</span>
                <span>Track: C{runnerHud.trackCol}/R{runnerHud.trackRow}</span>
                <span>Node gap: {runnerHud.trackSpacingPx.toFixed(1)} px</span>
              </div>
            </div>

          </section>
        ) : phase === PHASES.CONVEYOR ? (
          <ConveyorSphereGame
            cursor={cursor}
            pinchActive={pinchActive}
            onBack={returnFromConveyorSession}
          />
        ) : phase === PHASES.ROULETTE ? (
          <RouletteFingerGame
            cursor={cursor}
            pinchActive={pinchActive}
            onBack={returnFromRouletteSession}
          />
        ) : phase === PHASES.BODY_POSE ? (
          <BodyPoseLab poseStatus={poseStatus} />
        ) : phase === PHASES.OFF_AXIS_LAB ? (
          <OffAxisChamberLab poseStatus={poseStatus} />
        ) : phase === PHASES.MINORITY_REPORT_LAB ? (
          <MinorityReportLab
            cameraAspectRatio={cameraAspectRatio}
            cameraObjectFit={cameraObjectFit}
            cameraOverlayRef={overlayCanvasRef}
            cameraStageRef={cameraWrapRef}
            cameraVideoRef={videoRef}
            fps={fps}
            engineOutput={labEngineOutput}
            eventLog={labEventLog}
            detectionStatus={{
              handsCount: labEngineOutput.hands.length,
              inferenceBusy: inferenceBusyRef.current,
              handDetected,
            }}
            confidenceThreshold={labConfidenceThreshold}
            showSkeleton={labShowSkeleton}
            showTrails={labShowTrails}
            personalizationEnabled={labPersonalizationEnabled}
            onConfidenceThresholdChange={setLabConfidenceThreshold}
            onShowSkeletonChange={setLabShowSkeleton}
            onShowTrailsChange={setLabShowTrails}
            onPersonalizationEnabledChange={setLabPersonalizationEnabled}
            trainingState={labTrainingState}
            sampleCounts={labSampleCounts}
            onRecordGesture={startLabGestureRecording}
            onDeleteLastSample={deleteLastLabSample}
            onClearSamples={clearLabSamples}
            onExportSamples={exportLabSamples}
            onImportSamples={importLabSamples}
            onClearEventLog={clearLabEventLog}
          />
        ) : phase === PHASES.SPATIAL_GESTURE_MEMORY ? (
          <SpatialGestureMemory
            state={spatialMemoryState}
            onStart={startSpatialGestureMemoryRound}
            onReset={resetSpatialGestureMemory}
          />
        ) : phase === PHASES.GESTURE_ANALYTICS_LAB ? (
          <GestureAnalyticsLab
            key={gestureAnalyticsLabSessionKey}
            liveHands={analyticsHands}
            liveTimestamp={analyticsTimestamp}
            fps={fps}
          />
        ) : phase === PHASES.GESTURE_ART_LAB ? (
          <GestureArtLab
            key={gestureArtSessionKey}
            hands={gestureArtHands}
            fps={fps}
            handDetected={handDetected}
          />
        ) : phase === PHASES.GESTURE_CONTROL_OS ? (
          <GestureControlOS
            key={gestureControlOSSessionKey}
            fps={fps}
            engineOutput={labEngineOutput}
            eventLog={labEventLog}
            detectionStatus={{
              handsCount: labEngineOutput.hands.length,
              inferenceBusy: inferenceBusyRef.current,
              handDetected,
            }}
            confidenceThreshold={labConfidenceThreshold}
            showSkeleton={labShowSkeleton}
            showTrails={labShowTrails}
            personalizationEnabled={labPersonalizationEnabled}
            onConfidenceThresholdChange={setLabConfidenceThreshold}
            onShowSkeletonChange={setLabShowSkeleton}
            onShowTrailsChange={setLabShowTrails}
            onPersonalizationEnabledChange={setLabPersonalizationEnabled}
            trainingState={labTrainingState}
            sampleCounts={labSampleCounts}
            onRecordGesture={startLabGestureRecording}
            onDeleteLastSample={deleteLastLabSample}
            onClearSamples={clearLabSamples}
            onExportSamples={exportLabSamples}
            onImportSamples={importLabSamples}
            onClearEventLog={clearLabEventLog}
          />
        ) : (
          <section className="card panel">
            <h2>Whack-a-Mole</h2>
            <div className="stats-grid">
              <div>
                <strong>Score</strong>
                <span>{score}</span>
              </div>
              <div>
                <strong>Time</strong>
                <span>{timeLeft}s</span>
              </div>
              <div>
                <strong>Tracking</strong>
                <span>{handDetected ? "yes" : "no"}</span>
              </div>
            </div>


            <div className="game-board" ref={boardRef}>
              {holes.map((hole) => (
                <div
                  key={hole.index}
                  className="hole"
                  style={{
                    left: `${hole.x}px`,
                    top: `${hole.y}px`,
                    width: `${hole.r * 2.5}px`,
                    height: `${hole.r * 1.6}px`,
                  }}
                />
              ))}

              {activeMoleIndex !== null && holes[activeMoleIndex] && (
                <div
                  className="mole"
                  style={{
                    left: `${holes[activeMoleIndex].x}px`,
                    top: `${holes[activeMoleIndex].y - holes[activeMoleIndex].r * 0.45}px`,
                    width: `${holes[activeMoleIndex].r * 1.5}px`,
                    height: `${holes[activeMoleIndex].r * 1.5}px`,
                  }}
                />
              )}
            </div>
          </section>
        )}
      </div>

      {phase !== PHASES.MINORITY_REPORT_LAB &&
        phase !== PHASES.GESTURE_ANALYTICS_LAB &&
        phase !== PHASES.BODY_POSE &&
        phase !== PHASES.SPATIAL_GESTURE_MEMORY &&
        phase !== PHASES.GESTURE_ART_LAB &&
        phase !== PHASES.GESTURE_CONTROL_OS &&
        renderTrackedCursorLayer()}

      {phase === PHASES.CALIBRATION && isCalibrating && currentTarget && (
        <div className="calibration-layer">
          <div
            className="target-ring"
            style={{
              left: `${currentTarget.x}px`,
              top: `${currentTarget.y}px`,
            }}
          />
          <div
            className="target-dot"
            style={{
              left: `${currentTarget.x}px`,
              top: `${currentTarget.y}px`,
            }}
          />
          <div className="target-caption">
            Target {calibrationTargetIndex + 1}/{calibrationTargets.length} ({currentTarget.label})
          </div>
        </div>
      )}
    </div>
  );
}
