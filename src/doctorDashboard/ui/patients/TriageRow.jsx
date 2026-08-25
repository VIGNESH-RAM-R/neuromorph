import StatusBadge from '../shared/StatusBadge.jsx';
import TrendIndicator from '../shared/TrendIndicator.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t, format } from '../../i18n/strings/patients.js';

export default function TriageRow({ row, onOpen, language = DEFAULT_LANGUAGE }) {
  return (
    <tr className={row.riskFlagged ? 'nmdd-row--flagged' : ''}>
      <td>
        <button type="button" className="nmdd-link" onClick={() => onOpen(row.patientId)}>
          {row.name}
        </button>
        <div className="nmdd-row__sub">{row.patientId} · {row.age ?? '—'} · {row.gender || '—'}</div>
      </td>
      <td><StatusBadge band={row.overallBand} language={language} /></td>
      <td>{typeof row.overallScore === 'number' ? row.overallScore : '—'}</td>
      <td><TrendIndicator trend={row.trend} showDelta={false} language={language} /></td>
      <td>{row.lastAssessmentDate || '—'}</td>
      <td>
        {row.overdue ? <span className="nmdd-tag nmdd-tag--warn">{t(language, 'tagOverdue')}</span> : <span className="nmdd-tag nmdd-tag--info">{t(language, 'tagCompletedThisWeek')}</span>}
      </td>
      <td>
        {row.riskFlagged && <span className="nmdd-tag nmdd-tag--danger">{t(language, 'tagRiskFlag')}</span>}
        {row.caregiverDiscordant && <span className="nmdd-tag nmdd-tag--info">{t(language, 'tagConcordanceGap')}</span>}
        {typeof row.dailyMomentumScore === 'number' && (
          <span className="nmdd-tag nmdd-tag--info" title={format(t(language, 'dailyMomentumTitle'), { date: row.dailyMomentumDate })}>
            {format(t(language, 'dailyMomentumTag'), { score: row.dailyMomentumScore })}
          </span>
        )}
      </td>
    </tr>
  );
}
