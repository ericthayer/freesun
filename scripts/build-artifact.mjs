// Bundles a vanilla Web Components page (crew board or flight deck) into one self-contained HTML file for publishing as a
// claude.ai Artifact (no external hosts except Google Fonts are allowed there).
// Usage: node scripts/build-artifact.mjs [outFile] [entry] [page]
//   crew board (default): node scripts/build-artifact.mjs
//   flight deck:          node scripts/build-artifact.mjs dist/freesun-flight-deck.artifact.html src/hud/main.ts hud.html
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(root, process.argv[2] ?? 'dist/freesun-crew-board.artifact.html');
const entry = resolve(root, process.argv[3] ?? 'src/dashboard/main.ts');
const pageFile = resolve(root, process.argv[4] ?? 'dashboard.html');

const result = await build({
  entryPoints: [entry],
  bundle: true,
  write: false,
  minify: true,
  format: 'esm',
  target: 'es2020',
  outdir: 'out',
  // The artifact sandbox blocks the club backend, so it runs on the bundled snapshot.
  define: {
    'import.meta.env.VITE_SUPABASE_URL': 'undefined',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined',
    'import.meta.env.VITE_ARTIFACT': '"true"',
  },
});

const pick = (ext) => result.outputFiles.find((f) => f.path.endsWith(ext))?.text ?? '';
const js = pick('.js').replace(/<\/script/gi, '<\\/script');
const css = pick('.css');

// Satellite tiles are off-host for the artifact sandbox, so the flight deck map starts on its chart.
const page = (await readFile(pageFile, 'utf8')).replace('<hud-map ', '<hud-map imagery="off" ');
const title = page.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '';
const fonts = page.match(/<link\s+rel="stylesheet"[\s\S]*?\/>/)?.[0] ?? '';
const body = (page.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? '').replace(/<script[\s\S]*?<\/script>/g, '');

const html = [
  title,
  '<meta name="claude:viewport-fit-sides" content="cover">',
  fonts,
  `<style>${css}</style>`,
  body.trim(),
  `<script type="module">${js}</script>`,
].join('\n');

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, html);
console.log(`artifact: ${outFile} (${(html.length / 1024).toFixed(1)} KB)`);
