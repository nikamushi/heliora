// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'future_simulation_request_horizon_days.dart';

part 'future_simulation_request.g.dart';

/// Payload to request model-based risk trajectory projections.
@JsonSerializable()
class FutureSimulationRequest {
  const FutureSimulationRequest({
    this.horizonDays = FutureSimulationRequestHorizonDays.value90,
  });
  
  factory FutureSimulationRequest.fromJson(Map<String, Object?> json) => _$FutureSimulationRequestFromJson(json);
  
  /// Projection horizon period in days (30, 90, or 180 days).
  @JsonKey(name: 'horizon_days')
  final FutureSimulationRequestHorizonDays horizonDays;

  Map<String, Object?> toJson() => _$FutureSimulationRequestToJson(this);
}
