# Icon Generation Instructions

## Method 1: Browser-Based Generator (Recommended - No Dependencies)

1. Open `generate-icons.html` in your web browser
2. Click "Generate & Download All Icons"
3. Move all downloaded PNG files to `public/icons/` directory

## Method 2: Node.js with Sharp (Fast & Reliable)

```bash
# Install sharp
npm install sharp --save-dev

# Generate icons
node generate-icons-sharp.mjs
```

## Method 3: Node.js with Canvas

```bash
# Install canvas (may require system dependencies on macOS)
npm install canvas --save-dev

# Generate icons
node generate-icons.mjs
```

## Method 4: Manual SVG to PNG Conversion

If you have ImageMagick installed:

```bash
# Create icons directory
mkdir -p public/icons

# Generate SVG files (they're in the svg-icons/ directory)
# Then convert each SVG to PNG:
convert svg-icons/icon-192.svg -resize 192x192 public/icons/icon-192x192.png
convert svg-icons/icon-512.svg -resize 512x512 public/icons/icon-512x512.png
# ... etc
```

## Verification

After generating icons, verify they exist:

```bash
ls -la public/icons/
```

You should see:
- icon-192x192.png
- icon-512x512.png
- apple-touch-icon-180x180.png
- apple-touch-icon-152x152.png
- apple-touch-icon-120x120.png

## Icon Specifications

- **Background**: Rose-600 (#e11d48)
- **Foreground**: White heart symbol (❤️)
- **Format**: PNG with transparency support
- **Purpose**: PWA icons for iOS Safari and Android
