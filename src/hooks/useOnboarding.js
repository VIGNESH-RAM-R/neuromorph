import { useState, useCallback } from 'react';
import { ONBOARDING_STEPS } from '../config/onboardingConfig.js';
import { OnboardingEngine } from '../engines/OnboardingEngine.js';

// Orchestrates the post-signup onboarding flow: step 1 -> step 2 -> step 3
// -> complete, same "hook sequences, engine decides, component renders"
// split as useDetectionAssessment. Can also be exited early via `skip()`
// from any step -- everything but the very first field (date of birth) is
// optional, so a partial or empty profile is still an honest, valid result,
// never blocked.
//
// `steps` (2026-08-17): defaults to the patient ONBOARDING_STEPS so every
// existing call (App.jsx's useOnboarding()) is unaffected; the doctor
// onboarding flow calls useOnboarding(DOCTOR_ONBOARDING_STEPS) instead of a
// parallel hook.
export function useOnboarding(steps = ONBOARDING_STEPS) {
  const stepIds = steps.map((s) => s.id);
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [wasSkipped, setWasSkipped] = useState(false);

  const currentStepId = stepIds[stepIndex];

  const setFieldValue = useCallback((fieldId, value) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const next = useCallback(() => {
    const { valid, errors: stepErrors } = OnboardingEngine.validateStep(currentStepId, values, new Date(), steps);
    if (!valid) {
      setErrors(stepErrors);
      return false;
    }
    setErrors({});
    setStepIndex((i) => {
      const nextIndex = i + 1;
      if (nextIndex >= stepIds.length) setIsComplete(true);
      return nextIndex;
    });
    return true;
  }, [currentStepId, values, steps, stepIds]);

  const back = useCallback(() => {
    setErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => {
    setWasSkipped(true);
    setIsComplete(true);
  }, []);

  const reset = useCallback(() => {
    setStepIndex(0);
    setValues({});
    setErrors({});
    setIsComplete(false);
    setWasSkipped(false);
  }, []);

  const profile = isComplete ? OnboardingEngine.buildProfile(values) : null;

  return {
    currentStepId,
    stepNumber: stepIndex + 1,
    totalSteps: stepIds.length,
    values,
    errors,
    isComplete,
    wasSkipped,
    profile,
    setFieldValue,
    next,
    back,
    skip,
    reset,
  };
}
