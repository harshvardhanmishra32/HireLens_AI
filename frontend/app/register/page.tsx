"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { SoundToggle } from "@/components/audio/SoundToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("RECRUITER");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role_names: [role]
        }),
      });

      if (response.ok) {
        setSuccessMsg("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      } else {
        const errData = await response.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Registration failed. Try again.");
      }
    } catch {
      setErrorMsg(`Unable to connect to the backend server at ${API_BASE_URL}.`);
    } finally {
      setIsLoading(false);
    }
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
      <div className="w-full max-w-[420px] space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-sm tracking-tight apple-press glow-cyan shadow-lg">
            HL
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create Account</h1>
          <p className="text-xs text-muted font-normal">Deploy neural intelligence to your recruitment workflows.</p>
        </div>

        {/* Form Container */}
        <div className="border border-border/80 bg-card/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl space-y-4 glow-card">
          <form onSubmit={handleRegister} className="space-y-4">
            
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted" htmlFor="firstName">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-3.5 w-3.5 text-muted/70" strokeWidth={1.5} />
                  <input
                    id="firstName"
                    type="text"
                    required
                    placeholder="Elena"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 bg-secondary/50 rounded-xl border border-border/80 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted" htmlFor="lastName">Last name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-3.5 w-3.5 text-muted/70" strokeWidth={1.5} />
                  <input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Rostova"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 bg-secondary/50 rounded-xl border border-border/80 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted" htmlFor="email">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted/70" strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="elena.rostova@neuralcraft.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary/50 rounded-xl border border-border/80 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted/70" strokeWidth={1.5} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted" htmlFor="role">Account Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary/50 rounded-xl border border-border/80 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium text-foreground cursor-pointer"
              >
                <option value="RECRUITER">Recruiter / Talent Lead</option>
                <option value="CANDIDATE">Candidate / Job Seeker</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 apple-press shadow-md glow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted">Already have an account?</span>
            <Link href="/login" className="text-accent font-semibold hover:underline">Sign In</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
