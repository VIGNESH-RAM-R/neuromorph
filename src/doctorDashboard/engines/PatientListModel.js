import { ReportModel } from './ReportModel.js';

// Builds the triage-list rows the doctor sees first. Deliberately reuses
// ReportModel.build() rather than duplicating banding/trend/adherence logic,
// so the list view and the detail view can never disagree about a patient's
// band or trend.
export const PatientListModel = {
  buildRow(patient, now = new Date()) {
    const report = ReportModel.build(patient, now);
    if (!report.hasData) {
      return {
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        hasData: false,
        dailyMomentumScore: report.dailyMomentum?.score,
        dailyMomentumDate: report.dailyMomentum?.date,
      };
    }
    return {
      patientId: report.patient.patientId,
      name: report.patient.name,
      age: report.patient.age,
      gender: report.patient.gender,
      hasData: true,
      lastAssessmentDate: report.session.date,
      overallScore: report.overallCognitive.score,
      overallBand: report.overallCognitive.band,
      trend: report.trend.overall.trend,
      riskFlagged: report.riskAlert.flagged,
      overdue: report.adherence.overdue,
      daysSinceLast: report.adherence.daysSinceLast,
      caregiverDiscordant: report.caregiverConcordance.discordant === true,
      // 2026-08-19: surfaced in the triage list too (not just the detail
      // report) so a doctor scanning many patients sees daily engagement at
      // a glance -- undefined (never a fabricated 0) for a patient with no
      // daily check-in data yet.
      dailyMomentumScore: report.dailyMomentum?.score,
      dailyMomentumDate: report.dailyMomentum?.date,
    };
  },

  buildList(patients, now = new Date()) {
    return (patients || []).map((p) => this.buildRow(p, now));
  },

  // Sort/filter helpers used by usePatientList -- kept here so the hook
  // stays a thin orchestrator and the sort/filter rules are unit-testable.
  sort(rows, sortBy = 'riskFirst') {
    const copy = [...rows];
    if (sortBy === 'riskFirst') {
      return copy.sort((a, b) => {
        if (a.riskFlagged !== b.riskFlagged) return a.riskFlagged ? -1 : 1;
        return (a.overallScore ?? 999) - (b.overallScore ?? 999);
      });
    }
    if (sortBy === 'name') {
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'recent') {
      return copy.sort((a, b) => (b.lastAssessmentDate || '').localeCompare(a.lastAssessmentDate || ''));
    }
    if (sortBy === 'overdue') {
      return copy.sort((a, b) => (b.overdue === a.overdue ? 0 : b.overdue ? 1 : -1));
    }
    return copy;
  },

  filter(rows, { band, query, riskOnly, overdueOnly } = {}) {
    return rows.filter((row) => {
      if (band && row.overallBand !== band) return false;
      if (riskOnly && !row.riskFlagged) return false;
      if (overdueOnly && !row.overdue) return false;
      if (query && !row.name.toLowerCase().includes(query.toLowerCase()) && !row.patientId.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  },
};
