import { useState } from "react";
import type { Vehicle } from "../../types";
import { carColor } from "../../lib/carColor";
import { CarSilhouette } from "../vehicle3d/CarSilhouette";

/**
 * What a card shows while the car is parked: the vehicle's own image when it has one that loads,
 * otherwise the side-view silhouette cropped at the right edge (only the nose is visible).
 */
export function ParkedVisual({ vehicle, muted = false }: { vehicle: Vehicle; muted?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (vehicle.image_url && !imageFailed) {
    return (
      <img
        src={vehicle.image_url} alt="" loading="lazy" onError={() => setImageFailed(true)}
        className={`h-full w-full object-cover object-right ${muted ? "grayscale" : ""}`}
      />
    );
  }
  return (
    <CarSilhouette
      color={carColor(vehicle.id)} muted={muted}
      className="absolute bottom-[22%] left-[50%] w-[148%] translate-y-[3%]"
    />
  );
}
