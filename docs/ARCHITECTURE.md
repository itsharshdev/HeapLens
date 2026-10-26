# HeapLens Architecture & Viva Defense Guide

## 1. Project Overview & Core Philosophy

**HeapLens** simulates dynamic memory allocation using a singly linked list over a simulated, contiguous memory pool of fixed size (default: 100 units/bytes).

### Vital Technical Distinction: Custom Simulated Allocator vs. Runtime `new`/`delete`
In standard C++, `new` and `delete` interact with the OS or C++ runtime library (such as `ptmalloc` in glibc or the Windows Heap Manager). These allocators operate directly on virtual memory pages mapped by system calls (e.g., `VirtualAlloc`, `mmap`, `brk`).
**HeapLens does NOT alter or hook the physical RAM or standard runtime allocator.** Instead, HeapLens models the algorithmic inner workings of a heap manager inside a custom, simulated memory arena. This allows students to observe block metadata, pointer updates, First Fit traversal, block splitting, and adjacent-block coalescing in a deterministic and safe learning environment.

---

## 2. Core C++ Structures & Classes

### 2.1 `struct Block` (`src/block.h`)
Represents a node in the linked list of memory blocks. The list maintains a contiguous layout from offset `0` to `poolSize`.
- `size_t startOffset`: The starting boundary offset in simulated memory (0 to `poolSize - 1`).
- `size_t size`: Length of the block in memory units.
- `bool isFree`: `true` if available for allocation; `false` if occupied.
- `int allocId`: Positive integer identifier assigned to active allocations; `0` when the block is free.
- `Block* next`: Pointer to the next contiguous block node (or `nullptr` if at the end of the pool).

### 2.2 `class Allocator` (`src/allocator.h`, `src/allocator.cpp`)
Encapsulates pool state, linked-list operations, and statistics calculations.
- `m_poolSize`: Total pool capacity.
- `m_head`: Pointer to the first `Block` in the linked list.
- `m_nextAllocId`: Monotonically increasing counter (starts at 1) ensuring unique, collision-free allocation identifiers.

### 2.3 Supporting Data Structures
- `StepTrace`: Captures step-by-step traversal decisions (`SKIPPED_ALLOCATED`, `SKIPPED_TOO_SMALL`, `EXACT_FIT`, `SPLIT_FIT`) and student-friendly rationales.
- `CoalesceEvent`: Details merges between adjacent free blocks (`leftOffset`, `rightOffset`, `newSize`).
- `Stats`: Exposes live pool capacity, allocated space, free space, largest free block, block counts, and external fragmentation percentage.

---

## 3. Algorithm Details & Invariants

### 3.1 Linked-List Invariants
At all times, the linked list satisfies:
1. **Contiguity:** For any block $B_i$ and its successor $B_{i+1}$, $B_{i+1}.\text{startOffset} = B_i.\text{startOffset} + B_i.\text{size}$.
2. **Total Coverage:** $\sum_{i} B_i.\text{size} = \text{poolSize}$, and the first block starts at offset `0`.
3. **No Adjacent Free Blocks After Coalescing:** After any deallocation finishes, no two adjacent blocks are both free ($B_i.\text{isFree} \land B_{i+1}.\text{isFree} \implies \text{false}$).

### 3.2 First Fit Allocation (`allocate(size_t requestedSize)`)
1. **Validation:** Checks that `requestedSize > 0` and `requestedSize <= poolSize`.
2. **Traversal:** Iterates from `m_head` onward:
   - If block is not free $\to$ logs `SKIPPED_ALLOCATED` and continues.
   - If free but `block->size < requestedSize` $\to$ logs `SKIPPED_TOO_SMALL` and continues.
   - If free and `block->size == requestedSize` $\to$ **Exact Fit:** marks block allocated, sets `allocId = m_nextAllocId++`, logs `EXACT_FIT`, and returns.
   - If free and `block->size > requestedSize` $\to$ **Split:**
     - Allocates a new remainder block: `new Block(offset + requestedSize, size - requestedSize, true, 0, block->next)`.
     - Shrinks current block to `requestedSize`, marks it allocated, links `block->next = remainderBlock`, logs `SPLIT_FIT`, and returns.
3. **Failure Handling:** If the loop terminates without finding a fit:
   - Compares `requestedSize` against total free memory.
   - If total free space $\ge$ requested size, the error explicitly reports **External Fragmentation**.
   - Otherwise, reports general out-of-memory.
- **Time Complexity:** $O(N)$ where $N$ is the number of blocks in the list.
- **Space Complexity:** $O(1)$ additional auxiliary memory per operation (plus $O(N)$ for the returned traversal trace).

