import React, { useState, useEffect } from 'react';
import { SubjectId, UserStats } from './types';
import { loadUserStats, unlockBadge } from './utils/storage';
import { sound } from './utils/sound';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { SubjectCards } from './components/SubjectCards';
import { SortingVisualizer } from './components/ComputerScience/SortingVisualizer';
import { WaveGenerator } from './components/Mathematics/WaveGenerator';
import { PhysicsSandbox } from './components/Physics/PhysicsSandbox';
import { MoleculeSandbox } from './components/Chemistry/MoleculeSandbox';
import { AchievementsModal } from './components/Gamification/AchievementsModal';
import { QuizChallengeModal } from './components/Gamification/QuizChallengeModal';
import { Footer } from './components/Footer';

export default function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats());
  const [activeSubject, setActiveSubject] = useState<SubjectId | 'home'>('home');
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const handleXpEarned = () => {
    setStats(loadUserStats());
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.setMuted(nextMute);
  };

  const handleSelectSubject = (subject: SubjectId | 'home') => {
    setActiveSubject(subject);
    if (subject !== 'home') {
      // Scroll down smoothly to active subject section if needed
      const element = document.getElementById(`module-${subject}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-white flex flex-col justify-between">
      
      {/* Sticky Top Bar & Stats HUD */}
      <Header
        stats={stats}
        activeSubject={activeSubject}
        onSelectSubject={handleSelectSubject}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 space-y-12 pb-12">
        
        {/* Landing View (Shown on Home or at top of workspace) */}
        {activeSubject === 'home' && (
          <>
            <HeroBanner
              onSelectSubject={handleSelectSubject}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />

            <SubjectCards onSelectSubject={handleSelectSubject} />
          </>
        )}

        {/* Dedicated Interactive Subject Modules */}

        {/* Computer Science Zone */}
        {(activeSubject === 'home' || activeSubject === 'cs') && (
          <div id="module-cs" className="scroll-mt-20">
            <SortingVisualizer onXpEarned={handleXpEarned} />
          </div>
        )}

        {/* Mathematics Zone */}
        {(activeSubject === 'home' || activeSubject === 'math') && (
          <div id="module-math" className="scroll-mt-20">
            <WaveGenerator onXpEarned={handleXpEarned} />
          </div>
        )}

        {/* Physics Zone */}
        {(activeSubject === 'home' || activeSubject === 'physics') && (
          <div id="module-physics" className="scroll-mt-20">
            <PhysicsSandbox onXpEarned={handleXpEarned} />
          </div>
        )}

        {/* Chemistry Zone */}
        {(activeSubject === 'home' || activeSubject === 'chemistry') && (
          <div id="module-chemistry" className="scroll-mt-20">
            <MoleculeSandbox onXpEarned={handleXpEarned} />
          </div>
        )}

      </main>

      {/* Gamification Modals */}
      <AchievementsModal
        stats={stats}
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <QuizChallengeModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onXpEarned={handleXpEarned}
      />

      {/* Footer with LinkedIn Connect */}
      <Footer stats={stats} />

    </div>
  );
}
