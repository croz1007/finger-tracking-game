import { createScopedLogger } from "./logger.js";

const ticTacToeLog = createScopedLogger("ticTacToeGame");

export const TIC_TAC_TOE_PLAYER_MARK = "X";
export const TIC_TAC_TOE_AI_MARK = "O";
export const TIC_TAC_TOE_AI_MOVE_DELAY_MS = 680;
export const TIC_TAC_TOE_PLAYER_PIECE_LIMIT = 5;
export const TIC_TAC_TOE_AI_PIECE_LIMIT = 4;
export const TIC_TAC_TOE_RESET_HOLD_MS = 1000;
export const TIC_TAC_TOE_LAYOUT_SCALE = 1.75;

const MAX_STEP_SECONDS = 0.05;
const PLAYER_PROMPT = "Pinch an X on the X Rail and drag it into an open square";
const DRAG_PROMPT = "Release over an open square";
const INVALID_DROP_PROMPT = "Open squares only. Grab another X from the X Rail";
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function countMarks(board, mark) {
  return Array.isArray(board) ? board.filter((cell) => cell === mark).length : 0;
}

function hasBoardMarks(board) {
  return Array.isArray(board) && board.some(Boolean);
}

function getOpenCellIndexes(board) {
  return Array.isArray(board)
    ? board.flatMap((cell, index) => (cell ? [] : [index]))
    : [];
}

function getMovePreference(index) {
  if (index === 4) {
    return 0;
  }
  if (index === 0 || index === 2 || index === 6 || index === 8) {
    return 1;
  }
  return 2;
}

function isPlayableBoard(board) {
  return Array.isArray(board) && board.length === 9;
}

function normalizePointer(layout, input) {
  const hasFinitePoint =
    Number.isFinite(input?.pointerX) &&
    Number.isFinite(input?.pointerY) &&
    Boolean(layout);

  if (!hasFinitePoint) {
    return {
      active: false,
      x: 0,
      y: 0,
    };
  }

  return {
    active: input?.pointerActive !== false,
    x: clamp(input.pointerX, 0, layout.width),
    y: clamp(input.pointerY, 0, layout.height),
  };
}

function createEmptyBoard() {
  return Array(9).fill(null);
}

function buildRoundState(layout, stats = {}) {
  return {
    layout,
    board: createEmptyBoard(),
    status: "player-turn",
    message: stats.message ?? PLAYER_PROMPT,
    draggingPiece: null,
    hoverCellIndex: -1,
    previewCellIndex: -1,
    winningLine: null,
    lastMoveIndex: -1,
    aiMoveTimerMs: 0,
    resetHoldActive: false,
    resetHoldMs: 0,
    previousPinchActive: false,
    nextPieceId: 1,
    playerWins: Number.isFinite(stats.playerWins) ? stats.playerWins : 0,
    aiWins: Number.isFinite(stats.aiWins) ? stats.aiWins : 0,
    draws: Number.isFinite(stats.draws) ? stats.draws : 0,
  };
}

function isRoundOver(state) {
  return state?.status === "player-win" || state?.status === "ai-win" || state?.status === "draw";
}

