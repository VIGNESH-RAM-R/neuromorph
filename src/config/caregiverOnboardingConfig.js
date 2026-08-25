// The caregiver counterpart to onboardingConfig.js/doctorOnboardingConfig.js
// -- shown ONCE, right after signup AND after a successful invite-code link
// to a patient (see useCaregiverAuth.js), before the caregiver reaches
// their home screen. Same field-type contract OnboardingStep.jsx already
// supports -- no new component needed.
export const CAREGIVER_ONBOARDING_STEPS = [
  {
    id: 'about-you',
    title: 'About you',
    description: 'A few quick questions so the daily check-in and Morphy for Caregivers make sense for your situation.',
    fields: [
      {
        id: 'relationshipToPatient',
        label: 'Your relationship to the patient',
        type: 'select',
        required: true,
        options: ['Spouse / Partner', 'Adult child', 'Parent', 'Sibling', 'Other family member', 'Professional / Hired caregiver', 'Friend', 'Other'],
      },
      {
        id: 'location',
        label: 'Country, state, or province',
        type: 'placeAutocomplete',
        required: false,
        placeholder: 'Start typing your country or state',
      },
      {
        id: 'relationshipToPatientOther',
        label: 'If Other, please specify',
        type: 'text',
        required: false,
        placeholder: 'e.g. Neighbor',
      },
      {
        id: 'livingSituation',
        label: 'Do you live with the patient?',
        type: 'radio',
        required: true,
        options: ['Yes, full-time', 'Yes, part-time', 'No, but I visit regularly', 'No, I check in remotely'],
      },
      {
        id: 'contactNumber',
        label: 'Your phone number',
        type: 'text',
        required: true,
        placeholder: 'e.g. +91 98765 43210',
      },
      {
        id: 'caregivingExperience',
        label: 'How long have you been caregiving for this patient?',
        type: 'select',
        required: false,
        options: ['Less than 6 months', '6 months - 2 years', '2-5 years', 'More than 5 years'],
      },
    ],
  },
];

export const CAREGIVER_ONBOARDING_STEP_IDS = CAREGIVER_ONBOARDING_STEPS.map((s) => s.id);
