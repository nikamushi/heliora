// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'health_profile_response.g.dart';

/// Public representation of a user's health profile.
@JsonSerializable()
class HealthProfileResponse {
  const HealthProfileResponse({
    required this.id,
    required this.userId,
    required this.age,
    required this.gender,
    required this.heightCm,
    required this.weightKg,
    required this.physicalActivityMinPerWeek,
    required this.sleepDurationHours,
    required this.smokingStatus,
    required this.familyHistory,
    this.bmi,
    this.bmiCategory,
    this.familyHistoryDetails,
    this.stressLevel,
    this.waistCircumferenceCm,
    this.bloodPressure,
    this.bloodSugarMgDl,
    this.cholesterolMgDl,
    this.createdAt,
    this.updatedAt,
  });
  
  factory HealthProfileResponse.fromJson(Map<String, Object?> json) => _$HealthProfileResponseFromJson(json);
  
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  final int age;
  final String gender;
  @JsonKey(name: 'height_cm')
  final num heightCm;
  @JsonKey(name: 'weight_kg')
  final num weightKg;
  final num? bmi;
  @JsonKey(name: 'bmi_category')
  final String? bmiCategory;
  @JsonKey(name: 'physical_activity_min_per_week')
  final num physicalActivityMinPerWeek;
  @JsonKey(name: 'sleep_duration_hours')
  final num sleepDurationHours;
  @JsonKey(name: 'smoking_status')
  final String smokingStatus;
  @JsonKey(name: 'family_history')
  final bool familyHistory;
  @JsonKey(name: 'family_history_details')
  final String? familyHistoryDetails;
  @JsonKey(name: 'stress_level')
  final int? stressLevel;
  @JsonKey(name: 'waist_circumference_cm')
  final num? waistCircumferenceCm;
  @JsonKey(name: 'blood_pressure')
  final String? bloodPressure;
  @JsonKey(name: 'blood_sugar_mg_dl')
  final num? bloodSugarMgDl;
  @JsonKey(name: 'cholesterol_mg_dl')
  final num? cholesterolMgDl;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  Map<String, Object?> toJson() => _$HealthProfileResponseToJson(this);
}
