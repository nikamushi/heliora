import { CircleCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel, StandardizedRiskLabel } from "@/types/api";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface RiskTone {
  label: StandardizedRiskLabel;
  Icon: LucideIcon;
  filledIcon: boolean;
  textClass: string;
  fillClass: string;
  guidanceText: string;
}

// Design.md §2.4 & §15.1: status is always icon + label + color, strictly plain editorial typography.
const RISK_TONES: Record<RiskLevel, RiskTone> = {
  low: {
    label: "Lower",
    Icon: CircleCheck,
    filledIcon: false,
    textClass: "text-risk-low",
    fillClass: "bg-risk-low",
    guidanceText: "Estimasi risiko relatif rendah berdasarkan profil gaya hidup saat ini. Pertahankan pola hidup sehat.",
  },
  moderate: {
    label: "Moderate",
    Icon: TriangleAlert,
    filledIcon: false,
    textClass: "text-risk-moderate",
    fillClass: "bg-risk-moderate",
    guidanceText: "Peringatan klinis: Risiko moderat terdeteksi. Disarankan optimasi durasi tidur, asupan nutrisi, atau aktivitas fisik.",
  },
  high: {
    label: "Higher",
    Icon: TriangleAlert,
    filledIcon: true,
    textClass: "text-risk-higher",
    fillClass: "bg-risk-higher",
    guidanceText: "Perhatian tinggi: Beban faktor risiko signifikan. Lakukan intervensi gaya hidup terarah dan pertimbangkan konsultasi dokter.",
  },
};

export function getRiskTone(level: RiskLevel): RiskTone {
  return RISK_TONES[level] ?? RISK_TONES.low;
}

interface RiskBadgeProps {
  level: RiskLevel;
  labelOverride?: StandardizedRiskLabel;
  showTooltip?: boolean;
  className?: string;
}

export function RiskBadge({
  level,
  labelOverride,
  showTooltip = true,
  className,
}: RiskBadgeProps) {
  const tone = RISK_TONES[level] ?? RISK_TONES.low;
  const label = labelOverride || tone.label;
  const { Icon, filledIcon, textClass, guidanceText } = tone;

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-tight select-none",
        showTooltip && "cursor-help",
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

  if (!showTooltip) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent sideOffset={4} className="text-left max-w-xs space-y-1">
        <p className="font-semibold text-[11px] uppercase tracking-wider text-brand-900/60 font-mono">
          Indikator Risiko: {label}
        </p>
        <p className="text-xs text-brand-900/80 leading-relaxed font-normal">
          {guidanceText}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
