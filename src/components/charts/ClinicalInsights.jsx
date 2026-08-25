// Plain-language, non-diagnostic callouts derived from DomainInsightEngine
// -- notable declines/improvements and low-band domains. Always non-empty:
// even with nothing to flag, it says so explicitly rather than rendering
// blank (a blank card reads as broken, not as "everything's fine").
//
// 2026-08-21: each flagged item fades/rises in with a slight stagger (same
// nmpa-anim-fade-up pattern as everywhere else), including the "all clear"
// state -- it's still a real piece of content appearing, not a static label.
export default function ClinicalInsights({ insights }) {
  const items = insights?.items || [];
  return (
    <div className="nmpa-insights">
      {items.length === 0 ? (
        <div className="nmpa-alert nmpa-alert--info nmpa-anim-fade-up" style={{ '--nmpa-anim-delay': '0ms' }}>
          <span>No notable changes flagged this period -- performance is holding steady across measured domains.</span>
        </div>
      ) : (
        items.map((item, i) => (
          <div key={i} className={`nmpa-alert nmpa-alert--${item.level} nmpa-anim-fade-up`} style={{ '--nmpa-anim-delay': `${i * 70}ms` }}>
            <span>{item.text}</span>
          </div>
        ))
      )}
      <p className="nmpa-muted nmpa-muted--sm nmpa-insights__disclaimer">{insights?.disclaimer}</p>
    </div>
  );
}
