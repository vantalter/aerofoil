#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const palettes = {
  light: {
    chromeTop: "#F3F3F5",
    chromeMiddle: "#E9E9EC",
    chromeBottom: "#E4E5E8",
    tabOverlay: "#FAFAFB",
    tabOpacity: ".36",
    separator: "#FFFFFF",
    separatorOpacity: ".58",
    glassTop: "#FFFFFF",
    glassTopOpacity: ".92",
    glassMiddle: "#FFFFFF",
    glassMiddleOpacity: ".72",
    glassBottom: "#F9FAFC",
    glassBottomOpacity: ".82",
    edgeOpacity: ".78",
    sheenOpacity: ".88",
    centerSheenOpacity: ".24",
    shadow: "#656872",
    shadowOpacity: ".24",
  },
  dark: {
    chromeTop: "#2F2E33",
    chromeMiddle: "#28272C",
    chromeBottom: "#242328",
    tabOverlay: "#FFFFFF",
    tabOpacity: ".025",
    separator: "#FFFFFF",
    separatorOpacity: ".08",
    glassTop: "#4D4C53",
    glassTopOpacity: ".92",
    glassMiddle: "#3A393F",
    glassMiddleOpacity: ".9",
    glassBottom: "#313036",
    glassBottomOpacity: ".96",
    edgeOpacity: ".14",
    sheenOpacity: ".2",
    centerSheenOpacity: ".07",
    shadow: "#000000",
    shadowOpacity: ".55",
  },
};

function defs(p, filterBounds = '-25%" y="-45%" width="160%" height="190%') {
  return `
  <defs>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="112" gradientUnits="userSpaceOnUse"><stop stop-color="${p.chromeTop}"/><stop offset=".42" stop-color="${p.chromeMiddle}"/><stop offset="1" stop-color="${p.chromeBottom}"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="48" x2="0" y2="88" gradientUnits="userSpaceOnUse"><stop stop-color="${p.glassTop}" stop-opacity="${p.glassTopOpacity}"/><stop offset=".52" stop-color="${p.glassMiddle}" stop-opacity="${p.glassMiddleOpacity}"/><stop offset="1" stop-color="${p.glassBottom}" stop-opacity="${p.glassBottomOpacity}"/></linearGradient>
    <radialGradient id="sheen" cx="0" cy="0" r="1" gradientTransform="translate(15 51) rotate(66) scale(35 27)" gradientUnits="userSpaceOnUse"><stop stop-color="#FFFFFF" stop-opacity="${p.sheenOpacity}"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <filter id="lift" x="${filterBounds}"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="${p.shadow}" flood-opacity="${p.shadowOpacity}"/></filter>
  </defs>`;
}

function base(p, width = 50) {
  return `<rect width="${width}" height="200" fill="url(#chrome)"/><rect width="${width}" height="45" fill="${p.tabOverlay}" fill-opacity="${p.tabOpacity}"/><rect y="45" width="${width}" height="1" fill="${p.separator}" fill-opacity="${p.separatorOpacity}"/>`;
}

function sliceSvg(kind, p) {
  let bounds;
  let glass;
  if (kind === "left") {
    bounds = '-25%" y="-45%" width="160%" height="190%';
    glass = `<g filter="url(#lift)"><path fill="url(#glass)" stroke="#FFFFFF" stroke-opacity="${p.edgeOpacity}" d="M25 48h35v40H25C14.5 88 6 79 6 68s8.5-20 19-20Z"/><path fill="url(#sheen)" d="M25 49h35v7H25c-7.4 0-13.8 4.6-16.8 11.2C8.6 57.1 15.9 49 25 49Z"/></g>`;
  } else if (kind === "right") {
    bounds = '-35%" y="-45%" width="170%" height="190%';
    glass = `<g filter="url(#lift)"><path fill="url(#glass)" stroke="#FFFFFF" stroke-opacity="${p.edgeOpacity}" d="M-10 48h35c10.5 0 19 9 19 20s-8.5 20-19 20h-35Z"/><path fill="url(#sheen)" d="M-10 49h35c9 0 16.4 8 16.8 18.2C38.8 60.6 32.4 56 25 56h-35Z"/></g>`;
  } else {
    bounds = '-10%" y="-45%" width="120%" height="190%';
    glass = `<g filter="url(#lift)"><path fill="url(#glass)" d="M-4 48h58v40H-4z"/><path fill="#FFFFFF" fill-opacity="${p.edgeOpacity}" d="M-4 48h58v1H-4zM-4 87h58v1H-4z"/><path fill="#FFFFFF" fill-opacity="${p.centerSheenOpacity}" d="M-4 49h58v7H-4z"/></g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="200" viewBox="0 0 50 200">${defs(p, bounds)}
  ${base(p)}
  ${glass}
</svg>\n`;
}

function previewSvg(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200" viewBox="0 0 1200 200">${defs(p, '-2%" y="-45%" width="104%" height="190%')}
  ${base(p, 1200)}
  <g filter="url(#lift)">
    <rect x="6" y="48" width="1188" height="40" rx="20" fill="url(#glass)" stroke="#FFFFFF" stroke-opacity="${p.edgeOpacity}"/>
    <path fill="#FFFFFF" fill-opacity="${p.centerSheenOpacity}" d="M26 49h1148a19 19 0 0 1 18 12c-4-4-10-6-18-6H26c-8 0-14 2-18 6a19 19 0 0 1 18-12Z"/>
  </g>
</svg>\n`;
}

await mkdir(resolve(root, "img"), { recursive: true });
await mkdir(resolve(root, "src"), { recursive: true });

for (const [mode, palette] of Object.entries(palettes)) {
  for (const kind of ["left", "center", "right"]) {
    await writeFile(resolve(root, `img/${mode}_frame_${kind}.svg`), sliceSvg(kind, palette));
  }
  await writeFile(resolve(root, `src/toolbar-${mode}.svg`), previewSvg(palette));
}

console.log("Generated light and dark toolbar assets.");
