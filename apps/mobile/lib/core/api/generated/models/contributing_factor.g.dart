// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'contributing_factor.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ContributingFactor _$ContributingFactorFromJson(Map<String, dynamic> json) =>
    ContributingFactor(
      feature: json['feature'] as String,
      label: json['label'] as String,
      impact: ContributingFactorImpact.fromJson(json['impact'] as String),
      weightPercentage: json['weight_percentage'] as num,
      description: json['description'] as String,
    );

Map<String, dynamic> _$ContributingFactorToJson(ContributingFactor instance) =>
    <String, dynamic>{
      'feature': instance.feature,
      'label': instance.label,
      'impact': _$ContributingFactorImpactEnumMap[instance.impact]!,
      'weight_percentage': instance.weightPercentage,
      'description': instance.description,
    };

const _$ContributingFactorImpactEnumMap = {
  ContributingFactorImpact.increase: 'increase',
  ContributingFactorImpact.decrease: 'decrease',
  ContributingFactorImpact.$unknown: r'$unknown',
};
