import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

function getRuleBody(selector) {
  const escapedSelector = selector.replaceAll(".", "\\.");
  const match = styles.match(new RegExp(`(?:^|})[^{}]*${escapedSelector}[^{}]*\\{([^}]*)\\}`));
  assert.ok(match, `Expected ${selector} rule to exist`);
  return match[1];
}

test("fullscreen launcher hovered tiles use a full-card progress fill", () => {
  const tileFillRule = getRuleBody(".fullscreen-camera-mode-landing-box::before");
  const backFillRule = getRuleBody(".fullscreen-camera-landing-back::before");

  for (const ruleBody of [tileFillRule, backFillRule]) {
    assert.match(ruleBody, /height:\s*100%/);
    assert.match(ruleBody, /width:\s*calc\(var\(--hold-progress,\s*0\)\s*\*\s*100%\)/);
    assert.match(ruleBody, /background:\s*linear-gradient\(90deg,\s*rgba\(14,\s*165,\s*233,\s*0\.58\),\s*rgba\(34,\s*211,\s*238,\s*0\.38\)\)/);
    assert.match(ruleBody, /mix-blend-mode:\s*screen/);
    assert.match(ruleBody, /pointer-events:\s*none/);
    assert.match(ruleBody, /z-index:\s*3/);
  }

  const activeRule = getRuleBody(".fullscreen-camera-mode-landing-box.active");
  assert.match(activeRule, /background:\s*rgba\(12,\s*44,\s*72,\s*0\.9\)/);

  const progressEdgeRule = getRuleBody(".fullscreen-camera-mode-landing-box::after");
  assert.match(progressEdgeRule, /z-index:\s*4/);
});

test("fullscreen launcher tiles constrain icons and labels inside the box", () => {
  const boxRule = getRuleBody(".fullscreen-camera-mode-landing-box");
  assert.match(boxRule, /gap:\s*clamp\(3px,\s*calc\(7px\s*\*\s*var\(--landing-scale,\s*1\)\),\s*8px\)/);
  assert.match(boxRule, /overflow:\s*hidden/);
  assert.match(boxRule, /padding:\s*clamp\(5px,\s*calc\(8px\s*\*\s*var\(--landing-scale,\s*1\)\),\s*10px\)/);

  const titleRule = getRuleBody(".fullscreen-camera-mode-landing-title");
  assert.match(titleRule, /font-size:\s*clamp\(0\.75rem,\s*calc\(1\.125rem\s*\*\s*var\(--landing-scale,\s*1\)\),\s*1\.2rem\)/);
  assert.match(titleRule, /max-height:\s*2\.18em/);
  assert.match(titleRule, /overflow:\s*hidden/);
  assert.match(titleRule, /overflow-wrap:\s*anywhere/);
  assert.match(titleRule, /-webkit-line-clamp:\s*2/);

  const imageRule = getRuleBody(".fullscreen-camera-mode-preview-image");
  assert.match(imageRule, /height:\s*clamp\(45px,\s*calc\(58px\s*\*\s*var\(--landing-scale,\s*1\)\),\s*70px\)/);
  assert.match(imageRule, /width:\s*clamp\(45px,\s*calc\(58px\s*\*\s*var\(--landing-scale,\s*1\)\),\s*70px\)/);
  assert.match(imageRule, /max-width:\s*100%/);
  assert.match(imageRule, /object-fit:\s*contain/);
});