function getResolvedRoundState(state, board, mark, cellIndex) {
  const evaluation = evaluateTicTacToeBoard(board);

  if (evaluation.winner === TIC_TAC_TOE_PLAYER_MARK) {
    return {
      ...state,
      board,
      status: "player-win",
      message: "You win the board",
      winningLine: evaluation.line,
      lastMoveIndex: cellIndex,
      previewCellIndex: -1,
      hoverCellIndex: -1,
      draggingPiece: null,
      aiMoveTimerMs: 0,
      resetHoldActive: false,
      resetHoldMs: 0,
      playerWins: state.playerWins + 1,
    };
  }

  if (evaluation.winner === TIC_TAC_TOE_AI_MARK) {
    return {
      ...state,
      board,
      status: "ai-win",
      message: "O closes the line",
      winningLine: evaluation.line,
      lastMoveIndex: cellIndex,
      previewCellIndex: -1,
      hoverCellIndex: -1,
      draggingPiece: null,
      aiMoveTimerMs: 0,
      resetHoldActive: false,
      resetHoldMs: 0,
      aiWins: state.aiWins + 1,
    };
  }

  if (evaluation.draw) {
    return {
      ...state,
      board,
      status: "draw",
      message: "Draw board",
      winningLine: null,
      lastMoveIndex: cellIndex,
      previewCellIndex: -1,
      hoverCellIndex: -1,
      draggingPiece: null,
      aiMoveTimerMs: 0,
      resetHoldActive: false,
      resetHoldMs: 0,
      draws: state.draws + 1,
    };
  }

  if (mark === TIC_TAC_TOE_PLAYER_MARK) {
    return {
      ...state,
      board,
      status: "ai-turn",
      message: "O is thinking...",
      winningLine: null,
      lastMoveIndex: cellIndex,
      previewCellIndex: -1,
      hoverCellIndex: -1,
      draggingPiece: null,
      aiMoveTimerMs: TIC_TAC_TOE_AI_MOVE_DELAY_MS,
      resetHoldActive: false,
      resetHoldMs: 0,
    };
  }

  return {
    ...state,
    board,
    status: "player-turn",
    message: PLAYER_PROMPT,
    winningLine: null,
    lastMoveIndex: cellIndex,
    previewCellIndex: -1,
    hoverCellIndex: -1,
    draggingPiece: null,
    aiMoveTimerMs: 0,
    resetHoldActive: false,
    resetHoldMs: 0,
  };
}

function isPointerOnPlayerRail(layout, pointer) {
  if (!layout || !pointer?.active) {
    return false;
  }

  const dx = pointer.x - layout.playerRailCenterX;
  const dy = pointer.y - (layout.playerRailCenterY ?? layout.trayCenterY);
  const radiusX = (layout.playerRailWidth ?? layout.railWidth) * 0.45;
  const radiusY = layout.activePieceSize * 0.72;
  if (radiusX <= 0 || radiusY <= 0) {
    return false;
  }

  return dx * dx / (radiusX * radiusX) + dy * dy / (radiusY * radiusY) <= 1;
}

function createDraggingPiece(layout, pointer, pieceId) {
  return {
    id: `player-piece-${pieceId}`,
    x: clamp(pointer.x, layout.activePieceSize / 2, layout.width - layout.activePieceSize / 2),
    y: clamp(pointer.y, layout.activePieceSize / 2, layout.height - layout.activePieceSize / 2),
    size: layout.activePieceSize,
  };
}

function updateDraggingPiece(layout, draggingPiece, pointer) {
  if (!layout || !draggingPiece) {
    return draggingPiece;
  }

  if (!pointer?.active) {
    return draggingPiece;
  }

  return {
    ...draggingPiece,
    x: clamp(pointer.x, layout.activePieceSize / 2, layout.width - layout.activePieceSize / 2),
    y: clamp(pointer.y, layout.activePieceSize / 2, layout.height - layout.activePieceSize / 2),
  };
}

function isPointerInResetBox(layout, pointer) {
  if (!layout || !pointer?.active) {
    return false;
  }

  return (
    pointer.x >= layout.resetBoxLeft &&
    pointer.x <= layout.resetBoxLeft + layout.resetBoxWidth &&
    pointer.y >= layout.resetBoxTop &&
    pointer.y <= layout.resetBoxTop + layout.resetBoxHeight
  );
}

function scoreTerminalBoard(board, aiMark, playerMark, depth) {
  const evaluation = evaluateTicTacToeBoard(board);
  if (evaluation.winner === aiMark) {
    return 10 - depth;
  }
  if (evaluation.winner === playerMark) {
    return depth - 10;
  }
  if (evaluation.draw) {
    return 0;
  }
  return null;
}

function minimax(board, aiMark, playerMark, aiTurn, depth) {
  const terminalScore = scoreTerminalBoard(board, aiMark, playerMark, depth);
  if (terminalScore !== null) {
    return terminalScore;
  }

  const openCellIndexes = getOpenCellIndexes(board);
  if (aiTurn) {
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const cellIndex of openCellIndexes) {
      const nextBoard = [...board];
      nextBoard[cellIndex] = aiMark;
      bestScore = Math.max(bestScore, minimax(nextBoard, aiMark, playerMark, false, depth + 1));
    }
    return bestScore;
  }

  let bestScore = Number.POSITIVE_INFINITY;
  for (const cellIndex of openCellIndexes) {
    const nextBoard = [...board];
    nextBoard[cellIndex] = playerMark;
    bestScore = Math.min(bestScore, minimax(nextBoard, aiMark, playerMark, true, depth + 1));
  }
  return bestScore;
}

