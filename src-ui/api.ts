/**
 * HeapLens Typed API Client
 *
 * Communicates with the Node.js / C++ Allocator Engine bridge at /api.
 * Provides live connection telemetry and transparent offline detection.
 */

import { EngineState, AllocationResult, DeallocationResult } from './types';

// Default base URL respects relative path (proxied by Vite or direct HTTP)
const API_BASE = '/api';

export interface ApiHealth {
  connected: boolean;
  engineAlive: boolean;
  error?: string;
}

export async function checkHealth(): Promise<ApiHealth> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      connected: true,
      engineAlive: !!data.engineAlive,
    };
  } catch (err: any) {
    return {
      connected: false,
      engineAlive: false,
      error: err.message || 'Bridge unreachable',
    };
  }
}

export async function fetchEngineState(): Promise<EngineState> {
  const res = await fetch(`${API_BASE}/state`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch state from engine: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function allocateBlock(size: number): Promise<AllocationResult> {
  const res = await fetch(`${API_BASE}/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size }),
  });
  if (!res.ok) {
    throw new Error(`Allocation request failed: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function freeBlock(allocId: number): Promise<DeallocationResult> {
  const res = await fetch(`${API_BASE}/free`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allocId }),
  });
  if (!res.ok) {
    throw new Error(`Deallocation request failed: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function resetPool(poolSize: number = 100): Promise<EngineState> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ poolSize }),
  });
  if (!res.ok) {
    throw new Error(`Reset request failed: HTTP ${res.status}`);
  }
  return await res.json();
}

/**
 * Fallback initial state used exclusively before first network ping or when offline.
 * Clearly labeled as PREVIEW state in the UI.
 */
export const PREVIEW_INITIAL_STATE: EngineState = {
  success: true,
  action: 'preview',
  poolSize: 100,
  nextAllocId: 3,
  stats: {
    totalPoolSize: 100,
    totalAllocated: 55,
    totalFree: 45,
    largestFreeBlock: 25,
    freeBlockCount: 2,
    allocatedBlockCount: 2,
    externalFragmentationPercent: 44.44,
  },
  blocks: [
    { startOffset: 0, size: 25, isFree: true, allocId: 0 },
    { startOffset: 25, size: 30, isFree: false, allocId: 1 },
    { startOffset: 55, size: 20, isFree: true, allocId: 0 },
    { startOffset: 75, size: 25, isFree: false, allocId: 2 },
  ],
};
