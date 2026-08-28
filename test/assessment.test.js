import assert from 'node:assert/strict';

import { LOBAR_TASKS, LOBAR_TASK_CATALOGUE, LOBAR_TASK_ORDER, LOBAR_TASK_KEYS, taskDefinition } from '../src/config/lobarTaskRegistryConfig.js';
import { clampScore, accuracyScore, speedScore, blendedScore } from '../src/engines/assessmentScoringUtils.js';
import { AssessmentSessionModel } from '../src/engines/AssessmentSessionModel.js';
import { StroopEngine } from '../src/engines/StroopEngine.js';
import { TrailMakingEngine } from '../src/engines/TrailMakingEngine.js';
import { GoNoGoEngine } from '../src/engines/GoNoGoEngine.js';
import { TokenTestEngine, CommandEngine, TokenEngine, ValidationEngine } from '../src/engines/TokenTestEngine.js';
import { VerbalFluencyEngine } from '../src/engines/VerbalFluencyEngine.js';
import { WordListRecallEngine } from '../src/engines/WordListRecallEngine.js';
import { DelayedRecognitionEngine } from '../src/engines/DelayedRecognitionEngine.js';
import { NamingEngine } from '../src/engines/NamingEngine.js';
import { STUDY_WORDS } from '../src/config/wordListConfig.js';
import { ClockDrawingEngine } from '../src/engines/ClockDrawingEngine.js';
import { CubeCopyEngine } from '../src/engines/CubeCopyEngine.js';
import { CalculationEngine } from '../src/engines/CalculationEngine.js';
import { CALCULATION_PROBLEMS } from '../src/config/calculationConfig.js';
import { EmbeddedFigureEngine } from '../src/engines/EmbeddedFigureEngine.js';
import { EMBEDDED_FIGURE_ROUNDS } from '../src/config/embeddedFigureConfig.js';
import { NAMING_ITEMS } from '../src/config/namingConfig.js';
import { OBJECT_NAMING_ITEMS } from '../src/config/objectNamingConfig.js';
import { QuestionBankEngine } from '../src/engines/QuestionBankEngine.js';
import { QUESTION_BANK, QB_LOBE_TAGS, QB_SELECTION_RULES } from '../src/config/questionBankConfig.js';
import { CognitiveScoreEngine } from '../src/engines/CognitiveScoreEngine.js';
import { AssessmentModeGuard } from '../src/engines/AssessmentModeGuard.js';
import { ASSESSMENT_MODE_SAFE_CATEGORIES } from '../src/config/assessmentModeConfig.js';
import { DoctorDashboardExportEngine } from '../src/engines/DoctorDashboardExportEngine.js';
import { MatrixReasoningEngine, generateItem as generateMatrixItem, cellShapes } from '../src/engines/MatrixReasoningEngine.js';
import { DrawingEngine as GeometryDrawingEngine, analyzeDrawing, ValidationEngine as GeometryValidationEngine, GeometricShapeCopyEngine } from '../src/engines/GeometricShapeCopyEngine.js';
import { GEOMETRIC_FIGURES, buildAssessmentSequence as buildGeometryAssessmentSequence } from '../src/config/geometricShapeCopyConfig.js';
import { ObjectGenerationEngine, ValidationEngine as VisualMemoryValidationEngine, VisualMemoryEngine } from '../src/engines/VisualMemoryEngine.js';
import { FaceGenerationEngine, RecognitionEngine as FaceRecognitionEngineBuilder, ValidationEngine as FaceRecognitionValidationEngine, MetricsEngine as FaceRecognitionMetricsEngine, FaceRecognitionEngine } from '../src/engines/FaceRecognitionEngine.js';
import { FACE_POOL, DIFFICULTY_TIERS as FACE_DIFFICULTY_TIERS } from '../src/config/faceRecognitionConfig.js';
import { RecognitionEngine as DelayedRecognitionEngineBuilder, ValidationEngine as DelayedRecognitionValidationEngine, DelayedRecognitionMemoryEngine } from '../src/engines/DelayedRecognitionMemoryEngine.js';
import { ITEM_POOLS as DRM_ITEM_POOLS, DISTRACTOR_COUNT_BY_TYPE } from '../src/config/delayedRecognitionMemoryConfig.js';
import { StudyItemRegistry } from '../src/engines/StudyItemRegistry.js';

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

// ---------- lobarTaskRegistryConfig ----------
// 2026-08-14: the real Final 8 lineup (Stroop, Go/No-Go, Token Test,
// Delayed Recognition Memory, Raven's Matrices, Geometric Shape Copy,
// Visual Memory, Face Recognition) replaced the original 12-task
// catalogue's active set. All 8 of 8 are now confirmed real and wired in;
// see lobarTaskRegistryConfig.js's own header comment for the full story.
check('LOBAR_TASK_CATALOGUE: the full catalogue has all 13 previous tasks plus the 5 new Final-8 entries', () => {
  assert.equal(LOBAR_TASK_CATALOGUE.length, 18);
  const expectedKeys = ['stroop', 'trailMaking', 'goNoGo', 'tokenTest', 'matrixReasoning', 'geometricShapeCopy', 'visualMemory', 'faceRecognition', 'delayedRecognitionMemory', 'verbalFluency', 'wordListRecall', 'delayedRecognition', 'naming', 'clockDrawing', 'cubeCopy', 'calculation', 'embeddedFigures', 'objectNaming'];
  for (const key of expectedKeys) assert.ok(LOBAR_TASK_CATALOGUE.some((t) => t.id === key), `missing task key ${key}`);
});

check('LOBAR_TASKS: exactly the 8 currently-real Final-8 tasks are active', () => {
  assert.equal(LOBAR_TASKS.length, 8);
  const activeKeys = ['stroop', 'goNoGo', 'tokenTest', 'matrixReasoning', 'geometricShapeCopy', 'visualMemory', 'faceRecognition', 'delayedRecognitionMemory'];
  assert.deepEqual([...LOBAR_TASK_KEYS].sort(), [...activeKeys].sort());
  // Lobe distribution (2026-08-14 rebalance): frontal: 2, temporal: 2,
  // parietal: 2, occipital: 2 -- visualMemory + faceRecognition moved to
  // occipital, a real reclassification not a fudge; see lobarTaskRegistryConfig.js.
  assert.equal(LOBAR_TASKS.filter((t) => t.lobe === 'frontal').length, 2);
  assert.equal(LOBAR_TASKS.filter((t) => t.lobe === 'temporal').length, 2);
  assert.equal(LOBAR_TASKS.filter((t) => t.lobe === 'parietal').length, 2);
  assert.equal(LOBAR_TASKS.filter((t) => t.lobe === 'occipital').length, 2);
  assert.equal(taskDefinition('visualMemory').lobe, 'occipital');
  assert.equal(taskDefinition('faceRecognition').lobe, 'occipital');
});

check('LOBAR_TASKS: the retired-for-now tasks are inactive but still in the full catalogue', () => {
  for (const key of ['trailMaking', 'verbalFluency', 'wordListRecall', 'delayedRecognition', 'naming', 'clockDrawing', 'cubeCopy', 'calculation', 'embeddedFigures', 'objectNaming']) {
    assert.ok(!LOBAR_TASK_KEYS.includes(key), `${key} should not be in the active set`);
    const def = LOBAR_TASK_CATALOGUE.find((t) => t.id === key);
    assert.ok(def, `${key} should still exist in the full catalogue`);
    assert.equal(def.active, false);
  }
});

