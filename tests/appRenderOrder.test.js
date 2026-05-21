import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("App computes the fullscreen camera viewport before Tic Tac Toe cursor geometry", () => {
  const source = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const viewportIndex = source.indexOf("const fullscreenCameraViewport = useMemo");
  const ticTacToeCursorIndex = source.indexOf("const fullscreenTicTacToeCursorPoint =");

  assert.ok(viewportIndex >= 0);
  assert.ok(ticTacToeCursorIndex >= 0);
  assert.ok(
    viewportIndex < ticTacToeCursorIndex,
    "Tic Tac Toe cursor point must not read fullscreenCameraViewport before the hook initializes it",
  );
});

test("fullscreen camera HUD keeps detection status at bottom left without the mode title chip", () => {
  const source = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.equal(source.includes('<span className="fullscreen-camera-chip">{cameraPanelTitle}</span>'), false);

  const bottomRowIndex = source.indexOf('className="fullscreen-camera-hud-bottom"');
  const statusIndex = source.indexOf('className={`tracking-indicator fullscreen-camera-status');
  const actionsIndex = source.indexOf('className="fullscreen-camera-meta fullscreen-camera-actions"');

  assert.ok(bottomRowIndex >= 0);
  assert.ok(statusIndex > bottomRowIndex);
  assert.ok(actionsIndex > statusIndex);
});

test("App starts in fullscreen camera mode", () => {
  const source = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const phaseInitializer = source.match(/const \[phase, setPhase\] = useState\([^)]+\);/)?.[0];

  assert.equal(phaseInitializer, "const [phase, setPhase] = useState(PHASES.FULLSCREEN_CAMERA);");
});