function pickRandomTicTacToeMove(board) {
  const openCellIndexes = getOpenCellIndexes(board);
  if (openCellIndexes.length === 0) {
    return -1;
  }

  const randomIndex = Math.floor(Math.random() * openCellIndexes.length);
  return openCellIndexes[randomIndex];
}

function pickAiTicTacToeMove(
  board,
  aiMark = TIC_TAC_TOE_AI_MARK,
  playerMark = TIC_TAC_TOE_PLAYER_MARK,
) {
  if (countMarks(board, aiMark) === 0) {
    return pickRandomTicTacToeMove(board);
  }

  return pickBestTicTacToeMove(board, aiMark, playerMark);
}

export function createTicTacToeLayout(width, height) {
  const safeWidth = Math.max(320, Number.isFinite(width) ? width : 320);
  const safeHeight = Math.max(440, Number.isFinite(height) ? height : 440);
  const minimumPlayableBoardSize = 180;
  const edgePadding = clamp(safeWidth * 0.032 * TIC_TAC_TOE_LAYOUT_SCALE, 14, 42);
  const railGap = clamp(safeWidth * 0.022 * TIC_TAC_TOE_LAYOUT_SCALE, 10, 34);

  if (safeHeight >= safeWidth * 1.15) {
    const railHeight = clamp(safeHeight * 0.088, 56, 96);
    const resetBoxHeight = clamp(safeHeight * 0.095, 64, 112);
    const boardMaxWidth = safeWidth - edgePadding * 2;
    const boardMaxHeight =
      safeHeight - edgePadding * 2 - railHeight * 2 - resetBoxHeight - railGap * 3;
    const resolvedBoardMaxWidth = Math.max(
      minimumPlayableBoardSize,
      Math.min(boardMaxWidth, boardMaxHeight),
    );
    const boardMinSize = Math.min(240, resolvedBoardMaxWidth);
    const boardSize = clamp(resolvedBoardMaxWidth, boardMinSize, 560);
    const cellSize = boardSize / 3;
    const railWidth = Math.min(boardSize, safeWidth - edgePadding * 2);
    const activePieceSize = Math.min(
      clamp(cellSize * 0.72, 44, 104),
      railHeight * 0.72,
    );
    const reservePieceSize = clamp(activePieceSize * 0.8, 32, 78);
    const reserveStepX = clamp(activePieceSize * 0.92, 42, 96);
    const reserveStepY = reserveStepX;
    const boardLeft = (safeWidth - boardSize) / 2;
    const playerRailLeft = (safeWidth - railWidth) / 2;
    const playerRailTop = edgePadding;
    const boardTop = playerRailTop + railHeight + railGap;
    const aiRailLeft = playerRailLeft;
    const aiRailTop = boardTop + boardSize + railGap;
    const resetBoxWidth = clamp(boardSize * 0.46, 124, Math.min(180, railWidth));
    const resetBoxLeft = (safeWidth - resetBoxWidth) / 2;
    const resetBoxTop = clamp(
      aiRailTop + railHeight + railGap,
      edgePadding,
      safeHeight - edgePadding - resetBoxHeight,
    );
    const playerRailCenterX = playerRailLeft + railWidth / 2;
    const playerRailCenterY = playerRailTop + railHeight / 2;
    const aiRailCenterX = aiRailLeft + railWidth / 2;
    const aiRailCenterY = aiRailTop + railHeight / 2;

    return {
      width: safeWidth,
      height: safeHeight,
      layoutMode: "portrait-trays",
      boardLeft,
      boardTop,
      boardSize,
      cellSize,
      cellInset: clamp(cellSize * 0.1, 10, 28),
      activePieceSize,
      reservePieceSize,
      reserveStepX,
      reserveStepY,
      reserveAxis: "x",
      railWidth,
      railHeight,
      railTop: playerRailTop,
      trayCenterY: playerRailCenterY,
      gameLeft: boardLeft,
      gameWidth: boardSize,
      playerRailLeft,
      playerRailTop,
      playerRailWidth: railWidth,
      playerRailHeight: railHeight,
      playerRailCenterX,
      playerRailCenterY,
      aiRailLeft,
      aiRailTop,
      aiRailWidth: railWidth,
      aiRailHeight: railHeight,
      aiRailCenterX,
      aiRailCenterY,
      resetBoxLeft,
      resetBoxTop,
      resetBoxWidth,
      resetBoxHeight,
    };
  }

  const railWidth = clamp(safeWidth * 0.15 * TIC_TAC_TOE_LAYOUT_SCALE, 84, 196);
  const resetBoxWidth = clamp(railWidth * 1.08, 120, 216);
  const boardMaxWidth =
    safeWidth - edgePadding * 2 - railWidth - railWidth - resetBoxWidth - railGap * 3;
  const resolvedBoardMaxWidth = Math.max(minimumPlayableBoardSize, boardMaxWidth);
  const boardMinSize = Math.min(240, resolvedBoardMaxWidth);
  const boardSize = clamp(Math.min(safeHeight * 0.82, resolvedBoardMaxWidth), boardMinSize, 680);
  const gameWidth = resetBoxWidth + railGap + railWidth + railGap + boardSize + railGap + railWidth;
  const idealGameLeft = (safeWidth - gameWidth) / 2;
  // Keep enough of the right-side X Rail's pinch ellipse reachable on narrow
  // landscape screens while preserving the requested left-to-right order.
  const minGameLeft = edgePadding;
  const maxGameLeft = safeWidth - edgePadding - gameWidth + railWidth * 0.35;
  const gameLeft = clamp(idealGameLeft, minGameLeft, Math.max(minGameLeft, maxGameLeft));
  const resetBoxLeft = gameLeft;
  const aiRailLeft = resetBoxLeft + resetBoxWidth + railGap;
  const boardLeft = aiRailLeft + railWidth + railGap;
  const playerRailLeft = boardLeft + boardSize + railGap;
  const boardTop = (safeHeight - boardSize) / 2;
  const cellSize = boardSize / 3;
  const activePieceSize = clamp(cellSize * 0.94, 60, 128);
  const reservePieceSize = clamp(activePieceSize * 0.92, 54, 118);
  const reserveStepY = clamp(activePieceSize * 1.15, 56, 128);
  const trayCenterY = boardTop + boardSize / 2;
  const resetBoxHeight = clamp(activePieceSize * 1.72, 108, 190);
  const railMaxHeight = Math.max(activePieceSize * 3.1, safeHeight - edgePadding * 2);
  const railHeight = clamp(boardSize * 0.72, activePieceSize * 3.1, railMaxHeight);
  const railTop = clamp(
    trayCenterY - railHeight / 2,
    edgePadding,
    safeHeight - edgePadding - railHeight,
  );
  const resetBoxTop = clamp(
    trayCenterY - resetBoxHeight / 2,
    edgePadding,
    safeHeight - edgePadding - resetBoxHeight,
  );

  return {
    width: safeWidth,
    height: safeHeight,
    layoutMode: "landscape-rails",
    boardLeft,
    boardTop,
    boardSize,
    cellSize,
    cellInset: clamp(cellSize * 0.1, 10, 28),
    activePieceSize,
    reservePieceSize,
    reserveStepY,
    railWidth,
    railHeight,
    railTop,
    trayCenterY,
    gameLeft,
    gameWidth,
    playerRailLeft,
    playerRailTop: railTop,
    playerRailWidth: railWidth,
    playerRailHeight: railHeight,
    playerRailCenterX: playerRailLeft + railWidth / 2,
    playerRailCenterY: trayCenterY,
    aiRailLeft,
    aiRailTop: railTop,
    aiRailWidth: railWidth,
    aiRailHeight: railHeight,
    aiRailCenterX: aiRailLeft + railWidth / 2,
    aiRailCenterY: trayCenterY,
    resetBoxLeft,
    resetBoxTop,
    resetBoxWidth,
    resetBoxHeight,
    reserveAxis: "y",
    reserveStepX: reserveStepY,
  };
}

