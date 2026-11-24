"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function ResumeHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL] = useState<boolean>(() => isWebGLSupported());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasWebGL) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const primaryLight = new THREE.DirectionalLight(0x4d8dff, 3.5);
    primaryLight.position.set(4, 5, 6);
    scene.add(primaryLight);

    const cyanRimLight = new THREE.PointLight(0x76d7ff, 3.0, 15);
    cyanRimLight.position.set(-4, -3, 3);
    scene.add(cyanRimLight);

    const deepPurpleBacklight = new THREE.PointLight(0x27c995, 1.8, 12);
    deepPurpleBacklight.position.set(0, -4, -2);
    scene.add(deepPurpleBacklight);

    // --- Master 3D Group ---
    const documentGroup = new THREE.Group();
    scene.add(documentGroup);

    // 1. Base Glass Document
    const baseWidth = 3.2;
    const baseHeight = 4.4;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, 0.08);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f1b2d,
      transparent: true,
      opacity: 0.88,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.45,
      ior: 1.5,
      reflectivity: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, glassMat);
    documentGroup.add(baseMesh);

    // Luminous Document Border Wire
    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x4d8dff,
      transparent: true,
      opacity: 0.75,
      linewidth: 1,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    documentGroup.add(edgeLines);

    // 2. Floating Document Sub-Layers (Layered Peeling Effect)
    // Layer A: Profile / Header Block
    const headerGeo = new THREE.BoxGeometry(2.8, 0.65, 0.04);
    const headerMat = new THREE.MeshStandardMaterial({
      color: 0x16253d,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x4d8dff,
      emissiveIntensity: 0.08,
    });
    const headerMesh = new THREE.Mesh(headerGeo, headerMat);
    headerMesh.position.set(0, 1.5, 0.08);
    documentGroup.add(headerMesh);

    // Layer B: Experience Blocks (Staggered floating planes)
    for (let i = 0; i < 3; i++) {
      const expGeo = new THREE.BoxGeometry(2.8, 0.45, 0.03);
      const expMat = new THREE.MeshStandardMaterial({
        color: 0x111c2e,
        roughness: 0.4,
        metalness: 0.1,
      });
      const expMesh = new THREE.Mesh(expGeo, expMat);
      expMesh.position.set(0, 0.8 - i * 0.65, 0.07 + i * 0.02);
      documentGroup.add(expMesh);
    }

    // Layer C: Extracted Skill Chips (Floating Luminescent Lozenges)
    const skillChips: THREE.Mesh[] = [];
    const chipPositions = [
      [-0.9, -1.3, 0.14],
      [0, -1.3, 0.18],
      [0.9, -1.3, 0.14],
      [-0.5, -1.75, 0.16],
      [0.5, -1.75, 0.15],
    ];

    chipPositions.forEach((pos, idx) => {
      const chipGeo = new THREE.BoxGeometry(0.75, 0.24, 0.04);
      const chipMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x27c995 : 0x4d8dff,
        emissive: idx % 2 === 0 ? 0x27c995 : 0x76d7ff,
        emissiveIntensity: 0.35,
        roughness: 0.2,
      });
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(pos[0], pos[1], pos[2]);
      documentGroup.add(chip);
      skillChips.push(chip);
    });

    // 3. Neural Network Connecting Nodes (Data Graph Overlay)
    const nodeCount = 14;
    const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x76d7ff });
    const nodes: THREE.Vector3[] = [];
    const nodeMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 3.8;
      const y = (Math.random() - 0.5) * 4.6;
      const z = (Math.random() - 0.2) * 1.5;
      const pos = new THREE.Vector3(x, y, z);
      nodes.push(pos);

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      documentGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    }

    // Interconnecting Neural Filaments
    const linePositions: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.6) {
          linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMeshMat = new THREE.LineBasicMaterial({
      color: 0x4d8dff,
      transparent: true,
      opacity: 0.3,
    });
    const neuralLines = new THREE.LineSegments(lineGeo, lineMeshMat);
    documentGroup.add(neuralLines);

    // 4. Ambient Data Particle Field (Space Environment)
    const particleCount = 650;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 18;
      particlePositions[i + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
      particleScales[i / 3] = Math.random() * 0.04 + 0.01;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x76d7ff,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Interactive Mouse Parallax ---
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.35;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Initial orientation
    documentGroup.rotation.y = -0.22;
    documentGroup.rotation.x = 0.12;

    // --- Animation Render Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Subtle floating breathing motion
        documentGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;

        // Smooth mouse damping (lerp)
        documentGroup.rotation.y += (targetX - documentGroup.rotation.y) * 0.05;
        documentGroup.rotation.x += (targetY - documentGroup.rotation.x) * 0.05;

        // Pulse chip layers
        skillChips.forEach((chip, i) => {
          chip.position.z = chipPositions[i][2] + Math.sin(elapsedTime * 2 + i) * 0.03;
        });

        // Rotate particles slowly
        particles.rotation.y = elapsedTime * 0.03;
        particles.rotation.x = elapsedTime * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Resource Disposal Cleanup ---
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      baseGeo.dispose();
      glassMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      headerGeo.dispose();
      headerMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMeshMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hasWebGL]);

  return (
    <div className="relative w-full h-[540px] md:h-[660px] flex items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        aria-hidden="true"
      />

      {/* Fallback Display if WebGL is unsupported */}
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div className="w-80 h-96 rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-xl p-6 shadow-2xl flex flex-col justify-between">
            <div className="h-6 w-32 bg-primary/20 rounded" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-secondary rounded" />
              <div className="h-4 w-3/4 bg-secondary rounded" />
              <div className="h-4 w-5/6 bg-secondary rounded" />
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">React 19</span>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono">PyTorch</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