### 3.3 Deallocation & Coalescing (`deallocate(int allocId)`)
1. **Validation:** Validates that `allocId > 0`. Searches list for `allocId`.
   - If not found: returns `Unknown allocation ID` error.
   - If already free: returns `Double-free` error.
2. **Freeing:** Sets `target->isFree = true` and `target->allocId = 0`.
3. **Adjacent Block Coalescing:**
   Traverses the list with pointer `curr`:
   ```cpp
   while (curr && curr->next) {
       if (curr->isFree && curr->next->isFree) {
           Block* nextBlock = curr->next;
           curr->size += nextBlock->size;
           curr->next = nextBlock->next;
           delete nextBlock; // Free metadata node
           // Crucial: do not advance curr! It may merge with the new curr->next.
       } else {
           curr = curr->next;
       }
   }
   ```
   This handles merging with a preceding free block, a succeeding free block, or both simultaneously (merging 3 blocks into 1).
- **Time Complexity:** $O(N)$ to locate block and perform a single-pass merge.
- **Space Complexity:** $O(1)$ auxiliary.

### 3.4 External Fragmentation Formula
External fragmentation occurs when total free memory is sufficient to satisfy an allocation request, but no single contiguous block is large enough.

$$\text{External Fragmentation \%} = \begin{cases} 
\left(1.0 - \frac{\text{LargestFreeBlock}}{\text{TotalFreeSpace}}\right) \times 100\%, & \text{if TotalFreeSpace} > 0 \\ 
0.0\%, & \text{if TotalFreeSpace} = 0 
\end{cases}$$

- If all free space is in a single contiguous block, $\text{LargestFreeBlock} = \text{TotalFreeSpace}$, resulting in **0.0% fragmentation**.
- If 60 units are free but divided into three blocks of 20 units: $\left(1 - \frac{20}{60}\right) \times 100\% = 66.67\%$.

---

## 4. Integration Architecture

```
+------------------------------------+
|  Future Frontend (React/Vite)      |
|  (Phase 2 / Phase 3)               |
+-----------------+------------------+
                  | HTTP REST (JSON)
                  v
+------------------------------------+
|  Node.js API Bridge                |
|  (bridge/server.js, zero-dep)     |
+-----------------+------------------+
                  | Bidirectional stdio
                  | JSON-lines protocol
                  v
+------------------------------------+
|  HeapLens C++ Allocator Engine     |
|  (build/heaplens_engine.exe)       |
+------------------------------------+
```

### JSON Request / Response Protocol
Every command is sent as a JSON line to the C++ engine's `stdin`. The engine responds with a single JSON line on `stdout`:
- `{"action": "allocate", "size": 30}` $\to$ returns allocation status, assigned ID, offset, traversal trace, full block list, and stats.
- `{"action": "free", "allocId": 1}` $\to$ returns freed details, coalesce events, updated block list, and stats.
- `{"action": "getState"}` $\to$ returns current pool state, blocks, and stats.
- `{"action": "reset", "poolSize": 100}` $\to$ resets pool to initial empty state.
- `{"action": "ping"}` $\to$ health check.

---

## 5. Viva Preparation: Questions & Answers

### Q1: Why use a linked list for block metadata instead of an array?
**A:** Dynamic memory allocation involves frequent block splitting and merging (coalescing). In an array, inserting a new block during a split or deleting a block during coalescing requires shifting subsequent elements in $O(N)$ time. With a singly linked list, insertion and deletion of adjacent nodes takes $O(1)$ time once the position is found.

### Q2: What is the difference between First Fit, Best Fit, and Worst Fit?
**A:**
- **First Fit:** Allocates the first free block that is large enough. Fast because traversal stops at the first match.
- **Best Fit:** Traverses the entire list to find the free block whose size is closest to the request, minimizing wasted leftover space in that block, but creating small, unusable fragments.
- **Worst Fit:** Traverses the entire list to find the largest free block, leaving the largest possible leftover block.

### Q3: How does HeapLens prevent memory leaks in its own metadata?
**A:** The `Allocator` destructor calls `clearList()`, which iterates through the entire linked list and deallocates every `Block` node using `delete`. When blocks are coalesced, the merged node is immediately deleted. The copy constructor and assignment operator are deleted (`= delete`) to prevent accidental shallow copies and double-free errors.

### Q4: How is a double-free detected?
**A:** Every block maintains an `isFree` boolean and an `allocId`. When a user attempts to free an `allocId`, the allocator searches the list. If the block with that ID is already marked `isFree == true` or has had its ID cleared, the operation is rejected with a descriptive double-free error.
