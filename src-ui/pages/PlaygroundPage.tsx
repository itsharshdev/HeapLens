import React, { useState } from 'react';
import { EngineState, StepTrace, CoalesceEvent } from '../types';
import { MemoryVisualizer2D } from '../components/MemoryVisualizer2D';
import { TraversalTrace } from '../components/TraversalTrace';
import { 
  Play, 
  Trash2, 
  RotateCcw, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Scissors, 
  Merge,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlaygroundPageProps {
  engineState: EngineState;
  onAllocate: (size: number) => Promise<{ success: boolean; trace?: StepTrace[]; errorMessage?: string }>;
  onFree: (allocId: number) => Promise<{ success: boolean; coalesceEvents?: CoalesceEvent[]; errorMessage?: string }>;
  onReset: (poolSize?: number) => Promise<void>;
}

export const PlaygroundPage: React.FC<PlaygroundPageProps> = ({
  engineState,
  onAllocate,
  onFree,
  onReset,
}) => {
  const [allocSize, setAllocSize] = useState<number>(25);
  const [freeId, setFreeId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latestTrace, setLatestTrace] = useState<StepTrace[]>([]);
  const [lastMessage, setLastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allocSize <= 0) {
      setLastMessage({ type: 'error', text: 'Size must be greater than zero.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await onAllocate(allocSize);
      if (res.success) {
        setLastMessage({ type: 'success', text: `Successfully allocated ${allocSize} units using First Fit!` });
        if (res.trace) setLatestTrace(res.trace);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      } else {
        setLastMessage({ type: 'error', text: res.errorMessage || 'Allocation failed.' });
        if (res.trace) setLatestTrace(res.trace);
      }
    } catch (err: any) {
      setLastMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (freeId <= 0) {
      setLastMessage({ type: 'error', text: 'Allocation ID must be a positive integer.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await onFree(freeId);
      if (res.success) {
        const merges = res.coalesceEvents?.length || 0;
        setLastMessage({ 
          type: 'success', 
          text: `Freed Allocation ID #${freeId}.${merges > 0 ? ` Coalesced ${merges} adjacent free block(s)!` : ''}` 
        });
      } else {
        setLastMessage({ type: 'error', text: res.errorMessage || 'Deallocation failed.' });
      }
    } catch (err: any) {
      setLastMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Educational Preset Scenarios
  const runScenarioSplit = async () => {
    setIsLoading(true);
    try {
      await onReset(100);
      const res = await onAllocate(35);
      if (res.trace) setLatestTrace(res.trace);
      setLastMessage({ 
        type: 'info', 
        text: 'Scenario Loaded: Allocated 35 units from 100u pool. Block split into 35u (Allocated) and 65u (Free Remainder).' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runScenarioCoalesce = async () => {
    setIsLoading(true);
    try {
      await onReset(100);
      const r1 = await onAllocate(20); // ID 1
      const r2 = await onAllocate(30); // ID 2
      const r3 = await onAllocate(50); // ID 3
      // Free ID 1 and ID 3, leaving ID 2 in the middle
      await onFree(1);
      await onFree(3);
      setLastMessage({ 
        type: 'info', 
        text: 'Scenario Loaded: 3 blocks created; outer blocks freed. Now click "Free #2" below to observe 3-block coalescing into 1 contiguous pool!' 
      });
      setFreeId(2);
    } finally {
      setIsLoading(false);
    }
  };

  const runScenarioFragmentation = async () => {
    setIsLoading(true);
    try {
      await onReset(100);
      // Allocate 4 blocks of 25
      await onAllocate(25); // ID 1
      await onAllocate(25); // ID 2
      await onAllocate(25); // ID 3
      await onAllocate(25); // ID 4
      // Free ID 1 and ID 3
      await onFree(1);
      await onFree(3);
      // Attempt to allocate 40 (fails even though 50 total free)
      const res = await onAllocate(40);
      if (res.trace) setLatestTrace(res.trace);
      setLastMessage({ 
        type: 'error', 
        text: 'External Fragmentation Demonstrated: Total free space is 50 units, but largest contiguous block is only 25 units. Request for 40 units failed!' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allocatedIds = engineState.blocks.filter((b) => !b.isFree).map((b) => b.allocId);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Memory Allocation Playground
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Interact directly with the C++ dynamic memory allocator. Submit real allocation and deallocation requests.
        </p>
      </div>

      {/* Preset Scenarios Toolbar */}
      <div 
        className="glass-panel" 
        style={{
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} style={{ color: 'var(--mem-split)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Viva Interactive Demos:
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button onClick={runScenarioSplit} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            <Scissors size={14} style={{ color: 'var(--mem-free)' }} />
            <span>1. Block Splitting Demo</span>
          </button>
          <button onClick={runScenarioCoalesce} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            <Merge size={14} style={{ color: '#a855f7' }} />
            <span>2. Coalescing (3 Blocks)</span>
          </button>
          <button onClick={runScenarioFragmentation} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={14} style={{ color: 'var(--mem-fragmented)' }} />
            <span>3. External Fragmentation</span>
          </button>
          <button onClick={() => onReset(100)} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Operation Feedback Message Banner */}
      {lastMessage && (
        <div 
          className="glass-panel animate-fade-in"
          style={{
            padding: '0.875rem 1.25rem',
            borderLeft: `4px solid ${
              lastMessage.type === 'success' ? 'var(--mem-allocated)' :
              lastMessage.type === 'error' ? 'var(--mem-error)' : 'var(--mem-free)'
            }`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {lastMessage.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: 'var(--mem-allocated)', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ color: lastMessage.type === 'error' ? 'var(--mem-error)' : 'var(--mem-free)', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {lastMessage.text}
          </span>
        </div>
      )}

      {/* Interactive Controls & Forms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Form 1: Allocate */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Play size={18} style={{ color: 'var(--mem-allocated)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Allocate Memory (First Fit)
            </h3>
          </div>

          <form onSubmit={handleAllocateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Requested Allocation Size (units):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number"
                  min="1"
                  max={engineState.stats.totalPoolSize}
                  value={allocSize}
                  onChange={(e) => setAllocSize(Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.875rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '1rem',
                  }}
                  required
                />
                <button type="submit" disabled={isLoading} className="btn btn-primary">
                  <span>Allocate</span>
                </button>
              </div>
            </div>

            {/* Quick Size Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
              {[10, 20, 25, 35, 50].map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => setAllocSize(sz)}
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}
                >
                  {sz}u
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Form 2: Deallocate */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Trash2 size={18} style={{ color: 'var(--mem-error)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Deallocate Block (by ID)
            </h3>
          </div>

          <form onSubmit={handleFreeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Allocation ID to Free:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {allocatedIds.length > 0 ? (
                  <select
                    value={freeId}
                    onChange={(e) => setFreeId(Number(e.target.value))}
                    style={{
                      flex: 1,
                      padding: '0.625rem 0.875rem',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '1rem',
                    }}
                  >
                    {allocatedIds.map((id) => (
                      <option key={id} value={id}>Allocation ID #{id}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="number"
                    min="1"
                    value={freeId}
                    onChange={(e) => setFreeId(Number(e.target.value))}
                    placeholder="e.g. 1"
                    style={{
                      flex: 1,
                      padding: '0.625rem 0.875rem',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '1rem',
                    }}
                  />
                )}
                <button 
                  type="submit" 
                  disabled={isLoading || allocatedIds.length === 0} 
                  className="btn btn-danger"
                >
                  <span>Free Block</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Deallocating a block triggers adjacent free block coalescing to reclaim contiguous space.
            </p>
          </form>
        </div>
      </div>

      {/* Memory Visualizer 2D */}
      <MemoryVisualizer2D blocks={engineState.blocks} stats={engineState.stats} />

      {/* Step-by-Step Traversal Trace */}
      <TraversalTrace trace={latestTrace} requestedSize={allocSize} />
    </div>
  );
};
