import './style.css';
import { storage } from './storage.js';
import { handleSpotifyCallback } from './spotify.js';
import { renderWelcome } from './screens/welcome.js';
import { renderSetup } from './screens/setup.js';
import { renderMain } from './screens/main.js';
import { showToast, showLoader } from './ui.js';

const app = document.getElementById('app');

async function init() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  // ── Handle Spotify OAuth redirect ──────────────────────────────────────────
  if (code) {
    // Clean URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    const loader = showLoader('Spotify\'a bağlanılıyor...', 'Lütfen bekle');
    try {
      await handleSpotifyCallback(code);
      storage.setSetupComplete();
      loader.hide();
      showToast('🎵 Spotify\'a başarıyla bağlandın!', 'success');
      goMain();
    } catch (e) {
      loader.hide();
      showToast(`Spotify girişi başarısız: ${e.message}`, 'error', 6000);
      // Fall through to normal routing
      route();
    }
    return;
  }

  if (error) {
    window.history.replaceState({}, '', window.location.pathname);
    showToast('Spotify girişi iptal edildi.', 'error');
  }

  route();
}

function route() {
  const username = storage.getUsername();

  // No username → welcome
  if (!username) {
    renderWelcome(app, () => route());
    return;
  }

  // Username but setup incomplete → setup
  if (!storage.isSetupComplete() || !storage.getSpotifyToken()) {
    renderSetup(app);
    return;
  }

  // All good → main
  goMain();
}

function goMain() {
  renderMain(app, () => {
    // onLogout callback
    route();
  });
}

init();
