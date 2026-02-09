// Post-build: convert absolute asset paths to relative for file:// compatibility
// and append content-hash query strings for cache busting on static assets.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { createHash } from 'crypto';

const root = './docs';

// Cache file content hashes so each file is hashed only once
const hashCache = new Map();

function getFileHash(filePath) {
  if (hashCache.has(filePath)) return hashCache.get(filePath);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) return null;
  const hash = createHash('md5').update(readFileSync(filePath)).digest('hex').slice(0, 8);
  hashCache.set(filePath, hash);
  return hash;
}

// Extensions that should get cache-busting query strings
const bustExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.css', '.js', '.json']);

function shouldBust(assetPath) {
  // Skip _astro/ assets (already content-hashed by Astro)
  if (assetPath.startsWith('_astro/')) return false;
  // Skip pagefind assets (versioned internally)
  if (assetPath.startsWith('pagefind/')) return false;
  const dot = assetPath.lastIndexOf('.');
  if (dot === -1) return false;
  return bustExts.has(assetPath.slice(dot).toLowerCase());
}

function processDir(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      processDir(full);
    } else if (entry.endsWith('.html')) {
      // Compute relative prefix from this file to the docs root
      const depth = relative(root, dirname(full));
      const prefix = depth ? depth.split('/').map(() => '..').join('/') + '/' : './';

      let html = readFileSync(full, 'utf-8');

      // Convert absolute paths to relative and add cache-busting hashes
      html = html.replace(/(href|src|srcset|content)="\/(?!\/)([^"]*?)"/g, (_match, attr, assetPath) => {
        const relativePath = prefix + assetPath;
        if (shouldBust(assetPath)) {
          const hash = getFileHash(join(root, assetPath));
          if (hash) return `${attr}="${relativePath}?v=${hash}"`;
        }
        return `${attr}="${relativePath}"`;
      });

      writeFileSync(full, html);
      console.log(`postbuild: fixed paths in ${full} (prefix: ${prefix})`);
    }
  }
}

processDir(root);
console.log(`postbuild: done (${hashCache.size} assets cache-busted)`);
