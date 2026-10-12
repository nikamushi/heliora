// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'risk_assessment_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RiskAssessmentItem _$RiskAssessmentItemFromJson(Map<String, dynamic> json) =>
    RiskAssessmentItem(
      condition:
          RiskAssessmentItemCondition.fromJson(json['condition'] as String),
      label: json['label'] as String,
      probability: json['probability'] as num,
      estimatedRiskScore: json['estimated_risk_score'] as num,
      riskLevel:
          RiskAssessmentItemRiskLevel.fromJson(json['risk_level'] as String),
      description: json['description'] as String,
      riskLabel: json['risk_label'] == null
          ? RiskAssessmentItemRiskLabel.lower
          : RiskAssessmentItemRiskLabel.fromJson(json['risk_label'] as String),
      trend: json['trend'] == null
          ? RiskAssessmentItemTrend.stable
          : RiskAssessmentItemTrend.fromJson(json['trend'] as String),
    );

Map<String, dynamic> _$RiskAssessmentItemToJson(RiskAssessmentItem instance) =>
    <String, dynamic>{
      'condition': _$RiskAssessmentItemConditionEnumMap[instance.condition]!,
      'label': instance.label,
      'probability': instance.probability,
      'estimated_risk_score': instance.estimatedRiskScore,
      'risk_level': _$RiskAssessmentItemRiskLevelEnumMap[instance.riskLevel]!,
      'risk_label': _$RiskAssessmentItemRiskLabelEnumMap[instance.riskLabel]!,
      'trend': _$RiskAssessmentItemTrendEnumMap[instance.trend]!,
      'description': instance.description,
    };

const _$RiskAssessmentItemConditionEnumMap = {
  RiskAssessmentItemCondition.diabetes: 'diabetes',
  RiskAssessmentItemCondition.hypertension: 'hypertension',
  RiskAssessmentItemCondition.cardiovascular: 'cardiovascular',
  RiskAssessmentItemCondition.$unknown: r'$unknown',
};

const _$RiskAssessmentItemRiskLevelEnumMap = {
  RiskAssessmentItemRiskLevel.low: 'low',
  RiskAssessmentItemRiskLevel.moderate: 'moderate',
  RiskAssessmentItemRiskLevel.high: 'high',
  RiskAssessmentItemRiskLevel.$unknown: r'$unknown',
};

const _$RiskAssessmentItemRiskLabelEnumMap = {
  RiskAssessmentItemRiskLabel.lower: 'Lower',
  RiskAssessmentItemRiskLabel.moderate: 'Moderate',
  RiskAssessmentItemRiskLabel.higher: 'Higher',
  RiskAssessmentItemRiskLabel.$unknown: r'$unknown',
};

const _$RiskAssessmentItemTrendEnumMap = {
  RiskAssessmentItemTrend.stable: 'stable',
  RiskAssessmentItemTrend.increasing: 'increasing',
  RiskAssessmentItemTrend.decreasing: 'decreasing',
  RiskAssessmentItemTrend.$unknown: r'$unknown',
};
