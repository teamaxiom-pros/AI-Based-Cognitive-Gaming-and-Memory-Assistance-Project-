import React, { useEffect } from 'react';
import { GameDefinition, GameResultRecord } from '../../types/gameTypes';
import { soundEffects } from '../../services/soundEffects';
import { useApp } from '../../context/AppContext';
import {
  Star,
  Trophy,
  Sparkles,
  ArrowRight,
  RotateCcw,
  LayoutGrid,
} from 'lucide-react';

interface GameResultModalProps {
  isOpen: boolean;
  game: GameDefinition;
  result: GameResultRecord;
  nextLevelNumber: number;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onChooseAnother: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  game,
  result,
  nextLevelNumber,
  onNextLevel,
  onReplayLevel,
  onChooseAnother,
}) => {
  const { t } = useApp();

  useEffect(() => {
    if (isOpen) {
      if (result.isLevelMilestone || result.stars === 3) {
        soundEffects.playFanfare();
      } else {
        soundEffects.playSuccessChime();
      }
    }
  }, [isOpen, result]);

  if (!isOpen) return null;

  const isLevel100 = result.level === 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up text-center space-y-6 p-6 sm:p-8">
        {/* Top Celebration Icon & Badge */}
        <div className="relative">
          <div
            className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg ${
              isLevel100
                ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white shadow-amber-500/30 ring-4 ring-amber-300'
                : 'bg-teal-100 text-teal-700 shadow-teal-500/20'
            }`}
          >
            {isLevel100 ? '👑' : <Trophy className="text-amber-500 fill-amber-500" size={38} />}
          </div>

          <div className="mt-4 space-y-1">
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-extrabold text-xs uppercase tracking-wider">
              {isLevel100 ? 'Grand Centennial Milestone' : `${t('games.level')} ${result.level} ${t('games.completed')}`}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isLevel100 ? 'Wonderful! 100 Levels Completed!' : `${t('games.level')} ${t('games.completed')}!`}
            </h2>
            <p className="text-sm text-slate-600 font-medium max-w-xs mx-auto">
              {isLevel100
                ? `You have mastered all 100 levels of ${game.title}. Your mind is active, focused, and resilient!`
                : result.accuracy >= 85
                ? 'Your focus was sharp and steady throughout this session.'
                : 'Good effort! Regular practice keeps memory active and confident.'}
            </p>
          </div>
        </div>

        {/* 3 Stars Visual */}
        <div className="flex items-center justify-center gap-2 py-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                i < result.stars
                  ? 'bg-amber-100 text-amber-500 scale-110 shadow-md'
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              <Star
                size={28}
                className={i < result.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
              />
            </div>
          ))}
        </div>

        {/* Metric Summary Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">{t('games.score')}</span>
            <strong className="text-slate-900 text-lg font-black">{result.accuracy}%</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">Time</span>
            <strong className="text-slate-900 text-lg font-black">{result.durationSeconds}s</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block text-[10px]">{t('common.next')}</span>
            <strong className="text-teal-700 text-lg font-black">
              {isLevel100 ? 'Master' : `Lvl ${nextLevelNumber}`}
            </strong>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          {!isLevel100 ? (
            <button
              onClick={() => {
                soundEffects.playSoftClick();
                onNextLevel();
              }}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-base transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-600/20 active:scale-98"
            >
              <span>{t('games.nextLevel')} ({t('games.level')} {nextLevelNumber})</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => {
                soundEffects.playSoftClick();
                onReplayLevel();
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-base transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <span>Replay Level 100 Master Challenge</span>
              <Sparkles size={18} />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                soundEffects.playSoftClick();
                onReplayLevel();
              }}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={15} /> {t('games.playAgain')}
            </button>
            <button
              onClick={() => {
                soundEffects.playSoftClick();
                onChooseAnother();
              }}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LayoutGrid size={15} /> {t('common.activities')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

