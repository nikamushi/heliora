"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function LayeredHealthPicture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Mouse position state for subtle 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for tilt
  const springConfig = { stiffness: 65, damping: 18 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const scale = useSpring(useTransform(mouseY, [-0.5, 0.5], [1.02, 0.98]), springConfig);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new window.Image();
    img.src = "/images/layered-health-picture.png";

    img.onload = () => {
      const width = img.naturalWidth || 1376;
      const height = img.naturalHeight || 768;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample background color from multiple corners for accuracy
        const bgR = (data[0] + data[(width - 1) * 4]) / 2;
        const bgG = (data[1] + data[(width - 1) * 4 + 1]) / 2;
        const bgB = (data[2] + data[(width - 1) * 4 + 2]) / 2;

        // Seamless alpha & luminance blending
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const diffR = r - bgR;
          const diffG = g - bgG;
          const diffB = b - bgB;
          const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

          if (dist < 6) {
            data[i + 3] = 0;
          } else if (dist < 36) {
            const alphaFactor = Math.pow((dist - 6) / 30, 1.2);
            data[i + 3] = Math.round(data[i + 3] * alphaFactor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setImageLoaded(true);
      } catch {
        setImageLoaded(true);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-4xl mx-auto flex items-center justify-center select-none perspective-1000 py-6 sm:py-10"
    >
      {/* Seamless Ambient Radial Lighting behind the Glass Stack */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[500px] h-[350px] bg-emerald-500/18 rounded-full blur-[110px]" />
        <div className="w-[320px] h-[240px] bg-teal-400/12 rounded-full blur-[90px]" />
      </div>

      {/* 3D Floating Isometric Stack - Seamless integration */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: isHovered ? [0, -6, 0] : [0, -12, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        className="relative w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain transition-all duration-700 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />
        {!imageLoaded && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/layered-health-picture.png"
            alt="Layered Health Picture"
            className="w-full h-full object-contain mix-blend-screen"
          />
        )}
      </motion.div>
    </div>
  );
}
