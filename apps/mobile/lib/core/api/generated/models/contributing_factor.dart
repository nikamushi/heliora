// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'contributing_factor_impact.dart';

part 'contributing_factor.g.dart';

@JsonSerializable()
class ContributingFactor {
  const ContributingFactor({
    required this.feature,
    required this.label,
    required this.impact,
    required this.weightPercentage,
    required this.description,
  });
  
  factory ContributingFactor.fromJson(Map<String, Object?> json) => _$ContributingFactorFromJson(json);
  
  final String feature;
  final String label;
  final ContributingFactorImpact impact;
  @JsonKey(name: 'weight_percentage')
  final num weightPercentage;
  final String description;

  Map<String, Object?> toJson() => _$ContributingFactorToJson(this);
}
