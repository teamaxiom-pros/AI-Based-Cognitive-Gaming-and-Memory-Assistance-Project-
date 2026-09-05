import { GameCategory, GameRecommendation } from '../types/gameTypes';
import { loadAllGamesProgress, loadGameResultsLog } from './gameProgressionService';
import { AssessmentResult } from '../types';

/**
 * Deterministic, data-driven recommendation engine connecting Assessment + Game History.
 * Zero random numbers or fake suggestions.
 */
export function getPersonalizedRecommendations(
  assessmentResult?: AssessmentResult | null
): GameRecommendation[] {
  const gameProgress = loadAllGamesProgress();
  const resultsLog = loadGameResultsLog();
  const recommendations: GameRecommendation[] = [];

  // 1. Analyze Real Assessment Domain Scores if available
  if (assessmentResult && assessmentResult.domainScores) {
    const scores = assessmentResult.domainScores;

    // Sort domains by lowest performance score to prioritize need areas
    const domainEntries = Object.entries(scores).sort(
      ([, a], [, b]) => (a?.score || 0) - (b?.score || 0)
    );

    domainEntries.forEach(([domain, scoreObj]) => {
      const score = scoreObj?.score || 0;

      if (domain === 'sequencing') {
        const seqProg = gameProgress['sequence-builder'];
        recommendations.push({
          gameId: 'sequence-builder',
          reason:
            score < 70
              ? `Recommended for temporal rhythm practice (Sequencing score: ${score}%).`
              : `Continue rhythm practice at Level ${seqProg?.unlockedLevel || 1}.`,
          priority: score < 75 ? 'High' : 'Recommended',
          targetDomain: 'sequencing',
        });
        if (score < 80) {
          recommendations.push({
            gameId: 'category-sorting',
            reason: `Strengthen executive categorization and sorting logic (Score: ${score}%).`,
            priority: 'Recommended',
            targetDomain: 'sequencing',
          });
        }
      } else if (domain === 'memory' || domain === 'recall') {
        const memProg = gameProgress['memory-match'];
        const picProg = gameProgress['picture-recall'];
        recommendations.push({
          gameId: 'memory-match',
          reason:
            score < 70
              ? `Personalized visual pairing practice (Memory score: ${score}%).`
              : `Maintain visual memory sharpness at Level ${memProg?.unlockedLevel || 1}.`,
          priority: score < 75 ? 'High' : 'Recommended',
          targetDomain: 'memory',
        });
        recommendations.push({
          gameId: 'picture-recall',
          reason:
            score < 75
              ? `Calm short-term observation and tray recall exercise (Recall score: ${score}%).`
              : `Advance your observation retention at Level ${picProg?.unlockedLevel || 1}.`,
          priority: score < 75 ? 'High' : 'Recommended',
          targetDomain: 'recall',
        });
        recommendations.push({
          gameId: 'symbol-matching',
          reason: 'Cultural symbol working memory & multi-mode recall exercise.',
          priority: score < 75 ? 'High' : 'Recommended',
          targetDomain: 'memory',
        });
      } else if (domain === 'attention') {
        const attProg = gameProgress['attention-finder'];
        recommendations.push({
          gameId: 'attention-finder',
          reason:
            score < 75
              ? `Visual focus search in calm garden environments (Attention score: ${score}%).`
              : `Explore intricate garden scenes at Level ${attProg?.unlockedLevel || 1}.`,
          priority: score < 75 ? 'High' : 'Recommended',
          targetDomain: 'attention',
        });
        if (score < 80) {
          recommendations.push({
            gameId: 'odd-one-out',
            reason: 'Gentle discrimination exercise to spot subtle differences.',
            priority: 'Recommended',
            targetDomain: 'attention',
          });
        }
      } else if (domain === 'recognition' || domain === 'orientation') {
        recommendations.push({
          gameId: 'object-recognition',
          reason: 'Match silhouettes and familiar household artifacts.',
          priority: 'Recommended',
          targetDomain: 'recognition',
        });
        recommendations.push({
          gameId: 'spatial-memory',
          reason: 'Remember object placements in cozy veranda layouts.',
          priority: 'Explore',
          targetDomain: 'recognition',
        });
      }
    });
  }

  // 2. Continuous Adaptation: Analyze Recent Gameplay Logs
  if (resultsLog.length > 0) {
    const recent5 = resultsLog.slice(-5);
    // Find if any game had low accuracy recently (< 60%)
    recent5.forEach(log => {
      if (log.accuracy < 60) {
        // Boost priority for gentle review
        const existing = recommendations.find(r => r.gameId === log.gameId);
        if (existing) {
          existing.priority = 'High';
          existing.reason = `Gentle practice to master Level ${log.level} (Recent accuracy: ${log.accuracy}%).`;
        }
      }
    });
  }

  // 3. Fallback to unfilled library slots to maintain a full recommended carousel
  const fallbackList: GameCategory[] = [
    'memory-match',
    'picture-recall',
    'sequence-builder',
    'symbol-matching',
    'attention-finder',
    'number-memory',
    'odd-one-out',
    'spatial-memory',
    'pattern-recall',
    'word-recall',
    'category-sorting',
  ];

  for (const gameId of fallbackList) {
    if (!recommendations.some(r => r.gameId === gameId)) {
      const prog = gameProgress[gameId];
      recommendations.push({
        gameId,
        reason: `Practice Level ${prog?.unlockedLevel || 1} at your own calm pace.`,
        priority: 'Recommended',
        targetDomain: 'memory',
      });
    }
    if (recommendations.length >= 6) break;
  }

  return recommendations;
}
