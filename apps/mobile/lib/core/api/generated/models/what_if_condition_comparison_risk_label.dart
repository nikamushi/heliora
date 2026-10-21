// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Standardized editorial label: Lower, Moderate, or Higher.
@JsonEnum()
enum WhatIfConditionComparisonRiskLabel {
  @JsonValue('Lower')
  lower('Lower'),
  @JsonValue('Moderate')
  moderate('Moderate'),
  @JsonValue('Higher')
  higher('Higher'),
  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const WhatIfConditionComparisonRiskLabel(this.json);

  factory WhatIfConditionComparisonRiskLabel.fromJson(String json) => values.firstWhere(
        (e) => e.json == json,
        orElse: () => $unknown,
      );

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();
  /// Returns all defined enum values excluding the $unknown value.
  static List<WhatIfConditionComparisonRiskLabel> get $valuesDefined => values.where((value) => value != $unknown).toList();
}
