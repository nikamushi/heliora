// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'user_response.dart';

part 'token_response.g.dart';

/// Response returned upon successful authentication.
@JsonSerializable()
class TokenResponse {
  const TokenResponse({
    required this.accessToken,
    required this.user,
    this.tokenType = 'bearer',
  });
  
  factory TokenResponse.fromJson(Map<String, Object?> json) => _$TokenResponseFromJson(json);
  
  @JsonKey(name: 'access_token')
  final String accessToken;
  @JsonKey(name: 'token_type')
  final String tokenType;
  final UserResponse user;

  Map<String, Object?> toJson() => _$TokenResponseToJson(this);
}