export function getTicTacToeCellIndex(layout, x, y) {
  if (
    !layout ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    x < layout.boardLeft ||
    y < layout.boardTop ||
    x >= layout.boardLeft + layout.boardSize ||
    y >= layout.boardTop + layout.boardSize
  ) {
    return -1;
  }

  const column = clamp(Math.floor((x - layout.boardLeft) / layout.cellSize), 0, 2);
  const row = clamp(Math.floor((y - layout.boardTop) / layout.cellSize), 0, 2);
  return row * 3 + column;
}

export function getTicTacToeCellRect(layout, index) {
  if (!layout || !Number.isInteger(index) || index < 0 || index > 8) {
    return null;
  }

  const row = Math.floor(index / 3);
  const column = index % 3;
  return {
    left: layout.boardLeft + column * layout.cellSize,
    top: layout.boardTop + row * layout.cellSize,
    width: layout.cellSize,
    height: layout.cellSize,
    centerX: layout.boardLeft + column * layout.cellSize + layout.cellSize / 2,
    centerY: layout.boardTop + row * layout.cellSize + layout.cellSize / 2,
  };
}

export function evaluateTicTacToeBoard(board) {
  if (!isPlayableBoard(board)) {
    return {
      winner: null,
      line: null,
      draw: false,
    };
  }

  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return {
        winner: board[a],
        line,
        draw: false,
      };
    }
  }

  return {
    winner: null,
    line: null,
    draw: board.every(Boolean),
  };
}

