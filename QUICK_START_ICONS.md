# Quick Start: Generate PWA Icons

## ✅ Easiest Method: Browser Generator

1. **Open `generate-icons.html` in your web browser**
2. Click **"Generate & Download All Icons"**
3. Move downloaded PNG files to `public/icons/` directory

This method requires **no dependencies** and works immediately!

---

## Alternative Methods

### Method 2: Using Sharp (if installed)
```bash
npm install sharp --save-dev
node generate-icons-sharp.mjs
```

### Method 3: Convert SVG files
```bash
# If you have ImageMagick:
convert public/icons/icon-192.svg -resize 192x192 public/icons/icon-192x192.png
convert public/icons/icon-512.svg -resize 512x512 public/icons/icon-512x512.png
# ... etc

# Or use the conversion script:
node convert-svg-to-png.mjs
```

---

## Required Files

After generation, ensure these files exist in `public/icons/`:

- ✅ `icon-192x192.png` (192x192)
- ✅ `icon-512x512.png` (512x512)
- ✅ `apple-touch-icon-180x180.png` (180x180)
- ✅ `apple-touch-icon-152x152.png` (152x152)
- ✅ `apple-touch-icon-120x120.png` (120x120)

---

## Icon Design

- **Background**: Rose-600 (#e11d48)
- **Foreground**: White heart symbol
- **Format**: PNG with transparency support

---

## Verification

Check icons exist:
```bash
ls -la public/icons/*.png
```

Test in browser:
- Open DevTools > Application > Manifest
- Verify icons appear correctly
- Test "Add to Home Screen" on iOS/Android
