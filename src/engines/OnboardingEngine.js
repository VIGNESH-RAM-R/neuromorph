import { ONBOARDING_STEPS, MIN_AGE_YEARS, MAX_AGE_YEARS } from '../config/onboardingConfig.js';

function stepDefinition(stepId, steps) {
  return steps.find((s) => s.id === stepId);
}

// Whole-years-old as of `now`, from a 'YYYY-MM-DD' date-of-birth string.
// Accounts for whether this year's birthday has happened yet, not just a
// naive year subtraction.
export function computeAge(dateOfBirth, now = new Date()) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return undefined;
  let age = now.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

// Pure validation + assembly for the post-signup onboarding flow. No
// component in this flow computes an error message or the final profile
// shape itself -- they all read from here, same "engine decides, component
// renders" split as every other module in this app.
export const OnboardingEngine = {
  // values: the answers collected so far for THIS step only, keyed by field
  // id. `steps` (2026-08-17) defaults to the patient ONBOARDING_STEPS so
  // every existing call is unaffected; the doctor onboarding flow passes
  // DOCTOR_ONBOARDING_STEPS instead of a parallel engine.
  validateStep(stepId, values = {}, now = new Date(), steps = ONBOARDING_STEPS) {
    const step = stepDefinition(stepId, steps);
    if (!step) return { valid: true, errors: {} };

    const errors = {};
    for (const field of step.fields) {
      const value = values[field.id];
      const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

      if (field.required && isEmpty) {
        errors[field.id] = `${field.label} is required.`;
        continue;
      }
      if (isEmpty) continue; // optional and skipped -- nothing more to check

      if (field.type === 'date') {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
          errors[field.id] = 'Enter a valid date.';
          continue;
        }
        if (parsed.getTime() > now.getTime()) {
          errors[field.id] = 'Date of birth cannot be in the future.';
          continue;
        }
        const age = computeAge(value, now);
        if (age < MIN_AGE_YEARS || age > MAX_AGE_YEARS) {
          errors[field.id] = `Enter a date of birth between ${MIN_AGE_YEARS} and ${MAX_AGE_YEARS} years ago.`;
        }
      }
    }
    return { valid: Object.keys(errors).length === 0, errors };
  },

  isStepComplete(stepId, values = {}, now = new Date(), steps = ONBOARDING_STEPS) {
    return OnboardingEngine.validateStep(stepId, values, now, steps).valid;
  },

  // Assembles every step's answers into the profile patch that gets merged
  // onto currentUser. `dateOfBirth` also gets a derived `age` alongside it
  // -- computed once here, not re-derived ad hoc by every screen that
  // wants to show an age.
  buildProfile(allValues = {}, now = new Date()) {
    const profile = { ...allValues, onboardingComplete: true };
    if (allValues.dateOfBirth) {
      profile.age = computeAge(allValues.dateOfBirth, now);
    }
    return profile;
  },
};
