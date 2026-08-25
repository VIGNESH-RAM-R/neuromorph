import { useState } from 'react';
import AuthTextField from './AuthTextField.jsx';
import { EyeIcon, EyeOffIcon, LockIcon } from '../icons/FormIcons.jsx';

export default function PasswordField({ label, value, onChange, onBlur, error, autoComplete, autoFocus }) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthTextField
      icon={<LockIcon />}
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      rightSlot={
        <button
          type="button"
          className="nmpa-field2__toggle"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
