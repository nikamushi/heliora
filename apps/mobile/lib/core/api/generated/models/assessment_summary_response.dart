// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'contributing_factor.dart';
import 'recommendation_item.dart';
import 'risk_assessment_item.dart';

part 'assessment_summary_response.g.dart';

@JsonSerializable()
class AssessmentSummaryResponse {
  const AssessmentSummaryResponse({
    required this.id,
    required this.healthScore,
    required this.lifestyleScore,
    required this.risks,
    required this.topFactors,
    required this.recommendations,
    required this.assessedAt,
    this.isMock = false,
    this.userId,
  });
  
  factory AssessmentSummaryResponse.fromJson(Map<String, Object?> json) => _$AssessmentSummaryResponseFromJson(json);
  
  final String id;
  @JsonKey(name: 'user_id')
  final String? userId;
  @JsonKey(name: 'health_score')
  final num healthScore;
  @JsonKey(name: 'lifestyle_score')
  final num lifestyleScore;
  final List<RiskAssessmentItem> risks;
  @JsonKey(name: 'top_factors')
  final List<ContributingFactor> topFactors;
  final List<RecommendationItem> recommendations;
  @JsonKey(name: 'assessed_at')
  final String assessedAt;
  @JsonKey(name: 'is_mock')
  final bool isMock;

  Map<String, Object?> toJson() => _$AssessmentSummaryResponseToJson(this);
}
