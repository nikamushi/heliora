// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import 'auth/auth_client.dart';
import 'consent/consent_client.dart';
import 'health_profile/health_profile_client.dart';
import 'assessment/assessment_client.dart';
import 'simulation/simulation_client.dart';
import 'evidence/evidence_client.dart';
import 'system/system_client.dart';

/// HELIORA `v0.1.0`.
///
/// AI-Powered Preventive Health Intelligence Platform API. HELIORA is not a medical diagnosis tool.
class HelioraApiClient {
  HelioraApiClient(
    Dio dio, {
    String? baseUrl,
  })  : _dio = dio,
        _baseUrl = baseUrl;

  final Dio _dio;
  final String? _baseUrl;

  static String get version => '0.1.0';

  AuthClient? _auth;
  ConsentClient? _consent;
  HealthProfileClient? _healthProfile;
  AssessmentClient? _assessment;
  SimulationClient? _simulation;
  EvidenceClient? _evidence;
  SystemClient? _system;

  AuthClient get auth => _auth ??= AuthClient(_dio, baseUrl: _baseUrl);

  ConsentClient get consent => _consent ??= ConsentClient(_dio, baseUrl: _baseUrl);

  HealthProfileClient get healthProfile => _healthProfile ??= HealthProfileClient(_dio, baseUrl: _baseUrl);

  AssessmentClient get assessment => _assessment ??= AssessmentClient(_dio, baseUrl: _baseUrl);

  SimulationClient get simulation => _simulation ??= SimulationClient(_dio, baseUrl: _baseUrl);

  EvidenceClient get evidence => _evidence ??= EvidenceClient(_dio, baseUrl: _baseUrl);

  SystemClient get system => _system ??= SystemClient(_dio, baseUrl: _baseUrl);
}
