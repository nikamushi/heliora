// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'gender_enum.dart';
import 'smoking_status_enum.dart';

part 'health_profile_create_request.g.dart';

/// Payload for creating a user's health profile (PRD FR-006/FR-007).
@JsonSerializable()
class HealthProfileCreateRequest {
  const HealthProfileCreateRequest({
    required this.age,
    required this.gender,
    required this.heightCm,
    required this.weightKg,
    required this.physicalActivityMinPerWeek,
    required this.sleepDurationHours,
    required this.smokingStatus,
    this.familyHistoryDetails,
    this.stressLevel,
    this.bmi,
    this.waistCircumferenceCm,
    this.bloodPressure,
    this.bloodSugarMgDl,
    this.cholesterolMgDl,
    this.familyHistory = false,
  });
  
  factory HealthProfileCreateRequest.fromJson(Map<String, Object?> json) => _$HealthProfileCreateRequestFromJson(json);
  
  /// Age in years (1-120)
  final int age;

  /// Gender (male, female, other)
  final GenderEnum gender;

  /// Height in cm
  @JsonKey(name: 'height_cm')
  final num heightCm;

  /// Weight in kg
  @JsonKey(name: 'weight_kg')
  final num weightKg;

  /// Physical activity duration in minutes per week
  @JsonKey(name: 'physical_activity_min_per_week')
  final num physicalActivityMinPerWeek;

  /// Average daily sleep duration in hours
  @JsonKey(name: 'sleep_duration_hours')
  final num sleepDurationHours;

  /// Smoking status (never, former, current)
  @JsonKey(name: 'smoking_status')
  final SmokingStatusEnum smokingStatus;

  /// Family history of chronic disease (diabetes, CVD, hypertension)
  @JsonKey(name: 'family_history')
  final bool familyHistory;

  /// Granular family history details if available
  @JsonKey(name: 'family_history_details')
  final String? familyHistoryDetails;

  /// Self-reported stress level (1-10 scale)
  @JsonKey(name: 'stress_level')
  final int? stressLevel;

  /// Optional precomputed BMI (auto-calculated if omitted)
  final num? bmi;

  /// Waist circumference in cm
  @JsonKey(name: 'waist_circumference_cm')
  final num? waistCircumferenceCm;

  /// Blood pressure reading (e.g. '120/80')
  @JsonKey(name: 'blood_pressure')
  final String? bloodPressure;

  /// Fasting blood sugar in mg/dL
  @JsonKey(name: 'blood_sugar_mg_dl')
  final num? bloodSugarMgDl;

  /// Total cholesterol in mg/dL
  @JsonKey(name: 'cholesterol_mg_dl')
  final num? cholesterolMgDl;

  Map<String, Object?> toJson() => _$HealthProfileCreateRequestToJson(this);
}
