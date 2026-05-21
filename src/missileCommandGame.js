export const MISSILE_COMMAND_COUNTDOWN_MS = 2_000;
export const MISSILE_COMMAND_THREAT_SCORE = 125;
export const MISSILE_COMMAND_SCORE_BURST_MS = 760;

const MISSILE_COMMAND_MAX_STEP_SECONDS = 0.05;
const MISSILE_COMMAND_SPAWN_DELAY_START_MS = 1_400;
const MISSILE_COMMAND_SPAWN_DELAY_END_MS = 650;
const MISSILE_COMMAND_DIFFICULTY_RAMP_MS = 90_000;
const MISSILE_COMMAND_INTERCEPTOR_MIN_SPEED = 630;
const MISSILE_COMMAND_INTERCEPTOR_SPEED_RATIO = 1.23;
export const MISSILE_COMMAND_INTERCEPT_COOLDOWN_MS = 180;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createIdFactory(start = 1) {
  let next = start;
  return () => next++;
}

export function createMissileCommandLayout(width, height) {
  const safeWidth = Math.max(360, Number.isFinite(width) ? width : 360);
  const safeHeight = Math.max(240, Number.isFinite(height) ? height : 240);
  const hudTopInset = clamp(safeHeight * 0.12, 58, 96);
  const hudBottomInset = clamp(safeHeight * 0.1, 48, 88);
  const groundBandHeight = clamp(safeHeight * 0.13, 64, 118);
  const groundY = safeHeight - Math.max(groundBandHeight, hudBottomInset);

  return {
    width: safeWidth,
    height: safeHeight,
    hudTopInset,
    hudBottomInset,
    playTopY: hudTopInset,
    playBottomY: groundY,
    groundY,
    interceptorSpeed: Math.max(
      MISSILE_COMMAND_INTERCEPTOR_MIN_SPEED,
      safeHeight * MISSILE_COMMAND_INTERCEPTOR_SPEED_RATIO,
    ),
    threatBaseSpeed: Math.max(80, safeHeight * 0.16),
    threatSpeedBonus: Math.max(60, safeHeight * 0.12),
    blastRadius: clamp(Math.min(safeWidth, safeHeight) * 0.09, 42, 96),
    impactRadius: clamp(Math.min(safeWidth, safeHeight) * 0.05, 24, 50),
    structureStep: safeWidth / 6,
  };
}

export function createMissileCommandStructures(layout) {
  const step = layout.structureStep;
  const baseWidth = clamp(layout.width * 0.1, 44, 84);
  const cityWidth = clamp(layout.width * 0.08, 38, 72);
  const structures = [];
  const kinds = ["city", "base", "city", "base", "city"];

  for (let index = 0; index < kinds.length; index += 1) {
    const type = kinds[index];
    const x = step * (index + 1);
    const width = type === "base" ? baseWidth : cityWidth;
    const height = type === "base" ? clamp(layout.height * 0.065, 28, 52) : clamp(layout.height * 0.048, 22, 42);
    structures.push({
      id: `structure-${index + 1}`,
      type,
      x,
      y: layout.groundY,
      width,
      height,
      alive: true,
    });
  }

  return structures;
}

function getAliveStructures(structures) {
  return (Array.isArray(structures) ? structures : []).filter((structure) => structure?.alive);
}

function getDifficultyProgress(elapsedMs = 0) {
  return clamp(
    (Number.isFinite(elapsedMs) ? elapsedMs : 0) / MISSILE_COMMAND_DIFFICULTY_RAMP_MS,
    0,
    1,
  );
}

export function getMissileCommandSpawnDelayMs(elapsedMs = 0) {
  const progress = getDifficultyProgress(elapsedMs);
  return Math.round(
    MISSILE_COMMAND_SPAWN_DELAY_START_MS -
      (MISSILE_COMMAND_SPAWN_DELAY_START_MS - MISSILE_COMMAND_SPAWN_DELAY_END_MS) * progress,
  );
}

function getThreatSpeed(layout, elapsedMs = 0) {
  const progress = getDifficultyProgress(elapsedMs);
  return layout.threatBaseSpeed + layout.threatSpeedBonus * progress;
}

function createExplosion(x, y, maxRadius, durationMs, color, id, kind) {
  return {
    id: `explosion-${id}`,
    kind,
    x,
    y,
    ageMs: 0,
    durationMs,
    maxRadius,
    color,
  };
}

function createScoreBurst(x, y, value, id) {
  return {
    id: `score-burst-${id}`,
    x,
    y,
    value,
    ageMs: 0,
    durationMs: MISSILE_COMMAND_SCORE_BURST_MS,
  };
}

