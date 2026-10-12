// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'what_if_condition_comparison.dart';

part 'what_if_simulation_response.g.dart';

/// Response containing What-If simulation comparative results.
@JsonSerializable()
class WhatIfSimulationResponse {
  const WhatIfSimulationResponse({
    required this.appliedParameters,
    required this.derivedBmi,
    required this.baselineHealthScore,
    required this.simulatedHealthScore,
    required this.healthScoreDelta,
    required this.baselineLifestyleScore,
    required this.simulatedLifestyleScore,
    required this.lifestyleScoreDelta,
    required this.conditionComparisons,
    this.isModelEstimated = true,
    this.disclaimer = 'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.',
  });
  
  factory WhatIfSimulationResponse.fromJson(Map<String, Object?> json) => _$WhatIfSimulationResponseFromJson(json);
  
  /// Dictionary of active lifestyle parameters used in this scenario.
  @JsonKey(name: 'applied_parameters')
  final Map<String, dynamic> appliedParameters;

  /// Recalculated BMI based on simulated weight.
  @JsonKey(name: 'derived_bmi')
  final num derivedBmi;

  /// Current baseline overall health score.
  @JsonKey(name: 'baseline_health_score')
  final num baselineHealthScore;

  /// Overall health score under simulated scenario.
  @JsonKey(name: 'simulated_health_score')
  final num simulatedHealthScore;

  /// Change in health score (simulated - baseline).
  @JsonKey(name: 'health_score_delta')
  final num healthScoreDelta;

  /// Current baseline lifestyle habits score.
  @JsonKey(name: 'baseline_lifestyle_score')
  final num baselineLifestyleScore;

  /// Lifestyle habits score under simulated scenario.
  @JsonKey(name: 'simulated_lifestyle_score')
  final num simulatedLifestyleScore;

  /// Change in lifestyle score (simulated - baseline).
  @JsonKey(name: 'lifestyle_score_delta')
  final num lifestyleScoreDelta;

  /// Detailed per-condition comparative risk breakdown.
  @JsonKey(name: 'condition_comparisons')
  final List<WhatIfConditionComparison> conditionComparisons;

  /// Mandatory flag indicating model-based simulation (PRD BR-SIM-004).
  @JsonKey(name: 'is_model_estimated')
  final bool isModelEstimated;

  /// Mandatory verbatim disclaimer distinguishing simulation from clinical forecast (PRD FR-005).
  final String disclaimer;

  Map<String, Object?> toJson() => _$WhatIfSimulationResponseToJson(this);
}
