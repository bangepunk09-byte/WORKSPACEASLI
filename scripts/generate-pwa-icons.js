import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#ef4444" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Outer glowing emblem -->
  <rect x="76" y="76" width="360" height="360" rx="84" fill="url(#emblemGrad)" filter="url(#shadow)"/>
  
  <!-- Geometric Tech Emblem Lines -->
  <g transform="translate(146, 146)" stroke="#ffffff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Hexagonal Node Center -->
    <polygon points="110,20 185,62 185,158 110,200 35,158 35,62" stroke="#ffffff" stroke-width="16" fill="rgba(255,255,255,0.08)"/>
    <!-- Intersecting Knot Lines -->
    <line x1="60" y1="110" x2="160" y2="110" stroke="#ffffff" stroke-width="18"/>
    <line x1="110" y1="50" x2="110" y2="170" stroke="#ffffff" stroke-width="18"/>
    <circle cx="110" cy="110" r="22" fill="#ffffff"/>
    <circle cx="60" cy="80" r="10" fill="#ffffff"/>
    <circle cx="160" cy="80" r="10" fill="#ffffff"/>
    <circle cx="60" cy="140" r="10" fill="#ffffff"/>
    <circle cx="160" cy="140" r="10" fill="#ffffff"/>
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg.trim());
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg.trim());

  const svgBuffer = Buffer.from(svg);

  // Generate 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Generate 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Generate apple-touch-icon 180x180 PNG
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('PWA icons successfully generated in /public!');
}

generate().catch(console.error);
