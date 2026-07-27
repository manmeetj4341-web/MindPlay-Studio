import React, { useState, useEffect, useRef } from 'react';
import { WaveParams } from '../../types';
import { sound } from '../../utils/sound';
import { addXp, unlockBadge } from '../../utils/storage';
import { 
  Activity, Play, Pause, Volume2, VolumeX, Sparkles, Zap, Award, CheckCircle2, RotateCcw, Compass
} from 'lucide-react';

interface WaveGeneratorProps {
  onXpEarned: () => void;
}

export const WaveGenerator: React.FC<WaveGeneratorProps> = ({ onXpEarned }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [waveType, setWaveType] = useState<WaveParams['type']>('sine');
  const [amplitude, setAmplitude] = useState<number>(60);
  const [frequency, setFrequency] = useState<number>(2.5);
  const [phase, setPhase] = useState<number>(0);
  const [damping, setDamping] = useState<number>(0);
  const [harmonics, setHarmonics] = useState<number>(3);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Challenge Mode State
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [targetParams, setTargetParams] = useState<{ amplitude: number; frequency: number; harmonics: number }>({
    amplitude: 80,
    frequency: 4,
    harmonics: 5,
  });
  const [challengeWon, setChallengeWon] = useState<boolean>(false);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 360);
    const centerY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Grid & Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      // Horizontal axis
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Grid lines
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Target Ghost Wave in Challenge Mode
      if (isChallengeMode) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        for (let x = 0; x < width; x++) {
          const t = (x / width) * Math.PI * 4;
          let y = centerY;
          // Target formula
          let val = 0;
          for (let k = 1; k <= targetParams.harmonics; k += 2) {
            val += (1 / k) * Math.sin(k * targetParams.frequency * (t + time * 0.02));
          }
          y = centerY - val * (targetParams.amplitude * 0.6);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Render Active User Wave
      ctx.beginPath();
      ctx.lineWidth = 3;

      if (waveType === 'sine') {
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';

        for (let x = 0; x < width; x++) {
          const t = (x / width) * Math.PI * 4;
          const dampFactor = Math.exp((-damping * x) / width);
          const y = centerY - Math.sin(frequency * t + phase + time * 0.05) * amplitude * dampFactor;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (waveType === 'fourier') {
        ctx.strokeStyle = '#ec4899';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ec4899';

        for (let x = 0; x < width; x++) {
          const t = (x / width) * Math.PI * 4;
          let yVal = 0;

          // Square wave superposition sum: sum( (1/n)*sin(n*w*t) )
          for (let n = 1; n <= harmonics * 2; n += 2) {
            yVal += (1 / n) * Math.sin(n * frequency * (t + time * 0.03) + phase);
          }

          const dampFactor = Math.exp((-damping * x) / width);
          const y = centerY - yVal * amplitude * dampFactor;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (waveType === 'lissajous') {
        ctx.strokeStyle = '#10b981';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#10b981';

        const scaleX = amplitude * 2;
        const scaleY = amplitude * 1.5;
        const centerX = width / 2;

        for (let t = 0; t < Math.PI * 8; t += 0.02) {
          const x = centerX + Math.sin(frequency * t + time * 0.03) * scaleX;
          const y = centerY + Math.cos(harmonics * t + phase) * scaleY;

          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (waveType === 'tesseract') {
        // 3D Rotating Hypercube Wireframe Projection
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f59e0b';

        const centerX = width / 2;
        const size = amplitude * 1.2;
        const angle = time * 0.03 * frequency;

        // 8 3D vertices of a cube
        const vertices = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        // Rotate & project
        const projected = vertices.map(([x, y, z]) => {
          const rotX = x * Math.cos(angle) - z * Math.sin(angle);
          const rotZ = x * Math.sin(angle) + z * Math.cos(angle);
          const rotY = y * Math.cos(angle * 0.7) - rotZ * Math.sin(angle * 0.7);

          const distance = 3;
          const fov = 300;
          const px = centerX + (rotX * fov) / (rotZ + distance) * (size / 100);
          const py = centerY + (rotY * fov) / (rotZ + distance) * (size / 100);
          return [px, py];
        });

        // Edges
        const edges = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7]
        ];

        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(projected[i][0], projected[i][1]);
          ctx.lineTo(projected[j][0], projected[j][1]);
          ctx.stroke();
        });
      }

      ctx.shadowBlur = 0;
      time += 1;

      // Check Challenge Condition
      if (isChallengeMode && !challengeWon) {
        const ampDiff = Math.abs(amplitude - targetParams.amplitude);
        const freqDiff = Math.abs(frequency - targetParams.frequency);
        const harmDiff = Math.abs(harmonics - targetParams.harmonics);

        if (ampDiff <= 10 && freqDiff <= 0.5 && harmDiff === 0 && waveType === 'fourier') {
          setChallengeWon(true);
          sound.playSuccess();
          addXp(120, 'Completed Wave Alignment Challenge');
          unlockBadge('wave_whisperer');
          onXpEarned();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [waveType, amplitude, frequency, phase, damping, harmonics, isChallengeMode, targetParams, challengeWon, onXpEarned]);

  // Audio frequency synth tone
  const toggleAudioSynth = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      const synthFreq = 150 + frequency * 80;
      sound.playTone(synthFreq, 1.5, 'sine', 0.1);
      setTimeout(() => setIsAudioPlaying(false), 1500);
    }
  };

  const getFormulaString = () => {
    if (waveType === 'sine') {
      return `y(t) = ${amplitude} \\cdot \\sin(${frequency.toFixed(1)}t + ${phase.toFixed(1)}) ${damping > 0 ? `\\cdot e^{-${damping.toFixed(2)}t}` : ''}`;
    }
    if (waveType === 'fourier') {
      return `y(t) = \\sum_{n=1,3...}^{${harmonics * 2 - 1}} \\frac{${amplitude}}{n} \\sin(n \\cdot ${frequency.toFixed(1)}t)`;
    }
    if (waveType === 'lissajous') {
      return `x = ${amplitude * 2} \\sin(${frequency.toFixed(1)}t), \\quad y = ${Math.round(amplitude * 1.5)} \\cos(${harmonics}t)`;
    }
    return `Tesseract Projection \\in \\mathbb{R}^4 \\rightarrow \\mathbb{R}^2, \\omega = ${(frequency * 0.5).toFixed(2)} \\text{ rad/s}`;
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/10 border border-pink-500/40 rounded-xl text-pink-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">
              MATHEMATICS
            </span>
            <h2 className="text-2xl font-extrabold text-white">Wave & Geometry Generator</h2>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChallengeMode(!isChallengeMode)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              isChallengeMode
                ? 'bg-pink-500 text-slate-950 border-pink-400 shadow-lg shadow-pink-500/30'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-pink-500/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isChallengeMode ? 'Exit Challenge' : 'Wave Match Quest'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Canvas Display (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Wave Mode Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            {(['sine', 'fourier', 'lissajous', 'tesseract'] as WaveParams['type'][]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  sound.playClick();
                  setWaveType(type);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                  waveType === type
                    ? 'bg-pink-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {type === 'fourier' ? 'Fourier Series' : type}
              </button>
            ))}

            <button
              onClick={toggleAudioSynth}
              className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                isAudioPlaying
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse'
                  : 'bg-slate-950 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen Wave</span>
            </button>
          </div>

          {/* Interactive Wave Canvas */}
          <div className="relative h-80 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4">
            
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

            {/* Formula Overlay HUD */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 font-mono text-xs">
              <span className="text-pink-400 font-bold">Live Function:</span>
              <span className="text-slate-200 tracking-wider">
                {getFormulaString()}
              </span>
            </div>

            <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />

            {/* Challenge Overlay */}
            {isChallengeMode && (
              <div className="relative z-10 mt-auto bg-slate-900/90 border border-pink-500/40 p-3 rounded-xl flex items-center justify-between gap-2 text-xs">
                <span className="text-pink-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  Target: Fourier Wave | Amp ~{targetParams.amplitude}, Freq ~{targetParams.frequency}, Harmonics {targetParams.harmonics}
                </span>
                {challengeWon && (
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/50">
                    <CheckCircle2 className="w-4 h-4" /> ALIGNED! (+120 XP)
                  </span>
                )}
              </div>
            )}

          </div>

          {/* Mathematical Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs font-mono text-slate-300">
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Amplitude (A):</span>
                <span className="text-pink-400 font-bold">{amplitude}</span>
              </div>
              <input
                type="range"
                min="20"
                max="110"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Frequency (f):</span>
                <span className="text-cyan-400 font-bold">{frequency.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Harmonics (n):</span>
                <span className="text-amber-400 font-bold">{harmonics}</span>
              </div>
              <input
                type="range"
                min="1"
                max="9"
                value={harmonics}
                onChange={(e) => setHarmonics(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Phase Shift (ϕ):</span>
                <span className="text-emerald-400 font-bold">{phase.toFixed(2)} rad</span>
              </div>
              <input
                type="range"
                min="0"
                max="6.28"
                step="0.1"
                value={phase}
                onChange={(e) => setPhase(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between">
                <span>Damping Factor (γ):</span>
                <span className="text-violet-400 font-bold">{damping.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={damping}
                onChange={(e) => setDamping(Number(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Math Learning & Concepts Card */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Real-World Applications
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-cyan-300">Fourier Superposition:</span>
                <p>Used in digital audio synthesis, MP3 compression, and noise-canceling headphones to break down complex signals into fundamental sine waves.</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-pink-300">Lissajous Oscillations:</span>
                <p>Describes two perpendicular harmonic vibrations. Vital in oscilloscope signal testing and quantum optics resonance.</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-amber-300">Tesseract Projections:</span>
                <p>Visualizing 4D hyperspace geometry in 2D/3D space using perspective matrices.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 rounded-2xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-pink-300">Wave Whisperer Achievement</p>
              <p className="text-slate-300">
                Overlay the target ghost wave in Match Quest to unlock <strong className="text-white">+120 XP</strong>!
              </p>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
