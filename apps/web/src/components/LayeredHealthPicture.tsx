"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function LayeredHealthPicture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Subtle scroll parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const layer1Y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const layer3Y = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const coreScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.05, 0.98]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const mouse = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
    };

    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width || 800;
      height = rect.height || 550;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = (e.clientX - rect.left) / rect.width;
      mouse.targetY = (e.clientY - rect.top) / rect.height;
    };

    const handleMouseLeave = () => {
      mouse.targetX = 0.5;
      mouse.targetY = 0.5;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Particles for discrete habits layer
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      layer: number;
    }> = [];

    for (let i = 0; i < 48; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0006,
        vy: (Math.random() - 0.5) * 0.0006,
        size: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.2,
        layer: Math.floor(Math.random() * 3),
      });
    }

    const render = () => {
      time += 0.008;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5 + (mouse.x - 0.5) * 35;
      const centerY = height * 0.5 + (mouse.y - 0.5) * 25;

      // ==========================================
      // LAYER 1: BIOMETRIC TOPOGRAPHIC WAVES (Lower z-depth)
      // ==========================================
      ctx.save();
      const waveCount = 7;
      for (let i = 0; i < waveCount; i++) {
        const progress = i / waveCount;
        ctx.beginPath();
        const yBase = height * 0.25 + progress * (height * 0.5);
        const amp = 24 + i * 4;
        const freq = 0.0035 - i * 0.0002;
        const phaseOffset = time * 0.8 + i * 0.6;

        for (let x = 0; x <= width; x += 6) {
          // Attenuate waves toward edges, focus curvature around center
          const distFromCenter = Math.abs(x - centerX) / (width * 0.5);
          const envelope = Math.exp(-distFromCenter * distFromCenter * 1.8);
          
          const y = yBase + 
            Math.sin(x * freq + phaseOffset) * amp * (0.4 + envelope * 0.8) +
            Math.cos(x * freq * 1.8 - phaseOffset * 0.5) * (amp * 0.35) * envelope;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const alpha = 0.12 + (1 - Math.abs(progress - 0.5) * 2) * 0.28;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(52, 211, 153, 0)`);
        gradient.addColorStop(0.3, `rgba(52, 211, 153, ${alpha * 0.5})`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 1.2})`);
        gradient.addColorStop(0.7, `rgba(45, 212, 191, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(52, 211, 153, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = i === 3 ? 2 : 1.2;
        ctx.stroke();
      }
      ctx.restore();

      // ==========================================
      // LAYER 2: SCATTER POINTS & INTERACTION FILAMENTS
      // ==========================================
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0.1) p.x = 0.9;
        if (p.x > 0.9) p.x = 0.1;
        if (p.y < 0.15) p.y = 0.85;
        if (p.y > 0.85) p.y = 0.15;

        const px = p.x * width + (mouse.x - 0.5) * (15 + p.layer * 15);
        const py = p.y * height + (mouse.y - 0.5) * (10 + p.layer * 10);

        // Distance to emergent center
        const dx = px - centerX;
        const dy = py - centerY;
        const distToCenter = Math.sqrt(dx * dx + dy * dy);

        // Draw connections between neighboring points near center
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2x = p2.x * width + (mouse.x - 0.5) * (15 + p2.layer * 15);
          const p2y = p2.y * height + (mouse.y - 0.5) * (10 + p2.layer * 10);
          const dist = Math.hypot(px - p2x, py - p2y);

          if (dist < 85 && (distToCenter < 220 || distToCenter < 140)) {
            const lineAlpha = (1 - dist / 85) * 0.22;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p2x, p2y);
            ctx.strokeStyle = `rgba(110, 231, 183, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw particle node
        const glow = Math.sin(time * 2 + i) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 243, 208, ${p.alpha * glow})`;
        ctx.shadowColor = "rgba(52, 211, 153, 0.6)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // ==========================================
      // LAYER 3: COHERENT INSIGHT FOCAL HARMONIC (Center Synthesis)
      // ==========================================
      ctx.save();
      const pulse = Math.sin(time * 1.5) * 0.08 + 1;
      const baseRadius = Math.min(width, height) * 0.18 * pulse;

      // Ambient radial energy glow
      const radialGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius * 2.2
      );
      radialGlow.addColorStop(0, "rgba(16, 185, 129, 0.28)");
      radialGlow.addColorStop(0.4, "rgba(5, 150, 105, 0.15)");
      radialGlow.addColorStop(0.7, "rgba(20, 184, 166, 0.05)");
      radialGlow.addColorStop(1, "rgba(16, 185, 129, 0)");

      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Harmonic orbital rings
      for (let r = 1; r <= 3; r++) {
        const ringRadius = baseRadius * (0.45 + r * 0.28);
        const rot = time * (r % 2 === 0 ? 0.4 : -0.3) + r;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rot);

        ctx.beginPath();
        // Elliptical harmonic shape
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.88, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(167, 243, 208, ${0.35 - r * 0.08})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 12]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Radiant center lens nucleus
      const nucleus = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 24
      );
      nucleus.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      nucleus.addColorStop(0.3, "rgba(110, 231, 183, 0.8)");
      nucleus.addColorStop(0.7, "rgba(16, 185, 129, 0.4)");
      nucleus.addColorStop(1, "rgba(16, 185, 129, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
      ctx.fillStyle = nucleus;
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-5xl mx-auto h-[460px] sm:h-[540px] md:h-[600px] rounded-[2.5rem] bg-gradient-to-b from-[#0e2417] via-[#0a1b12] to-[#07140d] border border-emerald-500/15 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-center p-6 sm:p-10 select-none group"
    >
      {/* Dynamic Background Noise Texture & Radial Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-emerald-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-600/10 rounded-full blur-[110px]" />
      </div>

      {/* Layer Canvas for organic waves, point clouds, and emergent nucleus */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* ======================================================== */}
      {/* FLOATING TRANSLUCENT ORGANIC GLASS SHEETS (3D Overlap)   */}
      {/* ======================================================== */}

      {/* Sheet 1: Top-Left Organic Membrane (Biometrics & Lifestyle Input) */}
      <motion.div
        style={{ y: layer1Y }}
        animate={{
          x: isHovered ? -10 : 0,
          rotate: isHovered ? -3 : -1.5,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
        className="absolute top-10 sm:top-14 left-6 sm:left-12 w-48 sm:w-64 md:w-72 h-32 sm:h-40 md:h-44 rounded-[2rem] bg-white/[0.035] backdrop-blur-md border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.3)] pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400/70 uppercase">
            Layer 01 // Input Pola
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1 w-20 bg-emerald-400/30 rounded-full" />
          <div className="h-1 w-32 bg-white/20 rounded-full" />
          <div className="h-1 w-16 bg-white/15 rounded-full" />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-200/40">
          <span>Aktivitas & Tidur</span>
          <span>Ritme Terpantau</span>
        </div>
      </motion.div>

      {/* Sheet 2: Bottom-Right Organic Membrane (Longitudinal Trajectory) */}
      <motion.div
        style={{ y: layer2Y }}
        animate={{
          x: isHovered ? 12 : 0,
          rotate: isHovered ? 2.5 : 1.2,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
        className="absolute bottom-10 sm:bottom-14 right-6 sm:right-12 w-52 sm:w-68 md:w-80 h-36 sm:h-44 md:h-48 rounded-[2rem] bg-white/[0.035] backdrop-blur-md border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.3)] pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-teal-400/70 uppercase">
            Layer 02 // Proyeksi Arah
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400/60" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-full bg-emerald-950/60 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 w-4/5 rounded-full" />
            </div>
            <span className="text-[10px] font-mono text-emerald-300/80">90H</span>
          </div>
          <p className="text-[11px] text-emerald-100/60 leading-tight">
            Korelasi kebiasaan berulang membentuk estimasi risiko terukur.
          </p>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-200/40 border-t border-white/5 pt-2">
          <span>Stabilitas Klinis</span>
          <span>Terkontrol</span>
        </div>
      </motion.div>

      {/* Central Glass Lensing Badge (Convergence Synthesis) */}
      <motion.div
        style={{ scale: coreScale }}
        animate={{
          scale: isHovered ? 1.06 : 1,
        }}
        transition={{ type: "spring", stiffness: 70, damping: 15 }}
        className="relative z-30 flex flex-col items-center justify-center text-center pointer-events-none space-y-2.5 px-6 py-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <span className="text-[9px] sm:text-[10px] font-mono font-semibold tracking-[0.3em] text-emerald-300 uppercase">
          Synthesized Insight
        </span>
        <div className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Gambaran Utuh</span>
          <span className="text-emerald-400 text-sm">✦</span>
        </div>
        <span className="text-[11px] text-emerald-100/70 max-w-[200px] leading-tight font-normal">
          Berbagai data hidup bersatu menjadi satu pemahaman.
        </span>
      </motion.div>

      {/* Corner Editorial Badges */}
      <div className="absolute top-6 left-8 text-[10px] font-mono text-emerald-300/40 tracking-widest uppercase pointer-events-none hidden sm:block">
        HELIORA // LAYERED PICTURE
      </div>
      <div className="absolute bottom-6 left-8 text-[10px] font-mono text-emerald-300/40 tracking-widest uppercase pointer-events-none hidden sm:block">
        ESTIMASI PROJEKSI METABOLIK
      </div>
      <div className="absolute top-6 right-8 text-[10px] font-mono text-emerald-300/40 tracking-widest uppercase pointer-events-none hidden sm:block">
        ORGANIC HARMONIC OVERLAY
      </div>
      <div className="absolute bottom-6 right-8 text-[10px] font-mono text-emerald-300/40 tracking-widest uppercase pointer-events-none hidden sm:block">
        60 FPS LIVE GENERATIVE
      </div>
    </div>
  );
}
