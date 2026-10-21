import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:heliora_mobile/core/api/generated/export.dart';
import 'package:heliora_mobile/core/network/api_exception.dart';
import 'package:heliora_mobile/features/assessment/data/assessment_repository.dart';
import 'package:heliora_mobile/features/assessment/data/health_profile_repository.dart';
import 'package:heliora_mobile/features/assessment/presentation/assessment_flow_screen.dart';
import 'package:heliora_mobile/features/consent/data/consent_repository.dart';

class MockConsentRepository implements ConsentRepository {
  bool hasActiveConsent = true;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<ConsentStatusResponse> getConsentStatus() async {
    return ConsentStatusResponse(
      hasActiveConsent: hasActiveConsent,
      termsVersion: '1.0',
    );
  }
}

class MockHealthProfileRepository implements HealthProfileRepository {
  bool failSave = false;

  @override
  Future<HealthProfileResponse?> getHealthProfile() async => null;

  @override
  Future<HealthProfileResponse> createHealthProfile(HealthProfileCreateRequest request) async {
    return saveHealthProfile(request);
  }

  @override
  Future<HealthProfileResponse> updateHealthProfile(HealthProfileUpdateRequest request) async {
    throw UnimplementedError();
  }

  @override
  Future<HealthProfileResponse> saveHealthProfile(HealthProfileCreateRequest request) async {
    if (failSave) {
      throw const ApiException(message: 'Gagal menyimpan profil kesehatan');
    }
    return HealthProfileResponse(
      id: 'profile-1',
      userId: 'user-1',
      age: request.age,
      gender: request.gender.json ?? 'male',
      heightCm: request.heightCm,
      weightKg: request.weightKg,
      physicalActivityMinPerWeek: request.physicalActivityMinPerWeek,
      sleepDurationHours: request.sleepDurationHours,
      smokingStatus: request.smokingStatus.json ?? 'never',
      familyHistory: request.familyHistory,
    );
  }
}

class MockAssessmentRepository implements AssessmentRepository {
  bool failRun = false;

  @override
  Future<AssessmentSummaryResponse> runAssessment() async {
    if (failRun) {
      throw const ApiException(message: 'AI Service Temporarily Unavailable');
    }
    return const AssessmentSummaryResponse(
      id: 'assessment-result-1',
      healthScore: 85,
      lifestyleScore: 80,
      risks: [],
      topFactors: [],
      recommendations: [],
      assessedAt: '2026-10-12T10:00:00Z',
    );
  }

  @override
  Future<AssessmentSummaryResponse?> getLatestAssessment() async => null;

  @override
  Future<AssessmentSummaryResponse> getAssessmentById(String assessmentId) async {
    throw UnimplementedError();
  }
}

