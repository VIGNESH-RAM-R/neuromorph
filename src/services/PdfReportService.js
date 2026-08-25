// ============================================================================
// BROWSER-ONLY. Like FaceTrackingService in the Facial Expressivity module,
// this is the one file in PDF Analysis Mode that can't be exercised by a
// Node test -- it needs a real browser File object and the PDF.js library.
// Everything downstream of its output (ReportExtractionEngine,
// ReportExplanationEngine) is pure and fully Node-tested against synthetic
// text strings.
//
// Loaded from a CDN at runtime rather than an npm dependency, same
// reasoning as the MediaPipe import in FaceTrackingService: no verified
// npm registry access in this sandbox, and it avoids bundling a large
// library into the repo for something that's still a placeholder pending
// a real report PDF template.
// ============================================================================
const PDFJS_CDN_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';
const PDFJS_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

let pdfjsLib = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import(/* @vite-ignore */ PDFJS_CDN_URL);
  mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  pdfjsLib = mod;
  return mod;
}

export const PdfReportService = {
  // file: a browser File object (from an <input type="file"> change event).
  // Returns the concatenated plain text of every page. Throws with a clear
  // message on failure -- the hook is responsible for turning that into a
  // user-facing error rather than an unhandled rejection.
  async extractText(file) {
    if (!file) throw new Error('No file was provided.');
    if (file.type !== 'application/pdf' && !file.name?.toLowerCase().endsWith('.pdf')) {
      throw new Error('That file doesn\'t look like a PDF.');
    }

    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += `${pageText}\n`;
    }
    return fullText;
  },
};
