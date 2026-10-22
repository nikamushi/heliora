"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Headphones as SFHeadphones,
  Mail as SFEnvelope,
  ShieldCheck as SFShieldCheckmark,
  Sparkles as SFSparkles,
  FileText as SFDocText,
  MessageSquare as SFBubbleLeftRight,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function HelpSupportPage() {
  const [ticketSubject, setTicketSubject] = useState("data_input");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setIsSubmitting(true);
    // Simulate support ticket submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTicketMessage("");
    }, 600);
  };

  const supportChannels = [
    {
      title: "Email Dukungan Resmi",
      detail: "support@heliora.health",
      subtext: "Waktu respon rata-rata < 24 jam kerja",
      href: "mailto:support@heliora.health",
      icon: SFEnvelope,
      color: "text-blue-600",
      bg: "bg-blue-50/70 border-blue-100",
    },
    {
      title: "Layanan Tanya Jawab Cepat",
      detail: "Katalog FAQ Klinis & Teknis",
      subtext: "Temukan jawaban instan untuk 20+ topik umum",
      href: "/dashboard/help/faq",
      icon: SFBubbleLeftRight,
      color: "text-violet-600",
      bg: "bg-violet-50/70 border-violet-100",
    },
    {
      title: "Panduan Integrasi & SOP",
      detail: "Dokumentasi Alur Kerja",
      subtext: "Panduan langkah pengisian biomarker dan simulasi",
      href: "/dashboard/help/guide",
      icon: SFDocText,
      color: "text-emerald-600",
      bg: "bg-emerald-50/70 border-emerald-100",
    },
  ];

  return (
    <div className="flex-1 min-w-0 bg-neutral-50/40 min-h-screen">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
            <SFHeadphones className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pusat Layanan &amp; Bantuan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Hubungi Tim Dukungan HELIORA
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
            Apakah Anda mengalami kendala saat mengisi biomarker, memiliki pertanyaan mengenai hasil analisis, atau ingin menyampaikan saran pengembangan sistem? Tim kami siap membantu.
          </p>
        </div>

        {/* System Health / Status Banner */}
        <div className="p-4.5 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
            </span>
            <div>
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                Semua Layanan Sistem Beroperasi Normal (99.9% Uptime)
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                HELIORA AI Inference Engine &amp; Encrypted Data Store Aktif
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
            Status: Sehat
          </span>
        </div>

        {/* 3 Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {supportChannels.map((chan) => {
            const Icon = chan.icon;
            return (
              <Link
                key={chan.title}
                href={chan.href}
                className="p-5.5 rounded-3xl border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-xs transition-all space-y-3 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`size-11 rounded-2xl border ${chan.bg} flex items-center justify-center shrink-0 ${chan.color}`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-neutral-900 group-hover:text-brand-900 transition-colors">
                      {chan.title}
                    </h2>
                    <p className="text-xs font-mono font-semibold text-neutral-800 truncate">
                      {chan.detail}
                    </p>
                    <p className="text-xs text-neutral-500 leading-normal">
                      {chan.subtext}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Feedback / Ticket Submission Form */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <SFSparkles className="w-5 h-5 text-brand-900" />
              <h2 className="text-lg font-bold text-neutral-900">
                Kirim Pesan atau Laporan Kendala Langsung
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600">
              Sampaikan pesan, masukan, atau kendala Anda secara spesifik. Tim teknis dan medis kami akan meninjau laporan Anda.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-2">
              <div className="size-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <SFShieldCheckmark className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-emerald-950">
                Pesan Anda Telah Berhasil Terkirim!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Terima kasih atas masukan Anda. Tiket Anda telah didaftarkan ke antrean dukungan dan akan ditindaklanjuti dalam 1x24 jam kerja.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-3 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Kirim Pesan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="ticket-subject" className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Kategori Laporan / Subjek
                  </label>
                  <select
                    id="ticket-subject"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all cursor-pointer"
                  >
                    <option value="data_input">Kendala Input Data &amp; Biomarker</option>
                    <option value="prediction_qa">Pertanyaan Interpretasi Hasil AI</option>
                    <option value="simulation">Masukan Simulator What-If</option>
                    <option value="feature_request">Usulan Fitur Baru</option>
                    <option value="account_privacy">Privasi Data &amp; Akun</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Kategori Prioritas
                  </label>
                  <div className="px-3.5 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-100/60 text-xs text-neutral-600 flex items-center justify-between">
                    <span>Standar (Normal SLA)</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Aktif
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ticket-message" className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Rincian Pesan / Deskripsi
                </label>
                <textarea
                  id="ticket-message"
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Jelaskan detail kendala yang dialami, halaman yang terdampak, atau saran perbaikan Anda..."
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !ticketMessage.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-brand-900 text-white hover:bg-brand-950 font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                >
                  {isSubmitting ? "Mengirimkan Pesan..." : "Kirim Pesan ke Tim Dukungan"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Clinical Disclaimer */}
        <DisclaimerBanner />
      </main>
    </div>
  );
}
