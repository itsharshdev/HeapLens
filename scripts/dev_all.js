/**
 * HeapLens Concurrent Dev Server Runner
 * Spawns both the C++ API bridge daemon and the Vite dev server in a single terminal.
 */
const { spawn } = require('child_process');

console.log('====================================================');
console.log('  HeapLens: Starting C++ Bridge + Vite Dev Server   ');
console.log('====================================================');

const bridge = spawn('node', ['bridge/server.js'], { stdio: 'inherit', shell: true });
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

function cleanup() {
    try { bridge.kill(); } catch (e) {}
    try { vite.kill(); } catch (e) {}
    process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
