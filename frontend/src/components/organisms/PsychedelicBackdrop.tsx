import type { ReactNode } from "react";

interface PsychedelicBackdropProps {
  children: ReactNode;
}

export function PsychedelicBackdrop({ children }: PsychedelicBackdropProps) {
  return (
    <div className="trip-scene">
      <div className="trip-scene__aurora" aria-hidden="true" />
      <div className="trip-scene__orb trip-scene__orb--one" aria-hidden="true" />
      <div className="trip-scene__orb trip-scene__orb--two" aria-hidden="true" />
      <div className="trip-scene__orb trip-scene__orb--three" aria-hidden="true" />
      <div className="trip-scene__grid" aria-hidden="true" />
      {children}
    </div>
  );
}
