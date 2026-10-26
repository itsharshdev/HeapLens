import React, { useState } from 'react';
import { 
  Play, 
  Scissors, 
  Trash2, 
  Merge, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Code2
} from 'lucide-react';

interface StoryStep {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  description: string;
  codeSnippet: string;
  diagram: {
    before: { label: string; size: number; isFree: boolean; id?: number }[];
    after: { label: string; size: number; isFree: boolean; id?: number }[];
    explanation: string;
  };
}

const STORY_STEPS: StoryStep[] = [
  {
    id: 'allocate',
    number: '01',
    title: 'First Fit Traversal',
    subtitle: 'Linear pointer scan from head',
    icon: <Play size={18} />,
    badge: 'O(N) Traversal',
    badgeColor: 'var(--mem-free)',
    description: 'When an allocation of size K is requested, First Fit starts at m_head and inspects each metadata block. It evaluates whether the block is free and satisfies blockSize >= K, stopping at the very first candidate.',
    codeSnippet: `// Linear First Fit Traversal
Block* curr = m_head;
while (curr != nullptr) {
    if (curr->isFree && curr->size >= requestedSize) {
        return curr; // First suitable fit found
    }
    curr = curr->next;
}`,
    diagram: {
      before: [
        { label: 'Head (Occupied)', size: 30, isFree: false, id: 1 },
        { label: 'Candidate (Free)', size: 70, isFree: true },
      ],
      after: [
        { label: 'Head (Occupied)', size: 30, isFree: false, id: 1 },
        { label: 'Inspected (Selected)', size: 70, isFree: true },
      ],
      explanation: 'First Fit skips occupied blocks and targets the first available free block with sufficient capacity.',
    },
  },
  {
    id: 'split',
    number: '02',
    title: 'Dynamic Block Splitting',
    subtitle: 'Zero internal fragmentation',
    icon: <Scissors size={18} />,
    badge: 'O(1) Node Insertion',
    badgeColor: 'var(--mem-allocated)',
    description: 'If the selected free block is larger than requested, the allocator carves out the exact requested size. A remainder free block is instantiated and spliced directly into the linked list after the allocated block.',
    codeSnippet: `// Split Block into Allocated + Free Remainder
size_t remainder = curr->size - requestedSize;
curr->size = requestedSize;
curr->isFree = false;
curr->allocId = m_nextAllocId++;

// Insert remainder node
Block* remainderBlock = new Block(
    curr->startOffset + requestedSize,
    remainder, true, 0, curr->next
);
curr->next = remainderBlock;`,
    diagram: {
      before: [
        { label: 'Large Free Block (100u)', size: 100, isFree: true },
      ],
      after: [
        { label: 'Allocated (35u)', size: 35, isFree: false, id: 1 },
        { label: 'Remainder Free (65u)', size: 65, isFree: true },
      ],
      explanation: 'The original 100u free block is divided into a 35u active allocation and a 65u free remainder block.',
    },
  },
  {
    id: 'free',
    number: '03',
    title: 'Deallocation by ID',
    subtitle: 'Safe memory release and validation',
    icon: <Trash2 size={18} />,
    badge: 'O(N) Search + O(1) Mark',
    badgeColor: 'var(--mem-error)',
    description: 'The caller provides the unique allocation ID. HeapLens searches the singly linked list for the matching node, validates that it is currently allocated (preventing double-free bugs), and toggles isFree = true.',
    codeSnippet: `// Locate Block & Mark Free
Block* curr = m_head;
while (curr && curr->allocId != targetId) {
    curr = curr->next;
}
if (!curr) return Error("Unknown ID");
if (curr->isFree) return Error("Double-free");

curr->isFree = true;
curr->allocId = 0; // Cleared`,
    diagram: {
      before: [
        { label: 'Allocated ID #1 (35u)', size: 35, isFree: false, id: 1 },
        { label: 'Free Remainder (65u)', size: 65, isFree: true },
      ],
      after: [
        { label: 'Marked Free (35u)', size: 35, isFree: true },
        { label: 'Adjacent Free (65u)', size: 65, isFree: true },
      ],
      explanation: 'Block #1 is marked free. Notice that two adjacent free blocks now sit next to each other.',
    },
  },
  {
    id: 'coalesce',
    number: '04',
    title: 'Adjacent Block Coalescing',
    subtitle: 'Reclaiming contiguous heap space',
    icon: <Merge size={18} />,
    badge: 'O(1) Pointer Redirection',
    badgeColor: '#a855f7',
    description: 'To prevent heap fragmentation from accumulating over time, a single-pass sweep unifies adjacent free blocks. The right node is absorbed into the left node and its metadata node is safely deleted.',
    codeSnippet: `// Single-Pass Adjacent Coalescing
Block* curr = m_head;
while (curr && curr->next) {
    if (curr->isFree && curr->next->isFree) {
        Block* toDelete = curr->next;
        curr->size += toDelete->size;
        curr->next = toDelete->next;
        delete toDelete; // Crucial: do NOT advance curr!
    } else {
        curr = curr->next;
    }
}`,
    diagram: {
      before: [
        { label: 'Left Free (35u)', size: 35, isFree: true },
        { label: 'Right Free (65u)', size: 65, isFree: true },
      ],
      after: [
        { label: 'Unified Contiguous Free Pool (100u)', size: 100, isFree: true },
      ],
      explanation: 'The 35u and 65u blocks coalesce into a single 100u free block, eliminating the boundary between them.',
    },
  },
  {
    id: 'fragmentation',
    number: '05',
    title: 'External Fragmentation',
    subtitle: 'Total free space vs largest contiguous block',
    icon: <AlertTriangle size={18} />,
    badge: 'Mathematical Metric',
    badgeColor: 'var(--mem-fragmented)',
    description: 'External fragmentation occurs when the sum of free memory units is large enough to satisfy a request, but the memory is split across isolated chunks, none of which is individually large enough.',
    codeSnippet: `// External Fragmentation Metric
// Formulated as: (1.0 - largestFree / totalFree) * 100%
double frag = 0.0;
if (totalFree > 0) {
    frag = (1.0 - (double)largestFree / totalFree) * 100.0;
}
if (requestedSize > largestFree) {
    return Error("Allocation failure: Insufficient contiguous space");
}`,
    diagram: {
      before: [
        { label: 'ID #1 (30u)', size: 30, isFree: false, id: 1 },
        { label: 'Free (20u)', size: 20, isFree: true },
        { label: 'ID #2 (30u)', size: 30, isFree: false, id: 2 },
        { label: 'Free (20u)', size: 20, isFree: true },
      ],
      after: [
        { label: 'Allocated (60u total)', size: 60, isFree: false },
        { label: 'Isolated Chunks (20u + 20u = 40u Free)', size: 40, isFree: true },
      ],
      explanation: 'Total free space = 40 units, but an allocation for 35 units fails because the largest contiguous block is only 20 units!',
    },
  },
];

