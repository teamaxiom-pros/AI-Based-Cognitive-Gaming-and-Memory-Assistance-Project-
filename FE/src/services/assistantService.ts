import { AssessmentResult } from '../types';
import { GameCategory, GameProgressState, GameRecommendation, GameResultRecord } from '../types/gameTypes';
import { gamesLibrary } from '../data/gamesLibraryData';

export interface AssistantResponse {
  answer: string;
  actionType?: 'navigate' | 'call' | 'speak' | 'none';
  actionTarget?: string;
  suggestedFollowUp?: string[];
}

export function processAssistantQuery(
  query: string,
  patientName: string = 'Asha',
  medicinesTakenCount: number = 2,
  totalMedicines: number = 3,
  assessmentResult?: AssessmentResult | null,
  resultsLog: GameResultRecord[] = [],
  gameProgress: Record<GameCategory, GameProgressState> = {} as any,
  recommendations: GameRecommendation[] = []
): AssistantResponse {
  const q = query.toLowerCase().trim();

  // 1. PROGRESS / PERFORMANCE QUERY ("How am I doing?")
  if (
    q.includes('how am i doing') ||
    q.includes('how did i do') ||
    q.includes('my progress') ||
    q.includes('performance') ||
    q.includes('score') ||
    q.includes('ভালনে') ||
    q.includes('কেন আছো') ||
    q.includes('कैसा कर रहा हूं')
  ) {
    const totalPlays = resultsLog.length;
    const avgAccuracy =
      totalPlays > 0
        ? Math.round(resultsLog.reduce((sum, r) => sum + r.accuracy, 0) / totalPlays)
        : assessmentResult?.overallScore || 80;

    const recent3 = resultsLog.slice(-3);
    const recentAccuracy =
      recent3.length > 0
        ? Math.round(recent3.reduce((sum, r) => sum + r.accuracy, 0) / recent3.length)
        : avgAccuracy;

    let trendText = 'Your practice trend is consistent and steady.';
    if (recentAccuracy > avgAccuracy + 3) {
      trendText = `Your recent activity accuracy has improved up to ${recentAccuracy}%!`;
    } else if (recentAccuracy < avgAccuracy - 5) {
      trendText = 'You are building steady foundation with gentle practice.';
    }

    const baselineText = assessmentResult
      ? `Your cognitive baseline activity score is ${assessmentResult.overallScore}%.`
      : 'You have completed your initial cognitive orientation.';

    return {
      answer: `You are doing well, ${patientName}! ${baselineText} You have completed ${totalPlays} practice sessions with an average accuracy of ${avgAccuracy}%. ${trendText}`,
      actionType: 'navigate',
      actionTarget: '/patient/activities',
      suggestedFollowUp: ['What should I practice?', 'Play a brain game', 'Show my schedule'],
    };
  }

  // 2. PRACTICE / RECOMMENDATION QUERY ("What should I practice?")
  if (
    q.includes('what should i practice') ||
    q.includes('what should i play') ||
    q.includes('recommend') ||
    q.includes('which activity') ||
    q.includes('কি খেলিম') ||
    q.includes('क्या खेलना चाहिए')
  ) {
    const topRec = recommendations[0];
    const gameDef = topRec ? gamesLibrary.find(g => g.id === topRec.gameId) : null;
    const gameTitle = gameDef?.title || 'Cultural Memory Match';
    const currentLvl = topRec ? gameProgress[topRec.gameId]?.unlockedLevel || 1 : 1;

    return {
      answer: `Based on your recent assessment and activity profile, we recommend ${gameTitle} at Level ${currentLvl}. ${topRec?.reason || 'It will gently strengthen visual memory and focus!'}`,
      actionType: 'navigate',
      actionTarget: `/patient/games/${topRec?.gameId || 'memory-match'}`,
      suggestedFollowUp: [`Play ${gameTitle}`, 'Show all games', 'How am I doing?'],
    };
  }

  // 3. MEDICINE QUERY
  if (
    q.includes('medicine') ||
    q.includes('med') ||
    q.includes('pill') ||
    q.includes('দৱা') ||
    q.includes('ঔষধ') ||
    q.includes('दवा')
  ) {
    return {
      answer: `Good news, ${patientName}! You have confirmed ${medicinesTakenCount} of your ${totalMedicines} scheduled medicines for today. Your next scheduled dose is with your afternoon meal.`,
      actionType: 'navigate',
      actionTarget: '/medicines',
      suggestedFollowUp: ['Show all medicines', 'What is Donepezil for?', 'Call caregiver'],
    };
  }

  // 4. ROUTINE & SCHEDULE QUERY
  if (
    q.includes('routine') ||
    q.includes('schedule') ||
    q.includes('doing today') ||
    q.includes('next') ||
    q.includes('ৰুটিন') ||
    q.includes('দিনচৰ্যা')
  ) {
    return {
      answer: `Today you have successfully completed your garden tea walk, morning medicines, and brain activity. Next on your schedule is quiet afternoon rest and traditional music at 2:30 PM.`,
      actionType: 'navigate',
      actionTarget: '/routine',
      suggestedFollowUp: ['Mark rest complete', 'Play brain game', 'Show family photos'],
    };
  }

  // 5. CAREGIVER / FAMILY QUERY
  if (q.includes('priya') || q.includes('daughter') || q.includes('প্ৰিয়া') || q.includes('प्रिया')) {
    return {
      answer: `Priya is your eldest daughter. She teaches in Guwahati and loves baking traditional Assamese pitha with you. She is visiting you this Sunday afternoon!`,
      actionType: 'navigate',
      actionTarget: '/memory',
      suggestedFollowUp: ['Call Priya', 'Show photo of Priya', 'Show all family'],
    };
  }

  if (q.includes('vikram') || q.includes('son') || q.includes('ল’ৰা') || q.includes('विक्रम')) {
    return {
      answer: `Vikram is your son and primary caregiver. He is at home with you in Guwahati and made your morning Assam tea at 7:30 AM.`,
      actionType: 'call',
      actionTarget: '+91 98765 43210',
      suggestedFollowUp: ['Call Vikram', 'Send a reminder', 'Show daily schedule'],
    };
  }

  if (
    q.includes('family') ||
    q.includes('photo') ||
    q.includes('picture') ||
    q.includes('ছবি') ||
    q.includes('স্মৃতি') ||
    q.includes('तस्वीर')
  ) {
    return {
      answer: `Opening your Memory Book. You have 4 family members and 3 beautiful Assam photo albums saved.`,
      actionType: 'navigate',
      actionTarget: '/memory',
      suggestedFollowUp: ['Who is Rohan?', 'Kaziranga album', 'Back to Home'],
    };
  }

  // 6. GENERAL BRAIN GAME QUERY
  if (
    q.includes('game') ||
    q.includes('play') ||
    q.includes('brain') ||
    q.includes('খেল') ||
    q.includes('খেলা') ||
    q.includes('खेल')
  ) {
    const topRec = recommendations[0];
    const gameDef = topRec ? gamesLibrary.find(g => g.id === topRec.gameId) : null;
    const gameTitle = gameDef?.title || 'Heritage Memory Match';

    return {
      answer: `Let's practice with ${gameTitle}! It is calibrated to your current performance level.`,
      actionType: 'navigate',
      actionTarget: `/patient/games/${topRec?.gameId || 'memory-match'}`,
      suggestedFollowUp: ['Memory Match', 'Flower Search', 'Daily Objects Recall'],
    };
  }

  // 7. LOCATION QUERY
  if (
    q.includes('where') ||
    q.includes('live') ||
    q.includes('place') ||
    q.includes('city') ||
    q.includes('ক’ত') ||
    q.includes('कहाँ')
  ) {
    return {
      answer: `You live in your peaceful home in Dispur, Guwahati, Assam, close to the beautiful Brahmaputra riverfront.`,
      actionType: 'navigate',
      actionTarget: '/memory',
      suggestedFollowUp: ['Show Brahmaputra photos', 'Show Kaziranga', 'What time is it?'],
    };
  }

  // 8. WEATHER QUERY
  if (q.includes('weather') || q.includes('climate') || q.includes('বতৰ') || q.includes('मौसम')) {
    return {
      answer: `The weather in Guwahati today is pleasant at 28°C with a gentle river breeze and clear sunny skies. Perfect for an evening garden stroll!`,
      actionType: 'none',
      suggestedFollowUp: ['What is my afternoon schedule?', 'Play a brain game'],
    };
  }

  // Default friendly answer
  return {
    answer: `I am here with you, ${patientName}. You can ask me "How am I doing?", "What should I practice?", or ask about medicines, daily schedule, and family photos.`,
    actionType: 'none',
    suggestedFollowUp: ['How am I doing?', 'What should I practice?', 'Show my schedule'],
  };
}
