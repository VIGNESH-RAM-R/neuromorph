// FaceTrackingService
// -----------------------------------------------------------------------------
// Ported verbatim from face_module/src/services/FaceTrackingService.js.
// BROWSER-ONLY -- cannot be exercised by a Node test (needs a real camera +
// WebAssembly). A thin wrapper around Google's MediaPipe Face Landmarker,
// loaded from a CDN via dynamic import (no npm install needed for this one
// heavy dependency, consistent with how every other module in this project
// handles it).
//
// PRIVACY, BY CONSTRUCTION: never stores, transmits, or exposes a video
// frame, image, or snapshot anywhere. Reads the live camera feed, runs
// on-device inference, and emits ONLY the small numeric blendshape
// coefficient object per frame. No raw pixel data ever leaves this file.

let visionModule = null;
let faceLandmarker = null;

const MODEL_ASSET_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const WASM_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

async function loadVisionTasks() {
  if (visionModule) return visionModule;
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
  visionModule = mod;
  return mod;
}

export const FaceTrackingService = {
  async initialize() {
    const { FaceLandmarker, FilesetResolver } = await loadVisionTasks();
    const filesetResolver = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: { modelAssetPath: MODEL_ASSET_URL, delegate: 'GPU' },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false,
      runningMode: 'VIDEO',
      numFaces: 1,
    });
    return true;
  },

  isReady() {
    return !!faceLandmarker;
  },

  // Must only be called AFTER explicit user consent -- this service itself
  // does not gate consent, the component layer is responsible for that.
  async requestCamera(videoElement) {
    if (!videoElement) {
      throw new Error('The camera preview element was not ready yet. Please reload the page and try again.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 480, height: 360, facingMode: 'user' },
      audio: false,
    });
    videoElement.srcObject = stream;
    await videoElement.play();
    return stream;
  },

  stopCamera(stream) {
    if (!stream) return;
    for (const track of stream.getTracks()) track.stop();
  },

  // Returns one BlendshapeFrame: { timestampMs, blendshapes }, or null if no
  // face was detected this frame -- callers should skip null frames rather
  // than treating them as zero-valued data points.
  detectFrame(videoElement, timestampMs) {
    if (!faceLandmarker) throw new Error('FaceTrackingService.initialize() must be called and awaited before detectFrame().');
    const result = faceLandmarker.detectForVideo(videoElement, timestampMs);
    if (!result.faceBlendshapes || result.faceBlendshapes.length === 0) return null;
    const categories = result.faceBlendshapes[0].categories;
    const blendshapes = {};
    for (const c of categories) blendshapes[c.categoryName] = c.score;
    return { timestampMs, blendshapes };
  },

  dispose() {
    if (faceLandmarker) {
      faceLandmarker.close();
      faceLandmarker = null;
    }
  },
};
