"use client";

import React from "react";

export function LayeredHealthPicture() {
  // 4 Isometric Rounded Rhombus Planes
  // Width: 380, Height: 190
  const renderPlanePath = (cx: number, cy: number, w: number = 380, h: number = 190, r: number = 22) => {
    const hw = w / 2;
    const hh = h / 2;
    return `
      M ${cx - hw + r} ${cy}
      Q ${cx - hw} ${cy} ${cx - hw + r * 0.7} ${cy + r * 0.35}
      L ${cx - r * 0.7} ${cy + hh - r * 0.35}
      Q ${cx} ${cy + hh} ${cx + r * 0.7} ${cy + hh - r * 0.35}
      L ${cx + hw - r * 0.7} ${cy + r * 0.35}
      Q ${cx + hw} ${cy} ${cx + hw - r * 0.7} ${cy - r * 0.35}
      L ${cx + r * 0.7} ${cy - hh + r * 0.35}
      Q ${cx} ${cy - hh} ${cx - r * 0.7} ${cy - hh + r * 0.35}
      Z
    `;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center select-none py-6 sm:py-10">
      {/* Ambient Radial Lighting Behind SVG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[450px] h-[350px] bg-emerald-500/15 rounded-full blur-[110px]" />
        <div className="w-[300px] h-[250px] bg-teal-400/10 rounded-full blur-[90px]" />
      </div>

      {/* Static Isometric SVG Stack */}
      <div className="relative w-full max-w-2xl aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center">
        <svg
          viewBox="0 0 600 480"
          className="w-full h-full overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Glass Surface Gradients */}
            <linearGradient id="glassTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.16" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id="glassMid1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.10" />
            </linearGradient>

            <linearGradient id="glassMid2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="glassBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.10" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.08" />
            </linearGradient>

            {/* Stroke Edge Gradients */}
            <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.4" />
            </linearGradient>

            {/* Central Vertical Synthesis Ray */}
            <linearGradient id="centerRay" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            {/* Radial Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Vertical Optical Axis */}
          <line
            x1="300"
            y1="90"
            x2="300"
            y2="390"
            stroke="url(#centerRay)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />

          {/* ======================================================== */}
          {/* LAYER 4 (BOTTOM): Coordinate Grid & Base Baseline        */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 350, 360, 175, 20)}
              fill="url(#glassBase)"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="1.2"
            />
            {/* Grid Coordinates on Plane 4 */}
            <g stroke="rgba(167, 243, 208, 0.2)" strokeWidth="0.75" strokeDasharray="3 6">
              <line x1="220" y1="310" x2="380" y2="390" />
              <line x1="160" y1="340" x2="320" y2="420" />
              <line x1="240" y1="390" x2="400" y2="310" />
              <line x1="180" y1="360" x2="340" y2="280" />
            </g>
            {/* Axis Tick Crosshairs */}
            <circle cx="300" cy="350" r="2" fill="#34d399" opacity="0.6" />
            <circle cx="250" cy="325" r="1.5" fill="#a7f3d0" opacity="0.4" />
            <circle cx="350" cy="375" r="1.5" fill="#a7f3d0" opacity="0.4" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 3 (MID-LOWER): Topographical Biometric Contours     */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 270, 360, 175, 20)}
              fill="url(#glassMid2)"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="1.2"
            />
            {/* Organic Contour Wave Paths */}
            <g fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1">
              <path d="M 200 270 Q 250 250, 300 270 T 400 270" />
              <path d="M 220 280 Q 270 260, 300 270 T 380 260" opacity="0.7" />
              <path d="M 240 260 Q 280 245, 300 270 T 360 280" opacity="0.5" />
            </g>
            <circle cx="300" cy="270" r="2.5" fill="#38bdf8" opacity="0.8" filter="url(#glow)" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 2 (MID-UPPER): Geometric Constellation Filaments   */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 190, 360, 175, 20)}
              fill="url(#glassMid1)"
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth="1.2"
            />
            {/* Connecting Constellation Lines */}
            <g stroke="rgba(45, 212, 191, 0.45)" strokeWidth="1" fill="none">
              <line x1="240" y1="180" x2="300" y2="190" />
              <line x1="300" y1="190" x2="360" y2="170" />
              <line x1="300" y1="190" x2="330" y2="225" />
              <line x1="240" y1="180" x2="270" y2="215" />
              <line x1="270" y1="215" x2="330" y2="225" />
            </g>
            {/* Constellation Nodes */}
            <circle cx="240" cy="180" r="2.5" fill="#2dd4bf" />
            <circle cx="360" cy="170" r="2.5" fill="#2dd4bf" />
            <circle cx="270" cy="215" r="2" fill="#a7f3d0" />
            <circle cx="330" cy="225" r="2.5" fill="#2dd4bf" />
            <circle cx="300" cy="190" r="3.5" fill="#ffffff" filter="url(#glow)" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 1 (TOP): Discrete Micro-Nodes & Habit Points       */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 110, 360, 175, 20)}
              fill="url(#glassTop)"
              stroke="url(#edgeGlow)"
              strokeWidth="1.5"
            />
            {/* Scattered Discrete Micro-Dots on Top Plane */}
            <g fill="#34d399">
              <circle cx="230" cy="95" r="2" opacity="0.6" />
              <circle cx="260" cy="85" r="2.5" opacity="0.8" />
              <circle cx="290" cy="75" r="1.8" opacity="0.5" />
              <circle cx="340" cy="85" r="2.2" opacity="0.7" />
              <circle cx="370" cy="100" r="1.8" opacity="0.6" />
              
              <circle cx="210" cy="120" r="2" opacity="0.5" />
              <circle cx="250" cy="115" r="2.5" opacity="0.85" />
              <circle cx="280" cy="105" r="2.2" opacity="0.7" />
              <circle cx="320" cy="110" r="2.8" opacity="0.9" />
              <circle cx="360" cy="125" r="2" opacity="0.6" />

              <circle cx="240" cy="140" r="2.2" opacity="0.75" />
              <circle cx="275" cy="135" r="2" opacity="0.6" />
              <circle cx="315" cy="130" r="2.5" opacity="0.8" />
              <circle cx="350" cy="145" r="1.8" opacity="0.5" />
            </g>

            {/* Central Emergent Synthesis Node */}
            <circle cx="300" cy="110" r="5" fill="#ffffff" filter="url(#glow)" />
            <circle cx="300" cy="110" r="9" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2 4" />
          </g>
        </svg>
      </div>
    </div>
  );
}
