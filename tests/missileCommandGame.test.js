import test from "node:test";
import assert from "node:assert/strict";
import {
  MISSILE_COMMAND_COUNTDOWN_MS,
  MISSILE_COMMAND_THREAT_SCORE,
  createMissileCommandGame,
  createMissileCommandLayout,
  getMissileCommandSpawnDelayMs,
  launchMissileCommandInterceptor,
  stepMissileCommandGame,
} from "../src/missileCommandGame.js";

function constantRng(value) {
  return () => value;
}

test("createMissileCommandGame starts in countdown with protected structures", () => {
  const game = createMissileCommandGame(960, 720);
  assert.equal(game.status, "countdown");
  assert.equal(game.countdownMs, MISSILE_COMMAND_COUNTDOWN_MS);
  assert.equal(game.structures.filter((structure) => structure.alive).length, 5);
});

test("createMissileCommandLayout reserves HUD-safe vertical play space", () => {
  const layout = createMissileCommandLayout(960, 720);

  assert.ok(layout.hudTopInset > 0);
  assert.ok(layout.playTopY >= layout.hudTopInset);
  assert.ok(layout.playBottomY <= layout.groundY);
});

test("createMissileCommandLayout makes defensive missiles 50 percent faster", () => {
  const layout = createMissileCommandLayout(960, 720);

  assert.ok(Math.abs(layout.interceptorSpeed - 885.6) < 0.001);
});

test("launchMissileCommandInterceptor adds a shot during active play", () => {
  const initial = createMissileCommandGame(960, 720);
  const playing = {
    ...initial,
    status: "playing",
    countdownMs: 0,
  };

  const next = launchMissileCommandInterceptor(playing, 420, 180);
  assert.equal(next.interceptors.length, 1);
  assert.ok(next.cooldownMs > 0);
  assert.equal(next.interceptors[0].targetX, 420);
  assert.equal(next.interceptors[0].targetY, 180);
  assert.ok(
    Math.abs(Math.hypot(next.interceptors[0].vx, next.interceptors[0].vy) - next.layout.interceptorSpeed) <
      0.001,
  );
});

test("launchMissileCommandInterceptor clamps launch targets to the playfield", () => {
  const initial = createMissileCommandGame(960, 720);
  const playing = {
    ...initial,
    status: "playing",
    countdownMs: 0,
  };

  const next = launchMissileCommandInterceptor(playing, -120, 900);
  assert.equal(next.interceptors.length, 1);
  assert.equal(next.interceptors[0].targetX, 0);
  assert.equal(next.interceptors[0].targetY, playing.layout.height);
});

test("launchMissileCommandInterceptor does not fire once all bases are destroyed", () => {
  const initial = createMissileCommandGame(960, 720);
  const playing = {
    ...initial,
    status: "playing",
    countdownMs: 0,
    structures: initial.structures.map((structure) =>
      structure.type === "base" ? { ...structure, alive: false } : structure,
    ),
  };

  const next = launchMissileCommandInterceptor(playing, 420, 180);
  assert.equal(next, playing);
});

test("stepMissileCommandGame awards score when an explosion catches a threat", () => {
  const initial = createMissileCommandGame(960, 720);
  const next = stepMissileCommandGame(
    {
      ...initial,
      status: "playing",
      countdownMs: 0,
      spawnTimerMs: 10_000,
      threats: [
        {
          id: "threat-1",
          x: 320,
          y: 180,
          startX: 320,
          startY: 0,
          targetX: 320,
          targetY: 620,
          targetStructureId: initial.structures[0].id,
          vx: 0,
          vy: 120,
        },
      ],
      explosions: [
        {
          id: "explosion-1",
          x: 320,
          y: 180,
          ageMs: 300,
          durationMs: 900,
          maxRadius: 90,
        },
      ],
    },
    1 / 60,
    constantRng(0.5),
  );

  assert.equal(next.threats.length, 0);
  assert.equal(next.score, MISSILE_COMMAND_THREAT_SCORE);
  assert.equal(next.threatsStopped, 1);
  assert.equal(next.scoreBursts.length, 1);
  assert.equal(next.scoreBursts[0].value, MISSILE_COMMAND_THREAT_SCORE);
  assert.equal(next.scoreBursts[0].x, 320);
});

test("stepMissileCommandGame ends the round when the last structure is destroyed", () => {
  const initial = createMissileCommandGame(960, 720);
  const doomedStructure = { ...initial.structures[0], alive: true };
  const next = stepMissileCommandGame(
    {
      ...initial,
      status: "playing",
      countdownMs: 0,
      spawnTimerMs: 10_000,
      structures: [{ ...doomedStructure }],
      threats: [
        {
          id: "threat-1",
          x: doomedStructure.x,
          y: doomedStructure.y - doomedStructure.height * 0.48 - 2,
          startX: doomedStructure.x,
          startY: 0,
          targetX: doomedStructure.x,
          targetY: doomedStructure.y - doomedStructure.height * 0.48,
          targetStructureId: doomedStructure.id,
          vx: 0,
          vy: 120,
        },
      ],
    },
    1 / 30,
    constantRng(0.5),
  );

  assert.equal(next.status, "game_over");
  assert.equal(next.structures[0].alive, false);
});

test("getMissileCommandSpawnDelayMs ramps faster over time", () => {
  assert.ok(getMissileCommandSpawnDelayMs(60_000) < getMissileCommandSpawnDelayMs(0));
  assert.ok(getMissileCommandSpawnDelayMs(120_000) <= getMissileCommandSpawnDelayMs(60_000));
});

test("stepMissileCommandGame spawns threats below the top HUD-safe band", () => {
  const initial = createMissileCommandGame(960, 720);
  const next = stepMissileCommandGame(
    {
      ...initial,
      status: "playing",
      countdownMs: 0,
      spawnTimerMs: 0,
    },
    1 / 60,
    constantRng(0.5),
  );

  assert.equal(next.threats.length, 1);
  assert.ok(next.threats[0].startY >= next.layout.playTopY);
});
