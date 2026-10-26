#include "../src/allocator.h"
#include <iostream>
#include <cassert>
#include <string>
#include <vector>

using namespace heaplens;

// Test framework utilities
static int g_testsRun = 0;
static int g_testsPassed = 0;
static int g_testsFailed = 0;

#define TEST_ASSERT(cond, msg) \
    do { \
        if (!(cond)) { \
            std::cerr << "  [FAIL] " << msg << " (" << __FILE__ << ":" << __LINE__ << ")\n"; \
            return false; \
        } \
    } while(0)

#define RUN_TEST(fn) \
    do { \
        g_testsRun++; \
        std::cout << "[RUN ] " << #fn << "..." << std::flush; \
        if (fn()) { \
            g_testsPassed++; \
            std::cout << " [PASS]\n"; \
        } else { \
            g_testsFailed++; \
            std::cout << " [FAILED]\n"; \
        } \
    } while(0)

// 1. Initial pool state
bool test_initial_pool_state() {
    Allocator alloc(100);
    Stats stats = alloc.getStats();

    TEST_ASSERT(stats.totalPoolSize == 100, "Total pool size should be 100");
    TEST_ASSERT(stats.totalAllocated == 0, "Allocated space should be 0");
    TEST_ASSERT(stats.totalFree == 100, "Free space should be 100");
    TEST_ASSERT(stats.largestFreeBlock == 100, "Largest free block should be 100");
    TEST_ASSERT(stats.freeBlockCount == 1, "Free block count should be 1");
    TEST_ASSERT(stats.allocatedBlockCount == 0, "Allocated block count should be 0");
    TEST_ASSERT(stats.externalFragmentationPercent == 0.0, "Initial fragmentation should be 0.0%");

    auto blocks = alloc.getBlocks();
    TEST_ASSERT(blocks.size() == 1, "Should contain exactly one block");
    TEST_ASSERT(blocks[0].startOffset == 0, "Block offset should be 0");
    TEST_ASSERT(blocks[0].size == 100, "Block size should be 100");
    TEST_ASSERT(blocks[0].isFree == true, "Block should be free");
    TEST_ASSERT(blocks[0].allocId == 0, "Free block should have allocId 0");

    return true;
}

// 2. Exact-fit allocation
bool test_exact_fit_allocation() {
    Allocator alloc(100);
    AllocationResult res = alloc.allocate(100);

    TEST_ASSERT(res.success == true, "Exact fit allocation should succeed");
    TEST_ASSERT(res.allocId == 1, "First allocation should have ID 1");
    TEST_ASSERT(res.allocatedOffset == 0, "Allocated offset should be 0");
    TEST_ASSERT(res.allocatedSize == 100, "Allocated size should be 100");

    Stats stats = alloc.getStats();
    TEST_ASSERT(stats.totalAllocated == 100, "Total allocated should be 100");
    TEST_ASSERT(stats.totalFree == 0, "Total free should be 0");
    TEST_ASSERT(stats.freeBlockCount == 0, "Free block count should be 0");
    TEST_ASSERT(stats.allocatedBlockCount == 1, "Allocated block count should be 1");

    auto blocks = alloc.getBlocks();
    TEST_ASSERT(blocks.size() == 1, "Should have 1 block (no split)");
    TEST_ASSERT(!blocks[0].isFree, "Block should be allocated");
    TEST_ASSERT(blocks[0].allocId == 1, "Block should have allocId 1");

    // Check trace
    TEST_ASSERT(!res.trace.empty(), "Trace should not be empty");
    TEST_ASSERT(res.trace.back().decision == "EXACT_FIT", "Decision should be EXACT_FIT");

    return true;
}

