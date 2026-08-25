// Mock, demo-mode caregiver record -- same "mock now, real backend later"
// convention as mockSelf.js/mockDoctor.js. Pre-linked to the same demo
// patient (Robert Hayes / NMX-2001) used throughout the rest of this app's
// mock data, so the demo caregiver account has a realistic, already-linked
// starting state instead of showing an empty "link a patient" screen.
export const MOCK_CAREGIVER = {
  name: 'Maria Hayes',
  email: 'maria.hayes@example.com',
  role: 'caregiver',

  onboardingComplete: true,
  professionalProfile: null,

  linkedPatientUid: 'MOCK-PATIENT-UID',
  linkedPatientName: 'Robert Hayes',

  onboardingProfile: {
    relationshipToPatient: 'Spouse / Partner',
    relationshipToPatientOther: '',
    livingSituation: 'Yes, full-time',
    contactNumber: '+91 98765 43211',
    caregivingExperience: '2-5 years',
  },

  today: {
    date: null,
    completion: {},
  },

  dailyHistory: [],
};
