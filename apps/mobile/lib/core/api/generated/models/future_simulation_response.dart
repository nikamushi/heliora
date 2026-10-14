// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'future_simulation_response_horizon_days.dart';
import 'risk_trajectory_item.dart';

part 'future_simulation_response.g.dart';

/// Response containing future health projection scenario results.
@JsonSerializable()
class FutureSimulationResponse {
  const FutureSimulationResponse({
    required this.horizonDays,
    required this.assumptions,
    required this.baselineHealthScore,
    required this.projectedHealthScore,
    required this.baselineLifestyleScore,
    required this.projectedLifestyleScore,
    required this.riskTrajectories,
    this.isModelEstimated = true,
    this.disclaimer = 'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.',
  });
  
  factory FutureSimulationResponse.fromJson(Map<String, Object?> json) => _$FutureSimulationResponseFromJson(json);
  
  /// Simulated horizon in days (30, 90, 180).
  @JsonKey(name: 'horizon_days')
  final FutureSimulationResponseHorizonDays horizonDays;

  /// Explicit modeling assumptions under this scenario.
  final List<String> assumptions;

  /// Current overall health score.
  @JsonKey(name: 'baseline_health_score')
  final num baselineHealthScore;

  /// Projected overall health score at horizon.
  @JsonKey(name: 'projected_health_score')
  final num projectedHealthScore;

  /// Current lifestyle score.
  @JsonKey(name: 'baseline_lifestyle_score')
  final num baselineLifestyleScore;

  /// Projected lifestyle score at horizon.
  @JsonKey(name: 'projected_lifestyle_score')
  final num projectedLifestyleScore;

  /// Per-condition trajectory comparison items.
  @JsonKey(name: 'risk_trajectories')
  final List<RiskTrajectoryItem> riskTrajectories;

  /// Mandatory flag indicating model-based simulation (PRD BR-SIM-004).
  @JsonKey(name: 'is_model_estimated')
  final bool isModelEstimated;

  /// Mandatory verbatim disclaimer distinguishing simulation from clinical forecast (PRD FR-005).
  final String disclaimer;

  Map<String, Object?> toJson() => _$FutureSimulationResponseToJson(this);
}
