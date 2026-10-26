import React, { useState } from 'react';
import { Compass, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Info, ShieldCheck } from 'lucide-react';

interface CandidateBlock {
  id: string;
  size: number;
}

const SAMPLE_FREE_BLOCKS: CandidateBlock[] = [
  { id: 'Block A', size: 15 },
  { id: 'Block B', size: 45 },
  { id: 'Block C', size: 25 },
  { id: 'Block D', size: 60 },
  { id: 'Block E', size: 20 },
];

export const StrategyComparator: React.FC = () => {
  const [requestSize, setRequestSize] = useState<number>(22);

  // Strategy Evaluations
  // 1. First Fit: First block with size >= requestSize
  const firstFitCandidate = SAMPLE_FREE_BLOCKS.find((b) => b.size >= requestSize) || null;

  // 2. Best Fit: Smallest block with size >= requestSize
  const eligibleBestFit = SAMPLE_FREE_BLOCKS.filter((b) => b.size >= requestSize);
  const bestFitCandidate = eligibleBestFit.length > 0 
    ? eligibleBestFit.reduce((prev, curr) => (curr.size < prev.size ? curr : prev))
    : null;

  // 3. Worst Fit: Largest block with size >= requestSize
  const worstFitCandidate = eligibleBestFit.length > 0 
    ? eligibleBestFit.reduce((prev, curr) => (curr.size > prev.size ? curr : prev))
    : null;

  return (
    <div className="instrument-card" style={{ padding: '1.5rem' }}>
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.875rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} style={{ color: 'var(--mem-allocated)' }} />
            <h2 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Allocation Strategy Comparative Model
            </h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Interactive comparison of First Fit (active C++ engine strategy) versus Best Fit and Worst Fit.
          </p>
        </div>

        <span 
          className="badge" 
          style={{ 
            background: 'rgba(16, 185, 129, 0.12)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            color: 'var(--mem-allocated)',
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono',
          }}
        >
          ✦ Educational Model · First Fit is Active Engine
        </span>
      </div>

      {/* Interactive Size Input Slider */}
      <div 
        style={{
          padding: '1rem',
          background: 'var(--color-surface)',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-border)',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Simulated Allocation Request Size:
          </label>
          <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--mem-allocated)' }}>
            {requestSize} units
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input 
            type="range"
            min="10"
            max="65"
            value={requestSize}
            onChange={(e) => setRequestSize(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--mem-allocated)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[15, 22, 35, 55].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setRequestSize(val)}
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem', fontFamily: 'JetBrains Mono' }}
              >
                {val}u
              </button>
            ))}
          </div>
        </div>

        {/* Free Block Candidates Visual Strip */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Candidate Free Block Chain in Memory:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SAMPLE_FREE_BLOCKS.map((b) => (
              <div 
                key={b.id}
                style={{
                  padding: '0.45rem 0.75rem',
                  background: 'var(--color-canvas)',
                  borderRadius: '0.3125rem',
                  border: `1px solid ${b.size >= requestSize ? 'var(--mem-free-border)' : 'var(--color-border)'}`,
                  fontSize: '0.75rem',
                  fontFamily: 'JetBrains Mono',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{b.id}:</span>
                <strong style={{ color: b.size >= requestSize ? 'var(--mem-free)' : 'var(--text-muted)' }}>
                  {b.size}u
                </strong>
                {b.size < requestSize && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--mem-error)' }}>(Deficit)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Strategy Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Strategy 1: First Fit */}
        <div 
          style={{
            padding: '1.125rem',
            background: 'var(--color-surface)',
            borderRadius: '0.4375rem',
            border: '1px solid var(--mem-allocated-border)',
            borderTop: '3px solid var(--mem-allocated)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. First Fit
            </span>
            <span className="badge badge-allocated" style={{ fontSize: '0.6875rem' }}>
              HeapLens C++ Engine
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Traverses from list head and picks the very first block with <code>size &gt;= request</code>. Stops immediately without scanning the rest.
          </p>

          <div style={{ padding: '0.5rem', background: 'var(--color-canvas)', borderRadius: '0.3125rem', fontSize: '0.8125rem', fontFamily: 'JetBrains Mono' }}>
            {firstFitCandidate ? (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Selected Block: </span>
                <strong style={{ color: 'var(--mem-allocated)' }}>{firstFitCandidate.id} ({firstFitCandidate.size}u)</strong>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginTop: '0.2rem' }}>
                  Remainder split: {firstFitCandidate.size - requestSize} units
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--mem-error)' }}>No suitable block fits request.</span>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            <strong>Tradeoff:</strong> Extremely fast in practice; avoids full list traversal. Can cluster smaller allocations near the head of the list.
          </div>
        </div>

        {/* Strategy 2: Best Fit */}
        <div 
          style={{
            padding: '1.125rem',
            background: 'var(--color-surface)',
            borderRadius: '0.4375rem',
            border: '1px solid var(--color-border)',
            borderTop: '3px solid #38bdf8',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              2. Best Fit
            </span>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.6875rem' }}>
              Theoretical Model
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Searches the entire list to find the block that minimizes leftover space (<code>min(size - request)</code>).
          </p>

          <div style={{ padding: '0.5rem', background: 'var(--color-canvas)', borderRadius: '0.3125rem', fontSize: '0.8125rem', fontFamily: 'JetBrains Mono' }}>
            {bestFitCandidate ? (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Selected Block: </span>
                <strong style={{ color: '#38bdf8' }}>{bestFitCandidate.id} ({bestFitCandidate.size}u)</strong>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginTop: '0.2rem' }}>
                  Remainder split: {bestFitCandidate.size - requestSize} units (Tightest fit)
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--mem-error)' }}>No suitable block fits request.</span>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            <strong>Tradeoff:</strong> High search overhead (must always traverse all nodes). Leaves tiny unusable "splinter" blocks.
          </div>
        </div>

        {/* Strategy 3: Worst Fit */}
        <div 
          style={{
            padding: '1.125rem',
            background: 'var(--color-surface)',
            borderRadius: '0.4375rem',
            border: '1px solid var(--color-border)',
            borderTop: '3px solid #f59e0b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Worst Fit
            </span>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.6875rem' }}>
              Theoretical Model
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Searches the entire list to allocate from the largest available block, leaving the largest remainder possible.
          </p>

          <div style={{ padding: '0.5rem', background: 'var(--color-canvas)', borderRadius: '0.3125rem', fontSize: '0.8125rem', fontFamily: 'JetBrains Mono' }}>
            {worstFitCandidate ? (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Selected Block: </span>
                <strong style={{ color: '#f59e0b' }}>{worstFitCandidate.id} ({worstFitCandidate.size}u)</strong>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginTop: '0.2rem' }}>
                  Remainder split: {worstFitCandidate.size - requestSize} units (Largest remainder)
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--mem-error)' }}>No suitable block fits request.</span>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            <strong>Tradeoff:</strong> Quickly destroys large contiguous blocks needed for subsequent large allocation requests.
          </div>
        </div>
      </div>

      <div 
        style={{
          marginTop: '1rem',
          padding: '0.625rem 0.875rem',
          background: 'var(--color-canvas)',
          borderRadius: '0.3125rem',
          border: '1px solid var(--color-border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Info size={15} style={{ color: 'var(--mem-allocated)', flexShrink: 0 }} />
        <span>
          <strong>Why HeapLens implements First Fit:</strong> First Fit offers an optimal balance between execution speed and fragmentation control, completing in <code>O(1)</code> best-case when initial blocks fit and avoiding full linked-list scans.
        </span>
      </div>
    </div>
  );
};
