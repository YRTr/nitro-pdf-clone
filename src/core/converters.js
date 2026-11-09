import { state, setStatus } from '../state.js';

export function exportToWord() {
  const html = state.pages.map((p) => p.htmlContent).join('<hr/>');
  const blob = new Blob([`<html><body>${html}</body></html>`], { type: 'application/msword' });
  triggerDownload(blob, 'Converted_Document.doc');
  setStatus('Exported to Word (.doc)');
}

export function exportToExcel() {
  const rows = Array.from(document.querySelectorAll('.pdf-page-sheet table tr'));
  if (rows.length === 0) {
    setStatus('No tabular data found on page.');
    return;
  }

  const csv = rows
    .map((r) =>
      Array.from(r.querySelectorAll('th,td'))
        .map((c) => `"${c.innerText.replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  triggerDownload(blob, 'Extracted_Tables.csv');
  setStatus('Extracted tables to CSV');
}

export async function exportPageToPng() {
  try {
    setStatus('Capturing page image...');
    const sheet = document.querySelectorAll('.pdf-page-sheet')[state.activePageIndex];
    const canvas = await window.html2canvas(sheet, { scale: 2 });
    
    canvas.toBlob((blob) => {
      triggerDownload(blob, `Page_${state.activePageIndex + 1}.png`);
      setStatus('Exported page to PNG');
    });
  } catch (err) {
    console.error(err);
    setStatus('PNG export failed');
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}