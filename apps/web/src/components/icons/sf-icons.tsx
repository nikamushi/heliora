import React from "react";

export interface SFIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}

/**
 * HELIORA — SF Regular (iOS / Apple SF Symbols) Icon Family
 * 
 * Styled after Apple Human Interface Guidelines and Icons8 SF Regular family.
 * Features:
 * - 24x24 optical grid with squircle geometry
 * - Regular stroke weight (default 1.8px) with rounded caps & joins
 * - Native currentColor support for seamless Tailwind integration
 */

/** SF Symbol: heart.text.square (Apple Health Official "Summary" / Ringkasan Klinis & Overview) */
export function SFHeartTextSquare({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M12 11.5c-.7-.6-2.5-1.9-2.5-3.2 0-.8.6-1.4 1.4-1.4.5 0 .9.2 1.1.6.2-.4.6-.6 1.1-.6.8 0 1.4.6 1.4 1.4 0 1.3-1.8 2.6-2.5 3.2z" />
      <path d="M7.5 15h9 M7.5 17.5h5.5" />
    </svg>
  );
}

/** SF Symbol: square.grid.2x2 (Ringkasan Klinis / Dashboard Hub) */
export function SFSquareGrid2x2({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  );
}

/** SF Symbol: waveform.path.ecg (Analisis Risiko / Apple Health ECG) */
export function SFWaveformPathEcg({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M2.5 12h3.5l2 2.5 3-10.5 3 16 2.5-10 2 2h4.5" />
    </svg>
  );
}

/** SF Symbol: checkmark.shield (Rencana Tindakan / Intervensi Klinis) */
export function SFShieldCheckmark({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 21.5c-4.8-2.4-7.5-6.2-7.5-12.2V5.5l7.5-2.8 7.5 2.8v3.8c0 6-2.7 9.8-7.5 12.2z" />
      <path d="M8.5 11.8l2.6 2.6 4.7-4.8" />
    </svg>
  );
}

/** SF Symbol: book.closed (Pusat Bukti Medis / Evidence Center) */
export function SFBookClosed({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
      <path d="M8 3.5v17" />
      <path d="M11.5 8h4.5" />
      <path d="M11.5 12h4.5" />
      <path d="M11.5 16h2.5" />
    </svg>
  );
}

/** SF Symbol: slider.horizontal.3 (What-If Simulator / Control Center) */
export function SFSlidersHorizontal({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Track 1 */}
      <path d="M3 6.5h6.5 M15.5 6.5H21" />
      <circle cx="12.5" cy="6.5" r="2.2" />
      {/* Track 2 */}
      <path d="M3 12h11 M19.5 12H21" />
      <circle cx="17" cy="12" r="2.2" />
      {/* Track 3 */}
      <path d="M3 17.5h4 M13.5 17.5H21" />
      <circle cx="9.5" cy="17.5" r="2.2" />
    </svg>
  );
}

/** SF Symbol: chart.line.uptrend.xyaxis (Proyeksi Horison / Health Trends) */
export function SFChartUptrend({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3.5 4v13.5a2.5 2.5 0 0 0 2.5 2.5H20" />
      <path d="M6.5 14.5l4.5-4.5 4 4 5-6" />
      <path d="M16.5 8H20v3.5" />
    </svg>
  );
}

/** SF Symbol: person.crop.circle (Profil Saya / Apple ID Account) */
export function SFPersonCropCircle({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9.2" r="2.8" />
      <path d="M6.8 17.8c1.3-2.1 3.2-3.3 5.2-3.3s3.9 1.2 5.2 3.3" />
    </svg>
  );
}

