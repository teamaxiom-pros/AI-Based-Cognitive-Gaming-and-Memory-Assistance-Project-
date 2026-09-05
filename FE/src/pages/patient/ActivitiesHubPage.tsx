import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { gamesLibrary, getLocalizedGame } from '../../data/gamesLibraryData';
import { GameCategory, GameDefinition } from '../../types/gameTypes';
import {
  loadAllGamesProgress,
  getGameProgress,
} from '../../services/gameProgressionService';
import { getPersonalizedRecommendations } from '../../services/gameRecommendationService';
import { LevelSelectorModal } from '../../components/games/LevelSelectorModal';
import { soundEffects } from '../../services/soundEffects';
import {
  Brain,
  Play,
  Sparkles,
  Star,
  Layers,
  ArrowRight,
  Clock,
  Compass,
  Zap,
} from 'lucide-react';

export const ActivitiesHubPage: React.FC = () => {
  const { navigate, assessmentResult, speakText, patient, t } = useApp();
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [activeSelectorGame, setActiveSelectorGame] = useState<GameDefinition | null>(null);

  const allProgress = loadAllGamesProgress();
  const recommendations = getPersonalizedRecommendations(assessmentResult);

  const firstName = patient?.name ? patient.name.split(' ')[0] : 'You';

  const categoryTabs = [
    { id: 'all', label: `${t('common.all') || 'All'} (12)` },
    { id: 'recommended', label: `✨ ${t('home.startTodayActivity') || 'Recommended'}` },
    { id: 'memory', label: t('caregiver.domainMemory') || 'Memory' },
    { id: 'attention', label: t('caregiver.domainAttention') || 'Attention' },
    { id: 'recognition', label: t('caregiver.domainRecognition') || 'Recognition' },
    { id: 'sequencing', label: t('caregiver.domainSequencing') || 'Sequencing' },
    { id: 'recall', label: t('assessment.recallTitle') || 'Recall' },
  ];

  const filteredGames = gamesLibrary.filter(game => {
    if (selectedCategoryTab === 'all') return true;
    if (selectedCategoryTab === 'recommended') {
      return recommendations.some(r => r.gameId === game.id);
    }
    return game.category === selectedCategoryTab;
  });

  const handlePlayGame = (gameId: GameCategory) => {
    soundEffects.playSoftClick();
    navigate(`/activities/${gameId}`);
  };

  const topRec = recommendations[0];
  const topRecRaw = gamesLibrary.find(g => g.id === topRec?.gameId) || gamesLibrary[0];
  const topRecGame = getLocalizedGame(topRecRaw, t);
  const topRecProgress = allProgress[topRecGame.id] || { unlockedLevel: 1 };

  return (
    <PatientLayout pageTitle={t('games.title')}>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Header Introduction */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('games.title')}
            </h1>
            <p className="text-slate-600 font-medium text-sm sm:text-base mt-1">
              {t('games.subtitle')}
            </p>
          </div>
          <SpeechSpeaker textToSpeak={t('games.subtitle') || "Choose any activity to practice at your comfortable pace."} />
        </div>

        {/* Featured Top Recommendation Hero */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-teal-700">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles size={14} /> {t('home.startTodayActivity')} • {firstName}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {topRecGame.title}
                </h2>
                <p className="text-teal-100 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                  {topRec?.reason || topRecGame.shortDescription}
                </p>
                <div className="text-xs text-teal-200 font-bold flex items-center gap-2 pt-1">
                  <span>{t('games.level')} {topRecProgress.unlockedLevel} / 100</span>
                  <span>•</span>
                  <span>{topRecGame.skillLabel}</span>
                </div>
              </div>
              <span className="text-6xl flex-shrink-0">{topRecGame.icon}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handlePlayGame(topRecGame.id)}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-sm sm:text-base transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-400/20 flex items-center gap-2"
              >
                <Play size={18} fill="currentColor" />
                <span>{t('games.playNow')} ({t('games.level')} {topRecProgress.unlockedLevel})</span>
              </button>
              <button
                onClick={() => setActiveSelectorGame(topRecGame)}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <Layers size={16} />
                <span>100 Levels</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playSoftClick();
                setSelectedCategoryTab(tab.id);
              }}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryTab === tab.id
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map(game => {
            const locGame = getLocalizedGame(game, t);
            const progress = allProgress[game.id] || {
              unlockedLevel: 1,
              currentLevel: 1,
              highestCompletedLevel: 0,
              overallAccuracy: 100,
            };

            const progressPct = Math.round((progress.highestCompletedLevel / 100) * 100);

            return (
              <Card
                key={locGame.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-teal-400 transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-xs">
                      {locGame.icon}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {t('games.level')} {progress.unlockedLevel} / 100
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      {locGame.title}
                    </h3>
                    <div className="text-xs font-bold text-teal-700 mb-1">
                      {locGame.skillLabel}
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                      {locGame.shortDescription}
                    </p>
                  </div>

                  {/* 100-Level Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>{t('common.completed')}: {progress.highestCompletedLevel} / 100</span>
                      <span>{progress.overallAccuracy}% {t('games.accuracyLabel')}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, progressPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handlePlayGame(locGame.id)}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>{t('games.playNow')} ({t('games.level')} {progress.unlockedLevel})</span>
                    <Play size={13} fill="currentColor" />
                  </button>

                  <button
                    onClick={() => setActiveSelectorGame(locGame)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    title="Browse all 100 levels"
                  >
                    <Layers size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 100-Level Selector Drawer */}
      {activeSelectorGame && (
        <LevelSelectorModal
          isOpen={!!activeSelectorGame}
          onClose={() => setActiveSelectorGame(null)}
          game={activeSelectorGame}
          progress={getGameProgress(activeSelectorGame.id)}
          onSelectLevel={lvl => {
            setActiveSelectorGame(null);
            navigate(`/activities/${activeSelectorGame.id}`);
          }}
        />
      )}
    </PatientLayout>
  );
};
