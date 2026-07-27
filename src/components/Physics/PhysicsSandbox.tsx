import React, { useState, useEffect, useRef } from 'react';
import { PhysicsBody, PhysicsParams } from '../../types';
import { sound } from '../../utils/sound';
import { addXp, unlockBadge } from '../../utils/storage';
import { 
  Orbit, Play, Pause, RotateCcw, Plus, Sparkles, Zap, Shield, Target, Crosshair
} from 'lucide-react';

interface PhysicsSandboxProps {
  onXpEarned: () => void;
}

export const PhysicsSandbox: React.FC<PhysicsSandboxProps> = ({ onXpEarned }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [preset, setPreset] = useState<PhysicsParams['preset']>('bounce');
  const [gravity, setGravity] = useState<number>(9.8);
  const [friction, setFriction] = useState<number>(0.02);
  const [restitution, setRestitution] = useState<number>(0.85);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // HUD Real-time Metrics
  const [totalKE, setTotalKE] = useState<number>(0);
  const [totalPE, setTotalPE] = useState<number>(0);
  const [bodyCount, setBodyCount] = useState<number>(0);

  // Cannon Target Mini-Game State
  const [isCannonGame, setIsCannonGame] = useState<boolean>(false);
  const [cannonAngle, setCannonAngle] = useState<number>(45);
  const [cannonPower, setCannonPower] = useState<number>(18);
  const [targetHits, setTargetHits] = useState<number>(0);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number; r: number }>({ x: 500, y: 150, r: 25 });

  const bodiesRef = useRef<PhysicsBody[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Bodies based on preset
  const loadPreset = (p: PhysicsParams['preset']) => {
    setPreset(p);
    const newBodies: PhysicsBody[] = [];
    const colors = ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

    if (p === 'bounce') {
      setGravity(9.8);
      setFriction(0.02);
      setRestitution(0.85);

      for (let i = 0; i < 6; i++) {
        newBodies.push({
          id: Math.random().toString(),
          x: 100 + i * 90,
          y: 80 + (i % 2) * 50,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 2,
          radius: 18 + Math.random() * 8,
          mass: 1.5,
          color: colors[i % colors.length],
          trail: [],
        });
      }
    } else if (p === 'orbit') {
      setGravity(0); // Zero-G space
      setFriction(0);
      setRestitution(0.95);

      // Central heavy star
      newBodies.push({
        id: 'star',
        x: 350,
        y: 200,
        vx: 0,
        vy: 0,
        radius: 35,
        mass: 50,
        color: '#f59e0b',
        trail: [],
        isPinned: true,
      });

      // Orbiting planets
      newBodies.push({
        id: 'p1',
        x: 350,
        y: 80,
        vx: 4.8,
        vy: 0,
        radius: 12,
        mass: 1,
        color: '#06b6d4',
        trail: [],
      });

      newBodies.push({
        id: 'p2',
        x: 350,
        y: 340,
        vx: -3.8,
        vy: 0,
        radius: 16,
        mass: 1.2,
        color: '#ec4899',
        trail: [],
      });
    } else if (p === 'cannon') {
      setGravity(9.8);
      setFriction(0.01);
      setRestitution(0.7);
      setIsCannonGame(true);
      setTargetPos({ x: 480, y: 120 + Math.random() * 120, r: 28 });
    }

    bodiesRef.current = newBodies;
    setBodyCount(newBodies.length);
  };

  useEffect(() => {
    loadPreset('bounce');
  }, []);

  // Main Physics Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const updatePhysics = () => {
      if (isPaused) return;

      const bodies = bodiesRef.current;
      let keSum = 0;
      let peSum = 0;

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (b.isPinned) continue;

        // Apply Gravity
        b.vy += (gravity * 0.05);

        // Apply Friction & Air Resistance
        b.vx *= (1 - friction);
        b.vy *= (1 - friction);

        // Planetary Gravitational Attraction towards pinned stars
        if (preset === 'orbit') {
          bodies.forEach((star) => {
            if (star.isPinned) {
              const dx = star.x - b.x;
              const dy = star.y - b.y;
              const distSq = dx * dx + dy * dy;
              const dist = Math.sqrt(distSq);

              if (dist > star.radius + b.radius) {
                const force = (1200 * star.mass) / distSq;
                b.vx += (dx / dist) * force * 0.05;
                b.vy += (dy / dist) * force * 0.05;
              }
            }
          });
        }

        // Move position
        b.x += b.vx;
        b.y += b.vy;

        // Save trail points
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 20) b.trail.shift();

        // Wall & Floor Collisions
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx *= -restitution;
          sound.playCollision(Math.abs(b.vx));
        } else if (b.x + b.radius > width) {
          b.x = width - b.radius;
          b.vx *= -restitution;
          sound.playCollision(Math.abs(b.vx));
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy *= -restitution;
          sound.playCollision(Math.abs(b.vy));
        } else if (b.y + b.radius > height) {
          b.y = height - b.radius;
          b.vy *= -restitution;
          b.vx *= (1 - friction * 3); // Extra floor friction
          if (Math.abs(b.vy) > 0.5) sound.playCollision(Math.abs(b.vy));
        }

        // Inter-body collisions
        for (let j = i + 1; j < bodies.length; j++) {
          const b2 = bodies[j];
          const dx = b2.x - b.x;
          const dy = b2.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b.radius + b2.radius;

          if (dist < minDist) {
            // Elastic collision bounce
            const overlap = minDist - dist;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            b.x -= nx * overlap * 0.5;
            b.y -= ny * overlap * 0.5;
            if (!b2.isPinned) {
              b2.x += nx * overlap * 0.5;
              b2.y += ny * overlap * 0.5;
            }

            const kx = b.vx - b2.vx;
            const ky = b.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / (b.mass + b2.mass);

            b.vx -= p * b2.mass * nx;
            b.vy -= p * b2.mass * ny;
            if (!b2.isPinned) {
              b2.vx += p * b.mass * nx;
              b2.vy += p * b.mass * ny;
            }

            sound.playCollision(1.5);
          }
        }

        // Energy calculation
        const v = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        keSum += 0.5 * b.mass * v * v;
        peSum += b.mass * gravity * (height - b.y);

        // Check Target Hit in Cannon Game
        if (isCannonGame) {
          const dxTarget = b.x - targetPos.x;
          const dyTarget = b.y - targetPos.y;
          const distTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);
          if (distTarget < b.radius + targetPos.r) {
            sound.playSuccess();
            setTargetHits((prev) => prev + 1);
            setTargetPos({ x: 300 + Math.random() * 300, y: 80 + Math.random() * 200, r: 25 });
            addXp(120, 'Hit Physics Target Crystal');
            unlockBadge('gravity_master');
            onXpEarned();
          }
        }
      }

      setTotalKE(Math.round(keSum * 10));
      setTotalPE(Math.round(peSum * 0.1));
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      updatePhysics();

      const bodies = bodiesRef.current;

      // Draw Cannon Target Crystal
      if (isCannonGame) {
        ctx.beginPath();
        ctx.arc(targetPos.x, targetPos.y, targetPos.r, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f59e0b';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target Crosshair Ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Render Bodies
      bodies.forEach((b) => {
        // Draw Motion Trail
        if (b.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(b.trail[0].x, b.trail[0].y);
          for (let k = 1; k < b.trail.length; k++) {
            ctx.lineTo(b.trail[k].x, b.trail[k].y);
          }
          ctx.strokeStyle = `${b.color}55`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw Orb
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = b.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner highlight
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });

      // Draw Slingshot/Vector Drag line when creating/slinging body
      if (isDraggingRef.current && dragStartRef.current) {
        ctx.beginPath();
        ctx.moveTo(dragStartRef.current.x, dragStartRef.current.y);
        ctx.lineTo(mousePosRef.current.x, mousePosRef.current.y);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gravity, friction, restitution, isPaused, preset, isCannonGame, targetPos, onXpEarned]);

  // Mouse Handlers for creating/throwing bodies
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = { x, y };
    mousePosRef.current = { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    isDraggingRef.current = false;

    const start = dragStartRef.current;
    const end = mousePosRef.current;
    const vx = (start.x - end.x) * 0.12;
    const vy = (start.y - end.y) * 0.12;

    const colors = ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
    const newBody: PhysicsBody = {
      id: Math.random().toString(),
      x: start.x,
      y: start.y,
      vx,
      vy,
      radius: 16 + Math.random() * 8,
      mass: 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: [],
    };

    bodiesRef.current.push(newBody);
    setBodyCount(bodiesRef.current.length);
    sound.playClick();
  };

  // Launch Cannon Projectile
  const fireCannon = () => {
    const rad = (cannonAngle * Math.PI) / 180;
    const vx = Math.cos(rad) * cannonPower;
    const vy = -Math.sin(rad) * cannonPower;

    const newBody: PhysicsBody = {
      id: Math.random().toString(),
      x: 60,
      y: 350,
      vx,
      vy,
      radius: 14,
      mass: 1,
      color: '#ec4899',
      trail: [],
    };

    bodiesRef.current.push(newBody);
    setBodyCount(bodiesRef.current.length);
    sound.playTone(400, 0.1, 'sawtooth');
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-400">
            <Orbit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              PHYSICS
            </span>
            <h2 className="text-2xl font-extrabold text-white">Gravity & Motion Sandbox</h2>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['bounce', 'orbit', 'cannon'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                sound.playClick();
                loadPreset(p);
              }}
              className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                preset === p
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'bounce' ? 'Earth Gravity' : p === 'orbit' ? 'Zero-G Orbit' : 'Target Cannon'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Physics Canvas Area (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Top HUD Stats */}
          <div className="grid grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl font-mono text-center text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-extrabold text-lg">{totalKE}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Kinetic Energy</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-extrabold text-lg">{totalPE}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Potential Energy</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-extrabold text-lg">{bodyCount}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Active Bodies</p>
            </div>
          </div>

          {/* Interactive Physics Canvas */}
          <div className="relative h-96 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner cursor-crosshair">
            
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

            {/* Instruction Overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 pointer-events-none">
              💡 Drag & release anywhere on canvas to fling new energy spheres!
            </div>

            {preset === 'cannon' && (
              <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-3">
                <Target className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-white">Target Crystal Hits: <span className="text-amber-400 font-mono text-base">{targetHits}</span></span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full h-full"
            />

          </div>

          {/* Cannon Controls when in Cannon Preset */}
          {preset === 'cannon' && (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span>Angle: {cannonAngle}°</span>
                  <input
                    type="range"
                    min="10"
                    max="85"
                    value={cannonAngle}
                    onChange={(e) => setCannonAngle(Number(e.target.value))}
                    className="w-28 accent-emerald-400 cursor-pointer"
                  />
                </div>
                <div>
                  <span>Power: {cannonPower}</span>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={cannonPower}
                    onChange={(e) => setCannonPower(Number(e.target.value))}
                    className="w-28 accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={fireCannon}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>Fire Cannon!</span>
              </button>
            </div>
          )}

          {/* Environmental Controls Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs font-mono text-slate-300">
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Gravity (g):</span>
                <span className="text-emerald-400 font-bold">{gravity.toFixed(1)} m/s²</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={gravity}
                onChange={(e) => setGravity(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Friction (μ):</span>
                <span className="text-cyan-400 font-bold">{friction.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.08"
                step="0.005"
                value={friction}
                onChange={(e) => setFriction(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Bounciness (e):</span>
                <span className="text-amber-400 font-bold">{restitution.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.98"
                step="0.02"
                value={restitution}
                onChange={(e) => setRestitution(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Physics Laws Panel */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Governing Laws of Motion
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-emerald-300">Conservation of Energy:</span>
                <p>Total mechanical energy $E = KE + PE$ remains constant in conservative systems, transforming velocity into height and back.</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-cyan-300">Newton&apos;s Universal Gravity:</span>
                <p>F = G (m₁m₂)/r² — Centripetal acceleration maintains closed elliptical planetary orbits in space.</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-amber-300">Elastic Collision Momentum:</span>
                <p>Kinetic energy and linear momentum are conserved when spherical bodies collide on canvas.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-300">Gravity Master Badge</p>
              <p className="text-slate-300">
                Hit target crystals in cannon mode or create orbiting planets for <strong className="text-white">+120 XP</strong>!
              </p>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
