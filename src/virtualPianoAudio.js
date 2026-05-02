let sharedContext = null;

function getAudioContext() {
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContext();
  }
  if (sharedContext.state === "suspended") {
    sharedContext.resume();
  }
  return sharedContext;
}

// Starts a sustained piano note. Returns a stop() function to trigger release.
// Multiple simultaneous calls are fully independent (true polyphony).
export function startPianoNote(freq) {
  let ctx;
  try {
    ctx = getAudioContext();
  } catch {
    return () => {};
  }

  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.42, now + 0.010); // sharp attack
  masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.14); // decay to sustain
  // stays at sustain until stop() is called
  masterGain.connect(ctx.destination);

  // Fundamental — triangle (warm, piano-like)
  const osc1 = ctx.createOscillator();
  osc1.type = "triangle";
  osc1.frequency.value = freq;
  osc1.connect(masterGain);
  osc1.start(now);

  // 2nd harmonic — adds presence
  const gain2 = ctx.createGain();
  gain2.gain.value = 0.16;
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2;
  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc2.start(now);

  // 3rd harmonic — subtle shimmer
  const gain3 = ctx.createGain();
  gain3.gain.value = 0.06;
  const osc3 = ctx.createOscillator();
  osc3.type = "sine";
  osc3.frequency.value = freq * 3;
  osc3.connect(gain3);
  gain3.connect(masterGain);
  osc3.start(now);

  let stopped = false;
  // Safety: auto-release after 8 seconds if stop() is never called
  const autoRelease = setTimeout(() => stop(), 8000);

  function stop() {
    if (stopped) return;
    stopped = true;
    clearTimeout(autoRelease);

    const t = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(t);
    masterGain.gain.setValueAtTime(masterGain.gain.value, t);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    const off = t + 0.32;
    try { osc1.stop(off); } catch {}
    try { osc2.stop(off); } catch {}
    try { osc3.stop(off); } catch {}
  }

  return stop;
}

export function closePianoAudio() {
  if (sharedContext && sharedContext.state !== "closed") {
    sharedContext.close();
    sharedContext = null;
  }
}
