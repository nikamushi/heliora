import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// PRD FR-005 & §20.21 — Mandated verbatim medical disclaimer
export const MEDICAL_DISCLAIMER =
  "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.";

interface DisclaimerBannerProps {
  variant?: "banner" | "note";
  className?: string;
  /** Overrides the mandated text. Keep the default on clinical surfaces. */
  text?: string;
}

export function DisclaimerBanner({
  variant = "banner",
  className,
  text = MEDICAL_DISCLAIMER,
}: DisclaimerBannerProps) {
  if (variant === "note") {
    return (
      <p className={cn("flex gap-2 text-[11px] leading-relaxed text-brand-900/70", className)}>
        <Info aria-hidden="true" className="mt-0.5 size-3.5 text-brand-900/60 shrink-0" />
        <span>{text}</span>
      </p>
    );
  }

  return (
    <aside
      aria-label="Disclaimer medis"
      className={cn(
        "flex gap-3 rounded-2xl border border-brand-900/10 bg-brand-50/60 p-4 text-xs leading-relaxed text-brand-900/80 shadow-xs",
        className
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 text-brand-900/70 shrink-0" />
      <p className="font-normal">{text}</p>
    </aside>
  );
}
