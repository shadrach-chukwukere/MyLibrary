// MediaManager.js
// A safe, modern manager for camera + screen capture
// Supports optional torch (mobile), audio, facingMode, and robust cleanup.

/**
 * MediaManager
 * Usage:
 *   const mgr = new MediaManager("camera");
 *   await mgr.start({ audio: true, facingMode: "user", torch: false });
 *   // ... use mgr.getStream()
 *   await mgr.toggleTorch(true);
 *   mgr.stop();
 */

export class MediaManager {
  constructor(source = "camera") {
    this.source = source; // "camera" | "screen"
    this.stream = null;
    this.videoTrack = null;
  }

  /** Quick runtime check for required APIs */
  static isSupported() {
    const md =
      typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    return !!(md && (md.getUserMedia || md.getDisplayMedia));
  }

  getStream() {
    return this.stream;
  }

  /** Start capture for camera or screen. Returns MediaStream or null on failure. */
  async start(opts = {}) {
    if (!MediaManager.isSupported()) {
      console.error(
        "MediaManager: mediaDevices APIs not supported in this environment."
      );
      return null;
    }

    // Stop any previous stream first
    this.stop();

    try {
      if (this.source === "screen") {
        // Screen share mode
        const constraints = {
          video: opts.video ?? true,
          audio: opts.audio ?? false,
        };

        // Some browsers restrict audio capture for screen sharing
        this.stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } else {
        // Camera mode
        const videoConstraint =
          typeof opts.video === "object"
            ? opts.video
            : opts.video === false
            ? false
            : { facingMode: opts.facingMode || "user" };

        const constraints = {
          audio: opts.audio ?? false,
          video: videoConstraint ?? true,
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      // store primary video track if present and attach end listeners
      this.videoTrack = this.stream.getVideoTracks()[0] || null;
      if (this.videoTrack) {
        this.videoTrack.addEventListener("ended", () => {
          this.stop();
        });
      }

      return this.stream;
    } catch (err) {
      console.error("MediaManager.start error:", err);
      this.stop();
      return null;
    }
  }

  /** Stop and release all tracks and reset internal state */
  stop() {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            // ignore errors
          }
        });
      }
    } finally {
      this.stream = null;
      this.videoTrack = null;
    }
  }

  /**
   * Toggle torch (flashlight) if supported.
   * Returns true if the request was attempted & succeeded, false otherwise.
   */
  async toggleTorch(on) {
    if (!this.videoTrack) {
      console.warn("MediaManager.toggleTorch: no active video track.");
      return false;
    }

    const caps =
      (this.videoTrack.getCapabilities && this.videoTrack.getCapabilities()) ||
      {};

    if (!("torch" in caps)) {
      console.warn(
        "MediaManager.toggleTorch: torch capability not available on this device."
      );
      return false;
    }

    try {
      await this.videoTrack.applyConstraints({
        advanced: [{ torch: !!on }],
      });
      return true;
    } catch (err) {
      console.warn(
        "MediaManager.toggleTorch: failed to apply torch constraint:",
        err
      );
      return false;
    }
  }
}
