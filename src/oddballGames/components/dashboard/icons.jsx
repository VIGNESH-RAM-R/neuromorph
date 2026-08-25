/**
 * Small inline SVG icons for the Cognitive Dashboard's dark theme. Kept
 * framework-free and dependency-free (no icon library) — each is a tiny,
 * self-contained functional component so the dashboard doesn't need an
 * external asset for anything except the hero brain visual.
 */

export function LogoBrainIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M18 8.5c-3.6 0-6.3 2.7-6.3 6 0 .9.2 1.8.6 2.6-1.6.9-2.6 2.6-2.6 4.5 0 2.4 1.6 4.4 3.8 5.1-.1.4-.1.9-.1 1.3 0 3 2.4 5.5 5.4 5.5h.4V8.5H18z"
        fill="url(#dashLogoGradA)"
      />
      <path
        d="M22 8.5c3.6 0 6.3 2.7 6.3 6 0 .9-.2 1.8-.6 2.6 1.6.9 2.6 2.6 2.6 4.5 0 2.4-1.6 4.4-3.8 5.1.1.4.1.9.1 1.3 0 3-2.4 5.5-5.4 5.5h-.4V8.5H22z"
        fill="url(#dashLogoGradB)"
      />
      <defs>
        <linearGradient id="dashLogoGradA" x1="9" y1="8" x2="21" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="dashLogoGradB" x1="19" y1="8" x2="31" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ClipboardIcon({ color = '#fff' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke={color} strokeWidth="1.6" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" fill={color} />
      <path d="M8 11h8M8 15h8M8 19h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ color = '#fff' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke={color} strokeWidth="1.6" />
      <path d="M4 9.5h16" stroke={color} strokeWidth="1.6" />
      <path d="M8 3v3M16 3v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="13.5" r="1.1" fill={color} />
      <circle cx="12" cy="13.5" r="1.1" fill={color} />
      <circle cx="8.5" cy="17" r="1.1" fill={color} />
    </svg>
  );
}

/** Small static "trending" sparkline used inside the two summary cards. */
export function Sparkline({ color = '#38BDF8' }) {
  return (
    <svg width="90" height="40" viewBox="0 0 90 40" fill="none" aria-hidden="true">
      <polyline
        points="2,32 16,26 28,30 40,18 52,22 64,10 76,14 88,4"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function MemoryDomainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M18 8.5c-3.6 0-6.3 2.7-6.3 6 0 .9.2 1.8.6 2.6-1.6.9-2.6 2.6-2.6 4.5 0 2.4 1.6 4.4 3.8 5.1-.1.4-.1.9-.1 1.3 0 3 2.4 5.5 5.4 5.5h.4V8.5H18z"
        fill="#fff"
      />
      <path
        d="M22 8.5c3.6 0 6.3 2.7 6.3 6 0 .9-.2 1.8-.6 2.6 1.6.9 2.6 2.6 2.6 4.5 0 2.4-1.6 4.4-3.8 5.1.1.4.1.9.1 1.3 0 3-2.4 5.5-5.4 5.5h-.4V8.5H22z"
        fill="#fff"
        opacity="0.85"
      />
    </svg>
  );
}

export function AttentionDomainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12c2.8-5 6.6-7.5 10-7.5S19.2 7 22 12c-2.8 5-6.6 7.5-10 7.5S4.8 17 2 12z"
        stroke="#fff"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.4" fill="#fff" />
    </svg>
  );
}

export function ReactionDomainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 10-13h-7l1-7z" fill="#fff" />
    </svg>
  );
}

/** Large, faint decorative illustration behind the Memory card's text. */
export function MemoryIllustration() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <path
        d="M63 20c-13 0-23 10-23 22 0 3 .5 6 1.5 8.6C35.8 54.4 32 61 32 68.5c0 9 5.8 16.6 14 19.4-.4 1.6-.6 3.2-.6 5 0 11 8.8 20 19.6 20h1V20H63z"
        stroke="#C4B5FD"
        strokeWidth="1.4"
        opacity="0.55"
      />
      <path
        d="M77 20c13 0 23 10 23 22 0 3-.5 6-1.5 8.6 5.7 3.8 9.5 10.4 9.5 17.9 0 9-5.8 16.6-14 19.4.4 1.6.6 3.2.6 5 0 11-8.8 20-19.6 20h-1V20H77z"
        stroke="#A78BFA"
        strokeWidth="1.4"
        opacity="0.55"
      />
      {[
        [50, 40],
        [66, 55],
        [90, 45],
        [58, 78],
        [82, 82],
        [70, 100],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill="#C4B5FD" opacity="0.8" />
      ))}
    </svg>
  );
}

/** Large, faint radar/target illustration behind the Attention card's text. */
export function AttentionIllustration() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <circle cx="70" cy="70" r="46" stroke="#67E8F9" strokeWidth="1.3" opacity="0.35" />
      <circle cx="70" cy="70" r="30" stroke="#67E8F9" strokeWidth="1.3" opacity="0.45" />
      <circle cx="70" cy="70" r="14" stroke="#22D3EE" strokeWidth="1.5" opacity="0.6" />
      <circle cx="70" cy="70" r="3.4" fill="#22D3EE" />
      <path d="M70 24v14M70 102v14M24 70h14M102 70h14" stroke="#67E8F9" strokeWidth="1.2" opacity="0.4" />
      <circle cx="96" cy="46" r="3" fill="#22D3EE" opacity="0.85" />
      <path d="M70 70 96 46" stroke="#22D3EE" strokeWidth="1.3" opacity="0.5" />
    </svg>
  );
}

/** Large, faint speedometer illustration behind the Reaction card's text. */
export function ReactionIllustration() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <path
        d="M28 92a42 42 0 1 1 84 0"
        stroke="#93C5FD"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path d="M28 92a42 42 0 0 1 20-35.6" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      <line x1="70" y1="92" x2="46" y2="66" stroke="#60A5FA" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="70" cy="92" r="4.5" fill="#60A5FA" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const angle = Math.PI - (i / 6) * Math.PI;
        const x1 = 70 + Math.cos(angle) * 46;
        const y1 = 92 - Math.sin(angle) * 46;
        const x2 = 70 + Math.cos(angle) * 40;
        const y2 = 92 - Math.sin(angle) * 40;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#93C5FD" strokeWidth="1.6" opacity="0.5" />;
      })}
    </svg>
  );
}
