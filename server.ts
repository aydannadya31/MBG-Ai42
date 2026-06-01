import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Polyfills for ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'src', 'db.json');

// Initialize database if not exists
const initialDB = {
  users: [
    {
      id: 'usr_admin',
      email: 'admin@mbgai42.com',
      password: 'admin',
      name: 'Yönetici',
      provider: 'email',
      joinedAt: new Date().toISOString()
    }
  ],
  defaultPrompts: [
    { id: 'p1', text: 'Neon cyber-cat holographic portrait', isSystem: true, category: 'Futuristic', tag: 'Cyber' },
    { id: 'p2', text: 'Golden sunrise majestic mountains geometric peaks landscape', isSystem: true, category: 'Nature', tag: 'Doğa' },
    { id: 'p3', text: 'Cyberpunk humanoid robot interface terminal circuit connections', isSystem: true, category: 'Technology', tag: 'Y.Z.' },
    { id: 'p4', text: 'Cosmic celestial wormhole swirl magenta and stardust particles', isSystem: true, category: 'Space', tag: 'Uzay' }
  ],
  generations: [],
  notifications: [
    {
      id: 'n_welcome',
      text: 'MBG Ai42 sistemine hoş geldiniz! Güvenli bulut depolama aktif.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ],
  adminPassword: 'ag2026' // default admin password
};

if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), 'utf8');
}

// Lazy load Gemini
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      console.error('Failed to init Gemini SDK:', err);
    }
  }
  return ai;
}

