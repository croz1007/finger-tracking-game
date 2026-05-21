import test from "node:test";
import assert from "node:assert/strict";

import { getFullscreenRingLayersForHand } from "../src/fullscreenRings.js";

const layers = [
  { color: "red" },
  { color: "orange" },
  { color: "yellow" },
];

test("getFullscreenRingLayersForHand reverses only the left hand ring order", () => {
  assert.deepEqual(
    getFullscreenRingLayersForHand(layers, "Left").map((layer) => layer.color),
    ["red", "orange", "yellow"],
  );
  assert.deepEqual(
    getFullscreenRingLayersForHand(layers, "Right").map((layer) => layer.color),
    ["yellow", "orange", "red"],
  );
});

test("getFullscreenRingLayersForHand keeps unknown labels in the right hand order", () => {
  assert.deepEqual(
    getFullscreenRingLayersForHand(layers, "Hand 1").map((layer) => layer.color),
    ["yellow", "orange", "red"],
  );
});
