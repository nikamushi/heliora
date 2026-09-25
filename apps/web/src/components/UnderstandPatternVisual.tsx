"use client";

import React from "react";
import { IconActivity, IconWaveSine, IconSparkles, IconCheck } from "@tabler/icons-react";

export function UnderstandPatternVisual() {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#0f2116] border border-emerald-500/20 p-5 sm:p-7 md:p-8 overflow-hidden shadow-2xl shadow-emerald-950/40 select-none">
      {/* Ambient background glows */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header inside Visual */}
      <div className="flex items-center justify-between border-b border-emerald-800/30 pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wider uppercase text-emerald-300/90">
            Real-Time Pattern Synthesis
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-mono text-emerald-200">
          <IconSparkles size={13} className="text-emerald-400" />
          <span>Multimodal Correlation</span>
        </div>
      </div>

      {/* Dynamic Visual Graphic Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-xl bg-[#0a170f]/80 border border-emerald-900/40 p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f3d2a15_1px,transparent_1px),linear-gradient(to_bottom,#1f3d2a15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* SVG Biological Pattern Waves & Signal Paths */}
        <svg
          viewBox="0 0 640 260"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="upvWaveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#2dd4bf" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="upvWaveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.05" />
              <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="75%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="upvAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>

            <filter id="upvGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shaded Area under main flow */}
          <path
            d="M 20,170 Q 140,70 260,140 T 480,100 T 620,150 L 620,260 L 20,260 Z"
            fill="url(#upvAreaFill)"
          />

          {/* Secondary Harmonic Wave */}
          <path
            d="M 20,190 C 120,210 200,120 320,150 C 440,180 520,110 620,130"
            fill="none"
            stroke="url(#upvWaveGradient2)"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.75"
          />

          {/* Primary Signal Wave */}
          <path
            d="M 20,170 Q 140,70 260,140 T 480,100 T 620,150"
            fill="none"
            stroke="url(#upvWaveGradient1)"
            strokeWidth="2.8"
            filter="url(#upvGlow)"
          />

          {/* Synaptic Nodes / Detected Correlated Events */}
          {/* Node 1: Circadian Peak */}
          <g transform="translate(190, 105)">
            <circle r="14" fill="#34d399" fillOpacity="0.15" className="animate-ping" />
            <circle r="6" fill="#34d399" />
            <circle r="2.5" fill="#ffffff" />
          </g>

          {/* Node 2: Metabolic Alignment */}
          <g transform="translate(370, 120)">
            <circle r="16" fill="#2dd4bf" fillOpacity="0.15" className="animate-pulse" />
            <circle r="6" fill="#2dd4bf" />
            <circle r="2.5" fill="#ffffff" />
          </g>

          {/* Node 3: Recovery Stabilization */}
          <g transform="translate(480, 100)">
            <circle r="12" fill="#6ee7b7" fillOpacity="0.2" />
            <circle r="5.5" fill="#6ee7b7" />
            <circle r="2" fill="#ffffff" />
          </g>

          {/* Connection Line between nodes */}
          <line
            x1="190"
            y1="105"
            x2="370"
            y2="120"
            stroke="#34d399"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.6"
          />
        </svg>

        {/* Floating Contextual Badges inside Graphic */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="bg-[#12291d]/90 backdrop-blur-md border border-emerald-500/25 px-3 py-1.5 rounded-lg shadow-md">
            <div className="text-[10px] uppercase font-mono text-emerald-300/70 tracking-wider">Input Parameter</div>
            <div className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
              <IconActivity size={13} className="text-emerald-400" />
              <span>Pola Sirkadian &amp; Beban Harian</span>
            </div>
          </div>

          <div className="bg-[#12291d]/90 backdrop-blur-md border border-emerald-500/25 px-3 py-1.5 rounded-lg shadow-md text-right">
            <div className="text-[10px] uppercase font-mono text-emerald-300/70 tracking-wider">Korelasi Status</div>
            <div className="text-xs font-semibold text-emerald-300 flex items-center justify-end gap-1">
              <IconCheck size={13} stroke={2.5} />
              <span>3 Pola Terpetakan</span>
            </div>
          </div>
        </div>

        {/* Bottom Insight Overlay */}
        <div className="relative z-10 mt-auto pt-2">
          <div className="bg-[#0b1c12]/95 backdrop-blur-md border border-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-200">
              <IconWaveSine size={16} className="text-emerald-400 shrink-0" />
              <span className="truncate">Sintesis: Keterkaitan ritme istirahat dengan stabilitas energi</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold shrink-0 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/40">
              98.2% Sesuai
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-4 relative z-10">
        <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-xs font-mono text-emerald-300/70 uppercase tracking-wider">Sumber Data</div>
          <div className="text-xs sm:text-sm font-semibold text-emerald-100 mt-0.5">Multimodal</div>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-xs font-mono text-emerald-300/70 uppercase tracking-wider">Struktur Pola</div>
          <div className="text-xs sm:text-sm font-semibold text-emerald-100 mt-0.5">Non-Linear</div>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-[10px] sm:text-xs font-mono text-emerald-300/70 uppercase tracking-wider">Interpretasi</div>
          <div className="text-xs sm:text-sm font-semibold text-emerald-300 mt-0.5">Kontekstual</div>
        </div>
      </div>
    </div>
  );
}
