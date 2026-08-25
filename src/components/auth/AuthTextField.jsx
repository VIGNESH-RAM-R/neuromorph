import { useId } from 'react';

// A CSS-only floating-label field: the <label> is a DOM sibling right
// after <input>, and theme.css uses the `:focus` / `:not(:placeholder-shown)`
// pattern to animate it -- no JS state needed just to float a label.
export default function AuthTextField({
  icon,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  autoFocus,
  rightSlot,
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={`nmpa-field2 ${error ? 'nmpa-field2--error' : ''}`}>
      <div className="nmpa-field2__control">
        {icon && <span className="nmpa-field2__icon">{icon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <label htmlFor={id}>{label}</label>
        {rightSlot}
      </div>
      {error && (
        <span id={errorId} className="nmpa-field2__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
