import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { UserStats } from '../types';
import { calculateLevel, getLevelTitle } from '../utils/storage';
import { Sparkles, Linkedin, Share2, Copy, Check, Heart } from 'lucide-react';

interface FooterProps {
  stats: UserStats;
}

export const Footer: React.FC<FooterProps> = ({ stats }) => {
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const levelInfo = calculateLevel(stats.xp);
  const levelTitle = getLevelTitle(levelInfo.level);

  const shareText = `🚀 MindPlay Studio - Interactive STEM Learning!
I'm Level ${levelInfo.level} (${levelTitle}) with ${stats.xp} XP!
Where Dry Theory Becomes Interactive Play.`;

  const handleCopyShare = () => {
    sound.playClick();
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-[#050508] border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
          
          {/* Left Brand Vision */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-black text-lg text-white tracking-tighter uppercase italic">
                MindPlay <span className="text-cyan-400">Studio</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              *"Where Dry Theory Becomes Interactive Play."* An interactive STEM visualizer platform built to capture student curiosity through gamified learning.
            </p>
          </div>

          {/* Social Connect & Share Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* LinkedIn Connect Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsLinkedInModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              <Linkedin className="w-4 h-4 text-[#0077b5] fill-current" />
              <span>Connect Creator</span>
            </button>

            {/* Share Achievements Button */}
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Rank Card!' : 'Share Progress'}</span>
            </button>

          </div>

        </div>

        {/* Bottom Rights */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
          <p>© {new Date().getFullYear()} MindPlay Studio | Interactive STEM Lab</p>
          <p className="flex items-center gap-1">
            Built with React, Tailwind CSS & HTML5 Canvas
          </p>
        </div>

      </div>

      {/* LinkedIn Connect Modal */}
      {isLinkedInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#050508] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#0077b5]/20 border border-[#0077b5]/50 flex items-center justify-center text-[#0077b5]">
              <Linkedin className="w-6 h-6 fill-current" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Connect on LinkedIn</h3>
              <p className="text-xs text-slate-400">
                Network with fellow educators, developers, and STEM enthusiasts!
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs text-slate-300">
              <p className="font-bold text-white">MindPlay Studio Student Network</p>
              <p className="text-slate-400">Connect to discuss interactive learning tools, open-source algorithms, and gamified education design.</p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0077b5] hover:bg-[#006396] text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105"
              >
                <Linkedin className="w-4 h-4 fill-current" />
                <span>Open LinkedIn Profile</span>
              </a>

              <button
                onClick={() => setIsLinkedInModalOpen(false)}
                className="px-4 py-2.5 bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