check('LOBAR_TASK_ORDER: delayedRecognitionMemory runs last regardless of declaration order', () => {
  assert.equal(LOBAR_TASK_ORDER[LOBAR_TASK_ORDER.length - 1], 'delayedRecognitionMemory');
  assert.equal(LOBAR_TASK_ORDER.length, 8);
  // 2026-08-27 FIX: this asserted 'stroop' here, which was true before the
  // 2026-08-22 re-sequence (lobarTaskRegistryConfig.js -- VR feedback:
  // Stroop/Go-No-Go "so boring at the very beginning") intentionally moved
  // visualMemory to position 1 and pushed stroop back to position 6. The
  // test was simply never updated after that deliberate, documented
  // change -- this was stale test debt, not a real ordering bug (found
  // during the 2026-08-27 full Detection Assessment audit).
  assert.equal(LOBAR_TASK_ORDER[0], 'visualMemory');
});

check('LOBAR_TASK_ORDER: faceRecognition runs before delayedRecognitionMemory (so its registered study items are available)', () => {
  const faceIdx = LOBAR_TASK_ORDER.indexOf('faceRecognition');
  const drmIdx = LOBAR_TASK_ORDER.indexOf('delayedRecognitionMemory');
  assert.ok(faceIdx >= 0 && drmIdx >= 0);
  assert.ok(faceIdx < drmIdx);
});

check('taskDefinition: every ACTIVE task maps to one of the six Doctor-Dashboard-recognized domains', () => {
  const validDomains = ['attention', 'executiveFunction', 'processingSpeed', 'visualMemory', 'language', 'recognitionMemory'];
  for (const key of LOBAR_TASK_KEYS) {
    const def = taskDefinition(key);
    assert.ok(def, `no definition for ${key}`);
    assert.ok(validDomains.includes(def.domain), `${key} has an invalid domain: ${def.domain}`);
  }
});

check('taskDefinition: visualMemory, faceRecognition, and delayedRecognitionMemory feed their real, matching domain keys directly', () => {
  assert.equal(taskDefinition('visualMemory').domain, 'visualMemory');
  assert.equal(taskDefinition('faceRecognition').domain, 'recognitionMemory');
  assert.equal(taskDefinition('delayedRecognitionMemory').domain, 'recognitionMemory');
});

check('taskDefinition: can still look up an INACTIVE task by id (re-enable point stays discoverable)', () => {
  const def = taskDefinition('verbalFluency');
  assert.ok(def);
  assert.equal(def.active, false);
});

// ---------- assessmentScoringUtils ----------
check('clampScore: clamps to 0-100 and never returns NaN', () => {
  assert.equal(clampScore(150), 100);
  assert.equal(clampScore(-20), 0);
  assert.equal(clampScore(NaN), 0);
  assert.equal(clampScore(72.34), 72.3);
});

check('accuracyScore: correct/total as a percentage, zero-total never divides by zero', () => {
  assert.equal(accuracyScore(8, 10), 80);
  assert.equal(accuracyScore(0, 0), 0);
});

check('speedScore: full credit at/under target, zero at/over max, linear between', () => {
  assert.equal(speedScore(500, { targetMs: 800, maxMs: 3000 }), 100);
  assert.equal(speedScore(3000, { targetMs: 800, maxMs: 3000 }), 0);
  const mid = speedScore(1900, { targetMs: 800, maxMs: 3000 }); // halfway
  assert.ok(mid > 45 && mid < 55);
});

check('blendedScore: weights accuracy over speed by default', () => {
  const score = blendedScore(100, 0); // perfect accuracy, zero speed credit
  assert.equal(score, 70); // 100*0.7 + 0*0.3
});

check('blendedScore: falls back to accuracy alone when no speed score exists', () => {
  assert.equal(blendedScore(85, undefined), 85);
});

// ---------- AssessmentSessionModel ----------
check('AssessmentSessionModel.build: aggregates per-task scores into domain averages correctly', () => {
  const results = [
    { taskId: 'stroop', score: 80 }, // executiveFunction
    { taskId: 'tokenTest', score: 60 }, // attention
    { taskId: 'visualMemory', score: 90 }, // visualMemory (real domain match)
  ];
  const session = AssessmentSessionModel.build(results);
  assert.equal(session.domainScoresRaw.executiveFunction, 80); // just stroop
  assert.equal(session.domainScoresRaw.attention, 60); // just tokenTest
  assert.equal(session.domainScoresRaw.visualMemory, 90); // just visualMemory
  assert.equal(session.domainScoresRaw.processingSpeed, undefined); // no active task currently feeds processingSpeed -- honest gap, see lobarTaskRegistryConfig.js
  assert.equal(session.lobarTaskScores.stroop, 80);
  assert.equal(session.overallRawScore, round1Avg([80, 60, 90]));
});

function round1Avg(values) {
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

check('AssessmentSessionModel.build: a partial (incomplete) assessment produces an honest partial result, never throws', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'stroop', score: 75 }]);
  assert.equal(session.completedCount, 1);
  assert.equal(session.totalCount, 8);
  assert.equal(session.overallRawScore, 75);
});

check('AssessmentSessionModel.build: faceRecognition and delayedRecognitionMemory both feed recognitionMemory and get averaged together', () => {
  const session = AssessmentSessionModel.build([
    { taskId: 'faceRecognition', score: 80 },
    { taskId: 'delayedRecognitionMemory', score: 60 },
  ]);
  assert.equal(session.domainScoresRaw.recognitionMemory, 70); // avg(80, 60)
});

check('AssessmentSessionModel.build: an empty result set never throws and reports zero completed', () => {
  const session = AssessmentSessionModel.build([]);
  assert.equal(session.completedCount, 0);
  assert.equal(session.overallRawScore, undefined);
  assert.deepEqual(session.lobarTaskScores, {});
});

check('AssessmentSessionModel.build: sums durationMs across all submitted tasks', () => {
  const session = AssessmentSessionModel.build([
    { taskId: 'stroop', score: 80, durationMs: 5000 },
    { taskId: 'visualMemory', score: 90, durationMs: 7000 },
  ]);
  assert.equal(session.durationMs, 12000);
});

// ---------- StroopEngine (teammate's richer 2026-08-11 version) ----------
check('StroopEngine.score: perfect accuracy scores a high, near-100 cognitive score', () => {
  const responses = [
    { trialNumber: 1, trialType: 'incongruent', correct: true, timeout: false, reactionTime: 600 },
    { trialNumber: 2, trialType: 'incongruent', correct: true, timeout: false, reactionTime: 650 },
    { trialNumber: 3, trialType: 'congruent', correct: true, timeout: false, reactionTime: 500 },
  ];
  const result = StroopEngine.score(responses);
  assert.equal(result.accuracy, 100);
  assert.ok(result.score >= 85, `expected a high score, got ${result.score}`);
});

check('StroopEngine.score: wrong answers reduce accuracy correctly', () => {
  const responses = [
    { trialNumber: 1, trialType: 'incongruent', correct: false, timeout: false, reactionTime: 800 },
    { trialNumber: 2, trialType: 'incongruent', correct: true, timeout: false, reactionTime: 800 },
  ];
  const result = StroopEngine.score(responses);
  assert.equal(result.accuracy, 50);
});

check('StroopEngine.score: a timeout counts as incorrect, not a crash', () => {
  const responses = [
    { trialNumber: 1, trialType: 'incongruent', correct: false, timeout: true, reactionTime: 5000 },
    { trialNumber: 2, trialType: 'incongruent', correct: true, timeout: false, reactionTime: 700 },
  ];
  const result = StroopEngine.score(responses);
  assert.equal(result.accuracy, 50);
  assert.equal(result.metrics.timeouts, 1);
});

