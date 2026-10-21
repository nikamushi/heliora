// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'clinical_evidence_item_category.dart';
import 'clinical_evidence_item_evidence_level.dart';

part 'clinical_evidence_item.g.dart';

/// A verified clinical evidence or guideline citation entry.
@JsonSerializable()
class ClinicalEvidenceItem {
  const ClinicalEvidenceItem({
    required this.id,
    required this.ruleId,
    required this.title,
    required this.organization,
    required this.year,
    required this.evidenceLevel,
    required this.category,
    required this.categoryLabel,
    required this.summary,
    required this.clinicalSection,
    required this.citation,
    required this.externalUrl,
  });
  
  factory ClinicalEvidenceItem.fromJson(Map<String, Object?> json) => _$ClinicalEvidenceItemFromJson(json);
  
  /// Unique evidence identifier (e.g., 'evi-01').
  final String id;

  /// Referenced intervention rule ID (e.g., 'REC-ACT-01').
  @JsonKey(name: 'rule_id')
  final String ruleId;

  /// Full title of the clinical guideline or study.
  final String title;

  /// Authoring medical body or guideline publisher.
  final String organization;

  /// Publication year.
  final int year;

  /// Strength of clinical evidence grade.
  @JsonKey(name: 'evidence_level')
  final ClinicalEvidenceItemEvidenceLevel evidenceLevel;

  /// Domain category of evidence.
  final ClinicalEvidenceItemCategory category;

  /// Human-readable category title.
  @JsonKey(name: 'category_label')
  final String categoryLabel;

  /// Structured clinical abstract / evidentiary justification.
  final String summary;

  /// Specific recommendation section or chapter.
  @JsonKey(name: 'clinical_section')
  final String clinicalSection;

  /// Standard academic / clinical citation.
  final String citation;

  /// Direct reference URL to source guideline publication.
  @JsonKey(name: 'external_url')
  final String externalUrl;

  Map<String, Object?> toJson() => _$ClinicalEvidenceItemToJson(this);
}
