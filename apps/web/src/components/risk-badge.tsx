import { CircleCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel, StandardizedRiskLabel } from "@/types/api";

interface RiskTone {
  label: StandardizedRiskLabel;
  Icon: LucideIcon;
  filledIcon: boolean;
  textClass: string;
  fillClass: string;
}

// Design.md §2.4 & §15.1: status is always icon + label + color, strictly plain editorial typography.
const RISK_TONES: Record<RiskLevel, RiskTone> = {
  low: {
    label: "Lower",
    Icon: CircleCheck,
    filledIcon: false,
    textClass: "text-risk-low",
    fillClass: "bg-risk-low",
  },
  moderate: {
    label: "Moderate",
    Icon: TriangleAlert,
    filledIcon: false,
    textClass: "text-risk-moderate",
    fillClass: "bg-risk-moderate",
  },
  high: {
    label: "Higher",
    Icon: TriangleAlert,
    filledIcon: true,
    textClass: "text-risk-higher",
    fillClass: "bg-risk-higher",
  },
};

export function getRiskTone(level: RiskLevel): RiskTone {
  return RISK_TONES[level] ?? RISK_TONES.low;
}

interface RiskBadgeProps {
  level: RiskLevel;
  labelOverride?: StandardizedRiskLabel;
  className?: string;
}

export function RiskBadge({ level, labelOverride, className }: RiskBadgeProps) {
  const tone = RISK_TONES[level] ?? RISK_TONES.low;
  const label = labelOverride || tone.label;
  const { Icon, filledIcon, textClass } = tone;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-tight",
        textClass,
        className
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-3.5 shrink-0", filledIcon && "fill-current")}
      />
      <span>{label}</span>
    </span>
  );
}