check('StroopEngine.score: empty responses never throws', () => {
  const result = StroopEngine.score([]);
  assert.equal(result.score, 0);
});

// ---------- TrailMakingEngine ----------
check('TrailMakingEngine.score: fast, error-free completion scores 100', () => {
  const result = TrailMakingEngine.score(10000, 0);
  assert.equal(result.score, 100);
});

check('TrailMakingEngine.score: each error costs points off accuracy', () => {
  const result = TrailMakingEngine.score(10000, 2);
  assert.equal(result.accuracy, 84); // 100 - 2*8
});

check('TrailMakingEngine.score: a very slow completion loses speed credit but not accuracy', () => {
  const result = TrailMakingEngine.score(60000, 0);
  assert.equal(result.accuracy, 100);
  assert.ok(result.score < 100);
});

// ---------- GoNoGoEngine (teammate's richer 2026-08-11 version) ----------
check('GoNoGoEngine.classifyOutcome: correct GO/NOGO responses classify as HIT / CORRECT_INHIBITION', () => {
  assert.equal(GoNoGoEngine.classifyOutcome({ stimulusType: 'GO' }, true, 400, 1500), 'HIT');
  assert.equal(GoNoGoEngine.classifyOutcome({ stimulusType: 'NOGO' }, false, null, 1500), 'CORRECT_INHIBITION');
});

check('GoNoGoEngine.classifyOutcome: a tap on NO-GO is a commission error; a missed GO is an omission error', () => {
  assert.equal(GoNoGoEngine.classifyOutcome({ stimulusType: 'NOGO' }, true, 500, 1500), 'COMMISSION_ERROR');
  assert.equal(GoNoGoEngine.classifyOutcome({ stimulusType: 'GO' }, false, null, 1500), 'OMISSION_ERROR');
});

check('GoNoGoEngine.score: correct Go taps and correct No-Go withholds both count as correct, zero errors', () => {
  const scoredTrials = [
    { trialNumber: 1, stimulusType: 'GO', responded: true, reactionTime: 400, outcome: 'HIT' },
    { trialNumber: 2, stimulusType: 'NOGO', responded: false, reactionTime: null, outcome: 'CORRECT_INHIBITION' },
    { trialNumber: 3, stimulusType: 'GO', responded: true, reactionTime: 450, outcome: 'HIT' },
  ];
  const result = GoNoGoEngine.score(scoredTrials);
  assert.equal(result.accuracy, 100);
  assert.equal(result.commissionErrors, 0);
  assert.equal(result.omissionErrors, 0);
});

check('GoNoGoEngine.score: commission and omission errors are counted separately and reduce accuracy', () => {
  const scoredTrials = [
    { trialNumber: 1, stimulusType: 'NOGO', responded: true, reactionTime: 500, outcome: 'COMMISSION_ERROR' },
    { trialNumber: 2, stimulusType: 'GO', responded: false, reactionTime: null, outcome: 'OMISSION_ERROR' },
    { trialNumber: 3, stimulusType: 'GO', responded: true, reactionTime: 400, outcome: 'HIT' },
  ];
  const result = GoNoGoEngine.score(scoredTrials);
  assert.equal(result.commissionErrors, 1);
  assert.equal(result.omissionErrors, 1);
  assert.ok(result.accuracy < 100);
});

check('GoNoGoEngine.score: empty responses never throws', () => {
  const result = GoNoGoEngine.score([]);
  assert.equal(result.score, 0);
});

check('GoNoGoEngine.generateTrials: produces the exact requested GO/NO-GO split, every time', () => {
  for (let i = 0; i < 10; i++) {
    const trials = GoNoGoEngine.generateTrials(20, 7, 4, true);
    assert.equal(trials.length, 20);
    assert.equal(trials.filter((t) => t.stimulusType === 'NOGO').length, 7);
    assert.equal(trials.filter((t) => t.stimulusType === 'GO').length, 13);
  }
});

// ---------- TokenTestEngine (new task, 2026-08-11 integration) ----------
check('TokenTestEngine.score: all-correct scored items score 100', () => {
  const trialHistory = [
    { level: 'easy', type: 'single', reactionMs: 2000, attempted: true, correct: true, errorType: null },
    { level: 'medium', type: 'single', reactionMs: 3000, attempted: true, correct: true, errorType: null },
  ];
  const result = TokenTestEngine.score(trialHistory);
  assert.equal(result.raw_score, 2);
  assert.equal(result.max_score, 2);
  assert.equal(result.score, 100);
});

check('TokenTestEngine.score: wrong/no-response items reduce the score and are captured in error_types', () => {
  const trialHistory = [
    { level: 'easy', type: 'single', reactionMs: 2000, attempted: true, correct: true, errorType: null },
    { level: 'hard', type: 'sequential', reactionMs: 28000, attempted: false, correct: false, errorType: 'no_response' },
  ];
  const result = TokenTestEngine.score(trialHistory);
  assert.equal(result.raw_score, 1);
  assert.equal(result.score, 50);
  assert.deepEqual(result.error_types, ['no_response']);
  assert.equal(result.items_skipped, 1);
});

check('TokenTestEngine.score: empty trial history never throws', () => {
  const result = TokenTestEngine.score([]);
  assert.equal(result.score, 0);
});

check('CommandEngine.generateSessionCommands: always returns 3 easy, 3 medium, 3 hard commands', () => {
  const commands = CommandEngine.generateSessionCommands();
  assert.equal(commands.length, 9);
  assert.equal(commands.filter((c) => c.level === 'easy').length, 3);
  assert.equal(commands.filter((c) => c.level === 'medium').length, 3);
  assert.equal(commands.filter((c) => c.level === 'hard').length, 3);
});

check('TokenEngine.generateBoard: the board always contains a token matching every required step', () => {
  for (let i = 0; i < 10; i++) {
    const command = CommandEngine.generatePracticeItem();
    const { board } = TokenEngine.generateBoard(command);
    assert.equal(board.length, 10);
    assert.ok(board.some((t) => t.color === command.step.color));
  }
});

check('ValidationEngine.validateResponse: a correct single-attribute selection validates as correct', () => {
  const command = { type: 'single', step: { color: 'red' } };
  const result = ValidationEngine.validateResponse(command, [{ color: 'red', shape: 'circle' }], true);
  assert.equal(result.correct, true);
});

check('ValidationEngine.validateResponse: no response at all is classified as no_response, not a wrong-attribute error', () => {
  const command = { type: 'single', step: { color: 'red' } };
  const result = ValidationEngine.validateResponse(command, [], false);
  assert.equal(result.correct, false);
  assert.equal(result.errorType, 'no_response');
});

// ---------- MatrixReasoningEngine (real teammate project, matrices_game) ----------
check('generateItem: builds a 3x3 grid with exactly one missing (bottom-right) cell', () => {
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const item = generateMatrixItem(difficulty);
    assert.equal(item.grid.length, 3);
    const flat = item.grid.flat();
    assert.equal(flat.length, 9);
    assert.equal(flat.filter((c) => c === null).length, 1);
    assert.equal(item.grid[2][2], null);
  }
});

check('generateItem: exactly 4 options, exactly one marked correct', () => {
  const item = generateMatrixItem('hard');
  assert.equal(item.options.length, 4);
  assert.equal(item.options.filter((o) => o._isCorrect).length, 1);
});