/** SF Symbol: gearshape (Pengaturan Akun / iOS Settings) */
export function SFGearshape({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** SF Symbol: rectangle.portrait.and.arrow.right (Keluar Akun / Logout) */
export function SFDoorExit({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M10 20.5H5.5a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2H10" />
      <path d="M15.5 16.5l4.5-4.5-4.5-4.5" />
      <path d="M20 12H9" />
    </svg>
  );
}

/** SF Symbol: chevron.right (iOS Navigation Disclose) */
export function SFChevronRight({
  size = 16,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M9.5 5.5l6 6.5-6 6.5" />
    </svg>
  );
}

/** SF Symbol: chevron.left (iOS Navigation Back) */
export function SFChevronLeft({
  size = 16,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M14.5 5.5l-6 6.5 6 6.5" />
    </svg>
  );
}

/** SF Symbol: chevron.down (iOS Menu Dropdown) */
export function SFChevronDown({
  size = 16,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M5.5 9.5l6.5 6 6.5-6" />
    </svg>
  );
}

/** SF Symbol: line.3.horizontal (iOS Menu Drawer Hamburger) */
export function SFLine3Horizontal({
  size = 20,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 6.5h16 M4 12h16 M4 17.5h16" />
    </svg>
  );
}

/** SF Symbol: xmark (iOS Close Sheet / Modal) */
export function SFXmark({
  size = 20,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 6l12 12 M6 18L18 6" />
    </svg>
  );
}

/** SF Symbol: heart (Kardiologi / Cardiovascular) */
export function SFHeart({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 21s-6.5-4.2-8.7-8.3C1.2 9 2.7 5 6.5 5c2.4 0 4.2 1.4 5.5 3 1.3-1.6 3.1-3 5.5-3 3.8 0 5.3 4 3.2 7.7-2.2 4.1-8.7 8.3-8.7 8.3z" />
    </svg>
  );
}

/** SF Symbol: brain (Neurologi / XAI Intelligence) */
export function SFBrain({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M9.5 5a3.5 3.5 0 0 0-3.5 3.5c0 .5.1 1 .3 1.4A4 4 0 0 0 4 13.5a4 4 0 0 0 2 3.5v1a2 2 0 0 0 2 2h1.5" />
      <path d="M14.5 5a3.5 3.5 0 0 1 3.5 3.5c0 .5-.1 1-.3 1.4A4 4 0 0 1 20 13.5a4 4 0 0 1-2 3.5v1a2 2 0 0 1-2 2h-1.5" />
      <path d="M12 4v16" />
      <path d="M9.5 9h2.5 M12 13h2.5 M9.5 17h2.5" />
    </svg>
  );
}

/** SF Symbol: arrow.right (iOS Disclose Indicator) */
export function SFArrowRight({
  size = 18,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4.5 12h14.5 M13.5 6.5l5.5 5.5-5.5 5.5" />
    </svg>
  );
}

/** SF Symbol: exclamationmark.circle (Peringatan Klinis / Alert) */
export function SFAlertCircle({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 7.5v5.5" />
      <circle cx="12" cy="16.5" r=".7" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: checkmark.circle (Status Terverifikasi) */
export function SFCheckmarkCircle({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M8 12.2l2.6 2.6 5.4-5.4" />
    </svg>
  );
}

/** SF Symbol: arrow.left (Kembali / Back) */
export function SFArrowLeft({
  size = 18,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M19.5 12H4.5 M10.5 17.5L5 12l5.5-5.5" />
    </svg>
  );
}

/** SF Symbol: key (Kredensial / Keamanan) */
export function SFKey({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3L19.5 3.5 M16.5 6.5l2 2 M14 9l2 2" />
    </svg>
  );
}

/** SF Symbol: doc.text (Dokumen Persetujuan / Consent) */
export function SFDocText({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M14 3v4.5a1.5 1.5 0 0 0 1.5 1.5H20" />
      <path d="M17.5 21H6.5a2.5 2.5 0 0 1-2.5-2.5V5.5A2.5 2.5 0 0 1 6.5 3H14l6 6v9.5a2.5 2.5 0 0 1-2.5 2.5z" />
      <path d="M8.5 12h7 M8.5 16h4.5" />
    </svg>
  );
}

/** SF Symbol: lock (Enkripsi & Keamanan) */
export function SFLock({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

/** SF Symbol: lock.shield (Keamanan Akun, Sandi & Kredensial) */
export function SFLockShield({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 21.5c-4.8-2.4-7.5-6.2-7.5-12.2V5.5l7.5-2.8 7.5 2.8v3.8c0 6-2.7 9.8-7.5 12.2z" />
      <path d="M9.5 10.5V8.5a2.5 2.5 0 0 1 5 0v2" />
      <rect x="8.5" y="10.5" width="7" height="5" rx="1.2" />
    </svg>
  );
}

/** SF Symbol: envelope (Email Akun) */
export function SFEnvelope({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M4 6.5l8 5.5 8-5.5" />
    </svg>
  );
}

/** SF Symbol: arrow.up.right (External Link) */
export function SFArrowUpRight({
  size = 16,
  strokeWidth = 2,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M7 17L17 7 M7 7h10v10" />
    </svg>
  );
}

/** SF Symbol: square.and.pencil (Edit / Ubah Data) */
export function SFPencil({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/** SF Symbol: calendar (Kalender / Tanggal Asesmen) */
export function SFCalendar({
  size = 16,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 2.5v4 M16 2.5v4" />
    </svg>
  );
}

/** SF Symbol: scalemass (Berat Badan & BMI) */
export function SFScalemass({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M12 10l1.2-1.5" />
      <path d="M7 19.5h10" />
    </svg>
  );
}

/** SF Symbol: flame (Aktivitas Fisik / Apple Fitness Active Energy) */
export function SFFlame({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2.5c-2.5 3-6.5 7.5-6.5 11.5a6.5 6.5 0 0 0 13 0c0-4-4-8.5-6.5-11.5z" />
      <path d="M12 18a3.5 3.5 0 0 0 3.5-3.5c0-1.8-1.5-3-2.5-4.5-.5 1-1.2 1.5-1.8 1.5s-.7-.5-.7-1.5c-1 1.5-2 2.7-2 4.5A3.5 3.5 0 0 0 12 18z" />
    </svg>
  );
}

/** SF Symbol: moon (Tidur & Pemulihan / Apple Health Sleep) */
export function SFMoon({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a7 7 0 0 0 9.7 9.7z" />
    </svg>
  );
}

/** SF Symbol: cigarette (Status Merokok) */
export function SFCigarette({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3.5" y="11.5" width="14" height="4.5" rx="1.5" />
      <path d="M17.5 11.5H20a1 1 0 0 1 1 1v2.5a1 1 0 0 1-1 1h-2.5" />
      <path d="M7.5 11.5v4.5" />
      <path d="M18 8c0-1.5-1-2.5-1-4 M21 8.5c0-2-1.2-3-1.2-4.5" />
    </svg>
  );
}

/** SF Symbol: compass / safari (Jelajahi / Explore) */
export function SFCompass({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.2" />
      <polygon
        points="15.8,8.2 13.2,13.2 8.2,15.8 10.8,10.8"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: questionmark.circle (Bantuan & Panduan / Help & Support) */
export function SFQuestionMarkCircle({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M9.5 9.2a2.5 2.5 0 0 1 4.7 1.2c0 1.6-1.7 2.1-2.2 3.1v.5" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** SF Symbol: bubble.left.and.bubble.right (Tanya Jawab / FAQ) */
export function SFBubbleLeftRight({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M16 11.5c2.5 0 4.5-1.8 4.5-4s-2-4-4.5-4-4.5 1.8-4.5 4c0 .8.3 1.5.8 2.1l-.8 2.4 2.5-.8c.7.2 1.3.3 2 .3z" />
      <path d="M8.5 7.5C4.9 7.5 2 9.7 2 12.5c0 1.2.6 2.3 1.6 3.1L2.5 19.5l3.8-1.3c.7.2 1.4.3 2.2.3 3.6 0 6.5-2.2 6.5-5s-2.9-6-6.5-6z" />
    </svg>
  );
}

/** SF Symbol: headphones (Pusat Bantuan / Support) */
export function SFHeadphones({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 14h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z" />
      <path d="M19 14h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
      <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
    </svg>
  );
}

/** SF Symbol: magnifyingglass (Pencarian / Search) */
export function SFMagnifyingglass({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="11" cy="11" r="7.5" />
      <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" />
    </svg>
  );
}

/** SF Symbol: sparkles (AI Intelligence / Asisten Pintar) */
export function SFSparkles({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2 2-5.5z" />
      <path d="M18.5 16.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" />
    </svg>
  );
}

/** SF Symbol: info.circle (Tentang / Informasi Sistem) */
export function SFInfoCircle({
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}: SFIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.2" />
      <circle cx="12" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
      <line x1="12" y1="11" x2="12" y2="16.5" strokeWidth={strokeWidth} />
    </svg>
  );
}




