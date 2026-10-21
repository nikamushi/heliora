// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Categorized smoking habits for lifestyle risk factors.
@JsonEnum()
enum SmokingStatusEnum {
  @JsonValue('never')
  never('never'),
  @JsonValue('former')
  former('former'),
  @JsonValue('current')
  current('current'),
  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const SmokingStatusEnum(this.json);

  factory SmokingStatusEnum.fromJson(String json) => values.firstWhere(
        (e) => e.json == json,
        orElse: () => $unknown,
      );

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();
  /// Returns all defined enum values excluding the $unknown value.
  static List<SmokingStatusEnum> get $valuesDefined => values.where((value) => value != $unknown).toList();
}
