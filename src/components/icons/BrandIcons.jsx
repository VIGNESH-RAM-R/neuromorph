// Official-shape brand marks used only on the two social login buttons.
// Facebook's is drawn here because that button is custom-styled (Facebook's
// brand guidelines permit a custom button as long as the mark and wording
// are correct). Google's button is rendered by Google's own SDK
// (useGoogleAuth.js), so no Google mark is needed here.
export function FacebookGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M13.5 21.9v-8.1h2.7l.4-3.1h-3.1V8.7c0-.9.25-1.5 1.55-1.5H16.7V4.4c-.28-.04-1.25-.12-2.38-.12-2.35 0-3.97 1.44-3.97 4.07v2.3H7.6v3.1h2.75v8.15c.53.08 1.08.13 1.65.13.53 0 1.05-.05 1.5-.11Z"
      />
    </svg>
  );
}
