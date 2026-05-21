import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/FullscreenLandingPage.jsx", import.meta.url),
  "utf8",
);

test("FullscreenLandingPage does not render inactive top-control buttons", () => {
  assert.equal(source.includes("How to use"), false);
  assert.equal(source.includes("Settings"), false);
  assert.equal(source.includes("fullscreen-camera-landing-top-controls"), false);
});
