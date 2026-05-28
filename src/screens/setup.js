import { storage } from '../storage.js';
import { animBg, spotifyIcon, showToast } from '../ui.js';
import { initiateSpotifyLogin } from '../spotify.js';

/**
 * Setup screen — collects Gemini API key + Spotify Client ID, then triggers OAuth.
 * This screen has 2 steps:
 *   Step 1 — Gemini API key
 *   Step 2 — Spotify Client ID + Login
 */
export function renderSetup(container) {
  let step = storage.getGeminiKey() ? 2 : 1;
  render();

  function render() {
    container.innerHTML = `
      ${animBg()}
      <div class="screen">
        <div class="glass setup-card" id="setup-card">

          <div class="setup-header">
            <h2>${step === 1 ? '🤖 Yapay Zeka Kurulumu' : '🎵 Spotify Bağlantısı'}</h2>
            <p>${step === 1
              ? 'Playlist oluşturmak için bir Gemini API anahtarı gerekiyor.'
              : 'Playlist\'lerin Spotify hesabında oluşturulabilmesi için bağlanmalısın.'}</p>
          </div>

          <div class="step-indicator">
            <div class="step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}"></div>
            <div class="step-dot ${step >= 2 ? 'active' : ''}"></div>
          </div>

          <div class="divider"></div>

          ${step === 1 ? renderStep1() : renderStep2()}

        </div>
      </div>
    `;

    if (step === 1) bindStep1();
    else bindStep2();
  }

  // ── Step 1: Gemini API Key ─────────────────────────────────────────────────

  function renderStep1() {
    return `
      <div class="info-box">
        <strong>Gemini API Anahtarı Nasıl Alınır?</strong>
        <ol>
          <li><a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a> adresine git</li>
          <li>"Create API key" butonuna tıkla</li>
          <li>Anahtarı kopyalayıp aşağıya yapıştır</li>
        </ol>
        <div class="mt-8 text-sm">✅ Ücretsiz tier mevcut — aylık geniş limit</div>
      </div>

      <div class="form-group">
        <label for="gemini-key-input">Gemini API Anahtarı</label>
        <div class="input-wrapper">
          <input
            id="gemini-key-input"
            class="input input-password"
            type="password"
            placeholder="AIza..."
            autocomplete="off"
            spellcheck="false"
          />
          <button class="input-eye" id="toggle-gemini-eye" title="Göster/Gizle">👁️</button>
        </div>
      </div>

      <button id="step1-btn" class="btn btn-primary btn-full btn-lg" disabled>
        Devam Et →
      </button>
    `;
  }

  function bindStep1() {
    const input = document.getElementById('gemini-key-input');
    const btn = document.getElementById('step1-btn');
    const eye = document.getElementById('toggle-gemini-eye');

    input.addEventListener('input', () => {
      btn.disabled = input.value.trim().length < 10;
    });

    eye.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    btn.addEventListener('click', () => {
      const key = input.value.trim();
      if (key.length < 10) return;
      storage.setGeminiKey(key);
      step = 2;
      render();
    });

    setTimeout(() => input.focus(), 100);
  }

  // ── Step 2: Spotify Client ID + OAuth ─────────────────────────────────────

  function renderStep2() {
    const hasClientId = !!storage.getSpotifyClientId();
    return `
      <div class="info-box">
        <strong>Spotify Client ID Nasıl Alınır?</strong>
        <ol>
          <li><a href="https://developer.spotify.com/dashboard" target="_blank">developer.spotify.com/dashboard</a> adresine git</li>
          <li>"Create App" butonuna tıkla</li>
          <li>App adını ve açıklamasını doldur</li>
          <li><strong>Redirect URIs</strong> alanına tam olarak şunu gir (kopyala-yapıştır):<br>
            <code style="background:rgba(0,0,0,0.4);padding:3px 8px;border-radius:4px;font-size:12px;word-break:break-all;display:inline-block;margin-top:4px">http://localhost:5173</code>
            <br><span style="color:var(--pink);font-size:12px">⚠️ Sonda / (eğik çizgi) OLMAMALI, /callback de yazma!</span></li>
          <li>APIs used: <strong>Web API</strong> seç → Save</li>
          <li>Oluşturulan uygulamadan <strong>Client ID</strong>'yi kopyala</li>
        </ol>
        <div class="mt-8 text-sm">✅ Tamamen ücretsiz — kredi kartı gerekmez<br>
        ℹ️ Playlist'ler <strong>senin</strong> Spotify hesabında oluşur</div>
      </div>

      <div class="form-group">
        <label for="spotify-client-id">Spotify Client ID</label>
        <input
          id="spotify-client-id"
          class="input"
          type="text"
          placeholder="Yapıştır: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          autocomplete="off"
          spellcheck="false"
          value="${storage.getSpotifyClientId() || ''}"
        />
      </div>

      <div class="divider"></div>

      <div class="spotify-login-area">
        <button id="spotify-login-btn" class="btn btn-spotify btn-full btn-lg" ${hasClientId ? '' : 'disabled'}>
          ${spotifyIcon(20)}
          Spotify ile Giriş Yap
        </button>
        <p>Tıkladığında Spotify giriş sayfasına yönlendirileceksin.<br>
        Giriş yaptıktan sonra otomatik geri döneceksin.</p>
      </div>

      <button id="back-step1-btn" class="btn btn-secondary btn-sm" style="align-self:center">
        ← Geri
      </button>
    `;
  }

  function bindStep2() {
    const clientIdInput = document.getElementById('spotify-client-id');
    const loginBtn = document.getElementById('spotify-login-btn');
    const backBtn = document.getElementById('back-step1-btn');

    clientIdInput.addEventListener('input', () => {
      const val = clientIdInput.value.trim();
      loginBtn.disabled = val.length < 20;
      if (val.length >= 20) storage.setSpotifyClientId(val);
    });

    loginBtn.addEventListener('click', async () => {
      const clientId = clientIdInput.value.trim();
      if (clientId.length < 20) {
        showToast('Geçerli bir Client ID gir.', 'error');
        return;
      }
      storage.setSpotifyClientId(clientId);
      try {
        await initiateSpotifyLogin();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });

    backBtn.addEventListener('click', () => {
      step = 1;
      render();
    });

    setTimeout(() => clientIdInput.focus(), 100);
  }
}
