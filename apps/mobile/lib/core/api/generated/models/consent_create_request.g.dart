// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'consent_create_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ConsentCreateRequest _$ConsentCreateRequestFromJson(
        Map<String, dynamic> json) =>
    ConsentCreateRequest(
      agreed: json['agreed'] as bool,
      consentVersion: json['consent_version'] as String? ?? '1.0',
    );

Map<String, dynamic> _$ConsentCreateRequestToJson(
        ConsentCreateRequest instance) =>
    <String, dynamic>{
      'agreed': instance.agreed,
      'consent_version': instance.consentVersion,
    };
