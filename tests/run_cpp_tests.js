const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const binaryName = process.platform === 'win32' ? 'test_allocator.exe' : 'test_allocator';
const binaryPath = path.join(__dirname, '..', 'build', binaryName);
const fallbackPath = path.join(__dirname, '..', 'build', 'test_allocator.exe');
const target = fs.existsSync(binaryPath) ? binaryPath : fallbackPath;

const res = spawnSync(target, { stdio: 'inherit' });
process.exit(res.status ?? 0);
