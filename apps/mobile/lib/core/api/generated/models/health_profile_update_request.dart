// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'gender_enum.dart';
import 'smoking_status_enum.dart';

part 'health_profile_update_request.g.dart';

/// Payload for updating an existing health profile.
@JsonSerializable()
class HealthProfileUpdateRequest {
  const HealthProfileUpdateRequest({
    this.age,
    this.gender,
    this.heightCm,
    this.weightKg,
    this.physicalActivityMinPerWeek,
    this.sleepDurationHours,
    this.smokingStatus,
    this.familyHistory,
    this.familyHistoryDetails,
    this.stressLevel,
    this.bmi,
    this.waistCircumferenceCm,
    this.bloodPressure,
    this.bloodSugarMgDl,
    this.cholesterolMgDl,
  });
  
  factory HealthProfileUpdateRequest.fromJson(Map<String, Object?> json) => _$HealthProfileUpdateRequestFromJson(json);
  
  final int? age;
  final GenderEnum? gender;
  @JsonKey(name: 'height_cm')
  final num? heightCm;
  @JsonKey(name: 'weight_kg')
  final num? weightKg;
  @JsonKey(name: 'physical_activity_min_per_week')
  final num? physicalActivityMinPerWeek;
  @JsonKey(name: 'sleep_duration_hours')
  final num? sleepDurationHours;
  @JsonKey(name: 'smoking_status')
  final SmokingStatusEnum? smokingStatus;
  @JsonKey(name: 'family_history')
  final bool? familyHistory;
  @JsonKey(name: 'family_history_details')
  final String? familyHistoryDetails;
  @JsonKey(name: 'stress_level')
  final int? stressLevel;
  final num? bmi;
  @JsonKey(name: 'waist_circumference_cm')
  final num? waistCircumferenceCm;
  @JsonKey(name: 'blood_pressure')
  final String? bloodPressure;
  @JsonKey(name: 'blood_sugar_mg_dl')
  final num? bloodSugarMgDl;
  @JsonKey(name: 'cholesterol_mg_dl')
  final num? cholesterolMgDl;

  Map<String, Object?> toJson() => _$HealthProfileUpdateRequestToJson(this);
}
