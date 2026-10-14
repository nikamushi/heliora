// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recommendation_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RecommendationItem _$RecommendationItemFromJson(Map<String, dynamic> json) =>
    RecommendationItem(
      id: json['id'] as String,
      title: json['title'] as String,
      category: RecommendationItemCategory.fromJson(json['category'] as String),
      action: json['action'] as String,
      source: json['source'] as String,
      priority: json['priority'] == null
          ? RecommendationItemPriority.medium
          : RecommendationItemPriority.fromJson(json['priority'] as String),
      evidenceLevel: json['evidence_level'] == null
          ? RecommendationItemEvidenceLevel.a
          : RecommendationItemEvidenceLevel.fromJson(
              json['evidence_level'] as String),
      ruleId: json['rule_id'] as String?,
    );

Map<String, dynamic> _$RecommendationItemToJson(RecommendationItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'rule_id': instance.ruleId,
      'title': instance.title,
      'category': _$RecommendationItemCategoryEnumMap[instance.category]!,
      'priority': _$RecommendationItemPriorityEnumMap[instance.priority]!,
      'action': instance.action,
      'evidence_level':
          _$RecommendationItemEvidenceLevelEnumMap[instance.evidenceLevel]!,
      'source': instance.source,
    };

const _$RecommendationItemCategoryEnumMap = {
  RecommendationItemCategory.sleep: 'sleep',
  RecommendationItemCategory.activity: 'activity',
  RecommendationItemCategory.nutrition: 'nutrition',
  RecommendationItemCategory.stress: 'stress',
  RecommendationItemCategory.$unknown: r'$unknown',
};

const _$RecommendationItemPriorityEnumMap = {
  RecommendationItemPriority.high: 'high',
  RecommendationItemPriority.medium: 'medium',
  RecommendationItemPriority.low: 'low',
  RecommendationItemPriority.protective: 'protective',
  RecommendationItemPriority.$unknown: r'$unknown',
};

const _$RecommendationItemEvidenceLevelEnumMap = {
  RecommendationItemEvidenceLevel.a: 'A',
  RecommendationItemEvidenceLevel.b: 'B',
  RecommendationItemEvidenceLevel.c: 'C',
  RecommendationItemEvidenceLevel.$unknown: r'$unknown',
};
