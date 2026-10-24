import { BODY, CAR_HEIGHT, CAR_LENGTH, WHEEL_RADIUS, WHEEL_U, WINDOWS } from "./carProfile";

const toPath = (pts: ReadonlyArray<readonly [number, number]>) =>
  // Mirror u so the car faces LEFT (front on the left) and flip v for SVG's downward y axis.
  pts.map(([u, v], i) => `${i ? "L" : "M"}${(CAR_LENGTH - u).toFixed(3)} ${(CAR_HEIGHT - v).toFixed(3)}`).join(" ") + " Z";

/** Static side-view car used for the "parked" state and for table thumbnails. Decorative. */
export function CarSilhouette({ color, muted = false, className = "" }: { color: string; muted?: boolean; className?: string }) {
  const body = muted ? "#9AA4B2" : color;
  return (
    <svg viewBox={`-0.1 0 ${CAR_LENGTH + 0.2} ${CAR_HEIGHT + 0.05}`} className={className} aria-hidden="true" focusable="false">
      <ellipse cx={CAR_LENGTH / 2} cy={CAR_HEIGHT} rx={CAR_LENGTH / 2 + 0.05} ry="0.07" fill="#12161C" opacity="0.16" />
      <path d={toPath(BODY)} fill={body} />
      <path d={toPath(WINDOWS)} fill={muted ? "#C7CEDA" : "#CFE6EA"} opacity="0.92" />
      <circle cx="0.12" cy={CAR_HEIGHT - 0.72} r="0.07" fill="#FFF3C4" />
      {WHEEL_U.map((u) => (
        <g key={u}>
          <circle cx={CAR_LENGTH - u} cy={CAR_HEIGHT - WHEEL_RADIUS} r={WHEEL_RADIUS} fill="#12161C" />
          <circle cx={CAR_LENGTH - u} cy={CAR_HEIGHT - WHEEL_RADIUS} r={WHEEL_RADIUS * 0.5} fill="#C8D0DB" />
        </g>
      ))}
    </svg>
  );
}
