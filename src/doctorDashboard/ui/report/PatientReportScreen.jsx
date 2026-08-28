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
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

export default function PatientReportScreen({ patientId, onBack, patients, currentUser, language = DEFAULT_LANGUAGE }) {
  const { report, addClinicalNote, isSavingNote, noteError, exportPdf, isPrinting } = usePatientReport(patientId, patients, currentUser);
  // 2026-08-25 ADDITION -- same read CaregiverResponsesPanel below uses,
  // fetched once here too so PrintableReport (the actual PDF/print output)
  // gets the caregiver's real weekly/daily responses, not just the
  // condensed one-line concern summary it had before (VR: "visit the
  // patients and the caregiver responses in the same pdf").
  const caregiverState = useCaregiverResponses(patientId);

  if (!patientId) {
    return <EmptyState title={t(language, 'noPatientSelectedTitle')} message={t(language, 'noPatientSelectedMessage')} />;
  }
  if (!report || !report.hasData) {
    return <EmptyState title={t(language, 'noAssessmentDataTitle')} message={t(language, 'noAssessmentDataMessage')} />;
  }

  return (
    <>
      <div className="nmdd-report nmdd-screen-only">
        <div className="nmdd-report__topbar">
          <button type="button" className="nmdd-link" onClick={onBack}>&larr; {t(language, 'backToPatientList')}</button>
          <DownloadReportButton onExport={exportPdf} isPrinting={isPrinting} language={language} />
        </div>

        <PatientOverviewCard report={report} language={language} />
        <DailyMomentumCard dailyMomentum={report.dailyMomentum} language={language} />
        <OverallCognitiveSummaryCard report={report} language={language} />
        <CognitiveDomainAnalysis domains={report.domains} language={language} />
        <LobarFunctionAnalysis lobes={report.lobes} language={language} />

        <div className="nmdd-report__row">
          <VisualMemoryReportCard visualMemory={report.visualMemory} language={language} />
          <SpeechAssessmentCard speech={report.speech} language={language} />
        </div>

        <QuestionnaireSummaryCard questionnaire={report.questionnaire} caregiverConcordance={report.caregiverConcordance} language={language} />
        <CaregiverConcordancePanel caregiverConcordance={report.caregiverConcordance} language={language} />
        <CaregiverResponsesPanel patientId={patientId} language={language} />
        <LongitudinalProgressSection report={report} language={language} />
        <TrendIntelligencePanel trendIntelligence={report.trendIntelligence} language={language} />
        <NetworkCoherencePanel networkCoherence={report.networkCoherence} language={language} />
        <ClinicalObservationsPanel
          notes={report.clinicalNotes}
          onAddNote={addClinicalNote}
          notesLoadError={report.notesError}
          isSaving={isSavingNote}
          saveError={noteError}
          language={language}
        />
        <ClinicalRecommendationsCard recommendations={report.recommendations} language={language} />
        <AdvancedAnalyticsPanel hiddenAnalytics={report.hiddenAnalytics} language={language} />
      </div>

      {/* Rendered as a sibling, not a child, of the screen-only wrapper so
          print.css can hide .nmdd-screen-only and still show this. */}
      <PrintableReport report={report} caregiver={caregiverState.status === 'ready' ? caregiverState.caregiver : null} language={language} />
    </>
  );
}
