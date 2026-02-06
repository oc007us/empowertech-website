// Post-build: convert absolute asset paths to relative for file:// compatibility
import { readFileSync, writeFileSync } from 'fs';

const htmlPath = './docs/index.html';
let html = readFileSync(htmlPath, 'utf-8');

// Convert absolute paths to relative: href="/..." → href="./..."  and  src="/..." → src="./..."
html = html.replace(/(href|src|content)="\/(?!\/)/g, '$1="./');

writeFileSync(htmlPath, html);
console.log('postbuild: converted absolute paths to relative in index.html');
