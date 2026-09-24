"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function LayeredHealthPicture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position state for subtle 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for tilt
  const springConfig = { stiffness: 80, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const brightness = useSpring(useTransform(mouseY, [-0.5, 0.5], [1.05, 0.95]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-5xl mx-auto rounded-[2.5rem] bg-[#0A1017] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 select-none group perspective-1000"
    >
      {/* Ambient Deep Radial Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-indigo-500/10 rounded-full blur-[130px]" />
      </div>

      {/* 3D Floating Isometric Stack */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          filter: `brightness(${brightness})`,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: isHovered ? [0, -6, 0] : [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        className="relative w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center"
      >
        <Image
          src="/images/layered-health-picture.png"
          alt="Layered Health Picture - Precision 4-Plane Isometric Visualization"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 900px"
          className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </motion.div>

      {/* Subtle Bottom Caption / Metadata */}
      <div className="mt-4 sm:mt-6 flex items-center justify-between w-full max-w-3xl px-4 text-[10px] sm:text-xs font-mono text-cyan-200/40 tracking-wider uppercase border-t border-white/5 pt-4">
        <span>Layered Health Picture</span>
        <span className="text-emerald-400/60">4-Tier Convergent Plane</span>
        <span className="hidden sm:inline">Isometric Synthesis</span>
      </div>
    </div>
  );
}
