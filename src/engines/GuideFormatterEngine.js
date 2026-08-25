// Turns a structured GAME_GUIDES entry into chat-ready text. Kept as its
// own pure, tiny engine rather than inline string-building in faqConfig.js
// so the same structured guide data could later drive a real in-app
// tutorial overlay -- one formatter, multiple consumers.
export const GuideFormatterEngine = {
  // Matches the system prompt's rule: "How do I play" -> numbered steps.
  formatSteps(guide) {
    const numbered = guide.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const tips = guide.tips?.length ? `\n\nTips:\n${guide.tips.map((t) => `- ${t}`).join('\n')}` : '';
    return `${guide.title} (about ${guide.durationMinutes} min)\n\n${numbered}${tips}`;
  },

  // Matches the system prompt's rule: "Explain" -> structured explanation.
  formatExplanation(guide) {
    const measures = guide.measures?.length ? guide.measures.join(', ') : 'not specified';
    return `${guide.title}: ${guide.purpose} It typically takes about ${guide.durationMinutes} minutes and measures: ${measures}.`;
  },
};
