import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicIconsDir = path.join(projectRoot, 'public', 'icons');
const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

const OBSIDIAN_BG = '#111317';
const SURFACE_DARK = '#181B22';
const BRASS_ACCENT = '#D9A441';
const CREAM_INK = '#ECE7DC';
const BORDER_DARK = '#2E3340';

/**
 * Generates geometric 8-point observatory compass SVG artwork.
 * @param {object} options
 * @param {boolean} options.withBackground - Include opaque obsidian plate
 * @param {number} options.scale - Artwork scale inside 512x512 canvas (0.76 for maskable/adaptive safe zone)
 * @param {boolean} options.roundClip - Clip background to circle for Android ic_launcher_round
 */
function buildIconSvg({ withBackground = true, scale = 1, roundClip = false } = {}) {
  const size = 512;
  const cx = size / 2;
  const cy = size / 2;

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    const isCardinal = i % 3 === 0;
    const y1 = isCardinal ? 66 : 74;
    const y2 = 90;
    return `<line x1="256" y1="${y1}" x2="256" y2="${y2}" stroke="${
      isCardinal ? BRASS_ACCENT : CREAM_INK
    }" stroke-width="${isCardinal ? 5 : 2.5}" stroke-opacity="${
      isCardinal ? 0.95 : 0.45
    }" stroke-linecap="round" transform="rotate(${deg} 256 256)" />`;
  }).join('\n        ');

  const rays = [45, 135, 225, 315]
    .map(
      (deg) =>
        `<polygon points="256,142 268,244 256,256 244,244" fill="${BRASS_ACCENT}" fill-opacity="0.45" transform="rotate(${deg} 256 256)" />`,
    )
    .join('\n        ');

  const bgLayer = withBackground
    ? roundClip
      ? `<circle cx="256" cy="256" r="256" fill="${OBSIDIAN_BG}" />
         <circle cx="256" cy="256" r="248" fill="none" stroke="${BORDER_DARK}" stroke-width="4" />`
      : `<rect width="512" height="512" fill="${OBSIDIAN_BG}" />`
    : '';

  const innerContent = `
      <circle cx="256" cy="256" r="190" fill="${withBackground ? SURFACE_DARK : 'none'}" stroke="${BRASS_ACCENT}" stroke-width="5" stroke-opacity="0.85" />
      <circle cx="256" cy="256" r="158" fill="none" stroke="${BORDER_DARK}" stroke-width="2.5" />
      ${ticks}
      <!-- Secondary 45deg bronze points -->
      ${rays}
      <!-- Primary cardinal needle (N/S/E/W) -->
      <polygon points="256,98 278,256 256,242 234,256" fill="${BRASS_ACCENT}" />
      <polygon points="256,414 278,256 256,270 234,256" fill="${CREAM_INK}" fill-opacity="0.72" />
      <polygon points="98,256 256,234 242,256 256,278" fill="${CREAM_INK}" fill-opacity="0.55" />
      <polygon points="414,256 256,234 270,256 256,278" fill="${BRASS_ACCENT}" fill-opacity="0.82" />
      <!-- Central solar jewel -->
      <circle cx="256" cy="256" r="26" fill="${OBSIDIAN_BG}" stroke="${BRASS_ACCENT}" stroke-width="5" />
      <circle cx="256" cy="256" r="9" fill="${BRASS_ACCENT}" />
  `;

  const transformGroup =
    scale === 1
      ? innerContent
      : `<g transform="translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})">${innerContent}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${bgLayer}
  ${transformGroup}
</svg>`;
}

function renderPng(svgContent, pixelSize) {
  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: pixelSize },
  });
  return resvg.render().asPng();
}

function generateWebIcons() {
  mkdirSync(publicIconsDir, { recursive: true });

  const masterSvg = buildIconSvg({ withBackground: true, scale: 1 });
  const maskableSvg = buildIconSvg({ withBackground: true, scale: 0.74 });
  const appleSvg = buildIconSvg({ withBackground: true, scale: 0.9 });

  writeFileSync(path.join(publicIconsDir, 'icon.svg'), masterSvg, 'utf8');
  writeFileSync(path.join(publicIconsDir, 'icon-192.png'), renderPng(masterSvg, 192));
  writeFileSync(path.join(publicIconsDir, 'icon-512.png'), renderPng(masterSvg, 512));
  writeFileSync(
    path.join(publicIconsDir, 'icon-maskable-512.png'),
    renderPng(maskableSvg, 512),
  );
  writeFileSync(
    path.join(publicIconsDir, 'apple-touch-icon.png'),
    renderPng(appleSvg, 180),
  );

  console.log('Generated web & PWA icons in public/icons/');
}

function generateAndroidIcons() {
  if (!existsSync(androidResDir)) {
    console.warn('android/ directory not found; skipping Android mipmap generation.');
    return;
  }

  const densities = [
    { dir: 'mipmap-mdpi', launcher: 48, foreground: 108 },
    { dir: 'mipmap-hdpi', launcher: 72, foreground: 162 },
    { dir: 'mipmap-xhdpi', launcher: 96, foreground: 216 },
    { dir: 'mipmap-xxhdpi', launcher: 144, foreground: 324 },
    { dir: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
  ];

  const squareLauncherSvg = buildIconSvg({ withBackground: true, scale: 0.92 });
  const roundLauncherSvg = buildIconSvg({
    withBackground: true,
    scale: 0.9,
    roundClip: true,
  });
  // Adaptive icon foreground: transparent background, artwork safely inside 66/108 (~0.62) inner circle
  const foregroundSvg = buildIconSvg({ withBackground: false, scale: 0.62 });

  for (const { dir, launcher, foreground } of densities) {
    const outDir = path.join(androidResDir, dir);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, 'ic_launcher.png'), renderPng(squareLauncherSvg, launcher));
    writeFileSync(
      path.join(outDir, 'ic_launcher_round.png'),
      renderPng(roundLauncherSvg, launcher),
    );
    writeFileSync(
      path.join(outDir, 'ic_launcher_foreground.png'),
      renderPng(foregroundSvg, foreground),
    );
  }

  const valuesDir = path.join(androidResDir, 'values');
  mkdirSync(valuesDir, { recursive: true });
  writeFileSync(
    path.join(valuesDir, 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${OBSIDIAN_BG}</color>
</resources>
`,
    'utf8',
  );

  console.log('Generated Android adaptive & mipmap launcher icons in android/app/src/main/res/');
}

generateWebIcons();
if (process.argv.includes('--android')) {
  generateAndroidIcons();
}
