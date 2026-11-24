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

// Helper to generate crisp canvas texture for 3D Profile Cards
function createProfileCardTexture(name: string, role: string, company: string, badge: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 512, 320);
  gradient.addColorStop(0, "#111C2E");
  gradient.addColorStop(1, "#070B14");
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, 512, 320, 28);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(77, 141, 255, 0.4)";
  ctx.lineWidth = 4;
  ctx.roundRect(2, 2, 508, 316, 26);
  ctx.stroke();

  // Avatar Circle
  ctx.beginPath();
  ctx.arc(72, 80, 42, 0, Math.PI * 2);
  const avatarGrad = ctx.createLinearGradient(30, 38, 114, 122);
  avatarGrad.addColorStop(0, "#4D8DFF");
  avatarGrad.addColorStop(1, "#76D7FF");
  ctx.fillStyle = avatarGrad;
  ctx.fill();

  // Avatar Initials
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const initials = name.split(" ").map(n => n[0]).join("");
  ctx.fillText(initials, 72, 82);

  // Name
  ctx.textAlign = "left";
  ctx.font = "bold 30px sans-serif";
  ctx.fillStyle = "#F5F7FB";
  ctx.fillText(name, 134, 70);

  // Role
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#76D7FF";
  ctx.fillText(role, 134, 102);

  // Company
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#8995A8";
  ctx.fillText(company, 134, 130);

  // Divider line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 160);
  ctx.lineTo(480, 160);
  ctx.stroke();

  // Status Badge
  ctx.fillStyle = "rgba(39, 201, 149, 0.15)";
  ctx.roundRect(32, 185, 200, 40, 20);
  ctx.fill();
  ctx.fillStyle = "#27C995";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("✓ " + badge, 52, 210);

  // Connections Count
  ctx.fillStyle = "#8995A8";
  ctx.font = "16px sans-serif";
  ctx.fillText("500+ Connections", 32, 270);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Helper to generate crisp canvas texture for 3D Post Panels
function createPostCardTexture(author: string, content: string, likes: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Card Background
  const gradient = ctx.createLinearGradient(0, 0, 512, 360);
  gradient.addColorStop(0, "#0D1422");
  gradient.addColorStop(1, "#111C2E");
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, 512, 360, 28);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(118, 215, 255, 0.35)";
  ctx.lineWidth = 4;
  ctx.roundRect(2, 2, 508, 356, 26);
  ctx.stroke();

  // Author Avatar
  ctx.beginPath();
  ctx.arc(60, 60, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#9D4EDD";
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(author[0], 60, 67);

  // Author Name
  ctx.textAlign = "left";
  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = "#F5F7FB";
  ctx.fillText(author, 102, 54);

  // Timestamp
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#8995A8";
  ctx.fillText("Posted 2h ago • Professional Network", 102, 78);

  // Content lines
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#E2E8F0";
  const words = content.split(" ");
  let line = "";
  let y = 140;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 440 && n > 0) {
      ctx.fillText(line, 36, y);
      line = words[n] + " ";
      y += 32;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 36, y);

  // Bottom Stats
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 280);
  ctx.lineTo(480, 280);
  ctx.stroke();

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#4D8DFF";
  ctx.fillText("👍 💡 ❤️ " + likes, 36, 320);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Helper to generate crisp canvas texture for 3D Job Panels
