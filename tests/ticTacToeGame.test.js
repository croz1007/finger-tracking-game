import test from "node:test";
import assert from "node:assert/strict";
import {
  TIC_TAC_TOE_AI_MARK,
  TIC_TAC_TOE_AI_MOVE_DELAY_MS,
  TIC_TAC_TOE_PLAYER_MARK,
  TIC_TAC_TOE_RESET_HOLD_MS,
  createTicTacToeGame,
  evaluateTicTacToeBoard,
  getTicTacToeCellRect,
  pickBestTicTacToeMove,
  restartTicTacToeRound,
  stepTicTacToeGame,
} from "../src/ticTacToeGame.js";

function getBoardCenter(layout, cellIndex) {
  const rect = getTicTacToeCellRect(layout, cellIndex);
  return {
    x: rect.centerX,
    y: rect.centerY,
  };
}

function getResetBoxCenter(layout) {
  return {
    x: layout.resetBoxLeft + layout.resetBoxWidth / 2,
    y: layout.resetBoxTop + layout.resetBoxHeight / 2,
  };
}

function startDrag(game) {
  return stepTicTacToeGame(game, 1 / 60, {
    pointerActive: true,
    pointerX: game.layout.playerRailCenterX,
    pointerY: game.layout.trayCenterY,
    pinchActive: true,
  });
}

function dragToCell(game, cellIndex) {
  const point = getBoardCenter(game.layout, cellIndex);
  return stepTicTacToeGame(game, 1 / 60, {
    pointerActive: true,
    pointerX: point.x,
    pointerY: point.y,
    pinchActive: true,
  });
}

function dropOnCell(game, cellIndex) {
  const point = getBoardCenter(game.layout, cellIndex);
  return stepTicTacToeGame(game, 1 / 60, {
    pointerActive: true,
    pointerX: point.x,
    pointerY: point.y,
    pinchActive: false,
  });
}

test("createTicTacToeGame starts on the player's drag turn", () => {
  const game = createTicTacToeGame(1280, 720);

  assert.equal(game.status, "player-turn");
  assert.equal(game.message, "Pinch an X on the X Rail and drag it into an open square");
  assert.deepEqual(game.board, Array(9).fill(null));
  assert.ok(game.layout.boardSize > 0);
  assert.ok(game.layout.resetBoxLeft < game.layout.aiRailLeft);
  assert.ok(game.layout.aiRailLeft < game.layout.boardLeft);
  assert.ok(game.layout.boardLeft < game.layout.playerRailLeft);
  assert.ok(game.layout.resetBoxLeft >= 0);
  assert.ok(game.layout.playerRailLeft + game.layout.playerRailWidth <= game.layout.width);
  assert.ok(game.layout.activePieceSize >= 60);
});

test("createTicTacToeGame keeps the player rail reachable on narrow fullscreen viewports", () => {
  const game = createTicTacToeGame(320, 440);
  const pickedUp = startDrag(game);
  const dropped = dropOnCell(dragToCell(pickedUp, 0), 0);

  assert.ok(game.layout.boardSize >= 180);
  assert.ok(game.layout.cellSize > 0);
  assert.ok(pickedUp.draggingPiece);
  assert.equal(dropped.board[0], TIC_TAC_TOE_PLAYER_MARK);
});

test("createTicTacToeGame keeps the reset box reachable on narrow portrait fullscreen viewports", () => {
  const game = {
    ...createTicTacToeGame(360, 640),
    board: [TIC_TAC_TOE_PLAYER_MARK, null, null, null, null, null, null, null, null],
  };
  const reachablePoint = getResetBoxCenter(game.layout);

  const holdingReset = stepTicTacToeGame(game, 1 / 60, {
    pointerActive: true,
    pointerX: reachablePoint.x,
    pointerY: reachablePoint.y,
    pinchActive: false,
  });

  assert.ok(game.layout.resetBoxLeft >= 0);
  assert.ok(game.layout.resetBoxLeft + game.layout.resetBoxWidth <= game.layout.width);
  assert.equal(holdingReset.resetHoldActive, true);
});

test("createTicTacToeGame stacks rails above and below the board on portrait viewports", () => {
  const game = createTicTacToeGame(390, 844);
  const layout = game.layout;

  assert.equal(layout.layoutMode, "portrait-trays");
  assert.ok(layout.playerRailLeft >= 0);
  assert.ok(layout.playerRailLeft + layout.playerRailWidth <= layout.width);
  assert.ok(layout.aiRailLeft >= 0);
  assert.ok(layout.aiRailLeft + layout.aiRailWidth <= layout.width);
  assert.ok(layout.playerRailTop + layout.playerRailHeight < layout.boardTop);
  assert.ok(layout.aiRailTop > layout.boardTop + layout.boardSize);
  assert.ok(layout.resetBoxTop > layout.aiRailTop + layout.aiRailHeight);

  const pickedUp = stepTicTacToeGame(game, 1 / 60, {
    pointerActive: true,
    pointerX: layout.playerRailCenterX,
    pointerY: layout.playerRailCenterY,
    pinchActive: true,
  });

  assert.ok(pickedUp.draggingPiece);
});

