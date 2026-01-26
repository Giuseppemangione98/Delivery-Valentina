# Icon Generation Guide

## Required Icon Files

You need to create the following icon files for the PWA to work properly:

### PWA Icons (Required for Lighthouse)
- `/icons/icon-192x192.png` - 192x192 pixels, PNG format
- `/icons/icon-512x512.png` - 512x512 pixels, PNG format

### Apple Touch Icons (iOS)
- `/icons/apple-touch-icon.png` - 180x180 pixels (default)
- `/icons/apple-touch-icon-180x180.png` - 180x180 pixels
- `/icons/apple-touch-icon-152x152.png` - 152x152 pixels
- `/icons/apple-touch-icon-120x120.png` - 120x120 pixels

### Apple Splash Screens (iOS - Optional but recommended)
- `/icons/apple-splash-2048-2732.png` - iPad Pro 12.9"
- `/icons/apple-splash-1668-2388.png` - iPad Pro 11"
- `/icons/apple-splash-1536-2048.png` - iPad
- `/icons/apple-splash-1125-2436.png` - iPhone X/XS/11 Pro
- `/icons/apple-splash-1242-2208.png` - iPhone 8 Plus/7 Plus/6s Plus
- `/icons/apple-splash-750-1334.png` - iPhone 8/7/6s/6

## Design Guidelines

### Icon Design:
- Use rose-600 (#e11d48) as primary color
- Use zinc-950 (#09090b) as background
- Include heart emoji ❤️ or romantic theme
- Keep design simple and recognizable at small sizes
- For maskable icons: ensure important content is within the safe zone (80% of icon)

### Quick Generation Options:

1. **Online Tools:**
   - https://realfavicongenerator.net/ (generates all sizes)
   - https://www.pwabuilder.com/imageGenerator (PWA icon generator)
   - https://appicon.co/ (iOS icon generator)

2. **Using ImageMagick (if you have a source image):**
   ```bash
   # Create icons directory
   mkdir -p icons
   
   # Generate PWA icons (replace source.png with your image)
   convert source.png -resize 192x192 icons/icon-192x192.png
   convert source.png -resize 512x512 icons/icon-512x512.png
   
   # Generate Apple Touch Icons
   convert source.png -resize 180x180 icons/apple-touch-icon.png
   convert source.png -resize 180x180 icons/apple-touch-icon-180x180.png
   convert source.png -resize 152x152 icons/apple-touch-icon-152x152.png
   convert source.png -resize 120x120 icons/apple-touch-icon-120x120.png
   ```

3. **Using Figma/Design Tools:**
   - Create 512x512 design
   - Export at different sizes
   - Ensure PNG format with transparency support

## Temporary Solution

Until icons are created, you can:
1. Use a placeholder service like https://via.placeholder.com/512x512/e11d48/09090b?text=❤️
2. Create simple colored squares as placeholders
3. Use the existing favicon.ico temporarily (not recommended for production)

## Verification

After adding icons, verify:
- Icons appear in browser DevTools > Application > Manifest
- Icons show correctly when adding to home screen (iOS/Android)
- Lighthouse PWA audit shows icons as valid
