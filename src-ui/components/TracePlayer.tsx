import React, { useState, useEffect, useRef } from 'react';
import { StepTrace } from '../types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  Scissors, 
  CornerDownRight, 
  Sparkles,
  Info
} from 'lucide-react';

interface TracePlayerProps {
  trace: StepTrace[];
  requestedSize?: number;
  onActiveOffsetChange?: (offset: number | null) => void;
}

export const TracePlayer: React.FC<TracePlayerProps> = ({
  trace,
  requestedSize,
  onActiveOffsetChange,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const timerRef = useRef<number | null>(null);

  const totalSteps = trace.length;
  const currentStep = trace[currentStepIdx] || null;

  // Reset to first step whenever a new trace is provided
  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [trace]);

  // Synchronize active block offset with parent (for 2D & 3D visualizers)
  useEffect(() => {
    if (currentStep && onActiveOffsetChange) {
      onActiveOffsetChange(currentStep.blockOffset);
    } else if (onActiveOffsetChange) {
      onActiveOffsetChange(null);
    }
  }, [currentStepIdx, currentStep, onActiveOffsetChange]);

  // Handle Playback Interval
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.round(1200 / playbackSpeed);

    timerRef.current = window.setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, totalSteps]);

  // Stop playback on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (onActiveOffsetChange) onActiveOffsetChange(null);
    };
  }, [onActiveOffsetChange]);

  if (!trace || trace.length === 0) {
    return (
      <div 
        className="instrument-card" 
        style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Info size={16} style={{ color: 'var(--mem-free)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            First Fit Traversal Player Ready
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem' }}>
          Submit an allocation request above to watch First Fit evaluate block candidates and record decisions in real time.
        </p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (currentStepIdx >= totalSteps - 1) {
      // Loop back to start if finished
      setCurrentStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const toggleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(2);
    else if (playbackSpeed === 2) setPlaybackSpeed(0.5);
    else setPlaybackSpeed(1);
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'EXACT_FIT':
        return (
          <span className="badge badge-allocated" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} />
            EXACT FIT
          </span>
        );
      case 'SPLIT_FIT':
        return (
          <span className="badge badge-free" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Scissors size={13} />
            SPLIT FIT
          </span>
        );
      case 'SKIPPED_TOO_SMALL':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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

  const isFinalStep = currentStepIdx === totalSteps - 1;
  const isAllocationSuccess = currentStep && (currentStep.decision === 'EXACT_FIT' || currentStep.decision === 'SPLIT_FIT');

  return (
    <div className="instrument-card animate-fade-in" style={{ padding: '1.25rem' }}>
      {/* Header with Title and Target */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Interactive First Fit Traversal Player
            </h3>
            <span className="badge badge-free" style={{ fontSize: '0.6875rem' }}>
              Step {currentStepIdx + 1} of {totalSteps}
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Step through the exact C++ pointer evaluation chain. Highlighting active candidates in 2D &amp; 3D.
          </p>
        </div>

        {requestedSize && (
          <span className="badge" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
            Target: {requestedSize} units
          </span>
        )}
      </div>

      {/* Playback Controls Toolbar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.625rem 0.875rem',
          background: 'var(--color-canvas)',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-border)',
          marginBottom: '1rem',
        }}
      >
        {/* Step Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button 
            type="button" 
            onClick={handleRestart}
            title="Restart to Step 1"
            className="btn btn-secondary" 
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <RotateCcw size={13} />
          </button>
          <button 
            type="button" 
            onClick={handleStepBack} 
            disabled={currentStepIdx === 0}
            title="Previous Step"
            className="btn btn-secondary" 
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <SkipBack size={13} />
          </button>
          <button 
            type="button" 
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play Traversal'}
            className="btn btn-primary" 
            style={{ padding: '0.35rem 0.85rem' }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : isFinalStep ? 'Replay' : 'Play'}</span>
          </button>
          <button 
            type="button" 
            onClick={handleStepForward} 
            disabled={currentStepIdx === totalSteps - 1}
            title="Next Step"
            className="btn btn-secondary" 
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <SkipForward size={13} />
          </button>
        </div>

        {/* Speed Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            type="button" 
            onClick={toggleSpeed}
            title="Cycle Playback Speed"
            className="btn btn-secondary" 
            style={{ padding: '0.3rem 0.55rem', fontSize: '0.6875rem', fontFamily: 'JetBrains Mono' }}
          >
            <Gauge size={12} />
            <span>{playbackSpeed}x</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        style={{
          width: '100%',
          height: '4px',
          background: 'var(--color-border)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}
      >
        <div 
          style={{
            width: `${((currentStepIdx + 1) / totalSteps) * 100}%`,
            height: '100%',
            background: 'var(--mem-allocated)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* Active Step Detailed Card */}
      {currentStep && (
        <div 
          className="animate-fade-in"
          style={{
            padding: '1rem',
            background: 'var(--color-surface)',
            borderRadius: '0.4375rem',
            border: '1px solid var(--color-border)',
            borderLeft: `4px solid ${
              currentStep.decision === 'EXACT_FIT' ? 'var(--mem-allocated)' :
              currentStep.decision === 'SPLIT_FIT' ? 'var(--mem-free)' :
              currentStep.decision === 'SKIPPED_TOO_SMALL' ? 'var(--mem-fragmented)' : 'var(--text-muted)'
            }`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--color-surface-elevated)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {currentStep.stepIndex}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Evaluating Block at Offset 0x{currentStep.blockOffset.toString(16).padStart(2, '0').toUpperCase()} ({currentStep.blockOffset}u)
              </span>
            </div>

            <div>
              {getDecisionBadge(currentStep.decision)}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
            <span>Block Size: <strong style={{ color: 'var(--text-primary)' }}>{currentStep.blockSize} units</strong></span>
            <span>State: <strong style={{ color: currentStep.isFree ? 'var(--mem-free)' : 'var(--mem-allocated)' }}>{currentStep.isFree ? 'FREE' : `ALLOCATED (ID #${currentStep.allocId})`}</strong></span>
            {requestedSize && (
              <span>Fit Delta: <strong style={{ color: currentStep.blockSize >= requestedSize ? 'var(--mem-allocated)' : 'var(--mem-error)' }}>
                {currentStep.blockSize - requestedSize >= 0 ? `+${currentStep.blockSize - requestedSize}u remaining` : `${currentStep.blockSize - requestedSize}u deficit`}
              </strong></span>
            )}
          </div>

          <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-canvas)', borderRadius: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-primary)', border: '1px solid var(--color-border-subtle)', lineHeight: 1.4 }}>
            {currentStep.reason}
          </div>
        </div>
      )}

      {/* Outcome Banner on Completion */}
      {isFinalStep && (
        <div 
          className="animate-fade-in"
          style={{
            marginTop: '0.875rem',
            padding: '0.75rem 1rem',
            background: isAllocationSuccess ? 'var(--mem-allocated-bg)' : 'var(--mem-error-bg)',
            borderRadius: '0.375rem',
            border: `1px solid ${isAllocationSuccess ? 'var(--mem-allocated-border)' : 'var(--mem-error-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
          }}
        >
          {isAllocationSuccess ? (
            <Sparkles size={16} style={{ color: 'var(--mem-allocated)', flexShrink: 0 }} />
          ) : (
            <XCircle size={16} style={{ color: 'var(--mem-error)', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {isAllocationSuccess 
              ? `Traversal Finished: First Fit successfully settled request in ${totalSteps} pointer step(s). Contiguous invariants maintained.`
              : `Traversal Finished: Scanned all ${totalSteps} block(s). No contiguous free block met the ${requestedSize}u requirement.`
            }
          </span>
        </div>
      )}
    </div>
  );
};
