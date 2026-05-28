/**
 * Shows a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration ms
 */
export function showToast(message, type = 'info', duration = 3500) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'fadeIn 0.3s var(--ease) reverse';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/**
 * Shows a fullscreen loading overlay.
 * @param {string} text  Primary text
 * @param {string} sub   Secondary text
 * @returns {{ update(text, sub): void, setProgress(0-100): void, hide(): void }}
 */
export function showLoader(text = 'Yükleniyor...', sub = '') {
  const overlay = document.createElement('div');
  overlay.className = 'loader-overlay';
  overlay.innerHTML = `
    <div class="loader-spinner"></div>
    <div class="loader-text" id="loader-text">${text}</div>
    ${sub ? `<div class="loader-subtext" id="loader-subtext">${sub}</div>` : ''}
    <div class="progress-bar-wrap" id="loader-bar-wrap" style="display:none">
      <div class="progress-bar-fill" id="loader-bar" style="width:0%"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  return {
    update(t, s = '') {
      const textEl = document.getElementById('loader-text');
      const subEl = document.getElementById('loader-subtext');
      if (textEl) textEl.textContent = t;
      if (subEl) subEl.textContent = s;
    },
    setProgress(pct) {
      const wrap = document.getElementById('loader-bar-wrap');
      const bar = document.getElementById('loader-bar');
      if (wrap) wrap.style.display = 'block';
      if (bar) bar.style.width = `${Math.min(100, pct)}%`;
    },
    hide() {
      overlay.remove();
    },
  };
}

/** Renders the floating background orbs HTML string */
export function animBg() {
  return `<div class="anim-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>`;
}

/** Spotify logo SVG */
export function spotifyIcon(size = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>`;
}

/** Music note SVG */
export function musicIcon(size = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>`;
}
