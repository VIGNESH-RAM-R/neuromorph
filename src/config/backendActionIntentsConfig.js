// Same shape as FAQ_ENTRIES (id/question/keywords) so FaqMatcherEngine can
// score these identically -- but instead of a static `answer`, each entry
// carries an `action` name. ConversationEngine checks which field the
// winning entry has and routes accordingly: `answer` -> instant text,
// `action` -> BackendActionEngine.execute() against MockBackendService
// (see README for the real-backend swap-in point).
//
// These map onto the spec's PROGRESS QUESTIONS and REPORTS sections --
// intentionally NOT answered from the static FAQ, since they're
// necessarily about a specific user's live data, not a fixed fact about
// how the app works.
export const BACKEND_ACTION_INTENTS = [
  {
    id: 'progress-completed',
    question: 'How much have I completed?',
    keywords: ['how much have i completed', 'my progress', 'completed assessments', 'how many done'],
    action: 'GET_PROGRESS',
  },
  {
    id: 'progress-remaining',
    question: 'Which assessments remain?',
    keywords: ['which assessments remain', 'whats left', 'remaining assessments', 'what do i still need to do'],
    action: 'GET_PROGRESS',
  },
  {
    id: 'progress-streak',
    question: "What's my current streak?",
    keywords: ['my streak', 'current streak', 'how many days in a row', 'streak count'],
    action: 'GET_PROGRESS',
  },
  {
    id: 'progress-total',
    question: 'How many total assessments have I done?',
    keywords: ['total assessments', 'how many assessments all time', 'lifetime assessments'],
    action: 'GET_PROGRESS',
  },
  {
    id: 'progress-percentage',
    question: "What's my current progress percentage?",
    keywords: ['progress percentage', 'adherence percentage', 'completion rate'],
    action: 'GET_PROGRESS',
  },
  {
    id: 'progress-last-assessment',
    question: 'When was my last assessment?',
    keywords: ['last assessment', 'most recent assessment', 'when did i last do this'],
    action: 'GET_REPORT',
  },
  {
    id: 'progress-highest-score',
    question: 'What was my highest score?',
    keywords: ['highest score', 'best score', 'top score'],
    action: 'GET_REPORT',
  },
  {
    id: 'report-explain',
    question: 'Explain my report',
    keywords: ['explain my report', 'explain my score', 'what does my report say', 'my results'],
    action: 'GET_REPORT',
  },
  {
    id: 'report-which-game-needs-improvement',
    question: 'Which game needs improvement?',
    keywords: ['which game needs improvement', 'weakest area', 'lowest score', 'what should i work on'],
    action: 'GET_REPORT',
  },
  {
    id: 'report-download',
    question: 'Download my report',
    keywords: ['download my report', 'download pdf', 'export my report', 'get pdf'],
    action: 'DOWNLOAD_REPORT',
  },
  {
    id: 'report-share',
    question: 'Share my report',
    keywords: ['share my report', 'send report to doctor', 'share results'],
    action: 'SHARE_REPORT',
  },
  {
    id: 'report-compare',
    question: 'Compare my reports',
    keywords: ['compare my reports', 'compare scores', 'how have i changed', 'progress over time'],
    action: 'COMPARE_REPORTS',
  },
  {
    id: 'app-version',
    question: 'What version is this app?',
    keywords: ['app version', 'current version', 'what version am i on'],
    action: 'GET_CURRENT_VERSION',
  },
  {
    id: 'app-update',
    question: 'Is there an update available?',
    keywords: ['update available', 'check for update', 'new version'],
    action: 'CHECK_UPDATE',
  },
  {
    id: 'app-sync',
    question: 'Sync my data now',
    keywords: ['sync my data', 'sync now', 'force sync'],
    action: 'SYNC_DATA',
  },
];
