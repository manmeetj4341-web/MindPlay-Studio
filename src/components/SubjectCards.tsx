import React from 'react';
import { SubjectId } from '../types';
import { sound } from '../utils/sound';
import { Code2, Activity, Orbit, Atom, ArrowRight, Zap, Sparkles, Volume2, ShieldCheck, Flame } from 'lucide-react';

interface SubjectCardsProps {
  onSelectSubject: (subject: SubjectId) => void;
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({ onSelectSubject }) => {
  const subjects = [
    {
      id: 'cs' as SubjectId,
      name: 'Comp-Sci',
      tagline: 'Sorting Visualizer & Beat-the-Clock Race',
      description: 'Step inside the live algorithm visualizer. Control execution speed, listen to pitch-mapped frequency audio triggers, and race against the clock in sorting mini-games!',
      icon: Code2,
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      hoverBorder: 'hover:bg-cyan-500/10 hover:border-cyan-500/50',
      badgeText: '6 Modules Active',
      features: ['Bubble, Quick, Merge, Insert, Select', 'Audio Pitch Synthesizer', 'Beat the Clock Mini-Game', '+150 XP Reward'],
    },
    {
      id: 'math' as SubjectId,
      name: 'Mathematics',
      tagline: 'Wave & Geometry Generator',
      description: 'Breathe life into dry equations. Tweak real-time sliders for frequency, amplitude, damping, and Fourier harmonics to transform waveforms dynamically on canvas.',
      icon: Activity,
      iconBg: 'bg-blue-500/20 text-blue-400',
      hoverBorder: 'hover:bg-blue-500/10 hover:border-blue-500/50',
      badgeText: '4 Modules Active',
      features: ['Trigonometric & Lissajous Waves', 'Fourier Series Superposition', 'Harmonic Audio Player', 'Wave-Match Challenge'],
    },
    {
      id: 'physics' as SubjectId,
      name: 'Physics',
      tagline: 'Gravity & Motion Sandbox',
      description: 'Manipulate universal constants! Modify gravity, friction, air resistance, and elasticity. Launch high-velocity energy spheres or orbit planetary bodies.',
      icon: Orbit,
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      hoverBorder: 'hover:bg-emerald-500/10 hover:border-emerald-500/50',
      badgeText: 'Interactive Sandbox',
      features: ['Real-time 2D Rigid Engine', 'Kinetic & Potential Energy HUD', 'Orbital & Projectile Presets', 'Target Blast Cannon Game'],
    },
    {
      id: 'chemistry' as SubjectId,
      name: 'Chemistry',
      tagline: 'Visual Molecule Sandbox',
      description: 'Combine periodic elements to trigger glowing chemical bond simulations. Explore valence orbitals, ionic vs covalent geometry, and exothermic reaction facts.',
      icon: Atom,
      iconBg: 'bg-purple-500/20 text-purple-400',
      hoverBorder: 'hover:bg-purple-500/10 hover:border-purple-500/50',
      badgeText: '3D Bond Lab',
      features: ['Periodic Element Selector', '3D Glowing Bond Simulations', 'Valence Orbital Rings', 'Molecule Quest Challenges'],
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Subject Command Center
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
            Choose Your Module
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Select a subject module to enter its dedicated interactive laboratory with visualizers, live audio, and gamified challenges.
        </p>
      </div>

      {/* Grid of Subject Command Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((sub) => {
          const Icon = sub.icon;
          return (
            <div
              key={sub.id}
              onClick={() => {
                sound.playClick();
                onSelectSubject(sub.id);
              }}
              className={`group bg-white/5 border border-white/10 p-6 rounded-xl cursor-pointer transition-all ${sub.hoverBorder}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${sub.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                      {sub.badgeText}
                    </span>
                    <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {sub.name}
                    </h4>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-cyan-500 group-hover:text-black flex items-center justify-center text-slate-400 transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Tagline & Description */}
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {sub.tagline}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {sub.description}
                </p>
              </div>

              {/* Feature Chips */}
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                {sub.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/10 text-[10px] text-slate-300 font-mono uppercase tracking-wide"
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    {feat}
                  </span>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
