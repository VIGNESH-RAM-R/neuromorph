import { ONBOARDING_STEPS } from '../../config/onboardingConfig.js';
import PlaceAutocompleteField from './PlaceAutocompleteField.jsx';

// One generic, config-driven step renderer for the whole onboarding flow --
// the field TYPES it knows how to draw (date/text/select/radio/
// checkboxGroup) are fixed, but which fields appear, in what order, with
// what labels/options, is entirely data from onboardingConfig.js. Adding a
// field later is a config change, not a new component.
//
// `steps` (2026-08-17): defaults to the patient ONBOARDING_STEPS so every
// existing call site is unaffected, but can be overridden -- the doctor
// onboarding flow (DoctorOnboardingStep.jsx) passes
// DOCTOR_ONBOARDING_STEPS through this same renderer instead of forking a
// near-identical component.
export default function OnboardingStep({ stepId, values, errors, onFieldChange, onNext, onBack, onSkip, stepNumber, totalSteps, steps = ONBOARDING_STEPS }) {
  const step = steps.find((s) => s.id === stepId);
  if (!step) return null;

  function toggleCheckboxOption(fieldId, option, checked) {
    const current = values[fieldId] || [];
    onFieldChange(fieldId, checked ? [...current, option] : current.filter((v) => v !== option));
  }

  return (
    <div className="nmpa-section">
      <section className="nmpa-card nmpa-onboarding">
        <p className="nmpa-eyebrow">Step {stepNumber} of {totalSteps}</p>
        <div className="nmpa-onboarding__progress" aria-hidden="true">
          <div className="nmpa-onboarding__progress-fill" style={{ width: `${Math.round((stepNumber / totalSteps) * 100)}%` }} />
        </div>
        <h2 className="nmpa-card__title">{step.title}</h2>
        <p className="nmpa-muted">{step.description}</p>

        <div className="nmpa-form">
          {step.fields.map((field) => (
            <div key={field.id} className="nmpa-field">
              <span>{field.label}{field.required ? ' *' : ''}</span>

              {field.type === 'date' && (
                <input
                  type="date"
                  value={values[field.id] || ''}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  aria-invalid={Boolean(errors[field.id])}
                />
              )}

              {field.type === 'text' && (
                <input
                  type="text"
                  value={values[field.id] || ''}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(errors[field.id])}
                />
              )}

              {field.type === 'placeAutocomplete' && (
                <PlaceAutocompleteField
                  value={values[field.id] || ''}
                  onChange={(v) => onFieldChange(field.id, v)}
                  placeholder={field.placeholder}
                  ariaInvalid={Boolean(errors[field.id])}
                />
              )}

              {field.type === 'select' && (
                <select
                  value={values[field.id] || ''}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  aria-invalid={Boolean(errors[field.id])}
                >
                  <option value="">Select…</option>
                  {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}

              {field.type === 'radio' && (
                <div className="nmpa-radio-group" role="radiogroup" aria-label={field.label}>
                  {field.options.map((opt) => (
                    <label key={opt} className="nmpa-radio-option">
                      <input type="radio" name={field.id} checked={values[field.id] === opt} onChange={() => onFieldChange(field.id, opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'checkboxGroup' && (
                <div className="nmpa-checkbox-group" role="group" aria-label={field.label}>
                  {field.options.map((opt) => (
                    <label key={opt} className="nmpa-checkbox-option">
                      <input
                        type="checkbox"
                        checked={(values[field.id] || []).includes(opt)}
                        onChange={(e) => toggleCheckboxOption(field.id, opt, e.target.checked)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {errors[field.id] && <span className="nmpa-field__error">{errors[field.id]}</span>}
            </div>
          ))}
        </div>

        <div className="nmpa-onboarding__actions">
          {stepNumber > 1 && (
            <button type="button" className="nmpa-button nmpa-button--secondary" onClick={onBack}>Back</button>
          )}
          <button type="button" className="nmpa-button nmpa-button--primary" onClick={onNext}>
            {stepNumber === totalSteps ? 'Finish' : 'Next'}
          </button>
          <button type="button" className="nmpa-link nmpa-onboarding__skip" onClick={onSkip}>Skip for now</button>
        </div>
      </section>
    </div>
  );
}
