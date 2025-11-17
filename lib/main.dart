import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_routes.dart';
import 'core/providers/user_provider.dart';
import 'core/config/app_config.dart';
import 'core/di/dependency_injection.dart';
import 'features/splash/presentation/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize configuration
  await AppConfig.initialize();

  // Setup dependency injection
  await setupDependencyInjection();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => getIt<UserProvider>()),
      ],
      child: MaterialApp(
        title: 'Coach Virtuel - PFA',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        initialRoute: AppRoutes.splash,
        onGenerateRoute: AppRoutes.generateRoute,
        home: const SplashScreen(),
      ),
    );
  }
}

