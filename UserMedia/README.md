# @chispecial/user_media

A unified, browser-safe media manager for camera and screen capture — with optional **torch (flashlight)**, **audio**, and automatic cleanup handling.

---

## 📦 Installation

```bash
npm install @chispecial/user_media

import { UnifiedMediaManager } from "@chispecial/user_media";

(async () => {
  // Create instance for camera or screen
  const media = new UnifiedMediaManager("camera");

  // Start camera with audio and user-facing mode
  const stream = await media.start({ audio: true, facingMode: "user" });

  // Attach stream to a video element
  if (stream) {
    const video = document.querySelector("video");
    video.srcObject = stream;
    video.play();
  }

  // Toggle flashlight (mobile devices only)
  await media.toggleTorch(true);

  // Stop the stream when done
  media.stop();
})();


```
