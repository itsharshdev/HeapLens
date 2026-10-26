import React, { useState } from 'react';
import { Block, Stats } from '../types';
import { Layers, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MemoryVisualizer2DProps {
  blocks: Block[];
  stats: Stats;
  highlightOffset?: number | null;
  onSelectBlock?: (block: Block) => void;
}

export const MemoryVisualizer2D: React.FC<MemoryVisualizer2DProps> = ({
  blocks,
  stats,
  highlightOffset,
  onSelectBlock,
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<Block | null>(null);

  const totalPoolSize = stats.totalPoolSize || 100;

  return (
    <div className="instrument-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
      {/* Header with Title and Legend */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={17} style={{ color: 'var(--mem-allocated)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Contiguous Memory Arena Map
          </h3>
          <span className="badge badge-free" style={{ fontSize: '0.6875rem' }}>
            {totalPoolSize} Units (0x00 - 0x{totalPoolSize.toString(16).toUpperCase()})
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span 
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: 'var(--mem-allocated)',
                display: 'inline-block'
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Allocated ({stats.totalAllocated}u)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span 
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: 'var(--mem-free-bg)',
                border: '1px solid var(--mem-free-border)',
                display: 'inline-block'
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Free ({stats.totalFree}u)</span>
          </div>
        </div>
      </div>

      {/* Proportional Memory Block Strip */}
      <div 
        style={{
          display: 'flex',
          width: '100%',
          height: '62px',
          background: 'var(--color-canvas)',
          borderRadius: '0.4375rem',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
        }}
        role="region"
        aria-label="Contiguous memory block visualization"
      >
        {blocks.map((block, index) => {
          const widthPercent = (block.size / totalPoolSize) * 100;
          const isHighlighted = highlightOffset != null && highlightOffset === block.startOffset;
          const isSelected = hoveredBlock?.startOffset === block.startOffset;

          return (
            <div
              key={`${block.startOffset}-${index}`}
              onClick={() => onSelectBlock && onSelectBlock(block)}
              onMouseEnter={() => setHoveredBlock(block)}
              onMouseLeave={() => setHoveredBlock(null)}
              style={{
                width: `${widthPercent}%`,
                minWidth: '22px',
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.2rem',
                borderRight: index < blocks.length - 1 ? '1px solid var(--color-border)' : 'none',
                background: block.isFree ? 'var(--mem-free-bg)' : 'var(--mem-allocated-bg)',
                transition: 'all 0.15s ease',
                outline: isHighlighted ? '2px solid var(--mem-split)' : isSelected ? '2px solid var(--text-primary)' : 'none',
                boxShadow: isHighlighted ? 'inset 0 0 12px rgba(245, 158, 11, 0.4), 0 0 12px rgba(245, 158, 11, 0.3)' : 'none',
                outlineOffset: '-2px',
                zIndex: isHighlighted || isSelected ? 10 : 1,
              }}
            >
              {/* Block Indicator Icon / State */}
              <div 
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono',
                  color: block.isFree ? 'var(--mem-free)' : 'var(--mem-allocated)',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {block.isFree ? 'FREE' : `ID #${block.allocId}`}
              </div>

              {/* Block Size */}
              <div 
                style={{
                  fontSize: '0.625rem',
                  fontFamily: 'JetBrains Mono',
                  color: 'var(--text-secondary)',
                  opacity: 0.8,
                  marginTop: '1px',
                }}
              >
                {block.size}u
              </div>

              {/* Selection underline */}
              {isSelected && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: block.isFree ? 'var(--mem-free)' : 'var(--mem-allocated)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Address Scale Baseline */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.35rem',
          fontSize: '0.625rem',
          fontFamily: 'JetBrains Mono',
          color: 'var(--text-muted)',
          padding: '0 2px',
        }}
      >
        <span>0x00</span>
        <span>0x{(Math.floor(totalPoolSize * 0.25)).toString(16).toUpperCase()}</span>
        <span>0x{(Math.floor(totalPoolSize * 0.5)).toString(16).toUpperCase()}</span>
        <span>0x{(Math.floor(totalPoolSize * 0.75)).toString(16).toUpperCase()}</span>
        <span>0x{totalPoolSize.toString(16).toUpperCase()} ({totalPoolSize} units)</span>
      </div>

      {/* Interactive Detail Inspector Box */}
      <div 
        style={{
          marginTop: '0.875rem',
          padding: '0.625rem 0.875rem',
          background: 'var(--color-canvas)',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.625rem',
        }}
      >
        {hoveredBlock ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span className={`badge ${hoveredBlock.isFree ? 'badge-free' : 'badge-allocated'}`}>
              {hoveredBlock.isFree ? 'FREE' : `ALLOC #${hoveredBlock.allocId}`}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Range: <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                [{hoveredBlock.startOffset} .. {hoveredBlock.startOffset + hoveredBlock.size})
              </strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Size: <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                {hoveredBlock.size} units ({((hoveredBlock.size / totalPoolSize) * 100).toFixed(1)}%)
              </strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hex: <span className="font-mono">0x{hoveredBlock.startOffset.toString(16).toUpperCase().padStart(2, '0')}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Info size={14} />
            <span>Hover any memory block above to inspect address boundaries, allocation ID, and size.</span>
          </div>
        )}

        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          Nodes in Chain: {blocks.length}
        </div>
      </div>
    </div>
  );
};
