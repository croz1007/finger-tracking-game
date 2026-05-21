import { FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID } from "../fullscreenModeLanding.js";

function getLandingBoxStyle(box, holdProgress = 0) {
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    "--hold-progress": holdProgress,
    "--preview-accent": box.accent,
  };
}

export function WebcamBackground({ videoRef, overlayCanvasRef, cameraObjectFit }) {
  return (
    <>
      <video
        ref={videoRef}
        className="camera-video fullscreen-camera-video"
        style={{ objectFit: cameraObjectFit }}
        playsInline
        muted
        autoPlay
      />
      <canvas ref={overlayCanvasRef} className="camera-overlay" />
    </>
  );
}

function LandingHeader() {
  return (
    <header className="fullscreen-camera-landing-header">
      <div className="fullscreen-camera-landing-title-row">
        <span className="fullscreen-camera-landing-hand-mark" aria-hidden="true" />
        <div>
          <h1>Finger Tracking Demos</h1>
          <p>Hover your index finger over any demo to launch it</p>
        </div>
      </div>
      <span className="fullscreen-camera-landing-instruction">
        <span className="fullscreen-camera-landing-clock" aria-hidden="true" />
        Hover for 1 second to select
      </span>
    </header>
  );
}

export function DemoSection({ section }) {
  return (
    <section
      className={`fullscreen-camera-landing-panel ${section.kind}`}
      style={{
        left: `${section.left}px`,
        top: `${section.top}px`,
        width: `${section.width}px`,
        height: `${section.height}px`,
        "--panel-padding": `${section.padding}px`,
      }}
    >
      <h2>
        <span
          className={`fullscreen-camera-landing-section-icon ${section.icon}`}
          aria-hidden="true"
        />
        {section.title}
      </h2>
    </section>
  );
}

export function DemoTile({ item, active, holdProgress, onSelect }) {
  return (
    <button
      key={item.id}
      aria-label={`Open ${item.label}`}
      className={`fullscreen-camera-mode-landing-box ${item.kind} ${active ? "active" : ""}`}
      data-route={item.route}
      onClick={(event) => onSelect(event, item.id)}
      type="button"
      style={getLandingBoxStyle(item, active ? holdProgress : 0)}
    >
      {item.iconSrc ? (
        <img
          className="fullscreen-camera-mode-preview-image"
          src={item.iconSrc}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <span
          className={`fullscreen-camera-mode-preview ${item.previewType}`}
          aria-hidden="true"
        />
      )}
      <span className="fullscreen-camera-mode-landing-title">{item.label}</span>
    </button>
  );
}

function BackToInputTestButton({ item, active, holdProgress, onSelect }) {
  if (!item) {
    return null;
  }

  return (
    <button
      className={`fullscreen-camera-landing-back ${active ? "active" : ""}`}
      data-route={item.route}
      onClick={(event) => onSelect(event, item.id)}
      style={getLandingBoxStyle(item, active ? holdProgress : 0)}
      type="button"
    >
      <span className="fullscreen-camera-landing-back-content">
        <span aria-hidden="true">←</span>
        Back to Input Test
      </span>
    </button>
  );
}

export function FooterStatus({ handDetected, fps }) {
  return (
    <div className="fullscreen-camera-landing-footer">
      <span className={`fullscreen-camera-landing-status ${handDetected ? "ok" : "warn"}`}>
        <span className="fullscreen-camera-landing-status-dot" aria-hidden="true" />
        {handDetected ? "Tracking Active" : "Hand not detected"}
        <span className="fullscreen-camera-landing-status-separator" />
        FPS: {Math.round(fps)}
      </span>
      <span className="fullscreen-camera-landing-helper">
        Point your <strong>index finger</strong> to explore
      </span>
    </div>
  );
}

function IndexFingerMarker({ state }) {
  if (!state?.pointerActive) {
    return null;
  }

  return (
    <span
      className="fullscreen-camera-landing-fingertip-marker"
      style={{
        left: `${state.pointerX}px`,
        top: `${state.pointerY}px`,
      }}
      aria-hidden="true"
    />
  );
}

function HandSkeletonOverlay({ skeleton, width, height }) {
  const hands = skeleton?.hands ?? [];
  if (hands.length === 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  return (
    <svg
      className="fullscreen-camera-landing-skeleton"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {hands.map((hand) => (
        <g key={hand.id}>
          {hand.connections.map((connection, index) => (
            <line
              key={`${hand.id}-bone-${index}`}
              className="fullscreen-camera-landing-skeleton-bone"
              x1={connection.start.x}
              y1={connection.start.y}
              x2={connection.end.x}
              y2={connection.end.y}
            />
          ))}
          {hand.joints
            .filter((joint) => joint.index !== 8)
            .map((joint) => (
              <circle
                key={`${hand.id}-joint-${joint.index}`}
                className="fullscreen-camera-landing-skeleton-joint"
                cx={joint.x}
                cy={joint.y}
                r="3"
              />
            ))}
          {hand.indexTip ? (
            <circle
              className="fullscreen-camera-landing-skeleton-index-tip"
              cx={hand.indexTip.x}
              cy={hand.indexTip.y}
              r="5"
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export default function FullscreenLandingPage({
  viewportStyle,
  layout,
  state,
  holdProgress,
  handDetected,
  fps,
  onSelect,
  onScrollOffsetChange,
}) {
  const demoItems =
    layout?.boxes?.filter((box) => box.id !== FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID) ?? [];
  const backItem =
    layout?.boxes?.find((box) => box.id === FULLSCREEN_CAMERA_BACK_TO_INPUT_TEST_ID) ?? null;

  return (
    <div
      className="fullscreen-camera-mode-landing"
      style={{
        ...(viewportStyle ?? {}),
        "--landing-scale": layout?.scale ?? 1,
      }}
      onScroll={(event) => {
        onScrollOffsetChange?.(event.currentTarget.scrollTop);
      }}
    >
      <LandingHeader />
      <HandSkeletonOverlay
        skeleton={state?.skeleton}
        width={layout?.width}
        height={layout?.height}
      />
      {(layout?.sections ?? []).map((section) => (
        <DemoSection key={section.id} section={section} />
      ))}
      {demoItems.map((item) => (
        <DemoTile
          key={item.id}
          item={item}
          active={state?.holdModeId === item.id}
          holdProgress={holdProgress}
          onSelect={onSelect}
        />
      ))}
      <BackToInputTestButton
        item={backItem}
        active={state?.holdModeId === backItem?.id}
        holdProgress={holdProgress}
        onSelect={onSelect}
      />
      <IndexFingerMarker state={state} />
      <FooterStatus handDetected={handDetected} fps={fps} />
    </div>
  );
}