test("stepTicTacToeGame lets the player drag a piece from the X Rail into the board", () => {
  const game = createTicTacToeGame(1280, 720);
  const pickedUp = startDrag(game);

  assert.ok(pickedUp.draggingPiece);
  assert.equal(pickedUp.message, "Release over an open square");

  const hovering = dragToCell(pickedUp, 0);
  assert.equal(hovering.previewCellIndex, 0);

  const dropped = dropOnCell(hovering, 0);
  assert.equal(dropped.board[0], TIC_TAC_TOE_PLAYER_MARK);
  assert.equal(dropped.status, "ai-turn");
  assert.equal(dropped.aiMoveTimerMs, TIC_TAC_TOE_AI_MOVE_DELAY_MS);
});

test("stepTicTacToeGame rejects drops on occupied cells", () => {
  const game = {
    ...createTicTacToeGame(1280, 720),
    board: [TIC_TAC_TOE_AI_MARK, null, null, null, null, null, null, null, null],
  };

  const pickedUp = startDrag(game);
  const hovering = dragToCell(pickedUp, 0);
  const rejected = dropOnCell(hovering, 0);

  assert.equal(rejected.board[0], TIC_TAC_TOE_AI_MARK);
  assert.equal(rejected.draggingPiece, null);
  assert.equal(rejected.status, "player-turn");
  assert.equal(rejected.message, "Open squares only. Grab another X from the X Rail");
});

test("stepTicTacToeGame cancels a drag instead of placing when tracking drops out", () => {
  const game = createTicTacToeGame(1280, 720);
  const pickedUp = startDrag(game);
  const hovering = dragToCell(pickedUp, 0);

  const droppedByTrackingLoss = stepTicTacToeGame(hovering, 1 / 60, {
    pointerActive: false,
    pinchActive: false,
  });

  assert.deepEqual(droppedByTrackingLoss.board, Array(9).fill(null));
  assert.equal(droppedByTrackingLoss.status, "player-turn");
  assert.equal(droppedByTrackingLoss.draggingPiece, null);
  assert.equal(droppedByTrackingLoss.previewCellIndex, -1);
  assert.equal(
    droppedByTrackingLoss.message,
    "Pinch an X on the X Rail and drag it into an open square",
  );
});

test("pickBestTicTacToeMove takes a winning move before blocking", () => {
  const winningMove = pickBestTicTacToeMove([
    TIC_TAC_TOE_AI_MARK,
    TIC_TAC_TOE_AI_MARK,
    null,
    TIC_TAC_TOE_PLAYER_MARK,
    TIC_TAC_TOE_PLAYER_MARK,
    null,
    null,
    null,
    null,
  ]);

  assert.equal(winningMove, 2);
});

test("pickBestTicTacToeMove blocks the player when needed", () => {
  const blockingMove = pickBestTicTacToeMove([
    TIC_TAC_TOE_PLAYER_MARK,
    TIC_TAC_TOE_PLAYER_MARK,
    null,
    null,
    TIC_TAC_TOE_AI_MARK,
    null,
    null,
    null,
    null,
  ]);

  assert.equal(blockingMove, 2);
});

test("stepTicTacToeGame records a player win on a completed drag", () => {
  const game = {
    ...createTicTacToeGame(1280, 720),
    board: [
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      null,
      TIC_TAC_TOE_AI_MARK,
      TIC_TAC_TOE_AI_MARK,
      null,
      null,
      null,
      null,
    ],
  };

  const pickedUp = startDrag(game);
  const hovering = dragToCell(pickedUp, 2);
  const won = dropOnCell(hovering, 2);

  assert.equal(won.status, "player-win");
  assert.equal(won.playerWins, 1);
  assert.deepEqual(won.winningLine, [0, 1, 2]);
  assert.equal(won.message, "You win the board");
});

test("stepTicTacToeGame resolves the AI move after its think delay", () => {
  const game = {
    ...createTicTacToeGame(1280, 720),
    board: [
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      null,
      null,
      TIC_TAC_TOE_AI_MARK,
      null,
      null,
      null,
      null,
    ],
    status: "ai-turn",
    aiMoveTimerMs: 10,
    message: "O is thinking...",
  };

  const resolved = stepTicTacToeGame(game, 1 / 30, {
    pointerActive: false,
    pinchActive: false,
  });

  assert.equal(resolved.board[2], TIC_TAC_TOE_AI_MARK);
  assert.equal(resolved.status, "player-turn");
  assert.equal(resolved.message, "Pinch an X on the X Rail and drag it into an open square");
});

