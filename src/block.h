#ifndef HEAPLENS_BLOCK_H
#define HEAPLENS_BLOCK_H

#include <cstddef>

namespace heaplens {

/**
 * @brief Represents a contiguous segment of the simulated memory pool.
 *
 * In HeapLens, the entire memory pool is modeled as a singly linked list
 * of Block metadata nodes. Each block represents either an allocated region
 * or an available (free) chunk of simulated memory.
 */
struct Block {
    size_t startOffset;     ///< Offset in units/bytes from the start of the pool (0 to poolSize - 1)
    size_t size;            ///< Size of this block in units/bytes
    bool isFree;            ///< True if this block is free; false if currently allocated
    int allocId;            ///< Unique ID assigned to this allocation (>0). 0 when block is free.
    Block* next;            ///< Pointer to the next contiguous block in the pool (nullptr if last block)

    /**
     * @brief Construct a new Block node.
     * @param offset Starting offset in the pool.
     * @param sz Size of the block.
     * @param free Whether the block is free (default: true).
     * @param id Unique allocation ID (default: 0).
     * @param n Next block pointer (default: nullptr).
     */
    Block(size_t offset, size_t sz, bool free = true, int id = 0, Block* n = nullptr)
        : startOffset(offset), size(sz), isFree(free), allocId(id), next(n) {}
};

} // namespace heaplens

#endif // HEAPLENS_BLOCK_H
