import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if canvas package is available
let createCanvas;
try {
  const canvas = await import('canvas');
  createCanvas = canvas.createCanvas;
} catch (error) {
  console.error('Error: canvas package not found.');
  console.log('\nTo install canvas package, run:');
  console.log('npm install canvas');
  console.log('\nOr use the browser-based generator: generate-icons.html');
  process.exit(1);
}

const ROSE_600 = '#e11d48';
const WHITE = '#ffffff';

const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 }
];

function drawHeart(ctx, centerX, centerY, size) {
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  
  // Draw heart shape using Bezier curves
  const topCurveHeight = size * 0.3;
  const topCurveWidth = size * 0.25;
  
  // Left curve of heart
  ctx.moveTo(centerX, centerY + topCurveHeight);
  ctx.bezierCurveTo(
    centerX, centerY,
    centerX - topCurveWidth, centerY,
    centerX - topCurveWidth, centerY + topCurveHeight
  );
  ctx.bezierCurveTo(
    centerX - topCurveWidth, centerY + topCurveHeight + 10,
    centerX, centerY + topCurveHeight + 20,
    centerX, centerY + topCurveHeight + 30
  );
  
  // Right curve of heart
  ctx.bezierCurveTo(
    centerX, centerY + topCurveHeight + 20,
    centerX + topCurveWidth, centerY + topCurveHeight + 10,
    centerX + topCurveWidth, centerY + topCurveHeight
  );
  ctx.bezierCurveTo(
    centerX + topCurveWidth, centerY,
    centerX, centerY,
    centerX, centerY + topCurveHeight
  );
  
  ctx.fill();
}

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill background with rose-600
  ctx.fillStyle = ROSE_600;
  ctx.fillRect(0, 0, size, size);

  // Draw white heart in center
  const centerX = size / 2;
  const centerY = size / 2;
  const heartSize = size * 0.5; // Heart takes 50% of icon size
  
  drawHeart(ctx, centerX, centerY, heartSize);

  // Save to file
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const filePath = path.join(iconsDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  
  console.log(`✅ Generated: ${filename} (${size}x${size})`);
}

// Generate all icons
console.log('🎨 Generating PWA icons...\n');

sizes.forEach(({ name, size }) => {
  generateIcon(size, name);
});

console.log('\n✨ All icons generated successfully!');
console.log(`📁 Icons saved to: ${path.join(__dirname, 'public', 'icons')}`);
