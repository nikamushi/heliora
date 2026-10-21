// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'future_simulation_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FutureSimulationRequest _$FutureSimulationRequestFromJson(
        Map<String, dynamic> json) =>
    FutureSimulationRequest(
      horizonDays: json['horizon_days'] == null
          ? FutureSimulationRequestHorizonDays.value90
          : FutureSimulationRequestHorizonDays.fromJson(
              (json['horizon_days'] as num).toInt()),
    );

Map<String, dynamic> _$FutureSimulationRequestToJson(
        FutureSimulationRequest instance) =>
    <String, dynamic>{
      'horizon_days':
          _$FutureSimulationRequestHorizonDaysEnumMap[instance.horizonDays]!,
    };

const _$FutureSimulationRequestHorizonDaysEnumMap = {
  FutureSimulationRequestHorizonDays.value30: 30,
  FutureSimulationRequestHorizonDays.value90: 90,
  FutureSimulationRequestHorizonDays.value180: 180,
  FutureSimulationRequestHorizonDays.$unknown: r'$unknown',
};
