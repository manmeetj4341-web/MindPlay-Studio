import React, { useState } from 'react';
import { QuizQuestion, SubjectId } from '../../types';
import { sound } from '../../utils/sound';
import { addXp } from '../../utils/storage';
import { X, Zap, Sparkles, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface QuizChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onXpEarned: () => void;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'cs1',
    subject: 'cs',
    question: 'Which sorting algorithm guarantees O(N log N) worst-case time complexity?',
    options: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Selection Sort'],
    correctIndex: 1,
    explanation: 'Merge Sort divides the array into halves recursively, ensuring consistent O(N log N) time complexity even in worst-case scenarios.',
    xpReward: 50,
  },
  {
    id: 'math1',
    subject: 'math',
    question: 'In a trigonometric wave y = A sin(ωt + ϕ), what does parameter A determine?',
    options: ['Wave Frequency', 'Phase Offset', 'Peak Amplitude', 'Damping Factor'],
    correctIndex: 2,
    explanation: 'Amplitude A defines the maximum vertical displacement or wave height from the equilibrium center line.',
    xpReward: 50,
  },
  {
    id: 'physics1',
    subject: 'physics',
    question: 'What happens to Kinetic Energy when an object’s velocity is doubled?',
    options: ['It doubles (2x)', 'It quadruples (4x)', 'It remains constant', 'It triples (3x)'],
    correctIndex: 1,
    explanation: 'Because Kinetic Energy formula is KE = ½ m v², doubling velocity v quadruples KE by a factor of 2² = 4.',
    xpReward: 50,
  },
  {
    id: 'chem1',
    subject: 'chemistry',
    question: 'What type of chemical bond holds two Hydrogen atoms to one Oxygen atom in H₂O?',
    options: ['Ionic Bond', 'Polar Covalent Bond', 'Metallic Bond', 'Triple Covalent Bond'],
    correctIndex: 1,
    explanation: 'Oxygen shares electrons unequally with hydrogen due to its higher electronegativity, forming a polar covalent bond.',
    xpReward: 50,
  },
];

export const QuizChallengeModal: React.FC<QuizChallengeModalProps> = ({ isOpen, onClose, onXpEarned }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setIsCorrect(true);
      sound.playSuccess();
      addXp(currentQ.xpReward, 'Correct Insight Challenge Answer');
      onXpEarned();
    } else {
      setIsCorrect(false);
      sound.playError();
    }
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setCurrentIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/10 border border-pink-500/40 rounded-2xl text-pink-400">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 font-mono">
                MINI-CHALLENGE ({currentIdx + 1}/{QUIZ_QUESTIONS.length})
              </span>
              <h2 className="text-xl font-extrabold text-white">Test Your Insight</h2>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <p className="text-base font-bold text-white leading-relaxed">
            {currentQ.question}
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              let optionStyle = 'bg-slate-950 border-slate-800 hover:border-pink-500/50 text-slate-200';
              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                } else if (idx === selectedOption) {
                  optionStyle = 'bg-pink-950/80 border-pink-500 text-pink-300';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Answer Feedback Explanation */}
        {isAnswered && (
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 animate-fade-in ${
            isCorrect
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-pink-950/60 border-pink-500/40 text-pink-300'
          }`}>
            <div className="font-bold flex items-center gap-1.5">
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{isCorrect ? 'CORRECT! +50 XP AWARDED' : 'INCORRECT'}</span>
            </div>
            <p className="text-slate-300">{currentQ.explanation}</p>
          </div>
        )}

        {/* Actions */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <span>Next Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
