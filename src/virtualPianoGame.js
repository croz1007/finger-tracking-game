// Velocity thresholds in viewport-local px/s, measured RELATIVE to the finger's own knuckle.
// Using knuckle-relative velocity means whole-hand movement doesn't trigger notes —
// only an individual finger curling/pressing down fires a strike.
const STRIKE_VY = 65;   // fingertip must drop this fast relative to its knuckle
const LIFT_VY = -25;    // finger must rise this fast relative to knuckle to reset strike lock

// EMA smoothing factor for per-finger velocity (0 = no smoothing, 1 = never changes)
const VY_SMOOTH = 0.35;

const PIANO_HEIGHT_RATIO = 0.28;
const BLACK_KEY_HEIGHT_RATIO = 0.62;
const BLACK_KEY_WIDTH_RATIO = 0.65;

function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

// C3 to C5: 15 white keys, 10 black keys
const PIANO_KEY_DEFS = [
  { id: "C3",  midi: 48, isWhite: true,  label: "C3" },
  { id: "Cs3", midi: 49, isWhite: false, label: "C#" },
  { id: "D3",  midi: 50, isWhite: true,  label: "" },
  { id: "Ds3", midi: 51, isWhite: false, label: "D#" },
  { id: "E3",  midi: 52, isWhite: true,  label: "" },
  { id: "F3",  midi: 53, isWhite: true,  label: "" },
  { id: "Fs3", midi: 54, isWhite: false, label: "F#" },
  { id: "G3",  midi: 55, isWhite: true,  label: "" },
  { id: "Gs3", midi: 56, isWhite: false, label: "G#" },
  { id: "A3",  midi: 57, isWhite: true,  label: "" },
  { id: "As3", midi: 58, isWhite: false, label: "A#" },
  { id: "B3",  midi: 59, isWhite: true,  label: "" },
  { id: "C4",  midi: 60, isWhite: true,  label: "C4" },
  { id: "Cs4", midi: 61, isWhite: false, label: "C#" },
  { id: "D4",  midi: 62, isWhite: true,  label: "" },
  { id: "Ds4", midi: 63, isWhite: false, label: "D#" },
  { id: "E4",  midi: 64, isWhite: true,  label: "" },
  { id: "F4",  midi: 65, isWhite: true,  label: "" },
  { id: "Fs4", midi: 66, isWhite: false, label: "F#" },
  { id: "G4",  midi: 67, isWhite: true,  label: "" },
  { id: "Gs4", midi: 68, isWhite: false, label: "G#" },
  { id: "A4",  midi: 69, isWhite: true,  label: "A4" },
  { id: "As4", midi: 70, isWhite: false, label: "A#" },
  { id: "B4",  midi: 71, isWhite: true,  label: "" },
  { id: "C5",  midi: 72, isWhite: true,  label: "C5" },
];

const WHITE_KEY_COUNT = PIANO_KEY_DEFS.filter((k) => k.isWhite).length;

export function createVirtualPianoGame(width, height) {
  const safeWidth = Math.max(1, width || 0);
  const safeHeight = Math.max(1, height || 0);
  const whiteKeyWidth = safeWidth / WHITE_KEY_COUNT;
  const pianoHeight = safeHeight * PIANO_HEIGHT_RATIO;
  const keyboardTop = safeHeight - pianoHeight;
  const blackKeyWidth = whiteKeyWidth * BLACK_KEY_WIDTH_RATIO;
  const blackKeyHeight = pianoHeight * BLACK_KEY_HEIGHT_RATIO;

  let whiteKeyIndex = 0;
  const keys = PIANO_KEY_DEFS.map((def) => {
    const freq = midiToFrequency(def.midi);
    if (def.isWhite) {
      const keyX = whiteKeyIndex * whiteKeyWidth;
      whiteKeyIndex += 1;
      return { ...def, freq, x: keyX, y: keyboardTop, width: whiteKeyWidth - 1, height: pianoHeight, pressed: false };
    }
    const centerX = whiteKeyIndex * whiteKeyWidth;
    return { ...def, freq, x: centerX - blackKeyWidth / 2, y: keyboardTop, width: blackKeyWidth, height: blackKeyHeight, pressed: false };
  });

  return {
    keys,
    layout: { width: safeWidth, height: safeHeight, pianoHeight, keyboardTop, whiteKeyWidth, blackKeyWidth, blackKeyHeight },
    // fingerStates maps fingerId -> { prevY, prevKnuckleY, vy, struck, activeKeyId }
    fingerStates: {},
    pressedKeyIds: new Set(),
    newPresses: [],
    releasedKeyIds: new Set(),
  };
}

