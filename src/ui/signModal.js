import { state, setStatus } from '../state.js';
import { renderWorkspace } from './workspace.js';

export function initSignModal() {
  const signModal = document.getElementById('sign-modal');
  const signCanvas = document.getElementById('sign-pad');
  const signCtx = signCanvas.getContext('2d');
  let drawing = false;

  signCanvas.addEventListener('mousedown', (e) => {
    drawing = true;
    signCtx.beginPath();
    signCtx.moveTo(e.offsetX, e.offsetY);
  });
  signCanvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    signCtx.lineWidth = 2.5;
    signCtx.lineCap = 'round';
    signCtx.strokeStyle = '#0f172a';
    signCtx.lineTo(e.offsetX, e.offsetY);
    signCtx.stroke();
  });
  window.addEventListener('mouseup', () => (drawing = false));

  document.getElementById('btn-open-sign').addEventListener('click', () => {
    signModal.classList.remove('hidden');
    signModal.classList.add('flex');
  });
  document.getElementById('btn-close-sign').addEventListener('click', () => signModal.classList.add('hidden'));
  document.getElementById('btn-clear-sign').addEventListener('click', () => {
    signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
    document.getElementById('sign-type-input').value = '';
  });

  document.getElementById('btn-apply-sign').addEventListener('click', () => {
    const typed = document.getElementById('sign-type-input').value.trim();
    if (typed) {
      signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
      signCtx.font = '44px "Alex Brush", cursive';
      signCtx.fillStyle = '#0f172a';
      signCtx.fillText(typed, 24, 85);
    }

    state.pages[state.activePageIndex].annotations.push({
      id: 'ann-' + Date.now(),
      type: 'signature',
      x: 260,
      y: 720,
      width: 200,
      src: signCanvas.toDataURL('image/png')
    });

    signModal.classList.add('hidden');
    renderWorkspace();
    setStatus('Signature placed');
  });
}