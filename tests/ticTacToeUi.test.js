import test from "node:test";
import assert from "node:assert/strict";

import {
  TIC_TAC_TOE_SURFACE_TOKENS,
  getTicTacToeCellUi,
  getTicTacToeCursorUi,
  getTicTacToeHudUi,
  getTicTacToeMarkUi,
  getTicTacToeReservePips,
  getTicTacToeResetUi,
  getTicTacToeTurnUi,
  getTicTacToeWinningLineUi,
} from "../src/ticTacToeUi.js";

test("TIC_TAC_TOE_SURFACE_TOKENS keeps game surfaces visually tight", () => {
  assert.deepEqual(TIC_TAC_TOE_SURFACE_TOKENS, {
    boardRadiusPx: 18,
    panelRadiusPx: 14,
    cellRadiusPx: 16,
    pieceRadiusPx: 16,
  });

  for (const radius of Object.values(TIC_TAC_TOE_SURFACE_TOKENS)) {
    assert.ok(radius <= 18);
  }
});

test("getTicTacToeTurnUi makes the current turn and active rail explicit", () => {
  assert.deepEqual(
    getTicTacToeTurnUi({
      status: "player-turn",
      draggingPiece: null,
    }),
    {
      label: "Your turn",
      detail: "Pinch an X to move",
      tone: "player",
      playerRailState: "active",
      aiRailState: "inactive",
    },
  );

  assert.deepEqual(
    getTicTacToeTurnUi({
      status: "player-turn",
      draggingPiece: { id: "piece-1" },
    }),
    {
      label: "Release to place",
      detail: "Aim for an open square",
      tone: "dragging",
      playerRailState: "active",
      aiRailState: "inactive",
    },
  );

  assert.deepEqual(
    getTicTacToeTurnUi({
      status: "ai-turn",
      aiMoveTimerMs: 420,
    }),
    {
      label: "O thinking",
      detail: "Watch the next move",
      tone: "ai",
      playerRailState: "inactive",
      aiRailState: "active",
    },
  );
});

test("getTicTacToeCellUi highlights legal drops and occupied blockers while dragging", () => {
  const state = {
    status: "player-turn",
    board: ["X", null, "O", null, null, null, null, null, null],
    draggingPiece: { id: "piece-1" },
    hoverCellIndex: -1,
    previewCellIndex: 4,
    winningLine: null,
    lastMoveIndex: -1,
  };

  assert.deepEqual(getTicTacToeCellUi(state, 4, { draggingCellIndex: 4 }), {
    isEmpty: true,
    showPreviewMark: true,
    classNames: ["empty", "legal-drop", "preview", "drag-over"],
  });
  assert.deepEqual(getTicTacToeCellUi(state, 1, { draggingCellIndex: 4 }), {
    isEmpty: true,
    showPreviewMark: false,
    classNames: ["empty", "legal-drop"],
  });
  assert.deepEqual(getTicTacToeCellUi(state, 0, { draggingCellIndex: 0 }), {
    isEmpty: false,
    showPreviewMark: false,
    classNames: ["occupied", "blocked-drop", "drag-over"],
  });
});

test("getTicTacToeHudUi groups score and status while hiding the legend after play starts", () => {
  const openingHud = getTicTacToeHudUi(
    {
      status: "player-turn",
      message: "Pinch an X on the X Rail and drag it into an open square",
      draggingPiece: null,
    },
    {
      playerWins: 2,
      aiWins: 1,
      draws: 3,
      boardCount: 0,
    },
  );

  assert.deepEqual(openingHud.scoreItems, ["You 2", "O 1", "Draws 3", "Board 0/9"]);
  assert.equal(openingHud.statusMessage, "Pinch an X on the X Rail and drag it into an open square");
  assert.equal(openingHud.statusTone, "player-turn");
  assert.equal(openingHud.showLegend, true);

  const activeHud = getTicTacToeHudUi(
    {
      status: "ai-turn",
      message: "O is thinking...",
      draggingPiece: null,
    },
    {
      playerWins: 2,
      aiWins: 1,
      draws: 3,
      boardCount: 1,
    },
  );

  assert.equal(activeHud.showLegend, false);
});

