import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(__dirname, 'assets');
const publicDir = path.join(rootDir, 'apps', 'web', 'public');
const iconsDir = path.join(publicDir, 'icons');
const ogDir = path.join(publicDir, 'og');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (error) {
  const pnpmDir = path.join(rootDir, 'node_modules', '.pnpm');
  if (fs.existsSync(pnpmDir)) {
    const entry = fs
      .readdirSync(pnpmDir)
      .find((name) => name.startsWith('sharp@'));
    if (entry) {
      const sharpPath = path.join(pnpmDir, entry, 'node_modules', 'sharp');
      try {
        const require = createRequire(import.meta.url);
        sharp = require(sharpPath);
      } catch (requireError) {
        sharp = null;
      }
    }
  }
}

if (!sharp) {
  console.error('sharp is required to generate assets.');
  console.error('Run \"pnpm install\" and try again.');
  process.exit(1);
}

const iconSvg = path.join(assetsDir, 'icon.svg');
const ogSvg = path.join(assetsDir, 'og-preview.svg');

fs.mkdirSync(iconsDir, { recursive: true });
fs.mkdirSync(ogDir, { recursive: true });

const iconBuffer = fs.readFileSync(iconSvg);

await sharp(iconBuffer)
  .resize(32, 32)
  .png()
  .toFile(path.join(iconsDir, 'favicon-32.png'));
await sharp(iconBuffer)
  .resize(192, 192)
  .png()
  .toFile(path.join(iconsDir, 'icon-192.png'));
await sharp(iconBuffer)
  .resize(512, 512)
  .png()
  .toFile(path.join(iconsDir, 'icon-512.png'));
await sharp(iconBuffer)
  .resize(180, 180)
  .png()
  .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

fs.copyFileSync(iconSvg, path.join(iconsDir, 'favicon.svg'));

const ogBuffer = fs.readFileSync(ogSvg);
await sharp(ogBuffer)
  .resize(1200, 630)
  .png()
  .toFile(path.join(ogDir, 'preview.png'));
fs.copyFileSync(ogSvg, path.join(ogDir, 'preview.svg'));

console.log('HomeDock assets generated.');
