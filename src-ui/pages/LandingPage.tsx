import React, { useState } from 'react';
import { AppRoute, EngineState } from '../types';
import { MemoryScene3D } from '../components/MemoryScene3D';
import { MemoryVisualizer2D } from '../components/MemoryVisualizer2D';
import { MetricsGrid } from '../components/MetricsGrid';
import { AllocatorStoryline } from '../components/AllocatorStoryline';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { 
  ArrowRight, 
  Play, 
  Cpu, 
  Split, 
  Merge, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle2, 
  Terminal, 
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  Layers,
  Box
} from 'lucide-react';

interface LandingPageProps {
  engineState: EngineState;
  isEngineConnected: boolean;
  onNavigate: (route: AppRoute) => void;
  onQuickAllocate?: (size: number) => Promise<any>;
  onQuickReset?: () => Promise<any>;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  engineState,
  isEngineConnected,
  onNavigate,
  onQuickAllocate,
  onQuickReset,
}) => {
  const [quickTrialStatus, setQuickTrialStatus] = useState<string>('');
  const [isAllocating, setIsAllocating] = useState<boolean>(false);

  const runHeroTrial = async (size: number) => {
    if (!onQuickAllocate || isAllocating) return;
    setIsAllocating(true);
    setQuickTrialStatus(`Allocating ${size} units...`);
    try {
      const res = await onQuickAllocate(size);
      if (res.success) {
        setQuickTrialStatus(`Allocated ${size} units. Real C++ heap state updated above!`);
      } else {
        setQuickTrialStatus(res.errorMessage || 'Allocation failed.');
      }
    } catch (e: any) {
      setQuickTrialStatus(e.message);
    } finally {
      setIsAllocating(false);
    }
  };

  const runHeroReset = async () => {
    if (!onQuickReset || isAllocating) return;
    setIsAllocating(true);
    setQuickTrialStatus('Resetting memory pool...');
    try {
      await onQuickReset();
      setQuickTrialStatus('Pool reset to 100 free contiguous units.');
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* 1. Hero Section */}
      <section className="container" style={{ paddingTop: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* Subtle Technical Pill */}
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              padding: '0.35rem 0.85rem', 
              borderRadius: '9999px', 
              background: 'var(--mem-allocated-bg)', 
              border: '1px solid var(--mem-allocated-border)', 
              marginBottom: '1.25rem' 
            }}
          >
            <Terminal size={13} style={{ color: 'var(--mem-allocated)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mem-allocated)', fontFamily: 'JetBrains Mono' }}>
              C++17 Engine • Singly Linked-List Simulation
            </span>
          </div>

          {/* Primary Product Headline */}
          <h1 
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              maxWidth: '860px',
              margin: '0 auto 1.25rem',
            }}
          >
            See memory allocation,{' '}
            <span 
              style={{
                background: 'linear-gradient(135deg, var(--mem-allocated), var(--mem-free))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              block by block.
            </span>
          </h1>

          {/* Supporting Statement */}
          <p 
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.1875rem)',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 2rem',
              lineHeight: 1.65,
            }}
          >
            A high-precision educational instrument simulating how dynamic memory allocators manage blocks using linked lists. Watch First Fit pointer traversal, real-time block splitting, adjacent coalescing, and external fragmentation simulated over a custom memory arena.
          </p>

          {/* Primary CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.875rem' }}>
            <button 
              onClick={() => onNavigate('playground')}
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.625rem', fontSize: '0.9375rem' }}
            >
              <Play size={16} />
              <span>Open Memory Playground</span>
            </button>
            <button 
              onClick={() => onNavigate('linked-list')}
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.625rem', fontSize: '0.9375rem' }}
            >
              <Cpu size={16} />
              <span>Explore Linked List</span>
            </button>
            <button 
              onClick={() => onNavigate('learn')}
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.625rem', fontSize: '0.9375rem' }}
            >
              <BookOpen size={16} />
              <span>How Memory Works</span>
            </button>
          </div>
        </div>

        {/* 3D Visualizer Centerpiece */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ✦ 3D Memory Bus Arena
              </span>
              <span className="badge badge-free" style={{ fontSize: '0.625rem' }}>
                Spatial Block Map
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
              Mouse parallax enabled · Hover blocks to elevate in 3D
            </span>
          </div>

          <MemoryScene3D blocks={engineState.blocks} stats={engineState.stats} height={350} />
        </div>

        {/* Live Quick Trial Strip inside Hero */}
        <div 
          className="instrument-card" 
          style={{ 
            padding: '0.875rem 1.25rem', 
            marginBottom: '2rem',
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
              Live Allocator Trial:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {quickTrialStatus || 'Click to test instant First Fit allocation against the running C++ engine:'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => runHeroTrial(30)} 
              disabled={isAllocating}
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}
            >
              + Allocate 30u
            </button>
            <button 
              onClick={() => runHeroTrial(25)} 
              disabled={isAllocating}
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}
            >
              + Allocate 25u
            </button>
            <button 
              onClick={runHeroReset} 
              disabled={isAllocating}
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              title="Reset pool"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Cards */}
        <MetricsGrid stats={engineState.stats} />
      </section>

      {/* 2. Interactive Scroll-Driven Storytelling Section */}
      <section className="container">
        <AllocatorStoryline />
      </section>

      {/* 3. 2D Memory Visualizer Preview Section */}
      <section className="container">
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            2D Contiguous Memory Visualizer
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Proportional partition representation. Each block width corresponds strictly to its byte size.
          </p>
        </div>
        <MemoryVisualizer2D blocks={engineState.blocks} stats={engineState.stats} />
      </section>

      {/* 4. Core Algorithmic Pillars */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Core Memory Management Pillars
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', fontSize: '0.875rem' }}>
            Essential data structure mechanics implemented in C++ and visualized transparently.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {/* Pillar 1 */}
          <div className="instrument-card" style={{ padding: '1.375rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '0.45rem', background: 'var(--mem-free-bg)', color: 'var(--mem-free)', display: 'inline-flex', marginBottom: '0.875rem' }}>
              <Cpu size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              First Fit Search Strategy
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Traverses from the head block and chooses the first free block that satisfies <code>blockSize &gt;= requestedSize</code>. Stops on the first match in O(N) time.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="instrument-card" style={{ padding: '1.375rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '0.45rem', background: 'var(--mem-allocated-bg)', color: 'var(--mem-allocated)', display: 'inline-flex', marginBottom: '0.875rem' }}>
              <Split size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Dynamic Block Splitting
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              When a free block is larger than requested, it is carved into an allocated block and a remainder free block inserted into the linked list, preventing internal waste.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="instrument-card" style={{ padding: '1.375rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '0.45rem', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'inline-flex', marginBottom: '0.875rem' }}>
              <Merge size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Adjacent Block Coalescing
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              When memory is deallocated, HeapLens merges adjacent free blocks into a single contiguous region. Handles merging 2 or 3 consecutive blocks in a single pass.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="instrument-card" style={{ padding: '1.375rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '0.45rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--mem-fragmented)', display: 'inline-flex', marginBottom: '0.875rem' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              External Fragmentation Lab
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Demonstrates why an allocation fails even when total free space exceeds the requested size, calculated mathematically: <code>(1 - largestFree / totalFree) * 100%</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 5. End-to-End System Architecture */}
      <section className="container">
        <ArchitectureFlow />
      </section>

      {/* 6. Final Call to Action */}
      <section className="container" style={{ marginBottom: '2rem' }}>
        <div 
          className="instrument-card"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%', background: 'var(--mem-allocated-bg)', color: 'var(--mem-allocated)', border: '1px solid var(--mem-allocated-border)' }}>
            <Box size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Ready to Explore Memory Management in Action?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Launch the interactive Memory Playground to submit allocation requests, watch the First Fit trace player step through memory blocks, and inspect coalescing events.
          </p>
          <button 
            onClick={() => onNavigate('playground')} 
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}
          >
            <span>Launch Interactive Playground</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
