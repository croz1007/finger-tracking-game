import { createScopedLogger } from "./logger.js";

const breakoutLog = createScopedLogger("breakoutGame");

export const BREAKOUT_COUNTDOWN_MS = 3_000;
export const BREAKOUT_BRICK_SCORE = 100;
export const BREAKOUT_CAPSULE_SCORE = 200;
export const BREAKOUT_BRICK_COLORS = ["#ff0000", "#ff8d00", "#ffdb00", "#00d619", "#009fff"];
export const FIND_YOUR_GRIND_BREAKOUT_MODE_ID = "find-your-grind-breakout";
export const FIND_YOUR_GRIND_LOGO_COLORS = {
  blue: "#2a5eff",
  red: "#ff011f",
  orange: "#ff931a",
};

const BREAKOUT_BRICK_ROWS = 5;
const BREAKOUT_BRICK_COLUMNS = 10;
const BREAKOUT_MAX_STEP_SECONDS = 1 / 120;
const BREAKOUT_PADDLE_LERP_PER_SECOND = 14;
const BREAKOUT_LAUNCH_SPEED_RATIO = 0.42;
const BREAKOUT_EXTRA_BALL_SPEED_RATIO = 0.45;
const BREAKOUT_CAPSULE_SPEED_RATIO = 0.22;
const FIND_YOUR_GRIND_LOGO_ASPECT_RATIO = 576 / 398;
const FIND_YOUR_GRIND_LETTER_GAP_COLUMNS = 1;

const FIND_YOUR_GRIND_GLYPHS = {
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
};

const FIND_YOUR_GRIND_HOUSE_MARK = ["00100", "01110", "11111", "11111"];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createIdFactory(start = 1) {
  let next = start;
  return () => next++;
}

export function createBreakoutLayout(width, height) {
  const safeWidth = Math.max(320, Number.isFinite(width) ? width : 320);
  const safeHeight = Math.max(240, Number.isFinite(height) ? height : 240);
  const sidePadding = clamp(safeWidth * 0.08, 22, 96);
  const topPadding = clamp(safeHeight * 0.12, 62, 110);
  const brickGap = clamp(Math.min(safeWidth, safeHeight) * 0.009, 4, 10);
  const brickHeight = clamp(safeHeight * 0.05, 24, 38);
  const brickWidth =
    (safeWidth - sidePadding * 2 - brickGap * (BREAKOUT_BRICK_COLUMNS - 1)) /
    BREAKOUT_BRICK_COLUMNS;
  const paddleWidth = clamp(safeWidth * 0.18, 120, 220);
  const paddleHeight = clamp(safeHeight * 0.022, 14, 22);
  const paddleY = safeHeight - clamp(safeHeight * 0.11, 52, 86);
  const ballRadius = clamp(Math.min(safeWidth, safeHeight) * 0.013, 8, 12);

  return {
    width: safeWidth,
    height: safeHeight,
    sidePadding,
    topPadding,
    brickGap,
    brickWidth,
    brickHeight,
    paddleWidth,
    paddleHeight,
    paddleY,
    ballRadius,
    capsuleWidth: ballRadius * 2.2,
    capsuleHeight: ballRadius * 3,
    ballLaunchSpeed: Math.max(180, safeHeight * BREAKOUT_LAUNCH_SPEED_RATIO),
    extraBallSpeed: Math.max(200, safeHeight * BREAKOUT_EXTRA_BALL_SPEED_RATIO),
    capsuleSpeed: Math.max(120, safeHeight * BREAKOUT_CAPSULE_SPEED_RATIO),
  };
}

