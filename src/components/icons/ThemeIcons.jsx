// Small, dependency-free inline icons -- no icon library in this project
// (see package.json), so anything visual is a hand-written SVG, same
// pattern as every other icon in this codebase (SectionIcon.jsx).
export function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
      </g>
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20.2 14.6A8.5 8.5 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
