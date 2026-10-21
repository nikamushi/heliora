# Flutter R8 & ProGuard optimization rules for HELIORA mobile

# Suppress warnings on optional/missing classes from third-party libraries
-dontwarn **

# Flutter embedding & plugins
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Plugin specific rules
-keep class com.it_nomads.fluttersecurestorage.** { *; }
-keep class io.flutter.plugins.pathprovider.** { *; }
-keep class io.flutter.plugins.sharedpreferences.** { *; }

# Serialization annotations
-keepattributes *Annotation*,EnclosingMethod,Signature,InnerClasses
-dontwarn javax.annotation.**
