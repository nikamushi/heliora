// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'consent_create_request.g.dart';

/// Payload for recording user agreement to terms and medical disclaimer.
@JsonSerializable()
class ConsentCreateRequest {
  const ConsentCreateRequest({
    required this.agreed,
    this.consentVersion = '1.0',
  });
  
  factory ConsentCreateRequest.fromJson(Map<String, Object?> json) => _$ConsentCreateRequestFromJson(json);
  
  /// Explicit agreement to data processing and medical disclaimer acknowledgement.
  final bool agreed;

  /// Version string of the terms and disclaimer presented to user.
  @JsonKey(name: 'consent_version')
  final String consentVersion;

  Map<String, Object?> toJson() => _$ConsentCreateRequestToJson(this);
}
