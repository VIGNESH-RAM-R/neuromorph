// The post-signup "details gathering" flow -- shown ONCE, right after
// signup (never after a login), before the new patient reaches the
// dashboard. Deliberately short (3 steps) and mostly optional: this is a
// screening/wellness app used by an often-older, sometimes-anxious
// audience, not a mandatory intake form -- every step but the first can be
// skipped, and the whole flow itself can be skipped and finished later
// from Settings. Config-driven so adding/removing a field is a data
// change here, never a component rewrite (same convention as every other
// config file in this app).
//
// Field `type`s the generic OnboardingStep component knows how to render:
// 'date' | 'select' | 'checkboxGroup' | 'radio' | 'text'.
export const ONBOARDING_STEPS = [
  {
    id: 'about-you',
    title: 'A little about you',
    description: 'This helps put your results in context -- age and background both affect what a "typical" score looks like.',
    fields: [
      {
        id: 'dateOfBirth',
        label: 'Date of birth',
        type: 'date',
        required: true,
      },
      {
        id: 'location',
        label: 'Country, state, or province',
        type: 'placeAutocomplete',
        required: false,
        placeholder: 'Start typing your country or state',
      },
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        required: false,
        options: ['Male', 'Female', 'Other', 'Prefer not to say'],
      },
      {
        id: 'education',
        label: 'Highest level of education',
        type: 'select',
        required: false,
        options: ['No formal education', 'Primary school', 'Secondary / high school', 'College / university', 'Postgraduate'],
      },
      {
        id: 'dominantHand',
        label: 'Dominant hand',
        type: 'select',
        required: false,
        options: ['Right', 'Left', 'Ambidextrous'],
      },
    ],
  },
  {
    id: 'medical-background',
    title: 'Medical background',
    description: "Optional, but useful context for your doctor. Skip anything you'd rather not share.",
    fields: [
      {
        id: 'existingConditions',
        label: 'Do any of these apply to you?',
        type: 'checkboxGroup',
        required: false,
        options: ['High blood pressure', 'Diabetes', 'Heart disease or previous stroke', 'Depression or anxiety', 'None of these'],
      },
      {
        id: 'currentMedications',
        label: 'Current medications (optional)',
        type: 'text',
        required: false,
        placeholder: 'e.g. Metformin, Lisinopril',
      },
    ],
  },
  {
    id: 'family-emergency',
    title: 'Family history & emergency contact',
    description: 'Also optional. This is stored so your doctor has context, not shared anywhere else.',
    fields: [
      {
        id: 'familyHistoryDementia',
        label: 'Family history of memory problems or dementia?',
        type: 'radio',
        required: false,
        options: ['Yes', 'No', 'Not sure'],
      },
      {
        id: 'emergencyContactName',
        label: 'Emergency contact name',
        type: 'text',
        required: false,
        placeholder: 'e.g. Jane Hayes',
      },
      {
        id: 'emergencyContactRelationship',
        label: 'Relationship to you',
        type: 'text',
        required: false,
        placeholder: 'e.g. Daughter',
      },
      {
        id: 'emergencyContactPhone',
        label: 'Emergency contact phone',
        type: 'text',
        required: false,
        placeholder: 'e.g. (555) 123-4567',
      },
    ],
  },
];

export const ONBOARDING_STEP_IDS = ONBOARDING_STEPS.map((s) => s.id);

// Reasonable human-lifespan bounds for a self-reported date of birth --
// catches obvious typos (future dates, 3-digit years) without being a
// real identity-verification check.
export const MIN_AGE_YEARS = 18;
export const MAX_AGE_YEARS = 120;
