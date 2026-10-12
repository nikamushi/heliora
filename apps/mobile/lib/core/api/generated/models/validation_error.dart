// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'validation_error.g.dart';

@JsonSerializable()
class ValidationError {
  const ValidationError({
    required this.loc,
    required this.msg,
    required this.type,
    this.input,
    this.ctx,
  });
  
  factory ValidationError.fromJson(Map<String, Object?> json) => _$ValidationErrorFromJson(json);
  
  final List<dynamic> loc;
  final String msg;
  final String type;
  final dynamic input;
  final dynamic ctx;

  Map<String, Object?> toJson() => _$ValidationErrorToJson(this);
}
