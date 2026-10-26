import React from 'react';
import { CoalesceEvent } from '../types';
import { Merge, ArrowRight, ShieldCheck, Sparkles, Layers, Info } from 'lucide-react';

interface CoalescingInspectorProps {
  freedId: number | null;
  events: CoalesceEvent[];
}

export const CoalescingInspector: React.FC<CoalescingInspectorProps> = ({ freedId, events }) => {
  if (!freedId && (!events || events.length === 0)) {
    return null;
  }

  const hasCoalescing = events && events.length > 0;

  return (
    <div className="instrument-card animate-fade-in" style={{ padding: '1.25rem' }}>
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.875rem',
          paddingBottom: '0.625rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Merge size={16} style={{ color: hasCoalescing ? '#a855f7' : 'var(--mem-free)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Deallocation &amp; Coalescing Inspector
          </h3>
        </div>

        {freedId && (
          <span className="badge badge-allocated" style={{ fontSize: '0.75rem' }}>
            Released ID #{freedId}
          </span>
        )}
      </div>

      {hasCoalescing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#c084fc', fontWeight: 600 }}>
            <Sparkles size={14} />
            <span>
              {events.length === 1 ? 'Two-Block Adjacent Merge Executed' : `${events.length}-Stage Coalescing (3-Block Unified Merge)`}
            </span>
          </div>

          {events.map((ev, idx) => (
            <div 
              key={idx}
              style={{
                padding: '0.875rem',
                background: 'var(--color-surface)',
                borderRadius: '0.375rem',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#c084fc' }}>
                  MERGE STAGE #{idx + 1}
                </span>
                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.3)', fontSize: '0.6875rem' }}>
                  O(1) Pointer Bypass
                </span>
              </div>

              {/* Merge Diagram Box */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem',
                  background: 'var(--color-canvas)',
                  borderRadius: '0.3125rem',
                  fontSize: '0.75rem',
                  fontFamily: 'JetBrains Mono',
                  overflowX: 'auto',
                }}
              >
                <div style={{ padding: '0.35rem 0.5rem', background: 'var(--color-surface-elevated)', borderRadius: '0.25rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>LEFT FREE BLOCK</div>
                  <strong style={{ color: 'var(--mem-free)' }}>0x{ev.leftOffset.toString(16).toUpperCase()} ({ev.leftSize}u)</strong>
                </div>

                <span style={{ color: '#c084fc', fontWeight: 700 }}>+</span>

                <div style={{ padding: '0.35rem 0.5rem', background: 'var(--color-surface-elevated)', borderRadius: '0.25rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>RIGHT FREE BLOCK</div>
                  <strong style={{ color: 'var(--mem-free)' }}>0x{ev.rightOffset.toString(16).toUpperCase()} ({ev.rightSize}u)</strong>
                </div>

                <ArrowRight size={14} style={{ color: '#c084fc', flexShrink: 0 }} />

                <div style={{ padding: '0.35rem 0.5rem', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '0.25rem', border: '1px solid rgba(168, 85, 247, 0.4)', textAlign: 'center' }}>
                  <div style={{ color: '#d8b4fe', fontSize: '0.625rem' }}>COMBINED FREE BLOCK</div>
                  <strong style={{ color: '#f3e8ff' }}>0x{ev.leftOffset.toString(16).toUpperCase()} ({ev.newSize}u)</strong>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                {ev.message}
              </p>
            </div>
          ))}

          <div 
            style={{
              padding: '0.625rem 0.75rem',
              background: 'var(--color-canvas)',
              borderRadius: '0.3125rem',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={16} style={{ color: '#a855f7', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Why Coalescing Matters:</strong> Without adjacent coalescing, freeing memory would leave a graveyard of tiny, separated fragments that could never satisfy larger allocations. HeapLens executes single-pass coalescing in <code>O(1)</code> space by adjusting <code>curr-&gt;next</code> and deleting the redundant node.
            </div>
          </div>
        </div>
      ) : (
        <div 
          style={{
            padding: '0.75rem',
            background: 'var(--color-canvas)',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Info size={15} style={{ color: 'var(--mem-free)', flexShrink: 0 }} />
          <span>
            Block <strong>ID #{freedId}</strong> was marked free. Neither the predecessor nor successor block is currently free, so no coalesce was necessary.
          </span>
        </div>
      )}
    </div>
  );
};
