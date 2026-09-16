import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// PRD "Primary Disclaimer" — keep word-for-word; every page renders it through this component.
export const MEDICAL_DISCLAIMER =
  "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi/proyeksi berdasarkan data dan model yang digunakan, bukan diagnosis medis, bukan pengganti konsultasi dokter, dan bukan kepastian mengenai kondisi kesehatan seseorang.";

interface DisclaimerBannerProps {
  variant?: "banner" | "note";
  className?: string;
}

export function DisclaimerBanner({ variant = "banner", className }: DisclaimerBannerProps) {
  if (variant === "note") {
    return (
      <p className={cn("flex gap-2 text-[11px] leading-relaxed text-muted-foreground", className)}>
        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        <span>{MEDICAL_DISCLAIMER}</span>
      </p>
    );
  }

  return (
    <aside
      aria-label="Disclaimer medis"
      className={cn(
        "flex gap-3 rounded-xl border border-border bg-muted p-4 text-xs leading-relaxed text-muted-foreground",
        className
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{MEDICAL_DISCLAIMER}</p>
    </aside>
  );
}
