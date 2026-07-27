import React from 'react';
import { UserStats } from '../../types';
import { ACHIEVEMENTS, calculateLevel, getLevelTitle } from '../../utils/storage';
import { sound } from '../../utils/sound';
import { X, Trophy, Sparkles, Award, CheckCircle2, Lock, Flame, Zap, Shield, Code2, Activity, Orbit, Atom } from 'lucide-react';

interface AchievementsModalProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ stats, isOpen, onClose }) => {
  if (!isOpen) return null;

  const levelInfo = calculateLevel(stats.xp);
  const levelTitle = getLevelTitle(levelInfo.level);

  const getSubjectIcon = (subject?: string) => {
    switch (subject) {
      case 'cs': return Code2;
      case 'math': return Activity;
      case 'physics': return Orbit;
      case 'chemistry': return Atom;
      default: return Sparkles;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                TROPHY CABINET
              </span>
              <h2 className="text-2xl font-extrabold text-white">Achievements & Badges</h2>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Stats Summary */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/60 via-slate-950 to-pink-950/60 border border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                Level {levelInfo.level}
              </span>
              <h3 className="text-lg font-extrabold text-white">{levelTitle}</h3>
            </div>
            <p className="text-xs text-slate-400">
              {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP to next rank
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-amber-400 font-extrabold text-base">{stats.xp}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total XP</p>
            </div>
            <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-pink-400 font-extrabold text-base">{stats.unlockedBadges.length}/{ACHIEVEMENTS.length}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Badges</p>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = stats.unlockedBadges.includes(badge.id);
            const IconComponent = getSubjectIcon(badge.subject);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-xl border shrink-0 ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}>
                  {isUnlocked ? <IconComponent className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                      {badge.title}
                    </h4>
                    {isUnlocked && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {badge.description}
                  </p>
                  <span className="inline-block text-[10px] font-mono font-bold text-amber-400/90 pt-1">
                    +{badge.xpReward} XP Reward
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
