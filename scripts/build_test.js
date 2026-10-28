const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

const isWin = process.platform === 'win32';
const targetName = isWin ? 'test_allocator.exe' : 'test_allocator';
const targetPath = path.join(buildDir, targetName);

console.log(`[Build Test] Compiling ${targetName} using g++...`);
const res = spawnSync('g++', [
    '-std=c++17',
    '-Wall',
    '-Wextra',
    'src/allocator.cpp',
    'tests/test_allocator.cpp',
    '-o',
    targetPath
], { stdio: 'inherit' });

if (res.status !== 0) {
    console.error(`[Build Test] Compilation failed with status code ${res.status}`);
    process.exit(res.status || 1);
}
console.log(`[Build Test] Successfully built: ${targetPath}`);
