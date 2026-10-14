// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'consent_response.dart';

part 'consent_status_response.g.dart';

/// Status indicating whether user has active consent along with disclaimer copy.
@JsonSerializable()
class ConsentStatusResponse {
  const ConsentStatusResponse({
    required this.hasActiveConsent,
    this.termsVersion = '1.0',
    this.medicalDisclaimer = 'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.',
    this.activeConsent,
  });
  
  factory ConsentStatusResponse.fromJson(Map<String, Object?> json) => _$ConsentStatusResponseFromJson(json);
  
  @JsonKey(name: 'has_active_consent')
  final bool hasActiveConsent;
  @JsonKey(name: 'active_consent')
  final ConsentResponse? activeConsent;
  @JsonKey(name: 'terms_version')
  final String termsVersion;
  @JsonKey(name: 'medical_disclaimer')
  final String medicalDisclaimer;

  Map<String, Object?> toJson() => _$ConsentStatusResponseToJson(this);
}
