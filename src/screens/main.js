import { storage } from '../storage.js';
import { animBg, spotifyIcon, musicIcon, showToast, showLoader } from '../ui.js';
import { chatWithAgent } from '../ai.js';
import { searchTrack, createPlaylist, addTracksToPlaylist } from '../spotify.js';
import { t, getLang, setLang, updateDOMStrings } from '../i18n.js';

export function renderMain(container, onLogout) {
  const username = storage.getUsername();
  let currentSongs = []; // { title, artist, uri?, found? }
  let currentActiveId = null; // currently viewing history ID
  
  container.innerHTML = `
    ${animBg()}
    <div class="main-layout">
      <!-- TOP BAR -->
      <header class="topbar">
        <div class="topbar-logo">
          <div class="topbar-logo-icon">${musicIcon(20)}</div>
          <span>FeList</span>
        </div>
        <div class="user-chip">
          <div class="user-avatar" id="user-avatar">${username[0].toUpperCase()}</div>
          <div>
            <div class="user-name"><span data-i18n="welcomeUser">Hoşgeldin!</span> <span class="text-green">@${username}</span></div>
            <div class="user-username" id="spotify-status" data-i18n="spotifyConnecting">Spotify'a bağlanılıyor...</div>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="lang-toggle-btn" id="lang-btn" title="Language">${getLang().toUpperCase()}</button>
          <button class="btn btn-secondary btn-sm" id="settings-btn" title="Ayarlar">⚙️</button>
          <button class="btn btn-secondary btn-sm" id="logout-btn" title="Çıkış" data-i18n="logoutBtn">Çıkış</button>
        </div>
      </header>

      <!-- 3 COLUMN CONTENT -->
      <main class="main-content" id="main-content">
        
        <!-- LEFT: HISTORY & MEMORY -->
        <aside class="panel" id="left-panel">
          <div class="panel-header" data-i18n="memoryHistory">Hafıza & Geçmiş</div>
          <div class="panel-body">
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary)" data-i18n="bannedList">KARA LİSTE (ASLA ÖNERİLMEZ)</div>
            <div id="banned-list-container" class="banned-list"></div>
            
            <hr style="border:none;border-top:1px dashed var(--border);margin:8px 0"/>
            
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary);display:flex;justify-content:space-between">
              <span data-i18n="savedLists">KAYITLI LİSTELER</span>
              <button id="new-list-btn" style="color:var(--green);font-weight:bold" data-i18n="newBtn">+ Yeni</button>
            </div>
            <div id="history-list-container" class="history-list"></div>
          </div>
          <div style="margin-top:auto; font-size:10px; color:var(--text-muted); text-align:center; padding-top:16px;" data-i18n="allRights">
            &copy; All rights reserved FeWare to FeList
          </div>
        </aside>

        <!-- CENTER: PLAYLIST EDITOR -->
        <section class="panel" style="background:transparent;border:none;display:flex;flex-direction:column;gap:16px;">
          <div class="creator-card glass" style="flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px;">
            <div class="results-header" style="display:flex;align-items:center;justify-content:space-between;">
              <div>
                <h2 class="creator-title" id="center-title"><span data-i18n="newPlaylistTitle">Yeni Playlist</span> <span>🎵</span></h2>
                <p class="creator-subtitle" id="center-subtitle" data-i18n="newPlaylistSub">Sağdaki ajana ne tarz müzik istediğini yazarak başla.</p>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                <label style="font-size:12px;color:var(--text-muted)"><span data-i18n="songCountLabel">Sayı:</span> <span id="song-count-display" style="color:#fff;font-weight:bold;">15</span></label>
                <input type="range" id="song-count-input" value="15" min="5" max="50" style="width:80px;" />
              </div>
            </div>
            
            <div class="song-list" id="song-list">
              <div style="text-align:center;padding:40px;color:var(--text-muted);opacity:0.8;">
                <div class="empty-visualizer">
                  <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                </div>
                <span data-i18n="waitingAgent">Ajan komutlarını bekliyor...<br/>Sohbete bir şeyler yaz.</span>
              </div>
            </div>
          </div>
          <button class="btn btn-spotify btn-full btn-lg" id="add-to-spotify-btn" style="display:none;flex-shrink:0;">
            ${spotifyIcon(20)} <span data-i18n="createSpotifyBtn">Spotify'da Oluştur</span>
          </button>
        </section>

        <!-- RIGHT: AI AGENT CHAT -->
        <aside class="panel" id="right-panel">
          <div class="panel-header">
            <span data-i18n="agentChatTitle">Ajan İletişimi</span>
            <span style="font-size:12px;font-weight:normal;color:var(--green)" data-i18n="online">Çevrimiçi 🟢</span>
          </div>
          <div class="chat-messages" id="chat-messages">
            <div class="chat-msg agent">${t('agentGreeting', {username})}</div>
          </div>
          <div class="quick-chips">
            <button class="chip" data-cmd="Pop">Pop</button>
            <button class="chip" data-cmd="Lo-fi Beats">Lo-fi Beats</button>
            <button class="chip" data-cmd="Workout">Workout</button>
            <button class="chip" data-cmd="Dark Techno">Dark Techno</button>
          </div>
          <div class="chat-input-area">
            <input type="text" id="chat-input" class="chat-input" data-i18n-placeholder="chatPlaceholder" placeholder="Şarkı ekle, çıkar, sevmediğini söyle..." />
            <button id="chat-send-btn" class="chat-send-btn">➤</button>
          </div>
        </aside>

      </main>
    </div>
  `;

  // Bindings
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const songListEl = document.getElementById('song-list');
  const addBtn = document.getElementById('add-to-spotify-btn');
  const songCountInput = document.getElementById('song-count-input');
  const bannedListContainer = document.getElementById('banned-list-container');
  const historyListContainer = document.getElementById('history-list-container');
  const centerTitle = document.getElementById('center-title');
  const centerSubtitle = document.getElementById('center-subtitle');

  updateSpotifyStatus();
  renderLeftPanel();
  updateDOMStrings(); // Initialize strings

  // Language Switcher Logic
  const langBtn = document.getElementById('lang-btn');
  langBtn.addEventListener('click', () => {
    langBtn.classList.add('flip');
    document.body.classList.add('lang-switching');
    
    setTimeout(() => {
      const current = getLang();
      const next = current === 'tr' ? 'en' : 'tr';
      setLang(next);
      langBtn.textContent = next.toUpperCase();
      
      // Update DOM
      updateDOMStrings();
      updateSpotifyStatus();
      renderLeftPanel();
      
      langBtn.classList.remove('flip');
      document.body.classList.remove('lang-switching');
    }, 300);
  });

  // Slider Display Update
  songCountInput.addEventListener('input', (e) => {
    document.getElementById('song-count-display').textContent = e.target.value;
  });

  // Quick Chips Click Event
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const cmd = e.target.getAttribute('data-cmd');
      chatInput.value = cmd;
      handleChatSend();
    });
  });

  // Chat Enter Key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSend();
  });
  chatSendBtn.addEventListener('click', handleChatSend);

  // New List
  document.getElementById('new-list-btn').addEventListener('click', () => {
    currentSongs = [];
    currentActiveId = null;
    centerTitle.innerHTML = `<span data-i18n="newPlaylistTitle">${t('newPlaylistTitle')}</span> <span>🎵</span>`;
    centerSubtitle.innerHTML = `<span data-i18n="newPlaylistSub">${t('newPlaylistSub')}</span>`;
    songListEl.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted);opacity:0.8;">
        <div class="empty-visualizer">
          <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
        </div>
        <span data-i18n="waitingAgent">${t('waitingAgent')}</span>
      </div>
    `;
    addBtn.style.display = 'none';
    chatMessages.innerHTML = `<div class="chat-msg agent">Yeni bir sayfa açtık. Hangi tarzla başlayalım?</div>`;
    renderLeftPanel();
  });

  // Spotify Export
  addBtn.addEventListener('click', () => {
    const history = storage.getHistory();
    const item = history.find(h => h.id === currentActiveId);
    if (item && item.playlist_id) {
      showPlaylistEditorModal(item.playlist_id);
    } else {
      showPlaylistEditorModal(null);
    }
  });

  // Settings & Logout (same as before)
  document.getElementById('settings-btn').addEventListener('click', showSettingsModal);
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm(t('confirmLogout'))) {
      storage.clearAll();
      onLogout();
    }
  });

  // --- Handlers ---

  async function handleChatSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add user message to UI
    appendChatMsg('user', text);
    chatInput.value = '';
    chatInput.disabled = true;
    chatSendBtn.disabled = true;

    // Add thinking placeholder
    const thoughtId = 'thought-' + Date.now();
    const thoughtHtml = `<div class="agent-thoughts" id="${thoughtId}">
      <div class="agent-thought-line">${t('systemAnalyzing')}</div>
    </div>`;
    appendRawHtml(thoughtHtml);
    const thoughtBox = document.getElementById(thoughtId);

    try {
      const count = parseInt(songCountInput.value) || 10;
      
      // Simulate thought steps
      setTimeout(() => { if(thoughtBox) thoughtBox.innerHTML += `<div class="agent-thought-line">${t('apiConnecting')}</div>`; }, 800);
      
      const response = await chatWithAgent(text, currentSongs, count);
      
      // Render actual thoughts returned by AI if any
      if (response.agent_thoughts && Array.isArray(response.agent_thoughts)) {
        thoughtBox.innerHTML = response.agent_thoughts.map(tStr => `<div class="agent-thought-line">${escHtml(tStr)}</div>`).join('');
      } else {
        thoughtBox.innerHTML += `<div class="agent-thought-line">${t('processComplete')}</div>`;
      }

      // Render agent text message
      if (response.agent_message) {
        appendChatMsg('agent', response.agent_message);
      }

      // Update current songs
      if (response.songs && Array.isArray(response.songs)) {
        currentSongs = response.songs.map(s => ({ ...s, uri: null, found: null }));
        renderSongList();
        
        // Save to history
        const id = currentActiveId || Date.now().toString();
        currentActiveId = id;
        storage.saveToHistory({
          id,
          desc: text,
          songs: currentSongs,
          created_at: new Date().toISOString()
        });
        centerTitle.innerHTML = `Önerilen Liste <span>🎵</span>`;
        centerSubtitle.textContent = `Son komut: "${text}"`;
      }

      // Re-render left panel for ban list & history updates
      renderLeftPanel();

    } catch (err) {
      thoughtBox.innerHTML += `<div class="agent-thought-line" style="color:var(--pink)">Hata: ${escHtml(err.message)}</div>`;
      appendChatMsg('agent', `Üzgünüm, bir hata oluştu: ${err.message}`);
    } finally {
      chatInput.disabled = false;
      chatSendBtn.disabled = false;
      chatInput.focus();
    }
  }

  function appendChatMsg(role, text) {
    const el = document.createElement('div');
    el.className = `chat-msg ${role}`;
    el.textContent = text;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function appendRawHtml(html) {
    const el = document.createElement('div');
    el.innerHTML = html;
    chatMessages.appendChild(el.firstElementChild);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderSongList() {
    if (currentSongs.length === 0) {
      addBtn.style.display = 'none';
      songListEl.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted);opacity:0.8;">
          <div class="empty-visualizer">
            <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
          </div>
          <span data-i18n="emptyList">${t('emptyList')}</span>
        </div>`;
      return;
    }
    
    addBtn.style.display = 'flex';
    
    // Eğer halihazırda oluşturulmuş bir listeyse, dev yeşil butonu "Düzenle" butonuna çevir
    const history = storage.getHistory();
    const item = history.find(h => h.id === currentActiveId);
    if (item && item.playlist_id) {
      addBtn.innerHTML = t('editSpotifyBtn');
      addBtn.style.background = 'var(--pink)';
      addBtn.style.color = '#fff';
      addBtn.style.boxShadow = '0 8px 24px rgba(236, 72, 153, 0.3)';
    } else {
      addBtn.innerHTML = `${spotifyIcon(20)} <span data-i18n="createSpotifyBtn">${t('createSpotifyBtn')}</span>`;
      addBtn.style.background = 'var(--green)';
      addBtn.style.color = '#000';
      addBtn.style.boxShadow = '0 8px 24px rgba(29, 185, 84, 0.3)';
    }

    songListEl.innerHTML = currentSongs.map((s, i) => `
      <div class="song-card" id="song-${i}">
        <div class="song-num">${i + 1}</div>
        <div class="song-info">
          <div class="song-title">${escHtml(s.title)}</div>
          <div class="song-artist">${escHtml(s.artist)}</div>
        </div>
        <div class="song-status">🎵</div>
        <button class="song-delete-btn" data-index="${i}" title="Sil">🗑️</button>
      </div>
    `).join('');

    // Bind delete buttons
    songListEl.querySelectorAll('.song-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        currentSongs.splice(idx, 1);
        renderSongList();
        
        // Update history silently
        if (currentActiveId) {
          storage.saveToHistory({
            id: currentActiveId,
            desc: centerSubtitle.textContent.replace('Son komut: ', '').replace(/"/g, ''),
            songs: currentSongs,
            created_at: new Date().toISOString(),
            playlist_id: item ? item.playlist_id : null
          });
        }
      });
    });
  }

  function renderLeftPanel() {
    // Render Banned Artists
    const banned = storage.getBannedArtists();
    if (banned.length === 0) {
      bannedListContainer.innerHTML = `<span style="font-size:11px;color:var(--text-muted)" data-i18n="emptyBanned">${t('emptyBanned')}</span>`;
    } else {
      bannedListContainer.innerHTML = banned.map(artist => `
        <div class="banned-tag">
          ${escHtml(artist)}
          <button data-artist="${escHtml(artist)}" class="unban-btn">✕</button>
        </div>
      `).join('');
      
      // Bind unban buttons
      bannedListContainer.querySelectorAll('.unban-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const a = e.target.getAttribute('data-artist');
          storage.removeBannedArtist(a);
          renderLeftPanel();
        });
      });
    }

    // Render History
    const history = storage.getHistory();
    if (history.length === 0) {
      historyListContainer.innerHTML = `<span style="font-size:11px;color:var(--text-muted)" data-i18n="emptyHistory">${t('emptyHistory')}</span>`;
    } else {
      historyListContainer.innerHTML = history.map(h => `
        <div class="history-item ${h.id === currentActiveId ? 'active' : ''}" data-id="${h.id}" style="position:relative; padding-right: 32px;">
          <div class="history-title">${escHtml(h.desc).slice(0, 30)}${h.desc.length > 30 ? '...' : ''}</div>
          <div class="history-meta">
            <span>${h.songs.length} <span data-i18n="songsCount">${t('songsCount')}</span></span>
            <span>${new Date(h.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
          <button class="history-delete-btn" data-id="${h.id}" title="Geçmişten Sil" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; border-radius:4px; cursor:pointer; padding:4px;">🗑️</button>
        </div>
      `).join('');

      historyListContainer.querySelectorAll('.history-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // prevent opening the list
          if (confirm("Bu listeyi geçmişten silmek istediğine emin misin?")) {
            const id = e.currentTarget.getAttribute('data-id');
            storage.deleteFromHistory(id);
            if (currentActiveId === id) {
              currentActiveId = null; // de-activate
            }
            renderLeftPanel();
          }
        });
      });

      historyListContainer.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          loadHistory(id);
        });
      });
    }
  }

  function loadHistory(id) {
    const history = storage.getHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;

    currentActiveId = id;
    currentSongs = item.songs;
    
    centerTitle.innerHTML = `Önerilen Liste <span>🎵</span>`;
    centerSubtitle.textContent = `Son komut: "${item.desc}"`;
    renderSongList();
    renderLeftPanel();

    chatMessages.innerHTML = '';
    appendChatMsg('agent', `"${item.desc}" listesini hafızadan geri yükledim. Bu listede bir şey değiştirmemi ister misin?`);
  }

  // --- Editor & Spotify Logic ---

  function showPlaylistEditorModal(existingPlaylistId = null) {
    if (!storage.isSpotifyTokenValid() && !storage.getSpotifyRefreshToken()) {
      showToast('Spotify oturumu sona erdi. Lütfen ayarlar üzerinden tekrar giriş yap.', 'error');
      return;
    }

    const existing = document.getElementById('editor-modal');
    if (existing) existing.remove();

    const defaultName = centerSubtitle.textContent.replace('Son komut: ', '').replace(/"/g, '') || 'AI Playlist';
    
    const modal = document.createElement('div');
    modal.id = 'editor-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="editor-modal">
        <div class="editor-header">
          <h3><span data-i18n="coverEditorTitle">${t('coverEditorTitle')}</span></h3>
          <button class="editor-close" id="editor-close-btn">&times;</button>
        </div>
        <div class="editor-body">
          
          <!-- LEFT SIDEBAR: TOOLS -->
          <div class="editor-sidebar">
            <div class="tool-section">
              <label data-i18n="playlistNameLabel">${t('playlistNameLabel')}</label>
              <input type="text" id="edit-pl-name" class="input" value="${escHtml(defaultName.slice(0, 40))} 🎵" />
            </div>
            <div class="tool-section">
              <label data-i18n="playlistDescLabel">${t('playlistDescLabel')}</label>
              <textarea id="edit-pl-desc" class="input" rows="2">FeList Ajanı tarafından oluşturuldu.</textarea>
            </div>
            
            <hr style="border:none;border-top:1px dashed var(--border);margin:4px 0" />
            
            <div class="tool-section">
              <label data-i18n="bgColorLabel">${t('bgColorLabel')}</label>
              <div class="color-picker-row">
                <div class="color-btn active" style="background:#1DB954" data-color="#1DB954"></div>
                <div class="color-btn" style="background:#7C3AED" data-color="#7C3AED"></div>
                <div class="color-btn" style="background:#EC4899" data-color="#EC4899"></div>
                <div class="color-btn" style="background:#FF5500" data-color="#FF5500"></div>
                <div class="color-btn" style="background:#111111" data-color="#111111"></div>
                <div class="color-btn" style="background:#000000" data-color="#000000"></div>
              </div>
            </div>
            
            <div class="tool-section">
              <label data-i18n="coverTextLabel">${t('coverTextLabel')}</label>
              <input type="text" id="edit-cover-text" class="input" data-i18n-placeholder="coverTextPlaceholder" placeholder="Kapakta görünecek yazı..." value="${escHtml(defaultName.slice(0,15))}" />
            </div>

            <div class="tool-section">
              <label data-i18n="stickerLabel">${t('stickerLabel')}</label>
              <div class="sticker-row">
                <button class="sticker-btn">🎵</button>
                <button class="sticker-btn">🔥</button>
                <button class="sticker-btn">🎧</button>
                <button class="sticker-btn">🌟</button>
                <button class="sticker-btn">🎸</button>
                <button class="sticker-btn">👽</button>
              </div>
              <button class="btn btn-secondary btn-sm mt-4" id="clear-stickers-btn" data-i18n="clearStickers">${t('clearStickers')}</button>
            </div>
          </div>
          
          <!-- RIGHT SIDE: CANVAS -->
          <div class="editor-canvas-area">
            <div class="canvas-wrapper">
              <canvas id="cover-canvas" width="500" height="500"></canvas>
            </div>
          </div>
        </div>
        
        <div class="editor-footer">
          <button class="btn btn-secondary" id="editor-cancel-btn" data-i18n="cancelBtn">${t('cancelBtn')}</button>
          <button class="btn btn-spotify" id="editor-save-btn">${spotifyIcon(18)} ${existingPlaylistId ? `<span data-i18n="updateBtn">${t('updateBtn')}</span>` : `<span data-i18n="savePublishBtn">${t('savePublishBtn')}</span>`}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Canvas Logic
    const canvas = document.getElementById('cover-canvas');
    const ctx = canvas.getContext('2d');
    
    let canvasState = {
      bgColor: '#1DB954',
      text: document.getElementById('edit-cover-text').value,
      stickers: []
    };

    function drawCanvas() {
      ctx.fillStyle = canvasState.bgColor;
      ctx.fillRect(0, 0, 500, 500);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      canvasState.stickers.forEach(s => {
        ctx.font = '60px Arial';
        ctx.fillText(s.char, s.x, s.y);
      });

      if (canvasState.text) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 200, 500, 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(canvasState.text.toUpperCase(), 250, 250);
      }
    }
    
    drawCanvas();

    document.getElementById('edit-cover-text').addEventListener('input', (e) => {
      canvasState.text = e.target.value;
      drawCanvas();
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        canvasState.bgColor = e.target.getAttribute('data-color');
        drawCanvas();
      });
    });

    document.querySelectorAll('.sticker-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const char = e.target.textContent;
        canvasState.stickers.push({
          char,
          x: 50 + Math.random() * 400,
          y: 50 + Math.random() * 400
        });
        drawCanvas();
      });
    });

    document.getElementById('clear-stickers-btn').addEventListener('click', () => {
      canvasState.stickers = [];
      drawCanvas();
    });

    const closeMod = () => modal.remove();
    document.getElementById('editor-close-btn').addEventListener('click', closeMod);
    document.getElementById('editor-cancel-btn').addEventListener('click', closeMod);

    document.getElementById('editor-save-btn').addEventListener('click', () => {
      const name = document.getElementById('edit-pl-name').value.trim();
      const desc = document.getElementById('edit-pl-desc').value.trim();
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = dataUrl.split(',')[1];
      
      modal.remove();
      if (existingPlaylistId) {
        handleUpdateExistingPlaylist(existingPlaylistId, name, desc, base64Data);
      } else {
        handleAddToSpotifyWithDetails(name, desc, base64Data);
      }
    });
  }

  async function handleAddToSpotifyWithDetails(name, description, base64Image) {
    const loader = showLoader(t('searchingSpotify'), `0 / ${currentSongs.length}`);
    addBtn.disabled = true;

    try {
      let found = 0;
      const uris = [];

      // 1. Search tracks
      for (let i = 0; i < currentSongs.length; i++) {
        const song = currentSongs[i];
        const card = document.getElementById(`song-${i}`);
        if (card) { card.querySelector('.song-status').textContent = '🔍'; card.classList.add('searching'); }

        loader.update(t('searchingSpotify'), `${i + 1} / ${currentSongs.length}`);
        loader.setProgress(((i + 1) / currentSongs.length) * 40);

        try {
          const track = await searchTrack(song.title, song.artist);
          if (track) {
            currentSongs[i].uri = track.uri; currentSongs[i].found = true;
            uris.push(track.uri); found++;
            if (card) { card.querySelector('.song-status').textContent = '✅'; card.classList.remove('searching'); card.classList.add('found'); }
          } else {
            currentSongs[i].found = false;
            if (card) { card.querySelector('.song-status').textContent = '❌'; card.classList.remove('searching'); card.classList.add('not-found'); }
          }
        } catch {
          if (card) { card.querySelector('.song-status').textContent = '❌'; card.classList.remove('searching'); card.classList.add('not-found'); }
        }
        await sleep(100);
      }

      if (uris.length === 0) throw new Error('No tracks found.');

      // 2. Create Playlist
      loader.update(t('creatingPlaylist'), `${found} ${t('songsFound')}`);
      loader.setProgress(50);
      const playlist = await createPlaylist(name || 'AI Playlist', description);

      // 3. Upload Cover Image (if supported)
      if (base64Image) {
        loader.update(t('uploadingCover'), '');
        loader.setProgress(70);
        try {
          const { uploadPlaylistCover } = await import('../spotify.js');
          await uploadPlaylistCover(playlist.id, base64Image);
        } catch (imgErr) {
          console.warn("Cover image upload failed:", imgErr);
          // Don't throw, just show warning. The playlist is still created.
          showToast(t('coverUploadFailed'), 'info');
        }
      }

      // 4. Add tracks
      loader.update(t('addingSongs'), '');
      loader.setProgress(90);
      await addTracksToPlaylist(playlist.id, uris);

      // Save playlist_id to history so it can be edited later
      if (currentActiveId) {
        storage.saveToHistory({
          id: currentActiveId,
          desc: centerSubtitle.textContent.replace('Son komut: ', '').replace(/"/g, ''),
          songs: currentSongs,
          created_at: new Date().toISOString(),
          playlist_id: playlist.id,
          playlist_url: playlist.external_urls.spotify
        });
        renderLeftPanel();
      }

      loader.setProgress(100);
      loader.hide();

      showToast(`✅ ${found} ${t('successAdded')}`, 'success');
      appendRawHtml(`<a href="${playlist.external_urls.spotify}" target="_blank" class="playlist-link-btn" style="margin:10px 16px; align-self:flex-start;">${spotifyIcon(16)} ${t('openInSpotify')}</a>`);

    } catch (e) {
      loader.hide();
      showToast(e.message, 'error', 5000);
    } finally {
      addBtn.disabled = false;
    }
  }

  async function handleUpdateExistingPlaylist(playlistId, name, description, base64Image) {
    const loader = showLoader(t('updatingPlaylist'), t('sendingDetails'));
    try {
      const { updatePlaylistDetails, uploadPlaylistCover } = await import('../spotify.js');
      
      loader.setProgress(40);
      await updatePlaylistDetails(playlistId, name, description);
      
      if (base64Image) {
        loader.update(t('updatingCover'), '');
        loader.setProgress(70);
        await uploadPlaylistCover(playlistId, base64Image);
      }
      
      loader.setProgress(100);
      loader.hide();
      
      showToast(`✅ ${t('playlistUpdatedSuccess')}`, 'success');
    } catch (e) {
      loader.hide();
      showToast(e.message, 'error', 5000);
    }
  }

  function updateSpotifyStatus() {
    const statusEl = document.getElementById('spotify-status');
    if (!statusEl) return;
    if (storage.isSpotifyTokenValid()) {
      statusEl.textContent = t('spotifyConnected');
      statusEl.style.color = 'var(--green)';
    } else {
      statusEl.textContent = t('spotifyDisconnected');
      statusEl.style.color = 'var(--pink)';
    }
  }

  function showSettingsModal() {
    const existing = document.getElementById('settings-modal');
    if (existing) { existing.remove(); return; }

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.style.cssText = `position:fixed; inset:0; z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);`;
    modal.innerHTML = `
      <div class="glass" style="max-width:440px;width:100%;padding:32px;display:flex;flex-direction:column;gap:20px;animation:slideUp 0.3s var(--ease-spring)">
        <h3 style="font-size:20px;font-weight:700"><span data-i18n="settingsTitle">${t('settingsTitle')}</span></h3>
        <div class="form-group">
          <label data-i18n="geminiKey">${t('geminiKey')}</label>
          <div class="input-wrapper">
            <input id="settings-gemini" class="input input-password" type="password" value="${storage.getGeminiKey() || ''}" placeholder="AIza..."/>
            <button class="input-eye" id="toggle-settings-eye">👁️</button>
          </div>
        </div>
        <div class="form-group">
          <label data-i18n="spotifyClientId">${t('spotifyClientId')}</label>
          <input id="settings-client-id" class="input" type="text" value="${storage.getSpotifyClientId() || ''}" placeholder="Spotify Client ID"/>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button id="settings-save-btn" class="btn btn-primary" style="flex:1" data-i18n="saveBtn">${t('saveBtn')}</button>
          <button id="settings-close-btn" class="btn btn-secondary" data-i18n="cancelBtn">${t('cancelBtn')}</button>
        </div>
        <button id="settings-re-spotify-btn" class="btn btn-spotify btn-full">${spotifyIcon(16)} <span data-i18n="reconnectSpotify">${t('reconnectSpotify')}</span></button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('toggle-settings-eye').addEventListener('click', () => {
      const inp = document.getElementById('settings-gemini');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
    document.getElementById('settings-save-btn').addEventListener('click', () => {
      storage.setGeminiKey(document.getElementById('settings-gemini').value.trim());
      storage.setSpotifyClientId(document.getElementById('settings-client-id').value.trim());
      showToast(t('settingsSaved'), 'success');
      modal.remove();
    });
    document.getElementById('settings-close-btn').addEventListener('click', () => modal.remove());
    document.getElementById('settings-re-spotify-btn').addEventListener('click', async () => {
      storage.clearSpotifyAuth();
      modal.remove();
      const { initiateSpotifyLogin: login } = await import('../spotify.js');
      try { await login(); } catch (e) { showToast(e.message, 'error'); }
    });
  }
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
