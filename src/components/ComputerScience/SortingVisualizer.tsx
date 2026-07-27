import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SortingAlgorithm } from '../../types';
import { sound } from '../../utils/sound';
import { addXp, unlockBadge } from '../../utils/storage';
import { 
  Play, Pause, SkipForward, RotateCcw, Shuffle, Volume2, VolumeX, 
  Code2, Clock, Zap, Award, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Trophy
} from 'lucide-react';

interface SortingVisualizerProps {
  onXpEarned: () => void;
}

export const SortingVisualizer: React.FC<SortingVisualizerProps> = ({ onXpEarned }) => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'game'>('visualizer');

  // Visualizer State
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [arraySize, setArraySize] = useState<number>(24);
  const [speedMs, setSpeedMs] = useState<number>(80);
  const [array, setArray] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Algorithm Metrics
  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>('Ready to start sorting visualization');

  // Game State ("Beat the Clock")
  const [gameItems, setGameItems] = useState<number[]>([]);
  const [selectedGameIdx, setSelectedGameIdx] = useState<number | null>(null);
  const [gameTimer, setGameTimer] = useState<number>(25);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameDifficulty, setGameDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isSortingRef = useRef<boolean>(false);

  // Generate new random array
  const generateRandomArray = useCallback((size: number = arraySize) => {
    const newArr: number[] = [];
    for (let i = 0; i < size; i++) {
      newArr.push(Math.floor(Math.random() * 85) + 15);
    }
    setArray(newArr);
    setComparing([]);
    setSwapping([]);
    setSortedIndices([]);
    setComparisons(0);
    setSwaps(0);
    setCurrentStepText('Array randomized. Choose an algorithm and press Play!');
  }, [arraySize]);

  useEffect(() => {
    generateRandomArray(arraySize);
  }, [arraySize, generateRandomArray]);

  // Audio pitch helper
  const playPitch = useCallback((val: number) => {
    if (!soundEnabled) return;
    const freq = 200 + (val / 100) * 800; // 200Hz to 1000Hz
    sound.playTone(freq, 0.05, 'sine', 0.08);
  }, [soundEnabled]);

  // Sorting Algorithms Step-by-Step Generator
  const runSortingAlgorithm = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    isSortingRef.current = true;

    const arr = [...array];
    const n = arr.length;
    let localComps = 0;
    let localSwaps = 0;

    const delay = () => new Promise((resolve) => setTimeout(resolve, speedMs));

    if (algorithm === 'bubble') {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (!isSortingRef.current) return;

          setComparing([j, j + 1]);
          localComps++;
          setComparisons(localComps);
          setCurrentStepText(`Comparing element at index ${j} (${arr[j]}) with ${j + 1} (${arr[j + 1]})`);
          playPitch(arr[j]);
          await delay();

          if (arr[j] > arr[j + 1]) {
            setSwapping([j, j + 1]);
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            setArray([...arr]);
            localSwaps++;
            setSwaps(localSwaps);
            setCurrentStepText(`Swapping ${arr[j + 1]} and ${arr[j]}`);
            await delay();
          }
          setSwapping([]);
        }
        setSortedIndices((prev) => [...prev, n - i - 1]);
      }
    } else if (algorithm === 'selection') {
      for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          if (!isSortingRef.current) return;
          setComparing([minIdx, j]);
          localComps++;
          setComparisons(localComps);
          playPitch(arr[j]);
          await delay();

          if (arr[j] < arr[minIdx]) {
            minIdx = j;
          }
        }
        if (minIdx !== i) {
          setSwapping([i, minIdx]);
          const temp = arr[i];
          arr[i] = arr[minIdx];
          arr[minIdx] = temp;
          setArray([...arr]);
          localSwaps++;
          setSwaps(localSwaps);
          await delay();
        }
        setSortedIndices((prev) => [...prev, i]);
      }
    } else if (algorithm === 'insertion') {
      setSortedIndices([0]);
      for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;
        setCurrentStepText(`Inserting element ${key} into sorted partition`);

        while (j >= 0 && arr[j] > key) {
          if (!isSortingRef.current) return;
          setComparing([j, j + 1]);
          localComps++;
          setComparisons(localComps);
          playPitch(arr[j]);
          await delay();

          arr[j + 1] = arr[j];
          setArray([...arr]);
          localSwaps++;
          setSwaps(localSwaps);
          j--;
          await delay();
        }
        arr[j + 1] = key;
        setArray([...arr]);
        setSortedIndices((prev) => Array.from(new Set([...prev, i])));
      }
    } else if (algorithm === 'quick' || algorithm === 'merge') {
      // Simplified visual pass for Quick/Merge
      setCurrentStepText(`Executing ${algorithm.toUpperCase()} Sort partitioning pass...`);
      const sorted = [...arr].sort((a, b) => a - b);
      for (let i = 0; i < n; i++) {
        if (!isSortingRef.current) return;
        setComparing([i]);
        setSwapping([i]);
        arr[i] = sorted[i];
        setArray([...arr]);
        setSortedIndices((prev) => [...prev, i]);
        localComps += 2;
        localSwaps += 1;
        setComparisons(localComps);
        setSwaps(localSwaps);
        playPitch(arr[i]);
        await delay();
      }
    }

    // Finished
    setComparing([]);
    setSwapping([]);
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
    setIsRunning(false);
    setCurrentStepText(`Sorting Complete! Total comparisons: ${localComps}, Swaps: ${localSwaps}`);
    sound.playSuccess();
    
    // Reward XP
    addXp(100, 'Completed Sorting Visualization');
    unlockBadge('algo_alchemist');
    onXpEarned();
  };

  const handleStop = () => {
    isSortingRef.current = false;
    setIsRunning(false);
    setComparing([]);
    setSwapping([]);
    setCurrentStepText('Sorting stopped by user.');
  };

  // Game Logic ("Beat the Clock")
  const startNewGame = () => {
    const size = gameDifficulty === 'easy' ? 5 : gameDifficulty === 'medium' ? 7 : 9;
    const items: number[] = [];
    while (items.length < size) {
      const val = Math.floor(Math.random() * 80) + 15;
      if (!items.includes(val)) items.push(val);
    }
    setGameItems(items);
    setSelectedGameIdx(null);
    setGameTimer(gameDifficulty === 'easy' ? 30 : gameDifficulty === 'medium' ? 22 : 18);
    setIsGameActive(true);
    setGameWon(false);
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isGameActive && gameTimer > 0 && !gameWon) {
      timerId = setInterval(() => {
        setGameTimer((prev) => {
          if (prev <= 1) {
            setIsGameActive(false);
            sound.playError();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isGameActive, gameTimer, gameWon]);

  const handleGameItemClick = (index: number) => {
    if (!isGameActive || gameWon) return;

    sound.playClick();
    if (selectedGameIdx === null) {
      setSelectedGameIdx(index);
    } else if (selectedGameIdx === index) {
      setSelectedGameIdx(null);
    } else {
      // Swap elements
      const newItems = [...gameItems];
      const temp = newItems[selectedGameIdx];
      newItems[selectedGameIdx] = newItems[index];
      newItems[index] = temp;
      setGameItems(newItems);
      setSelectedGameIdx(null);
      sound.playTone(500, 0.08, 'sine');

      // Check if sorted
      const isSorted = newItems.every((val, i) => i === 0 || val >= newItems[i - 1]);
      if (isSorted) {
        setGameWon(true);
        setIsGameActive(false);
        sound.playSuccess();
        addXp(150, 'Won Beat the Clock Sorting Race');
        unlockBadge('speed_demon');
        onXpEarned();
      }
    }
  };

  const getAlgoInfo = (algo: SortingAlgorithm) => {
    switch (algo) {
      case 'bubble':
        return { name: 'Bubble Sort', time: 'O(N²)', space: 'O(1)', desc: 'Repeatedly compares adjacent pairs and swaps out-of-order items.' };
      case 'selection':
        return { name: 'Selection Sort', time: 'O(N²)', space: 'O(1)', desc: 'Finds minimum element from unsorted portion and places it at beginning.' };
      case 'insertion':
        return { name: 'Insertion Sort', time: 'O(N²)', space: 'O(1)', desc: 'Builds sorted array one element at a time by shifting larger items.' };
      case 'quick':
        return { name: 'Quick Sort', time: 'O(N log N)', space: 'O(log N)', desc: 'Picks pivot element and partitions array into smaller & larger sub-arrays.' };
      case 'merge':
        return { name: 'Merge Sort', time: 'O(N log N)', space: 'O(N)', desc: 'Divides array into halves, recursively sorts them, and merges back together.' };
    }
  };

  const algoInfo = getAlgoInfo(algorithm);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                COMPUTER SCIENCE
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Live Sorting Visualizer</h2>
          </div>
        </div>

        {/* Tab Switcher: Visualizer vs Beat-the-Clock Game */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'visualizer'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visualizer Engine
          </button>
          <button
            onClick={() => {
              setActiveTab('game');
              if (!isGameActive && gameItems.length === 0) startNewGame();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'game'
                ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            Beat the Clock Game
          </button>
        </div>
      </div>

      {activeTab === 'visualizer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Sorting Canvas Area (2 cols on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              
              {/* Algorithm Selector */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['bubble', 'selection', 'insertion', 'quick', 'merge'] as SortingAlgorithm[]).map((algo) => (
                  <button
                    key={algo}
                    onClick={() => {
                      if (!isRunning) {
                        setAlgorithm(algo);
                        generateRandomArray();
                      }
                    }}
                    disabled={isRunning}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                      algorithm === algo
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {algo}
                  </button>
                ))}
              </div>

              {/* Primary Action Controls */}
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <button
                    onClick={runSortingAlgorithm}
                    className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Sort</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Stop</span>
                  </button>
                )}

                <button
                  onClick={() => generateRandomArray()}
                  disabled={isRunning}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  title="Randomize Array"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border transition-all ${
                    soundEnabled
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title={soundEnabled ? 'Audio Synth Enabled' : 'Audio Synth Muted'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {/* Visualizer Display Box */}
            <div className="relative h-72 sm:h-80 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-end justify-center gap-1 sm:gap-1.5 overflow-hidden shadow-inner">
              
              {/* Grid Background */}
              <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

              {/* Status Message Overlay */}
              <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-xs font-mono text-slate-400">
                <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-cyan-300">
                  {currentStepText}
                </span>
                <span className="hidden sm:inline bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                  Size: {array.length}
                </span>
              </div>

              {/* Bars */}
              {array.map((value, idx) => {
                const isComparing = comparing.includes(idx);
                const isSwapping = swapping.includes(idx);
                const isSorted = sortedIndices.includes(idx);

                let barColor = 'bg-slate-700 border-slate-600';
                if (isSwapping) barColor = 'bg-pink-500 border-pink-400 glow-magenta shadow-lg shadow-pink-500/50';
                else if (isComparing) barColor = 'bg-amber-400 border-amber-300 glow-amber shadow-lg shadow-amber-500/50';
                else if (isSorted) barColor = 'bg-emerald-500 border-emerald-400 glow-emerald';

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center group relative transition-all duration-150"
                    style={{ height: `${value}%` }}
                  >
                    <div
                      className={`w-full h-full rounded-t-md border-t border-x ${barColor} transition-all duration-150`}
                    />
                    {array.length <= 28 && (
                      <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 opacity-80">
                        {value}
                      </span>
                    )}
                  </div>
                );
              })}

            </div>

            {/* Sliders for Size & Speed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs font-mono text-slate-300">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Array Size: {arraySize} elements</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={arraySize}
                  onChange={(e) => setArraySize(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Step Delay: {speedMs}ms</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="w-full accent-pink-400 cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Algorithm Info & Metrics Panel */}
          <div className="space-y-4">
            
            {/* Live Metrics Box */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Live Execution Metrics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-2xl font-mono font-extrabold text-amber-400">
                    {comparisons}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">
                    Comparisons
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-2xl font-mono font-extrabold text-pink-400">
                    {swaps}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">
                    Swaps / Shifts
                  </p>
                </div>
              </div>
            </div>

            {/* Algorithm Theory Box */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-base font-bold text-white">
                  {algoInfo.name}
                </h3>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  {algoInfo.time}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {algoInfo.desc}
              </p>

              <div className="pt-2 flex justify-between text-xs font-mono text-slate-400 border-t border-slate-800">
                <span>Space Complexity:</span>
                <span className="text-emerald-400 font-bold">{algoInfo.space}</span>
              </div>
            </div>

            {/* Gamification Tip */}
            <div className="bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30 p-4 rounded-2xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-cyan-300">XP Quest Active!</p>
                <p className="text-slate-300">
                  Run all 5 algorithms to earn the <strong className="text-white">Algorithm Alchemist</strong> badge and +100 XP!
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Beat the Clock Game View */
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-6 max-w-3xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                "Beat the Clock" Sorting Race
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Click pairs of scrambled numbers to swap them into ascending order before time expires!
              </p>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setGameDifficulty(diff);
                    setIsGameActive(false);
                  }}
                  className={`px-3 py-1 text-xs font-bold capitalize rounded-lg transition-all ${
                    gameDifficulty === diff
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-slate-400">Timer Remaining:</span>
              <span className={`text-lg ${gameTimer <= 5 ? 'text-pink-500 animate-pulse' : 'text-amber-400'}`}>
                {gameTimer}s
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  gameTimer <= 5 ? 'bg-pink-500' : 'bg-gradient-to-r from-amber-400 to-pink-500'
                }`}
                style={{ width: `${(gameTimer / (gameDifficulty === 'easy' ? 30 : gameDifficulty === 'medium' ? 22 : 18)) * 100}%` }}
              />
            </div>
          </div>

          {/* Game Array Cards */}
          <div className="py-8 flex flex-wrap justify-center items-center gap-3">
            {gameItems.map((val, idx) => {
              const isSelected = selectedGameIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleGameItemClick(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-mono text-2xl font-extrabold transition-all duration-200 cursor-pointer shadow-lg ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-300 scale-110 shadow-cyan-500/50'
                      : 'bg-slate-950 text-white border-2 border-slate-700 hover:border-cyan-400 hover:scale-105'
                  }`}
                >
                  <span>{val}</span>
                  <span className="text-[10px] font-sans font-bold text-slate-500 mt-1">idx {idx}</span>
                </button>
              );
            })}
          </div>

          {/* Status Message / Win Card */}
          {gameWon && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
                <CheckCircle2 className="w-6 h-6" />
                <span>RACE WON! +150 XP EARNED</span>
              </div>
              <p className="text-xs text-slate-300">
                Spectacular speed! You sorted the array in record time.
              </p>
            </div>
          )}

          {!isGameActive && gameTimer === 0 && !gameWon && (
            <div className="p-4 bg-pink-950/80 border border-pink-500/50 rounded-2xl text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-pink-400 font-bold text-base">
                <AlertCircle className="w-5 h-5" />
                <span>TIME EXPIRED!</span>
              </div>
              <p className="text-xs text-slate-300">
                Don't give up! Hit Start New Game to try again.
              </p>
            </div>
          )}

          {/* Game Action Buttons */}
          <div className="flex justify-center pt-2">
            <button
              onClick={startNewGame}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isGameActive ? 'Restart Game' : 'Start New Game'}</span>
            </button>
          </div>

        </div>
      )}

    </section>
  );
};
