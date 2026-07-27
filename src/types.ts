export type SubjectId = 'cs' | 'math' | 'physics' | 'chemistry';

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  unlockedBadges: string[];
  completedChallenges: string[];
  sortingGamesWon: number;
  moleculesSynthesized: number;
  wavesGenerated: number;
  physicsSimulationsRun: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  subject?: SubjectId | 'general';
  xpReward: number;
  category: 'Explorer' | 'Mastery' | 'Speed' | 'Creator';
}

export interface QuizQuestion {
  id: string;
  subject: SubjectId;
  question: string;
  codeSnippet?: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

// Computer Science Types
export type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';

export interface SortingStep {
  array: number[];
  comparedIndices: number[];
  swappedIndices: number[];
  sortedIndices: number[];
  description: string;
}

// Math Wave Types
export interface WaveParams {
  type: 'sine' | 'fourier' | 'lissajous' | 'tesseract';
  amplitude: number;
  frequency: number;
  phase: number;
  damping: number;
  harmonics: number;
  color: string;
}

// Physics Body Types
export interface PhysicsBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  trail: { x: number; y: number }[];
  isPinned?: boolean;
}

export interface PhysicsParams {
  gravity: number; // 0 to 30
  friction: number; // 0 to 0.1
  restitution: number; // 0.1 to 1.0 (bounciness)
  airResistance: number;
  preset: 'bounce' | 'orbit' | 'pendulum' | 'cannon';
}

// Chemistry Molecule Types
export interface ChemicalElement {
  symbol: string;
  name: string;
  atomicNumber: number;
  valenceElectrons: number;
  category: string;
  color: string;
}

export interface Molecule {
  id: string;
  name: string;
  formula: string;
  elements: { symbol: string; count: number }[];
  bonds: 'covalent' | 'ionic' | 'polar_covalent';
  geometry: string;
  funFact: string;
  energyType: 'Exothermic' | 'Endothermic' | 'Stable';
}
