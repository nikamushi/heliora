// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'user_login_request.g.dart';

/// Payload for authenticating an existing user via JSON.
@JsonSerializable()
class UserLoginRequest {
  const UserLoginRequest({
    required this.email,
    required this.password,
  });
  
  factory UserLoginRequest.fromJson(Map<String, Object?> json) => _$UserLoginRequestFromJson(json);
  
  /// User registered email address.
  final String email;

  /// User account password.
  final String password;

  Map<String, Object?> toJson() => _$UserLoginRequestToJson(this);
}
