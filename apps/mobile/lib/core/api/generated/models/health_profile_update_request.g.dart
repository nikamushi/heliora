// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_profile_update_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HealthProfileUpdateRequest _$HealthProfileUpdateRequestFromJson(
        Map<String, dynamic> json) =>
    HealthProfileUpdateRequest(
      age: (json['age'] as num?)?.toInt(),
      gender: json['gender'] == null
          ? null
          : GenderEnum.fromJson(json['gender'] as String),
      heightCm: json['height_cm'] as num?,
      weightKg: json['weight_kg'] as num?,
      physicalActivityMinPerWeek:
          json['physical_activity_min_per_week'] as num?,
      sleepDurationHours: json['sleep_duration_hours'] as num?,
      smokingStatus: json['smoking_status'] == null
          ? null
          : SmokingStatusEnum.fromJson(json['smoking_status'] as String),
      familyHistory: json['family_history'] as bool?,
      familyHistoryDetails: json['family_history_details'] as String?,
      stressLevel: (json['stress_level'] as num?)?.toInt(),
      bmi: json['bmi'] as num?,
      waistCircumferenceCm: json['waist_circumference_cm'] as num?,
      bloodPressure: json['blood_pressure'] as String?,
      bloodSugarMgDl: json['blood_sugar_mg_dl'] as num?,
      cholesterolMgDl: json['cholesterol_mg_dl'] as num?,
    );

Map<String, dynamic> _$HealthProfileUpdateRequestToJson(
        HealthProfileUpdateRequest instance) =>
    <String, dynamic>{
      'age': instance.age,
      'gender': _$GenderEnumEnumMap[instance.gender],
      'height_cm': instance.heightCm,
      'weight_kg': instance.weightKg,
      'physical_activity_min_per_week': instance.physicalActivityMinPerWeek,
      'sleep_duration_hours': instance.sleepDurationHours,
      'smoking_status': _$SmokingStatusEnumEnumMap[instance.smokingStatus],
      'family_history': instance.familyHistory,
      'family_history_details': instance.familyHistoryDetails,
      'stress_level': instance.stressLevel,
      'bmi': instance.bmi,
      'waist_circumference_cm': instance.waistCircumferenceCm,
      'blood_pressure': instance.bloodPressure,
      'blood_sugar_mg_dl': instance.bloodSugarMgDl,
      'cholesterol_mg_dl': instance.cholesterolMgDl,
    };

const _$GenderEnumEnumMap = {
  GenderEnum.male: 'male',
  GenderEnum.female: 'female',
  GenderEnum.other: 'other',
  GenderEnum.$unknown: r'$unknown',
};

const _$SmokingStatusEnumEnumMap = {
  SmokingStatusEnum.never: 'never',
  SmokingStatusEnum.former: 'former',
  SmokingStatusEnum.current: 'current',
  SmokingStatusEnum.$unknown: r'$unknown',
};