function ageScoreBursts(scoreBursts, dtMs) {
  return (Array.isArray(scoreBursts) ? scoreBursts : [])
    .map((burst) => ({
      ...burst,
      ageMs: burst.ageMs + dtMs,
    }))
    .filter((burst) => burst.ageMs < burst.durationMs);
}

export function getMissileCommandExplosionRadius(explosion) {
  if (!explosion) {
    return 0;
  }
  const durationMs = Math.max(1, explosion.durationMs);
  const progress = clamp(explosion.ageMs / durationMs, 0, 1);
  if (progress <= 0.6) {
    return explosion.maxRadius * (progress / 0.6);
  }
  return explosion.maxRadius * (1 - (progress - 0.6) / 0.4);
}

function createThreat(layout, structures, elapsedMs, threatId, rng = Math.random) {
  const aliveStructures = getAliveStructures(structures);
  if (aliveStructures.length === 0) {
    return null;
  }

  const targetIndex = Math.min(
    aliveStructures.length - 1,
    Math.floor(rng() * aliveStructures.length),
  );
  const target = aliveStructures[targetIndex];
  const margin = clamp(layout.width * 0.08, 28, 72);
  const startX = margin + rng() * Math.max(1, layout.width - margin * 2);
  const startY = layout.playTopY ?? clamp(layout.height * 0.12, 58, 96);
  const targetX = target.x;
  const targetY = target.y - target.height * 0.48;
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const speed = getThreatSpeed(layout, elapsedMs);

  return {
    id: `threat-${threatId}`,
    startX,
    startY,
    x: startX,
    y: startY,
    targetX,
    targetY,
    targetStructureId: target.id,
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
  };
}

function getLaunchOrigin(state, targetX) {
  const aliveBases = getAliveStructures(state?.structures).filter(
    (structure) => structure.type === "base",
  );
  if (aliveBases.length === 0) {
    return null;
  }

  return aliveBases.reduce((closest, candidate) => {
    if (!closest) {
      return candidate;
    }
    const closestDistance = Math.abs(closest.x - targetX);
    const candidateDistance = Math.abs(candidate.x - targetX);
    return candidateDistance < closestDistance ? candidate : closest;
  }, null);
}

export function launchMissileCommandInterceptor(state, targetX, targetY) {
  if (!state?.layout || state.status !== "playing") {
    return state;
  }
  if (!Number.isFinite(targetX) || !Number.isFinite(targetY) || state.cooldownMs > 0) {
    return state;
  }

  const clampedTargetX = clamp(targetX, 0, state.layout.width);
  const clampedTargetY = clamp(targetY, 0, state.layout.height);

  const origin = getLaunchOrigin(state, clampedTargetX);
  if (!origin) {
    return state;
  }

  const originY = origin.y - origin.height * 0.7;
  const dx = clampedTargetX - origin.x;
  const dy = clampedTargetY - originY;
  const distance = Math.hypot(dx, dy);
  if (distance < 4) {
    return state;
  }

  return {
    ...state,
    interceptors: [
      ...state.interceptors,
      {
        id: `interceptor-${state.nextInterceptorId}`,
        originX: origin.x,
        originY,
        x: origin.x,
        y: originY,
        targetX: clampedTargetX,
        targetY: clampedTargetY,
        vx: (dx / distance) * state.layout.interceptorSpeed,
        vy: (dy / distance) * state.layout.interceptorSpeed,
      },
    ],
    nextInterceptorId: state.nextInterceptorId + 1,
    cooldownMs: MISSILE_COMMAND_INTERCEPT_COOLDOWN_MS,
  };
}

export function createMissileCommandGame(width, height) {
  const layout = createMissileCommandLayout(width, height);

  return {
    layout,
    structures: createMissileCommandStructures(layout),
    threats: [],
    interceptors: [],
    explosions: [],
    scoreBursts: [],
    score: 0,
    threatsStopped: 0,
    status: "countdown",
    countdownMs: MISSILE_COMMAND_COUNTDOWN_MS,
    elapsedMs: 0,
    spawnTimerMs: 900,
    cooldownMs: 0,
    nextThreatId: 1,
    nextInterceptorId: 1,
    nextExplosionId: 1,
    nextScoreBurstId: 1,
    message: "Pinch to fire",
  };
}