check('cellShapes: null attrs render as no shapes; a real cell renders at least one shape', () => {
  assert.deepEqual(cellShapes(null), []);
  const item = generateMatrixItem('easy');
  assert.ok(cellShapes(item.options[0]).length >= 1);
});

check('MatrixReasoningEngine.score: all-correct scored items score 100', () => {
  const scoredResults = [
    { correct: true, responseTimeMs: 4000, errorType: null, difficulty: 'easy' },
    { correct: true, responseTimeMs: 5000, errorType: null, difficulty: 'medium' },
  ];
  const result = MatrixReasoningEngine.score(scoredResults, { sessionId: 'test' });
  assert.equal(result.raw_score, 2);
  assert.equal(result.max_score, 2);
  assert.equal(result.score, 100);
  assert.equal(result.game_id, 'matrix_reasoning');
  assert.equal(result.lobe, 'parietal');
});

check('MatrixReasoningEngine.score: a timeout is recorded as no_response and counted as skipped', () => {
  const scoredResults = [
    { correct: false, responseTimeMs: 25000, errorType: 'no_response', difficulty: 'hard' },
    { correct: true, responseTimeMs: 3000, errorType: null, difficulty: 'easy' },
  ];
  const result = MatrixReasoningEngine.score(scoredResults, { sessionId: 'test' });
  assert.equal(result.items_skipped, 1);
  assert.equal(result.items_attempted, 1);
  assert.equal(result.score, 50);
});

check('MatrixReasoningEngine.score: empty scored results never throws', () => {
  const result = MatrixReasoningEngine.score([], { sessionId: 'test' });
  assert.equal(result.max_score, 0);
  assert.equal(result.score, 0);
});

// ---------- GeometricShapeCopyEngine (real teammate project, geometry_game) ----------
check('DrawingEngine: captures strokes and computes planning time', () => {
  const engine = new GeometryDrawingEngine();
  engine.startFigure();
  engine.beginStroke(10, 10);
  engine.extendStroke(20, 20);
  engine.endStroke();
  assert.equal(engine.getStrokes().length, 1);
  assert.ok(typeof engine.getPlanningTimeMs() === 'number');
});

check('GeometryValidationEngine.validateAttempt: no strokes + timeout is not_administered_or_no_response', () => {
  const result = GeometryValidationEngine.validateAttempt([], true);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'not_administered_or_no_response');
});

check('GeometryValidationEngine.validateAttempt: a real multi-point stroke validates', () => {
  const strokes = [[{ x: 0, y: 0, t: 0 }, { x: 10, y: 10, t: 10 }, { x: 20, y: 5, t: 20 }]];
  const result = GeometryValidationEngine.validateAttempt(strokes, false);
  assert.equal(result.valid, true);
});

check('analyzeDrawing: an empty/no-stroke drawing returns emptyMetrics, never throws', () => {
  const figure = GEOMETRIC_FIGURES[0];
  const metrics = analyzeDrawing(figure, [], 1);
  assert.equal(metrics.overallDrawingAccuracy, 0);
  assert.equal(metrics.missingElements, figure.components[0].vertices.length);
});

check('analyzeDrawing: tracing the reference figure\'s own vertices scores very highly', () => {
  const figure = GEOMETRIC_FIGURES.find((f) => f.id === 'easy-square');
  const stroke = figure.components[0].vertices.map((v, i) => ({ x: v[0], y: v[1], t: i * 10 }));
  stroke.push({ x: stroke[0].x, y: stroke[0].y, t: stroke.length * 10 }); // close the loop
  const metrics = analyzeDrawing(figure, [stroke], 1);
  assert.ok(metrics.overallDrawingAccuracy > 80, `expected a high score, got ${metrics.overallDrawingAccuracy}`);
});

check('geometricShapeCopyConfig: the trimmed assessment sequence has 2 figures per difficulty tier (6 total)', () => {
  const sequence = buildGeometryAssessmentSequence();
  assert.equal(sequence.length, 6);
  assert.equal(sequence.filter((f) => f.difficulty === 'easy').length, 2);
  assert.equal(sequence.filter((f) => f.difficulty === 'medium').length, 2);
  assert.equal(sequence.filter((f) => f.difficulty === 'hard').length, 2);
});

check('GeometricShapeCopyEngine.score: a fully-timed-out session (no drawings) never throws and scores very low', () => {
  const perFigureResults = buildGeometryAssessmentSequence().map((f) => ({
    figureId: f.id, difficulty: f.difficulty, timeLimitSec: f.timeLimitSec,
    status: 'timed_out', responseTimeMs: f.timeLimitSec * 1000, planningTimeMs: null, drawingMetrics: null,
  }));
  const result = GeometricShapeCopyEngine.score(perFigureResults, { sessionId: 'test' });
  // constructionalPraxis/visuospatial (the two biggest weights, 65% combined)
  // are both 0 since no figure produced measurable drawingMetrics; the
  // remaining motor-planning/processing-speed components cap the composite
  // well below a passing score, verbatim per the teammate's own formula.
  assert.ok(result.score <= 25, `expected a very low score, got ${result.score}`);
  assert.equal(result.figuresTimedOut, 6);
});

// ---------- VisualMemoryEngine (real teammate project, visual_memory) ----------
check('ObjectGenerationEngine.generateTrial: target/option counts match difficulty config exactly', () => {
  const easy = ObjectGenerationEngine.generateTrial('easy');
  assert.equal(easy.targets.length, 5);
  assert.equal(easy.targets.length + easy.distractors.length, 8);
  const hard = ObjectGenerationEngine.generateTrial('hard');
  assert.equal(hard.targets.length, 9);
  assert.equal(hard.targets.length + hard.distractors.length, 16);
});

check('VisualMemoryValidationEngine.validate: classifies hits/misses/false positives/correct rejections correctly', () => {
  const grid = [
    { id: 'apple', isTarget: true }, { id: 'key', isTarget: true },
    { id: 'cup', isTarget: false }, { id: 'chair', isTarget: false },
  ];
  const result = VisualMemoryValidationEngine.validate(['apple', 'cup'], grid);
  assert.equal(result.hits, 1); // apple
  assert.equal(result.misses, 1); // key
  assert.equal(result.falsePositives, 1); // cup
  assert.equal(result.correctRejections, 1); // chair
});

check('VisualMemoryEngine.score: perfect recognition across all trials scores near 100', () => {
  const trials = ['easy', 'medium', 'hard'].map((difficulty) => ({
    difficulty, reactionTimeMs: 8000, timedOut: false,
    hits: 5, misses: 0, falsePositives: 0, correctRejections: 3, totalTargets: 5, totalDistractors: 3,
  }));
  const result = VisualMemoryEngine.score(trials, { sessionId: 'test' });
  assert.ok(result.score > 85, `expected a high score, got ${result.score}`);
});

check('VisualMemoryEngine.score: never throws on a fully-missed session', () => {
  const trials = [{ difficulty: 'easy', reactionTimeMs: 30000, timedOut: true, hits: 0, misses: 5, falsePositives: 0, correctRejections: 3, totalTargets: 5, totalDistractors: 3 }];
  const result = VisualMemoryEngine.score(trials, { sessionId: 'test' });
  assert.ok(result.score < 50);
});

// ---------- FaceRecognitionEngine (real teammate project, face_recognition) ----------
check('FaceGenerationEngine.buildTrial: study/distractor counts match difficulty tier exactly', () => {
  for (const [difficulty, tier] of Object.entries(FACE_DIFFICULTY_TIERS)) {
    const trial = FaceGenerationEngine.buildTrial(FACE_POOL, difficulty, [], FACE_DIFFICULTY_TIERS);
    assert.equal(trial.studySet.length, tier.studyCount);
    assert.equal(trial.distractors.length, tier.distractorCount);
  }
});

