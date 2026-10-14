// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'what_if_simulation_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WhatIfSimulationRequest _$WhatIfSimulationRequestFromJson(
        Map<String, dynamic> json) =>
    WhatIfSimulationRequest(
      sleepDurationHours: json['sleep_duration_hours'] as num?,
      physicalActivityMinPerWeek:
          json['physical_activity_min_per_week'] as num?,
      weightKg: json['weight_kg'] as num?,
      smokingStatus: json['smoking_status'] == null
          ? null
          : WhatIfSimulationRequestSmokingStatus.fromJson(
              json['smoking_status'] as String),
    );

Map<String, dynamic> _$WhatIfSimulationRequestToJson(
        WhatIfSimulationRequest instance) =>
    <String, dynamic>{
      'sleep_duration_hours': instance.sleepDurationHours,
      'physical_activity_min_per_week': instance.physicalActivityMinPerWeek,
      'weight_kg': instance.weightKg,
      'smoking_status':
          _$WhatIfSimulationRequestSmokingStatusEnumMap[instance.smokingStatus],
    };

const _$WhatIfSimulationRequestSmokingStatusEnumMap = {
  WhatIfSimulationRequestSmokingStatus.never: 'never',
  WhatIfSimulationRequestSmokingStatus.former: 'former',
  WhatIfSimulationRequestSmokingStatus.current: 'current',
  WhatIfSimulationRequestSmokingStatus.$unknown: r'$unknown',
};
