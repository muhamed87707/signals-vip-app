/**
 * Icon Generator Script for Abu Al-Dahab
 * Generates all required icons from SVG source
 * 
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install sharp png-to-ico
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_PATH = path.join(__dirname, '../public/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');
const APP_DIR = path.join(__dirname, '../app');

// Icon sizes to generate
const ICON_SIZES = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
];

async function generateIcons() {
    console.log('🎨 Abu Al-Dahab Icon Generator');
    console.log('================================\n');

    // Read SVG file
    const svgBuffer = fs.readFileSync(SVG_PATH);
    console.log('✅ Loaded SVG source\n');

    // Generate PNG icons
    console.log('📐 Generating PNG icons...');
    for (const icon of ICON_SIZES) {
        const outputPath = path.join(OUTPUT_DIR, icon.name);
        await sharp(svgBuffer)
            .resize(icon.size, icon.size)
            .png()
            .toFile(outputPath);
        console.log(`   ✓ ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate favicon.ico (multi-size)
    console.log('\n🔷 Generating favicon.ico...');
    const icoSizes = [16, 32, 48];
    const pngBuffers = await Promise.all(
        icoSizes.map(size =>
            sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );

    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), icoBuffer);
    console.log('   ✓ favicon.ico (16x16, 32x32, 48x48)');

    // Also save to public folder
    fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.ico'), icoBuffer);
    console.log('   ✓ public/favicon.ico');

    console.log('\n✨ All icons generated successfully!');
    console.log('\n📁 Output files:');
    console.log('   - app/favicon.ico');
    console.log('   - public/favicon.ico');
    console.log('   - public/favicon-16x16.png');
    console.log('   - public/favicon-32x32.png');
    console.log('   - public/favicon-48x48.png');
    console.log('   - public/apple-touch-icon.png');
    console.log('   - public/icon-192.png');
    console.log('   - public/icon-512.png');
}

generateIcons().catch(console.error);
