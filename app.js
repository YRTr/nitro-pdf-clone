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

// Create DOM node for an annotation object
function createAnnotationElement(ann, pageIdx) {
  const el = document.createElement('div');
  el.className = `annotation-item ${state.selectedAnnotationId === ann.id ? 'selected' : ''}`;
  el.style.left = `${ann.x}px`;
  el.style.top = `${ann.y}px`;

  if (ann.type === 'textbox') {
    el.contentEditable = 'true';
    el.className += ' px-2 py-1 rounded border border-transparent hover:border-orange-400 focus:outline-none';
    el.style.color = ann.color;
    el.style.fontSize = `${ann.size}px`;
    el.style.minWidth = '120px';
    el.innerHTML = ann.text;
    el.addEventListener('input', () => {
      ann.text = el.innerHTML;
    });
  } else if (ann.type === 'highlight') {
    el.style.width = `${ann.width || 180}px`;
    el.style.height = `${ann.height || 26}px`;
    el.style.backgroundColor = 'rgba(250, 204, 21, 0.45)';
  } else if (ann.type === 'strike') {
    el.style.width = `${ann.width || 180}px`;
    el.style.height = '18px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.innerHTML = `<div style="width:100%; height:3px; background:#e11d48;"></div>`;
  } else if (ann.type === 'redact') {
    el.style.width = `${ann.width || 180}px`;
    el.style.height = `${ann.height || 32}px`;
    el.style.backgroundColor = '#000000';
    el.title = 'Redacted Area';
  } else if (ann.type === 'rect') {
    el.style.width = `${ann.width || 140}px`;
    el.style.height = `${ann.height || 90}px`;
    el.style.border = `3px solid ${ann.color}`;
  } else if (ann.type === 'note') {
    el.className += ' w-44 bg-amber-200 text-slate-900 p-2.5 rounded shadow-lg border border-amber-400 text-xs';
    el.innerHTML = `
      <div class="font-bold text-[10px] uppercase text-amber-900 mb-1 flex justify-between">
        <span>Sticky Note</span>
      </div>
      <div contenteditable="true" class="outline-none">${ann.text}</div>
    `;
  } else if (ann.type === 'stamp') {
    const colors = {
      APPROVED: 'border-emerald-600 text-emerald-700 bg-emerald-500/10',
      CONFIDENTIAL: 'border-rose-600 text-rose-700 bg-rose-500/10',
      DRAFT: 'border-amber-600 text-amber-700 bg-amber-500/10'
    };
    el.className += ` px-4 py-1.5 border-4 font-extrabold text-lg tracking-widest rounded uppercase ${
      colors[ann.text] || colors.APPROVED
    }`;
    el.style.transform = 'rotate(-10deg)';
    el.textContent = ann.text;
  } else if (ann.type === 'image' || ann.type === 'signature') {
    const img = document.createElement('img');
    img.src = ann.src;
    img.style.width = `${ann.width || 180}px`;
    img.className = 'pointer-events-none select-none';
    el.appendChild(img);
  }

  // Dragging & Selection logic
  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    state.selectedAnnotationId = ann.id;
    state.activePageIndex = pageIdx;
    updateInspector(ann, pageIdx);

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = ann.x;
    const origY = ann.y;

    function onMove(moveEvent) {
      ann.x = origX + (moveEvent.clientX - startX) / state.zoom;
      ann.y = origY + (moveEvent.clientY - startY) / state.zoom;
      el.style.left = `${ann.x}px`;
      el.style.top = `${ann.y}px`;
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      renderWorkspace();
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  return el;
}

// Handle clicking on the page to add an annotation
function handlePageClick(e, pageIdx, sheet) {
  state.activePageIndex = pageIdx;
  if (state.activeTool === 'select' || state.activeTool === 'hand') {
    state.selectedAnnotationId = null;
    renderWorkspace();
    return;
  }

  const rect = sheet.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / state.zoom);
  const y = Math.round((e.clientY - rect.top) / state.zoom);

  const newAnn = {
    id: 'ann-' + Date.now(),
    type: state.activeTool,
    x,
    y,
    color: state.color,
    size: state.fontSize,
    text:
      state.activeTool === 'textbox'
        ? 'Double-click to edit text'
        : state.activeTool === 'note'
        ? 'Add review comment...'
        : ''
  };

  state.pages[pageIdx].annotations.push(newAnn);
  state.selectedAnnotationId = newAnn.id;
  setActiveTool('select');
  renderWorkspace();
  updateInspector(newAnn, pageIdx);
}

// Update Right-hand Inspector Panel
function updateInspector(ann, pageIdx) {
  const panel = document.getElementById('inspector-panel');
  if (!ann) {
    panel.innerHTML = `<p class="text-slate-500 italic">Select any annotation on the page to inspect or delete it.</p>`;
    return;
  }

  panel.innerHTML = `
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="font-bold text-orange-400 uppercase">${ann.type}</span>
        <span class="font-mono text-[10px] text-slate-400">Page ${pageIdx + 1}</span>
      </div>
      <div class="font-mono text-[11px] text-slate-300">Position: X=${Math.round(ann.x)}, Y=${Math.round(ann.y)}</div>
      <button id="btn-delete-ann" class="w-full mt-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 rounded py-1.5 text-xs font-semibold transition">
        Delete Annotation
      </button>
    </div>
  `;

  document.getElementById('btn-delete-ann').addEventListener('click', () => {
    state.pages[pageIdx].annotations = state.pages[pageIdx].annotations.filter((a) => a.id !== ann.id);
    state.selectedAnnotationId = null;
    updateInspector(null);
    renderWorkspace();
  });
}

// Render list of all annotations in right sidebar
function renderAnnotationsList() {
  const list = document.getElementById('annotations-list');
  list.innerHTML = '';

  state.pages.forEach((p, idx) => {
    p.annotations.forEach((ann) => {
      const item = document.createElement('div');
      item.className = 'p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between';
      item.innerHTML = `
        <div>
          <span class="font-semibold text-orange-400 uppercase">${ann.type}</span>
          <span class="text-slate-500 ml-1">(P${idx + 1})</span>
        </div>
        <span class="font-mono text-[10px] text-slate-400">${Math.round(ann.x)},${Math.round(ann.y)}</span>
      `;
      list.appendChild(item);
    });
  });
}