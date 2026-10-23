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