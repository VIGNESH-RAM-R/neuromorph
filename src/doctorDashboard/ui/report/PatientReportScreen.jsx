import { usePatientReport } from '../../hooks/usePatientReport.js';
import { useCaregiverResponses } from '../../hooks/useCaregiverResponses.js';
import PatientOverviewCard from './PatientOverviewCard.jsx';
import DailyMomentumCard from './DailyMomentumCard.jsx';
import OverallCognitiveSummaryCard from './OverallCognitiveSummaryCard.jsx';
import CognitiveDomainAnalysis from './CognitiveDomainAnalysis.jsx';
import LobarFunctionAnalysis from './LobarFunctionAnalysis.jsx';
import VisualMemoryReportCard from './VisualMemoryReportCard.jsx';
import SpeechAssessmentCard from './SpeechAssessmentCard.jsx';
import QuestionnaireSummaryCard from './QuestionnaireSummaryCard.jsx';
import LongitudinalProgressSection from './LongitudinalProgressSection.jsx';
import TrendIntelligencePanel from './TrendIntelligencePanel.jsx';
import NetworkCoherencePanel from './NetworkCoherencePanel.jsx';
import CaregiverConcordancePanel from './CaregiverConcordancePanel.jsx';
import CaregiverResponsesPanel from './CaregiverResponsesPanel.jsx';
import ClinicalObservationsPanel from './ClinicalObservationsPanel.jsx';
import ClinicalRecommendationsCard from './ClinicalRecommendationsCard.jsx';
import DownloadReportButton from './DownloadReportButton.jsx';
import AdvancedAnalyticsPanel from './AdvancedAnalyticsPanel.jsx';
import PrintableReport from './PrintableReport.jsx';
import EmptyState from '../shared/EmptyState.jsx';

export default function PatientReportScreen({ patientId, onBack, patients, currentUser }) {
  const { report, addClinicalNote, isSavingNote, noteError, exportPdf, isPrinting } = usePatientReport(patientId, patients, currentUser);
  // 2026-08-25 ADDITION -- same read CaregiverResponsesPanel below uses,
  // fetched once here too so PrintableReport (the actual PDF/print output)
  // gets the caregiver's real weekly/daily responses, not just the
  // condensed one-line concern summary it had before (VR: "visit the
  // patients and the caregiver responses in the same pdf").
  const caregiverState = useCaregiverResponses(patientId);

  if (!patientId) {
    return <EmptyState title="No patient selected" message="Choose a patient from the list to view their report." />;
  }
  if (!report || !report.hasData) {
    return <EmptyState title="No assessment data yet" message="This patient has not completed an assessment session." />;
  }

  return (
    <>
      <div className="nmdd-report nmdd-screen-only">
        <div className="nmdd-report__topbar">
          <button type="button" className="nmdd-link" onClick={onBack}>&larr; Back to patient list</button>
          <DownloadReportButton onExport={exportPdf} isPrinting={isPrinting} />
        </div>

        <PatientOverviewCard report={report} />
        <DailyMomentumCard dailyMomentum={report.dailyMomentum} />
        <OverallCognitiveSummaryCard report={report} />
        <CognitiveDomainAnalysis domains={report.domains} />
        <LobarFunctionAnalysis lobes={report.lobes} />

        <div className="nmdd-report__row">
          <VisualMemoryReportCard visualMemory={report.visualMemory} />
          <SpeechAssessmentCard speech={report.speech} />
        </div>

        <QuestionnaireSummaryCard questionnaire={report.questionnaire} caregiverConcordance={report.caregiverConcordance} />
        <CaregiverConcordancePanel caregiverConcordance={report.caregiverConcordance} />
        <CaregiverResponsesPanel patientId={patientId} />
        <LongitudinalProgressSection report={report} />
        <TrendIntelligencePanel trendIntelligence={report.trendIntelligence} />
        <NetworkCoherencePanel networkCoherence={report.networkCoherence} />
        <ClinicalObservationsPanel
          notes={report.clinicalNotes}
          onAddNote={addClinicalNote}
          notesLoadError={report.notesError}
          isSaving={isSavingNote}
          saveError={noteError}
        />
        <ClinicalRecommendationsCard recommendations={report.recommendations} />
        <AdvancedAnalyticsPanel hiddenAnalytics={report.hiddenAnalytics} />
      </div>

      {/* Rendered as a sibling, not a child, of the screen-only wrapper so
          print.css can hide .nmdd-screen-only and still show this. */}
      <PrintableReport report={report} caregiver={caregiverState.status === 'ready' ? caregiverState.caregiver : null} />
    </>
  );
}
