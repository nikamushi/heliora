import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../theme/tokens.dart';

/// Screen presenting the full statutory Privacy Policy (Kebijakan Privasi)
/// in compliance with UU PDP No. 27/2022, aligned with Web (/privacy)
/// and strictly adhering to editorial typography standards (zero pill chips).
class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key, this.onBack});

  final VoidCallback? onBack;

  static const _dataRows = [
    (
      category: 'Akun',
      details: 'Nama lengkap dan alamat email',
      status: 'Wajib',
      purpose: 'Identifikasi akun dan pengiriman tautan pemulihan kata sandi',
    ),
    (
      category: 'Fisik',
      details: 'Usia, jenis kelamin biologis, tinggi badan, dan berat badan',
      status: 'Wajib',
      purpose: 'Menghitung indeks massa tubuh dan dasar estimasi risiko',
    ),
    (
      category: 'Gaya Hidup',
      details: 'Durasi tidur harian, waktu aktivitas fisik mingguan, dan kebiasaan merokok',
      status: 'Wajib',
      purpose: 'Menilai pengaruh kebiasaan terhadap skor gaya hidup dan risiko kesehatan',
    ),
    (
      category: 'Riwayat Keluarga',
      details: 'Riwayat diabetes, hipertensi, atau penyakit jantung pada keluarga inti',
      status: 'Opsional',
      purpose: 'Menyesuaikan faktor risiko dari riwayat kesehatan keluarga',
    ),
    (
      category: 'Biomarker',
      details: 'Tekanan darah, gula darah puasa, dan kolesterol total',
      status: 'Opsional',
      purpose: 'Meningkatkan akurasi estimasi jika Anda memilih mengisinya',
    ),
    (
      category: 'Teknis',
      details: 'Alamat IP yang disamarkan, jenis perangkat/sistem operasi, dan log waktu masuk',
      status: 'Otomatis',
      purpose: 'Keamanan sesi dan pencegahan akses tanpa izin',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: HelioraTokens.foreground),
          onPressed: () {
            if (onBack != null) {
              onBack!();
            } else if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              try {
                context.go('/');
              } catch (_) {}
            }
          },
        ),
        title: const Text(
          'Kebijakan Privasi',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: HelioraTokens.foreground,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: HelioraTokens.border, height: 1.0),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Document Header
                  Text(
                    'KEBIJAKAN PRIVASI',
                    style: HelioraTokens.monoEyebrow.copyWith(
                      fontSize: 11,
                      color: HelioraTokens.brand900.withValues(alpha: 0.7),
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Pelindungan Data Pribadi HELIORA',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.4,
                      color: HelioraTokens.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Kebijakan ini menjelaskan bagaimana HELIORA mengumpulkan, menggunakan, dan melindungi '
                    'data pribadi Anda saat menggunakan layanan kesehatan preventif kami, serta hak-hak yang Anda '
                    'miliki berdasarkan Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022).',
                    style: HelioraTokens.bodyDefault.copyWith(
                      color: HelioraTokens.secondaryForeground,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Berlaku sejak 22 Oktober 2026 · Versi 1.2',
                    style: TextStyle(
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: HelioraTokens.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Quick Summary Box (Editorial style)
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      border: Border.all(color: HelioraTokens.border, width: 1.0),
                      borderRadius: BorderRadius.circular(16.0),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Ringkasan Prinsip Privasi',
                          style: TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: HelioraTokens.foreground,
                          ),
                        ),
                        const SizedBox(height: 8),
                        _buildSummaryBullet('Kami hanya mengumpulkan data yang diperlukan untuk estimasi risiko kesehatan Anda.'),
                        _buildSummaryBullet('Kami tidak pernah menjual atau membagikan data Anda kepada pihak ketiga untuk tujuan iklan.'),
                        _buildSummaryBullet('Data dienkripsi berstandar perbankan (AES-256 saat disimpan & TLS 1.3 saat transmisi).'),
                        _buildSummaryBullet('Anda dapat menarik persetujuan atau menghapus akun beserta seluruh data kapan saja.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Divider(color: HelioraTokens.border, height: 1),
                  const SizedBox(height: 20),

                  // 1. Dasar Hukum dan Ruang Lingkup
                  _buildSection(
                    number: '1',
                    title: 'Dasar Hukum dan Ruang Lingkup',
                    paragraphs: [
                      'Kebijakan Privasi ini disusun sebagai bentuk kepatuhan terhadap Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).',
                      'Pengendali Data Pribadi untuk platform ini adalah Team Parental Advisory Explicit Content. Kami menetapkan tujuan dan mengawasi pemrosesan data pribadi Anda. Kami memproses data kesehatan Anda berdasarkan persetujuan eksplisit yang Anda berikan saat mendaftar dan menyelesaikan proses orientasi (onboarding).',
                    ],
                  ),

                  // 2. Data yang Dikumpulkan
                  _buildSection(
                    number: '2',
                    title: 'Data yang Dikumpulkan',
                    paragraphs: [
                      'Kami membatasi pengumpulan data hanya pada parameter yang memiliki kegunaan langsung untuk menghasilkan estimasi risiko atau rekomendasi gaya hidup.',
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Mobile Data Breakdown Cards (no pill chips, pure editorial metadata)
                  for (final row in _dataRows) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 10.0),
                      padding: const EdgeInsets.all(12.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: HelioraTokens.border, width: 1.0),
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                row.category,
                                style: const TextStyle(
                                  fontFamily: 'Plus Jakarta Sans',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: HelioraTokens.foreground,
                                ),
                              ),
                              Text(
                                row.status.toUpperCase(),
                                style: const TextStyle(
                                  fontFamily: 'JetBrains Mono',
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                  color: HelioraTokens.secondaryForeground,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Rincian: ${row.details}',
                            style: HelioraTokens.bodySmall.copyWith(
                              color: HelioraTokens.foreground,
                              fontSize: 12.5,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Tujuan: ${row.purpose}',
                            style: HelioraTokens.caption.copyWith(
                              color: HelioraTokens.mutedForeground,
                              fontSize: 11.5,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Text(
                    'Data yang tidak kami kumpulkan: Kami tidak meminta atau mengumpulkan nomor rekening bank, kartu kredit, lokasi GPS langsung perangkat, maupun salinan rekam medis rumah sakit.',
                    style: HelioraTokens.caption.copyWith(
                      color: HelioraTokens.secondaryForeground,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 3. Tujuan Penggunaan Data
                  _buildSection(
                    number: '3',
                    title: 'Tujuan Penggunaan Data',
                    paragraphs: [
                      'Data Anda digunakan secara eksklusif untuk:',
                      '• Menghitung estimasi risiko kardiometabolik dan penyakit kronis berbasis pedoman klinis resmi.\n'
                          '• Menghasilkan rencana tindakan dan rekomendasi preventif yang relevan secara personal.\n'
                          '• Menjalankan simulasi interaktif "What-If" untuk proyeksi kesehatan masa depan secara in-memory tanpa memutasi profil dasar.\n'
                          '• Memverifikasi autentikasi sesi pengguna dan audit pemenuhan persetujuan privasi.',
                    ],
                  ),

                  // 4. Keamanan dan Enkripsi Data
                  _buildSection(
                    number: '4',
                    title: 'Keamanan dan Enkripsi Data',
                    paragraphs: [
                      'Seluruh data biometrik dan kesehatan dienkripsi menggunakan standar AES-256 pada media penyimpanan database (at-rest) dan dilindungi protokol TLS 1.3 selama transmisi data melalui jaringan (in-transit).',
                      'Akses data diisolasi menggunakan Row-Level Security (RLS) dan token berbasis peran terenkripsi, memastikan hanya Anda yang memiliki hak akses terhadap profil dan riwayat asesmen Anda.',
                    ],
                  ),

                  // 5. Masa Simpan Data
                  _buildSection(
                    number: '5',
                    title: 'Masa Simpan Data',
                    paragraphs: [
                      'Data profil kesehatan dan riwayat asesmen disimpan selama akun Anda berstatus aktif. '
                          'Jika Anda mencabut persetujuan atau menghapus akun, seluruh data kesehatan operasional Anda '
                          'akan segera dinonaktifkan dan dihapus menyeluruh dalam jangka waktu maksimal 30 hari kalender.',
                      'Catatan log kepatuhan persetujuan (timestamp, versi syarat, IP disamarkan) disimpan hingga 5 tahun '
                          'semata-mata untuk keperluan audit kepatuhan regulasi UU PDP.',
                    ],
                  ),

                  // 6. Hak Subjek Data Pribadi
                  _buildSection(
                    number: '6',
                    title: 'Hak Subjek Data Pribadi',
                    paragraphs: [
                      'Sesuai ketentuan Bab VI UU PDP, Anda memiliki hak penuh untuk:',
                      '• Hak Akses & Portabilitas: Mengunduh dan melihat seluruh data yang tersimpan di profil Anda.\n'
                          '• Hak Koreksi: Memperbarui atau merevisi parameter biometrik dan gaya hidup Anda sewaktu-waktu.\n'
                          '• Hak Penarikan: Mencabut persetujuan pemrosesan data kesehatan melalui menu Profil.\n'
                          '• Hak Penghapusan: Menghapus akun beserta data riwayat asesmen secara permanen.',
                    ],
                  ),

                  // 7. Layanan AI dan Pemrosesan Data
                  _buildSection(
                    number: '7',
                    title: 'Layanan AI dan Pemrosesan Data',
                    paragraphs: [
                      'Model analitis dan Explainable AI (SHAP) pada HELIORA beroperasi secara deterministik dan terlokalisasi '
                          'pada infrastruktur cloud berizin resmi. Data pribadi Anda tidak pernah digunakan untuk melatih '
                          'model kecerdasan buatan publik pihak ketiga tanpa izin eksplisit terpisah.',
                    ],
                  ),

                  // 8. Penarikan Persetujuan & Hapus Akun
                  _buildSection(
                    number: '8',
                    title: 'Penarikan Persetujuan & Hapus Akun',
                    paragraphs: [
                      'Anda dapat mencabut persetujuan pemrosesan data kesehatan kapan saja melalui tombol "Cabut Persetujuan" '
                          'di tab Profil. Setelah persetujuan dicabut, fitur asesmen risiko dan simulasi akan dinonaktifkan '
                          'seketika, dan data Anda tidak akan lagi diproses.',
                    ],
                  ),

                  // 9. Batasan Usia Pengguna
                  _buildSection(
                    number: '9',
                    title: 'Batasan Usia Pengguna',
                    paragraphs: [
                      'Layanan HELIORA ditujukan khusus bagi pengguna berusia 18 tahun ke atas. Kami tidak memproses data pribadi anak di bawah usia 18 tahun.',
                    ],
                  ),

                  // 10. Perubahan Kebijakan Privasi
                  _buildSection(
                    number: '10',
                    title: 'Perubahan Kebijakan Privasi',
                    paragraphs: [
                      'Setiap pembaruan kebijakan yang bersifat material akan diberitahukan minimal 14 hari kalender sebelum diberlakukan melalui aplikasi atau email terdaftar.',
                    ],
                  ),

                  // 11. Kontak Pejabat Pelindungan Data
                  _buildSection(
                    number: '11',
                    title: 'Kontak Pejabat Pelindungan Data',
                    paragraphs: [
                      'Jika Anda memiliki pertanyaan mengenai pelaksanaan hak privasi Anda, silakan hubungi:',
                      '• Data Protection Officer (DPO): dpo@heliora.id\n'
                          '• Layanan Bantuan: autoruns18@gmail.com\n'
                          '• Team Parental Advisory Explicit Content, Jl. Ir. H. Juanda No. 15, Sidodadi, '
                          'Kec. Samarinda Ulu, Kota Samarinda, Kalimantan Timur 75124.',
                    ],
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryBullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('•  ', style: TextStyle(color: HelioraTokens.primary, fontWeight: FontWeight.bold)),
          Expanded(
            child: Text(
              text,
              style: HelioraTokens.bodySmall.copyWith(
                color: HelioraTokens.foreground,
                height: 1.45,
                fontSize: 12.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String number,
    required String title,
    required List<String> paragraphs,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$number. $title',
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: HelioraTokens.foreground,
            ),
          ),
          const SizedBox(height: 8),
          for (final p in paragraphs) ...[
            Text(
              p,
              style: HelioraTokens.bodySmall.copyWith(
                color: HelioraTokens.foreground,
                height: 1.55,
                fontSize: 13.5,
              ),
            ),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }
}
