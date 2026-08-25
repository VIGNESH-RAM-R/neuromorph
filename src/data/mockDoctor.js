// Mock, demo-mode doctor record -- same "mock now, real backend later"
// convention as mockSelf.js. Kept intentionally separate from MOCK_SELF
// (a doctor is not a patient record) even though today both are just
// in-memory objects with no real backend behind them yet.
export const MOCK_DOCTOR = {
  name: 'Dr. Alicia Chen',
  email: 'alicia.chen@example-clinic.org',
  role: 'doctor',
  doctorId: 'NMD-1001',

  // Mirrors patient onboardingComplete semantics: a fresh doctor signup
  // starts false so DoctorOnboardingStep shows once, right after signup,
  // never after a plain login.
  onboardingComplete: true,

  // Filled in by the doctor professional questionnaire
  // (doctorOnboardingConfig.js) -- present here so the "already onboarded"
  // demo doctor has realistic values instead of blanks.
  professionalProfile: {
    specialty: 'Neurology',
    specialtyOther: '',
    yearsOfPractice: '11-20 years',
    practiceSetting: 'Hospital',
    licenseRegion: 'Tamil Nadu, India',
    primaryUseCase: 'Monitoring existing patients over time',
    typicalCaseload: '31-100 patients/month',
    patientPopulation: ['Older adults (65+)', 'Adults with subjective memory complaints'],
    familiarWithScreeningTools: 'Yes, regularly',
    interestedInResearchCollaboration: 'Maybe / tell me more',
    preferredReportFormat: 'Both',
    additionalNotes: '',
  },

  // An admin-approval gate exists in the real Doctor_Dashboard app
  // (DoctorLoginScreen.jsx's footnote: "signing in doesn't automatically
  // grant patient data access"). Mirrored here as a flag so app_page's
  // doctor flow can show the same honest state rather than pretending
  // access is automatic -- see DoctorHomeSection.jsx.
  accessApproved: true,
};