export function stepMissileCommandGame(state, dtSeconds, rng = Math.random) {
  if (!state?.layout) {
    return state;
  }

  const safeDt = clamp(Number.isFinite(dtSeconds) ? dtSeconds : 0, 0, MISSILE_COMMAND_MAX_STEP_SECONDS);
  const dtMs = safeDt * 1000;
  let nextState = {
    ...state,
    elapsedMs: state.elapsedMs + dtMs,
    cooldownMs: Math.max(0, state.cooldownMs - dtMs),
    scoreBursts: ageScoreBursts(state.scoreBursts, dtMs),
  };

  if (nextState.status === "countdown") {
    const countdownMs = Math.max(0, nextState.countdownMs - dtMs);
    const status = countdownMs <= 0 ? "playing" : "countdown";
    return {
      ...nextState,
      countdownMs,
      status,
      message: status === "playing" ? "Pinch to fire" : `${Math.max(1, Math.ceil(countdownMs / 1000))}`,
    };
  }

  if (nextState.status === "game_over") {
    return nextState;
  }

  let spawnTimerMs = nextState.spawnTimerMs - dtMs;
  const nextThreats = [];
  for (const threat of nextState.threats) {
    const x = threat.x + threat.vx * safeDt;
    const y = threat.y + threat.vy * safeDt;
    const reachedTarget =
      Math.hypot(threat.targetX - x, threat.targetY - y) <= Math.max(8, Math.hypot(threat.vx, threat.vy) * safeDt);

    if (reachedTarget) {
      nextState = {
        ...nextState,
        structures: nextState.structures.map((structure) =>
          structure.id === threat.targetStructureId ? { ...structure, alive: false } : structure,
        ),
        explosions: [
          ...nextState.explosions,
          createExplosion(
            threat.targetX,
            threat.targetY,
            nextState.layout.impactRadius,
            520,
            "rgba(255, 117, 61, 0.78)",
            nextState.nextExplosionId,
            "impact",
          ),
        ],
        nextExplosionId: nextState.nextExplosionId + 1,
      };
      continue;
    }

    nextThreats.push({
      ...threat,
      x,
      y,
    });
  }

  while (spawnTimerMs <= 0) {
    const spawned = createThreat(
      nextState.layout,
      nextState.structures,
      nextState.elapsedMs,
      nextState.nextThreatId,
      rng,
    );
    spawnTimerMs += getMissileCommandSpawnDelayMs(nextState.elapsedMs);
    if (!spawned) {
      break;
    }
    nextThreats.push(spawned);
    nextState = {
      ...nextState,
      nextThreatId: nextState.nextThreatId + 1,
    };
  }

  const nextInterceptors = [];
  for (const interceptor of nextState.interceptors) {
    const x = interceptor.x + interceptor.vx * safeDt;
    const y = interceptor.y + interceptor.vy * safeDt;
    const reachedTarget =
      Math.hypot(interceptor.targetX - x, interceptor.targetY - y) <=
      Math.max(10, Math.hypot(interceptor.vx, interceptor.vy) * safeDt);

    if (reachedTarget) {
      nextState = {
        ...nextState,
        explosions: [
          ...nextState.explosions,
          createExplosion(
            interceptor.targetX,
            interceptor.targetY,
            nextState.layout.blastRadius,
            960,
            "rgba(255, 233, 122, 0.82)",
            nextState.nextExplosionId,
            "interceptor",
          ),
        ],
        nextExplosionId: nextState.nextExplosionId + 1,
      };
      continue;
    }

    nextInterceptors.push({
      ...interceptor,
      x,
      y,
    });
  }

  const nextExplosions = [];
  for (const explosion of nextState.explosions) {
    const updated = {
      ...explosion,
      ageMs: explosion.ageMs + dtMs,
    };
    if (updated.ageMs < updated.durationMs) {
      nextExplosions.push(updated);
    }
  }

  let score = nextState.score;
  let threatsStopped = nextState.threatsStopped;
  let nextScoreBursts = nextState.scoreBursts;
  const survivingThreats = [];
  for (const threat of nextThreats) {
    const hitExplosion = nextExplosions.find(
      (explosion) =>
        Math.hypot(threat.x - explosion.x, threat.y - explosion.y) <=
        getMissileCommandExplosionRadius(explosion),
    );
    if (hitExplosion) {
      score += MISSILE_COMMAND_THREAT_SCORE;
      threatsStopped += 1;
      nextScoreBursts = [
        ...nextScoreBursts,
        createScoreBurst(
          threat.x,
          threat.y,
          MISSILE_COMMAND_THREAT_SCORE,
          nextState.nextScoreBurstId,
        ),
      ];
      nextState = {
        ...nextState,
        nextScoreBurstId: nextState.nextScoreBurstId + 1,
      };
      continue;
    }
    survivingThreats.push(threat);
  }

  const aliveStructures = getAliveStructures(nextState.structures);
  const gameOver = aliveStructures.length === 0;

  return {
    ...nextState,
    threats: survivingThreats,
    interceptors: nextInterceptors,
    explosions: nextExplosions,
    scoreBursts: nextScoreBursts,
    score,
    threatsStopped,
    spawnTimerMs,
    status: gameOver ? "game_over" : "playing",
    message: gameOver ? "Defense lost" : "Pinch to fire",
  };
}
