import { storage } from './storage.js';

export const translations = {
  tr: {
    // Topbar
    welcomeUser: "Hoşgeldin!",
    spotifyConnecting: "Spotify'a bağlanılıyor...",
    spotifyConnected: "🟢 Spotify bağlı",
    spotifyDisconnected: "🔴 Spotify bağlı değil",
    logoutBtn: "Çıkış",
    
    // Left Panel
    memoryHistory: "Hafıza & Geçmiş",
    bannedList: "KARA LİSTE (ASLA ÖNERİLMEZ)",
    savedLists: "KAYITLI LİSTELER",
    newBtn: "+ Yeni",
    emptyBanned: "Kara liste boş. Ajan temiz bir sayfa ile çalışıyor.",
    emptyHistory: "Henüz kaydedilmiş liste yok.",
    songsCount: "Şarkı",
    allRights: "© All rights reserved FeWare to FeList",
    
    // Editor
    newPlaylistTitle: "Yeni Playlist",
    newPlaylistSub: "Sağdaki ajana ne tarz müzik istediğini yazarak başla.",
    songCountLabel: "Sayı:",
    waitingAgent: "Ajan komutlarını bekliyor...<br/>Sohbete bir şeyler yaz.",
    emptyList: "Liste boş.",
    createSpotifyBtn: "Spotify'da Oluştur",
    editSpotifyBtn: "✏️ Kapağı ve Detayları Düzenle",
    
    // Chat
    agentChatTitle: "Ajan İletişimi",
    online: "Çevrimiçi 🟢",
    agentGreeting: "Selam {username}! Ben müzik küratörü ajanınım. Ne tarz bir liste yapmak istersin veya hangi sanatçıları asla duymak istemezsin?",
    chatPlaceholder: "Şarkı ekle, çıkar, sevmediğini söyle...",
    
    // Modals & Alerts
    settingsTitle: "⚙️ Ayarlar",
    geminiKey: "Gemini API Anahtarı",
    spotifyClientId: "Spotify Client ID",
    saveBtn: "Kaydet",
    cancelBtn: "İptal",
    reconnectSpotify: "Spotify'ı Yeniden Bağla",
    settingsSaved: "Ayarlar kaydedildi ✅",
    
    // Playlist Modal
    coverEditorTitle: "🎨 Playlist Kapak Editörü",
    playlistNameLabel: "Playlist Adı",
    playlistDescLabel: "Açıklama",
    bgColorLabel: "Arka Plan Rengi",
    coverTextLabel: "Kapak Yazısı (Opsiyonel)",
    coverTextPlaceholder: "Kapakta görünecek yazı...",
    stickerLabel: "Sticker (Tıklayarak Ekle)",
    clearStickers: "Stickerları Temizle",
    updateBtn: "Güncelle",
    savePublishBtn: "Kaydet ve Yayınla",
    
    // AI Messages
    systemAnalyzing: "Sistem analiz ediliyor...",
    apiConnecting: "Ajan API'ye bağlanıyor...",
    processComplete: "İşlem tamamlandı.",
    serverBusy: "Google AI sunucuları şu an çok yoğun. Lütfen 1-2 dakika sonra tekrar dene.",
    aiEmptyResponse: "AI boş yanıt döndürdü. Tekrar dene.",
    aiParseError: "Yapay Zeka bozuk bir yanıt verdi. Lütfen tekrar komut gönder.",
    
    // Loader Messages
    searchingSpotify: "Şarkılar Spotify'da aranıyor...",
    creatingPlaylist: "Playlist Spotify'da oluşturuluyor...",
    uploadingCover: "Kapak resmi yükleniyor...",
    addingSongs: "Şarkılar ekleniyor...",
    updatingPlaylist: "Playlist güncelleniyor...",
    updatingCover: "Kapak resmi güncelleniyor...",
    sendingDetails: "Detaylar Spotify'a gönderiliyor",
    
    // Search Status
    songsFound: "şarkı bulundu",
    successAdded: "şarkı başarıyla eklendi!",
    coverUploadFailed: "Kapak resmi yüklenemedi ama liste oluşturuldu.",
    playlistUpdatedSuccess: "Playlist başarıyla güncellendi!",
    openInSpotify: "Spotify'da Aç",
    
    confirmLogout: "Tüm veriler silinecek. Emin misin?",
    confirmDeleteHistory: "Bu listeyi geçmişten silmek istediğine emin misin?"
  },
  en: {
    // Topbar
    welcomeUser: "Welcome!",
    spotifyConnecting: "Connecting to Spotify...",
    spotifyConnected: "🟢 Spotify Connected",
    spotifyDisconnected: "🔴 Spotify Disconnected",
    logoutBtn: "Logout",
    
    // Left Panel
    memoryHistory: "Memory & History",
    bannedList: "BANNED LIST (NEVER SUGGESTED)",
    savedLists: "SAVED LISTS",
    newBtn: "+ New",
    emptyBanned: "Banned list is empty. Agent has a clean slate.",
    emptyHistory: "No saved playlists yet.",
    songsCount: "Songs",
    allRights: "© All rights reserved FeWare to FeList",
    
    // Editor
    newPlaylistTitle: "New Playlist",
    newPlaylistSub: "Start by telling the agent what kind of music you want.",
    songCountLabel: "Count:",
    waitingAgent: "Agent is waiting for commands...<br/>Type something in the chat.",
    emptyList: "List is empty.",
    createSpotifyBtn: "Create in Spotify",
    editSpotifyBtn: "✏️ Edit Cover and Details",
    
    // Chat
    agentChatTitle: "Agent Chat",
    online: "Online 🟢",
    agentGreeting: "Hi {username}! I'm your music curator agent. What kind of list do you want, or which artists do you never want to hear?",
    chatPlaceholder: "Add/remove songs, tell me what you dislike...",
    
    // Modals & Alerts
    settingsTitle: "⚙️ Settings",
    geminiKey: "Gemini API Key",
    spotifyClientId: "Spotify Client ID",
    saveBtn: "Save",
    cancelBtn: "Cancel",
    reconnectSpotify: "Reconnect Spotify",
    settingsSaved: "Settings saved ✅",
    
    // Playlist Modal
    coverEditorTitle: "🎨 Playlist Cover Editor",
    playlistNameLabel: "Playlist Name",
    playlistDescLabel: "Description",
    bgColorLabel: "Background Color",
    coverTextLabel: "Cover Text (Optional)",
    coverTextPlaceholder: "Text on cover...",
    stickerLabel: "Stickers (Click to add)",
    clearStickers: "Clear Stickers",
    updateBtn: "Update",
    savePublishBtn: "Save and Publish",
    
    // AI Messages
    systemAnalyzing: "System analyzing...",
    apiConnecting: "Agent connecting to API...",
    processComplete: "Process completed.",
    serverBusy: "Google AI servers are busy. Please try again in 1-2 minutes.",
    aiEmptyResponse: "AI returned empty response. Try again.",
    aiParseError: "AI returned a broken response. Please send command again.",
    
    // Loader Messages
    searchingSpotify: "Searching tracks on Spotify...",
    creatingPlaylist: "Creating playlist on Spotify...",
    uploadingCover: "Uploading cover image...",
    addingSongs: "Adding tracks...",
    updatingPlaylist: "Updating playlist...",
    updatingCover: "Updating cover image...",
    sendingDetails: "Sending details to Spotify",
    
    // Search Status
    songsFound: "tracks found",
    successAdded: "tracks successfully added!",
    coverUploadFailed: "Cover upload failed, but playlist was created.",
    playlistUpdatedSuccess: "Playlist successfully updated!",
    openInSpotify: "Open in Spotify",
    
    confirmLogout: "All data will be deleted. Are you sure?",
    confirmDeleteHistory: "Are you sure you want to delete this list from history?"
  }
};

export function getLang() {
  return storage.getLanguage();
}

export function setLang(lang) {
  storage.setLanguage(lang);
}

export function t(key, vars = {}) {
  const lang = getLang();
  let text = translations[lang][key] || translations['tr'][key] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

// Function to update all data-i18n and data-i18n-placeholder elements on the page
export function updateDOMStrings() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
}
