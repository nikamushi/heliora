// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Strength of clinical evidence grade.
@JsonEnum()
enum ClinicalEvidenceItemEvidenceLevel {
  /// Incorrect name has been replaced. Original name: `Level A (Kuat)`.
  @JsonValue('Level A (Kuat)')
  undefined0('Level A (Kuat)'),
  /// Incorrect name has been replaced. Original name: `Level B (Sedang)`.
  @JsonValue('Level B (Sedang)')
  undefined1('Level B (Sedang)'),
  /// Incorrect name has been replaced. Original name: `Level C (Konsensus Pakar)`.
  @JsonValue('Level C (Konsensus Pakar)')
  undefined2('Level C (Konsensus Pakar)'),
  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const ClinicalEvidenceItemEvidenceLevel(this.json);

  factory ClinicalEvidenceItemEvidenceLevel.fromJson(String json) => values.firstWhere(
        (e) => e.json == json,
        orElse: () => $unknown,
      );

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();
  /// Returns all defined enum values excluding the $unknown value.
  static List<ClinicalEvidenceItemEvidenceLevel> get $valuesDefined => values.where((value) => value != $unknown).toList();
}
