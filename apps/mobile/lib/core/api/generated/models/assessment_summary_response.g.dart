// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assessment_summary_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AssessmentSummaryResponse _$AssessmentSummaryResponseFromJson(
        Map<String, dynamic> json) =>
    AssessmentSummaryResponse(
      id: json['id'] as String,
      healthScore: json['health_score'] as num,
      lifestyleScore: json['lifestyle_score'] as num,
      risks: (json['risks'] as List<dynamic>)
          .map((e) => RiskAssessmentItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      topFactors: (json['top_factors'] as List<dynamic>)
          .map((e) => ContributingFactor.fromJson(e as Map<String, dynamic>))
          .toList(),
      recommendations: (json['recommendations'] as List<dynamic>)
          .map((e) => RecommendationItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      assessedAt: json['assessed_at'] as String,
      isMock: json['is_mock'] as bool? ?? false,
      userId: json['user_id'] as String?,
    );

Map<String, dynamic> _$AssessmentSummaryResponseToJson(
        AssessmentSummaryResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'health_score': instance.healthScore,
      'lifestyle_score': instance.lifestyleScore,
      'risks': instance.risks,
      'top_factors': instance.topFactors,
      'recommendations': instance.recommendations,
      'assessed_at': instance.assessedAt,
      'is_mock': instance.isMock,
    };
