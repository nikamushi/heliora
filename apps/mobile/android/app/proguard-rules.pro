# Flutter R8 & ProGuard optimization rules for HELIORA mobile

# Flutter embedding & plugins
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Serialization annotations
-keepattributes *Annotation*,EnclosingMethod,Signature,InnerClasses
-dontwarn javax.annotation.**
