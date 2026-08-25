import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './styles/theme.css';
import './styles/print.css';

// 2026-08-21: ErrorBoundary wraps the whole app at the single root render
// point -- catches an uncaught error from ANY of App.jsx's branches
// (patient/doctor/caregiver, any screen) without needing a separate
// boundary per branch. See ErrorBoundary.jsx for why it's self-contained
// rather than reading language/state from App.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// 2026-08-20: PWA service worker registration (see public/sw.js for the
// caching strategy and reasoning). Guarded by feature detection and
// `location.protocol !== 'file:'` -- the same file-protocol check
// index.html already does for its own warning banner, since
// serviceWorker.register() throws on file:// anyway. Registered after
// `load` so it never competes with the initial render for bandwidth/CPU.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is a progressive enhancement, not a requirement --
      // a failed registration (unsupported browser quirk, dev server
      // oddity) should never block or break the app itself.
    });
  });
}
