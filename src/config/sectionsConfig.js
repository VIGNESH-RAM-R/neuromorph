// The patient app's top-level navigation.
//
// My Progress contains the score trends, cognitive-domain breakdown, and
// Daily Set activity. Insights and reports stay separate because they serve
// distinct follow-up and download actions.
export const SECTIONS = [
  {
    id: 'home',
    label: 'Home',
    description: "Today's tasks, your streak, and today's Momentum Score.",
  },
  {
    id: 'assessment',
    label: 'Detection Assessment',
    description: 'Your weekly cognitive check-in -- Lobar Function Test plus 10 rotating questions.',
  },
  {
    id: 'games',
    label: 'Improvisation Games',
    description: 'Daily improvisation games -- Memory, Reaction, Attention, Speech, Facial Expressivity.',
  },
  {
    id: 'progress',
    label: 'My Progress',
    description: 'Your score trends, cognitive-domain results, and Daily Set activity in one place.',
  },
  {
    id: 'insights',
    label: 'Insights',
    description: "What's changed recently, in plain language.",
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Download a printable summary of your latest results.',
  },
  {
    id: 'morphy',
    label: 'Chat with Morphy',
    description: 'Ask Morphy anything -- doubts, help, or errors.',
  },
];

export const SECTION_KEYS = SECTIONS.map((s) => s.id);
