import { storage } from './storage.js';
import { t } from './i18n.js';

/**
 * V2 Yapay Zeka Ajanı - Sohbet ve Düzenleme
 */
export async function chatWithAgent(userMessage, currentSongs = [], count = 10) {
  const apiKey = storage.getGeminiKey();
  if (!apiKey) throw new Error('Gemini API anahtarı bulunamadı.');

  const bannedArtists = storage.getBannedArtists();
  const bannedText = bannedArtists.length > 0 
    ? `KULLANICININ SEVMEDİĞİ VE ASLA ÖNERİLMEYECEK SANATÇILAR: ${bannedArtists.join(', ')}`
    : '';

  const currentSongsText = currentSongs.length > 0
    ? `Şu anki aktif şarkı listesi:\n${currentSongs.map(s => `- ${s.title} (${s.artist})`).join('\n')}`
    : 'Şu an aktif bir liste yok, sıfırdan oluşturulacak.';

  const lang = storage.getLanguage();
  const langInstruction = lang === 'en' ? 'MUST respond in English.' : 'MUTLAKA Türkçe yanıt ver.';

  const prompt = `Sen dünya klasmanında bir müzik küratörü ve zeki bir yapay zeka asistanısın.
You ${langInstruction} (Your agent_thoughts and agent_message MUST be in ${lang === 'en' ? 'English' : 'Turkish'}).

Kullanıcının mesajı/isteği: "${userMessage}"
Hedef Şarkı Sayısı: ${count}

${bannedText}
${currentSongsText}

GÖREV:
1. Kullanıcının isteğini analiz et. Eğer belirli bir sanatçıyı, türü veya şarkıyı listenden ÇIKARMANI veya SEVMEDİĞİNİ söylüyorsa, o sanatçıyı "banned_artists_to_add" listesine ekle.
2. Kullanıcının isteğine göre mevcut listeyi düzenle (şarkı ekle/çıkar) veya yepyeni bir liste oluştur.
3. Kullanıcıya yapacağın değişiklikleri ve kendi düşüncelerini "agent_message" alanında sıcak, dostane ve profesyonel bir dille açıkla.
4. "agent_thoughts" dizisi içine sırayla yaptığın işlemleri kısa aksiyonlar olarak yaz (örneğin: ["Müzik veritabanı taranıyor...", "X sanatçısı listeden çıkarılıyor...", "Daha hareketli şarkılar seçiliyor..."])

KURALLAR:
- Şarkılar GERÇEK ve VAR OLAN şarkılar olmalı. Sanatçı isimlerini DOĞRU yaz.
- SADECE JSON formatında yanıt ver, ASLA markdown kullanma.
- YANITIN DİLİ MUTLAKA BELİRTİLEN DİL OLMALIDIR: ${lang === 'en' ? 'ENGLISH' : 'TURKISH'}.

YANIT FORMATI:
{
  "agent_thoughts": ["düşünce 1", "düşünce 2"],
  "agent_message": "Sohbet ekranında kullanıcıya gösterilecek mesaj.",
  "banned_artists_to_add": ["varsa kara listeye eklenecek sanatçılar"],
  "banned_artists_to_remove": ["varsa kara listeden çıkarılacak sanatçılar"],
  "songs": [
    {"title": "Şarkı Adı", "artist": "Sanatçı Adı"}
  ]
}`;

  // Tekrar deneme (Retry) mantığı - 503 hataları için
  let res;
  let retries = 3;
  let delay = 2000; // 2 saniye başlangıç bekleme süresi

  while (retries > 0) {
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.85,
              topP: 0.9,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  agent_thoughts: { type: "ARRAY", items: { type: "STRING" } },
                  agent_message: { type: "STRING" },
                  banned_artists_to_add: { type: "ARRAY", items: { type: "STRING" } },
                  banned_artists_to_remove: { type: "ARRAY", items: { type: "STRING" } },
                  songs: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        title: { type: "STRING" },
                        artist: { type: "STRING" }
                      },
                      required: ["title", "artist"]
                    }
                  }
                },
                required: ["agent_thoughts", "agent_message", "banned_artists_to_add", "banned_artists_to_remove", "songs"]
              }
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || 'Gemini API isteği başarısız.';
        
        // Eğer 503 veya "high demand" hatası ise
        if (res.status === 503 || msg.toLowerCase().includes('high demand')) {
          throw new Error('503_HIGH_DEMAND'); // Catch bloğuna atla
        }
        
        throw new Error(msg); // Diğer hataları direkt fırlat
      }
      
      // Başarılı olursa döngüden çık
      break;

    } catch (error) {
      if (error.message === '503_HIGH_DEMAND' && retries > 1) {
        retries--;
        console.warn(`[AI] Sunucu yoğun, ${delay/1000} saniye beklenip tekrar deneniyor... (Kalan deneme: ${retries})`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2; // Bekleme süresini katla (Exponential Backoff: 2s, 4s...)
      } else {
        // Haklar bittiyse veya farklı bir hataysa yukarı fırlat
        throw new Error(error.message === '503_HIGH_DEMAND' ? t('serverBusy') : error.message);
      }
    }
  }

  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(t('aiEmptyResponse'));

  // Markdown ve kontrol karakterleri temizliği
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  // Bazen yapay zeka JSON string'leri içine gerçek (literal) satır atlamaları koyabiliyor, bu JSON.parse'ı bozar.
  // Gerçek yeni satır (newline) karakterlerini boşluğa veya geçerli bir kaçış karakterine çeviriyoruz.
  text = text.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ');

  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("Parse hatası. Gelen metin:", text);
    const debugText = text.length > 150 ? text.substring(0, 150) + "..." : text;
    throw new Error(t('aiParseError'));
  }

  // Handle local memory automatically
  if (result.banned_artists_to_add && result.banned_artists_to_add.length > 0) {
    storage.addBannedArtists(result.banned_artists_to_add);
  }
  if (result.banned_artists_to_remove && result.banned_artists_to_remove.length > 0) {
    result.banned_artists_to_remove.forEach(a => storage.removeBannedArtist(a));
  }

  return result;
}
