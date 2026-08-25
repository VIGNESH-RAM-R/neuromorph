export default function EmptyState({ title, message }) {
  return (
    <div className="nmdd-empty">
      <p className="nmdd-empty__title">{title}</p>
      {message && <p className="nmdd-empty__message">{message}</p>}
    </div>
  );
}
