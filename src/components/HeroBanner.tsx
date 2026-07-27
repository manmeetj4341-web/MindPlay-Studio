import React, { useEffect, useRef } from 'react';
import { SubjectId } from '../types';
import { sound } from '../utils/sound';
import { Play, Sparkles, Code2, Activity, Orbit, Atom, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onSelectSubject: (subject: SubjectId) => void;
  onOpenQuiz: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectSubject, onOpenQuiz }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p1.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect near mouse
        const dxMouse = p1.x - mouseX;
        const dyMouse = p1.y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 140) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(6, 182, 212, ${1 - distMouse / 140})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Connect neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 110) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#050508] border-b border-white/5 pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Interactive Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto opacity-70"
      />

      {/* Cyber Grid Background overlay */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
        
        {/* Eyebrow Tag */}
        <div className="inline-block px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] uppercase tracking-[0.2em] font-bold">
          The Future of Education
        </div>

        {/* Main Sleek Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase text-white">
          REIMAGINE <br className="hidden sm:inline" />
          HOW YOU <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
            LEARN.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-xl mx-auto text-slate-400 text-base sm:text-lg leading-relaxed">
          Stop memorizing dry theory. Start playing with reality. Interactive STEM visualizers and live physics sandboxes built for the next generation of thinkers.
        </p>

        {/* Quick Jump Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <button
            onClick={() => { sound.playClick(); onSelectSubject('cs'); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>Comp-Sci Visualizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => { sound.playClick(); onSelectSubject('math'); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/50 text-blue-400 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Math & Waves</span>
          </button>

          <button
            onClick={() => { sound.playClick(); onSelectSubject('physics'); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
          >
            <Orbit className="w-4 h-4" />
            <span>Physics Sandbox</span>
          </button>

          <button
            onClick={() => { sound.playClick(); onSelectSubject('chemistry'); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/50 text-purple-400 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
          >
            <Atom className="w-4 h-4" />
            <span>Chemistry Lab</span>
          </button>
        </div>

        {/* Interactive Stats Ribbon */}
        <div className="pt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>5+ Sorting Algorithms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Fourier Wave Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Rigid Body Gravity Physics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>3D Atomic Bond Engine</span>
          </div>
        </div>

      </div>
    </section>
  );
};
