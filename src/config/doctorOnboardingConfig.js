// The doctor counterpart to onboardingConfig.js -- shown ONCE, right after
// a clinician signup (never after a plain login), before they reach the
// doctor home. Same field-type contract as OnboardingStep.jsx already
// supports (date/text/select/radio/checkboxGroup) -- no new component
// needed, this is a pure config addition. select/radio "Other" options are
// paired with an adjacent optional free-text field wherever "please
// specify" makes sense, rather than teaching OnboardingStep a new
// conditional-field type just for this.
//
// 2026-08-19: originally only 2 of 12 questions were required (specialty,
// primaryUseCase) -- per direct request to know clinicians better up
// front, 3 existing fields (yearsOfPractice, practiceSetting,
// typicalCaseload) are now required, and one new required field
// (workContact) was added, since there was previously no way to reach a
// doctor account outside the app itself. 13 fields total then.
//
// 2026-08-21: licenseRegion turned from an optional free-text field into a
// required field backed by a live Google Places search (see that field's
// own comment below for the full story). 13 fields, 7 required, now.
export const DOCTOR_ONBOARDING_STEPS = [
  {
    id: 'professional-background',
    title: 'Your professional background',
    description: "This tailors what the clinical assistant shows you -- skip anything you'd rather answer later.",
    fields: [
      {
        id: 'specialty',
        label: 'Medical specialty',
        type: 'select',
        required: true,
        options: ['Neurology', 'Geriatrics / Geriatric Medicine', 'Psychiatry', 'General / Family Medicine', 'Internal Medicine', 'Neuropsychology', 'Other'],
      },
      {
        id: 'specialtyOther',
        label: 'If Other, please specify',
        type: 'text',
        required: false,
        placeholder: 'e.g. Behavioral Neurology',
      },
      {
        id: 'yearsOfPractice',
        label: 'Years in practice',
        type: 'select',
        required: true,
        options: ['Less than 2 years', '2-5 years', '6-10 years', '11-20 years', 'More than 20 years'],
      },
      {
        id: 'practiceSetting',
        label: 'Primary practice setting',
        type: 'select',
        required: true,
        options: ['Hospital', 'Private clinic', 'Academic / Teaching hospital', 'Community health center', 'Telehealth / Remote', 'Other'],
      },
      {
        id: 'practiceSettingOther',
        label: 'If Other, please specify',
        type: 'text',
        required: false,
        placeholder: 'e.g. Home-visit practice',
      },
      {
        // 2026-08-21 (first pass): was a free-text field, briefly became a
        // static India-only state/UT dropdown.
        // 2026-08-21 (revised, same day): replaced with a live worldwide
        // place search (Google Places Autocomplete -- see
        // PlaceAutocompleteField.jsx / GOOGLE_PLACES_SETUP.md), covering
        // every real country and its states/provinces/cities, not just a
        // hand-typed India-only list -- typing "Bangalore" now offers the
        // real "Bengaluru, Karnataka, India" the same way Google Maps'
        // own search does. Gracefully falls back to a plain text field if
        // no API key is configured, so the form never breaks. No paired
        // "Other" field needed anymore -- a live worldwide search has no
        // "Other" case left to cover.
        id: 'licenseRegion',
        label: 'Medical license region (city, state, or country)',
        type: 'placeAutocomplete',
        required: true,
        placeholder: 'e.g. Bangalore, Karnataka',
      },
      {
        id: 'workContact',
        label: 'Work phone or clinic email',
        type: 'text',
        required: true,
        placeholder: 'e.g. +91 98765 43210 or clinic@example.com',
      },
    ],
  },
  {
    id: 'how-you-plan-to-use-neuromorph',
    title: 'How you plan to use NEUROMORPH',
    description: 'Also optional, except the first two. This helps the clinical assistant give more relevant answers.',
    fields: [
      {
        id: 'primaryUseCase',
        label: 'Primary reason for using NEUROMORPH',
        type: 'radio',
        required: true,
        options: ['Screening new patients', 'Monitoring existing patients over time', 'Research / academic use', 'Training / educational use'],
      },
      {
        id: 'typicalCaseload',
        label: 'Typical patient caseload',
        type: 'select',
        required: true,
        options: ['1-10 patients/month', '11-30 patients/month', '31-100 patients/month', '100+ patients/month'],
      },
      {
        id: 'patientPopulation',
        label: 'Which populations do you typically see? (select all that apply)',
        type: 'checkboxGroup',
        required: false,
        options: ['Older adults (65+)', 'Adults with subjective memory complaints', 'Post-stroke patients', 'Patients with a known neurodegenerative disease', 'General primary-care population', 'Other'],
      },
      {
        id: 'familiarWithScreeningTools',
        label: 'How familiar are you with digital cognitive screening tools?',
        type: 'radio',
        required: false,
        options: ['Yes, regularly', 'Yes, occasionally', 'No, this is new to me'],
      },
      {
        id: 'interestedInResearchCollaboration',
        label: 'Interested in research collaboration with the NEUROMORPH team?',
        type: 'radio',
        required: false,
        options: ['Yes', 'No', 'Maybe / tell me more'],
      },
      {
        id: 'preferredReportFormat',
        label: 'Preferred patient report format',
        type: 'select',
        required: false,
        options: ['PDF summary', 'Detailed domain breakdown', 'Both'],
      },
    ],
  },
];

export const DOCTOR_ONBOARDING_STEP_IDS = DOCTOR_ONBOARDING_STEPS.map((s) => s.id);
