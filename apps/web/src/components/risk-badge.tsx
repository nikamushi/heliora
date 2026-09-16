import { CircleCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/api";

interface RiskTone {
  label: string;
  Icon: LucideIcon;
  filledIcon: boolean;
  badgeClass: string;
  textClass: string;
  fillClass: string;
}

// Design.md §2.4: status is always icon + label + color, never color alone.
const RISK_TONES: Record<RiskLevel, RiskTone> = {
  low: {
    label: "Lower",
    Icon: CircleCheck,
    filledIcon: false,
    badgeClass: "bg-risk-low-soft text-risk-low",
    textClass: "text-risk-low",
    fillClass: "bg-risk-low",
  },
  moderate: {
    label: "Moderate",
    Icon: TriangleAlert,
    filledIcon: false,
    badgeClass: "bg-risk-moderate-soft text-risk-moderate",
    textClass: "text-risk-moderate",
    fillClass: "bg-risk-moderate",
  },
  high: {
    label: "Higher",
    Icon: TriangleAlert,
    filledIcon: true,
    badgeClass: "bg-risk-higher-soft text-risk-higher",
    textClass: "text-risk-higher",
    fillClass: "bg-risk-higher",
  },
};

export function getRiskTone(level: RiskLevel): RiskTone {
  return RISK_TONES[level];
}

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const { label, Icon, filledIcon, badgeClass } = RISK_TONES[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        badgeClass,
        className
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-3.5", filledIcon && "fill-current [&>path:not(:first-child)]:stroke-risk-higher-soft")}
      />
      {label}
    </span>
  );
}
