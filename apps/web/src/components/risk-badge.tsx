import { CircleDot, TriangleAlert, type LucideIcon } from "lucide-react";
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

// Design.md §2.4 & PRD §10.4.2: status is icon + label + color, strictly plain editorial typography.
// Avoid checkmark icon on low risk to prevent false perception of medical clearance.
const RISK_TONES: Record<RiskLevel, RiskTone> = {
  low: {
    label: "Lebih Rendah",
    Icon: CircleDot,
    filledIcon: false,
    textClass: "text-emerald-700 dark:text-emerald-400",
    fillClass: "bg-emerald-600",
    guidanceText: "Estimasi skor risiko berada pada rentang yang lebih rendah berdasarkan profil gaya hidup saat ini. Pertahankan pola hidup sehat.",
  },
  moderate: {
    label: "Sedang",
    Icon: TriangleAlert,
    filledIcon: false,
    textClass: "text-amber-700 dark:text-amber-400",
    fillClass: "bg-amber-600",
    guidanceText: "Estimasi risiko tergolong sedang. Dianjurkan melakukan penyesuaian bertahap pada durasi tidur, aktivitas fisik, atau pola makan.",
  },
  high: {
    label: "Lebih Tinggi",
    Icon: TriangleAlert,
    filledIcon: true,
    textClass: "text-rose-700 dark:text-rose-400",
    fillClass: "bg-rose-600",
    guidanceText: "Beban faktor risiko terindikasi lebih tinggi. Lakukan intervensi gaya hidup terarah dan pertimbangkan konsultasi dengan tenaga medis.",
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
      <TooltipContent sideOffset={6} className="text-left max-w-xs space-y-1.5 p-3">
        <p className="font-semibold text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
          Kategori Risiko: {label}
        </p>
        <p className="text-xs text-neutral-200 leading-relaxed font-normal">
          {guidanceText}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
