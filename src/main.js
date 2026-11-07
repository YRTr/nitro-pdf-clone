import { state, setActiveTool } from './state.js';
import { renderWorkspace } from './ui/workspace.js';
import { loadPdfFile } from './core/pdfLoader.js';
import { exportCompiledPdf } from './core/pdfExporter.js';
import { initSignModal } from './ui/signModal.js';

window.addEventListener('DOMContentLoaded', () => {
  renderWorkspace();
  initSignModal();

  // Ribbon Tab Switching
  document.querySelectorAll('.ribbon-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ribbon-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.ribbon-panel').forEach((p) => p.classList.add('hidden'));
      tab.classList.add('active');
      const panel = document.getElementById(`panel-${tab.dataset.tab}`);
      panel?.classList.remove('hidden');
      panel?.classList.add('flex');
    });
  });

  // Tool Selection
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
  });

  // File Upload & Export
  const pdfInput = document.getElementById('pdf-upload-input');
  document.getElementById('btn-open-pdf').addEventListener('click', () => pdfInput.click());
  document.getElementById('tool-open').addEventListener('click', () => pdfInput.click());
  pdfInput.addEventListener('change', (e) => e.target.files[0] && loadPdfFile(e.target.files[0]));

  document.getElementById('btn-export-main').addEventListener('click', exportCompiledPdf);
  document.getElementById('btn-save-pdf').addEventListener('click', exportCompiledPdf);
});