"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconHeartbeat, IconMenu2, IconX } from "@tabler/icons-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full relative z-50 py-5 sm:py-6 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo (Left) */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-900 text-white shadow-sm transition-transform group-hover:scale-105">
              <IconHeartbeat size={20} stroke={2} />
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-900">
              HELIORA
            </span>
          </Link>

          {/* Desktop Navigation (Center Pill) - Referencing Koyeb */}
          <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-full bg-brand-50/80 px-1.5 py-1.5 backdrop-blur-md border border-brand-200/50 shadow-sm">
              {[
                { name: "Fitur", href: "#why-heliora" },
                { name: "How it works", href: "#how-it-works" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-1.5 text-[13px] font-medium text-brand-900/70 hover:text-brand-900 hover:bg-white rounded-full transition-all"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Actions (Right) */}
          <div className="hidden md:flex items-center gap-4 z-50">
            <Link
              href="/login"
              className="text-sm font-medium text-brand-900/70 hover:text-brand-900 transition-colors"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-brand-900 px-5 text-sm hover:bg-brand-900/90 shadow-sm text-white">
                Sign up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden relative z-50 p-2 text-brand-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-50 pt-24 px-6 md:hidden flex flex-col h-screen">
          <nav className="flex flex-col gap-6 text-2xl font-medium tracking-tight text-brand-900">
            <Link href="#why-heliora" onClick={() => setMobileMenuOpen(false)}>Fitur</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
          </nav>
          <div className="mt-auto pb-12 flex flex-col gap-4">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-14 rounded-2xl text-lg border-brand-200 text-brand-900 hover:bg-brand-100">
                Log in
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-14 rounded-2xl text-lg bg-brand-900 text-white hover:bg-brand-900/90">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
