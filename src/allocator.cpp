#include "allocator.h"
#include <sstream>
#include <algorithm>

namespace heaplens {

Allocator::Allocator(size_t poolSize)
    : m_poolSize(poolSize > 0 ? poolSize : 100),
      m_head(nullptr),
      m_nextAllocId(1) {
    // Initial state: single free block covering the entire pool [0, m_poolSize)
    m_head = new Block(0, m_poolSize, true, 0, nullptr);
}

Allocator::~Allocator() {
    clearList();
}

void Allocator::clearList() {
    Block* curr = m_head;
    while (curr != nullptr) {
        Block* next = curr->next;
        delete curr;
        curr = next;
    }
    m_head = nullptr;
}

void Allocator::reset(size_t newPoolSize) {
    clearList();
    if (newPoolSize > 0) {
        m_poolSize = newPoolSize;
    }
    m_head = new Block(0, m_poolSize, true, 0, nullptr);
    m_nextAllocId = 1;
}

AllocationResult Allocator::allocate(size_t requestedSize) {
    std::vector<StepTrace> trace;

    // Validation 1: Zero size is invalid
    if (requestedSize == 0) {
        return AllocationResult{
            false,
            0,
            0,
            0,
            "Invalid allocation size: Size must be greater than zero.",
            trace
        };
    }

    // Validation 2: Requested size exceeds entire pool capacity
    if (requestedSize > m_poolSize) {
        std::ostringstream oss;
        oss << "Allocation failed: Requested size (" << requestedSize
            << ") exceeds total pool capacity (" << m_poolSize << ").";
        return AllocationResult{
            false,
            0,
            0,
            0,
            oss.str(),
            trace
        };
    }

    // Traverse the linked list using First Fit strategy
    Block* curr = m_head;
    size_t step = 1;

    while (curr != nullptr) {
        if (!curr->isFree) {
            // Block is allocated
            std::ostringstream reason;
            reason << "Block at offset " << curr->startOffset
                   << " (size " << curr->size
                   << ") is occupied by Allocation ID " << curr->allocId
                   << ". Skipping.";
            trace.push_back(StepTrace{
                step,
                curr->startOffset,
                curr->size,
                false,
                curr->allocId,
                "SKIPPED_ALLOCATED",
                reason.str()
            });
        } else if (curr->size < requestedSize) {
            // Block is free, but too small
            std::ostringstream reason;
            reason << "Block at offset " << curr->startOffset
                   << " is free, but its size (" << curr->size
                   << ") is smaller than requested (" << requestedSize
                   << "). Skipping.";
            trace.push_back(StepTrace{
                step,
                curr->startOffset,
                curr->size,
                true,
                0,
                "SKIPPED_TOO_SMALL",
                reason.str()
            });
        } else {
            // Free block is large enough! First Fit found.
            int assignedId = m_nextAllocId++;
            size_t allocatedOffset = curr->startOffset;

            if (curr->size == requestedSize) {
                // Exact fit: no split required
                curr->isFree = false;
                curr->allocId = assignedId;

                std::ostringstream reason;
                reason << "Block at offset " << curr->startOffset
                       << " (size " << curr->size
                       << ") is an exact match for requested size " << requestedSize
                       << ". Marked as allocated (ID " << assignedId << ").";
                trace.push_back(StepTrace{
                    step,
                    curr->startOffset,
                    curr->size,
                    false,
                    assignedId,
                    "EXACT_FIT",
                    reason.str()
                });
            } else {
                // Split fit: current block is larger than requested.
                // Carve out requestedSize for the new allocation, and create
                // a new free remainder block for the leftovers.
                size_t remainderSize = curr->size - requestedSize;
                size_t remainderOffset = curr->startOffset + requestedSize;

                Block* remainderBlock = new Block(
                    remainderOffset,
                    remainderSize,
                    true,
                    0,
                    curr->next
                );

                curr->size = requestedSize;
                curr->isFree = false;
                curr->allocId = assignedId;
                curr->next = remainderBlock;

                std::ostringstream reason;
                reason << "Block at offset " << allocatedOffset
                       << " (original size " << (requestedSize + remainderSize)
                       << ") satisfies requested size " << requestedSize
                       << ". Split into allocated block (size " << requestedSize
                       << ", ID " << assignedId << ") and remainder free block at offset "
                       << remainderOffset << " (size " << remainderSize << ").";
                trace.push_back(StepTrace{
                    step,
                    allocatedOffset,
                    requestedSize,
                    false,
                    assignedId,
                    "SPLIT_FIT",
                    reason.str()
                });
            }

            return AllocationResult{
                true,
                assignedId,
                allocatedOffset,
                requestedSize,
                "",
                trace
            };
        }

        curr = curr->next;
        step++;
    }

    // If loop finished, no contiguous free block was large enough
    Stats stats = getStats();
    std::ostringstream oss;
    if (stats.totalFree >= requestedSize) {
        oss << "Out of memory (External Fragmentation): Total free space is "
            << stats.totalFree << " units, but largest contiguous free block is only "
            << stats.largestFreeBlock << " units. Requested: " << requestedSize << " units.";
    } else {
        oss << "Out of memory: Insufficient free memory. Total free space available is "
            << stats.totalFree << " units, requested " << requestedSize << " units.";
    }

    return AllocationResult{
        false,
        0,
        0,
        0,
        oss.str(),
        trace
    };
}

DeallocationResult Allocator::deallocate(int allocId) {
    if (allocId <= 0) {
        return DeallocationResult{
            false,
            allocId,
            0,
            0,
            "Invalid allocation ID. Allocation IDs must be positive integers.",
            {}
        };
    }

    // Find the block with this allocation ID
    Block* target = nullptr;
    for (Block* curr = m_head; curr != nullptr; curr = curr->next) {
        if (curr->allocId == allocId) {
            target = curr;
            break;
        }
    }

    if (target == nullptr) {
        std::ostringstream oss;
        oss << "Unknown allocation ID: " << allocId
            << ". No allocated block exists with this ID (it may have never been allocated or already freed).";
        return DeallocationResult{
            false,
            allocId,
            0,
            0,
            oss.str(),
            {}
        };
    }

    if (target->isFree) {
        std::ostringstream oss;
        oss << "Double-free error: Block with ID " << allocId
            << " is already marked as free.";
        return DeallocationResult{
            false,
            allocId,
            target->startOffset,
            target->size,
            oss.str(),
            {}
        };
    }

    // Mark block as free and clear its allocation ID
    size_t freedOffset = target->startOffset;
    size_t freedSize = target->size;
    target->isFree = true;
    target->allocId = 0;

    // Coalesce adjacent free blocks
    std::vector<CoalesceEvent> events;
    coalesceAdjacentFreeBlocks(events);

    return DeallocationResult{
        true,
        allocId,
        freedOffset,
        freedSize,
        "",
        events
    };
}

void Allocator::coalesceAdjacentFreeBlocks(std::vector<CoalesceEvent>& events) {
    Block* curr = m_head;

    while (curr != nullptr && curr->next != nullptr) {
        if (curr->isFree && curr->next->isFree) {
            Block* nextBlock = curr->next;

            CoalesceEvent evt;
            evt.leftOffset = curr->startOffset;
            evt.leftSize = curr->size;
            evt.rightOffset = nextBlock->startOffset;
            evt.rightSize = nextBlock->size;

            // Merge nextBlock into curr
            curr->size += nextBlock->size;
            evt.newSize = curr->size;

            std::ostringstream oss;
            oss << "Coalesced free block at offset " << evt.leftOffset
                << " (size " << evt.leftSize
                << ") with adjacent free block at offset " << evt.rightOffset
                << " (size " << evt.rightSize
                << ") -> combined block at offset " << evt.leftOffset
                << " (size " << evt.newSize << ").";
            evt.message = oss.str();
            events.push_back(evt);

            // Bypass nextBlock and free its metadata node
            curr->next = nextBlock->next;
            delete nextBlock;

            // DO NOT advance curr here!
            // curr may now be adjacent to another free block (e.g. 3 consecutive free blocks)
        } else {
            curr = curr->next;
        }
    }
}

Stats Allocator::getStats() const {
    Stats stats;
    stats.totalPoolSize = m_poolSize;
    stats.totalAllocated = 0;
    stats.totalFree = 0;
    stats.largestFreeBlock = 0;
    stats.freeBlockCount = 0;
    stats.allocatedBlockCount = 0;
    stats.externalFragmentationPercent = 0.0;

    for (const Block* curr = m_head; curr != nullptr; curr = curr->next) {
        if (curr->isFree) {
            stats.totalFree += curr->size;
            stats.freeBlockCount++;
            if (curr->size > stats.largestFreeBlock) {
                stats.largestFreeBlock = curr->size;
            }
        } else {
            stats.totalAllocated += curr->size;
            stats.allocatedBlockCount++;
        }
    }

    if (stats.totalFree > 0) {
        stats.externalFragmentationPercent =
            (1.0 - (static_cast<double>(stats.largestFreeBlock) / static_cast<double>(stats.totalFree))) * 100.0;
    } else {
        stats.externalFragmentationPercent = 0.0;
    }

    return stats;
}

std::vector<Block> Allocator::getBlocks() const {
    std::vector<Block> snapshot;
    for (const Block* curr = m_head; curr != nullptr; curr = curr->next) {
        snapshot.push_back(*curr);
    }
    return snapshot;
}

} // namespace heaplens
