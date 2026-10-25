// Configure PDF.js worker
/* define the central state store (state), and load a built-in editable document so the
editor works out of the box even before uploading a local PDF*/
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Application State
const state = {
  activeTool: 'select',
  zoom: 1,
  activePageIndex: 0,
  isTextEditable: false,
  watermarkEnabled: false,
  selectedAnnotationId: null,
  color: '#ea580c',
  fontSize: 16,
  pages: [
    {
      id: 'page-1',
      rotation: 0,
      pdfCanvasDataUrl: null,
      htmlContent: `
        <div class="p-12 space-y-6">
          <div class="border-b-2 border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-slate-900">ENTERPRISE SYSTEM ARCHITECTURE DOSSIER</h1>
              <p class="text-xs text-slate-500">Document Ref: NITRO-2026-Q4 • Classification: Internal Technical Spec</p>
            </div>
            <span class="px-3 py-1 bg-orange-100 text-orange-800 font-bold text-xs rounded">REV 4.2</span>
          </div>

          <p class="text-sm text-slate-700 leading-relaxed">
            This document outlines the distributed cloud topology, security compliance controls, and quarterly infrastructure budget allocations. Use the <strong>NitroPDF Pro Ribbon</strong> above to edit text directly, highlight sections, add sticky notes, redact sensitive metrics, or apply your QuickSign™ signature.
          </p>

          <table class="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr class="bg-slate-100 text-slate-800">
                <th class="border border-slate-300 p-2.5">Subsystem Module</th>
                <th class="border border-slate-300 p-2.5">Lead Architect</th>
                <th class="border border-slate-300 p-2.5">Status</th>
                <th class="border border-slate-300 p-2.5">Q4 Allocation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-slate-300 p-2.5 font-semibold">Zero-Trust API Gateway</td>
                <td class="border border-slate-300 p-2.5">Elena Rostova</td>
                <td class="border border-slate-300 p-2.5 text-emerald-700 font-semibold">Production</td>
                <td class="border border-slate-300 p-2.5">$142,500</td>
              </tr>
              <tr>
                <td class="border border-slate-300 p-2.5 font-semibold">Document OCR Engine</td>
                <td class="border border-slate-300 p-2.5">Marcus Vance</td>
                <td class="border border-slate-300 p-2.5 text-amber-700 font-semibold">In Review</td>
                <td class="border border-slate-300 p-2.5">$98,000</td>
              </tr>
              <tr>
                <td class="border border-slate-300 p-2.5 font-semibold">Hardware HSM Vault</td>
                <td class="border border-slate-300 p-2.5">Devon Brooks</td>
                <td class="border border-slate-300 p-2.5 text-sky-700 font-semibold">Scheduled</td>
                <td class="border border-slate-300 p-2.5">$215,000</td>
              </tr>
            </tbody>
          </table>

          <div class="pt-12 flex justify-between items-end border-t border-slate-200 text-xs text-slate-500">
            <div>Authorized Signatory: ___________________________</div>
            <div>Page 1</div>
          </div>
        </div>
      `,
      annotations: []
    }
  ]
};

// Helper to update bottom status bar
function setStatus(message) {
  const el = document.getElementById('status-message');
  if (el) el.textContent = message;
}

// Render all pages and sidebar thumbnails
/* handles rendering each page, drawing uploaded PDF pages via PDF.js, updating the left thumbnail sidebar, 
 and managing page rotations, additions and deletions. */

