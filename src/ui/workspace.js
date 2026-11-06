import { state } from '../state.js';
import { createAnnotationElement, handlePageClick, renderAnnotationsList } from './annotations.js';

export function renderWorkspace() {
  const container = document.getElementById('pages-container');
  const thumbList = document.getElementById('thumbnail-list');
  const badge = document.getElementById('page-count-badge');

  container.innerHTML = '';
  thumbList.innerHTML = '';
  badge.textContent = state.pages.length;

  state.pages.forEach((page, pageIdx) => {
    const sheet = document.createElement('div');
    sheet.className = 'pdf-page-sheet';
    sheet.style.transform = `scale(${state.zoom}) rotate(${page.rotation}deg)`;

    if (page.pdfCanvasDataUrl) {
      const bgImg = document.createElement('img');
      bgImg.src = page.pdfCanvasDataUrl;
      bgImg.className = 'w-full h-full object-contain pointer-events-none select-none';
      sheet.appendChild(bgImg);
    } else {
      const contentLayer = document.createElement('div');
      contentLayer.className = 'w-full h-full';
      contentLayer.contentEditable = state.isTextEditable ? 'true' : 'false';
      contentLayer.innerHTML = page.htmlContent;
      contentLayer.addEventListener('input', () => (page.htmlContent = contentLayer.innerHTML));
      sheet.appendChild(contentLayer);
    }

    if (state.watermarkEnabled) {
      const wm = document.createElement('div');
      wm.className = 'watermark-overlay';
      wm.innerHTML = '<span>CONFIDENTIAL</span>';
      sheet.appendChild(wm);
    }

    page.annotations.forEach((ann) => sheet.appendChild(createAnnotationElement(ann, pageIdx)));

    sheet.addEventListener('mousedown', (e) => handlePageClick(e, pageIdx, sheet));
    container.appendChild(sheet);

    // Sidebar Thumbnail
    const thumb = document.createElement('div');
    thumb.className = `p-2 rounded border cursor-pointer ${
      pageIdx === state.activePageIndex ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 bg-slate-950'
    }`;
    thumb.innerHTML = `<div class="text-[11px] text-center font-mono text-slate-300">Page ${pageIdx + 1}</div>`;
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