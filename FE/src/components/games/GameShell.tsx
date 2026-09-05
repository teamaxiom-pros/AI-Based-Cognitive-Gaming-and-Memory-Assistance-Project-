import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GameDefinition, GameLevelConfig } from '../../types/gameTypes';
import { soundEffects } from '../../services/soundEffects';
import {
  Volume2,
  Pause,
  Play,
  RotateCcw,
  LogOut,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronLeft,
  Activity,
  Award,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GameShellProps {
  game: GameDefinition;
  levelConfig: GameLevelConfig;
  onSelectLevelClick: () => void;
  onExitClick: () => void;
  onRestartClick: () => void;
  onHintClick?: () => void;
  hintsRemaining?: number;
  timerSeconds?: number;
  movesCount?: number;
  children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({
  game,
  levelConfig,
  onSelectLevelClick,
  onExitClick,
  onRestartClick,
  onHintClick,
  hintsRemaining = 0,
  timerSeconds,
  movesCount,
  children,
}) => {
  const { speakText } = useApp();
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDebugMatrix, setShowDebugMatrix] = useState(false);

  const handleSpeakInstruction = () => {
    soundEffects.playSoftClick();
    speakText(levelConfig.instructionsText || game.audioInstruction);
  };

  const handleTogglePause = () => {
    soundEffects.playSoftClick();
    setIsPaused(!isPaused);
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-between max-w-4xl mx-auto space-y-4">
      {/* Top Accessible Game Header */}
      <header className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Game Title & Level Indicator */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2.5 rounded-2xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Back to Activities"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
            {game.icon}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {game.title}
              </h1>
              <button
                onClick={onSelectLevelClick}
                className="px-3 py-1 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-900 font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                title="Browse all 100 levels"
              >
                <Layers size={13} />
                <span>Level {levelConfig.level} / 100</span>
              </button>

              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1">
                <Activity size={11} className="text-teal-600" />
                <span>Load {levelConfig.cognitiveLoad}/10</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Tier {levelConfig.tier}: {levelConfig.tierName}</span>
              <span>•</span>
              <span className="font-bold text-teal-700">{levelConfig.difficultyLabel}</span>
              {levelConfig.complexityType !== 'Direct' && (
                <>
                  <span>•</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                    {levelConfig.complexityType}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls & Counters */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Audio Instruction */}
          <button
            onClick={handleSpeakInstruction}
            className="px-3.5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-xs"
            title="Listen to spoken instructions"
          >
            <Volume2 size={16} />
            <span className="hidden sm:inline">Voice Help</span>
          </button>

          {/* Hint button */}
          {onHintClick && hintsRemaining > 0 && (
            <button
              onClick={() => {
                soundEffects.playSoftClick();
                onHintClick();
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              <HelpCircle size={16} />
              <span>Hint ({hintsRemaining})</span>
            </button>
          )}

          {/* Moves / Timer Indicators */}
          {movesCount !== undefined && (
            <div className="px-3 py-2 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs">
              Moves: {movesCount}
            </div>
          )}
          {timerSeconds !== undefined && (
            <div className="px-3 py-2 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs">
              Time: {timerSeconds}s
            </div>
          )}

          {/* Pause */}
          <button
            onClick={handleTogglePause}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Pause Activity"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              soundEffects.playSoftClick();
              onRestartClick();
            }}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Restart Level"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      {/* Milestone Highlight Banner */}
      {levelConfig.milestoneBadge && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white rounded-2xl p-3.5 px-5 shadow-md flex items-center justify-between text-sm font-black animate-scale-up">
          <div className="flex items-center gap-2.5">
            <Award size={20} className="text-amber-100" />
            <span>{levelConfig.milestoneBadge}</span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold">
            Milestone Level
          </span>
        </div>
      )}

      {/* Main Game Surface / Paused Overlay */}
      <main className="flex-1 relative">
        {isPaused ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-soft text-center space-y-6 max-w-lg mx-auto my-12 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto text-2xl font-black">
              ⏸️
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Activity Paused</h2>
              <p className="text-slate-600 font-medium text-sm">
                Take a deep breath and relax. You can continue whenever you feel ready.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleTogglePause}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-base transition-colors cursor-pointer shadow-md shadow-teal-600/20"
              >
                Resume Activity
              </button>
              <button
                onClick={onExitClick}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-base transition-colors cursor-pointer"
              >
                Exit to Games
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Developer / Diagnostic Difficulty Inspector (Collapsible) */}
      <div className="text-center pt-2">
        <button
          onClick={() => setShowDebugMatrix(!showDebugMatrix)}
          className="text-slate-400 hover:text-slate-600 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Terminal size={12} />
          <span>Difficulty Parameters (Level {levelConfig.level})</span>
          {showDebugMatrix ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showDebugMatrix && (
          <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-2xl text-left text-xs font-mono max-w-xl mx-auto space-y-1 shadow-md border border-slate-800 animate-scale-up">
            <div className="text-teal-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
              <span>{game.title} • Level {levelConfig.level} / 100</span>
              <span>Load: {levelConfig.cognitiveLoad}/10</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px]">
              <div><span className="text-slate-400">Tier:</span> {levelConfig.tier} ({levelConfig.tierName})</div>
              <div><span className="text-slate-400">Difficulty:</span> {levelConfig.difficultyLabel}</div>
              <div><span className="text-slate-400">Targets:</span> {levelConfig.targetCount}</div>
              <div><span className="text-slate-400">Distractors:</span> {levelConfig.distractorCount}</div>
              <div><span className="text-slate-400">Grid / Choices:</span> {levelConfig.numberOfChoices || levelConfig.gridSize}</div>
              <div><span className="text-slate-400">Hints Allowed:</span> {levelConfig.hintsAllowed}</div>
              <div><span className="text-slate-400">Reveal View:</span> {levelConfig.revealDurationMs ? `${levelConfig.revealDurationMs / 1000}s` : 'N/A'}</div>
              <div><span className="text-slate-400">Delay Buffer:</span> {levelConfig.delayBeforeRecallMs ? `${levelConfig.delayBeforeRecallMs / 1000}s` : '0s'}</div>
              <div><span className="text-slate-400">Complexity:</span> {levelConfig.complexityType}</div>
              <div><span className="text-slate-400">Similarity:</span> {levelConfig.visualSimilarity}</div>
              {levelConfig.isReverseOrder && (
                <div className="col-span-2 text-amber-300 font-bold">🔄 Reverse Transformation Rule Active</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gentle Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl">
              🌿
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Leave Activity?</h3>
              <p className="text-sm text-slate-600 font-medium">
                Your highest completed level and stars are safely saved. Would you like to continue playing or explore another activity?
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold text-base transition-colors cursor-pointer"
              >
                Continue Playing
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitClick();
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-colors cursor-pointer"
              >
                Exit to Activities Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
