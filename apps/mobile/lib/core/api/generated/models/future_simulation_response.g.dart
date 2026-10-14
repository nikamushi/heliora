// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'future_simulation_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FutureSimulationResponse _$FutureSimulationResponseFromJson(
        Map<String, dynamic> json) =>
    FutureSimulationResponse(
      horizonDays: FutureSimulationResponseHorizonDays.fromJson(
          (json['horizon_days'] as num).toInt()),
      assumptions: (json['assumptions'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      baselineHealthScore: json['baseline_health_score'] as num,
      projectedHealthScore: json['projected_health_score'] as num,
      baselineLifestyleScore: json['baseline_lifestyle_score'] as num,
      projectedLifestyleScore: json['projected_lifestyle_score'] as num,
      riskTrajectories: (json['risk_trajectories'] as List<dynamic>)
          .map((e) => RiskTrajectoryItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      isModelEstimated: json['is_model_estimated'] as bool? ?? true,
      disclaimer: json['disclaimer'] as String? ??
          'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.',
    );

Map<String, dynamic> _$FutureSimulationResponseToJson(
        FutureSimulationResponse instance) =>
    <String, dynamic>{
      'horizon_days':
          _$FutureSimulationResponseHorizonDaysEnumMap[instance.horizonDays]!,
      'assumptions': instance.assumptions,
      'baseline_health_score': instance.baselineHealthScore,
      'projected_health_score': instance.projectedHealthScore,
      'baseline_lifestyle_score': instance.baselineLifestyleScore,
      'projected_lifestyle_score': instance.projectedLifestyleScore,
      'risk_trajectories': instance.riskTrajectories,
      'is_model_estimated': instance.isModelEstimated,
      'disclaimer': instance.disclaimer,
    };

const _$FutureSimulationResponseHorizonDaysEnumMap = {
  FutureSimulationResponseHorizonDays.value30: 30,
  FutureSimulationResponseHorizonDays.value90: 90,
  FutureSimulationResponseHorizonDays.value180: 180,
  FutureSimulationResponseHorizonDays.$unknown: r'$unknown',
};