test("getTicTacToeResetUi labels board reset separately from exit and exposes hold progress", () => {
  assert.deepEqual(
    getTicTacToeResetUi(
      {
        resetHoldActive: true,
        resetHoldMs: 450,
      },
      {
        hasActiveBoard: true,
        totalMs: 1000,
      },
    ),
    {
      label: "New Board",
      countdownText: "0.55",
      hint: "Keep your index inside",
      isActive: true,
      isDisabled: false,
      progress: 0.45,
      progressDegrees: "162deg",
    },
  );

  assert.deepEqual(
    getTicTacToeResetUi(
      {
        resetHoldActive: false,
        resetHoldMs: 0,
      },
      {
        hasActiveBoard: false,
        totalMs: 1000,
      },
    ),
    {
      label: "New Board",
      countdownText: "1.00",
      hint: "Place a mark to enable",
      isActive: false,
      isDisabled: true,
      progress: 0,
      progressDegrees: "0deg",
    },
  );
});

test("getTicTacToeWinningLineUi turns winning cells into overlay geometry", () => {
  const layout = {
    boardLeft: 90,
    boardTop: 60,
    boardSize: 300,
    cellSize: 100,
  };

  assert.deepEqual(getTicTacToeWinningLineUi(layout, [0, 1, 2]), {
    left: 140,
    top: 110,
    width: 200,
    angleDegrees: 0,
    thickness: 9,
  });

  assert.deepEqual(getTicTacToeWinningLineUi(layout, [0, 4, 8]), {
    left: 140,
    top: 110,
    width: 282.843,
    angleDegrees: 45,
    thickness: 9,
  });

  assert.equal(getTicTacToeWinningLineUi(layout, null), null);
});

test("getTicTacToeCursorUi describes grab and drop states near the pointer", () => {
  assert.deepEqual(
    getTicTacToeCursorUi(
      {
        status: "player-turn",
        board: Array(9).fill(null),
        draggingPiece: null,
      },
      {
        handDetected: true,
        pinchActive: false,
        draggingCellIndex: -1,
      },
    ),
    {
      show: true,
      label: "Ready",
      tone: "ready",
    },
  );

  assert.deepEqual(
    getTicTacToeCursorUi(
      {
        status: "player-turn",
        board: ["X", null, null, null, null, null, null, null, null],
        draggingPiece: { id: "piece-1" },
      },
      {
        handDetected: true,
        pinchActive: true,
        draggingCellIndex: 1,
      },
    ),
    {
      show: true,
      label: "Drop",
      tone: "valid",
    },
  );

  assert.deepEqual(
    getTicTacToeCursorUi(
      {
        status: "player-turn",
        board: ["X", null, null, null, null, null, null, null, null],
        draggingPiece: { id: "piece-1" },
      },
      {
        handDetected: true,
        pinchActive: true,
        draggingCellIndex: 0,
      },
    ),
    {
      show: true,
      label: "Blocked",
      tone: "blocked",
    },
  );

  assert.deepEqual(
    getTicTacToeCursorUi(
      {
        status: "player-turn",
        board: Array(9).fill(null),
        draggingPiece: null,
      },
      {
        handDetected: false,
        pinchActive: false,
        draggingCellIndex: -1,
      },
    ),
    {
      show: false,
      label: "Find hand",
      tone: "missing",
    },
  );
});

test("getTicTacToeMarkUi flags the latest AI move for placement animation", () => {
  const state = {
    lastMoveIndex: 4,
  };

  assert.deepEqual(getTicTacToeMarkUi(state, 4, "O"), {
    classNames: ["ai", "last-move", "ai-placed"],
    isLastMove: true,
  });

  assert.deepEqual(getTicTacToeMarkUi(state, 4, "X"), {
    classNames: ["player", "last-move"],
    isLastMove: true,
  });

  assert.deepEqual(getTicTacToeMarkUi(state, 0, "O"), {
    classNames: ["ai"],
    isLastMove: false,
  });
});

test("getTicTacToeReservePips exposes filled and empty reserve slots", () => {
  assert.deepEqual(getTicTacToeReservePips(2, 5), [
    { index: 0, isFilled: true, className: "filled" },
    { index: 1, isFilled: true, className: "filled" },
    { index: 2, isFilled: false, className: "empty" },
    { index: 3, isFilled: false, className: "empty" },
    { index: 4, isFilled: false, className: "empty" },
  ]);

  assert.deepEqual(getTicTacToeReservePips(7, 3), [
    { index: 0, isFilled: true, className: "filled" },
    { index: 1, isFilled: true, className: "filled" },
    { index: 2, isFilled: true, className: "filled" },
  ]);
});
