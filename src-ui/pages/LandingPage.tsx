import React from 'react';
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
  ShieldCheck 
} from 'lucide-react';

interface LandingPageProps {
  engineState: EngineState;
  isEngineConnected: boolean;
  onNavigate: (route: AppRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  engineState,
  isEngineConnected,
  onNavigate,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Hero Section */}
      <section className="container" style={{ paddingTop: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', background: 'var(--mem-allocated-bg)', border: '1px solid var(--mem-allocated-border)', marginBottom: '1.25rem' }}>
          <Terminal size={14} style={{ color: 'var(--mem-allocated)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mem-allocated)', fontFamily: 'JetBrains Mono' }}>
            Data Structures Viva Project • C++17 Core
          </span>
        </div>

        <h1 
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            maxWidth: '920px',
            margin: '0 auto 1.25rem',
          }}
        >
          Visualize, Trace & Master{' '}
          <span 
            style={{
              background: 'linear-gradient(135deg, var(--mem-allocated), var(--mem-free))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dynamic Memory Allocation
          </span>
        </h1>

        <p 
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}
        >
          An interactive laboratory simulating how memory allocators manage blocks using linked lists. Watch First Fit traversals, observe live splits, and inspect coalescing in 2D and 3D.
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button 
            onClick={() => onNavigate('playground')}
            className="btn btn-primary"
            style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
          >
            <Play size={18} />
            <span>Launch Memory Playground</span>
          </button>
          <button 
            onClick={() => onNavigate('linked-list')}
            className="btn btn-secondary"
            style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
          >
            <Cpu size={18} />
            <span>Explore Linked List</span>
          </button>
          <button 
            onClick={() => onNavigate('learn')}
            className="btn btn-secondary"
            style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
          >
            <BookOpen size={18} />
            <span>Viva Masterclass</span>
          </button>
        </div>

        {/* 3D Interactive Memory Arena Scene */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ✦ Live 3D Spatial Memory Arena
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
              WebGL Extruded Block Nodes
            </span>
          </div>
          <MemoryScene3D blocks={engineState.blocks} stats={engineState.stats} height={320} />
        </div>

        {/* Live Telemetry Grid */}
        <MetricsGrid stats={engineState.stats} />
      </section>

      {/* 2D Memory Visualizer Preview Section */}
      <section className="container">
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            2D Contiguous Memory Visualizer
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            A proportional, high-contrast block map showing exactly how the simulated memory pool is partitioned.
          </p>
        </div>
        <MemoryVisualizer2D blocks={engineState.blocks} stats={engineState.stats} />
      </section>

      {/* 4 Core Algorithmic Pillars */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Core Concepts Explained Simply
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9375rem' }}>
            Everything you need to confidently answer external examiner questions in your university Viva defense.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {/* Pillar 1 */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--mem-free-bg)', color: 'var(--mem-free)', display: 'inline-flex', marginBottom: '1rem' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              First Fit Search Strategy
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The allocator traverses the linked list from the head block and chooses the first free block that satisfies <code>blockSize &gt;= requestedSize</code>. Fast, efficient, and simple to reason about.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--mem-allocated-bg)', color: 'var(--mem-allocated)', display: 'inline-flex', marginBottom: '1rem' }}>
              <Split size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Dynamic Block Splitting
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              When a free block is larger than requested, it is carved into an allocated block and a remainder free block inserted into the linked list, preventing internal waste.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'inline-flex', marginBottom: '1rem' }}>
              <Merge size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Adjacent Block Coalescing
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              When an allocation is freed, HeapLens automatically merges adjacent free blocks into a single contiguous block. Merges 2 or 3 consecutive blocks in a single pass!
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--mem-fragmented)', display: 'inline-flex', marginBottom: '1rem' }}>
              <AlertTriangle size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              External Fragmentation Lab
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Experience why an allocation can fail even when total free memory exceeds the requested size! Demonstrates: <code>(1 - largestFree / totalFree) * 100%</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Backend Integration Architecture Card */}
      <section className="container">
        <div 
          className="glass-panel"
          style={{
            padding: '2rem',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--mem-allocated)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Real C++ Engine Ground Truth
              </h3>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              HeapLens does not simulate memory in JavaScript. Every allocation, split, free, and coalescing operation runs in the compiled <strong>C++17 engine</strong> (<code>build/heaplens_engine.exe</code>) and streams over a bidirectional JSON-lines protocol.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.8125rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
              Status: <span style={{ color: isEngineConnected ? 'var(--mem-allocated)' : 'var(--mem-fragmented)', fontWeight: 600 }}>
                {isEngineConnected ? '● C++ Engine Online' : '▲ Local Preview Mode'}
              </span>
            </div>
            <button 
              onClick={() => onNavigate('playground')} 
              className="btn btn-primary"
              style={{ padding: '0.625rem 1.25rem' }}
            >
              <span>Test Live Allocator</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
