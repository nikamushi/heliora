// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'what_if_condition_comparison_condition.dart';
import 'what_if_condition_comparison_risk_label.dart';
import 'what_if_condition_comparison_risk_level.dart';
import 'what_if_condition_comparison_trend.dart';

part 'what_if_condition_comparison.g.dart';

/// Comparative outcome between baseline and simulated scenario for a chronic disease.
@JsonSerializable()
class WhatIfConditionComparison {
  const WhatIfConditionComparison({
    required this.condition,
    required this.label,
    required this.baselineProbability,
    required this.simulatedProbability,
    required this.baselineScore,
    required this.simulatedScore,
    required this.deltaPercentage,
    required this.riskLevel,
    required this.riskLabel,
    required this.trend,
    required this.impactSummary,
  });
  
  factory WhatIfConditionComparison.fromJson(Map<String, Object?> json) => _$WhatIfConditionComparisonFromJson(json);
  
  /// Condition identifier.
  final WhatIfConditionComparisonCondition condition;

  /// Condition human-readable title.
  final String label;

  /// Baseline risk probability.
  @JsonKey(name: 'baseline_probability')
  final num baselineProbability;

  /// Simulated scenario risk probability.
  @JsonKey(name: 'simulated_probability')
  final num simulatedProbability;

  /// Baseline risk percentage score.
  @JsonKey(name: 'baseline_score')
  final num baselineScore;

  /// Simulated risk percentage score.
  @JsonKey(name: 'simulated_score')
  final num simulatedScore;

  /// Score change in percentage points (simulated - baseline).
  @JsonKey(name: 'delta_percentage')
  final num deltaPercentage;

  /// Clinical risk level under simulated scenario.
  @JsonKey(name: 'risk_level')
  final WhatIfConditionComparisonRiskLevel riskLevel;

  /// Standardized editorial label: Lower, Moderate, or Higher.
  @JsonKey(name: 'risk_label')
  final WhatIfConditionComparisonRiskLabel riskLabel;

  /// Direction of risk movement compared to baseline.
  final WhatIfConditionComparisonTrend trend;

  /// Concise explanation of parameter modification impacts.
  @JsonKey(name: 'impact_summary')
  final String impactSummary;

  Map<String, Object?> toJson() => _$WhatIfConditionComparisonToJson(this);
}