// 3. Allocation requiring a split
bool test_split_allocation() {
    Allocator alloc(100);
    AllocationResult res = alloc.allocate(30);

    TEST_ASSERT(res.success == true, "Allocation should succeed");
    TEST_ASSERT(res.allocId == 1, "Alloc ID should be 1");
    TEST_ASSERT(res.allocatedOffset == 0, "Allocated offset should be 0");
    TEST_ASSERT(res.allocatedSize == 30, "Allocated size should be 30");

    auto blocks = alloc.getBlocks();
    TEST_ASSERT(blocks.size() == 2, "Should be split into 2 blocks");

    // Block 0: Allocated (size 30, offset 0)
    TEST_ASSERT(blocks[0].startOffset == 0, "Block 0 startOffset should be 0");
    TEST_ASSERT(blocks[0].size == 30, "Block 0 size should be 30");
    TEST_ASSERT(blocks[0].isFree == false, "Block 0 should be allocated");
    TEST_ASSERT(blocks[0].allocId == 1, "Block 0 allocId should be 1");

    // Block 1: Remainder Free (size 70, offset 30)
    TEST_ASSERT(blocks[1].startOffset == 30, "Block 1 startOffset should be 30");
    TEST_ASSERT(blocks[1].size == 70, "Block 1 size should be 70");
    TEST_ASSERT(blocks[1].isFree == true, "Block 1 should be free");
    TEST_ASSERT(blocks[1].allocId == 0, "Block 1 allocId should be 0");

    Stats stats = alloc.getStats();
    TEST_ASSERT(stats.totalAllocated == 30, "Total allocated should be 30");
    TEST_ASSERT(stats.totalFree == 70, "Total free should be 70");
    TEST_ASSERT(stats.largestFreeBlock == 70, "Largest free block should be 70");
    TEST_ASSERT(stats.freeBlockCount == 1, "Free block count should be 1");
    TEST_ASSERT(stats.allocatedBlockCount == 1, "Allocated block count should be 1");

    // Check trace
    TEST_ASSERT(res.trace.back().decision == "SPLIT_FIT", "Decision should be SPLIT_FIT");

    return true;
}

// 4. Allocation failure when no contiguous block is large enough (Fragmentation demo)
bool test_allocation_failure_fragmentation() {
    Allocator alloc(100);
    // Allocate 4 blocks of 25: IDs 1, 2, 3, 4
    alloc.allocate(25);
    alloc.allocate(25);
    alloc.allocate(25);
    alloc.allocate(25);

    // Free alternating blocks (ID 1 and ID 3)
    alloc.deallocate(1);
    alloc.deallocate(3);

    // Pool now has:
    // [Free: 25] [Allocated ID 2: 25] [Free: 25] [Allocated ID 4: 25]
    Stats stats = alloc.getStats();
    TEST_ASSERT(stats.totalFree == 50, "Total free space should be 50");
    TEST_ASSERT(stats.largestFreeBlock == 25, "Largest free block should be 25");
    TEST_ASSERT(stats.freeBlockCount == 2, "There should be 2 free blocks");
    // External fragmentation = (1 - 25/50) * 100 = 50.0%
    TEST_ASSERT(stats.externalFragmentationPercent == 50.0, "Fragmentation should be 50.0%");

    // Now request 40 units.
    // Total free space is 50, but largest contiguous is only 25!
    AllocationResult res = alloc.allocate(40);
    TEST_ASSERT(res.success == false, "Allocation of 40 units should fail");
    TEST_ASSERT(!res.errorMessage.empty(), "Error message should be provided");
    // Verify error message mentions External Fragmentation
    TEST_ASSERT(res.errorMessage.find("External Fragmentation") != std::string::npos,
                "Error should explain external fragmentation");

    return true;
}

// 5. Invalid allocation sizes
bool test_invalid_allocation_sizes() {
    Allocator alloc(100);

    // Size 0
    AllocationResult resZero = alloc.allocate(0);
    TEST_ASSERT(resZero.success == false, "Allocating size 0 must fail");
    TEST_ASSERT(resZero.errorMessage.find("greater than zero") != std::string::npos, "Error should mention > 0");

    // Size > poolSize
    AllocationResult resOver = alloc.allocate(150);
    TEST_ASSERT(resOver.success == false, "Allocating size > poolSize must fail");
    TEST_ASSERT(resOver.errorMessage.find("exceeds total pool capacity") != std::string::npos, "Error should mention capacity");

    return true;
}