export const AllocatorStoryline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('allocate');

  const currentStep = STORY_STEPS.find((s) => s.id === activeTab) || STORY_STEPS[0];

  return (
    <div className="instrument-card" style={{ padding: '2rem' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            marginBottom: '0.75rem',
          }}
        >
          <Sparkles size={13} style={{ color: 'var(--mem-allocated)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
            Interactive Allocator Mechanics
          </span>
        </div>

        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          What Happens Inside the Allocator?
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.6 }}>
          Step through the 5 core lifecycle phases of dynamic memory management. Each phase illustrates pointer adjustments, contiguity invariants, and C++ source implementations.
        </p>
      </div>

      {/* Step Selector Tabs */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.625rem',
          marginBottom: '2rem',
        }}
      >
        {STORY_STEPS.map((step) => {
          const isActive = step.id === activeTab;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveTab(step.id)}
              className="btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.875rem 1rem',
                borderRadius: '0.4375rem',
                background: isActive ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                border: `1px solid ${isActive ? 'var(--mem-allocated-border)' : 'var(--color-border)'}`,
                boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.15)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: isActive ? 'var(--mem-allocated)' : 'var(--text-muted)', fontWeight: 700 }}>
                  PHASE {step.number}
                </span>
                <span style={{ color: isActive ? 'var(--mem-allocated)' : 'var(--text-muted)' }}>
                  {step.icon}
                </span>
              </div>
              <strong style={{ fontSize: '0.875rem', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                {step.title}
              </strong>
            </button>
          );
        })}
      </div>

      {/* Active Phase Detail Display */}
      <div 
        className="animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          background: 'var(--color-surface)',
          padding: '1.75rem',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Left Column: Conceptual & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge" style={{ background: 'var(--color-canvas)', border: `1px solid ${currentStep.badgeColor}`, color: currentStep.badgeColor, fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                {currentStep.badge}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {currentStep.subtitle}
              </span>
            </div>

            <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {currentStep.title}
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {currentStep.description}
            </p>
          </div>

          {/* Visual Memory Strip Diagram */}
          <div style={{ padding: '1rem', background: 'var(--color-canvas)', borderRadius: '0.375rem', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              BEFORE OPERATION:
            </div>
            <div style={{ display: 'flex', width: '100%', height: '32px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              {currentStep.diagram.before.map((b, i) => (
                <div 
                  key={i} 
                  style={{
                    flex: b.size,
                    background: b.isFree ? 'var(--mem-free-bg)' : 'var(--mem-allocated-bg)',
                    borderRight: i < currentStep.diagram.before.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontFamily: 'JetBrains Mono',
                    color: b.isFree ? 'var(--mem-free)' : 'var(--mem-allocated)',
                    fontWeight: 600,
                  }}
                >
                  {b.label}
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              AFTER OPERATION:
            </div>
            <div style={{ display: 'flex', width: '100%', height: '32px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              {currentStep.diagram.after.map((b, i) => (
                <div 
                  key={i} 
                  style={{
                    flex: b.size,
                    background: b.isFree ? 'var(--mem-free-bg)' : 'var(--mem-allocated-bg)',
                    borderRight: i < currentStep.diagram.after.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontFamily: 'JetBrains Mono',
                    color: b.isFree ? 'var(--mem-free)' : 'var(--mem-allocated)',
                    fontWeight: 600,
                  }}
                >
                  {b.label}
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.4 }}>
              ✦ {currentStep.diagram.explanation}
            </div>
          </div>
        </div>

        {/* Right Column: Real C++ Source Implementation */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.85rem', background: 'var(--color-canvas)', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem', border: '1px solid var(--color-border)', borderBottom: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
              <Code2 size={13} style={{ color: 'var(--mem-allocated)' }} />
              <span>src/allocator.cpp</span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>C++17</span>
          </div>

          <pre
            style={{
              margin: 0,
              padding: '1rem',
              background: 'var(--color-canvas)',
              borderBottomLeftRadius: '0.375rem',
              borderBottomRightRadius: '0.375rem',
              border: '1px solid var(--color-border)',
              color: 'var(--text-primary)',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.75rem',
              lineHeight: 1.55,
              overflowX: 'auto',
              flex: 1,
            }}
          >
            <code>{currentStep.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
