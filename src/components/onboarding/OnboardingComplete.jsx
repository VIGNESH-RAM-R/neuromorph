// Brief, calm closing screen -- same "confirm and move on, no fanfare"
// tone as AssessmentComplete, just for the onboarding flow instead.
export default function OnboardingComplete({ wasSkipped, onContinue }) {
  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-assessment-intro">
        <p className="nmpa-eyebrow">All set</p>
        <h2 className="nmpa-card__title">
          {wasSkipped ? "No problem — you can add these details anytime." : "Thanks, that's saved."}
        </h2>
        <p className="nmpa-muted">
          {wasSkipped
            ? 'You can fill in your background details later from Settings whenever it suits you.'
            : 'This context helps your doctor read your results more accurately. You can update it anytime from Settings.'}
        </p>
        <button type="button" className="nmpa-button nmpa-button--primary" onClick={onContinue}>
          Continue to your dashboard
        </button>
      </section>
    </div>
  );
}
