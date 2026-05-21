export function getFullscreenRingLayersForHand(baseLayers, handLabel) {
  const layers = Array.isArray(baseLayers) ? baseLayers : [];
  const rightHandOrder = layers.slice().reverse();

  return handLabel === "Left" ? layers : rightHandOrder;
}
