import React, { useState, useEffect, useRef } from 'react';
import { ChemicalElement, Molecule } from '../../types';
import { sound } from '../../utils/sound';
import { addXp, unlockBadge } from '../../utils/storage';
import { 
  Atom, Plus, Trash2, Sparkles, Zap, Award, CheckCircle2, Flame, ShieldAlert, RefreshCw
} from 'lucide-react';

interface MoleculeSandboxProps {
  onXpEarned: () => void;
}

const PERIODIC_ELEMENTS: ChemicalElement[] = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, valenceElectrons: 1, category: 'Nonmetal', color: '#38bdf8' },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, valenceElectrons: 6, category: 'Nonmetal', color: '#f43f5e' },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, valenceElectrons: 4, category: 'Nonmetal', color: '#a855f7' },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, valenceElectrons: 5, category: 'Nonmetal', color: '#3b82f6' },
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, valenceElectrons: 1, category: 'Alkali Metal', color: '#f59e0b' },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, valenceElectrons: 7, category: 'Halogen', color: '#10b981' },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, valenceElectrons: 2, category: 'Transition Metal', color: '#94a3b8' },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, valenceElectrons: 6, category: 'Nonmetal', color: '#eab308' },
];

const KNOWN_MOLECULES: Molecule[] = [
  {
    id: 'h2o',
    name: 'Water',
    formula: 'H₂O',
    elements: [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 1 },
    ],
    bonds: 'polar_covalent',
    geometry: 'Bent (104.5°)',
    funFact: 'Universal solvent covering over 70% of Earth’s surface. Expands when freezing into crystalline ice lattice!',
    energyType: 'Exothermic',
  },
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    elements: [
      { symbol: 'C', count: 1 },
      { symbol: 'O', count: 2 },
    ],
    bonds: 'covalent',
    geometry: 'Linear (180°)',
    funFact: 'Essential reactant in plant photosynthesis and carbonation agent in sparkling drinks.',
    energyType: 'Exothermic',
  },
  {
    id: 'ch4',
    name: 'Methane',
    formula: 'CH₄',
    elements: [
      { symbol: 'C', count: 1 },
      { symbol: 'H', count: 4 },
    ],
    bonds: 'covalent',
    geometry: 'Tetrahedral (109.5°)',
    funFact: 'Primary constituent of natural gas fuel. Highly potent greenhouse gas with strong thermal retention.',
    energyType: 'Exothermic',
  },
  {
    id: 'nacl',
    name: 'Sodium Chloride (Table Salt)',
    formula: 'NaCl',
    elements: [
      { symbol: 'Na', count: 1 },
      { symbol: 'Cl', count: 1 },
    ],
    bonds: 'ionic',
    geometry: 'Cubic Crystal Lattice',
    funFact: 'Formed by complete electron transfer from explosive sodium metal to toxic chlorine gas, yielding edible salt!',
    energyType: 'Exothermic',
  },
  {
    id: 'nh3',
    name: 'Ammonia',
    formula: 'NH₃',
    elements: [
      { symbol: 'N', count: 1 },
      { symbol: 'H', count: 3 },
    ],
    bonds: 'covalent',
    geometry: 'Trigonal Pyramidal',
    funFact: 'Critical precursor in global agricultural fertilizers synthesized via the industrial Haber-Bosch process.',
    energyType: 'Exothermic',
  },
];

