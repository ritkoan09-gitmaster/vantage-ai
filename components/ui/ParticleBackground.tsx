'use client';

import { useEffect, useRef } from 'react';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    let pulses: { p1: Particle; p2: Particle; progress: number; speed: number }[] = [];

    const setCanvasDimensions = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const PARTICLE_COUNT = 100; 
    const CONNECTION_DISTANCE = 180; 
    const MOUSE_REPULSION_RADIUS = 200; 
    const SPRING_TENSION = 0.03; 
    const FRICTION = 0.85; 

    class Particle {
      x!: number;
      y!: number;
      vx!: number;
      vy!: number;
      anchorX!: number;
      anchorY!: number;
      anchorVx!: number;
      anchorVy!: number;
      size!: number;
      opacity!: number;
      shineOffset!: number;

      constructor() {
        this.reset();
      }

      reset() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.anchorX = this.x;
        this.anchorY = this.y;
        this.vx = 0;
        this.vy = 0;
        
        this.anchorVx = (Math.random() - 0.5) * 0.25;
        this.anchorVy = (Math.random() - 0.5) * 0.25;
        
        this.size = Math.random() * 2 + 1; 
        this.opacity = Math.random() * 0.7 + 0.5; // Maxed out base opacity
        this.shineOffset = Math.random() * 2; // Staggers the 2-second flash across particles
      }

      update() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.anchorX += this.anchorVx;
        this.anchorY += this.anchorVy;

        if (this.anchorX <= 0 || this.anchorX >= w) this.anchorVx *= -1;
        if (this.anchorY <= 0 || this.anchorY >= h) this.anchorVy *= -1;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.hypot(dx, dy);

        if (distance < MOUSE_REPULSION_RADIUS) {
          const force = (1 - distance / MOUSE_REPULSION_RADIUS) * 1.5;
          this.vx += (dx / distance) * force;
          this.vy += (dy / distance) * force;
        }

        this.vx += (this.anchorX - this.x) * SPRING_TENSION;
        this.vy += (this.anchorY - this.y) * SPRING_TENSION;

        this.vx *= FRICTION;
        this.vy *= FRICTION;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        // Mathematical algorithm to create a sharp peak exactly every 2 seconds
        const shine = Math.pow(Math.sin((time * Math.PI / 2) + this.shineOffset), 8);

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 6);
        // Halos are now significantly brighter, and amplify further during the 2-second flash
        gradient.addColorStop(0, `rgba(230, 170, 255, ${this.opacity + 0.4 + (shine * 0.5)})`); 
        gradient.addColorStop(1, 'rgba(230, 170, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 6, 0, Math.PI * 2);
        ctx.fill();

        // The core white particle
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, this.opacity + 0.7 + shine)})`;
        
        // Triggers true canvas luminescence rendering during the flash peak
        ctx.shadowBlur = shine * 15;
        ctx.shadowColor = '#ffffff';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + (shine * 1.2), 0, Math.PI * 2); // Physically expands during flash
        ctx.fill();
        
        ctx.shadowBlur = 0; // Reset
      }
    }

    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    const animate = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      
      ctx.clearRect(0, 0, w, h);

      const time = Date.now() / 1000;

      particles.forEach(p => {
        p.update();
        p.draw(ctx, time);
      });
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);

          if (distance < CONNECTION_DISTANCE) {
            const opacity = (1 - distance / CONNECTION_DISTANCE) * 2; // Doubled connection line opacity
            const pulse = Math.sin(time * 2 + (i + j) * 0.1) * 0.3 + 0.8;
            
            ctx.strokeStyle = `rgba(220, 160, 255, ${Math.min(1, opacity * pulse)})`; 
            ctx.lineWidth = 2.5; 
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();

            if (Math.random() < 0.002) {
              pulses.push({
                p1: particles[i],
                p2: particles[j],
                progress: 0,
                speed: 0.003 + Math.random() * 0.005
              });
            }
          }
        }
      }

      // Blindingly bright traveling data pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        
        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        
        const currentX = pulse.p1.x + (pulse.p2.x - pulse.p1.x) * pulse.progress;
        const currentY = pulse.p1.y + (pulse.p2.y - pulse.p1.y) * pulse.progress;
        
        ctx.beginPath();
        ctx.arc(currentX, currentY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff'; 
        ctx.shadowBlur = 20; // Increased shadow blur for heavy glow
        ctx.shadowColor = '#22d3ee'; // Sharp cyan glow
        ctx.fill();
        ctx.shadowBlur = 0; 
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    /* Brighter backdrop container */
    <div className="fixed inset-0 z-0 bg-[#160b2a] pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(22,11,42,0.6)_100%)]" />
    </div>
  );
}