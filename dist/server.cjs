var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var DB_PATH = import_path.default.join(__dirname, "src", "db.json");
var initialDB = {
  users: [
    {
      id: "usr_admin",
      email: "admin@mbgai42.com",
      password: "admin",
      name: "Y\xF6netici",
      provider: "email",
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  defaultPrompts: [
    { id: "p1", text: "Neon cyber-cat holographic portrait", isSystem: true, category: "Futuristic", tag: "Cyber" },
    { id: "p2", text: "Golden sunrise majestic mountains geometric peaks landscape", isSystem: true, category: "Nature", tag: "Do\u011Fa" },
    { id: "p3", text: "Cyberpunk humanoid robot interface terminal circuit connections", isSystem: true, category: "Technology", tag: "Y.Z." },
    { id: "p4", text: "Cosmic celestial wormhole swirl magenta and stardust particles", isSystem: true, category: "Space", tag: "Uzay" }
  ],
  generations: [],
  notifications: [
    {
      id: "n_welcome",
      text: "MBG Ai42 sistemine ho\u015F geldiniz! G\xFCvenli bulut depolama aktif.",
      type: "system",
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  adminPassword: "ag2026"
  // default admin password
};
if (!import_fs.default.existsSync(DB_PATH)) {
  import_fs.default.mkdirSync(import_path.default.dirname(DB_PATH), { recursive: true });
  import_fs.default.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), "utf8");
}
var ai = null;
function getGeminiClient() {
  if (!ai && process.env.GEMINI_API_KEY) {
    try {
      ai = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (err) {
      console.error("Failed to init Gemini SDK:", err);
    }
  }
  return ai;
}
function formatGeminiError(err) {
  if (!err) return "G\xF6rsel olu\u015Fturulurken bilinmeyen bir hata olu\u015Ftu.";
  const errMsg = typeof err === "string" ? err : err.message || JSON.stringify(err);
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded") || errMsg.includes("limit: 0") || errMsg.includes("429")) {
    return `\u26A0\uFE0F AP\u0130 KOTASI VEYA L\u0130M\u0130T\u0130 A\u015EILDI (429 RESOURCE EXHAUSTED)

Neden Kaynaklan\u0131yor?
1. \xDCcretsiz Kotan\u0131n A\u015F\u0131lmas\u0131: Google Gemini API'nin \xFCcretsiz kullan\u0131m limitlerine (dakikal\u0131k istek say\u0131s\u0131 veya g\xFCnl\xFCk limitler) ula\u015Ft\u0131n\u0131z.
2. Limit 0 Hatas\u0131: Google Cloud projenizde faturaland\u0131rma (Billing) veya kredi kart\u0131 tan\u0131mlamas\u0131 yap\u0131lmad\u0131\u011F\u0131nda bu modele ait \xFCcretsiz eri\u015Fim kotas\u0131 s\u0131f\u0131r (0) olarak atan\u0131r.

Nas\u0131l \xC7\xF6zebilirsiniz?
\u2022 L\xFCtfen 1 dakika bekledikten sonra tekrar \xFCretmeyi deneyin.
\u2022 E\u011Fer Google ile h\u0131zl\u0131 giri\u015F yapt\u0131ysan\u0131z: https://console.cloud.google.com adresinde projeniz i\xE7in "Faturaland\u0131rma (Billing)" \xF6zelli\u011Fini aktifle\u015Ftirin.
\u2022 Kendi API anahtar\u0131n\u0131z\u0131 kullan\u0131yorsan\u0131z: https://aistudio.google.com adresinden faturaland\u0131rma veya kullan\u0131m plan\u0131n\u0131z\u0131 g\xFCncelleyin.`;
  }
  if (errMsg.includes("SERVICE_DISABLED") || errMsg.includes("generativelanguage.googleapis.com/overview")) {
    return `\u26A0\uFE0F GENERATIVE LANGUAGE API ETK\u0130N DE\u011E\u0130L (SERVICE DISABLED)

Neden Kaynaklan\u0131yor?
Giri\u015F yapt\u0131\u011F\u0131n\u0131z Google Hesab\u0131na ba\u011Fl\u0131 Cloud projesinde "Generative Language API" (Gemini API) servisi etkinle\u015Ftirilmi\u015F de\u011Fil.

Nas\u0131l \xC7\xF6zebilirsiniz?
\u2022 L\xFCtfen a\u015Fa\u011F\u0131daki ba\u011Flant\u0131y\u0131 ziyaret ederek bu API'yi projeniz i\xE7in etkinle\u015Ftirin ve ard\u0131ndan tekrar deneyin:
https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview`;
  }
  if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
    return `\u26A0\uFE0F GE\xC7ERS\u0130Z API ANAHTARI (API KEY INVALID)
L\xFCtfen kulland\u0131\u011F\u0131n\u0131z Gemini API anahtar\u0131n\u0131n do\u011Fru ve aktif oldu\u011Funu kontrol edin.`;
  }
  return errMsg;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  function readDB() {
    try {
      if (import_fs.default.existsSync(DB_PATH)) {
        return JSON.parse(import_fs.default.readFileSync(DB_PATH, "utf8"));
      }
    } catch (e) {
      console.error("Error reading JSON DB, using initial", e);
    }
    return initialDB;
  }
  function writeDB(data) {
    try {
      import_fs.default.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (e) {
      console.error("Error writing JSON DB", e);
      return false;
    }
  }
  app.get("/api/db", (req, res) => {
    res.json(readDB());
  });
  app.get("/firebase-applet-config.json", (req, res) => {
    const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
    if (import_fs.default.existsSync(configPath)) {
      res.setHeader("Content-Type", "application/json");
      res.send(import_fs.default.readFileSync(configPath, "utf8"));
    } else {
      res.status(404).json({ error: "Config file not found" });
    }
  });
  app.post("/api/backup", (req, res) => {
    const backupData = req.body;
    if (backupData && typeof backupData === "object") {
      const current = readDB();
      const updated = {
        ...current,
        users: backupData.users || current.users,
        defaultPrompts: backupData.defaultPrompts || current.defaultPrompts,
        generations: backupData.generations || current.generations,
        notifications: backupData.notifications || current.notifications,
        adminPassword: backupData.adminPassword || current.adminPassword
      };
      const ok = writeDB(updated);
      res.json({ success: ok, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    } else {
      res.status(400).json({ error: "Ge\xE7ersiz yedek verisi." });
    }
  });
  app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Mail adresi gereklidir." });
    }
    const current = readDB();
    const newNotif = {
      id: "forgot_" + Math.random().toString(36).substr(2, 9),
      text: `\u015Eifre Talebi: ${email} adresi i\xE7in kullan\u0131c\u0131 \u015Fifresini unuttu. L\xFCtfen mail ile \u015Fifresini bildirin.`,
      type: "forgot_password",
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      email
    };
    current.notifications.push(newNotif);
    writeDB(current);
    res.json({
      success: true,
      message: "\u015Eifre talebiniz Y\xF6neticiye iletilmi\u015Ftir, en k\u0131sa s\xFCrede Kay\u0131t oldu\u011Funuz mail adresinize \u015Fifre bildiriminiz yap\u0131lacakt\u0131r"
    });
  });
  app.post("/api/enhance-prompt", async (req, res) => {
    const { prompt } = req.body;
    const client = getGeminiClient();
    if (!client || !prompt) {
      return res.json({ enhanced: prompt });
    }
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate the following image prompt to English and enrich it with beautiful digital art keywords, style suggestions, lighting detail. Keep it as a descriptive single-sentence image generation prompt. Input: ${prompt}`
      });
      res.json({ enhanced: response.text?.trim() || prompt });
    } catch (e) {
      console.error("Enhance prompt failed:", e);
      res.json({ enhanced: prompt });
    }
  });
  app.post("/api/generate-image", async (req, res) => {
    const { prompt, aspectRatio, editImage, referenceImages, googleAccessToken } = req.body;
    let gRatio = "1:1";
    if (["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio)) {
      gRatio = aspectRatio;
    }
    let imageUrl = null;
    let modelUsedUsed = "gemini-2.5-flash-image";
    let oauthError = null;
    if (googleAccessToken) {
      try {
        console.log("Attempting image generation via Google Access Token...");
        const parts = [];
        if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
          for (const img of referenceImages) {
            if (typeof img === "string") {
              const cleaned = img.includes("base64,") ? img.split("base64,")[1] : img;
              parts.push({
                inlineData: {
                  data: cleaned,
                  mimeType: "image/png"
                }
              });
            }
          }
        }
        if (editImage && typeof editImage === "string") {
          const cleaned = editImage.includes("base64,") ? editImage.split("base64,")[1] : editImage;
          parts.push({
            inlineData: {
              data: cleaned,
              mimeType: "image/png"
            }
          });
        }
        parts.push({ text: prompt });
        const payload = {
          contents: [
            {
              parts
            }
          ],
          generationConfig: {
            imageConfig: {
              aspectRatio: gRatio
            }
          }
        };
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${googleAccessToken}`,
            "User-Agent": "aistudio-build"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Google Gemini REST API Error: ${errText}`);
        }
        const resData = await response.json();
        if (resData.candidates && resData.candidates[0]?.content?.parts) {
          for (const part of resData.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }
        if (imageUrl) {
          modelUsedUsed = "gemini-2.5-flash-image (Google OAuth Bearer)";
          console.log("Successfully generated image via Google Access Token!");
        } else {
          throw new Error("G\xF6rsel \xFCretilemedi. Model g\xF6rsel verisinden sonu\xE7 d\xF6nmedi.");
        }
      } catch (err) {
        console.warn("Google Access Token Gemini Generation failed. Falling back to Server Workspace Client... Error:", err.message || err);
        oauthError = err;
      }
    }
    if (!imageUrl) {
      console.log("Using Server Workspace Config Gemini Key to generate image...");
      const client = getGeminiClient();
      if (client) {
        try {
          const parts = [];
          if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
            for (const img of referenceImages) {
              if (typeof img === "string") {
                const cleaned = img.includes("base64,") ? img.split("base64,")[1] : img;
                parts.push({
                  inlineData: {
                    data: cleaned,
                    mimeType: "image/png"
                  }
                });
              }
            }
          }
          if (editImage && typeof editImage === "string") {
            const cleaned = editImage.includes("base64,") ? editImage.split("base64,")[1] : editImage;
            parts.push({
              inlineData: {
                data: cleaned,
                mimeType: "image/png"
              }
            });
          }
          parts.push({ text: prompt });
          const response = await client.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: gRatio
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
            modelUsedUsed = "gemini-2.5-flash-image (Workspace Client Fallback)";
          }
        } catch (e) {
          console.warn("Gemini Workspace Client Fallback failed:", e.message || e);
          oauthError = oauthError || e;
        }
      }
    }
    if (!imageUrl) {
      console.log("Fallbacks exhausted or failed. Invoking Pollinations AI for 100% free & unlimited image generation...");
      try {
        let pWidth = 1024;
        let pHeight = 1024;
        if (aspectRatio === "3:4") {
          pWidth = 768;
          pHeight = 1024;
        } else if (aspectRatio === "4:3") {
          pWidth = 1024;
          pHeight = 768;
        } else if (aspectRatio === "9:16") {
          pWidth = 576;
          pHeight = 1024;
        } else if (aspectRatio === "16:9") {
          pWidth = 1024;
          pHeight = 576;
        }
        const trMap = {
          "\u015F": "s",
          "\u015E": "S",
          "\xE7": "c",
          "\xC7": "C",
          "\u011F": "g",
          "\u011E": "G",
          "\xFC": "u",
          "\xDC": "U",
          "\xF6": "o",
          "\xD6": "O",
          "\u0131": "i",
          "\u0130": "I"
        };
        let cleanPrompt = prompt.split("").map((char) => trMap[char] || char).join("");
        cleanPrompt = cleanPrompt.replace(/[^\x20-\x7E]/g, "").trim();
        if (cleanPrompt.length > 300) {
          cleanPrompt = cleanPrompt.substring(0, 300);
        }
        if (!cleanPrompt) cleanPrompt = "gorgeous artistic drawing";
        const modelsToTry = ["flux", "turbo", "unity", "balanced"];
        let success = false;
        let lastErrorMsg = "";
        for (const model of modelsToTry) {
          try {
            console.log(`Trying Pollinations model: ${model}...`);
            const seed = Math.floor(Math.random() * 999999);
            const pUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanPrompt)}?width=${pWidth}&height=${pHeight}&seed=${seed}&nologo=true&model=${model}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12e3);
            const pRes = await fetch(pUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (pRes.ok) {
              const buffer = await pRes.arrayBuffer();
              const base64 = Buffer.from(buffer).toString("base64");
              imageUrl = `data:image/png;base64,${base64}`;
              modelUsedUsed = `Pollinations AI (${model} - S\u0131n\u0131rs\u0131z & \xDCcretsiz)`;
              success = true;
              console.log(`Successfully generated image using Pollinations model: ${model}!`);
              break;
            } else {
              console.warn(`Pollinations model ${model} failed with status: ${pRes.status}`);
              lastErrorMsg = `Status ${pRes.status}`;
            }
          } catch (modelErr) {
            console.warn(`Pollinations model ${model} thrown exception:`, modelErr.message || modelErr);
            lastErrorMsg = modelErr.message || String(modelErr);
          }
        }
        if (!success) {
          throw new Error(`All Pollinations generation models failed. Last error: ${lastErrorMsg}`);
        }
      } catch (pErr) {
        console.error("All image generation methods failed, including Pollinations AI:", pErr);
        const finalError = oauthError || pErr;
        return res.status(500).json({ error: formatGeminiError(finalError) });
      }
    }
    return res.json({ imageUrl, modelUsed: modelUsedUsed });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MBG Ai42 Server] Running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