export function assignBreakoutCapsuleDrops(bricks, rng = Math.random, desiredCount = null) {
  const safeBricks = Array.isArray(bricks) ? bricks : [];
  if (safeBricks.length === 0) {
    return [];
  }

  const targetCount = Number.isFinite(desiredCount)
    ? Math.round(desiredCount)
    : Math.max(1, Math.floor(safeBricks.length / 5));
  const selectedCount = clamp(targetCount, 0, safeBricks.length);
  const shuffledIndexes = safeBricks.map((_, index) => index);
  for (let index = shuffledIndexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffledIndexes[index], shuffledIndexes[swapIndex]] = [
      shuffledIndexes[swapIndex],
      shuffledIndexes[index],
    ];
  }

  const selected = new Set(shuffledIndexes.slice(0, selectedCount));
  return safeBricks.map((brick, index) => ({
    ...brick,
    dropsCapsule: selected.has(index),
  }));
}

export function createBreakoutBricks(layout, rng = Math.random) {
  const baseBricks = [];
  const createBrickId = createIdFactory(1);
  for (let row = 0; row < BREAKOUT_BRICK_ROWS; row += 1) {
    for (let column = 0; column < BREAKOUT_BRICK_COLUMNS; column += 1) {
      const x = layout.sidePadding + column * (layout.brickWidth + layout.brickGap);
      const y = layout.topPadding + row * (layout.brickHeight + layout.brickGap);
      baseBricks.push({
        id: `brick-${createBrickId()}`,
        row,
        column,
        x,
        y,
        width: layout.brickWidth,
        height: layout.brickHeight,
        color: BREAKOUT_BRICK_COLORS[row % BREAKOUT_BRICK_COLORS.length],
        destroyed: false,
        dropsCapsule: false,
      });
    }
  }
  return assignBreakoutCapsuleDrops(baseBricks, rng);
}

function getBitmapColumnCount(bitmap) {
  return bitmap.reduce((width, row) => Math.max(width, row.length), 0);
}

function getColumnSpanWidth(columnCount, cellSize, cellGap) {
  if (columnCount <= 0) {
    return 0;
  }
  return columnCount * cellSize + (columnCount - 1) * cellGap;
}

function getWordColumnCount(word) {
  return Array.from(word).reduce((columnCount, letter, index) => {
    const glyph = FIND_YOUR_GRIND_GLYPHS[letter];
    if (!glyph) {
      return columnCount;
    }
    return (
      columnCount +
      getBitmapColumnCount(glyph) +
      (index < word.length - 1 ? FIND_YOUR_GRIND_LETTER_GAP_COLUMNS : 0)
    );
  }, 0);
}

function addLogoBrick(bricks, createBrickId, { x, y, width, height, color, role }) {
  bricks.push({
    id: `find-your-grind-${createBrickId()}`,
    row: null,
    column: null,
    x,
    y,
    width,
    height,
    color,
    role,
    destroyed: false,
    dropsCapsule: false,
  });
}

function addBitmapBricks(bricks, createBrickId, { bitmap, left, top, cellSize, cellGap, color, role }) {
  const pitch = cellSize + cellGap;
  bitmap.forEach((row, rowIndex) => {
    Array.from(row).forEach((pixel, columnIndex) => {
      if (pixel !== "1") {
        return;
      }
      addLogoBrick(bricks, createBrickId, {
        x: left + columnIndex * pitch,
        y: top + rowIndex * pitch,
        width: cellSize,
        height: cellSize,
        color,
        role,
      });
    });
  });
}

function addWordBricks(bricks, createBrickId, { word, left, top, cellSize, cellGap, color }) {
  const pitch = cellSize + cellGap;
  let columnOffset = 0;
  for (const letter of word) {
    const glyph = FIND_YOUR_GRIND_GLYPHS[letter];
    if (!glyph) {
      continue;
    }
    addBitmapBricks(bricks, createBrickId, {
      bitmap: glyph,
      left: left + columnOffset * pitch,
      top,
      cellSize,
      cellGap,
      color,
      role: "letter",
    });
    columnOffset += getBitmapColumnCount(glyph) + FIND_YOUR_GRIND_LETTER_GAP_COLUMNS;
  }
}

