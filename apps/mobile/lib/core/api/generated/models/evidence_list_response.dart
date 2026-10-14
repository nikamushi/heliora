// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'clinical_evidence_item.dart';

part 'evidence_list_response.g.dart';

/// Response payload containing clinical evidence citation items.
@JsonSerializable()
class EvidenceListResponse {
  const EvidenceListResponse({
    required this.items,
    required this.total,
  });
  
  factory EvidenceListResponse.fromJson(Map<String, Object?> json) => _$EvidenceListResponseFromJson(json);
  
  /// List of clinical evidence records.
  final List<ClinicalEvidenceItem> items;

  /// Total count of returned items.
  final int total;

  Map<String, Object?> toJson() => _$EvidenceListResponseToJson(this);
}
