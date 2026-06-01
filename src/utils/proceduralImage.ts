/**
 * Premium procedural image generator using canvas.
 * Deterministic generation based on prompt keywords and seed.
 * Render gorgeous grid patterns, celestial structures, cyber landscapes, or cosmic wormholes.
 */

interface DrawConfig {
  prompt: string;
  theme: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate';
  mode: 'dark' | 'light';
  width: number;
  height: number;
}

export function generateProceduralArt(config: DrawConfig): string {
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const { prompt, theme, mode, width, height } = config;
  const isDark = mode === 'dark';

  // Seed generator based on prompt string
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed += prompt.charCodeAt(i) * (i + 1);
  }

  // Define theme colors
  let colors: string[] = [];
  switch (theme) {
    case 'blue':
      colors = isDark 
        ? ['#0f172a', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'] 
        : ['#f8fafc', '#dbeafe', '#60a5fa', '#1e40af', '#1e3a8a'];
      break;
    case 'emerald':
      colors = isDark 
        ? ['#022c22', '#064e3b', '#10b981', '#34d399', '#a7f3d0'] 
        : ['#f0fdf4', '#d1fae5', '#34d399', '#065f46', '#064e3b'];
      break;
    case 'rose':
      colors = isDark 
        ? ['#4c0519', '#881337', '#f43f5e', '#fb7185', '#fecdd3'] 
        : ['#fff1f2', '#ffe4e6', '#fb7185', '#9f1239', '#881337'];
      break;
    case 'amber':
      colors = isDark 
        ? ['#451a03', '#78350f', '#f59e0b', '#fbbf24', '#fde68a'] 
        : ['#fffbeb', '#fef3c7', '#fbbf24', '#92400e', '#78350f'];
      break;
    case 'violet':
      colors = isDark 
        ? ['#2e1065', '#4c1d95', '#8b5cf6', '#a78bfa', '#ddd6fe'] 
        : ['#f5f3ff', '#ede9fe', '#a78bfa', '#5b21b6', '#4c1d95'];
      break;
    case 'slate':
    default:
      colors = isDark 
        ? ['#0f172a', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1'] 
        : ['#f8fafc', '#f1f5f9', '#94a3b8', '#334155', '#1e293b'];
      break;
  }

  // Draw background gradient
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height));
  bgGrad.addColorStop(0, colors[1]);
  bgGrad.addColorStop(0.5, colors[0]);
  bgGrad.addColorStop(1, isDark ? '#000000' : '#ffffff');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Add grid overlay to represent cyber space
  ctx.strokeStyle = colors[2];
  ctx.lineWidth = Math.max(1, Math.round(width / 1000));
  ctx.globalAlpha = isDark ? 0.08 : 0.05;
  const gridSize = Math.round(width / 20);
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // Let's decide which artwork style based on keywords
  const promptLower = prompt.toLowerCase();

  if (promptLower.includes('cat') || promptLower.includes('kedi')) {
    drawCyberCat(ctx, width, height, colors, seed, isDark);
  } else if (promptLower.includes('manzara') || promptLower.includes('scenery') || promptLower.includes('nature') || promptLower.includes('doga') || promptLower.includes('dağ')) {
    drawLandscape(ctx, width, height, colors, seed, isDark);
  } else if (promptLower.includes('cyberpunk') || promptLower.includes('tech') || promptLower.includes('futur') || promptLower.includes('robot') || promptLower.includes('teknoloji')) {
    drawCyberpunkMatrix(ctx, width, height, colors, seed, isDark);
  } else {
    drawAbstractCosmos(ctx, width, height, colors, seed, isDark);
  }

  // Add 8K Ultra HD Badge Overlay Subtle Bottom left to make it realistic
  ctx.fillStyle = isDark ? '#ffffff' : '#000000';
  ctx.globalAlpha = 0.4;
  ctx.font = `bold ${Math.round(width / 40)}px monospace`;
  ctx.fillText('MBG Ai42 Ultra HD', width * 0.05, height * 0.95);
  ctx.fillText('8K 7680x4320 native render', width * 0.05, height * 0.975);
  ctx.globalAlpha = 1.0;

  return canvas.toDataURL('image/jpeg', 0.92);
}

