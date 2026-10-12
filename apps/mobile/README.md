# HELIORA Mobile

Aplikasi Android HELIORA berbasis Flutter. Ruang lingkup dan keputusan teknisnya ada di [`docs/PRD-Mobile.md`](../../docs/PRD-Mobile.md), task-nya di `docs/TASK.md` bagian 18.12 (MOB-001 sampai MOB-008).

| Hal | Nilai |
| --- | --- |
| Application ID | `id.heliora.app` |
| Android minimum | 8.0 (API 26) |
| Flutter | 3.41.9, dikunci di `.fvmrc` |
| Paket Dart | `heliora_mobile` |
| Paket pnpm (script saja) | `mobile` |

`apps/mobile` tidak meng-import kode dari `apps/web` atau `apps/api`. Sambungannya hanya kontrak HTTP (OpenAPI) dan Supabase Auth.

## Prasyarat

- [FVM](https://fvm.app) untuk memasang versi Flutter yang dikunci: `dart pub global activate fvm`.
- Android Studio dengan Android SDK, Platform-Tools, Command-line Tools, dan Emulator. Gunakan JDK 17 bawaan Android Studio (`jbr`).
- Windows: aktifkan Developer Mode (Settings > System > For developers). Flutter butuh symlink untuk build yang memakai plugin.

Simpan SDK dan cache di drive yang lapang. Contoh konfigurasi di Windows:

```powershell
# Sesuaikan path dengan lokasi pemasangan Android Studio dan SDK di mesin Anda:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
flutter config --android-sdk "$env:LOCALAPPDATA\Android\Sdk"
flutter config --jdk-dir "C:\Program Files\Android\Android Studio\jbr"
flutter doctor --android-licenses
```

## Setup sekali

```bash
cd apps/mobile
fvm install          # memasang versi dari .fvmrc
fvm use              # menautkan .fvm/flutter_sdk untuk IDE
fvm flutter doctor -v
fvm flutter pub get
```

Tanpa FVM, pastikan `flutter --version` sama dengan versi di `.fvmrc`.

## Menjalankan

```bash
# dari root monorepo
pnpm --filter mobile dev        # flutter run ke emulator atau HP yang tersambung
pnpm --filter mobile lint       # flutter analyze
pnpm --filter mobile test       # flutter test
pnpm --filter mobile build      # APK rilis di build/app/outputs/flutter-apk/
pnpm --filter mobile gen:api    # generate client API dari backend lokal (MOB-003)
```

Catatan:

- `pnpm lint`, `pnpm test`, dan `pnpm build` di root ikut menjalankan mobile, jadi butuh Flutter terpasang. Pengembang yang tidak memegang mobile bisa memakai `--filter`, misalnya `pnpm --filter frontend lint`.
- `pnpm dev` di root sengaja tidak menjalankan mobile karena `flutter run` butuh perangkat dan berjalan interaktif.
- `build` memakai debug key sampai signing rilis disiapkan di MOB-008.
- `gen:api` membaca `http://localhost:8000/api/v1/openapi.json`, jadi backend harus berjalan. Hasilnya masuk `lib/core/api/generated/` dan di-commit.

## Backend dari perangkat

`localhost` di HP atau emulator menunjuk ke perangkat itu sendiri, bukan ke laptop.

- Emulator Android: `http://10.0.2.2:8000`.
- HP fisik: jalankan backend dengan `--host 0.0.0.0`, lalu pakai IP LAN laptop. HP dan laptop harus di jaringan yang sama.

Konfigurasi URL API dan kunci Supabase lewat `--dart-define` disiapkan di MOB-003. Kunci tidak boleh masuk repository.

## Struktur

```text
apps/mobile/
├── android/              # proyek Android (Gradle Kotlin DSL)
├── assets/brand/         # SVG logo konsep A
├── lib/main.dart         # titik masuk aplikasi
├── test/                 # widget test
├── analysis_options.yaml # flutter_lints
├── swagger_parser.yaml   # konfigurasi gen:api
├── run-flutter.mjs       # runner cross-platform (FVM dengan fallback ke Flutter PATH)
├── package.json          # script Turborepo, tanpa dependency npm
└── .fvmrc                # versi Flutter
```
