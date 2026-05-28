import { storage } from '../storage.js';
import { animBg, musicIcon } from '../ui.js';

/**
 * Welcome screen — asks for username on first launch.
 * Calls onComplete() when done.
 */
export function renderWelcome(container, onComplete) {
  container.innerHTML = `
    ${animBg()}
    <div class="screen">
      <div class="glass welcome-card" id="welcome-card">
        <div class="logo-area">
          <div class="logo-icon">
            ${musicIcon(40)}
          </div>
          <div>
            <h1 class="welcome-title">Hoşgeldin! 👋</h1>
            <p class="welcome-subtitle">Yapay zeka ile hayalindeki playlist'i oluştur</p>
          </div>
        </div>

        <div class="form-group">
          <label for="username-input">Adın ne?</label>
          <input
            id="username-input"
            class="input"
            type="text"
            placeholder="Kullanıcı adını gir..."
            maxlength="30"
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <button id="welcome-btn" class="btn btn-primary btn-full btn-lg" disabled>
          Devam Et
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
        </button>

        <p class="welcome-hint text-center text-sm text-muted">
          Adın yalnızca bu cihazda saklanır 🔒
        </p>
      </div>
    </div>
  `;

  const input = document.getElementById('username-input');
  const btn = document.getElementById('welcome-btn');

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length < 2;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btn.disabled) btn.click();
  });

  btn.addEventListener('click', () => {
    const name = input.value.trim();
    if (name.length < 2) return;
    storage.setUsername(name);
    onComplete();
  });

  // Auto-focus after animation
  setTimeout(() => input.focus(), 400);
}
