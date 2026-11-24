"use client";

import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { TrendingUp, Users, Target, Clock, ShieldCheck } from "lucide-react";

const pipelineFunnelData = [
  { stage: "Resumes Ingested", count: 1240, color: "#4D8DFF" },
  { stage: "OCR Extracted", count: 1218, color: "#76D7FF" },
  { stage: "Fraud Screened", count: 1184, color: "#27C995" },
  { stage: "Skills Matched", count: 680, color: "#4D8DFF" },
  { stage: "Qualified Shortlist", count: 194, color: "#27C995" }
];

const scoreDistributionData = [
  { range: "0-50%", candidates: 42 },
  { range: "50-65%", candidates: 118 },
  { range: "65-75%", candidates: 280 },
  { range: "75-85%", candidates: 440 },
  { range: "85-95%", candidates: 290 },
  { range: "95-100%", candidates: 70 }
];

export default function HiringAnalyticsSection() {
  const [activeMetric, setActiveMetric] = useState<"funnel" | "distribution">("funnel");

  return (
    <section id="analytics" className="py-24 md:py-32 bg-secondary/30 border-y border-border/50 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest block mb-3">
            Recruitment Intelligence Analytics
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Precision Across the Entire Pipeline
          </h2>
          <p className="text-sm sm:text-base text-muted mt-3">
            Real-time telemetry measuring candidate flow, scoring calibration, and fraud prevention velocity.
          </p>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-medium">Screening Velocity</span>
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-foreground block">320ms</span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" strokeWidth={1.5} /> 84% faster than legacy ATS
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-medium">Median ATS Fit</span>
              <Target className="h-4 w-4 text-accent" strokeWidth={1.5} />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-foreground block">82.4%</span>
            <span className="text-[11px] text-muted mt-1 block">Calibrated over 200+ skill vectors</span>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-medium">Fraud Interceptions</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 block">100%</span>
            <span className="text-[11px] text-muted mt-1 block">White-text and micro-font traps</span>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-medium">Pipeline Throughput</span>
              <Users className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-foreground block">1,240+</span>
            <span className="text-[11px] text-muted mt-1 block">Resumes parsed in active sessions</span>
          </div>
        </div>

        {/* Interactive Chart Container */}
        <div className="p-6 md:p-8 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50 mb-6">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {activeMetric === "funnel" ? "Candidate Conversion Funnel" : "ATS Score Calibration Distribution"}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {activeMetric === "funnel" 
                  ? "Progression of candidate profiles from raw ingest to verified interview shortlist." 
                  : "Density distribution of applicant alignment scores across all active roles."}
              </p>
            </div>

            {/* Toggle Control */}
            <div className="inline-flex rounded-full p-1 border border-border/70 bg-secondary/60">
              <button
                onClick={() => setActiveMetric("funnel")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all apple-press ${
                  activeMetric === "funnel" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                Conversion Funnel
              </button>
              <button
                onClick={() => setActiveMetric("distribution")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all apple-press ${
                  activeMetric === "distribution" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                Score Distribution
              </button>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-72 w-full">
            {activeMetric === "funnel" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineFunnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" tick={{ fill: "#8995A8", fontSize: 11 }} axisLine={{ stroke: "rgba(77, 141, 255, 0.15)" }} tickLine={false} />
                  <YAxis tick={{ fill: "#8995A8", fontSize: 11 }} axisLine={{ stroke: "rgba(77, 141, 255, 0.15)" }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111C2E", borderColor: "rgba(77, 141, 255, 0.3)", borderRadius: "12px", color: "#F5F7FB", fontSize: "12px" }}
                    cursor={{ fill: "rgba(77, 141, 255, 0.08)" }}
                  />
                  <Bar dataKey="count" fill="#4D8DFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#76D7FF" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#4D8DFF" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="range" tick={{ fill: "#8995A8", fontSize: 11 }} axisLine={{ stroke: "rgba(77, 141, 255, 0.15)" }} tickLine={false} />
                  <YAxis tick={{ fill: "#8995A8", fontSize: 11 }} axisLine={{ stroke: "rgba(77, 141, 255, 0.15)" }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111C2E", borderColor: "rgba(77, 141, 255, 0.3)", borderRadius: "12px", color: "#F5F7FB", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="candidates" stroke="#76D7FF" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