test("stepTicTacToeGame uses a random open square for the AI's first move", () => {
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const game = {
      ...createTicTacToeGame(1280, 720),
      board: [
        TIC_TAC_TOE_PLAYER_MARK,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      status: "ai-turn",
      aiMoveTimerMs: 0,
      message: "O is thinking...",
    };

    const resolved = stepTicTacToeGame(game, 1 / 60, {
      pointerActive: false,
      pinchActive: false,
    });

    assert.equal(resolved.board[1], TIC_TAC_TOE_AI_MARK);
  } finally {
    Math.random = originalRandom;
  }
});

test("stepTicTacToeGame chooses optimally after the AI has already moved once", () => {
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const game = {
      ...createTicTacToeGame(1280, 720),
      board: [
        TIC_TAC_TOE_PLAYER_MARK,
        TIC_TAC_TOE_PLAYER_MARK,
        null,
        null,
        TIC_TAC_TOE_AI_MARK,
        null,
        null,
        null,
        null,
      ],
      status: "ai-turn",
      aiMoveTimerMs: 0,
      message: "O is thinking...",
    };

    const resolved = stepTicTacToeGame(game, 1 / 60, {
      pointerActive: false,
      pinchActive: false,
    });

    assert.equal(resolved.board[2], TIC_TAC_TOE_AI_MARK);
  } finally {
    Math.random = originalRandom;
  }
});

test("restartTicTacToeRound preserves the running match tally", () => {
  const restarted = restartTicTacToeRound({
    ...createTicTacToeGame(1280, 720),
    playerWins: 2,
    aiWins: 1,
    draws: 3,
    board: [
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_AI_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      null,
      TIC_TAC_TOE_AI_MARK,
      null,
      null,
      null,
      null,
    ],
  });

  assert.deepEqual(restarted.board, Array(9).fill(null));
  assert.equal(restarted.playerWins, 2);
  assert.equal(restarted.aiWins, 1);
  assert.equal(restarted.draws, 3);
  assert.equal(restarted.status, "player-turn");
});

test("stepTicTacToeGame starts the reset countdown at 1.00 and clears the board after one second", () => {
  const base = {
    ...createTicTacToeGame(1280, 720),
    playerWins: 2,
    aiWins: 1,
    draws: 3,
    board: [
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_AI_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      null,
      TIC_TAC_TOE_AI_MARK,
      null,
      null,
      null,
      null,
    ],
  };
  const resetPoint = getResetBoxCenter(base.layout);

  let held = stepTicTacToeGame(base, 1 / 60, {
    pointerActive: true,
    pointerX: resetPoint.x,
    pointerY: resetPoint.y,
    pinchActive: false,
  });

  assert.equal(held.resetHoldActive, true);
  assert.equal(held.resetHoldMs, 0);
  assert.deepEqual(held.board, base.board);

  const stepsToReset = Math.ceil((TIC_TAC_TOE_RESET_HOLD_MS / 1000) * 60);
  let didReset = false;
  for (let index = 0; index < stepsToReset + 2; index += 1) {
    held = stepTicTacToeGame(held, 1 / 60, {
      pointerActive: true,
      pointerX: resetPoint.x,
      pointerY: resetPoint.y,
      pinchActive: false,
    });
    if (held.board.every((cell) => cell === null)) {
      didReset = true;
      break;
    }
  }

  assert.equal(didReset, true);
  assert.deepEqual(held.board, Array(9).fill(null));
  assert.equal(held.status, "player-turn");
  assert.equal(held.playerWins, 2);
  assert.equal(held.aiWins, 1);
  assert.equal(held.draws, 3);
  assert.equal(held.resetHoldActive, false);
  assert.equal(held.resetHoldMs, 0);
});

test("stepTicTacToeGame keeps reset disabled when the board is empty", () => {
  const emptyGame = createTicTacToeGame(1280, 720);
  const resetPoint = getResetBoxCenter(emptyGame.layout);
  const held = stepTicTacToeGame(emptyGame, 0.5, {
    pointerActive: true,
    pointerX: resetPoint.x,
    pointerY: resetPoint.y,
    pinchActive: false,
  });

  assert.equal(held.resetHoldActive, false);
  assert.equal(held.resetHoldMs, 0);
  assert.deepEqual(held.board, Array(9).fill(null));
});

test("evaluateTicTacToeBoard reports wins and draws", () => {
  assert.deepEqual(
    evaluateTicTacToeBoard([
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      null,
      TIC_TAC_TOE_AI_MARK,
      null,
      null,
      null,
      TIC_TAC_TOE_AI_MARK,
    ]),
    {
      winner: TIC_TAC_TOE_PLAYER_MARK,
      line: [0, 1, 2],
      draw: false,
    },
  );

  assert.deepEqual(
    evaluateTicTacToeBoard([
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_AI_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_AI_MARK,
      TIC_TAC_TOE_AI_MARK,
      TIC_TAC_TOE_AI_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
      TIC_TAC_TOE_PLAYER_MARK,
    ]),
    {
      winner: null,
      line: null,
      draw: true,
    },
  );
});