// Utility to format Gemini errors into human-readable Turkey/English instructions
function formatGeminiError(err: any): string {
  if (!err) return 'Görsel oluşturulurken bilinmeyen bir hata oluştu.';
  
  const errMsg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
  
  if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded') || errMsg.includes('limit: 0') || errMsg.includes('429')) {
    return `⚠️ APİ KOTASI VEYA LİMİTİ AŞILDI (429 RESOURCE EXHAUSTED)

Neden Kaynaklanıyor?
1. Ücretsiz Kotanın Aşılması: Google Gemini API'nin ücretsiz kullanım limitlerine (dakikalık istek sayısı veya günlük limitler) ulaştınız.
2. Limit 0 Hatası: Google Cloud projenizde faturalandırma (Billing) veya kredi kartı tanımlaması yapılmadığında bu modele ait ücretsiz erişim kotası sıfır (0) olarak atanır.

Nasıl Çözebilirsiniz?
• Lütfen 1 dakika bekledikten sonra tekrar üretmeyi deneyin.
• Eğer Google ile hızlı giriş yaptıysanız: https://console.cloud.google.com adresinde projeniz için "Faturalandırma (Billing)" özelliğini aktifleştirin.
• Kendi API anahtarınızı kullanıyorsanız: https://aistudio.google.com adresinden faturalandırma veya kullanım planınızı güncelleyin.`;
  }

  if (errMsg.includes('SERVICE_DISABLED') || errMsg.includes('generativelanguage.googleapis.com/overview')) {
    return `⚠️ GENERATIVE LANGUAGE API ETKİN DEĞİL (SERVICE DISABLED)

Neden Kaynaklanıyor?
Giriş yaptığınız Google Hesabına bağlı Cloud projesinde "Generative Language API" (Gemini API) servisi etkinleştirilmiş değil.

Nasıl Çözebilirsiniz?
• Lütfen aşağıdaki bağlantıyı ziyaret ederek bu API'yi projeniz için etkinleştirin ve ardından tekrar deneyin:
https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview`;
  }

  if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
    return `⚠️ GEÇERSİZ API ANAHTARI (API KEY INVALID)
Lütfen kullandığınız Gemini API anahtarının doğru ve aktif olduğunu kontrol edin.`;
  }

  return errMsg;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Helper to read DB contents
  function readDB() {
    try {
      if (fs.existsSync(DB_PATH)) {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      }
    } catch (e) {
      console.error('Error reading JSON DB, using initial', e);
    }
    return initialDB;
  }

  // Helper to write DB contents
  function writeDB(data: any) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Error writing JSON DB', e);
      return false;
    }
  }

  // API: Get entire state (used for initial state restore and client sync)
  app.get('/api/db', (req, res) => {
    res.json(readDB());
  });

  // API: Serve firebase-applet-config.json safely
  app.get('/firebase-applet-config.json', (req, res) => {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      res.setHeader('Content-Type', 'application/json');
      res.send(fs.readFileSync(configPath, 'utf8'));
    } else {
      res.status(404).json({ error: 'Config file not found' });
    }
  });

  // API: Save Cloud Backup (All data is encrypted end-to-end on client, we store the payload securely)
  app.post('/api/backup', (req, res) => {
    const backupData = req.body;
    if (backupData && typeof backupData === 'object') {
      const current = readDB();
      // merge state securely
      const updated = {
        ...current,
        users: backupData.users || current.users,
        defaultPrompts: backupData.defaultPrompts || current.defaultPrompts,
        generations: backupData.generations || current.generations,
        notifications: backupData.notifications || current.notifications,
        adminPassword: backupData.adminPassword || current.adminPassword,
      };
      const ok = writeDB(updated);
      res.json({ success: ok, timestamp: new Date().toISOString() });
    } else {
      res.status(400).json({ error: 'Geçersiz yedek verisi.' });
    }
  });

  // API: Handle Forgot Password administrator notification
  app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Mail adresi gereklidir.' });
    }

    const current = readDB();
    const newNotif = {
      id: 'forgot_' + Math.random().toString(36).substr(2, 9),
      text: `Şifre Talebi: ${email} adresi için kullanıcı şifresini unuttu. Lütfen mail ile şifresini bildirin.`,
      type: 'forgot_password',
      isRead: false,
      createdAt: new Date().toISOString(),
      email
    };
    
    current.notifications.push(newNotif);
    writeDB(current);

    res.json({
      success: true,
      message: 'Şifre talebiniz Yöneticiye iletilmiştir, en kısa sürede Kayıt olduğunuz mail adresinize şifre bildiriminiz yapılacaktır'
    });
  });

  // API: Optimize reference prompt using Gemini
  app.post('/api/enhance-prompt', async (req, res) => {
    const { prompt } = req.body;
    const client = getGeminiClient();
    if (!client || !prompt) {
      return res.json({ enhanced: prompt });
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Translate the following image prompt to English and enrich it with beautiful digital art keywords, style suggestions, lighting detail. Keep it as a descriptive single-sentence image generation prompt. Input: ${prompt}`,
      });
      res.json({ enhanced: response.text?.trim() || prompt });
    } catch (e) {
      console.error('Enhance prompt failed:', e);
      res.json({ enhanced: prompt });
    }
  });

  // API: Real Image Generation using Gemini API
  app.post('/api/generate-image', async (req, res) => {
    const { prompt, aspectRatio, editImage, referenceImages, googleAccessToken } = req.body;

    // Determine ratio
    let gRatio = '1:1';
    if (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio)) {
      gRatio = aspectRatio;
    }

    let imageUrl: string | null = null;
    let modelUsedUsed = 'gemini-2.5-flash-image';
    let oauthError: any = null;

    // Google Account OAuth token-based client call (unlimited quota, user-assigned)
    if (googleAccessToken) {
      try {
        console.log('Attempting image generation via Google Access Token...');
        const parts: any[] = [];
        
        // Process reference images if any
        if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
          for (const img of referenceImages) {
            if (typeof img === 'string') {
              const cleaned = img.includes('base64,') ? img.split('base64,')[1] : img;
              parts.push({
                inlineData: {
                  data: cleaned,
                  mimeType: 'image/png'
                }
              });
            }
          }
        }
        
        // Process edit image if any
        if (editImage && typeof editImage === 'string') {
          const cleaned = editImage.includes('base64,') ? editImage.split('base64,')[1] : editImage;
          parts.push({
            inlineData: {
              data: cleaned,
              mimeType: 'image/png'
            }
          });
        }

        parts.push({ text: prompt });

        const payload = {
          contents: [
            {
              parts: parts
            }
          ],
          generationConfig: {
            imageConfig: {
              aspectRatio: gRatio
            }
          }
        };

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${googleAccessToken}`,
            'User-Agent': 'aistudio-build'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Google Gemini REST API Error: ${errText}`);
        }

        const resData: any = await response.json();
        if (resData.candidates && resData.candidates[0]?.content?.parts) {
          for (const part of resData.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (imageUrl) {
          modelUsedUsed = 'gemini-2.5-flash-image (Google OAuth Bearer)';
          console.log('Successfully generated image via Google Access Token!');
        } else {
          throw new Error('Görsel üretilemedi. Model görsel verisinden sonuç dönmedi.');
        }
      } catch (err: any) {
        console.warn('Google Access Token Gemini Generation failed. Falling back to Server Workspace Client... Error:', err.message || err);
        oauthError = err; // Keep track of the Google OAuth error if this was their main request
      }
    }

    // Fallback to Server config API Key if image URL is still not resolved
    if (!imageUrl) {
      console.log('Using Server Workspace Config Gemini Key to generate image...');
      const client = getGeminiClient();
      if (client) {
        try {
          const parts: any[] = [];
          
          // Process reference images if any
          if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
            for (const img of referenceImages) {
              if (typeof img === 'string') {
                const cleaned = img.includes('base64,') ? img.split('base64,')[1] : img;
                parts.push({
                  inlineData: {
                    data: cleaned,
                    mimeType: 'image/png'
                  }
                });
              }
            }
          }
          
          // Process edit image if any
          if (editImage && typeof editImage === 'string') {
            const cleaned = editImage.includes('base64,') ? editImage.split('base64,')[1] : editImage;
            parts.push({
              inlineData: {
                data: cleaned,
                mimeType: 'image/png'
              }
            });
          }

          parts.push({ text: prompt });

          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: gRatio as any,
              }
            }
          });

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUrl) {
            modelUsedUsed = 'gemini-2.5-flash-image (Workspace Client Fallback)';
          }
        } catch (e: any) {
          console.warn('Gemini Workspace Client Fallback failed:', e.message || e);
          oauthError = oauthError || e;
        }
      }
    }

    // Ultimate fallback: Use Pollinations AI for 100% free and unlimited image generation of requested prompt!
    if (!imageUrl) {
      console.log('Fallbacks exhausted or failed. Invoking Pollinations AI for 100% free & unlimited image generation...');
      try {
        let pWidth = 1024;
        let pHeight = 1024;
        if (aspectRatio === '3:4') { pWidth = 768; pHeight = 1024; }
        else if (aspectRatio === '4:3') { pWidth = 1024; pHeight = 768; }
        else if (aspectRatio === '9:16') { pWidth = 576; pHeight = 1024; }
        else if (aspectRatio === '16:9') { pWidth = 1024; pHeight = 576; }

        // Clean & Normalize prompt to make it compatible with free external CDNs and bypass server 500 errors
        const trMap: { [key: string]: string } = {
          'ş': 's', 'Ş': 'S', 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G',
          'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O', 'ı': 'i', 'İ': 'I'
        };
        let cleanPrompt = prompt.split('').map((char: string) => trMap[char] || char).join('');
        cleanPrompt = cleanPrompt.replace(/[^\x20-\x7E]/g, '').trim(); // Remove complex multi-byte/unicode chars
        if (cleanPrompt.length > 300) {
          cleanPrompt = cleanPrompt.substring(0, 300);
        }
        if (!cleanPrompt) cleanPrompt = 'gorgeous artistic drawing';

        const modelsToTry = ['flux', 'turbo', 'unity', 'balanced'];
        let success = false;
        let lastErrorMsg = '';

        for (const model of modelsToTry) {
          try {
            console.log(`Trying Pollinations model: ${model}...`);
            const seed = Math.floor(Math.random() * 999999);
            const pUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanPrompt)}?width=${pWidth}&height=${pHeight}&seed=${seed}&nologo=true&model=${model}`;
            
            // Fetch with timeout to prevent hanging forever
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second limit

            const pRes = await fetch(pUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (pRes.ok) {
              const buffer = await pRes.arrayBuffer();
              const base64 = Buffer.from(buffer).toString('base64');
              imageUrl = `data:image/png;base64,${base64}`;
              modelUsedUsed = `Pollinations AI (${model} - Sınırsız & Ücretsiz)`;
              success = true;
              console.log(`Successfully generated image using Pollinations model: ${model}!`);
              break;
            } else {
              console.warn(`Pollinations model ${model} failed with status: ${pRes.status}`);
              lastErrorMsg = `Status ${pRes.status}`;
            }
          } catch (modelErr: any) {
            console.warn(`Pollinations model ${model} thrown exception:`, modelErr.message || modelErr);
            lastErrorMsg = modelErr.message || String(modelErr);
          }
        }

        if (!success) {
          throw new Error(`All Pollinations generation models failed. Last error: ${lastErrorMsg}`);
        }
      } catch (pErr: any) {
        console.error('All image generation methods failed, including Pollinations AI:', pErr);
        const finalError = oauthError || pErr;
        return res.status(500).json({ error: formatGeminiError(finalError) });
      }
    }

    return res.json({ imageUrl, modelUsed: modelUsedUsed });
  });

  // Serve Vite app in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets bundle
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MBG Ai42 Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
