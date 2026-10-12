// coverage:ignore-file
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import '../models/body_login_for_access_token_api_v1_auth_token_post.dart';
import '../models/token_response.dart';
import '../models/user_login_request.dart';
import '../models/user_register_request.dart';
import '../models/user_response.dart';

class AuthClient {
  const AuthClient(this._dio, {this.baseUrl});

  final Dio _dio;
  final String? baseUrl;

  String _resolvePath(String path) {
    if (baseUrl == null || baseUrl!.isEmpty) return path;
    final cleanBase = baseUrl!.endsWith('/')
        ? baseUrl!.substring(0, baseUrl!.length - 1)
        : baseUrl!;
    return '$cleanBase$path';
  }

  /// Register a new user (Deprecated).
  @Deprecated('This method is marked as deprecated')
  Future<TokenResponse> registerApiV1AuthRegisterPost({
    required UserRegisterRequest body,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/auth/register'),
      data: body.toJson(),
    );
    return TokenResponse.fromJson(response.data!);
  }

  /// User login via JSON (Deprecated).
  @Deprecated('This method is marked as deprecated')
  Future<TokenResponse> loginApiV1AuthLoginPost({
    required UserLoginRequest body,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/auth/login'),
      data: body.toJson(),
    );
    return TokenResponse.fromJson(response.data!);
  }

  /// OAuth2 Password token endpoint (Deprecated).
  @Deprecated('This method is marked as deprecated')
  Future<TokenResponse> loginForAccessTokenApiV1AuthTokenPost({
    required BodyLoginForAccessTokenApiV1AuthTokenPost body,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      _resolvePath('/api/v1/auth/token'),
      data: body.toJson(),
      options: Options(contentType: Headers.formUrlEncodedContentType),
    );
    return TokenResponse.fromJson(response.data!);
  }

  /// Get current user profile.
  Future<UserResponse> getMeApiV1AuthMeGet() async {
    final response = await _dio.get<Map<String, dynamic>>(
      _resolvePath('/api/v1/auth/me'),
    );
    return UserResponse.fromJson(response.data!);
  }
}
