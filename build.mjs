import { cp, mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const pages = ['index.html', 'elections/index.html', 'privacy/index.html', 'terms/index.html', 'cookies/index.html'];
for (const page of pages) {
  const html = await readFile(path.join(root, page), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) throw Error(`Duplicate element IDs in ${page}`);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/') && !url.startsWith('#')) continue;
    const [pathname, fragment] = url.split('#');
    const target = pathname ? path.join(root, pathname) : path.join(root, page);
    const actual = (await stat(target)).isDirectory() ? path.join(target, 'index.html') : target;
    if (fragment) {
      const targetHtml = await readFile(actual, 'utf8');
      if (!targetHtml.includes(`id="${fragment}"`)) throw Error(`Missing anchor ${url} in ${page}`);
    }
  }
}
const out = path.join(root, 'dist');
await mkdir(out, { recursive:true });
for (const name of ['index.html','elections','privacy','terms','cookies','styles.css','app.js','site-config.js','assets']) await cp(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Built marketing pages and legal drafts. All page assets and navigation anchors verified.');
