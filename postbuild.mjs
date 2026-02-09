// Post-build: convert absolute asset paths to relative for file:// compatibility
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';

const root = './docs';

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
      html = html.replace(/(href|src|srcset|content)="\/(?!\/)/g, `$1="${prefix}`);
      writeFileSync(full, html);
      console.log(`postbuild: fixed paths in ${full} (prefix: ${prefix})`);
    }
  }
}

processDir(root);
console.log('postbuild: done');
