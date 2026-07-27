import React from 'react';
import { UserStats, SubjectId } from '../types';
import { calculateLevel, getLevelTitle } from '../utils/storage';
import { sound } from '../utils/sound';
import { Sparkles, Trophy, Zap, Volume2, VolumeX, Flame, Code2, Activity, Orbit, Atom } from 'lucide-react';

interface HeaderProps {
  stats: UserStats;
  activeSubject: SubjectId | 'home';
  onSelectSubject: (subject: SubjectId | 'home') => void;
  onOpenAchievements: () => void;
  onOpenQuiz: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  activeSubject,
  onSelectSubject,
  onOpenAchievements,
  onOpenQuiz,
  isMuted,
  onToggleMute,
}) => {
  const levelInfo = calculateLevel(stats.xp);
  const levelTitle = getLevelTitle(levelInfo.level);
  const xpPercent = Math.min(100, Math.round((levelInfo.currentXp / levelInfo.nextLevelXp) * 100));

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#050508]/90 border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => { sound.playClick(); onSelectSubject('home'); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform shrink-0">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-white">
                MindPlay <span className="text-cyan-400">Studio</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                LAB v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Subject Selector) */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={() => { sound.playClick(); onSelectSubject('home'); }}
            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              activeSubject === 'home'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            Command Center
          </button>
          
          <button
            onClick={() => { sound.playClick(); onSelectSubject('cs'); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              activeSubject === 'cs'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            CompSci
          </button>

          <button
            onClick={() => { sound.playClick(); onSelectSubject('math'); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              activeSubject === 'math'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'text-slate-400 hover:text-blue-300 hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Math
          </button>

          <button
            onClick={() => { sound.playClick(); onSelectSubject('physics'); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              activeSubject === 'physics'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-white/5'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            Physics
          </button>

          <button
            onClick={() => { sound.playClick(); onSelectSubject('chemistry'); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              activeSubject === 'chemistry'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'text-slate-400 hover:text-purple-300 hover:bg-white/5'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            Chemistry
          </button>
        </nav>

        {/* Gamification Stats HUD */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Level Badge */}
          <div className="hidden sm:flex bg-white/5 px-3 py-1.5 rounded-full border border-white/10 items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>LVL {levelInfo.level}</span>
            <span className="text-cyan-400 font-mono">({levelTitle})</span>
          </div>

          {/* XP Badge */}
          <div 
            onClick={() => { sound.playClick(); onOpenAchievements(); }}
            className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-3.5 py-1.5 rounded-full border border-cyan-500/30 flex items-center space-x-2.5 cursor-pointer hover:scale-105 transition-transform"
            title="Click to view Achievements"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-mono">
              XP: {stats.xp}
            </span>
          </div>

          {/* Streak Counter */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 font-mono text-xs font-bold" title="Daily Active Streak">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-bounce" />
            <span>{stats.streak}d</span>
          </div>

          {/* Quick Quiz Challenge Button */}
          <button
            onClick={() => { sound.playClick(); onOpenQuiz(); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Test Insight</span>
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Trophy Cabinet Button */}
          <button
            onClick={() => { sound.playClick(); onOpenAchievements(); }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 transition-colors cursor-pointer"
            title="Achievements & Badges"
          >
            <Trophy className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
