import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Block, Stats } from '../types';
import { Eye, RotateCcw, Sparkles, Navigation, Layers, Compass } from 'lucide-react';

interface MemoryScene3DProps {
  blocks: Block[];
  stats: Stats;
  height?: number;
  highlightOffset?: number | null;
  onSelectBlock?: (block: Block) => void;
}

export const MemoryScene3D: React.FC<MemoryScene3DProps> = ({
  blocks,
  stats,
  height = 370,
  highlightOffset,
  onSelectBlock,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<Block | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [fallback2D, setFallback2D] = useState(false);

  // Keep ref to highlightOffset so the animation loop always has the latest value
  const highlightOffsetRef = useRef<number | null>(highlightOffset ?? null);
  useEffect(() => {
    highlightOffsetRef.current = highlightOffset ?? null;
  }, [highlightOffset]);

  useEffect(() => {
    if (fallback2D) return;

    const container = mountRef.current;
    if (!container) return;

    // Clean up any existing canvas children if re-mounting
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth;
    const sceneHeight = height;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance' 
      });
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
    const camera = new THREE.PerspectiveCamera(36, width / sceneHeight, 0.1, 1000);
    const baseCamPos = new THREE.Vector3(0, 26, 52);
    camera.position.copy(baseCamPos);
    camera.lookAt(0, 1.5, 0);

    // Subtle Computational Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(16, 42, 26);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.2, 55);
    cyanLight.position.set(-24, 14, 18);
    scene.add(cyanLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 1.5, 55);
    emeraldLight.position.set(24, 14, 18);
    scene.add(emeraldLight);

    // Memory Bus Group
    const memoryGroup = new THREE.Group();
    scene.add(memoryGroup);

    // Build 3D Memory Blocks
    const totalPoolSize = stats.totalPoolSize || 100;
    const totalVisualWidth = 46;
    const startX = -totalVisualWidth / 2;

    const meshes: THREE.Mesh[] = [];
    const blockDataMap = new Map<THREE.Mesh, { 
      block: Block; 
      basePosition: THREE.Vector3;
      originalMat: THREE.Material;
      wireframe: THREE.LineSegments;
    }>();

    blocks.forEach((block) => {
      const blockWidth = (block.size / totalPoolSize) * totalVisualWidth;
      const blockX = startX + ((block.startOffset + block.size / 2) / totalPoolSize) * totalVisualWidth;

      const geometry = new THREE.BoxGeometry(Math.max(blockWidth * 0.94, 0.8), 4.5, 7.5);

      let material: THREE.MeshStandardMaterial;
      if (block.isFree) {
        material = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.65,
          roughness: 0.2,
          metalness: 0.1,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.1,
        });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.28,
          metalness: 0.15,
          emissive: 0x10b981,
          emissiveIntensity: 0.22,
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
      blockDataMap.set(mesh, { block, basePosition: basePos, originalMat: material, wireframe });
    });

    // Substrate Floor Grid with Bus Ticks
    const gridHelper = new THREE.GridHelper(totalVisualWidth + 14, 24, 0x22324f, 0x0d1522);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Mouse Interaction, Raycasting & Parallax Tilt
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseNormX = 0;
    let mouseNormY = 0;
    let currentHoveredMesh: THREE.Mesh | null = null;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNormX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNormY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.x = mouseNormX;
      mouse.y = mouseNormY;

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

    const handleClick = () => {
      if (currentHoveredMesh) {
        const entry = blockDataMap.get(currentHoveredMesh);
        if (entry) {
          setSelectedBlock(entry.block);
          if (onSelectBlock) onSelectBlock(entry.block);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation Loop with Parallax and Active Step Elevation
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse Parallax Cam Soft Lerp
      const targetCamX = baseCamPos.x + mouseNormX * 7;
      const targetCamY = baseCamPos.y + mouseNormY * 4;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, 1.5, 0);

      // Subtle rotational sway if toggled
      if (isRotating) {
        memoryGroup.rotation.y = Math.sin(elapsedTime * 0.35) * 0.07;
      }

      const activeHighlight = highlightOffsetRef.current;

      // Update block elevations and scan pulse
      meshes.forEach((mesh) => {
        const entry = blockDataMap.get(mesh);
        if (entry) {
          const isTargetTrace = activeHighlight !== null && entry.block.startOffset === activeHighlight;
          const isHovered = mesh === currentHoveredMesh;

          let targetY = entry.basePosition.y;
          if (isTargetTrace) {
            // High elevation and breathing pulse for active trace candidate
            targetY = entry.basePosition.y + 1.2 + Math.sin(elapsedTime * 6) * 0.2;
          } else if (isHovered) {
            targetY = entry.basePosition.y + 0.8;
          }

          mesh.position.y += (targetY - mesh.position.y) * 0.18;

          // Dynamically adjust emissive intensity on active step
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (isTargetTrace) {
            mat.emissive.setHex(0xf59e0b); // Golden amber scan glow
            mat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 8) * 0.25;
          } else if (isHovered) {
            mat.emissive.setHex(entry.block.isFree ? 0x06b6d4 : 0x10b981);
            mat.emissiveIntensity = 0.4;
          } else {
            mat.emissive.setHex(entry.block.isFree ? 0x06b6d4 : 0x10b981);
            mat.emissiveIntensity = entry.block.isFree ? 0.1 : 0.22;
          }
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      meshes.forEach(m => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
        else m.material.dispose();
      });
    };
  }, [blocks, stats, height, isRotating, fallback2D, onSelectBlock]);

  return (
    <div className="instrument-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* 3D Canvas Mount Point */}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: `${height}px`, 
          cursor: hoveredInfo ? 'pointer' : 'default',
          touchAction: 'none',
        }}
      />

      {/* Floating Instrument Overlay Controls */}
      <div 
        style={{
          position: 'absolute',
          top: '0.875rem',
          right: '0.875rem',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.6875rem' }}
          title={isRotating ? 'Pause subtle drift rotation' : 'Resume subtle drift rotation'}
        >
          <RotateCcw size={12} />
          <span>Drift: {isRotating ? 'On' : 'Off'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFallback2D(!fallback2D)}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.6875rem' }}
          title="Toggle 2D fallback mode"
        >
          <Eye size={12} />
          <span>{fallback2D ? '3D View' : '2D Mode'}</span>
        </button>
      </div>

      {/* Active Inspect Telemetry HUD */}
      {(hoveredInfo || selectedBlock) && (
        <div 
          className="glass-floating animate-fade-in"
          style={{
            position: 'absolute',
            bottom: '0.875rem',
            left: '0.875rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: (hoveredInfo || selectedBlock)?.isFree ? 'var(--mem-free)' : 'var(--mem-allocated)',
              }}
            />
            <strong style={{ color: 'var(--text-primary)' }}>
              {(hoveredInfo || selectedBlock)?.isFree ? 'FREE BLOCK' : `ALLOCATED (ID #${(hoveredInfo || selectedBlock)?.allocId})`}
            </strong>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>
            Offset: 0x{(hoveredInfo || selectedBlock)?.startOffset.toString(16).padStart(2, '0').toUpperCase()}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Size: {(hoveredInfo || selectedBlock)?.size} units
          </span>
        </div>
      )}

      {/* Bottom Hint */}
      <div 
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.875rem',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono',
          pointerEvents: 'none',
        }}
      >
        ✦ Mouse parallax active · Click block to inspect
      </div>
    </div>
  );
};
