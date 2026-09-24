"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

interface StreamConfig {
  side: "left" | "right";
  name: string;
  colorStart: string;
  colorEnd: string;
  width: number;
  startYRatio: number;
  targetNode: { x: number; y: number };
  phase: number;
  speed: number;
  amplitude: number;
  frequency: number;
}

interface Particle {
  streamIndex: number;
  progress: number;
  speed: number;
  size: number;
  opacity: number;
  lateralOffset: number;
}

interface BilateralPatternFlowProps {
  progress?: MotionValue<number>;
}

export function BilateralPatternFlow({ progress }: BilateralPatternFlowProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const focalDotRef = useRef<SVGGElement>(null);

  const [transformOrigin, setTransformOrigin] = React.useState<string>("50% 45.6%");

  const internalScroll = useScroll({
    target: containerRef,
    offset: ["start 90%", "end 10%"],
  });

  const activeProgress = progress || internalScroll.scrollYProgress;
  // Responsive ease-out camera zoom focused directly on the central red dot
  const zoomScale = useTransform(
    activeProgress,
    [0.0, 0.15, 0.45, 0.8, 1.0],
    [1.0, 1.35, 3.2, 5.6, 6.8]
  );
  const bodyMeshOpacity = useTransform(activeProgress, [0.35, 0.75], [1.0, 0.15]);
  const macroDetailOpacity = useTransform(activeProgress, [0.25, 0.65], [0.0, 1.0]);

  // Dynamically compute exact central red dot screen-space anchor relative to the scene container
  useEffect(() => {
    const updateTransformOrigin = () => {
      if (!sceneRef.current || !focalDotRef.current) return;
      const sceneRect = sceneRef.current.getBoundingClientRect();
      const dotRect = focalDotRef.current.getBoundingClientRect();

      if (sceneRect.width > 0 && sceneRect.height > 0) {
        const dotCenterX = dotRect.left + dotRect.width / 2 - sceneRect.left;
        const dotCenterY = dotRect.top + dotRect.height / 2 - sceneRect.top;

        const originXPercent = (dotCenterX / sceneRect.width) * 100;
        const originYPercent = (dotCenterY / sceneRect.height) * 100;

        if (originXPercent > 0 && originYPercent > 0) {
          setTransformOrigin(`${originXPercent.toFixed(4)}% ${originYPercent.toFixed(4)}%`);
        }
      }
    };

    updateTransformOrigin();
    window.addEventListener("resize", updateTransformOrigin);
    return () => window.removeEventListener("resize", updateTransformOrigin);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context = ctx;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
    };

    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const streams: StreamConfig[] = [
      // 12 LEFT-ORIGIN STREAMS (Lifestyle & Habits -> Converge to Central Body Core)
      {
        side: "left",
        name: "cranial-circadian",
        colorStart: "rgba(45, 90, 67, 0.45)",
        colorEnd: "rgba(15, 122, 78, 0.98)",
        width: 1.8,
        startYRatio: 0.08,
        targetNode: { x: 0, y: -20 },
        phase: 0.2,
        speed: 0.0019,
        amplitude: 22,
        frequency: 2.2,
      },
      {
        side: "left",
        name: "pineal-focus",
        colorStart: "rgba(100, 116, 139, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.92)",
        width: 1.5,
        startYRatio: 0.16,
        targetNode: { x: 0, y: -20 },
        phase: 1.1,
        speed: 0.0022,
        amplitude: 24,
        frequency: 2.4,
      },
      {
        side: "left",
        name: "thyroid-metabolism",
        colorStart: "rgba(138, 154, 134, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.9)",
        width: 1.6,
        startYRatio: 0.24,
        targetNode: { x: 0, y: -20 },
        phase: 1.9,
        speed: 0.0018,
        amplitude: 25,
        frequency: 2.1,
      },
      {
        side: "left",
        name: "shoulder-kinetic",
        colorStart: "rgba(45, 90, 67, 0.5)",
        colorEnd: "rgba(15, 122, 78, 0.98)",
        width: 2.2,
        startYRatio: 0.32,
        targetNode: { x: 0, y: -20 },
        phase: 2.8,
        speed: 0.0017,
        amplitude: 26,
        frequency: 2.0,
      },
      {
        side: "left",
        name: "pulmonary-breath",
        colorStart: "rgba(138, 154, 134, 0.5)",
        colorEnd: "rgba(45, 90, 67, 0.95)",
        width: 1.9,
        startYRatio: 0.40,
        targetNode: { x: 0, y: -20 },
        phase: 3.6,
        speed: 0.002,
        amplitude: 24,
        frequency: 2.3,
      },
      {
        side: "left",
        name: "cardiac-vitality",
        colorStart: "rgba(217, 119, 87, 0.6)",
        colorEnd: "rgba(45, 90, 67, 0.98)",
        width: 2.5,
        startYRatio: 0.48,
        targetNode: { x: 0, y: -20 },
        phase: 4.4,
        speed: 0.0015,
        amplitude: 25,
        frequency: 1.9,
      },
      {
        side: "left",
        name: "elbow-kinetic",
        colorStart: "rgba(100, 116, 139, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.9)",
        width: 1.7,
        startYRatio: 0.56,
        targetNode: { x: 0, y: -20 },
        phase: 5.2,
        speed: 0.0021,
        amplitude: 23,
        frequency: 2.5,
      },
      {
        side: "left",
        name: "solar-metabolic",
        colorStart: "rgba(217, 119, 87, 0.5)",
        colorEnd: "rgba(45, 90, 67, 0.92)",
        width: 2.0,
        startYRatio: 0.64,
        targetNode: { x: 0, y: -20 },
        phase: 0.7,
        speed: 0.0018,
        amplitude: 22,
        frequency: 2.2,
      },
      {
        side: "left",
        name: "wrist-hand",
        colorStart: "rgba(45, 90, 67, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.88)",
        width: 1.5,
        startYRatio: 0.72,
        targetNode: { x: 0, y: -20 },
        phase: 1.5,
        speed: 0.0019,
        amplitude: 22,
        frequency: 2.4,
      },
      {
        side: "left",
        name: "hip-pelvis",
        colorStart: "rgba(100, 116, 139, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.88)",
        width: 1.8,
        startYRatio: 0.80,
        targetNode: { x: 0, y: -20 },
        phase: 2.4,
        speed: 0.0016,
        amplitude: 24,
        frequency: 2.1,
      },
      {
        side: "left",
        name: "knee-joint",
        colorStart: "rgba(138, 154, 134, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.85)",
        width: 1.7,
        startYRatio: 0.88,
        targetNode: { x: 0, y: -20 },
        phase: 3.2,
        speed: 0.0022,
        amplitude: 25,
        frequency: 2.6,
      },
      {
        side: "left",
        name: "ankle-grounding",
        colorStart: "rgba(100, 116, 139, 0.4)",
        colorEnd: "rgba(45, 90, 67, 0.82)",
        width: 1.4,
        startYRatio: 0.94,
        targetNode: { x: 0, y: -20 },
        phase: 4.0,
        speed: 0.0019,
        amplitude: 23,
        frequency: 2.8,
      },

      // 12 RIGHT-ORIGIN STREAMS (Internal Biomarkers -> Converge to Central Body Core)
      {
        side: "right",
        name: "crown-cranial",
        colorStart: "rgba(45, 90, 67, 0.45)",
        colorEnd: "rgba(15, 122, 78, 0.98)",
        width: 1.8,
        startYRatio: 0.08,
        targetNode: { x: 0, y: -20 },
        phase: 0.5,
        speed: 0.0019,
        amplitude: 22,
        frequency: 2.2,
      },
      {
        side: "right",
        name: "neural-plasticity",
        colorStart: "rgba(45, 90, 67, 0.45)",
        colorEnd: "rgba(15, 122, 78, 0.95)",
        width: 1.8,
        startYRatio: 0.16,
        targetNode: { x: 0, y: -20 },
        phase: 1.3,
        speed: 0.0018,
        amplitude: 24,
        frequency: 2.3,
      },
      {
        side: "right",
        name: "thyroid-autonomic",
        colorStart: "rgba(138, 154, 134, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.9)",
        width: 1.5,
        startYRatio: 0.24,
        targetNode: { x: 0, y: -20 },
        phase: 2.1,
        speed: 0.0021,
        amplitude: 25,
        frequency: 2.4,
      },
      {
        side: "right",
        name: "musculoskeletal-right",
        colorStart: "rgba(45, 90, 67, 0.5)",
        colorEnd: "rgba(15, 122, 78, 0.98)",
        width: 2.2,
        startYRatio: 0.32,
        targetNode: { x: 0, y: -20 },
        phase: 3.0,
        speed: 0.0016,
        amplitude: 26,
        frequency: 2.0,
      },
      {
        side: "right",
        name: "vascular-oxygen",
        colorStart: "rgba(100, 116, 139, 0.5)",
        colorEnd: "rgba(45, 90, 67, 0.95)",
        width: 1.9,
        startYRatio: 0.40,
        targetNode: { x: 0, y: -20 },
        phase: 3.8,
        speed: 0.0019,
        amplitude: 24,
        frequency: 2.3,
      },
      {
        side: "right",
        name: "hrv-hemodynamic",
        colorStart: "rgba(217, 119, 87, 0.6)",
        colorEnd: "rgba(45, 90, 67, 0.98)",
        width: 2.5,
        startYRatio: 0.48,
        targetNode: { x: 0, y: -20 },
        phase: 4.6,
        speed: 0.0014,
        amplitude: 25,
        frequency: 1.9,
      },
      {
        side: "right",
        name: "elbow-right",
        colorStart: "rgba(45, 90, 67, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.9)",
        width: 1.7,
        startYRatio: 0.56,
        targetNode: { x: 0, y: -20 },
        phase: 5.4,
        speed: 0.002,
        amplitude: 23,
        frequency: 2.5,
      },
      {
        side: "right",
        name: "endocrine-navel",
        colorStart: "rgba(217, 119, 87, 0.5)",
        colorEnd: "rgba(45, 90, 67, 0.92)",
        width: 2.0,
        startYRatio: 0.64,
        targetNode: { x: 0, y: -20 },
        phase: 0.9,
        speed: 0.0017,
        amplitude: 22,
        frequency: 2.2,
      },
      {
        side: "right",
        name: "wrist-right",
        colorStart: "rgba(100, 116, 139, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.88)",
        width: 1.5,
        startYRatio: 0.72,
        targetNode: { x: 0, y: -20 },
        phase: 1.7,
        speed: 0.0021,
        amplitude: 22,
        frequency: 2.4,
      },
      {
        side: "right",
        name: "cellular-hip",
        colorStart: "rgba(45, 90, 67, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.88)",
        width: 1.8,
        startYRatio: 0.80,
        targetNode: { x: 0, y: -20 },
        phase: 2.5,
        speed: 0.0019,
        amplitude: 24,
        frequency: 2.1,
      },
      {
        side: "right",
        name: "articular-knee",
        colorStart: "rgba(100, 116, 139, 0.45)",
        colorEnd: "rgba(45, 90, 67, 0.85)",
        width: 1.7,
        startYRatio: 0.88,
        targetNode: { x: 0, y: -20 },
        phase: 3.3,
        speed: 0.0022,
        amplitude: 25,
        frequency: 2.6,
      },
      {
        side: "right",
        name: "plantar-foot",
        colorStart: "rgba(45, 90, 67, 0.4)",
        colorEnd: "rgba(45, 90, 67, 0.82)",
        width: 1.4,
        startYRatio: 0.94,
        targetNode: { x: 0, y: -20 },
        phase: 4.1,
        speed: 0.0018,
        amplitude: 23,
        frequency: 2.8,
      },
    ];

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 64;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        streamIndex: Math.floor(Math.random() * streams.length),
        progress: Math.random(),
        speed: 0.0015 + Math.random() * 0.0022,
        size: 1.2 + Math.random() * 2.0,
        opacity: 0.35 + Math.random() * 0.65,
        lateralOffset: (Math.random() - 0.5) * 4,
      });
    }

    function calculatePointOnStream(
      stream: StreamConfig,
      t: number,
      timestamp: number,
      targetX: number,
      targetY: number
    ) {
      let startX: number;
      if (stream.side === "left") {
        startX = width * 0.005;
      } else {
        startX = width * 0.995;
      }

      const startY = height * stream.startYRatio;
      const currentX = startX + (targetX - startX) * t;

      // Wave dampens to zero at t = 1 for 100% seamless landing on the focal dot
      const convergenceFactor = Math.sin(t * Math.PI * 0.5) * (1 - t);
      const wave1 =
        Math.sin(
          t * stream.frequency * Math.PI * 2 -
            timestamp * stream.speed +
            stream.phase
        ) *
        stream.amplitude *
        convergenceFactor;
      const wave2 =
        Math.cos(
          t * stream.frequency * 1.4 - timestamp * (stream.speed * 0.7)
        ) *
        (stream.amplitude * 0.32) *
        convergenceFactor;

      const easeT = t * t * (3 - 2 * t);
      let currentY = startY + (targetY - startY) * easeT + wave1 + wave2;

      if (mouse.active) {
        const dx = currentX - mouse.x;
        const dy = currentY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 160;
        if (dist < maxDist) {
          const influence = (1 - dist / maxDist) * convergenceFactor;
          const ripple =
            Math.sin(dist * 0.08 - timestamp * 0.005) * 12 * influence;
          currentY += (dy / (dist || 1)) * ripple;
        }
      }

      return { x: currentX, y: currentY };
    }

    function render(timestamp: number) {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      context.clearRect(0, 0, width, height);

      // Dynamically compute exact focal dot center in canvas pixel coordinates
      const containerElem = containerRef.current;
      const bodyElem = bodyRef.current;
      let focalX = width * 0.5;
      let focalY = height * 0.5;

      if (containerElem && bodyElem) {
        const cRect = containerElem.getBoundingClientRect();
        const bRect = bodyElem.getBoundingClientRect();
        if (cRect.width > 0 && bRect.height > 0) {
          focalX = bRect.left - cRect.left + bRect.width * 0.5;
          // SVG viewBox is "-50 -108 100 216", dot is at cy = -20
          focalY = bRect.top - cRect.top + bRect.height * (0.5 + (-20) / 216);
        }
      }

      // 1. Central Convergence Aura
      const breathe = Math.sin(timestamp * 0.0018) * 0.5 + 0.5;
      const haloRadius = 46 + breathe * 22;
      const auraGrad = context.createRadialGradient(
        focalX,
        focalY,
        0,
        focalX,
        focalY,
        haloRadius
      );
      auraGrad.addColorStop(0, "rgba(45, 90, 67, 0.24)");
      auraGrad.addColorStop(0.45, "rgba(188, 238, 211, 0.14)");
      auraGrad.addColorStop(1, "rgba(250, 249, 246, 0)");

      context.save();
      context.fillStyle = auraGrad;
      context.beginPath();
      context.arc(focalX, focalY, haloRadius, 0, Math.PI * 2);
      context.fill();
      context.restore();

      // 2. Translucent Biological Stream Ribbons
      streams.forEach((stream) => {
        const steps = 64;
        const points = [];

        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          points.push(calculatePointOnStream(stream, t, timestamp, focalX, focalY));
        }

        const startX = stream.side === "left" ? width * 0.01 : width * 0.99;
        const grad = context.createLinearGradient(startX, 0, focalX, 0);
        grad.addColorStop(0, stream.colorStart);
        grad.addColorStop(0.65, stream.colorStart);
        grad.addColorStop(0.92, stream.colorEnd);
        grad.addColorStop(1, stream.colorEnd);

        context.save();
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        const lastPt = points[points.length - 1];
        context.lineTo(lastPt.x, lastPt.y);

        context.strokeStyle = grad;
        context.lineWidth = stream.width;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();

        context.lineWidth = stream.width * 2.5;
        context.globalAlpha = 0.14;
        context.stroke();

        // Terminal anchor glow right at the body dot connection point
        const isWarm =
          stream.name.includes("vitality") ||
          stream.name.includes("metabolic") ||
          stream.name.includes("hemodynamic");
        const dotColor = isWarm ? "217, 119, 87" : "15, 122, 78";
        context.fillStyle = `rgba(${dotColor}, 0.5)`;
        context.beginPath();
        context.arc(lastPt.x, lastPt.y, 3.5, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      // 3. Biometric Signal Particles
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 0.99) {
          p.progress = 0.01;
          p.streamIndex = Math.floor(Math.random() * streams.length);
        }

        const stream = streams[p.streamIndex];
        const pt = calculatePointOnStream(stream, p.progress, timestamp, focalX, focalY);

        const alpha = Math.min(1, Math.sin(p.progress * Math.PI)) * p.opacity;
        const particleGrad = context.createRadialGradient(
          pt.x,
          pt.y + p.lateralOffset,
          0,
          pt.x,
          pt.y + p.lateralOffset,
          p.size * 2
        );

        const isWarm =
          stream.name.includes("metabolic") ||
          stream.name.includes("stress") ||
          stream.name.includes("vitality");
        const coreColor = isWarm ? "217, 119, 87" : "45, 90, 67";

        particleGrad.addColorStop(0, `rgba(${coreColor}, ${alpha * 0.95})`);
        particleGrad.addColorStop(0.5, `rgba(${coreColor}, ${alpha * 0.35})`);
        particleGrad.addColorStop(1, `rgba(${coreColor}, 0)`);

        context.save();
        context.beginPath();
        context.fillStyle = particleGrad;
        context.arc(pt.x, pt.y + p.lateralOffset, p.size * 2, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        context.beginPath();
        context.arc(pt.x, pt.y + p.lateralOffset, p.size * 0.55, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      // 4. Continuously Revolving Bio-Orbital Rings around the focal core
      const spinAngle1 = timestamp * 0.0006;
      const spinAngle2 = -timestamp * 0.001;
      const spinAngle3 = timestamp * 0.0018;

      // Outer Orbital Ring (Clockwise segmented)
      context.save();
      context.translate(focalX, focalY);
      context.rotate(spinAngle1);
      context.strokeStyle = "rgba(15, 122, 78, 0.45)";
      context.lineWidth = 1.2;
      context.setLineDash([7, 9, 3, 9]);
      context.beginPath();
      context.arc(0, 0, 36, 0, Math.PI * 2);
      context.stroke();

      // Satellite orbiting beacon dots on Ring 1
      context.fillStyle = "rgba(15, 122, 78, 0.85)";
      context.beginPath();
      context.arc(36, 0, 2.5, 0, Math.PI * 2);
      context.arc(-36, 0, 2.5, 0, Math.PI * 2);
      context.fill();
      context.restore();

      // Middle Orbital Ring (Counter-clockwise with terracotta nodes)
      context.save();
      context.translate(focalX, focalY);
      context.rotate(spinAngle2);
      context.strokeStyle = "rgba(217, 119, 87, 0.55)";
      context.lineWidth = 1.0;
      context.setLineDash([5, 7, 2, 7]);
      context.beginPath();
      context.arc(0, 0, 23, 0, Math.PI * 2);
      context.stroke();

      // Satellite terracotta nodes on Ring 2
      context.fillStyle = "rgba(217, 119, 87, 0.95)";
      context.beginPath();
      context.arc(0, 23, 2.2, 0, Math.PI * 2);
      context.arc(0, -23, 2.2, 0, Math.PI * 2);
      context.fill();
      context.restore();

      // Inner Fast Calibrated Ring
      context.save();
      context.translate(focalX, focalY);
      context.rotate(spinAngle3);
      context.strokeStyle = "rgba(45, 90, 67, 0.7)";
      context.lineWidth = 0.9;
      context.setLineDash([3, 4]);
      context.beginPath();
      context.arc(0, 0, 14, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      // Expanding Bio-Radar Ripple Pulse
      const rippleProgress = (timestamp % 2400) / 2400;
      const rippleRadius = 16 + rippleProgress * 38;
      const rippleAlpha = (1 - rippleProgress) * 0.35;
      context.save();
      context.strokeStyle = `rgba(15, 122, 78, ${rippleAlpha})`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(focalX, focalY, rippleRadius, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      // 5. Pola Kesehatan Center Organic Bio-pulse
      context.save();
      const pulseScale = 1 + breathe * 0.22;
      const coreGrad = context.createRadialGradient(focalX, focalY, 0, focalX, focalY, 38 * pulseScale);
      coreGrad.addColorStop(0, "rgba(45, 90, 67, 0.22)");
      coreGrad.addColorStop(0.55, "rgba(15, 122, 78, 0.06)");
      coreGrad.addColorStop(1, "rgba(45, 90, 67, 0)");
      context.fillStyle = coreGrad;
      context.beginPath();
      context.arc(focalX, focalY, 38 * pulseScale, 0, Math.PI * 2);
      context.fill();
      context.restore();

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] md:min-h-[540px] max-h-[640px] z-10 cursor-crosshair flex items-center justify-center overflow-hidden"
    >
      {/* Unified Composed Visualization Scene: Centered precisely on the Central Red Dot */}
      <motion.div 
        ref={sceneRef}
        style={{ 
          scale: zoomScale, 
          transformOrigin: transformOrigin 
        }}
        className="relative w-full h-full flex items-center justify-center will-change-transform"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block absolute inset-0 pointer-events-none" 
        />

        {/* Central Human Bio-Mesh / Topographic Wave Silhouette */}
        <div 
          ref={bodyRef} 
          className="relative w-36 h-60 sm:w-40 sm:h-68 md:w-48 md:h-80 flex items-center justify-center pointer-events-none select-none"
        >
          {/* Subtle Ambient Radial Glow behind the body */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/20 via-emerald-600/25 to-transparent rounded-full blur-3xl -z-10" />

          {/* Topographic Bio-Wave Mesh Human Figure */}
          <svg
            viewBox="-50 -108 100 216"
            className="w-full h-full drop-shadow-sm overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8A9A86" stopOpacity="0.4" />
                <stop offset="30%" stopColor="#2D5A43" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#0F7A4E" stopOpacity="1" />
                <stop offset="70%" stopColor="#2D5A43" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8A9A86" stopOpacity="0.4" />
              </linearGradient>

              <linearGradient id="bodyBackdrop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2D5A43" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#0F7A4E" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#8A9A86" stopOpacity="0.04" />
              </linearGradient>

              <radialGradient id="coreAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D97757" stopOpacity="0.75" />
                <stop offset="35%" stopColor="#D97757" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#0F7A4E" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0F7A4E" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Fading Outer Body Mesh Silhouette on Zoom */}
            <motion.g style={{ opacity: bodyMeshOpacity }}>
              {/* Subtle Outer Human Silhouette Contour Reference */}
              <path
                d="M 0 -96
                   C 6.5 -96 11.5 -90 11.5 -82 
                   C 11.5 -73.5 7.5 -67.5 4.5 -65.5 
                   C 4.5 -63 6.5 -61 9.5 -60 
                   C 17.5 -57.5 25.5 -53.5 27.5 -48 
                   C 29.5 -42.5 28.5 -28 26.5 -8 
                   C 25.5 7 23.5 22 21.5 37 
                   C 20.5 42 18.5 47 16.5 50 
                   C 14.5 52 12.5 50 12.5 46 
                   C 14.5 37 16.5 20 16.5 4 
                   C 16.5 -13 14.5 -33 14.5 -40 
                   C 13.5 -33 14.5 -18 13.5 -3 
                   C 12.5 12 14.5 22 15.5 30 
                   C 15.5 40 14.5 57 12.5 74 
                   C 10.5 90 8.5 100 6.5 106 
                   C 4.5 108 1.5 108 1.5 104 
                   C 2.5 97 3.5 82 3.5 67 
                   C 3.5 52 2.5 40 0.5 30 
                   C 0 30 0 30 -0.5 30 
                   C -2.5 40 -3.5 52 -3.5 67 
                   C -3.5 82 -2.5 97 -1.5 104 
                   C -1.5 108 -4.5 108 -6.5 106 
                   C -8.5 100 -10.5 90 -12.5 74 
                   C -14.5 57 -15.5 40 -15.5 30 
                   C -14.5 22 -12.5 12 -13.5 -3 
                   C -14.5 -18 -13.5 -33 -14.5 -40 
                   C -14.5 -33 -16.5 -13 -16.5 4 
                   C -16.5 20 -14.5 37 -12.5 46 
                   C -12.5 50 -14.5 52 -16.5 50 
                   C -18.5 47 -20.5 42 -21.5 37 
                   C -23.5 22 -25.5 7 -26.5 -8 
                   C -28.5 -28 -29.5 -42.5 -27.5 -48 
                   C -25.5 -53.5 -17.5 -57.5 -9.5 -60 
                   C -6.5 -61 -4.5 -63 -4.5 -65.5 
                   C -7.5 -67.5 -11.5 -73.5 -11.5 -82 
                   C -11.5 -90 -6.5 -96 0 -96 Z"
                fill="url(#bodyBackdrop)"
                stroke="#2D5A43"
                strokeOpacity="0.2"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />

              {/* Central Bio-Meridian Vertical Axis */}
              <line
                x1="0"
                y1="-88"
                x2="0"
                y2="28"
                stroke="#0F7A4E"
                strokeOpacity="0.35"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Topographic Wave Slices Group */}
              <g stroke="url(#waveGrad)" strokeWidth="1.25" strokeLinecap="round">
                {/* Head Slices */}
                <path d="M -5 -92 Q 0 -93.5 5 -92" />
                <path d="M -8.5 -88 Q 0 -90 8.5 -88" />
                <path d="M -11 -84 Q 0 -86.5 11 -84" />
                <path d="M -11.5 -80 Q 0 -82.5 11.5 -80" />
                <path d="M -9.5 -76 Q 0 -78 9.5 -76" />
                <path d="M -7 -72 Q 0 -73.5 7 -72" />

                {/* Neck Slices */}
                <path d="M -5.5 -68 Q 0 -69.5 5.5 -68" />
                <path d="M -6.5 -64 Q 0 -65.5 6.5 -64" />
                <path d="M -9.5 -60 Q 0 -62 9.5 -60" />

                {/* Shoulders & Upper Chest */}
                <path d="M -18 -56 Q -9 -58 0 -57 Q 9 -58 18 -56" />
                <path d="M -24 -52 Q -12 -54.5 0 -53 Q 12 -54.5 24 -52" />
                <path d="M -27.5 -48 Q -14 -51 0 -49 Q 14 -51 27.5 -48" />
                <path d="M -28.5 -44 Q -14 -47 0 -45 Q 14 -47 28.5 -44" />
                <path d="M -28 -40 Q -14 -43 0 -41 Q 14 -43 28 -40" />
                <path d="M -27 -36 Q -13.5 -39 0 -37 Q 13.5 -39 27 -36" />
                <path d="M -26 -32 Q -13 -35 0 -33 Q 13 -35 26 -32" />

                {/* Core / Heart / Solar Plexus Area */}
                <path d="M -25 -28 Q -12.5 -31 0 -29 Q 12.5 -31 25 -28" />
                <path d="M -24 -24 Q -12 -27 0 -25 Q 12 -27 24 -24" />
                <path d="M -23 -20 Q -11 -23 0 -21 Q 11 -23 23 -20" />
                <path d="M -22 -16 Q -10 -19 0 -17 Q 10 -19 22 -16" />
                <path d="M -21 -12 Q -9.5 -15 0 -13 Q 9.5 -15 21 -12" />
                <path d="M -20 -8 Q -9 -11 0 -9 Q 9 -11 20 -8" />

                {/* Waist / Navel & Pelvis */}
                <path d="M -19 -4 Q -8.5 -7 0 -5 Q 8.5 -7 19 -4" />
                <path d="M -18.5 0 Q -8.5 -3 0 -1 Q 8.5 -3 18.5 0" />
                <path d="M -18 4 Q -8.5 1 0 3 Q 8.5 1 18 4" />
                <path d="M -17.5 8 Q -9 5 0 7 Q 9 5 17.5 8" />
                <path d="M -17 12 Q -9 9 0 11 Q 9 9 17 12" />
                <path d="M -16.5 16 Q -9.5 13 0 15 Q 9.5 13 16.5 16" />
                <path d="M -16 20 Q -9.5 17 0 19 Q 9.5 17 16 20" />
                <path d="M -15.5 24 Q -9 21 0 23 Q 9 21 15.5 24" />
                <path d="M -15 28 Q -8 25 0 27 Q 8 25 15 28" />

                {/* Legs / Kinetic Slices */}
                <path d="M -15 34 Q -9 31.5 -3 34 M 3 34 Q 9 31.5 15 34" />
                <path d="M -14.5 40 Q -8.5 37.5 -3 40 M 3 40 Q 8.5 37.5 14.5 40" />
                <path d="M -14 46 Q -8.5 43.5 -3 46 M 3 46 Q 8.5 43.5 14 46" />
                <path d="M -13 52 Q -8 49.5 -3.2 52 M 3.2 52 Q 8 49.5 13 52" />
                <path d="M -12 58 Q -7.5 55.5 -3.5 58 M 3.5 58 Q 7.5 55.5 12 58" />
                <path d="M -11 64 Q -7 61.5 -3.5 64 M 3.5 64 Q 7 61.5 11 64" />
                <path d="M -10.5 70 Q -7 67.5 -3.5 70 M 3.5 70 Q 7 67.5 10.5 70" />
                <path d="M -10 76 Q -6.5 73.5 -3.5 76 M 3.5 76 Q 6.5 73.5 10 76" />
                <path d="M -9.5 82 Q -6.5 79.5 -3.5 82 M 3.5 82 Q 6.5 79.5 9.5 82" />
                <path d="M -9 88 Q -6 85.5 -3.5 88 M 3.5 88 Q 6 85.5 9 88" />
                <path d="M -8.5 94 Q -5.5 91.5 -3.5 94 M 3.5 94 Q 5.5 91.5 8.5 94" />
                <path d="M -8 100 Q -5.5 97.5 -3 100 M 3 100 Q 5.5 97.5 8 100" />
                <path d="M -7.5 105 Q -5 102.5 -2.5 105 M 2.5 105 Q 5 102.5 7.5 105" />
              </g>
            </motion.g>

            {/* Central Focal Core: Revolving Bio-Orbital Rings and PRIMARY Central Red Dot */}
            <g transform="translate(0, -20)">
              {/* Radiant Core Aura */}
              <circle cx="0" cy="0" r="26" fill="url(#coreAura)" />

              {/* Macro High-Detail Telemetry Rings (revealed as you zoom in) */}
              <motion.g style={{ opacity: macroDetailOpacity }}>
                {/* Outermost Telemetry Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="30"
                  stroke="#0F7A4E"
                  strokeWidth="0.5"
                  strokeDasharray="1 3"
                  strokeOpacity="0.4"
                  fill="none"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="24"
                  stroke="#D97757"
                  strokeWidth="0.6"
                  strokeDasharray="2 4"
                  strokeOpacity="0.45"
                  fill="none"
                />
              </motion.g>

              {/* Outer Clockwise Revolving Orbital Ring */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to="360"
                  dur="14s"
                  repeatCount="indefinite"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  stroke="#0F7A4E"
                  strokeWidth="1.2"
                  strokeDasharray="4 6 2 6"
                  strokeOpacity="0.75"
                  fill="none"
                />
                <circle cx="18" cy="0" r="1.6" fill="#0F7A4E" />
                <circle cx="-18" cy="0" r="1.6" fill="#0F7A4E" />
                <circle cx="0" cy="18" r="1.4" fill="#D97757" />
                <circle cx="0" cy="-18" r="1.4" fill="#D97757" />
              </g>

              {/* Middle Counter-Clockwise Revolving Ring */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="360"
                  to="0"
                  dur="8.5s"
                  repeatCount="indefinite"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="11.5"
                  stroke="#D97757"
                  strokeWidth="1"
                  strokeDasharray="3 4 1 4"
                  strokeOpacity="0.8"
                  fill="none"
                />
                <circle cx="0" cy="11.5" r="1.5" fill="#D97757" />
                <circle cx="0" cy="-11.5" r="1.5" fill="#D97757" />
                <circle cx="11.5" cy="0" r="1.2" fill="#0F7A4E" opacity="0.8" />
                <circle cx="-11.5" cy="0" r="1.2" fill="#0F7A4E" opacity="0.8" />
              </g>

              {/* Inner Fast Orbiting Calibrated Ring */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to="360"
                  dur="4.5s"
                  repeatCount="indefinite"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="7"
                  stroke="#0F7A4E"
                  strokeWidth="0.85"
                  strokeDasharray="2 3"
                  strokeOpacity="0.65"
                  fill="none"
                />
                <circle cx="7" cy="0" r="1.2" fill="#ffffff" />
              </g>

              {/* Solid Core Vivid Red Focal Dot (PRIMARY FOCAL POINT) */}
              <g id="central-red-dot" ref={focalDotRef}>
                {/* Soft warm aura */}
                <circle cx="0" cy="0" r="9" fill="#D97757" fillOpacity="0.3" />
                <circle cx="0" cy="0" r="6" fill="#D97757" fillOpacity="0.55" />
                {/* Solid Core Red Dot */}
                <circle cx="0" cy="0" r="4.2" fill="#D97757" />
                <circle cx="0" cy="0" r="3.2" fill="#C53030" />
                <circle cx="0" cy="0" r="2.2" fill="#E53E3E" />
                {/* Crisp Specular Glint */}
                <circle cx="-0.8" cy="-0.8" r="1.0" fill="#FFFFFF" opacity="0.95" />
              </g>
            </g>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
