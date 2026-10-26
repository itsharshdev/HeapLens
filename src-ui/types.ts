/**
 * HeapLens Frontend TypeScript Definitions
 * Strictly aligned with the C++17 Allocator Engine & JSON Protocol contract.
 */

export interface Block {
  startOffset: number;
  size: number;
  isFree: boolean;
  allocId: number;
}

export interface Stats {
  totalPoolSize: number;
  totalAllocated: number;
  totalFree: number;
  largestFreeBlock: number;
  freeBlockCount: number;
  allocatedBlockCount: number;
  externalFragmentationPercent: number;
}

export interface StepTrace {
  stepIndex: number;
  blockOffset: number;
  blockSize: number;
  isFree: boolean;
  allocId: number;
  decision: 'SKIPPED_ALLOCATED' | 'SKIPPED_TOO_SMALL' | 'EXACT_FIT' | 'SPLIT_FIT' | string;
  reason: string;
}

export interface CoalesceEvent {
  leftOffset: number;
  leftSize: number;
  rightOffset: number;
  rightSize: number;
  newSize: number;
  message: string;
}

export interface AllocationResult {
  success: boolean;
  action: 'allocate';
  allocId: number;
  allocatedOffset: number;
  allocatedSize: number;
  errorMessage?: string;
  trace: StepTrace[];
  stats: Stats;
  blocks: Block[];
}

export interface DeallocationResult {
  success: boolean;
  action: 'free';
  freedId: number;
  freedOffset: number;
  freedSize: number;
  errorMessage?: string;
  coalesceEvents: CoalesceEvent[];
  stats: Stats;
  blocks: Block[];
}

export interface EngineState {
  success: boolean;
  action: string;
  poolSize: number;
  nextAllocId: number;
  stats: Stats;
  blocks: Block[];
}

export type ThemeMode = 'dark' | 'light' | 'lab';

export type AppRoute = 'home' | 'dashboard' | 'playground' | 'linked-list' | 'learn';
