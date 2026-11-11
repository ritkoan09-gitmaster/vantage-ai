"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Dashboard has its own internal overflow-y-auto scrolling container.
  // Running Lenis root smooth scroll on dashboard hijacks touch/wheel gestures on mobile!
  if (pathname?.startsWith('/dashboard')) {
    return <>{children}</>;
  }

  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.05,
        duration: 1.8,
        smoothWheel: true,
        syncTouch: false, // Prevents mobile touch scroll hijacking
        wheelMultiplier: 1.0, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      }}
    >
      <>{children}</>
    </ReactLenis>
  );
}
