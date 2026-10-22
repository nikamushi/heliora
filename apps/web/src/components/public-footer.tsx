import React from "react";
import Link from "next/link";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200/80 bg-white text-xs text-neutral-600 print:border-t print:pt-4 print:pb-2">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6 print:py-0 print:px-0 print:space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Brand Identity with Self-Contained SVG */}
          <div className="flex items-center gap-2.5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-7 shrink-0"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="#0F7A4E" />
              <path
                d="M7 16H11L13.5 10L18.5 22L21 16H25"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <span className="font-bold tracking-tight text-neutral-900 text-sm block">
                HELIORA
              </span>
              <span className="text-[11px] text-neutral-500 font-normal">
                Platform pencegahan risiko kesehatan berbasis gaya hidup dan AI
              </span>
            </div>
          </div>

          {/* Quick Legal & Navigation Links - Hidden on print */}
          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium print:hidden"
            aria-label="Navigasi bawah"
          >
            <Link
              href="/"
              className="text-neutral-600 hover:text-neutral-900 transition-colors underline-offset-4 hover:underline rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              Beranda
            </Link>
            <Link
              href="/terms"
              className="text-neutral-600 hover:text-neutral-900 transition-colors underline-offset-4 hover:underline rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              Ketentuan Layanan
            </Link>
            <Link
              href="/privacy"
              className="text-neutral-600 hover:text-neutral-900 transition-colors underline-offset-4 hover:underline rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/login"
              className="text-neutral-600 hover:text-neutral-900 transition-colors underline-offset-4 hover:underline rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-neutral-600 hover:text-neutral-900 transition-colors underline-offset-4 hover:underline rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              Daftar
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px] text-neutral-500 print:pt-2 print:border-t-0">
          <p>© {currentYear} PT Heliora Digital Preventif. Seluruh hak cipta dilindungi.</p>
          <p className="max-w-md text-neutral-500">
            Hasil analisis merupakan estimasi preventif, bukan diagnosis medis klinis.
          </p>
        </div>
      </div>
    </footer>
  );
}