check('FaceGenerationEngine.buildTrial: with a fresh (empty) excludeIds every trial, the 20-face pool never runs out -- the fix for the FACE POOL SIZE NOTE bug', () => {
  // Simulates a full demo session (1 practice + easy + medium + hard) the
  // way FaceRecognitionTask.jsx actually calls it: excludeIds always [],
  // never accumulated across trials.
  for (const difficulty of ['easy', 'easy', 'medium', 'hard']) {
    assert.doesNotThrow(() => FaceGenerationEngine.buildTrial(FACE_POOL, difficulty, [], FACE_DIFFICULTY_TIERS));
  }
});

check('FaceGenerationEngine.buildTrial: hard tier still produces valid, non-duplicate distractors now that pairGroup is null for every real photo (2026-08-17 real-photo swap -- see faceRecognitionConfig.js PAIRGROUP NOTE)', () => {
  // No pairGroup metadata to prefer anymore -- confirms the
  // preferPairedDistractor branch falls through cleanly to random selection
  // instead of throwing or silently under-filling distractors.
  for (let i = 0; i < 10; i++) {
    const trial = FaceGenerationEngine.buildTrial(FACE_POOL, 'hard', [], FACE_DIFFICULTY_TIERS);
    const studyIds = new Set(trial.studySet.map((f) => f.id));
    const distractorIds = trial.distractors.map((f) => f.id);
    assert.equal(distractorIds.length, FACE_DIFFICULTY_TIERS.hard.distractorCount);
    assert.equal(new Set(distractorIds).size, distractorIds.length, 'distractors must be unique within a trial');
    assert.ok(distractorIds.every((id) => !studyIds.has(id)), 'a distractor must never also be a studied face');
  }
});

check('FaceRecognitionValidationEngine.score: classifies hits/misses/false positives/correct rejections correctly', () => {
  const recognitionSet = [
    { id: 'face01', isTarget: true }, { id: 'face03', isTarget: true },
    { id: 'face02', isTarget: false }, { id: 'face04', isTarget: false },
  ];
  const selections = [{ id: 'face01', selectedAtMs: 1200 }, { id: 'face02', selectedAtMs: 1800 }];
  const result = FaceRecognitionValidationEngine.score(recognitionSet, selections);
  assert.equal(result.hits, 1); // face01
  assert.equal(result.misses, 1); // face03
  assert.equal(result.falsePositives, 1); // face02
  assert.equal(result.correctRejections, 1); // face04
});

check('FaceRecognitionMetricsEngine.compute: perfect recognition across all trials scores near 100', () => {
  const trials = ['easy', 'medium', 'hard'].map((difficulty) => ({
    difficulty,
    validation: { hits: 4, misses: 0, falsePositives: 0, correctRejections: 2, totalTargets: 4, totalDistractors: 2, responseTimes: [900, 950, 1000, 1050], timeouts: 0, targetOutcomes: [] },
  }));
  const metrics = FaceRecognitionMetricsEngine.compute(trials);
  assert.ok(metrics.faceRecognitionScore > 85, `expected a high score, got ${metrics.faceRecognitionScore}`);
});

check('FaceRecognitionEngine.score: never throws on a fully-missed session, and scores low', () => {
  const trials = [{
    difficulty: 'easy',
    validation: { hits: 0, misses: 4, falsePositives: 2, correctRejections: 0, totalTargets: 4, totalDistractors: 2, responseTimes: [], timeouts: 1, targetOutcomes: [] },
  }];
  const result = FaceRecognitionEngine.score(trials, { sessionId: 'test' });
  assert.ok(result.score < 40, `expected a low score, got ${result.score}`);
  assert.equal(result.severity, 'REDUCED');
});

check('delayedRecognitionMemoryConfig: ITEM_POOLS now has a real face pool (was a genuine gap -- see faceRecognitionConfig.js note)', () => {
  assert.ok(Array.isArray(DRM_ITEM_POOLS.face), 'ITEM_POOLS.face is missing -- Delayed Recognition Memory would throw on a face category');
  assert.equal(DRM_ITEM_POOLS.face.length, 20);
  assert.ok(typeof DISTRACTOR_COUNT_BY_TYPE.face === 'number');
});

check('DelayedRecognitionEngineBuilder.buildTrial: a registered "face" studySet now builds a real trial instead of throwing', () => {
  const studySet = { sourceModule: 'Face Recognition Test', itemType: 'face', items: [{ id: 'face01', wasRecognizedAtEncoding: true }, { id: 'face05', wasRecognizedAtEncoding: false }] };
  const grid = DelayedRecognitionEngineBuilder.buildTrial(studySet);
  assert.equal(grid.filter((g) => g.isTarget).length, 2);
  assert.equal(grid.filter((g) => !g.isTarget).length, DISTRACTOR_COUNT_BY_TYPE.face);
});

// ---------- DelayedRecognitionMemoryEngine (real teammate project, delayed_recognition_test) ----------
check('DelayedRecognitionEngineBuilder.buildTrial: merges real targets with fresh distractors of the same item type', () => {
  const studySet = { sourceModule: 'Visual Memory Test', itemType: 'object', items: [{ id: 'apple', wasRecognizedAtEncoding: true }, { id: 'key', wasRecognizedAtEncoding: false }] };
  const grid = DelayedRecognitionEngineBuilder.buildTrial(studySet);
  assert.equal(grid.filter((g) => g.isTarget).length, 2);
  assert.equal(grid.filter((g) => !g.isTarget).length, 4); // DISTRACTOR_COUNT_BY_TYPE.object
  assert.ok(grid.every((g) => !g.isTarget || ['apple', 'key'].includes(g.id)));
});

check('DelayedRecognitionEngineBuilder.buildTrial: throws a clear error for an unconfigured item type, never silently returns nothing', () => {
  assert.throws(() => DelayedRecognitionEngineBuilder.buildTrial({ itemType: 'nonsense', items: [] }));
});

check('DelayedRecognitionValidationEngine.validate: preserves each target\'s original wasRecognizedAtEncoding flag in targetOutcomes', () => {
  const grid = [
    { id: 'apple', isTarget: true, wasRecognizedAtEncoding: true },
    { id: 'key', isTarget: true, wasRecognizedAtEncoding: false },
    { id: 'cup', isTarget: false, wasRecognizedAtEncoding: null },
  ];
  const result = DelayedRecognitionValidationEngine.validate(['apple'], grid);
  const appleOutcome = result.targetOutcomes.find((o) => o.id === 'apple');
  const keyOutcome = result.targetOutcomes.find((o) => o.id === 'key');
  assert.equal(appleOutcome.wasRecognizedAtEncoding, true);
  assert.equal(appleOutcome.recognizedNow, true);
  assert.equal(keyOutcome.recognizedNow, false);
});

check('DelayedRecognitionMemoryEngine.score: strongly-encoded items surviving the delay score a high encodingPreservationScore', () => {
  const trialResults = [{
    itemType: 'object', sourceModule: 'Visual Memory Test', reactionTimeMs: 6000, timedOut: false,
    hits: 2, misses: 0, falsePositives: 0, correctRejections: 4, totalTargets: 2, totalDistractors: 4,
    targetOutcomes: [
      { id: 'apple', wasRecognizedAtEncoding: true, recognizedNow: true },
      { id: 'key', wasRecognizedAtEncoding: true, recognizedNow: true },
    ],
  }];
  const result = DelayedRecognitionMemoryEngine.score(trialResults, { sessionId: 'test' });
  assert.equal(result.encodingPreservationScore, 100);
  assert.equal(result.memoryDecayIndex, 0);
  assert.deepEqual(result.retrievedSourceModules, ['Visual Memory Test']);
});