export function pickBestTicTacToeMove(
  board,
  aiMark = TIC_TAC_TOE_AI_MARK,
  playerMark = TIC_TAC_TOE_PLAYER_MARK,
) {
  if (!isPlayableBoard(board)) {
    return -1;
  }

  const openCellIndexes = getOpenCellIndexes(board);
  if (openCellIndexes.length === 0) {
    return -1;
  }

  let bestMove = openCellIndexes[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const cellIndex of openCellIndexes) {
    const nextBoard = [...board];
    nextBoard[cellIndex] = aiMark;
    const score = minimax(nextBoard, aiMark, playerMark, false, 1);
    const betterPreference = getMovePreference(cellIndex) < getMovePreference(bestMove);

    if (score > bestScore || (score === bestScore && betterPreference)) {
      bestScore = score;
      bestMove = cellIndex;
    }
  }

  return bestMove;
}

export function createTicTacToeGame(width, height, stats = {}) {
  const layout = createTicTacToeLayout(width, height);
  const state = buildRoundState(layout, stats);

  ticTacToeLog.info("Created tic-tac-toe game state", {
    width: layout.width,
    height: layout.height,
    boardSize: layout.boardSize,
  });

  return state;
}

export function restartTicTacToeRound(state) {
  if (!state?.layout) {
    return state;
  }

  return createTicTacToeGame(state.layout.width, state.layout.height, {
    playerWins: state.playerWins,
    aiWins: state.aiWins,
    draws: state.draws,
  });
}

