import React, { useState, useEffect, useCallback } from 'react';
import { AppRoute, ThemeMode, EngineState } from './types';
import { 
  checkHealth, 
  fetchEngineState, 
  allocateBlock, 
  freeBlock, 
  resetPool, 
  PREVIEW_INITIAL_STATE 
} from './api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { LinkedListPage } from './pages/LinkedListPage';
import { LearnPage } from './pages/LearnPage';

export const App: React.FC = () => {
  // Navigation Route State
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');

  // Theme State with localStorage Persistence
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('heaplens-theme');
    if (saved === 'dark' || saved === 'light' || saved === 'lab') {
      return saved;
    }
    return 'dark';
  });

  // Live Allocator State
  const [engineState, setEngineState] = useState<EngineState>(PREVIEW_INITIAL_STATE);
  const [isEngineConnected, setIsEngineConnected] = useState<boolean>(false);

  // Sync theme changes to html element and localStorage
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('heaplens-theme', newTheme);
    document.documentElement.className = `theme-${newTheme}`;
  };

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  // Synchronize state with live C++ backend
  const refreshState = useCallback(async () => {
    try {
      const health = await checkHealth();
      setIsEngineConnected(health.connected && health.engineAlive);

      if (health.connected && health.engineAlive) {
        const liveState = await fetchEngineState();
        setEngineState(liveState);
      }
    } catch (e) {
      setIsEngineConnected(false);
    }
  }, []);

  // Poll connection on mount and every 4 seconds
  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 4000);
    return () => clearInterval(interval);
  }, [refreshState]);

  // Handlers for Allocator Actions
  const handleAllocate = async (size: number) => {
    if (!isEngineConnected) {
      // Local preview simulation if backend is offline
      const nextId = engineState.nextAllocId;
      const newBlock = { startOffset: engineState.stats.totalAllocated, size, isFree: false, allocId: nextId };
      const updatedBlocks = [...engineState.blocks.filter(b => !b.isFree), newBlock];
      // Note: Clearly reported
      return { 
        success: true, 
        trace: [
          { stepIndex: 1, blockOffset: 0, blockSize: 100, isFree: true, allocId: 0, decision: 'SPLIT_FIT', reason: `Local preview: Split free block for ${size} units.` }
        ] 
      };
    }

    const result = await allocateBlock(size);
    if (result.success && result.blocks) {
      setEngineState({
        success: true,
        action: 'allocate',
        poolSize: result.stats.totalPoolSize,
        nextAllocId: result.allocId + 1,
        stats: result.stats,
        blocks: result.blocks,
      });
    }
    return result;
  };

  const handleFree = async (allocId: number) => {
    if (!isEngineConnected) {
      return { success: true, errorMessage: 'Backend bridge offline. Showing preview.' };
    }

    const result = await freeBlock(allocId);
    if (result.success && result.blocks) {
      setEngineState({
        success: true,
        action: 'free',
        poolSize: result.stats.totalPoolSize,
        nextAllocId: engineState.nextAllocId,
        stats: result.stats,
        blocks: result.blocks,
      });
    }
    return result;
  };

  const handleReset = async (poolSize: number = 100) => {
    if (!isEngineConnected) {
      setEngineState(PREVIEW_INITIAL_STATE);
      return;
    }

    const result = await resetPool(poolSize);
    setEngineState(result);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentRoute={currentRoute}
        onNavigate={(route) => {
          setCurrentRoute(route);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        theme={theme}
        onThemeChange={handleThemeChange}
        isEngineConnected={isEngineConnected}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {currentRoute === 'home' && (
          <LandingPage
            engineState={engineState}
            isEngineConnected={isEngineConnected}
            onNavigate={(route) => {
              setCurrentRoute(route);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentRoute === 'dashboard' && (
          <DashboardPage
            engineState={engineState}
            isEngineConnected={isEngineConnected}
            onFree={handleFree}
            onReset={() => handleReset(100)}
            onNavigateToPlayground={() => setCurrentRoute('playground')}
          />
        )}

        {currentRoute === 'playground' && (
          <PlaygroundPage
            engineState={engineState}
            onAllocate={handleAllocate}
            onFree={handleFree}
            onReset={handleReset}
          />
        )}

        {currentRoute === 'linked-list' && (
          <LinkedListPage engineState={engineState} />
        )}

        {currentRoute === 'learn' && (
          <LearnPage />
        )}
      </main>

      <Footer
        onNavigate={(route) => {
          setCurrentRoute(route);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
