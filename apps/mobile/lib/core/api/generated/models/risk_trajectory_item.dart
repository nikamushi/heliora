// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'risk_trajectory_item_condition.dart';
import 'risk_trajectory_item_risk_label.dart';
import 'risk_trajectory_item_risk_level.dart';
import 'risk_trajectory_item_trend.dart';

part 'risk_trajectory_item.g.dart';

/// Estimated risk trajectory outcome for a specific chronic condition.
@JsonSerializable()
class RiskTrajectoryItem {
  const RiskTrajectoryItem({
    required this.condition,
    required this.label,
    required this.baselineProbability,
    required this.projectedProbability,
    required this.baselineScore,
    required this.projectedScore,
    required this.deltaPercentage,
    required this.riskLevel,
    required this.riskLabel,
    required this.trend,
    required this.description,
  });
  
  factory RiskTrajectoryItem.fromJson(Map<String, Object?> json) => _$RiskTrajectoryItemFromJson(json);
  
  /// Standard condition identifier.
  final RiskTrajectoryItemCondition condition;

  /// Human-readable condition title.
  final String label;

  /// Current baseline risk probability.
  @JsonKey(name: 'baseline_probability')
  final num baselineProbability;

  /// Model-projected risk probability at horizon.
  @JsonKey(name: 'projected_probability')
  final num projectedProbability;

  /// Current baseline score percentage (0-100).
  @JsonKey(name: 'baseline_score')
  final num baselineScore;

  /// Projected score percentage (0-100).
  @JsonKey(name: 'projected_score')
  final num projectedScore;

  /// Net change in risk score (projected - baseline).
  @JsonKey(name: 'delta_percentage')
  final num deltaPercentage;

  /// Clinical risk category level at projected horizon.
  @JsonKey(name: 'risk_level')
  final RiskTrajectoryItemRiskLevel riskLevel;

  /// Standardized editorial label: Lower, Moderate, or Higher.
  @JsonKey(name: 'risk_label')
  final RiskTrajectoryItemRiskLabel riskLabel;

  /// Trajectory direction over horizon.
  final RiskTrajectoryItemTrend trend;

  /// Clinical explanation of projected lifestyle trajectory.
  final String description;

  Map<String, Object?> toJson() => _$RiskTrajectoryItemToJson(this);
}
