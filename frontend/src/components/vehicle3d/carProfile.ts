/**
 * Side profile of the placeholder car, in metres. u = along the car (0 rear .. 4.2 front),
 * v = height. One source of truth for the parked SVG (CarSilhouette) and the 3D model (CarCanvas),
 * so the card does not "jump" when the 3D view fades in.
 */
export const CAR_LENGTH = 4.2;
export const CAR_HEIGHT = 1.7;

export const BODY: ReadonlyArray<readonly [number, number]> = [
  [0.05, 0.32], [0.0, 0.55], [0.12, 0.85], [0.45, 0.98], [1.15, 1.02], [1.5, 1.38], [1.85, 1.52],
  [2.55, 1.52], [2.95, 1.08], [3.65, 0.96], [4.1, 0.8], [4.2, 0.55], [4.15, 0.32],
];
export const WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [1.62, 1.04], [1.84, 1.4], [2.5, 1.4], [2.84, 1.06],
];
export const WHEEL_RADIUS = 0.36;
export const WHEEL_U: readonly number[] = [0.85, 3.35];
