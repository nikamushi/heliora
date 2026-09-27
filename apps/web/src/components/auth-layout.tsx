"use client";

import React from "react";
import Link from "next/link";
import { IconArrowLeft, IconHeartbeat } from "@tabler/icons-react";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showDisclaimer?: boolean;
  /** Overrides the note shown when `showDisclaimer` is set (see DisclaimerBanner). */
  disclaimerText?: string;
  /**
   * `centered` — single-column card (hi-fi auth language).
   * `split` — two-column with brand panel (design.md §5.3).
   */
  variant?: "centered" | "split";
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showDisclaimer = false,
  disclaimerText,
  variant = "centered",
}: AuthLayoutProps) {
  if (variant === "split") {
    return (
      <div className="flex h-screen max-h-screen overflow-hidden bg-brand-50/20 text-brand-900 selection:bg-brand-200">
        {/* LEFT COLUMN: FORM SECTION (45%) */}
        <div className="flex flex-1 flex-col justify-between px-6 py-2.5 sm:px-10 lg:px-12 xl:px-16 overflow-y-auto no-scrollbar">
          {/* Center Content Container */}
          <div className="w-full max-w-[430px] mx-auto my-auto py-1">
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-brand-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <IconArrowLeft size={15} aria-hidden="true" />
              Kembali ke Beranda
            </Link>

            {/* Header */}
            <div className="mb-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-900 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-sm leading-relaxed text-brand-900/70">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Content Slot */}
            {children}

            {/* Medical Disclaimer */}
            {showDisclaimer && (
              <div className="mt-2.5 pt-2 border-t border-brand-900/10">
                <DisclaimerBanner
                  variant="note"
                  text={disclaimerText}
                  className="text-[10.5px] text-brand-900/60"
                />
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-muted-foreground py-0.5">
            © {new Date().getFullYear()} HELIORA
          </div>
        </div>

        {/* RIGHT COLUMN: BRAND WELLNESS BENTO PANEL (55%) */}
        <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0F381E] via-[#0A2614] to-[#06180C] overflow-hidden items-center justify-center p-8 xl:p-12 text-white border-l border-brand-900/20">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 right-1/4 w-[380px] h-[380px] bg-brand-400/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Subtle Geometric Grid */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 w-full max-w-lg space-y-4">
            {/* Card 1: Top Wide - Filosofi Preventif */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-3">
              <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400/90 uppercase">
                Filosofi Preventif
              </span>
              <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight text-white leading-snug">
                Predict Today.
                <br />
                Prevent Tomorrow.
              </h2>
              <p className="text-xs xl:text-sm text-white/75 leading-relaxed">
                Kesehatan masa depan dipetakan dari kebiasaan harian saat ini. Pahami
                pergeseran risiko kardiometabolik bertahun-tahun sebelum berkembang
                menjadi keluhan klinis.
              </p>
            </div>

            {/* Bottom Grid: 2 Cards Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 2: Validasi & Sains */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 shadow-xl space-y-2 flex flex-col justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400/90 uppercase">
                  Standar Klinis
                </span>
                <div>
                  <p className="text-base font-semibold text-white tracking-tight">
                    Validasi Model
                  </p>
                  <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                    Berdasarkan parameter konsensus epidemiologi CDC BRFSS, WHO, dan
                    PERKENI.
                  </p>
                </div>
              </div>

              {/* Card 3: Privasi & Keamanan */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 shadow-xl space-y-2 flex flex-col justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400/90 uppercase">
                  Privasi Mutlak
                </span>
                <div>
                  <p className="text-base font-semibold text-white tracking-tight">
                    Zero-Knowledge
                  </p>
                  <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                    Enkripsi AES-256 lokal. Data kesehatan Anda tidak pernah dijual
                    atau dibagikan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-muted text-foreground selection:bg-brand-200">
      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col items-center justify-center px-4 py-6 md:px-8">
        <div className="w-full">
          <div className="mb-8 flex flex-col items-center">
            <Link
              href="/"
              className="group mb-6 flex items-center gap-2 transition-transform group-hover:scale-105"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-white shadow-sm">
                <IconHeartbeat size={26} stroke={2} />
              </div>
            </Link>
            <h1 className="text-center text-[36px] leading-[42px] font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-center text-[15px] leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {showDisclaimer && (
            <div className="mt-6 px-4 text-center">
              <DisclaimerBanner
                variant="note"
                text={disclaimerText}
                className="text-xs leading-relaxed text-muted-foreground"
              />
            </div>
          )}
        </div>
      </main>

      <footer className="w-full border-t border-border bg-white/50 px-4 py-6 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-start gap-x-8 gap-y-1 text-xs text-muted-foreground sm:flex-nowrap sm:justify-between">
          <p className="whitespace-nowrap text-muted-foreground/60">
            © {new Date().getFullYear()} Heliora Inc. All rights reserved.
          </p>
          <nav className="flex items-center gap-x-4 whitespace-nowrap">
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Ketentuan Layanan
            </Link>
            <span
              aria-hidden="true"
              className="select-none text-muted-foreground/40"
            >
              |
            </span>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privasi Data
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
