// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_register_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserRegisterRequest _$UserRegisterRequestFromJson(Map<String, dynamic> json) =>
    UserRegisterRequest(
      email: json['email'] as String,
      password: json['password'] as String,
      fullName: json['full_name'] as String,
    );

Map<String, dynamic> _$UserRegisterRequestToJson(
        UserRegisterRequest instance) =>
    <String, dynamic>{
      'email': instance.email,
      'password': instance.password,
      'full_name': instance.fullName,
    };
