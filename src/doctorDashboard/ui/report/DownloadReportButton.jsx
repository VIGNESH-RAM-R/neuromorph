export default function DownloadReportButton({ onExport, isPrinting }) {
  return (
    <button type="button" className="nmdd-button nmdd-button--primary" onClick={onExport} disabled={isPrinting}>
      {isPrinting ? 'Preparing report...' : 'Download PDF Report'}
    </button>
  );
}
