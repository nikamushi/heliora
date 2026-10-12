// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum RecommendationItemPriority {
  @JsonValue('high')
  high('high'),
  @JsonValue('medium')
  medium('medium'),
  @JsonValue('low')
  low('low'),
  @JsonValue('protective')
  protective('protective'),
  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const RecommendationItemPriority(this.json);

  factory RecommendationItemPriority.fromJson(String json) => values.firstWhere(
        (e) => e.json == json,
        orElse: () => $unknown,
      );

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();
  /// Returns all defined enum values excluding the $unknown value.
  static List<RecommendationItemPriority> get $valuesDefined => values.where((value) => value != $unknown).toList();
}
