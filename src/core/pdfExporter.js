import { setStatus } from '../state.js';

export async function exportCompiledPdf() {
  try {
    setStatus('Compiling PDF...');
    const { PDFDocument } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    const sheets = document.querySelectorAll('.pdf-page-sheet');

    for (const sheet of sheets) {
      const prevTransform = sheet.style.transform;
      sheet.style.transform = 'none';
      const canvas = await window.html2canvas(sheet, { scale: 1.5, useCORS: true });
      sheet.style.transform = prevTransform;

      const pngImage = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
      const page = pdfDoc.addPage([595.28, 841.89]);
      page.drawImage(pngImage, { x: 0, y: 0, width: 595.28, height: 841.89 });
    }

    const pdfBytes = await pdfDoc.save();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    a.download = document.getElementById('doc-title').textContent || 'Exported.pdf';
    a.click();
    setStatus('PDF exported!');
  } catch (err) {
    console.error(err);
    setStatus('Export failed');
  }
}