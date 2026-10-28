/**
 * HeapLens - Phase 1 Integration Bridge
 *
 * A lightweight HTTP REST server using standard Node.js built-in modules
 * (no external npm dependencies required). It spawns the compiled C++
 * HeapLens engine executable as a long-running subprocess and communicates
 * via bidirectional JSON-lines over stdio.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const defaultBinaryName = process.platform === 'win32' ? 'heaplens_engine.exe' : 'heaplens_engine';
const ENGINE_PATH = process.env.HEAPLENS_ENGINE_PATH || (
    fs.existsSync(path.join(__dirname, '..', 'build', defaultBinaryName))
        ? path.join(__dirname, '..', 'build', defaultBinaryName)
        : path.join(__dirname, '..', 'build', 'heaplens_engine.exe')
);
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
};

let engineProcess = null;
let engineLineReader = null;
const requestQueue = [];

/**
 * Initialize and spawn the C++ allocator engine process.
 */
function initEngine() {
    return new Promise((resolve, reject) => {
        try {
            console.log(`[Bridge] Spawning C++ engine at: ${ENGINE_PATH}`);
            engineProcess = spawn(ENGINE_PATH, ['--bridge'], {
                stdio: ['pipe', 'pipe', 'inherit']
            });

            engineProcess.on('error', (err) => {
                console.error('[Bridge] Failed to start C++ engine process:', err.message);
                reject(err);
            });

            engineProcess.on('exit', (code, signal) => {
                console.log(`[Bridge] C++ engine process exited with code ${code}, signal ${signal}`);
                engineProcess = null;
            });

            engineLineReader = readline.createInterface({
                input: engineProcess.stdout,
                crlfDelay: Infinity
            });

            engineLineReader.on('line', (line) => {
                if (!line.trim()) return;
                const pending = requestQueue.shift();
                if (pending) {
                    try {
                        const parsed = JSON.parse(line);
                        pending.resolve(parsed);
                    } catch (err) {
                        pending.reject(new Error(`Malformed JSON from C++ engine: ${line}`));
                    }
                }
            });

            // Send ping to verify communication
            sendEngineCommand({ action: 'ping' })
                .then((res) => {
                    console.log('[Bridge] C++ engine ping verified:', res.message || res);
                    resolve(engineProcess);
                })
                .catch(reject);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Send a single JSON command to the C++ engine and await the single-line JSON response.
 */
function sendEngineCommand(cmdObj) {
    return new Promise((resolve, reject) => {
        if (!engineProcess || !engineProcess.stdin.writable) {
            return reject(new Error('C++ engine process is not running or stdin is closed'));
        }
        requestQueue.push({ resolve, reject });
        const jsonStr = JSON.stringify(cmdObj) + '\n';
        engineProcess.stdin.write(jsonStr);
    });
}

/**
 * Helper to parse JSON request bodies.
 */
function parseRequestBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                resolve({ __parseError: err.message, raw: body });
            }
        });
    });
}

/**
 * Create the HTTP server.
 */
const server = http.createServer(async (req, res) => {
    // CORS headers for future React frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    try {
        if (req.method === 'GET' && pathname === '/api/health') {
            const isAlive = engineProcess !== null && !engineProcess.killed && engineProcess.exitCode === null;
            res.writeHead(isAlive ? 200 : 503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: isAlive ? 'ok' : 'degraded', bridge: true, engineAlive: isAlive }));
            return;
        }

        if (req.method === 'GET' && pathname === '/api/state') {
            const engineRes = await sendEngineCommand({ action: 'getState' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(engineRes));
            return;
        }

        if (req.method === 'POST' && pathname === '/api/allocate') {
            const body = await parseRequestBody(req);
            const size = Number(body.size);
            const engineRes = await sendEngineCommand({ action: 'allocate', size });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(engineRes));
            return;
        }

        if (req.method === 'POST' && pathname === '/api/free') {
            const body = await parseRequestBody(req);
            const allocId = Number(body.allocId);
            const engineRes = await sendEngineCommand({ action: 'free', allocId });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(engineRes));
            return;
        }

        if (req.method === 'POST' && pathname === '/api/reset') {
            const body = await parseRequestBody(req);
            const poolSize = body.poolSize ? Number(body.poolSize) : undefined;
            const engineRes = await sendEngineCommand({ action: 'reset', poolSize });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(engineRes));
            return;
        }

        // Serve production static assets from dist/ if available
        if (req.method === 'GET' && !pathname.startsWith('/api') && fs.existsSync(DIST_DIR)) {
            let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
            let filePath = path.join(DIST_DIR, relativePath);

            // If not found or a directory, fallback to index.html for SPA hash routing
            if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                filePath = path.join(DIST_DIR, 'index.html');
            }

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(filePath).pipe(res);
                return;
            }
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Not Found: ${pathname}` }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    }
});

// If executed directly, start server
if (require.main === module) {
    initEngine()
        .then(() => {
            server.listen(PORT, HOST, () => {
                console.log(`[Bridge] HeapLens API Bridge listening on http://${HOST}:${PORT}`);
            });
        })
        .catch((err) => {
            console.error('[Bridge] Failed to initialize C++ bridge:', err);
            process.exit(1);
        });
}

module.exports = {
    server,
    initEngine,
    sendEngineCommand,
    close: () => {
        if (engineProcess) {
            engineProcess.kill();
        }
        server.close();
    }
};
