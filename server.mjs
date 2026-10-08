import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const project = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv.includes('--production') ? path.join(project, 'dist') : project;
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.webp':'image/webp', '.png':'image/png', '.jpeg':'image/jpeg', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.woff2':'font/woff2', '.txt':'text/plain; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/__qa__/responsive' && !process.argv.includes('--production')) {
      response.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
      response.end(await readFile(path.join(project, 'work/responsive-preview.html')));
      return;
    }
    const segments = pathname.split('/');
    if (segments.some(s => s.startsWith('.') || s === 'work') || pathname.includes('\\')) throw { code:'ENOENT' };
    if (!['/', '/index.html', '/elections', '/elections/', '/elections/index.html', '/privacy', '/privacy/', '/privacy/index.html', '/terms', '/terms/', '/terms/index.html', '/cookies', '/cookies/', '/cookies/index.html', '/styles.css', '/app.js', '/site-config.js'].includes(pathname) && !pathname.startsWith('/assets/')) throw {code:'ENOENT'};
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) throw {code:'ENOENT'};
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const data = await readFile(file);
    response.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
    response.end('Page not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`StruktHQ preview: http://localhost:${port}`));
server.on('error', error => { console.error(error.message);process.exitCode=1; });
