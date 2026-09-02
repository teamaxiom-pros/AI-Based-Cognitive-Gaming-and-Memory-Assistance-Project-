import http from 'http';
import app from '../server';
import { sendAiRequest } from '../services/aiClient';
import { mapFrontendResponsesToAi, formatAiBaselineToAssessmentResult } from '../adapters/assessmentAdapter';
import { mapAiActivityToGame } from '../adapters/gameAdapter';

const PORT = 3099;

function runServer(): Promise<http.Server> {
  return new Promise(resolve => {
    const server = app.listen(PORT, () => {
      console.log(`[TestServer] Integration test server listening on port ${PORT}`);
      resolve(server);
    });
  });
}

async function fetchJson(path: string, options: any = {}) {
  const res = await fetch(`http://localhost:${PORT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING TEAM AXIOM END-TO-END INTEGRATION TEST SUITE');
  console.log('=============================================================\n');

  const server = await runServer();
  let passedCount = 0;
  let failedCount = 0;

  try {
    // -------------------------------------------------------------
    // TEST 0: Health Check
    // -------------------------------------------------------------
    console.log('👉 [TEST 0] Testing /api/health endpoint...');
    const health = await fetchJson('/api/health');
    console.log('Health response:', JSON.stringify(health.data, null, 2));
    if (health.status === 200 && health.data.status === 'ok') {
      console.log('✅ TEST 0 PASSED: Backend health endpoint working.\n');
      passedCount++;
    } else {
      console.error('❌ TEST 0 FAILED\n');
      failedCount++;
    }

    // -------------------------------------------------------------
    // SCENARIO 1: New Patient Assessment -> AI Baseline -> Focus Domain
    // -------------------------------------------------------------
    console.log('👉 [SCENARIO 1] New patient completes assessment tasks...');
    const sampleResponses = [
      {
        taskId: 'task-orientation-1',
        domain: 'orientation',
        isCorrect: true,
        score: 100,
        responseTimeMs: 3200,
        patientAnswer: 'Wednesday',
      },
      {
        taskId: 'task-orientation-2',
        domain: 'orientation',
        isCorrect: true,
        score: 100,
        responseTimeMs: 2800,
        patientAnswer: 'Assam / North Eastern Region',
      },
      {
        taskId: 'task-memory-encoding-3',
        domain: 'memory',
        isCorrect: true,
        score: 100,
        responseTimeMs: 7500,
        hintsUsed: 0,
      },
      {
        taskId: 'task-attention-4',
        domain: 'attention',
        isCorrect: true,
        score: 100,
        responseTimeMs: 5800,
        hintsUsed: 0,
      },
      {
        taskId: 'task-sequencing-5',
        domain: 'sequencing',
        isCorrect: true,
        score: 100,
        responseTimeMs: 6200,
        hintsUsed: 0,
      },
      {
        taskId: 'task-recognition-6',
        domain: 'recognition',
        isCorrect: true,
        score: 100,
        responseTimeMs: 4500,
        hintsUsed: 0,
      },
      {
        taskId: 'task-recall-7',
        domain: 'recall',
        isCorrect: false,
        score: 50, // 2 out of 4 correct (delayed recall struggling)
        responseTimeMs: 12000,
        hintsUsed: 1,
      },
    ];

    const asmtRes = await fetchJson('/api/assessment/initial', {
      method: 'POST',
      body: JSON.stringify({
        patientId: 'patient-test-new-001',
        taskResponses: sampleResponses,
      }),
    });

    console.log('Assessment Response:', JSON.stringify(asmtRes.data, null, 2));

    if (
      asmtRes.status === 200 &&
      asmtRes.data.success &&
      asmtRes.data.result.focusDomain === 'memory' &&
      asmtRes.data.result.domainScores.memory &&
      asmtRes.data.result.recommendedActivities.length > 0
    ) {
      console.log('✅ SCENARIO 1 PASSED: Real AI baseline built, weakest domain (memory) identified as focus_domain.\n');
      passedCount++;
    } else {
      console.error('❌ SCENARIO 1 FAILED\n');
      failedCount++;
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Existing Patient Recommendation (P001)
    // -------------------------------------------------------------
    console.log('👉 [SCENARIO 2] Existing patient (P001) requests personalized recommendation...');
    const recRes = await fetchJson('/api/recommendation/P001');
    console.log('Recommendation Response:', JSON.stringify(recRes.data, null, 2));

    if (
      recRes.status === 200 &&
      recRes.data.success &&
      recRes.data.recommendedActivity &&
      recRes.data.recommendedDifficulty &&
      recRes.data.performance &&
      recRes.data.gameMapping.route
    ) {
      console.log(`✅ SCENARIO 2 PASSED: AI returned activity "${recRes.data.recommendedActivity}" at difficulty ${recRes.data.recommendedDifficulty} with explanation "${recRes.data.performance.message}".\n`);
      passedCount++;
    } else {
      console.error('❌ SCENARIO 2 FAILED\n');
      failedCount++;
    }

    // -------------------------------------------------------------
    // SCENARIO 3: Weak Patient Performance Safety Limits
    // -------------------------------------------------------------
    console.log('👉 [SCENARIO 3] Verifying safety limits for patient struggling with memory (<40% accuracy)...');
    // P001 has memory accuracy ~39.3% in dataset
    const weakRec = await fetchJson('/api/recommendation/P001?preferredActivity=story_recall');
    console.log('Weak Performance Result:', JSON.stringify(weakRec.data.performance, null, 2));

    if (
      weakRec.data.recommendedDifficulty <= 2 &&
      weakRec.data.performance.status === 'significant_difficulty'
    ) {
      console.log(`✅ SCENARIO 3 PASSED: Safety limit clamped difficulty to ${weakRec.data.recommendedDifficulty} (status: ${weakRec.data.performance.status}).\n`);
      passedCount++;
    } else {
      console.error('❌ SCENARIO 3 FAILED\n');
      failedCount++;
    }

    // -------------------------------------------------------------
    // SCENARIO 4: Game Session Recording Loop
    // -------------------------------------------------------------
    console.log('👉 [SCENARIO 4] Patient completes game level and records session...');
    const recordRes = await fetchJson('/api/sessions/record', {
      method: 'POST',
      body: JSON.stringify({
        patientId: 'P001',
        gameId: 'memory-match',
        gameTitle: 'Assam Heritage Match',
        domain: 'memory',
        level: 3,
        difficultyTier: 1,
        score: 95,
        accuracy: 95.0,
        durationSeconds: 22.5,
        hintsUsed: 0,
      }),
    });
    console.log('Session Record Response:', JSON.stringify(recordRes.data, null, 2));

    if (recordRes.status === 200 && recordRes.data.success) {
      console.log('✅ SCENARIO 4 PASSED: Session recorded and synced.\n');
      passedCount++;
    } else {
      console.error('❌ SCENARIO 4 FAILED\n');
      failedCount++;
    }

    // -------------------------------------------------------------
    // SCENARIO 5: Activity Compatibility Mapping & Fallback Handling
    // -------------------------------------------------------------
    console.log('👉 [SCENARIO 5] Testing activity compatibility mapping and unmapped fallback...');
    const mappedKnown = mapAiActivityToGame('card_match', 3);
    const mappedUnknown = mapAiActivityToGame('non_existent_future_activity', 4);

    console.log('Known mapping ("card_match"):', mappedKnown);
    console.log('Unknown fallback mapping ("non_existent_future_activity"):', mappedUnknown);

    if (
      mappedKnown.gameId === 'memory-match' &&
      mappedKnown.difficultyTier === 3 &&
      mappedUnknown.gameId === 'memory-match' &&
      mappedUnknown.difficultyTier === 4
    ) {
      console.log('✅ SCENARIO 5 PASSED: Full compatibility mapping and resilient fallback verified.\n');
      passedCount++;
    } else {
      console.error('❌ SCENARIO 5 FAILED\n');
      failedCount++;
    }

    // -------------------------------------------------------------
    // SCENARIO 6: Assistant Natural Language Query Bridge
    // -------------------------------------------------------------
    console.log('👉 [SCENARIO 6] Testing assistant natural language intent query...');
    const asstRes = await fetchJson('/api/assistant/query', {
      method: 'POST',
      body: JSON.stringify({
        query: 'When is my next medicine scheduled?',
        patientId: 'P001',
      }),
    });
    console.log('Assistant Response:', JSON.stringify(asstRes.data, null, 2));

    if (asstRes.status === 200 && asmtRes.data.success && asstRes.data.response) {
      console.log('✅ SCENARIO 6 PASSED: Assistant intent query processed and returned speech-ready answer.\n');
      passedCount++;
    } else {
      console.error('❌ SCENARIO 6 FAILED\n');
      failedCount++;
    }

    console.log('=============================================================');
    console.log(`📊 INTEGRATION TEST SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED`);
    console.log('=============================================================\n');

  } catch (err: any) {
    console.error('💥 Test suite fatal error:', err);
  } finally {
    server.close();
  }
}

runTests();
