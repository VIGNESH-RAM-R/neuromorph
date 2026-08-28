import SectionCard from '../shared/SectionCard.jsx';
import LobeCard from './LobeCard.jsx';
import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

export default function LobarFunctionAnalysis({ lobes, language = DEFAULT_LANGUAGE }) {
  return (
    <SectionCard
      title={t(language, 'lobarAnalysisTitle')}
      subtitle={t(language, 'lobarAnalysisSubtitle')}
    >
      <div className="nmdd-lobe-grid">
        {lobes.map((lobe) => (
          <LobeCard key={lobe.key} lobe={lobe} language={language} />
        ))}
      </div>
    </SectionCard>
  );
}
