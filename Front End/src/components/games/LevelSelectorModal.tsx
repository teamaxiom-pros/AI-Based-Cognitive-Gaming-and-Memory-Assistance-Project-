import React, { useState } from 'react';
import { GameDefinition, GameProgressState, DifficultyTier } from '../../types/gameTypes';
import { getTierName, getDifficultyLabel } from '../../services/levelGenerator';
import { soundEffects } from '../../services/soundEffects';
import { X, Lock, CheckCircle2, Star, Trophy, Sparkles, ChevronRight } from 'lucide-react';

interface LevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameDefinition;
  progress: GameProgressState;
  onSelectLevel: (level: number) => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  onClose,
  game,
  progress,
  onSelectLevel,
}) => {
  const [selectedTier, setSelectedTier] = useState<DifficultyTier>(
    Math.min(10, Math.ceil(progress.unlockedLevel / 10)) as DifficultyTier
  );

  if (!isOpen) return null;

  const tiers: DifficultyTier[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const startLevel = (selectedTier - 1) * 10 + 1;
  const endLevel = selectedTier * 10;
  const levelsInTier = Array.from({ length: 10 }, (_, i) => startLevel + i);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-2xl flex items-center justify-center border border-teal-500/30">
              {game.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{game.title}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                  100 Levels
                </span>
              </div>
              <p className="text-xs text-teal-200 font-medium mt-0.5">
                Unlocked: Level {progress.unlockedLevel} / 100 • Accuracy: {progress.overallAccuracy}%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tier Selector Horizontal Pills */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none flex gap-2">
          {tiers.map(t => {
            const isTierActive = selectedTier === t;
            const tierStart = (t - 1) * 10 + 1;
            const isTierUnlocked = progress.unlockedLevel >= tierStart;

            return (
              <button
                key={t}
                onClick={() => {
                  soundEffects.playSoftClick();
                  setSelectedTier(t);
                }}
                className={`px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isTierActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-600/30'
                    : isTierUnlocked
                    ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60'
                }`}
              >
                <span>{tierStart}–{t * 10}</span>
                {!isTierUnlocked && <Lock size={12} className="text-slate-400" />}
              </button>
            );
          })}
        </div>

        {/* Selected Tier Banner */}
        <div className="px-6 py-3 bg-teal-50/50 border-b border-teal-100 flex items-center justify-between text-xs">
          <div className="font-extrabold text-teal-900">
            Tier {selectedTier}: {getTierName(selectedTier)}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
            {getDifficultyLabel(selectedTier)} Challenge
          </span>
        </div>

        {/* 10 Level Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {levelsInTier.map(lvl => {
            const isUnlocked = progress.unlockedLevel >= lvl;
            const scoreData = progress.levelScores[lvl];
            const isCurrent = progress.unlockedLevel === lvl;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  soundEffects.playSoftClick();
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`p-4 rounded-3xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-between min-h-[110px] ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-500 shadow-md ring-4 ring-teal-100 scale-102'
                    : isUnlocked
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-400">Lvl</span>
                  {isUnlocked ? (
                    isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    )
                  ) : (
                    <Lock size={14} className="text-slate-400" />
                  )}
                </div>

                <div className="text-2xl font-black text-slate-900 my-1">
                  {lvl}
                </div>

                {/* Stars / Status */}
                <div className="w-full flex items-center justify-center gap-0.5">
                  {scoreData ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < scoreData.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }
                      />
                    ))
                  ) : isUnlocked ? (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Locked
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Levels advance automatically as you complete each exercise.
          </div>
          <button
            onClick={() => {
              soundEffects.playSoftClick();
              onSelectLevel(progress.unlockedLevel);
              onClose();
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Play Current (Level {progress.unlockedLevel})</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
