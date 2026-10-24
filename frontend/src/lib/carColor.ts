const PALETTE = ["#0E6B66", "#243B6B", "#2F6B3F", "#B45309", "#1F2937", "#7C2D12", "#475569", "#9F1239"];

/** Stable paint colour per vehicle id, so a car looks the same on the card, in 3D and in admin. */
export function carColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}
