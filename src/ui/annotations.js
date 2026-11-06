import { state, setActiveTool } from '../state.js';
import { renderWorkspace } from './workspace.js';

export function createAnnotationElement(ann, pageIdx) {
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
    el.addEventListener('input', () => (ann.text = el.innerHTML));
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
  } else if (ann.type === 'rect') {
    el.style.width = `${ann.width || 140}px`;
    el.style.height = `${ann.height || 90}px`;
    el.style.border = `3px solid ${ann.color}`;
  } else if (ann.type === 'note') {
    el.className += ' w-44 bg-amber-200 text-slate-900 p-2.5 rounded shadow-lg border border-amber-400 text-xs';
    el.innerHTML = `<div class="font-bold text-[10px] uppercase text-amber-900 mb-1">Sticky Note</div><div contenteditable="true" class="outline-none">${ann.text}</div>`;
  } else if (ann.type === 'stamp') {
    const colors = {
      APPROVED: 'border-emerald-600 text-emerald-700 bg-emerald-500/10',
      CONFIDENTIAL: 'border-rose-600 text-rose-700 bg-rose-500/10',
      DRAFT: 'border-amber-600 text-amber-700 bg-amber-500/10'
    };
    el.className += ` px-4 py-1.5 border-4 font-extrabold text-lg tracking-widest rounded uppercase ${colors[ann.text] || colors.APPROVED}`;
    el.style.transform = 'rotate(-10deg)';
    el.textContent = ann.text;
  } else if (ann.type === 'image' || ann.type === 'signature') {
    const img = document.createElement('img');
    img.src = ann.src;
    img.style.width = `${ann.width || 180}px`;
    img.className = 'pointer-events-none select-none';
    el.appendChild(img);
  }

  // Drag handler
  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    state.selectedAnnotationId = ann.id;
    state.activePageIndex = pageIdx;
    updateInspector(ann, pageIdx);

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = ann.x;
    const origY = ann.y;

    function onMove(ev) {
      ann.x = origX + (ev.clientX - startX) / state.zoom;
      ann.y = origY + (ev.clientY - startY) / state.zoom;
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

export function handlePageClick(e, pageIdx, sheet) {
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
    text: state.activeTool === 'textbox' ? 'Edit text' : state.activeTool === 'note' ? 'Comment...' : ''
  };

  state.pages[pageIdx].annotations.push(newAnn);
  state.selectedAnnotationId = newAnn.id;
  setActiveTool('select');
  renderWorkspace();
  updateInspector(newAnn, pageIdx);
}

export function updateInspector(ann, pageIdx) {
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
      <div class="font-mono text-[11px] text-slate-300">X=${Math.round(ann.x)}, Y=${Math.round(ann.y)}</div>
      <button id="btn-delete-ann" class="w-full mt-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 rounded py-1.5 text-xs font-semibold">
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

export function renderAnnotationsList() {
  const list = document.getElementById('annotations-list');
  list.innerHTML = '';

  state.pages.forEach((p, idx) => {
    p.annotations.forEach((ann) => {
      const item = document.createElement('div');
      item.className = 'p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between';
      item.innerHTML = `
        <div><span class="font-semibold text-orange-400 uppercase">${ann.type}</span> <span class="text-slate-500">(P${idx + 1})</span></div>
        <span class="font-mono text-[10px] text-slate-400">${Math.round(ann.x)},${Math.round(ann.y)}</span>
      `;
      list.appendChild(item);
    });
  });
}