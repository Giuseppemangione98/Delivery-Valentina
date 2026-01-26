#!/usr/bin/env node
/**
 * Convert SVG icons to PNG using available tools
 * This script tries multiple methods to convert SVG to PNG
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, 'public', 'icons');
const sizes = [
  { svg: 'icon-192.svg', png: 'icon-192x192.png', size: 192 },
  { svg: 'icon-512.svg', png: 'icon-512x512.png', size: 512 },
  { svg: 'apple-touch-icon-180.svg', png: 'apple-touch-icon-180x180.png', size: 180 },
  { svg: 'apple-touch-icon-152.svg', png: 'apple-touch-icon-152x152.png', size: 152 },
  { svg: 'apple-touch-icon-120.svg', png: 'apple-touch-icon-120x120.png', size: 120 }
];

function convertWithImageMagick(svgPath, pngPath, size) {
  try {
    execSync(`convert "${svgPath}" -resize ${size}x${size} "${pngPath}"`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function convertWithInkscape(svgPath, pngPath, size) {
  try {
    execSync(`inkscape "${svgPath}" --export-width=${size} --export-height=${size} --export-filename="${pngPath}"`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function convertWithSharp(svgPath, pngPath, size) {
  try {
    const sharp = await import('sharp');
    await sharp.default(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    return true;
  } catch (error) {
    return false;
  }
}

async function convertIcons() {
  console.log('🔄 Converting SVG icons to PNG...\n');

  let converted = 0;
  let failed = [];

  for (const { svg, png, size } of sizes) {
    const svgPath = path.join(iconsDir, svg);
    const pngPath = path.join(iconsDir, png);

    if (!fs.existsSync(svgPath)) {
      console.log(`⚠️  SVG not found: ${svg}`);
      failed.push(png);
      continue;
    }

    console.log(`Converting ${svg} → ${png}...`);

    // Try Sharp first (most reliable)
    if (await convertWithSharp(svgPath, pngPath, size)) {
      console.log(`✅ ${png} created`);
      converted++;
      continue;
    }

    // Try ImageMagick
    if (convertWithImageMagick(svgPath, pngPath, size)) {
      console.log(`✅ ${png} created (ImageMagick)`);
      converted++;
      continue;
    }

    // Try Inkscape
    if (convertWithInkscape(svgPath, pngPath, size)) {
      console.log(`✅ ${png} created (Inkscape)`);
      converted++;
      continue;
    }

    console.log(`❌ Failed to convert ${svg}`);
    failed.push(png);
  }

  console.log(`\n✨ Conversion complete!`);
  console.log(`✅ Converted: ${converted}/${sizes.length}`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed to convert:`);
    failed.forEach(file => console.log(`   - ${file}`));
    console.log(`\n💡 Try using generate-icons.html in your browser instead!`);
  }
}

convertIcons().catch(console.error);
