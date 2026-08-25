/**
 * The screen shown after opening a domain from the dashboard: its 2 games,
 * each keeping its own working "Launch Assessment" button (or a "Coming
 * soon" badge for a slot that isn't built yet) — unchanged navigation
 * behavior, restyled to match the dark dashboard theme instead of the old
 * plain white cards.
 */
export default function DomainDetail({ domain, launchHandlers, onBack }) {
  return (
    <section className="dash-detail">
      <button type="button" className="dash-back-btn" onClick={onBack}>
        &larr; Go Back
      </button>

      <h2 className="dash-detail-heading">{domain.name}</h2>

      <div className="dash-detail-games">
        {domain.games.map((game) => (
          <div
            key={game.key}
            className={`dash-detail-card${game.available ? ' dash-detail-card--available' : ''}`}
          >
            <span className="dash-detail-game-name">{game.module}</span>
            <p className="dash-detail-game-desc">{game.description}</p>
            {game.available ? (
              <button
                type="button"
                className="oddball-btn oddball-btn--primary"
                onClick={launchHandlers[game.launchKey]}
              >
                Launch Assessment
              </button>
            ) : (
              <span className="dash-detail-badge">Coming soon</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
