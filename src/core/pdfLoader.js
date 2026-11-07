import { state, setStatus } from '../state.js';
import { renderWorkspace } from '../ui/workspace.js';

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export async function loadPdfFile(file) {
  try {
    setStatus(`Loading ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    state.pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const pdfPage = await pdf.getPage(i);
      const viewport = pdfPage.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

      state.pages.push({
        id: `page-${i}`,
        rotation: 0,
        pdfCanvasDataUrl: canvas.toDataURL('image/png'),
        htmlContent: '',
        annotations: []
      });
    }

    document.getElementById('doc-title').textContent = file.name;
    state.activePageIndex = 0;
    renderWorkspace();
    setStatus(`Loaded ${pdf.numPages} page(s)`);
  } catch (err) {
    console.error(err);
    setStatus('Error loading PDF');
  }
}