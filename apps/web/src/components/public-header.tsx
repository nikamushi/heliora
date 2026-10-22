"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoEmblem } from "@/components/logo";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const legalNavItems = [
    { name: "Ketentuan Layanan", href: "/terms" },
    { name: "Kebijakan Privasi", href: "/privacy" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-md transition-all print:static print:border-b print:bg-white print:py-3">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 print:h-auto print:px-0">
        {/* Brand Logo & Name (Links to Home) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg text-neutral-900 transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
          aria-label="HELIORA Beranda"
        >
          <LogoEmblem size={32} className="shadow-2xs" />
          <span className="text-base font-bold tracking-tight text-brand-900">
            HELIORA
          </span>
        </Link>

        {/* Desktop Legal Navigation - Hidden on print */}
        <nav
          className="hidden md:flex items-center gap-1 text-xs font-medium text-neutral-600 print:hidden"
          aria-label="Dokumen hukum dan kebijakan"
        >
          {legalNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900",
                  isActive
                    ? "bg-neutral-100 font-semibold text-neutral-900"
                    : "hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons - Hidden on print */}
        <div className="hidden sm:flex items-center gap-2 print:hidden">
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
          >
            Masuk
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="h-8 rounded-lg bg-brand-900 px-3.5 text-xs font-medium text-white hover:bg-brand-900/90 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              Daftar
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button - Hidden on print */}
        <button
          type="button"
          className="sm:hidden -mr-1 p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 print:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer - Hidden on print */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg print:hidden">
          <nav className="flex flex-col space-y-1" aria-label="Navigasi Dokumen Seluler">
            {legalNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-semibold"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-medium rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1"
            >
              <Button className="w-full h-8 text-xs font-medium rounded-lg bg-brand-900 text-white">
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