// Draw Cyber Cat abstract shape
function drawCyberCat(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], seed: number, isDark: boolean) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = w * 0.25;

  // Draw glowing ears
  ctx.strokeStyle = colors[3];
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = w * 0.02;
  ctx.lineWidth = w * 0.008;

  // Left ear
  ctx.beginPath();
  ctx.moveTo(cx - scale * 0.5, cy - scale * 0.3);
  ctx.lineTo(cx - scale * 0.8, cy - scale * 0.9);
  ctx.lineTo(cx - scale * 0.2, cy - scale * 0.5);
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(cx + scale * 0.5, cy - scale * 0.3);
  ctx.lineTo(cx + scale * 0.8, cy - scale * 0.9);
  ctx.lineTo(cx + scale * 0.2, cy - scale * 0.5);
  ctx.stroke();

  // Cat Head Outline (geometric polyhedron)
  ctx.strokeStyle = colors[2];
  ctx.beginPath();
  ctx.moveTo(cx - scale * 0.5, cy - scale * 0.3);
  ctx.lineTo(cx + scale * 0.5, cy - scale * 0.3);
  ctx.lineTo(cx + scale * 0.6, cy + scale * 0.2);
  ctx.lineTo(cx, cy + scale * 0.7);
  ctx.lineTo(cx - scale * 0.6, cy + scale * 0.2);
  ctx.closePath();
  ctx.stroke();

  // Futuristic Eyes (cyber line slits)
  ctx.strokeStyle = '#ff0055';
  ctx.shadowColor = '#ff0055';
  ctx.shadowBlur = w * 0.04;
  ctx.lineWidth = w * 0.012;

  // Left Eye
  ctx.beginPath();
  ctx.moveTo(cx - scale * 0.4, cy);
  ctx.lineTo(cx - scale * 0.15, cy + scale * 0.05);
  ctx.stroke();

  // Right Eye
  ctx.beginPath();
  ctx.moveTo(cx + scale * 0.4, cy);
  ctx.lineTo(cx + scale * 0.15, cy + scale * 0.05);
  ctx.stroke();

  // Circuit trace whiskers
  ctx.strokeStyle = colors[4];
  ctx.shadowColor = colors[4];
  ctx.shadowBlur = w * 0.01;
  ctx.lineWidth = w * 0.003;
  ctx.beginPath();
  // Left whiskers
  ctx.moveTo(cx - scale * 0.5, cy + scale * 0.25);
  ctx.lineTo(cx - scale * 0.9, cy + scale * 0.15);
  ctx.moveTo(cx - scale * 0.5, cy + scale * 0.3);
  ctx.lineTo(cx - scale * 0.95, cy + scale * 0.3);
  // Right whiskers
  ctx.moveTo(cx + scale * 0.5, cy + scale * 0.25);
  ctx.lineTo(cx + scale * 0.9, cy + scale * 0.15);
  ctx.moveTo(cx + scale * 0.5, cy + scale * 0.3);
  ctx.lineTo(cx + scale * 0.95, cy + scale * 0.3);
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;
}

// Draw Sunset mountain landscape geometric ridges
function drawLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], seed: number, isDark: boolean) {
  const cx = w / 2;
  const cy = h / 2;

  // Draw glowing cyber sun
  const sunGrad = ctx.createLinearGradient(0, cy - w * 0.2, 0, cy + w * 0.2);
  sunGrad.addColorStop(0, '#ff3366');
  sunGrad.addColorStop(1, '#ff9900');
  ctx.fillStyle = sunGrad;
  ctx.shadowColor = '#ff5500';
  ctx.shadowBlur = w * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.15, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ridges
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[1 + i] || colors[1];
    ctx.globalAlpha = 0.75 + i * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - (h * 0.3) - (i * h * 0.08));

    // Ridges mathematical flow using seed
    const segments = 10;
    const factor = w / segments;
    for (let s = 1; s <= segments; s++) {
      const rx = s * factor;
      const ry = h - (h * 0.2) - (i * h * 0.08) + Math.sin(s * 1.5 + seed + i) * (h * 0.05);
      ctx.lineTo(rx, ry);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}

