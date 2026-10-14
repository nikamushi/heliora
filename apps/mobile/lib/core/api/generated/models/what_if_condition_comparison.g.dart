// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'what_if_condition_comparison.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WhatIfConditionComparison _$WhatIfConditionComparisonFromJson(
        Map<String, dynamic> json) =>
    WhatIfConditionComparison(
      condition: WhatIfConditionComparisonCondition.fromJson(
          json['condition'] as String),
      label: json['label'] as String,
      baselineProbability: json['baseline_probability'] as num,
      simulatedProbability: json['simulated_probability'] as num,
      baselineScore: json['baseline_score'] as num,
      simulatedScore: json['simulated_score'] as num,
      deltaPercentage: json['delta_percentage'] as num,
      riskLevel: WhatIfConditionComparisonRiskLevel.fromJson(
          json['risk_level'] as String),
      riskLabel: WhatIfConditionComparisonRiskLabel.fromJson(
          json['risk_label'] as String),
      trend: WhatIfConditionComparisonTrend.fromJson(json['trend'] as String),
      impactSummary: json['impact_summary'] as String,
    );

Map<String, dynamic> _$WhatIfConditionComparisonToJson(
        WhatIfConditionComparison instance) =>
    <String, dynamic>{
      'condition':
          _$WhatIfConditionComparisonConditionEnumMap[instance.condition]!,
      'label': instance.label,
      'baseline_probability': instance.baselineProbability,
      'simulated_probability': instance.simulatedProbability,
      'baseline_score': instance.baselineScore,
      'simulated_score': instance.simulatedScore,
      'delta_percentage': instance.deltaPercentage,
      'risk_level':
          _$WhatIfConditionComparisonRiskLevelEnumMap[instance.riskLevel]!,
      'risk_label':
          _$WhatIfConditionComparisonRiskLabelEnumMap[instance.riskLabel]!,
      'trend': _$WhatIfConditionComparisonTrendEnumMap[instance.trend]!,
      'impact_summary': instance.impactSummary,
    };

const _$WhatIfConditionComparisonConditionEnumMap = {
  WhatIfConditionComparisonCondition.diabetes: 'diabetes',
  WhatIfConditionComparisonCondition.hypertension: 'hypertension',
  WhatIfConditionComparisonCondition.cardiovascular: 'cardiovascular',
  WhatIfConditionComparisonCondition.$unknown: r'$unknown',
};

const _$WhatIfConditionComparisonRiskLevelEnumMap = {
  WhatIfConditionComparisonRiskLevel.low: 'low',
  WhatIfConditionComparisonRiskLevel.moderate: 'moderate',
  WhatIfConditionComparisonRiskLevel.high: 'high',
  WhatIfConditionComparisonRiskLevel.$unknown: r'$unknown',
};

const _$WhatIfConditionComparisonRiskLabelEnumMap = {
  WhatIfConditionComparisonRiskLabel.lower: 'Lower',
  WhatIfConditionComparisonRiskLabel.moderate: 'Moderate',
  WhatIfConditionComparisonRiskLabel.higher: 'Higher',
  WhatIfConditionComparisonRiskLabel.$unknown: r'$unknown',
};

const _$WhatIfConditionComparisonTrendEnumMap = {
  WhatIfConditionComparisonTrend.stable: 'stable',
  WhatIfConditionComparisonTrend.increasing: 'increasing',
  WhatIfConditionComparisonTrend.decreasing: 'decreasing',
  WhatIfConditionComparisonTrend.$unknown: r'$unknown',
};