function addLogoBorderBricks(bricks, createBrickId, { left, top, width, height, cellSize, cellGap }) {
  const pitch = cellSize + cellGap;
  const right = left + width - cellSize;
  const bottom = top + height - cellSize;

  for (let x = left; x <= right + 0.5; x += pitch) {
    addLogoBrick(bricks, createBrickId, {
      x,
      y: top,
      width: cellSize,
      height: cellSize,
      color: FIND_YOUR_GRIND_LOGO_COLORS.blue,
      role: "border",
    });
    addLogoBrick(bricks, createBrickId, {
      x,
      y: bottom,
      width: cellSize,
      height: cellSize,
      color: FIND_YOUR_GRIND_LOGO_COLORS.blue,
      role: "border",
    });
  }

  for (let y = top + pitch; y <= bottom - pitch + 0.5; y += pitch) {
    addLogoBrick(bricks, createBrickId, {
      x: left,
      y,
      width: cellSize,
      height: cellSize,
      color: FIND_YOUR_GRIND_LOGO_COLORS.blue,
      role: "border",
    });
    addLogoBrick(bricks, createBrickId, {
      x: right,
      y,
      width: cellSize,
      height: cellSize,
      color: FIND_YOUR_GRIND_LOGO_COLORS.blue,
      role: "border",
    });
  }
}

export function createFindYourGrindBreakoutBricks(layout, rng = Math.random) {
  const frameTop = clamp(layout.height * 0.16, 96, 128);
  const maxFrameHeight = Math.max(120, layout.paddleY - frameTop - layout.ballRadius * 8);
  const frameHeight = Math.min(
    layout.height * 0.54,
    maxFrameHeight,
    (layout.width * 0.84) / FIND_YOUR_GRIND_LOGO_ASPECT_RATIO,
  );
  const frameWidth = frameHeight * FIND_YOUR_GRIND_LOGO_ASPECT_RATIO;
  const frameLeft = (layout.width - frameWidth) / 2;
  const cellSize = Math.floor(clamp(Math.min(frameWidth / 44, frameHeight / 31), 7, 15));
  const cellGap = Math.max(1, Math.round(cellSize * 0.14));
  const pitch = cellSize + cellGap;
  const lineHeight = getColumnSpanWidth(7, cellSize, cellGap);
  const lineGap = Math.round(cellSize * 1.3);
  const textBlockHeight = lineHeight * 3 + lineGap * 2;
  const textTop = frameTop + (frameHeight - textBlockHeight) / 2;
  const bricks = [];
  const createBrickId = createIdFactory(1);
  const lines = [
    { word: "FIND", color: FIND_YOUR_GRIND_LOGO_COLORS.blue, top: textTop },
    { word: "YOUR", color: FIND_YOUR_GRIND_LOGO_COLORS.red, top: textTop + lineHeight + lineGap },
    { word: "GRIND", color: FIND_YOUR_GRIND_LOGO_COLORS.orange, top: textTop + (lineHeight + lineGap) * 2 },
  ];

  addLogoBorderBricks(bricks, createBrickId, {
    left: frameLeft,
    top: frameTop,
    width: frameWidth,
    height: frameHeight,
    cellSize,
    cellGap,
  });

  for (const line of lines) {
    const wordColumnCount = getWordColumnCount(line.word);
    const markColumnCount =
      line.word === "GRIND" ? getBitmapColumnCount(FIND_YOUR_GRIND_HOUSE_MARK) : 0;
    const totalColumnCount =
      line.word === "GRIND"
        ? wordColumnCount + FIND_YOUR_GRIND_LETTER_GAP_COLUMNS + markColumnCount
        : wordColumnCount;
    const wordWidth = getColumnSpanWidth(totalColumnCount, cellSize, cellGap);
    const wordLeft = frameLeft + (frameWidth - wordWidth) / 2;
    addWordBricks(bricks, createBrickId, {
      word: line.word,
      left: wordLeft,
      top: line.top,
      cellSize,
      cellGap,
      color: line.color,
    });

    if (line.word === "GRIND") {
      const markLeft = wordLeft + getColumnSpanWidth(wordColumnCount, cellSize, cellGap) + pitch;
      const markTop =
        line.top + lineHeight - getColumnSpanWidth(FIND_YOUR_GRIND_HOUSE_MARK.length, cellSize, cellGap);
      addBitmapBricks(bricks, createBrickId, {
        bitmap: FIND_YOUR_GRIND_HOUSE_MARK,
        left: markLeft,
        top: markTop,
        cellSize,
        cellGap,
        color: FIND_YOUR_GRIND_LOGO_COLORS.blue,
        role: "mark",
      });
    }
  }

  return assignBreakoutCapsuleDrops(bricks, rng, Math.max(3, Math.floor(bricks.length / 28)));
}