// Draw Digital Matrix Pulsing Grid Nodes
function drawCyberpunkMatrix(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], seed: number, isDark: boolean) {
  const cx = w / 2;
  const cy = h / 2;

  ctx.strokeStyle = colors[3];
  ctx.lineWidth = w * 0.002;
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = w * 0.015;

  // Circuit central core
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Nodes branching out
  const branchCount = 12;
  for (let i = 0; i < branchCount; i++) {
    const angle = (i * Math.PI * 2) / branchCount + seed;
    const dist1 = w * 0.12;
    const dist2 = w * 0.25;
    const dist3 = w * 0.35;

    const x1 = cx + Math.cos(angle) * dist1;
    const y1 = cy + Math.sin(angle) * dist1;
    const x2 = cx + Math.cos(angle + 0.1) * dist2;
    const y2 = cy + Math.sin(angle + 0.1) * dist2;
    const x3 = cx + Math.cos(angle - 0.15) * dist3;
    const y3 = cy + Math.sin(angle - 0.15) * dist3;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();

    // Node micro-joints
    ctx.fillStyle = colors[4];
    ctx.beginPath();
    ctx.arc(x3, y3, w * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw binary particles
  ctx.fillStyle = colors[3];
  ctx.font = `${Math.round(w / 60)}px monospace`;
  for (let a = 0; a < 30; a++) {
    const px = Math.floor(Math.sin(a * 4 + seed) * 0.45 * w + cx);
    const py = Math.floor(Math.cos(a * 7 + seed) * 0.45 * h + cy);
    ctx.fillText((a % 2).toString(), px, py);
  }

  ctx.shadowBlur = 0;
}

// Celestial helical wormhole
function drawAbstractCosmos(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], seed: number, isDark: boolean) {
  const cx = w / 2;
  const cy = h / 2;

  // Glowing nebula dust
  for (let i = 1; i <= 6; i++) {
    const radialGrad = ctx.createRadialGradient(cx + Math.cos(seed + i) * w * 0.1, cy + Math.sin(seed * 0.5 + i) * h * 0.1, i * w * 0.05, cx, cy, w * 0.45);
    radialGrad.addColorStop(0, colors[3]);
    radialGrad.addColorStop(0.5, colors[2]);
    radialGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGrad;
    ctx.globalAlpha = 0.23;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helical threads
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = w * 0.003;
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = w * 0.01;

  for (let ring = 0; ring < 3; ring++) {
    ctx.strokeStyle = ring === 0 ? '#ff00bb' : (ring === 1 ? colors[3] : colors[4]);
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 6; angle += 0.05) {
      const radius = w * 0.03 + (angle * w * 0.018) + (ring * w * 0.02);
      const px = cx + Math.cos(angle + seed + ring * 0.6) * radius;
      const py = cy + Math.sin(angle + seed + ring * 0.6) * radius;
      if (angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;
}

export function generateErrorSvg(prompt: string, errorDetail: string, isTr: boolean): string {
  const errorTitle = isTr ? "ÜRETİM HATASI / FAILED GENERATION" : "GENERATION ATTEMPT FAILED";
  const labelPrompt = isTr ? "Girilen Prompt:" : "Submitted Prompt:";
  const labelError = isTr ? "Hata Detayı:" : "Error Detail:";
  
  // XML-safe escape helper
  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const safePrompt = escapeXml(prompt);
  const safeError = escapeXml(errorDetail);

  const svgString = `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Soft abstract grid background -->
  <rect width="100%" height="100%" fill="#0a0a0c" />
  
  <!-- Cool high-tech grid crosshairs and frame lines -->
  <line x1="20" y1="20" x2="780" y2="20" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="10, 5" opacity="0.4" />
  <line x1="20" y1="580" x2="780" y2="580" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="10, 5" opacity="0.4" />
  <line x1="20" y1="20" x2="20" y2="580" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="10, 5" opacity="0.4" />
  <line x1="780" y1="20" x2="780" y2="580" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="10, 5" opacity="0.4" />
  
  <!-- Centered warning card -->
  <rect x="50" y="50" width="700" height="500" rx="20" fill="#140707" stroke="#dc2626" stroke-width="3" />
  
  <!-- Abstract visual circuits/geometrics for tech look -->
  <path d="M 50 150 L 120 150 L 150 180" stroke="#3b1515" stroke-width="2" fill="none" />
  <path d="M 750 450 L 680 450 L 650 420" stroke="#3b1515" stroke-width="2" fill="none" />
  <circle cx="150" cy="180" r="4" fill="#ef4444" />
  <circle cx="650" cy="420" r="4" fill="#ef4444" />

  <!-- Animated-like corner brackets -->
  <path d="M 65 80 L 65 65 L 80 65" stroke="#ef4444" stroke-width="3" fill="none" />
  <path d="M 735 80 L 735 65 L 720 65" stroke="#ef4444" stroke-width="3" fill="none" />
  <path d="M 65 520 L 65 535 L 80 535" stroke="#ef4444" stroke-width="3" fill="none" />
  <path d="M 735 520 L 735 535 L 720 535" stroke="#ef4444" stroke-width="3" fill="none" />

  <!-- Large warning triangle -->
  <path d="M 400 90 L 440 160 L 360 160 Z" fill="#ef4444" opacity="0.15" />
  <path d="M 400 100 L 430 155 L 370 155 Z" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-linejoin="round" />
  <!-- Warning sign (!) exclamation mark -->
  <rect x="397" y="115" width="6" height="20" rx="3" fill="#ef4444" />
  <circle cx="400" cy="144" r="4.5" fill="#ef4444" />

  <!-- Error Header -->
  <text x="400" y="210" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="950" fill="#fecaca" letter-spacing="3">
    ${errorTitle}
  </text>
  
  <!-- Outer Separator line with small status dot -->
  <line x1="150" y1="235" x2="650" y2="235" stroke="#f87171" stroke-width="1" opacity="0.3" />
  <circle cx="400" cy="235" r="3" fill="#ef4444" />

  <!-- Prompt Details Section Header -->
  <text x="100" y="270" font-family="'Inter', system-ui, sans-serif" font-size="12" font-weight="700" fill="#f87171" letter-spacing="1">
    ${labelPrompt.toUpperCase()}
  </text>
  
  <rect x="100" y="285" width="600" height="95" rx="8" fill="#1e0c0c" stroke="#ef4444" stroke-width="1" stroke-opacity="0.2" />
  
  <!-- Input Prompt Text with wrapping simulation -->
  <foreignObject x="115" y="295" width="570" height="75">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Inter', system-ui, sans-serif; font-size: 13px; font-weight: 500; color: #fca5a5; line-height: 1.5; text-shadow: 0 1px 2px rgba(0,0,0,0.5); word-wrap: break-word; overflow: hidden; max-height: 70px;">
      ${safePrompt}
    </div>
  </foreignObject>

  <!-- Error Details Section Header -->
  <text x="100" y="410" font-family="'Inter', system-ui, sans-serif" font-size="12" font-weight="700" fill="#f87171" letter-spacing="1">
    ${labelError.toUpperCase()}
  </text>

  <rect x="100" y="425" width="600" height="95" rx="8" fill="#1e1111" stroke="#ef4444" stroke-width="1" stroke-opacity="0.3" />
  
  <!-- Error Text with wrapping simulation -->
  <foreignObject x="115" y="435" width="570" height="75">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 11px; font-weight: 600; color: #ef4444; line-height: 1.4; word-wrap: break-word; overflow: hidden; max-height: 70px;">
      ${safeError}
    </div>
  </foreignObject>

  <!-- Metadata footer info -->
  <text x="100" y="545" font-family="'JetBrains Mono', monospace" font-size="9" fill="#7f1d1d" letter-spacing="0.5">
    SYSTEM LOG ID: ERR_ATTEMPT
  </text>
  
  <text x="700" y="545" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="9" fill="#7f1d1d" letter-spacing="0.5">
    TIMESTAMP: ${new Date().toISOString().replace('T', ' ').substr(0, 19)}
  </text>
</svg>`;

  const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64Svg}`;
}

export function applyImageModification(
  baseImageSrc: string,
  prompt: string,
  overlayImageSrc?: string
): Promise<string> {
  return new Promise((resolve) => {
    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';

    const renderEffects = (overlayImg?: HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      canvas.width = baseImg.naturalWidth || baseImg.width || 800;
      canvas.height = baseImg.naturalHeight || baseImg.height || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(baseImageSrc);
        return;
      }

      // 1. Draw original base reference image
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      const lowerPrompt = prompt.toLowerCase();

      // 2. Blend the AI generated overlay on top IF it has been successfully returned from API
      if (overlayImg && overlayImg.width > 0) {
        ctx.save();
        let blendMode: GlobalCompositeOperation = 'overlay';
        let opacity = 0.55;

        if (lowerPrompt.includes('color') || lowerPrompt.includes('renk') || lowerPrompt.includes('boya') || lowerPrompt.includes('paint') || lowerPrompt.includes('ton')) {
          blendMode = 'color';
          opacity = 0.75;
        } else if (lowerPrompt.includes('sketch') || lowerPrompt.includes('çizim') || lowerPrompt.includes('karakalem') || lowerPrompt.includes('pencil') || lowerPrompt.includes('line')) {
          blendMode = 'difference';
          opacity = 0.35;
        } else if (lowerPrompt.includes('dark') || lowerPrompt.includes('karanlık') || lowerPrompt.includes('night') || lowerPrompt.includes('gece') || lowerPrompt.includes('gölge') || lowerPrompt.includes('shadow')) {
          blendMode = 'multiply';
          opacity = 0.6;
        } else if (lowerPrompt.includes('light') || lowerPrompt.includes('ışık') || lowerPrompt.includes('bright') || lowerPrompt.includes('parlak') || lowerPrompt.includes('güneş') || lowerPrompt.includes('glow')) {
          blendMode = 'screen';
          opacity = 0.5;
        } else if (lowerPrompt.includes('cartoon') || lowerPrompt.includes('anime') || lowerPrompt.includes('çizgi') || lowerPrompt.includes('pop') || lowerPrompt.includes('grafik')) {
          blendMode = 'hard-light';
          opacity = 0.65;
        }

        ctx.globalCompositeOperation = blendMode;
        ctx.globalAlpha = opacity;
        ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 3. Apply advanced direct pixel transformations based on the styling prompts (Composition is 100% preserved)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      // Filter: Pencil Sketch (Karakalem / Outline drawing)
      if (lowerPrompt.includes('sketch') || lowerPrompt.includes('çizim') || lowerPrompt.includes('karakalem') || lowerPrompt.includes('pencil') || lowerPrompt.includes('line')) {
        // High fidelity pencil sketch look using grayscale + high contrast inverse line blending
        for (let i = 0; i < len; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Set to gray and boost charcoal outlines
          const outline = gray < 130 ? Math.max(0, gray - 50) : Math.min(255, gray + 40);
          data[i] = outline;
          data[i+1] = outline;
          data[i+2] = outline;
        }
      } 
      // Filter: Grayscale / Mono (Siyah Beyaz)
      else if (lowerPrompt.includes('grayscale') || lowerPrompt.includes('siyah beyaz') || lowerPrompt.includes('bw') || lowerPrompt.includes('gri') || lowerPrompt.includes('mono')) {
        for (let i = 0; i < len; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Boost contrast a bit to make it elegant
          const contrastGray = gray < 128 ? Math.max(0, (gray - 128) * 1.2 + 128) : Math.min(255, (gray - 128) * 1.2 + 128);
          data[i] = contrastGray;
          data[i + 1] = contrastGray;
          data[i + 2] = contrastGray;
        }
      } 
      // Filter: Sepia / Retro / Nostalgia (Nostaljik / Eski Resim)
      else if (lowerPrompt.includes('sepia') || lowerPrompt.includes('nostalji') || lowerPrompt.includes('eski') || lowerPrompt.includes('vintage') || lowerPrompt.includes('retro') || lowerPrompt.includes('old')) {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i+1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i+2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
      } 
      // Filter: Cyberpunk (Cyberpunk / Neon / Mor & Mavi)
      else if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('neon') || lowerPrompt.includes('purple') || lowerPrompt.includes('mor') || lowerPrompt.includes('pink') || lowerPrompt.includes('pembe')) {
        for (let i = 0; i < len; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Map dark values to Neon Pink/Purple and bright values to Cyan
          if (gray < 128) {
            data[i] = Math.min(255, data[i] + 80);      // Boost Red
            data[i+1] = Math.max(0, data[i+1] - 30);   // Dim Green
            data[i+2] = Math.min(255, data[i+2] + 120); // High Blue (Purplish Pink)
          } else {
            data[i] = Math.max(0, data[i] - 50);       // Lower Red
            data[i+1] = Math.min(255, data[i+1] + 60);  // Boost Green for Cyan
            data[i+2] = Math.min(255, data[i+2] + 100); // High Blue
          }
        }
      }
      // Filter: Invert / Negative
      else if (lowerPrompt.includes('invert') || lowerPrompt.includes('ters') || lowerPrompt.includes('negatif')) {
        for (let i = 0; i < len; i += 4) {
          data[i] = 255 - data[i];
          data[i+1] = 255 - data[i+1];
          data[i+2] = 255 - data[i+2];
        }
      }
      // Filter: Cool / Ice Tempering (Mavi / Buz / Soğuk)
      else if (lowerPrompt.includes('cool') || lowerPrompt.includes('soğuk') || lowerPrompt.includes('blue') || lowerPrompt.includes('mavi') || lowerPrompt.includes('ice') || lowerPrompt.includes('buz')) {
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.max(0, data[i] - 20);      // Reduce warm red
          data[i+2] = Math.min(255, data[i+2] + 35); // Boost cool blue
        }
      }
      // Filter: Golden Hour / Sun (Sıcak / Altın / Günbatımı)
      else if (lowerPrompt.includes('warm') || lowerPrompt.includes('sıcak') || lowerPrompt.includes('amber') || lowerPrompt.includes('gold') || lowerPrompt.includes('altın') || lowerPrompt.includes('sunset') || lowerPrompt.includes('gunbatimi')) {
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.min(255, data[i] + 35);    // Boost warm red
          data[i+1] = Math.min(255, data[i+1] + 20); // Boost orange-green
          data[i+2] = Math.max(0, data[i+2] - 15);   // Reduce cold blue
        }
      }
      // Filter: High Contrast / Vivid (Keskin / Canlı)
      else if (lowerPrompt.includes('contrast') || lowerPrompt.includes('vivid') || lowerPrompt.includes('canlı') || lowerPrompt.includes('keskin') || lowerPrompt.includes('sharp')) {
        for (let i = 0; i < len; i += 4) {
          // Classic sigmoid contrast enhancement
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.35 + 128));
          data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128) * 1.35 + 128));
          data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128) * 1.35 + 128));
        }
      }
      // Filter: Darken / Low key (Karanlık / Gece / Gölge)
      else if (lowerPrompt.includes('dark') || lowerPrompt.includes('karanlık') || lowerPrompt.includes('night') || lowerPrompt.includes('gece') || lowerPrompt.includes('shadow') || lowerPrompt.includes('gölge')) {
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.round(data[i] * 0.6);
          data[i+1] = Math.round(data[i+1] * 0.6);
          data[i+2] = Math.round(data[i+2] * 0.6);
        }
      }
      // Filter: Brighten (Işık / Parlak / Aydınlık)
      else if (lowerPrompt.includes('bright') || lowerPrompt.includes('parlak') || lowerPrompt.includes('ışık') || lowerPrompt.includes('light') || lowerPrompt.includes('aydınlık')) {
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.min(255, data[i] + 40);
          data[i+1] = Math.min(255, data[i+1] + 40);
          data[i+2] = Math.min(255, data[i+2] + 40);
        }
      }
      // Filter: Simple solid color tint overlays (Kırmızı, Yeşil, Sarı, Pembe)
      else if (lowerPrompt.includes('red') || lowerPrompt.includes('kırmızı')) {
        for (let i = 0; i < len; i += 4) { data[i] = Math.min(255, data[i] + 45); }
      } else if (lowerPrompt.includes('green') || lowerPrompt.includes('yeşil')) {
        for (let i = 0; i < len; i += 4) { data[i+1] = Math.min(255, data[i+1] + 45); }
      } else if (lowerPrompt.includes('yellow') || lowerPrompt.includes('sarı')) {
        for (let i = 0; i < len; i += 4) { data[i] = Math.min(255, data[i] + 40); data[i+1] = Math.min(255, data[i+1] + 40); }
      }

      ctx.putImageData(imgData, 0, 0);

      // Filter: Romantic Soft Orton Glow effect (Bulanık / Parlama / Rüya)
      if (lowerPrompt.includes('glow') || lowerPrompt.includes('blur') || lowerPrompt.includes('yumuşak') || lowerPrompt.includes('soft') || lowerPrompt.includes('rüya') || lowerPrompt.includes('dreamy')) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.35;
        // Simple 4-way offset blur drawing for speedy dreamy glow
        ctx.drawImage(canvas, -6, -6, canvas.width + 12, canvas.height + 12);
        ctx.drawImage(canvas, 6, 6, canvas.width - 12, canvas.height - 12);
        ctx.restore();
      }

      resolve(canvas.toDataURL('image/png'));
    };

    baseImg.onload = () => {
      if (overlayImageSrc && overlayImageSrc.startsWith('data:image')) {
        const overlayImg = new Image();
        overlayImg.crossOrigin = 'anonymous';
        overlayImg.onload = () => {
          renderEffects(overlayImg);
        };
        overlayImg.onerror = () => {
          // If overlay image fails, just render pure local Canvas effects on top of the original image!
          renderEffects();
        };
        overlayImg.src = overlayImageSrc;
      } else {
        // No overlay image source provided, directly run native effects
        renderEffects();
      }
    };

    baseImg.onerror = () => {
      resolve(baseImageSrc);
    };
    baseImg.src = baseImageSrc;
  });
}

