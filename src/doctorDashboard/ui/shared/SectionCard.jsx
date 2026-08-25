export default function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`nmdd-card ${className}`}>
      {(title || actions) && (
        <header className="nmdd-card__header">
          <div>
            {title && <h2 className="nmdd-card__title">{title}</h2>}
            {subtitle && <p className="nmdd-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="nmdd-card__actions">{actions}</div>}
        </header>
      )}
      <div className="nmdd-card__body">{children}</div>
    </section>
  );
}