// 6. Successful deallocation
bool test_successful_deallocation() {
    Allocator alloc(100);
    alloc.allocate(40); // ID 1
    alloc.allocate(30); // ID 2

    DeallocationResult dRes = alloc.deallocate(1);
    TEST_ASSERT(dRes.success == true, "Deallocation of ID 1 should succeed");
    TEST_ASSERT(dRes.freedId == 1, "Freed ID should be 1");
    TEST_ASSERT(dRes.freedOffset == 0, "Freed offset should be 0");
    TEST_ASSERT(dRes.freedSize == 40, "Freed size should be 40");

    auto blocks = alloc.getBlocks();
    TEST_ASSERT(blocks[0].isFree == true, "First block should now be free");
    TEST_ASSERT(blocks[0].allocId == 0, "Freed block allocId should be 0");
    TEST_ASSERT(blocks[1].isFree == false, "Second block should remain allocated");
    TEST_ASSERT(blocks[1].allocId == 2, "Second block should have allocId 2");

    return true;
}

// 7. Unknown allocation ID and double-free handling
bool test_unknown_and_double_free() {
    Allocator alloc(100);
    alloc.allocate(30); // ID 1

    // Invalid ID (<= 0)
    DeallocationResult resNeg = alloc.deallocate(0);
    TEST_ASSERT(resNeg.success == false, "Freeing ID 0 must fail");
    TEST_ASSERT(resNeg.errorMessage.find("positive integers") != std::string::npos, "Error should mention positive integers");

    // Unknown ID
    DeallocationResult resUnknown = alloc.deallocate(99);
    TEST_ASSERT(resUnknown.success == false, "Freeing non-existent ID 99 must fail");
    TEST_ASSERT(resUnknown.errorMessage.find("Unknown allocation ID") != std::string::npos, "Error should mention unknown ID");

    // Valid free of ID 1
    DeallocationResult resValid = alloc.deallocate(1);
    TEST_ASSERT(resValid.success == true, "Freeing ID 1 should succeed");

    // Double-free of ID 1
    DeallocationResult resDouble = alloc.deallocate(1);
    TEST_ASSERT(resDouble.success == false, "Double-freeing ID 1 must fail");
    TEST_ASSERT(resDouble.errorMessage.find("Unknown allocation ID") != std::string::npos ||
                resDouble.errorMessage.find("Double-free") != std::string::npos,
                "Error should describe unknown or double-free");

    return true;
}

// 8. Coalescing two and three adjacent free blocks
bool test_coalescing_two_and_three_blocks() {
    Allocator alloc(100);
    // Allocate 3 blocks: ID 1 (20), ID 2 (30), ID 3 (50)
    alloc.allocate(20); // ID 1 [0..20)
    alloc.allocate(30); // ID 2 [20..50)
    alloc.allocate(50); // ID 3 [50..100)

    Stats s1 = alloc.getStats();
    TEST_ASSERT(s1.allocatedBlockCount == 3, "3 allocated blocks");
    TEST_ASSERT(s1.freeBlockCount == 0, "0 free blocks");

    // Part A: Free ID 1. Free block of 20 at [0..20)
    alloc.deallocate(1);
    auto b1 = alloc.getBlocks();
    TEST_ASSERT(b1.size() == 3, "3 blocks total");
    TEST_ASSERT(b1[0].isFree == true && b1[0].size == 20, "Block 0 free, size 20");

    // Part B: Free ID 2. Adjacent to Block 0!
    // Should COALESCE [0..20) and [20..50) into [0..50)
    DeallocationResult d2 = alloc.deallocate(2);
    TEST_ASSERT(d2.success == true, "Deallocate ID 2 should succeed");
    TEST_ASSERT(!d2.coalesceEvents.empty(), "Should record coalesce event for 2 blocks");
    TEST_ASSERT(d2.coalesceEvents[0].newSize == 50, "Merged size should be 50");

    auto b2 = alloc.getBlocks();
    TEST_ASSERT(b2.size() == 2, "Should now be 2 blocks after coalescing");
    TEST_ASSERT(b2[0].isFree == true && b2[0].size == 50, "First block should be coalesced free block of 50");
    TEST_ASSERT(b2[1].isFree == false && b2[1].size == 50, "Second block should be allocated ID 3");

    // Part C: Free ID 3. Now the entire pool [0..100) should be coalesced into 1 block!
    DeallocationResult d3 = alloc.deallocate(3);
    TEST_ASSERT(d3.success == true, "Deallocate ID 3 should succeed");
    TEST_ASSERT(!d3.coalesceEvents.empty(), "Should record coalesce event");

    auto b3 = alloc.getBlocks();
    TEST_ASSERT(b3.size() == 1, "Should coalesce into exactly 1 block");
    TEST_ASSERT(b3[0].size == 100, "Single block size should be 100");
    TEST_ASSERT(b3[0].isFree == true, "Single block should be free");

    // Part D: Coalescing three blocks simultaneously:
    // Create [Free 20] [Allocated 30 (ID 4)] [Free 50]
    alloc.allocate(20); // ID 4 [0..20)
    alloc.allocate(30); // ID 5 [20..50)
    alloc.allocate(50); // ID 6 [50..100)
    alloc.deallocate(4); // [0..20) free
    alloc.deallocate(6); // [50..100) free
    // State: [Free 20] [Allocated ID 5: 30] [Free 50]
    auto bPre = alloc.getBlocks();
    TEST_ASSERT(bPre.size() == 3, "3 blocks before center deallocation");
    TEST_ASSERT(bPre[0].isFree && !bPre[1].isFree && bPre[2].isFree, "Middle block allocated between two free blocks");

    // Now deallocate middle block ID 5:
    // It should merge with both left (20) and right (50) -> single block of 100!
    DeallocationResult d5 = alloc.deallocate(5);
    TEST_ASSERT(d5.success == true, "Deallocating middle block should succeed");
    TEST_ASSERT(d5.coalesceEvents.size() >= 1, "Should record coalesce events");

    auto bPost = alloc.getBlocks();
    TEST_ASSERT(bPost.size() == 1, "All 3 blocks must coalesce into 1 single block");
    TEST_ASSERT(bPost[0].size == 100, "Coalesced block must be 100 units");
    TEST_ASSERT(bPost[0].isFree == true, "Coalesced block must be free");

    return true;
}

