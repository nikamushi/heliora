// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'user_register_request.g.dart';

/// Payload for registering a new user.
@JsonSerializable()
class UserRegisterRequest {
  const UserRegisterRequest({
    required this.email,
    required this.password,
    required this.fullName,
  });
  
  factory UserRegisterRequest.fromJson(Map<String, Object?> json) => _$UserRegisterRequestFromJson(json);
  
  /// User email address (must be valid format).
  final String email;

  /// User password (minimum 8 characters).
  final String password;

  /// User full name.
  @JsonKey(name: 'full_name')
  final String fullName;

  Map<String, Object?> toJson() => _$UserRegisterRequestToJson(this);
}
