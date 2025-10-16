// UnifiedMediaManager.d.ts
// Type declarations for UnifiedMediaManager.js

export type MediaSource = "camera" | "screen";
export type FacingMode = "user" | "environment";

export interface CameraOptions {
  audio?:
    | boolean
    | MediaTrackConstraints["deviceId" | "autoGainControl" | "channelCount"]
    | any;
  video?: boolean | MediaTrackConstraints;
  facingMode?: FacingMode;
  torch?: boolean;
}

export interface ScreenOptions {
  audio?: boolean | MediaStreamConstraints["audio"];
  video?: boolean | MediaStreamConstraints["video"];
}

/**
 * UnifiedMediaManager
 * A unified manager for camera and screen capture.
 */
export declare class MediaManager {
  /** Create a new UnifiedMediaManager for "camera" or "screen" */
  constructor(source?: MediaSource);

  /** Check if media capture APIs are supported */
  static isSupported(): boolean;

  /** Get the active media stream (if any) */
  getStream(): MediaStream | null;

  /** Start capture for the given source with optional settings */
  start(opts?: CameraOptions | ScreenOptions): Promise<MediaStream | null>;

  /** Stop and release all tracks */
  stop(): void;

  /**
   * Toggle torch (flashlight) on supported mobile cameras.
   * @returns true if successful, false otherwise
   */
  toggleTorch(on: boolean): Promise<boolean>;
}
