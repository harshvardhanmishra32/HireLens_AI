"use client";

// Design Read: Master Cinematic 3D Scrolling Professional Networking Platform (HireLens AI)
// Dials: DESIGN_VARIANCE: 9 | MOTION_INTENSITY: 8 | VISUAL_DENSITY: 4

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  Sparkles, 
  ArrowRight, 
  Sun, 
  Moon, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Award, 
  Share2, 
  Cpu, 
  UserCheck 
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import HiringAnalyticsSection from "@/components/sections/HiringAnalyticsSection";
import { SoundToggle } from "@/components/audio/SoundToggle";

// Dynamic import of the Persistent 3D Scroll Universe Canvas (SSR-safe)
const CinematicScrollUniverse = dynamic(
  () => import("@/components/three/CinematicScrollUniverse"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 pointer-events-none z-0 cinematic-bg-mesh opacity-80" />
    ),
  }
);

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);

  // GSAP ScrollTrigger Integration to track 0.0 -> 1.0 scroll progress
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ctx: { revert: () => void } | null = null;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          ScrollTrigger.create({
            trigger: "#scroll-track",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
            onUpdate: (self) => {
              setScrollProgress(self.progress);
            },
          });

          // GSAP reveal animations for content cards
          const revealElements = document.querySelectorAll(".gsap-reveal");
          revealElements.forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 32 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 82%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          });
        });
      }
    );

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground transition-colors duration-300 selection:bg-primary/25 selection:text-accent">
      
      {/* =========================================================================
          PERSISTENT 3D SCROLL CANVAS (Behind the scroll track, responds to scroll)
          ========================================================================= */}
      <CinematicScrollUniverse scrollProgress={scrollProgress} />

      {/* =========================================================================
          STICKY NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 apple-glass border-b border-border/40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary via-accent to-violet-600 text-white flex items-center justify-center font-bold text-xs tracking-tighter apple-press shadow-md glow-cyan">
              HL
            </div>
            <span className="font-semibold text-base tracking-tight text-foreground flex items-center gap-1.5">
              HireLens <span className="font-normal text-accent">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-muted">
            <a href="#scene-universe" className="hover:text-accent transition-colors">Universe</a>
            <a href="#scene-connect" className="hover:text-accent transition-colors">Connect</a>
            <a href="#scene-talent" className="hover:text-accent transition-colors">Professionals</a>
            <a href="#scene-ideas" className="hover:text-accent transition-colors">Ideas</a>
            <a href="#scene-opportunities" className="hover:text-accent transition-colors">Opportunities</a>
            <a href="#scene-transformation" className="hover:text-accent transition-colors">Ecosystem</a>
          </nav>

          <div className="flex items-center gap-3">
            <SoundToggle />

            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full border border-border/70 flex items-center justify-center hover:bg-secondary/80 transition-colors apple-press"
              aria-label="Toggle Theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-400" strokeWidth={1.5} />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute text-accent" strokeWidth={1.5} />
            </button>

            <a 
              href={`${API_BASE_URL}/api/v1/docs`} 
              target="_blank" 
              className="text-xs font-medium px-4 py-2 rounded-full border border-border/80 hover:bg-secondary transition-colors hidden sm:inline-block text-muted hover:text-foreground apple-press"
            >
              API Reference
            </a>

            <Link 
              href="/login"
              className="text-xs font-semibold px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all apple-press shadow-md glow-primary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* HUD Telemetry Overlay: Scroll Progress Indicator */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 px-4 py-2 rounded-full apple-glass border border-border/60 text-xs font-mono text-muted backdrop-blur-xl">
        <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
        <span>3D CAMERA PROGRESS: {Math.round(scrollProgress * 100)}%</span>
      </div>

      {/* =========================================================================
          CONTINUOUS SCROLL TRACK (Drives the 3D Canvas via GSAP ScrollTrigger)
          ========================================================================= */}
      <div id="scroll-track" className="relative z-10">

        {/* -----------------------------------------------------------------------
            SCENE 01 — THE DIGITAL UNIVERSE
            ----------------------------------------------------------------------- */}
        <section id="scene-universe" className="min-h-screen flex flex-col justify-center px-6 pt-16 pb-24 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-border/70 bg-card/60 backdrop-blur-md text-[11px] font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
              <span>The 3D Cinematic Professional Universe</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-display leading-display text-foreground">
              Your Professional World.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">
                Reimagined.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-[50ch] font-normal leading-relaxed">
              Connect with professionals, discover opportunities, share knowledge, and build your future with HireLens AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link 
                href="/register"
                className="h-12 px-7 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all apple-press shadow-lg glow-primary"
              >
                Get Started <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <a 
                href="#scene-connect"
                className="h-12 px-7 rounded-full border border-border/80 bg-secondary/50 text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors apple-press"
              >
                Explore the Network
              </a>
              <Link 
                href="/login"
                className="h-12 px-7 rounded-full border border-border/80 bg-card/60 text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors apple-press"
              >
                Sign In
              </Link>
            </div>

            {/* Verified Trust Strip */}
            <div className="pt-8 border-t border-border/40 grid grid-cols-3 gap-6 w-full text-left">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-foreground block">1,200+</span>
                <span className="text-[11px] text-muted">Instanced 3D Nodes</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-accent block">320ms</span>
                <span className="text-[11px] text-muted">Parsing Latency</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 block">100%</span>
                <span className="text-[11px] text-muted">White-Text Trap Catch</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2 text-xs text-muted font-mono">
              <span className="animate-bounce">↓</span>
              <span>Scroll down to navigate through 3D space</span>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SCENE 02 — CONNECT
            ----------------------------------------------------------------------- */}
        <section id="scene-connect" className="min-h-screen flex flex-col justify-center px-6 py-28 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-6 gsap-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
              <Users className="h-3.5 w-3.5" />
              <span>Synaptic Network Mesh</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Great Opportunities Begin With<br />
              <span className="text-accent">Great Connections.</span>
            </h2>

            <p className="text-base text-muted leading-relaxed">
              Experience an interconnected professional universe. Individual nodes illuminate and bridge across disciplines, turning isolated candidate profiles into an active synaptic community.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-2xl border border-border/70 bg-card/75 backdrop-blur-xl glow-card space-y-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Share2 className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Direct Professional Graph</h4>
                <p className="text-xs text-muted">Connect directly with engineers, researchers, and recruiters without intermediary bottlenecks.</p>
              </div>

              <div className="p-5 rounded-2xl border border-border/70 bg-card/75 backdrop-blur-xl glow-card space-y-2">
                <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <Cpu className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Semantic Skill Alignment</h4>
                <p className="text-xs text-muted">RapidFuzz and TF-IDF matching automatically connect you to peers with complementary expertise.</p>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SCENE 03 — DISCOVER PROFESSIONALS
            ----------------------------------------------------------------------- */}
        <section id="scene-talent" className="min-h-screen flex flex-col justify-center px-6 py-28 max-w-7xl mx-auto">
          <div className="max-w-2xl ml-auto space-y-6 text-right gsap-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <UserCheck className="h-3.5 w-3.5" />
              <span>3D Floating Profile Cards</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Discover People Who<br />
              <span className="text-emerald-400">Move You Forward.</span>
            </h2>

            <p className="text-base text-muted leading-relaxed max-w-xl ml-auto">
              Meet verified professionals entering from varying depths across the 3D canvas. Orbiting cards assemble into an active talent directory verified by skills, accredited experience, and peer endorsements.
            </p>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <span className="px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs text-foreground">Staff AI Researchers</span>
              <span className="px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs text-foreground">Cloud Infrastructure Architects</span>
              <span className="px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs text-foreground">Frontend Engineers</span>
            </div>

            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all apple-press shadow-md glow-primary"
              >
                Browse Verified Directory <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SCENE 04 — SHARE YOUR IDEAS
            ----------------------------------------------------------------------- */}
        <section id="scene-ideas" className="min-h-screen flex flex-col justify-center px-6 py-28 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-6 gsap-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>High-Signal Professional Discourse</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Share Ideas.<br />
              <span className="text-purple-400">Build Influence.</span>
            </h2>

            <p className="text-base text-muted leading-relaxed">
              A futuristic 3D content environment designed for architectural breakdowns, engineering deep-dives, and technical breakthroughs. Share knowledge with peers and earn genuine influence across your industry.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border/70 text-xs text-muted">
                <span>👍</span>
                <span>Insightful Reactions</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border/70 text-xs text-muted">
                <span>💡</span>
                <span>Technical Discourse</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border/70 text-xs text-muted">
                <span>❤️</span>
                <span>Community Endorsement</span>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SCENE 05 — EXPLORE OPPORTUNITIES
            ----------------------------------------------------------------------- */}
        <section id="scene-opportunities" className="min-h-screen flex flex-col justify-center px-6 py-28 max-w-7xl mx-auto">
          <div className="max-w-2xl ml-auto space-y-6 text-right gsap-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Illuminated Career Pathway</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Your Next Opportunity<br />
              <span className="text-amber-400">Is Closer Than You Think.</span>
            </h2>

            <p className="text-base text-muted leading-relaxed max-w-xl ml-auto">
              Fly through the geometric opportunity tunnel toward verified requisitions. Complete with transparent salary bands, workplace flexibility tags, and automated ATS match previews before you apply.
            </p>

            <div className="pt-4 flex justify-end gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all apple-press shadow-md glow-primary"
              >
                Explore Active Openings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SCENE 06 — THE FINAL TRANSFORMATION & CTA
            ----------------------------------------------------------------------- */}
        <section id="scene-transformation" className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-28 max-w-4xl mx-auto">
          <div className="space-y-6 gsap-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-accent text-xs font-semibold">
              <Award className="h-4 w-4" />
              <span>Unified Intelligence Ecosystem</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-display text-foreground leading-display">
              Build Your Professional<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">
                Future With HireLens AI.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">
              Where verified career narratives meet next-generation recruitment intelligence.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register"
                className="h-12 px-8 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center hover:bg-primary/90 transition-all apple-press shadow-xl glow-primary"
              >
                Join HireLens AI
              </Link>
              <Link 
                href="/dashboard"
                className="h-12 px-8 rounded-full border border-border/80 bg-secondary/60 text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/90 transition-colors apple-press"
              >
                Explore Network Console
              </Link>
              <Link 
                href="/login"
                className="h-12 px-8 rounded-full border border-border/80 bg-card/60 text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/90 transition-colors apple-press"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* =======================================================================
            HIRING ANALYTICS & RECRUITER VERIFICATION SUITE
            ======================================================================= */}
        <div className="gsap-reveal border-t border-border/40 py-20 bg-secondary/10">
          <HiringAnalyticsSection />
        </div>

        {/* =======================================================================
            FOOTER
            ======================================================================= */}
        <footer className="border-t border-border/50 bg-secondary/20 py-12 text-xs text-muted">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div className="space-y-3">
                <span className="font-semibold text-foreground block">3D Universe</span>
                <ul className="space-y-2">
                  <li><a href="#scene-universe" className="hover:text-accent transition-colors">The Digital Universe</a></li>
                  <li><a href="#scene-connect" className="hover:text-accent transition-colors">Synaptic Connect</a></li>
                  <li><a href="#scene-talent" className="hover:text-accent transition-colors">3D Talent Directory</a></li>
                  <li><a href="#scene-ideas" className="hover:text-accent transition-colors">Professional Ideas</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="font-semibold text-foreground block">Platform</span>
                <ul className="space-y-2">
                  <li><Link href="/dashboard" className="hover:text-accent transition-colors">Professional Feed</Link></li>
                  <li><Link href="/dashboard" className="hover:text-accent transition-colors">My Network</Link></li>
                  <li><Link href="/dashboard" className="hover:text-accent transition-colors">Job Openings</Link></li>
                  <li><Link href="/dashboard" className="hover:text-accent transition-colors">Recruiter ATS Engine</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="font-semibold text-foreground block">Developers</span>
                <ul className="space-y-2">
                  <li><a href={`${API_BASE_URL}/api/v1/docs`} target="_blank" className="hover:text-accent transition-colors">FastAPI Docs</a></li>
                  <li><a href={`${API_BASE_URL}/api/v1/openapi.json`} target="_blank" className="hover:text-accent transition-colors">OpenAPI Spec</a></li>
                  <li><a href="https://github.com/harshvardhanmishra32/AI-Resume-Screening-System" target="_blank" className="hover:text-accent transition-colors">GitHub Repository</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="font-semibold text-foreground block">Security & Engine</span>
                <ul className="space-y-2">
                  <li><span className="text-muted">PyMuPDF Vector Verification</span></li>
                  <li><span className="text-muted">Tesseract 5.5 OCR Core</span></li>
                  <li><span className="text-muted">Three.js WebGL Instancing</span></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary via-accent to-purple-500 text-white flex items-center justify-center font-bold text-[10px]">
                  HL
                </div>
                <span>&copy; 2026 HireLens AI Inc. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/login" className="hover:text-accent transition-colors">Terms of Service</Link>
                <Link href="/login" className="hover:text-accent transition-colors">Privacy Policy</Link>
                <Link href="/login" className="hover:text-accent transition-colors">Cookie Preferences</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
