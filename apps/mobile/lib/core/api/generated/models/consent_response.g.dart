// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'consent_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ConsentResponse _$ConsentResponseFromJson(Map<String, dynamic> json) =>
    ConsentResponse(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      consentVersion: json['consent_version'] as String,
      acceptedAt: DateTime.parse(json['accepted_at'] as String),
      isActive: json['is_active'] as bool,
      revokedAt: json['revoked_at'] == null
          ? null
          : DateTime.parse(json['revoked_at'] as String),
    );

Map<String, dynamic> _$ConsentResponseToJson(ConsentResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'consent_version': instance.consentVersion,
      'accepted_at': instance.acceptedAt.toIso8601String(),
      'revoked_at': instance.revokedAt?.toIso8601String(),
      'is_active': instance.isActive,
    };
