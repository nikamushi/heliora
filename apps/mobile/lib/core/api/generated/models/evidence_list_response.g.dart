// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'evidence_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EvidenceListResponse _$EvidenceListResponseFromJson(
        Map<String, dynamic> json) =>
    EvidenceListResponse(
      items: (json['items'] as List<dynamic>)
          .map((e) => ClinicalEvidenceItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: (json['total'] as num).toInt(),
    );

Map<String, dynamic> _$EvidenceListResponseToJson(
        EvidenceListResponse instance) =>
    <String, dynamic>{
      'items': instance.items,
      'total': instance.total,
    };
