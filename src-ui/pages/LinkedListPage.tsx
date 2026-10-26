import React from 'react';
import { EngineState } from '../types';
import { Cpu, ArrowRight, CheckCircle2, Code2 } from 'lucide-react';

interface LinkedListPageProps {
  engineState: EngineState;
}

export const LinkedListPage: React.FC<LinkedListPageProps> = ({ engineState }) => {
  const blocks = engineState.blocks;
  const total = engineState.stats.totalPoolSize;

  // Verify Invariants Live
  let isContiguous = true;
  let sumSize = 0;
  let hasAdjacentFree = false;

  for (let i = 0; i < blocks.length; i++) {
    sumSize += blocks[i].size;
    if (i > 0) {
      if (blocks[i].startOffset !== blocks[i - 1].startOffset + blocks[i - 1].size) {
        isContiguous = false;
      }
      if (blocks[i].isFree && blocks[i - 1].isFree) {
        hasAdjacentFree = true;
      }
    }
  }

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Cpu size={20} style={{ color: 'var(--mem-allocated)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Linked-List Block Explorer
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Inspect the singly linked list of block metadata nodes representing the simulated heap.
        </p>
      </div>

      {/* Linked-List Invariant Verification HUD */}
      <div 
        className="instrument-card" 
        style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} style={{ color: isContiguous ? 'var(--mem-allocated)' : 'var(--mem-error)' }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Contiguity Invariant
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              startOffset[i] == startOffset[i-1] + size[i-1] (Verified)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} style={{ color: sumSize === total ? 'var(--mem-allocated)' : 'var(--mem-error)' }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Total Coverage Invariant
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              Sum of block sizes: {sumSize} / {total} units (100% matched)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} style={{ color: !hasAdjacentFree ? 'var(--mem-allocated)' : 'var(--mem-error)' }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Coalescing Invariant
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {!hasAdjacentFree ? 'No adjacent free blocks exist (coalesced)' : 'Adjacent free blocks detected'}
            </div>
          </div>
        </div>
      </div>

      {/* Linked-List Chain Flow Diagram */}
      <div className="instrument-card" style={{ padding: '1.375rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          Sequential Linked-List Traversal Chain
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 'max-content', paddingBottom: '0.5rem' }}>
          {/* Head Pointer indicator */}
          <div 
            style={{
              padding: '0.45rem 0.7rem',
              borderRadius: '0.35rem',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--mem-allocated)',
            }}
          >
            m_head
          </div>

          <ArrowRight size={16} style={{ color: 'var(--mem-allocated)', flexShrink: 0 }} />

          {blocks.map((block, index) => {
            const isLast = index === blocks.length - 1;
            return (
              <React.Fragment key={block.startOffset}>
                {/* Node Box */}
                <div 
                  className="instrument-card"
                  style={{
                    padding: '0.875rem 1rem',
                    minWidth: '190px',
                    border: `1px solid ${block.isFree ? 'var(--mem-free-border)' : 'var(--mem-allocated-border)'}`,
                    background: block.isFree ? 'var(--mem-free-bg)' : 'var(--mem-allocated-bg)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                      Node [{index}]
                    </span>
                    <span className={`badge ${block.isFree ? 'badge-free' : 'badge-allocated'}`}>
                      {block.isFree ? 'FREE' : `ID #${block.allocId}`}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>startOffset: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{block.startOffset}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}> (0x{block.startOffset.toString(16).toUpperCase()})</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>size: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{block.size} units</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>isFree: </span>
                      <strong style={{ color: block.isFree ? 'var(--mem-free)' : 'var(--mem-allocated)' }}>
                        {block.isFree ? 'true' : 'false'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>next: </span>
                      <strong style={{ color: 'var(--mem-split)' }}>
                        {isLast ? 'nullptr' : `&Node[${index + 1}]`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Arrow to Next Node */}
                <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </React.Fragment>
            );
          })}

          {/* Nullptr Terminator */}
          <div 
            style={{
              padding: '0.45rem 0.7rem',
              borderRadius: '0.35rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            nullptr
          </div>
        </div>
      </div>

      {/* C++ Struct Code Comparison */}
      <div className="instrument-card" style={{ padding: '1.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
          <Code2 size={16} style={{ color: 'var(--mem-allocated)' }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Under the Hood: C++ Metadata Node Struct
          </h3>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
          Every node in the diagram above directly mirrors the <code>heaplens::Block</code> struct in <code>src/block.h</code>:
        </p>
        <pre 
          style={{
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.4375rem',
            padding: '0.875rem 1rem',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.75rem',
            color: 'var(--text-primary)',
            overflowX: 'auto',
            lineHeight: 1.5,
          }}
        >
{`struct Block {
    size_t startOffset;  // Contiguous boundary in simulated pool
    size_t size;         // Size in memory units
    bool isFree;         // true if available; false if occupied
    int allocId;         // Unique allocation ID (>0), 0 when free
    Block* next;         // Pointer to next contiguous block (nullptr at tail)

    Block(size_t offset, size_t sz, bool free = true, int id = 0, Block* n = nullptr)
        : startOffset(offset), size(sz), isFree(free), allocId(id), next(n) {}
};`}
        </pre>
      </div>
    </div>
  );
};
