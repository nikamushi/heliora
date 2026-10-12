// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'consent_status_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ConsentStatusResponse _$ConsentStatusResponseFromJson(
        Map<String, dynamic> json) =>
    ConsentStatusResponse(
      hasActiveConsent: json['has_active_consent'] as bool,
      termsVersion: json['terms_version'] as String? ?? '1.0',
      medicalDisclaimer: json['medical_disclaimer'] as String? ??
          'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.',
      activeConsent: json['active_consent'] == null
          ? null
          : ConsentResponse.fromJson(
              json['active_consent'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$ConsentStatusResponseToJson(
        ConsentStatusResponse instance) =>
    <String, dynamic>{
      'has_active_consent': instance.hasActiveConsent,
      'active_consent': instance.activeConsent,
      'terms_version': instance.termsVersion,
      'medical_disclaimer': instance.medicalDisclaimer,
    };
