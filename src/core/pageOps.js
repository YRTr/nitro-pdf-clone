import { state, setStatus } from '../state.js';
import { renderWorkspace } from '../ui/workspace.js';

export function zoomIn() {
  state.zoom = Math.min(1.8, +(state.zoom + 0.1).toFixed(1));
  updateZoomLabel();
  renderWorkspace();
}

export function zoomOut() {
  state.zoom = Math.max(0.5, +(state.zoom - 0.1).toFixed(1));
  updateZoomLabel();
  renderWorkspace();
}

function updateZoomLabel() {
  const el = document.getElementById('zoom-label');
  if (el) el.textContent = `${Math.round(state.zoom * 100)}%`;
}

export function addPage() {
  state.pages.push({
    id: `page-${Date.now()}`,
    rotation: 0,
    pdfCanvasDataUrl: null,
    htmlContent: `
      <div class="p-12">
        <h2 class="text-xl font-bold text-slate-900">New Blank Page</h2>
        <p class="text-sm text-slate-600 mt-2">Use the Ribbon tools to add text, markup, or images.</p>
      </div>`,
    annotations: []
  });
  state.activePageIndex = state.pages.length - 1;
  renderWorkspace();
  setStatus('Added new page');
}

export function rotatePage() {
  const page = state.pages[state.activePageIndex];
  if (page) {
    page.rotation = (page.rotation + 90) % 360;
    renderWorkspace();
    setStatus(`Rotated Page ${state.activePageIndex + 1} to ${page.rotation}°`);
  }
}

export function deletePage() {
  if (state.pages.length <= 1) {
    setStatus('Cannot delete the only remaining page.');
    return;
  }
  state.pages.splice(state.activePageIndex, 1);
  state.activePageIndex = Math.max(0, state.activePageIndex - 1);
  renderWorkspace();
  setStatus('Page deleted');
}

export function toggleWatermark() {
  state.watermarkEnabled = !state.watermarkEnabled;
  renderWorkspace();
  setStatus(state.watermarkEnabled ? 'Watermark enabled' : 'Watermark disabled');
}

export function toggleDirectTextEdit(btn) {
  state.isTextEditable = !state.isTextEditable;
  btn.classList.toggle('active', state.isTextEditable);
  renderWorkspace();
  setStatus(state.isTextEditable ? 'Direct Page Text Editing Enabled' : 'Direct Text Editing Disabled');
}