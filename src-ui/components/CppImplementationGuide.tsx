import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileCode2, Info } from 'lucide-react';

interface CodeSection {
  id: string;
  title: string;
  functionName: string;
  fileName: string;
  summary: string;
  explanation: string[];
  code: string;
}

const CPP_SECTIONS: CodeSection[] = [
  {
    id: 'block-struct',
    title: '1. Singly Linked-List Block Structure',
    functionName: 'struct Block',
    fileName: 'src/block.h',
    summary: 'Defines the fundamental metadata node representing a contiguous memory segment.',
    explanation: [
      'Each block tracks its startOffset (byte position in the pool) and size (capacity in units).',
      'The boolean isFree distinguishes between available memory and active allocations.',
      'allocId uniquely identifies which allocation owns this block (0 for free blocks).',
      'The next pointer links to the adjacent contiguous block in memory, forming a singly linked list in O(1) space per block.',
      'Unlike an array, node insertion (splitting) and node removal (merging) only require updating pointers, without shifting subsequent memory elements.'
    ],
    code: `// File: src/block.h
namespace heaplens {

struct Block {
    size_t startOffset;     ///< Offset in units from the start of the pool
    size_t size;            ///< Size of this block in units
    bool isFree;            ///< True if free; false if allocated
    int allocId;            ///< Unique allocation ID (>0). 0 when free.
    Block* next;            ///< Pointer to next contiguous block (nullptr if last)

    Block(size_t offset, size_t sz, bool free = true, int id = 0, Block* n = nullptr)
        : startOffset(offset), size(sz), isFree(free), allocId(id), next(n) {}
};

} // namespace heaplens`
  },
  {
    id: 'allocate-split',
    title: '2. First Fit Traversal & Block Splitting',
    functionName: 'Allocator::allocate(size_t requestedSize)',
    fileName: 'src/allocator.cpp',
    summary: 'Traverses the linked list from head and performs dynamic node splitting on the first suitable free block.',
    explanation: [
      'Validation: Rejects zero-sized requests or requests exceeding total pool capacity.',
      'First Fit Search: Starts at m_head and inspects each block in linear O(N) order. Occupied blocks or blocks with size < requestedSize are skipped.',
      'Exact Fit: If block size matches requestedSize exactly, no remainder node is created; isFree is toggled to false.',
      'Dynamic Splitting: When a free block is larger than requested, it is partitioned. A new Block remainder node is allocated with new Block(remainderOffset, remainderSize, true, 0, curr->next).',
      'Pointer Splicing: curr->next is updated to point to the remainder node in O(1) time, preventing internal fragmentation.'
    ],
    code: `// File: src/allocator.cpp (inside Allocator::allocate)
Block* curr = m_head;
size_t step = 1;

while (curr != nullptr) {
    if (!curr->isFree) {
        // Block is occupied by an active allocation; skip
    } else if (curr->size < requestedSize) {
        // Free block is too small; skip
    } else {
        // Free block is large enough! First Fit candidate found.
        int assignedId = m_nextAllocId++;
        size_t allocatedOffset = curr->startOffset;

        if (curr->size == requestedSize) {
            // Exact fit: no split required
            curr->isFree = false;
            curr->allocId = assignedId;
        } else {
            // Split fit: carve out requestedSize and create remainder free node
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
            curr->next = remainderBlock; // Spliced into linked list
        }
        return AllocationResult{ true, assignedId, allocatedOffset, requestedSize, "", trace };
    }
    curr = curr->next;
    step++;
}`
  },
  {
    id: 'deallocate-free',
    title: '3. Safe Deallocation & Double-Free Guard',
    functionName: 'Allocator::deallocate(int allocId)',
    fileName: 'src/allocator.cpp',
    summary: 'Locates a block by unique ID, validates allocation state, and triggers adjacent coalescing.',
    explanation: [
      'Searches the linked list in O(N) time for a node whose allocId matches the requested ID.',
      'Safety Check 1: If no matching node is found, returns an informative "Unknown allocation ID" error.',
      'Safety Check 2: If the node is found but target->isFree == true, it rejects the operation with a "Double-free error", mirroring real allocator corruption guards.',
      'State Reset: Toggles target->isFree = true and resets allocId = 0.',
      'Coalesce Trigger: Automatically invokes coalesceAdjacentFreeBlocks() to immediately reclaim contiguous space.'
    ],
    code: `// File: src/allocator.cpp (inside Allocator::deallocate)
// 1. Find the block with this allocation ID
Block* target = nullptr;
for (Block* curr = m_head; curr != nullptr; curr = curr->next) {
    if (curr->allocId == allocId) {
        target = curr;
        break;
    }
}

if (target == nullptr) {
    return DeallocationResult{ false, allocId, 0, 0, "Unknown allocation ID: " + std::to_string(allocId), {} };
}

// 2. Validate double-free protection
if (target->isFree) {
    return DeallocationResult{ false, allocId, target->startOffset, target->size, "Double-free error", {} };
}

// 3. Mark block as free and clear allocation ID
size_t freedOffset = target->startOffset;
size_t freedSize = target->size;
target->isFree = true;
target->allocId = 0;

// 4. Coalesce adjacent free blocks
std::vector<CoalesceEvent> events;
coalesceAdjacentFreeBlocks(events);

return DeallocationResult{ true, allocId, freedOffset, freedSize, "", events };`
  },
  {
    id: 'coalesce-blocks',
    title: '4. Adjacent Free-Block Coalescing',
    functionName: 'Allocator::coalesceAdjacentFreeBlocks(...)',
    fileName: 'src/allocator.cpp',
    summary: 'Single-pass sweep that merges adjacent free blocks and deletes redundant metadata nodes in O(1) per merge.',
    explanation: [
      'Iterates while (curr != nullptr && curr->next != nullptr) to inspect adjacent pairs of blocks.',
      'When both curr->isFree and curr->next->isFree are true, an adjacent free boundary exists.',
      'The right block nextBlock is merged into curr: curr->size += nextBlock->size.',
      'The pointer is redirected: curr->next = nextBlock->next, bypassing nextBlock.',
      'Memory Hygiene: delete nextBlock cleanly deallocates the absorbed metadata struct from C++ heap memory.',
      'Multi-Block Merge: Crucially, curr is NOT advanced on a merge. If curr->next is also free (e.g. 3 consecutive free blocks), the loop absorbs it on the very next iteration.'
    ],
    code: `// File: src/allocator.cpp (Allocator::coalesceAdjacentFreeBlocks)
void Allocator::coalesceAdjacentFreeBlocks(std::vector<CoalesceEvent>& events) {
    Block* curr = m_head;

    while (curr != nullptr && curr->next != nullptr) {
        if (curr->isFree && curr->next->isFree) {
            Block* nextBlock = curr->next;

            // Merge nextBlock into curr
            curr->size += nextBlock->size;

            // Bypass nextBlock and free its metadata node
            curr->next = nextBlock->next;
            delete nextBlock;

            // DO NOT advance curr here!
            // curr may now be adjacent to another free block (e.g. 3 consecutive free blocks)
        } else {
            curr = curr->next;
        }
    }
}`
  }
];