check('StudyItemRegistry: register/retrieveAll/clear never throw outside a browser (no sessionStorage in Node)', () => {
  StudyItemRegistry.register({ sourceModule: 'Visual Memory Test', itemType: 'object', items: [{ id: 'apple', wasRecognizedAtEncoding: true }] });
  const all = StudyItemRegistry.retrieveAll();
  assert.ok(Array.isArray(all));
  const byType = StudyItemRegistry.retrieveByType('object');
  assert.ok(Array.isArray(byType));
  StudyItemRegistry.clear();
});

// ---------- VerbalFluencyEngine ----------
check('VerbalFluencyEngine.score: dedupes case-insensitively and trims whitespace', () => {
  const result = VerbalFluencyEngine.score(['Dog', ' dog ', 'Cat', 'DOG']);
  assert.equal(result.wordCount, 2);
});

check('VerbalFluencyEngine.score: rejects words shorter than the configured minimum length', () => {
  const result = VerbalFluencyEngine.score(['a', 'ox', 'cat']);
  assert.equal(result.wordCount, 2); // "a" is below minWordLength (2)
});

check('VerbalFluencyEngine.score: word count scales linearly toward the target, capped at 100', () => {
  const config = { timeLimitSeconds: 60, minWordLength: 2, targetWordCount: 10 };
  assert.equal(VerbalFluencyEngine.score(['a1', 'a2', 'a3', 'a4', 'a5'], config).score, 50);
  assert.equal(VerbalFluencyEngine.score(Array.from({ length: 20 }, (_, i) => `w${i}`), config).score, 100);
});

// ---------- WordListRecallEngine ----------
check('WordListRecallEngine.score: perfect recall of the full list scores 100', () => {
  const result = WordListRecallEngine.score(STUDY_WORDS);
  assert.equal(result.score, 100);
  assert.equal(result.correctCount, STUDY_WORDS.length);
});

check('WordListRecallEngine.score: is case-insensitive and ignores whitespace/duplicates', () => {
  const result = WordListRecallEngine.score([STUDY_WORDS[0].toUpperCase(), ` ${STUDY_WORDS[0]} `]);
  assert.equal(result.correctCount, 1);
});

check('WordListRecallEngine.score: intrusions (words never on the list) cost points', () => {
  const result = WordListRecallEngine.score([STUDY_WORDS[0], STUDY_WORDS[1], 'NotOnTheList']);
  assert.equal(result.correctCount, 2);
  assert.equal(result.intrusions, 1);
  assert.ok(result.score < 20); // 2/10*100=20, minus a 10-point intrusion penalty
});

check('WordListRecallEngine.score: empty recall never throws', () => {
  const result = WordListRecallEngine.score([]);
  assert.equal(result.score, 0);
});

// ---------- DelayedRecognitionEngine ----------
check('DelayedRecognitionEngine.score: perfect hits with no false alarms scores 100', () => {
  const responses = STUDY_WORDS.map((w) => ({ word: w, isStudyWord: true, markedAsSeen: true }));
  const result = DelayedRecognitionEngine.score(responses, STUDY_WORDS.length);
  assert.equal(result.score, 100);
  assert.equal(result.hits, STUDY_WORDS.length);
});

check('DelayedRecognitionEngine.score: false alarms directly cancel out hits (discrimination, not raw hit count)', () => {
  const responses = [
    { word: 'a', isStudyWord: true, markedAsSeen: true }, // hit
    { word: 'b', isStudyWord: false, markedAsSeen: true }, // false alarm
  ];
  const result = DelayedRecognitionEngine.score(responses, 10);
  assert.equal(result.score, 0); // (1-1)/10*100
});

check('DelayedRecognitionEngine.score: correctly rejecting a new word is not itself rewarded or penalized', () => {
  const responses = [{ word: 'b', isStudyWord: false, markedAsSeen: false }];
  const result = DelayedRecognitionEngine.score(responses, 10);
  assert.equal(result.correctRejections, 1);
  assert.equal(result.score, 0);
});

// ---------- NamingEngine ----------
check('NamingEngine.score: all-correct, fast responses score near 100', () => {
  const responses = [
    { item: { correctLabel: 'House' }, selectedLabel: 'House', reactionTimeMs: 1500 },
    { item: { correctLabel: 'Key' }, selectedLabel: 'Key', reactionTimeMs: 1500 },
  ];
  const result = NamingEngine.score(responses);
  assert.equal(result.accuracy, 100);
  assert.equal(result.score, 100);
});

check('NamingEngine.score: wrong picks reduce accuracy', () => {
  const responses = [
    { item: { correctLabel: 'House' }, selectedLabel: 'Boat', reactionTimeMs: 1500 },
    { item: { correctLabel: 'Key' }, selectedLabel: 'Key', reactionTimeMs: 1500 },
  ];
  const result = NamingEngine.score(responses);
  assert.equal(result.accuracy, 50);
});

check('NamingEngine.score: empty responses never throws', () => {
  assert.equal(NamingEngine.score([]).score, 0);
});

// ---------- ClockDrawingEngine ----------
check('ClockDrawingEngine.score: exact hand placement for 10:10 scores 100', () => {
  // Expected: minute=60deg, hour = 10*30 + 10*0.5 = 305deg.
  const result = ClockDrawingEngine.score({ hourAngle: 305, minuteAngle: 60 });
  assert.equal(result.score, 100);
});

check('ClockDrawingEngine.score: a hand placed 180 degrees off scores near zero for that hand', () => {
  const result = ClockDrawingEngine.score({ hourAngle: 305, minuteAngle: 240 }); // minute off by 180
  assert.equal(result.minuteScore, 0);
  assert.equal(result.hourScore, 100);
  assert.equal(result.score, 50);
});

check('ClockDrawingEngine.score: angular error wraps correctly around 0/360', () => {
  // 5deg off from 0 in either direction should read as a 5deg error, not 355.
  const result = ClockDrawingEngine.score({ hourAngle: 305, minuteAngle: 355 }, { hour: 0, minute: 0 });
  assert.ok(result.minuteError <= 5.01);
});

// ---------- CubeCopyEngine ----------
check('CubeCopyEngine.score: all correct matches scores 100', () => {
  const responses = [
    { correctVariant: 'standard', selectedVariant: 'standard' },
    { correctVariant: 'standard', selectedVariant: 'standard' },
  ];
  assert.equal(CubeCopyEngine.score(responses).score, 100);
});

check('CubeCopyEngine.score: wrong matches reduce accuracy proportionally', () => {
  const responses = [
    { correctVariant: 'standard', selectedVariant: 'standard' },
    { correctVariant: 'standard', selectedVariant: 'mirrored' },
  ];
  assert.equal(CubeCopyEngine.score(responses).score, 50);
});

// ---------- CalculationEngine ----------
check('CalculationEngine.score: correct answers (including decimals) all score 100', () => {
  const responses = CALCULATION_PROBLEMS.map((p) => ({ problem: p, submittedAnswer: String(p.answer) }));
  assert.equal(CalculationEngine.score(responses).score, 100);
});

check('CalculationEngine.score: a non-numeric or blank answer counts as incorrect, never throws', () => {
  const responses = [{ problem: CALCULATION_PROBLEMS[0], submittedAnswer: 'not a number' }];
  const result = CalculationEngine.score(responses);
  assert.equal(result.correctCount, 0);
  assert.equal(result.score, 0);
});

