// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'consent_response.g.dart';

/// Representation of an individual consent record.
@JsonSerializable()
class ConsentResponse {
  const ConsentResponse({
    required this.id,
    required this.userId,
    required this.consentVersion,
    required this.acceptedAt,
    required this.isActive,
    this.revokedAt,
  });
  
  factory ConsentResponse.fromJson(Map<String, Object?> json) => _$ConsentResponseFromJson(json);
  
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'consent_version')
  final String consentVersion;
  @JsonKey(name: 'accepted_at')
  final DateTime acceptedAt;
  @JsonKey(name: 'revoked_at')
  final DateTime? revokedAt;
  @JsonKey(name: 'is_active')
  final bool isActive;

  Map<String, Object?> toJson() => _$ConsentResponseToJson(this);
}
