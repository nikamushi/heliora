// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_profile_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HealthProfileResponse _$HealthProfileResponseFromJson(
        Map<String, dynamic> json) =>
    HealthProfileResponse(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      age: (json['age'] as num).toInt(),
      gender: json['gender'] as String,
      heightCm: json['height_cm'] as num,
      weightKg: json['weight_kg'] as num,
      physicalActivityMinPerWeek: json['physical_activity_min_per_week'] as num,
      sleepDurationHours: json['sleep_duration_hours'] as num,
      smokingStatus: json['smoking_status'] as String,
      familyHistory: json['family_history'] as bool,
      bmi: json['bmi'] as num?,
      bmiCategory: json['bmi_category'] as String?,
      familyHistoryDetails: json['family_history_details'] as String?,
      stressLevel: (json['stress_level'] as num?)?.toInt(),
      waistCircumferenceCm: json['waist_circumference_cm'] as num?,
      bloodPressure: json['blood_pressure'] as String?,
      bloodSugarMgDl: json['blood_sugar_mg_dl'] as num?,
      cholesterolMgDl: json['cholesterol_mg_dl'] as num?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$HealthProfileResponseToJson(
        HealthProfileResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'age': instance.age,
      'gender': instance.gender,
      'height_cm': instance.heightCm,
      'weight_kg': instance.weightKg,
      'bmi': instance.bmi,
      'bmi_category': instance.bmiCategory,
      'physical_activity_min_per_week': instance.physicalActivityMinPerWeek,
      'sleep_duration_hours': instance.sleepDurationHours,
      'smoking_status': instance.smokingStatus,
      'family_history': instance.familyHistory,
      'family_history_details': instance.familyHistoryDetails,
      'stress_level': instance.stressLevel,
      'waist_circumference_cm': instance.waistCircumferenceCm,
      'blood_pressure': instance.bloodPressure,
      'blood_sugar_mg_dl': instance.bloodSugarMgDl,
      'cholesterol_mg_dl': instance.cholesterolMgDl,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
    };
