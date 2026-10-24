import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../theme/tokens.dart';

/// Screen presenting the full statutory Terms of Service (Ketentuan Layanan)
/// aligned with Web (/terms) and adhering to strict editorial typography standards.
class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key, this.onBack});

  final VoidCallback? onBack;

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
          'Ketentuan Layanan',
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
                    'KETENTUAN LAYANAN',
                    style: HelioraTokens.monoEyebrow.copyWith(
                      fontSize: 11,
                      color: HelioraTokens.brand900.withValues(alpha: 0.7),
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Perjanjian Penggunaan Platform HELIORA',
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
                    'Ketentuan Layanan ini merupakan perjanjian yang mengikat antara Anda dan '
                    'Team Parental Advisory Explicit Content ("HELIORA" atau "kami"). Ketentuan ini mengatur '
                    'penggunaan umum platform. Persetujuan khusus atas pemrosesan data kesehatan Anda '
                    'diatur secara terpisah melalui persetujuan eksplisit.',
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
                  const SizedBox(height: 24),
                  const Divider(color: HelioraTokens.border, height: 1),
                  const SizedBox(height: 20),

                  // 1. Disclaimer Medis
                  _buildSection(
                    number: '1',
                    title: 'Disclaimer Medis',
                    content: [
                      'HELIORA adalah alat bantu kesehatan preventif berbasis gaya hidup dan kecerdasan buatan. '
                          'Hasil yang disajikan merupakan estimasi dan simulasi berdasarkan model populasi, bukan '
                          'diagnosis medis dan bukan pengganti konsultasi langsung dengan dokter atau tenaga kesehatan profesional.',
                      'Layanan kami tidak melayani penanganan gawat darurat medis. Jika Anda mengalami kondisi darurat '
                          'atau gejala akut seperti nyeri dada mendadak atau sesak napas berat, segera hubungi 112 (darurat umum) '
                          'atau 119 (ambulans), atau datangi Instalasi Gawat Darurat (IGD) rumah sakit terdekat.',
                    ],
                  ),

                  // 2. Ruang Lingkup Layanan
                  _buildSection(
                    number: '2',
                    title: 'Ruang Lingkup Layanan',
                    content: [
                      'HELIORA menyediakan layanan evaluasi preventif mandiri yang mencakup:',
                    ],
                    bullets: [
                      'Estimasi risiko relatif terkait diabetes tipe 2, hipertensi, dan penyakit kardiovaskular berdasarkan perbandingan statistik kebiasaan hidup.',
                      'Informasi mengenai faktor gaya hidup yang paling memengaruhi hasil estimasi kesehatan Anda.',
                      'Simulasi interaktif untuk mengeksplorasi pengaruh perubahan kebiasaan sehari-hari terhadap perkiraan risiko kesehatan di masa depan.',
                      'Rekomendasi kebiasaan hidup sehat yang mengacu pada pedoman klinis kesehatan terpercaya (WHO, PERKENI, CDC, dsb).',
                    ],
                    trailingContent:
                        'Penggunaan layanan ini tidak menciptakan hubungan hukum dokter-pasien antara Anda dan HELIORA.',
                  ),

                  // 3. Syarat Usia
                  _buildSection(
                    number: '3',
                    title: 'Syarat Usia',
                    content: [
                      'Layanan ini hanya diperuntukkan bagi individu yang telah berusia minimal 18 tahun. '
                          'Kami tidak menerima pendaftaran dari individu di bawah usia 18 tahun.',
                      'Dengan mendaftar, Anda menyatakan bahwa Anda telah berusia minimal 18 tahun dan bahwa '
                          'informasi profil fisik serta kebiasaan gaya hidup yang Anda masukkan adalah data pribadi Anda yang benar dan akurat.',
                    ],
                  ),

                  // 4. Penggunaan yang Dilarang
                  _buildSection(
                    number: '4',
                    title: 'Penggunaan yang Dilarang',
                    content: [
                      'Dalam memanfaatkan platform HELIORA, Anda dilarang:',
                    ],
                    bullets: [
                      'Melakukan rekayasa balik (reverse engineering) atau dekompilasi terhadap perangkat lunak dan model algoritma layanan.',
                      'Memanfaatkan platform untuk penilaian kelayakan, premi, atau klaim asuransi komersial, maupun pengambilan keputusan diskriminatif dalam ketenagakerjaan.',
                      'Mengirim data palsu secara massal untuk membebani atau mengganggu kestabilan sistem.',
                      'Menyalin, menjual kembali, atau menyebarluaskan materi dan basis data platform tanpa izin tertulis dari HELIORA.',
                    ],
                  ),

                  // 5. Keamanan Akun
                  _buildSection(
                    number: '5',
                    title: 'Keamanan Akun',
                    content: [
                      'Anda bertanggung jawab menjaga kerahasiaan kata sandi dan kredensial masuk akun Anda. '
                          'Setiap aktivitas yang dilakukan menggunakan akun Anda berada di bawah tanggung jawab Anda, '
                          'kecuali apabila timbul akibat kegagalan atau kelalaian sistem keamanan teknis kami.',
                      'Jika Anda menemukan indikasi akses tanpa izin pada akun Anda, segera hubungi autoruns18@gmail.com. '
                          'HELIORA tidak pernah meminta kata sandi Anda melalui telepon, pesan singkat, maupun media sosial.',
                    ],
                  ),

                  // 6. Tentang Estimasi AI
                  _buildSection(
                    number: '6',
                    title: 'Tentang Estimasi AI',
                    content: [
                      'Estimasi risiko dihitung berdasarkan perbandingan pola gaya hidup dengan data observasional populasi '
                          'dan algoritma analitis mesin (machine learning & Explainable AI).',
                      'Kategori skor yang ditampilkan menggambarkan posisi relatif terhadap pedoman pencegahan kesehatan, '
                          'bukan ramalan mutlak bahwa Anda pasti akan atau tidak akan menderita penyakit kronis tertentu. '
                          'Hasil simulasi interaktif adalah sarana visualisasi skenario hipotetis dan bukan jaminan hasil klinis di masa depan.',
                    ],
                  ),

                  // 7. Hak Kekayaan Intelektual
                  _buildSection(
                    number: '7',
                    title: 'Hak Kekayaan Intelektual',
                    content: [
                      'Seluruh merek dagang, desain antarmuka, arsitektur kode, basis data referensi bukti, dan algoritma '
                          'pada platform HELIORA adalah hak milik eksklusif Team Parental Advisory Explicit Content yang dilindungi oleh '
                          'undang-undang kekayaan intelektual Republik Indonesia.',
                      'Hak kekayaan intelektual atas platform ini tidak mencakup data pribadi Anda. Seluruh data kesehatan dan '
                          'profil gaya hidup yang Anda masukkan tetap menjadi milik Anda dan dikelola sesuai Kebijakan Privasi.',
                    ],
                  ),

                  // 8. Batasan Tanggung Jawab
                  _buildSection(
                    number: '8',
                    title: 'Batasan Tanggung Jawab',
                    content: [
                      'HELIORA bertanggung jawab atas keandalan teknis sistem dan pelindungan data pribadi pengguna yang '
                          'berada di bawah kendali langsung kami sesuai peraturan perundang-undangan yang berlaku.',
                      'Sejauh diizinkan oleh hukum, HELIORA tidak bertanggung jawab atas keputusan medis pribadi, '
                          'kelalaian dalam mencari bantuan tenaga kesehatan berlisensi, atau kerugian yang timbul akibat '
                          'kesalahan atau ketidakakuratan data profil yang dimasukkan oleh pengguna.',
                    ],
                  ),

                  // 9. Penutupan dan Penangguhan Akun
                  _buildSection(
                    number: '9',
                    title: 'Penutupan dan Penangguhan Akun',
                    content: [
                      'Penutupan oleh Pengguna: Anda dapat menutup akun Anda kapan saja secara mandiri melalui menu '
                          'Profil > Pengaturan > Hapus Akun. Penutupan akun akan menghapus profil kesehatan, riwayat skor, '
                          'dan catatan simulasi Anda secara menyeluruh dari sistem operasional kami dalam waktu maksimal 30 hari.',
                      'Penangguhan oleh HELIORA: HELIORA berhak menangguhkan atau menutup akses akun apabila Anda terbukti '
                          'melanggar ketentuan penggunaan (seperti mengirimkan data palsu secara massal). Pemberitahuan tertulis '
                          'akan disampaikan via email terdaftar.',
                    ],
                  ),

                  // 10. Perubahan Ketentuan
                  _buildSection(
                    number: '10',
                    title: 'Perubahan Ketentuan',
                    content: [
                      'Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Jika terdapat perubahan material '
                          'pada ketentuan penggunaan atau hak Anda, kami akan memberikan pemberitahuan minimal 14 hari kalender '
                          'sebelum perubahan berlaku melalui aplikasi atau email terdaftar.',
                      'Jika Anda tidak menyetujui perubahan ketentuan tersebut, Anda berhak untuk menghentikan penggunaan layanan '
                          'dan menutup akun Anda sebelum tanggal berlakunya ketentuan baru.',
                    ],
                  ),

                  // 11. Hukum dan Sengketa
                  _buildSection(
                    number: '11',
                    title: 'Hukum dan Sengketa',
                    content: [
                      'Ketentuan Layanan ini diatur dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia.',
                      'Setiap perselisihan yang berkaitan dengan pelaksanaan ketentuan ini akan diselesaikan terlebih dahulu '
                          'melalui musyawarah mufakat dalam kurun waktu 30 hari kalender. Apabila tidak tercapai, sengketa dapat '
                          'diajukan melalui Badan Penyelesaian Sengketa Konsumen (BPSK) atau Pengadilan Negeri Jakarta Selatan.',
                    ],
                  ),

                  // 12. Kontak dan Bantuan
                  _buildSection(
                    number: '12',
                    title: 'Kontak dan Bantuan',
                    content: [
                      'Jika Anda memiliki pertanyaan mengenai Ketentuan Layanan ini, silakan hubungi tim kami:',
                      '• Dukungan Pengguna: autoruns18@gmail.com\n'
                          '• Korespondensi Hukum: autoruns18@gmail.com\n'
                          '• Alamat Kantor: Team Parental Advisory Explicit Content, Jl. Ir. H. Juanda No. 15, Sidodadi, '
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

  Widget _buildSection({
    required String number,
    required String title,
    required List<String> content,
    List<String>? bullets,
    String? trailingContent,
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
          for (final p in content) ...[
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
          if (bullets != null && bullets.isNotEmpty) ...[
            for (final b in bullets) ...[
              Padding(
                padding: const EdgeInsets.only(left: 8.0, bottom: 6.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('•  ', style: TextStyle(color: HelioraTokens.primary, fontWeight: FontWeight.bold)),
                    Expanded(
                      child: Text(
                        b,
                        style: HelioraTokens.bodySmall.copyWith(
                          color: HelioraTokens.foreground,
                          height: 1.45,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 4),
          ],
          if (trailingContent != null) ...[
            Text(
              trailingContent,
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
