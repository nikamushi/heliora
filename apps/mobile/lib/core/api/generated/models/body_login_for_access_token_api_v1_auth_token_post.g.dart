// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'body_login_for_access_token_api_v1_auth_token_post.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BodyLoginForAccessTokenApiV1AuthTokenPost
    _$BodyLoginForAccessTokenApiV1AuthTokenPostFromJson(
            Map<String, dynamic> json) =>
        BodyLoginForAccessTokenApiV1AuthTokenPost(
          username: json['username'] as String,
          password: json['password'] as String,
          scope: json['scope'] as String? ?? '',
          grantType: json['grant_type'] as String?,
          clientId: json['client_id'] as String?,
          clientSecret: json['client_secret'] as String?,
        );

Map<String, dynamic> _$BodyLoginForAccessTokenApiV1AuthTokenPostToJson(
        BodyLoginForAccessTokenApiV1AuthTokenPost instance) =>
    <String, dynamic>{
      'grant_type': instance.grantType,
      'username': instance.username,
      'password': instance.password,
      'scope': instance.scope,
      'client_id': instance.clientId,
      'client_secret': instance.clientSecret,
    };
