import { CARDS } from './cardData';

declare global {
  interface Window {
    openCardModal: (id: string) => void;
  }
}

const CARD_ICON_SVG = `<svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><rect x="0.75" y="0.75" width="10.5" height="13.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/><line x1="2.5" y1="5" x2="9.5" y2="5" stroke="currentColor" stroke-width="1"/><line x1="2.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" stroke-width="1"/><line x1="2.5" y1="10" x2="7" y2="10" stroke="currentColor" stroke-width="1"/></svg>`;

export const CARD_BTN_HTML = (id: string, title = '') =>
  `<button class="gc-card-btn" onclick="event.stopPropagation();window.openCardModal('${id}')" title="View ${title || id} card" aria-label="View ${title || id} playing card">${CARD_ICON_SVG}</button>`;

export function initCardModal() {
  if (document.getElementById('gc-card-modal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #gc-card-modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    #gc-card-modal-overlay.open { display: flex; }
    #gc-card-modal {
      background: #f5f0e6;
      border-radius: 20px;
      max-width: 420px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      padding: 6px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    #gc-card-modal-inner {
      border-radius: 15px;
      border-width: 4px;
      border-style: solid;
      padding: 16px 16px 14px;
    }
    #gc-card-modal-img {
      width: 100%;
      border-radius: 10px;
      display: block;
    }
    #gc-card-modal-title {
      font-size: 22px;
      font-weight: 800;
      text-align: center;
      color: #2a2a2a;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    #gc-card-modal-italic {
      font-style: italic;
      font-size: 13px;
      color: #4a4a4a;
      text-align: center;
      margin-bottom: 10px;
      line-height: 1.45;
    }
    #gc-card-modal-body {
      background: #ffffff;
      border-radius: 10px;
      padding: 12px 14px;
      border: 1px solid #ddd8cc;
    }
    .gc-card-row { margin-bottom: 7px; font-size: 13px; line-height: 1.45; color: #2a2a2a; }
    .gc-card-row:last-child { margin-bottom: 0; }
    .gc-card-row b { color: #1a1a1a; }
    #gc-card-modal-close {
      position: absolute;
      top: 10px;
      right: 12px;
      background: rgba(0,0,0,0.35);
      border: none;
      font-size: 22px;
      color: #fff;
      cursor: pointer;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 1;
    }
    #gc-card-modal-close:hover { background: rgba(0,0,0,0.6); }
    .gc-card-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid currentColor;
      border-radius: 3px;
      color: inherit;
      opacity: 0.5;
      cursor: pointer;
      padding: 2px 3px;
      line-height: 1;
      flex-shrink: 0;
      transition: opacity 0.15s;
      vertical-align: middle;
      position: relative;
    }
    .gc-card-btn:hover { opacity: 1; }
    .gc-card-btn::after {
      content: 'View card';
      position: absolute;
      bottom: calc(100% + 5px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.78);
      color: #fff;
      font-size: 10px;
      font-family: sans-serif;
      font-weight: 500;
      padding: 3px 7px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      z-index: 10000;
    }
    .gc-card-btn:hover::after { opacity: 1; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'gc-card-modal-overlay';
  overlay.innerHTML = `
    <div id="gc-card-modal">
      <button id="gc-card-modal-close" aria-label="Close">×</button>
      <div id="gc-card-modal-inner">
        <img id="gc-card-modal-img" src="" alt="" style="display:none">
        <div id="gc-card-modal-title"></div>
        <div id="gc-card-modal-italic"></div>
        <div id="gc-card-modal-body"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
  document.getElementById('gc-card-modal-close')!.addEventListener('click', () => overlay.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('open'); });

  window.openCardModal = (id: string) => {
    const card = CARDS[id];
    if (!card) return;

    const inner = document.getElementById('gc-card-modal-inner')!;
    const imgEl = document.getElementById('gc-card-modal-img') as HTMLImageElement;
    const titleEl = document.getElementById('gc-card-modal-title')!;
    const italicEl = document.getElementById('gc-card-modal-italic')!;
    const bodyEl = document.getElementById('gc-card-modal-body')!;

    inner.style.borderColor = card.color;
    inner.style.padding = card.image ? '0' : '16px 16px 14px';

    if (card.image) {
      imgEl.style.display = 'none';
      titleEl.style.display = 'none';
      italicEl.style.display = 'none';
      bodyEl.style.display = 'none';

      const probe = new Image();
      probe.onload = () => {
        imgEl.src = card.image!;
        imgEl.alt = card.title;
        imgEl.style.display = 'block';
      };
      probe.onerror = () => {
        showTextLayout();
      };
      probe.src = card.image;
    } else {
      showTextLayout();
    }

    function showTextLayout() {
      inner.style.padding = '16px 16px 14px';
      imgEl.style.display = 'none';
      titleEl.style.display = 'block';
      titleEl.textContent = card.title;
      if (card.italic) { italicEl.textContent = card.italic; italicEl.style.display = 'block'; }
      else { italicEl.style.display = 'none'; }
      bodyEl.innerHTML = card.rows
        .map(r => `<div class="gc-card-row"><b>${r.label}:</b> ${r.value}</div>`)
        .join('');
      bodyEl.style.display = 'block';
    }

    overlay.classList.add('open');
  };
}
