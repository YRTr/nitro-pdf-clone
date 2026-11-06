export const state = {
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
            Use the <strong>NitroPDF Pro Ribbon</strong> above to edit text directly, highlight sections, add sticky notes, redact sensitive metrics, or apply your QuickSign™ signature.
          </p>
        </div>
      `,
      annotations: []
    }
  ]
};

export function setStatus(message) {
  const el = document.getElementById('status-message');
  if (el) el.textContent = message;
}

export function setActiveTool(toolName) {
  state.activeTool = toolName;
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tool === toolName);
  });
  document.getElementById('status-tool').innerHTML =
    `Active Tool: <strong class="text-orange-400 uppercase">${toolName}</strong>`;
}