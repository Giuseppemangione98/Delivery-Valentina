import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROSE_600 = '#e11d48';
const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 }
];

// Create heart SVG
function createHeartSVG(size) {
  const heartSize = size * 0.5;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${ROSE_600}"/>
      <path d="M ${centerX} ${centerY + heartSize * 0.3}
               C ${centerX} ${centerY}, ${centerX - heartSize * 0.25} ${centerY}, ${centerX - heartSize * 0.25} ${centerY + heartSize * 0.3}
               C ${centerX - heartSize * 0.25} ${centerY + heartSize * 0.4}, ${centerX} ${centerY + heartSize * 0.5}, ${centerX} ${centerY + heartSize * 0.6}
               C ${centerX} ${centerY + heartSize * 0.5}, ${centerX + heartSize * 0.25} ${centerY + heartSize * 0.4}, ${centerX + heartSize * 0.25} ${centerY + heartSize * 0.3}
               C ${centerX + heartSize * 0.25} ${centerY}, ${centerX} ${centerY}, ${centerX} ${centerY + heartSize * 0.3}
               Z" fill="white"/>
    </svg>
  `;
}

async function generateIcons() {
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('🎨 Generating PWA icons with Sharp...\n');

  for (const { name, size } of sizes) {
    try {
      const svg = createHeartSVG(size);
      const filePath = path.join(iconsDir, name);
      
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(filePath);
      
      console.log(`✅ Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  console.log(`\n✨ All icons generated successfully!`);
  console.log(`📁 Icons saved to: ${iconsDir}`);
}

generateIcons().catch(console.error);
