// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'recommendation_item_category.dart';
import 'recommendation_item_evidence_level.dart';
import 'recommendation_item_priority.dart';

part 'recommendation_item.g.dart';

@JsonSerializable()
class RecommendationItem {
  const RecommendationItem({
    required this.id,
    required this.title,
    required this.category,
    required this.action,
    required this.source,
    this.priority = RecommendationItemPriority.medium,
    this.evidenceLevel = RecommendationItemEvidenceLevel.a,
    this.ruleId,
  });
  
  factory RecommendationItem.fromJson(Map<String, Object?> json) => _$RecommendationItemFromJson(json);
  
  final String id;
  @JsonKey(name: 'rule_id')
  final String? ruleId;
  final String title;
  final RecommendationItemCategory category;
  final RecommendationItemPriority priority;
  final String action;
  @JsonKey(name: 'evidence_level')
  final RecommendationItemEvidenceLevel evidenceLevel;
  final String source;

  Map<String, Object?> toJson() => _$RecommendationItemToJson(this);
}
