export default function AuthDivider({ label = 'or' }) {
  return (
    <div className="nmpa-auth-divider" role="separator">
      <span />
      <p>{label}</p>
      <span />
    </div>
  );
}
