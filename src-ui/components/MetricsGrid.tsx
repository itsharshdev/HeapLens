import React from 'react';
import { Stats } from '../types';
import { Database, HardDrive, Split, AlertTriangle, Layers } from 'lucide-react';

interface MetricsGridProps {
  stats: Stats;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats }) => {
  const total = stats.totalPoolSize || 100;
  const allocPercent = ((stats.totalAllocated / total) * 100).toFixed(1);
  const freePercent = ((stats.totalFree / total) * 100).toFixed(1);
  const fragPercent = stats.externalFragmentationPercent.toFixed(1);

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        width: '100%',
      }}
    >
      {/* 1. Total Allocated Space */}
      <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Allocated Space
          </span>
          <div style={{ padding: '0.35rem', borderRadius: '0.375rem', background: 'var(--mem-allocated-bg)', color: 'var(--mem-allocated)' }}>
            <Database size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {stats.totalAllocated}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {total} units ({allocPercent}%)</span>
        </div>
        <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>Active Blocks:</span>
          <strong style={{ color: 'var(--mem-allocated)', fontFamily: 'JetBrains Mono' }}>
            {stats.allocatedBlockCount}
          </strong>
        </div>
      </div>

      {/* 2. Total Free Space */}
      <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Free Space
          </span>
          <div style={{ padding: '0.35rem', borderRadius: '0.375rem', background: 'var(--mem-free-bg)', color: 'var(--mem-free)' }}>
            <HardDrive size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {stats.totalFree}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {total} units ({freePercent}%)</span>
        </div>
        <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>Free Segments:</span>
          <strong style={{ color: 'var(--mem-free)', fontFamily: 'JetBrains Mono' }}>
            {stats.freeBlockCount}
          </strong>
        </div>
      </div>

      {/* 3. Largest Contiguous Free Block */}
      <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Largest Free Block
          </span>
          <div style={{ padding: '0.35rem', borderRadius: '0.375rem', background: 'var(--color-surface-elevated)', color: 'var(--text-primary)' }}>
            <Split size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {stats.largestFreeBlock}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>units</span>
        </div>
        <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Max single request size currently satisfiable
        </div>
      </div>

      {/* 4. External Fragmentation */}
      <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            External Fragmentation
          </span>
          <div 
            style={{ 
              padding: '0.35rem', 
              borderRadius: '0.375rem', 
              background: stats.externalFragmentationPercent > 30 ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-surface-elevated)', 
              color: stats.externalFragmentationPercent > 30 ? 'var(--mem-fragmented)' : 'var(--text-secondary)' 
            }}
          >
            <AlertTriangle size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span 
            style={{ 
              fontSize: '1.875rem', 
              fontWeight: 700, 
              fontFamily: 'JetBrains Mono', 
              color: stats.externalFragmentationPercent > 40 ? 'var(--mem-fragmented)' : 'var(--text-primary)' 
            }}
          >
            {fragPercent}%
          </span>
        </div>
        
        {/* Fragmentation Meter Bar */}
        <div 
          style={{
            marginTop: '0.5rem',
            width: '100%',
            height: '6px',
            background: 'var(--color-surface)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div 
            style={{
              width: `${Math.min(stats.externalFragmentationPercent, 100)}%`,
              height: '100%',
              background: stats.externalFragmentationPercent > 40 ? 'var(--mem-fragmented)' : 'var(--mem-allocated)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
};
