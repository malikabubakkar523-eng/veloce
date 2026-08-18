import fs from 'fs';
import path from 'path';

// 1. Dark Mode SVG (White Emblem + White VELOCE Typography)
const svgDarkMode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 110" fill="none">
  <!-- Athletic Wing / Shoe V-Emblem -->
  <g transform="translate(10, 5) scale(0.68)">
    <!-- Left Sharp Spike / Wing of the V -->
    <path d="M12 28 C28 27, 46 36, 56 48 C50 62, 45 78, 40 98 L56 102 C64 78, 72 58, 80 40 C65 24, 42 12, 12 28 Z" fill="#FFFFFF" />
    
    <!-- Outer Shoe Silhouette & Heel Curve -->
    <path d="M48 108 C36 122, 38 136, 52 144 C66 150, 84 146, 102 128 C128 102, 154 68, 172 26 C158 32, 146 44, 134 60 C120 78, 106 98, 88 116 C76 128, 64 132, 56 128 C50 124, 50 116, 54 108 Z" fill="#FFFFFF" />
    
    <!-- Central Dynamic Wave Rib 1 -->
    <path d="M68 96 C84 76, 104 52, 126 34 C140 22, 156 14, 170 12 C154 22, 140 38, 126 56 C108 78, 92 102, 78 114 C72 110, 70 102, 68 96 Z" fill="#FFFFFF" />
    
    <!-- Upper Flow Wave Rib 2 -->
    <path d="M96 74 C114 54, 134 34, 158 20 C166 16, 178 10, 188 8 C174 18, 160 32, 144 48 C128 66, 114 84, 104 90 C100 86, 98 80, 96 74 Z" fill="#FFFFFF" />
  </g>

  <!-- Modern Geometric VELOCE Typography -->
  <g transform="translate(145, 68)">
    <text font-family="'Montserrat', 'Outfit', 'Space Grotesk', -apple-system, sans-serif" font-weight="900" font-size="44" letter-spacing="0.16em" fill="#FFFFFF">
      VELOCE
    </text>
  </g>
</svg>`;

// 2. Light Mode SVG (Black Emblem + Black VELOCE Typography)
const svgLightMode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 110" fill="none">
  <!-- Athletic Wing / Shoe V-Emblem -->
  <g transform="translate(10, 5) scale(0.68)">
    <!-- Left Sharp Spike / Wing of the V -->
    <path d="M12 28 C28 27, 46 36, 56 48 C50 62, 45 78, 40 98 L56 102 C64 78, 72 58, 80 40 C65 24, 42 12, 12 28 Z" fill="#09090b" />
    
    <!-- Outer Shoe Silhouette & Heel Curve -->
    <path d="M48 108 C36 122, 38 136, 52 144 C66 150, 84 146, 102 128 C128 102, 154 68, 172 26 C158 32, 146 44, 134 60 C120 78, 106 98, 88 116 C76 128, 64 132, 56 128 C50 124, 50 116, 54 108 Z" fill="#09090b" />
    
    <!-- Central Dynamic Wave Rib 1 -->
    <path d="M68 96 C84 76, 104 52, 126 34 C140 22, 156 14, 170 12 C154 22, 140 38, 126 56 C108 78, 92 102, 78 114 C72 110, 70 102, 68 96 Z" fill="#09090b" />
    
    <!-- Upper Flow Wave Rib 2 -->
    <path d="M96 74 C114 54, 134 34, 158 20 C166 16, 178 10, 188 8 C174 18, 160 32, 144 48 C128 66, 114 84, 104 90 C100 86, 98 80, 96 74 Z" fill="#09090b" />
  </g>

  <!-- Modern Geometric VELOCE Typography -->
  <g transform="translate(145, 68)">
    <text font-family="'Montserrat', 'Outfit', 'Space Grotesk', -apple-system, sans-serif" font-weight="900" font-size="44" letter-spacing="0.16em" fill="#09090b">
      VELOCE
    </text>
  </g>
</svg>`;

// 3. Stacked Square Icon SVG (Emblem on top, VELOCE below - exact replica of user image)
const svgStacked = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <!-- Emblem Centered -->
  <g transform="translate(140, 50) scale(1.25)">
    <!-- Left Wing -->
    <path d="M12 28 C28 27, 46 36, 56 48 C50 62, 45 78, 40 98 L56 102 C64 78, 72 58, 80 40 C65 24, 42 12, 12 28 Z" fill="currentColor" />
    <!-- Shoe Silhouette -->
    <path d="M48 108 C36 122, 38 136, 52 144 C66 150, 84 146, 102 128 C128 102, 154 68, 172 26 C158 32, 146 44, 134 60 C120 78, 106 98, 88 116 C76 128, 64 132, 56 128 C50 124, 50 116, 54 108 Z" fill="currentColor" />
    <!-- Wave 1 -->
    <path d="M68 96 C84 76, 104 52, 126 34 C140 22, 156 14, 170 12 C154 22, 140 38, 126 56 C108 78, 92 102, 78 114 C72 110, 70 102, 68 96 Z" fill="currentColor" />
    <!-- Wave 2 -->
    <path d="M96 74 C114 54, 134 34, 158 20 C166 16, 178 10, 188 8 C174 18, 160 32, 144 48 C128 66, 114 84, 104 90 C100 86, 98 80, 96 74 Z" fill="currentColor" />
  </g>

  <!-- VELOCE Wordmark Below -->
  <text x="250" y="420" text-anchor="middle" font-family="'Montserrat', 'Outfit', 'Space Grotesk', -apple-system, sans-serif" font-weight="900" font-size="64" letter-spacing="0.18em" fill="currentColor">
    VELOCE
  </text>
</svg>`;

const imagesDir = path.resolve(process.cwd(), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

fs.writeFileSync(path.join(imagesDir, 'veloce-logo.svg'), svgDarkMode);
fs.writeFileSync(path.join(imagesDir, 'veloce-logo-dark.svg'), svgLightMode);
fs.writeFileSync(path.join(imagesDir, 'veloce-logo-icon.svg'), svgStacked);

console.log('✅ Generated new VELOCE logos from user specification!');
