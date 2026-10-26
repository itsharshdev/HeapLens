#ifndef HEAPLENS_ALLOCATOR_H
#define HEAPLENS_ALLOCATOR_H

#include "block.h"
#include <cstddef>
#include <string>
#include <vector>

namespace heaplens {

/**
 * @brief Records a single step during the First Fit linked list traversal.
 *
 * This allows the educational frontend to display a step-by-step walkthrough
 * of how First Fit evaluates blocks, why blocks were skipped, and where splits occur.
 */
struct StepTrace {
    size_t stepIndex;       ///< 1-based step counter
    size_t blockOffset;     ///< Offset of the block being examined
    size_t blockSize;       ///< Size of the block being examined
    bool isFree;            ///< Free state of the block
    int allocId;            ///< Allocation ID (if occupied)
    std::string decision;   ///< "SKIPPED_ALLOCATED", "SKIPPED_TOO_SMALL", "EXACT_FIT", "SPLIT_FIT"
    std::string reason;     ///< Human-readable explanation of the decision
};

/**
 * @brief Records a coalescing event during deallocation.
 */
struct CoalesceEvent {
    size_t leftOffset;      ///< Offset of the left free block
    size_t leftSize;        ///< Size of the left block before merge
    size_t rightOffset;     ///< Offset of the right free block
    size_t rightSize;       ///< Size of the right block before merge
    size_t newSize;         ///< Combined size after merging
    std::string message;    ///< Human-readable explanation
};

/**
 * @brief Live memory pool statistics.
 */
struct Stats {
    size_t totalPoolSize;               ///< Total pool capacity in units/bytes
    size_t totalAllocated;              ///< Total bytes currently allocated
    size_t totalFree;                   ///< Total bytes currently free
    size_t largestFreeBlock;            ///< Size of the largest contiguous free block
    size_t freeBlockCount;              ///< Number of distinct free blocks
    size_t allocatedBlockCount;         ///< Number of distinct allocated blocks
    double externalFragmentationPercent;///< (1.0 - largestFree / totalFree) * 100.0, or 0.0 if totalFree == 0
};

/**
 * @brief Result of an allocate operation.
 */
struct AllocationResult {
    bool success;                       ///< True if allocation succeeded
    int allocId;                        ///< Unique assigned ID (>0 if success, 0 if failed)
    size_t allocatedOffset;             ///< Offset where the block begins
    size_t allocatedSize;               ///< Size of the allocated block
    std::string errorMessage;           ///< Descriptive error if success == false
    std::vector<StepTrace> trace;       ///< Step-by-step traversal events
};

/**
 * @brief Result of a deallocate operation.
 */
struct DeallocationResult {
    bool success;                       ///< True if deallocation succeeded
    int freedId;                        ///< ID of the freed block
    size_t freedOffset;                 ///< Offset of the freed block
    size_t freedSize;                   ///< Size of the freed block before coalescing
    std::string errorMessage;           ///< Descriptive error if success == false
    std::vector<CoalesceEvent> coalesceEvents; ///< Adjacent block merges performed
};

/**
 * @brief Simplified dynamic memory allocator simulating heap operations using a linked list.
 *
 * Concepts for Viva defense:
 * 1. Simulates dynamic memory allocation over a fixed contiguous simulated pool.
 * 2. Uses a singly linked list where every block (free or allocated) is represented.
 * 3. Allocation Strategy: First Fit (first free block >= requested size).
 * 4. Splitting: When a free block is larger than requested, it is split into an
 *    allocated block and a remainder free block inserted directly after it.
 * 5. Deallocation: Finds the block by unique allocation ID, marks it free, and
 *    coalesces adjacent free blocks to mitigate external fragmentation.
 * 6. External Fragmentation: Defined mathematically as (1 - largestFreeBlock / totalFree) * 100%.
 */
class Allocator {
public:
    /**
     * @brief Initialize allocator with a fixed pool size.
     * @param poolSize Total simulated pool capacity in units (default 100).
     */
    explicit Allocator(size_t poolSize = 100);

    /**
     * @brief Destructor. Cleans up all heap-allocated Block metadata nodes.
     */
    ~Allocator();

    // Prevent copying to avoid double-freeing linked list nodes
    Allocator(const Allocator&) = delete;
    Allocator& operator=(const Allocator&) = delete;

    /**
     * @brief Allocate memory of requestedSize using First Fit.
     * @param requestedSize Number of units to allocate.
     * @return AllocationResult containing success status, ID, offset, and step trace.
     */
    AllocationResult allocate(size_t requestedSize);

    /**
     * @brief Deallocate an allocation by its unique ID.
     * @param allocId Unique ID assigned at allocation time.
     * @return DeallocationResult containing success status, freed details, and coalesce events.
     */
    DeallocationResult deallocate(int allocId);

    /**
     * @brief Reset the allocator to its initial state (one contiguous free block).
     * @param newPoolSize If 0, retains the current pool size; otherwise sets new pool size.
     */
    void reset(size_t newPoolSize = 0);

    /**
     * @brief Compute and return current pool statistics.
     */
    Stats getStats() const;

    /**
     * @brief Return a snapshot copy of all blocks in linked-list order.
     */
    std::vector<Block> getBlocks() const;

    /**
     * @brief Get the total pool capacity.
     */
    size_t getPoolSize() const { return m_poolSize; }

    /**
     * @brief Get the next allocation ID to be assigned.
     */
    int getNextAllocId() const { return m_nextAllocId; }

private:
    size_t m_poolSize;      ///< Total capacity of the pool
    Block* m_head;          ///< Head pointer to the first block metadata node
    int m_nextAllocId;      ///< Monotonically increasing allocation counter (starts at 1)

    /**
     * @brief Free all metadata nodes in the linked list.
     */
    void clearList();

    /**
     * @brief Coalesce adjacent free blocks in the linked list.
     * @param events Output vector to record coalesce events for transparency.
     */
    void coalesceAdjacentFreeBlocks(std::vector<CoalesceEvent>& events);
};

} // namespace heaplens

#endif // HEAPLENS_ALLOCATOR_H