check('CalculationEngine.score: rounds to 2 decimals before comparing, so "7.450" matches 7.45', () => {
  const responses = [{ problem: { id: 'x', answer: 7.45 }, submittedAnswer: '7.450' }];
  assert.equal(CalculationEngine.score(responses).correctCount, 1);
});

// ---------- EmbeddedFigureEngine ----------
check('EmbeddedFigureEngine.score: all correct identifications scores 100', () => {
  const responses = EMBEDDED_FIGURE_ROUNDS.map((r) => ({ correctShapeId: r.correctShapeId, selectedShapeId: r.correctShapeId }));
  assert.equal(EmbeddedFigureEngine.score(responses).score, 100);
});

check('EmbeddedFigureEngine.score: wrong identifications reduce accuracy proportionally', () => {
  const responses = [
    { correctShapeId: 'triangle', selectedShapeId: 'triangle' },
    { correctShapeId: 'square', selectedShapeId: 'cross' },
    { correctShapeId: 'star', selectedShapeId: 'star' },
  ];
  const result = EmbeddedFigureEngine.score(responses);
  assert.equal(result.correctCount, 2);
  assert.ok(Math.abs(result.score - 66.7) < 1);
});

check('EmbeddedFigureEngine.score: empty responses never throws', () => {
  assert.equal(EmbeddedFigureEngine.score([]).score, 0);
});

check('embeddedFigureConfig: every round\'s correctShapeId is one of its own choiceOrder options', () => {
  for (const round of EMBEDDED_FIGURE_ROUNDS) {
    assert.ok(round.choiceOrder.includes(round.correctShapeId), `round ${round.id} choices missing its own correct answer`);
  }
});

// ---------- Naming item sets stay disjoint (occipital vs temporal) ----------
check('namingConfig and objectNamingConfig never show the same picture twice in one session', () => {
  const temporalIds = NAMING_ITEMS.map((i) => i.id);
  const occipitalIds = OBJECT_NAMING_ITEMS.map((i) => i.id);
  const overlap = temporalIds.filter((id) => occipitalIds.includes(id));
  assert.equal(overlap.length, 0, `overlapping picture ids: ${overlap.join(', ')}`);
});

// ObjectNamingTask reuses NamingEngine directly (see its own file header) --
// already covered by the NamingEngine checks above, so no separate engine
// test is needed here; this just confirms the item set itself is sound.
check('objectNamingConfig: every item has a correctLabel present in its own choices', () => {
  for (const item of OBJECT_NAMING_ITEMS) {
    assert.ok(item.choices.includes(item.correctLabel), `item ${item.id} missing its own correct label in choices`);
  }
});

// ---------- questionBankConfig ----------
check('questionBankConfig: every item\'s correctIndex points at a real choice in its own choices array', () => {
  for (const q of QUESTION_BANK) {
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.choices.length, `bad correctIndex on ${q.id}`);
  }
});

check('questionBankConfig: the pool has at least perLobeCount items for every lobe tag', () => {
  for (const tag of QB_LOBE_TAGS) {
    const count = QUESTION_BANK.filter((q) => q.lobeTag === tag).length;
    assert.ok(count >= QB_SELECTION_RULES.perLobeCount, `not enough ${tag}-tagged questions in the pool`);
  }
});

check('questionBankConfig: real bank matches the source spreadsheet counts exactly (100 total: 25/35/25/15)', () => {
  assert.equal(QUESTION_BANK.length, 100);
  assert.equal(QUESTION_BANK.filter((q) => q.lobeTag === 'frontal').length, 25);
  assert.equal(QUESTION_BANK.filter((q) => q.lobeTag === 'temporal').length, 35);
  assert.equal(QUESTION_BANK.filter((q) => q.lobeTag === 'parietal').length, 25);
  assert.equal(QUESTION_BANK.filter((q) => q.lobeTag === 'occipital').length, 15);
});

check('questionBankConfig: no item has duplicate choice text (would make the correct answer ambiguous)', () => {
  for (const q of QUESTION_BANK) {
    const unique = new Set(q.choices.map((c) => c.trim().toLowerCase()));
    assert.equal(unique.size, q.choices.length, `${q.id} has duplicate choice text`);
  }
});

check('questionBankConfig: every item has a unique id', () => {
  const ids = QUESTION_BANK.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

// ---------- QuestionBankEngine.selectQuestions ----------
check('QuestionBankEngine.selectQuestions: with a fixed random source, returns exactly 10 questions (2 per lobe x 4 + 2 wildcard)', () => {
  const fixedRandom = () => 0; // deterministic: every Fisher-Yates swap picks index 0
  const result = QuestionBankEngine.selectQuestions(QUESTION_BANK, fixedRandom);
  assert.equal(result.length, 10);
});

check('QuestionBankEngine.selectQuestions: every lobe tag contributes at least perLobeCount questions', () => {
  const fixedRandom = () => 0.5;
  const result = QuestionBankEngine.selectQuestions(QUESTION_BANK, fixedRandom);
  for (const tag of QB_LOBE_TAGS) {
    const count = result.filter((q) => q.lobeTag === tag).length;
    assert.ok(count >= QB_SELECTION_RULES.perLobeCount, `expected at least ${QB_SELECTION_RULES.perLobeCount} ${tag} questions, got ${count}`);
  }
  // The 2 wildcard picks land on top of the guaranteed 8, so the total
  // across all 4 lobes should be exactly 10, with 2 lobes getting a bonus.
  const total = QB_LOBE_TAGS.reduce((sum, tag) => sum + result.filter((q) => q.lobeTag === tag).length, 0);
  assert.equal(total, 10);
});

check('QuestionBankEngine.selectQuestions: never returns duplicate question ids', () => {
  const result = QuestionBankEngine.selectQuestions(QUESTION_BANK, Math.random);
  const ids = result.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

check('QuestionBankEngine.selectQuestions: real Math.random still respects the selection rules across repeated runs', () => {
  for (let i = 0; i < 20; i++) {
    const result = QuestionBankEngine.selectQuestions();
    assert.equal(result.length, 10);
  }
});

// ---------- QuestionBankEngine.score ----------
check('QuestionBankEngine.score: all-correct responses score 100', () => {
  const selected = QuestionBankEngine.selectQuestions(QUESTION_BANK, () => 0);
  const responses = selected.map((question) => ({ question, selectedIndex: question.correctIndex }));
  assert.equal(QuestionBankEngine.score(responses).score, 100);
});

check('QuestionBankEngine.score: 8 correct out of 10 scores 80', () => {
  const selected = QuestionBankEngine.selectQuestions(QUESTION_BANK, () => 0);
  const responses = selected.map((question, i) => ({
    question,
    selectedIndex: i < 8 ? question.correctIndex : (question.correctIndex + 1) % question.choices.length,
  }));
  const result = QuestionBankEngine.score(responses);
  assert.equal(result.correctCount, 8);
  assert.equal(result.score, 80);
});

check('QuestionBankEngine.score: empty responses never throws', () => {
  assert.equal(QuestionBankEngine.score([]).score, 0);
});

// ---------- AssessmentSessionModel + Question Bank folding ----------
check('AssessmentSessionModel.build: with no qbScore given, behaves exactly as before (backward compatible)', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'tokenTest', score: 90 }]);
  assert.equal(session.domainScoresRaw.attention, 90);
  assert.equal(session.questionBankScore, undefined);
});

