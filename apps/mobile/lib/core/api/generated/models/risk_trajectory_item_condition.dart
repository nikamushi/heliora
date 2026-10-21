// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Standard condition identifier.
@JsonEnum()
enum RiskTrajectoryItemCondition {
  @JsonValue('diabetes')
  diabetes('diabetes'),
  @JsonValue('hypertension')
  hypertension('hypertension'),
  @JsonValue('cardiovascular')
  cardiovascular('cardiovascular'),
  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const RiskTrajectoryItemCondition(this.json);

  factory RiskTrajectoryItemCondition.fromJson(String json) => values.firstWhere(
        (e) => e.json == json,
        orElse: () => $unknown,
      );

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();
  /// Returns all defined enum values excluding the $unknown value.
  static List<RiskTrajectoryItemCondition> get $valuesDefined => values.where((value) => value != $unknown).toList();
}
