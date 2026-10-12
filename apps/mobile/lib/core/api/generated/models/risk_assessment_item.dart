// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'risk_assessment_item_condition.dart';
import 'risk_assessment_item_risk_label.dart';
import 'risk_assessment_item_risk_level.dart';
import 'risk_assessment_item_trend.dart';

part 'risk_assessment_item.g.dart';

@JsonSerializable()
class RiskAssessmentItem {
  const RiskAssessmentItem({
    required this.condition,
    required this.label,
    required this.probability,
    required this.estimatedRiskScore,
    required this.riskLevel,
    required this.description,
    this.riskLabel = RiskAssessmentItemRiskLabel.lower,
    this.trend = RiskAssessmentItemTrend.stable,
  });
  
  factory RiskAssessmentItem.fromJson(Map<String, Object?> json) => _$RiskAssessmentItemFromJson(json);
  
  final RiskAssessmentItemCondition condition;
  final String label;
  final num probability;
  @JsonKey(name: 'estimated_risk_score')
  final num estimatedRiskScore;
  @JsonKey(name: 'risk_level')
  final RiskAssessmentItemRiskLevel riskLevel;
  @JsonKey(name: 'risk_label')
  final RiskAssessmentItemRiskLabel riskLabel;
  final RiskAssessmentItemTrend trend;
  final String description;

  Map<String, Object?> toJson() => _$RiskAssessmentItemToJson(this);
}