check('AssessmentSessionModel.build: qbScore is averaged into the attention domain alongside attention-tagged lobar tasks', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'tokenTest', score: 90 }], 70);
  assert.equal(session.domainScoresRaw.attention, 80); // avg(90, 70)
  assert.equal(session.questionBankScore, 70);
});

check('AssessmentSessionModel.build: qbScore alone (no attention lobar tasks submitted) still sets the attention domain', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'stroop', score: 80 }], 60);
  assert.equal(session.domainScoresRaw.attention, 60);
  assert.equal(session.domainScoresRaw.executiveFunction, 80);
});

// 2026-08-20 REVISION: overallRawScore now averages domains, not raw task
// scores, so this test's expectation changed along with it -- see
// AssessmentSessionModel.js's 2026-08-20 comment for the full reasoning.
// qbScore still isn't diluted across ten phantom items (that bug this test
// originally guarded against is still impossible): it folds into the
// 'attention' domain as one contributor, same as before, and that domain
// then counts as exactly 1 of N domains in the composite -- never as 1 of N
// individual scores.
check('AssessmentSessionModel.build: qbScore folds into the attention domain, which then counts as one domain among others -- never diluted, never inflated', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'stroop', score: 100 }], 0);
  assert.deepEqual(session.domainScoresRaw, { executiveFunction: 100, attention: 0 });
  // Domain-equal average of [100, 0] = 50.
  assert.equal(session.overallRawScore, 50);
});

check('AssessmentSessionModel.build: an inactive/retired task in taskResults (e.g. trailMaking) never influences domainScoresRaw or overallRawScore', () => {
  // trailMaking is `active: false` in lobarTaskRegistryConfig.js, so it's
  // absent from the default registry (LOBAR_TASKS) this method aggregates
  // against. Its score should still land in lobarTaskScores (a raw
  // per-task record of whatever was submitted) but must NOT silently sway
  // the domain/overall composite -- a real inconsistency in the pre-2026-08-20
  // flat-average implementation, closed as a side effect of this fix.
  const withRetired = AssessmentSessionModel.build([{ taskId: 'stroop', score: 100 }, { taskId: 'trailMaking', score: 0 }]);
  const withoutRetired = AssessmentSessionModel.build([{ taskId: 'stroop', score: 100 }]);
  assert.equal(withRetired.lobarTaskScores.trailMaking, 0);
  assert.equal(withRetired.domainScoresRaw.processingSpeed, undefined);
  assert.equal(withRetired.overallRawScore, withoutRetired.overallRawScore);
  assert.equal(withRetired.overallRawScore, 100);
});

check('AssessmentSessionModel.build: a non-numeric qbScore (undefined/NaN) is safely ignored, never throws', () => {
  const session1 = AssessmentSessionModel.build([{ taskId: 'stroop', score: 80 }], undefined);
  const session2 = AssessmentSessionModel.build([{ taskId: 'stroop', score: 80 }], NaN);
  assert.equal(session1.questionBankScore, undefined);
  assert.equal(session2.questionBankScore, undefined);
  assert.equal(session1.overallRawScore, 80);
  assert.equal(session2.overallRawScore, 80);
});

// ---------- CognitiveScoreEngine ----------
check('CognitiveScoreEngine.compute: bands a high overall score as Excellent, with the shared disclaimer attached', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'stroop', score: 92 }], 90);
  const result = CognitiveScoreEngine.compute(session);
  assert.equal(result.band, 'Excellent');
  assert.ok(result.disclaimer.toLowerCase().includes('screening')); // sanity: real disclaimer text, not a stub
});

check('CognitiveScoreEngine.compute: bands a low overall score as Reduced', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'stroop', score: 20 }], 25);
  const result = CognitiveScoreEngine.compute(session);
  assert.equal(result.band, 'Reduced');
});

check('CognitiveScoreEngine.compute: an empty/undefined session never throws', () => {
  const result = CognitiveScoreEngine.compute(null);
  assert.equal(result.score, undefined);
  assert.equal(result.band, 'Reduced');
});

// ---------- AssessmentModeGuard (Morphy Mode 1 behavior) ----------
check('AssessmentModeGuard.shouldDefer: never defers outside a running assessment', () => {
  assert.equal(AssessmentModeGuard.shouldDefer('intro', 'scoring'), false);
  assert.equal(AssessmentModeGuard.shouldDefer('complete', 'scoring'), false);
  assert.equal(AssessmentModeGuard.shouldDefer(undefined, 'scoring'), false);
});

check('AssessmentModeGuard.shouldDefer: defers scoring/hint-adjacent categories while running', () => {
  assert.equal(AssessmentModeGuard.shouldDefer('running', 'scoring'), true);
  assert.equal(AssessmentModeGuard.shouldDefer('running', 'assessment'), true);
  assert.equal(AssessmentModeGuard.shouldDefer('running', 'education'), true);
  assert.equal(AssessmentModeGuard.shouldDefer('running', null), true); // no match / LLM fallback case
});

check('AssessmentModeGuard.shouldDefer: never defers genuinely safe categories while running', () => {
  for (const category of ASSESSMENT_MODE_SAFE_CATEGORIES) {
    assert.equal(AssessmentModeGuard.shouldDefer('running', category), false, `${category} should stay answerable mid-assessment`);
  }
});

// ---------- DoctorDashboardExportEngine ----------
check('DoctorDashboardExportEngine.buildSessionRecord: produces the exact shape mockPatients.js sessions use', () => {
  const session = AssessmentSessionModel.build(LOBAR_TASK_ORDER.map((id) => ({ taskId: id, score: 80, durationMs: 4000 })), 75);
  const cognitiveScore = CognitiveScoreEngine.compute(session);
  const record = DoctorDashboardExportEngine.buildSessionRecord(session, cognitiveScore, '2026-08-09');

  assert.equal(record.date, '2026-08-09');
  assert.equal(record.status, 'completed');
  assert.equal(typeof record.overallRawScore, 'number');
  assert.ok(record.domainScoresRaw.attention !== undefined);
  assert.ok(record.domainScoresRaw.executiveFunction !== undefined);
  // Now real domain matches -- visualMemory/delayedRecognitionMemory feed
  // these directly since the 2026-08-11 Final-8 wiring. See
  // lobarTaskRegistryConfig.js's header comment.
  assert.ok(record.domainScoresRaw.visualMemory !== undefined);
  assert.ok(record.domainScoresRaw.recognitionMemory !== undefined);
  // Honestly absent -- no currently-active task feeds processingSpeed
  // (trailMaking/objectNaming, its old sources, remain retired), and
  // language is still not measured by this app.
  assert.equal(record.domainScoresRaw.processingSpeed, undefined);
  assert.equal(record.domainScoresRaw.language, undefined);
  assert.equal(Object.keys(record.lobarTaskScores).length, 8);
});

check('DoctorDashboardExportEngine.buildSessionRecord: marks a partial (incomplete) session honestly', () => {
  const session = AssessmentSessionModel.build([{ taskId: 'stroop', score: 80 }]);
  const record = DoctorDashboardExportEngine.buildSessionRecord(session, null, '2026-08-09');
  assert.equal(record.status, 'partial');
});

check('DoctorDashboardExportEngine.buildSessionRecord: never throws on missing session/date', () => {
  assert.equal(DoctorDashboardExportEngine.buildSessionRecord(null, null, '2026-08-09'), undefined);
  assert.equal(DoctorDashboardExportEngine.buildSessionRecord({}, null, undefined), undefined);
});

console.log(`\n${passed} assertions passed.`);
