import React from 'react';
import { EngineState, Block } from '../types';
import { MetricsGrid } from '../components/MetricsGrid';
import { MemoryVisualizer2D } from '../components/MemoryVisualizer2D';
import { 
  LayoutDashboard, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';

interface DashboardPageProps {
  engineState: EngineState;
  isEngineConnected: boolean;
  onFree: (allocId: number) => Promise<void>;
  onReset: () => Promise<void>;
  onNavigateToPlayground: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  engineState,
  isEngineConnected,
  onFree,
  onReset,
  onNavigateToPlayground,
}) => {
  const allocatedBlocks = engineState.blocks.filter((b) => !b.isFree);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <LayoutDashboard size={20} style={{ color: 'var(--mem-allocated)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Live Allocator Dashboard
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time telemetry and state of the C++ dynamic memory pool.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={onReset} 
            className="btn btn-secondary"
            title="Reset simulated memory pool"
          >
            <RefreshCw size={14} />
            <span>Reset Pool</span>
          </button>
          <button 
            onClick={onNavigateToPlayground} 
            className="btn btn-primary"
          >
            <span>Open Playground</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Connection Banner if preview mode */}
      {!isEngineConnected && (
        <div 
          className="instrument-card"
          style={{
            padding: '0.75rem 1.125rem',
            borderLeft: '4px solid var(--mem-fragmented)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={16} style={{ color: 'var(--mem-fragmented)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <strong>C++ Engine Offline:</strong> Showing initial preview state. Start the bridge with{' '}
            <code style={{ background: 'var(--color-surface)', padding: '2px 5px', borderRadius: '3px' }}>
              npm start
            </code>{' '}
            to connect live operations.
          </div>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <MetricsGrid stats={engineState.stats} />

      {/* 2D Proportional Visualizer */}
      <MemoryVisualizer2D blocks={engineState.blocks} stats={engineState.stats} />

      {/* Active Allocations Table */}
      <div className="instrument-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Allocations ({allocatedBlocks.length})
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Blocks currently occupied in the simulated heap arena.
            </p>
          </div>
        </div>

        {allocatedBlocks.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No active allocations. The memory pool is 100% free! Go to the Playground to allocate memory.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono' }}>ALLOC ID</th>
                  <th style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono' }}>START OFFSET</th>
                  <th style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono' }}>SIZE</th>
                  <th style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono' }}>RANGE</th>
                  <th style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono' }}>HEAP %</th>
                  <th style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {allocatedBlocks.map((block) => (
                  <tr 
                    key={block.allocId}
                    style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background 0.12s ease' }}
                  >
                    <td style={{ padding: '0.625rem 0.5rem' }}>
                      <span className="badge badge-allocated">
                        ID #{block.allocId}
                      </span>
                    </td>
                    <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
                      0x{block.startOffset.toString(16).toUpperCase().padStart(2, '0')} ({block.startOffset})
                    </td>
                    <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--mem-allocated)' }}>
                      {block.size} units
                    </td>
                    <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                      [{block.startOffset} .. {block.startOffset + block.size})
                    </td>
                    <td style={{ padding: '0.625rem 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                      {((block.size / engineState.stats.totalPoolSize) * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => onFree(block.allocId)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--mem-error)' }}
                        title={`Deallocate Block #${block.allocId}`}
                      >
                        <Trash2 size={12} />
                        <span>Free #{block.allocId}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
