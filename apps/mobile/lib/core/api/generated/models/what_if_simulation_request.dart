// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'what_if_simulation_request_smoking_status.dart';

part 'what_if_simulation_request.g.dart';

/// Payload to simulate adjustments on modifiable lifestyle parameters.
@JsonSerializable()
class WhatIfSimulationRequest {
  const WhatIfSimulationRequest({
    this.sleepDurationHours,
    this.physicalActivityMinPerWeek,
    this.weightKg,
    this.smokingStatus,
  });
  
  factory WhatIfSimulationRequest.fromJson(Map<String, Object?> json) => _$WhatIfSimulationRequestFromJson(json);
  
  /// Overridden daily sleep duration in hours (3.0 - 14.0).
  @JsonKey(name: 'sleep_duration_hours')
  final num? sleepDurationHours;

  /// Overridden weekly physical activity minutes (0 - 1000).
  @JsonKey(name: 'physical_activity_min_per_week')
  final num? physicalActivityMinPerWeek;

  /// Overridden weight in kilograms (30.0 - 300.0).
  @JsonKey(name: 'weight_kg')
  final num? weightKg;

  /// Overridden smoking habit status ('never', 'former', 'current').
  @JsonKey(name: 'smoking_status')
  final WhatIfSimulationRequestSmokingStatus? smokingStatus;

  Map<String, Object?> toJson() => _$WhatIfSimulationRequestToJson(this);
}