export const CppImplementationGuide: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('block-struct');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSection = CPP_SECTIONS.find(s => s.id === activeSectionId) || CPP_SECTIONS[0];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="instrument-card" style={{ padding: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ padding: '0.45rem', borderRadius: '0.375rem', background: 'var(--mem-allocated-bg)', color: 'var(--mem-allocated)', display: 'inline-flex' }}>
            <FileCode2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              C++ Allocator Engine Implementation
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
              Authentic C++17 source code powering the linked-list dynamic memory allocator simulation.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-allocated" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
            C++17 Engine
          </span>
          <span className="badge badge-free" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
            Singly Linked List
          </span>
        </div>
      </div>

      {/* Faculty Demonstration Disclaimer Pill */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.625rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.375rem',
          background: 'var(--color-canvas)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <Info size={16} style={{ color: 'var(--mem-free)', flexShrink: 0, marginTop: '0.15rem' }} />
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>Faculty & Academic Context:</strong> HeapLens simulates the fundamental algorithmic mechanics of dynamic memory allocation using a contiguous simulated arena and linked-list metadata. It models First Fit search, node carving (splitting), and boundary dissolution (coalescing). The web frontend renders the live telemetry and pointer topology returned by the compiled C++ engine; it does not allocate raw operating-system virtual memory pages (<code style={{ fontSize: '0.75rem' }}>mmap</code> / <code style={{ fontSize: '0.75rem' }}>VirtualAlloc</code>).
        </span>
      </div>

      {/* Tabs */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        {CPP_SECTIONS.map((section) => {
          const isActive = section.id === activeSectionId;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className="btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem 0.875rem',
                borderRadius: '0.375rem',
                background: isActive ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                border: `1px solid ${isActive ? 'var(--mem-allocated-border)' : 'var(--color-border)'}`,
                boxShadow: isActive ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: isActive ? 'var(--mem-allocated)' : 'var(--text-muted)', fontWeight: 600 }}>
                {section.fileName}
              </span>
              <strong style={{ fontSize: '0.8125rem', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {section.title}
              </strong>
            </button>
          );
        })}
      </div>

      {/* Code Display Container */}
      <div 
        style={{
          background: 'var(--color-canvas)',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        {/* Source metadata bar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.625rem 1rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={14} style={{ color: 'var(--mem-allocated)' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeSection.fileName}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--mem-free)' }}>
              {activeSection.functionName}
            </span>
          </div>

          <button
            onClick={() => handleCopy(activeSection.code, activeSection.id)}
            className="btn btn-secondary"
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {copiedId === activeSection.id ? (
              <>
                <Check size={12} style={{ color: 'var(--mem-allocated)' }} />
                <span style={{ color: 'var(--mem-allocated)' }}>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Syntax-highlighted code block */}
        <pre
          style={{
            margin: 0,
            padding: '1.125rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8125rem',
            lineHeight: 1.55,
            color: 'var(--text-primary)',
            background: 'var(--color-canvas)',
            overflowX: 'auto',
          }}
        >
          <code>{activeSection.code}</code>
        </pre>

        {/* Faculty Explanation Breakdown */}
        <div 
          style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Code2 size={15} style={{ color: 'var(--mem-allocated)' }} />
            Faculty Walkthrough & Invariant Verification:
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.625rem', fontWeight: 500 }}>
            {activeSection.summary}
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {activeSection.explanation.map((point, idx) => (
              <li key={idx} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
