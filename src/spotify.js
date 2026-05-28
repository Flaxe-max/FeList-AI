import { storage } from './storage.js';

// This MUST match exactly what you entered in Spotify Developer Dashboard
export const REDIRECT_URI = 'http://127.0.0.1:5173';

const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
  'ugc-image-upload'
].join(' ');

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generateVerifier(len = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}

async function generateChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

export async function initiateSpotifyLogin() {
  const clientId = storage.getSpotifyClientId();
  if (!clientId) throw new Error('Spotify Client ID girilmemiş.');

  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  sessionStorage.setItem('pkce_verifier', verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleSpotifyCallback(code) {
  const clientId = storage.getSpotifyClientId();
  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) throw new Error('PKCE verifier bulunamadı. Tekrar giriş yap.');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || 'Spotify token alınamadı.');
  }

  const data = await res.json();
  storage.setSpotifyToken(data.access_token);
  storage.setSpotifyRefreshToken(data.refresh_token);
  storage.setSpotifyTokenExpires(Date.now() + data.expires_in * 1000);
  sessionStorage.removeItem('pkce_verifier');

  // Fetch & store user id
  const user = await fetchSpotifyUser(data.access_token);
  storage.setSpotifyUserId(user.id);
  return user;
}

export async function refreshAccessToken() {
  const clientId = storage.getSpotifyClientId();
  const refreshToken = storage.getSpotifyRefreshToken();
  if (!refreshToken) throw new Error('Oturum süresi doldu. Tekrar giriş yap.');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error('Token yenilenemedi. Tekrar giriş yap.');
  const data = await res.json();
  storage.setSpotifyToken(data.access_token);
  storage.setSpotifyTokenExpires(Date.now() + data.expires_in * 1000);
  if (data.refresh_token) storage.setSpotifyRefreshToken(data.refresh_token);
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function getToken() {
  if (!storage.isSpotifyTokenValid()) await refreshAccessToken();
  return storage.getSpotifyToken();
}

async function apiFetch(url, opts = {}) {
  const token = await getToken();
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Spotify API hatası (${res.status})`);
  }
  // 204 No Content returns no body
  if (res.status === 204 || res.status === 202) return null;
  return res.json();
}

async function fetchSpotifyUser(token) {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Spotify kullanıcı bilgisi alınamadı. Detay: ${res.status} - ${errText}`);
  }
  return res.json();
}

export async function getMe() {
  return apiFetch('https://api.spotify.com/v1/me');
}

// ── Playlist agent actions ────────────────────────────────────────────────────

export async function searchTrack(title, artist) {
  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const data = await apiFetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=3`
  );
  const items = data?.tracks?.items;
  if (!items || items.length === 0) {
    return null; // Katı arama: Sadece isimle aramaya düşme, direkt null dön.
  }
  return items[0];
}

export async function createPlaylist(name, description) {
  const userId = storage.getSpotifyUserId();
  return apiFetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  });
}

export async function updatePlaylistDetails(playlistId, name, description) {
  return apiFetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });
}

export async function uploadPlaylistCover(playlistId, base64Image) {
  const token = await getToken();
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    body: base64Image,
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error("Cover Upload Error:", errText);
    throw new Error('Kapak resmi yüklenemedi. Spotify bazen 256KB üstü resimleri reddedebilir.');
  }
  return true;
}

export async function addTracksToPlaylist(playlistId, uris) {
  for (let i = 0; i < uris.length; i += 100) {
    await apiFetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
    });
  }
}
