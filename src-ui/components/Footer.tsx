import React from 'react';
import { AppRoute } from '../types';
import { Terminal, ShieldCheck, Heart } from 'lucide-react';

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
        padding: '3rem 1.25rem 2rem',
      }}
    >
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Heap<span style={{ color: 'var(--mem-allocated)' }}>Lens</span>
            </span>
            <span className="badge badge-free">Educational Platform</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A precision computational learning instrument illustrating dynamic memory management, singly linked-list block metadata, First Fit allocation, splitting, and adjacent block coalescing.
          </p>
        </div>

        {/* Vital Technical Note */}
        <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mem-split)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
            <ShieldCheck size={16} />
            <span>Technical Distinction</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            HeapLens implements a custom <em>simulated memory arena</em>. Normal C++ <code>new</code> and <code>delete</code> manage the OS runtime heap (e.g. ptmalloc or Windows Heap). HeapLens models allocator algorithms deterministically for university Data Structures study.
          </p>
        </div>

        {/* Quick Navigation */}
        <div>
          <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Explore
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
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
                Viva Defense Masterclass & Q&A
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div 
        className="container"
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono',
        }}
      >
        <div>
          HeapLens &copy; 2026 • Computer Engineering Data Structures Project
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