void main() {
  group('AssessmentFlowScreen', () {
    late MockHealthProfileRepository mockHealthProfileRepo;
    late MockAssessmentRepository mockAssessmentRepo;
    late MockConsentRepository mockConsentRepo;

    setUp(() {
      mockHealthProfileRepo = MockHealthProfileRepository();
      mockAssessmentRepo = MockAssessmentRepository();
      mockConsentRepo = MockConsentRepository();
    });

    Widget createTestWidget({VoidCallback? onCompleted}) {
      return ProviderScope(
        overrides: [
          healthProfileRepositoryProvider.overrideWithValue(mockHealthProfileRepo),
          assessmentRepositoryProvider.overrideWithValue(mockAssessmentRepo),
          consentRepositoryProvider.overrideWithValue(mockConsentRepo),
        ],
        child: MaterialApp(
          home: AssessmentFlowScreen(
            onAssessmentCompleted: onCompleted,
          ),
        ),
      );
    }

    testWidgets('renders Step 1 Data dasar with form fields and BMI indicator', (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('LANGKAH 02 / 02 · PROFIL KESEHATAN'), findsOneWidget);
      expect(find.text('Tahap 1 dari 3'), findsOneWidget);
      expect(find.text('Data dasar'), findsOneWidget);
      expect(find.text('Usia (tahun)'), findsOneWidget);
      expect(find.text('Jenis kelamin'), findsOneWidget);
      expect(find.text('Pria'), findsOneWidget);
      expect(find.text('Wanita'), findsOneWidget);
      expect(find.text('Tinggi badan (cm)'), findsOneWidget);
      expect(find.text('Berat badan (kg)'), findsOneWidget);
      expect(find.text('IMT'), findsOneWidget);
      expect(find.text('Lanjut'), findsOneWidget);
    });

    testWidgets('filling Step 1 fields updates BMI and enables next button', (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Enter Age: 29
      final ageField = find.widgetWithText(TextFormField, 'Contoh: 29');
      await tester.enterText(ageField, '29');
      await tester.pumpAndSettle();

      // Enter Height: 160
      final heightField = find.widgetWithText(TextFormField, '160');
      await tester.enterText(heightField, '160');
      await tester.pumpAndSettle();

      // Enter Weight: 74
      final weightField = find.widgetWithText(TextFormField, '74');
      await tester.enterText(weightField, '74');
      await tester.pumpAndSettle();

      // Verify dynamic BMI shows 28,9 and KELEBIHAN BERAT
      expect(find.text('28,9'), findsOneWidget);
      expect(find.text('KELEBIHAN BERAT'), findsOneWidget);

      // Tap Lanjut -> Should advance to Step 2
      final lanjutBtn = find.widgetWithText(ElevatedButton, 'Lanjut');
      await tester.tap(lanjutBtn);
      await tester.pumpAndSettle();

      expect(find.text('Tahap 2 dari 3'), findsOneWidget);
      expect(find.text('Pola gaya hidup'), findsOneWidget);
      expect(find.text('Aktivitas fisik'), findsOneWidget);
      expect(find.text('Durasi tidur'), findsOneWidget);
      expect(find.text('Status merokok'), findsOneWidget);
      expect(find.text('Tidak pernah'), findsOneWidget);
      expect(find.text('Kembali'), findsOneWidget);
    });

    testWidgets('navigating Step 2 to Step 3 and back works smoothly', (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Complete Step 1
      await tester.enterText(find.widgetWithText(TextFormField, 'Contoh: 29'), '29');
      await tester.enterText(find.widgetWithText(TextFormField, '160'), '160');
      await tester.enterText(find.widgetWithText(TextFormField, '74'), '55');
      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(ElevatedButton, 'Lanjut'));
      await tester.pumpAndSettle();

      // On Step 2, tap Lanjut -> moves to Step 3
      await tester.tap(find.widgetWithText(ElevatedButton, 'Lanjut'));
      await tester.pumpAndSettle();

      expect(find.text('Tahap 3 dari 3'), findsOneWidget);
      expect(find.text('Riwayat keluarga'), findsOneWidget);
      expect(find.text('Riwayat penyakit keluarga'), findsOneWidget);
      expect(find.text('Diabetes'), findsOneWidget);
      expect(find.text('Hipertensi'), findsOneWidget);
      expect(find.text('Penyakit jantung'), findsOneWidget);
      expect(find.text('Detail riwayat keluarga (opsional)'), findsOneWidget);
      expect(find.text('Tingkat stres harian (opsional)'), findsOneWidget);
      expect(find.text('Simpan dan jalankan asesmen'), findsOneWidget);

      // Tap Kembali -> moves back to Step 2
      await tester.tap(find.widgetWithText(OutlinedButton, 'Kembali'));
      await tester.pumpAndSettle();
      expect(find.text('Tahap 2 dari 3'), findsOneWidget);
      expect(find.text('Pola gaya hidup'), findsOneWidget);
    });

    testWidgets('handling failure shows honest failure view without false scores, and retry works', (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      mockAssessmentRepo.failRun = true;

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Fill Step 1
      await tester.enterText(find.widgetWithText(TextFormField, 'Contoh: 29'), '29');
      await tester.enterText(find.widgetWithText(TextFormField, '160'), '160');
      await tester.enterText(find.widgetWithText(TextFormField, '74'), '55');
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(ElevatedButton, 'Lanjut'));
      await tester.pumpAndSettle();

      // Step 2
      await tester.tap(find.widgetWithText(ElevatedButton, 'Lanjut'));
      await tester.pumpAndSettle();

      // Step 3: submit
      await tester.tap(find.widgetWithText(ElevatedButton, 'Simpan dan jalankan asesmen'));
      await tester.pump(); // Start async processing
      await tester.pumpAndSettle();

      // Verify Failure View
      expect(find.text('Analisis sedang tidak tersedia, coba lagi'), findsOneWidget);
      expect(find.text('Profil Anda sudah tersimpan. Skor tidak ditampilkan sampai analisis berhasil.'), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'Coba lagi'), findsOneWidget);
      expect(find.widgetWithText(OutlinedButton, 'Kembali ke profil'), findsOneWidget);

      // Now service recovers
      mockAssessmentRepo.failRun = false;
      var completedCalled = false;

      // Re-pump with completion listener
      await tester.pumpWidget(createTestWidget(onCompleted: () => completedCalled = true));
      // Re-trigger retry
      await tester.tap(find.widgetWithText(ElevatedButton, 'Coba lagi'));
      await tester.pump();
      await tester.pumpAndSettle();

      expect(completedCalled, isTrue);
    });

    testWidgets('pre-populates form controllers and dynamic BMI when initialProfile is provided', (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      const existingProfile = HealthProfileResponse(
        id: 'prof-existing',
        userId: 'usr-123',
        age: 42,
        gender: 'female',
        heightCm: 165.0,
        weightKg: 68.0,
        physicalActivityMinPerWeek: 180.0,
        sleepDurationHours: 7.5,
        smokingStatus: 'never',
        familyHistory: true,
        familyHistoryDetails: 'Diabetes, Hipertensi',
        stressLevel: 4,
      );

      var backPressed = false;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            healthProfileRepositoryProvider.overrideWithValue(mockHealthProfileRepo),
            assessmentRepositoryProvider.overrideWithValue(mockAssessmentRepo),
          ],
          child: MaterialApp(
            home: AssessmentFlowScreen(
              initialProfile: existingProfile,
              onBack: () => backPressed = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify form fields are pre-populated
      expect(find.text('42'), findsOneWidget);
      expect(find.text('165'), findsOneWidget);
      expect(find.text('68'), findsOneWidget);

      // Verify BMI calculated dynamically (68 / (1.65 * 1.65) = 24.97 -> 25,0)
      expect(find.text('IMT'), findsOneWidget);
      expect(find.text('25,0'), findsOneWidget);
      expect(find.text('NORMAL'), findsOneWidget);

      // Verify onBack button exists and triggers callback
      expect(find.widgetWithText(OutlinedButton, 'Batal & Kembali ke Profil'), findsOneWidget);
      await tester.tap(find.widgetWithText(OutlinedButton, 'Batal & Kembali ke Profil'));
      await tester.pumpAndSettle();
      expect(backPressed, isTrue);
    });
  });
}
