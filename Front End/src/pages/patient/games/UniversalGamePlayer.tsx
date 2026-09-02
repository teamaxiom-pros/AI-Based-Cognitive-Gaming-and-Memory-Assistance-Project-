import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { GameCategory, GameResultRecord } from '../../../types/gameTypes';
import { gamesLibrary } from '../../../data/gamesLibraryData';
import { calculateDifficulty, CULTURAL_ITEMS } from '../../../services/levelGenerator';
import {
  getGameProgress,
  recordLevelCompletion,
} from '../../../services/gameProgressionService';
import { soundEffects } from '../../../services/soundEffects';
import { GameShell } from '../../../components/games/GameShell';
import { LevelSelectorModal } from '../../../components/games/LevelSelectorModal';
import { GameResultModal } from '../../../components/games/GameResultModal';
import { Sparkles, Check, HelpCircle, Eye, EyeOff, Star, ArrowRight, Compass, Clock, RotateCcw, HelpCircle as QuestionIcon } from 'lucide-react';

interface UniversalGamePlayerProps {
  initialGameId?: GameCategory;
  initialLevel?: number;
}

export const UniversalGamePlayer: React.FC<UniversalGamePlayerProps> = ({
  initialGameId = 'memory-match',
  initialLevel,
}) => {
  const { patient, navigate, currentRoute, recordActivityPlay, showToast } = useApp();
  const [activeGameId, setActiveGameId] = useState<GameCategory>(initialGameId);
  const [gameProgress, setGameProgress] = useState(() => getGameProgress(activeGameId));

  const queryParams = new URLSearchParams(
    currentRoute.includes('?') ? currentRoute.split('?')[1] : typeof window !== 'undefined' ? window.location.search : ''
  );
  const parsedLevel = queryParams.get('level') ? parseInt(queryParams.get('level')!, 10) : undefined;

  const [currentLevel, setCurrentLevel] = useState(
    effectiveInitialLevel(initialLevel, parsedLevel, gameProgress.currentLevel)
  );

  function effectiveInitialLevel(propLvl?: number, queryLvl?: number, progressLvl?: number): number {
    if (propLvl && propLvl >= 1) return propLvl;
    if (queryLvl && queryLvl >= 1) return queryLvl;
    return progressLvl || 1;
  }

  const gameDef = gamesLibrary.find(g => g.id === activeGameId) || gamesLibrary[0];
  const levelConfig = calculateDifficulty(activeGameId, currentLevel);

  // Modals state
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastResult, setLastResult] = useState<GameResultRecord | null>(null);

  // Game session states
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(levelConfig.hintsAllowed);
  const [highlightedHintId, setHighlightedHintId] = useState<string | number | null>(null);

  // Specific Game States
  // 1. Memory Match
  const [memoryCards, setMemoryCards] = useState<
    { uid: string; id: string; name: string; icon: string; flipped: boolean; matched: boolean }[]
  >([]);
  const [flippedCardIndices, setFlippedCardIndices] = useState<number[]>([]);

  // 2. Picture Recall & Word Recall
  const [recallPhase, setRecallPhase] = useState<'observe' | 'delay' | 'recall'>('observe');
  const [observeCountdown, setObserveCountdown] = useState(8);
  const [delayCountdown, setDelayCountdown] = useState(0);
  const [targetItems, setTargetItems] = useState<typeof CULTURAL_ITEMS>([]);
  const [selectableChoices, setSelectableChoices] = useState<typeof CULTURAL_ITEMS>([]);
  const [selectedRecallIds, setSelectedRecallIds] = useState<string[]>([]);

  // 3. Sequence Builder
  const [sequenceTargets, setSequenceTargets] = useState<typeof CULTURAL_ITEMS>([]);
  const [sequencePlaybackIdx, setSequencePlaybackIdx] = useState<number | null>(null);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);

  // 4. Number Memory (Digit Span)
  const [numberSequence, setNumberSequence] = useState<number[]>([]);
  const [enteredNumberSeq, setEnteredNumberSeq] = useState<number[]>([]);
  const [numberPhase, setNumberPhase] = useState<'observe' | 'delay' | 'input'>('observe');

  // 5. Pattern Recall (Matrix)
  const [activePatternTiles, setActivePatternTiles] = useState<number[]>([]);
  const [selectedPatternTiles, setSelectedPatternTiles] = useState<number[]>([]);
  const [patternPhase, setPatternPhase] = useState<'observe' | 'recall'>('observe');

  // 6. Attention Finder
  const [finderCells, setFinderCells] = useState<
    { uid: string; item: (typeof CULTURAL_ITEMS)[0]; isTarget: boolean; found: boolean }[]
  >([]);
  const [targetItemForFinder, setTargetItemForFinder] = useState<(typeof CULTURAL_ITEMS)[0] | null>(
    null
  );

  // 7. Odd One Out
  const [oddItemsList, setOddItemsList] = useState<
    { id: string; name: string; icon: string; isOutlier: boolean }[]
  >([]);

  // 8. Category Sorting
  const [sortingQueue, setSortingQueue] = useState<(typeof CULTURAL_ITEMS)[0][]>([]);
  const [sortedCount, setSortedCount] = useState(0);

  // 9. Spatial Memory
  const [spatialPositions, setSpatialPositions] = useState<
    { cellIndex: number; item: (typeof CULTURAL_ITEMS)[0] }[]
  >([]);
  const [userPlacedCells, setUserPlacedCells] = useState<Record<number, string>>({});

  // 10. Cultural Symbols Memory (`symbol-matching`)
  const [symbolMemoryPhase, setSymbolMemoryPhase] = useState<
    'memorize' | 'delay' | 'recall_symbols' | 'recall_position' | 'recall_neighbor' | 'recall_missing'
  >('memorize');
  const [symbolTargetItems, setSymbolTargetItems] = useState<(typeof CULTURAL_ITEMS)[0][]>([]);
  const [symbolChoices, setSymbolChoices] = useState<(typeof CULTURAL_ITEMS)[0][]>([]);
  const [selectedSymbolIds, setSelectedSymbolIds] = useState<string[]>([]);
  const [symbolObserveCountdown, setSymbolObserveCountdown] = useState(10);
  const [symbolDelayCountdown, setSymbolDelayCountdown] = useState(2);
  const [positionQuestion, setPositionQuestion] = useState<{
    targetItem: (typeof CULTURAL_ITEMS)[0];
    correctPos: number; // 1-indexed
    options: number[]; // 1-indexed
  } | null>(null);
  const [selectedPositionAnswer, setSelectedPositionAnswer] = useState<number | null>(null);
  const [neighborQuestion, setNeighborQuestion] = useState<{
    baseItem: (typeof CULTURAL_ITEMS)[0];
    neighborItem: (typeof CULTURAL_ITEMS)[0];
    options: (typeof CULTURAL_ITEMS)[0][];
  } | null>(null);
  const [missingQuestion, setMissingQuestion] = useState<{
    missingItem: (typeof CULTURAL_ITEMS)[0];
    presentedSet: (typeof CULTURAL_ITEMS)[0][];
    options: (typeof CULTURAL_ITEMS)[0][];
  } | null>(null);
  const [symbolStepScore, setSymbolStepScore] = useState<{
    symbolAccuracy: number;
    positionCorrect?: boolean;
    neighborCorrect?: boolean;
    missingCorrect?: boolean;
  }>({ symbolAccuracy: 100 });

  // 11. Object Recognition (Simple Match)
  const [symbolTarget, setSymbolTarget] = useState<(typeof CULTURAL_ITEMS)[0] | null>(null);
  const [symbolOptions, setSymbolOptions] = useState<(typeof CULTURAL_ITEMS)[0][]>([]);

  // Setup level whenever activeGameId or currentLevel changes
  useEffect(() => {
    setupLevel();
  }, [activeGameId, currentLevel]);

  // Timer interval
  useEffect(() => {
    if (showResultModal) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showResultModal, activeGameId, currentLevel]);

  const setupLevel = () => {
    setTimerSeconds(0);
    setMovesCount(0);
    setHintsRemaining(levelConfig.hintsAllowed);
    setHighlightedHintId(null);
    setShowResultModal(false);

    const cfg = calculateDifficulty(activeGameId, currentLevel);

    // 1. Setup Memory Match
    if (activeGameId === 'memory-match') {
      const pairCount = cfg.targetCount;
      const available = CULTURAL_ITEMS.filter(c => cfg.itemPool.includes(c.id));
      const pool = available.length >= pairCount ? available : CULTURAL_ITEMS;
      const items = [...pool].sort(() => 0.5 - Math.random()).slice(0, pairCount);
      const deck = items
        .flatMap(it => [
          { uid: `${it.id}-a-${Math.random()}`, id: it.id, name: it.name, icon: it.icon, flipped: false, matched: false },
          { uid: `${it.id}-b-${Math.random()}`, id: it.id, name: it.name, icon: it.icon, flipped: false, matched: false },
        ])
        .sort(() => 0.5 - Math.random());
      setMemoryCards(deck);
      setFlippedCardIndices([]);
    }

    // 2. Setup Picture Recall & Word Recall
    else if (activeGameId === 'picture-recall' || activeGameId === 'word-recall') {
      const available = CULTURAL_ITEMS.filter(c => cfg.itemPool.includes(c.id));
      const pool = available.length >= cfg.numberOfChoices ? available : CULTURAL_ITEMS;
      const targets = [...pool].sort(() => 0.5 - Math.random()).slice(0, cfg.targetCount);
      const distractors = pool
        .filter(it => !targets.some(t => t.id === it.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, cfg.distractorCount);
      const choices = [...targets, ...distractors].sort(() => 0.5 - Math.random());

      setTargetItems(targets);
      setSelectableChoices(choices);
      setSelectedRecallIds([]);
      setRecallPhase('observe');
      const obsSecs = Math.round((cfg.revealDurationMs || 8000) / 1000);
      setObserveCountdown(obsSecs);

      const countdownInterval = setInterval(() => {
        setObserveCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownInterval);
            if (cfg.delayBeforeRecallMs && cfg.delayBeforeRecallMs > 0) {
              setRecallPhase('delay');
              const delaySecs = Math.round(cfg.delayBeforeRecallMs / 1000);
              setDelayCountdown(delaySecs);
              const delayTimer = setInterval(() => {
                setDelayCountdown(dc => {
                  if (dc <= 1) {
                    clearInterval(delayTimer);
                    setRecallPhase('recall');
                    soundEffects.playSoftClick();
                    return 0;
                  }
                  return dc - 1;
                });
              }, 1000);
            } else {
              setRecallPhase('recall');
              soundEffects.playSoftClick();
            }
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }

    // 3. Setup Sequence Builder
    else if (activeGameId === 'sequence-builder') {
      const seqItems = [...CULTURAL_ITEMS].slice(0, cfg.gridSize);
      const generatedSeq = Array.from(
        { length: cfg.sequenceLength },
        () => seqItems[Math.floor(Math.random() * seqItems.length)]
      );
      setSelectableChoices(seqItems);
      setSequenceTargets(generatedSeq);
      setUserSequence([]);
      playSequenceAnimation(generatedSeq);
    }

    // 4. Setup Number Memory
    else if (activeGameId === 'number-memory') {
      const digits = Array.from({ length: cfg.targetCount }, () => Math.floor(Math.random() * 9) + 1);
      setNumberSequence(digits);
      setEnteredNumberSeq([]);
      setNumberPhase('observe');

      const viewDuration = cfg.revealDurationMs || 4000;
      setTimeout(() => {
        if (cfg.delayBeforeRecallMs && cfg.delayBeforeRecallMs > 0) {
          setNumberPhase('delay');
          setTimeout(() => {
            setNumberPhase('input');
            soundEffects.playSoftClick();
          }, cfg.delayBeforeRecallMs);
        } else {
          setNumberPhase('input');
          soundEffects.playSoftClick();
        }
      }, viewDuration);
    }

    // 5. Setup Pattern Recall
    else if (activeGameId === 'pattern-recall') {
      const totalTiles = cfg.gridSize; // 9 or 16
      const activeIndices: number[] = [];
      while (activeIndices.length < cfg.targetCount) {
        const rand = Math.floor(Math.random() * totalTiles);
        if (!activeIndices.includes(rand)) activeIndices.push(rand);
      }
      setActivePatternTiles(activeIndices);
      setSelectedPatternTiles([]);
      setPatternPhase('observe');
      setTimeout(() => {
        setPatternPhase('recall');
        soundEffects.playSoftClick();
      }, cfg.revealDurationMs || 4000);
    }

    // 6. Setup Attention Finder
    else if (activeGameId === 'attention-finder') {
      const target = CULTURAL_ITEMS[Math.floor(Math.random() * CULTURAL_ITEMS.length)];
      setTargetItemForFinder(target);

      const otherItems = CULTURAL_ITEMS.filter(it => it.id !== target.id);
      const cells: { uid: string; item: (typeof CULTURAL_ITEMS)[0]; isTarget: boolean; found: boolean }[] = [];

      for (let i = 0; i < cfg.targetCount; i++) {
        cells.push({ uid: `target-${i}`, item: target, isTarget: true, found: false });
      }
      for (let i = 0; i < cfg.distractorCount; i++) {
        const dist = otherItems[Math.floor(Math.random() * otherItems.length)];
        cells.push({ uid: `dist-${i}`, item: dist, isTarget: false, found: false });
      }
      setFinderCells(cells.sort(() => 0.5 - Math.random()));
    }

    // 7. Setup Odd One Out
    else if (activeGameId === 'odd-one-out') {
      let mainGroup = CULTURAL_ITEMS.filter(c => c.category === 'Flora' || c.category === 'Fruit');
      let otherGroup = CULTURAL_ITEMS.filter(c => c.category !== 'Flora' && c.category !== 'Fruit');

      if (cfg.level >= 60) {
        mainGroup = CULTURAL_ITEMS.filter(c => c.category === 'Handloom' || c.category === 'Handicraft');
        otherGroup = CULTURAL_ITEMS.filter(c => c.category === 'Household' || c.category === 'Kitchen');
      }

      const commonItems = mainGroup.slice(0, Math.min(mainGroup.length, cfg.numberOfChoices - 1));
      const outlier = otherGroup[Math.floor(Math.random() * otherGroup.length)];

      const list = [
        ...commonItems.map(c => ({ id: c.id, name: c.name, icon: c.icon, isOutlier: false })),
        { id: outlier.id, name: outlier.name, icon: outlier.icon, isOutlier: true },
      ].sort(() => 0.5 - Math.random());
      setOddItemsList(list);
    }

    // 8. Setup Category Sorting
    else if (activeGameId === 'category-sorting') {
      const itemsToSort = [...CULTURAL_ITEMS].sort(() => 0.5 - Math.random()).slice(0, cfg.targetCount);
      setSortingQueue(itemsToSort);
      setSortedCount(0);
    }

    // 9. Setup Spatial Memory
    else if (activeGameId === 'spatial-memory') {
      const targetCount = cfg.targetCount;
      const totalCells = cfg.gridSize; // 9 or 16
      const chosenItems = [...CULTURAL_ITEMS].sort(() => 0.5 - Math.random()).slice(0, targetCount);
      const usedIndices: number[] = [];
      const positions: { cellIndex: number; item: (typeof CULTURAL_ITEMS)[0] }[] = [];

      chosenItems.forEach(item => {
        let cellIdx = Math.floor(Math.random() * totalCells);
        while (usedIndices.includes(cellIdx)) {
          cellIdx = Math.floor(Math.random() * totalCells);
        }
        usedIndices.push(cellIdx);
        positions.push({ cellIndex: cellIdx, item });
      });

      setSpatialPositions(positions);
      setUserPlacedCells({});
      setRecallPhase('observe');
      const viewSecs = Math.round((cfg.revealDurationMs || 6000) / 1000);
      setObserveCountdown(viewSecs);

      setTimeout(() => {
        setRecallPhase('recall');
        soundEffects.playSoftClick();
      }, cfg.revealDurationMs || 6000);
    }

    // 10. Setup Cultural Symbols Memory (`symbol-matching`)
    else if (activeGameId === 'symbol-matching') {
      const available = CULTURAL_ITEMS.filter(c => cfg.itemPool.includes(c.id));
      const pool = available.length >= cfg.numberOfChoices ? available : CULTURAL_ITEMS;
      const targets = [...pool].sort(() => 0.5 - Math.random()).slice(0, cfg.targetCount);
      const distractors = pool
        .filter(it => !targets.some(t => t.id === it.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, cfg.distractorCount);
      const choices = [...targets, ...distractors].sort(() => 0.5 - Math.random());

      setSymbolTargetItems(targets);
      setSymbolChoices(choices);
      setSelectedSymbolIds([]);
      setSelectedPositionAnswer(null);
      setSymbolMemoryPhase('memorize');

      const viewSecs = Math.max(3, Math.round((cfg.revealDurationMs || 10000) / 1000));
      const delaySecs = Math.max(2, Math.round((cfg.delayBeforeRecallMs || 2000) / 1000));
      setSymbolObserveCountdown(viewSecs);
      setSymbolDelayCountdown(delaySecs);

      // Generate Positional Question if level >= 61
      if (cfg.level >= 61 && targets.length > 0) {
        const randIdx = Math.floor(Math.random() * targets.length);
        const correctPos = randIdx + 1; // 1-indexed
        const allPos = Array.from({ length: targets.length }, (_, i) => i + 1);
        const distractPos = allPos.filter(p => p !== correctPos).sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [correctPos, ...distractPos].sort((a, b) => a - b);
        setPositionQuestion({
          targetItem: targets[randIdx],
          correctPos,
          options,
        });
      } else {
        setPositionQuestion(null);
      }

      // Generate Neighbor Question if level >= 71
      if (cfg.level >= 71 && targets.length >= 2) {
        const baseIdx = Math.floor(Math.random() * (targets.length - 1));
        const neighbor = targets[baseIdx + 1];
        const otherChoices = pool.filter(c => c.id !== neighbor.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        setNeighborQuestion({
          baseItem: targets[baseIdx],
          neighborItem: neighbor,
          options: [neighbor, ...otherChoices].sort(() => 0.5 - Math.random()),
        });
      } else {
        setNeighborQuestion(null);
      }

      // Generate Missing Question if level >= 91
      if (cfg.level >= 91 && targets.length >= 4) {
        const missingIdx = Math.floor(Math.random() * targets.length);
        const missing = targets[missingIdx];
        const presented = targets.filter((_, idx) => idx !== missingIdx);
        const extraDistractors = pool.filter(c => !targets.some(t => t.id === c.id)).slice(0, 3);
        setMissingQuestion({
          missingItem: missing,
          presentedSet: presented,
          options: [missing, ...extraDistractors].sort(() => 0.5 - Math.random()),
        });
      } else {
        setMissingQuestion(null);
      }

      // Start Countdown for Stage 1 -> Stage 2 -> Stage 3
      const obsInterval = setInterval(() => {
        setSymbolObserveCountdown(c => {
          if (c <= 1) {
            clearInterval(obsInterval);
            // Switch to Stage 2: Memory Delay
            setSymbolMemoryPhase('delay');
            soundEffects.playSoftClick();

            const delayInterval = setInterval(() => {
              setSymbolDelayCountdown(dc => {
                if (dc <= 1) {
                  clearInterval(delayInterval);
                  // Switch to Stage 3: Recall
                  setSymbolMemoryPhase('recall_symbols');
                  soundEffects.playSoftClick();
                  return 0;
                }
                return dc - 1;
              });
            }, 1000);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }

    // 11. Setup Object Recognition (Standard Match)
    else {
      const target = CULTURAL_ITEMS[Math.floor(Math.random() * CULTURAL_ITEMS.length)];
      setSymbolTarget(target);
      const others = CULTURAL_ITEMS.filter(c => c.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, cfg.numberOfChoices - 1);
      const choices = [target, ...others].sort(() => 0.5 - Math.random());
      setSymbolOptions(choices);
    }
  };

  const playSequenceAnimation = (seq: typeof CULTURAL_ITEMS) => {
    setIsPlayingSequence(true);
    seq.forEach((item, idx) => {
      setTimeout(() => {
        setSequencePlaybackIdx(idx);
        soundEffects.playSoftClick();
      }, (idx + 1) * 850);
    });
    setTimeout(() => {
      setSequencePlaybackIdx(null);
      setIsPlayingSequence(false);
    }, (seq.length + 1) * 850);
  };

  const completeLevel = (accuracy: number) => {
    const result = recordLevelCompletion(
      patient.id,
      activeGameId,
      currentLevel,
      accuracy,
      Math.max(8, timerSeconds),
      levelConfig.hintsAllowed - hintsRemaining
    );
    setLastResult(result);
    setGameProgress(getGameProgress(activeGameId));
    recordActivityPlay(activeGameId, accuracy, timerSeconds);
    setShowResultModal(true);
  };

  // Handlers for Memory Match
  const handleCardClick = (index: number) => {
    if (flippedCardIndices.length === 2 || memoryCards[index].flipped || memoryCards[index].matched) {
      return;
    }

    soundEffects.playSoftClick();
    const newCards = [...memoryCards];
    newCards[index].flipped = true;
    setMemoryCards(newCards);

    const newFlipped = [...flippedCardIndices, index];
    setFlippedCardIndices(newFlipped);
    setMovesCount(m => m + 1);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (newCards[firstIdx].id === newCards[secondIdx].id) {
        soundEffects.playSuccessChime();
        setTimeout(() => {
          const matchedDeck = [...newCards];
          matchedDeck[firstIdx].matched = true;
          matchedDeck[secondIdx].matched = true;
          setMemoryCards(matchedDeck);
          setFlippedCardIndices([]);

          const allMatched = matchedDeck.every(c => c.matched);
          if (allMatched) {
            completeLevel(100);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetDeck = [...newCards];
          resetDeck[firstIdx].flipped = false;
          resetDeck[secondIdx].flipped = false;
          setMemoryCards(resetDeck);
          setFlippedCardIndices([]);
        }, 1100);
      }
    }
  };

  // Handlers for Picture / Word Recall
  const handleRecallSelect = (item: (typeof CULTURAL_ITEMS)[0]) => {
    if (selectedRecallIds.includes(item.id)) return;
    soundEffects.playSoftClick();

    const nextSelected = [...selectedRecallIds, item.id];
    setSelectedRecallIds(nextSelected);

    const isCorrectTarget = targetItems.some(t => t.id === item.id);
    if (isCorrectTarget) {
      soundEffects.playSuccessChime();
    }

    if (nextSelected.length === targetItems.length) {
      const correctCount = nextSelected.filter(id => targetItems.some(t => t.id === id)).length;
      const accuracy = Math.round((correctCount / targetItems.length) * 100);
      setTimeout(() => {
        completeLevel(accuracy);
      }, 500);
    }
  };

  // Handlers for Sequence Builder
  const handleSequenceChoiceTap = (item: (typeof CULTURAL_ITEMS)[0]) => {
    if (isPlayingSequence) return;
    soundEffects.playSoftClick();

    const nextUserSeq = [...userSequence, item.id];
    setUserSequence(nextUserSeq);

    const currentStepIdx = nextUserSeq.length - 1;
    const expectedTarget = levelConfig.isReverseOrder
      ? sequenceTargets[sequenceTargets.length - 1 - currentStepIdx]
      : sequenceTargets[currentStepIdx];

    if (item.id !== expectedTarget.id) {
      showToast(
        levelConfig.isReverseOrder
          ? 'Notice: Enter the items in reverse sequence order.'
          : 'Gently re-watch the rhythm and try again.'
      );
      setTimeout(() => {
        setUserSequence([]);
        playSequenceAnimation(sequenceTargets);
      }, 800);
      return;
    }

    if (nextUserSeq.length === sequenceTargets.length) {
      soundEffects.playSuccessChime();
      setTimeout(() => {
        completeLevel(100);
      }, 400);
    }
  };

  // Handlers for Number Memory
  const handleNumberInput = (num: number) => {
    soundEffects.playSoftClick();
    const nextSeq = [...enteredNumberSeq, num];
    setEnteredNumberSeq(nextSeq);

    const stepIdx = nextSeq.length - 1;
    const expectedDigit = levelConfig.isReverseOrder
      ? numberSequence[numberSequence.length - 1 - stepIdx]
      : numberSequence[stepIdx];

    if (num !== expectedDigit) {
      showToast(
        levelConfig.isReverseOrder
          ? 'Enter in reverse sequence order.'
          : 'Carefully recall the digit order.'
      );
      setEnteredNumberSeq([]);
      return;
    }

    if (nextSeq.length === numberSequence.length) {
      soundEffects.playSuccessChime();
      setTimeout(() => {
        completeLevel(100);
      }, 400);
    }
  };

  // Handlers for Pattern Recall
  const handlePatternTileTap = (tileIdx: number) => {
    if (patternPhase === 'observe' || selectedPatternTiles.includes(tileIdx)) return;
    soundEffects.playSoftClick();

    const nextSelected = [...selectedPatternTiles, tileIdx];
    setSelectedPatternTiles(nextSelected);

    if (activePatternTiles.includes(tileIdx)) {
      soundEffects.playSuccessChime();
    }

    if (nextSelected.length === activePatternTiles.length) {
      const correctMatches = nextSelected.filter(idx => activePatternTiles.includes(idx)).length;
      const accuracy = Math.round((correctMatches / activePatternTiles.length) * 100);
      setTimeout(() => {
        completeLevel(accuracy);
      }, 400);
    }
  };

  // Handlers for Attention Finder
  const handleFinderCellClick = (uid: string) => {
    const cell = finderCells.find(c => c.uid === uid);
    if (!cell || cell.found) return;

    if (cell.isTarget) {
      soundEffects.playSuccessChime();
      const updated = finderCells.map(c => (c.uid === uid ? { ...c, found: true } : c));
      setFinderCells(updated);
      setMovesCount(m => m + 1);

      const remainingTargets = updated.filter(c => c.isTarget && !c.found);
      if (remainingTargets.length === 0) {
        setTimeout(() => completeLevel(100), 500);
      }
    } else {
      soundEffects.playSoftClick();
      setMovesCount(m => m + 1);
    }
  };

  // Handlers for Odd One Out
  const handleOddItemTap = (isOutlier: boolean) => {
    if (isOutlier) {
      soundEffects.playSuccessChime();
      completeLevel(100);
    } else {
      soundEffects.playSoftClick();
      showToast('Look closely at the category, material, or purpose.');
    }
  };

  // Handlers for Category Sorting
  const handleSortItem = (selectedCategory: 'Nature' | 'Household') => {
    if (sortingQueue.length === 0) return;
    soundEffects.playSoftClick();

    const currentItem = sortingQueue[0];
    const isNatureItem =
      currentItem.category === 'Flora' ||
      currentItem.category === 'Fruit' ||
      currentItem.category === 'Wildlife' ||
      currentItem.category === 'Nature';

    const isCorrect =
      (selectedCategory === 'Nature' && isNatureItem) ||
      (selectedCategory === 'Household' && !isNatureItem);

    if (isCorrect) {
      soundEffects.playSuccessChime();
      const nextQueue = sortingQueue.slice(1);
      setSortingQueue(nextQueue);
      setSortedCount(c => c + 1);

      if (nextQueue.length === 0) {
        setTimeout(() => completeLevel(100), 400);
      }
    } else {
      showToast(`Hint: ${currentItem.name} belongs in the other category.`);
    }
  };

  // Handlers for Spatial Memory
  const handleSpatialCellTap = (cellIndex: number) => {
    if (recallPhase === 'observe') return;
    soundEffects.playSoftClick();

    const targetAtPos = spatialPositions.find(p => p.cellIndex === cellIndex);
    if (targetAtPos) {
      soundEffects.playSuccessChime();
      const nextPlaced = { ...userPlacedCells, [cellIndex]: targetAtPos.item.name };
      setUserPlacedCells(nextPlaced);

      if (Object.keys(nextPlaced).length === spatialPositions.length) {
        setTimeout(() => completeLevel(100), 400);
      }
    } else {
      showToast('That tile was empty in the veranda layout.');
    }
  };

  // Handlers for Cultural Symbols Memory (`symbol-matching`)
  const handleToggleSymbolSelection = (id: string) => {
    soundEffects.playSoftClick();
    setSelectedSymbolIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmitSymbolSelection = () => {
    soundEffects.playSoftClick();
    if (selectedSymbolIds.length === 0) {
      showToast('Please tap to select the symbols you remember seeing.');
      return;
    }

    const correctCount = selectedSymbolIds.filter(id => symbolTargetItems.some(t => t.id === id)).length;
    const incorrectCount = selectedSymbolIds.filter(id => !symbolTargetItems.some(t => t.id === id)).length;
    const totalTargets = symbolTargetItems.length;

    const baseAccuracy = Math.max(10, Math.round(((correctCount - incorrectCount * 0.4) / totalTargets) * 100));
    setSymbolStepScore(prev => ({ ...prev, symbolAccuracy: baseAccuracy }));

    // Advance to Positional Memory Question if applicable (Level >= 61)
    if (levelConfig.level >= 61 && positionQuestion) {
      setSymbolMemoryPhase('recall_position');
      soundEffects.playSuccessChime();
    } else {
      soundEffects.playSuccessChime();
      setTimeout(() => completeLevel(baseAccuracy), 400);
    }
  };

  const handleAnswerPositionQuestion = (selectedPos: number) => {
    soundEffects.playSoftClick();
    if (!positionQuestion) return;
    const isCorrect = selectedPos === positionQuestion.correctPos;
    setSelectedPositionAnswer(selectedPos);
    setSymbolStepScore(prev => ({ ...prev, positionCorrect: isCorrect }));

    if (isCorrect) {
      soundEffects.playSuccessChime();
    } else {
      showToast(`Position #${positionQuestion.correctPos} was where ${positionQuestion.targetItem.name} appeared.`);
    }

    // Advance to Neighbor Question if applicable (Level >= 71)
    if (levelConfig.level >= 71 && neighborQuestion) {
      setTimeout(() => {
        setSymbolMemoryPhase('recall_neighbor');
      }, 700);
    } else {
      const finalScore = isCorrect
        ? symbolStepScore.symbolAccuracy
        : Math.max(10, symbolStepScore.symbolAccuracy - 15);
      setTimeout(() => completeLevel(finalScore), 700);
    }
  };

  const handleAnswerNeighborQuestion = (selectedId: string) => {
    soundEffects.playSoftClick();
    if (!neighborQuestion) return;
    const isCorrect = selectedId === neighborQuestion.neighborItem.id;
    setSymbolStepScore(prev => ({ ...prev, neighborCorrect: isCorrect }));

    if (isCorrect) {
      soundEffects.playSuccessChime();
    } else {
      showToast(`${neighborQuestion.neighborItem.name} was next to ${neighborQuestion.baseItem.name}.`);
    }

    // Advance to Missing Question if applicable (Level >= 91)
    if (levelConfig.level >= 91 && missingQuestion) {
      setTimeout(() => {
        setSymbolMemoryPhase('recall_missing');
      }, 700);
    } else {
      const finalScore = isCorrect
        ? (symbolStepScore.symbolAccuracy + (symbolStepScore.positionCorrect ? 100 : 70)) / 2
        : Math.max(10, symbolStepScore.symbolAccuracy - 20);
      setTimeout(() => completeLevel(Math.round(finalScore)), 700);
    }
  };

  const handleAnswerMissingQuestion = (selectedId: string) => {
    soundEffects.playSoftClick();
    if (!missingQuestion) return;
    const isCorrect = selectedId === missingQuestion.missingItem.id;
    setSymbolStepScore(prev => ({ ...prev, missingCorrect: isCorrect }));

    if (isCorrect) {
      soundEffects.playSuccessChime();
    } else {
      showToast(`${missingQuestion.missingItem.name} was missing from the set.`);
    }

    const finalScore = isCorrect
      ? Math.round(
          (symbolStepScore.symbolAccuracy +
            (symbolStepScore.positionCorrect ? 100 : 70) +
            (symbolStepScore.neighborCorrect ? 100 : 70) +
            100) /
            4
        )
      : Math.max(10, symbolStepScore.symbolAccuracy - 25);

    setTimeout(() => completeLevel(finalScore), 700);
  };

  // Handlers for Object Recognition
  const handleSymbolMatchTap = (selectedId: string) => {
    soundEffects.playSoftClick();
    if (symbolTarget && selectedId === symbolTarget.id) {
      soundEffects.playSuccessChime();
      completeLevel(100);
    } else {
      showToast('Look closely at the shape and fine details.');
    }
  };

  // Shared Hint Handler
  const handleHintClick = () => {
    if (hintsRemaining <= 0) return;
    setHintsRemaining(h => h - 1);

    if (activeGameId === 'memory-match') {
      const unmatched = memoryCards.find(c => !c.matched && !c.flipped);
      if (unmatched) {
        setHighlightedHintId(unmatched.id);
        setTimeout(() => setHighlightedHintId(null), 2000);
      }
    } else if (activeGameId === 'picture-recall') {
      const target = targetItems.find(t => !selectedRecallIds.includes(t.id));
      if (target) {
        setHighlightedHintId(target.id);
        setTimeout(() => setHighlightedHintId(null), 2500);
      }
    } else if (activeGameId === 'symbol-matching') {
      if (symbolMemoryPhase === 'recall_symbols') {
        const target = symbolTargetItems.find(t => !selectedSymbolIds.includes(t.id));
        if (target) {
          setHighlightedHintId(target.id);
          setTimeout(() => setHighlightedHintId(null), 2500);
        }
      }
    } else if (activeGameId === 'odd-one-out') {
      const outlier = oddItemsList.find(i => i.isOutlier);
      if (outlier) {
        setHighlightedHintId(outlier.id);
        setTimeout(() => setHighlightedHintId(null), 2000);
      }
    } else if (activeGameId === 'attention-finder') {
      const target = finderCells.find(c => c.isTarget && !c.found);
      if (target) {
        setHighlightedHintId(target.uid);
        setTimeout(() => setHighlightedHintId(null), 2000);
      }
    }
  };

  return (
    <GameShell
      game={gameDef}
      levelConfig={levelConfig}
      hintsRemaining={hintsRemaining}
      onHintClick={handleHintClick}
      timerSeconds={timerSeconds}
      movesCount={movesCount}
      onSelectLevelClick={() => setShowLevelSelector(true)}
      onRestartClick={setupLevel}
      onExitClick={() => navigate('/activities')}
    >
      <div className="bg-white rounded-3xl p-4 sm:p-7 border border-slate-200 shadow-soft space-y-6">
        {/* GAME 1: MEMORY MATCH (Responsive Grid supporting 4 to 44 cards) */}
        {activeGameId === 'memory-match' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>
                {levelConfig.targetCount} Pairs to Match ({memoryCards.length} Cards)
              </span>
              <span>
                Matches: {memoryCards.filter(c => c.matched).length / 2} / {levelConfig.targetCount}
              </span>
            </div>

            <div
              className={`grid gap-2.5 sm:gap-3.5 max-w-4xl mx-auto max-h-[65vh] overflow-y-auto p-1 ${
                memoryCards.length <= 6
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : memoryCards.length <= 12
                  ? 'grid-cols-3 sm:grid-cols-4'
                  : memoryCards.length <= 20
                  ? 'grid-cols-4 sm:grid-cols-5'
                  : memoryCards.length <= 30
                  ? 'grid-cols-4 sm:grid-cols-6'
                  : 'grid-cols-5 sm:grid-cols-8'
              }`}
            >
              {memoryCards.map((card, idx) => (
                <button
                  key={card.uid}
                  disabled={card.matched}
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-3 text-center border-2 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer select-none ${
                    card.matched
                      ? 'bg-emerald-50 border-emerald-300 opacity-60 scale-95'
                      : card.flipped
                      ? 'bg-teal-50 border-teal-500 shadow-md ring-4 ring-teal-100 scale-102'
                      : highlightedHintId === card.id
                      ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-200 animate-bounce'
                      : 'bg-gradient-to-b from-slate-50 to-slate-100 hover:from-teal-50/50 hover:to-teal-100/50 border-slate-200 hover:border-teal-300 shadow-xs'
                  }`}
                >
                  {card.flipped || card.matched ? (
                    <>
                      <span className="text-3xl sm:text-4xl md:text-5xl">{card.icon}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-1 line-clamp-1">
                        {card.name}
                      </span>
                    </>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-teal-600/10 text-teal-700 flex items-center justify-center font-black text-base sm:text-xl">
                      ?
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME 2: PICTURE RECALL / WORD RECALL (Observation -> Delayed Buffer -> Recall) */}
        {(activeGameId === 'picture-recall' || activeGameId === 'word-recall') && (
          <div className="space-y-6 max-w-2xl mx-auto text-center">
            {recallPhase === 'observe' ? (
              <div className="space-y-4 animate-scale-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 font-black text-sm">
                  <Eye size={16} /> Look carefully: {observeCountdown}s remaining
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-200 max-h-[55vh] overflow-y-auto">
                  {targetItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1"
                    >
                      <div className="text-4xl">{item.icon}</div>
                      <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : recallPhase === 'delay' ? (
              <div className="py-12 space-y-4 animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center mx-auto text-3xl animate-pulse">
                  🧠
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Hold the {targetItems.length} items in your memory...
                </h3>
                <p className="text-sm font-semibold text-indigo-700">
                  Breathing pause: {delayCountdown}s remaining
                </p>
                <div className="w-48 h-2 bg-indigo-100 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-pulse w-full rounded-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-scale-up">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-2">
                  <span>Which items were placed on the tray?</span>
                  <span>
                    Selected: {selectedRecallIds.length} / {targetItems.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-3xl border border-slate-200 max-h-[55vh] overflow-y-auto">
                  {selectableChoices.map(item => {
                    const isSelected = selectedRecallIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        disabled={isSelected}
                        onClick={() => handleRecallSelect(item)}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-xs scale-95 opacity-60'
                            : highlightedHintId === item.id
                            ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-200 animate-bounce'
                            : 'bg-white hover:bg-teal-50/50 border-slate-200 hover:border-teal-400 shadow-xs'
                        }`}
                      >
                        <span className="text-4xl">{item.icon}</span>
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                          {item.name}
                        </span>
                        {isSelected && <span className="text-xs text-emerald-600 font-bold">✓ Selected</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GAME 3: SEQUENCE BUILDER */}
        {activeGameId === 'sequence-builder' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            {levelConfig.isReverseOrder && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-black text-indigo-800 flex items-center justify-center gap-2">
                <RotateCcw size={16} /> REVERSE WORKING MEMORY: Enter the items in backwards sequence order!
              </div>
            )}

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {isPlayingSequence ? 'Watch the Sequence' : 'Repeat the Sequence'}
              </div>

              <div className="flex items-center justify-center gap-3 min-h-[80px] flex-wrap">
                {sequenceTargets.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-300 ${
                      sequencePlaybackIdx === idx
                        ? 'bg-purple-100 border-purple-500 shadow-lg scale-110 ring-4 ring-purple-200'
                        : userSequence.length > idx
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}
                  >
                    {sequencePlaybackIdx === idx || userSequence.length > idx ? item.icon : '?'}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {selectableChoices.map(item => (
                <button
                  key={item.id}
                  disabled={isPlayingSequence}
                  onClick={() => handleSequenceChoiceTap(item)}
                  className="p-3.5 rounded-2xl border-2 bg-white hover:bg-purple-50/50 border-slate-200 hover:border-purple-400 transition-all cursor-pointer flex flex-col items-center gap-1 shadow-xs active:scale-95"
                >
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME 4: NUMBER MEMORY (DIGIT SPAN) */}
        {activeGameId === 'number-memory' && (
          <div className="space-y-6 max-w-md mx-auto text-center">
            {levelConfig.isReverseOrder && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-black text-indigo-800 flex items-center justify-center gap-2">
                <RotateCcw size={16} /> REVERSE DIGIT SPAN: Enter digits backwards!
              </div>
            )}

            {numberPhase === 'observe' ? (
              <div className="p-8 bg-blue-50 rounded-3xl border-2 border-blue-200 space-y-3 animate-scale-up">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Memorize this Number Sequence
                </div>
                <div className="text-5xl font-black text-blue-900 tracking-widest">
                  {numberSequence.join(' ')}
                </div>
              </div>
            ) : numberPhase === 'delay' ? (
              <div className="p-8 bg-indigo-50 rounded-3xl border-2 border-indigo-200 space-y-2 animate-scale-up">
                <div className="text-3xl animate-pulse">🧠</div>
                <div className="text-base font-black text-indigo-900">Hold digits in your mind...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-2xl font-black text-slate-800 min-h-[60px] flex items-center justify-center tracking-widest">
                  {enteredNumberSeq.join(' ') || <span className="text-slate-400 text-sm font-normal">Tap numbers below</span>}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => handleNumberInput(num)}
                      className="p-4 rounded-2xl bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 font-black text-2xl text-slate-800 shadow-xs active:scale-95 transition-all"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GAME 5: PATTERN RECALL (MATRIX) */}
        {activeGameId === 'pattern-recall' && (
          <div className="space-y-6 max-w-md mx-auto text-center">
            <div className="text-sm font-bold text-slate-700">
              {patternPhase === 'observe'
                ? 'Watch and remember the illuminated tiles'
                : `Tap the ${activePatternTiles.length} tiles that were lit up`}
            </div>

            <div
              className={`grid gap-3 mx-auto ${
                levelConfig.gridSize <= 9 ? 'grid-cols-3 max-w-[280px]' : 'grid-cols-4 max-w-[340px]'
              }`}
            >
              {Array.from({ length: levelConfig.gridSize }).map((_, idx) => {
                const isLit = patternPhase === 'observe' && activePatternTiles.includes(idx);
                const isSelected = selectedPatternTiles.includes(idx);

                return (
                  <button
                    key={idx}
                    disabled={patternPhase === 'observe'}
                    onClick={() => handlePatternTileTap(idx)}
                    className={`aspect-square rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                      isLit
                        ? 'bg-cyan-400 border-cyan-500 shadow-lg ring-4 ring-cyan-200 scale-105'
                        : isSelected
                        ? 'bg-teal-500 border-teal-600 text-white font-black text-xl'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* GAME 6: ATTENTION FINDER */}
        {activeGameId === 'attention-finder' && targetItemForFinder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{targetItemForFinder.icon}</span>
                <div>
                  <div className="text-xs font-bold text-rose-800">Target to Discover</div>
                  <div className="text-sm font-black text-rose-950">{targetItemForFinder.name}</div>
                </div>
              </div>
              <div className="text-xs font-black text-rose-700 bg-white px-3 py-1.5 rounded-full border border-rose-200">
                Found: {finderCells.filter(c => c.isTarget && c.found).length} / {levelConfig.targetCount}
              </div>
            </div>

            <div
              className={`grid gap-2.5 max-h-[60vh] overflow-y-auto p-1 ${
                finderCells.length <= 12
                  ? 'grid-cols-3 sm:grid-cols-4'
                  : finderCells.length <= 24
                  ? 'grid-cols-4 sm:grid-cols-6'
                  : 'grid-cols-4 sm:grid-cols-8'
              }`}
            >
              {finderCells.map(cell => (
                <button
                  key={cell.uid}
                  disabled={cell.found}
                  onClick={() => handleFinderCellClick(cell.uid)}
                  className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-2 cursor-pointer ${
                    cell.found
                      ? 'bg-emerald-50 border-emerald-400 opacity-50 scale-95'
                      : highlightedHintId === cell.uid
                      ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-200 animate-bounce'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{cell.item.icon}</span>
                  <span className="text-[10px] font-bold text-slate-700 truncate max-w-[65px] mt-0.5">
                    {cell.item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME 7: ODD ONE OUT */}
        {activeGameId === 'odd-one-out' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="text-sm font-bold text-slate-700">
              Tap the single item that is different from all the others:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {oddItemsList.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleOddItemTap(item.isOutlier)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1.5 shadow-xs ${
                    highlightedHintId === item.id
                      ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-200 animate-bounce'
                      : 'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME 8: CATEGORY SORTING */}
        {activeGameId === 'category-sorting' && (
          <div className="space-y-6 max-w-lg mx-auto text-center">
            <div className="text-xs font-bold text-slate-500">
              Sorted: {sortedCount} / {levelConfig.targetCount}
            </div>

            {sortingQueue.length > 0 && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-2 inline-block shadow-sm animate-scale-up">
                <div className="text-5xl">{sortingQueue[0].icon}</div>
                <div className="text-base font-black text-slate-900">{sortingQueue[0].name}</div>
                <div className="text-xs text-slate-500">{sortingQueue[0].subcategory}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSortItem('Nature')}
                className="p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-black text-base shadow-xs cursor-pointer active:scale-95"
              >
                🌿 Nature & Living
              </button>
              <button
                onClick={() => handleSortItem('Household')}
                className="p-5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 font-black text-base shadow-xs cursor-pointer active:scale-95"
              >
                🏡 Household & Craft
              </button>
            </div>
          </div>
        )}

        {/* GAME 9: SPATIAL MEMORY (3x3 or 4x4 Veranda Grid) */}
        {activeGameId === 'spatial-memory' && (
          <div className="space-y-6 max-w-md mx-auto text-center">
            <div className="text-sm font-bold text-slate-700">
              {recallPhase === 'observe'
                ? `🏡 Memorize the ${spatialPositions.length} item positions (${observeCountdown}s)`
                : `Tap the tiles where items were located (${Object.keys(userPlacedCells).length}/${spatialPositions.length})`}
            </div>

            <div
              className={`grid gap-2.5 mx-auto ${
                levelConfig.gridSize <= 9 ? 'grid-cols-3' : 'grid-cols-4'
              }`}
            >
              {Array.from({ length: levelConfig.gridSize }).map((_, idx) => {
                const targetAtPos = spatialPositions.find(p => p.cellIndex === idx);
                const isUserPlaced = userPlacedCells[idx];

                return (
                  <button
                    key={idx}
                    disabled={recallPhase === 'observe'}
                    onClick={() => handleSpatialCellTap(idx)}
                    className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                      recallPhase === 'observe' && targetAtPos
                        ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-200'
                        : isUserPlaced
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {recallPhase === 'observe' && targetAtPos ? (
                      <>
                        <span className="text-3xl">{targetAtPos.item.icon}</span>
                        <span className="text-[10px] font-bold text-slate-700 mt-0.5 truncate max-w-[65px]">
                          {targetAtPos.item.name}
                        </span>
                      </>
                    ) : isUserPlaced ? (
                      <span className="text-3xl text-emerald-700">✓</span>
                    ) : (
                      <span className="text-slate-300 text-xs">•</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* GAME 10: CULTURAL SYMBOL MEMORY & RECALL (`symbol-matching`) — 3 Stages & Multi-Mode Reconstruction */}
        {activeGameId === 'symbol-matching' && (
          <div className="space-y-6 max-w-3xl mx-auto text-center">
            {/* STAGE 1: MEMORIZE */}
            {symbolMemoryPhase === 'memorize' && (
              <div className="space-y-5 animate-scale-up">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-fuchsia-100 text-fuchsia-900 font-black text-sm border border-fuchsia-200 shadow-xs">
                  <Eye size={18} className="text-fuchsia-700" /> Stage 1: Memorize ({symbolObserveCountdown}s remaining)
                </div>

                <p className="text-sm font-semibold text-slate-700 max-w-xl mx-auto">
                  Study these <span className="font-bold text-fuchsia-800">{symbolTargetItems.length} cultural symbols</span> and their numbered positions. They will hide shortly!
                </p>

                <div
                  className={`grid gap-3.5 p-6 bg-gradient-to-b from-fuchsia-50/40 to-slate-50 rounded-3xl border border-fuchsia-200 max-h-[55vh] overflow-y-auto ${
                    symbolTargetItems.length <= 4
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : symbolTargetItems.length <= 8
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : 'grid-cols-3 sm:grid-cols-5'
                  }`}
                >
                  {symbolTargetItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-2xl border-2 border-fuchsia-300 shadow-sm space-y-1.5 flex flex-col items-center relative"
                    >
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-fuchsia-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        #{idx + 1}
                      </div>
                      <div className="text-4xl pt-2">{item.icon}</div>
                      <div className="text-xs font-black text-slate-900 truncate max-w-[110px]">{item.name}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-700 font-bold">
                        {item.subcategory}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 2: MEMORY DELAY */}
            {symbolMemoryPhase === 'delay' && (
              <div className="py-14 space-y-5 animate-scale-up">
                <div className="w-20 h-20 rounded-full bg-fuchsia-100 border-2 border-fuchsia-300 flex items-center justify-center mx-auto text-4xl shadow-md animate-pulse">
                  🧠
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900">
                    Hold the {symbolTargetItems.length} symbols in your memory...
                  </h3>
                  <p className="text-sm font-semibold text-fuchsia-700">
                    Quiet retention pause: <span className="font-bold text-lg text-fuchsia-900">{symbolDelayCountdown}s</span>
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Keep the symbols, names, and positions in your mind without looking.
                </p>
                <div className="w-56 h-2.5 bg-fuchsia-100 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-fuchsia-600 animate-pulse w-full rounded-full" />
                </div>
              </div>
            )}

            {/* STAGE 3: RECALL PART A (Symbol Selection) */}
            {symbolMemoryPhase === 'recall_symbols' && (
              <div className="space-y-5 animate-scale-up">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-fuchsia-50 rounded-2xl border border-fuchsia-200">
                  <div className="text-left">
                    <div className="text-xs font-bold text-fuchsia-800 uppercase tracking-wide">
                      Stage 3 — Symbol Recall
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      Which symbols were present? Select all {symbolTargetItems.length} symbols:
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-white border border-fuchsia-300 text-xs font-black text-fuchsia-800 shadow-xs">
                    {selectedSymbolIds.length} / {symbolTargetItems.length} Selected
                  </div>
                </div>

                <div
                  className={`grid gap-3 max-h-[50vh] overflow-y-auto p-1 ${
                    symbolChoices.length <= 6
                      ? 'grid-cols-2 sm:grid-cols-3'
                      : symbolChoices.length <= 10
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : 'grid-cols-3 sm:grid-cols-5'
                  }`}
                >
                  {symbolChoices.map(item => {
                    const isSelected = selectedSymbolIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggleSymbolSelection(item.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1.5 relative ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-100 scale-102'
                            : highlightedHintId === item.id
                            ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-200 animate-bounce'
                            : 'bg-white hover:bg-fuchsia-50/40 border-slate-200 hover:border-fuchsia-300 shadow-xs'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                            ✓
                          </div>
                        )}
                        <span className="text-4xl">{item.icon}</span>
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{item.name}</span>
                        <span className="text-[10px] text-slate-500">{item.subcategory}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSubmitSymbolSelection}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-black text-base shadow-md cursor-pointer transition-all active:scale-98"
                >
                  ✓ Confirm Symbol Recall ({selectedSymbolIds.length}/{symbolTargetItems.length})
                </button>
              </div>
            )}

            {/* STAGE 3: RECALL PART B (Positional Memory Question - L61+) */}
            {symbolMemoryPhase === 'recall_position' && positionQuestion && (
              <div className="space-y-6 max-w-xl mx-auto animate-scale-up">
                <div className="p-6 bg-fuchsia-50 rounded-3xl border-2 border-fuchsia-200 space-y-3">
                  <div className="text-xs font-bold text-fuchsia-700 uppercase tracking-wide">
                    📍 Positional Working Memory Question
                  </div>
                  <div className="text-5xl">{positionQuestion.targetItem.icon}</div>
                  <h4 className="text-lg font-black text-slate-900">
                    Which position was the <span className="text-fuchsia-700">{positionQuestion.targetItem.name}</span> located in?
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {positionQuestion.options.map(pos => (
                    <button
                      key={pos}
                      onClick={() => handleAnswerPositionQuestion(pos)}
                      className={`p-4 rounded-2xl border-2 font-black text-base transition-all cursor-pointer ${
                        selectedPositionAnswer === pos
                          ? pos === positionQuestion.correctPos
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-rose-50 border-rose-500 text-rose-800'
                          : 'bg-white hover:bg-fuchsia-50 border-slate-200 hover:border-fuchsia-400 text-slate-800'
                      }`}
                    >
                      Position #{pos}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 3: RECALL PART C (Relative / Neighbor Question - L71+) */}
            {symbolMemoryPhase === 'recall_neighbor' && neighborQuestion && (
              <div className="space-y-6 max-w-xl mx-auto animate-scale-up">
                <div className="p-6 bg-purple-50 rounded-3xl border-2 border-purple-200 space-y-3">
                  <div className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                    ↔️ Relative Neighbor Memory Question
                  </div>
                  <div className="text-5xl">{neighborQuestion.baseItem.icon}</div>
                  <h4 className="text-lg font-black text-slate-900">
                    Which symbol appeared immediately next to the <span className="text-purple-700">{neighborQuestion.baseItem.name}</span>?
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {neighborQuestion.options.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleAnswerNeighborQuestion(item.id)}
                      className="p-3.5 rounded-2xl border-2 bg-white hover:bg-purple-50 border-slate-200 hover:border-purple-400 transition-all cursor-pointer flex flex-col items-center gap-1 shadow-xs"
                    >
                      <span className="text-4xl">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 3: RECALL PART D (Missing Symbol Question - L91+) */}
            {symbolMemoryPhase === 'recall_missing' && missingQuestion && (
              <div className="space-y-6 max-w-xl mx-auto animate-scale-up">
                <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    ❓ Centennial Missing Symbol Challenge
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    Which symbol from your memorized set is MISSING below?
                  </h4>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {missingQuestion.presentedSet.map(it => (
                      <span key={it.id} className="text-3xl p-1 bg-white rounded-xl border border-amber-200">
                        {it.icon}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {missingQuestion.options.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleAnswerMissingQuestion(item.id)}
                      className="p-3.5 rounded-2xl border-2 bg-white hover:bg-amber-50 border-slate-200 hover:border-amber-400 transition-all cursor-pointer flex flex-col items-center gap-1 shadow-xs"
                    >
                      <span className="text-4xl">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GAME 11: OBJECT RECOGNITION (Standard Silhouette/Motif Match) */}
        {activeGameId === 'object-recognition' && (
          <div className="space-y-6 max-w-2xl mx-auto text-center">
            {symbolTarget && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 inline-block shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Match This Cultural Motif
                </div>
                <div className="text-6xl">{symbolTarget.icon}</div>
                <div className="text-lg font-black text-slate-900 mt-2">{symbolTarget.name}</div>
              </div>
            )}

            <div
              className={`grid gap-3 ${
                symbolOptions.length <= 4
                  ? 'grid-cols-2'
                  : symbolOptions.length <= 6
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-3 sm:grid-cols-4'
              }`}
            >
              {symbolOptions.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleSymbolMatchTap(choice.id)}
                  className="p-4 sm:p-5 rounded-2xl border-2 bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-400 transition-all cursor-pointer flex flex-col items-center gap-1.5 shadow-xs active:scale-98"
                >
                  <span className="text-4xl">{choice.icon}</span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{choice.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 100-Level Selector Drawer */}
      <LevelSelectorModal
        isOpen={showLevelSelector}
        onClose={() => setShowLevelSelector(false)}
        game={gameDef}
        progress={gameProgress}
        onSelectLevel={lvl => {
          setCurrentLevel(lvl);
          setShowLevelSelector(false);
        }}
      />

      {/* Result & Star Rating Modal */}
      {lastResult && (
        <GameResultModal
          isOpen={showResultModal}
          game={gameDef}
          result={lastResult}
          nextLevelNumber={Math.min(100, currentLevel + 1)}
          onNextLevel={() => {
            setCurrentLevel(lvl => Math.min(100, lvl + 1));
            setShowResultModal(false);
          }}
          onReplayLevel={() => {
            setupLevel();
            setShowResultModal(false);
          }}
          onChooseAnother={() => navigate('/activities')}
        />
      )}
    </GameShell>
  );
};
