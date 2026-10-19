import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config/app_config.dart';
import 'core/routing/app_router.dart';
import 'core/storage/preferences_service.dart';
import 'core/storage/secure_storage_service.dart';
import 'features/consent/presentation/consent_controller.dart';
import 'features/splash/presentation/splash_screen.dart';
import 'theme/theme.dart';

export 'core/routing/app_router.dart' show AuthViewMode, authViewModeProvider, AppRoutes, appRouterProvider;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final config = AppConfig.fromEnvironment();
  final prefs = await SharedPreferences.getInstance();

  try {
    await Supabase.initialize(
      url: config.supabaseUrl,
      publishableKey: config.supabaseAnonKey,
      authOptions: FlutterAuthClientOptions(
        localStorage: SecureSupabaseLocalStorage(),
      ),
    );
  } catch (e) {
    debugPrint('Supabase initialization handled: $e');
  }

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: const HelioraApp(),
    ),
  );
}

/// Root widget with design tokens (MOB-004) and declarative go_router routing (MOB-005, ADR-012).
class HelioraApp extends ConsumerStatefulWidget {
  const HelioraApp({
    super.key,
    this.showSplash = true,
  });

  /// Controls whether the cold-start animated splash screen is shown.
  final bool showSplash;

  @override
  ConsumerState<HelioraApp> createState() => _HelioraAppState();
}

class _HelioraAppState extends ConsumerState<HelioraApp>
    with WidgetsBindingObserver {
  late bool _splashActive;

  @override
  void initState() {
    super.initState();
    _splashActive = widget.showSplash;
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Re-check consent status when app returns to foreground (Tiket 05)
      ref.read(consentControllerProvider.notifier).refreshStatus();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_splashActive) {
      return MaterialApp(
        title: 'HELIORA',
        debugShowCheckedModeBanner: false,
        scrollBehavior: const HelioraScrollBehavior(),
        theme: HelioraTheme.lightTheme,
        darkTheme: HelioraTheme.darkTheme,
        themeMode: ThemeMode.light,
        home: SplashScreen(
          key: const ValueKey('splash_screen'),
          onSplashComplete: () {
            if (mounted) {
              setState(() => _splashActive = false);
            }
          },
        ),
      );
    }

    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'HELIORA',
      debugShowCheckedModeBanner: false,
      scrollBehavior: const HelioraScrollBehavior(),
      theme: HelioraTheme.lightTheme,
      darkTheme: HelioraTheme.darkTheme,
      themeMode: ThemeMode.light,
      routerConfig: router,
    );
  }
}