function createJobCardTexture(title: string, company: string, salary: string, location: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#0A111F";
  ctx.roundRect(0, 0, 512, 300, 24);
  ctx.fill();

  ctx.strokeStyle = "rgba(39, 201, 149, 0.4)";
  ctx.lineWidth = 3;
  ctx.roundRect(2, 2, 508, 296, 22);
  ctx.stroke();

  // Company logo box
  ctx.fillStyle = "#16253D";
  ctx.roundRect(32, 32, 60, 60, 14);
  ctx.fill();
  ctx.fillStyle = "#4D8DFF";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(company.slice(0, 2).toUpperCase(), 62, 70);

  ctx.textAlign = "left";
  ctx.fillStyle = "#F5F7FB";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(title, 108, 58);

  ctx.fillStyle = "#8995A8";
  ctx.font = "18px sans-serif";
  ctx.fillText(company + " • " + location, 108, 86);

  ctx.fillStyle = "#27C995";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(salary, 32, 160);

  ctx.fillStyle = "rgba(77, 141, 255, 0.15)";
  ctx.roundRect(32, 200, 160, 36, 18);
  ctx.fill();
  ctx.fillStyle = "#76D7FF";
  ctx.font = "15px sans-serif";
  ctx.fillText("Easy Apply Available", 48, 224);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function CinematicScrollUniverse({
  scrollProgress = 0,
}: {
  scrollProgress?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL] = useState<boolean>(() => isWebGLSupported());
  const progressRef = useRef(scrollProgress);

  // Keep progressRef updated for RAF loop
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasWebGL) return;

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.022);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 14);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

    // --- Dynamic Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0x0e1728, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x4d8dff, 3.5);
    mainLight.position.set(6, 10, 15);
    scene.add(mainLight);

    const cyanPointLight = new THREE.PointLight(0x76d7ff, 3.0, 40);
    cyanPointLight.position.set(-6, -4, 5);
    scene.add(cyanPointLight);

    const violetPointLight = new THREE.PointLight(0x9d4edd, 3.5, 45);
    violetPointLight.position.set(0, 4, -15);
    scene.add(violetPointLight);

    const emeraldPointLight = new THREE.PointLight(0x27c995, 3.0, 40);
    emeraldPointLight.position.set(4, -2, -30);
    scene.add(emeraldPointLight);

    // =========================================================================
    // SCENE 01 — THE DIGITAL UNIVERSE (Instanced Sphere & Orbital Rings)
    // =========================================================================
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    const nodeCount = isMobile ? 350 : isTablet ? 700 : 1200;
    const sphereRadius = 4.8;
    const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    disposables.push(nodeGeo);

    const nodeMat = new THREE.MeshPhysicalMaterial({
      color: 0x4d8dff,
      emissive: 0x76d7ff,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    disposables.push(nodeMat);

    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    const dummy = new THREE.Object3D();
    const nodeBasePositions: THREE.Vector3[] = [];

    // Golden spiral distribution on sphere
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY * sphereRadius;
      const z = Math.sin(theta) * radiusAtY * sphereRadius;
      const pos = new THREE.Vector3(x, y * sphereRadius, z);
      nodeBasePositions.push(pos.clone());

      dummy.position.copy(pos);
      dummy.scale.setScalar(0.7 + Math.random() * 0.6);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;
    universeGroup.add(instancedNodes);

    // Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(5.8, 0.02, 16, 100);
    disposables.push(ringGeo1);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x4d8dff, transparent: true, opacity: 0.45 });
    disposables.push(ringMat1);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    universeGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(6.6, 0.015, 16, 100);
    disposables.push(ringGeo2);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.35 });
    disposables.push(ringMat2);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 5;
    universeGroup.add(ring2);

    // =========================================================================
    // SCENE 02 — CONNECT (Interconnected Synaptic Web)
    // =========================================================================
    const connectGroup = new THREE.Group();
    connectGroup.position.set(0, 0, -6);
    scene.add(connectGroup);

    const connectNodeCount = isMobile ? 24 : 45;
    const connectNodes: THREE.Mesh[] = [];
    const connectNodePositions: THREE.Vector3[] = [];

    const cNodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    disposables.push(cNodeGeo);

    for (let i = 0; i < connectNodeCount; i++) {
      const cMat = new THREE.MeshPhysicalMaterial({
        color: i % 2 === 0 ? 0x76d7ff : 0x9d4edd,
        emissive: i % 2 === 0 ? 0x4d8dff : 0x76d7ff,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      disposables.push(cMat);

      const mesh = new THREE.Mesh(cNodeGeo, cMat);
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
      mesh.position.copy(pos);
      connectNodePositions.push(pos);
      connectNodes.push(mesh);
      connectGroup.add(mesh);
    }

    // Dynamic Connection Lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4d8dff,
      transparent: true,
      opacity: 0.3,
    });
    disposables.push(lineMat);

    const lineGroup = new THREE.Group();
    connectGroup.add(lineGroup);

    for (let i = 0; i < connectNodeCount; i++) {
      for (let j = i + 1; j < connectNodeCount; j++) {
        if (connectNodePositions[i].distanceTo(connectNodePositions[j]) < 3.2) {
          const lGeo = new THREE.BufferGeometry().setFromPoints([
            connectNodePositions[i],
            connectNodePositions[j],
          ]);
          disposables.push(lGeo);
          const line = new THREE.Line(lGeo, lineMat);
          lineGroup.add(line);
        }
      }
    }

    // =========================================================================
    // SCENE 03 — DISCOVER PROFESSIONALS (Floating 3D Profile Cards)
    // =========================================================================
    const profilesGroup = new THREE.Group();
    profilesGroup.position.set(0, 0, -12);
    scene.add(profilesGroup);

    const profileData = [
      { name: "Elena Rostova", role: "Principal AI Architect", company: "DeepMind", badge: "Verified Leader" },
      { name: "Marcus Vance", role: "Head of Infrastructure", company: "Stripe", badge: "Top Recruiter" },
      { name: "Sophia Chen", role: "Staff Frontend Engineer", company: "Linear", badge: "Open to Connect" },
      { name: "David Kim", role: "VP of Product", company: "HireLens AI", badge: "Hiring Now" },
    ];

    const profileCardMeshes: THREE.Mesh[] = [];
    const cardGeo = new THREE.BoxGeometry(2.4, 1.5, 0.05);
    disposables.push(cardGeo);

    profileData.forEach((p, idx) => {
      const cardTex = createProfileCardTexture(p.name, p.role, p.company, p.badge);
      disposables.push(cardTex);

      const cardMat = new THREE.MeshStandardMaterial({
        map: cardTex,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
      });
      disposables.push(cardMat);

      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      // Position cards at varying depths and lateral offsets
      const angle = (idx / profileData.length) * Math.PI * 2;
      cardMesh.position.set(
        Math.cos(angle) * 3.4,
        (idx % 2 === 0 ? 0.9 : -0.9),
        Math.sin(angle) * 2.2
      );
      cardMesh.rotation.y = -angle + Math.PI / 2;
      profileCardMeshes.push(cardMesh);
      profilesGroup.add(cardMesh);
    });

    // =========================================================================
    // SCENE 04 — SHARE YOUR IDEAS (3D Post Panels & Reaction Badges)
    // =========================================================================
    const postsGroup = new THREE.Group();
    postsGroup.position.set(0, 0, -19);
    scene.add(postsGroup);

    const postData = [
      {
        author: "Sarah Jenkins",
        content: "Just deployed our new multi-modal resume intelligence pipeline with sub-300ms latency. The future of hiring is instantaneous.",
        likes: "1,420 Reactions • 88 Comments",
      },
      {
        author: "Alex Rivera",
        content: "Semantic embeddings over keyword stuffing: Why genuine skill relationships beat ATS trickery every time.",
        likes: "2,840 Reactions • 142 Comments",
      },
    ];

    const postCardMeshes: THREE.Mesh[] = [];
    const postGeo = new THREE.BoxGeometry(2.6, 1.8, 0.05);
    disposables.push(postGeo);

    postData.forEach((post, i) => {
      const postTex = createPostCardTexture(post.author, post.content, post.likes);
      disposables.push(postTex);

      const postMat = new THREE.MeshStandardMaterial({
        map: postTex,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
      });
      disposables.push(postMat);

      const postMesh = new THREE.Mesh(postGeo, postMat);
      postMesh.position.set(i === 0 ? -1.8 : 1.8, i === 0 ? 0.4 : -0.4, (i - 0.5) * 1.5);
      postMesh.rotation.y = (i === 0 ? 0.25 : -0.25);
      postCardMeshes.push(postMesh);
      postsGroup.add(postMesh);
    });

    // Orbiting 3D Reaction Symbols
    const reactionSpheres: THREE.Mesh[] = [];
    const rxGeo = new THREE.SphereGeometry(0.16, 16, 16);
    disposables.push(rxGeo);

    const rxColors = [0x4d8dff, 0x27c995, 0xf5b942, 0xf06464];
    for (let i = 0; i < 8; i++) {
      const rxMat = new THREE.MeshPhysicalMaterial({
        color: rxColors[i % rxColors.length],
        emissive: rxColors[i % rxColors.length],
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      disposables.push(rxMat);
      const rxMesh = new THREE.Mesh(rxGeo, rxMat);
      rxMesh.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      reactionSpheres.push(rxMesh);
      postsGroup.add(rxMesh);
    }

    // =========================================================================
    // SCENE 05 — EXPLORE OPPORTUNITIES (Illuminated 3D Geometric Pathway)
    // =========================================================================
    const pathwayGroup = new THREE.Group();
    pathwayGroup.position.set(0, 0, -28);
    scene.add(pathwayGroup);

    // Illuminated Rectangular Gate Portals along Z
    const portalCount = 9;
    const portalFrames: THREE.LineSegments[] = [];
    const portalGeo = new THREE.BoxGeometry(5.2, 3.4, 0.04);
    disposables.push(portalGeo);

    const portalEdgeGeo = new THREE.EdgesGeometry(portalGeo);
    disposables.push(portalEdgeGeo);

    for (let i = 0; i < portalCount; i++) {
      const edgeMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x4d8dff : 0x76d7ff,
        transparent: true,
        opacity: 0.45 - (i / portalCount) * 0.2,
      });
      disposables.push(edgeMat);

      const frame = new THREE.LineSegments(portalEdgeGeo, edgeMat);
      frame.position.set(0, 0, -i * 2.2);
      portalFrames.push(frame);
      pathwayGroup.add(frame);
    }

    // 3D Opportunity Requisition Cards
    const jobData = [
      { title: "Senior Frontend Architect", company: "HireLens AI", salary: "$160k - $210k", location: "San Francisco" },
      { title: "AI/ML Research Scientist", company: "Anthropic Labs", salary: "$190k - $250k", location: "Remote" },
    ];

    const jobCardMeshes: THREE.Mesh[] = [];
    const jobGeo = new THREE.BoxGeometry(2.5, 1.5, 0.05);
    disposables.push(jobGeo);

    jobData.forEach((j, i) => {
      const jobTex = createJobCardTexture(j.title, j.company, j.salary, j.location);
      disposables.push(jobTex);

      const jobMat = new THREE.MeshStandardMaterial({
        map: jobTex,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
      });
      disposables.push(jobMat);

      const jMesh = new THREE.Mesh(jobGeo, jobMat);
      jMesh.position.set(i === 0 ? -1.6 : 1.6, (i === 0 ? 0.3 : -0.3), -3 - i * 3);
      jMesh.rotation.y = (i === 0 ? 0.3 : -0.3);
      jobCardMeshes.push(jMesh);
      pathwayGroup.add(jMesh);
    });

    // =========================================================================
    // SCENE 06 — FINAL TRANSFORMATION (Convergence into HireLens AI Emblem)
    // =========================================================================
    const emblemGroup = new THREE.Group();
    emblemGroup.position.set(0, 0, -38);
    scene.add(emblemGroup);

    // Central Radiant Hex Prism
    const hexGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.3, 6);
    disposables.push(hexGeo);

    const hexMat = new THREE.MeshPhysicalMaterial({
      color: 0x111c2e,
      emissive: 0x4d8dff,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.3,
      transmission: 0.6,
      clearcoat: 1.0,
    });
    disposables.push(hexMat);

    const hexMesh = new THREE.Mesh(hexGeo, hexMat);
    hexMesh.rotation.x = Math.PI / 2;
    hexMesh.rotation.z = Math.PI / 6;
    emblemGroup.add(hexMesh);

    // Glowing Inner Ring
    const innerRingGeo = new THREE.TorusGeometry(1.2, 0.04, 16, 48);
    disposables.push(innerRingGeo);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x76d7ff });
    disposables.push(innerRingMat);
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    emblemGroup.add(innerRing);

    // 12 Converging Satellite Crystals
    const satCount = 12;
    const satGeo = new THREE.OctahedronGeometry(0.18, 0);
    disposables.push(satGeo);

    const satMat = new THREE.MeshPhysicalMaterial({
      color: 0x76d7ff,
      emissive: 0x27c995,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    disposables.push(satMat);

    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < satCount; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      satellites.push(sat);
      emblemGroup.add(sat);
    }

    // =========================================================================
    // AMBIENT PARTICLE DUST CLOUD (Persistent Depth)
    // =========================================================================
    const starCount = isMobile ? 300 : 700;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 25;
      starPositions[i + 1] = (Math.random() - 0.5) * 20;
      starPositions[i + 2] = -Math.random() * 45;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    disposables.push(starGeo);

    const starMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x76d7ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(starMat);

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // --- Interactive Mouse Parallax Lerp ---
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // =========================================================================
    // SCROLL-DRIVEN CAMERA & OBJECT TRANSFORMATION ENGINE (RAF Loop)
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    // Smoothed progress for silky bi-directional response
    let smoothProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Lerp smooth scroll progress toward actual target progress
      const targetProgress = Math.max(0, Math.min(1, progressRef.current));
      smoothProgress += (targetProgress - smoothProgress) * 0.08;

      const p = smoothProgress;

      // Mouse Parallax Damping
      const pX = prefersReducedMotion ? 0 : mouseX * 0.35;
      const pY = prefersReducedMotion ? 0 : mouseY * 0.25;

      // -----------------------------------------------------------------------
      // Continuous Camera Trajectory along Z Spline through the 6 Scenes
      // -----------------------------------------------------------------------
      // Stage 1 (0.00 - 0.18): z from 14 -> 2.0 (Entering the digital universe)
      // Stage 2 (0.18 - 0.36): z from 2.0 -> -4.0 (Orbiting connect nodes)
      // Stage 3 (0.36 - 0.54): z from -4.0 -> -11.0 (Passing profile cards)
      // Stage 4 (0.54 - 0.72): z from -11.0 -> -19.0 (Gliding through post panels)
      // Stage 5 (0.72 - 0.88): z from -19.0 -> -28.0 (Flying down opportunity tunnel)
      // Stage 6 (0.88 - 1.00): z from -28.0 -> -34.0 (Pulling back at the final emblem)

      const targetCamZ = 14 - p * 48; // Total sweep of 48 units in depth
      const targetCamX = Math.sin(p * Math.PI * 3.5) * 1.8 + pX;
      const targetCamY = Math.cos(p * Math.PI * 2.5) * 0.8 + pY;

      camera.position.x += (targetCamX - camera.position.x) * 0.1;
      camera.position.y += (targetCamY - camera.position.y) * 0.1;
      camera.position.z += (targetCamZ - camera.position.z) * 0.1;

      // Camera Target Look-Ahead
      const lookZ = camera.position.z - 8;
      const lookX = Math.sin(p * Math.PI * 4) * 0.6;
      camera.lookAt(lookX, 0, lookZ);

      // Camera Roll / Bank on curves
      camera.rotation.z = Math.sin(p * Math.PI * 3) * 0.08;

      // -----------------------------------------------------------------------
      // Dynamic Object Transformations & Scene Activations
      // -----------------------------------------------------------------------

      // 1. Digital Universe Sphere (Scene 1)
      universeGroup.rotation.y = elapsedTime * 0.15 + p * 8.0;
      universeGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1 + p * 3.0;

      // Expand sphere nodes outward as user scrolls into it
      const sphereExpansion = 1 + Math.max(0, Math.min(1, p * 4.5)) * 1.8;
      for (let i = 0; i < nodeCount; i++) {
        const base = nodeBasePositions[i];
        if (base) {
          dummy.position.copy(base).multiplyScalar(sphereExpansion);
          const pulse = Math.sin(elapsedTime * 2 + i * 0.1) * 0.15 + 1;
          dummy.scale.setScalar((0.7 + (i % 5) * 0.15) * pulse);
          dummy.updateMatrix();
          instancedNodes.setMatrixAt(i, dummy.matrix);
        }
      }
      instancedNodes.instanceMatrix.needsUpdate = true;
      ring1.rotation.z = elapsedTime * 0.3 + p * 4;
      ring2.rotation.z = -elapsedTime * 0.25 - p * 3;

      // 2. Connect Nodes (Scene 2)
      connectGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.15 + p * 5.0;
      connectGroup.rotation.x = Math.cos(elapsedTime * 0.3) * 0.1;
      connectNodes.forEach((node, idx) => {
        const floatY = Math.sin(elapsedTime * 1.5 + idx) * 0.08;
        node.position.y = connectNodePositions[idx].y + floatY;
      });

      // 3. Profile Cards 3D (Scene 3)
      profilesGroup.rotation.y = p * 4.0;
      profileCardMeshes.forEach((card, idx) => {
        // Individual axis rotations responding to scroll & time
        card.rotation.x = Math.sin(elapsedTime + idx) * 0.12;
        card.rotation.z = Math.cos(elapsedTime + idx) * 0.08;
        card.position.y += Math.sin(elapsedTime * 1.2 + idx * 1.5) * 0.003;
      });

      // 4. Post Panels & Reaction Badges (Scene 4)
      postCardMeshes.forEach((post, idx) => {
        post.rotation.y = (idx === 0 ? 0.3 : -0.3) + Math.sin(elapsedTime + idx) * 0.06;
        post.rotation.x = Math.sin(elapsedTime * 0.8 + idx) * 0.05;
      });
      reactionSpheres.forEach((rx, idx) => {
        const orbitSpeed = 1.0 + idx * 0.2;
        rx.position.x += Math.sin(elapsedTime * orbitSpeed) * 0.02;
        rx.position.y += Math.cos(elapsedTime * orbitSpeed) * 0.02;
      });

      // 5. Opportunity Pathway (Scene 5)
      portalFrames.forEach((frame, idx) => {
        const pulseScale = 1 + Math.sin(elapsedTime * 2.5 + idx * 0.4) * 0.04;
        frame.scale.set(pulseScale, pulseScale, 1);
        frame.rotation.z = Math.sin(elapsedTime * 0.5 + idx * 0.2) * 0.05;
      });
      jobCardMeshes.forEach((jCard, idx) => {
        jCard.rotation.y = (idx === 0 ? 0.25 : -0.25) + Math.sin(elapsedTime + idx) * 0.05;
      });

      // 6. Final Transformation Emblem (Scene 6)
      hexMesh.rotation.z = elapsedTime * 0.4 + p * 6.0;
      innerRing.rotation.x = elapsedTime * 0.6;
      innerRing.rotation.y = elapsedTime * 0.5;

      // Satellites converge inward toward hex center as progress nears 1.0
      const convergeT = Math.max(0, Math.min(1, (p - 0.85) / 0.15));
      const satRadius = 2.8 - convergeT * 1.2;
      satellites.forEach((sat, idx) => {
        const angle = (idx / satCount) * Math.PI * 2 + elapsedTime * 0.6;
        sat.position.set(
          Math.cos(angle) * satRadius,
          Math.sin(angle) * satRadius,
          Math.sin(elapsedTime * 2 + idx) * 0.2
        );
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
      });

      // Stars floating drift
      stars.rotation.y = elapsedTime * 0.01;

      // Dynamic light intensity shift across the journey
      mainLight.intensity = 2.5 + Math.sin(p * Math.PI) * 1.5;
      cyanPointLight.intensity = 2.0 + Math.cos(p * Math.PI * 2) * 1.0;
      violetPointLight.intensity = 2.5 + Math.sin(p * Math.PI * 3) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);

      disposables.forEach((d) => d.dispose());

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
      <div className="fixed inset-0 pointer-events-none z-0 cinematic-bg-mesh opacity-80" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