export function stepTicTacToeGame(state, dtSeconds, input) {
  if (!state?.layout || !isPlayableBoard(state.board)) {
    return state;
  }

  const safeDt = clamp(Number.isFinite(dtSeconds) ? dtSeconds : 0, 0, MAX_STEP_SECONDS);
  const elapsedMs = safeDt * 1000;
  const pointer = normalizePointer(state.layout, input);
  const pinchActive = Boolean(input?.pinchActive) && pointer.active;
  const pinchStarted = pinchActive && !state.previousPinchActive;
  const pinchEnded = !pinchActive && state.previousPinchActive;

  let nextState = {
    ...state,
    previousPinchActive: pinchActive,
  };

  const boardHasMarks = hasBoardMarks(nextState.board);
  const resetHoldActive =
    boardHasMarks &&
    pointer.active &&
    !nextState.draggingPiece &&
    isPointerInResetBox(nextState.layout, pointer);
  let resetHoldMs = 0;

  if (resetHoldActive) {
    resetHoldMs = nextState.resetHoldActive
      ? Math.min(TIC_TAC_TOE_RESET_HOLD_MS, nextState.resetHoldMs + elapsedMs)
      : 0;
  }

  nextState = {
    ...nextState,
    resetHoldActive,
    resetHoldMs,
  };

  if (resetHoldActive && resetHoldMs >= TIC_TAC_TOE_RESET_HOLD_MS) {
    return restartTicTacToeRound(nextState);
  }

  if (nextState.status === "ai-turn") {
    const remainingTimer = Math.max(0, nextState.aiMoveTimerMs - elapsedMs);
    if (remainingTimer > 0) {
      return {
        ...nextState,
        aiMoveTimerMs: remainingTimer,
        hoverCellIndex: -1,
        previewCellIndex: -1,
        draggingPiece: null,
      };
    }

    const aiMoveIndex = pickAiTicTacToeMove(nextState.board);
    if (aiMoveIndex < 0) {
      return {
        ...nextState,
        status: "draw",
        message: "Draw board",
        aiMoveTimerMs: 0,
        draws: nextState.draws + 1,
      };
    }

    const nextBoard = [...nextState.board];
    nextBoard[aiMoveIndex] = TIC_TAC_TOE_AI_MARK;
    return getResolvedRoundState(
      {
        ...nextState,
        aiMoveTimerMs: 0,
      },
      nextBoard,
      TIC_TAC_TOE_AI_MARK,
      aiMoveIndex,
    );
  }

  if (isRoundOver(nextState)) {
    return {
      ...nextState,
      hoverCellIndex: -1,
      previewCellIndex: -1,
      draggingPiece: null,
    };
  }

  let draggingPiece = nextState.draggingPiece;
  if (pinchStarted && !draggingPiece && isPointerOnPlayerRail(nextState.layout, pointer)) {
    draggingPiece = createDraggingPiece(nextState.layout, pointer, nextState.nextPieceId);
    nextState = {
      ...nextState,
      draggingPiece,
      nextPieceId: nextState.nextPieceId + 1,
      resetHoldActive: false,
      resetHoldMs: 0,
      message: DRAG_PROMPT,
    };
  }

  if (draggingPiece) {
    draggingPiece = updateDraggingPiece(nextState.layout, draggingPiece, pointer);
    nextState = {
      ...nextState,
      draggingPiece,
    };
  }

  if (draggingPiece && !pointer.active) {
    return {
      ...nextState,
      draggingPiece: null,
      previewCellIndex: -1,
      hoverCellIndex: -1,
      resetHoldActive: false,
      resetHoldMs: 0,
      message: PLAYER_PROMPT,
    };
  }

  const hoverCellIndex =
    pointer.active && !draggingPiece
      ? getTicTacToeCellIndex(nextState.layout, pointer.x, pointer.y)
      : -1;
  const draggingCellIndex = draggingPiece
    ? getTicTacToeCellIndex(nextState.layout, draggingPiece.x, draggingPiece.y)
    : -1;
  const previewCellIndex =
    draggingCellIndex >= 0 && !nextState.board[draggingCellIndex] ? draggingCellIndex : -1;

  nextState = {
    ...nextState,
    hoverCellIndex,
    previewCellIndex,
  };

  if (pinchEnded && draggingPiece) {
    if (previewCellIndex >= 0) {
      const nextBoard = [...nextState.board];
      nextBoard[previewCellIndex] = TIC_TAC_TOE_PLAYER_MARK;
      return getResolvedRoundState(nextState, nextBoard, TIC_TAC_TOE_PLAYER_MARK, previewCellIndex);
    }

    return {
      ...nextState,
      draggingPiece: null,
      previewCellIndex: -1,
      hoverCellIndex: -1,
      resetHoldActive: false,
      resetHoldMs: 0,
      message: INVALID_DROP_PROMPT,
    };
  }

  const playerMarksPlaced = countMarks(nextState.board, TIC_TAC_TOE_PLAYER_MARK);
  if (playerMarksPlaced >= TIC_TAC_TOE_PLAYER_PIECE_LIMIT && !draggingPiece) {
    return {
      ...nextState,
      status: "draw",
      message: "Draw board",
      previewCellIndex: -1,
      hoverCellIndex: -1,
      draggingPiece: null,
      draws: nextState.draws + 1,
    };
  }

  return nextState;
}
