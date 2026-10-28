// ---------------------------------------------------------------------------
// scroll.js - one shared scroll/pointer state.
// The 3D scenes read these values every frame, so nothing re-renders in React.
// ---------------------------------------------------------------------------
export const scrollState = { y: 0, progress: 0 };   // progress: 0 (top) .. 1 (bottom)
export const pointer = { x: 0, y: 0 };               // -1 .. 1 (mouse position)

export const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const listeners = new Set();
let running = false;

function update() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollState.y = window.scrollY;
  scrollState.progress = Math.min(1, Math.max(0, window.scrollY / max));
  document.documentElement.style.setProperty("--hero-p", String(Math.min(1, window.scrollY / window.innerHeight)));
}

function loop() {
  update();
  listeners.forEach((callback) => callback(scrollState));
  requestAnimationFrame(loop);
}

// Run `callback(scrollState)` on every animation frame. Returns a stop function.
export function onFrame(callback) {
  listeners.add(callback);
  if (!running) {
    running = true;
    window.addEventListener("pointermove", (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    });
    requestAnimationFrame(loop);
  }
  return () => listeners.delete(callback);
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
