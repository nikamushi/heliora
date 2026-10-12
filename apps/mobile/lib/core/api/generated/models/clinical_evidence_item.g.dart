// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'clinical_evidence_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClinicalEvidenceItem _$ClinicalEvidenceItemFromJson(
        Map<String, dynamic> json) =>
    ClinicalEvidenceItem(
      id: json['id'] as String,
      ruleId: json['rule_id'] as String,
      title: json['title'] as String,
      organization: json['organization'] as String,
      year: (json['year'] as num).toInt(),
      evidenceLevel: ClinicalEvidenceItemEvidenceLevel.fromJson(
          json['evidence_level'] as String),
      category:
          ClinicalEvidenceItemCategory.fromJson(json['category'] as String),
      categoryLabel: json['category_label'] as String,
      summary: json['summary'] as String,
      clinicalSection: json['clinical_section'] as String,
      citation: json['citation'] as String,
      externalUrl: json['external_url'] as String,
    );

Map<String, dynamic> _$ClinicalEvidenceItemToJson(
        ClinicalEvidenceItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'rule_id': instance.ruleId,
      'title': instance.title,
      'organization': instance.organization,
      'year': instance.year,
      'evidence_level':
          _$ClinicalEvidenceItemEvidenceLevelEnumMap[instance.evidenceLevel]!,
      'category': _$ClinicalEvidenceItemCategoryEnumMap[instance.category]!,
      'category_label': instance.categoryLabel,
      'summary': instance.summary,
      'clinical_section': instance.clinicalSection,
      'citation': instance.citation,
      'external_url': instance.externalUrl,
    };

const _$ClinicalEvidenceItemEvidenceLevelEnumMap = {
  ClinicalEvidenceItemEvidenceLevel.undefined0: 'Level A (Kuat)',
  ClinicalEvidenceItemEvidenceLevel.undefined1: 'Level B (Sedang)',
  ClinicalEvidenceItemEvidenceLevel.undefined2: 'Level C (Konsensus Pakar)',
  ClinicalEvidenceItemEvidenceLevel.$unknown: r'$unknown',
};

const _$ClinicalEvidenceItemCategoryEnumMap = {
  ClinicalEvidenceItemCategory.activity: 'activity',
  ClinicalEvidenceItemCategory.sleep: 'sleep',
  ClinicalEvidenceItemCategory.nutrition: 'nutrition',
  ClinicalEvidenceItemCategory.cardiovascular: 'cardiovascular',
  ClinicalEvidenceItemCategory.stress: 'stress',
  ClinicalEvidenceItemCategory.$unknown: r'$unknown',
};