function createStuckBall(layout, paddleX, ballId) {
  const radius = layout.ballRadius;
  return {
    id: `ball-${ballId}`,
    x: paddleX,
    y: layout.paddleY - layout.paddleHeight / 2 - radius - 4,
    vx: 0,
    vy: 0,
    radius,
    stuckToPaddle: true,
  };
}

function spawnBall(layout, x, y, vx, vy, ballId) {
  return {
    id: `ball-${ballId}`,
    x,
    y,
    vx,
    vy,
    radius: layout.ballRadius,
    stuckToPaddle: false,
  };
}

function launchBall(ball, layout, rng = Math.random) {
  const launchSpeed = layout.ballLaunchSpeed;
  const direction = rng() < 0.5 ? -1 : 1;
  const xRatio = 0.22 + rng() * 0.14;
  const vx = launchSpeed * xRatio * direction;
  const vy = -Math.sqrt(Math.max(launchSpeed * launchSpeed - vx * vx, launchSpeed * launchSpeed * 0.65));
  return {
    ...ball,
    vx,
    vy,
    stuckToPaddle: false,
  };
}

function intersectsRectCircle(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function getPaddleRect(layout, paddleX) {
  return {
    x: paddleX - layout.paddleWidth / 2,
    y: layout.paddleY - layout.paddleHeight / 2,
    width: layout.paddleWidth,
    height: layout.paddleHeight,
  };
}

function spawnCapsuleForBrick(brick, layout, capsuleId) {
  return {
    id: `capsule-${capsuleId}`,
    x: brick.x + brick.width / 2,
    y: brick.y + brick.height / 2,
    vy: layout.capsuleSpeed,
    width: layout.capsuleWidth,
    height: layout.capsuleHeight,
  };
}

function spawnExtraBall(layout, paddleX, sourceX, ballId) {
  const offsetRatio = clamp((sourceX - paddleX) / Math.max(1, layout.paddleWidth / 2), -1, 1);
  const speed = layout.extraBallSpeed;
  const vx = speed * offsetRatio * 0.95;
  const vy = -Math.sqrt(Math.max(speed * speed - vx * vx, speed * speed * 0.7));
  return spawnBall(
    layout,
    clamp(sourceX, layout.ballRadius, layout.width - layout.ballRadius),
    layout.paddleY - layout.paddleHeight / 2 - layout.ballRadius - 6,
    vx,
    vy,
    ballId,
  );
}

function createRoundReset(state) {
  const layout = state.layout;
  const ballId = state.nextBallId;
  return {
    ...state,
    paddle: {
      ...state.paddle,
      x: clamp(state.paddle.x, layout.paddleWidth / 2, layout.width - layout.paddleWidth / 2),
    },
    balls: [createStuckBall(layout, state.paddle.x, ballId)],
    capsules: [],
    status: "countdown",
    countdownMs: BREAKOUT_COUNTDOWN_MS,
    nextBallId: ballId + 1,
    message: "3",
  };
}

function createBreakoutState(layout, bricks, variant = "classic") {
  const paddleX = layout.width / 2;
  const state = {
    layout,
    paddle: {
      x: paddleX,
    },
    balls: [createStuckBall(layout, paddleX, 1)],
    capsules: [],
    bricks,
    score: 0,
    status: "countdown",
    countdownMs: BREAKOUT_COUNTDOWN_MS,
    nextBallId: 2,
    nextCapsuleId: 1,
    message: "3",
  };
  breakoutLog.info("Created breakout game state", {
    variant,
    width: layout.width,
    height: layout.height,
    brickCount: bricks.length,
  });
  return state;
}

export function createBreakoutGame(width, height, rng = Math.random) {
  const layout = createBreakoutLayout(width, height);
  return createBreakoutState(layout, createBreakoutBricks(layout, rng));
}

export function createFindYourGrindBreakoutGame(width, height, rng = Math.random) {
  const layout = createBreakoutLayout(width, height);
  return createBreakoutState(
    layout,
    createFindYourGrindBreakoutBricks(layout, rng),
    FIND_YOUR_GRIND_BREAKOUT_MODE_ID,
  );
}

export function stepBreakoutGame(state, dtSeconds, paddleTargetX, rng = Math.random) {
  if (!state?.layout) {
    return state;
  }

  const layout = state.layout;
  const safeDt = clamp(Number.isFinite(dtSeconds) ? dtSeconds : 0, 0, 0.05);
  const paddleBoundsMin = layout.paddleWidth / 2;
  const paddleBoundsMax = layout.width - layout.paddleWidth / 2;
  const desiredPaddleX = clamp(
    Number.isFinite(paddleTargetX) ? paddleTargetX : state.paddle.x,
    paddleBoundsMin,
    paddleBoundsMax,
  );
  const lerp = 1 - Math.exp(-BREAKOUT_PADDLE_LERP_PER_SECOND * safeDt);
  const paddleX = state.paddle.x + (desiredPaddleX - state.paddle.x) * lerp;
  const paddleRect = getPaddleRect(layout, paddleX);

  let nextState = {
    ...state,
    paddle: {
      x: paddleX,
    },
  };

  if (safeDt <= 0) {
    return nextState;
  }

  if (nextState.status === "cleared") {
    return {
      ...nextState,
      balls: nextState.balls.map((ball) =>
        ball.stuckToPaddle
          ? {
              ...ball,
              x: paddleX,
              y: layout.paddleY - layout.paddleHeight / 2 - ball.radius - 4,
            }
          : ball,
      ),
      message: "Cleared",
    };
  }

  if (nextState.status === "countdown") {
    const countdownMs = Math.max(0, nextState.countdownMs - safeDt * 1000);
    const launched = countdownMs <= 0;
    return {
      ...nextState,
      countdownMs,
      status: launched ? "playing" : "countdown",
      balls: nextState.balls.map((ball) =>
        ball.stuckToPaddle
          ? launched
            ? launchBall(
                {
                  ...ball,
                  x: paddleX,
                  y: layout.paddleY - layout.paddleHeight / 2 - ball.radius - 4,
                },
                layout,
                rng,
              )
            : {
                ...ball,
                x: paddleX,
                y: layout.paddleY - layout.paddleHeight / 2 - ball.radius - 4,
              }
          : ball,
      ),
      message: launched ? "" : String(Math.max(1, Math.ceil(countdownMs / 1000))),
    };
  }

  const subSteps = Math.max(1, Math.ceil(safeDt / BREAKOUT_MAX_STEP_SECONDS));
  const stepSeconds = safeDt / subSteps;
  const nextBricks = nextState.bricks.map((brick) => ({ ...brick }));
  const activeBalls = [];
  const nextCapsules = nextState.capsules.map((capsule) => ({ ...capsule }));
  let score = nextState.score;
  let nextBallId = nextState.nextBallId;
  let nextCapsuleId = nextState.nextCapsuleId;

  for (const originalBall of nextState.balls) {
    let ball = { ...originalBall };
    let removed = false;

    for (let stepIndex = 0; stepIndex < subSteps; stepIndex += 1) {
      ball.x += ball.vx * stepSeconds;
      ball.y += ball.vy * stepSeconds;

      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x + ball.radius >= layout.width) {
        ball.x = layout.width - ball.radius;
        ball.vx = -Math.abs(ball.vx);
      }

      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy);
      }

      if (
        ball.vy > 0 &&
        ball.x + ball.radius >= paddleRect.x &&
        ball.x - ball.radius <= paddleRect.x + paddleRect.width &&
        ball.y + ball.radius >= paddleRect.y &&
        ball.y - ball.radius <= paddleRect.y + paddleRect.height
      ) {
        const hitOffset = clamp((ball.x - paddleX) / Math.max(1, layout.paddleWidth / 2), -1, 1);
        const speed = Math.max(layout.ballLaunchSpeed, Math.hypot(ball.vx, ball.vy) * 1.02);
        ball.x = clamp(ball.x, paddleRect.x + ball.radius, paddleRect.x + paddleRect.width - ball.radius);
        ball.y = paddleRect.y - ball.radius - 0.5;
        ball.vx = speed * hitOffset * 0.95;
        ball.vy = -Math.sqrt(Math.max(speed * speed - ball.vx * ball.vx, speed * speed * 0.6));
      }

      const hitBrick = nextBricks.find(
        (brick) =>
          !brick.destroyed &&
          intersectsRectCircle(ball, {
            x: brick.x,
            y: brick.y,
            width: brick.width,
            height: brick.height,
          }),
      );

      if (hitBrick) {
        hitBrick.destroyed = true;
        score += BREAKOUT_BRICK_SCORE;

        const brickCenterX = hitBrick.x + hitBrick.width / 2;
        const brickCenterY = hitBrick.y + hitBrick.height / 2;
        const deltaX = ball.x - brickCenterX;
        const deltaY = ball.y - brickCenterY;
        const overlapX = hitBrick.width / 2 + ball.radius - Math.abs(deltaX);
        const overlapY = hitBrick.height / 2 + ball.radius - Math.abs(deltaY);
        if (overlapX < overlapY) {
          ball.vx = deltaX >= 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx);
        } else {
          ball.vy = deltaY >= 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
        }

        if (hitBrick.dropsCapsule) {
          nextCapsules.push(spawnCapsuleForBrick(hitBrick, layout, nextCapsuleId));
          nextCapsuleId += 1;
        }
      }

      if (ball.y - ball.radius > layout.height) {
        removed = true;
        break;
      }
    }

    if (!removed) {
      activeBalls.push(ball);
    }
  }

  const liveCapsules = [];
  for (const capsule of nextCapsules) {
    capsule.y += capsule.vy * safeDt;
    const capsuleRect = {
      x: capsule.x - capsule.width / 2,
      y: capsule.y - capsule.height / 2,
      width: capsule.width,
      height: capsule.height,
    };
    const catchesCapsule =
      capsuleRect.x + capsuleRect.width >= paddleRect.x &&
      capsuleRect.x <= paddleRect.x + paddleRect.width &&
      capsuleRect.y + capsuleRect.height >= paddleRect.y &&
      capsuleRect.y <= paddleRect.y + paddleRect.height;

    if (catchesCapsule) {
      score += BREAKOUT_CAPSULE_SCORE;
      activeBalls.push(spawnExtraBall(layout, paddleX, capsule.x, nextBallId));
      nextBallId += 1;
      continue;
    }

    if (capsuleRect.y <= layout.height) {
      liveCapsules.push(capsule);
    }
  }

  if (nextBricks.every((brick) => brick.destroyed)) {
    return {
      ...nextState,
      bricks: nextBricks,
      balls: activeBalls,
      capsules: [],
      score,
      nextBallId,
      nextCapsuleId,
      status: "cleared",
      countdownMs: 0,
      message: "Cleared",
    };
  }

  if (activeBalls.length === 0) {
    return createRoundReset({
      ...nextState,
      bricks: nextBricks,
      balls: [],
      capsules: [],
      score,
      nextBallId,
      nextCapsuleId,
      status: "playing",
      countdownMs: 0,
      message: "",
    });
  }

  return {
    ...nextState,
    bricks: nextBricks,
    balls: activeBalls,
    capsules: liveCapsules,
    score,
    nextBallId,
    nextCapsuleId,
    status: "playing",
    countdownMs: 0,
    message: "",
  };
}