// fingerTips: [{ id, x, y, knuckleY }] in viewport-local coordinates.
//   knuckleY is the MCP (base knuckle) y for that finger — used for relative velocity.
//   If knuckleY is null/undefined the previous frame's knuckleY is reused as fallback.
// deltaSeconds: time since last frame
export function stepVirtualPianoGame(state, fingerTips, deltaSeconds) {
  const safeState = state ?? createVirtualPianoGame(1280, 720);
  const safeTips = Array.isArray(fingerTips) ? fingerTips : [];
  const dt = Math.min(0.1, Math.max(0.001, deltaSeconds || 0.016));

  const blackKeys = safeState.keys.filter((k) => !k.isWhite);
  const whiteKeys = safeState.keys.filter((k) => k.isWhite);

  function keyAtPoint(x, y) {
    for (const key of blackKeys) {
      if (x >= key.x && x <= key.x + key.width && y >= key.y && y <= key.y + key.height) {
        return key;
      }
    }
    for (const key of whiteKeys) {
      if (x >= key.x && x <= key.x + key.width && y >= key.y && y <= key.y + key.height) {
        return key;
      }
    }
    return null;
  }

  const prevFingerStates = safeState.fingerStates;
  const nextFingerStates = {};
  const newPresses = [];
  const pressedKeyIds = new Set();

  for (const tip of safeTips) {
    if (!Number.isFinite(tip?.x) || !Number.isFinite(tip?.y)) {
      continue;
    }

    const prev = prevFingerStates[tip.id] ?? { prevY: tip.y, prevKnuckleY: null, vy: 0, struck: false, activeKeyId: null };

    // Resolve knuckle Y for this frame; fall back to previous frame's value if missing
    const currKnuckleY = Number.isFinite(tip.knuckleY) ? tip.knuckleY : prev.prevKnuckleY;
    const prevKnuckleY = Number.isFinite(prev.prevKnuckleY) ? prev.prevKnuckleY : currKnuckleY;

    // Compute velocity of (tipY - knuckleY): positive = tip moving down relative to knuckle.
    // When the whole hand moves, knuckle and tip move together → relative vy ≈ 0.
    // Only an individual finger curling downward produces a positive relative vy.
    let vy = prev.vy;
    if (currKnuckleY !== null && prevKnuckleY !== null) {
      const curRelY = tip.y - currKnuckleY;
      const prevRelY = prev.prevY - prevKnuckleY;
      const rawVy = (curRelY - prevRelY) / dt;
      vy = prev.vy * VY_SMOOTH + rawVy * (1 - VY_SMOOTH);
    }

    const overKey = keyAtPoint(tip.x, tip.y);
    const overKeyId = overKey?.id ?? null;

    let struck = prev.struck;
    let activeKeyId = prev.activeKeyId;

    // Reset strike lock when finger uncurls (moves upward relative to knuckle)
    if (vy < LIFT_VY) {
      struck = false;
      activeKeyId = null;
    }

    // Reset strike lock when finger moves to a different key without a press
    if (overKeyId !== prev.activeKeyId && !struck) {
      activeKeyId = overKeyId;
    }

    // Fire strike: finger is over a key, curling down fast enough, and hasn't struck yet
    if (overKey && vy >= STRIKE_VY && !struck) {
      newPresses.push({ id: overKey.id, freq: overKey.freq, midi: overKey.midi });
      struck = true;
      activeKeyId = overKey.id;
    }

    // A key shows as pressed while the finger is still over it after striking
    if (struck && overKeyId !== null) {
      pressedKeyIds.add(overKeyId);
    }

    nextFingerStates[tip.id] = { prevY: tip.y, prevKnuckleY: currKnuckleY, vy, struck, activeKeyId };
  }

  // Detect which keys were released (pressed last frame, not pressed now)
  const releasedKeyIds = new Set();
  for (const keyId of safeState.pressedKeyIds) {
    if (!pressedKeyIds.has(keyId)) {
      releasedKeyIds.add(keyId);
    }
  }

  const keys = safeState.keys.map((key) => ({
    ...key,
    pressed: pressedKeyIds.has(key.id),
  }));

  return {
    ...safeState,
    keys,
    fingerStates: nextFingerStates,
    pressedKeyIds,
    newPresses,
    releasedKeyIds,
  };
}
