// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'what_if_simulation_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WhatIfSimulationResponse _$WhatIfSimulationResponseFromJson(
        Map<String, dynamic> json) =>
    WhatIfSimulationResponse(
      appliedParameters: json['applied_parameters'] as Map<String, dynamic>,
      derivedBmi: json['derived_bmi'] as num,
      baselineHealthScore: json['baseline_health_score'] as num,
      simulatedHealthScore: json['simulated_health_score'] as num,
      healthScoreDelta: json['health_score_delta'] as num,
      baselineLifestyleScore: json['baseline_lifestyle_score'] as num,
      simulatedLifestyleScore: json['simulated_lifestyle_score'] as num,
      lifestyleScoreDelta: json['lifestyle_score_delta'] as num,
      conditionComparisons: (json['condition_comparisons'] as List<dynamic>)
          .map((e) =>
              WhatIfConditionComparison.fromJson(e as Map<String, dynamic>))
          .toList(),
      isModelEstimated: json['is_model_estimated'] as bool? ?? true,
      disclaimer: json['disclaimer'] as String? ??
          'HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.',
    );

Map<String, dynamic> _$WhatIfSimulationResponseToJson(
        WhatIfSimulationResponse instance) =>
    <String, dynamic>{
      'applied_parameters': instance.appliedParameters,
      'derived_bmi': instance.derivedBmi,
      'baseline_health_score': instance.baselineHealthScore,
      'simulated_health_score': instance.simulatedHealthScore,
      'health_score_delta': instance.healthScoreDelta,
      'baseline_lifestyle_score': instance.baselineLifestyleScore,
      'simulated_lifestyle_score': instance.simulatedLifestyleScore,
      'lifestyle_score_delta': instance.lifestyleScoreDelta,
      'condition_comparisons': instance.conditionComparisons,
      'is_model_estimated': instance.isModelEstimated,
      'disclaimer': instance.disclaimer,
    };
