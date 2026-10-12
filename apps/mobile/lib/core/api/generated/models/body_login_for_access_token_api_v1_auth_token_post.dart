// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'body_login_for_access_token_api_v1_auth_token_post.g.dart';

@JsonSerializable()
class BodyLoginForAccessTokenApiV1AuthTokenPost {
  const BodyLoginForAccessTokenApiV1AuthTokenPost({
    required this.username,
    required this.password,
    this.scope = '',
    this.grantType,
    this.clientId,
    this.clientSecret,
  });
  
  factory BodyLoginForAccessTokenApiV1AuthTokenPost.fromJson(Map<String, Object?> json) => _$BodyLoginForAccessTokenApiV1AuthTokenPostFromJson(json);
  
  @JsonKey(name: 'grant_type')
  final String? grantType;
  final String username;
  final String password;
  final String scope;
  @JsonKey(name: 'client_id')
  final String? clientId;
  @JsonKey(name: 'client_secret')
  final String? clientSecret;

  Map<String, Object?> toJson() => _$BodyLoginForAccessTokenApiV1AuthTokenPostToJson(this);
}
