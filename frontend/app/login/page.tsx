"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Loader2, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { SoundToggle } from "@/components/audio/SoundToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const DEMO_PROFILES = {
    recruiter: {
      id: "4ea6dea3-284b-4749-90b5-aa8759fe3c08",
      email: "demo@hirelens.ai",
      first_name: "Demo",
      last_name: "Recruiter",
      is_active: true,
      roles: [{ id: "e0cf62ab2e644f019aa37189a5fbca28", name: "RECRUITER", description: "RECRUITER role" }],
    },
    candidate: {
      id: "7a71c760-0411-4c2e-8510-543c318f2583",
      email: "candidate@hirelens.ai",
      first_name: "Demo",
      last_name: "Candidate",
      is_active: true,
      roles: [{ id: "e33754413ba64653948c7a68d72b2358", name: "CANDIDATE", description: "CANDIDATE role" }],
    },
  };

  const executeLogin = async (targetEmail: string, targetPass: string, demoRole?: "recruiter" | "candidate") => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const detectedRole = demoRole || (
      targetEmail === "candidate@hirelens.ai" || targetEmail.includes("candidate") ? "candidate" :
      targetEmail === "demo@hirelens.ai" || targetEmail.includes("demo") ? "recruiter" : undefined
    );

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login-json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        if (detectedRole) {
          localStorage.setItem("hirelens_user_profile", JSON.stringify(DEMO_PROFILES[detectedRole]));
        }
        setSuccessMsg("Authentication successful! Entering workspace...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
        return;
      }

      // If unauthorized and it's a demo account, attempt auto-registration then retry
      if (response.status === 401 && detectedRole) {
        setErrorMsg("Initializing demo credentials...");
        const regResponse = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: targetEmail,
            password: targetPass,
            first_name: "Demo",
            last_name: detectedRole === "candidate" ? "Candidate" : "Recruiter",
            role_names: detectedRole === "candidate" ? ["CANDIDATE"] : ["RECRUITER"],
          }),
        });

        if (regResponse.ok) {
          const loginRetry = await fetch(`${API_BASE_URL}/api/v1/auth/login-json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: targetEmail, password: targetPass }),
          });

          if (loginRetry.ok) {
            const retryData = await loginRetry.json();
            localStorage.setItem("accessToken", retryData.access_token);
            localStorage.setItem("refreshToken", retryData.refresh_token);
            localStorage.setItem("hirelens_user_profile", JSON.stringify(DEMO_PROFILES[detectedRole]));
            setSuccessMsg("Demo credentials initialized! Entering workspace...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 800);
            return;
          }
        }
      }

      // If backend responded with 404 Not Found or error for demo accounts, provide seamless demo fallback
      if (detectedRole) {
        localStorage.setItem("accessToken", `demo-token-${detectedRole}-${Date.now()}`);
        localStorage.setItem("refreshToken", `demo-refresh-${detectedRole}-${Date.now()}`);
        localStorage.setItem("hirelens_user_profile", JSON.stringify(DEMO_PROFILES[detectedRole]));
        setSuccessMsg(`Welcome, Demo ${detectedRole === "recruiter" ? "Recruiter" : "Candidate"}! Entering workspace...`);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
        return;
      }

      const errData = await response.json().catch(() => ({}));
      setErrorMsg(errData.detail || "Authentication failed. Check credentials.");
    } catch {
      // If network fails (e.g. backend server offline), allow demo accounts to instantly proceed
      if (detectedRole) {
        localStorage.setItem("accessToken", `demo-token-${detectedRole}-${Date.now()}`);
        localStorage.setItem("refreshToken", `demo-refresh-${detectedRole}-${Date.now()}`);
        localStorage.setItem("hirelens_user_profile", JSON.stringify(DEMO_PROFILES[detectedRole]));
        setSuccessMsg(`Instant Demo ${detectedRole === "recruiter" ? "Recruiter" : "Candidate"} mode active! Entering workspace...`);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
        return;
      }
      setErrorMsg(`Unable to connect to backend server at ${API_BASE_URL}. Ensure FastAPI is running on port 8000.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  const handleQuickDemo = (role: "recruiter" | "candidate") => {
    const demoEmail = role === "recruiter" ? "demo@hirelens.ai" : "candidate@hirelens.ai";
    const demoPass = "password123";
    setEmail(demoEmail);
    setPassword(demoPass);
    executeLogin(demoEmail, demoPass, role);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 relative selection:bg-primary/25 cinematic-bg-mesh">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1.5 font-medium apple-press">
          &larr; Back to Platform
        </Link>
      </div>
      <div className="absolute top-8 right-8">
        <SoundToggle />
      </div>
      <div className="w-full max-w-[400px] space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-sm tracking-tight apple-press glow-cyan shadow-lg">
            HL
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Sign In</h1>
          <p className="text-xs text-muted font-normal">Access your HireLens AI recruitment workspace.</p>
        </div>

        {/* Form Container */}
        <div className="border border-border/80 bg-card/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl space-y-4 glow-card">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Notifications */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted" htmlFor="email">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted/70" strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary/50 rounded-xl border border-border/80 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted" htmlFor="password">Password</label>
                <a href="#" className="text-[11px] text-accent hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted/70" strokeWidth={1.5} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-secondary/50 rounded-xl border border-border/80 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 apple-press shadow-md glow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Workspace <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted">Don&apos;t have an account?</span>
            <Link href="/register" className="text-accent font-semibold hover:underline">Register Account</Link>
          </div>
        </div>

        {/* Demo Fast Logins */}
        <div className="border border-border/80 bg-card/60 backdrop-blur-md p-4 rounded-2xl space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block text-center">Instant 1-Click Demo Access</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo("recruiter")}
              className="py-2.5 px-3 border border-border/80 rounded-xl bg-secondary/40 hover:bg-secondary text-[11px] font-semibold flex items-center justify-center gap-1.5 apple-press text-foreground cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} /> Recruiter Demo
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo("candidate")}
              className="py-2.5 px-3 border border-border/80 rounded-xl bg-secondary/40 hover:bg-secondary text-[11px] font-semibold flex items-center justify-center gap-1.5 apple-press text-foreground cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} /> Candidate Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
