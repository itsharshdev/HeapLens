import React from 'react';
import { AppRoute } from '../types';
import { Terminal, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer 
      style={{
        marginTop: '4rem',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: '2.5rem 1.25rem 2rem',
      }}
    >
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <span style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Heap<span style={{ color: 'var(--mem-allocated)' }}>Lens</span>
            </span>
            <span className="badge badge-free">Educational Platform</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A precision computational learning instrument illustrating dynamic memory management, singly linked-list block metadata, First Fit allocation, splitting, and adjacent block coalescing.
          </p>
        </div>

        {/* Technical Distinction Note */}
        <div className="instrument-card" style={{ padding: '0.875rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--mem-split)', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.8125rem' }}>
            <ShieldCheck size={15} />
            <span>Technical Distinction</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            HeapLens implements a custom <em>simulated memory arena</em>. Normal C++ <code>new</code> and <code>delete</code> manage the OS runtime heap (e.g. ptmalloc or Windows Heap). HeapLens models allocator algorithms deterministically for transparent study.
          </p>
        </div>

        {/* Quick Navigation */}
        <div>
          <h5 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Navigation
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
            <li>
              <button onClick={() => onNavigate('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                Live Allocator Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('playground')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                Memory Allocation Playground
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('linked-list')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                Linked-List Block Explorer
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('learn')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                How Memory Works (Guide)
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div 
        className="container"
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono',
        }}
      >
        <div>
          HeapLens &copy; 2026 • Computer Engineering Data Structures Project
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>C++17 Engine</span>
          <span>•</span>
          <span>JSON-lines Protocol</span>
          <span>•</span>
          <span>Node.js Bridge</span>
        </div>
      </div>
    </footer>
  );
};
