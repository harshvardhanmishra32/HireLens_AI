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

export default function FraudShieldScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL] = useState<boolean>(() => isWebGLSupported());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasWebGL) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.2);

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
      renderer.toneMappingExposure = 1.3;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const securityCyanLight = new THREE.DirectionalLight(0x76d7ff, 3.2);
    securityCyanLight.position.set(3, 4, 5);
    scene.add(securityCyanLight);

    const ultravioletLight = new THREE.PointLight(0x9d4edd, 3.5, 16);
    ultravioletLight.position.set(-3, -2, 4);
    scene.add(ultravioletLight);

    const redWarningLight = new THREE.PointLight(0xf06464, 2.0, 10);
    redWarningLight.position.set(0, -1, 3);
    scene.add(redWarningLight);

    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // --- 1. Custom Extruded Shield Geometry ---
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 2.2);
    shieldShape.quadraticCurveTo(1.6, 2.0, 1.8, 0.5);
    shieldShape.quadraticCurveTo(1.7, -1.2, 0, -2.4);
    shieldShape.quadraticCurveTo(-1.7, -1.2, -1.8, 0.5);
    shieldShape.quadraticCurveTo(-1.6, 2.0, 0, 2.2);

    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    disposables.push(shieldGeo);

    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e2038,
      emissive: 0x4d8dff,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.72,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    disposables.push(shieldMat);

    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.set(0, 0, 0.4);
    masterGroup.add(shieldMesh);

    // Shield Wireframe Luminous Edge
    const shieldEdgeGeo = new THREE.EdgesGeometry(shieldGeo);
    disposables.push(shieldEdgeGeo);

    const shieldEdgeMat = new THREE.LineBasicMaterial({
      color: 0x76d7ff,
      transparent: true,
      opacity: 0.75,
      linewidth: 1,
    });
    disposables.push(shieldEdgeMat);

    const shieldEdgeMesh = new THREE.LineSegments(shieldEdgeGeo, shieldEdgeMat);
    shieldMesh.add(shieldEdgeMesh);

    // --- 2. Translucent Resume Document Suspended Behind Shield ---
    const docWidth = 2.4;
    const docHeight = 3.3;
    const docGeo = new THREE.BoxGeometry(docWidth, docHeight, 0.04);
    disposables.push(docGeo);

    const docMat = new THREE.MeshPhysicalMaterial({
      color: 0x091424,
      emissive: 0x1d3557,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      transmission: 0.35,
    });
    disposables.push(docMat);

    const docMesh = new THREE.Mesh(docGeo, docMat);
    docMesh.position.set(0, 0, -0.4);
    masterGroup.add(docMesh);

    const docEdgeGeo = new THREE.EdgesGeometry(docGeo);
    disposables.push(docEdgeGeo);

    const docEdgeMat = new THREE.LineBasicMaterial({
      color: 0x4d8dff,
      transparent: true,
      opacity: 0.45,
    });
    disposables.push(docEdgeMat);

    const docEdgeMesh = new THREE.LineSegments(docEdgeGeo, docEdgeMat);
    docMesh.add(docEdgeMesh);

    // Document Text Line Placeholders
    for (let i = 0; i < 7; i++) {
      const lineGeo = new THREE.BoxGeometry(1.9, 0.08, 0.01);
      disposables.push(lineGeo);

      const isAnomalyLine = i === 4; // White-text trap anomaly
      const lineMat = new THREE.MeshBasicMaterial({
        color: isAnomalyLine ? 0xf06464 : 0x3d5a80,
        transparent: true,
        opacity: isAnomalyLine ? 0.95 : 0.45,
      });
      disposables.push(lineMat);

      const textLineMesh = new THREE.Mesh(lineGeo, lineMat);
      textLineMesh.position.set(0, 1.1 - i * 0.35, 0.03);
      docMesh.add(textLineMesh);
    }

    // --- 3. Animated Ultraviolet Laser Scanning Beam ---
    const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.4, 16);
    disposables.push(beamGeo);

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x76d7ff,
      transparent: true,
      opacity: 0.9,
    });
    disposables.push(beamMat);

    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.z = Math.PI / 2;
    beamMesh.position.set(0, 0, -0.15);
    masterGroup.add(beamMesh);

    // Laser Light Sheet
    const sheetGeo = new THREE.PlaneGeometry(3.4, 0.4);
    disposables.push(sheetGeo);

    const sheetMat = new THREE.MeshBasicMaterial({
      color: 0x4d8dff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    disposables.push(sheetMat);

    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    beamMesh.add(sheetMesh);

    // --- 4. Anomaly Warning Ring Target on Intercepted Trap ---
    const pingGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    disposables.push(pingGeo);

    const pingMat = new THREE.MeshBasicMaterial({
      color: 0xf06464,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    disposables.push(pingMat);

    const pingMesh = new THREE.Mesh(pingGeo, pingMat);
    pingMesh.position.set(0.4, 1.1 - 4 * 0.35, 0.05);
    docMesh.add(pingMesh);

    // --- 5. Orbiting Cybersecurity Scanner Rings ---
    const ringGeo = new THREE.TorusGeometry(2.8, 0.015, 12, 64);
    disposables.push(ringGeo);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4d8dff,
      transparent: true,
      opacity: 0.3,
    });
    disposables.push(ringMat);

    const radarRing = new THREE.Mesh(ringGeo, ringMat);
    radarRing.rotation.x = Math.PI / 2.4;
    masterGroup.add(radarRing);

    // --- 6. Ambient Particle Sparkles ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    disposables.push(particleGeo);

    const particleMat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x76d7ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(particleMat);

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Mouse Parallax ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // --- Resize ---
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // --- Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        targetRotationY = mouseX * 0.25;
        targetRotationX = -mouseY * 0.18;

        masterGroup.rotation.y += (targetRotationY - masterGroup.rotation.y) * 0.05;
        masterGroup.rotation.x += (targetRotationX - masterGroup.rotation.x) * 0.05;

        // Floating Shield Breath
        masterGroup.position.y = Math.sin(elapsedTime * 0.9) * 0.1;

        // Laser scan oscillating vertically up and down
        const scanY = Math.sin(elapsedTime * 2.2) * 1.5;
        beamMesh.position.y = scanY;

        // Radar ring slow orbit
        radarRing.rotation.z = elapsedTime * 0.25;

        // Anomaly ping expansion
        const pingScale = 1 + Math.sin(elapsedTime * 4.0) * 0.25;
        pingMesh.scale.set(pingScale, pingScale, 1);

        // Ambient particles
        particles.rotation.y = elapsedTime * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      disposables.forEach((item) => item.dispose());

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [hasWebGL]);

  if (!hasWebGL) {
    return (
      <div className="w-full h-[360px] md:h-[440px] flex items-center justify-center p-6 border border-border/80 rounded-3xl bg-card/60 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center font-bold">
            SHIELD
          </div>
          <h4 className="font-semibold text-foreground text-sm">Resume Fraud Interception</h4>
          <p className="text-xs text-muted max-w-xs">
            Automated deep stream color inspections for white-text traps and micro-font keyword injections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[360px] sm:h-[440px] md:h-[500px] relative rounded-3xl overflow-hidden border border-border/60 bg-gradient-to-b from-card/80 to-background/90 backdrop-blur-xl shadow-2xl flex items-center justify-center"
      aria-label="3D Interactive Fraud Detection Shield"
    >
      {/* HUD Telemetry Badges */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[10px] text-muted font-mono">
        <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
        <span>Hex Color Scanner: #FFFFFF Intercept</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[10px] text-accent font-mono">
        <span>PyMuPDF Stream Vector Scan</span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[10px] text-muted font-mono flex items-center gap-2">
        <span className="text-emerald-400 font-bold">VERIFIED</span>
        <span className="text-border">|</span>
        <span>Human Recruiter Review Gate</span>
      </div>
    </div>
  );
}
