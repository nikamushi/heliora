"use client";

import * as React from "react";
import { AlertCircle, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormAlertTooltipProps {
  message: string | null;
  onDismiss?: () => void;
  variant?: "destructive" | "warning";
  className?: string;
}

export function FormAlertTooltip({
  message,
  onDismiss,
  variant = "destructive",
  className,
}: FormAlertTooltipProps) {
  if (!message) return null;

  const isDestructive = variant === "destructive";

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-xs font-medium shadow-xs backdrop-blur-xs transition-all animate-in fade-in duration-200",
        isDestructive
          ? "border-rose-200/90 bg-rose-50/90 text-rose-900"
          : "border-amber-200/90 bg-amber-50/90 text-amber-900",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isDestructive ? (
          <AlertCircle className="size-4 shrink-0 text-rose-600" aria-hidden="true" />
        ) : (
          <TriangleAlert className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
        )}
        <span className="leading-snug">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup pesan"
          className={cn(
            "rounded-md p-0.5 transition-colors cursor-pointer",
            isDestructive
              ? "text-rose-700/70 hover:bg-rose-100 hover:text-rose-900"
              : "text-amber-700/70 hover:bg-amber-100 hover:text-amber-900"
          )}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