export const MoleculeSandbox: React.FC<MoleculeSandboxProps> = ({ onXpEarned }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedAtoms, setSelectedAtoms] = useState<{ element: ChemicalElement; id: string }[]>([]);
  const [activeMolecule, setActiveMolecule] = useState<Molecule | null>(null);
  const [questProgress, setQuestProgress] = useState<string[]>([]);

  // Add atom to reaction chamber
  const addAtom = (elem: ChemicalElement) => {
    sound.playClick();
    const newAtom = { element: elem, id: Math.random().toString() };
    const updated = [...selectedAtoms, newAtom];
    setSelectedAtoms(updated);
    checkReaction(updated);
  };

  const removeAtom = (id: string) => {
    sound.playClick();
    const updated = selectedAtoms.filter((a) => a.id !== id);
    setSelectedAtoms(updated);
    checkReaction(updated);
  };

  const clearChamber = () => {
    sound.playClick();
    setSelectedAtoms([]);
    setActiveMolecule(null);
  };

  // Check if current chamber atoms match any known molecule formula
  const checkReaction = (atoms: { element: ChemicalElement; id: string }[]) => {
    // Count occurrences per element symbol
    const counts: Record<string, number> = {};
    atoms.forEach((a) => {
      counts[a.element.symbol] = (counts[a.element.symbol] || 0) + 1;
    });

    const matched = KNOWN_MOLECULES.find((m) => {
      // Check if counts match perfectly
      const reqSymbols = Object.keys(counts);
      if (reqSymbols.length !== m.elements.length) return false;

      return m.elements.every((req) => counts[req.symbol] === req.count);
    });

    if (matched) {
      if (activeMolecule?.id !== matched.id) {
        sound.playBondZap();
        setActiveMolecule(matched);

        if (!questProgress.includes(matched.id)) {
          const newQuests = [...questProgress, matched.id];
          setQuestProgress(newQuests);
          addXp(100, `Synthesized Chemical Molecule: ${matched.name}`);

          if (newQuests.length >= 3) {
            unlockBadge('bond_creator');
          }
          onXpEarned();
        }
      }
    } else {
      setActiveMolecule(null);
    }
  };

  // Render 3D/2D Atomic Orbital Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 360);
    const centerX = width / 2;
    const centerY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Cyber Grid Background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (selectedAtoms.length === 0) {
        // Render Empty Idle Atom Guidance
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Select element atoms below to assemble chemical bonds in reaction vessel', centerX, centerY);
      } else {
        // Position atoms around center
        const atomCount = selectedAtoms.length;
        const radius = Math.min(120, 40 + atomCount * 18);

        const positions = selectedAtoms.map((a, i) => {
          const angle = (i / atomCount) * Math.PI * 2 + time * 0.01;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return { ...a, x, y };
        });

        // Draw Glowing Bonds if Molecule Synthesized
        if (activeMolecule) {
          ctx.beginPath();
          positions.forEach((p1, i) => {
            positions.forEach((p2, j) => {
              if (i < j) {
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
              }
            });
          });
          ctx.strokeStyle = activeMolecule.bonds === 'ionic' ? '#f59e0b' : '#06b6d4';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw Atom Nuclei & Spinning Valence Electrons
        positions.forEach((atom) => {
          // Draw Valence Shell Ring
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, 28, 0, Math.PI * 2);
          ctx.strokeStyle = `${atom.element.color}66`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Spinning valence electrons
          for (let e = 0; e < atom.element.valenceElectrons; e++) {
            const eAngle = (e / atom.element.valenceElectrons) * Math.PI * 2 + time * 0.05;
            const ex = atom.x + Math.cos(eAngle) * 28;
            const ey = atom.y + Math.sin(eAngle) * 28;

            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffffff';
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Draw Nucleus Circle
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = atom.element.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = atom.element.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Symbol Text
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(atom.element.symbol, atom.x, atom.y);
        });
      }

      time += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedAtoms, activeMolecule]);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-400">
            <Atom className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              CHEMISTRY
            </span>
            <h2 className="text-2xl font-extrabold text-white">Visual Molecule Sandbox</h2>
          </div>
        </div>

        <button
          onClick={clearChamber}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-pink-400" />
          <span>Clear Reaction Vessel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Reaction Chamber & Element Palette (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Reaction Vessel Canvas */}
          <div className="relative h-80 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4">
            
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

            {/* Molecule Match Banner */}
            {activeMolecule ? (
              <div className="relative z-10 bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-cyan-950/90 border border-amber-500/50 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">SYNTHESIZED COMPOUND</span>
                    <h3 className="text-lg font-mono font-extrabold text-amber-300">
                      {activeMolecule.name} ({activeMolecule.formula})
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/40">
                  {activeMolecule.geometry}
                </span>
              </div>
            ) : (
              <div className="relative z-10 flex justify-between text-xs font-mono text-slate-400">
                <span>Vessel Atom Count: {selectedAtoms.length}</span>
                <span>Bonds: {selectedAtoms.length >= 2 ? 'Forming...' : 'Idle'}</span>
              </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />

            {/* Active Chamber Atoms Bar */}
            <div className="relative z-10 mt-auto flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">In Vessel:</span>
              {selectedAtoms.map((a) => (
                <button
                  key={a.id}
                  onClick={() => removeAtom(a.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white hover:border-pink-500 flex items-center gap-1 cursor-pointer transition-all"
                  title="Click to remove atom"
                >
                  <span style={{ color: a.element.color }}>{a.element.symbol}</span>
                  <span className="text-[10px] text-slate-500">×</span>
                </button>
              ))}
            </div>

          </div>

          {/* Periodic Element Palette */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Periodic Element Selector (Click to Add Atom)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PERIODIC_ELEMENTS.map((elem) => (
                <button
                  key={elem.symbol}
                  onClick={() => addAtom(elem)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-extrabold text-slate-950 shadow"
                      style={{ backgroundColor: elem.color }}
                    >
                      {elem.symbol}
                    </span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {elem.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Valence e⁻: {elem.valenceElectrons}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Compound Properties & Quest Log */}
        <div className="space-y-4">
          
          {/* Compound Details Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Molecule Property Inspection
            </h3>

            {activeMolecule ? (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-amber-300">Bond Type:</span>
                  <p className="capitalize font-mono text-cyan-400">{activeMolecule.bonds.replace('_', ' ')}</p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-pink-300">Reaction Energy Profile:</span>
                  <p className="font-mono text-pink-400">{activeMolecule.energyType}</p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-amber-300">Scientific Fact:</span>
                  <p>{activeMolecule.funFact}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500 font-mono">
                Add matching atom combinations to analyze chemical geometry and bond mechanics.
              </div>
            )}
          </div>

          {/* Molecule Master Quest Log */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Molecule Master Quests ({questProgress.length}/3)
            </h3>

            <div className="space-y-2">
              {KNOWN_MOLECULES.slice(0, 4).map((m) => {
                const isDone = questProgress.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isDone
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Synthesize {m.name} ({m.formula})</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-600">+100 XP</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
