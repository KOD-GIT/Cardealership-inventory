let cached: boolean | undefined;

/** True when the browser can create a WebGL context. Probed once, then cached (contexts are scarce). */
export function supportsWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}