// 9. Repeated allocation and deallocation
bool test_repeated_alloc_dealloc() {
    Allocator alloc(100);

    for (int cycle = 0; cycle < 5; ++cycle) {
        AllocationResult r1 = alloc.allocate(20);
        AllocationResult r2 = alloc.allocate(30);
        AllocationResult r3 = alloc.allocate(50);

        TEST_ASSERT(r1.success && r2.success && r3.success, "All allocations in cycle should succeed");

        DeallocationResult d1 = alloc.deallocate(r1.allocId);
        DeallocationResult d2 = alloc.deallocate(r2.allocId);
        DeallocationResult d3 = alloc.deallocate(r3.allocId);

        TEST_ASSERT(d1.success && d2.success && d3.success, "All deallocations in cycle should succeed");

        Stats s = alloc.getStats();
        TEST_ASSERT(s.totalFree == 100, "Pool should be completely free after cycle");
        TEST_ASSERT(s.freeBlockCount == 1, "Should coalesce back to 1 free block");
    }

    // Allocation IDs should have incremented monotonically
    TEST_ASSERT(alloc.getNextAllocId() == 16, "Next alloc ID should be 16 after 15 allocations");

    return true;
}

// 10. Pool boundaries and invariant checks
bool test_pool_boundaries_and_invariants() {
    Allocator alloc(128); // Test non-default pool size
    alloc.allocate(16);
    alloc.allocate(32);
    alloc.allocate(64);

    auto blocks = alloc.getBlocks();
    size_t accumulatedOffset = 0;
    size_t totalSize = 0;

    for (const auto& block : blocks) {
        TEST_ASSERT(block.startOffset == accumulatedOffset, "Offsets must be strictly contiguous");
        accumulatedOffset += block.size;
        totalSize += block.size;
    }

    TEST_ASSERT(totalSize == 128, "Sum of block sizes must exactly match pool capacity");
    TEST_ASSERT(accumulatedOffset == 128, "Contiguous end offset must equal pool capacity");

    return true;
}

