const DOMAIN_LABELS = {
  memory: 'Memory',
  attention: 'Attention',
  reaction: 'Reaction',
  speech: 'Speech',
  facialExpressivity: 'Facial Expressivity',
};

const LIFESTYLE_SUGGESTIONS = [
  'Keeping a consistent sleep schedule.',
  'Regular physical activity, even light daily walking.',
  'Staying socially engaged -- conversation and social activity are themselves a form of cognitive exercise.',
  'Managing stress, since fatigue and stress can affect performance on tasks like these independent of anything else.',
];

const CLINICIAN_QUESTIONS = [
  'Does this trend, on its own, warrant further evaluation?',
  'Are there other factors (medications, sleep, mood) that could explain this result?',
  'Would a more comprehensive in-person assessment be worthwhile?',
];

// Generates the 6-part explanation the system prompt's PDF Analysis Mode
// requires (Summary, domain-by-domain, positive observations, areas
// needing attention, lifestyle suggestions, clinician questions), running
// entirely locally so this works even when the live AI fallback is
// disabled -- no field is ever guessed; anything not extracted from the
// report is stated as unavailable, never invented.
export const ReportExplanationEngine = {
  explain(report) {
    if (!report || report.isEmpty) {
      return "I wasn't able to find recognizable NEUROMORPH report fields in that PDF. This may be a different document, an image-only scan, or a report format I don't recognize yet -- I haven't guessed at any values. If you tell me what it says, I'm happy to help explain it.";
    }

    const parts = [];

    // 1. Summary
    const dateText = report.assessmentDate || 'an unspecified date';
    const scoreText = report.overallCognitiveScore !== null ? `an overall Cognitive Score of ${report.overallCognitiveScore}/100` : 'an overall Cognitive Score that wasn\'t clearly readable in this file';
    const bandText = report.detectionBand ? `, with a Detection Score band of ${report.detectionBand.replace('_', ' ')}` : '';
    parts.push(`Summary: This report suggests an assessment from ${dateText}, with ${scoreText}${bandText}.`);

    // 2. Domain-by-domain
    const domainLines = Object.entries(report.domainScores || {})
      .map(([key, value]) => `${DOMAIN_LABELS[key] || key}: ${value !== null ? `${value}/100` : 'not available in this report'}`)
      .join('\n');
    parts.push(`Domain-by-domain:\n${domainLines}`);

    // 3. Positive observations
    const strong = Object.entries(report.domainScores || {}).filter(([, v]) => typeof v === 'number' && v >= 75);
    parts.push(
      strong.length
        ? `Positive observations: ${strong.map(([k]) => DOMAIN_LABELS[k] || k).join(', ')} scored in a solidly normal range in this report.`
        : 'Positive observations: completing a regular assessment at all is itself a meaningful positive -- consistency is what makes any of this data useful.'
    );

    // 4. Areas needing attention
    const weak = Object.entries(report.domainScores || {}).filter(([, v]) => typeof v === 'number' && v < 60);
    parts.push(
      weak.length
        ? `Areas needing attention: ${weak.map(([k]) => DOMAIN_LABELS[k] || k).join(', ')} may indicate something worth keeping an eye on over the next few sessions, rather than a one-off concern.`
        : 'Areas needing attention: nothing in this report stands out as reduced on its own -- this assessment can help identify areas for further evaluation over time, not from a single reading.'
    );

    // 5. Lifestyle suggestions
    parts.push(`Lifestyle suggestions:\n${LIFESTYLE_SUGGESTIONS.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);

    // 6. Questions to ask a clinician
    parts.push(`Questions to ask a clinician:\n${CLINICIAN_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join('\n')}`);

    parts.push(
      'This is not a diagnosis, and none of this replaces a conversation with a qualified healthcare professional -- especially if anything here concerns you.'
    );

    return parts.join('\n\n');
  },
};
