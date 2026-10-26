import React, { useState } from 'react';
import { AppRoute, ThemeMode } from '../types';
import { 
  Cpu, 
  Terminal, 
  Sun, 
  Moon, 
  Layers, 
  Play, 
  BookOpen, 
  LayoutDashboard, 
  Menu, 
  X,
  CircleDot
} from 'lucide-react';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isEngineConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  theme,
  onThemeChange,
  isEngineConnected,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { route: AppRoute; label: string; icon: React.ReactNode }[] = [
    { route: 'home', label: 'Overview', icon: <Layers size={15} /> },
    { route: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { route: 'playground', label: 'Playground', icon: <Play size={15} /> },
    { route: 'linked-list', label: 'Linked List', icon: <Cpu size={15} /> },
    { route: 'learn', label: 'How Memory Works', icon: <BookOpen size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full" style={{ padding: '0.625rem 1rem' }}>
      <nav 
        className="container glass-floating"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.125rem',
          minHeight: '3.75rem',
        }}
      >
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          {/* Custom SVG Memory-Hexagon Logo */}
          <svg width="30" height="30" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
            <polygon points="16,2 29,9.5 29,24.5 16,32 3,24.5 3,9.5" fill="var(--color-surface)" stroke="var(--mem-allocated)" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="17" stroke="var(--mem-free)" strokeWidth="1.5" />
            <line x1="16" y1="17" x2="29" y2="24.5" stroke="var(--mem-free)" strokeWidth="1.5" />
            <line x1="16" y1="17" x2="3" y2="24.5" stroke="var(--mem-free)" strokeWidth="1.5" />
            <rect x="11.5" y="12.5" width="9" height="9" rx="1.5" fill="var(--mem-allocated)" fillOpacity="0.9" />
          </svg>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.1875rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Heap<span style={{ color: 'var(--mem-allocated)' }}>Lens</span>
              </span>
              <span className="badge badge-free" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
                C++17
              </span>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.02em' }}>
              Allocator Lab
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className="btn btn-secondary"
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8125rem',
                  background: isActive ? 'var(--mem-allocated-bg)' : 'transparent',
                  borderColor: isActive ? 'var(--mem-allocated-border)' : 'transparent',
                  color: isActive ? 'var(--mem-allocated)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section: Engine Status & Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Engine Status Badge */}
          <div 
            title={isEngineConnected ? "Connected to live C++ engine process" : "Bridge server offline. Showing preview data."}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.6875rem',
              fontFamily: 'JetBrains Mono',
              fontWeight: 600,
              background: isEngineConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: isEngineConnected ? 'var(--mem-allocated)' : 'var(--mem-fragmented)',
              border: `1px solid ${isEngineConnected ? 'var(--mem-allocated-border)' : 'rgba(245, 158, 11, 0.25)'}`,
            }}
          >
            <CircleDot size={11} className={isEngineConnected ? 'animate-pulse' : ''} />
            <span style={{ display: 'none' }} className="status-text">
              {isEngineConnected ? 'C++ Live' : 'Preview'}
            </span>
          </div>

          {/* Theme Selector Controls */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.375rem',
              padding: '0.15rem',
              gap: '0.1rem'
            }}
          >
            <button
              onClick={() => onThemeChange('dark')}
              title="Dark Mode (Obsidian)"
              aria-label="Dark Mode"
              style={{
                background: theme === 'dark' ? 'var(--color-surface-elevated)' : 'transparent',
                color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.3rem',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => onThemeChange('light')}
              title="Light Mode (Laboratory)"
              aria-label="Light Mode"
              style={{
                background: theme === 'light' ? 'var(--color-surface-elevated)' : 'transparent',
                color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.3rem',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => onThemeChange('lab')}
              title="HeapLens Lab Mode (Phosphor Terminal)"
              aria-label="HeapLens Lab Mode"
              style={{
                background: theme === 'lab' ? 'var(--color-surface-elevated)' : 'transparent',
                color: theme === 'lab' ? 'var(--mem-allocated)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.3rem',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <Terminal size={14} />
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle btn btn-secondary"
            style={{ padding: '0.4rem', display: 'flex' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="instrument-card"
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  width: '100%',
                  background: isActive ? 'var(--mem-allocated-bg)' : 'transparent',
                  borderColor: isActive ? 'var(--mem-allocated-border)' : 'transparent',
                  color: isActive ? 'var(--mem-allocated)' : 'var(--text-primary)',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive media style */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .status-text { display: inline !important; }
        }
      `}</style>
    </header>
  );
};
