import { DEFAULT_LANGUAGE } from '../../config/i18nConfig.js';
import { t } from '../../i18n/strings/report.js';

export default function DownloadReportButton({ onExport, isPrinting, language = DEFAULT_LANGUAGE }) {
  return (
    <button type="button" className="nmdd-button nmdd-button--primary" onClick={onExport} disabled={isPrinting}>
      {isPrinting ? t(language, 'preparingReport') : t(language, 'downloadPdfReport')}
    </button>
  );
}
