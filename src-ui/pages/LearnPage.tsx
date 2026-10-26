import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Code2, 
  CheckCircle2, 
  Split, 
  Merge, 
  AlertTriangle 
} from 'lucide-react';

interface ConceptQuestion {
  question: string;
  answer: string;
  keyFormula?: string;
  tags: string[];
}

const TECHNICAL_QUESTIONS: ConceptQuestion[] = [
  {
    question: "Why use a linked list for allocator block metadata instead of an array?",
    answer: "Dynamic memory allocation requires frequent block splitting (inserting a new remainder block) and block coalescing (merging and removing adjacent blocks). In a contiguous array, inserting or deleting an element requires shifting all subsequent elements, taking O(N) time. In a linked list, inserting or removing adjacent nodes takes O(1) pointer updates once the target position is reached.",
    tags: ["Data Structures", "Linked List", "Efficiency"],
  },
  {
    question: "What is the exact distinction between HeapLens and standard C++ new/delete?",
    answer: "Standard C++ new and delete invoke the OS runtime memory manager (such as glibc ptmalloc or Windows HeapAlloc) which interacts with the kernel virtual memory system via mmap/VirtualAlloc. HeapLens does NOT replace or hook system memory; instead, it models the algorithmic inner workings of an allocator inside a custom, simulated memory arena for transparent education.",
    tags: ["System Architecture", "C++ Runtime", "OS"],
  },
  {
    question: "How does First Fit allocation work, and what is its time complexity?",
    answer: "First Fit traverses the singly linked list starting from the head pointer and allocates the very first free block that satisfies blockSize >= requestedSize. Its time complexity is O(N) in the worst case (where N is the number of blocks in the pool). It is widely used in real-world memory managers because it avoids traversing the entire list when an early match is found.",
    tags: ["Algorithms", "Complexity", "First Fit"],
  },
  {
    question: "How does HeapLens prevent double-free errors and detect unknown IDs?",
    answer: "Every block metadata struct stores an allocId and an isFree boolean. When deallocation is requested, the allocator searches the linked list for the specified ID. If no block has that ID, it returns an 'Unknown ID' error. If a matching block is found but is already marked isFree == true, it rejects the operation with a descriptive 'Double-free' error.",
    tags: ["Safety", "Validation", "Memory Corruption"],
  },
  {
    question: "How does adjacent block coalescing handle three consecutive free blocks?",
    answer: "HeapLens uses a single-pass while loop: while (curr && curr->next). If both curr and curr->next are free, it merges next into curr, deletes next's node, and updates curr->next. Crucially, the pointer curr is NOT advanced on a merge! This ensures that if the new curr->next is ALSO free (e.g., when a middle block is freed between two already-free blocks), all three blocks are seamlessly coalesced into one contiguous block.",
    tags: ["Coalescing", "Pointers", "Algorithm"],
  },
  {
    question: "What is external fragmentation and how is it calculated?",
    answer: "External fragmentation occurs when the total free memory in the pool is sufficient to fulfill an allocation request, but no single contiguous free block is large enough because free space is fragmented across multiple non-adjacent chunks.",
    keyFormula: "External Fragmentation % = (1.0 - LargestFreeBlock / TotalFreeSpace) * 100%",
    tags: ["Fragmentation", "Mathematics", "Metrics"],
  },
];

export const LearnPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.8rem', borderRadius: '9999px', background: 'var(--mem-allocated-bg)', border: '1px solid var(--mem-allocated-border)', marginBottom: '0.75rem' }}>
          <BookOpen size={13} style={{ color: 'var(--mem-allocated)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mem-allocated)', fontFamily: 'JetBrains Mono' }}>
            Memory Management Guide
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          How Memory Management Works
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '720px', fontSize: '0.9375rem', lineHeight: 1.6 }}>
          Comprehensive conceptual explanations, data structure invariants, pointer update mechanics, and interactive technical questions and answers.
        </p>
      </div>

      {/* Algorithmic Complexity Table */}
      <div className="instrument-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Algorithmic Complexity Summary
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.625rem 0.5rem' }}>OPERATION</th>
                <th style={{ padding: '0.625rem 0.5rem' }}>TIME COMPLEXITY</th>
                <th style={{ padding: '0.625rem 0.5rem' }}>SPACE COMPLEXITY</th>
                <th style={{ padding: '0.625rem 0.5rem' }}>MECHANISM</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '0.625rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  First Fit Allocate
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--mem-allocated)' }}>
                  O(N)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                  O(1)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', color: 'var(--text-secondary)' }}>
                  Linear traversal from head; stops on first fit; splits remainder node in O(1).
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '0.625rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Deallocate (by ID)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--mem-allocated)' }}>
                  O(N)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                  O(1)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', color: 'var(--text-secondary)' }}>
                  Searches list for unique allocId, marks free, and triggers adjacent coalescing.
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '0.625rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Adjacent Coalescing
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--mem-allocated)' }}>
                  O(N)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                  O(1)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', color: 'var(--text-secondary)' }}>
                  Single-pass sweep; merges adjacent free nodes and deletes redundant metadata.
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.625rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Reset Pool
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--mem-allocated)' }}>
                  O(N)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                  O(1)
                </td>
                <td style={{ padding: '0.625rem 0.5rem', color: 'var(--text-secondary)' }}>
                  Deletes all allocated nodes and creates a single free block spanning [0, poolSize).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Q&A Accordion */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Technical Architecture & Design Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {TECHNICAL_QUESTIONS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="instrument-card"
                style={{
                  border: `1px solid ${isOpen ? 'var(--mem-allocated-border)' : 'var(--color-border)'}`,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Question Header Button */}
                <button
                  onClick={() => toggleQuestion(index)}
                  style={{
                    width: '100%',
                    padding: '1.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <HelpCircle size={16} style={{ color: isOpen ? 'var(--mem-allocated)' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Q{index + 1}: {item.question}
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={16} style={{ color: 'var(--mem-allocated)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                </button>

                {/* Answer Content */}
                {isOpen && (
                  <div style={{ padding: '0 1.125rem 1.125rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.875rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.625rem' }}>
                      {item.answer}
                    </p>

                    {item.keyFormula && (
                      <div 
                        style={{
                          padding: '0.625rem 0.875rem',
                          background: 'var(--color-canvas)',
                          borderRadius: '0.35rem',
                          border: '1px solid var(--color-border)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.8125rem',
                          color: 'var(--mem-split)',
                          marginBottom: '0.625rem',
                        }}
                      >
                        {item.keyFormula}
                      </div>
                    )}

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {item.tags.map((t) => (
                        <span key={t} className="badge badge-free" style={{ fontSize: '0.6875rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
