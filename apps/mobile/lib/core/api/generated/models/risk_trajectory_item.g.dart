// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'risk_trajectory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RiskTrajectoryItem _$RiskTrajectoryItemFromJson(Map<String, dynamic> json) =>
    RiskTrajectoryItem(
      condition:
          RiskTrajectoryItemCondition.fromJson(json['condition'] as String),
      label: json['label'] as String,
      baselineProbability: json['baseline_probability'] as num,
      projectedProbability: json['projected_probability'] as num,
      baselineScore: json['baseline_score'] as num,
      projectedScore: json['projected_score'] as num,
      deltaPercentage: json['delta_percentage'] as num,
      riskLevel:
          RiskTrajectoryItemRiskLevel.fromJson(json['risk_level'] as String),
      riskLabel:
          RiskTrajectoryItemRiskLabel.fromJson(json['risk_label'] as String),
      trend: RiskTrajectoryItemTrend.fromJson(json['trend'] as String),
      description: json['description'] as String,
    );

Map<String, dynamic> _$RiskTrajectoryItemToJson(RiskTrajectoryItem instance) =>
    <String, dynamic>{
      'condition': _$RiskTrajectoryItemConditionEnumMap[instance.condition]!,
      'label': instance.label,
      'baseline_probability': instance.baselineProbability,
      'projected_probability': instance.projectedProbability,
      'baseline_score': instance.baselineScore,
      'projected_score': instance.projectedScore,
      'delta_percentage': instance.deltaPercentage,
      'risk_level': _$RiskTrajectoryItemRiskLevelEnumMap[instance.riskLevel]!,
      'risk_label': _$RiskTrajectoryItemRiskLabelEnumMap[instance.riskLabel]!,
      'trend': _$RiskTrajectoryItemTrendEnumMap[instance.trend]!,
      'description': instance.description,
    };

const _$RiskTrajectoryItemConditionEnumMap = {
  RiskTrajectoryItemCondition.diabetes: 'diabetes',
  RiskTrajectoryItemCondition.hypertension: 'hypertension',
  RiskTrajectoryItemCondition.cardiovascular: 'cardiovascular',
  RiskTrajectoryItemCondition.$unknown: r'$unknown',
};

const _$RiskTrajectoryItemRiskLevelEnumMap = {
  RiskTrajectoryItemRiskLevel.low: 'low',
  RiskTrajectoryItemRiskLevel.moderate: 'moderate',
  RiskTrajectoryItemRiskLevel.high: 'high',
  RiskTrajectoryItemRiskLevel.$unknown: r'$unknown',
};

const _$RiskTrajectoryItemRiskLabelEnumMap = {
  RiskTrajectoryItemRiskLabel.lower: 'Lower',
  RiskTrajectoryItemRiskLabel.moderate: 'Moderate',
  RiskTrajectoryItemRiskLabel.higher: 'Higher',
  RiskTrajectoryItemRiskLabel.$unknown: r'$unknown',
};

const _$RiskTrajectoryItemTrendEnumMap = {
  RiskTrajectoryItemTrend.stable: 'stable',
  RiskTrajectoryItemTrend.increasing: 'increasing',
  RiskTrajectoryItemTrend.decreasing: 'decreasing',
  RiskTrajectoryItemTrend.$unknown: r'$unknown',
};
