// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'user_response.g.dart';

/// User profile response representation.
@JsonSerializable()
class UserResponse {
  const UserResponse({
    required this.id,
    required this.email,
    required this.fullName,
    required this.createdAt,
  });
  
  factory UserResponse.fromJson(Map<String, Object?> json) => _$UserResponseFromJson(json);
  
  final String id;
  final String email;
  @JsonKey(name: 'full_name')
  final String fullName;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  Map<String, Object?> toJson() => _$UserResponseToJson(this);
}
