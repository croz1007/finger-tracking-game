import test from "node:test";
import assert from "node:assert/strict";
import {
  getCameraVideoKeepAliveAction,
  getStaleInferenceKeepAliveAction,
  shouldRunTrackingKeepAlive,
} from "../src/trackingKeepAlive.js";

function createStream(trackReadyState = "live") {
  return {
    getVideoTracks() {
      return [{ readyState: trackReadyState }];
    },
  };
}

test("camera video keep-alive leaves a healthy active video alone", () => {
  const stream = createStream();
  const video = {
    srcObject: stream,
    paused: false,
    ended: false,
    readyState: 4,
  };

  assert.deepEqual(
    getCameraVideoKeepAliveAction({ video, stream, attachedVideoElement: video }),
    {
      shouldAttach: false,
      reason: "healthy",
      readyState: 4,
      paused: false,
      ended: false,
      trackCount: 1,
      liveTrackCount: 1,
      srcObjectChanged: false,
      activeElementChanged: false,
      playbackPaused: false,
      waitingForVideoData: false,
    },
  );
});

test("camera video keep-alive resumes paused playback on the live stream", () => {
  const stream = createStream();
  const video = {
    srcObject: stream,
    paused: true,
    ended: false,
    readyState: 4,
  };

  const action = getCameraVideoKeepAliveAction({
    video,
    stream,
    attachedVideoElement: video,
  });

  assert.equal(action.shouldAttach, true);
  assert.equal(action.reason, "playback_paused");
  assert.equal(action.playbackPaused, true);
});

test("camera video keep-alive reattaches when fullscreen swaps the active video element", () => {
  const stream = createStream();
  const previousVideo = { srcObject: stream, paused: false, ended: false, readyState: 4 };
  const nextVideo = { srcObject: stream, paused: false, ended: false, readyState: 4 };

  const action = getCameraVideoKeepAliveAction({
    video: nextVideo,
    stream,
    attachedVideoElement: previousVideo,
  });

  assert.equal(action.shouldAttach, true);
  assert.equal(action.reason, "active_video_element_changed");
});

test("stale inference keep-alive recovers only after the stale window and cooldown", () => {
  assert.equal(
    getStaleInferenceKeepAliveAction({
      now: 12000,
      inferenceBusy: true,
      inferenceStartedAt: 5000,
      staleMs: 8000,
    }).shouldRecover,
    false,
  );

  assert.equal(
    getStaleInferenceKeepAliveAction({
      now: 14000,
      inferenceBusy: true,
      inferenceStartedAt: 5000,
      staleMs: 8000,
    }).shouldRecover,
    true,
  );

  const coolingDown = getStaleInferenceKeepAliveAction({
    now: 14000,
    inferenceBusy: true,
    inferenceStartedAt: 5000,
    lastRecoveryAt: 10000,
    staleMs: 8000,
    cooldownMs: 30000,
  });
  assert.equal(coolingDown.shouldRecover, false);
  assert.equal(coolingDown.reason, "recovery_cooldown");
});

test("tracking keep-alive scheduler runs immediately and then on its interval", () => {
  assert.equal(shouldRunTrackingKeepAlive({ now: 1000, lastRunAt: 0, intervalMs: 5000 }), true);
  assert.equal(
    shouldRunTrackingKeepAlive({ now: 4000, lastRunAt: 1000, intervalMs: 5000 }),
    false,
  );
  assert.equal(
    shouldRunTrackingKeepAlive({ now: 6000, lastRunAt: 1000, intervalMs: 5000 }),
    true,
  );
});
