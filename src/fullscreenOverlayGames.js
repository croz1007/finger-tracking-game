export function runFullscreenOverlayGameUpdates(
  timestamp,
  {
    updateFullscreenModeLandingSimulation,
    updateFullscreenExitControlSimulation,
    updateFullscreenRestartControlSimulation,
    updateFullscreenHandBounceSimulation,
    updateFullscreenBrickDodgerSimulation,
    updateFullscreenBreakoutSimulation,
    updateFullscreenBreakoutCoopSimulation,
    updateFullscreenFingerPongSimulation,
    updateFullscreenSkyPatrolSimulation,
    updateFullscreenWfcWorldSimulation,
    updateFullscreenInvadersSimulation,
    updateFullscreenFlappySimulation,
    updateFullscreenMissileCommandSimulation,
    updateFullscreenTicTacToeSimulation,
    updateFullscreenVirtualPianoSimulation,
  } = {},
) {
  if (typeof updateFullscreenModeLandingSimulation === "function") {
    updateFullscreenModeLandingSimulation(timestamp);
  }

  if (typeof updateFullscreenExitControlSimulation === "function") {
    updateFullscreenExitControlSimulation(timestamp);
  }

  if (typeof updateFullscreenRestartControlSimulation === "function") {
    updateFullscreenRestartControlSimulation(timestamp);
  }

  if (typeof updateFullscreenHandBounceSimulation === "function") {
    updateFullscreenHandBounceSimulation(timestamp);
  }

  if (typeof updateFullscreenBrickDodgerSimulation === "function") {
    updateFullscreenBrickDodgerSimulation(timestamp);
  }

  if (typeof updateFullscreenBreakoutSimulation === "function") {
    updateFullscreenBreakoutSimulation(timestamp);
  }

  if (typeof updateFullscreenBreakoutCoopSimulation === "function") {
    updateFullscreenBreakoutCoopSimulation(timestamp);
  }

  if (typeof updateFullscreenFingerPongSimulation === "function") {
    updateFullscreenFingerPongSimulation(timestamp);
  }

  if (typeof updateFullscreenSkyPatrolSimulation === "function") {
    updateFullscreenSkyPatrolSimulation(timestamp);
  }

  if (typeof updateFullscreenWfcWorldSimulation === "function") {
    updateFullscreenWfcWorldSimulation(timestamp);
  }

  if (typeof updateFullscreenInvadersSimulation === "function") {
    updateFullscreenInvadersSimulation(timestamp);
  }

  if (typeof updateFullscreenFlappySimulation === "function") {
    updateFullscreenFlappySimulation(timestamp);
  }

  if (typeof updateFullscreenMissileCommandSimulation === "function") {
    updateFullscreenMissileCommandSimulation(timestamp);
  }

  if (typeof updateFullscreenTicTacToeSimulation === "function") {
    updateFullscreenTicTacToeSimulation(timestamp);
  }

  if (typeof updateFullscreenVirtualPianoSimulation === "function") {
    updateFullscreenVirtualPianoSimulation(timestamp);
  }
}
