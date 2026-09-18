#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = [];

if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) errors.push("version must use x.y.z format");
if (manifest.short_name !== "Aerofoil") errors.push("short_name must be Aerofoil");
if (manifest.browser_specific_settings?.gecko?.id !== "aerofoil@vantalter.github.io") {
  errors.push("stable Firefox extension ID is missing or incorrect");
}

if (process.env.GITHUB_REF_TYPE === "tag") {
  const expectedTag = `v${manifest.version}`;
  if (process.env.GITHUB_REF_NAME !== expectedTag) {
    errors.push(`release tag must be ${expectedTag}, got ${process.env.GITHUB_REF_NAME}`);
  }
}

const referencedAssets = [
  ...Object.values(manifest.icons ?? {}),
  ...(manifest.theme?.images?.additional_backgrounds ?? []),
  ...(manifest.dark_theme?.images?.additional_backgrounds ?? []),
];

for (const asset of referencedAssets) {
  try {
    await access(resolve(root, asset));
  } catch {
    errors.push(`missing referenced asset: ${asset}`);
  }
}

for (const mode of ["light", "dark"]) {
  for (const kind of ["left", "center", "right"]) {
    const path = resolve(root, `img/${mode}_frame_${kind}.svg`);
    const svg = await readFile(path, "utf8");
    if (!svg.includes('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="200"')) {
      errors.push(`unexpected SVG dimensions or root element: img/${mode}_frame_${kind}.svg`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated Aerofoil ${manifest.version}: ${referencedAssets.length} referenced assets.`);
