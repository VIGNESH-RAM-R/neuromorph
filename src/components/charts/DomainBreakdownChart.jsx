const BAND_CLASS = {
  Excellent: 'is-excellent',
  Normal: 'is-normal',
  'Mildly Reduced': 'is-mild',
  Reduced: 'is-reduced',
};

function DeltaPill({ percentChange, direction }) {
  if (typeof percentChange !== 'number') {
    return <span className="nmpa-domain-delta is-flat">First reading</span>;
  }
  const sign = percentChange > 0 ? '+' : '';
  return (
    <span className={`nmpa-domain-delta is-${direction}`}>
      {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '–'} {sign}{percentChange}%
    </span>
  );
}

// Horizontal bar breakdown, one row per cognitive domain -- score, its
// non-diagnostic performance band (color-coded, same bands as everywhere
// else in the app), and a percent-change-from-last-assessment pill. Domains
// with no active source task yet (see domainInsightConfig.js) render as a
// disabled "not measured yet" row instead of being silently omitted.
//
// 2026-08-21: each row fades/rises in on mount (same nmpa-anim-fade-up
// pattern as every card list elsewhere), and a row with real data also
// gets its bar-fill grow in sync (same --nmpa-anim-delay value passed to
// both, via theme.css's nmpa-bar-grow keyframe) -- the row and its bar
// land together rather than the bar looking like an afterthought.
export default function DomainBreakdownChart({ domains = [], pendingDomains = [] }) {
  return (
    <div className="nmpa-domain-breakdown">
      {domains.map((d, i) => {
        const delay = `${i * 70}ms`;
        return (
        <div key={d.domain} className="nmpa-domain-row nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': delay }}>
          <div className="nmpa-domain-row__label">
            <span>{d.label}</span>
            {d.hasData && <span className={`nmpa-domain-band ${BAND_CLASS[d.band] || ''}`}>{d.band}</span>}
          </div>
          {d.hasData ? (
            <>
              <div className="nmpa-domain-bar">
                <div
                  className={`nmpa-domain-bar__fill ${BAND_CLASS[d.band] || ''}`}
                  style={{ width: `${Math.max(4, Math.min(100, d.latestScore))}%`, '--nmpa-anim-delay': delay }}
                />
              </div>
              <div className="nmpa-domain-row__meta">
                <span className="nmpa-domain-score">{d.latestScore}/100</span>
                <DeltaPill percentChange={d.percentChange} direction={d.direction} />
              </div>
            </>
          ) : (
            <p className="nmpa-muted nmpa-muted--sm">No data yet.</p>
          )}
        </div>
        );
      })}

      {pendingDomains.length > 0 && (
        <div className="nmpa-domain-pending">
          <p className="nmpa-muted nmpa-muted--sm">
            Not measured yet (no active task feeds these domains): {pendingDomains.map((d) => d.label).join(', ')}.
          </p>
        </div>
      )}
    </div>
  );
}