// 11. Reset restoring initial state
bool test_reset_restores_initial_state() {
    Allocator alloc(100);
    alloc.allocate(25);
    alloc.allocate(25);
    alloc.allocate(25);

    Stats sBefore = alloc.getStats();
    TEST_ASSERT(sBefore.totalAllocated == 75, "Allocated space should be 75 before reset");

    alloc.reset(); // Reset to default/current pool size

    Stats sAfter = alloc.getStats();
    TEST_ASSERT(sAfter.totalPoolSize == 100, "Pool size should remain 100");
    TEST_ASSERT(sAfter.totalAllocated == 0, "Allocated space should be 0");
    TEST_ASSERT(sAfter.totalFree == 100, "Free space should be 100");
    TEST_ASSERT(sAfter.freeBlockCount == 1, "Free block count should be 1");
    TEST_ASSERT(alloc.getNextAllocId() == 1, "Next alloc ID should be reset to 1");

    // Also test reset with new pool size
    alloc.reset(200);
    Stats sNew = alloc.getStats();
    TEST_ASSERT(sNew.totalPoolSize == 200, "Pool size should now be 200");
    TEST_ASSERT(sNew.totalFree == 200, "Free space should now be 200");

    return true;
}

// 12. Traversal trace verification
bool test_traversal_trace() {
    Allocator alloc(100);
    alloc.allocate(20); // ID 1 [0..20)
    alloc.allocate(20); // ID 2 [20..40)
    alloc.allocate(30); // ID 3 [40..70)
    // Remaining free block at [70..100) of size 30

    // Free ID 2 -> free block at [20..40) of size 20
    alloc.deallocate(2);

    // Now allocate 25:
    // Step 1: block at 0 (ID 1, size 20) -> SKIPPED_ALLOCATED
    // Step 2: block at 20 (free, size 20) -> SKIPPED_TOO_SMALL (20 < 25)
    // Step 3: block at 40 (ID 3, size 30) -> SKIPPED_ALLOCATED
    // Step 4: block at 70 (free, size 30) -> SPLIT_FIT (30 >= 25)
    AllocationResult res = alloc.allocate(25);
    TEST_ASSERT(res.success == true, "Allocation should succeed");
    TEST_ASSERT(res.trace.size() == 4, "Trace should contain exactly 4 steps");

    TEST_ASSERT(res.trace[0].decision == "SKIPPED_ALLOCATED", "Step 1 should be SKIPPED_ALLOCATED");
    TEST_ASSERT(res.trace[0].blockOffset == 0, "Step 1 offset should be 0");

    TEST_ASSERT(res.trace[1].decision == "SKIPPED_TOO_SMALL", "Step 2 should be SKIPPED_TOO_SMALL");
    TEST_ASSERT(res.trace[1].blockOffset == 20, "Step 2 offset should be 20");

    TEST_ASSERT(res.trace[2].decision == "SKIPPED_ALLOCATED", "Step 3 should be SKIPPED_ALLOCATED");
    TEST_ASSERT(res.trace[2].blockOffset == 40, "Step 3 offset should be 40");

    TEST_ASSERT(res.trace[3].decision == "SPLIT_FIT", "Step 4 should be SPLIT_FIT");
    TEST_ASSERT(res.trace[3].blockOffset == 70, "Step 4 offset should be 70");

    return true;
}

int main() {
    std::cout << "====================================================\n";
    std::cout << "        HeapLens Phase 1: Allocator Test Suite      \n";
    std::cout << "====================================================\n";

    RUN_TEST(test_initial_pool_state);
    RUN_TEST(test_exact_fit_allocation);
    RUN_TEST(test_split_allocation);
    RUN_TEST(test_allocation_failure_fragmentation);
    RUN_TEST(test_invalid_allocation_sizes);
    RUN_TEST(test_successful_deallocation);
    RUN_TEST(test_unknown_and_double_free);
    RUN_TEST(test_coalescing_two_and_three_blocks);
    RUN_TEST(test_repeated_alloc_dealloc);
    RUN_TEST(test_pool_boundaries_and_invariants);
    RUN_TEST(test_reset_restores_initial_state);
    RUN_TEST(test_traversal_trace);

    std::cout << "====================================================\n";
    std::cout << "Total Tests: " << g_testsRun << " | "
              << "Passed: " << g_testsPassed << " | "
              << "Failed: " << g_testsFailed << "\n";
    std::cout << "====================================================\n";

    if (g_testsFailed == 0) {
        std::cout << ">>> ALL ALLOCATOR TESTS PASSED SUCCESSFULLY! <<<\n";
        return 0;
    } else {
        std::cerr << ">>> SOME TESTS FAILED! <<<\n";
        return 1;
    }
}
