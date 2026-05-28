const KEYS = {
  USERNAME: 'apm_username',
  GEMINI_KEY: 'apm_gemini_key',
  SPOTIFY_CLIENT_ID: 'apm_spotify_client_id',
  SPOTIFY_ACCESS_TOKEN: 'apm_spotify_access_token',
  SPOTIFY_REFRESH_TOKEN: 'apm_spotify_refresh_token',
  SPOTIFY_TOKEN_EXPIRES: 'apm_spotify_token_expires',
  SPOTIFY_USER_ID: 'apm_spotify_user_id',
  BANNED_ARTISTS: 'apm_banned_artists',
  HISTORY: 'apm_history',
  LANGUAGE: 'apm_language',
};

export const storage = {
  getLanguage: () => localStorage.getItem(KEYS.LANGUAGE) || 'tr',
  setLanguage: (v) => localStorage.setItem(KEYS.LANGUAGE, v),

  getUsername: () => localStorage.getItem(KEYS.USERNAME),
  setUsername: (v) => localStorage.setItem(KEYS.USERNAME, v),

  getGeminiKey: () => localStorage.getItem(KEYS.GEMINI_KEY),
  setGeminiKey: (v) => localStorage.setItem(KEYS.GEMINI_KEY, v),

  getSpotifyClientId: () => localStorage.getItem(KEYS.SPOTIFY_CLIENT_ID),
  setSpotifyClientId: (v) => localStorage.setItem(KEYS.SPOTIFY_CLIENT_ID, v),

  getSpotifyToken: () => localStorage.getItem(KEYS.SPOTIFY_ACCESS_TOKEN),
  setSpotifyToken: (v) => localStorage.setItem(KEYS.SPOTIFY_ACCESS_TOKEN, v),

  getSpotifyRefreshToken: () => localStorage.getItem(KEYS.SPOTIFY_REFRESH_TOKEN),
  setSpotifyRefreshToken: (v) => localStorage.setItem(KEYS.SPOTIFY_REFRESH_TOKEN, v),

  getSpotifyTokenExpires: () => localStorage.getItem(KEYS.SPOTIFY_TOKEN_EXPIRES),
  setSpotifyTokenExpires: (v) => localStorage.setItem(KEYS.SPOTIFY_TOKEN_EXPIRES, v),

  getSpotifyUserId: () => localStorage.getItem(KEYS.SPOTIFY_USER_ID),
  setSpotifyUserId: (v) => localStorage.setItem(KEYS.SPOTIFY_USER_ID, v),

  isSetupComplete: () => localStorage.getItem(KEYS.SETUP_COMPLETE) === 'true',
  setSetupComplete: () => localStorage.setItem(KEYS.SETUP_COMPLETE, 'true'),

  // Preferences & Memory
  getBannedArtists: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.BANNED_ARTISTS)) || []; }
    catch { return []; }
  },
  addBannedArtists: (artists) => {
    if (!artists || artists.length === 0) return;
    const current = storage.getBannedArtists();
    const updated = [...new Set([...current, ...artists])];
    localStorage.setItem(KEYS.BANNED_ARTISTS, JSON.stringify(updated));
  },
  removeBannedArtist: (artist) => {
    const current = storage.getBannedArtists();
    const updated = current.filter(a => a.toLowerCase() !== artist.toLowerCase());
    localStorage.setItem(KEYS.BANNED_ARTISTS, JSON.stringify(updated));
  },

  // History
  getHistory: () => {
    try { return JSON.parse(localStorage.getItem(KEYS.HISTORY)) || []; }
    catch { return []; }
  },
  saveToHistory: (playlistItem) => {
    // playlistItem: { id: timestamp, desc: string, songs: array, created_at: string }
    const current = storage.getHistory();
    // if exists, update
    const idx = current.findIndex(p => p.id === playlistItem.id);
    if (idx >= 0) current[idx] = playlistItem;
    else current.unshift(playlistItem);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(current.slice(0, 50))); // max 50
  },
  deleteFromHistory: (id) => {
    const current = storage.getHistory();
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(current.filter(p => p.id !== id)));
  },

  isSpotifyTokenValid: () => {
    const token = localStorage.getItem(KEYS.SPOTIFY_ACCESS_TOKEN);
    const expires = localStorage.getItem(KEYS.SPOTIFY_TOKEN_EXPIRES);
    if (!token || !expires) return false;
    return Date.now() < parseInt(expires) - 60000; // 60s buffer
  },

  clearSpotifyAuth: () => {
    [KEYS.SPOTIFY_ACCESS_TOKEN, KEYS.SPOTIFY_REFRESH_TOKEN, KEYS.SPOTIFY_TOKEN_EXPIRES, KEYS.SPOTIFY_USER_ID].forEach(k => localStorage.removeItem(k));
  },

  clearAll: () => Object.values(KEYS).forEach(k => localStorage.removeItem(k)),
};
