import React from 'react';
import { useApp } from '../../../context/AppContext';
import { UniversalGamePlayer } from './UniversalGamePlayer';
import { PatientLayout } from '../../../components/layout/PatientLayout';
import { GameCategory } from '../../../types/gameTypes';
import { gamesLibrary } from '../../../data/gamesLibraryData';

interface PlayGamePageProps {
  gameId?: GameCategory;
}

export const PlayGamePage: React.FC<PlayGamePageProps> = ({ gameId = 'memory-match' }) => {
  const { currentRoute } = useApp();

  // Extract gameId from route if present
  let resolvedGameId: GameCategory = gameId;
  const routeMap: Record<string, GameCategory> = {
    '/activities/memory-match': 'memory-match',
    '/activities/object-recall': 'picture-recall',
    '/activities/picture-recall': 'picture-recall',
    '/activities/attention-search': 'attention-finder',
    '/activities/attention-finder': 'attention-finder',
    '/activities/pattern-sequence': 'sequence-builder',
    '/activities/sequence-builder': 'sequence-builder',
    '/activities/number-memory': 'number-memory',
    '/activities/pattern-recall': 'pattern-recall',
    '/activities/odd-one-out': 'odd-one-out',
    '/activities/word-recall': 'word-recall',
    '/activities/spatial-memory': 'spatial-memory',
    '/activities/category-sorting': 'category-sorting',
    '/activities/symbol-matching': 'symbol-matching',
  };

  const routeBase = currentRoute.split('?')[0];
  if (routeMap[routeBase]) {
    resolvedGameId = routeMap[routeBase];
  }

  const gameDef = gamesLibrary.find(g => g.id === resolvedGameId) || gamesLibrary[0];

  return (
    <PatientLayout pageTitle={gameDef.title}>
      <UniversalGamePlayer initialGameId={resolvedGameId} />
    </PatientLayout>
  );
};
