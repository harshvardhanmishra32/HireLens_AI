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

interface NodeData {
  mesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  basePos: THREE.Vector3;
  type: "candidate" | "latent" | "job";
  label?: string;
}

interface ConnectionData {
  start: THREE.Vector3;
  end: THREE.Vector3;
  control1: THREE.Vector3;
  control2: THREE.Vector3;
  curve: THREE.CubicBezierCurve3;
}

export default function NeuralNetworkScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL] = useState<boolean>(() => isWebGLSupported());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasWebGL) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.06);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.8);

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
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(0x4d8dff, 3.5, 20);
    primaryLight.position.set(-3, 2, 4);
    scene.add(primaryLight);

    const cyanLight = new THREE.PointLight(0x76d7ff, 3.0, 20);
    cyanLight.position.set(3, -2, 4);
    scene.add(cyanLight);

    const emeraldLight = new THREE.PointLight(0x27c995, 2.5, 15);
    emeraldLight.position.set(0, 3, 2);
    scene.add(emeraldLight);

    // --- Group ---
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Geometries & Materials tracking for cleanup
    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

    // --- Node Definitions ---
    // Left: Candidate Skill Nodes (Cyan / Blue)
    const leftPositions: [number, number, number][] = [
      [-3.2, 2.1, 0.2],
      [-3.4, 1.0, -0.2],
      [-3.1, -0.1, 0.4],
      [-3.3, -1.2, -0.3],
      [-3.0, -2.2, 0.1],
    ];

    // Center: Latent Semantic Embedding Nodes
    const centerPositions: [number, number, number][] = [
      [-0.9, 1.5, 0.6],
      [-0.7, 0.2, -0.4],
      [-0.8, -1.3, 0.3],
      [0.8, 1.4, -0.3],
      [0.9, -0.1, 0.5],
      [0.7, -1.5, -0.2],
    ];

    // Right: Job Requirement Nodes (Emerald / Cyan)
    const rightPositions: [number, number, number][] = [
      [3.1, 2.0, -0.2],
      [3.3, 0.9, 0.3],
      [3.0, -0.2, -0.3],
      [3.4, -1.3, 0.2],
      [3.1, -2.1, -0.1],
    ];

    const nodes: NodeData[] = [];

    // Node Sphere Geometry
    const nodeGeo = new THREE.SphereGeometry(0.18, 24, 24);
    disposables.push(nodeGeo);

    const glowGeo = new THREE.SphereGeometry(0.24, 16, 16);
    disposables.push(glowGeo);

    function createNode(pos: [number, number, number], type: "candidate" | "latent" | "job") {
      const color = type === "candidate" ? 0x4d8dff : type === "job" ? 0x27c995 : 0x76d7ff;
      const emissive = type === "candidate" ? 0x3d7def : type === "job" ? 0x27c995 : 0x76d7ff;

      const mat = new THREE.MeshPhysicalMaterial({
        color,
        emissive,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.3,
        clearcoat: 1.0,
      });
      disposables.push(mat);

      const mesh = new THREE.Mesh(nodeGeo, mat);
      const positionVec = new THREE.Vector3(...pos);
      mesh.position.copy(positionVec);

      // Outer luminous halo
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28,
        wireframe: true,
      });
      disposables.push(glowMat);

      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(positionVec);

      networkGroup.add(mesh);
      networkGroup.add(glowMesh);

      nodes.push({
        mesh,
        glowMesh,
        basePos: positionVec.clone(),
        type,
      });
    }

    leftPositions.forEach((p) => createNode(p, "candidate"));
    centerPositions.forEach((p) => createNode(p, "latent"));
    rightPositions.forEach((p) => createNode(p, "job"));

    // --- Neural Pathways / Synaptic Curves ---
    const connections: ConnectionData[] = [];
    const lineGroup = new THREE.Group();
    networkGroup.add(lineGroup);

    // Connect Left (Candidates) to Center (Latent)
    leftPositions.forEach((lPos) => {
      centerPositions.forEach((cPos, cIdx) => {
        // Connect select high-probability semantic paths
        if (Math.random() > 0.45 || cIdx % 2 === 0) {
          const start = new THREE.Vector3(...lPos);
          const end = new THREE.Vector3(...cPos);
          const midX = (start.x + end.x) * 0.5;
          const control1 = new THREE.Vector3(midX, start.y + (Math.random() - 0.5) * 0.6, start.z);
          const control2 = new THREE.Vector3(midX, end.y + (Math.random() - 0.5) * 0.6, end.z);
          const curve = new THREE.CubicBezierCurve3(start, control1, control2, end);
          connections.push({ start, end, control1, control2, curve });

          const points = curve.getPoints(24);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          disposables.push(lineGeo);

          const lineMat = new THREE.LineBasicMaterial({
            color: 0x4d8dff,
            transparent: true,
            opacity: 0.22,
          });
          disposables.push(lineMat);

          const line = new THREE.Line(lineGeo, lineMat);
          lineGroup.add(line);
        }
      });
    });

    // Connect Center (Latent) to Right (Job Requirements)
    centerPositions.forEach((cPos) => {
      rightPositions.forEach((rPos, rIdx) => {
        if (Math.random() > 0.45 || rIdx % 2 === 0) {
          const start = new THREE.Vector3(...cPos);
          const end = new THREE.Vector3(...rPos);
          const midX = (start.x + end.x) * 0.5;
          const control1 = new THREE.Vector3(midX, start.y + (Math.random() - 0.5) * 0.6, start.z);
          const control2 = new THREE.Vector3(midX, end.y + (Math.random() - 0.5) * 0.6, end.z);
          const curve = new THREE.CubicBezierCurve3(start, control1, control2, end);
          connections.push({ start, end, control1, control2, curve });

          const points = curve.getPoints(24);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          disposables.push(lineGeo);

          const lineMat = new THREE.LineBasicMaterial({
            color: 0x27c995,
            transparent: true,
            opacity: 0.24,
          });
          disposables.push(lineMat);

          const line = new THREE.Line(lineGeo, lineMat);
          lineGroup.add(line);
        }
      });
    });

    // --- Traveling Data Packets (Pulsing Photons) ---
    const packetCount = 28;
    const packetGeo = new THREE.SphereGeometry(0.045, 12, 12);
    disposables.push(packetGeo);

    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x76d7ff,
      transparent: true,
      opacity: 0.95,
    });
    disposables.push(packetMat);

    interface Packet {
      mesh: THREE.Mesh;
      connectionIndex: number;
      progress: number;
      speed: number;
    }

    const packets: Packet[] = [];
    for (let i = 0; i < packetCount; i++) {
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      networkGroup.add(packetMesh);
      packets.push({
        mesh: packetMesh,
        connectionIndex: Math.floor(Math.random() * connections.length),
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
      });
    }

    // --- Ambient Floating Starfield Dust ---
    const dustCount = 350;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 16;
      dustPositions[i + 1] = (Math.random() - 0.5) * 12;
      dustPositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    disposables.push(dustGeo);

    const dustMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x76d7ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(dustMat);

    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // --- Interactive Mouse Parallax ---
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

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera parallax lerp
      if (!prefersReducedMotion) {
        targetRotationY = mouseX * 0.22;
        targetRotationX = -mouseY * 0.16;

        networkGroup.rotation.y += (targetRotationY - networkGroup.rotation.y) * 0.05;
        networkGroup.rotation.x += (targetRotationX - networkGroup.rotation.x) * 0.05;

        // Subtle floating organic breathing
        networkGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.08;

        // Animate nodes pulsation & subtle orbital drift
        nodes.forEach((node, i) => {
          const pulse = Math.sin(elapsedTime * 2.5 + i) * 0.08 + 1;
          node.glowMesh.scale.set(pulse, pulse, pulse);
          node.mesh.position.y = node.basePos.y + Math.sin(elapsedTime * 1.2 + i * 0.5) * 0.04;
          node.glowMesh.position.y = node.mesh.position.y;
        });

        // Advance traveling data packets
        packets.forEach((packet) => {
          packet.progress += packet.speed;
          if (packet.progress > 1) {
            packet.progress = 0;
            packet.connectionIndex = Math.floor(Math.random() * connections.length);
          }
          const conn = connections[packet.connectionIndex];
          if (conn) {
            const point = conn.curve.getPoint(packet.progress);
            packet.mesh.position.copy(point);
          }
        });

        // Dust rotation
        dust.rotation.y = elapsedTime * 0.02;
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
      <div className="w-full h-[400px] md:h-[480px] flex items-center justify-center p-6 border border-border/80 rounded-3xl bg-card/60 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
            HL
          </div>
          <h4 className="font-semibold text-foreground text-sm">Neural Network Alignment</h4>
          <p className="text-xs text-muted max-w-xs">
            Dynamic semantic embedding vectors matching candidate capabilities to requisition criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] sm:h-[480px] md:h-[540px] relative rounded-3xl overflow-hidden border border-border/60 bg-gradient-to-b from-card/80 to-background/90 backdrop-blur-xl shadow-2xl flex items-center justify-center"
      aria-label="3D Interactive Neural Network Representation"
    >
      {/* Node Legend Overlays */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[10px] text-muted font-mono">
        <span className="h-2 w-2 rounded-full bg-primary inline-block" />
        <span>Candidate Vectors</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[10px] text-muted font-mono">
        <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
        <span>Job Requisitions</span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[10px] text-accent font-mono flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
        <span>RapidFuzz + TF-IDF Active Synapses</span>
      </div>
    </div>
  );
}
