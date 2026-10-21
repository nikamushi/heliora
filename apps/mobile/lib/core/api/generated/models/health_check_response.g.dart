// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_check_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HealthCheckResponse _$HealthCheckResponseFromJson(Map<String, dynamic> json) =>
    HealthCheckResponse(
      environment: json['environment'] as String,
      status: json['status'] as String? ?? 'ok',
      project: json['project'] as String? ?? 'HELIORA',
      version: json['version'] as String? ?? '0.1.0',
    );

Map<String, dynamic> _$HealthCheckResponseToJson(
        HealthCheckResponse instance) =>
    <String, dynamic>{
      'status': instance.status,
      'environment': instance.environment,
      'project': instance.project,
      'version': instance.version,
    };
