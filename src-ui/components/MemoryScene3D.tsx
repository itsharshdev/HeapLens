import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Block, Stats } from '../types';
import { Eye, RotateCcw, Sparkles } from 'lucide-react';

interface MemoryScene3DProps {
  blocks: Block[];
  stats: Stats;
  height?: number;
}

export const MemoryScene3D: React.FC<MemoryScene3DProps> = ({
  blocks,
  stats,
  height = 340,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<Block | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [fallback2D, setFallback2D] = useState(false);

  useEffect(() => {
    if (fallback2D) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const sceneHeight = height;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, sceneHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[HeapLens 3D] WebGL not supported. Falling back to 2D.');
      setFallback2D(true);
      return;
    }

    // Scene and Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / sceneHeight, 0.1, 1000);
    camera.position.set(0, 32, 58);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(20, 45, 30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 1.2, 50);
    cyanPoint.position.set(-20, 10, 10);
    scene.add(cyanPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 1.5, 50);
    emeraldPoint.position.set(20, 10, 10);
    scene.add(emeraldPoint);

    // Group for all blocks
    const memoryGroup = new THREE.Group();
    scene.add(memoryGroup);

    // Build 3D Memory Blocks
    const totalPoolSize = stats.totalPoolSize || 100;
    const totalVisualWidth = 50; // total 3D scene length
    const startX = -totalVisualWidth / 2;

    const meshes: THREE.Mesh[] = [];
    const blockDataMap = new Map<THREE.Mesh, Block>();

    blocks.forEach((block) => {
      const blockWidth = (block.size / totalPoolSize) * totalVisualWidth;
      const blockX = startX + ((block.startOffset + block.size / 2) / totalPoolSize) * totalVisualWidth;

      const geometry = new THREE.BoxGeometry(blockWidth * 0.94, 5, 8);

      let material: THREE.Material;
      if (block.isFree) {
        material = new THREE.MeshPhysicalMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.6,
          roughness: 0.2,
          transmission: 0.4,
          thickness: 0.5,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.1,
        });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.3,
          metalness: 0.15,
          emissive: 0x10b981,
          emissiveIntensity: 0.25,
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(blockX, 2.5, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Add edge lines for high-precision technical look
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: block.isFree ? 0x38bdf8 : 0x34d399,
        linewidth: 1.5,
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);

      memoryGroup.add(mesh);
      meshes.push(mesh);
      blockDataMap.set(mesh, block);
    });

    // Substrate Grid Floor
    const gridHelper = new THREE.GridHelper(totalVisualWidth + 12, 20, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const block = blockDataMap.get(hitMesh);
        if (block) {
          setHoveredInfo(block);
        }
      } else {
        setHoveredInfo(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating) {
        memoryGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.45) * 0.12;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / sceneHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, sceneHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);

      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });

      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [blocks, stats, height, isRotating, fallback2D]);

  if (fallback2D) {
    return (
      <div 
        className="glass-panel" 
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <Sparkles size={28} style={{ color: 'var(--mem-allocated)' }} />
        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
          3D Interactive Visualizer Mode
        </h4>
        <p style={{ maxWidth: '500px', fontSize: '0.875rem' }}>
          3D rendering mode is currently in 2D fallback. The 2D proportional memory map below provides full interactive block inspection.
        </p>
        <button className="btn btn-secondary" onClick={() => setFallback2D(false)}>
          <RotateCcw size={16} />
          <span>Attempt 3D Scene Initialization</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="glass-panel"
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* 3D Canvas Mounting Node */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating HUD Controls */}
      <div 
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--glass-bg)' }}
          title={isRotating ? "Pause subtle drift" : "Resume subtle drift"}
        >
          <RotateCcw size={13} />
          <span>{isRotating ? 'Drift: On' : 'Drift: Paused'}</span>
        </button>
        <button
          onClick={() => setFallback2D(true)}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--glass-bg)' }}
          title="Switch to 2D Mode"
        >
          <Eye size={13} />
          <span>2D Mode</span>
        </button>
      </div>

      {/* Hover Card Overlay */}
      {hoveredInfo && (
        <div 
          className="glass-panel animate-fade-in"
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            padding: '0.625rem 1rem',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <span className={`badge ${hoveredInfo.isFree ? 'badge-free' : 'badge-allocated'}`}>
            {hoveredInfo.isFree ? 'FREE BLOCK' : `ALLOCATION #${hoveredInfo.allocId}`}
          </span>
          <span style={{ fontSize: '0.8125rem', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            Offset: 0x{hoveredInfo.startOffset.toString(16).toUpperCase().padStart(2, '0')} ({hoveredInfo.startOffset}u)
          </span>
          <span style={{ fontSize: '0.8125rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
            Size: {hoveredInfo.size} units
          </span>
        </div>
      )}

      {/* Bottom Hint */}
      <div 
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '1rem',
          fontSize: '0.6875rem',
          fontFamily: 'JetBrains Mono',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      >
        ✦ Drag or move cursor to inspect memory blocks in 3D
      </div>
    </div>
  );
};
