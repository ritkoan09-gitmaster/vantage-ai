"use client";

import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // ALPHA: FALSE - Forces raw GPU background rendering
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // We store the exact number of particles so we don't calculate .length in the loop
    let particleCount = 0; 
    let particles: Particle[] = [];
    
    const mouse = { x: width / 2, y: height / 2, radiusSq: 40000 }; // 200 * 200 pre-calculated

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    // PRE-COMPUTED HEX STRINGS: Eliminates rgba() string generation in the render loop
    const colors = ['#00f0ff', '#ff00ff', '#4f46e5'];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    const blockRender = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100); 
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('wheel', blockRender, { passive: true });
    window.addEventListener('touchmove', blockRender, { passive: true });
    window.addEventListener('scroll', blockRender, { passive: true });

    class Particle {
      x: number; y: number;
      dx: number; dy: number;
      size: number;
      baseSize: number;
      colorHex: string; // Storing static string to save memory
      depth: number;

      constructor(x: number, y: number, dx: number, dy: number, size: number) {
        this.x = x; 
        this.y = y;
        this.dx = dx; 
        this.dy = dy;
        this.size = size;
        this.baseSize = size;
        this.colorHex = colors[Math.floor(Math.random() * colors.length)];
        this.depth = size / 3; 
      }

      // Memory Efficient Draw: No dynamic strings, no shadows
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.globalAlpha = 0.8; 
        ctx.fillStyle = this.colorHex;
        ctx.fill();
      }

      update() {
        if (this.x > width || this.x < 0) this.dx = -this.dx;
        if (this.y > height || this.y < 0) this.dy = -this.dy;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        
        // NO MATH.SQRT() - Using squared distance for raw speed
        const distSq = dx * dx + dy * dy;
        
        if (distSq < mouse.radiusSq) {
          const distance = Math.sqrt(distSq); // Only compute root if colliding
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          // Fixed interaction radius to 200 for math calculation
          const force = (200 - distance) / 200; 
          
          const directionX = forceDirectionX * force * this.depth * 5.0; // Hyper-fast reaction
          const directionY = forceDirectionY * force * this.depth * 5.0;
          this.x -= directionX;
          this.y -= directionY;
          
          if (this.size < this.baseSize * 2) this.size += 0.2;
        } else {
          if (this.size > this.baseSize) this.size -= 0.1;
          this.x += this.dx * this.depth;
          this.y += this.dy * this.depth;
        }
        this.draw();
      }
    }

    function init() {
      particles = [];
      particleCount = Math.floor((width * height) / 8000); // Optimized density
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 2.5 + 0.5; 
        const x = Math.random() * (innerWidth - size * 2) + size * 2;
        const y = Math.random() * (innerHeight - size * 2) + size * 2;
        // Increased ambient drift speed
        const dx = (Math.random() - 0.5) * 3.0; 
        const dy = (Math.random() - 0.5) * 3.0;
        particles.push(new Particle(x, y, dx, dy, size));
      }
    }

    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      
      // Hardware scroll lock
      if (!ctx || isScrolling) return; 
      
      // Solid fill instead of rgba string for the trailing effect
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000000'; 
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = 1.2;

      for (let i = 0; i < particleCount; i++) {
        const p1 = particles[i];
        p1.update();
        
        for (let j = i; j < particleCount; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          
          const distSq = dx * dx + dy * dy;
          
          // 22500 is 150 squared. Bypasses Math.sqrt() entirely.
          if (distSq < 22500) {
            ctx.beginPath();
            
            // ZERO ALLOCATION OPACITY: Uses native globalAlpha instead of building strings
            ctx.globalAlpha = 1 - (distSq / 22500); 
            ctx.strokeStyle = p1.colorHex; // Uses static memory string
            
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0; // Reset alpha
    }

    init();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', blockRender);
      window.removeEventListener('touchmove', blockRender);
      window.removeEventListener('scroll', blockRender);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      // Hardware-accelerated, untouchable GPU layer
      className="fixed inset-0 z-0 opacity-100 pointer-events-none transform-gpu will-change-transform" 
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    />
  );
}