#!/usr/bin/env node
/**
 * Figma Icon Generator
 *
 * Fetches all icon components from the Figma file, exports as SVG,
 * and generates React TSX components with inline SVG.
 *
 * Usage:
 *   FIGMA_TOKEN=<your-pat> node scripts/generate-icons.mjs
 *
 * Options (env vars):
 *   FIGMA_TOKEN  — Figma Personal Access Token (required)
 *   FIGMA_FILE   — File key (default: s3BAU9djJ4fZWidxHbeMaB)
 *   ICON_SIZE    — Filter by size in px, e.g. "24" (default: 24)
 *   CONCURRENCY  — Parallel SVG downloads (default: 20)
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'src/components/icons');

// Load .env from project root if present
function loadDotEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadDotEnv();

const FILE_KEY = process.env.FIGMA_FILE ?? 's3BAU9djJ4fZWidxHbeMaB';
const TOKEN = process.env.FIGMA_TOKEN ?? process.env.FIGMA_ACCESS_TOKEN;
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 20);

if (!TOKEN) {
  console.error('Error: FIGMA_TOKEN env var is required.');
  console.error('Get yours at https://www.figma.com/settings → Personal Access Tokens');
  console.error('Then run: FIGMA_TOKEN=<token> node scripts/generate-icons.mjs');
  process.exit(1);
}

// ─── Figma API helpers ────────────────────────────────────────────────────────

async function figmaGet(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma API ${res.status}: ${body}`);
  }
  return res.json();
}

async function fetchAllComponents() {
  let components = [];
  let after = undefined;

  while (true) {
    const qs = new URLSearchParams({ page_size: '1000' });
    if (after) qs.set('after', after);
    const data = await figmaGet(`/files/${FILE_KEY}/components?${qs}`);
    components = components.concat(data.meta?.components ?? []);
    after = data.meta?.cursor;
    if (!after || (data.meta?.components ?? []).length === 0) break;
  }

  return components;
}

async function fetchSvgUrls(nodeIds) {
  const BATCH = 500;
  const result = {};
  for (let i = 0; i < nodeIds.length; i += BATCH) {
    const batch = nodeIds.slice(i, i + BATCH);
    const ids = batch.join(',');
    const data = await figmaGet(
      `/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg&svg_include_id=false&svg_simplify_stroke=true`,
    );
    Object.assign(result, data.images ?? {});
    if (i + BATCH < nodeIds.length) {
      await sleep(300); // gentle rate limiting
    }
  }
  return result;
}

async function downloadSvg(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await sleep(500 * (attempt + 1));
    }
  }
}

// ─── SVG processing ───────────────────────────────────────────────────────────

function extractSvgParts(svgText) {
  const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch?.[1] ?? '0 0 24 24';

  const widthMatch = svgText.match(/(?:^|<svg[^>]+)\swidth="([^"]+)"/);
  const heightMatch = svgText.match(/(?:^|<svg[^>]+)\sheight="([^"]+)"/);
  const width = widthMatch?.[1] ?? '24';
  const height = heightMatch?.[1] ?? '24';

  // Extract everything between the outermost <svg> tags
  const innerMatch = svgText.match(/<svg[^>]*>([\s\S]*?)<\/svg>\s*$/);
  let inner = innerMatch?.[1]?.trim() ?? '';

  // Remove <defs> blocks (clipPath ids would collide across icons; viewBox already constrains)
  inner = inner.replace(/<defs>[\s\S]*?<\/defs>/g, '').trim();
  // Remove dangling clipPath references left after defs removal
  inner = inner.replace(/\s*clip-path="url\([^)]+\)"/g, '').replace(/\s*clipPath="url\([^)]+\)"/g, '');

  // Normalize dark fills to currentColor (Material icons use #000, #000000, #323232, etc.)
  // Keep "none" fills (transparent) and "white"/"#fff" fills unchanged.
  inner = inner
    .replace(/fill="#(?:0{3}|0{6}|[1-5][0-9a-f]{5}|[1-5][0-9A-F]{5}|323232|212121|1[Cc]1[Cc]1[Cc])"/gi,
      'fill="currentColor"')
    .replace(/fill="black"/gi, 'fill="currentColor"')
    .replace(/stroke="#(?:0{3}|0{6}|323232|212121)"/gi, 'stroke="currentColor"')
    .replace(/stroke="black"/gi, 'stroke="currentColor"');

  // Convert SVG attribute names to JSX camelCase
  inner = inner
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/stroke-opacity=/g, 'strokeOpacity=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
    .replace(/xlink:href=/g, 'xlinkHref=');

  return { viewBox, width, height, inner };
}

// ─── Name utilities ───────────────────────────────────────────────────────────

function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join('');
}

function toComponentName(iconName) {
  const pascal = toPascalCase(iconName);
  // Ensure component name starts with a letter (not a digit)
  const safe = /^\d/.test(pascal) ? `_${pascal}` : pascal;
  return `Icon${safe}`;
}

// ─── Code generation ──────────────────────────────────────────────────────────

function renderComponent(componentName, { viewBox, width, height, inner }) {
  return `import { type SVGProps } from "react";

export function ${componentName}(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${viewBox}"
      width="${width}"
      height="${height}"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      ${inner}
    </svg>
  );
}
`;
}

function renderIndexTs(exports) {
  return exports.map((e) => `export { ${e.componentName} } from "./${e.componentName}";`).join('\n') + '\n';
}

// ─── Concurrency helper ───────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pooled(items, fn, concurrency) {
  const results = [];
  let i = 0;

  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nFigma Icon Generator`);
  console.log(`File: ${FILE_KEY}`);
  console.log(`Output: ${OUT_DIR}\n`);

  // 1. Discover all components
  console.log('Fetching component list from Figma…');
  let components = await fetchAllComponents();
  console.log(`Found ${components.length} components in the file.`);

  // Filter to actual icon components only.
  // Real icons follow the Material Design naming convention: all lowercase, letters/digits/underscores.
  // UI component variants have names like "Variant=Primary, State=Default" (contain "=", spaces, uppercase).
  const ICON_NAME_RE = /^[a-z][a-z0-9_]*$/;
  const iconComponents = components.filter((c) => {
    const name = c.name.trim();
    return ICON_NAME_RE.test(name);
  });

  console.log(`Identified ${iconComponents.length} icon candidates.`);

  if (iconComponents.length === 0) {
    console.error('No icon components found. Double-check the file key or FIGMA_TOKEN.');
    process.exit(1);
  }

  // Build node_id → name map (Figma returns node_id in "X:Y" format)
  const nodeMap = new Map(iconComponents.map((c) => [c.node_id, c.name]));
  const nodeIds = [...nodeMap.keys()];

  // 2. Export SVG URLs (batched)
  console.log(`\nRequesting SVG export URLs (${nodeIds.length} nodes)…`);
  const svgUrls = await fetchSvgUrls(nodeIds);
  const urlCount = Object.values(svgUrls).filter(Boolean).length;
  console.log(`Received ${urlCount} SVG URLs.`);

  // 3. Download SVGs concurrently
  console.log(`\nDownloading SVGs (concurrency=${CONCURRENCY})…`);
  let done = 0;

  const svgData = await pooled(
    nodeIds,
    async (nodeId) => {
      const url = svgUrls[nodeId];
      if (!url) return { nodeId, error: 'no URL' };
      try {
        const svg = await downloadSvg(url);
        done++;
        process.stdout.write(`\r  ${done}/${nodeIds.length} downloaded`);
        return { nodeId, svg };
      } catch (err) {
        done++;
        process.stdout.write(`\r  ${done}/${nodeIds.length} downloaded`);
        return { nodeId, error: err.message };
      }
    },
    CONCURRENCY,
  );
  console.log('\n');

  // 4. Process SVGs and generate components
  const seen = new Set();
  const exports = [];
  const errors = [];

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  for (const { nodeId, svg, error } of svgData) {
    if (error || !svg) {
      errors.push({ nodeId, name: nodeMap.get(nodeId), error: error ?? 'empty SVG' });
      continue;
    }

    const iconName = nodeMap.get(nodeId) ?? nodeId;
    let componentName = toComponentName(iconName);

    // Deduplicate component names
    if (seen.has(componentName)) {
      let n = 2;
      while (seen.has(`${componentName}${n}`)) n++;
      componentName = `${componentName}${n}`;
    }
    seen.add(componentName);

    const parts = extractSvgParts(svg);
    const code = renderComponent(componentName, parts);
    writeFileSync(join(OUT_DIR, `${componentName}.tsx`), code, 'utf8');
    exports.push({ componentName, iconName, nodeId });
  }

  // 5. Write barrel index
  const indexTs = renderIndexTs(exports);
  writeFileSync(join(OUT_DIR, 'index.ts'), indexTs, 'utf8');

  // 6. Report
  console.log(`Generated ${exports.length} icon components → ${OUT_DIR}`);
  if (errors.length) {
    console.warn(`\n${errors.length} icons failed:`);
    for (const e of errors.slice(0, 20)) {
      console.warn(`  ${e.name ?? e.nodeId}: ${e.error}`);
    }
    if (errors.length > 20) console.warn(`  … and ${errors.length - 20} more`);
  }

  // 7. Remind about components/index.ts
  console.log(`\nNext steps:`);
  console.log(`  1. Add to src/components/index.ts:  export * from "./icons";`);
  console.log(`  2. Run: npm run build  (to verify TypeScript)`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