// Render all pages and sidebar thumbnails
function renderWorkspace() {
  const container = document.getElementById('pages-container');
  const thumbList = document.getElementById('thumbnail-list');
  const badge = document.getElementById('page-count-badge');

  container.innerHTML = '';
  thumbList.innerHTML = '';
  badge.textContent = state.pages.length;

  state.pages.forEach((page, pageIdx) => {
    // 1. Create Main Page Sheet
    const sheet = document.createElement('div');
    sheet.className = 'pdf-page-sheet';
    sheet.dataset.pageIndex = pageIdx;
    sheet.style.transform = `scale(${state.zoom}) rotate(${page.rotation}deg)`;

    // Render imported PDF background if loaded from a real PDF file
    if (page.pdfCanvasDataUrl) {
      const bgImg = document.createElement('img');
      bgImg.src = page.pdfCanvasDataUrl;
      bgImg.className = 'w-full h-full object-contain pointer-events-none select-none';
      sheet.appendChild(bgImg);
    } else {
      // Render editable HTML template layer
      const contentLayer = document.createElement('div');
      contentLayer.className = 'w-full h-full';
      contentLayer.contentEditable = state.isTextEditable ? 'true' : 'false';
      contentLayer.innerHTML = page.htmlContent;
      contentLayer.addEventListener('input', () => {
        page.htmlContent = contentLayer.innerHTML;
      });
      sheet.appendChild(contentLayer);
    }

    // Optional Watermark Overlay
    if (state.watermarkEnabled) {
      const wm = document.createElement('div');
      wm.className = 'watermark-overlay';
      wm.innerHTML = '<span>CONFIDENTIAL</span>';
      sheet.appendChild(wm);
    }

    // Render Annotations on this Page
    page.annotations.forEach((ann) => {
      const annEl = createAnnotationElement(ann, pageIdx);
      sheet.appendChild(annEl);
    });

    // Click handler on page surface to place new annotations
    sheet.addEventListener('mousedown', (e) => handlePageClick(e, pageIdx, sheet));
    sheet.addEventListener('mousemove', (e) => {
      const rect = sheet.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) / state.zoom);
      const y = Math.round((e.clientY - rect.top) / state.zoom);
      document.getElementById('status-coords').textContent = `X: ${x}, Y: ${y}`;
    });

    container.appendChild(sheet);

    // 2. Create Sidebar Thumbnail Item
    const thumb = document.createElement('div');
    thumb.className = `p-2 rounded border cursor-pointer transition ${
      pageIdx === state.activePageIndex
        ? 'border-orange-500 bg-orange-500/10'
        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
    }`;
    thumb.innerHTML = `
      <div class="aspect-[1/1.414] bg-white rounded mb-1.5 flex items-center justify-center text-slate-800 font-bold text-xs overflow-hidden">
        ${
          page.pdfCanvasDataUrl
            ? `<img src="${page.pdfCanvasDataUrl}" class="w-full h-full object-cover" />`
            : `Page ${pageIdx + 1}`
        }
      </div>
      <div class="text-[11px] text-center font-mono text-slate-400">Page ${pageIdx + 1}</div>
    `;
    thumb.addEventListener('click', () => {
      state.activePageIndex = pageIdx;
      renderWorkspace();
      sheet.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    thumbList.appendChild(thumb);
  });

  renderAnnotationsList();
  if (window.lucide) window.lucide.createIcons();
}

// Load a real PDF file from disk using PDF.js
async function loadPdfFile(file) {
  try {
    setStatus(`Loading ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    state.pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const pdfPage = await pdf.getPage(i);
      const viewport = pdfPage.getViewport({ scale: 1.5 });
      const offscreenCanvas = document.createElement('canvas');
      const ctx = offscreenCanvas.getContext('2d');
      offscreenCanvas.width = viewport.width;
      offscreenCanvas.height = viewport.height;

      await pdfPage.render({ canvasContext: ctx, viewport }).promise;

      state.pages.push({
        id: `page-${i}`,
        rotation: 0,
        pdfCanvasDataUrl: offscreenCanvas.toDataURL('image/png'),
        htmlContent: '',
        annotations: []
      });
    }

    document.getElementById('doc-title').textContent = file.name;
    state.activePageIndex = 0;
    renderWorkspace();
    setStatus(`Loaded ${pdf.numPages} page(s) from ${file.name}`);
  } catch (err) {
    console.error(err);
    setStatus('Failed to load PDF file.');
  }
}