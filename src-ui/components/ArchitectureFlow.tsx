import React from 'react';
import { Layers, ArrowRight, ArrowLeft, Cpu, Terminal, Globe, Server, CheckCircle2 } from 'lucide-react';

export const ArchitectureFlow: React.FC = () => {
  return (
    <div className="instrument-card" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          End-to-End System Architecture
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '0.875rem', lineHeight: 1.6 }}>
          HeapLens maintains clean architectural separation between presentation, IPC bridging, and the core algorithmic memory manager.
        </p>
      </div>

      {/* 3-Tier Architecture Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
        {/* Layer 1: Frontend */}
        <div 
          style={{
            padding: '1.5rem',
            background: 'var(--color-surface)',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border)',
            borderTop: '3px solid var(--mem-free)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} style={{ color: 'var(--mem-free)' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              1. Presentation Layer
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            React 18 • TypeScript • Three.js • Vite
          </span>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Renders interactive 3D/2D memory arenas, trace playback controls, live invariant meters, and multi-theme design tokens. Never duplicates allocator algorithms in JavaScript.
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ✦ Port 5173 • Client-side Hash Router
          </div>
        </div>

        {/* Layer 2: Node.js Bridge */}
        <div 
          style={{
            padding: '1.5rem',
            background: 'var(--color-surface)',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border)',
            borderTop: '3px solid #a855f7',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={18} style={{ color: '#a855f7' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              2. Lightweight Bridge
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Node.js (Zero external deps) • IPC Child Process
          </span>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Spawns and supervises <code>heaplens_engine.exe --bridge</code>. Translates incoming HTTP REST requests into JSON-lines piped directly to C++ stdio with async queueing.
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ✦ Port 3001 • Bi-directional stdin/stdout
          </div>
        </div>

        {/* Layer 3: C++17 Allocator */}
        <div 
          style={{
            padding: '1.5rem',
            background: 'var(--color-surface)',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border)',
            borderTop: '3px solid var(--mem-allocated)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} style={{ color: 'var(--mem-allocated)' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              3. Authoritative Engine
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            C++17 • Singly Linked List • Single Source of Truth
          </span>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Executes First Fit search, block splitting, validation, 2- and 3-block coalescing, and records step-by-step traversal decision traces. Emits JSON telemetry.
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ✦ 12/12 Verified Unit Tests • 0% Memory Leaks
          </div>
        </div>
      </div>
    </div>
  );
};
