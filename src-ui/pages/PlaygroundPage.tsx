import React, { useState } from 'react';
import { EngineState, StepTrace, CoalesceEvent } from '../types';
import { MemoryVisualizer2D } from '../components/MemoryVisualizer2D';
import { MemoryScene3D } from '../components/MemoryScene3D';
import { TracePlayer } from '../components/TracePlayer';
import { CoalescingInspector } from '../components/CoalescingInspector';
import { 
  Play, 
  Trash2, 
  RotateCcw, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Scissors, 
  Merge,
  Box,
  Layers,
  Sparkles
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
  const [activeHighlightOffset, setActiveHighlightOffset] = useState<number | null>(null);
  const [latestCoalesceEvents, setLatestCoalesceEvents] = useState<CoalesceEvent[]>([]);
  const [lastFreedId, setLastFreedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'both' | '2d' | '3d'>('both');
  const [lastMessage, setLastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allocSize <= 0) {
      setLastMessage({ type: 'error', text: 'Allocation size must be greater than zero.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await onAllocate(allocSize);
      if (res.success) {
        setLastMessage({ 
          type: 'success', 
          text: `Successfully allocated ${allocSize} units using First Fit! Use the Trace Player below to inspect the decision steps.` 
        });
        if (res.trace) setLatestTrace(res.trace);
        confetti({ particleCount: 28, spread: 60, origin: { y: 0.82 } });
      } else {
        setLastMessage({ type: 'error', text: res.errorMessage || 'Allocation request failed.' });
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
        setLastFreedId(freeId);
        setLatestCoalesceEvents(res.coalesceEvents || []);
        const merges = res.coalesceEvents?.length || 0;
        setLastMessage({ 
          type: 'success', 
          text: `Freed Allocation ID #${freeId}.${merges > 0 ? ` Coalesced ${merges} adjacent free block(s)! See inspector below.` : ' Block marked free.'}` 
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
    setLatestCoalesceEvents([]);
    setLastFreedId(null);
    try {
      await onReset(100);
      const res = await onAllocate(35);
      if (res.trace) setLatestTrace(res.trace);
      setLastMessage({ 
        type: 'info', 
        text: 'Scenario 1 Loaded: Allocated 35u from a clean 100u pool. Block split into 35u (Allocated @ 0x00) and 65u (Free Remainder @ 0x23).' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runScenarioCoalesce = async () => {
    setIsLoading(true);
    try {
      await onReset(100);
      // Allocate 5 blocks of 20
      await onAllocate(20); // ID 1
      await onAllocate(20); // ID 2
      await onAllocate(20); // ID 3
      await onAllocate(20); // ID 4
      await onAllocate(20); // ID 5
      
      // Free ID 2 and ID 4, leaving ID 3 flanked by two free blocks
      await onFree(2);
      await onFree(4);

      // Now free ID 3 to trigger true 3-block coalescing!
      const freeRes = await onFree(3);
      setLastFreedId(3);
      if (freeRes.coalesceEvents) {
        setLatestCoalesceEvents(freeRes.coalesceEvents);
      }

      setLastMessage({ 
        type: 'info', 
        text: 'Scenario 2 Executed: Allocated 5 blocks, freed #2 and #4, then freed middle block #3. C++ engine executed 3-Block Adjacent Coalescing into one contiguous 60u free block!' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runScenarioFragmentation = async () => {
    setIsLoading(true);
    setLatestCoalesceEvents([]);
    setLastFreedId(null);
    try {
      await onReset(100);
      // Allocate 4 blocks: 30, 20, 30, 20
      await onAllocate(30); // ID 1
      await onAllocate(20); // ID 2
      await onAllocate(30); // ID 3
      await onAllocate(20); // ID 4
      
      // Free the two 20-unit blocks (IDs 2 and 4)
      await onFree(2);
      await onFree(4);

      // Total free = 40 units, but largest contiguous free block = 20 units!
      // Attempt to allocate 35 units:
      const res = await onAllocate(35);
      if (res.trace) setLatestTrace(res.trace);

      setLastMessage({ 
        type: 'error', 
        text: 'External Fragmentation Demonstrated: Total free space is 40 units, but largest contiguous block is only 20 units. C++ engine rejected 35u request!' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allocatedIds = engineState.blocks.filter((b) => !b.isFree).map((b) => b.allocId);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Memory Allocation Playground
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Interact directly with the C++ dynamic memory allocator. Submit real allocation and deallocation requests.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--color-surface)', padding: '0.25rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`btn ${viewMode === 'both' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.6875rem' }}
          >
            <Sparkles size={12} />
            <span>Dual View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`btn ${viewMode === '2d' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.6875rem' }}
          >
            <Layers size={12} />
            <span>2D Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`btn ${viewMode === '3d' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.6875rem' }}
          >
            <Box size={12} />
            <span>3D Arena</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Toolbar */}
      <div 
        className="instrument-card" 
        style={{
          padding: '0.875rem 1.125rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} style={{ color: 'var(--mem-split)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Interactive Guided Scenarios:
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button onClick={runScenarioSplit} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
            <Scissors size={13} style={{ color: 'var(--mem-free)' }} />
            <span>1. Block Splitting</span>
          </button>
          <button onClick={runScenarioCoalesce} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
            <Merge size={13} style={{ color: '#a855f7' }} />
            <span>2. Coalescing (3 Blocks)</span>
          </button>
          <button onClick={runScenarioFragmentation} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
            <AlertCircle size={13} style={{ color: 'var(--mem-fragmented)' }} />
            <span>3. External Fragmentation</span>
          </button>
          <button onClick={() => onReset(100)} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
            <RotateCcw size={13} />
            <span>Reset Pool</span>
          </button>
        </div>
      </div>

      {/* Operation Feedback Message Banner */}
      {lastMessage && (
        <div 
          className="instrument-card animate-fade-in"
          style={{
            padding: '0.75rem 1.125rem',
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
            <CheckCircle2 size={16} style={{ color: 'var(--mem-allocated)', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={16} style={{ color: lastMessage.type === 'error' ? 'var(--mem-error)' : 'var(--mem-free)', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {lastMessage.text}
          </span>
        </div>
      )}

      {/* Interactive Controls & Forms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Form 1: Allocate */}
        <div className="instrument-card" style={{ padding: '1.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <Play size={16} style={{ color: 'var(--mem-allocated)' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Allocate Memory (First Fit)
            </h3>
          </div>

          <form onSubmit={handleAllocateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
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
                    padding: '0.5625rem 0.75rem',
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.375rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.9375rem',
                  }}
                  required
                />
                <button type="submit" disabled={isLoading} className="btn btn-primary">
                  <span>Allocate</span>
                </button>
              </div>
            </div>

            {/* Quick Size Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
              {[10, 20, 25, 35, 50].map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => setAllocSize(sz)}
                  className="btn btn-secondary"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.6875rem', fontFamily: 'JetBrains Mono' }}
                >
                  {sz}u
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Form 2: Deallocate */}
        <div className="instrument-card" style={{ padding: '1.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <Trash2 size={16} style={{ color: 'var(--mem-error)' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Deallocate Block (by ID)
            </h3>
          </div>

          <form onSubmit={handleFreeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Allocation ID to Free:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {allocatedIds.length > 0 ? (
                  <select
                    value={freeId}
                    onChange={(e) => setFreeId(Number(e.target.value))}
                    style={{
                      flex: 1,
                      padding: '0.5625rem 0.75rem',
                      background: 'var(--color-canvas)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '0.9375rem',
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
                      padding: '0.5625rem 0.75rem',
                      background: 'var(--color-canvas)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.375rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '0.9375rem',
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
              Deallocating automatically triggers adjacent free block coalescing in O(1) space.
            </p>
          </form>
        </div>
      </div>

      {/* Visualizers (2D & 3D) synchronized with activeHighlightOffset */}
      {(viewMode === 'both' || viewMode === '3d') && (
        <MemoryScene3D 
          blocks={engineState.blocks} 
          stats={engineState.stats} 
          height={320}
          highlightOffset={activeHighlightOffset}
        />
      )}

      {(viewMode === 'both' || viewMode === '2d') && (
        <MemoryVisualizer2D 
          blocks={engineState.blocks} 
          stats={engineState.stats}
          highlightOffset={activeHighlightOffset}
        />
      )}

      {/* Interactive First Fit Trace Player */}
      <TracePlayer 
        trace={latestTrace} 
        requestedSize={allocSize}
        onActiveOffsetChange={(offset) => setActiveHighlightOffset(offset)}
      />

      {/* Deallocation & Coalescing Inspector */}
      <CoalescingInspector 
        freedId={lastFreedId} 
        events={latestCoalesceEvents} 
      />
    </div>
  );
};
