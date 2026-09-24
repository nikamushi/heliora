"use client";

import React from "react";

export function LayeredHealthPicture() {
  // 5 Isometric Rounded Rhombus Planes (Flatter isometric profile)
  // Width: 380, Height: 130
  const renderPlanePath = (cx: number, cy: number, w: number = 380, h: number = 130, r: number = 18) => {
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
    <div className="relative w-full max-w-3xl mx-auto flex items-center justify-center select-none py-2 sm:py-4">
      {/* Ambient Radial Lighting Behind SVG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[460px] h-[320px] bg-emerald-500/15 rounded-full blur-[110px]" />
        <div className="w-[320px] h-[240px] bg-teal-400/10 rounded-full blur-[80px]" />
      </div>

      {/* Static Isometric SVG Stack (5 Compact Layers) */}
      <div className="relative w-full max-w-xl aspect-[16/10] flex items-center justify-center">
        <svg
          viewBox="0 0 600 390"
          className="w-full h-full overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Glass Surface Gradients for 5 Layers */}
            <linearGradient id="glassLayer1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.14" />
            </linearGradient>

            <linearGradient id="glassLayer2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.11" />
            </linearGradient>

            <linearGradient id="glassLayer3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.10" />
            </linearGradient>

            <linearGradient id="glassLayer4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0e7490" stopOpacity="0.09" />
            </linearGradient>

            <linearGradient id="glassLayer5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.10" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.08" />
            </linearGradient>

            {/* Stroke Edge Glow */}
            <linearGradient id="topEdgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.4" />
            </linearGradient>

            {/* Central Vertical Synthesis Axis Ray */}
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
            y1="70"
            x2="300"
            y2="340"
            stroke="url(#centerRay)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />

          {/* ======================================================== */}
          {/* LAYER 5 (BASE): Coordinate Grid & Reference Plane        */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 295, 380, 130, 18)}
              fill="url(#glassLayer5)"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="1.2"
            />
            {/* Coordinate Grid on Plane 5 */}
            <g stroke="rgba(167, 243, 208, 0.18)" strokeWidth="0.75" strokeDasharray="3 6">
              <line x1="220" y1="265" x2="380" y2="325" />
              <line x1="160" y1="288" x2="320" y2="348" />
              <line x1="240" y1="325" x2="400" y2="265" />
              <line x1="180" y1="302" x2="340" y2="242" />
            </g>
            {/* Axis Tick Crosshairs */}
            <circle cx="300" cy="295" r="2" fill="#34d399" opacity="0.6" />
            <circle cx="250" cy="275" r="1.5" fill="#a7f3d0" opacity="0.4" />
            <circle cx="350" cy="315" r="1.5" fill="#a7f3d0" opacity="0.4" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 4: Biometric Contours & Topographical Waves        */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 245, 380, 130, 18)}
              fill="url(#glassLayer4)"
              stroke="rgba(255, 255, 255, 0.20)"
              strokeWidth="1.2"
            />
            {/* Organic Biometric Contour Waves */}
            <g fill="none" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="1">
              <path d="M 200 245 Q 250 230, 300 245 T 400 245" />
              <path d="M 220 253 Q 270 238, 300 245 T 380 238" opacity="0.7" />
              <path d="M 240 238 Q 280 226, 300 245 T 360 253" opacity="0.5" />
            </g>
            <circle cx="300" cy="245" r="2.5" fill="#22d3ee" opacity="0.8" filter="url(#glow)" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 3: Longitudinal Trajectory & Health Trends         */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 195, 380, 130, 18)}
              fill="url(#glassLayer3)"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="1.2"
            />
            {/* Health Trajectory Arc */}
            <g fill="none" strokeWidth="1.2">
              <path
                d="M 190 207 Q 245 180, 300 195"
                stroke="rgba(56, 189, 248, 0.6)"
              />
              <path
                d="M 300 195 Q 355 210, 410 183"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeDasharray="3 4"
              />
            </g>
            {/* Trajectory Milestone Points */}
            <circle cx="190" cy="207" r="2" fill="#38bdf8" opacity="0.7" />
            <circle cx="245" cy="184" r="2.5" fill="#38bdf8" opacity="0.85" />
            <circle cx="300" cy="195" r="3" fill="#ffffff" filter="url(#glow)" />
            <circle cx="355" cy="203" r="2" fill="#38bdf8" opacity="0.6" />
            <circle cx="410" cy="183" r="2.5" fill="#38bdf8" opacity="0.9" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 2: Multi-Factor Constellation & Network Filaments  */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 145, 380, 130, 18)}
              fill="url(#glassLayer2)"
              stroke="rgba(255, 255, 255, 0.26)"
              strokeWidth="1.2"
            />
            {/* Connecting Constellation Filaments */}
            <g stroke="rgba(45, 212, 191, 0.45)" strokeWidth="1" fill="none">
              <line x1="240" y1="137" x2="300" y2="145" />
              <line x1="300" y1="145" x2="360" y2="130" />
              <line x1="300" y1="145" x2="330" y2="171" />
              <line x1="240" y1="137" x2="270" y2="164" />
              <line x1="270" y1="164" x2="330" y2="171" />
            </g>
            {/* Constellation Biomarker Nodes */}
            <circle cx="240" cy="137" r="2.5" fill="#2dd4bf" />
            <circle cx="360" cy="130" r="2.5" fill="#2dd4bf" />
            <circle cx="270" cy="164" r="2" fill="#a7f3d0" />
            <circle cx="330" cy="171" r="2.5" fill="#2dd4bf" />
            <circle cx="300" cy="145" r="3.5" fill="#ffffff" filter="url(#glow)" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 1 (TOP): Discrete Micro-Nodes & Holistic Synthesis */}
          {/* ======================================================== */}
          <g>
            <path
              d={renderPlanePath(300, 95, 380, 130, 18)}
              fill="url(#glassLayer1)"
              stroke="url(#topEdgeGlow)"
              strokeWidth="1.5"
            />
            {/* Scattered Discrete Micro-Dots on Top Plane */}
            <g fill="#34d399">
              <circle cx="230" cy="84" r="2" opacity="0.6" />
              <circle cx="260" cy="76" r="2.5" opacity="0.8" />
              <circle cx="290" cy="68" r="1.8" opacity="0.5" />
              <circle cx="340" cy="76" r="2.2" opacity="0.7" />
              <circle cx="370" cy="87" r="1.8" opacity="0.6" />
              
              <circle cx="210" cy="102" r="2" opacity="0.5" />
              <circle cx="250" cy="99" r="2.5" opacity="0.85" />
              <circle cx="280" cy="91" r="2.2" opacity="0.7" />
              <circle cx="320" cy="95" r="2.8" opacity="0.9" />
              <circle cx="360" cy="106" r="2" opacity="0.6" />

              <circle cx="240" cy="117" r="2.2" opacity="0.75" />
              <circle cx="275" cy="114" r="2" opacity="0.6" />
              <circle cx="315" cy="110" r="2.5" opacity="0.8" />
              <circle cx="350" cy="121" r="1.8" opacity="0.5" />
            </g>

            {/* Central Emergent Synthesis Node */}
            <circle cx="300" cy="95" r="4.5" fill="#ffffff" filter="url(#glow)" />
            <circle cx="300" cy="95" r="8" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2 4" />
          </g>
        </svg>
      </div>
    </div>
  );
}


