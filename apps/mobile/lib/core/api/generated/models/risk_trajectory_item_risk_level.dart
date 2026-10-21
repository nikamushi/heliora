// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Clinical risk category level at projected horizon.
@JsonEnum()
enum RiskTrajectoryItemRiskLevel {
  @JsonValue('low')
  low('low'),
  @JsonValue('moderate')
  moderate('moderate'),
  @JsonValue('high')
  high('high'),
  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const RiskTrajectoryItemRiskLevel(this.json);

  factory RiskTrajectoryItemRiskLevel.fromJson(String json) => values.firstWhere(
        (e) => e.json == json,
        orElse: () => $unknown,
      );

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();
  /// Returns all defined enum values excluding the $unknown value.
  static List<RiskTrajectoryItemRiskLevel> get $valuesDefined => values.where((value) => value != $unknown).toList();
}
