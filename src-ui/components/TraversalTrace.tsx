import React from 'react';
import { StepTrace } from '../types';
import { ArrowRight, CheckCircle2, XCircle, Scissors, CornerDownRight } from 'lucide-react';

interface TraversalTraceProps {
  trace: StepTrace[];
  requestedSize?: number;
}

export const TraversalTrace: React.FC<TraversalTraceProps> = ({ trace, requestedSize }) => {
  if (!trace || trace.length === 0) {
    return (
      <div 
        className="glass-panel" 
        style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}
      >
        Perform an allocation in the Playground to see the step-by-step First Fit decision trace.
      </div>
    );
  }

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'EXACT_FIT':
        return (
          <span className="badge badge-allocated" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} />
            EXACT FIT
          </span>
        );
      case 'SPLIT_FIT':
        return (
          <span className="badge badge-free" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Scissors size={13} />
            SPLIT FIT
          </span>
        );
      case 'SKIPPED_TOO_SMALL':
        return (
          <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={13} />
            TOO SMALL
          </span>
        );
      case 'SKIPPED_ALLOCATED':
      default:
        return (
          <span 
            className="badge" 
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              color: 'var(--text-muted)',
              border: '1px solid var(--color-border)' 
            }}
          >
            OCCUPIED
          </span>
        );
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            First Fit Traversal Trace
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Step-by-step decision points emitted by the C++ engine during pointer traversal.
          </p>
        </div>
        {requestedSize && (
          <span className="badge badge-free">
            Target Request: {requestedSize} units
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {trace.map((step) => (
          <div 
            key={step.stepIndex}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem',
              padding: '0.75rem',
              background: 'var(--color-surface)',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Step Counter */}
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--color-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              {step.stepIndex}
            </div>

            {/* Step Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Block at Offset {step.blockOffset} (size: {step.blockSize}u)
                </span>
                {getDecisionBadge(step.decision)}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {step.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
