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
  height = 360,
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
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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

    // Scene & Isometric Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / sceneHeight, 0.1, 1000);
    camera.position.set(0, 28, 54);
    camera.lookAt(0, 1.5, 0);

    // Subtle Technical Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(15, 40, 25);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.1, 45);
    cyanLight.position.set(-22, 12, 15);
    scene.add(cyanLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 1.4, 45);
    emeraldLight.position.set(22, 12, 15);
    scene.add(emeraldLight);

    // Memory Bus Group
    const memoryGroup = new THREE.Group();
    scene.add(memoryGroup);

    // Build 3D Memory Blocks
    const totalPoolSize = stats.totalPoolSize || 100;
    const totalVisualWidth = 46;
    const startX = -totalVisualWidth / 2;

    const meshes: THREE.Mesh[] = [];
    const blockDataMap = new Map<THREE.Mesh, { block: Block; basePosition: THREE.Vector3 }>();

    blocks.forEach((block) => {
      const blockWidth = (block.size / totalPoolSize) * totalVisualWidth;
      const blockX = startX + ((block.startOffset + block.size / 2) / totalPoolSize) * totalVisualWidth;

      const geometry = new THREE.BoxGeometry(blockWidth * 0.93, 4.5, 7.5);

      let material: THREE.Material;
      if (block.isFree) {
        material = new THREE.MeshPhysicalMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.55,
          roughness: 0.25,
          transmission: 0.35,
          thickness: 0.4,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.08,
        });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.3,
          metalness: 0.12,
          emissive: 0x10b981,
          emissiveIntensity: 0.2,
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      const basePos = new THREE.Vector3(blockX, 2.25, 0);
      mesh.position.copy(basePos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Add high-contrast edge bevel wireframe
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: block.isFree ? 0x38bdf8 : 0x34d399,
        linewidth: 1.5,
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);

      memoryGroup.add(mesh);
      meshes.push(mesh);
      blockDataMap.set(mesh, { block, basePosition: basePos });
    });

    // Substrate Floor Grid
    const gridHelper = new THREE.GridHelper(totalVisualWidth + 14, 22, 0x1a263e, 0x0f1624);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHoveredMesh: THREE.Mesh | null = null;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        currentHoveredMesh = hitMesh;
        const entry = blockDataMap.get(hitMesh);
        if (entry) {
          setHoveredInfo(entry.block);
        }
      } else {
        currentHoveredMesh = null;
        setHoveredInfo(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Animation Loop with Tactile Hover Lift
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Subtle rotational sway
      if (isRotating) {
        memoryGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.35) * 0.08;
      }

      // Smoothly interpolate hover elevation on blocks
      meshes.forEach((mesh) => {
        const entry = blockDataMap.get(mesh);
        if (entry) {
          const targetY = (mesh === currentHoveredMesh) ? entry.basePosition.y + 0.8 : entry.basePosition.y;
          mesh.position.y += (targetY - mesh.position.y) * 0.15;
        }
      });

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
        className="instrument-card" 
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
        <Sparkles size={24} style={{ color: 'var(--mem-allocated)' }} />
        <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
          3D Interactive Mode (Paused)
        </h4>
        <p style={{ maxWidth: '480px', fontSize: '0.8125rem' }}>
          3D canvas is currently paused. The 2D proportional memory map provides full interactive block inspection.
        </p>
        <button className="btn btn-secondary" onClick={() => setFallback2D(false)}>
          <RotateCcw size={15} />
          <span>Resume 3D Scene</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="instrument-card"
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        overflow: 'hidden',
      }}
    >
      {/* 3D Canvas Mounting Node */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating HUD Controls */}
      <div 
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--glass-bg)' }}
          title={isRotating ? "Pause drift" : "Resume drift"}
        >
          <RotateCcw size={12} />
          <span>{isRotating ? 'Drift: On' : 'Drift: Off'}</span>
        </button>
        <button
          onClick={() => setFallback2D(true)}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--glass-bg)' }}
          title="Switch to 2D Mode"
        >
          <Eye size={12} />
          <span>2D Mode</span>
        </button>
      </div>

      {/* Hover Card Overlay */}
      {hoveredInfo && (
        <div 
          className="glass-floating animate-fade-in"
          style={{
            position: 'absolute',
            bottom: '0.875rem',
            left: '0.875rem',
            padding: '0.5rem 0.875rem',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <span className={`badge ${hoveredInfo.isFree ? 'badge-free' : 'badge-allocated'}`}>
            {hoveredInfo.isFree ? 'FREE BLOCK' : `ALLOCATION #${hoveredInfo.allocId}`}
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            Offset: 0x{hoveredInfo.startOffset.toString(16).toUpperCase().padStart(2, '0')} ({hoveredInfo.startOffset}u)
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
            Size: {hoveredInfo.size} units
          </span>
        </div>
      )}

      {/* Address Scale Baseline Indicator */}
      <div 
        style={{
          position: 'absolute',
          bottom: '0.625rem',
          right: '0.875rem',
          fontSize: '0.6875rem',
          fontFamily: 'JetBrains Mono',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      >
        ✦ Hover to elevate block • 0x00 to 0x{stats.totalPoolSize.toString(16).toUpperCase()}
      </div>
    </div>
  );
};
