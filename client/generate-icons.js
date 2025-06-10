#!/usr/bin/env node

/**
 * PWA Icon Generator for PlantPAP
 * Generates simple SVG-based PNG icons for PWA functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template for PlantPAP icon
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="plantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16a34a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#plantGradient)"/>
  
  <!-- Plant leaves -->
  <path d="M${size*0.3} ${size*0.7} Q${size*0.2} ${size*0.4} ${size*0.4} ${size*0.3} Q${size*0.5} ${size*0.5} ${size*0.3} ${size*0.7}" fill="white" opacity="0.9"/>
  <path d="M${size*0.7} ${size*0.7} Q${size*0.8} ${size*0.4} ${size*0.6} ${size*0.3} Q${size*0.5} ${size*0.5} ${size*0.7} ${size*0.7}" fill="white" opacity="0.9"/>
  
  <!-- Stem -->
  <rect x="${size*0.47}" y="${size*0.5}" width="${size*0.06}" height="${size*0.3}" fill="white" opacity="0.8"/>
  
  <!-- PlantPAP text -->
  <text x="${size/2}" y="${size*0.9}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size*0.08}" font-weight="bold">PlantPAP</text>
</svg>
`;

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🌱 Generating PlantPAP PWA icons...');

// Generate SVG placeholder files for each required size
iconSizes.forEach(size => {
  const svgContent = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent.trim());
  console.log(`✅ Generated ${filename}`);
});

// Create an HTML file for manual PNG generation
iconSizes.forEach(size => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head><title>Icon Generator</title></head>
<body>
  <canvas id="canvas" width="${size}" height="${size}"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, ${size}, ${size});
    gradient.addColorStop(0, '#16a34a');
    gradient.addColorStop(1, '#22c55e');
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ${size}, ${size});
    
    // Add plant icon (simplified)
    ctx.fillStyle = 'white';
    ctx.font = '${size * 0.08}px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌱', ${size/2}, ${size*0.6});
    ctx.fillText('PlantPAP', ${size/2}, ${size*0.85});
    
    // Export as PNG
    const link = document.createElement('a');
    link.download = 'icon-${size}x${size}.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  </script>
</body>
</html>
  `;
  
  const htmlFilename = `generate-icon-${size}x${size}.html`;
  const htmlFilepath = path.join(iconsDir, htmlFilename);
  fs.writeFileSync(htmlFilepath, htmlContent.trim());
  console.log(`✅ Generated HTML generator for ${size}x${size} icon`);
});

// Create instructions for manual icon generation
const instructions = `
# PWA Icon Generation Instructions

## Quick Setup (Recommended)
1. Use an online favicon generator like favicon.io or realfavicongenerator.net
2. Upload a PlantPAP logo or use the provided SVG template
3. Generate icons for all required sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
4. Download and place the PNG files in this directory

## Manual Creation
1. Open the generated SVG files in a design tool (Figma, Sketch, etc.)
2. Export each as PNG at the corresponding size
3. Ensure icons are crisp and readable at small sizes

## Current Status
✅ SVG templates generated
⚠️  PNG files need to be created manually (SVG placeholders provided)

## Required Files
${iconSizes.map(size => `- icon-${size}x${size}.png`).join('\n')}

## Testing
After creating the PNG files, test the PWA installation:
1. Run the development server
2. Open browser dev tools
3. Check Application > Manifest tab
4. Verify all icons load correctly
`;

fs.writeFileSync(path.join(iconsDir, 'GENERATION_GUIDE.md'), instructions);

console.log('📋 Generated icon templates and instructions');
console.log('⚠️  Note: SVG placeholders created. For production, convert to PNG files.');
console.log('💡 See public/icons/GENERATION_GUIDE.md for detailed instructions');
