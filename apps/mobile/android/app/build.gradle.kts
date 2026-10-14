import java.io.File
import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

val keyStoreFilePath: String? = keystoreProperties.getProperty("storeFile")
    ?: System.getenv("ANDROID_KEYSTORE_PATH")
val keyStorePasswordVal: String? = keystoreProperties.getProperty("storePassword")
    ?: System.getenv("ANDROID_KEYSTORE_PASSWORD")
val keyAliasVal: String? = keystoreProperties.getProperty("keyAlias")
    ?: System.getenv("ANDROID_KEY_ALIAS")
val keyPasswordVal: String? = keystoreProperties.getProperty("keyPassword")
    ?: System.getenv("ANDROID_KEY_PASSWORD")

// Resolve keystore file flexibly across relative and absolute locations
val resolvedKeyStoreFile: File? = when {
    !keyStoreFilePath.isNullOrEmpty() && file(keyStoreFilePath).exists() -> file(keyStoreFilePath)
    !keyStoreFilePath.isNullOrEmpty() && rootProject.file(keyStoreFilePath).exists() -> rootProject.file(keyStoreFilePath)
    !keyStoreFilePath.isNullOrEmpty() && rootProject.file("app/$keyStoreFilePath").exists() -> rootProject.file("app/$keyStoreFilePath")
    !keyStoreFilePath.isNullOrEmpty() && File(keyStoreFilePath).exists() -> File(keyStoreFilePath)
    file("upload-keystore.jks").exists() -> file("upload-keystore.jks")
    rootProject.file("app/upload-keystore.jks").exists() -> rootProject.file("app/upload-keystore.jks")
    else -> null
}

val hasReleaseSigning = resolvedKeyStoreFile != null && !keyAliasVal.isNullOrEmpty() && !keyStorePasswordVal.isNullOrEmpty()

android {
    namespace = "id.heliora.app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        // Application ID and deep link scheme are fixed by docs/PRD-Mobile.md §11.
        applicationId = "id.heliora.app"
        // Android 8.0, the minimum proposed in docs/PRD-Mobile.md §10.
        minSdk = 26
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            if (hasReleaseSigning && resolvedKeyStoreFile != null) {
                storeFile = resolvedKeyStoreFile
                storePassword = keyStorePasswordVal
                keyAlias = keyAliasVal
                keyPassword = keyPasswordVal ?: keyStorePasswordVal
            }
        }
    }

    buildTypes {
        release {
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = if (hasReleaseSigning) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}

flutter {
    source = "../.."
}
