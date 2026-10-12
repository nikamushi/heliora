// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'validation_error.dart';

part 'http_validation_error.g.dart';

@JsonSerializable()
class HttpValidationError {
  const HttpValidationError({
    this.detail,
  });
  
  factory HttpValidationError.fromJson(Map<String, Object?> json) => _$HttpValidationErrorFromJson(json);
  
  final List<ValidationError>? detail;

  Map<String, Object?> toJson() => _$HttpValidationErrorToJson(this);
}
