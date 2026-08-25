// Dependency-free inline SVG icons, same "no icon library" convention as
// every other NEUROMORPH module's charts. Simple, single-stroke, calm --
// no fills, no color beyond `currentColor` so they inherit the nav item's
// active/inactive color automatically.
const PATHS = {
  home: 'M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9',
  assessment: 'M8 4h8a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm2 5h4M10 12h4M10 15h2',
  games: 'M4 5h7v7H4V5Zm9 0h7v7h-7V5ZM4 14h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  progress: 'M4 20V10m6 10V4m6 16v-7m6 7V8',
  domains: 'M12 3v18M3 12h18M6 6l12 12M18 6 6 18',
  activity: 'M4 19V9m4 10V5m4 14v-8m4 8V4m4 15v-6',
  insights: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v.5h6v-.5c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3Z',
  reports: 'M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v4h4M9 13h6M9 16h6M9 10h2',
  morphy: 'M12 3c-4.4 0-8 3.1-8 7 0 2.5 1.4 4.6 3.5 5.9L7 20l3.6-1.6c.5.1.9.1 1.4.1 4.4 0 8-3.1 8-7s-3.6-7-8-7Z',
};

export default function SectionIcon({ id, size = 18 }) {
  const d = PATHS[id];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
