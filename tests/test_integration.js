/**
 * HeapLens - Phase 1 Integration Test
 *
 * Verifies the end-to-end communication between Node.js and the C++ Allocator Engine.
 * Tests sending JSON requests, executing real C++ First Fit logic, receiving responses,
 * and confirming state accuracy against the engine's real linked-list pool.
 */

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const ENGINE_PATH = path.join(__dirname, '..', 'build', 'heaplens_engine.exe');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`  [FAIL] ${message}`);
        testsFailed++;
        throw new Error(message);
    }
}

async function runIntegrationTest() {
    console.log('====================================================');
    console.log('   HeapLens Phase 1: End-to-End Integration Proof   ');
    console.log('====================================================');
    console.log(`Target C++ Engine Binary: ${ENGINE_PATH}`);

    const engine = spawn(ENGINE_PATH, ['--bridge'], {
        stdio: ['pipe', 'pipe', 'inherit']
    });

    const rl = readline.createInterface({
        input: engine.stdout,
        crlfDelay: Infinity
    });

    const pendingRequests = [];

    rl.on('line', (line) => {
        if (!line.trim()) return;
        const req = pendingRequests.shift();
        if (req) {
            try {
                const parsed = JSON.parse(line);
                req.resolve(parsed);
            } catch (e) {
                req.reject(new Error(`Failed to parse engine JSON: ${line}`));
            }
        }
    });

    function sendCommand(cmd) {
        return new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject });
            engine.stdin.write(JSON.stringify(cmd) + '\n');
        });
    }

    try {
        // Step 1: Ping
        process.stdout.write('[RUN ] Ping C++ Engine...');
        const pingRes = await sendCommand({ action: 'ping' });
        assert(pingRes.success === true, 'Ping should succeed');
        assert(pingRes.action === 'ping', 'Action should be ping');
        console.log(' [PASS]');
        testsPassed++;

        // Step 2: Query Initial State
        process.stdout.write('[RUN ] Query initial pool state...');
        const stateRes = await sendCommand({ action: 'getState' });
        assert(stateRes.success === true, 'getState should succeed');
        assert(stateRes.poolSize === 100, 'Pool capacity should be 100');
        assert(stateRes.stats.totalAllocated === 0, 'Allocated should be 0');
        assert(stateRes.stats.totalFree === 100, 'Free space should be 100');
        assert(stateRes.blocks.length === 1, 'Should have 1 initial block');
        assert(stateRes.blocks[0].isFree === true, 'Initial block should be free');
        console.log(' [PASS]');
        testsPassed++;

        // Step 3: Allocate 40 units (Expect split and ID 1)
        process.stdout.write('[RUN ] Send allocation request (size: 40)...');
        const allocRes1 = await sendCommand({ action: 'allocate', size: 40 });
        assert(allocRes1.success === true, 'Allocation should succeed');
        assert(allocRes1.allocId === 1, 'Assigned ID should be 1');
        assert(allocRes1.allocatedOffset === 0, 'Allocated offset should be 0');
        assert(allocRes1.allocatedSize === 40, 'Allocated size should be 40');
        assert(allocRes1.blocks.length === 2, 'Pool should have 2 blocks after split');
        assert(allocRes1.blocks[0].isFree === false, 'Block 0 should be allocated');
        assert(allocRes1.blocks[0].allocId === 1, 'Block 0 should have ID 1');
        assert(allocRes1.blocks[1].isFree === true, 'Block 1 should be remainder free');
        assert(allocRes1.blocks[1].size === 60, 'Remainder size should be 60');
        console.log(' [PASS]');
        testsPassed++;

        // Step 4: Allocate 35 units (Expect split and ID 2 at offset 40)
        process.stdout.write('[RUN ] Send allocation request (size: 35)...');
        const allocRes2 = await sendCommand({ action: 'allocate', size: 35 });
        assert(allocRes2.success === true, 'Allocation should succeed');
        assert(allocRes2.allocId === 2, 'Assigned ID should be 2');
        assert(allocRes2.allocatedOffset === 40, 'Allocated offset should be 40');
        assert(allocRes2.stats.totalAllocated === 75, 'Total allocated should be 75');
        assert(allocRes2.stats.totalFree === 25, 'Total free should be 25');
        assert(allocRes2.blocks.length === 3, 'Pool should now have 3 blocks');
        // Verify C++ trace contains decision reasoning
        assert(allocRes2.trace.length === 2, 'Should have evaluated 2 blocks during traversal');
        assert(allocRes2.trace[0].decision === 'SKIPPED_ALLOCATED', 'Step 1 should skip allocated block');
        assert(allocRes2.trace[1].decision === 'SPLIT_FIT', 'Step 2 should split free block');
        console.log(' [PASS]');
        testsPassed++;

        // Step 5: Deallocate ID 1
        process.stdout.write('[RUN ] Send deallocation request (allocId: 1)...');
        const freeRes = await sendCommand({ action: 'free', allocId: 1 });
        assert(freeRes.success === true, 'Deallocation should succeed');
        assert(freeRes.freedId === 1, 'Freed ID should be 1');
        assert(freeRes.freedOffset === 0, 'Freed offset should be 0');
        assert(freeRes.freedSize === 40, 'Freed size should be 40');
        assert(freeRes.blocks[0].isFree === true, 'Block 0 should now be free');
        console.log(' [PASS]');
        testsPassed++;

        // Step 6: Test External Fragmentation
        // Free space is: Block 0 (free, 40) + Block 2 (free, 25) = 65 total free.
        // Requesting 50 units should fail because largest contiguous is only 40!
        process.stdout.write('[RUN ] Test out-of-memory under fragmentation (request size: 50)...');
        const fragRes = await sendCommand({ action: 'allocate', size: 50 });
        assert(fragRes.success === false, 'Allocation of 50 units should fail due to fragmentation');
        assert(fragRes.errorMessage.includes('External Fragmentation'), 'Error should explain External Fragmentation');
        assert(fragRes.stats.totalFree === 65, 'Total free should be 65');
        assert(fragRes.stats.largestFreeBlock === 40, 'Largest free block should be 40');
        console.log(' [PASS]');
        testsPassed++;

        // Step 7: Reset Allocator
        process.stdout.write('[RUN ] Send reset request...');
        const resetRes = await sendCommand({ action: 'reset' });
        assert(resetRes.success === true, 'Reset should succeed');
        assert(resetRes.stats.totalAllocated === 0, 'Allocated should be 0 after reset');
        assert(resetRes.stats.totalFree === 100, 'Free space should be 100 after reset');
        assert(resetRes.blocks.length === 1, 'Pool should contain 1 free block after reset');
        console.log(' [PASS]');
        testsPassed++;

        console.log('====================================================');
        console.log(`Integration Tests: ${testsPassed + testsFailed} | Passed: ${testsPassed} | Failed: ${testsFailed}`);
        console.log('>>> INTEGRATION PROOF SUCCESSFUL! REAL C++ ENGINE VERIFIED! <<<');
        console.log('====================================================');
    } catch (err) {
        console.error('\n[FATAL ERROR IN INTEGRATION PROOF]:', err.message);
    } finally {
        engine.kill();
    }
}

runIntegrationTest().catch(console.error);
