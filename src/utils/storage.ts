import { UserStats, AchievementBadge } from '../types';
import confetti from 'canvas-confetti';
import { sound } from './sound';

const STORAGE_KEY = 'mindplay_user_stats';

export const INITIAL_STATS: UserStats = {
  xp: 150, // Starting bonus XP
  level: 1,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedBadges: ['first_spark'],
  completedChallenges: [],
  sortingGamesWon: 0,
  moleculesSynthesized: 0,
  wavesGenerated: 0,
  physicsSimulationsRun: 0,
};

export const ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'first_spark',
    title: 'First Spark',
    description: 'Entered MindPlay Studio and initialized learning systems.',
    icon: 'Sparkles',
    subject: 'general',
    xpReward: 50,
    category: 'Explorer',
  },
  {
    id: 'algo_alchemist',
    title: 'Algorithm Alchemist',
    description: 'Visualized all 5 Computer Science sorting algorithms.',
    icon: 'Code2',
    subject: 'cs',
    xpReward: 100,
    category: 'Mastery',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Won a "Beat the Clock" sorting game before time expired.',
    icon: 'Zap',
    subject: 'cs',
    xpReward: 150,
    category: 'Speed',
  },
  {
    id: 'wave_whisperer',
    title: 'Wave Whisperer',
    description: 'Generated custom trigonometric or Fourier harmonic math waves.',
    icon: 'Activity',
    subject: 'math',
    xpReward: 100,
    category: 'Creator',
  },
  {
    id: 'gravity_master',
    title: 'Gravity Master',
    description: 'Interacted with the Physics sandbox and launched projectile motion.',
    icon: 'Orbit',
    subject: 'physics',
    xpReward: 100,
    category: 'Mastery',
  },
  {
    id: 'bond_creator',
    title: 'Bond Master',
    description: 'Synthesized 3 or more glowing chemical molecules in the sandbox.',
    icon: 'Atom',
    subject: 'chemistry',
    xpReward: 150,
    category: 'Creator',
  },
  {
    id: 'polymath',
    title: 'Polymath Paragon',
    description: 'Reached Level 3 or higher across MindPlay Studio modules.',
    icon: 'Award',
    subject: 'general',
    xpReward: 250,
    category: 'Mastery',
  },
];

export const getLevelTitle = (level: number): string => {
  if (level <= 1) return 'Cadet Scholar';
  if (level === 2) return 'Cyber Apprentice';
  if (level === 3) return 'Algorithm Alchemist';
  if (level === 4) return 'Quantum Architect';
  if (level === 5) return 'Polymath Specialist';
  return 'MindPlay Grandmaster';
};

export const calculateLevel = (xp: number): { level: number; currentXp: number; nextLevelXp: number } => {
  // Level threshold curve: 0 -> 250 -> 600 -> 1100 -> 1800 -> 2700
  const thresholds = [0, 250, 600, 1100, 1800, 2700, 4000, 6000];
  let level = 1;
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1;
    }
  }
  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || currentThreshold + 1000;
  
  return {
    level,
    currentXp: xp - currentThreshold,
    nextLevelXp: nextThreshold - currentThreshold,
  };
};

export const loadUserStats = (): UserStats => {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserStats(INITIAL_STATS);
      return INITIAL_STATS;
    }
    const parsed = JSON.parse(raw) as UserStats;
    // Update streak if needed
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currDate = new Date(today);
      const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        parsed.streak += 1;
      } else if (diffDays > 1) {
        parsed.streak = 1; // Reset streak if missed a day
      }
      parsed.lastActiveDate = today;
      saveUserStats(parsed);
    }
    return parsed;
  } catch {
    return INITIAL_STATS;
  }
};

export const saveUserStats = (stats: UserStats): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage full or restricted
  }
};

export const addXp = (amount: number, reason: string): { newStats: UserStats; leveledUp: boolean } => {
  const currentStats = loadUserStats();
  const oldLevelInfo = calculateLevel(currentStats.xp);
  const newXp = currentStats.xp + amount;
  const newLevelInfo = calculateLevel(newXp);

  const leveledUp = newLevelInfo.level > oldLevelInfo.level;

  const newStats: UserStats = {
    ...currentStats,
    xp: newXp,
    level: newLevelInfo.level,
  };

  saveUserStats(newStats);

  if (leveledUp) {
    sound.playLevelUp();
    triggerConfetti();
  } else {
    sound.playSuccess();
  }

  return { newStats, leveledUp };
};

export const unlockBadge = (badgeId: string): UserStats => {
  const currentStats = loadUserStats();
  if (currentStats.unlockedBadges.includes(badgeId)) return currentStats;

  const badge = ACHIEVEMENTS.find((b) => b.id === badgeId);
  const rewardXp = badge ? badge.xpReward : 50;

  const updatedBadges = [...currentStats.unlockedBadges, badgeId];
  const newXp = currentStats.xp + rewardXp;
  const levelInfo = calculateLevel(newXp);

  const newStats: UserStats = {
    ...currentStats,
    unlockedBadges: updatedBadges,
    xp: newXp,
    level: levelInfo.level,
  };

  saveUserStats(newStats);
  sound.playLevelUp();
  triggerConfetti();

  return newStats;
};

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
    });
  } catch {
    // ignore
  }
};
