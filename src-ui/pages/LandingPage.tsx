import React, { useState } from 'react';
import { AppRoute, EngineState } from '../types';
import { MemoryScene3D } from '../components/MemoryScene3D';
import { MemoryVisualizer2D } from '../components/MemoryVisualizer2D';
import { MetricsGrid } from '../components/MetricsGrid';
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
  RotateCcw
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

  const runHeroTrial = async (size: number) => {
    if (!onQuickAllocate) return;
    setQuickTrialStatus(`Allocating ${size} units...`);
    try {
      const res = await onQuickAllocate(size);
      if (res.success) {
        setQuickTrialStatus(`Allocated ${size} units. Look at the 3D and 2D visualizers above!`);
      } else {
        setQuickTrialStatus(res.errorMessage || 'Allocation failed.');
      }
    } catch (e: any) {
      setQuickTrialStatus(e.message);
    }
  };

  const runHeroReset = async () => {
    if (!onQuickReset) return;
    setQuickTrialStatus('Resetting memory pool...');
    await onQuickReset();
    setQuickTrialStatus('Pool reset to 100 free units.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Hero Section */}
      <section className="container" style={{ paddingTop: '2rem' }}>
        {/* Top Technical Headline */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.8rem', borderRadius: '9999px', background: 'var(--mem-allocated-bg)', border: '1px solid var(--mem-allocated-border)', marginBottom: '1rem' }}>
            <Terminal size={13} style={{ color: 'var(--mem-allocated)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mem-allocated)', fontFamily: 'JetBrains Mono' }}>
              Contiguous Memory Arena • C++17 Engine
            </span>
          </div>

          <h1 
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              maxWidth: '900px',
              margin: '0 auto 1rem',
            }}
          >
            Inspect, Trace & Master{' '}
            <span 
              style={{
                background: 'linear-gradient(135deg, var(--mem-allocated), var(--mem-free))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Dynamic Memory Management
            </span>
          </h1>

          <p 
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 1.75rem',
              lineHeight: 1.6,
            }}
          >
            A high-precision educational instrument simulating how dynamic memory allocators manage blocks using linked lists. Watch First Fit pointer traversal, block splitting, and adjacent coalescing in real time.
          </p>

          {/* Hero Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <button 
              onClick={() => onNavigate('playground')}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
            >
              <Play size={16} />
              <span>Open Memory Playground</span>
            </button>
            <button 
              onClick={() => onNavigate('linked-list')}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
            >
              <Cpu size={16} />
              <span>Explore Linked List</span>
            </button>
            <button 
              onClick={() => onNavigate('learn')}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
            >
              <BookOpen size={16} />
              <span>How Memory Works</span>
            </button>
          </div>
        </div>

        {/* 3D Visualizer Centerpiece */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ✦ 3D Memory Bus Arena
              </span>
              <span className="badge badge-free" style={{ fontSize: '0.625rem' }}>
                Spatial Block Map
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
              Hover blocks to elevate in 3D
            </span>
          </div>

          <MemoryScene3D blocks={engineState.blocks} stats={engineState.stats} height={340} />
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
              Quick Live Trial:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {quickTrialStatus || 'Click to test instant allocation on the running C++ engine:'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => runHeroTrial(30)} 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}
            >
              + Allocate 30u
            </button>
            <button 
              onClick={() => runHeroTrial(25)} 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}
            >
              + Allocate 25u
            </button>
            <button 
              onClick={runHeroReset} 
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

      {/* 2D Memory Visualizer Preview Section */}
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

      {/* 4 Core Algorithmic Pillars */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Core Memory Management Concepts
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

      {/* Backend Integration Ground Truth Section */}
      <section className="container">
        <div 
          className="instrument-card"
          style={{
            padding: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--mem-allocated)' }} />
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Real C++ Engine Ground Truth
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              HeapLens does not simulate memory in JavaScript. Every allocation, split, free, and coalescing operation runs in the compiled <strong>C++17 engine</strong> (<code>build/heaplens_engine.exe</code>) and streams over a bidirectional JSON-lines protocol.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
              Engine Status: <span style={{ color: isEngineConnected ? 'var(--mem-allocated)' : 'var(--mem-fragmented)', fontWeight: 600 }}>
                {isEngineConnected ? '● C++ Process Active' : '▲ Local Preview Mode'}
              </span>
            </div>
            <button 
              onClick={() => onNavigate('playground')} 
              className="btn btn-primary"
              style={{ padding: '0.5625rem 1.125rem' }}
            >
              <span>Launch Playground</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
