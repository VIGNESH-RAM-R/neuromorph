import SectionCard from '../shared/SectionCard.jsx';
import DomainCard from './DomainCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

export default function CognitiveDomainAnalysis({ domains, language = DEFAULT_LANGUAGE }) {
  return (
    <SectionCard title={t(language, 'domainAnalysisTitle')} subtitle={t(language, 'domainAnalysisSubtitle')}>
      <div className="nmdd-domain-grid">
        {domains.map((d) => (
          <DomainCard key={d.key} domain={d} language={language} />
        ))}
      </div>
    </SectionCard>
  );
}
