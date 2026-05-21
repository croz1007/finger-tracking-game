# Finger Tracking Game

Finger Tracking Game is a webcam-driven hand- and pose-tracking playground built with React, Vite, and TensorFlow.js. It includes a calibration hub, multiple games and labs, fullscreen camera overlays, and a separate Circle of Fifths instrument page.

## What Is In This Repo

### Main app (`/`)

- **Calibration Input Test**: the hub for camera/model readiness, live overlays, calibration controls, and navigation.
- **Core modes**: Whack-a-Mole, Pinch Sandbox, Track Runner, Star Flight, Conveyor Toss, Roulette, and Spatial Gesture Memory.
- **Labs**: Body Pose Lab, Off-Axis Forest Walk, Minority Report Lab, Gesture Analytics Lab, Gesture Art Lab, and Gesture Control OS.
- **Fullscreen Camera**: the home screen, a fullscreen webcam playground with a dwell-select landing page. The menu waits until all five fingertips are recognized before using the hover cursor, then a 1.00 second index-fingertip hold launches visual overlays (`Squares`, `Hex`, `Voronoi`, `Rings`, `Pulse`, `Tip Ripples`, `Static`) or webcam-backed games (`Hand Bounce`, `Brick Dodger`, `Breakout Co-op`, `Breakout`, `Find Your Grind`, `Finger Pong`, `Tic Tac Toe`, `Slice Air`, `Sky Patrol`, `Fingerprint Worlds`, `Invaders`, `Flappy`, `Missile Command`). `Tip Ripples` continuously breathes from thin rings to thick ripple bands while the demo is active. `Sky Patrol` now renders on a cached canvas playfield for smoother vertical scrolling. Every non-menu fullscreen mode also includes a top-right `Exit` box that returns to the landing menu after the same 1.00 second verified-hand hold.

### Secondary page (`/circle-of-fifths.html`)

- A dedicated fullscreen Circle of Fifths instrument.
- One-hand index-finger tracking steers chord selection.
- Pinch interactions choose drum presets and adjust BPM.
- Uses webcam input and browser audio output.
## Requirements

- Node.js 18 or newer
- npm
- Webcam access
- A modern desktop Chromium browser is recommended
- Internet access when hand tracking starts, because the default MediaPipe Hands runtime loads assets from `https://cdn.jsdelivr.net/npm/@mediapipe/hands`

## Install And Run

For normal local use, you do not need Symphony or any backend service.

If you want a clean lockfile install, use:

```bash
npm ci
npm run dev
```

If you prefer, `npm install` works too.

Then:

1. Open the local URL printed by Vite. It is usually `http://localhost:5173`, but Vite will pick another port if that one is busy.
2. Allow camera access when the browser asks.
3. Wait for the camera stream and tracking model to initialize.
4. The app starts on the **Fullscreen Camera** landing screen.

From the **Calibration Input Test** hub, available from the fullscreen landing menu:

- **Start Calibration** runs the 9-point affine calibration used by pointer-driven modes such as Whack-a-Mole.
- **Start Lazy Arc Calibration** captures a sweep-based calibration and then launches Track Runner.
- **Open Fullscreen Camera** returns to the fullscreen overlay and mini-game playground.
- **Open Circle of Fifths Page** opens the separate instrument page at `/circle-of-fifths.html`.

To preview the production build locally:

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev`: starts the Vite dev server and writes verbose logs to `logs/`
- `npm run build`: builds both `index.html` and `circle-of-fifths.html` into `dist/`
- `npm run preview`: serves the built output locally
- `npm test`: runs the Node test suite
- `npm run symphony`: launches the optional Symphony workflow wrapper

## Tracking, Logging, And Persistence

- Hand tracking starts with the MediaPipe Hands runtime and can probe or fall back to TFJS backends when needed.
- Body Pose Lab and Off-Axis Forest Walk use pose detection rather than the hand-tracking flow.
- Calibration is stored in `localStorage` under `fingerTrackingGame.calibration.v2`.
- Verbose browser/runtime events are written to timestamped files in `logs/` only while running `npm run dev`.

## Optional Symphony Setup

This repository includes Symphony-specific files, but they are not required to run the app itself.

To use `npm run symphony`:

1. Have a built local Symphony checkout at `${SYMPHONY_REPO:-$HOME/repos/symphony}` so `elixir/bin/symphony` exists.
2. Make Codex available through `CODEX_BIN`, `codex` on `PATH`, or `/Applications/Codex.app/Contents/Resources/codex`.
3. Set `TRACKER_API_KEY` if you do not want the launcher default of `dev-key`.
4. Optionally override `TARGET_REPO_URL`, `SYMPHONY_DASHBOARD_PORT` (default `4101`), `SYMPHONY_LOCAL_REPO_PATH`, or `SYMPHONY_MERGE_BASE`.
5. Run `npm run symphony`.

## Troubleshooting

- **No camera prompt appears**: check browser and OS camera permissions, and make sure another app is not exclusively holding the webcam.
- **The page loads but hand tracking does not start**: keep internet access available for the MediaPipe asset load, and retry in Chrome or another Chromium browser with WebGL enabled.
- **The cursor feels off**: rerun calibration and keep your hand fully visible while capturing.
- **Tracking is noisy or slow**: improve lighting, reduce background clutter, and close other GPU-heavy browser tabs.
- **The Circle of Fifths page is silent**: confirm the browser allows audio playback and interact with the page so the `AudioContext` can start.
