"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.05, // Lower = heavier, more luxurious momentum
        duration: 1.8, // Longer glide
        smoothWheel: true,
        syncTouch: true,
        wheelMultiplier: 1.0, 
        // Custom Expo Ease-Out for cinematic deceleration
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      }}
    >
      <>{children}</>
    </ReactLenis>
  );
}