import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export function MockDataNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-xl border border-primary-300 bg-accent p-4 text-accent-foreground",
        className
      )}
    >
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">Data contoh</p>
        <p className="text-xs leading-relaxed">
          Hasil asesmen Anda belum tersedia. Skor dan estimasi risiko di halaman ini hanya ilustrasi,
          bukan hasil analisis profil Anda.
        </p>
      </div>
    </div>
  );
}
