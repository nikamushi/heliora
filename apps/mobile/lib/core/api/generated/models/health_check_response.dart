// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'health_check_response.g.dart';

/// Response schema for the health check endpoint.
@JsonSerializable()
class HealthCheckResponse {
  const HealthCheckResponse({
    required this.environment,
    this.status = 'ok',
    this.project = 'HELIORA',
    this.version = '0.1.0',
  });
  
  factory HealthCheckResponse.fromJson(Map<String, Object?> json) => _$HealthCheckResponseFromJson(json);
  
  final String status;
  final String environment;
  final String project;
  final String version;

  Map<String, Object?> toJson() => _$HealthCheckResponseToJson(this);
}
